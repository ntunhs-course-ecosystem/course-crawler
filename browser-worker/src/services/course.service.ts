import { Kysely } from "kysely";
import { Database } from "../types/database";

export interface CourseQueryParams {
    semester?: number[];
    departmentID?: string[];
    department?: string[];
    grade?: string[];
    dayNum?: number[];
    startPeriod?: number[];
    endPeriod?: number[];
    courseName?: string;
    limit?: number;
    cursor?: number; // 使用 id 作為 Seek Pagination 的 cursor
}

export class CourseService {
    constructor(private readonly db: Kysely<Database>) {}

    async searchCourses(params: CourseQueryParams) {
        const {
            semester,
            departmentID,
			department,
            grade,
            dayNum,
            startPeriod,
            endPeriod,
            courseName,
            limit = 20,
            cursor,
        } = params;

        let query = this.db
            .selectFrom('courses')
            .selectAll()

        if (semester && semester.length > 0) {
            query = query.where('semester', 'in', semester);
        }

        if (departmentID && departmentID.length > 0) {
            query = query.where('departmentID', 'in', departmentID);
        }

		if (department && department.length > 0) {
			query = query.where((eb) => eb.or(
				department.map(dept => eb('department', 'like', `%${dept}%`))
			));
		}

        if (grade && grade.length > 0) {
            query = query.where('grade', 'in', grade);
        }

        if (dayNum && dayNum.length > 0) {
            query = query.where('dayNum', 'in', dayNum);
        }

        if (startPeriod && startPeriod.length > 0) {
            query = query.where('startPeriod', 'in', startPeriod);
        }

        if (endPeriod && endPeriod.length > 0) {
            query = query.where('endPeriod', 'in', endPeriod);
        }

        if (courseName) {
            query = query.where('courseName', 'like', `%${courseName}%`);
        }

        if (cursor) {
            query = query.where('id', '>', cursor);
        }

		console.log(query.compile());

        const items = await query
            .orderBy('id', 'asc')
            .limit(limit + 1)
            .execute();

        const hasNextPage = items.length > limit;
        const data = hasNextPage ? items.slice(0, limit) : items;

        const nextCursor = hasNextPage ? data[data.length - 1].id : null;

        return {
            data,
            pagination: {
                hasNextPage,
                nextCursor
            }
        };
    }
}
