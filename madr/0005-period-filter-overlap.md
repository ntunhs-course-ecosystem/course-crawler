# 0005 — 節次篩選改為區間 Overlap（periodFrom / periodTo）

## Title

Search API 節次篩選以 `periodFrom` / `periodTo` 表示查詢區間，採閉區間 overlap 比對

## Status

Accepted

## Context

`GET /api/v1/search` 原以 `startPeriod`、`endPeriod` query param 對 D1 `courses.startPeriod`、`courses.endPeriod` 做 `IN` 精確比對。

此語意與課程查詢直覺不符：使用者選「第 1 節～第 10 節」時，預期取得所有**與該時段有交集**的課程（如 1–2 節、3–4 節、6–10 節），而非僅 `startPeriod = 1 AND endPeriod = 10` 的課程。

此外，`startPeriod` / `endPeriod` 與課程資料欄位同名，易與「篩選區間」混淆。

## Decision

### 1. Query param 重新命名

| 舊 param | 新 param | 語意 |
|----------|----------|------|
| `startPeriod` | `periodFrom` | 查詢區間下界（含） |
| `endPeriod` | `periodTo` | 查詢區間上界（含） |

- 廢除 `startPeriod`、`endPeriod` 作為 search query param（不保留別名）
- 課程回應中的 `startPeriod`、`endPeriod` 欄位維持不變（課程實際上課節次）

### 2. Overlap 語意（閉區間）

查詢區間 `[from, to]` 與課程區間 `[course.startPeriod, course.endPeriod]` 有交集 ⟺

```
course.startPeriod <= to AND course.endPeriod >= from
```

範例：`periodFrom=1&periodTo=10` 命中 1–2、3–4、6–10、1–10；不命中 11–12。

### 3. 缺省邊界（catalog 補齊）

值域固定 `1`–`14`（與前端 Filter Catalog 一致）：

| 傳入 | 實際查詢區間 |
|------|--------------|
| 僅 `periodFrom` | `[periodFrom, 14]` |
| 僅 `periodTo` | `[1, periodTo]` |
| 兩者皆有 | `[periodFrom, periodTo]` |
| 兩者皆無 | 不加節次條件 |

### 4. 倒序自動校正

`periodFrom > periodTo` 時，後端（及前端 UI）自動 swap 後再查詢。

### 5. 不支援多值

`periodFrom`、`periodTo` 各只接受單一數值；不支援重複 query param（如 `periodFrom=1&periodFrom=8`）。

### 6. 與其他維度組合

節次 overlap 與 `semester`、`departmentID`、`grade`、`dayNum` 等以 **AND** 組合。  
例：`dayNum=2&periodFrom=3&periodTo=4` → 週二且節次與 3–4 有交集的課程。

### 7. 實作位置

- `browser-worker/src/services/course.service.ts` — overlap WHERE 條件
- `browser-worker/src/routes/course.route.ts` — query schema 改為 `periodFrom` / `periodTo`（單值）
- `browser-worker/test/course.route.test.ts` — 對齊 overlap 案例

前端（`ntunhs-c-plus`）僅傳 `periodFrom` / `periodTo` 至 Search API，不做 client-side overlap 過濾。

## Consequences

### 正面

- 符合「這段時間有哪些課」的查詢直覺
- param 名稱與課程欄位脫鉤，語意清楚

### 負面 / 取捨

- **Breaking change**：既有使用 `startPeriod` / `endPeriod` 的 query 連結失效
- 不支援「第 1 節或第 8 節開課」這類多點 OR 查詢（若未來需要，另開維度設計）

### 實作待辦

- [x] `course.service.ts`：overlap SQL + 缺省邊界 + swap
- [x] `course.route.ts`：`periodFrom` / `periodTo` schema（單值，廢除舊 param）
- [x] `course.route.test.ts`：overlap、單邊、swap、與 dayNum 組合案例
- [x] OpenAPI 更新
