import type { LessonFile } from '$lib/types';

const PREFIX = 'pe7-code-';

/**
 * Saves the current lesson files to localStorage.
 */
export function saveCode(lessonId: string, files: LessonFile[]): void {
	if (typeof window === 'undefined') return;
	try {
		const data = JSON.stringify(files);
		localStorage.setItem(PREFIX + lessonId, data);
	} catch {
		// ignore quota errors
	}
}

/**
 * Loads previously saved code for a lesson, or returns null.
 */
export function loadSavedCode(lessonId: string): LessonFile[] | null {
	if (typeof window === 'undefined') return null;
	try {
		const stored = localStorage.getItem(PREFIX + lessonId);
		if (stored) {
			return JSON.parse(stored) as LessonFile[];
		}
	} catch {
		// ignore parse errors
	}
	return null;
}

/**
 * Removes saved code for a lesson.
 */
export function clearSavedCode(lessonId: string): void {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(PREFIX + lessonId);
}

/**
 * Returns true if there is saved code for the given lesson.
 */
export function hasSavedCode(lessonId: string): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem(PREFIX + lessonId) !== null;
}

// ---------- Debounced auto-save ----------

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let saveIndicator = $state(false);

/**
 * Debounced save: waits 500ms of inactivity before writing.
 * Shows a brief "Saved" indicator.
 */
export function debouncedSave(lessonId: string, files: LessonFile[]): void {
	if (saveTimer) clearTimeout(saveTimer);
	saveTimer = setTimeout(() => {
		saveCode(lessonId, files);
		saveIndicator = true;
		setTimeout(() => {
			saveIndicator = false;
		}, 1500);
	}, 500);
}

/**
 * Returns whether the "Saved" indicator should be visible.
 */
export function getSaveIndicatorVisible(): boolean {
	return saveIndicator;
}
