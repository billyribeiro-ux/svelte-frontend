<script lang="ts">
	import type { LessonData } from '$lib/types';
	import LessonShell from '$components/lesson/LessonShell.svelte';

	let { data }: { data: { lesson: LessonData } } = $props();
</script>

<svelte:head>
	<title>{data.lesson.meta.title} | Svelte PE7 Mastery</title>
</svelte:head>

<LessonShell lesson={data.lesson} />
