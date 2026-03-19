<script lang="ts">
	import '../app.css';
	import Sidebar from '$components/nav/Sidebar.svelte';
	import { course } from '$data/curriculum';
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();

	const currentLessonId = $derived.by(() => {
		const params = page.params;
		if (params?.module !== undefined && params?.lesson !== undefined) {
			return `${params.module}-${params.lesson}`;
		}
		return null;
	});
</script>

<div class="app-layout">
	<Sidebar phases={course.phases} {currentLessonId} />
	<main class="main-content">
		{@render children()}
	</main>
</div>

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
</style>
