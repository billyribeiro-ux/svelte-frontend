<script lang="ts">
	import Button from '$components/ui/Button.svelte';
	import Icon from '$components/ui/Icon.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';

	const seo = {
		title: 'Master Svelte 5 & SvelteKit',
		description: 'SvelteForge is an interactive learning platform for Svelte 5, SvelteKit, TypeScript, and modern web development. Learn by building real applications with the DiCenso Method.',
		og: {
			title: 'SvelteForge — Master Svelte 5 & SvelteKit',
			description: 'Interactive learning platform for Svelte 5 and SvelteKit. Learn by building real applications.',
			type: 'website' as const,
			siteName: 'SvelteForge'
		},
		twitter: {
			card: 'summary_large_image' as const,
			title: 'SvelteForge — Master Svelte 5 & SvelteKit',
			description: 'Interactive learning platform for Svelte 5 and SvelteKit.'
		},
		jsonLd: [
			{
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: 'SvelteForge',
				description: 'Interactive learning platform for Svelte 5 and SvelteKit',
				url: 'https://svelteforge.dev'
			},
			{
				'@context': 'https://schema.org',
				'@type': 'Organization',
				name: 'SvelteForge',
				url: 'https://svelteforge.dev'
			}
		]
	};
</script>

<SEOHead {seo} />

<main class="landing">
	<section class="hero">
		<div class="hero-content">
			<h1 class="hero-title">
				<span class="hero-brand">SvelteForge</span>
			</h1>
			<p class="hero-tagline">Master Svelte 5, SvelteKit & Modern Web Development</p>
			<p class="hero-description">
				An interactive learning platform with hands-on coding, AI-powered guidance,
				and a concept graph that adapts to your progress.
			</p>
			<div class="hero-cta">
				<a href="/learn" class="cta-link">
					<Button variant="primary" size="lg">Start Learning</Button>
				</a>
			</div>
		</div>
	</section>

	<section class="features">
		<h2 class="features-heading">Everything you need to master Svelte</h2>
		<div class="features-grid">
			<div class="feature-card">
				<div class="feature-icon">
					<Icon icon="ph:book-open" size={32} />
				</div>
				<h3 class="feature-title">Interactive Lessons</h3>
				<p class="feature-desc">
					Structured tracks from fundamentals to advanced patterns, with hands-on checkpoints.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">
					<Icon icon="ph:code" size={32} />
				</div>
				<h3 class="feature-title">Live Code Editor</h3>
				<p class="feature-desc">
					Write, run, and preview Svelte components in a full-featured browser-based editor.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">
					<Icon icon="ph:robot" size={32} />
				</div>
				<h3 class="feature-title">AI Tutor</h3>
				<p class="feature-desc">
					Get contextual hints and explanations from an AI tutor that understands your code.
				</p>
			</div>
			<div class="feature-card">
				<div class="feature-icon">
					<Icon icon="ph:graph" size={32} />
				</div>
				<h3 class="feature-title">Concept Graph</h3>
				<p class="feature-desc">
					Visualize how concepts connect and track your mastery across the knowledge map.
				</p>
			</div>
		</div>
	</section>
</main>

<style>
	main.landing {
		min-block-size: 100dvh;
		display: flex;
		flex-direction: column;
	}

	.hero {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-block: var(--sf-space-8);
		padding-inline: var(--sf-space-5);
		min-block-size: 60dvh;
	}

	.hero-content {
		max-inline-size: 640px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sf-space-4);
	}

	.hero-title {
		margin: 0;
	}

	.hero-brand {
		font-family: var(--sf-font-sans);
		font-size: clamp(2.5rem, 6vw, 4rem);
		font-weight: 800;
		background: linear-gradient(135deg, var(--sf-accent), var(--sf-accent-hover));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.hero-tagline {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xl);
		font-weight: 500;
		color: var(--sf-text-0);
		margin: 0;
	}

	.hero-description {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-2);
		margin: 0;
		line-height: 1.7;
		max-inline-size: 520px;
	}

	.hero-cta {
		margin-block-start: var(--sf-space-4);
	}

	.cta-link {
		text-decoration: none;
	}

	.features {
		padding-block: var(--sf-space-8);
		padding-inline: var(--sf-space-5);
		background: var(--sf-bg-1);
	}

	.features-heading {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-2xl);
		font-weight: 700;
		color: var(--sf-text-0);
		text-align: center;
		margin-block-end: var(--sf-space-7);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--sf-space-5);
		max-inline-size: 960px;
		margin-inline: auto;
	}

	.feature-card {
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-5);
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
	}

	.feature-icon {
		color: var(--sf-accent);
	}

	.feature-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0;
	}

	.feature-desc {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
		line-height: 1.6;
	}
</style>
