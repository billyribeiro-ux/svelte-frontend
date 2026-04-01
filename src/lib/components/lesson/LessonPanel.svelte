<script lang="ts">
	import type { Lesson } from '$types/lesson';
	import { lessonState } from '$stores/lesson.svelte';
	import LessonNav from './LessonNav.svelte';
	import Checkpoint from './Checkpoint.svelte';
	import Hint from './Hint.svelte';
	import ConceptTag from './ConceptTag.svelte';
	import CodeBlock from './CodeBlock.svelte';

	interface Props {
		lesson: Lesson;
	}

	let { lesson }: Props = $props();
</script>

<div class="lesson-panel">
	<div class="lesson-header">
		<h2 class="lesson-title">{lesson.title}</h2>
		<p class="lesson-description">{lesson.description}</p>
		<div class="lesson-meta">
			<span class="meta-item">{lesson.estimatedMinutes} min</span>
			<span class="meta-item">{lesson.checkpoints.length} checkpoints</span>
		</div>
	</div>

	<div class="lesson-content">
		{#each lesson.content as block}
			{#if block.type === 'text'}
				<div class="content-text">
					{@html renderMarkdown(block.content)}
				</div>
			{:else if block.type === 'code'}
				<CodeBlock code={block.content} language={block.metadata?.language as string ?? 'svelte'} />
			{:else if block.type === 'checkpoint'}
				{@const checkpoint = lesson.checkpoints.find(cp => cp.id === block.content || cp.description.includes(block.content))}
				{#if checkpoint}
					<Checkpoint
						{checkpoint}
						passed={lessonState.checkpointsCompleted.has(checkpoint.id)}
						hints={lessonState.getRevealedHints(checkpoint.id)}
						onrevealhint={() => lessonState.revealNextHint(checkpoint.id)}
					/>
				{/if}
			{:else if block.type === 'concept-callout'}
				<ConceptTag conceptId={block.content} />
			{:else if block.type === 'xray-prompt'}
				<div class="xray-callout">
					<span class="xray-icon">&#9672;</span>
					{@html renderMarkdown(block.content)}
				</div>
			{:else if block.type === 'hint'}
				<Hint text={block.content} />
			{/if}
		{/each}
	</div>

	<LessonNav {lesson} />
</div>

<script lang="ts" module>
	function renderMarkdown(text: string): string {
		// Simple markdown rendering — handles basic formatting
		return text
			.replace(/^### (.+)$/gm, '<h4>$1</h4>')
			.replace(/^## (.+)$/gm, '<h3>$1</h3>')
			.replace(/^# (.+)$/gm, '<h2>$1</h2>')
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/`(.+?)`/g, '<code>$1</code>')
			.replace(/\n\n/g, '</p><p>')
			.replace(/^(.+)$/gm, (match) => {
				if (match.startsWith('<')) return match;
				return match;
			})
			.trim();
	}
</script>

<style>
	.lesson-panel {
		display: flex;
		flex-direction: column;
		block-size: 100%;
		overflow-y: auto;
	}

	.lesson-header {
		padding: var(--sf-space-5);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.lesson-title {
		font-size: var(--sf-font-size-xl);
		font-weight: 600;
		color: var(--sf-text-0);
		margin-block-end: var(--sf-space-2);
	}

	.lesson-description {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
		margin-block-end: var(--sf-space-3);
	}

	.lesson-meta {
		display: flex;
		gap: var(--sf-space-3);
	}

	.meta-item {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
		padding: var(--sf-space-1) var(--sf-space-2);
		background: var(--sf-bg-3);
		border-radius: var(--sf-radius-sm);
	}

	.lesson-content {
		flex: 1;
		padding: var(--sf-space-4) var(--sf-space-5);

		:global(h2),
		:global(h3),
		:global(h4) {
			margin-block: var(--sf-space-4) var(--sf-space-2);
			color: var(--sf-text-0);
		}

		:global(p) {
			margin-block-end: var(--sf-space-3);
			color: var(--sf-text-1);
			line-height: 1.7;
		}

		:global(strong) {
			color: var(--sf-text-0);
			font-weight: 600;
		}

		:global(code) {
			font-family: var(--sf-font-mono);
			background: var(--sf-bg-3);
			padding: 0.15em 0.35em;
			border-radius: var(--sf-radius-sm);
			font-size: 0.9em;
			color: var(--sf-accent);
		}
	}

	.content-text {
		margin-block-end: var(--sf-space-3);
	}

	.xray-callout {
		display: flex;
		gap: var(--sf-space-3);
		padding: var(--sf-space-4);
		margin-block: var(--sf-space-3);
		background: oklch(0.78 0.18 75 / 0.08);
		border-inline-start: 3px solid var(--sf-warning);
		border-radius: var(--sf-radius-md);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
	}

	.xray-icon {
		flex-shrink: 0;
		font-size: var(--sf-font-size-lg);
		color: var(--sf-warning);
	}
</style>
