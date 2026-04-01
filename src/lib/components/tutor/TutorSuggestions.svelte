<script lang="ts">
	import type { TutorSuggestion } from '$types/tutor';

	interface Props {
		suggestions: TutorSuggestion[];
		onselect: (suggestion: TutorSuggestion) => void;
	}

	let { suggestions, onselect }: Props = $props();
</script>

{#if suggestions.length > 0}
	<div class="tutor-suggestions">
		<div class="tutor-suggestions__scroll">
			{#each suggestions as suggestion (suggestion.id)}
				<button
					class="tutor-suggestions__chip"
					onclick={() => onselect(suggestion)}
				>
					{suggestion.label}
				</button>
			{/each}
		</div>
	</div>
{/if}

<style>
	.tutor-suggestions {
		padding-inline: var(--sf-space-3);
		padding-block: var(--sf-space-2);
		border-block-start: 1px solid var(--sf-bg-3);
		background: var(--sf-bg-1);
	}

	.tutor-suggestions__scroll {
		display: flex;
		gap: var(--sf-space-2);
		overflow-x: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--sf-bg-4) transparent;

		&::-webkit-scrollbar {
			block-size: 4px;
		}

		&::-webkit-scrollbar-thumb {
			background: var(--sf-bg-4);
			border-radius: var(--sf-radius-full, 9999px);
		}
	}

	.tutor-suggestions__chip {
		flex-shrink: 0;
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		font-weight: 500;
		color: var(--sf-accent);
		background: var(--sf-accent-subtle, oklch(0.75 0.15 250 / 0.1));
		border: 1px solid var(--sf-accent-subtle, oklch(0.75 0.15 250 / 0.2));
		border-radius: var(--sf-radius-full, 9999px);
		padding-block: var(--sf-space-1);
		padding-inline: var(--sf-space-3);
		cursor: pointer;
		white-space: nowrap;
		transition: all var(--sf-transition-fast);

		&:hover {
			background: var(--sf-accent);
			color: var(--sf-accent-text);
		}
	}
</style>
