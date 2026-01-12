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
import crawlerRoute from './routes/crawler.route';
import type { Bindings } from './index.d';
import { openAPIRouteHandler } from 'hono-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import courseRoute from './routes/course.route';

const app = new Hono<{ Bindings: Bindings }>();

app
	.get(
		'/api/v1/openapi.json',
		openAPIRouteHandler(app, {
			documentation: {
				components: {
					securitySchemes: {
						basicAuth: {
							type: "http",
							scheme: "basic",
							description: "Basic Authentication",
						}
					}
				},
				security: [
					{
						basicAuth: [],
					}
				],
				info: {
					title: 'NTUNHS Course Crawler API',
					version: '1.0.0',
					description: '國立臺北護理健康大學 (NTUNHS, 北護, 國北護)課程爬蟲 API'
				},
				servers: [
					{ url: 'http://localhost:8787', description: 'Local Environment' },
				]
			}
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
	.route('/', crawlerRoute)
	.route('/', courseRoute);

export default app;
