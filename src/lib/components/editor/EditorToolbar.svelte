<script lang="ts">
	import Icon from '$components/ui/Icon.svelte';

	interface Props {
		onrun: () => void;
		onformat: () => void;
		onreset: () => void;
		isCompiling?: boolean;
	}

	let { onrun, onformat, onreset, isCompiling = false }: Props = $props();
</script>

<div class="toolbar">
	<div class="toolbar-group">
		<button
			class="toolbar-btn toolbar-btn--primary"
			onclick={onrun}
			disabled={isCompiling}
			title="Run code (Ctrl+Enter)"
		>
			{#if isCompiling}
				<Icon icon="ph:circle-notch-bold" size={16} class="spinning" />
				<span>Compiling...</span>
			{:else}
				<Icon icon="ph:play-fill" size={16} />
				<span>Run</span>
			{/if}
		</button>

		<button
			class="toolbar-btn"
			onclick={onformat}
			disabled={isCompiling}
			title="Format code (Ctrl+Shift+F)"
		>
			<Icon icon="ph:code-bold" size={16} />
			<span>Format</span>
		</button>
	</div>

	<div class="toolbar-group">
		<button
			class="toolbar-btn toolbar-btn--danger"
			onclick={onreset}
			disabled={isCompiling}
			title="Reset to starter code"
		>
			<Icon icon="ph:arrow-counter-clockwise-bold" size={16} />
			<span>Reset</span>
		</button>
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 4px 8px;
		background-color: var(--sf-surface-2, #1e1e1e);
		border-bottom: 1px solid var(--sf-border, #333);
		min-height: 40px;
	}

	.toolbar-group {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.toolbar-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border: 1px solid var(--sf-border, #333);
		border-radius: var(--sf-radius-sm, 4px);
		background: var(--sf-surface-3, #2a2a2a);
		color: var(--sf-text, #d4d4d4);
		font-size: var(--sf-font-size-sm, 13px);
		font-family: var(--sf-font-sans, system-ui, sans-serif);
		cursor: pointer;
		transition: background-color 0.15s ease, border-color 0.15s ease;
	}

	.toolbar-btn:hover:not(:disabled) {
		background-color: var(--sf-surface-4, #333);
		border-color: var(--sf-border-hover, #555);
	}

	.toolbar-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toolbar-btn--primary {
		background-color: var(--sf-primary, #6d5ff5);
		border-color: var(--sf-primary, #6d5ff5);
		color: var(--sf-on-primary, #fff);
	}

	.toolbar-btn--primary:hover:not(:disabled) {
		background-color: var(--sf-primary-hover, #5a4dd4);
		border-color: var(--sf-primary-hover, #5a4dd4);
	}

	.toolbar-btn--danger:hover:not(:disabled) {
		background-color: var(--sf-error-surface, rgba(224, 108, 117, 0.15));
		border-color: var(--sf-error, #e06c75);
		color: var(--sf-error, #e06c75);
	}

	:global(.spinning) {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
