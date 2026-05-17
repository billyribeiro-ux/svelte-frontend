<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$components/ui/Icon.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { buildCourseSchema, buildBreadcrumbSchema } from '$utils/seo';
	import { initLessons } from '$lessons/init';
	import { getTrack } from '$lessons/registry';
	import { fly, fade, blur } from 'svelte/transition';
	import { expoOut, cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';

	initLessons();

	interface Props {
		data: {
			trackSlug: string;
		};
	}

	let { data }: Props = $props();
	const trackSlug = $derived(data.trackSlug);
	const track = $derived(getTrack(trackSlug));

	$effect(() => {
		if (!track && trackSlug) {
			goto('/learn');
		}
	});

	const inDuration = $derived(prefersReducedMotion.current ? 0 : 800);
	const inY = $derived(prefersReducedMotion.current ? 0 : 30);
	const blurAmount = $derived(prefersReducedMotion.current ? 0 : 8);
</script>

{#if track}
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
		<header class="track-header" in:fly={{ y: inY, duration: inDuration, easing: cubicOut, opacity: 0 }}>
			<a href="/learn" class="back-link">
				<Icon icon="ph:arrow-left" size={16} />
				All Tracks
			</a>
			<h1 class="track-title" in:blur={{ amount: blurAmount, duration: inDuration, delay: 100, easing: expoOut }}>{track.title}</h1>
			<p class="track-description" in:fade={{ duration: inDuration, delay: 200, easing: cubicOut }}>{track.description}</p>
			<div class="track-stats" in:fade={{ duration: inDuration, delay: 300, easing: cubicOut }}>
				<span class="track-stat">
					<Icon icon="ph:folder" size={14} />
					{track.modules.length} modules
				</span>
				<span class="track-stat">
					<Icon icon="ph:file-text" size={14} />
					{track.modules.reduce((s, m) => s + m.lessons.length, 0)} lessons
				</span>
			</div>
		</header>

		<div class="modules-list">
			{#each track.modules as mod, index}
				<a 
					href="/learn/{trackSlug}/{mod.slug}" 
					class="module-card"
					in:fly={{ y: inY, duration: inDuration, delay: 400 + (index * 100), easing: expoOut, opacity: 0 }}
				>
					<div class="module-number">{index + 1}</div>
					<div class="module-info">
						<h2 class="module-title">{mod.title}</h2>
						<p class="module-description">{mod.description}</p>
						<span class="module-meta">
							<Icon icon="ph:file-text" size={14} />
							{mod.lessons.length} lessons
						</span>
					</div>
					<div class="module-arrow">
						<Icon icon="ph:caret-right" size={20} />
					</div>
				</a>
			{/each}
		</div>

		<section class="pricing">
			<h2 class="pricing-heading">Get Full Access</h2>
			<p class="pricing-sub">Unlock all tracks, lessons, and the AI tutor.</p>
			<div class="pricing-grid">
				<div class="pricing-card">
					<p class="plan-name">MONTHLY</p>
					<div class="plan-price">
						<span class="plan-amount">$49</span>
						<span class="plan-period">/mo</span>
					</div>
					<p class="plan-note">Cancel anytime. No commitment.</p>
					<button class="plan-btn plan-btn--secondary">Start Monthly</button>
				</div>

				<div class="pricing-card pricing-card--featured">
					<span class="plan-badge">BEST VALUE</span>
					<p class="plan-name">ANNUAL</p>
					<div class="plan-price">
						<span class="plan-amount">$399</span>
						<span class="plan-period">/yr</span>
					</div>
					<p class="plan-note">Billed once per year.</p>
					<p class="plan-savings">Save 32%</p>
					<button class="plan-btn plan-btn--primary">Start Annual</button>
				</div>
			</div>
		</section>
	</div>
{/if}

<style>
	.track-page {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-6);
		animation: sf-fade-in 300ms var(--sf-ease-out);
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
		&:hover { color: var(--sf-accent); }
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
		line-height: 1.6;
	}

	.track-stats {
		display: flex;
		gap: var(--sf-space-4);
	}

	.track-stat {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-1);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
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
		&:hover { border-color: var(--sf-accent); box-shadow: var(--sf-shadow-sm); }
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

	.pricing {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sf-space-5);
		padding-block: var(--sf-space-8);
		border-block-start: 1px solid var(--sf-bg-3);
	}

	.pricing-heading {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
		text-align: center;
	}

	.pricing-sub {
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-2);
		margin: 0;
		text-align: center;
	}

	.pricing-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: var(--sf-space-4);
		max-inline-size: 560px;
		inline-size: 100%;
	}

	.pricing-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-6);

		&.pricing-card--featured {
			border-color: var(--sf-accent);
			background: var(--sf-accent-subtle);
		}
	}

	.plan-badge {
		position: absolute;
		inset-block-start: calc(-1 * var(--sf-space-3));
		inset-inline-start: 50%;
		translate: -50% 0;
		background: var(--sf-accent);
		color: var(--sf-accent-text);
		font-size: var(--sf-font-size-xs);
		font-weight: 700;
		letter-spacing: 0.08em;
		padding: var(--sf-space-1) var(--sf-space-3);
		border-radius: var(--sf-radius-full);
		white-space: nowrap;
	}

	.plan-name {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--sf-text-2);
		margin: 0;
	}

	.plan-price {
		display: flex;
		align-items: baseline;
		gap: var(--sf-space-1);
	}

	.plan-amount {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-3xl);
		font-weight: 800;
		color: var(--sf-text-0);
	}

	.plan-period {
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-2);
	}

	.plan-note {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
	}

	.plan-savings {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 700;
		color: var(--sf-accent);
		margin: 0;
	}

	.plan-btn {
		margin-block-start: var(--sf-space-2);
		padding-block: var(--sf-space-3);
		padding-inline: var(--sf-space-5);
		border-radius: var(--sf-radius-md);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 600;
		cursor: pointer;
		border: none;
		transition: opacity var(--sf-transition-fast);
		&:hover { opacity: 0.85; }

		&.plan-btn--primary {
			background: var(--sf-accent);
			color: var(--sf-accent-text);
		}

		&.plan-btn--secondary {
			background: var(--sf-bg-3);
			color: var(--sf-text-0);
		}
	}
</style>
