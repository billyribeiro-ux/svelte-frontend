import { getStorageItem, setStorageItem } from './local-storage';

const PREFIX = 'sf-autosave-';

export function saveProgress(lessonId: string, files: Record<string, string>) {
	setStorageItem(`${PREFIX}${lessonId}`, {
		files,
		savedAt: Date.now()
	});
}

export function loadProgress(lessonId: string): Record<string, string> | null {
	const data = getStorageItem<{ files: Record<string, string>; savedAt: number } | null>(
		`${PREFIX}${lessonId}`,
		null
	);
	return data?.files ?? null;
}

export function clearProgress(lessonId: string) {
	if (typeof localStorage !== 'undefined') {
		localStorage.removeItem(`${PREFIX}${lessonId}`);
	}
}

export function hasProgress(lessonId: string): boolean {
	return loadProgress(lessonId) !== null;
}
