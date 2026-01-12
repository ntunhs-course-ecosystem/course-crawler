import { Kysely } from 'kysely';
import { D1Dialect } from 'kysely-d1';
import type { Database } from '../types/database';
import { env } from 'cloudflare:workers';

export const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: env.ntunhs_course }),
});