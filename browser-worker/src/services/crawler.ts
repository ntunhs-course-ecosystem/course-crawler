import type { Course } from '../schemas/course.schema';
import puppeteer from '@cloudflare/puppeteer';
import { sanitizePeriod, sanitizeTime } from '../utils';

const dayNumMapping: Record<string, number> = Object.freeze({
	週一: 1,
	週二: 2,
	週三: 3,
	週四: 4,
	週五: 5,
	週六: 6,
	週日: 7,
});

export async function runCourseCrawler(fetcher: Fetcher, semester?: string) {
	const browser = await puppeteer.launch(fetcher);

	try {
		const page = await browser.newPage();
		// 1. 前往查詢頁面
		await page.goto('https://system10.ntunhs.edu.tw/AcadInfoSystem/Modules/QueryCourse/QueryCourse.aspx');

		const semesterSelect = await page.waitForSelector('#ContentPlaceHolder1_ddlSem');
		if (semesterSelect) {
			if (semester) {
				// 檢查指定的 sem 是否存在於選項中
				const semExists = await page.evaluate((sem) => {
					const select = document.querySelector('#ContentPlaceHolder1_ddlSem') as unknown as HTMLSelectElement;
					return Array.from(select.options).some((opt) => opt.value === sem);
				}, semester);

				if (!semExists) {
					return new Response(`指定的學期 ${semester} 不存在`, { status: 400 });
				}

				await page.select('#ContentPlaceHolder1_ddlSem', semester);
			} else {
				const lastSemester = await semesterSelect.$eval('option:nth-child(2)', (el: any) => el.value);
				await page.select('#ContentPlaceHolder1_ddlSem', lastSemester);
			}
		}
		// 3. 點擊查詢
		await page.click('#ContentPlaceHolder1_btnQuery');

		// 4. 等待表格載入
		await page.waitForSelector('#ContentPlaceHolder1_NewGridView', { timeout: 60000 });

		// 5. 抓取內容
		const courses: Course[] = [];
		const trs = await page.$$('#ContentPlaceHolder1_NewGridView tr');

		// 取得所有 Group ID
		const groups: string[] = [];
		for (const tr of trs) {
			const group = await tr.evaluate((el) => el.getAttribute('group'));
			if (group && !groups.includes(group)) groups.push(group);
		}

		for (const group of groups) {
			const tr = await page.$(`tr[group="${group}"]`);
			if (!tr) continue;

			try {
				const course: Course = {
					semester: await tr.$eval(`span[id*="lblSEMNo"]`, (el) => el.textContent?.trim()),
					department: await tr.$eval(`span[id*="lblGroupName"]`, (el) => el.textContent?.trim()),
					courseType: await tr.$eval(`span[id*="lblCourseTypeName"]`, (el) => el.textContent?.trim()),
					courseFullID: await tr.$eval(`span[id*="hidCOURSEFULLNO"]`, (el) => el.textContent?.trim()),
					courseName: await tr.$eval(`span[id*="lblCourseName"]`, (el) => el.textContent?.trim()),
					courseEngName: await tr.$eval(`span[id*="hidECOURSENAME"]`, (el) => el.textContent?.trim()),
					departmentID: await tr.$eval(`span[id*="hidGROUPNO"]`, (el) => el.textContent?.trim()),
					subjectID: await tr.$eval(`span[id*="lblCourseNo"]`, (el) => el.textContent?.trim()),
					subjectGroup: await tr.$eval(`span[id*="hidCOURSEGROUP"]`, (el) => el.textContent?.trim()),
					grade: await tr.$eval(`span[id*="lblGrade"]`, (el) => el.textContent?.trim()),
					classGroup: await tr.$eval(`span[id*="lblClass"]`, (el) => el.textContent?.trim()),
					credit: await tr.$eval(`span[id*="lblCredit"]`, (el) => el.textContent?.trim()),
					className: await tr.$eval(`span[id*="hidCLASSNAME"]`, (el) => el.textContent?.trim()),
					classID: await tr.$eval(`span[id*="hidCLASSNO"]`, (el) => el.textContent?.trim()),
					totalOfTakingStudents: await tr.$eval(`span[id*="hidTOTALFULLCNT"]`, (el) => el.textContent?.trim()),
					numberOfTakingStudents: await tr.$eval(`span[id*="lblTotalCNT"]`, (el) => el.textContent?.trim()),
					weekNumber: await tr.$eval(`span[id*="hidWEEKDESC"]`, (el) => el.textContent?.trim()),
					note: await tr.$eval(`span[id*="lblRemark"]`, (el: any) => el.title),
					courseAbstract: await tr.$eval(`span[id*="hidABSTRACT"]`, (el) => el.textContent?.trim()),
					courseEngAbstract: await tr.$eval(`span[id*="hidEABSTRACT"]`, (el) => el.textContent?.trim()),
					day: await tr.$eval(`span[id*=lblWeekNo]`, (el: any) => el.title),
					dayNum: 0,
				};

				const mainTeacherName = await tr.$eval(`div[id*="panMainTeachNameLinks"] span`, (el) => el.textContent?.trim());
				course.mainTeacherName = mainTeacherName;

				const multipleTeacherNames = await tr.$$eval(`div[id*="panMultipleTeachNameLinks"] span`, (els) =>
					els.map((el) => el.textContent?.trim()),
				);
				course.multipleTeacherName = multipleTeacherNames.join(', ');

				course.dayNum = course.day ? dayNumMapping[course.day] || 0 : 0;

				const locationEl = await tr.$(`span[id*="lblRoomNo"]`);
				if (locationEl) {
					const id = await locationEl.evaluate((el) => el.textContent?.trim());
					const name = await locationEl.evaluate((el: any) => el.title.trim());
					course.courseLocation = id || name;
				}

				const period = await tr.$eval(`span[id*="lblSecNo"]`, (el) => el.textContent?.trim());
				if (period) {
					const { startPeriod, endPeriod } = sanitizePeriod(period);
					course.startPeriod = startPeriod;
					course.endPeriod = endPeriod;
				}

				const timeTitle = await tr.$eval(`span[id*="lblSecNo"]`, (el: any) => el.title.trim());
				const timeResult = sanitizeTime(timeTitle);
				course.startTime = timeResult.startTime;
				course.endTime = timeResult.endTime;

				courses.push(course);
			} catch (e) {
				console.error(`解析課程失敗 (Group: ${group}):`, e);
			}
		}

		return courses;
	} catch (error) {
		console.error(error);
		return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
	}
}
