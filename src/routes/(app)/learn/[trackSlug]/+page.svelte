<script lang="ts">
	import Icon from '$components/ui/Icon.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { buildCourseSchema, buildBreadcrumbSchema } from '$utils/seo';

	interface Props {
		data: {
			trackSlug: string;
		};
	}

	let { data }: Props = $props();
	const trackSlug = $derived(data.trackSlug);

	// Placeholder data
	const track = $derived({
		title: formatSlug(trackSlug),
		description: `Comprehensive learning track covering ${formatSlug(trackSlug).toLowerCase()} topics from beginner to advanced.`,
		modules: [
			{
				slug: 'fundamentals',
				title: 'Fundamentals',
				description: 'Core concepts and basic building blocks.',
				lessonCount: 5
			},
			{
				slug: 'intermediate',
				title: 'Intermediate Patterns',
				description: 'Component composition, state management, and advanced reactivity.',
				lessonCount: 6
			},
			{
				slug: 'advanced',
				title: 'Advanced Techniques',
				description: 'Performance optimization, custom stores, and complex patterns.',
				lessonCount: 4
			}
		]
	});

	function formatSlug(slug: string): string {
		return slug
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}
</script>

<SEOHead seo={{
	title: track.title,
	description: track.description,
	jsonLd: [
		buildCourseSchema(`/learn/${trackSlug}`, track.title, track.description),
		buildBreadcrumbSchema([
			{ name: 'Home', url: '/' },
			{ name: 'Learn', url: '/learn' },
			{ name: track.title, url: `/learn/${trackSlug}` }
		])
	]
}} />

<div class="track-page">
	<header class="track-header">
		<a href="/learn" class="back-link">
			<Icon icon="ph:arrow-left" size={16} />
			All Tracks
		</a>
		<h1 class="track-title">{track.title}</h1>
		<p class="track-description">{track.description}</p>
	</header>

	<div class="modules-list">
		{#each track.modules as mod, index}
			<a href="/learn/{trackSlug}/{mod.slug}" class="module-card">
				<div class="module-number">{index + 1}</div>
				<div class="module-info">
					<h2 class="module-title">{mod.title}</h2>
					<p class="module-description">{mod.description}</p>
					<span class="module-meta">
						<Icon icon="ph:file-text" size={14} />
						{mod.lessonCount} lessons
					</span>
				</div>
				<div class="module-arrow">
					<Icon icon="ph:caret-right" size={20} />
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.track-page {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-6);
	}

	.track-header {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-1);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		text-decoration: none;
		transition: color var(--sf-transition-fast);

		&:hover {
			color: var(--sf-accent);
		}
	}

	.track-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
	}

	.track-description {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-2);
		margin: 0;
		max-inline-size: 600px;
	}

	.modules-list {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
	}

	.module-card {
		display: flex;
		align-items: center;
		gap: var(--sf-space-4);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-5);
		text-decoration: none;
		transition: border-color var(--sf-transition-fast), box-shadow var(--sf-transition-fast);

		&:hover {
			border-color: var(--sf-accent);
			box-shadow: var(--sf-shadow-sm);
		}
	}

	.module-number {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--sf-radius-full);
		background: var(--sf-accent-subtle);
		color: var(--sf-accent);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 700;
		flex-shrink: 0;
	}

	.module-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
	}

	.module-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
	}

	.module-description {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
	}

	.module-meta {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-1);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		margin-block-start: var(--sf-space-1);
	}

	.module-arrow {
		color: var(--sf-text-3);
		flex-shrink: 0;
	}
</style>
