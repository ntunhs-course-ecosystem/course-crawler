# NTUNHS Course Crawler

這是執行瀏覽器自動化爬蟲用於抓取國立臺北護理健康大學 (NTUNHS, 北護, 國北護) 的課程資料的專案

## 本地執行版本

在目前目錄的 `index.js` 是本地執行版本

### 安裝依賴

```bash
pnpm install
```

### 執行

```bash
node index.js
```

執行後，你應該就會看到開啟瀏覽器自動化爬蟲的過程

完成後，終端機會出現 `done` 字樣，且目錄下會產生 `courses.json` 檔案，內容為抓取到的課程資料

## Cloudflare Worker 版本

請參考 `browser-worker` 目錄的 [README.md](browser-worker/README.md)