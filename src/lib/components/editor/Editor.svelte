<script lang="ts">
	import { untrack } from 'svelte';
	import { EditorView, keymap, lineNumbers } from '@codemirror/view';
	import { EditorState } from '@codemirror/state';
	import { javascript } from '@codemirror/lang-javascript';
	import { html } from '@codemirror/lang-html';
	import { css } from '@codemirror/lang-css';
	import { bracketMatching, indentOnInput, foldGutter } from '@codemirror/language';
	import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
	import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
	import { svelteLang } from './extensions/svelte-lang';
	import { themeExtensions } from './extensions/theme';

	interface Props {
		value: string;
		language: 'svelte' | 'typescript' | 'css' | 'html';
		readonly?: boolean;
		onchange?: (value: string) => void;
	}

	let { value, language, readonly = false, onchange }: Props = $props();

	let view: EditorView | undefined = $state();
	let updatingFromProp = false;

	function getLanguageExtension(lang: string) {
		switch (lang) {
			case 'svelte':
				return svelteLang();
			case 'typescript':
				return javascript({ typescript: true });
			case 'css':
				return css();
			case 'html':
				return html();
			default:
				return javascript();
		}
	}

	function createEditor(container: HTMLDivElement) {
		const languageExtension = getLanguageExtension(language);

		const updateListener = EditorView.updateListener.of((update) => {
			if (update.docChanged && !updatingFromProp) {
				onchange?.(update.state.doc.toString());
			}
		});

		const initialDoc = untrack(() => value);

		const state = EditorState.create({
			doc: initialDoc,
			extensions: [
				lineNumbers(),
				bracketMatching(),
				indentOnInput(),
				foldGutter(),
				history(),
				closeBrackets(),
				keymap.of([...defaultKeymap, ...historyKeymap, ...closeBracketsKeymap]),
				languageExtension,
				...themeExtensions,
				updateListener,
				EditorState.readOnly.of(readonly)
			]
		});

		view = new EditorView({
			state,
			parent: container
		});

		return () => {
			view?.destroy();
			view = undefined;
		};
	}

	$effect(() => {
		if (view && value !== view.state.doc.toString()) {
			updatingFromProp = true;
			view.dispatch({
				changes: {
					from: 0,
					to: view.state.doc.length,
					insert: value
				}
			});
			updatingFromProp = false;
		}
	});
</script>

<div class="editor-container" {@attach createEditor}></div>

<style>
	.editor-container {
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: var(--sf-radius-sm, 4px);
	}

	.editor-container :global(.cm-editor) {
		height: 100%;
	}

	.editor-container :global(.cm-scroller) {
		overflow: auto;
	}
</style>
