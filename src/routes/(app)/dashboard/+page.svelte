<script lang="ts">
	import { page } from '$app/state';
	import { initLessons } from '$lessons/init';
	import { getAllTracks } from '$lessons/registry';
	import Button from '$components/ui/Button.svelte';
	import Icon from '$components/ui/Icon.svelte';
	import ProgressCard from '$components/dashboard/ProgressCard.svelte';
	import SkillRadar from '$components/dashboard/SkillRadar.svelte';
	import RecentActivity from '$components/dashboard/RecentActivity.svelte';

	const data = $derived(page.data);
	const user = $derived(data.user);

	// Initialize lesson registry
	initLessons();

	let tracks = $derived(getAllTracks());

	let totalLessons = $derived(
		tracks.reduce((sum, t) => sum + t.modules.reduce((ms, m) => ms + m.lessons.length, 0), 0)
	);

	// Mock progress for now — will be replaced by real progress store
	let skills = $derived([
		{ label: 'HTML', value: 10, color: '#ef4444' },
		{ label: 'CSS', value: 5, color: '#3b82f6' },
		{ label: 'TypeScript', value: 8, color: '#eab308' },
		{ label: 'Svelte', value: 15, color: '#f97316' },
		{ label: 'SvelteKit', value: 0, color: '#22c55e' }
	]);

	let recentActivities = $derived([
		{
			id: '1',
			lessonTitle: 'Understanding $state',
			trackTitle: 'Svelte 5 Core',
			href: '/learn/svelte-core/runes-reactivity/state-basics',
			status: 'in-progress' as const,
			timestamp: Date.now() - 3600000
		}
	]);

	// Find first available lesson
	let firstLesson = $derived.by(() => {
		for (const track of tracks) {
			for (const mod of track.modules) {
				if (mod.lessons.length > 0) {
					const lesson = mod.lessons[0]!;
					return {
						title: lesson.title,
						track: track.title,
						href: `/learn/${track.slug}/${mod.slug}/${lesson.slug}`
					};
				}
			}
		}
		return null;
	});
</script>

<svelte:head>
	<title>Dashboard — SvelteForge</title>
</svelte:head>

<div class="dashboard">
	<h1 class="dashboard-greeting">Welcome back, {user.displayName}</h1>

	<!-- Continue Learning -->
	{#if firstLesson}
		<div class="continue-card">
			<div class="continue-info">
				<Icon icon="ph:play-circle" size={24} />
				<div>
					<p class="continue-title">{firstLesson.title}</p>
					<p class="continue-track">{firstLesson.track}</p>
				</div>
			</div>
			<a href={firstLesson.href}>
				<Button variant="primary" size="sm">Continue Learning</Button>
			</a>
		</div>
	{/if}

	<!-- Track Progress -->
	<section>
		<h2 class="section-title">Your Tracks</h2>
		<div class="tracks-grid">
			{#each tracks as track}
				{@const lessonCount = track.modules.reduce((s, m) => s + m.lessons.length, 0)}
				<ProgressCard
					title={track.title}
					icon="ph:book-open"
					totalLessons={lessonCount}
					completedLessons={0}
					href="/learn/{track.slug}"
				/>
			{/each}
		</div>
	</section>

	<div class="bottom-row">
		<!-- Skill Radar -->
		<section class="radar-section">
			<h2 class="section-title">Skill Overview</h2>
			<SkillRadar {skills} />
		</section>

		<!-- Recent Activity -->
		<section class="activity-section">
			<RecentActivity activities={recentActivities} />
		</section>
	</div>

	<!-- Stats -->
	<div class="stats-row">
		<div class="stat-card">
			<span class="stat-number">{totalLessons}</span>
			<span class="stat-label">Total Lessons</span>
		</div>
		<div class="stat-card">
			<span class="stat-number">{tracks.length}</span>
			<span class="stat-label">Tracks</span>
		</div>
		<div class="stat-card">
			<span class="stat-number">0</span>
			<span class="stat-label">Completed</span>
		</div>
		<div class="stat-card">
			<span class="stat-number">0</span>
			<span class="stat-label">Day Streak</span>
		</div>
	</div>
</div>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-6);
		max-inline-size: 960px;
	}

	.dashboard-greeting {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
	}

	.continue-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--sf-space-5);
		background: var(--sf-accent-subtle);
		border: 1px solid var(--sf-accent);
		border-radius: var(--sf-radius-lg);
	}

	.continue-info {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		color: var(--sf-accent);
	}

	.continue-title {
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
	}

	.continue-track {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
		margin: 0;
	}

	.section-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-lg);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0 0 var(--sf-space-4) 0;
	}

	.tracks-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--sf-space-4);
	}

	.bottom-row {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--sf-space-5);
	}

	.radar-section {
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-5);
	}

	.activity-section {
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-5);
	}

	.stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--sf-space-4);
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sf-space-1);
		padding: var(--sf-space-5);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
	}

	.stat-number {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 800;
		color: var(--sf-accent);
	}

	.stat-label {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}
</style>
