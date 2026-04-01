<script lang="ts">
	import type { DOMMutation } from '$types/editor';

	interface Props {
		mutations: DOMMutation[];
	}

	let { mutations }: Props = $props();

	let scrollContainer = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (scrollContainer && mutations.length > 0) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
		}
	});

	function getMutationIcon(type: string): string {
		switch (type) {
			case 'childList': return '+';
			case 'attributes': return '@';
			case 'characterData': return 'T';
			default: return '?';
		}
	}

	function getMutationColor(type: string): string {
		switch (type) {
			case 'childList': return 'var(--sf-success)';
			case 'attributes': return 'var(--sf-info)';
			case 'characterData': return 'var(--sf-warning)';
			default: return 'var(--sf-text-2)';
		}
	}
</script>

<div class="dom-inspector">
	<div class="inspector-header">
		<span class="header-label">DOM Mutations</span>
		<span class="mutation-total">{mutations.length} mutation{mutations.length !== 1 ? 's' : ''}</span>
	</div>

	<div class="mutation-list" bind:this={scrollContainer}>
		{#if mutations.length === 0}
			<div class="empty">Interact with the preview to see DOM mutations in real-time.</div>
		{:else}
			{#each mutations as mutation, i}
				<div class="mutation-entry">
					<span class="mutation-index">{i + 1}</span>
					<span class="mutation-icon" style="color: {getMutationColor(mutation.type)}">
						{getMutationIcon(mutation.type)}
					</span>
					<span class="mutation-type">{mutation.type}</span>
					<span class="mutation-target">&lt;{mutation.target.toLowerCase()}&gt;</span>
					{#if mutation.type === 'childList'}
						{#if mutation.added > 0}
							<span class="mutation-detail added">+{mutation.added}</span>
						{/if}
						{#if mutation.removed > 0}
							<span class="mutation-detail removed">-{mutation.removed}</span>
						{/if}
					{:else if mutation.type === 'attributes' && mutation.attribute}
						<span class="mutation-detail attr">{mutation.attribute}</span>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.dom-inspector {
		display: flex;
		flex-direction: column;
		block-size: 100%;
	}

	.inspector-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sf-space-2) var(--sf-space-3);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.header-label {
		font-size: var(--sf-font-size-xs);
		font-weight: 600;
		color: var(--sf-text-1);
	}

	.mutation-total {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
	}

	.mutation-list {
		flex: 1;
		overflow-y: auto;
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
	}

	.empty {
		padding: var(--sf-space-4);
		text-align: center;
		color: var(--sf-text-3);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
	}

	.mutation-entry {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		padding: var(--sf-space-1) var(--sf-space-3);
		border-block-end: 1px solid var(--sf-bg-2);

		&:hover {
			background: var(--sf-bg-2);
		}
	}

	.mutation-index {
		inline-size: 2em;
		color: var(--sf-text-3);
		text-align: end;
		flex-shrink: 0;
	}

	.mutation-icon {
		flex-shrink: 0;
		font-weight: 700;
		inline-size: 1.2em;
		text-align: center;
	}

	.mutation-type {
		color: var(--sf-text-2);
		inline-size: 10em;
		flex-shrink: 0;
	}

	.mutation-target {
		color: var(--sf-syntax-tag);
	}

	.mutation-detail {
		margin-inline-start: auto;

		&.added { color: var(--sf-success); }
		&.removed { color: var(--sf-error); }
		&.attr { color: var(--sf-syntax-attribute); }
	}
</style>
