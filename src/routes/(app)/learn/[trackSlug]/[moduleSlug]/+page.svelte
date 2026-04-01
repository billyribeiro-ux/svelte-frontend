<script lang="ts">
	import Icon from '$components/ui/Icon.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { buildBreadcrumbSchema } from '$utils/seo';

	interface Props {
		data: {
			trackSlug: string;
			moduleSlug: string;
		};
	}

	let { data }: Props = $props();
	const trackSlug = $derived(data.trackSlug);
	const moduleSlug = $derived(data.moduleSlug);

	// Placeholder data
	const module_ = $derived({
		title: formatSlug(moduleSlug),
		description: `Explore the ${formatSlug(moduleSlug).toLowerCase()} module in the ${formatSlug(trackSlug)} track.`,
		lessons: [
			{ slug: 'introduction', title: 'Introduction', status: 'completed' as const },
			{ slug: 'core-concepts', title: 'Core Concepts', status: 'completed' as const },
			{ slug: 'hands-on-practice', title: 'Hands-on Practice', status: 'in_progress' as const },
			{ slug: 'advanced-patterns', title: 'Advanced Patterns', status: 'not_started' as const },
			{ slug: 'challenge', title: 'Module Challenge', status: 'not_started' as const }
		]
	});

	function formatSlug(slug: string): string {
		return slug
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}

	const statusIcons: Record<string, string> = {
		completed: 'ph:check-circle-fill',
		in_progress: 'ph:circle-half',
		not_started: 'ph:circle'
	};

	const statusColors: Record<string, string> = {
		completed: 'var(--sf-success)',
		in_progress: 'var(--sf-accent)',
		not_started: 'var(--sf-text-3)'
	};
</script>

<SEOHead seo={{
	title: `${module_.title} — ${formatSlug(trackSlug)}`,
	description: module_.description,
	jsonLd: buildBreadcrumbSchema([
		{ name: 'Home', url: '/' },
		{ name: 'Learn', url: '/learn' },
		{ name: formatSlug(trackSlug), url: `/learn/${trackSlug}` },
		{ name: module_.title, url: `/learn/${trackSlug}/${moduleSlug}` }
	])
}} />

<div class="module-page">
	<header class="module-header">
		<a href="/learn/{trackSlug}" class="back-link">
			<Icon icon="ph:arrow-left" size={16} />
			{formatSlug(trackSlug)}
		</a>
		<h1 class="module-title">{module_.title}</h1>
		<p class="module-description">{module_.description}</p>
	</header>

	<div class="lessons-list">
		{#each module_.lessons as lesson, index}
			<a
				href="/learn/{trackSlug}/{moduleSlug}/{lesson.slug}"
				class="lesson-item"
			>
				<span class="lesson-status" style:color={statusColors[lesson.status]}>
					<Icon icon={statusIcons[lesson.status] ?? 'ph:circle'} size={20} />
				</span>
				<span class="lesson-number">{index + 1}.</span>
				<span class="lesson-title">{lesson.title}</span>
				<span class="lesson-arrow">
					<Icon icon="ph:caret-right" size={16} />
				</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.module-page {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-6);
	}

	.module-header {
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

	.module-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
	}

	.module-description {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-2);
		margin: 0;
		max-inline-size: 600px;
	}

	.lessons-list {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
	}

	.lesson-item {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		padding-block: var(--sf-space-3);
		padding-inline: var(--sf-space-4);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-md);
		text-decoration: none;
		transition: border-color var(--sf-transition-fast), background var(--sf-transition-fast);

		&:hover {
			border-color: var(--sf-accent);
			background: var(--sf-bg-2);
		}
	}

	.lesson-status {
		display: inline-flex;
		flex-shrink: 0;
	}

	.lesson-number {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-3);
		min-inline-size: 2ch;
	}

	.lesson-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-0);
		flex: 1;
	}

	.lesson-arrow {
		color: var(--sf-text-3);
		flex-shrink: 0;
	}
</style>
