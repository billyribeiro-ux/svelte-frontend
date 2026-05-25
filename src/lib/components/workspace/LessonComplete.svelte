<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { lessonState } from '$stores/lesson.svelte';

	interface Props {
		lessonTitle: string;
		onnext?: () => void;
		onreplay?: () => void;
	}

	let { lessonTitle, onnext, onreplay }: Props = $props();

	let timeSpent = $derived(formatTime(lessonState.getTimeSpent()));

	function formatTime(seconds: number): string {
		if (seconds < 60) return `${seconds}s`;
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}m ${secs}s`;
	}
</script>

{#if lessonState.isComplete}
	<div class="completion-banner" role="status" aria-live="polite" transition:scale={{ start: 0.9, duration: 300 }}>
		<div class="completion-icon" aria-hidden="true">
			<svg width="32" height="32" viewBox="0 0 24 24" fill="none">
				<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
				<path d="M8 12l2.5 2.5L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
			</svg>
		</div>
		<div class="completion-content">
			<h3 class="completion-title">Lesson Complete!</h3>
			<p class="completion-subtitle">{lessonTitle}</p>
			<div class="completion-stats">
				<span class="stat">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
						<path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
					{timeSpent}
				</span>
				<span class="stat">
					<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					{lessonState.checkpointsCompleted.size} checkpoints
				</span>
			</div>
		</div>
		<div class="completion-actions">
			{#if onnext}
				<button class="btn-next" onclick={onnext}>Next Lesson</button>
			{/if}
			{#if onreplay}
				<button class="btn-replay" onclick={onreplay}>Replay</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.completion-banner {
		display: flex;
		align-items: center;
		gap: var(--sf-space-4);
		padding: var(--sf-space-4) var(--sf-space-5);
		background: oklch(0.25 0.08 150 / 0.4);
		border: 1px solid oklch(0.6 0.2 150 / 0.4);
		border-radius: var(--sf-radius-lg);
		margin: var(--sf-space-3);
	}

	.completion-icon {
		flex-shrink: 0;
		color: oklch(0.7 0.2 150);
	}

	.completion-content {
		flex: 1;
		min-width: 0;
	}

	.completion-title {
		font-size: var(--sf-font-size-md);
		font-weight: 700;
		color: oklch(0.85 0.15 150);
		margin: 0;
	}

	.completion-subtitle {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
		margin: 2px 0 0;
	}

	.completion-stats {
		display: flex;
		gap: var(--sf-space-3);
		margin-block-start: var(--sf-space-2);
	}

	.stat {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}

	.completion-actions {
		display: flex;
		gap: var(--sf-space-2);
		flex-shrink: 0;
	}

	.btn-next {
		padding: var(--sf-space-2) var(--sf-space-4);
		background: oklch(0.6 0.2 150);
		color: oklch(0.1 0 0);
		font-size: var(--sf-font-size-sm);
		font-weight: 600;
		border-radius: var(--sf-radius-md);
		transition: background var(--sf-transition-fast);

		&:hover {
			background: oklch(0.65 0.22 150);
		}
	}

	.btn-replay {
		padding: var(--sf-space-2) var(--sf-space-4);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-md);
		transition: all var(--sf-transition-fast);

		&:hover {
			color: var(--sf-text-0);
			border-color: var(--sf-bg-4);
		}
	}

	@media (max-width: 768px) {
		.completion-banner {
			flex-direction: column;
			text-align: center;
		}

		.completion-actions {
			width: 100%;
			justify-content: center;
		}
	}
</style>
