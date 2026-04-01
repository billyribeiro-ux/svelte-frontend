<script lang="ts">
	import { page } from '$app/state';
	import Button from '$components/ui/Button.svelte';
	import Icon from '$components/ui/Icon.svelte';
	import Progress from '$components/ui/Progress.svelte';

	const data = $derived(page.data);
	const user = $derived(data.user);
</script>

<svelte:head>
	<title>Dashboard — SvelteForge</title>
</svelte:head>

<div class="dashboard">
	<h1 class="dashboard-greeting">Welcome back, {user.displayName}</h1>

	<div class="dashboard-grid">
		<div class="dash-card">
			<div class="dash-card-header">
				<Icon icon="ph:play-circle" size={24} />
				<h2 class="dash-card-title">Continue Learning</h2>
			</div>
			<div class="dash-card-body">
				<p class="dash-card-text">Svelte 5 Fundamentals</p>
				<p class="dash-card-subtext">Lesson 3: Reactivity with Runes</p>
			</div>
			<div class="dash-card-footer">
				<a href="/learn/svelte-core/fundamentals/reactivity-runes" class="card-link">
					<Button variant="primary" size="sm">Resume</Button>
				</a>
			</div>
		</div>

		<div class="dash-card">
			<div class="dash-card-header">
				<Icon icon="ph:chart-bar" size={24} />
				<h2 class="dash-card-title">Your Progress</h2>
			</div>
			<div class="dash-card-body">
				<div class="progress-stat">
					<span class="progress-label">Overall</span>
					<Progress value={12} showLabel />
				</div>
				<div class="progress-stat">
					<span class="progress-label">Current Track</span>
					<Progress value={35} showLabel />
				</div>
			</div>
		</div>

		<div class="dash-card">
			<div class="dash-card-header">
				<Icon icon="ph:fire" size={24} />
				<h2 class="dash-card-title">Streak</h2>
			</div>
			<div class="dash-card-body">
				<p class="streak-number">3</p>
				<p class="dash-card-subtext">days in a row</p>
			</div>
		</div>

		<div class="dash-card">
			<div class="dash-card-header">
				<Icon icon="ph:compass" size={24} />
				<h2 class="dash-card-title">Explore Tracks</h2>
			</div>
			<div class="dash-card-body">
				<p class="dash-card-text">Browse all learning tracks and pick your next challenge.</p>
			</div>
			<div class="dash-card-footer">
				<a href="/learn" class="card-link">
					<Button variant="secondary" size="sm">Browse Tracks</Button>
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.dashboard {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-6);
	}

	.dashboard-greeting {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--sf-space-4);
	}

	.dash-card {
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-5);
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-4);
	}

	.dash-card-header {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		color: var(--sf-accent);
	}

	.dash-card-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
	}

	.dash-card-body {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-2);
		flex: 1;
	}

	.dash-card-text {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
		margin: 0;
	}

	.dash-card-subtext {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
		margin: 0;
	}

	.dash-card-footer {
		margin-block-start: auto;
	}

	.card-link {
		text-decoration: none;
	}

	.progress-stat {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-1);
	}

	.progress-label {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}

	.streak-number {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-3xl);
		font-weight: 800;
		color: var(--sf-accent);
		margin: 0;
		line-height: 1;
	}
</style>
