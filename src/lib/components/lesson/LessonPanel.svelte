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
		onvalidate?: (checkpointId: string) => { passed: boolean; message: string } | undefined;
		trackSlug?: string;
		moduleSlug?: string;
	}

	let { lesson, onvalidate, trackSlug, moduleSlug }: Props = $props();
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
						onvalidate={() => onvalidate?.(checkpoint.id)}
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

	<LessonNav {lesson} {trackSlug} {moduleSlug} />
</div>

<script lang="ts" module>
	function escapeHtml(text: string): string {
		return text
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
	}

	function renderMarkdown(text: string): string {
		const lines = text.split('\n');
		const result: string[] = [];
		let inCodeBlock = false;
		let codeBlockLang = '';
		let codeLines: string[] = [];
		let inList = false;

		for (const line of lines) {
			// Code blocks
			if (line.trim().startsWith('```')) {
				if (inCodeBlock) {
					result.push(`<pre class="md-code-block"><code class="lang-${escapeHtml(codeBlockLang)}">${escapeHtml(codeLines.join('\n'))}</code></pre>`);
					codeLines = [];
					inCodeBlock = false;
					codeBlockLang = '';
				} else {
					if (inList) { result.push('</ul>'); inList = false; }
					inCodeBlock = true;
					codeBlockLang = line.trim().slice(3).trim() || 'text';
				}
				continue;
			}

			if (inCodeBlock) {
				codeLines.push(line);
				continue;
			}

			const trimmed = line.trim();

			// Empty line
			if (!trimmed) {
				if (inList) { result.push('</ul>'); inList = false; }
				continue;
			}

			// Headings
			if (trimmed.startsWith('### ')) {
				if (inList) { result.push('</ul>'); inList = false; }
				result.push(`<h4>${inlineFormat(trimmed.slice(4))}</h4>`);
				continue;
			}
			if (trimmed.startsWith('## ')) {
				if (inList) { result.push('</ul>'); inList = false; }
				result.push(`<h3>${inlineFormat(trimmed.slice(3))}</h3>`);
				continue;
			}
			if (trimmed.startsWith('# ')) {
				if (inList) { result.push('</ul>'); inList = false; }
				result.push(`<h2>${inlineFormat(trimmed.slice(2))}</h2>`);
				continue;
			}

			// List items
			if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
				if (!inList) { result.push('<ul>'); inList = true; }
				result.push(`<li>${inlineFormat(trimmed.slice(2))}</li>`);
				continue;
			}

			// Numbered list
			const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
			if (numMatch) {
				if (!inList) { result.push('<ol>'); inList = true; }
				result.push(`<li>${inlineFormat(numMatch[2]!)}</li>`);
				continue;
			}

			// Paragraph
			if (inList) { result.push('</ul>'); inList = false; }
			result.push(`<p>${inlineFormat(trimmed)}</p>`);
		}

		if (inList) result.push('</ul>');
		if (inCodeBlock) {
			result.push(`<pre class="md-code-block"><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
		}

		return result.join('\n');
	}

	function inlineFormat(text: string): string {
		return text
			.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
			.replace(/\*(.+?)\*/g, '<em>$1</em>')
			.replace(/`(.+?)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)
			.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
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
