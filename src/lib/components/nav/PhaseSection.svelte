<script lang="ts">
	import type { Phase } from '$lib/types';
	import { isComplete } from '$lib/stores/progress.svelte';
	import ModuleSection from './ModuleSection.svelte';

	let {
		phase,
		currentLessonId
	}: {
		phase: Phase;
		currentLessonId: string | null;
	} = $props();

	const allLessons = $derived(phase.modules.flatMap((m) => m.lessons));
	const totalCount = $derived(allLessons.length);
	const completedCount = $derived(allLessons.filter((l) => isComplete(l.id)).length);
	const progressPercent = $derived(totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

	const hasActiveLessonInPhase = $derived(
		currentLessonId !== null && allLessons.some((l) => l.id === currentLessonId)
	);

	let expanded = $state(false);

	$effect(() => {
		if (hasActiveLessonInPhase) {
			expanded = true;
		}
	});
</script>

<div class="phase-section">
	<button class="phase-header" onclick={() => (expanded = !expanded)}>
		<div class="phase-info">
			<span class="toggle">{expanded ? '\u25BC' : '\u25B6'}</span>
			<span class="phase-number">Phase {phase.index}</span>
			<span class="phase-title">{phase.title}</span>
		</div>
		<div class="progress-bar-container">
			<div class="progress-bar" style="width: {progressPercent}%"></div>
		</div>
	</button>

	{#if expanded}
		<div class="phase-content">
			{#each phase.modules as module (module.index)}
				<ModuleSection
					{module}
					phaseIndex={phase.index}
					{currentLessonId}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.phase-section {
		border-left: 3px solid var(--accent);
		margin-bottom: var(--space-sm);
		border-radius: var(--radius-sm);
	}

	.phase-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		text-align: left;
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast);
	}

	.phase-header:hover {
		background: var(--bg-hover);
	}

	.phase-info {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.toggle {
		font-size: 10px;
		color: var(--text-muted);
		width: 12px;
		flex-shrink: 0;
	}

	.phase-number {
		font-size: 11px;
		font-weight: 600;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		flex-shrink: 0;
	}

	.phase-title {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-bright);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.progress-bar-container {
		height: 3px;
		background: var(--bg-tertiary);
		border-radius: 2px;
		overflow: hidden;
		margin-left: 20px;
	}

	.progress-bar {
		height: 100%;
		background: var(--success);
		border-radius: 2px;
		transition: width var(--transition-normal);
	}

	.phase-content {
		padding: var(--space-xs) 0 var(--space-xs) var(--space-sm);
	}
</style>
