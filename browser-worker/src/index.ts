/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from 'hono';
import type { Bindings } from './index.d';
import { openAPIRouteHandler } from 'hono-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import courseRoute from './routes/course.route';
import crawlJobRoute from './routes/crawl-job.route';
import { triggerCrawl } from './lib/trigger-crawl';

const app = new Hono<{ Bindings: Bindings }>();

app
	.get(
		'/api/v1/openapi.json',
		openAPIRouteHandler(app, {
			documentation: {
				components: {
					securitySchemes: {
						basicAuth: {
							type: 'http',
							scheme: 'basic',
							description: '開發／維運端點（crawl-jobs）',
						},
					},
				},
				info: {
					title: 'NTUNHS Course Crawler API',
					version: '1.0.0',
					description: '國立臺北護理健康大學 (NTUNHS, 北護, 國北護)課程爬蟲 API',
				},
				servers: [{ url: 'http://localhost:8787', description: 'Local Environment' }],
			},
		})
	)
	.get('/api-docs', swaggerUI({ url: '/api/v1/openapi.json' }))
	.get('/', (c) => {
		return c.html(`
			<h1>NTUNHS Course Crawler API</h1>
			<p>API Documentation: <a href="/api-docs">/api-docs</a></p>
			<p>OpenAPI Spec: <a href="/api/v1/openapi.json">/api/v1/openapi.json</a></p>
		`);
	})
	.route('/', courseRoute)
	.route('/', crawlJobRoute);

export default {
	/**
	 * 處理 HTTP 請求 (Hono app)
	 */
	fetch: (request: Request, env: Bindings, ctx: ExecutionContext) => {
		return app.fetch(request, env, ctx);
	},

	/**
	 * 處理 Cloudflare Cron Triggers
	 */
	async scheduled(event: ScheduledEvent, env: Bindings) {
		console.log('Cron trigger 執行中:', event.cron);
		if (!env.VERCEL_APP_URL) {
			console.error('VERCEL_APP_URL 未設定');
			throw new Error('VERCEL_APP_URL 未設定');
		}

		const result = await triggerCrawl(env, { triggeredBy: 'cron' });

		if (!result.ok && result.reason === 'skipped') {
			console.log('略過：已有進行中任務', result.activeJobId);
			return;
		}

		if (!result.ok) {
			console.error('觸發 Vercel 失敗:', result.error);
			return;
		}

		console.log('Crawl job 已接受:', result.jobId);
	},
};
