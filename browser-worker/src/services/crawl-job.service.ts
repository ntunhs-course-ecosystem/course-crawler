import type { Kysely } from 'kysely';
import type { CrawlJobRow, CrawlJobStatus, Database } from '../types/database';

const ACTIVE_STATUSES: CrawlJobStatus[] = ['queued', 'running'];

export class CrawlJobService {
	constructor(private readonly database: Kysely<Database>) {}

	async findActiveJob(): Promise<CrawlJobRow | undefined> {
		return this.database
			.selectFrom('crawl_jobs')
			.selectAll()
			.where('status', 'in', ACTIVE_STATUSES)
			.orderBy('created_at', 'desc')
			.executeTakeFirst();
	}

	async createJob(input: {
		id: string;
		triggeredBy: 'cron' | 'manual';
		semester?: string;
	}): Promise<CrawlJobRow> {
		await this.database
			.insertInto('crawl_jobs')
			.values({
				id: input.id,
				status: 'queued',
				semester: input.semester ?? null,
				triggered_by: input.triggeredBy,
			})
			.execute();

		const job = await this.getJob(input.id);
		if (!job) {
			throw new Error(`Failed to create crawl job ${input.id}`);
		}
		return job;
	}

	async getJob(id: string): Promise<CrawlJobRow | undefined> {
		return this.database
			.selectFrom('crawl_jobs')
			.selectAll()
			.where('id', '=', id)
			.executeTakeFirst();
	}

	async markFailed(id: string, errorMessage: string): Promise<void> {
		const now = new Date().toISOString();
		await this.database
			.updateTable('crawl_jobs')
			.set({
				status: 'failed',
				error_message: errorMessage,
				finished_at: now,
			})
			.where('id', '=', id)
			.execute();
	}

	async listRecentJobs(limit = 20): Promise<CrawlJobRow[]> {
		return this.database
			.selectFrom('crawl_jobs')
			.selectAll()
			.orderBy('created_at', 'desc')
			.limit(limit)
			.execute();
	}
}
