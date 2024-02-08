import { describe, it } from 'node:test';
import assert from 'node:assert';
import { sanitizeTime } from '../utils.js';

describe("test 'sanitizeTime'", () => {
    it("should sanitize time '節08(15:40~16:30)\\n節09(16:40~17:30)' to '15:40~17:30' correct", () => {
        let time = "節08(15:40~16:30)\n節09(16:40~17:30)";
        let { startTime, endTime } = sanitizeTime(time);
        assert.strictEqual(startTime, "15:40");
        assert.strictEqual(endTime, "17:30");
    });

    it("should sanitize time '節08(15:40~16:30)' to '15:40~16:30' correct", () => {
        let time = "節08(15:40~16:30)";
        let { startTime, endTime } = sanitizeTime(time);
        assert.strictEqual(startTime, "15:40");
        assert.strictEqual(endTime, "16:30");
    });
})