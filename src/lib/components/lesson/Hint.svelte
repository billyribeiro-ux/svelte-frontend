<script lang="ts">
	interface Props {
		text: string;
	}

	let { text }: Props = $props();

	let revealed = $state(false);
</script>

<div class="hint-wrapper">
	{#if revealed}
		<div class="hint-content">
			{@html text.replace(/`(.+?)`/g, '<code>$1</code>')}
		</div>
	{:else}
		<button class="hint-toggle" onclick={() => (revealed = true)}>
			Click to reveal hint
		</button>
	{/if}
</div>

<style>
	.hint-wrapper {
		margin-block: var(--sf-space-2);
	}

	.hint-toggle {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		padding: var(--sf-space-2) var(--sf-space-3);
		border: 1px dashed var(--sf-bg-4);
		border-radius: var(--sf-radius-md);
		inline-size: 100%;
		text-align: center;
		transition: all var(--sf-transition-fast);

		&:hover {
			color: var(--sf-accent);
			border-color: var(--sf-accent);
		}
	}

	.hint-content {
		padding: var(--sf-space-3);
		background: var(--sf-bg-2);
		border-radius: var(--sf-radius-md);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
		animation: sf-fade-in var(--sf-transition-base);

		:global(code) {
			font-family: var(--sf-font-mono);
			background: var(--sf-bg-3);
			padding: 0.1em 0.3em;
			border-radius: var(--sf-radius-sm);
		}
	}
</style>
