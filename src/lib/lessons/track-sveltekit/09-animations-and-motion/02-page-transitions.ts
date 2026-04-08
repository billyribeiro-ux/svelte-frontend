import type { Lesson } from '$types/lesson';

export const pageTransitions: Lesson = {
	id: 'sveltekit.animations.page-transitions',
	slug: 'page-transitions',
	title: 'Page Transitions — Animating Route Changes',
	description:
		'Build silky-smooth page transitions using {#key $page.url.pathname} in your root layout combined with Svelte transitions — the universal approach that works everywhere, including browsers without View Transitions support.',
	trackId: 'sveltekit',
	moduleId: 'animations-and-motion',
	order: 2,
	estimatedMinutes: 20,
	concepts: ['sveltekit.animations.page-transitions', 'sveltekit.page-state', 'svelte5.transitions.fly'],
	prerequisites: ['sveltekit.routing.basics', 'svelte5.transitions.basics', 'svelte5.control-flow.key'],

	content: [
		{
			type: 'text',
			content: `# Page Transitions — Animating Route Changes

The View Transitions API is powerful but requires modern browser support. The universal approach — one that works everywhere — uses Svelte's own transition system combined with \`{#key}\` in your root layout.

## The Core Pattern

SvelteKit's \`page\` object from \`$app/state\` is reactive. Its \`url.pathname\` changes on every navigation. If you wrap the page content in a \`{#key pathname}\` block, Svelte destroys and recreates the page content on every route change — and any \`in:\` transitions fire as if it was a fresh mount:

\`\`\`svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { page } from '$app/state';
  import { fly } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<nav><!-- your navigation --></nav>

{#key page.url.pathname}
  <main in:fly={{ y: 20, duration: 400, opacity: 0 }}>
    {@render children()}
  </main>
{/key}
\`\`\`

Every time the URL changes, the \`{#key}\` block destroys the old \`<main>\` and creates a new one, triggering the \`in:fly\` transition. The result: every page slides in from below.

## Adding an Out-Transition

For a polished experience, add both \`in:\` and \`out:\` transitions:

\`\`\`svelte
{#key page.url.pathname}
  <main
    in:fly={{ x: 20, duration: 350, opacity: 0 }}
    out:fly={{ x: -20, duration: 250, opacity: 0 }}
  >
    {@render children()}
  </main>
{/key}
\`\`\`

However, there is a visual issue: by default, the outgoing and incoming pages stack on top of each other. You need CSS to handle this gracefully:

\`\`\`css
/* The leaving page is position:absolute so it doesn't affect layout */
main {
  position: absolute;
  inset-inline: 0;
  padding-inline: var(--content-padding);
}
\`\`\`

## Avoiding FOUC During Transitions

When a page transitions in, there can be a flash of unstyled content if the new page's data is loading. Fix this by ensuring the transition only starts when data is ready:

\`\`\`svelte
<script>
  import { page } from '$app/state';
  import { navigating } from '$app/stores';
  import { fly } from 'svelte/transition';

  // Only change the key when navigation is complete (not loading)
  let stableKey = $state(page.url.pathname);

  $effect(() => {
    // navigating is null when not navigating
    if (!$navigating) {
      stableKey = page.url.pathname;
    }
  });
</script>

{#key stableKey}
  <main in:fly={{ y: 16, duration: 400, opacity: 0 }}>
    {@render children()}
  </main>
{/key}
\`\`\`

## Direction-Aware Page Transitions

Make the transition direction match the conceptual navigation direction (forward = right, back = left):

\`\`\`svelte
<script>
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import { fly } from 'svelte/transition';

  // Track navigation delta to determine direction
  let direction = $state(1); // 1 = forward, -1 = back

  afterNavigate(({ delta }) => {
    direction = delta && delta < 0 ? -1 : 1;
  });
</script>

{#key page.url.pathname}
  <main in:fly={{ x: direction * 30, duration: 400, opacity: 0 }}>
    {@render children()}
  </main>
{/key}
\`\`\`

\`afterNavigate\`'s \`delta\` property tells you how many steps in the history stack this navigation moved. Negative = back, positive/null = forward.

## Choosing the Right Transition Style

Different apps have different feels. Use the transition that matches your content hierarchy:

| Transition | Use when |
|---|---|
| \`fly\` (y axis) | Vertical content hierarchy (step wizards, onboarding) |
| \`fly\` (x axis) | Horizontal content hierarchy (tabs, pagination) |
| \`fade\` | Neutral, professional apps (dashboards, admin) |
| \`scale\` + \`fade\` | Modal-like sub-pages (editing a record) |
| View Transitions API | When you need shared element morphing (photos, cards) |

## Combining Both Approaches

The best production setup uses both: View Transitions API when available, page transitions as a fallback:

\`\`\`svelte
<script>
  import { onNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import { fly } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
  let useViewTransitions = $state(typeof document !== 'undefined' && !!document.startViewTransition);

  onNavigate((navigation) => {
    if (!useViewTransitions) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

{#if useViewTransitions}
  <!-- View Transitions handles animation, just render -->
  {@render children()}
{:else}
  <!-- Fallback: Svelte transitions -->
  {#key page.url.pathname}
    <div in:fly={{ y: 16, duration: 400, opacity: 0 }}>
      {@render children()}
    </div>
  {/key}
{/if}
\`\`\``
		},
		{
			type: 'checkpoint',
			content: 'cp-page-transition-key'
		},
		{
			type: 'checkpoint',
			content: 'cp-page-transition-direction'
		}
	],

	starterFiles: [
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script>
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  // TODO 1: Track navigation direction using afterNavigate
  let direction = $state(1);

  // TODO 2: Wrap children in {#key page.url.pathname} with a fly transition
  //         Make it direction-aware (x: direction * 30)
</script>

<nav class="nav">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>

<!-- TODO: Add {#key} block here -->
<main>
  {@render children()}
</main>

<style>
  nav { display: flex; gap: 1rem; padding: 1rem 2rem; border-bottom: 1px solid #e2e8f0; background: white; }
  nav a { color: #6366f1; font-weight: 500; text-decoration: none; }
  main { padding: 2rem; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script>
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  let direction = $state(1);

  afterNavigate(({ delta }) => {
    direction = delta && delta < 0 ? -1 : 1;
  });
</script>

<nav class="nav">
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>

{#key page.url.pathname}
  <main
    in:fly={{ x: direction * 30, duration: 400, easing: cubicOut, opacity: 0 }}
  >
    {@render children()}
  </main>
{/key}

<style>
  nav { display: flex; gap: 1rem; padding: 1rem 2rem; border-bottom: 1px solid #e2e8f0; background: white; }
  nav a { color: #6366f1; font-weight: 500; text-decoration: none; }
  main { padding: 2rem; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-page-transition-key',
			description: 'Wrap page content in {#key page.url.pathname} with a fly transition',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#key page.url.pathname}' },
						{ type: 'contains', value: 'in:fly' }
					]
				}
			},
			hints: [
				'Import `page` from `$app/state` — `page.url.pathname` is reactive and changes on every navigation.',
				'Wrap `{@render children()}` in `{#key page.url.pathname}<main in:fly={...}>...</main>{/key}`.',
				'The `{#key}` block destroys and recreates `<main>` on every URL change, triggering the transition.'
			],
			conceptsTested: ['sveltekit.animations.page-transitions', 'svelte5.control-flow.key']
		},
		{
			id: 'cp-page-transition-direction',
			description: 'Make the transition direction-aware using afterNavigate',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'afterNavigate' },
						{ type: 'contains', value: 'direction' },
						{ type: 'contains', value: 'delta' }
					]
				}
			},
			hints: [
				'`afterNavigate(({ delta }) => { ... })` fires after each navigation.',
				'`delta < 0` means the user went back in history; positive (or null) means forward.',
				'Use `x: direction * 30` in the fly transition so the animation axis reflects the nav direction.'
			],
			conceptsTested: ['sveltekit.animations.page-transitions', 'sveltekit.navigation.after-navigate']
		}
	]
};
