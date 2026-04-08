<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$components/ui/Icon.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { buildBreadcrumbSchema } from '$utils/seo';
	import { initLessons } from '$lessons/init';
	import { getModule } from '$lessons/registry';
	import { fly, fade, blur } from 'svelte/transition';
	import { expoOut, cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';

	initLessons();

	interface Props {
		data: {
			trackSlug: string;
			moduleSlug: string;
		};
	}

	let { data }: Props = $props();
	const trackSlug = $derived(data.trackSlug);
	const moduleSlug = $derived(data.moduleSlug);
	const module_ = $derived(getModule(trackSlug, moduleSlug));

	$effect(() => {
		if (!module_ && trackSlug && moduleSlug) {
			goto(`/learn/${trackSlug}`);
		}
	});

	function formatSlug(slug: string): string {
		return slug
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}

	// This would normally come from a user progress store
	const statusColors = {
		completed: 'var(--sf-success)',
		in_progress: 'var(--sf-warning)',
		not_started: 'var(--sf-text-3)'
	};

	const statusIcons = {
		completed: 'ph:check-circle-fill',
		in_progress: 'ph:circle-half-fill',
		not_started: 'ph:circle'
	};

	const inDuration = $derived(prefersReducedMotion.current ? 0 : 800);
	const inY = $derived(prefersReducedMotion.current ? 0 : 30);
	const blurAmount = $derived(prefersReducedMotion.current ? 0 : 8);
</script>

{#if module_}
	<SEOHead seo={{
		title: module_.title,
		description: module_.description,
		jsonLd: buildBreadcrumbSchema([
			{ name: 'Home', url: '/' },
			{ name: 'Learn', url: '/learn' },
			{ name: formatSlug(trackSlug), url: `/learn/${trackSlug}` },
			{ name: module_.title, url: `/learn/${trackSlug}/${moduleSlug}` }
		])
	}} />

	<div class="module-page">
		<header class="module-header" in:fly={{ y: inY, duration: inDuration, easing: cubicOut, opacity: 0 }}>
			<a href="/learn/{trackSlug}" class="back-link">
				<Icon icon="ph:arrow-left" size={16} />
				{formatSlug(trackSlug)}
			</a>
			<h1 class="module-title-large" in:blur={{ amount: blurAmount, duration: inDuration, delay: 100, easing: expoOut }}>{module_.title}</h1>
			<p class="module-description" in:fade={{ duration: inDuration, delay: 200, easing: cubicOut }}>{module_.description}</p>
			<span class="module-stat">
				<Icon icon="ph:file-text" size={14} />
				{module_.lessons.length} lessons
			</span>
		</header>

		<div class="lessons-list">
			{#each module_.lessons as lesson, index}
				<a
					href="/learn/{trackSlug}/{moduleSlug}/{lesson.slug}"
					class="lesson-item"
					in:fly={{ y: inY, duration: inDuration, delay: 300 + (index * 80), easing: expoOut, opacity: 0 }}
				>
					<span class="lesson-number">{index + 1}.</span>
					<div class="lesson-info">
						<span class="lesson-title">{lesson.title}</span>
						<span class="lesson-meta">{lesson.estimatedMinutes} min &middot; {lesson.checkpoints.length} checkpoints</span>
					</div>
					<span class="lesson-arrow">
						<Icon icon="ph:caret-right" size={16} />
					</span>
				</a>
			{/each}
		</div>
	</div>
{/if}

<style>
	.module-page {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-6);
		animation: sf-fade-in 300ms var(--sf-ease-out);
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
		&:hover { color: var(--sf-accent); }
	}

	.module-title-large {
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
		line-height: 1.6;
	}

	.module-stat {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-1);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
	}

	.lessons-list {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-2);
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
		&:hover { border-color: var(--sf-accent); background: var(--sf-bg-2); }
	}

	.lesson-number {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-3);
		min-inline-size: 2ch;
		flex-shrink: 0;
	}

	.lesson-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
	}

	.lesson-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		color: var(--sf-text-0);
	}

	.lesson-meta {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
	}

	.lesson-arrow {
		color: var(--sf-text-3);
		flex-shrink: 0;
	}
</style>
