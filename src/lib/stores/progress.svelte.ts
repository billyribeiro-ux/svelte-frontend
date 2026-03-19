import type { LessonProgress, ProgressMap } from '$lib/types';

const STORAGE_KEY = 'svelte-pe7-progress';

let progress: ProgressMap = $state({});

// Load from localStorage on init
if (typeof window !== 'undefined') {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			progress = JSON.parse(stored);
		}
	} catch {
		// ignore parse errors
	}
}

// Auto-save to localStorage
if (typeof window !== 'undefined') {
	$effect.root(() => {
		$effect(() => {
			// Read all keys to track changes
			const snapshot = JSON.stringify(progress);
			try {
				localStorage.setItem(STORAGE_KEY, snapshot);
			} catch {
				// ignore quota errors
			}
		});
	});
}

export function markComplete(lessonId: string): void {
	progress[lessonId] = {
		completed: true,
		completedAt: new Date().toISOString()
	};
}

export function isComplete(lessonId: string): boolean {
	return progress[lessonId]?.completed ?? false;
}

export function getProgress(): ProgressMap {
	return progress;
}

export function getCompletedCount(): number {
	return Object.values(progress).filter((p) => p.completed).length;
}

export function resetProgress(): void {
	for (const key of Object.keys(progress)) {
		delete progress[key];
	}
}
