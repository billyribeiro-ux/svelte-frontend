<script lang="ts">
	import type { Phase } from '$lib/types';
	import { getCompletedCount } from '$lib/stores/progress.svelte';
	import { toggleTheme, getTheme } from '$lib/stores/theme.svelte';
	import PhaseSection from './PhaseSection.svelte';
	import SearchBox from './SearchBox.svelte';

	let {
		phases,
		currentLessonId
	}: {
		phases: Phase[];
		currentLessonId: string | null;
	} = $props();

	const totalLessons = $derived(
		phases.reduce((sum, p) => sum + p.modules.reduce((s, m) => s + m.lessonCount, 0), 0)
	);
	const completed = $derived(getCompletedCount());
	const currentTheme = $derived(getTheme());

	let searchBox: SearchBox | undefined = $state(undefined);

	export function focusSearch() {
		searchBox?.focusInput();
	}
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<div class="sidebar-header-top">
			<h1 class="app-title">
				<span class="accent">Svelte</span> PE7 Mastery
			</h1>
			<button
				class="theme-toggle"
				onclick={toggleTheme}
				aria-label={currentTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
				title={currentTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
			>
				{#if currentTheme === 'dark'}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
						<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					</svg>
				{:else}
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				{/if}
			</button>
		</div>
		<div class="progress-summary">
			<span class="progress-text">{completed}/{totalLessons} lessons complete</span>
		</div>
	</div>

	<SearchBox bind:this={searchBox} {currentLessonId} />

	<nav class="sidebar-nav">
		{#each phases as phase (phase.index)}
			<PhaseSection {phase} {currentLessonId} />
		{/each}
	</nav>

	<div class="sidebar-footer">
		<span class="credit">Billy Ribeiro</span>
	</div>
</aside>

<style>
	.sidebar {
		width: var(--sidebar-width);
		min-width: var(--sidebar-width);
		height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--bg-secondary);
		border-right: 1px solid var(--border);
		overflow: hidden;
	}

	.sidebar-header {
		padding: var(--space-lg) var(--space-md) var(--space-md);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}

	.sidebar-header-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-xs);
	}

	.app-title {
		font-size: 15px;
		font-weight: 700;
		color: var(--text-bright);
	}

	.accent {
		color: var(--accent);
	}

	.theme-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border-radius: var(--radius-md);
		color: var(--text-secondary);
		background: transparent;
		border: none;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		flex-shrink: 0;
	}

	.theme-toggle:hover {
		background: var(--bg-hover);
		color: var(--text-bright);
	}

	.progress-summary {
		display: flex;
		align-items: center;
	}

	.progress-text {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-sm);
	}

	.sidebar-footer {
		padding: var(--space-sm) var(--space-md);
		border-top: 1px solid var(--border);
		flex-shrink: 0;
	}

	.credit {
		font-size: 11px;
		color: var(--text-muted);
	}
</style>
