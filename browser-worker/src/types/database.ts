import {
    ColumnType,
    Generated,
    Insertable,
    Selectable,
    Updateable
} from 'kysely';

export interface Database {
    courses: CourseTable;
}

export interface CourseTable {
    id: Generated<number>;

    // 識別資訊
    semester: number; // 1141, 1132...
    courseFullID: string; // 課程全碼
    courseName: string;
    courseEngName: string | null;

    // 系所與分類
    department: string;
    departmentID: string;
    courseType: string;       // '專業選修(系所)'
    subjectID: string;
    subjectGroup: string;

    // 班級資訊
    grade: string;
    classGroup: string;
    className: string;
    classID: string;

    // 學分與人數
    credit: number;
    totalOfTakingStudents: number | null;
    numberOfTakingStudents: number;

      // 時間與地點
    weekNumber: string;
    day: string;
    dayNum: number;
    startPeriod: number;
    endPeriod: number;
    startTime: string;
    endTime: string;
    courseLocation: string | null;

     // 內容與備註
    mainTeacherName: string;
    multipleTeacherName: string | null;
    note: string | null;
    courseAbstract: string | null;
    courseEngAbstract: string | null;

    created_at: ColumnType<string, string | undefined, never>;
}

export type CourseRow = Selectable<CourseTable>;
export type NewCourse = Insertable<CourseTable>;
export type CourseUpdate = Updateable<CourseTable>;