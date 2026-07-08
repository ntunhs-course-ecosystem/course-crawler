import {
	CompiledQuery,
	DatabaseConnection,
	DatabaseIntrospector,
	Dialect,
	Driver,
	Kysely,
	QueryCompiler,
	QueryResult,
	SqliteAdapter,
	SqliteIntrospector,
	SqliteQueryCompiler,
} from 'kysely';
import type { D1Database } from '@cloudflare/workers-types';

export interface D1DialectConfig {
	database: D1Database;
}

export class D1Dialect implements Dialect {
	readonly #config: D1DialectConfig;

	constructor(config: D1DialectConfig) {
		this.#config = config;
	}

	createAdapter() {
		return new SqliteAdapter();
	}

	createDriver(): Driver {
		return new D1Driver(this.#config);
	}

	createQueryCompiler(): QueryCompiler {
		return new SqliteQueryCompiler();
	}

	createIntrospector(db: Kysely<unknown>): DatabaseIntrospector {
		return new SqliteIntrospector(db);
	}
}

class D1Driver implements Driver {
	readonly #config: D1DialectConfig;

	constructor(config: D1DialectConfig) {
		this.#config = config;
	}

	async init(): Promise<void> {}

	async acquireConnection(): Promise<DatabaseConnection> {
		return new D1Connection(this.#config);
	}

	async beginTransaction(conn: D1Connection): Promise<void> {
		return await conn.beginTransaction();
	}

	async commitTransaction(conn: D1Connection): Promise<void> {
		return await conn.commitTransaction();
	}

	async rollbackTransaction(conn: D1Connection): Promise<void> {
		return await conn.rollbackTransaction();
	}

	async releaseConnection(_conn: D1Connection): Promise<void> {}

	async destroy(): Promise<void> {}
}

class D1Connection implements DatabaseConnection {
	readonly #config: D1DialectConfig;

	constructor(config: D1DialectConfig) {
		this.#config = config;
	}

	async executeQuery<O>(compiledQuery: CompiledQuery): Promise<QueryResult<O>> {
		const results = await this.#config.database
			.prepare(compiledQuery.sql)
			.bind(...compiledQuery.parameters)
			.all();

		if (results.error) {
			throw new Error(results.error);
		}

		const numAffectedRows =
			results.meta.changes != null ? BigInt(results.meta.changes) : undefined;

		return {
			insertId:
				results.meta.last_row_id === undefined || results.meta.last_row_id === null
					? undefined
					: BigInt(results.meta.last_row_id),
			rows: (results?.results as O[]) || [],
			numAffectedRows,
		};
	}

	async beginTransaction(): Promise<void> {
		throw new Error('Transactions are not supported yet.');
	}

	async commitTransaction(): Promise<void> {
		throw new Error('Transactions are not supported yet.');
	}

	async rollbackTransaction(): Promise<void> {
		throw new Error('Transactions are not supported yet.');
	}

	async *streamQuery<O>(
		_compiledQuery: CompiledQuery,
		_chunkSize: number,
	): AsyncIterableIterator<QueryResult<O>> {
		throw new Error('D1 Driver does not support streaming');
	}
}
