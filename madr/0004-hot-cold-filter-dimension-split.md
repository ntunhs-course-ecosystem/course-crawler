# 0004 — Hot/Cold Filter Dimension 分離：Facets API vs 前端 catalog

## Title

以 `GET /api/v1/facets` 提供學期與系所 distinct 值；其餘篩選維度由前端靜態 catalog 維護

## Status

Accepted

## Context

`GET /api/v1/search` 已支援多種 Filter Dimension，但前端建置搜尋 UI 時需要各維度的可選值列表。

各維度更新頻率不同：

| 維度 | 更新頻率 | 特性 |
|------|----------|------|
| `semester` | 約每半年 | 隨爬蟲寫入 D1 而變 |
| `department` / `departmentID` | 約每半年 | 同上；新系所或系所更名時變動 |
| `grade` | 極少 | 固定值域 1–7（含研究所） |
| `dayNum` | 不變 | 週一至週日（1–7） |
| `periodFrom` / `periodTo` | 不變 | 節次 1–14（overlap 語意見 ADR-0005） |

若所有維度都走 API，每次開啟搜尋頁需多個 request，且冷維度資料與 DB 無關，徒增 D1 讀取。

若所有維度都寫入前端靜態檔，學期與系所需手動或 CI script 同步，與爬蟲更新 D1 的流程脫鉤，易過期。

曾評估更新策略：

| 策略 | 說明 |
|------|------|
| A — Runtime fetch | 頁面 mount 時 fetch Facets API；client cache（如 sessionStorage + TTL） |
| B — Build-time sync | CI 從 API 生成 snapshot 並 commit |
| C — Hybrid fallback | 靜態 snapshot + runtime 覆蓋 |

## Decision

### 1. Hot/Cold 分離

- **Hot Dimension**（`semester`、`department`）→ **Facets API**（Public API）
- **Cold Dimension**（`grade`、`dayNum`、`periodFrom`、`periodTo`）→ 前端 `ntunhs-c-plus/lib/filter-catalog.ts`，bundle 進 static export，零額外 request

### 2. Facets API contract

```
GET /api/v1/facets
```

Response：

```json
{
  "semesters": [1142, 1141, 1122],
  "departments": [
    { "id": "43160", "name": "人工智慧與健康大數據研究所" }
  ]
}
```

- **全域 distinct**：不回傳依 `semester` 過濾的系所列表；系所為 `courses` 表 `(departmentID, department)` 的全域 distinct
- `semesters` 降序排列（最新學期在前）
- `departments` 依 `name` 升序
- 歸類為 **Public API**，無 Basic Auth
- 回應加 `Cache-Control: public, max-age=3600`（可調），利用 CDN edge cache

### 3. 前端更新策略

採 **Runtime fetch（策略 A）**：

- 搜尋頁 mount 時 client fetch `/api/v1/facets`
- **不做 client-side cache**（無 sessionStorage / localStorage）；重複請求依 Worker `Cache-Control` + CDN edge cache
- 爬蟲更新 D1 後，前端下次 fetch 自動取得新學期／系所，**不需 redeploy 前端**

### 4. 全域 distinct 的取捨

使用者可能選到「該學期無開課」的系所組合，search 結果為空。接受此 trade-off，以換取單一 API、無 semester 依賴的簡單 contract。

## Consequences

### 正面

- 冷維度零 network；熱維度隨 D1 truth 自動更新
- Facets 與 Search 共用同一 D1，無第二份資料源
- Public API 可快取，降低 D1 讀取

### 負面 / 取捨

- 前端 static export（GitHub Pages）需 course-crawler Worker 開 CORS，供 browser cross-origin fetch
- 全域 distinct 系所可能含已停招系所或該學期無課系所
- 首次開啟搜尋頁多 1 次 facets request（由 Worker `Cache-Control` + CDN 緩解）

### 實作待辦

- [ ] `browser-worker`：`GET /api/v1/facets` route + service（Kysely `distinct()`）
- [ ] OpenAPI 更新
- [ ] Worker CORS headers（若尚未設定）
- [ ] `ntunhs-c-plus/lib/filter-catalog.ts`
- [ ] 前端 facets client fetch（無 client cache）
