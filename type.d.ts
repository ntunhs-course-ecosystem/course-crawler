export type Course = {
    semester?: string; // 學期
    department?: string; // 科系
    courseType?: string; // 課程類別
    courseFullID?: string; // 課程全碼
    courseName?: string; // 課程名稱
    courseEngName?: string; // 課程英文名稱
    departmentID?: string; // 系所代碼
    subjectID?: string; // 科目代碼
    subjectGroup?: string; // 科目組别
    grade?: string; // 年級
    classGroup?: string; // 班組
    credit?: number; // 學分
    className?: string; // 上課班組名稱
    classID?: string; // 上課班組代碼
    mainTeacherName?: string; // 主要開課教師姓名
    mainTeacherID?: string; // 主要開課教師代碼
    totalOfTakingStudents?: number; // 修課人數
    numberOfTakingStudents?: number; // 上課人數
    weekNumber?: number; // 上課週次
    multipleTeacherName?: string; // 授課教師 (多個)
    note?: string; // 備註
    coursePlanRelativeUrl?: string; // 教學計畫相對網址
    courseAbstract?: string; // 課程摘要
    courseEngAbstract?: string; // 課程英文摘要

    courseLocation?: string; // 課程地點
    day?: string; // 星期
    dayNum: number;
    startPeriod?: string; // 節次
    endPeriod?: string; // 節次
    startTime?: string; // 開始時間
    endTime?: string; // 結束時間
};