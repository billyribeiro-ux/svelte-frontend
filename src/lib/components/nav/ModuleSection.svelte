<script lang="ts">
	import type { Module } from '$lib/types';
	import { isComplete } from '$lib/stores/progress.svelte';
	import LessonLink from './LessonLink.svelte';

	let {
		module,
		phaseIndex,
		currentLessonId
	}: {
		module: Module;
		phaseIndex: number;
		currentLessonId: string | null;
	} = $props();

	const hasActiveLessonInModule = $derived(
		currentLessonId !== null && module.lessons.some((l) => l.id === currentLessonId)
	);

	let expanded = $state(false);

	// Auto-expand if current lesson is in this module
	$effect(() => {
		if (hasActiveLessonInModule) {
			expanded = true;
		}
	});

	const completedCount = $derived(
		module.lessons.filter((l) => isComplete(l.id)).length
	);
</script>

<div class="module-section">
	<button class="module-header" onclick={() => (expanded = !expanded)}>
		<span class="toggle">{expanded ? '\u25BC' : '\u25B6'}</span>
		<span class="module-label">
			<span class="module-number">{module.index}.</span>
			<span class="module-title">{module.title}</span>
		</span>
		<span class="module-count">{completedCount}/{module.lessonCount}</span>
	</button>

	{#if expanded}
		<div class="lessons">
			{#each module.lessons as lesson (lesson.id)}
				<LessonLink
					{lesson}
					isActive={currentLessonId === lesson.id}
					isCompleted={isComplete(lesson.id)}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.module-section {
		margin-bottom: var(--space-xs);
	}

	.module-header {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-xs) var(--space-sm) var(--space-xs) var(--space-md);
		font-size: 13px;
		color: var(--text-primary);
		text-align: left;
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast);
	}

	.module-header:hover {
		background: var(--bg-hover);
	}

	.toggle {
		flex-shrink: 0;
		font-size: 10px;
		color: var(--text-muted);
		width: 12px;
	}

	.module-label {
		flex: 1;
		display: flex;
		gap: var(--space-xs);
		overflow: hidden;
	}

	.module-number {
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-muted);
	}

	.module-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-weight: 500;
	}

	.module-count {
		flex-shrink: 0;
		font-size: 11px;
		font-family: var(--font-mono);
		color: var(--text-muted);
	}

	.lessons {
		padding: var(--space-xs) 0;
	}
</style>
