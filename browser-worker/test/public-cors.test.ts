import { describe, expect, it } from 'vitest';
import { resolvePublicApiOrigin } from '../src/lib/public-cors';

describe('resolvePublicApiOrigin', () => {
	it('應回傳 localhost 開發來源', () => {
		expect(resolvePublicApiOrigin('http://localhost:3000')).toBe('http://localhost:3000');
	});

	it('應回傳 127.0.0.1 開發來源', () => {
		expect(resolvePublicApiOrigin('http://127.0.0.1:3000')).toBe('http://127.0.0.1:3000');
	});

	it('應回傳 GitHub Pages project site 來源', () => {
		expect(resolvePublicApiOrigin('https://ntunhs-course-ecosystem.github.io')).toBe(
			'https://ntunhs-course-ecosystem.github.io'
		);
	});

	it('未知來源應回傳萬用字元', () => {
		expect(resolvePublicApiOrigin('https://evil.example')).toBe('*');
	});
});
