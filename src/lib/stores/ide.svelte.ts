import type { LessonFile } from '$lib/types';

// ---------- State ----------

let openFiles = $state<LessonFile[]>([]);
let activeFileIndex = $state(0);
let isContainerReady = $state(false);
let isContainerBooting = $state(false);
let previewUrl = $state<string | null>(null);

// ---------- Getters ----------

export function getOpenFiles(): LessonFile[] {
	return openFiles;
}

export function getActiveFileIndex(): number {
	return activeFileIndex;
}

export function getIsContainerReady(): boolean {
	return isContainerReady;
}

export function getIsContainerBooting(): boolean {
	return isContainerBooting;
}

export function getPreviewUrl(): string | null {
	return previewUrl;
}

export function getActiveFile(): LessonFile | undefined {
	return openFiles[activeFileIndex];
}

// ---------- Actions ----------

/**
 * Loads a new set of lesson files, resetting the IDE state.
 */
export function loadLesson(files: LessonFile[]): void {
	openFiles = files.map((f) => ({ ...f }));
	activeFileIndex = 0;
	previewUrl = null;
}

/**
 * Sets the active file tab by index.
 */
export function setActiveFile(index: number): void {
	if (index >= 0 && index < openFiles.length) {
		activeFileIndex = index;
	}
}

/**
 * Updates the content of a specific file by filename.
 */
export function updateContent(filename: string, content: string): void {
	const file = openFiles.find((f) => f.filename === filename);
	if (file) {
		file.content = content;
	}
}

/**
 * Sets the preview URL (from the WebContainer dev server).
 */
export function setPreviewUrl(url: string | null): void {
	previewUrl = url;
}

/**
 * Marks the container as ready.
 */
export function setContainerReady(): void {
	isContainerReady = true;
	isContainerBooting = false;
}

/**
 * Marks the container as booting.
 */
export function setContainerBooting(): void {
	isContainerBooting = true;
	isContainerReady = false;
}
