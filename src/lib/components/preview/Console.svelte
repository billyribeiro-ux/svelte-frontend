<script lang="ts">
	import type { ConsoleEntry } from '$types/editor';

	interface Props {
		entries: ConsoleEntry[];
	}

	let { entries }: Props = $props();
</script>

<div class="console">
	{#if entries.length === 0}
		<div class="empty">Console output will appear here...</div>
	{:else}
		{#each entries as entry (entry.id)}
			<div class="entry {entry.method}">
				<span class="method">{entry.method}</span>
				<span class="args">{entry.args.join(' ')}</span>
			</div>
		{/each}
	{/if}
</div>

<style>
	.console {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-sm);
		padding: var(--sf-space-2);
		block-size: 100%;
		overflow-y: auto;
	}

	.empty {
		color: var(--sf-text-3);
		padding: var(--sf-space-4);
		text-align: center;
	}

	.entry {
		display: flex;
		gap: var(--sf-space-2);
		padding: var(--sf-space-1) var(--sf-space-2);
		border-block-end: 1px solid var(--sf-bg-2);

		&.error {
			color: var(--sf-error);
			background: oklch(0.65 0.22 25 / 0.08);
		}

		&.warn {
			color: var(--sf-warning);
			background: oklch(0.78 0.18 75 / 0.08);
		}

		&.info {
			color: var(--sf-info);
		}
	}

	.method {
		flex-shrink: 0;
		inline-size: 3.5em;
		color: var(--sf-text-3);
		text-transform: uppercase;
		font-size: var(--sf-font-size-xs);
	}

	.args {
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>
