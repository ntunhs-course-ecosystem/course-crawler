import { cors } from 'hono/cors';

const LOCALHOST_ORIGIN = /^http:\/\/localhost(:\d+)?$/;
const GITHUB_PAGES_ORIGIN = /^https:\/\/[\w.-]+\.github\.io$/;

function resolvePublicApiOrigin(origin: string): string {
	if (LOCALHOST_ORIGIN.test(origin) || GITHUB_PAGES_ORIGIN.test(origin)) {
		return origin;
	}

	// Public API 允許任意來源唯讀存取；GitHub Pages 自訂網域可在此擴充
	return '*';
}

/** Public API（search / facets）的 CORS；供 GitHub Pages 靜態前端 cross-origin fetch */
export const publicApiCors = cors({
	origin: (origin) => (origin ? resolvePublicApiOrigin(origin) : '*'),
	allowMethods: ['GET', 'HEAD', 'OPTIONS'],
});

export const FACETS_CACHE_CONTROL = 'public, max-age=3600';
