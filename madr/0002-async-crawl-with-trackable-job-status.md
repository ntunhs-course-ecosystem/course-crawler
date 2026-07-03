# 0002 — 非同步爬蟲與可追蹤 Job Status API

## Title

以 `202 Accepted` + D1 `crawl_jobs` 表取代 Sync Crawl，解決 524 timeout 並提供狀態查詢

## Status

Accepted

## Context

### 問題根因

524 出現在 **Cloudflare Worker Cron** 對 Vercel 的 outbound `fetch`，非 Vercel 本身故障。

- Postman 直打 Vercel 可正常完成（約 2–3 分鐘）
- Worker `await` 完整 HTTP 回應時，CF subrequest 約 100 秒逾時 → `error code: 524`
- Vercel 為 **Free tier**；crawl 實測 2–3 分鐘

### 現況（改動前）

Sync Crawl：Cron → Worker `await` Vercel POST `/api/v1/crawler` → Puppeteer + D1 → 200

### 需求

- 最小改動：202 + status，**不**搬至 CF Browser Rendering
- Status API：維運時手動查詢
- 並發：**skip**（已有 `queued` / `running` 任務則不觸發）

## Decision

採 **Worker 編排 + Vercel 非同步執行**：

1. **D1** 新增 `crawl_jobs` 表（migration `005-crawl-jobs.sql`）
2. **browser-worker**
   - Cron / `POST /api/v1/crawl-jobs`：建 job → fire-and-forget 呼叫 Vercel（只等 202）
   - `GET /api/v1/crawl-jobs/:id`、`GET /api/v1/crawl-jobs`：查狀態
   - 有進行中任務時 skip（Cron log / 手動 409）
3. **vercel-app**
   - `POST /api/v1/crawler?jobId=xxx`：立即 `202`，`waitUntil(runCrawlPipeline)`
   - 無 `jobId` 時維持同步模式（Postman 直打相容）
   - 執行過程透過 D1 HTTP API 更新 `crawl_jobs`

## Consequences

### 正面

- Cron 不再因長連線觸發 524
- 可手動查 `GET /api/v1/crawl-jobs/:id` 或列近期任務
- Postman 直打 Vercel（無 jobId）行為不變

### 負面 / 取捨

- `waitUntil` 仍受 Vercel `maxDuration` 限制（已設 300s；Free tier 實際上限以 Vercel 為準）
- Cron 當下只知「已接受」，失敗需事後查 status
- 部署前須先 `wrangler d1 migrations apply` 套用 `005-crawl-jobs.sql`

### 部署順序

1. Remote D1 套用 migration `005-crawl-jobs.sql`
2. Deploy `browser-worker`
3. Deploy `vercel-app`
4. 驗證：手動 `POST /api/v1/crawl-jobs` → 202 → 輪詢 `GET /api/v1/crawl-jobs/:id` 至 `succeeded`
