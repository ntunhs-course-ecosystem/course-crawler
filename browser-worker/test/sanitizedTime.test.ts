import { describe, it, expect } from 'vitest';
import { sanitizeTime } from '../src/utils';

describe("測試 'sanitizedTime' 函式", () => {
	it("應該正確清理包含換行與多節的時間字串 '節08(15:40~16:30)\\n節09(16:40~17:30)'", () => {
		const time = '節08(15:40~16:30)\n節09(16:40~17:30)';
		const { startTime, endTime } = sanitizeTime(time);

		// 驗證開始時間是否為第一節的開始
		expect(startTime).toBe('15:40');
		// 驗證結束時間是否為最後一節的結束
		expect(endTime).toBe('17:30');
	});

	it("應該正確清理單節的時間字串 '節08(15:40~16:30)'", () => {
		const time = '節08(15:40~16:30)';
		const { startTime, endTime } = sanitizeTime(time);

		expect(startTime).toBe('15:40');
		expect(endTime).toBe('16:30');
	});
});
