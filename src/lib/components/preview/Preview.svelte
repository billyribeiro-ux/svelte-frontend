<script lang="ts">
	import type { CompilationResult, ConsoleEntry, DOMMutation } from '$types/editor';
	import { SvelteSandbox } from '$engine/compiler/sandbox';
	import PreviewToolbar from './PreviewToolbar.svelte';
	import ErrorOverlay from './ErrorOverlay.svelte';

	interface Props {
		compilationResult: CompilationResult | null;
		onConsole?: (entry: ConsoleEntry) => void;
		onDOMMutation?: (mutation: DOMMutation) => void;
	}

	let { compilationResult, onConsole, onDOMMutation }: Props = $props();

	let iframeContainer = $state<HTMLDivElement | null>(null);
	let sandbox = $state<SvelteSandbox | null>(null);
	let viewport = $state<'mobile' | 'tablet' | 'desktop'>('desktop');

	let hasErrors = $derived(
		compilationResult !== null &&
			!compilationResult.success &&
			compilationResult.errors.length > 0
	);

	let viewportWidth = $derived(
		viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%'
	);

	// Initialize sandbox when container is available
	$effect(() => {
		if (!iframeContainer) return;

		const s = new SvelteSandbox(
			iframeContainer,
			(entry) => onConsole?.(entry),
			() => {},
			(mutation) => onDOMMutation?.(mutation)
		);
		sandbox = s;

		return () => {
			s.destroy();
			sandbox = null;
		};
	});

	// Execute compiled code when compilation result changes
	$effect(() => {
		if (!sandbox || !compilationResult?.success || !compilationResult.js) return;
		sandbox.execute(compilationResult.js, compilationResult.css);
	});
</script>

<div class="preview">
	<PreviewToolbar bind:viewport />

	<div class="preview-frame" class:has-errors={hasErrors}>
		{#if hasErrors && compilationResult}
			<ErrorOverlay errors={compilationResult.errors} />
		{/if}
		<div
			class="iframe-container"
			bind:this={iframeContainer}
			style="max-inline-size: {viewportWidth}"
		></div>
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
		margin-inline: auto;
	}
</style>
