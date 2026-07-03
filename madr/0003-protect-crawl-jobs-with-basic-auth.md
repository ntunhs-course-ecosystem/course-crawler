# 0003 — Operator API 以 Basic Auth 保護

## Title

`/api/v1/crawl-jobs` 系列端點加上 Basic Auth，防止公開濫用觸發爬蟲

## Status

Accepted

## Context

ADR-0002 新增 Crawl Job 手動觸發與狀態查詢 API，初始實作未加認證：

| 端點 | 風險 |
|------|------|
| `POST /api/v1/crawl-jobs` | **高** — 任何人可觸發 Vercel Puppeteer crawl，耗費 Vercel / D1 用量 |
| `GET /api/v1/crawl-jobs` | **中** — 洩漏維運資訊（錯誤訊息、執行紀錄） |
| `GET /api/v1/crawl-jobs/:id` | **中** — 同上 |

相對地，`GET /api/v1/search` 為面向使用者的 **Public API**，應維持無認證。

專案已有 `BASIC_AUTH_USER` / `BASIC_AUTH_PASS`（Worker secret + Vercel env），用於 Worker → Vercel crawler 呼叫。

## Decision

1. 將 `/api/v1/crawl-jobs` 全路由標記為 **Operator API**，套用 `devBasicAuth` middleware。
2. 憑證與 Vercel crawler **共用**同一組 `BASIC_AUTH_*`，開發人員只需記一組帳密。
3. OpenAPI 移除全域 `security`；僅在 crawl-jobs 的 `describeRoute` 標註 `basicAuth`。
4. Cron `scheduled()` 不走 HTTP，不受影響。

## Consequences

### 正面

- 阻擋匿名觸發 crawl 的濫用
- 與既有 Vercel 認證模型一致

### 負面 / 取捨

- Basic Auth 非最強方案（無 MFA、憑證隨請求傳送），但對小型維運 API 足夠
- `BASIC_AUTH_USER` 目前在 `wrangler.jsonc` vars 中可見；密碼須確保僅存於 Worker **Secrets**
- 開發人員查狀態時需在 curl / Postman 帶 `Authorization: Basic ...`

### 使用方式

```bash
curl -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASS" \
  -X POST "https://<worker>/api/v1/crawl-jobs"

curl -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASS" \
  "https://<worker>/api/v1/crawl-jobs/<jobId>"
```
