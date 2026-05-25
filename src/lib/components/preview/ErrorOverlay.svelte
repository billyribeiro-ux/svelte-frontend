<script lang="ts">
	import type { CompileError } from '$types/editor';

	interface Props {
		errors: CompileError[];
	}

	let { errors }: Props = $props();

	function getSuggestion(message: string): string | null {
		const lower = message.toLowerCase();
		if (lower.includes('unexpected token')) return 'Check for missing closing tags, brackets, or semicolons.';
		if (lower.includes('is not defined')) return 'Make sure the variable is declared with let, const, or $state.';
		if (lower.includes('expected')) return 'Check your syntax — you may be missing a bracket, quote, or keyword.';
		if (lower.includes('cannot find')) return 'Verify the import path and that the module exports the identifier.';
		if (lower.includes('$state') || lower.includes('$derived') || lower.includes('$effect'))
			return 'Runes must be used at the top level of a component or in a .svelte.ts file.';
		if (lower.includes('each')) return 'Make sure your {#each} block has a matching {/each} and the iterable is an array.';
		if (lower.includes('prop') || lower.includes('props')) return 'Use the $props() rune to declare component props in Svelte 5.';
		if (lower.includes('bind')) return 'Ensure the element supports this binding and the variable is declared with $state.';
		return null;
	}
</script>

<div class="error-overlay" role="alert" aria-live="assertive">
	<div class="error-header">
		<span class="error-icon" aria-hidden="true">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
				<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
				<path d="M12 8v4M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
			</svg>
		</span>
		Compilation Error{errors.length > 1 ? `s (${errors.length})` : ''}
	</div>
	{#each errors as error}
		<div class="error-item">
			<div class="error-message">{error.message}</div>
			{#if error.start}
				<div class="error-location">
					Line {error.start.line}, Column {error.start.column}
				</div>
			{/if}
			{#if getSuggestion(error.message)}
				<div class="error-suggestion">
					<span class="suggestion-icon" aria-hidden="true">💡</span>
					{getSuggestion(error.message)}
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
		animation: sf-slide-up 300ms var(--sf-ease-out);

		@media (prefers-reduced-motion: reduce) {
			animation: none;
		}
	}

	.error-header {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		font-size: var(--sf-font-size-lg);
		font-weight: 600;
		color: var(--sf-error);
		margin-block-end: var(--sf-space-4);
	}

	.error-icon {
		display: flex;
		flex-shrink: 0;
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

	.error-suggestion {
		display: flex;
		align-items: flex-start;
		gap: var(--sf-space-2);
		margin-block-start: var(--sf-space-3);
		padding: var(--sf-space-2) var(--sf-space-3);
		background: oklch(0.25 0.04 275 / 0.3);
		border-radius: var(--sf-radius-sm);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-1);
		line-height: 1.5;
	}

	.suggestion-icon {
		flex-shrink: 0;
		line-height: 1;
	}
</style>
