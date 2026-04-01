<script lang="ts">
	import type { ConsoleEntry } from '$types/editor';

	interface Props {
		entries: ConsoleEntry[];
		onclear?: () => void;
	}

	let { entries, onclear }: Props = $props();
</script>

<div class="console">
	{#if onclear && entries.length > 0}
		<div class="console-toolbar">
			<button class="clear-btn" onclick={onclear}>Clear</button>
		</div>
	{/if}
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

	.console-toolbar {
		display: flex;
		justify-content: flex-end;
		padding: var(--sf-space-1) var(--sf-space-2);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.clear-btn {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
		padding: var(--sf-space-1) var(--sf-space-2);
		border-radius: var(--sf-radius-sm);

		&:hover {
			color: var(--sf-text-0);
			background: var(--sf-bg-3);
		}
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
