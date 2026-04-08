<script lang="ts">
	import Button from '$components/ui/Button.svelte';
	import Icon from '$components/ui/Icon.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { fly, fade, scale } from 'svelte/transition';
	import { expoOut, cubicOut } from 'svelte/easing';
	import { prefersReducedMotion } from 'svelte/motion';

	let annual = $state(true);
	let visible = $state(false);

	$effect(() => { visible = true; });

	const inDuration = $derived(prefersReducedMotion.current ? 0 : 700);
	const inY = $derived(prefersReducedMotion.current ? 0 : 30);

	const monthlyPrice = 49;
	const annualPrice = 399;
	const annualMonthly = Math.round(annualPrice / 12);
	const saving = Math.round((1 - annualMonthly / monthlyPrice) * 100);

	const planFeatures = [
		{ text: 'Access to all 4 learning tracks', included: true },
		{ text: '139+ interactive lessons', included: true },
		{ text: 'Live browser-based code editor', included: true },
		{ text: 'AI Tutor — context-aware guidance', included: true },
		{ text: 'Interactive concept knowledge graph', included: true },
		{ text: 'Progress tracking & streaks', included: true },
		{ text: 'ICT Level 7-aligned curriculum', included: true },
		{ text: 'New content as it ships', included: true },
		{ text: 'Certificate of completion', included: true },
		{ text: 'Priority support', included: true }
	];

	const faqs = [
		{ q: 'Is there a free trial?', a: 'The first module of every track is free — no credit card required. You can explore Svelte basics, HTML essentials, and the concept graph before subscribing.' },
		{ q: 'Can I switch between Monthly and Annual?', a: 'Yes. You can upgrade to Annual at any time and we\'ll prorate the remaining days on your monthly plan as credit.' },
		{ q: 'What happens when I cancel?', a: 'You keep full access until the end of your billing period. Your progress is saved so you can pick up where you left off if you resubscribe.' },
		{ q: 'Do you offer team or student discounts?', a: 'Yes — contact us for team pricing (5+ seats) or student verification discount. Both are available on request.' }
	];

	let openFaq = $state<number | null>(null);
</script>

<SEOHead seo={{ title: 'Pricing — SvelteForge', description: 'Simple, transparent pricing for SvelteForge. Monthly or Annual. Cancel any time.' }} />

<div class="pricing-page">
	<div class="pricing-orb pricing-orb--a" aria-hidden="true"></div>
	<div class="pricing-orb pricing-orb--b" aria-hidden="true"></div>

	<!-- Header -->
	<header class="pricing-header">
		<a href="/" class="pricing-back">
			<Icon icon="ph:arrow-left" size={16} />
			SvelteForge
		</a>
	</header>

	<div class="pricing-inner">
		{#if visible}
			<h1 class="pricing-title" in:fly={{ y: inY, duration: inDuration, delay: 100, easing: expoOut, opacity: 0 }}>
				Simple, Transparent Pricing
			</h1>
			<p class="pricing-sub" in:fade={{ duration: inDuration, delay: 200, easing: cubicOut }}>
				One plan. Everything included. Cancel anytime.
			</p>

			<!-- Toggle -->
			<div class="billing-toggle" in:scale={{ start: 0.95, duration: inDuration, delay: 280, easing: expoOut, opacity: 0 }}>
				<button class="toggle-btn" class:active={!annual} onclick={() => { annual = false; }}>Monthly</button>
				<button class="toggle-btn" class:active={annual} onclick={() => { annual = true; }}>
					Annual
					<span class="toggle-badge">Save {saving}%</span>
				</button>
			</div>

			<!-- Plan cards -->
			<div class="plans-grid" in:fly={{ y: inY, duration: inDuration, delay: 360, easing: expoOut, opacity: 0 }}>
				{#if !annual}
					<div class="plan-card">
						<p class="plan-label">MONTHLY</p>
						<div class="plan-price-row">
							<span class="plan-amount">${monthlyPrice}</span>
							<span class="plan-period">/mo</span>
						</div>
						<p class="plan-note">Billed monthly. Cancel any time.</p>
						<a href="/register" class="plan-cta">
							<Button variant="primary" size="lg">Get Started</Button>
						</a>
					</div>
				{:else}
					<div class="plan-card plan-card--featured">
						<div class="plan-best-badge">BEST VALUE</div>
						<p class="plan-label">ANNUAL</p>
						<div class="plan-price-row">
							<span class="plan-amount">${annualPrice}</span>
							<span class="plan-period">/yr</span>
						</div>
						<p class="plan-note">
							Just <strong>${annualMonthly}/mo</strong> — save {saving}% vs monthly.
						</p>
						<a href="/register" class="plan-cta">
							<Button variant="primary" size="lg">Get Started</Button>
						</a>
					</div>
				{/if}

				<div class="plan-features">
					<p class="features-title">Everything included:</p>
					<ul class="features-list">
						{#each planFeatures as f}
							<li class="feature-item">
								<span class="check-icon"><Icon icon="ph:check-circle-fill" size={16} /></span>
								{f.text}
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<!-- Trust strip -->
			<div class="trust-strip" in:fade={{ duration: inDuration, delay: 500, easing: cubicOut }}>
				<span><Icon icon="ph:lock-simple" size={14} /> Secure payment</span>
				<span><Icon icon="ph:shield-check" size={14} /> No hidden fees</span>
				<span><Icon icon="ph:x-circle" size={14} /> Cancel any time</span>
				<span><Icon icon="ph:certificate" size={14} /> ICT Level 7 aligned</span>
			</div>

			<!-- FAQ -->
			<section class="pricing-faq">
				<h2 class="faq-title" in:fly={{ y: inY, duration: inDuration, delay: 560, easing: expoOut, opacity: 0 }}>Common Questions</h2>
				<div class="faq-list">
					{#each faqs as faq, i}
						<div
							class="faq-item"
							class:open={openFaq === i}
							in:fly={{ y: inY, duration: inDuration, delay: 600 + i * 60, easing: expoOut, opacity: 0 }}
						>
							<button class="faq-q" onclick={() => { openFaq = openFaq === i ? null : i; }}>
								<span>{faq.q}</span>
								<Icon icon={openFaq === i ? 'ph:minus' : 'ph:plus'} size={16} />
							</button>
							{#if openFaq === i}
								<div class="faq-a">
									<p>{faq.a}</p>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>

<style>
	.pricing-page {
		min-block-size: 100dvh;
		background: var(--sf-bg-0);
		position: relative;
		overflow: hidden;
	}

	.pricing-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(100px);
		pointer-events: none;
	}
	.pricing-orb--a {
		inline-size: 500px; block-size: 500px;
		background: radial-gradient(circle, oklch(0.65 0.25 275 / 0.12), transparent 70%);
		inset-block-start: -100px; inset-inline-start: -100px;
	}
	.pricing-orb--b {
		inline-size: 400px; block-size: 400px;
		background: radial-gradient(circle, oklch(0.72 0.19 155 / 0.08), transparent 70%);
		inset-block-end: -80px; inset-inline-end: -80px;
	}

	.pricing-header {
		position: relative;
		z-index: 1;
		padding: var(--sf-space-5) var(--sf-space-6);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.pricing-back {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-2);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 600;
		color: var(--sf-text-2);
		text-decoration: none;
		transition: color var(--sf-transition-fast);
		&:hover { color: var(--sf-accent); }
	}

	.pricing-inner {
		position: relative;
		z-index: 1;
		max-inline-size: 760px;
		margin-inline: auto;
		padding: var(--sf-space-8) var(--sf-space-5);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sf-space-7);
	}

	.pricing-title {
		font-family: var(--sf-font-sans);
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 800;
		color: var(--sf-text-0);
		margin: 0;
		text-align: center;
		letter-spacing: -0.03em;
	}

	.pricing-sub {
		font-size: var(--sf-font-size-lg);
		color: var(--sf-text-2);
		margin: calc(-1 * var(--sf-space-5)) 0 0;
		text-align: center;
	}

	.billing-toggle {
		display: flex;
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-full);
		padding: 4px;
		gap: 4px;
	}

	.toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-2);
		padding: var(--sf-space-2) var(--sf-space-4);
		border-radius: var(--sf-radius-full);
		border: none;
		background: none;
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 600;
		color: var(--sf-text-2);
		cursor: pointer;
		transition: all var(--sf-transition-fast);

		&.active {
			background: var(--sf-bg-0);
			color: var(--sf-text-0);
			box-shadow: var(--sf-shadow-sm);
		}
	}

	.toggle-badge {
		background: var(--sf-success);
		color: oklch(0.13 0.01 155);
		font-size: var(--sf-font-size-xs);
		font-weight: 700;
		padding: 1px 6px;
		border-radius: var(--sf-radius-full);
	}

	.plans-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--sf-space-5);
		inline-size: 100%;

		@media (max-width: 600px) {
			grid-template-columns: 1fr;
		}
	}

	.plan-card {
		position: relative;
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-xl);
		padding: var(--sf-space-6);
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-4);

		&.plan-card--featured {
			border-color: var(--sf-accent);
			background: var(--sf-accent-subtle);
		}
	}

	.plan-best-badge {
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

	.plan-label {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xs);
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--sf-text-2);
		margin: 0;
	}

	.plan-price-row {
		display: flex;
		align-items: baseline;
		gap: var(--sf-space-1);
	}

	.plan-amount {
		font-family: var(--sf-font-sans);
		font-size: clamp(2.5rem, 6vw, 3.5rem);
		font-weight: 800;
		color: var(--sf-text-0);
		letter-spacing: -0.03em;
	}

	.plan-period {
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-2);
	}

	.plan-note {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
		line-height: 1.5;
	}

	.plan-cta { margin-block-start: auto; }

	.plan-features {
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-xl);
		padding: var(--sf-space-5);
	}

	.features-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 600;
		color: var(--sf-text-0);
		margin: 0 0 var(--sf-space-4);
	}

	.features-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
	}

	.feature-item {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
	}

	.check-icon { color: var(--sf-success); display: flex; flex-shrink: 0; }

	.trust-strip {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--sf-space-5);
	}

	.trust-strip span {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-2);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		font-weight: 500;
	}

	/* FAQ */
	.pricing-faq {
		inline-size: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-5);
	}

	.faq-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
		text-align: center;
	}

	.faq-list {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-2);
	}

	.faq-item {
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		overflow: hidden;
		transition: border-color var(--sf-transition-base);

		&.open { border-color: oklch(0.65 0.25 275 / 0.3); }
	}

	.faq-q {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--sf-space-4);
		inline-size: 100%;
		padding: var(--sf-space-4) var(--sf-space-5);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-base);
		font-weight: 600;
		color: var(--sf-text-0);
		background: none;
		border: none;
		cursor: pointer;
		text-align: start;
		transition: color var(--sf-transition-fast);
		&:hover { color: var(--sf-accent); }
	}

	.faq-a {
		padding: 0 var(--sf-space-5) var(--sf-space-4);
		p {
			font-size: var(--sf-font-size-sm);
			color: var(--sf-text-2);
			margin: 0;
			line-height: 1.75;
		}
	}
</style>
