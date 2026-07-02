import { createHash } from "node:crypto";

import type { Course } from "./schemas/course.schema.js";

/** D1 bind 用的正規化欄位 */
export type CourseDbParams = {
    semester: number;
    courseFullID: string;
    courseName: string;
    courseEngName: string | null;
    department: string;
    departmentID: string;
    courseType: string;
    subjectID: string;
    subjectGroup: string;
    grade: string;
    classGroup: string;
    className: string;
    classID: string;
    credit: number;
    totalOfTakingStudents: number | null;
    numberOfTakingStudents: number;
    weekNumber: string;
    day: string;
    dayNum: number;
    startPeriod: number;
    endPeriod: number;
    startTime: string;
    endTime: string;
    courseLocation: string | null;
    mainTeacherName: string;
    multipleTeacherName: string | null;
    note: string | null;
    courseAbstract: string | null;
    courseEngAbstract: string | null;
    contentHash: string;
};

const CONTENT_HASH_KEYS = [
    "courseName",
    "courseEngName",
    "department",
    "departmentID",
    "courseType",
    "subjectID",
    "subjectGroup",
    "grade",
    "classGroup",
    "className",
    "classID",
    "credit",
    "totalOfTakingStudents",
    "numberOfTakingStudents",
    "weekNumber",
    "day",
    "dayNum",
    "startPeriod",
    "endPeriod",
    "startTime",
    "endTime",
    "courseLocation",
    "mainTeacherName",
    "multipleTeacherName",
    "note",
    "courseAbstract",
    "courseEngAbstract"
] as const satisfies ReadonlyArray<keyof Omit<CourseDbParams, "semester" | "courseFullID" | "contentHash">>;

function nullableText(value: string | undefined): string | null {
    return value ? value : null;
}

function requiredText(value: string | undefined): string {
    return value ?? "";
}

function optionalNumber(value: string | undefined): number | null {
    if (!value) {
        return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

/** 只 hash mutable 欄位，不含 PK  */
export function computeCourseContentHash(
    params: Omit<CourseDbParams, "contentHash">
): string {
    const payload: Record<string, string | number | null> = {};

    for (const key of CONTENT_HASH_KEYS) {
        payload[key] = params[key];
    }

    return createHash("sha256")
        .update(JSON.stringify(payload))
        .digest("hex")
        .slice(0, 16);
}

/** 與 D1 既有 NULL 語意對齊 */
export function normalizeCourseParams(course: Course): CourseDbParams {
    const params: Omit<CourseDbParams, "contentHash"> = {
        semester: Number(course.semester),
        courseFullID: requiredText(course.courseFullID),
        courseName: requiredText(course.courseName),
        courseEngName: nullableText(course.courseEngName),
        department: requiredText(course.department),
        departmentID: requiredText(course.departmentID),
        courseType: requiredText(course.courseType),
        subjectID: requiredText(course.subjectID),
        subjectGroup: requiredText(course.subjectGroup),
        grade: requiredText(course.grade),
        classGroup: requiredText(course.classGroup),
        className: requiredText(course.className),
        classID: requiredText(course.classID),
        credit: Number(course.credit) || 0,
        totalOfTakingStudents: optionalNumber(course.totalOfTakingStudents),
        numberOfTakingStudents: Number(course.numberOfTakingStudents) || 0,
        weekNumber: requiredText(course.weekNumber),
        day: requiredText(course.day),
        dayNum: course.dayNum ?? 0,
        startPeriod: Number(course.startPeriod) || 0,
        endPeriod: Number(course.endPeriod) || 0,
        startTime: requiredText(course.startTime),
        endTime: requiredText(course.endTime),
        courseLocation: nullableText(course.courseLocation),
        mainTeacherName: requiredText(course.mainTeacherName),
        multipleTeacherName: nullableText(course.multipleTeacherName),
        note: nullableText(course.note),
        courseAbstract: nullableText(course.courseAbstract),
        courseEngAbstract: nullableText(course.courseEngAbstract)
    };

    return {
        ...params,
        contentHash: computeCourseContentHash(params)
    };
}

export function courseParamsToBindValues(params: CourseDbParams): Array<string | number | null> {
    return [
        params.semester,
        params.courseFullID,
        params.courseName,
        params.courseEngName,
        params.department,
        params.departmentID,
        params.courseType,
        params.subjectID,
        params.subjectGroup,
        params.grade,
        params.classGroup,
        params.className,
        params.classID,
        params.credit,
        params.totalOfTakingStudents,
        params.numberOfTakingStudents,
        params.weekNumber,
        params.day,
        params.dayNum,
        params.startPeriod,
        params.endPeriod,
        params.startTime,
        params.endTime,
        params.courseLocation,
        params.mainTeacherName,
        params.multipleTeacherName,
        params.note,
        params.courseAbstract,
        params.courseEngAbstract,
        params.contentHash
    ];
}
