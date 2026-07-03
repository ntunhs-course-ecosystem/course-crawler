CREATE TABLE crawl_jobs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    semester TEXT,
    triggered_by TEXT NOT NULL,
    courses_count INTEGER,
    rows_written INTEGER,
    error_message TEXT,
    started_at TEXT,
    finished_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_crawl_jobs_status ON crawl_jobs(status);
CREATE INDEX idx_crawl_jobs_created_at ON crawl_jobs(created_at DESC);
