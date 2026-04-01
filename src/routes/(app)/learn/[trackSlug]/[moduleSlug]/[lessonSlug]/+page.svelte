<script lang="ts">
	import { page } from '$app/state';
	import Icon from '$components/ui/Icon.svelte';

	const trackSlug = $derived(page.params.trackSlug ?? '');
	const moduleSlug = $derived(page.params.moduleSlug ?? '');
	const lessonSlug = $derived(page.params.lessonSlug ?? '');

	const data = $derived(page.data);

	function formatSlug(slug: string): string {
		return slug
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}
</script>

<svelte:head>
	<title>{formatSlug(lessonSlug)} — SvelteForge</title>
</svelte:head>

<div class="workspace-page">
	<header class="workspace-header">
		<a href="/learn/{trackSlug}/{moduleSlug}" class="back-link">
			<Icon icon="ph:arrow-left" size={16} />
			{formatSlug(moduleSlug)}
		</a>
	</header>

	<div class="workspace-placeholder">
		<div class="workspace-icon">
			<Icon icon="ph:code" size={48} />
		</div>
		<h1 class="workspace-title">Workspace: {formatSlug(lessonSlug)}</h1>
		<p class="workspace-hint">
			The interactive workspace with code editor, preview, and AI tutor will render here.
		</p>
		{#if data.starterFiles}
			<p class="workspace-meta">
				Starter files loaded: {Object.keys(data.starterFiles).length} file(s)
			</p>
		{/if}
	</div>
</div>

<style>
	.workspace-page {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-5);
		min-block-size: 100%;
	}

	.workspace-header {
		display: flex;
		align-items: center;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-1);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		text-decoration: none;
		transition: color var(--sf-transition-fast);

		&:hover {
			color: var(--sf-accent);
		}
	}

	.workspace-placeholder {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--sf-space-4);
		background: var(--sf-bg-1);
		border: 2px dashed var(--sf-bg-4);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-8);
		text-align: center;
	}

	.workspace-icon {
		color: var(--sf-text-3);
	}

	.workspace-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xl);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
	}

	.workspace-hint {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
		max-inline-size: 400px;
	}

	.workspace-meta {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		margin: 0;
	}
</style>
