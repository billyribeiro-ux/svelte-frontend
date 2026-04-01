<script lang="ts">
	import type { CompileError } from '$types/editor';

	interface Props {
		errors: CompileError[];
	}

	let { errors }: Props = $props();
</script>

<div class="error-overlay">
	<div class="error-header">Compilation Error</div>
	{#each errors as error}
		<div class="error-item">
			<div class="error-message">{error.message}</div>
			{#if error.start}
				<div class="error-location">
					Line {error.start.line}, Column {error.start.column}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.error-overlay {
		position: absolute;
		inset: 0;
		z-index: 10;
		padding: var(--sf-space-5);
		background: oklch(0.15 0.02 25 / 0.95);
		overflow-y: auto;
	}

	.error-header {
		font-size: var(--sf-font-size-lg);
		font-weight: 600;
		color: var(--sf-error);
		margin-block-end: var(--sf-space-4);
	}

	.error-item {
		padding: var(--sf-space-3);
		margin-block-end: var(--sf-space-2);
		background: oklch(0.2 0.03 25 / 0.5);
		border-radius: var(--sf-radius-md);
		border-inline-start: 3px solid var(--sf-error);
	}

	.error-message {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-0);
		white-space: pre-wrap;
	}

	.error-location {
		margin-block-start: var(--sf-space-2);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}
</style>
