type D1Env = {
    CF_ACCOUNT_ID: string;
    CF_DATABASE_ID: string;
    CF_API_TOKEN: string;
};

export type CrawlJobStatus = "queued" | "running" | "succeeded" | "failed";

type CrawlJobPatch = {
    status?: CrawlJobStatus;
    courses_count?: number;
    rows_written?: number;
    error_message?: string;
    started_at?: string;
    finished_at?: string;
};

async function queryD1(env: D1Env, sql: string, params: unknown[] = []) {
    const { CF_ACCOUNT_ID, CF_DATABASE_ID, CF_API_TOKEN } = env;
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/d1/database/${CF_DATABASE_ID}/query`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${CF_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ sql, params })
    });

    return (await response.json()) as {
        success: boolean;
        errors?: unknown[];
    };
}

export async function updateCrawlJob(
    env: D1Env,
    jobId: string,
    patch: CrawlJobPatch
) {
    const fields: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(patch)) {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            params.push(value);
        }
    }

    if (fields.length === 0) {
        return { success: true };
    }

    params.push(jobId);
    const sql = `UPDATE crawl_jobs SET ${fields.join(", ")} WHERE id = ?`;
    return queryD1(env, sql, params);
}

export async function markCrawlJobRunning(env: D1Env, jobId: string) {
    return updateCrawlJob(env, jobId, {
        status: "running",
        started_at: new Date().toISOString()
    });
}

export async function markCrawlJobSucceeded(
    env: D1Env,
    jobId: string,
    coursesCount: number,
    rowsWritten: number
) {
    return updateCrawlJob(env, jobId, {
        status: "succeeded",
        courses_count: coursesCount,
        rows_written: rowsWritten,
        finished_at: new Date().toISOString()
    });
}

export async function markCrawlJobFailed(
    env: D1Env,
    jobId: string,
    errorMessage: string
) {
    return updateCrawlJob(env, jobId, {
        status: "failed",
        error_message: errorMessage,
        finished_at: new Date().toISOString()
    });
}
