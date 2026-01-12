import { z } from 'zod';

export const CourseSchema = z.object({
	semester: z.string().optional().describe('學期 (例如: 1141)'),
	department: z.string().optional().describe('系所'),
	courseType: z.string().optional().describe('課程類別'),
	courseFullID: z.string().optional().describe('課程全碼'),
	courseName: z.string().optional().describe('課程名稱'),
	courseEngName: z.string().optional().describe('課程英文名稱'),
	departmentID: z.string().optional().describe('系所代碼'),
	subjectID: z.string().optional().describe('科目代碼'),
	subjectGroup: z.string().optional().describe('科目組别'),
	grade: z.string().optional().describe('年級'),
	classGroup: z.string().optional().describe('班組'),
	credit: z.string().optional().describe('學分'),
	className: z.string().optional().describe('上課班組名稱'),
	classID: z.string().optional().describe('上課班組代碼'),
	mainTeacherName: z.string().optional().describe('主要開課教師姓名'),
	mainTeacherID: z.string().optional().describe('主要開課教師代碼'),
	totalOfTakingStudents: z.string().optional().describe('修課人數'),
	numberOfTakingStudents: z.string().optional().describe('上課人數'),
	weekNumber: z.string().optional().describe('上課週次'),
	multipleTeacherName: z.string().optional().describe('授課教師 (多個)'),
	note: z.string().optional().describe('備註'),
	courseAbstract: z.string().optional().describe('課程摘要'),
	courseEngAbstract: z.string().optional().describe('課程英文摘要'),
	courseLocation: z.string().optional().describe('課程地點'),
	day: z.string().optional().describe('星期'),
	dayNum: z.number().optional().describe('星期幾 (1-7)'),
	startPeriod: z.string().optional().describe('開始節次'),
	endPeriod: z.string().optional().describe('結束節次'),
	startTime: z.string().optional().describe('開始時間'),
	endTime: z.string().optional().describe('結束時間'),
});

export const CrawlerQuerySchema = z.object({
	sem: z.string().optional().describe('學期代碼 (例如: 1141)'),
});

export type Course = z.infer<typeof CourseSchema>;
export type CrawlerQueryParams = z.infer<typeof CrawlerQuerySchema>;
