import { basicAuth } from 'hono/basic-auth';
import type { MiddlewareHandler } from 'hono';
import type { Bindings } from '../index.d';

// 僅開發／維運端點使用，與 Vercel crawler 共用同一組 BASIC_AUTH 憑證
export const devBasicAuth: MiddlewareHandler<{ Bindings: Bindings }> = async (
	c,
	next
) => {
	const auth = basicAuth({
		username: c.env.BASIC_AUTH_USER ?? '',
		password: c.env.BASIC_AUTH_PASS ?? '',
	});
	return auth(c, next);
};
