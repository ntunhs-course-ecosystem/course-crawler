import { z } from 'zod';

export const FacetDepartmentSchema = z.object({
	id: z.string().describe('系所代碼'),
	name: z.string().describe('系所名稱'),
});

export const FacetsResponseSchema = z.object({
	semesters: z.array(z.number()).describe('學期列表（降序）'),
	departments: z.array(FacetDepartmentSchema).describe('系所列表（依名稱升序）'),
});

export type FacetDepartment = z.infer<typeof FacetDepartmentSchema>;
export type FacetsResponse = z.infer<typeof FacetsResponseSchema>;
