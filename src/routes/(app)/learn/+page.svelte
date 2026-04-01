<script lang="ts">
	import Icon from '$components/ui/Icon.svelte';
	import Progress from '$components/ui/Progress.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';

	const tracks = [
		{
			slug: 'svelte-core',
			title: 'Svelte 5 Core',
			description: 'Master Svelte 5 fundamentals including runes, reactivity, components, and the template syntax.',
			modules: 6,
			lessons: 24,
			progress: 35
		},
		{
			slug: 'sveltekit',
			title: 'SvelteKit Essentials',
			description: 'Build full-stack applications with SvelteKit: routing, load functions, form actions, and deployment.',
			modules: 5,
			lessons: 20,
			progress: 0
		},
		{
			slug: 'foundations',
			title: 'Web Foundations',
			description: 'Strengthen your HTML, CSS, and TypeScript foundations before diving into Svelte.',
			modules: 4,
			lessons: 16,
			progress: 80
		},
		{
			slug: 'projects',
			title: 'Real-World Projects',
			description: 'Apply your skills by building complete applications from scratch with guided walkthroughs.',
			modules: 3,
			lessons: 12,
			progress: 0
		}
	];
</script>

<SEOHead seo={{ title: 'Learning Tracks', description: 'Browse interactive learning tracks for Svelte 5, SvelteKit, HTML, CSS, and TypeScript.' }} />

<div class="tracks-page">
	<h1 class="page-title">Learning Tracks</h1>

	<div class="tracks-grid">
		{#each tracks as track}
			<a href="/learn/{track.slug}" class="track-card">
				<h2 class="track-title">{track.title}</h2>
				<p class="track-description">{track.description}</p>
				<div class="track-meta">
					<span class="track-stat">
						<Icon icon="ph:folder" size={14} />
						{track.modules} modules
					</span>
					<span class="track-stat">
						<Icon icon="ph:file-text" size={14} />
						{track.lessons} lessons
					</span>
				</div>
				<div class="track-progress">
					<Progress value={track.progress} showLabel size="sm" />
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.tracks-page {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-6);
	}

	.page-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
	}

	.tracks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--sf-space-4);
	}

	.track-card {
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-5);
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
		text-decoration: none;
		transition: border-color var(--sf-transition-fast), box-shadow var(--sf-transition-fast);

		&:hover {
			border-color: var(--sf-accent);
			box-shadow: var(--sf-shadow-md);
		}
	}

	.track-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-lg);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
	}

	.track-description {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
		line-height: 1.6;
		flex: 1;
	}

	.track-meta {
		display: flex;
		gap: var(--sf-space-4);
	}

	.track-stat {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-1);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}

	.track-progress {
		margin-block-start: var(--sf-space-2);
	}
</style>
