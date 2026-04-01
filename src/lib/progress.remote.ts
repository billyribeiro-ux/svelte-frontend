import * as v from 'valibot';
import { query, command } from '$app/server';

// In-memory progress store (Phase 1 — will be replaced by PostgreSQL in Phase 2)
const progressStore = new Map<string, Record<string, unknown>>();

export const getProgress = query(v.string(), async (userId) => {
	return progressStore.get(userId) ?? {};
});

export const saveProgress = command(
	v.object({
		userId: v.string(),
		progress: v.record(v.string(), v.unknown())
	}),
	async ({ userId, progress }) => {
		progressStore.set(userId, progress);
		return { success: true };
	}
);
