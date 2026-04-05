import { describe, it, expect, beforeEach } from 'vitest';
import {
	getOpenFiles,
	getActiveFile,
	getActiveFileIndex,
	getIsContainerReady,
	getIsContainerBooting,
	getPreviewUrl,
	loadLesson,
	setActiveFile,
	updateContent,
	setPreviewUrl,
	setContainerReady,
	setContainerBooting
} from '../../../src/lib/stores/ide.svelte';
import type { LessonFile } from '../../../src/lib/types/index';

function sampleFiles(): LessonFile[] {
	return [
		{ filename: 'App.svelte', content: '<h1>A</h1>', language: 'svelte' },
		{ filename: 'Card.svelte', content: '<h2>Card</h2>', language: 'svelte' },
		{ filename: 'util.ts', content: 'export const x = 1;', language: 'typescript' }
	];
}

describe('ide store', () => {
	beforeEach(() => {
		// Reset to a known baseline for each test.
		loadLesson([]);
		setPreviewUrl(null);
	});

	it('has expected initial values after reset', () => {
		expect(getOpenFiles()).toEqual([]);
		expect(getActiveFileIndex()).toBe(0);
		expect(getPreviewUrl()).toBeNull();
		expect(typeof getIsContainerReady()).toBe('boolean');
		expect(typeof getIsContainerBooting()).toBe('boolean');
	});

	it('loadLesson populates files and resets activeFileIndex to 0', () => {
		const files = sampleFiles();
		loadLesson(files);
		expect(getOpenFiles()).toHaveLength(3);
		expect(getOpenFiles()[0].filename).toBe('App.svelte');
		expect(getActiveFileIndex()).toBe(0);
		expect(getPreviewUrl()).toBeNull();
	});

	it('loadLesson clones files (does not keep references)', () => {
		const files = sampleFiles();
		loadLesson(files);
		files[0].content = 'MUTATED';
		expect(getOpenFiles()[0].content).toBe('<h1>A</h1>');
	});

	it('getActiveFile returns the file at activeFileIndex', () => {
		loadLesson(sampleFiles());
		expect(getActiveFile()?.filename).toBe('App.svelte');
		setActiveFile(1);
		expect(getActiveFile()?.filename).toBe('Card.svelte');
	});

	it('setActiveFile clamps to valid range (ignores out-of-range)', () => {
		loadLesson(sampleFiles());
		setActiveFile(2);
		expect(getActiveFileIndex()).toBe(2);
		setActiveFile(99); // out-of-range, should be ignored
		expect(getActiveFileIndex()).toBe(2);
		setActiveFile(-1); // negative, should be ignored
		expect(getActiveFileIndex()).toBe(2);
		setActiveFile(0);
		expect(getActiveFileIndex()).toBe(0);
	});

	it('updateContent mutates a file by filename', () => {
		loadLesson(sampleFiles());
		updateContent('App.svelte', '<h1>NEW</h1>');
		expect(getOpenFiles()[0].content).toBe('<h1>NEW</h1>');
		// Other files untouched
		expect(getOpenFiles()[1].content).toBe('<h2>Card</h2>');
	});

	it('updateContent is a no-op for unknown filename', () => {
		loadLesson(sampleFiles());
		updateContent('nope.svelte', 'x');
		expect(getOpenFiles()[0].content).toBe('<h1>A</h1>');
	});

	it('setPreviewUrl updates the preview url getter', () => {
		setPreviewUrl('http://localhost:5173');
		expect(getPreviewUrl()).toBe('http://localhost:5173');
		setPreviewUrl(null);
		expect(getPreviewUrl()).toBeNull();
	});

	it('setContainerBooting/setContainerReady toggle the flags', () => {
		setContainerBooting();
		expect(getIsContainerBooting()).toBe(true);
		expect(getIsContainerReady()).toBe(false);

		setContainerReady();
		expect(getIsContainerBooting()).toBe(false);
		expect(getIsContainerReady()).toBe(true);
	});

	it('loadLesson resets previewUrl to null', () => {
		setPreviewUrl('http://example.com');
		loadLesson(sampleFiles());
		expect(getPreviewUrl()).toBeNull();
	});
});
