import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// In-memory progress store for Phase 1
const progressStore = new Map<string, Record<string, unknown>>();

export const GET: RequestHandler = async ({ url }) => {
	const userId = url.searchParams.get('userId') ?? 'dev-user-1';
	const progress = progressStore.get(userId) ?? {};
	return json({ data: progress });
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const userId = body.userId ?? 'dev-user-1';

	const existing = progressStore.get(userId) ?? {};
	progressStore.set(userId, { ...existing, ...body.progress });

	return json({ success: true });
};
