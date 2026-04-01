<script lang="ts">
	import type { Lesson } from '$types/lesson';
	import { lessonState } from '$stores/lesson.svelte';
	import { formatPercentage } from '$utils/format';

	interface Props {
		lesson: Lesson;
	}

	let { lesson }: Props = $props();
</script>

<nav class="lesson-nav">
	<div class="progress-bar">
		<div class="progress-fill" style="inline-size: {formatPercentage(lessonState.progress)}"></div>
	</div>
	<div class="nav-info">
		<span class="progress-text">
			{lessonState.checkpointsCompleted.size} / {lesson.checkpoints.length} checkpoints
		</span>
		{#if lessonState.isComplete}
			<span class="complete-badge">Complete!</span>
		{/if}
	</div>
</nav>

<style>
	.lesson-nav {
		padding: var(--sf-space-4) var(--sf-space-5);
		border-block-start: 1px solid var(--sf-bg-3);
		flex-shrink: 0;
	}

	.progress-bar {
		block-size: 4px;
		background: var(--sf-bg-3);
		border-radius: var(--sf-radius-full);
		overflow: hidden;
		margin-block-end: var(--sf-space-2);
	}

	.progress-fill {
		block-size: 100%;
		background: var(--sf-accent);
		border-radius: var(--sf-radius-full);
		transition: inline-size var(--sf-transition-slow);
	}

	.nav-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.progress-text {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}

	.complete-badge {
		font-size: var(--sf-font-size-xs);
		font-weight: 600;
		color: var(--sf-success);
		padding: var(--sf-space-1) var(--sf-space-2);
		background: oklch(0.72 0.19 155 / 0.1);
		border-radius: var(--sf-radius-sm);
	}
</style>
