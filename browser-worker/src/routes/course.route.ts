import { Hono } from 'hono';
import { CourseService } from '../services/course.service';
import { Bindings } from '../index.d';
import { db } from '../db/kysely';
import z from 'zod';
import { describeRoute, validator, resolver } from 'hono-openapi';
import { CourseSchema } from '../schemas/course.schema';

const app = new Hono<{ Bindings: Bindings }>();

const multiQuery = <T extends z.ZodTypeAny>(schema: T) =>
	z.array(schema)                    // 情況 1: 已經是陣列 (多個參數)
	  .or(schema.transform((v) => [v])) // 情況 2: 單一參數，轉為陣列
	  .default([]);                     // 情況 3: 沒傳，給空陣列

const searchQuerySchema = z.object({
	semester: multiQuery(z.coerce.number()).describe('學期 (例如: 1141)'),
	departmentID: multiQuery(z.string()).describe('系所代碼'),
	grade: multiQuery(z.string()).describe('年級'),
	dayNum: multiQuery(z.coerce.number()).describe('星期幾 (1-7)'),
	startPeriod: multiQuery(z.coerce.number()).describe('開始節次'),
	endPeriod: multiQuery(z.coerce.number()).describe('結束節次'),

	courseName: z.string().optional().describe('課程名稱'),
	limit: z.coerce.number().optional().describe('每頁筆數 (預設: 20)'),
	cursor: z.coerce.number().optional().describe('分頁游標 (用於 Seek Pagination)'),
});

app.get(
	'/api/v1/search',
	describeRoute({
		summary: '搜尋課程',
		description: '根據多種條件搜尋課程，支援分頁查詢',
		responses: {
			200: {
				description: '搜尋結果與分頁資訊',
				content: {
					'application/json': {
						schema: resolver(
							z.object({
								data: z.array(CourseSchema),
								pagination: z.object({
									hasNextPage: z.boolean(),
									nextCursor: z.number().nullable(),
								}),
							})
						),
					},
				},
			},
		},
	}),
	validator('query', searchQuerySchema),
	async (c) => {
		const queryData = c.req.valid('query');
		const service = new CourseService(db);

		try {
			const result = await service.searchCourses(queryData);
			return c.json(result);
		} catch (error) {
			console.error('Search failed:', error);
			return c.json({ error: 'Internal Server Error' }, 500);
		}
	}
);

export default app;
