<script lang="ts">
	import { graphState } from '$lib/stores/graph.svelte';
	import type { ConceptNode, ConceptCategory, MasteryLevel } from '$types/concept';
	import Icon from '$components/ui/Icon.svelte';

	interface Props {
		node: ConceptNode;
	}

	let { node }: Props = $props();

	const prerequisites = $derived(graphState.getPrerequisites(node.id));
	const dependents = $derived(graphState.getDependents(node.id));

	const CATEGORY_COLORS: Record<ConceptCategory, string> = {
		html: 'oklch(0.70 0.20 25)',
		css: 'oklch(0.70 0.15 230)',
		typescript: 'oklch(0.78 0.15 75)',
		svelte: 'oklch(0.65 0.25 275)',
		sveltekit: 'oklch(0.72 0.19 155)'
	};

	const MASTERY_LABELS: Record<MasteryLevel, string> = {
		unstarted: 'Not started',
		introduced: 'Introduced',
		practicing: 'Practicing',
		competent: 'Competent',
		mastered: 'Mastered'
	};

	const MASTERY_PERCENT: Record<MasteryLevel, number> = {
		unstarted: 0,
		introduced: 25,
		practicing: 50,
		competent: 75,
		mastered: 100
	};

	function close() {
		graphState.selectNode(null);
	}

	function selectPrereq(id: string) {
		graphState.selectNode(id);
	}
</script>

<aside class="node-sidebar" style:--category-color={CATEGORY_COLORS[node.category]}>
	<div class="sidebar-header">
		<h2 class="sidebar-title">{node.title}</h2>
		<button class="close-btn" onclick={close} aria-label="Close detail panel">
			<Icon icon="ph:x" size={18} />
		</button>
	</div>

	<p class="node-description">{node.description}</p>

	<div class="node-meta">
		<span class="category-badge" style:background="var(--category-color)">
			{node.category}
		</span>

		<span class="difficulty-indicator" aria-label={`Difficulty ${node.difficulty} out of 10`}>
			{#each { length: 10 } as _, i}
				<span class="difficulty-dot" class:filled={i < node.difficulty}></span>
			{/each}
		</span>
	</div>

	<div class="mastery-section">
		<div class="mastery-header">
			<span class="mastery-label">{MASTERY_LABELS[node.mastery]}</span>
			<span class="mastery-value">{MASTERY_PERCENT[node.mastery]}%</span>
		</div>
		<div class="mastery-track">
			<div
				class="mastery-fill"
				style:inline-size="{MASTERY_PERCENT[node.mastery]}%"
			></div>
		</div>
	</div>

	{#if prerequisites.length > 0}
		<div class="related-section">
			<h3 class="related-heading">Prerequisites</h3>
			<ul class="related-list">
				{#each prerequisites as prereq}
					<li>
						<button class="related-link" onclick={() => selectPrereq(prereq.id)}>
							<span class="related-dot" style:background={CATEGORY_COLORS[prereq.category]}></span>
							{prereq.title}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if dependents.length > 0}
		<div class="related-section">
			<h3 class="related-heading">Unlocks</h3>
			<ul class="related-list">
				{#each dependents as dep}
					<li>
						<button class="related-link" onclick={() => selectPrereq(dep.id)}>
							<span class="related-dot" style:background={CATEGORY_COLORS[dep.category]}></span>
							{dep.title}
						</button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</aside>

<style>
	.node-sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-4);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-5);
		overflow-y: auto;
		max-block-size: 100%;
	}

	.sidebar-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--sf-space-3);
	}

	.sidebar-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-lg);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
		line-height: 1.3;
	}

	.close-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-4);
		border-radius: var(--sf-radius-md);
		padding: var(--sf-space-1);
		color: var(--sf-text-2);
		cursor: pointer;
		transition: background var(--sf-transition-fast), color var(--sf-transition-fast);

		&:hover {
			background: var(--sf-bg-3);
			color: var(--sf-text-0);
		}
	}

	.node-description {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
		margin: 0;
		line-height: 1.5;
	}

	.node-meta {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		flex-wrap: wrap;
	}

	.category-badge {
		display: inline-flex;
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		font-weight: 600;
		color: oklch(0.15 0 0);
		padding-block: var(--sf-space-1);
		padding-inline: var(--sf-space-2);
		border-radius: var(--sf-radius-full);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.difficulty-indicator {
		display: inline-flex;
		gap: 3px;
		align-items: center;
	}

	.difficulty-dot {
		display: inline-block;
		inline-size: 6px;
		block-size: 6px;
		border-radius: var(--sf-radius-full);
		background: var(--sf-bg-3);
		transition: background var(--sf-transition-fast);

		&.filled {
			background: var(--category-color);
		}
	}

	.mastery-section {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-2);
	}

	.mastery-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.mastery-label {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-1);
	}

	.mastery-value {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}

	.mastery-track {
		background: var(--sf-bg-2);
		border-radius: var(--sf-radius-full);
		block-size: 6px;
		overflow: hidden;
	}

	.mastery-fill {
		block-size: 100%;
		background: var(--category-color);
		border-radius: var(--sf-radius-full);
		transition: inline-size var(--sf-transition-slow);
	}

	.related-section {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-2);
	}

	.related-heading {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		font-weight: 600;
		color: var(--sf-text-3);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		margin: 0;
	}

	.related-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
	}

	.related-link {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-2);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
		background: none;
		border: none;
		padding: var(--sf-space-1) 0;
		cursor: pointer;
		transition: color var(--sf-transition-fast);

		&:hover {
			color: var(--sf-accent);
		}
	}

	.related-dot {
		display: inline-block;
		inline-size: 8px;
		block-size: 8px;
		border-radius: var(--sf-radius-full);
		flex-shrink: 0;
	}
</style>
