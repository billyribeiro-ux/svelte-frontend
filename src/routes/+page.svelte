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

	// Curriculum track data
	const curriculumTracks = [
		{ slug: 'foundations', title: 'Web Foundations', description: 'HTML, CSS, Tailwind, TypeScript — everything before Svelte.', icon: 'ph:layout', accent: 'oklch(0.78 0.18 75)', modules: 6, lessons: 35 },
		{ slug: 'svelte-core', title: 'Svelte 5 Core', description: 'Components, runes, reactivity, composition and advanced patterns.', icon: 'ph:lightning', accent: 'oklch(0.78 0.22 330)', modules: 8, lessons: 42 },
		{ slug: 'sveltekit', title: 'SvelteKit Mastery', description: 'Routing, data loading, form actions, API routes, SSR and deployment.', icon: 'ph:rocket-launch', accent: 'oklch(0.72 0.19 155)', modules: 8, lessons: 38 },
		{ slug: 'projects', title: 'Build Projects', description: 'A blog, dashboard, task manager and full SaaS app — all in Svelte.', icon: 'ph:trophy', accent: 'oklch(0.65 0.25 275)', modules: 4, lessons: 24 }
	];

	// Testimonials
	const testimonials = [
		{ name: 'Liam Thornton', role: 'Frontend Engineer · Dublin', avatar: 'LT', quote: 'SvelteForge is the only platform where I actually retained what I learned. The AI tutor explained every concept at exactly my level — not one step too fast.' },
		{ name: 'Priya Menon', role: 'Full-Stack Developer · London', avatar: 'PM', quote: 'I went from knowing nothing about Svelte to building a full SvelteKit app in 3 weeks. The concept graph changed how I think about learning entirely.' },
		{ name: 'Jake Owens', role: 'Bootcamp Graduate · NYC', avatar: 'JO', quote: 'Other platforms give you videos to watch. SvelteForge makes you write code from lesson one. That\'s the only reason it actually works.' }
	];

	// FAQ
	const faqs = [
		{ q: 'Do I need to know React or Vue first?', a: 'No prior framework knowledge required. SvelteForge is designed for anyone with basic HTML, CSS and JavaScript. The Foundations track covers exactly what you need before diving into Svelte.' },
		{ q: 'What version of Svelte does this cover?', a: 'Everything is built for Svelte 5 and SvelteKit 2 — including full coverage of runes ($state, $derived, $effect, $props, $bindable, $inspect), snippets, and the new event system.' },
		{ q: 'How is this different from the official Svelte tutorial?', a: 'The official tutorial introduces Svelte basics. SvelteForge takes you from zero to production-ready with AI guidance, a concept graph, four real project builds, and ICT Level 7-aligned content.' },
		{ q: 'Can I cancel my subscription any time?', a: 'Yes. Monthly subscribers can cancel at any time with no penalty. Annual subscribers can cancel before renewal. You keep full access until the end of your billing period.' },
		{ q: 'Is there a free tier?', a: 'The first module of every track is free — no credit card required. You can explore Svelte basics, HTML essentials, and the full concept graph before deciding to subscribe.' },
		{ q: 'Is the content aligned to any qualifications?', a: 'Yes. The curriculum is aligned to ICT Level 7 standards, making SvelteForge suitable for professional development portfolios and employer-recognised skill certification.' }
	];

	let openFaq = $state<number | null>(null);

	// Learning Path Timeline data
	const pathData = [
		{
			n: '01', slug: 'foundations', title: 'Web Foundations', accent: 'oklch(0.78 0.18 75)', icon: 'ph:layout',
			hours: 20, modules: 6, lessons: 35,
			topics: ['HTML5', 'CSS', 'Flexbox', 'Grid', 'Tailwind', 'TypeScript'],
			outcome: 'Build and style any static web page with confidence'
		},
		{
			n: '02', slug: 'svelte-core', title: 'Svelte 5 Core', accent: 'oklch(0.78 0.22 330)', icon: 'ph:lightning',
			hours: 25, modules: 8, lessons: 42,
			topics: ['$state', '$derived', '$effect', 'Components', 'Snippets', 'Runes'],
			outcome: 'Write reactive Svelte 5 components from scratch'
		},
		{
			n: '03', slug: 'sveltekit', title: 'SvelteKit Mastery', accent: 'oklch(0.72 0.19 155)', icon: 'ph:rocket-launch',
			hours: 22, modules: 8, lessons: 38,
			topics: ['Routing', 'Load Functions', 'Form Actions', 'SSR', 'Hooks'],
			outcome: 'Ship production-ready full-stack applications'
		},
		{
			n: '04', slug: 'projects', title: 'Build Projects', accent: 'oklch(0.65 0.25 275)', icon: 'ph:trophy',
			hours: 30, modules: 4, lessons: 24,
			topics: ['Blog', 'Dashboard', 'Task Manager', 'SaaS App'],
			outcome: 'Own 4 portfolio-grade Svelte applications'
		}
	];

	// Document-style indexed TOC
	const indexedToc = [
		{ n: 'I',    title: 'How SvelteForge Works',  sub: 'The three-step learning method',         time: '3 min',  href: '#how' },
		{ n: 'II',   title: 'Platform Features',       sub: 'Six core tools powering your learning',  time: '4 min',  href: '#features' },
		{ n: 'III',  title: 'Complete Curriculum',     sub: 'Four tracks — 139+ lessons',             time: '2 min',  href: '#curriculum',
			children: [
				{ n: 'A', title: 'Web Foundations',     href: '/learn/foundations' },
				{ n: 'B', title: 'Svelte 5 Core',       href: '/learn/svelte-core' },
				{ n: 'C', title: 'SvelteKit Mastery',   href: '/learn/sveltekit' },
				{ n: 'D', title: 'Build Projects',      href: '/learn/projects' }
			]
		},
		{ n: 'IV',   title: 'Full Course Syllabus',   sub: 'Every module expanded',                  time: '10 min', href: '#syllabus' },
		{ n: 'V',    title: 'Student Reviews',         sub: 'What developers are saying',             time: '2 min',  href: '#testimonials' },
		{ n: 'VI',   title: 'FAQ',                     sub: 'Six common questions answered',          time: '3 min',  href: '#faq' },
		{ n: 'VII',  title: 'Pricing',                 sub: 'Monthly and Annual plans',               time: '1 min',  href: '/pricing' }
	];

	let pathVisible = $state(false);
	let indexedVisible = $state(false);

	// Full course syllabus data (for TOC section)
	const syllabusData = [
		{
			slug: 'foundations', title: 'Web Foundations', accent: 'oklch(0.78 0.18 75)', icon: 'ph:layout',
			modules: [
				{ title: 'HTML Essentials', lessons: 4 },
				{ title: 'Tailwind CSS', lessons: 6 },
				{ title: 'CSS Fundamentals', lessons: 7 },
				{ title: 'CSS Layout', lessons: 6 },
				{ title: 'Modern CSS', lessons: 5 },
				{ title: 'TypeScript Essentials', lessons: 7 }
			]
		},
		{
			slug: 'svelte-core', title: 'Svelte 5 Core', accent: 'oklch(0.78 0.22 330)', icon: 'ph:lightning',
			modules: [
				{ title: 'Svelte Basics', lessons: 7 },
				{ title: 'Runes & Reactivity', lessons: 6 },
				{ title: 'Control Flow', lessons: 4 },
				{ title: 'Components & Props', lessons: 5 },
				{ title: 'Snippets & Composition', lessons: 5 },
				{ title: 'Events & Bindings', lessons: 5 },
				{ title: 'Transitions & Animations', lessons: 5 },
				{ title: 'Advanced Patterns', lessons: 5 }
			]
		},
		{
			slug: 'sveltekit', title: 'SvelteKit Mastery', accent: 'oklch(0.72 0.19 155)', icon: 'ph:rocket-launch',
			modules: [
				{ title: 'Routing', lessons: 5 },
				{ title: 'Data Loading', lessons: 5 },
				{ title: 'Form Actions', lessons: 5 },
				{ title: 'API Routes', lessons: 5 },
				{ title: 'Hooks & Middleware', lessons: 4 },
				{ title: 'SSR & Rendering', lessons: 5 },
				{ title: 'Environment & Config', lessons: 5 },
				{ title: 'Advanced SvelteKit', lessons: 4 }
			]
		},
		{
			slug: 'projects', title: 'Build Projects', accent: 'oklch(0.65 0.25 275)', icon: 'ph:trophy',
			modules: [
				{ title: 'Build a Blog', lessons: 6 },
				{ title: 'Build a Dashboard', lessons: 6 },
				{ title: 'Build a Task Manager', lessons: 5 },
				{ title: 'Build a SaaS App', lessons: 7 }
			]
		}
	];

	// Floating page TOC
	const tocSections = [
		{ id: 'hero',         label: 'Top' },
		{ id: 'how',          label: 'How It Works' },
		{ id: 'features',     label: 'Features' },
		{ id: 'curriculum',   label: 'Curriculum' },
		{ id: 'path',         label: 'Learning Path' },
		{ id: 'index',        label: 'Doc Index' },
		{ id: 'syllabus',     label: 'Full Syllabus' },
		{ id: 'testimonials', label: 'Reviews' },
		{ id: 'faq',          label: 'FAQ' },
		{ id: 'cta',          label: 'Get Started' }
	];
	let activeSection = $state('hero');
	let tocVisible = $state(false);
	let openTracks = $state<Record<string, boolean>>({});

	// Scroll-triggered visibility
	let heroVisible = $state(false);
	let featuresVisible = $state(false);
	let stepsVisible = $state(false);
	let statsVisible = $state(false);
	let ctaVisible = $state(false);
	let curriculumVisible = $state(false);
	let testimonialsVisible = $state(false);
	let faqVisible = $state(false);
	let syllabusVisible = $state(false);

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

		// Section tracking for floating TOC
		const sectionIO = new IntersectionObserver((entries) => {
			entries.forEach((e) => {
				if (e.isIntersecting && e.target.id) {
					activeSection = e.target.id;
					tocVisible = true;
				}
			});
		}, { threshold: 0.3 });
		tocSections.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (el) sectionIO.observe(el);
		});

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
		return () => { clearTimeout(timeout); document.removeEventListener('mousemove', onMove); sectionIO.disconnect(); };
	});

	const inDuration = $derived(prefersReducedMotion.current ? 0 : 900);
	const inY = $derived(prefersReducedMotion.current ? 0 : 40);
	const blurAmount = $derived(prefersReducedMotion.current ? 0 : 8);
</script>

<SEOHead {seo} />

<div class="scroll-progress" aria-hidden="true"></div>

<nav class="page-toc" class:toc-hidden={!tocVisible} aria-label="Page sections">
	{#each tocSections as sec}
		<a href="#{sec.id}" class="toc-dot" class:toc-dot--active={activeSection === sec.id} aria-label={sec.label}>
			<span class="toc-indicator"></span>
			<span class="toc-label">{sec.label}</span>
		</a>
	{/each}
</nav>

<div class="cursor-spotlight" aria-hidden="true" style="transform: translate({cursor.current.x}px, {cursor.current.y}px)"></div>

<div class="landing">

	<!-- ░░ HERO ░░ -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<section id="hero" class="hero" onmousemove={handleHeroMouseMove}>
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
	<section id="how" class="how" use:observe={() => { stepsVisible = true; }}>
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
	<section id="features" class="features" use:observe={() => { featuresVisible = true; }}>
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

	<!-- ░░ CURRICULUM ░░ -->
	<section id="curriculum" class="curriculum" use:observe={() => { curriculumVisible = true; }}>
		<div class="section-inner">
			{#if curriculumVisible}
				<h2 class="section-heading" in:blur={{ amount: blurAmount, duration: inDuration, easing: expoOut }}>
					The Complete Curriculum
				</h2>
				<p class="section-sub" in:fade={{ duration: inDuration, delay: 100, easing: cubicOut }}>
					Four progressive tracks. 139+ lessons. Every concept from fundamentals to SaaS in Svelte.
				</p>
				<div class="curriculum-grid">
					{#each curriculumTracks as track, i}
						<a
							href="/learn/{track.slug}"
							class="curriculum-card"
							style="--card-accent: {track.accent}"
							in:fly={{ y: inY, duration: inDuration, delay: i * 100, easing: expoOut, opacity: 0 }}
						>
							<div class="curriculum-icon-wrap">
								<Icon icon={track.icon} size={28} />
							</div>
							<div class="curriculum-body">
								<h3 class="curriculum-title">{track.title}</h3>
								<p class="curriculum-desc">{track.description}</p>
							</div>
							<div class="curriculum-meta">
								<span class="curriculum-stat"><Icon icon="ph:folder" size={12} />{track.modules} modules</span>
								<span class="curriculum-stat"><Icon icon="ph:file-text" size={12} />{track.lessons} lessons</span>
							</div>
							<div class="curriculum-arrow"><Icon icon="ph:arrow-right" size={18} /></div>
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- ░░ LEARNING PATH TIMELINE TOC ░░ -->
	<section id="path" class="path-section" use:observe={() => { pathVisible = true; }}>
		<div class="section-inner">
			{#if pathVisible}
				<h2 class="section-heading" in:blur={{ amount: blurAmount, duration: inDuration, easing: expoOut }}>
					Your Learning Journey
				</h2>
				<p class="section-sub" in:fade={{ duration: inDuration, delay: 100, easing: cubicOut }}>
					Four tracks. One clear path from complete beginner to full-stack Svelte developer.
				</p>
				<div class="path-timeline">
					{#each pathData as track, i}
						<div
							class="path-node"
							style="--card-accent: {track.accent}"
							in:fly={{ y: inY, duration: inDuration, delay: i * 140, easing: expoOut, opacity: 0 }}
						>
							<!-- Connecting line above (except first) -->
							{#if i > 0}
								<div class="path-line" in:fade={{ duration: inDuration, delay: i * 140 + 200 }}></div>
							{/if}

							<div class="path-step-num">{track.n}</div>

							<a href="/learn/{track.slug}" class="path-card">
								<div class="path-card-top">
									<div class="path-card-icon">
										<Icon icon={track.icon} size={24} />
									</div>
									<div class="path-card-meta">
										<h3 class="path-card-title">{track.title}</h3>
										<div class="path-card-stats">
											<span><Icon icon="ph:folder" size={12} />{track.modules} modules</span>
											<span><Icon icon="ph:file-text" size={12} />{track.lessons} lessons</span>
											<span><Icon icon="ph:clock" size={12} />~{track.hours}h</span>
										</div>
									</div>
								</div>
								<div class="path-topics">
									{#each track.topics as topic}
										<span class="path-topic">{topic}</span>
									{/each}
								</div>
								<p class="path-outcome">
									<Icon icon="ph:check-circle" size={14} />
									{track.outcome}
								</p>
							</a>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- ░░ DOCUMENT INDEX TOC ░░ -->
	<section id="index" class="doc-toc-section" use:observe={() => { indexedVisible = true; }}>
		<div class="section-inner doc-toc-inner">
			{#if indexedVisible}
				<div class="doc-toc-wrap" in:fly={{ y: inY, duration: inDuration, easing: expoOut, opacity: 0 }}>
					<div class="doc-toc-header" in:blur={{ amount: blurAmount, duration: inDuration, delay: 80, easing: expoOut }}>
						<h2 class="doc-toc-title">Table of Contents</h2>
						<p class="doc-toc-sub">Everything in this page — click to jump to any section.</p>
					</div>
					<ol class="doc-toc-list">
						{#each indexedToc as item, i}
							<li class="doc-toc-item" in:fly={{ y: inY, duration: inDuration, delay: 150 + i * 60, easing: expoOut, opacity: 0 }}>
								<a href={item.href} class="doc-toc-link">
									<span class="doc-toc-num">{item.n}.</span>
									<span class="doc-toc-name">
										{item.title}
										{#if item.sub}
											<span class="doc-toc-sub-label">{item.sub}</span>
										{/if}
									</span>
									<span class="doc-toc-dots" aria-hidden="true"></span>
									<span class="doc-toc-time">{item.time}</span>
								</a>
								{#if item.children}
									<ol class="doc-toc-children">
										{#each item.children as child}
											<li class="doc-toc-child">
												<a href={child.href} class="doc-toc-child-link">
													<span class="doc-toc-num">{child.n}.</span>
													<span>{child.title}</span>
												</a>
											</li>
										{/each}
									</ol>
								{/if}
							</li>
						{/each}
					</ol>
					<div class="doc-toc-footer">
						<Icon icon="ph:book-open" size={14} />
						Total estimated study time: <strong>~97 hours</strong>
					</div>
				</div>
			{/if}
		</div>
	</section>

	<!-- ░░ FULL SYLLABUS TOC ░░ -->
	<section id="syllabus" class="syllabus" use:observe={() => { syllabusVisible = true; }}>
		<div class="section-inner">
			{#if syllabusVisible}
				<h2 class="section-heading" in:blur={{ amount: blurAmount, duration: inDuration, easing: expoOut }}>
					Full Course Syllabus
				</h2>
				<p class="section-sub" in:fade={{ duration: inDuration, delay: 100, easing: cubicOut }}>
					Every module, every lesson — browse the complete syllabus before you commit.
				</p>
				<div class="syllabus-grid">
					{#each syllabusData as track, i}
						<div
							class="syllabus-track"
							style="--card-accent: {track.accent}"
							in:fly={{ y: inY, duration: inDuration, delay: i * 100, easing: expoOut, opacity: 0 }}
						>
							<button
								class="syllabus-header"
								class:syllabus-header--open={openTracks[track.slug]}
								onclick={() => { openTracks[track.slug] = !openTracks[track.slug]; }}
							>
								<span class="syllabus-icon"><Icon icon={track.icon} size={20} /></span>
								<span class="syllabus-track-title">{track.title}</span>
								<span class="syllabus-track-count">
									{track.modules.reduce((s, m) => s + m.lessons, 0)} lessons
								</span>
								<Icon icon={openTracks[track.slug] ? 'ph:caret-up' : 'ph:caret-down'} size={16} />
							</button>
							<div class="syllabus-modules" class:syllabus-modules--open={openTracks[track.slug]}>
								{#each track.modules as mod, mi}
									<div class="syllabus-module">
										<span class="syllabus-mod-num">{String(mi + 1).padStart(2, '0')}</span>
										<span class="syllabus-mod-title">{mod.title}</span>
										<span class="syllabus-mod-count">{mod.lessons}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- ░░ TESTIMONIALS ░░ -->
	<section id="testimonials" class="testimonials" use:observe={() => { testimonialsVisible = true; }}>
		<div class="section-inner">
			{#if testimonialsVisible}
				<h2 class="section-heading" in:blur={{ amount: blurAmount, duration: inDuration, easing: expoOut }}>
					Developers Who Levelled Up
				</h2>
				<div class="testimonials-grid">
					{#each testimonials as t, i}
						<div class="testimonial-card" in:fly={{ y: inY, duration: inDuration, delay: i * 120, easing: expoOut, opacity: 0 }}>
							<div class="testimonial-stars" aria-label="5 stars">★★★★★</div>
							<p class="testimonial-quote">"{t.quote}"</p>
							<div class="testimonial-author">
								<div class="testimonial-avatar">{t.avatar}</div>
								<div class="testimonial-info">
									<span class="testimonial-name">{t.name}</span>
									<span class="testimonial-role">{t.role}</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- ░░ FAQ ░░ -->
	<section id="faq" class="faq" use:observe={() => { faqVisible = true; }}>
		<div class="section-inner faq-inner">
			{#if faqVisible}
				<h2 class="section-heading" in:blur={{ amount: blurAmount, duration: inDuration, easing: expoOut }}>
					Frequently Asked Questions
				</h2>
				<div class="faq-list">
					{#each faqs as faq, i}
						<div
							class="faq-item"
							class:faq-open={openFaq === i}
							in:fly={{ y: inY, duration: inDuration, delay: i * 70, easing: expoOut, opacity: 0 }}
						>
							<button class="faq-question" onclick={() => { openFaq = openFaq === i ? null : i; }}>
								<span>{faq.q}</span>
								<Icon icon={openFaq === i ? 'ph:minus' : 'ph:plus'} size={18} />
							</button>
							<div class="faq-answer" class:faq-answer--open={openFaq === i}>
								<p>{faq.a}</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- ░░ CLOSING CTA ░░ -->
	<section id="cta" class="cta-section" use:observe={() => { ctaVisible = true; }}>
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
	/* ══════════════════════════════════════════
	   CSS AS OF APRIL 2026 — NEW FEATURES
	   ══════════════════════════════════════════ */

	/* 1. interpolate-size — animate height: auto (Chrome 129, Firefox 131) */
	:root {
		interpolate-size: allow-keywords;
	}

	/* 2. text-wrap: balance on headings — Baseline 2024 */
	h1, h2, h3, .section-heading, .hero-title, .cta-heading, .step-title, .feature-title {
		text-wrap: balance;
	}

	/* 3. text-wrap: pretty on body copy — prevents orphans — Baseline 2024 */
	p, .hero-desc, .step-desc, .feature-desc, .testimonial-quote, .faq-answer p {
		text-wrap: pretty;
	}

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

	/* ═══════════════════════════════════════
	   ADDITIONAL STYLES
	   ═══════════════════════════════════════ */

	/* ── CUSTOM SCROLLBAR ── */
	::-webkit-scrollbar { inline-size: 6px; block-size: 6px; }
	::-webkit-scrollbar-track { background: var(--sf-bg-1); }
	::-webkit-scrollbar-thumb {
		background: var(--sf-bg-4);
		border-radius: var(--sf-radius-full);
		&:hover { background: var(--sf-accent); }
	}

	/* ── TEXT SELECTION COLOR ── */
	::selection {
		background: oklch(0.65 0.25 275 / 0.25);
		color: var(--sf-text-0);
	}

	/* ── FOCUS RINGS (keyboard navigation) ── */
	:focus-visible {
		outline: 2px solid var(--sf-accent);
		outline-offset: 3px;
		border-radius: var(--sf-radius-sm);
	}
	button:focus-visible, a:focus-visible {
		outline: 2px solid var(--sf-accent);
		outline-offset: 3px;
	}

	/* ── FONT SMOOTHING & RENDERING ── */
	.landing {
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	/* ── HERO BADGE SHIMMER SWEEP ── */
	.hero-badge {
		position: relative;
		overflow: hidden;

		&::after {
			content: '';
			position: absolute;
			inset-block-start: 0;
			inset-inline-start: -100%;
			inline-size: 60%;
			block-size: 100%;
			background: linear-gradient(90deg, transparent, oklch(1 0 0 / 0.15), transparent);
			animation: badge-shimmer 4s ease-in-out 2s infinite;
		}
	}
	@keyframes badge-shimmer {
		0% { inset-inline-start: -100%; }
		40%, 100% { inset-inline-start: 180%; }
	}

	/* ── DEMO WINDOW PULSING BORDER GLOW ── */
	.demo-window {
		animation: demo-glow 4s ease-in-out 2s infinite alternate;
	}
	@keyframes demo-glow {
		from { box-shadow: 0 30px 80px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.65 0.25 275 / 0.12), 0 6px 20px oklch(0.65 0.25 275 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.05); }
		to   { box-shadow: 0 30px 80px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.65 0.25 275 / 0.35), 0 6px 20px oklch(0.65 0.25 275 / 0.18), inset 0 1px 0 oklch(1 0 0 / 0.08); }
	}

	/* ── ANIMATED SECTION HEADING UNDERLINE (grows from center) ── */
	.section-heading::after {
		transform-origin: center;
		animation: underline-grow 600ms var(--sf-ease-out) both;
		animation-timeline: view();
		animation-range: entry 10% entry 50%;
	}
	@keyframes underline-grow {
		from { scale: 0 1; }
		to   { scale: 1 1; }
	}

	/* ── TESTIMONIAL PULL QUOTE MARKS ── */
	.testimonial-card {
		position: relative;

		&::before {
			content: '\201C';
			position: absolute;
			inset-block-start: var(--sf-space-4);
			inset-inline-end: var(--sf-space-4);
			font-size: 5rem;
			line-height: 1;
			color: oklch(0.65 0.25 275 / 0.08);
			font-family: Georgia, serif;
			pointer-events: none;
			user-select: none;
		}
	}

	/* ── STEP CARD HOVER LIFT + ACCENT BORDER ── */
	.step-card {
		border-radius: var(--sf-radius-lg);
		transition: transform var(--sf-transition-base), background var(--sf-transition-base);
		cursor: default;

		&:hover {
			transform: translateY(-4px);
			background: var(--sf-bg-1);
		}
	}

	.step-number {
		font-size: var(--sf-font-size-xs);
		font-family: var(--sf-font-mono);
	}

	/* ── STEP CONNECTOR ARROW ANIMATION ── */
	.step-connector {
		animation: connector-pulse 3s ease-in-out infinite alternate;
	}
	@keyframes connector-pulse {
		from { opacity: 0.4; translate: 0 0; }
		to   { opacity: 0.9; translate: 4px 0; }
	}

	/* ── STATS NUMBER GRADIENT TEXT ── */
	.stat-number {
		background: linear-gradient(135deg, var(--sf-text-0) 30%, var(--sf-accent));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* ── STATS DIVIDER GRADIENT ── */
	.stat-divider {
		background: linear-gradient(to bottom, transparent, var(--sf-bg-3), transparent);
	}

	/* ── SECTION GRADIENT SEPARATOR (between alternating bg sections) ── */
	.features,
	.testimonials,
	.syllabus {
		position: relative;

		&::before {
			content: '';
			position: absolute;
			inset-block-start: 0;
			inset-inline: 0;
			block-size: 1px;
			background: linear-gradient(90deg, transparent, var(--sf-bg-3) 20%, var(--sf-bg-3) 80%, transparent);
		}
	}

	/* ── CURRICULUM CARD LEFT ACCENT ON HOVER ── */
	.curriculum-card {
		position: relative;

		&::before {
			content: '';
			position: absolute;
			inset-block: 0;
			inset-inline-start: 0;
			inline-size: 3px;
			background: var(--card-accent, var(--sf-accent));
			border-radius: var(--sf-radius-full);
			scale: 1 0;
			transform-origin: center;
			transition: scale var(--sf-transition-base);
		}

		&:hover::before { scale: 1 1; }
	}

	/* ── FEATURE CARD ICON GLOW ON HOVER ── */
	.feature-icon-wrap {
		transition: box-shadow var(--sf-transition-base), scale var(--sf-transition-base);

		.feature-card:hover & {
			box-shadow: 0 0 0 4px color-mix(in oklch, var(--card-accent, var(--sf-accent)) 20%, transparent);
			scale: 1.1;
		}
	}

	/* ── HERO SECONDARY LINK PLAY ICON ANIMATION ── */
	.hero-secondary-link :global(svg) {
		transition: scale var(--sf-transition-fast);
	}
	.hero-secondary-link:hover :global(svg) {
		scale: 1.2;
	}

	/* ── HERO STATS GRADIENT BORDER ── */
	.stats-bar {
		position: relative;
		overflow: hidden;

		&::after {
			content: '';
			position: absolute;
			inset-block-end: 0;
			inset-inline: 0;
			block-size: 1px;
			background: linear-gradient(90deg, transparent, var(--sf-bg-3) 20%, var(--sf-bg-3) 80%, transparent);
		}
	}

	/* ── CTA HEADING GRADIENT TEXT ── */
	.cta-heading {
		background: linear-gradient(135deg, var(--sf-text-0) 40%, var(--sf-accent));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* ── MARQUEE BADGE ALTERNATING ACCENT ── */
	.marquee-badge:nth-child(5n + 1) {
		border-color: oklch(0.65 0.25 275 / 0.25);
		color: var(--sf-accent);
	}
	.marquee-badge:nth-child(7n + 3) {
		border-color: oklch(0.72 0.22 310 / 0.2);
		color: oklch(0.78 0.22 310);
	}

	/* ── SYLLABUS HEADER CARET ROTATION ── */
	.syllabus-header :global(svg:last-child) {
		transition: rotate var(--sf-transition-base);
	}
	.syllabus-header--open :global(svg:last-child) {
		rotate: 180deg;
	}

	/* ── FAQs ── */
	.faq-item {
		position: relative;
		
		/* Inset left accent for open items */
		&.faq-open {
			background: color-mix(in oklch, oklch(0.65 0.25 275 / 0.04), var(--sf-bg-1));
		}

		&.faq-open::before {
			content: '';
			position: absolute;
			inset-block: 0;
			inset-inline-start: 0;
			inline-size: 3px;
			background: var(--sf-accent);
			border-start-start-radius: var(--sf-radius-lg);
			border-end-start-radius: var(--sf-radius-lg);
		}
	}

	/* ── SCROLL HINT FADE OUT AFTER SCROLL ── */
	.hero-scroll-hint {
		animation: fade-hint 1s ease-in 4s forwards;
	}
	@keyframes fade-hint {
		to { opacity: 0; pointer-events: none; }
	}

	/* ── TOC ACTIVE DOT RING ── */
	.toc-dot--active .toc-indicator {
		box-shadow: 0 0 0 3px oklch(0.65 0.25 275 / 0.25);
	}

	/* ── PRINT STYLES ── */
	@media print {
		.scroll-progress, .cursor-spotlight, .page-toc,
		.hero-particles, .hero-orb, .hero-noise, .hero-dots,
		.hero-scroll-hint, .marquee-wrap, .cta-orb { display: none !important; }

		.landing { background: white; color: black; }

		.section-heading { color: black; }

		a { color: black; text-decoration: underline; }
	}

	/* ═══════════════════════════════════════
	   LEARNING PATH TIMELINE TOC
	   ═══════════════════════════════════════ */
	.path-section {
		padding-block: var(--sf-space-8);
	}

	.path-timeline {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
		max-inline-size: 680px;
		margin-inline: auto;
	}

	.path-node {
		position: relative;
		inline-size: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.path-line {
		inline-size: 2px;
		block-size: var(--sf-space-5);
		background: linear-gradient(to bottom, var(--card-accent, var(--sf-accent)), oklch(from var(--card-accent, var(--sf-accent)) l c h / 0.3));
	}

	.path-step-num {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 36px;
		block-size: 36px;
		border-radius: 50%;
		background: color-mix(in oklch, var(--card-accent, var(--sf-accent)) 15%, var(--sf-bg-0));
		border: 2px solid var(--card-accent, var(--sf-accent));
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		font-weight: 700;
		color: var(--card-accent, var(--sf-accent));
		margin-block-end: var(--sf-space-3);
		flex-shrink: 0;
	}

	.path-card {
		inline-size: 100%;
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-xl);
		padding: var(--sf-space-5);
		text-decoration: none;
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
		transition: border-color var(--sf-transition-base), transform var(--sf-transition-base), box-shadow var(--sf-transition-base);

		&:hover {
			border-color: var(--card-accent, var(--sf-accent));
			transform: translateY(-2px);
			box-shadow: 0 8px 24px oklch(0 0 0 / 0.2);
		}
	}

	.path-card-top {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
	}

	.path-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 48px;
		block-size: 48px;
		border-radius: var(--sf-radius-md);
		background: color-mix(in oklch, var(--card-accent, var(--sf-accent)) 12%, transparent);
		color: var(--card-accent, var(--sf-accent));
		flex-shrink: 0;
	}

	.path-card-meta { flex: 1; }

	.path-card-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-lg);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0 0 var(--sf-space-1);
		letter-spacing: -0.01em;
	}

	.path-card-stats {
		display: flex;
		gap: var(--sf-space-3);
		flex-wrap: wrap;

		span {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			font-size: var(--sf-font-size-xs);
			color: var(--sf-text-3);
			font-weight: 500;
		}
	}

	.path-topics {
		display: flex;
		flex-wrap: wrap;
		gap: var(--sf-space-2);
	}

	.path-topic {
		display: inline-block;
		padding: 2px var(--sf-space-2);
		background: var(--sf-bg-3);
		border-radius: var(--sf-radius-sm);
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-2);
	}

	.path-outcome {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		font-size: var(--sf-font-size-sm);
		color: var(--card-accent, var(--sf-accent));
		font-weight: 500;
		margin: 0;
		padding-block-start: var(--sf-space-2);
		border-block-start: 1px solid var(--sf-bg-3);
	}

	/* ═══════════════════════════════════════
	   DOCUMENT INDEX TOC
	   ═══════════════════════════════════════ */
	.doc-toc-section {
		padding-block: var(--sf-space-8);
		background: var(--sf-bg-1);
	}

	.doc-toc-inner {
		max-inline-size: 720px;
	}

	.doc-toc-wrap {
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-xl);
		overflow: hidden;
		box-shadow: var(--sf-shadow-lg);
	}

	.doc-toc-header {
		padding: var(--sf-space-6) var(--sf-space-6) var(--sf-space-4);
		border-block-end: 1px solid var(--sf-bg-3);
		background: var(--sf-bg-1);
	}

	.doc-toc-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-xl);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0 0 var(--sf-space-1);
		letter-spacing: -0.02em;
	}

	.doc-toc-sub {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
	}

	.doc-toc-list {
		list-style: none;
		margin: 0;
		padding: var(--sf-space-4) var(--sf-space-6);
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.doc-toc-item {
		border-block-end: 1px solid var(--sf-bg-3);

		&:last-child { border-block-end: none; }
	}

	.doc-toc-link {
		display: flex;
		align-items: baseline;
		gap: var(--sf-space-2);
		padding-block: var(--sf-space-3);
		text-decoration: none;
		transition: background var(--sf-transition-fast);
		border-radius: var(--sf-radius-sm);
		padding-inline: var(--sf-space-2);
		margin-inline: calc(-1 * var(--sf-space-2));

		&:hover .doc-toc-name { color: var(--sf-accent); }
		&:hover .doc-toc-time { color: var(--sf-accent); }
	}

	.doc-toc-num {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		font-weight: 700;
		letter-spacing: 0.05em;
		min-inline-size: 2.5rem;
		flex-shrink: 0;
	}

	.doc-toc-name {
		flex: 1;
		font-size: var(--sf-font-size-base);
		font-weight: 600;
		color: var(--sf-text-0);
		transition: color var(--sf-transition-fast);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.doc-toc-sub-label {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		font-weight: 400;
	}

	/* Dotted leader line */
	.doc-toc-dots {
		flex: 1;
		border-block-end: 2px dotted var(--sf-bg-3);
		margin-block-end: 4px;
		min-inline-size: var(--sf-space-5);
	}

	.doc-toc-time {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		white-space: nowrap;
		flex-shrink: 0;
		transition: color var(--sf-transition-fast);
	}

	/* Child items */
	.doc-toc-children {
		list-style: none;
		margin: 0 0 var(--sf-space-2);
		padding: 0 0 0 calc(2.5rem + var(--sf-space-2));
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.doc-toc-child {
		border-block-start: 1px dashed var(--sf-bg-3);

		&:first-child { border-block-start: none; }
	}

	.doc-toc-child-link {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		padding-block: var(--sf-space-2);
		text-decoration: none;

		.doc-toc-num {
			color: var(--sf-text-3);
			font-size: var(--sf-font-size-xs);
			min-inline-size: 1.5rem;
		}

		span:last-of-type {
			font-size: var(--sf-font-size-sm);
			color: var(--sf-text-2);
			transition: color var(--sf-transition-fast);
		}

		&:hover span:last-of-type { color: var(--sf-accent); }
	}

	.doc-toc-footer {
		display: flex;
		align-items: center;
		gap: var(--sf-space-2);
		padding: var(--sf-space-4) var(--sf-space-6);
		background: var(--sf-bg-1);
		border-block-start: 1px solid var(--sf-bg-3);
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);

		strong { color: var(--sf-text-0); }
	}

	/* ── SECTION SUBHEADING ── */
	.section-sub {
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-2);
		text-align: center;
		margin: calc(-1 * var(--sf-space-5)) 0 var(--sf-space-7);
		max-inline-size: 560px;
		margin-inline: auto;
		margin-block-end: var(--sf-space-7);
	}

	/* ── CURRICULUM ── */
	.curriculum {
		padding-block: var(--sf-space-8);
	}

	.curriculum-grid {
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-3);
	}

	.curriculum-card {
		display: grid;
		grid-template-columns: 56px 1fr auto auto;
		align-items: center;
		gap: var(--sf-space-4);
		background: var(--sf-bg-1);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-4) var(--sf-space-5);
		text-decoration: none;
		transition: border-color var(--sf-transition-base), background var(--sf-transition-base), transform var(--sf-transition-base);

		&:hover {
			border-color: var(--card-accent, var(--sf-accent));
			background: var(--sf-bg-2);
			transform: translateX(4px);
		}

		@media (max-width: 640px) {
			grid-template-columns: 44px 1fr;
			grid-template-rows: auto auto;
		}
	}

	.curriculum-icon-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 48px;
		block-size: 48px;
		border-radius: var(--sf-radius-md);
		background: color-mix(in oklch, var(--card-accent, var(--sf-accent)) 12%, transparent);
		color: var(--card-accent, var(--sf-accent));
		flex-shrink: 0;
	}

	.curriculum-body { flex: 1; min-inline-size: 0; }

	.curriculum-title {
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-md);
		font-weight: 700;
		color: var(--sf-text-0);
		margin: 0 0 var(--sf-space-1);
		letter-spacing: -0.01em;
	}

	.curriculum-desc {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-2);
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.curriculum-meta {
		display: flex;
		gap: var(--sf-space-3);
		flex-shrink: 0;
		@media (max-width: 640px) { display: none; }
	}

	.curriculum-stat {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		font-weight: 500;
	}

	.curriculum-arrow {
		color: var(--sf-text-3);
		flex-shrink: 0;
		transition: transform var(--sf-transition-fast), color var(--sf-transition-fast);

		.curriculum-card:hover & {
			transform: translateX(4px);
			color: var(--card-accent, var(--sf-accent));
		}
	}

	/* ── TESTIMONIALS ── */
	.testimonials {
		padding-block: var(--sf-space-8);
		background: var(--sf-bg-1);
	}

	.testimonials-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--sf-space-5);
	}

	.testimonial-card {
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		padding: var(--sf-space-5);
		display: flex;
		flex-direction: column;
		gap: var(--sf-space-4);
		transition: border-color var(--sf-transition-base), transform var(--sf-transition-base);

		&:hover {
			border-color: oklch(0.65 0.25 275 / 0.3);
			transform: translateY(-2px);
		}
	}

	.testimonial-stars {
		color: oklch(0.78 0.18 75);
		font-size: var(--sf-font-size-sm);
		letter-spacing: 2px;
	}

	.testimonial-quote {
		font-size: var(--sf-font-size-base);
		color: var(--sf-text-1);
		margin: 0;
		line-height: 1.7;
		font-style: italic;
		flex: 1;
	}

	.testimonial-author {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		border-block-start: 1px solid var(--sf-bg-3);
		padding-block-start: var(--sf-space-4);
	}

	.testimonial-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 40px;
		block-size: 40px;
		border-radius: var(--sf-radius-full);
		background: var(--sf-accent-subtle);
		color: var(--sf-accent);
		font-size: var(--sf-font-size-xs);
		font-weight: 700;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.testimonial-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.testimonial-name {
		font-size: var(--sf-font-size-sm);
		font-weight: 600;
		color: var(--sf-text-0);
	}

	.testimonial-role {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
	}

	/* ── FAQ ── */
	.faq {
		padding-block: var(--sf-space-8);
	}

	.faq-inner {
		max-inline-size: 720px;
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

		&.faq-open {
			border-color: oklch(0.65 0.25 275 / 0.35);
		}
	}

	.faq-question {
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

	/* ── FLOATING PAGE TOC (@starting-style + @scope + transition-behavior) ── */
	/* 6. @scope — scoped styles without BEM — Baseline 2024 */
	@scope (.page-toc) {
		:scope {
			position: fixed;
			inset-block-start: 50%;
			inset-inline-end: var(--sf-space-5);
			translate: 0 -50%;
			z-index: var(--sf-z-sticky);
			display: flex;
			flex-direction: column;
			gap: var(--sf-space-2);
			/* 7. transition-behavior: allow-discrete — for display:none ↔ block — Baseline 2024 */
			transition: opacity 400ms ease, translate 400ms ease, display 400ms allow-discrete;
			opacity: 1;

			/* 8. @starting-style — entry animation on first insertion — Baseline 2024 */
			@starting-style {
				opacity: 0;
				translate: 8px -50%;
			}

			@media (max-width: 1280px) { display: none; }
		}

		:scope.toc-hidden {
			opacity: 0;
			translate: 8px -50%;
			display: none;
			/* transition-behavior: allow-discrete enables animating display */
		}

		a {
			position: relative;
			display: flex;
			align-items: center;
			gap: var(--sf-space-2);
			text-decoration: none;
		}

		.toc-indicator {
			inline-size: 8px;
			block-size: 8px;
			border-radius: 50%;
			background: var(--sf-bg-3);
			flex-shrink: 0;
			transition: background var(--sf-transition-fast), scale var(--sf-transition-fast);
		}

		.toc-label {
			font-size: var(--sf-font-size-xs);
			font-weight: 500;
			color: var(--sf-text-3);
			white-space: nowrap;
			opacity: 0;
			translate: -4px 0;
			transition: opacity var(--sf-transition-fast), translate var(--sf-transition-fast);
			pointer-events: none;
		}

		a:hover .toc-indicator,
		.toc-dot--active .toc-indicator {
			background: var(--sf-accent);
			scale: 1.25;
		}

		/* 9. :has() — parent selector — Baseline 2023 */
		:scope:has(a:hover) .toc-label { opacity: 0; }
		a:hover .toc-label {
			opacity: 1;
			translate: 0 0;
		}

		.toc-dot--active .toc-indicator {
			inline-size: 10px;
			block-size: 10px;
		}

		.toc-dot--active .toc-label {
			color: var(--sf-accent);
		}
	}

	/* ── SYLLABUS / TOC SECTION ── */
	.syllabus {
		padding-block: var(--sf-space-8);
		background: var(--sf-bg-1);
	}

	.syllabus-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--sf-space-4);
	}

	.syllabus-track {
		background: var(--sf-bg-2);
		border: 1px solid var(--sf-bg-3);
		border-radius: var(--sf-radius-lg);
		overflow: hidden;
		transition: border-color var(--sf-transition-base);

		/* :has() — highlight track border if modules are expanded */
		&:has(.syllabus-modules--open) {
			border-color: var(--card-accent, var(--sf-accent));
		}
	}

	.syllabus-header {
		display: flex;
		align-items: center;
		gap: var(--sf-space-3);
		inline-size: 100%;
		padding: var(--sf-space-4) var(--sf-space-4);
		background: none;
		border: none;
		cursor: pointer;
		text-align: start;
		transition: background var(--sf-transition-fast);

		&:hover { background: oklch(from var(--card-accent, var(--sf-accent)) l c h / 0.05); }
	}

	.syllabus-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		inline-size: 36px;
		block-size: 36px;
		border-radius: var(--sf-radius-md);
		background: color-mix(in oklch, var(--card-accent, var(--sf-accent)) 12%, transparent);
		color: var(--card-accent, var(--sf-accent));
		flex-shrink: 0;
	}

	.syllabus-track-title {
		flex: 1;
		font-family: var(--sf-font-sans);
		font-size: var(--sf-font-size-sm);
		font-weight: 700;
		color: var(--sf-text-0);
	}

	.syllabus-track-count {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		white-space: nowrap;
		font-weight: 500;
	}

	.syllabus-header:last-child { color: var(--sf-text-3); }

	/* 10. CSS interpolate-size — height: auto animation on syllabus modules */
	.syllabus-modules {
		block-size: 0;
		overflow: hidden;
		transition: block-size 350ms ease;
		border-block-start: 0px solid var(--sf-bg-3);
		transition: block-size 350ms ease, border-width 350ms ease;

		&.syllabus-modules--open {
			block-size: auto;
			border-block-start-width: 1px;

			@starting-style {
				block-size: 0;
			}
		}
	}

	.syllabus-module {
		display: grid;
		grid-template-columns: 28px 1fr auto;
		align-items: center;
		gap: var(--sf-space-3);
		padding: var(--sf-space-2) var(--sf-space-4);
		border-block-end: 1px solid var(--sf-bg-3);

		/* :has() — dim last module if it's the final item */
		&:last-child { border-block-end: none; }

		/* animation-timeline: view() — elements animate as they scroll in — Baseline 2023 */
		animation: module-slide-in linear both;
		animation-timeline: view();
		animation-range: entry 0% entry 40%;
	}
	@keyframes module-slide-in {
		from { opacity: 0; translate: -8px 0; }
		to { opacity: 1; translate: 0 0; }
	}

	.syllabus-mod-num {
		font-family: var(--sf-font-mono);
		font-size: var(--sf-font-size-xs);
		color: var(--card-accent, var(--sf-accent));
		font-weight: 700;
		letter-spacing: 0.05em;
	}

	.syllabus-mod-title {
		font-size: var(--sf-font-size-sm);
		color: var(--sf-text-1);
		font-weight: 500;
	}

	.syllabus-mod-count {
		font-size: var(--sf-font-size-xs);
		color: var(--sf-text-3);
		background: var(--sf-bg-3);
		padding: 1px 6px;
		border-radius: var(--sf-radius-full);
		font-weight: 600;
	}

	/* 11. animation-timeline: view() on stat items — scroll-driven CSS, no IO — Baseline 2023 */
	.stat-item {
		animation: stat-reveal linear both;
		animation-timeline: view();
		animation-range: entry 0% entry 60%;
	}
	@keyframes stat-reveal {
		from { opacity: 0; scale: 0.9; }
		to { opacity: 1; scale: 1; }
	}

	/* 4. interpolate-size: allow-keywords → native height:auto animation (no JS slide) */
	.faq-answer {
		block-size: 0;
		overflow: hidden;
		transition: block-size 300ms ease, padding 300ms ease;
		padding-inline: var(--sf-space-5);
		padding-block: 0;

		/* 5. @starting-style — fires on first display — Baseline 2024 */
		&.faq-answer--open {
			block-size: auto;
			padding-block-end: var(--sf-space-4);

			@starting-style {
				block-size: 0;
				padding-block-end: 0;
			}
		}

		p {
			font-size: var(--sf-font-size-sm);
			color: var(--sf-text-2);
			margin: 0;
			line-height: 1.75;
		}
	}
</style>
