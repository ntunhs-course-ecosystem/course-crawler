# 0001 — 以 content_hash 跳過 D1 無變更 upsert

## Title

以 `content_hash` 欄位與 conditional upsert，避免 Cloudflare D1 寫入完全重複的課程資料

## Status

Accepted

## Context

`vercel-app` 的 crawler 每次執行會對整個學期數千筆課程做全量 upsert，透過 Cloudflare D1 HTTP API 執行：

```sql
INSERT INTO courses (...)
ON CONFLICT(semester, courseFullID) DO UPDATE SET ...
```

Cloudflare D1 依 **rows written** 計費（`INSERT`、`UPDATE`、`DELETE` 皆計入；含 index 維護的額外 write）。  
即使資料內容與既有 row 完全相同，`ON CONFLICT ... DO UPDATE` 仍會觸發 UPDATE，導致不必要的 `rows_written`。

實際狀況：

- 用量已達 **220.25k rows written**，超過方案限制 **100k**
- 每次 crawl 為全學期 ~N 千筆全量 upsert
- 「完全重複」定義：`(semester, courseFullID)` 相同，且所有 mutable 欄位值相同
- D1 中 nullable 欄位（如 `courseEngName`、`note`）實際存為 `NULL`，非空字串
- 可接受 schema 變更（新增欄位）

曾評估方案：

| 方案 | 說明 |
|------|------|
| A — UPSERT + 全欄位 WHERE | 零 schema 改動，但 WHERE 冗長、難維護 |
| B — `content_hash` 欄 | 單一比對條件，易測、可觀測 |
| C — App 端 pre-filter | 可同時降低 read/write，但需額外 SELECT round-trip |
| D — `DO NOTHING` | 無法更新已存在且內容有變的 row，不適用 |

SQLite（D1 底層）支援在 `ON CONFLICT DO UPDATE` 末尾加 `WHERE`；條件為 false 時 UPDATE 變 no-op，不產生 row write。

## Decision

採用 **方案 B：`content_hash` + conditional upsert**，並抽出正規化邏輯以對齊 D1 的 NULL 語意。

1. **Schema**：新增 migration `004-content-hash.sql`，為 `courses` 表加入 `content_hash TEXT` 欄位。

2. **Hash 計算**（`vercel-app/src/course-params.ts`）：
   - 先將 crawler 原始資料正規化為 D1 bind 值（nullable 欄位空值 → `NULL`）
   - 對所有 mutable 欄位（不含 PK `semester`, `courseFullID`）以固定 key 順序做 `JSON.stringify`，再取 SHA256 前 16 hex 字元

3. **Upsert SQL**（`vercel-app/src/index.ts`）：
   - `INSERT` 時一併寫入 `content_hash`
   - `ON CONFLICT(semester, courseFullID) DO UPDATE SET ... content_hash = EXCLUDED.content_hash`
   - 加上條件：
     ```sql
     WHERE courses.content_hash IS NULL
        OR courses.content_hash IS NOT EXCLUDED.content_hash
     ```
   - `content_hash IS NULL` 分支用於既有資料首次 backfill（舊 row 尚無 hash）

4. **型別**：更新 `browser-worker/src/types/database.ts` 的 `CourseTable`，加入 `content_hash: string | null`。

## Consequences

### 正面

- 資料未變的 row 在 conflict 時不再 UPDATE，**大幅降低 `rows_written`**
- 多個 index 上的冗餘 write 一併避免
- Hash 邏輯集中於 `course-params.ts`，與 D1 bind 共用同一套正規化，降低 NULL / 空字串不一致造成的假 diff
- 後續可擴充為 app 端 pre-filter（方案 C），進一步降低 rows read

### 負面 / 取捨

- **首次部署後第一次 crawl 仍會寫入全部既有 row**（`content_hash IS NULL` 需 backfill），產生一次性 write spike，無法完全避免
- Conflict 檢查仍會產生 **rows read**（每筆 INSERT 仍會觸發 uniqueness 查找）
- 新增 `content_hash` 欄位略增 storage（每 row 16 hex 字元）
- Production D1 需先執行 migration：`wrangler d1 migrations apply ntunhs_course --remote`

### 部署順序

1. 對 remote D1 套用 migration `004-content-hash.sql`
2. Deploy `vercel-app`
3. 執行一次 crawler（backfill hash）
4. 後續 crawl 僅寫入有實際變更的 row；可透過 D1 API response `meta.rows_written` 驗證
