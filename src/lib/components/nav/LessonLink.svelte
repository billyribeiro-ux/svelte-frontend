<script lang="ts">
	import type { LessonMeta } from '$lib/types';

	let {
		lesson,
		isActive,
		isCompleted
	}: {
		lesson: LessonMeta;
		isActive: boolean;
		isCompleted: boolean;
	} = $props();

	const href = $derived(`/course/${lesson.phase}/${lesson.module}/${lesson.lessonIndex}`);
	const label = $derived(`${lesson.module}.${lesson.lessonIndex}`);
</script>

<a
	{href}
	class="lesson-link"
	class:active={isActive}
	aria-current={isActive ? 'page' : undefined}
>
	<span class="lesson-number">{label}</span>
	<span class="lesson-title">{lesson.title}</span>
	{#if isCompleted}
		<span class="checkmark">&#x2714;</span>
	{/if}
</a>

<style>
	.lesson-link {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-sm) var(--space-xs) var(--space-xl);
		font-size: 13px;
		line-height: 1.4;
		color: var(--text-secondary);
		text-decoration: none;
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast), color var(--transition-fast);
	}

	.lesson-link:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
		text-decoration: none;
	}

	.lesson-link.active {
		background: var(--bg-active);
		color: var(--text-bright);
	}

	.lesson-number {
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-muted);
		min-width: 28px;
	}

	.active .lesson-number {
		color: var(--text-secondary);
	}

	.lesson-title {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.checkmark {
		flex-shrink: 0;
		color: var(--success);
		font-size: 12px;
	}
</style>
