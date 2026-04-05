/**
 * Mock for `monaco-editor` used in vitest tests.
 * Provides no-op stubs for all symbols consumed by `src/lib/utils/monaco.ts`.
 */

function createModelStub() {
	return {
		getValue: () => '',
		setValue: (_v: string) => {},
		dispose: () => {}
	};
}

function createEditorStub() {
	return {
		onDidChangeModelContent: (_cb: (...args: unknown[]) => void) => ({
			dispose: () => {}
		}),
		getValue: () => '',
		setValue: (_v: string) => {},
		dispose: () => {},
		getModel: () => createModelStub(),
		layout: () => {},
		updateOptions: (_opts: unknown) => {},
		focus: () => {},
		onDidBlurEditorWidget: (_cb: () => void) => ({ dispose: () => {} }),
		onDidFocusEditorWidget: (_cb: () => void) => ({ dispose: () => {} })
	};
}

export const editor = {
	create: (_container: HTMLElement, _options?: unknown) => createEditorStub(),
	createModel: (_value?: string, _language?: string) => createModelStub(),
	setTheme: (_theme: string) => {},
	defineTheme: (_name: string, _data: unknown) => {},
	setModelLanguage: (_model: unknown, _lang: string) => {}
};

export const languages = {
	register: (_lang: { id: string; extensions?: string[] }) => {},
	setMonarchTokensProvider: (_id: string, _provider: unknown) => {},
	setLanguageConfiguration: (_id: string, _config: unknown) => {},
	registerCompletionItemProvider: (_id: string, _provider: unknown) => ({
		dispose: () => {}
	})
};

export const Uri = {
	parse: (value: string) => ({ toString: () => value, path: value }),
	file: (value: string) => ({ toString: () => value, path: value })
};

export const KeyMod = {
	CtrlCmd: 2048,
	Shift: 1024,
	Alt: 512,
	WinCtrl: 256
};

export const KeyCode = {
	Enter: 3,
	Escape: 9,
	Space: 10,
	KeyS: 49,
	KeyF: 36
};

const monaco = {
	editor,
	languages,
	Uri,
	KeyMod,
	KeyCode
};

export default monaco;
