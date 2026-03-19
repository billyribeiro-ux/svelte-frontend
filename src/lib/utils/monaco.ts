import type * as Monaco from 'monaco-editor';

let monacoInstance: typeof Monaco | null = null;

/**
 * Dynamically imports monaco-editor (SSR-safe) and configures it
 * with a Svelte language definition and VS Code dark theme.
 */
export async function loadMonaco(): Promise<typeof Monaco> {
	if (monacoInstance) return monacoInstance;

	const monaco = await import('monaco-editor');

	// Register Svelte language
	monaco.languages.register({ id: 'svelte', extensions: ['.svelte'] });

	monaco.languages.setMonarchTokensProvider('svelte', {
		defaultToken: '',
		tokenPostfix: '.svelte',

		keywords: [
			'if', 'else', 'each', 'await', 'then', 'catch', 'key',
			'html', 'render', 'attach', 'snippet', 'debug', 'const'
		],

		runeKeywords: [
			'$state', '$derived', '$effect', '$props', '$inspect', '$bindable', '$host'
		],

		blockKeywords: [
			'#if', '#each', '#await', '#key', '#snippet',
			'/if', '/each', '/await', '/key', '/snippet',
			':else', ':then', ':catch',
			'@html', '@render', '@attach', '@debug', '@const'
		],

		tokenizer: {
			root: [
				// Svelte block tags: {#if}, {/if}, {:else}, {@html}, {@render}, etc.
				[/\{[#/:@][a-zA-Z_]+/, { token: 'keyword.svelte-block', bracket: '@open' }],
				[/\{\/[a-zA-Z_]+\}/, { token: 'keyword.svelte-block', bracket: '@close' }],

				// Svelte runes: $state, $derived, $effect, $props, $inspect, $bindable
				[/\$(?:state|derived|effect|props|inspect|bindable|host)\b/, 'keyword.rune'],

				// Svelte expression braces
				[/\{/, { token: 'delimiter.curly', bracket: '@open', next: '@svelteExpression' }],

				// HTML script tag
				[/<script\b/, { token: 'tag', next: '@script' }],
				[/<style\b/, { token: 'tag', next: '@style' }],

				// HTML tags
				[/<\/?[\w-]+/, 'tag'],
				[/\/?>/, 'tag'],

				// HTML attributes
				[/[\w-]+=/, 'attribute.name'],

				// Strings
				[/"([^"]*)"/, 'string'],
				[/'([^']*)'/, 'string'],
				[/`([^`]*)`/, 'string'],

				// Comments
				[/<!--/, 'comment', '@htmlComment'],
				[/\/\/.*$/, 'comment'],
				[/\/\*/, 'comment', '@blockComment'],

				// Numbers
				[/\d+(\.\d+)?/, 'number'],
			],

			svelteExpression: [
				[/\$(?:state|derived|effect|props|inspect|bindable|host)\b/, 'keyword.rune'],
				[/\{/, { token: 'delimiter.curly', bracket: '@open', next: '@push' }],
				[/\}/, { token: 'delimiter.curly', bracket: '@close', next: '@pop' }],
				[/"([^"]*)"/, 'string'],
				[/'([^']*)'/, 'string'],
				[/`([^`]*)`/, 'string'],
				[/\d+(\.\d+)?/, 'number'],
				[/[a-zA-Z_$][\w$]*/, 'identifier'],
				[/./, ''],
			],

			script: [
				[/\$(?:state|derived|effect|props|inspect|bindable|host)\b/, 'keyword.rune'],
				[/<\/script>/, { token: 'tag', next: '@pop' }],
				[/\/\/.*$/, 'comment'],
				[/\/\*/, 'comment', '@blockComment'],
				[/"([^"]*)"/, 'string'],
				[/'([^']*)'/, 'string'],
				[/`([^`]*)`/, 'string'],
				[/\b(?:let|const|var|function|return|import|export|from|if|else|for|while|class|new|this|typeof|async|await)\b/, 'keyword'],
				[/\b(?:string|number|boolean|void|any|never|unknown)\b/, 'type'],
				[/\d+(\.\d+)?/, 'number'],
				[/[a-zA-Z_$][\w$]*/, 'identifier'],
				[/[{}()\[\]]/, 'delimiter'],
				[/./, ''],
			],

			style: [
				[/<\/style>/, { token: 'tag', next: '@pop' }],
				[/[a-zA-Z-]+(?=\s*:)/, 'attribute.name'],
				[/:/, 'delimiter'],
				[/#[0-9a-fA-F]+/, 'number.hex'],
				[/\d+(\.\d+)?(px|em|rem|%|vh|vw|s|ms)?/, 'number'],
				[/"([^"]*)"/, 'string'],
				[/'([^']*)'/, 'string'],
				[/\/\*/, 'comment', '@blockComment'],
				[/./, ''],
			],

			htmlComment: [
				[/-->/, 'comment', '@pop'],
				[/./, 'comment'],
			],

			blockComment: [
				[/\*\//, 'comment', '@pop'],
				[/./, 'comment'],
			],
		}
	});

	// Set VS Code dark theme as default
	monaco.editor.setTheme('vs-dark');

	monacoInstance = monaco;
	return monaco;
}

/**
 * Creates a Monaco editor instance inside the given container.
 */
export function createEditor(
	container: HTMLElement,
	content: string,
	language: string
): Monaco.editor.IStandaloneCodeEditor {
	if (!monacoInstance) {
		throw new Error('Monaco not loaded. Call loadMonaco() first.');
	}

	return monacoInstance.editor.create(container, {
		value: content,
		language,
		theme: 'vs-dark',
		fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
		fontSize: 14,
		lineHeight: 22,
		minimap: { enabled: false },
		scrollBeyondLastLine: false,
		automaticLayout: true,
		tabSize: 2,
		insertSpaces: false,
		renderWhitespace: 'selection',
		bracketPairColorization: { enabled: true },
		padding: { top: 12 },
		smoothScrolling: true,
		cursorBlinking: 'smooth',
		cursorSmoothCaretAnimation: 'on',
	});
}
