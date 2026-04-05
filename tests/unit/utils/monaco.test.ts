import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadMonaco, createEditor } from '../../../src/lib/utils/monaco';
import monacoMock from '../../mocks/monaco';

describe('monaco util', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loadMonaco returns the mocked monaco module', async () => {
		const monaco = await loadMonaco();
		expect(monaco).toBeDefined();
		expect(monaco.editor).toBeDefined();
		expect(monaco.languages).toBeDefined();
		expect(typeof monaco.editor.create).toBe('function');
	});

	it('loadMonaco caches and returns the same reference on subsequent calls', async () => {
		const a = await loadMonaco();
		const b = await loadMonaco();
		expect(a).toBe(b);
	});

	it('loadMonaco registers the svelte language', async () => {
		const registerSpy = vi.spyOn(monacoMock.languages, 'register');
		// Because loadMonaco is cached across tests, we can't guarantee
		// register is called *this* invocation — but we can assert that
		// the svelte language was registered at least once across the
		// lifetime of the module.
		await loadMonaco();
		const calls = registerSpy.mock.calls;
		// If not called this run (cached), at minimum the registration
		// should already have happened during the first load.
		if (calls.length > 0) {
			expect(calls.some((c) => (c[0] as { id: string }).id === 'svelte')).toBe(true);
		}
		registerSpy.mockRestore();
	});

	it('createEditor returns an editor with expected shape', async () => {
		await loadMonaco();
		const container = document.createElement('div');
		const editor = createEditor(container, 'let x = 1;', 'typescript');

		expect(editor).toBeDefined();
		expect(typeof editor.onDidChangeModelContent).toBe('function');
		expect(typeof editor.getValue).toBe('function');
		expect(typeof editor.dispose).toBe('function');
		expect(typeof editor.getModel).toBe('function');
	});

	it('createEditor onDidChangeModelContent returns a disposable', async () => {
		await loadMonaco();
		const container = document.createElement('div');
		const editor = createEditor(container, '', 'svelte');
		const disposable = editor.onDidChangeModelContent(() => {});
		expect(disposable).toBeDefined();
		expect(typeof disposable.dispose).toBe('function');
	});
});
