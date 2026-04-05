import { describe, it, expect, vi } from 'vitest';
import {
	getWebContainer,
	mountLessonFiles,
	startDevServer,
	writeFile
} from '../../../src/lib/utils/webcontainer';
import type { LessonFile } from '../../../src/lib/types/index';

describe('webcontainer util', () => {
	it('getWebContainer returns a singleton instance', async () => {
		const a = await getWebContainer();
		const b = await getWebContainer();
		expect(a).toBe(b);
	});

	it('getWebContainer exposes the mocked fs + spawn API', async () => {
		const container = await getWebContainer();
		expect(container).toBeDefined();
		expect(container.fs).toBeDefined();
		expect(typeof container.fs.writeFile).toBe('function');
		expect(typeof container.fs.mkdir).toBe('function');
		expect(typeof container.spawn).toBe('function');
		expect(typeof container.on).toBe('function');
	});

	it('mountLessonFiles writes files with normalized paths', async () => {
		const container = await getWebContainer();
		const writeFileSpy = vi.spyOn(container.fs, 'writeFile');

		const files: LessonFile[] = [
			{ filename: 'App.svelte', content: '<h1>Hi</h1>', language: 'svelte' },
			{ filename: 'Card.svelte', content: '<h2>Card</h2>', language: 'svelte' },
			{ filename: 'src/lib/helper.ts', content: 'export {}', language: 'typescript' }
		];

		await mountLessonFiles(files);

		// Every written path must begin with a leading slash.
		const paths = writeFileSpy.mock.calls.map((c) => c[0] as string);
		expect(paths.length).toBeGreaterThanOrEqual(3);
		for (const p of paths) {
			expect(p.startsWith('/')).toBe(true);
		}

		// Files without src/ prefix land under /src/routes/
		expect(paths).toContain('/src/routes/App.svelte');
		expect(paths).toContain('/src/routes/Card.svelte');
		// Files with src/ prefix are kept as-is
		expect(paths).toContain('/src/lib/helper.ts');

		writeFileSpy.mockRestore();
	});

	it('writeFile normalizes a path without a leading slash', async () => {
		const container = await getWebContainer();
		const spy = vi.spyOn(container.fs, 'writeFile');
		await writeFile('src/routes/App.svelte', 'content');
		expect(spy).toHaveBeenCalledWith('/src/routes/App.svelte', 'content');
		spy.mockRestore();
	});

	it('writeFile preserves an existing leading slash', async () => {
		const container = await getWebContainer();
		const spy = vi.spyOn(container.fs, 'writeFile');
		await writeFile('/src/routes/App.svelte', 'content');
		expect(spy).toHaveBeenCalledWith('/src/routes/App.svelte', 'content');
		spy.mockRestore();
	});

	it('startDevServer resolves with the mocked server-ready url', async () => {
		const url = await startDevServer();
		expect(url).toBe('http://localhost:5173');
	});
});
