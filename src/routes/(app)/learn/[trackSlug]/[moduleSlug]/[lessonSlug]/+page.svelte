<script lang="ts">
	import { page } from '$app/state';
	import Workspace from '$components/workspace/Workspace.svelte';

	const data = $derived(page.data);
</script>

<svelte:head>
	<title>{data.lesson?.title ?? 'Lesson'} — SvelteForge</title>
</svelte:head>

{#if data.lesson}
	<Workspace lesson={data.lesson} progress={data.progress} />
{/if}

<style>
	:global(.content:has(> :first-child.workspace)) {
		padding: 0 !important;
		overflow: hidden !important;
	}
</style>
