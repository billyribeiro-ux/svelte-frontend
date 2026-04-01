<script lang="ts">
	import ConceptGraph from '$components/graph/ConceptGraph.svelte';
	import ConceptNode from '$components/graph/ConceptNode.svelte';
	import { graphState } from '$lib/stores/graph.svelte';
	import { initialNodes, initialEdges } from '$lib/engine/graph/concept-data';
	import SEOHead from '$components/seo/SEOHead.svelte';

	$effect(() => {
		if (graphState.nodes.length === 0) {
			graphState.setGraph(initialNodes, initialEdges);
		}
	});
</script>

<SEOHead seo={{ title: 'Concept Graph', description: 'Explore the interactive concept dependency graph showing how Svelte 5 concepts connect.' }} />

<div class="graph-page" class:has-sidebar={graphState.selectedNode !== null}>
	<div class="graph-main">
		<ConceptGraph />
	</div>

	{#if graphState.selectedNode}
		<div class="graph-sidebar">
			<ConceptNode node={graphState.selectedNode} />
		</div>
	{/if}
</div>

<style>
	.graph-page {
		display: grid;
		grid-template-columns: 1fr;
		block-size: calc(100dvh - var(--sf-space-16, 64px));
		gap: var(--sf-space-4);
		padding: var(--sf-space-4);

		&.has-sidebar {
			grid-template-columns: 1fr 320px;
		}
	}

	.graph-main {
		display: flex;
		flex-direction: column;
		min-block-size: 0;
		overflow: hidden;
	}

	.graph-sidebar {
		min-block-size: 0;
		overflow: hidden;
	}

	@media (max-width: 768px) {
		.graph-page.has-sidebar {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
		}

		.graph-sidebar {
			max-block-size: 40dvh;
		}
	}
</style>
