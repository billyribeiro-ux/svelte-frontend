<script lang="ts">
	import type { LessonData } from '$lib/types';
	import LessonShell from '$components/lesson/LessonShell.svelte';
	import SEOHead from '$lib/components/seo/SEOHead.svelte';

	let { data }: { data: { lesson: LessonData } } = $props();

	const seoDescription = $derived(
		data.lesson.description.length > 160
			? data.lesson.description.slice(0, 157) + '...'
			: data.lesson.description
	);
</script>

<SEOHead title={data.lesson.meta.title} description={seoDescription} />

<LessonShell lesson={data.lesson} />
