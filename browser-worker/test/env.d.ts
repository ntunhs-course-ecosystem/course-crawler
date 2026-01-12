declare module 'cloudflare:test' {
	interface ProvidedEnv extends Env {}
}

// 告訴 TypeScript 所有以 ?raw 結尾的匯入都是字串
declare module '*?raw' {
	const content: string;
	export default content;
}

// 也可以特別指定 .sql 檔案
declare module '*.sql' {
	const content: string;
	export default content;
}
