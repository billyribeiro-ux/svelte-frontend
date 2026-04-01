<script lang="ts">
	import type { Checkpoint as CheckpointType } from '$types/lesson';

	interface Props {
		checkpoint: CheckpointType;
		passed: boolean;
		hints: string[];
		onrevealhint: () => void;
	}

	let { checkpoint, passed, hints, onrevealhint }: Props = $props();

	let canRevealMore = $derived(hints.length < checkpoint.hints.length);
</script>

<div class="checkpoint" class:passed>
	<div class="checkpoint-header">
		<span class="checkpoint-icon">
			{#if passed}
				&#10003;
			{:else}
				&#9675;
			{/if}
		</span>
		<span class="checkpoint-description">{checkpoint.description}</span>
	</div>

	{#if !passed && hints.length > 0}
		<div class="hints">
			{#each hints as hint, i}
				<div class="hint">
					<span class="hint-label">Hint {i + 1}:</span>
					{@html hint.replace(/`(.+?)`/g, '<code>$1</code>')}
				</div>
			{/each}
		</div>
	{/if}

	{#if !passed && canRevealMore}
		<button class="hint-button" onclick={onrevealhint}>
			Show hint ({hints.length + 1}/{checkpoint.hints.length})
		</button>
	{/if}
</div>

<style>
	.checkpoint {
		padding: var(--sf-space-4);
		margin-block: var(--sf-space-3);
		background: var(--sf-bg-2);
		border-radius: var(--sf-radius-md);
		border-inline-start: 3px solid var(--sf-text-3);

		&.passed {
			border-inline-start-color: var(--sf-success);
			background: oklch(0.72 0.19 155 / 0.05);
		}
	}

	.checkpoint-header {
		display: flex;
		align-items: flex-start;
		gap: var(--sf-space-2);
	}

	.checkpoint-icon {
		flex-shrink: 0;
		font-size: var(--sf-font-size-md);
		line-height: 1.4;

		.passed & {
			color: var(--sf-success);
		}
	}

	.checkpoint-description {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-0);
		font-weight: 500;
	}

	.hints {
		margin-block-start: var(--sf-space-3);
		padding-inline-start: var(--sf-space-5);
	}

	.hint {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
		margin-block-end: var(--sf-space-2);
		padding: var(--sf-space-2) var(--sf-space-3);
		background: var(--sf-bg-3);
		border-radius: var(--sf-radius-sm);

		:global(code) {
			font-family: var(--sf-font-mono);
			background: var(--sf-bg-4);
			padding: 0.1em 0.3em;
			border-radius: var(--sf-radius-sm);
			font-size: 0.9em;
		}
	}

	.hint-label {
		font-weight: 600;
		color: var(--sf-text-2);
	}

	.hint-button {
		margin-block-start: var(--sf-space-2);
		margin-inline-start: var(--sf-space-5);
		padding: var(--sf-space-1) var(--sf-space-3);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-accent);
		border-radius: var(--sf-radius-sm);
		transition: background var(--sf-transition-fast);

		&:hover {
			background: var(--sf-accent-subtle);
		}
	}
</style>
