<script lang="ts">
	import Icon from '$components/ui/Icon.svelte';
	import Progress from '$components/ui/Progress.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { initLessons } from '$lessons/init';
	import { getAllTracks } from '$lessons/registry';

	initLessons();

	const tracks = $derived(getAllTracks().map((track) => ({
		slug: track.slug,
		title: track.title,
		description: track.description,
		modules: track.modules.length,
		lessons: track.modules.reduce((sum, m) => sum + m.lessons.length, 0),
		progress: 0
	})));
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
				<Progress value={track.progress} showLabel />
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
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
		padding: var(--sf-space-5);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		text-decoration: none;
		transition: border-color var(--sf-transition-fast), box-shadow var(--sf-transition-fast), transform var(--sf-transition-fast);

		&:hover {
			border-color: var(--sf-accent);
			box-shadow: var(--sf-shadow-md);
			transform: translateY(-2px);
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
		color: var(--sf-text-3);
	}
</style>
