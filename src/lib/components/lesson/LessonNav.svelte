<script lang="ts">
	import type { Lesson } from '$types/lesson';
	import { lessonState } from '$stores/lesson.svelte';
	import { getNextLesson, getPrevLesson } from '$lessons/registry';
	import { goto } from '$app/navigation';
	import { formatPercentage } from '$utils/format';
	import Icon from '$components/ui/Icon.svelte';

	interface Props {
		lesson: Lesson;
		trackSlug?: string;
		moduleSlug?: string;
		onsolve?: () => void;
	}

	let { lesson, trackSlug, moduleSlug, onsolve }: Props = $props();

	let track = $derived(trackSlug ?? lesson.trackId);
	let module_ = $derived(moduleSlug ?? lesson.moduleId);

	let nextLesson = $derived(getNextLesson(track, module_, lesson.slug));
	let prevLesson = $derived(getPrevLesson(track, module_, lesson.slug));

	let canGoNext = $derived(lessonState.isComplete || !lesson.checkpoints.length);
	let hasSolution = $derived(lesson.solutionFiles.length > 0);
	let showSolveConfirm = $state(false);

	function goToLesson(slug: string) {
		goto(`/learn/${track}/${module_}/${slug}`);
	}

	function handleSolve() {
		if (!showSolveConfirm) {
			showSolveConfirm = true;
			return;
		}
		onsolve?.();
		showSolveConfirm = false;
	}
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

	{#if hasSolution && !lessonState.isComplete}
		<div class="solve-section">
			{#if showSolveConfirm}
				<div class="solve-confirm">
					<span class="solve-warning">This will replace your code with the solution. Continue?</span>
					<div class="solve-actions">
						<button class="solve-btn solve-btn--cancel" onclick={() => showSolveConfirm = false}>Cancel</button>
						<button class="solve-btn solve-btn--confirm" onclick={handleSolve}>
							<Icon icon="ph:lightbulb-filament" size={14} />
							Show Solution
						</button>
					</div>
				</div>
			{:else}
				<button class="solve-btn solve-btn--reveal" onclick={handleSolve}>
					<Icon icon="ph:lightbulb" size={14} />
					Stuck? Show Solution
				</button>
			{/if}
		</div>
	{/if}

	<div class="nav-buttons">
		{#if prevLesson}
			<button class="nav-btn prev-btn" onclick={() => goToLesson(prevLesson!.slug)}>
				<Icon icon="ph:arrow-left" size={14} />
				<span class="nav-btn-text">{prevLesson.title}</span>
			</button>
		{:else}
			<div></div>
		{/if}

		{#if nextLesson}
			<button
				class="nav-btn next-btn"
				onclick={() => goToLesson(nextLesson!.slug)}
				disabled={!canGoNext}
				title={canGoNext ? '' : 'Complete all checkpoints to proceed'}
			>
				<span class="nav-btn-text">{nextLesson.title}</span>
				<Icon icon="ph:arrow-right" size={14} />
			</button>
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
		margin-block-end: var(--sf-space-3);
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
		animation: sf-bounce-in 500ms var(--sf-ease-spring);
	}

	.solve-section {
		margin-block-end: var(--sf-space-3);
		padding-block-start: var(--sf-space-2);
	}

	.solve-confirm {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-2);
		padding: var(--sf-space-3);
		background: oklch(0.78 0.18 75 / 0.08);
		border-inline-start: 3px solid var(--sf-warning);
		border-radius: var(--sf-radius-md);
		animation: sf-fade-in 200ms var(--sf-ease-out);
	}

	.solve-warning {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-warning);
		line-height: 1.5;
	}

	.solve-actions {
		display: flex;
		gap: var(--sf-space-2);
	}

	.solve-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-1);
		padding: var(--sf-space-1) var(--sf-space-3);
		font-size: var(--sf-font-size-xs);
		border-radius: var(--sf-radius-sm);
		transition: all var(--sf-transition-fast);

		&:active:not(:disabled) {
			transform: scale(0.97);
		}
	}

	.solve-btn--reveal {
		color: var(--sf-warning);
		background: oklch(0.78 0.18 75 / 0.08);
		border: 1px solid oklch(0.78 0.18 75 / 0.2);
		inline-size: 100%;
		justify-content: center;

		&:hover {
			background: oklch(0.78 0.18 75 / 0.15);
			border-color: var(--sf-warning);
		}
	}

	.solve-btn--cancel {
		color: var(--sf-text-2);
		background: var(--sf-bg-3);

		&:hover {
			background: var(--sf-bg-4);
			color: var(--sf-text-0);
		}
	}

	.solve-btn--confirm {
		color: var(--sf-accent-text);
		background: var(--sf-warning);
		font-weight: 600;

		&:hover {
			filter: brightness(1.1);
		}
	}

	.nav-buttons {
		display: flex;
		justify-content: space-between;
		gap: var(--sf-space-2);
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: var(--sf-space-1);
		padding: var(--sf-space-2) var(--sf-space-3);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-1);
		border-radius: var(--sf-radius-md);
		transition: all var(--sf-transition-fast);
		max-inline-size: 45%;

		&:hover:not(:disabled) {
			background: var(--sf-bg-3);
			color: var(--sf-accent);
		}

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}
	}

	.nav-btn-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.next-btn {
		margin-inline-start: auto;
	}
</style>
