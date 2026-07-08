# NTUNHS Course Crawler — Domain Glossary

## Crawl Job（爬蟲任務）

一次完整的「抓取北護課程查詢系統 → 寫入 D1」的非同步工作單元。由觸發端建立、由執行端更新狀態，可透過 `jobId` 追蹤。

## Crawl Trigger（爬蟲觸發端）

發起 Crawl Job 的元件。目前為 `browser-worker` 的 Cron Trigger；未來可含手動 POST。

## Crawl Executor（爬蟲執行端）

實際跑 Puppeteer 並寫入 D1 的元件。目前為 `vercel-app`；具備 Chromium 與 D1 HTTP API 寫入能力。

## Job Status（任務狀態）

Crawl Job 的生命週期標記。候選值（待 ADR 定案）：

| 狀態 | 意義 |
|------|------|
| `queued` | 已接受，尚未開始執行 |
| `running` | Puppeteer 抓取或 D1 寫入進行中 |
| `succeeded` | 抓取與寫入完成 |
| `failed` | 任務失敗（含錯誤訊息） |

## Sync Crawl（同步爬蟲）

觸發端 `await` 執行端 HTTP 回應直到爬蟲完成。目前架構；易因執行時間過長導致 proxy / serverless timeout（如 524）。

## Async Crawl（非同步爬蟲）

觸發端收到 `202 Accepted` + `jobId` 後即返回；執行端在背景繼續工作，狀態透過 Job Status API 查詢。

## Operator API（維運 API）

僅供開發人員使用的 HTTP 端點（如 `/api/v1/crawl-jobs`）。以 Basic Auth 保護，與 Vercel crawler 共用 `BASIC_AUTH_USER` / `BASIC_AUTH_PASS`。課程搜尋 `/api/v1/search` 維持公開。

## Public API（公開 API）

不需認證、面向一般使用者的端點。目前含 `/api/v1/search`、`GET /api/v1/facets`（見 ADR-0004）。

## Filter Dimension（篩選維度）

搜尋 API 接受的單一 query 條件軸，例如 `semester`、`departmentID`、`grade`、`dayNum`、`periodFrom`、`periodTo`。

## Period Filter（節次篩選）

Search API 以 `periodFrom`、`periodTo`（值域 1–14）表示**查詢區間**，與課程回應中的 `startPeriod`、`endPeriod` 欄位不同。採閉區間 overlap：`course.startPeriod <= to AND course.endPeriod >= from`。僅傳一邊時以 catalog 補齊（`1` 或 `14`）；`from > to` 時 swap。見 ADR-0005。

## Cold Dimension（冷維度）

值域固定、變動極少，由前端 bundle 維護的 Filter Dimension。例如 `grade`、`dayNum`、`periodFrom`、`periodTo`。定義於 `ntunhs-c-plus` 的 `lib/filter-catalog.ts`，頁面載入時不需額外 request。

## Hot Dimension（熱維度）

值域隨 D1 `courses` 資料變動的 Filter Dimension。例如 `semester`、`department`（含 `departmentID`）。由 **Facets API** 提供 distinct 值；前端以 runtime fetch 取得（見 ADR-0004）。

## Facets API

Public API 端點 `GET /api/v1/facets`，回傳 Hot Dimension 的全域 distinct 值（所有學期、所有系所），不依 `semester` query 過濾系所列表。爬蟲更新 D1 後，前端下次 fetch 即自動跟上，無需 redeploy。
