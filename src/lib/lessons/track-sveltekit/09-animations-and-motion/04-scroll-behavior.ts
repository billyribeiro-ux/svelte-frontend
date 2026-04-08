import type { Lesson } from '$types/lesson';

export const scrollBehavior: Lesson = {
	id: 'sveltekit.animations.scroll-behavior',
	slug: 'scroll-behavior',
	title: 'Scroll Behavior & Position Management',
	description:
		'Master scroll position management in SvelteKit — restoring position on back navigation, smooth scrolling to anchors, preventing scroll reset on in-page updates, and creating scroll-to-top animations.',
	trackId: 'sveltekit',
	moduleId: 'animations-and-motion',
	order: 4,
	estimatedMinutes: 15,
	concepts: ['sveltekit.scroll.behavior', 'sveltekit.navigation.after-navigate', 'sveltekit.scroll-position'],
	prerequisites: ['sveltekit.routing.basics', 'sveltekit.navigation.after-navigate'],

	content: [
		{
			type: 'text',
			content: `# Scroll Behavior & Position Management

Scroll management is one of the most overlooked aspects of SPA navigation. Get it wrong and users experience jarring jumps, lost scroll positions, and broken anchor links. Get it right and navigation feels native.

## SvelteKit's Default Scroll Behavior

By default, SvelteKit:
- **Scrolls to top** on every navigation to a new page
- **Restores scroll position** when using the browser Back/Forward buttons
- **Scrolls to the target anchor** when navigating to a URL with a hash (e.g., \`/docs#installation\`)

This covers most use cases. But you will need to take control in certain scenarios.

## Controlling Scroll with \`data-sveltekit-scroll\`

Add this attribute to a link to override scroll behavior per-link:

\`\`\`html
<!-- Do not scroll to top when following this link (URL updates, scroll stays) -->
<a href="/feed?page=2" data-sveltekit-scroll="preserve">Load more</a>

<!-- Force scroll to top even for same-page hash links -->
<a href="#section" data-sveltekit-scroll>Section</a>
\`\`\`

You can also set it in your \`svelte.config.js\` as a default:

\`\`\`js
// svelte.config.js
export default {
  kit: {
    scroll: {
      // Restore scroll position when navigating back
      restore: true,
      // Lock scroll position during navigation (prevents flash of wrong scroll)
      lock: false
    }
  }
};
\`\`\`

## Smooth Scroll to Top with Animation

For a polished "back to top" button:

\`\`\`svelte
<script>
  import { Spring } from 'svelte/motion';
  import { afterNavigate } from '$app/navigation';

  let scrollY = $state(0);
  let showButton = $derived(scrollY > 400);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Auto-scroll to top with animation on navigation
  afterNavigate(({ type }) => {
    if (type !== 'popstate') {
      // pushstate/replacestate navigation — scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    // popstate = back/forward — browser restores position, don't override
  });
</script>

<svelte:window bind:scrollY />

{#if showButton}
  <button
    class="back-to-top"
    onclick={scrollToTop}
    aria-label="Scroll to top"
  >
    ↑
  </button>
{/if}
\`\`\`

## Scrolling to a Specific Element After Navigation

Sometimes you need to scroll to a specific element after navigating — not just the URL hash:

\`\`\`svelte
<script>
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';

  afterNavigate(() => {
    // Scroll to the "main content" element on every navigation
    const main = document.querySelector('#main-content');
    main?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Or scroll to the section matching a query parameter
  $effect(() => {
    const section = page.url.searchParams.get('section');
    if (section) {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    }
  });
</script>
\`\`\`

## Infinite Scroll and Preventing Position Reset

When implementing infinite scroll (load more on scroll), you typically update the URL without wanting the page to scroll back to top:

\`\`\`svelte
<script>
  import { goto } from '$app/navigation';

  async function loadMore() {
    // replaceState: updates URL without adding to history stack
    // noscroll: prevents scrolling to top
    await goto(\`?page=\${page + 1}\`, {
      replaceState: true,
      noScroll: true
    });
  }
</script>
\`\`\`

The \`noScroll\` option in \`goto()\` is critical for infinite scroll, filtering, and any UI that updates the URL in response to user interaction without changing the conceptual "page".

## Parallax Scrolling Effects

Bind to \`scrollY\` for parallax:

\`\`\`svelte
<script>
  import { Spring } from 'svelte/motion';

  let scrollY = $state(0);
  const parallaxY = new Spring(0, { stiffness: 0.05, damping: 0.8 });

  $effect(() => {
    parallaxY.target = scrollY * 0.3;
  });
</script>

<svelte:window bind:scrollY />

<div
  class="hero-bg"
  style="transform: translateY({parallaxY.current}px)"
  aria-hidden="true"
></div>
\`\`\`

The \`Spring\` smooths out the parallax so it lags slightly behind the scroll — this is the "heavy" parallax feel used by many premium websites.

## Intersection-Based Scroll Animations

Use an \`IntersectionObserver\` action (from the previous lesson) to trigger animations as elements scroll into view:

\`\`\`ts
// actions/reveal.ts
export function reveal(node: Element, { delay = 0 } = {}) {
  node.style.opacity = '0';
  node.style.transform = 'translateY(20px)';
  node.style.transition = \`opacity 600ms \${delay}ms ease, transform 600ms \${delay}ms ease\`;

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      node.style.opacity = '1';
      node.style.transform = 'translateY(0)';
      observer.disconnect();
    }
  }, { threshold: 0.1 });

  observer.observe(node);
  return { destroy() { observer.disconnect(); } };
}
\`\`\`

\`\`\`svelte
<section use:reveal>Section 1</section>
<section use:reveal={{ delay: 200 }}>Section 2</section>
\`\`\``
		},
		{
			type: 'checkpoint',
			content: 'cp-scroll-top'
		},
		{
			type: 'checkpoint',
			content: 'cp-scroll-noscroll'
		}
	],

	starterFiles: [
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script>
  import { afterNavigate } from '$app/navigation';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let scrollY = $state(0);
  let showBackToTop = $derived(scrollY > 300);

  // TODO: Use afterNavigate to scroll to top on pushstate navigations
  // (but NOT on popstate — browser handles scroll restoration for back/forward)

  function scrollToTop() {
    // TODO: Scroll smoothly to top
  }
</script>

<svelte:window bind:scrollY />

{@render children()}

<!-- TODO: Show back-to-top button when scrollY > 300 -->
<!-- Clicking it should call scrollToTop() -->

<style>
  .back-to-top {
    position: fixed;
    inset-block-end: 2rem;
    inset-inline-end: 2rem;
    padding: 0.75rem;
    border-radius: 50%;
    background: #6366f1;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    box-shadow: 0 4px 12px rgba(99,102,241,0.4);
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script>
  import { afterNavigate } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let scrollY = $state(0);
  let showBackToTop = $derived(scrollY > 300);

  afterNavigate(({ type }) => {
    if (type !== 'popstate') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<svelte:window bind:scrollY />

{@render children()}

{#if showBackToTop}
  <button
    class="back-to-top"
    onclick={scrollToTop}
    aria-label="Scroll to top"
    in:fly={{ y: 20, duration: 300 }}
    out:fly={{ y: 20, duration: 200 }}
  >
    ↑
  </button>
{/if}

<style>
  .back-to-top {
    position: fixed;
    inset-block-end: 2rem;
    inset-inline-end: 2rem;
    padding: 0.75rem;
    border-radius: 50%;
    background: #6366f1;
    color: white;
    border: none;
    cursor: pointer;
    font-size: 1.25rem;
    box-shadow: 0 4px 12px rgba(99,102,241,0.4);
    transition: transform 0.2s;
  }
  .back-to-top:hover { transform: scale(1.1); }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-scroll-top',
			description: 'Use afterNavigate to scroll to top on forward navigations only',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'afterNavigate' },
						{ type: 'contains', value: 'scrollTo' },
						{ type: 'contains', value: 'popstate' }
					]
				}
			},
			hints: [
				'`afterNavigate(({ type }) => { ... })` — check `type !== "popstate"` before scrolling.',
				'`window.scrollTo({ top: 0, behavior: "smooth" })` scrolls smoothly to top.',
				'Do NOT scroll on `popstate` — that\'s the user pressing Back/Forward, and the browser restores their previous position automatically.'
			],
			conceptsTested: ['sveltekit.navigation.after-navigate', 'sveltekit.scroll.behavior']
		},
		{
			id: 'cp-scroll-noscroll',
			description: 'Use goto() with noScroll: true for URL updates that should not reset scroll',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'scrollY' }
					]
				}
			},
			hints: [
				'`goto(url, { noScroll: true })` updates the URL without scrolling to top.',
				'`goto(url, { replaceState: true })` replaces the history entry instead of pushing a new one.',
				'Combine both for infinite scroll or filter-in-URL patterns: `goto(url, { noScroll: true, replaceState: true })`.'
			],
			conceptsTested: ['sveltekit.scroll.behavior', 'sveltekit.navigation.goto']
		}
	]
};
