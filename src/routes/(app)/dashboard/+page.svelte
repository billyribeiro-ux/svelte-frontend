<script lang="ts">
	import { initLessons } from '$lessons/init';
	import { getAllTracks } from '$lessons/registry';
	import Button from '$components/ui/Button.svelte';
	import Icon from '$components/ui/Icon.svelte';
	import ProgressCard from '$components/dashboard/ProgressCard.svelte';
	import SkillRadar from '$components/dashboard/SkillRadar.svelte';
	import RecentActivity from '$components/dashboard/RecentActivity.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { fly, fade, blur } from 'svelte/transition';
	import { expoOut, cubicOut, backOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';
	import { progressStore } from '$stores/progress.svelte';

	interface Props {
		data: {
			user: {
				id: string;
				email: string;
				displayName: string;
				avatarUrl: string | null;
			};
		};
	}

	let { data }: Props = $props();
	const user = $derived(data.user);

	// Initialize lesson registry
	initLessons();

	let tracks = $derived(getAllTracks());

	let totalLessons = $derived(
		tracks.reduce((sum, t) => sum + t.modules.reduce((ms, m) => ms + m.lessons.length, 0), 0)
	);

	// Real skills from progress store
	let skills = $derived.by(() => {
		const trackMap: Record<string, { label: string; color: string; max: number }> = {
			'foundations': { label: 'Web Foundations', color: '#eab308', max: 35 },
			'svelte-core':  { label: 'Svelte 5',        color: '#f97316', max: 42 },
			'sveltekit':    { label: 'SvelteKit',       color: '#22c55e', max: 38 },
			'projects':     { label: 'Projects',        color: '#a855f7', max: 24 }
		};
		return Object.entries(trackMap).map(([slug, meta]) => ({
			label: meta.label,
			color: meta.color,
			value: progressStore.getTrackCompleted(slug),
			max: meta.max
		}));
	});

	// Real recent activities from progress store
	let recentActivities = $derived(
		progressStore.recentActivity.map((a) => ({
			id: a.lessonId,
			lessonTitle: a.lessonTitle,
			trackTitle: a.trackTitle,
			href: a.href,
			status: a.status,
			timestamp: a.timestamp
		}))
	);

	// Find first uncompleted lesson (skip already completed ones)
	let firstLesson = $derived.by(() => {
		for (const track of tracks) {
			for (const mod of track.modules) {
				for (const lesson of mod.lessons) {
					const status = progressStore.getLessonStatus(lesson.id);
					if (status === 'in-progress') {
						return { title: lesson.title, track: track.title, href: `/learn/${track.slug}/${mod.slug}/${lesson.slug}`, status: 'in-progress' as const };
					}
				}
			}
		}
		for (const track of tracks) {
			for (const mod of track.modules) {
				for (const lesson of mod.lessons) {
					if (progressStore.getLessonStatus(lesson.id) === 'not-started') {
						return { title: lesson.title, track: track.title, href: `/learn/${track.slug}/${mod.slug}/${lesson.slug}`, status: 'not-started' as const };
					}
				}
			}
		}
		return null;
	});

	const inDuration = $derived(prefersReducedMotion.current ? 0 : 800);
	const inY = $derived(prefersReducedMotion.current ? 0 : 30);
	const blurAmount = $derived(prefersReducedMotion.current ? 0 : 8);
</script>

<SEOHead seo={{ title: 'Dashboard', description: 'Track your learning progress across Svelte 5, SvelteKit, and web development fundamentals.' }} />

<div class="dashboard">
	<h1 class="dashboard-greeting" in:blur={{ amount: blurAmount, duration: inDuration, easing: expoOut }}>Welcome back, {user.displayName}</h1>

	<!-- Continue Learning -->
	{#if firstLesson}
		<div class="continue-card" in:fly={{ y: inY, duration: inDuration, delay: 100, easing: expoOut, opacity: 0 }}>
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
	<section class="tracks-section" in:fly={{ y: inY, duration: inDuration, delay: 200, easing: expoOut, opacity: 0 }}>
		<h2 class="section-title">Your Tracks</h2>
		<div class="tracks-grid">
			{#each tracks as track}
				{@const lessonCount = track.modules.reduce((s, m) => s + m.lessons.length, 0)}
				<ProgressCard
					title={track.title}
					icon="ph:book-open"
					totalLessons={lessonCount}
					completedLessons={progressStore.getTrackCompleted(track.slug)}
					href="/learn/{track.slug}"
				/>
			{/each}
		</div>
	</section>

	<div class="bottom-row">
		<!-- Skill Radar -->
		<section class="radar-section" in:fly={{ y: inY, duration: inDuration, delay: 300, easing: expoOut, opacity: 0 }}>
			<h2 class="section-title">Skill Overview</h2>
			<SkillRadar {skills} />
		</section>

		<!-- Recent Activity -->
		<section class="activity-section" in:fly={{ y: inY, duration: inDuration, delay: 400, easing: expoOut, opacity: 0 }}>
			<RecentActivity activities={recentActivities} />
		</section>
	</div>

	<!-- Stats -->
	<div class="stats-row" in:fly={{ y: inY, duration: inDuration, delay: 500, easing: expoOut, opacity: 0 }}>
		<div class="stat-card">
			<span class="stat-number">{totalLessons}</span>
			<span class="stat-label">Total Lessons</span>
		</div>
		<div class="stat-card">
			<span class="stat-number">{progressStore.completedCount}</span>
			<span class="stat-label">Completed</span>
		</div>
		<div class="stat-card">
			<span class="stat-number">{progressStore.streak}</span>
			<span class="stat-label">Day Streak</span>
		</div>
		<div class="stat-card">
			<span class="stat-number">{progressStore.hoursLearned}</span>
			<span class="stat-label">Hours Learned</span>
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
		animation: sf-slide-in-left 400ms var(--sf-ease-out);
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

		:global(> :nth-child(1)) { animation: sf-slide-up 400ms var(--sf-ease-out) 0ms backwards; }
		:global(> :nth-child(2)) { animation: sf-slide-up 400ms var(--sf-ease-out) 80ms backwards; }
		:global(> :nth-child(3)) { animation: sf-slide-up 400ms var(--sf-ease-out) 160ms backwards; }
		:global(> :nth-child(4)) { animation: sf-slide-up 400ms var(--sf-ease-out) 240ms backwards; }
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
		animation: sf-fade-in 500ms var(--sf-ease-out) 200ms backwards;
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
