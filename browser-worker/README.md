# NTUNHS Course Crawler

這是專門負責執行瀏覽器自動化爬蟲的 Cloudflare Worker，使用 Hono 框架與 Cloudflare Puppeteer

用於抓取國立臺北護理健康大學 (NTUNHS, 北護, 國北護) 的課程資料

以及簡易的課程查詢 API

## 技術棧 (Tech Stack)

- Framework: Hono
- Runtime: Cloudflare Workers
- Browser: Cloudflare Puppeteer (cloudflare 的執行環境比較特別，所以 cloudflare 有提供一個特別版 puppeteer 的 package，使用方式與原生的 puppeteer 相同)
- Database: Cloudflare D1
- ORM/Query Builder: Kysely

## D1 資料庫設定指引

在開始執行 Worker 之前，你需要先初始化 Cloudflare D1 資料庫。

### 1. 登入 Cloudflare

使用 wranlger 登入 Cloudflare 帳號：

```bash
pnpm dlx wrangler login
```

### 2. 建立新的 D1 資料庫

執行以下指令建立資料庫（名稱可根據需求修改，建議與 wrangler.jsonc 保持一致）：

```bash
pnpm dlx wrangler d1 create ntunhs-course
```

後續會問你是否直接更新 wrangler.jsonc 的資料庫設定，選擇 `y` 即可

如果沒有順利更新，請手動更新 wrangler.jsonc 的資料庫設定：

```jsonc
"d1_databases": [
  {
    "binding": "ntunhs_course",
    "database_name": "ntunhs-course",
    "database_id": "在此填入您的_database_id",
    "migrations_dir": "src/db/migrations"
  }
]
```

### 3. 執行資料庫遷移 (Migrations)

專案內已包含預設的資料表結構 (src/db/migrations)，請執行以下指令將結構同步至資料庫：

```bash
pnpm dlx wrangler d1 migrations apply ntunhs-course --remote
```

## 本地開發

### 安裝 pnpm

建議使用 corepack 來安裝 pnpm：

- 安裝 corepack

```bash
npm install -g corepack@latest
```

- 啟用 corepack

```bash
corepack enable
```


### 環境變數

爬蟲 API 使用基本認證 (Basic Authentication) 保護，因此需要設定環境變數，以免被濫用

在 `.dev.vars` 中設定環境變數：

```env
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=password
```

### 安裝依賴

```bash
pnpm install
```

### 啟動開發伺服器

```bash
pnpm dev
```

## 目錄結構說明

- src/db/: 資料庫相關邏輯
  - migrations/: SQL 遷移檔案（定義資料表結構）
  - kysely.ts: D1 與 Kysely 的連線實作
- src/routes/: Hono 路由定義
- src/services/: 核心爬蟲業務邏輯
- src/schemas/: Zod 驗證與資料結構定義
