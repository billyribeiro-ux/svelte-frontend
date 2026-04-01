<script lang="ts">
	import Icon from '$components/ui/Icon.svelte';
</script>

<svelte:head>
	<title>Concept Graph — SvelteForge</title>
</svelte:head>

<div class="graph-page">
	<div class="graph-placeholder">
		<div class="graph-icon">
			<Icon icon="ph:graph" size={64} />
		</div>
		<h1 class="graph-title">Concept Graph</h1>
		<p class="graph-message">
			Interactive concept graph visualization coming soon.
		</p>
		<p class="graph-submessage">
			Explore how Svelte concepts connect and track your mastery across the knowledge map.
		</p>
	</div>
</div>

<style>
	.graph-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-block-size: 60dvh;
	}

	.graph-placeholder {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sf-space-4);
		text-align: center;
		padding: var(--sf-space-8);
	}

	.graph-icon {
		color: var(--sf-text-3);
	}

	.graph-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
	}

	.graph-message {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		color: var(--sf-text-1);
		margin: 0;
	}

	.graph-submessage {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-3);
		margin: 0;
		max-inline-size: 400px;
	}
</style>
