-- 課程內容 hash，供 upsert 跳過未變更 row
ALTER TABLE courses ADD COLUMN content_hash TEXT;
