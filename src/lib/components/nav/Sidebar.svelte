<script lang="ts">
	import type { Phase } from '$lib/types';
	import { getCompletedCount } from '$lib/stores/progress.svelte';
	import PhaseSection from './PhaseSection.svelte';

	let {
		phases,
		currentLessonId
	}: {
		phases: Phase[];
		currentLessonId: string | null;
	} = $props();

	const totalLessons = $derived(
		phases.reduce((sum, p) => sum + p.modules.reduce((s, m) => s + m.lessonCount, 0), 0)
	);
	const completed = $derived(getCompletedCount());
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<h1 class="app-title">
			<span class="accent">Svelte</span> PE7 Mastery
		</h1>
		<div class="progress-summary">
			<span class="progress-text">{completed}/{totalLessons} lessons complete</span>
		</div>
	</div>

	<nav class="sidebar-nav">
		{#each phases as phase (phase.index)}
			<PhaseSection {phase} {currentLessonId} />
		{/each}
	</nav>

	<div class="sidebar-footer">
		<span class="credit">Billy Ribeiro</span>
	</div>
</aside>

<style>
	.sidebar {
		width: var(--sidebar-width);
		min-width: var(--sidebar-width);
		height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--bg-secondary);
		border-right: 1px solid var(--border);
		overflow: hidden;
	}

	.sidebar-header {
		padding: var(--space-lg) var(--space-md) var(--space-md);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.app-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--text-bright);
		margin-bottom: var(--space-xs);
	}

	.accent {
		color: var(--accent);
	}

	.progress-summary {
		display: flex;
		align-items: center;
	}

	.progress-text {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-sm);
	}

	.sidebar-footer {
		padding: var(--space-sm) var(--space-md);
		border-top: 1px solid var(--border);
		flex-shrink: 0;
	}

	.credit {
		font-size: 11px;
		color: var(--text-muted);
	}
</style>
