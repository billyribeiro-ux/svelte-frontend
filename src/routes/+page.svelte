<script lang="ts">
	import { course } from '$data/curriculum';
</script>

<svelte:head>
	<title>Svelte PE7 Mastery</title>
</svelte:head>

<div class="landing">
	<div class="hero">
		<h1 class="hero-title">
			<span class="accent">Svelte</span> PE7 Mastery
		</h1>
		<p class="hero-subtitle">JavaScript + TypeScript + Svelte 5 + SvelteKit + SEO</p>
		<p class="hero-method">Taught Through Building &mdash; DiCenso Method</p>

		<div class="stats">
			<div class="stat">
				<span class="stat-number">21</span>
				<span class="stat-label">Modules</span>
			</div>
			<div class="stat">
				<span class="stat-number">155</span>
				<span class="stat-label">Lessons</span>
			</div>
			<div class="stat">
				<span class="stat-number">7</span>
				<span class="stat-label">Phases</span>
			</div>
		</div>

		<a href="/course/1/0/1" class="start-btn">Start Learning</a>
	</div>

	<div class="phases-overview">
		<h2 class="section-title">Course Phases</h2>
		<div class="phase-cards">
			{#each course.phases as phase (phase.index)}
				<div class="phase-card">
					<span class="phase-badge">Phase {phase.index}</span>
					<h3 class="phase-name">{phase.title}</h3>
					<p class="phase-desc">{phase.description}</p>
					<span class="phase-modules">{phase.modules.length} module{phase.modules.length !== 1 ? 's' : ''}</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.landing {
		height: 100%;
		overflow-y: auto;
		padding: var(--space-2xl);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.hero {
		text-align: center;
		padding: var(--space-2xl) 0;
		max-width: 640px;
	}

	.hero-title {
		font-size: 42px;
		font-weight: 700;
		color: var(--text-bright);
		margin-bottom: var(--space-md);
	}

	.accent {
		color: var(--accent);
	}

	.hero-subtitle {
		font-size: 16px;
		color: var(--text-secondary);
		margin-bottom: var(--space-sm);
	}

	.hero-method {
		font-size: 14px;
		color: var(--text-muted);
		font-style: italic;
		margin-bottom: var(--space-2xl);
	}

	.stats {
		display: flex;
		justify-content: center;
		gap: var(--space-2xl);
		margin-bottom: var(--space-2xl);
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
	}

	.stat-number {
		font-size: 32px;
		font-weight: 700;
		color: var(--accent);
		font-family: var(--font-mono);
	}

	.stat-label {
		font-size: 13px;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.start-btn {
		display: inline-block;
		padding: var(--space-md) var(--space-2xl);
		font-size: 16px;
		font-weight: 600;
		color: white;
		background: var(--accent);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: background var(--transition-fast);
	}

	.start-btn:hover {
		background: var(--accent-hover);
		text-decoration: none;
	}

	.phases-overview {
		width: 100%;
		max-width: 900px;
		padding-top: var(--space-2xl);
	}

	.section-title {
		font-size: 18px;
		font-weight: 600;
		color: var(--text-bright);
		margin-bottom: var(--space-lg);
		text-align: center;
	}

	.phase-cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: var(--space-lg);
	}

	.phase-card {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-left: 3px solid var(--accent);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		transition: background var(--transition-fast);
	}

	.phase-card:hover {
		background: var(--bg-tertiary);
	}

	.phase-badge {
		font-size: 11px;
		font-weight: 600;
		color: var(--accent);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.phase-name {
		font-size: 16px;
		font-weight: 600;
		color: var(--text-bright);
		margin: var(--space-xs) 0 var(--space-sm);
	}

	.phase-desc {
		font-size: 13px;
		color: var(--text-secondary);
		line-height: 1.5;
		margin-bottom: var(--space-sm);
	}

	.phase-modules {
		font-size: 12px;
		color: var(--text-muted);
		font-family: var(--font-mono);
	}
</style>
