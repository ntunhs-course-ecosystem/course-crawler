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

不需認證、面向一般使用者的端點。目前僅 `/api/v1/search`。
