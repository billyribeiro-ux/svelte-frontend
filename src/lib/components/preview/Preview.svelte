<script lang="ts">
	import type { CompilationResult } from '$types/editor';
	import PreviewToolbar from './PreviewToolbar.svelte';
	import ErrorOverlay from './ErrorOverlay.svelte';

	interface Props {
		compilationResult: CompilationResult | null;
	}

	let { compilationResult }: Props = $props();

	let iframeContainer = $state<HTMLDivElement | null>(null);
	let iframe = $state<HTMLIFrameElement | null>(null);
	let viewport = $state<'mobile' | 'tablet' | 'desktop'>('desktop');

	let hasErrors = $derived(
		compilationResult !== null &&
			!compilationResult.success &&
			compilationResult.errors.length > 0
	);

	let viewportWidth = $derived(
		viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%'
	);

	$effect(() => {
		if (!iframeContainer) return;

		const el = document.createElement('iframe');
		el.sandbox.add('allow-scripts');
		el.style.cssText = `width:${viewportWidth};height:100%;border:none;background:white;`;
		iframeContainer.innerHTML = '';
		iframeContainer.appendChild(el);
		iframe = el;

		return () => {
			iframe = null;
		};
	});

	$effect(() => {
		if (!iframe || !compilationResult?.success) return;

		const html = buildPreviewHTML(compilationResult.js ?? '', compilationResult.css);
		iframe.srcdoc = html;
	});

	function buildPreviewHTML(js: string, css: string | null): string {
		return `<!DOCTYPE html>
<html>
<head>
<style>
body { margin: 0; font-family: system-ui, sans-serif; }
${css ?? ''}
</style>
</head>
<body>
<div id="app"></div>
<script type="module">
${js}
<\/script>
</body>
</html>`;
	}
</script>

<div class="preview">
	<PreviewToolbar bind:viewport />

	<div class="preview-frame" class:has-errors={hasErrors}>
		{#if hasErrors && compilationResult}
			<ErrorOverlay errors={compilationResult.errors} />
		{/if}
		<div class="iframe-container" bind:this={iframeContainer}></div>
	</div>
</div>

<style>
	.preview {
		display: flex;
		flex-direction: column;
		block-size: 100%;
	}

	.preview-frame {
		flex: 1;
		position: relative;
		overflow: hidden;
		background: white;

		&.has-errors {
			& .iframe-container {
				opacity: 0.3;
			}
		}
	}

	.iframe-container {
		display: flex;
		justify-content: center;
		block-size: 100%;
	}
</style>
