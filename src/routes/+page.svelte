<script lang="ts">
	import Button from '$components/ui/Button.svelte';
	import Icon from '$components/ui/Icon.svelte';
	import SEOHead from '$components/seo/SEOHead.svelte';
	import { fly, fade, scale, blur } from 'svelte/transition';
	import { cubicOut, expoOut, quintOut } from 'svelte/easing';
	import { prefersReducedMotion, Tween, Spring } from 'svelte/motion';
	import { onMount } from 'svelte';

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

	const features = [
		{ title: 'Svelte 5 Runes', description: 'Purpose-built for Svelte 5 from the ground up. Learn $state, $derived, $effect and every rune in depth.', icon: 'ph:lightning', accent: 'oklch(0.78 0.22 330)' },
		{ title: 'Live Code Editor', description: 'Full Monaco-powered editor in the browser. Write, run, and preview Svelte components with zero setup.', icon: 'ph:code-block', accent: 'oklch(0.76 0.16 230)' },
		{ title: 'Concept Graph', description: 'An interactive knowledge map showing exactly how concepts connect. Never lose the thread again.', icon: 'ph:graph', accent: 'oklch(0.7 0.15 230)' },
		{ title: 'AI Tutor', description: 'Context-aware AI that understands your lesson, your code, and your specific error in real time.', icon: 'ph:robot', accent: 'oklch(0.72 0.19 155)' },
		{ title: 'Structured Tracks', description: 'Eight progressive tracks — from HTML fundamentals to advanced SvelteKit architecture patterns.', icon: 'ph:path', accent: 'oklch(0.78 0.18 75)' },
		{ title: 'ICT Level 7', description: 'Aligned to ICT Level 7 standards. Build employer-ready skills and portfolio-grade applications.', icon: 'ph:certificate', accent: 'oklch(0.65 0.25 275)' }
	];

	const steps = [
		{ n: '01', title: 'Choose Your Track', desc: 'Start from absolute basics or jump straight into Svelte 5 runes — curriculum adapts to your level.', icon: 'ph:map-trifold' },
		{ n: '02', title: 'Build Real Code', desc: 'Write real Svelte components in our browser IDE. Instant compilation, live preview, no config.', icon: 'ph:code' },
		{ n: '03', title: 'Master with AI', desc: 'Our AI tutor explains exactly what\'s wrong, why it matters, and what to learn next.', icon: 'ph:robot' }
	];

	const statsData = [
		{ label: 'Lessons', target: 180 },
		{ label: 'Learning Modules', target: 42 },
		{ label: 'Practice Tracks', target: 8 }
	];

	// Animated stat counters
	const statTweens = statsData.map(() => new Tween(0, { duration: 1800, easing: quintOut }));

	// Tech badge marquee
	const techBadges = ['Svelte 5', '$state', '$derived', '$effect', 'SvelteKit', 'TypeScript', 'Runes', 'Monaco Editor', 'AI Tutor', 'Concept Graph', 'ICT Level 7', 'HTML5', 'CSS3', 'JavaScript'];

	// Interactive live demo counter
	let demoCount = $state(0);
	const demoDerived = $derived(demoCount * 2);

	// Mouse-parallax orbs via Spring physics
	const orbA = new Spring({ x: 0, y: 0 }, { stiffness: 0.04, damping: 0.5 });
	const orbB = new Spring({ x: 0, y: 0 }, { stiffness: 0.025, damping: 0.6 });

	// Demo window 3D tilt
	const demoTilt = new Spring({ x: 0, y: 0 }, { stiffness: 0.06, damping: 0.82 });

	// Global cursor spotlight (Spring-driven)
	const cursor = new Spring({ x: -600, y: -600 }, { stiffness: 0.12, damping: 0.75 });

	// Hero floating particles
	const particles = Array.from({ length: 16 }, (_, i) => ({
		x: 5 + i * 6,
		size: 1.5 + (i % 3) * 0.8,
		delay: i * 0.55,
		dur: 7 + (i % 5) * 1.6,
		dx: (i % 2 === 0 ? 1 : -1) * (8 + (i % 4) * 6)
	}));

	function handleHeroMouseMove(e: MouseEvent) {
		if (prefersReducedMotion.current) return;
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const cx = (e.clientX - rect.left) / rect.width - 0.5;
		const cy = (e.clientY - rect.top) / rect.height - 0.5;
		orbA.set({ x: cx * 70, y: cy * 50 });
		orbB.set({ x: cx * -50, y: cy * -35 });
		demoTilt.set({ x: cx * 9, y: cy * 6 });
	}

	// 3D tilt action for feature cards
	function tilt(node: HTMLElement) {
		function onMove(e: MouseEvent) {
			if (prefersReducedMotion.current) return;
			const r = node.getBoundingClientRect();
			const x = (e.clientX - r.left) / r.width - 0.5;
			const y = (e.clientY - r.top) / r.height - 0.5;
			node.style.setProperty('--tilt-x', `${y * -10}deg`);
			node.style.setProperty('--tilt-y', `${x * 10}deg`);
			node.style.setProperty('--tilt-shine', `${(x + 0.5) * 100}%`);
		}
		function onLeave() {
			node.style.setProperty('--tilt-x', '0deg');
			node.style.setProperty('--tilt-y', '0deg');
		}
		node.addEventListener('mousemove', onMove);
		node.addEventListener('mouseleave', onLeave);
		return { destroy() { node.removeEventListener('mousemove', onMove); node.removeEventListener('mouseleave', onLeave); } };
	}

	// Live typing code demo
	const codeLines = [
		'<script>',
		'  let count = $state(0)',
		'  let doubled = $derived(count * 2)',
		'<\/script>',
		'',
		'<button onclick={() => count++}>',
		'  Clicks: {count} → {doubled}',
		'</button>'
	];
	let typedLines = $state<string[]>([]);
	let cursorLine = $state(0);

	// Scroll-triggered visibility
	let heroVisible = $state(false);
	let featuresVisible = $state(false);
	let stepsVisible = $state(false);
	let statsVisible = $state(false);
	let ctaVisible = $state(false);

	$effect(() => { heroVisible = true; });

	$effect(() => {
		if (statsVisible) {
			statsData.forEach((s, i) => { statTweens[i]?.set(s.target); });
		}
	});

	function observe(node: Element, onVisible: () => void) {
		const io = new IntersectionObserver((entries) => {
			if (entries[0]?.isIntersecting) { onVisible(); io.disconnect(); }
		}, { threshold: 0.15 });
		io.observe(node);
		return { destroy: () => io.disconnect() };
	}

	onMount(() => {
		const onMove = (e: MouseEvent) => cursor.set({ x: e.clientX, y: e.clientY });
		document.addEventListener('mousemove', onMove);

		const delay = prefersReducedMotion.current ? 0 : 1800;
		const timeout = setTimeout(() => {
			let lineIndex = 0;
			const addLine = () => {
				if (lineIndex >= codeLines.length) return;
				typedLines = [...codeLines.slice(0, lineIndex + 1)];
				cursorLine = lineIndex;
				lineIndex++;
				setTimeout(addLine, prefersReducedMotion.current ? 0 : 120);
			};
			addLine();
		}, delay);
		return () => { clearTimeout(timeout); document.removeEventListener('mousemove', onMove); };
	});

	const inDuration = $derived(prefersReducedMotion.current ? 0 : 900);
	const inY = $derived(prefersReducedMotion.current ? 0 : 40);
	const blurAmount = $derived(prefersReducedMotion.current ? 0 : 8);
</script>

<SEOHead {seo} />

<div class="scroll-progress" aria-hidden="true"></div>
<div class="cursor-spotlight" aria-hidden="true" style="transform: translate({cursor.current.x}px, {cursor.current.y}px)"></div>

<div class="landing">

	<!-- ░░ HERO ░░ -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<section class="hero" onmousemove={handleHeroMouseMove}>
		<div class="hero-dots" aria-hidden="true"></div>
		<div class="hero-particles" aria-hidden="true">
			{#each particles as p}
				<div class="particle" style="--px: {p.x}%; --ps: {p.size}px; --pd: {p.delay}s; --pdur: {p.dur}s; --pdx: {p.dx}px"></div>
			{/each}
		</div>
		<div class="hero-orb hero-orb--a" aria-hidden="true" style="transform: translate(calc(-50% + {orbA.current.x}px), calc(-50% + {orbA.current.y}px))"></div>
		<div class="hero-orb hero-orb--b" aria-hidden="true" style="transform: translate(calc(50% + {orbB.current.x}px), calc(50% + {orbB.current.y}px))"></div>
		<div class="hero-noise" aria-hidden="true"></div>

		<div class="hero-inner">
			<div class="hero-content">
				{#if heroVisible}
					<div class="hero-badge" in:scale={{ start: 0.85, duration: inDuration, delay: 100, easing: expoOut, opacity: 0 }}>
						<span class="hero-badge-dot"></span>
						Svelte 5 · SvelteKit · ICT Level 7
					</div>

					<h1 class="hero-title">
						{#each ['The', 'Interactive', 'Way', 'to'] as word, wi}
							<span class="hero-word" in:fly={{ y: inY, duration: inDuration, delay: 220 + wi * 80, easing: expoOut, opacity: 0 }}>{word}</span>
						{/each}
						<br />
						<span class="hero-gradient" in:blur={{ amount: blurAmount, duration: Math.round(inDuration * 1.4), delay: 540, easing: expoOut }}>Master Svelte 5</span>
					</h1>

					<p class="hero-desc" in:fly={{ y: inY, duration: inDuration, delay: 350, easing: cubicOut, opacity: 0 }}>
						Learn by building. Write real Svelte code in the browser, get instant AI guidance,
						and visualize every concept in an adaptive knowledge graph.
					</p>

					<div class="hero-actions" in:fly={{ y: inY, duration: inDuration, delay: 480, easing: cubicOut, opacity: 0 }}>
						<a href="/learn">
							<Button variant="primary" size="lg">Start for Free</Button>
						</a>
						<a href="/learn" class="hero-secondary-link">
							<Icon icon="ph:play-circle" size={20} />
							See how it works
						</a>
					</div>
				{/if}
			</div>

			<!-- Live code demo panel -->
			<div class="hero-demo" in:fly={{ y: inY, duration: inDuration, delay: 600, easing: expoOut, opacity: 0 }}>
				<div class="demo-window" style="transform: perspective(1200px) rotateY({demoTilt.current.x}deg) rotateX({-demoTilt.current.y}deg)">
					<div class="demo-titlebar">
						<span class="demo-dot demo-dot--red"></span>
						<span class="demo-dot demo-dot--yellow"></span>
						<span class="demo-dot demo-dot--green"></span>
						<span class="demo-filename">Counter.svelte</span>
					</div>
					<div class="demo-code-wrap">
						<div class="demo-linenos" aria-hidden="true">
							{#each typedLines as _, i}<span>{i + 1}</span>
{/each}
						</div>
						<pre class="demo-code" aria-label="Live Svelte 5 code preview">{#each typedLines as line, i}<span class="demo-line" class:demo-line--cursor={i === cursorLine && typedLines.length < 8}>{#if line.includes('$state')}<span class="c-rune">{line}</span>{:else if line.includes('$derived')}<span class="c-rune">{line}</span>{:else if line.startsWith('<script') || line.startsWith('</script') || line.startsWith('<button') || line.startsWith('</button')}<span class="c-tag">{line}</span>{:else if line.includes('{count}') || line.includes('{doubled}')}{@html line.replace(/\{(count|doubled)\}/g, '<span class="c-expr">{$1}</span>')}{:else}{line}{/if}
</span>{/each}</pre>
					</div>
					<div class="demo-preview">
						<span class="demo-preview-label">▶ Preview — click it!</span>
						<button class="demo-counter-btn" onclick={() => demoCount++}>
							Clicks: {demoCount} → {demoDerived}
						</button>
					</div>
				</div>
			</div>
		</div>

		<div class="hero-scroll-hint" aria-hidden="true">
			<span class="scroll-dot"></span>
		</div>
	</section>

	<!-- ░░ MARQUEE ░░ -->
	<div class="marquee-wrap" aria-hidden="true">
		<div class="marquee">
			{#each [...techBadges, ...techBadges] as badge}
				<span class="marquee-badge">{badge}</span>
			{/each}
		</div>
	</div>

	<!-- ░░ STATS BAR ░░ -->
	<div class="stats-bar" use:observe={() => { statsVisible = true; }}>
		{#each statsData as stat, i}
			<div class="stat-item">
				<span class="stat-number">{Math.round(statTweens[i]?.current ?? 0).toLocaleString()}+</span>
				<span class="stat-label">{stat.label}</span>
			</div>
			{#if i < statsData.length - 1}
				<div class="stat-divider" aria-hidden="true"></div>
			{/if}
		{/each}
	</div>

	<!-- ░░ HOW IT WORKS ░░ -->
	<section class="how" use:observe={() => { stepsVisible = true; }}>
		<div class="section-inner">
			{#if stepsVisible}
				<h2 class="section-heading" in:blur={{ amount: blurAmount, duration: inDuration, easing: expoOut }}>
					How SvelteForge Works
				</h2>
				<div class="steps-grid">
					{#each steps as step, i}
						<div class="step-card" in:fly={{ y: inY, duration: inDuration, delay: i * 150, easing: expoOut, opacity: 0 }}>
							<div class="step-number">{step.n}</div>
							<div class="step-icon">
								<Icon icon={step.icon} size={28} />
							</div>
							<h3 class="step-title">{step.title}</h3>
							<p class="step-desc">{step.desc}</p>
						</div>
						{#if i < steps.length - 1}
							<div class="step-connector" aria-hidden="true" in:fade={{ duration: inDuration, delay: i * 150 + 300 }}>
								<Icon icon="ph:arrow-right" size={20} />
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- ░░ FEATURES ░░ -->
	<section class="features" use:observe={() => { featuresVisible = true; }}>
		<div class="section-inner">
			{#if featuresVisible}
				<h2 class="section-heading" in:blur={{ amount: blurAmount, duration: inDuration, easing: expoOut }}>
					Everything You Need to Go from Zero to Expert
				</h2>
				<div class="features-grid">
					{#each features as feature, i}
						<div
							class="feature-card"
							style="--card-accent: {feature.accent}; --tilt-x: 0deg; --tilt-y: 0deg; --tilt-shine: 50%"
							use:tilt
							in:fly={{ y: inY, duration: inDuration, delay: i * 80, easing: expoOut, opacity: 0 }}
						>
							<div class="feature-icon-wrap">
								<Icon icon={feature.icon} size={26} />
							</div>
							<h3 class="feature-title">{feature.title}</h3>
							<p class="feature-desc">{feature.description}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- ░░ CLOSING CTA ░░ -->
	<section class="cta-section" use:observe={() => { ctaVisible = true; }}>
		<div class="cta-orb" aria-hidden="true"></div>
		{#if ctaVisible}
			<div class="cta-inner" in:fly={{ y: inY, duration: inDuration, easing: expoOut, opacity: 0 }}>
				<h2 class="cta-heading" in:blur={{ amount: blurAmount, duration: inDuration, delay: 100, easing: expoOut }}>
					Start Building Svelte 5<br />Apps Today
				</h2>
				<p class="cta-desc" in:fade={{ duration: inDuration, delay: 200, easing: cubicOut }}>
					No install. No config. Open the browser and start writing Svelte.
				</p>
				<div class="cta-actions" in:fly={{ y: inY, duration: inDuration, delay: 300, easing: cubicOut, opacity: 0 }}>
					<a href="/learn">
						<Button variant="primary" size="lg">Start for Free</Button>
					</a>
					<a href="/learn#pricing">
						<Button variant="ghost" size="lg">View Pricing</Button>
					</a>
				</div>
			</div>
		{/if}
	</section>

</div>

<style>
	/* ── BASE ── */
	.landing {
		min-block-size: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--sf-bg-0);
	}

	a { text-decoration: none; }

	.section-inner {
		max-inline-size: 1080px;
		margin-inline: auto;
		padding-inline: var(--sf-space-5);
		inline-size: 100%;
	}

	.section-heading {
		font-family: var(--sf-font-sans);
		font-size: clamp(1.5rem, 3vw, 2.25rem);
		font-weight: 700;
		color: var(--sf-text-0);
		text-align: center;
		margin: 0 0 var(--sf-space-7);
		letter-spacing: -0.02em;
	}

	/* ── HERO ── */
	.hero {
		position: relative;
		overflow: hidden;
		min-block-size: 92dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	/* Ambient orbs */
	.hero-orb {
		position: absolute;
		border-radius: 50%;
		filter: blur(80px);
		pointer-events: none;
		will-change: transform;
	}
	.hero-orb--a {
		inline-size: 600px;
		block-size: 600px;
		background: radial-gradient(circle, oklch(0.65 0.25 275 / 0.18), transparent 70%);
		inset-block-start: -100px;
		inset-inline-start: -100px;
		animation: orb-drift-a 14s ease-in-out infinite alternate;
	}
	.hero-orb--b {
		inline-size: 500px;
		block-size: 500px;
		background: radial-gradient(circle, oklch(0.72 0.19 155 / 0.12), transparent 70%);
		inset-block-end: -80px;
		inset-inline-end: -80px;
		animation: orb-drift-b 18s ease-in-out infinite alternate;
	}
	@keyframes orb-drift-a {
		from { transform: translate(0, 0) scale(1); }
		to { transform: translate(60px, 40px) scale(1.12); }
	}
	@keyframes orb-drift-b {
		from { transform: translate(0, 0) scale(1); }
		to { transform: translate(-50px, -30px) scale(1.08); }
	}

	/* Grain overlay */
	.hero-noise {
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
		background-size: 200px 200px;
		pointer-events: none;
		opacity: 0.4;
	}

	.hero-inner {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--sf-space-8);
		align-items: center;
		max-inline-size: 1080px;
		padding-inline: var(--sf-space-5);
		inline-size: 100%;

		@media (max-width: 860px) {
			grid-template-columns: 1fr;
			text-align: center;
		}
	}

	.hero-content {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-5);
		align-items: flex-start;
		@media (max-width: 860px) { align-items: center; }
	}

	.hero-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-2);
		background: var(--sf-accent-subtle);
		border: 1px solid oklch(0.65 0.25 275 / 0.25);
		color: var(--sf-accent);
		font-size: var(--sf-font-size-xs);
		font-weight: 600;
		letter-spacing: 0.04em;
		padding: var(--sf-space-1) var(--sf-space-3);
		border-radius: var(--sf-radius-full);
	}

	.hero-badge-dot {
		display: inline-block;
		inline-size: 7px;
		block-size: 7px;
		border-radius: 50%;
		background: var(--sf-accent);
		animation: pulse-dot 2s ease-in-out infinite;
	}
	@keyframes pulse-dot {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(0.8); }
	}

	.hero-title {
		font-family: var(--sf-font-sans);
		font-size: clamp(2.2rem, 5vw, 3.75rem);
		font-weight: 800;
		line-height: 1.1;
		letter-spacing: -0.03em;
		color: var(--sf-text-0);
		margin: 0;
	}

	.hero-gradient {
		background: linear-gradient(120deg, var(--sf-accent), oklch(0.72 0.22 310), var(--sf-accent-hover));
		background-size: 200% 100%;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		animation: gradient-shift 5s ease-in-out infinite alternate;
	}
	@keyframes gradient-shift {
		from { background-position: 0% 50%; }
		to { background-position: 100% 50%; }
	}

	.hero-desc {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-lg);
		color: var(--sf-text-2);
		margin: 0;
		line-height: 1.7;
		max-inline-size: 480px;
	}

	.hero-actions {
		display: flex;
		align-items: center;
		gap: var(--sf-space-4);
		flex-wrap: wrap;
	}

	.hero-secondary-link {
		display: inline-flex;
		align-items: center;
		gap: var(--sf-space-2);
		color: var(--sf-text-2);
		font-size: var(--sf-font-size-sm);
		font-weight: 500;
		transition: color var(--sf-transition-fast);
		&:hover { color: var(--sf-text-0); }
	}

	/* ── DEMO WINDOW ── */
	.hero-demo {
		position: relative;
		@media (max-width: 860px) { display: none; }
	}

	.demo-window {
		background: var(--sf-editor-bg);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-xl);
		overflow: hidden;
		box-shadow: 0 24px 64px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.65 0.25 275 / 0.1);
	}

	.demo-titlebar {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		padding: var(--sf-space-3) var(--sf-space-4);
		background: var(--sf-bg-2);
		border-block-end: 1px solid var(--sf-bg-3);
	}

	.demo-dot {
		display: inline-block;
		inline-size: 10px;
		block-size: 10px;
		border-radius: 50%;
		&.demo-dot--red { background: #ff5f57; }
		&.demo-dot--yellow { background: #febc2e; }
		&.demo-dot--green { background: #28c840; }
	}

	.demo-filename {
		margin-inline-start: var(--sf-space-2);
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
	}

	.demo-code {
		font-family: var(--sf-font-mono);
		font-size: 0.8rem;
		line-height: 1.7;
		padding: var(--sf-space-4);
		margin: 0;
		min-block-size: 180px;
		color: var(--sf-text-1);
		overflow: hidden;
	}

	.demo-line {
		display: block;
		&.demo-line--cursor::after {
			content: '▌';
			color: var(--sf-accent);
			animation: blink-cursor 1s step-end infinite;
		}
	}
	@keyframes blink-cursor {
		0%, 100% { opacity: 1; }
		50% { opacity: 0; }
	}

	.c-rune { color: var(--sf-syntax-rune); }
	.c-tag { color: var(--sf-syntax-tag); }
	:global(.c-expr) { color: var(--sf-syntax-function); }

	.demo-preview {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		padding: var(--sf-space-3) var(--sf-space-4);
		background: var(--sf-bg-1);
		border-block-start: 1px solid var(--sf-bg-3);
	}

	.demo-preview-label {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		font-family: var(--sf-font-mono);
	}

	.demo-counter-btn {
		background: var(--sf-accent);
		color: var(--sf-accent-text);
		border: none;
		border-radius: var(--sf-radius-md);
		padding: var(--sf-space-1) var(--sf-space-3);
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 600;
		cursor: default;
	}

	/* ── STATS BAR ── */
	.stats-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0;
		background: var(--sf-bg-1);
		border-block: 1px solid var(--sf-bg-3);
		padding-block: var(--sf-space-5);
		flex-wrap: wrap;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sf-space-1);
		padding-inline: var(--sf-space-7);
	}

	.stat-number {
		font-family: var(--sf-font-sans);
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 800;
		background: linear-gradient(135deg, var(--sf-text-0), var(--sf-accent));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		letter-spacing: -0.03em;
	}

	.stat-label {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-3);
		font-weight: 500;
	}

	.stat-divider {
		inline-size: 1px;
		block-size: 48px;
		background: var(--sf-bg-3);
	}

	/* ── HOW IT WORKS ── */
	.how {
		padding-block: var(--sf-space-8);
	}

	.steps-grid {
		display: flex;
		align-items: flex-start;
		gap: 0;
		flex-wrap: wrap;

		@media (max-width: 860px) {
			flex-direction: column;
			gap: var(--sf-space-5);
		}
	}

	.step-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
		padding: var(--sf-space-5);
		min-inline-size: 200px;
	}

	.step-number {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--sf-accent);
	}

	.step-icon {
		color: var(--sf-text-0);
		margin-block: var(--sf-space-1);
	}

	.step-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-lg);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.step-desc {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
		line-height: 1.65;
	}

	.step-connector {
		align-self: center;
		color: var(--sf-text-3);
		padding-inline: var(--sf-space-2);
		padding-block-end: var(--sf-space-7);
		@media (max-width: 860px) { display: none; }
	}

	/* ── FEATURES ── */
	.features {
		padding-block: var(--sf-space-8);
		background: var(--sf-bg-1);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--sf-space-4);
	}

	.feature-card {
		position: relative;
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-5);
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
		overflow: hidden;
		transition: border-color var(--sf-transition-base), transform var(--sf-transition-base), box-shadow var(--sf-transition-base);

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: radial-gradient(circle at 0% 0%, var(--card-accent, var(--sf-accent)) / 0.06, transparent 60%);
			pointer-events: none;
			opacity: 0;
			transition: opacity var(--sf-transition-base);
		}

		&:hover {
			border-color: var(--card-accent, var(--sf-accent));
			transform: translateY(-2px);
			box-shadow: 0 8px 32px oklch(0 0 0 / 0.3), 0 0 0 1px color-mix(in oklch, var(--card-accent, var(--sf-accent)) 20%, transparent);
			&::before { opacity: 1; }
		}
	}

	.feature-icon-wrap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		inline-size: 48px;
		block-size: 48px;
		border-radius: var(--sf-radius-md);
		background: color-mix(in oklch, var(--card-accent, var(--sf-accent)) 15%, transparent);
		color: var(--card-accent, var(--sf-accent));
	}

	.feature-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0;
		letter-spacing: -0.01em;
	}

	.feature-desc {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
		line-height: 1.65;
	}

	/* ── CLOSING CTA ── */
	.cta-section {
		position: relative;
		overflow: hidden;
		padding-block: calc(var(--sf-space-8) * 1.5);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cta-orb {
		position: absolute;
		inline-size: 800px;
		block-size: 800px;
		border-radius: 50%;
		background: radial-gradient(circle, oklch(0.65 0.25 275 / 0.12), transparent 65%);
		filter: blur(60px);
		pointer-events: none;
		inset-block-start: 50%;
		inset-inline-start: 50%;
		translate: -50% -50%;
		animation: orb-drift-a 16s ease-in-out infinite alternate;
	}

	.cta-inner {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--sf-space-4);
		text-align: center;
		max-inline-size: 600px;
		padding-inline: var(--sf-space-5);
	}

	.cta-heading {
		font-family: var(--sf-font-sans);
		font-size: clamp(2rem, 4.5vw, 3.5rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		color: var(--sf-text-0);
		margin: 0;
		line-height: 1.1;
	}

	.cta-desc {
		font-size: var(--sf-font-size-lg);
		color: var(--sf-text-2);
		margin: 0;
	}

	.cta-actions {
		display: flex;
		gap: var(--sf-space-3);
		flex-wrap: wrap;
		justify-content: center;
		margin-block-start: var(--sf-space-3);
	}

	/* ── SCROLL PROGRESS BAR (CSS-native, zero JS) ── */
	.scroll-progress {
		position: fixed;
		z-index: 9999;
		inset-block-start: 0;
		inset-inline-start: 0;
		inset-inline-end: 0;
		block-size: 2px;
		background: linear-gradient(90deg, var(--sf-accent), oklch(0.78 0.22 310), var(--sf-accent-hover));
		transform-origin: 0 50%;
		animation: scroll-fill linear both;
		animation-timeline: scroll(root);
	}
	@keyframes scroll-fill {
		from { transform: scaleX(0); }
		to { transform: scaleX(1); }
	}

	/* ── DOT GRID BACKGROUND ── */
	.hero-dots {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(circle, oklch(0.65 0.25 275 / 0.12) 1px, transparent 1px);
		background-size: 28px 28px;
		mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
		pointer-events: none;
	}

	/* ── REPOSITIONED ORBS (controlled via inline style) ── */
	.hero-orb--a {
		inset-block-start: 20%;
		inset-inline-start: 15%;
		/* inline transform overridden by Spring style binding */
	}
	.hero-orb--b {
		inset-block-end: 20%;
		inset-inline-end: 15%;
	}

	/* ── SCROLL HINT ── */
	.hero-scroll-hint {
		position: absolute;
		inset-block-end: var(--sf-space-6);
		inset-inline-start: 50%;
		translate: -50% 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.scroll-dot {
		display: block;
		inline-size: 20px;
		block-size: 32px;
		border: 2px solid oklch(0.65 0.25 275 / 0.4);
		border-radius: var(--sf-radius-full);
		position: relative;

		&::after {
			content: '';
			position: absolute;
			inset-block-start: 5px;
			inset-inline-start: 50%;
			translate: -50% 0;
			inline-size: 4px;
			block-size: 8px;
			background: var(--sf-accent);
			border-radius: var(--sf-radius-full);
			animation: scroll-wheel 2s ease-in-out infinite;
		}
	}
	@keyframes scroll-wheel {
		0% { transform: translateY(0); opacity: 1; }
		80% { transform: translateY(10px); opacity: 0; }
		100% { transform: translateY(0); opacity: 0; }
	}

	/* ── MARQUEE ── */
	.marquee-wrap {
		overflow: hidden;
		border-block: 1px solid var(--sf-bg-3);
		background: var(--sf-bg-1);
		padding-block: var(--sf-space-3);
		mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
	}

	.marquee {
		display: flex;
		gap: var(--sf-space-3);
		animation: marquee-scroll 30s linear infinite;
		width: max-content;
	}

	@keyframes marquee-scroll {
		from { transform: translateX(0); }
		to { transform: translateX(-50%); }
	}

	.marquee-badge {
		display: inline-flex;
		align-items: center;
		padding: var(--sf-space-1) var(--sf-space-3);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-full);
		background: var(--sf-bg-2);
		font-size: var(--sf-font-size-xs);
		font-weight: 600;
		color: var(--sf-text-2);
		white-space: nowrap;
		letter-spacing: 0.03em;
	}

	/* ── 3D TILT ON FEATURE CARDS ── */
	.feature-card {
		transform-style: preserve-3d;
		transform: perspective(800px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
		transition: transform 120ms ease-out, border-color var(--sf-transition-base), box-shadow var(--sf-transition-base);

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			border-radius: inherit;
			background: linear-gradient(
				105deg,
				oklch(1 0 0 / 0.04) 0%,
				transparent 40%,
				transparent 60%,
				oklch(1 0 0 / 0.02) 100%
			);
			background-position: var(--tilt-shine, 50%) 50%;
			pointer-events: none;
			opacity: 0;
			transition: opacity var(--sf-transition-base);
		}

		&:hover::after { opacity: 1; }
	}

	/* ── DEMO CODE LINE NUMBERS ── */
	.demo-code-wrap {
		display: flex;
		min-block-size: 180px;
	}

	.demo-linenos {
		display: flex;
		flex-direction: column;
		padding: var(--sf-space-4) var(--sf-space-3);
		background: oklch(0 0 0 / 0.15);
		border-inline-end: 1px solid var(--sf-bg-3);
		min-inline-size: 36px;
		text-align: right;
		color: var(--sf-text-3);
		font-family: var(--sf-font-mono);
		font-size: 0.75rem;
		line-height: 1.7;
		user-select: none;
	}

	.demo-code {
		flex: 1;
	}

	/* ── COUNTER BUTTON CLICK EFFECT ── */
	.demo-counter-btn {
		cursor: pointer;
		transition: transform var(--sf-transition-fast), box-shadow var(--sf-transition-fast);

		&:active { transform: scale(0.95); }
		&:hover { box-shadow: 0 0 0 3px oklch(0.65 0.25 275 / 0.3); }
	}

	/* ── GLOBAL CURSOR SPOTLIGHT ── */
	.cursor-spotlight {
		position: fixed;
		z-index: 1;
		pointer-events: none;
		inset-block-start: 0;
		inset-inline-start: 0;
		inline-size: 700px;
		block-size: 700px;
		border-radius: 50%;
		background: radial-gradient(circle, oklch(0.65 0.25 275 / 0.055), transparent 55%);
		margin-inline-start: -350px;
		margin-block-start: -350px;
		will-change: transform;
	}

	/* ── HERO FLOATING PARTICLES ── */
	.hero-particles {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.particle {
		position: absolute;
		inset-block-end: -8px;
		inset-inline-start: var(--px);
		inline-size: var(--ps);
		block-size: var(--ps);
		border-radius: 50%;
		background: oklch(0.65 0.25 275 / 0.45);
		animation: float-particle var(--pdur) var(--pd) ease-in infinite;
	}
	@keyframes float-particle {
		0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
		6%   { opacity: 0.9; }
		50%  { transform: translateY(-40vh) translateX(calc(var(--pdx) * 0.5)); opacity: 0.5; }
		94%  { opacity: 0; }
		100% { transform: translateY(-75vh) translateX(var(--pdx)); opacity: 0; }
	}

	/* ── SPLIT-WORD HERO ── */
	.hero-word {
		display: inline-block;
		margin-inline-end: 0.26em;
	}

	/* ── HERO GRADIENT SHIMMER SWEEP ── */
	.hero-gradient {
		background-size: 300% 100%;
		animation: gradient-shift 5s ease-in-out infinite alternate, shimmer-sweep 4s ease-in-out 3s infinite;
	}
	@keyframes shimmer-sweep {
		0%   { filter: brightness(1); }
		40%  { filter: brightness(1.35) drop-shadow(0 0 12px oklch(0.65 0.25 275 / 0.4)); }
		100% { filter: brightness(1); }
	}

	/* ── DEMO WINDOW DEPTH SHADOW ── */
	.demo-window {
		transition: transform 80ms linear;
		box-shadow:
			0 30px 80px oklch(0 0 0 / 0.6),
			0 0 0 1px oklch(0.65 0.25 275 / 0.12),
			0 6px 20px oklch(0.65 0.25 275 / 0.08),
			inset 0 1px 0 oklch(1 0 0 / 0.05);
	}

	/* ── ANIMATED CONIC GRADIENT CTA BORDER ── */
	@property --cta-angle {
		syntax: '<angle>';
		inherits: false;
		initial-value: 0deg;
	}

	.cta-section {
		border-block-start: none;

		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background: conic-gradient(
				from var(--cta-angle),
				transparent 0%,
				oklch(0.65 0.25 275 / 0.3) 8%,
				oklch(0.78 0.22 310 / 0.2) 16%,
				transparent 24%
			);
			pointer-events: none;
			animation: cta-rotate 8s linear infinite;
			mask-image: radial-gradient(ellipse 100% 100% at 50% 50%, black 40%, transparent 80%);
		}
	}
	@keyframes cta-rotate {
		to { --cta-angle: 360deg; }
	}

	/* ── STEP NUMBERS GLOW ── */
	.step-number {
		text-shadow: 0 0 16px oklch(0.65 0.25 275 / 0.6);
		letter-spacing: 0.15em;
	}

	/* ── SECTION HEADING ACCENT LINE ── */
	.section-heading {
		position: relative;
		display: inline-block;
		padding-block-end: var(--sf-space-3);

		&::after {
			content: '';
			position: absolute;
			inset-block-end: 0;
			inset-inline-start: 50%;
			translate: -50% 0;
			inline-size: 48px;
			block-size: 2px;
			background: linear-gradient(90deg, transparent, var(--sf-accent), oklch(0.78 0.22 310), transparent);
			border-radius: var(--sf-radius-full);
		}
	}

	/* ── MARQUEE PAUSE ON HOVER ── */
	.marquee-wrap:hover .marquee {
		animation-play-state: paused;
	}
</style>
