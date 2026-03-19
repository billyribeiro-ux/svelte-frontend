<script lang="ts">
	let {
		title,
		objectives,
		description,
		lessonId,
		onmarkComplete,
		isCompleted
	}: {
		title: string;
		objectives: string[];
		description: string;
		lessonId: string;
		onmarkComplete: () => void;
		isCompleted: boolean;
	} = $props();
</script>

<div class="lesson-content">
	<h1 class="lesson-title">{title}</h1>

	<section class="objectives">
		<h2>Objectives</h2>
		<ul class="objective-list">
			{#each objectives as objective}
				<li class="objective-item">
					<span class="check-icon">{isCompleted ? '\u2714' : '\u25CB'}</span>
					<span>{objective}</span>
				</li>
			{/each}
		</ul>
	</section>

	<section class="description">
		<h2>Lesson</h2>
		<div class="description-text">{description}</div>
	</section>

	<div class="actions">
		<button
			class="mark-complete-btn"
			class:completed={isCompleted}
			onclick={onmarkComplete}
			disabled={isCompleted}
		>
			{isCompleted ? 'Completed \u2714' : 'Mark Complete'}
		</button>
	</div>
</div>

<style>
	.lesson-content {
		height: 100%;
		overflow-y: auto;
		padding: var(--space-xl);
		color: var(--text-primary);
	}

	.lesson-title {
		font-size: 24px;
		font-weight: 700;
		color: var(--text-bright);
		margin-bottom: var(--space-xl);
	}

	section {
		margin-bottom: var(--space-xl);
	}

	h2 {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: var(--space-md);
	}

	.objective-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.objective-item {
		display: flex;
		align-items: flex-start;
		gap: var(--space-sm);
		font-size: 14px;
		line-height: 1.5;
	}

	.check-icon {
		flex-shrink: 0;
		color: var(--success);
		font-size: 14px;
		margin-top: 1px;
	}

	.description-text {
		font-size: 14px;
		line-height: 1.7;
		color: var(--text-primary);
		white-space: pre-wrap;
	}

	.actions {
		padding-top: var(--space-md);
	}

	.mark-complete-btn {
		padding: var(--space-sm) var(--space-lg);
		font-size: 14px;
		font-weight: 600;
		border-radius: var(--radius-md);
		background: var(--accent);
		color: white;
		transition: background var(--transition-fast);
	}

	.mark-complete-btn:hover:not(:disabled) {
		background: var(--accent-hover);
	}

	.mark-complete-btn.completed {
		background: var(--success-soft);
		color: var(--success);
		cursor: default;
	}
</style>
