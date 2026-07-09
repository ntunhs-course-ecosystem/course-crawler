export const PERIOD_MIN = 1;
export const PERIOD_MAX = 14;

export type NormalizedPeriodRange = {
	from: number;
	to: number;
};

/** 將 periodFrom/periodTo 正規化為閉區間；兩者皆缺則回傳 null */
export function normalizePeriodRange(
	periodFrom?: number,
	periodTo?: number,
): NormalizedPeriodRange | null {
	if (periodFrom === undefined && periodTo === undefined) {
		return null;
	}

	let from = periodFrom ?? PERIOD_MIN;
	let to = periodTo ?? PERIOD_MAX;

	if (from > to) {
		return { from: to, to: from };
	}

	return { from, to };
}

/** 課程區間 [start, end] 是否與查詢區間 [from, to] 有交集 */
export function periodsOverlap(
	courseStart: number,
	courseEnd: number,
	from: number,
	to: number,
): boolean {
	return courseStart <= to && courseEnd >= from;
}
