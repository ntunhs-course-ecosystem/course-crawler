import { Hono } from 'hono';
import type { Bindings } from '../index.d';
import { runCourseCrawler } from '../services/crawler';
import { CrawlerQuerySchema } from '../schemas/course.schema';
import { describeRoute, resolver, validator } from 'hono-openapi';
import { CourseSchema } from '../schemas/course.schema';
import { z } from 'zod';
import { basicAuth } from 'hono/basic-auth';

const crawlerRoute = new Hono<{ Bindings: Bindings }>();

crawlerRoute
    .use(
		'/api/v1/crawler',
        async (c ,next) => {
            const auth = basicAuth({
                username: c.env.BASIC_AUTH_USER,
                password: c.env.BASIC_AUTH_PASS,
            });

            return auth(c, next);
        }
    )
	.get(
		'/api/v1/crawler',
		describeRoute({
			summary: '抓取國立臺北護理健康大學 (NTUNHS, 北護, 國北護)課程資料',
			description: '透過 Puppeteer 前往課程查詢系統抓取指定學期的課程列表',
			security: [
				{
					basicAuth: [],
				}
			],
			responses: {
				200: {
					description: '成功抓取課程列表',
					content: {
						'application/json': {
							schema: resolver(z.array(CourseSchema)),
						},
					},
				},
			},
		}),
		validator('query', CrawlerQuerySchema),
		async (c) => {
			const query = c.req.valid('query');

			const courses = await runCourseCrawler(c.env.NTUNHS_COURSE_BROWSER, query.sem);

			if (courses instanceof Response) {
				return courses;
			}

			return c.json(courses);
		}
	)
	.post(
		'/api/v1/crawler',
		describeRoute({
			summary: '抓取並儲存國立臺北護理健康大學 (NTUNHS, 北護, 國北護)課程資料',
			description: '執行爬蟲並將結果存入 D1 Database (若已存在則更新)',
			security: [
				{
					basicAuth: [],
				}
			],
			responses: {
				200: {
					description: '成功更新資料庫',
					content: {
						'application/json': {
							schema: resolver(
								z.object({
									message: z.string(),
									count: z.number(),
								})
							),
						},
					},
				},
			},
		}),
		validator('query', CrawlerQuerySchema),
		async (c) => {
			const query = c.req.valid('query');

			const rawCourses = await runCourseCrawler(c.env.NTUNHS_COURSE_BROWSER, query.sem);

			if (rawCourses instanceof Response) {
				return rawCourses;
			}

			if (rawCourses.length === 0) {
				return c.json({ message: '未抓取到任何資料', count: 0 });
			}

			const sql = `
            INSERT INTO courses (
                semester, courseFullID, courseName, courseEngName, department, 
                departmentID, courseType, subjectID, subjectGroup, grade, 
                classGroup, className, classID, credit, totalOfTakingStudents, 
                numberOfTakingStudents, weekNumber, day, dayNum, startPeriod, 
                endPeriod, startTime, endTime, courseLocation, mainTeacherName, 
                multipleTeacherName, note, courseAbstract, courseEngAbstract
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?
            )
            ON CONFLICT(semester, courseFullID) DO UPDATE SET
                courseName = EXCLUDED.courseName,
                courseEngName = EXCLUDED.courseEngName,
                department = EXCLUDED.department,
                departmentID = EXCLUDED.departmentID,
                courseType = EXCLUDED.courseType,
                subjectID = EXCLUDED.subjectID,
                subjectGroup = EXCLUDED.subjectGroup,
                grade = EXCLUDED.grade,
                classGroup = EXCLUDED.classGroup,
                className = EXCLUDED.className,
                classID = EXCLUDED.classID,
                credit = EXCLUDED.credit,
                totalOfTakingStudents = EXCLUDED.totalOfTakingStudents,
                numberOfTakingStudents = EXCLUDED.numberOfTakingStudents,
                weekNumber = EXCLUDED.weekNumber,
                day = EXCLUDED.day,
                dayNum = EXCLUDED.dayNum,
                startPeriod = EXCLUDED.startPeriod,
                endPeriod = EXCLUDED.endPeriod,
                startTime = EXCLUDED.startTime,
                endTime = EXCLUDED.endTime,
                courseLocation = EXCLUDED.courseLocation,
                mainTeacherName = EXCLUDED.mainTeacherName,
                multipleTeacherName = EXCLUDED.multipleTeacherName,
                note = EXCLUDED.note,
                courseAbstract = EXCLUDED.courseAbstract,
                courseEngAbstract = EXCLUDED.courseEngAbstract
        `;

			const statements = rawCourses.map((course) => {
				return c.env.ntunhs_course
					.prepare(sql)
					.bind(
						Number(course.semester),
						course.courseFullID || '',
						course.courseName || '',
						course.courseEngName || null,
						course.department || '',
						course.departmentID || '',
						course.courseType || '',
						course.subjectID || '',
						course.subjectGroup || '',
						course.grade || '',
						course.classGroup || '',
						course.className || '',
						course.classID || '',
						Number(course.credit) || 0,
						Number(course.totalOfTakingStudents) || null,
						Number(course.numberOfTakingStudents) || 0,
						course.weekNumber || '',
						course.day || '',
						course.dayNum || 0,
						Number(course.startPeriod) || 0,
						Number(course.endPeriod) || 0,
						course.startTime || '',
						course.endTime || '',
						course.courseLocation || null,
						course.mainTeacherName || '',
						course.multipleTeacherName || null,
						course.note || null,
						course.courseAbstract || null,
						course.courseEngAbstract || null
					);
			});

			try {
				await c.env.ntunhs_course.batch(statements);

				return c.json({
					message: `成功抓取並更新 ${rawCourses.length} 筆資料`,
					count: rawCourses.length,
				});
			} catch (error) {
				console.error('Error processing batch:', error);
				return c.json(
					{
						message: '批量插入失敗',
						error: error instanceof Error ? error.message : '未知錯誤',
					},
					500
				);
			}
		}
	);

export default crawlerRoute;
