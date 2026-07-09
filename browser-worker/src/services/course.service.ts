import { Kysely } from "kysely";
import { Database } from "../types/database";
import type { FacetDepartment, FacetsResponse } from "../schemas/facets.schema";
import { normalizePeriodRange } from "../lib/period-range";

export interface CourseQueryParams {
    semester?: number[];
    departmentID?: string[];
    department?: string[];
    grade?: string[];
    dayNum?: number[];
    periodFrom?: number;
    periodTo?: number;
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
            periodFrom,
            periodTo,
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

        const periodRange = normalizePeriodRange(periodFrom, periodTo);
        if (periodRange) {
            query = query
                .where('startPeriod', '<=', periodRange.to)
                .where('endPeriod', '>=', periodRange.from);
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

    async getFacets(): Promise<FacetsResponse> {
        const [semesterRows, departmentRows] = await Promise.all([
            this.db
                .selectFrom('courses')
                .select('semester')
                .distinct()
                .orderBy('semester', 'desc')
                .execute(),
            this.db
                .selectFrom('courses')
                .select(['departmentID', 'department'])
                .distinct()
                .orderBy('department', 'asc')
                .execute(),
        ]);

        const semesters = semesterRows.map((row) => row.semester);
        const departmentById = new Map<string, FacetDepartment>();
        for (const row of departmentRows) {
            if (!departmentById.has(row.departmentID)) {
                departmentById.set(row.departmentID, {
                    id: row.departmentID,
                    name: row.department,
                });
            }
        }
        const departments = [...departmentById.values()];

        return { semesters, departments };
    }
}
