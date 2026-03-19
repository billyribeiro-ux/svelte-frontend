<script lang="ts">
	import type * as Monaco from 'monaco-editor';

	let {
		content,
		language,
		onchange
	}: {
		content: string;
		language: string;
		onchange?: (value: string) => void;
	} = $props();

	let container: HTMLDivElement | undefined = $state();
	let editor: Monaco.editor.IStandaloneCodeEditor | undefined;
	let isUpdatingFromProp = false;

	$effect(() => {
		if (!container) return;

		let disposed = false;

		async function init() {
			const { loadMonaco, createEditor } = await import('$lib/utils/monaco');
			await loadMonaco();

			if (disposed || !container) return;

			editor = createEditor(container, content, language);

			editor.onDidChangeModelContent(() => {
				if (isUpdatingFromProp) return;
				const value = editor?.getValue();
				if (value !== undefined && onchange) {
					onchange(value);
				}
			});
		}

		init();

		return () => {
			disposed = true;
			editor?.dispose();
			editor = undefined;
		};
	});

	// Update editor content when prop changes externally
	$effect(() => {
		if (editor) {
			const currentValue = editor.getValue();
			if (currentValue !== content) {
				isUpdatingFromProp = true;
				editor.setValue(content);
				isUpdatingFromProp = false;
			}
		}
	});

	// Update language when prop changes
	$effect(() => {
		if (editor) {
			const model = editor.getModel();
			if (model) {
				import('monaco-editor').then((monaco) => {
					monaco.editor.setModelLanguage(model, language);
				});
			}
		}
	});
</script>

<div class="monaco-wrapper" bind:this={container}></div>

<style>
	.monaco-wrapper {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
