<script lang="ts">
	import type { LessonMeta } from '$lib/types';
	import { course } from '$data/curriculum';
	import { isComplete } from '$lib/stores/progress.svelte';

	let {
		currentLessonId
	}: {
		currentLessonId: string | null;
	} = $props();

	interface FlatLesson {
		lesson: LessonMeta;
		phaseIndex: number;
		phaseTitle: string;
		moduleTitle: string;
	}

	const allLessons: FlatLesson[] = course.phases.flatMap((phase) =>
		phase.modules.flatMap((mod) =>
			mod.lessons.map((lesson) => ({
				lesson,
				phaseIndex: phase.index,
				phaseTitle: phase.title,
				moduleTitle: mod.title
			}))
		)
	);

	let query = $state('');
	let inputEl: HTMLInputElement | undefined = $state(undefined);

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return [];
		return allLessons.filter(
			(entry) =>
				entry.lesson.title.toLowerCase().includes(q) ||
				entry.moduleTitle.toLowerCase().includes(q)
		);
	});

	const isSearching = $derived(query.trim().length > 0);

	const groupedResults = $derived.by(() => {
		const groups: Map<number, { phaseTitle: string; lessons: FlatLesson[] }> = new Map();
		for (const entry of filtered) {
			let group = groups.get(entry.phaseIndex);
			if (!group) {
				group = { phaseTitle: `Phase ${entry.phaseIndex}: ${entry.phaseTitle}`, lessons: [] };
				groups.set(entry.phaseIndex, group);
			}
			group.lessons.push(entry);
		}
		return groups;
	});

	export function focusInput() {
		inputEl?.focus();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			query = '';
			inputEl?.blur();
		}
	}
</script>

<div class="search-box">
	<input
		bind:this={inputEl}
		bind:value={query}
		type="text"
		class="search-input"
		placeholder="Search lessons... (Ctrl+K)"
		onkeydown={handleKeydown}
	/>
</div>

{#if isSearching}
	<div class="search-results">
		{#if filtered.length === 0}
			<div class="no-results">No lessons found</div>
		{:else}
			{#each [...groupedResults] as [, group] (group.phaseTitle)}
				<div class="result-group">
					<div class="result-phase-header">{group.phaseTitle}</div>
					{#each group.lessons as entry (entry.lesson.id)}
						{@const href = `/course/${entry.lesson.phase}/${entry.lesson.module}/${entry.lesson.lessonIndex}`}
						{@const isActive = currentLessonId === entry.lesson.id}
						{@const completed = isComplete(entry.lesson.id)}
						<a
							{href}
							class={['result-link', isActive && 'active']}
							aria-current={isActive ? 'page' : undefined}
						>
							<span class="result-number">{entry.lesson.module}.{entry.lesson.lessonIndex}</span>
							<span class="result-title">{entry.lesson.title}</span>
							{#if completed}
								<span class="checkmark">&#x2714;</span>
							{/if}
						</a>
					{/each}
				</div>
			{/each}
		{/if}
	</div>
{/if}

<style>
	.search-box {
		padding: var(--space-sm) var(--space-md);
	}

	.search-input {
		width: 100%;
		padding: var(--space-xs) var(--space-sm);
		font-size: 13px;
		font-family: var(--font-ui);
		color: var(--text-primary);
		background: var(--bg-tertiary);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		outline: none;
		transition: border-color var(--transition-fast);
	}

	.search-input::placeholder {
		color: var(--text-muted);
	}

	.search-input:focus {
		border-color: var(--border-focus);
	}

	.search-results {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-xs) var(--space-sm);
	}

	.no-results {
		padding: var(--space-md);
		text-align: center;
		font-size: 13px;
		color: var(--text-muted);
	}

	.result-group {
		margin-bottom: var(--space-sm);
	}

	.result-phase-header {
		padding: var(--space-xs) var(--space-sm);
		font-size: 11px;
		font-weight: 600;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.result-link {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-xs) var(--space-sm) var(--space-xs) var(--space-lg);
		font-size: 13px;
		line-height: 1.4;
		color: var(--text-secondary);
		text-decoration: none;
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast), color var(--transition-fast);
	}

	.result-link:hover {
		background: var(--bg-hover);
		color: var(--text-primary);
		text-decoration: none;
	}

	.result-link.active {
		background: var(--bg-active);
		color: var(--text-bright);
	}

	.result-number {
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-muted);
		min-width: 28px;
	}

	.active .result-number {
		color: var(--text-secondary);
	}

	.result-title {
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
