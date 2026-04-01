<script lang="ts">
	import { page } from '$app/state';
	import Workspace from '$components/workspace/Workspace.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { buildLearningResourceSchema, buildBreadcrumbSchema } from '$utils/seo';

	const data = $derived(page.data);
	const lesson = $derived(data.lesson);
	const trackSlug = $derived(page.params.trackSlug ?? '');
	const moduleSlug = $derived(page.params.moduleSlug ?? '');

	function formatSlug(slug: string): string {
		return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
	}
</script>

<SEOHead seo={{
	title: lesson?.title ?? 'Lesson',
	description: lesson?.description ?? 'Interactive Svelte 5 lesson on SvelteForge.',
	jsonLd: lesson ? [
		buildLearningResourceSchema(
			`/learn/${trackSlug}/${moduleSlug}/${lesson.slug}`,
			lesson.title,
			lesson.description,
			lesson.concepts
		),
		buildBreadcrumbSchema([
			{ name: 'Home', url: '/' },
			{ name: 'Learn', url: '/learn' },
			{ name: formatSlug(trackSlug), url: `/learn/${trackSlug}` },
			{ name: formatSlug(moduleSlug), url: `/learn/${trackSlug}/${moduleSlug}` },
			{ name: lesson.title, url: `/learn/${trackSlug}/${moduleSlug}/${lesson.slug}` }
		])
	] : undefined
}} />

{#if data.lesson}
	<Workspace lesson={data.lesson} progress={data.progress} />
{/if}

<style>
	:global(.content:has(> :first-child.workspace)) {
		padding: 0 !important;
		overflow: hidden !important;
	}
</style>
