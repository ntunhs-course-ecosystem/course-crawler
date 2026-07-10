import { cors } from 'hono/cors';

const DEV_ORIGIN = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const GITHUB_PAGES_ORIGIN = /^https:\/\/[\w.-]+\.github\.io$/;

/** 供單元測試驗證 origin 解析；GitHub Pages 自訂網域可在此擴充 */
export function resolvePublicApiOrigin(origin: string): string {
	if (DEV_ORIGIN.test(origin) || GITHUB_PAGES_ORIGIN.test(origin)) {
		return origin;
	}

	// Public API 允許任意來源唯讀存取
	return '*';
}

/** Public API（search / facets）的 CORS；供 GitHub Pages 靜態前端 cross-origin fetch */
export const publicApiCors = cors({
	origin: (origin) => (origin ? resolvePublicApiOrigin(origin) : '*'),
	allowMethods: ['GET', 'HEAD', 'OPTIONS'],
});

export const FACETS_CACHE_CONTROL = 'public, max-age=3600';
