# NTUNHS Course Crawler Vercel App

這是執行瀏覽器自動化爬蟲用於抓取國立臺北護理健康大學 (NTUNHS, 北護, 國北護) 的課程資料的 Vercel App

使用 puppeteer 來抓取課程資料 (@sparticuz/chromium)
使用 vercel blob 來存放 chromium 執行環境 (避免每次都重新下載)

## 環境變數

| 變數名稱 | 說明 |
| :--- | :--- |
| BASIC_AUTH_USER | 基本認證使用者名稱 |
| BASIC_AUTH_PASS | 基本認證密碼 |
| CF_ACCOUNT_ID | Cloudflare 帳號 ID |
| CF_DATABASE_ID | Cloudflare D1 資料庫 ID |
| CF_API_TOKEN | Cloudflare API Token |
| VERCEL_BLOB_URL | Vercel Blob 放置 chromium 執行環境的 URL，例如：https://vercel-blob.com/chromium-pack.tar |

## 放置 chromium 執行環境

- 至 [Sparticuz/chromium](https://github.com/Sparticuz/chromium/releases) 下載 chromium 執行環境
- 到 vercel dashboard 的 `Storage` 中，建立一個新的 Blob
- 點擊 Upload 按鈕，選擇剛剛下載的 chromium 執行環境檔案，並取名為 `chromium-pack.tar`
- 複製 Blob URL，例如：https://vercel-blob.com/chromium-pack.tar
- 設定環境變數 `VERCEL_BLOB_URL` 為 `https://vercel-blob.com/chromium-pack.tar`

## 本地開發

### 安裝 vercel cli
- 請務必先安裝 `vercel cli`

```bash
pnpm install -g vercel
```

### 執行

```bash
pnpm install
vc dev
```

### 部屬

```bash
pnpm install
vercel deploy
```
