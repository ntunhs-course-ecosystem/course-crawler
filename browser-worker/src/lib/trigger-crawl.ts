import type { Bindings } from '../index.d';
import { CrawlJobService } from '../services/crawl-job.service';
import { db } from '../db/kysely';

export type TriggerCrawlResult =
	| { ok: true; jobId: string; status: 'accepted' }
	| { ok: false; reason: 'skipped'; activeJobId: string }
	| { ok: false; reason: 'trigger_failed'; jobId: string; error: string };

export async function triggerCrawl(
	env: Bindings,
	options: { triggeredBy: 'cron' | 'manual'; semester?: string }
): Promise<TriggerCrawlResult> {
	const service = new CrawlJobService(db);
	const activeJob = await service.findActiveJob();

	if (activeJob) {
		return { ok: false, reason: 'skipped', activeJobId: activeJob.id };
	}

	const jobId = crypto.randomUUID();
	await service.createJob({
		id: jobId,
		triggeredBy: options.triggeredBy,
		semester: options.semester,
	});

	const params = new URLSearchParams({ jobId });
	if (options.semester) {
		params.set('sem', options.semester);
	}

	const response = await fetch(`${env.VERCEL_APP_URL}/api/v1/crawler?${params}`, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${btoa(`${env.BASIC_AUTH_USER}:${env.BASIC_AUTH_PASS}`)}`,
		},
	});

	if (response.status !== 202) {
		const errorText = await response.text();
		await service.markFailed(jobId, errorText || `HTTP ${response.status}`);
		return {
			ok: false,
			reason: 'trigger_failed',
			jobId,
			error: errorText || `HTTP ${response.status}`,
		};
	}

	return { ok: true, jobId, status: 'accepted' };
}
