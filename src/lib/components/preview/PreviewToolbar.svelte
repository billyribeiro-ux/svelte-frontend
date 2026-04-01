<script lang="ts">
	interface Props {
		viewport: 'mobile' | 'tablet' | 'desktop';
	}

	let { viewport = $bindable() }: Props = $props();
</script>

<div class="toolbar">
	<span class="label">Preview</span>
	<div class="viewport-buttons">
		<button
			class="vp-btn"
			class:active={viewport === 'mobile'}
			onclick={() => (viewport = 'mobile')}
			aria-label="Mobile viewport"
		>
			375px
		</button>
		<button
			class="vp-btn"
			class:active={viewport === 'tablet'}
			onclick={() => (viewport = 'tablet')}
			aria-label="Tablet viewport"
		>
			768px
		</button>
		<button
			class="vp-btn"
			class:active={viewport === 'desktop'}
			onclick={() => (viewport = 'desktop')}
			aria-label="Desktop viewport"
		>
			100%
		</button>
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sf-space-2) var(--sf-space-3);
		background: var(--sf-bg-2);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.label {
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-1);
	}

	.viewport-buttons {
		display: flex;
		gap: var(--sf-space-1);
	}

	.vp-btn {
		padding: var(--sf-space-1) var(--sf-space-2);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
		border-radius: var(--sf-radius-sm);
		transition: all var(--sf-transition-fast);

		&:hover {
			background: var(--sf-bg-3);
			color: var(--sf-text-1);
		}

		&.active {
			background: var(--sf-accent-subtle);
			color: var(--sf-accent);
		}
	}
</style>
