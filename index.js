import fsP from "fs/promises";
import puppeteer from "puppeteer";
import { sanitizeTime, sanitizedPeriod } from "./utils.js";
const browser = await puppeteer.launch({ headless: false });
const page = await browser.newPage();

const dayNumMapping = Object.freeze({
    "週一": 1,
    "週二": 2,
    "週三": 3,
    "週四": 4,
    "週五": 5,
    "週六": 6,
    "週日": 7
});

/**
 * 前往 "北護課程查詢系統" 頁面
 */
async function gotoQueryPage() {
    await page.goto("https://system10.ntunhs.edu.tw/AcadInfoSystem/Modules/QueryCourse/QueryCourse.aspx");
}

/**
 * 選取最新學期
 */
async function selectLastSemester() {
    // 尋找 "選擇學期" 下拉式選單
    // 為了防止網頁還未載入完成，所以使用了 waitForSelector， timeout 5 秒 
    let semesterSelectElement = await page.waitForSelector("#ContentPlaceHolder1_ddlSem", {
        timeout: 5000,
        visible: true
    });

    // 選擇最新的學期
    // nth-child(2)，選擇第二個是因為第一個是 "請選擇學期..."
    let lastSemesterOption = await semesterSelectElement.$("option:nth-child(2)");
    let lastSemester = await lastSemesterOption.evaluate(el => el.value);
    await semesterSelectElement.select(lastSemester);
}

async function typeCourseName() {
    let courseNameInput = await page.waitForSelector("#ContentPlaceHolder1_txtCourseName")
    await courseNameInput.type("國文");
}

/**
 * 點擊 "查詢" 按鈕
 */
async function clickSearchButton() {
    // 尋找 "查詢" 按鈕
    let queryButton = await page.waitForSelector("#ContentPlaceHolder1_btnQuery");
    await queryButton.click();
}

/**
 * 獲取最新學期所有課程資訊
 * @returns {Promise<import("./type").Course[]>}
 */
async function getCoursesContent() {
    let courseTableBlock = await page.waitForSelector("#ContentPlaceHolder1_NewGridView", {
        timeout: 60 * 1000
    });

    let courses = [];

    /** @type { import("puppeteer").ElementHandle<HTMLTableRowElement[]> } */
    let trs = await courseTableBlock.$$("tr");

    let groups = await getGroupsInCoursesTable(trs);

    for (let i = 1; i < groups.length; i++) {
        /** @type { import("puppeteer").ElementHandle<HTMLTableRowElement> } */
        let tr = await courseTableBlock.$("tr[group='" + groups[i] + "']");

        try {
            /** @type { import("./type").Course } */
            let course = {
                semester: await tr.$eval(`span[id*="lblSEMNo"]`, el => el.textContent.trim()),
                department: await tr.$eval(`span[id*="lblGroupName"]`, el => el.textContent.trim()),
                courseType: await tr.$eval(`span[id*="lblCourseTypeName"]`, el => el.textContent.trim()),
                courseFullID: await tr.$eval(`span[id*="hidCOURSEFULLNO"]`, el => el.textContent.trim()),
                courseName: await tr.$eval(`span[id*="lblCourseName"]`, el => el.textContent.trim()),
                courseEngName: await tr.$eval(`span[id*="hidECOURSENAME"]`, el => el.textContent.trim()),
                departmentID: await tr.$eval(`span[id*="hidGROUPNO"]`, el => el.textContent.trim()),
                subjectID: await tr.$eval(`span[id*="lblCourseNo"]`, el => el.textContent.trim()),
                subjectGroup: await tr.$eval(`span[id*="hidCOURSEGROUP"]`, el => el.textContent.trim()),
                grade: await tr.$eval(`span[id*="lblGrade"]`, el => el.textContent.trim()),
                classGroup: await tr.$eval(`span[id*="lblClass"]`, el => el.textContent.trim()),
                credit: await tr.$eval(`span[id*="lblCredit"]`, el => el.textContent.trim()),
                className: await tr.$eval(`span[id*="hidCLASSNAME"]`, el => el.textContent.trim()),
                classID: await tr.$eval(`span[id*="hidCLASSNO"]`, el => el.textContent.trim()),
                totalOfTakingStudents: await tr.$eval(`span[id*="hidTOTALFULLCNT"]`, el => el.textContent.trim()),
                numberOfTakingStudents: await tr.$eval(`span[id*="lblTotalCNT"]`, el => el.textContent.trim()),
                weekNumber: await tr.$eval(`span[id*="hidWEEKDESC"]`, el => el.textContent.trim()),
                multipleTeacherName: await tr.$eval(`div[id*="panMultipleTeachNameLinks"]`, el => el.textContent.trim()),
                note: await tr.$eval(`span[id*="lblRemark"]`, el => el.title),
                courseAbstract: await tr.$eval(`span[id*="hidABSTRACT"]`, el => el.textContent.trim()),
                courseEngAbstract: await tr.$eval(`span[id*="hidEABSTRACT"]`, el => el.textContent.trim()),

                day: await tr.$eval(`span[id*=lblWeekNo]`, el => el.title)
            };

            let mainTeacherNameEl = await tr.$(`div[id*="panMainTeachNameLinks"]`);
            let mainTeacherName = await mainTeacherNameEl.$eval(`span`, el => el.textContent.trim());
            course.mainTeacherName = mainTeacherName;

            let multipleTeacherNameEl = await tr.$(`div[id*="panMultipleTeachNameLinks"]`);
            let multipleTeacherNames = await multipleTeacherNameEl.$$eval(`span`, els => els.map(el => el.textContent));
            course.multipleTeacherName = multipleTeacherNames.join(", ");

            try {
                course.dayNum = dayNumMapping[course.day];
            } catch (e) {
                course.dayNum = 0;
            }
            

            let courseLocationID = await tr.$eval(`span[id*="lblRoomNo"]`, el => el.textContent.trim());
            let courseLocationName = await tr.$eval(`span[id*="lblRoomNo"]`, el => el.title.trim());
            let courseLocation = courseLocationID ? courseLocationID : courseLocationName;
            course.courseLocation = courseLocation;

            let period = await tr.$eval(`span[id*="lblSecNo"]`, el => el.textContent.trim());
            if (period) {
                let { startPeriod, endPeriod } = sanitizedPeriod(period);
                course.startPeriod = startPeriod;
                course.endPeriod = endPeriod;
            } else {
                course.startPeriod = "";
                course.endPeriod = "";
            }

            let time = await tr.$eval(`span[id*="lblSecNo"]`, el => el.title.trim());
            let sanitizedTime = sanitizeTime(time);
            course.startTime = sanitizedTime.startTime;
            course.endTime = sanitizedTime.endTime;

            courses.push(course);
        } catch (e) {
            console.error(e);
            console.log(await (await tr.getProperty("outerHTML")).jsonValue());
        }

    }

    return courses;
}

/**
 * 尋找所有的 Group
 * 學校網站會把上下長度太長的表格拆分，所以要用 group 來分辨每個課程
 * group 是從 1 開始遞增的數值
 * @param {import("puppeteer").ElementHandle<HTMLTableRowElement[]>} trs 
 */
async function getGroupsInCoursesTable(trs) {
    let groups = {};
    for(let tr of trs) {
        let group = await tr.evaluate(el => el.getAttribute("group"))
        if (group) groups[group] = 1;
    }
    return Object.keys(groups);
}

/**
 * 把課程資訊寫到 courses.json 檔案
 * @param {import("./type").Course[]} courses 
 */
async function writeCoursesToFile(courses) {
    let coursesString = JSON.stringify(courses, null, 4);
    await fsP.writeFile("courses.json", coursesString);
}

async function doCraw() {
    await gotoQueryPage();
    await selectLastSemester();
    // 快速測試用，只搜尋 "國文" 一門課
    // await typeCourseName();
    await clickSearchButton();
    let courses = await getCoursesContent();
    await writeCoursesToFile(courses);
    console.log("done");
    process.exit(1);
}

doCraw();