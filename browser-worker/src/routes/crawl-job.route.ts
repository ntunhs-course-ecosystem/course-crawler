import { Hono } from 'hono';
import { describeRoute, resolver, validator } from 'hono-openapi';
import z from 'zod';
import { db } from '../db/kysely';
import type { Bindings } from '../index.d';
import { triggerCrawl } from '../lib/trigger-crawl';
import { devBasicAuth } from '../middleware/dev-basic-auth';
import { CrawlJobService } from '../services/crawl-job.service';

const CrawlJobSchema = z.object({
	id: z.string(),
	status: z.enum(['queued', 'running', 'succeeded', 'failed']),
	semester: z.string().nullable(),
	triggered_by: z.enum(['cron', 'manual']),
	courses_count: z.number().nullable(),
	rows_written: z.number().nullable(),
	error_message: z.string().nullable(),
	started_at: z.string().nullable(),
	finished_at: z.string().nullable(),
	created_at: z.string(),
});

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', devBasicAuth);

app.post(
	'/api/v1/crawl-jobs',
	describeRoute({
		summary: '手動觸發爬蟲任務',
		description: '建立 Crawl Job 並非同步呼叫 Vercel 執行端。若已有進行中任務則 skip。',
		security: [{ basicAuth: [] }],
		responses: {
			401: { description: '未授權' },
			202: {
				description: '任務已接受',
				content: {
					'application/json': {
						schema: resolver(
							z.object({
								jobId: z.string(),
								status: z.literal('accepted'),
							})
						),
					},
				},
			},
			409: {
				description: '已有進行中任務，略過',
				content: {
					'application/json': {
						schema: resolver(
							z.object({
								reason: z.literal('skipped'),
								activeJobId: z.string(),
							})
						),
					},
				},
			},
		},
	}),
	validator(
		'query',
		z.object({
			sem: z.string().optional().describe('學期 (例如: 1141)'),
		})
	),
	async (c) => {
		const { sem } = c.req.valid('query');
		const result = await triggerCrawl(c.env, {
			triggeredBy: 'manual',
			semester: sem,
		});

		if (!result.ok && result.reason === 'skipped') {
			return c.json(
				{ reason: 'skipped', activeJobId: result.activeJobId },
				409
			);
		}

		if (!result.ok) {
			return c.json(
				{ jobId: result.jobId, error: result.error },
				502
			);
		}

		return c.json({ jobId: result.jobId, status: result.status }, 202);
	}
);

app.get(
	'/api/v1/crawl-jobs/:id',
	describeRoute({
		summary: '查詢爬蟲任務狀態',
		security: [{ basicAuth: [] }],
		responses: {
			401: { description: '未授權' },
			200: {
				description: '任務狀態',
				content: {
					'application/json': {
						schema: resolver(CrawlJobSchema),
					},
				},
			},
			404: {
				description: '任務不存在',
			},
		},
	}),
	async (c) => {
		const service = new CrawlJobService(db);
		const job = await service.getJob(c.req.param('id'));

		if (!job) {
			return c.json({ error: 'Job not found' }, 404);
		}

		return c.json(job);
	}
);

app.get(
	'/api/v1/crawl-jobs',
	describeRoute({
		summary: '列出近期爬蟲任務',
		security: [{ basicAuth: [] }],
		responses: {
			401: { description: '未授權' },
			200: {
				description: '任務列表',
				content: {
					'application/json': {
						schema: resolver(z.array(CrawlJobSchema)),
					},
				},
			},
		},
	}),
	validator(
		'query',
		z.object({
			limit: z.coerce.number().optional().default(20),
		})
	),
	async (c) => {
		const { limit } = c.req.valid('query');
		const service = new CrawlJobService(db);
		const jobs = await service.listRecentJobs(limit);
		return c.json(jobs);
	}
);

export default app;
