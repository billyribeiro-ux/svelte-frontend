<script lang="ts">
	import '../app.css';
	import Sidebar from '$components/nav/Sidebar.svelte';
	import KeyboardShortcuts from '$components/KeyboardShortcuts.svelte';
	import { course } from '$data/curriculum';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { getSidebarOpen, toggleSidebar, closeSidebar } from '$lib/stores/ui.svelte';
	import { markComplete } from '$lib/stores/progress.svelte';
	import { getNextLesson, getPrevLesson } from '$utils/navigation';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const currentLessonId = $derived.by(() => {
		const params = page.params;
		if (params?.module !== undefined && params?.lesson !== undefined) {
			return `${params.module}-${params.lesson}`;
		}
		return null;
	});

	// Auto-close sidebar on route navigation (mobile)
	const currentPath = $derived(page.url?.pathname ?? '');
	let previousPath = $state('');

	$effect(() => {
		if (previousPath && currentPath !== previousPath) {
			closeSidebar();
		}
		previousPath = currentPath;
	});

	const sidebarOpen = $derived(getSidebarOpen());

	let sidebar: Sidebar | undefined = $state(undefined);

	function handleGlobalKeydown(e: KeyboardEvent) {
		// Ctrl+K / Cmd+K → Focus search
		if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
			e.preventDefault();
			sidebar?.focusSearch();
			return;
		}

		// Skip navigation shortcuts when in input/textarea
		const target = e.target as HTMLElement;
		const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
		if (isInput) return;

		// Alt+ArrowLeft → Previous lesson
		if (e.altKey && e.key === 'ArrowLeft' && currentLessonId) {
			e.preventDefault();
			const prev = getPrevLesson(currentLessonId);
			if (prev) goto(`/course/${prev.phase}/${prev.module}/${prev.lessonIndex}`);
			return;
		}

		// Alt+ArrowRight → Next lesson
		if (e.altKey && e.key === 'ArrowRight' && currentLessonId) {
			e.preventDefault();
			const next = getNextLesson(currentLessonId);
			if (next) goto(`/course/${next.phase}/${next.module}/${next.lessonIndex}`);
			return;
		}

		// Ctrl+Enter → Mark lesson complete
		if (e.ctrlKey && e.key === 'Enter' && currentLessonId) {
			e.preventDefault();
			markComplete(currentLessonId);
			return;
		}
	}
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="app-layout">
	<button
		class="hamburger-btn"
		onclick={toggleSidebar}
		aria-label="Toggle sidebar"
	>
		{#if sidebarOpen}
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
				<path d="M5 5L15 15M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
			</svg>
		{:else}
			<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
				<path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
			</svg>
		{/if}
	</button>

	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={['sidebar-backdrop', sidebarOpen ? 'visible' : ''].filter(Boolean).join(' ')}
		onclick={closeSidebar}
	></div>

	<div class={['sidebar-drawer', sidebarOpen ? 'sidebar-drawer-open' : ''].filter(Boolean).join(' ')}>
		<Sidebar bind:this={sidebar} phases={course.phases} {currentLessonId} />
	</div>

	<main class="main-content">
		{@render children()}
	</main>
</div>

<KeyboardShortcuts />

<style>
	.app-layout {
		display: flex;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	.main-content {
		flex: 1;
		min-width: 0;
		height: 100%;
		overflow: hidden;
	}

	.sidebar-drawer {
		display: contents;
	}

	@media (max-width: 768px) {
		.sidebar-drawer {
			display: block;
			position: fixed;
			top: 0;
			left: 0;
			width: var(--sidebar-width);
			height: 100%;
			z-index: 50;
			transform: translateX(-100%);
			transition: transform 0.25s ease;
		}

		.sidebar-drawer-open {
			transform: translateX(0);
		}

		.main-content {
			width: 100%;
		}
	}
</style>
