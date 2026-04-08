import type { Lesson } from '$types/lesson';

export const navigationLoading: Lesson = {
	id: 'sveltekit.animations.navigation-loading',
	slug: 'navigation-loading',
	title: 'Navigation Loading States & Progress Indicators',
	description:
		'Build a Linear/GitHub-style navigation progress bar using SvelteKit\'s navigating store, beforeNavigate, and afterNavigate — giving users instant visual feedback that something is happening during slow route transitions.',
	trackId: 'sveltekit',
	moduleId: 'animations-and-motion',
	order: 3,
	estimatedMinutes: 20,
	concepts: ['sveltekit.navigation.navigating', 'sveltekit.navigation.before-navigate', 'sveltekit.navigation.after-navigate'],
	prerequisites: ['sveltekit.routing.basics', 'svelte5.transitions.basics', 'svelte5.motion.tween'],

	content: [
		{
			type: 'text',
			content: `# Navigation Loading States & Progress Indicators

SvelteKit's navigation is typically instant for client-side routes — the page renders before the user even perceives a delay. But when a route has a slow \`load\` function (waiting on a database, a slow API, etc.), there can be a noticeable gap between clicking a link and seeing the new page. Without feedback, users often click again or assume the site is broken.

A **navigation progress indicator** solves this with a thin bar at the top of the page (like GitHub, YouTube, or Linear) that animates during navigation, giving instant visual confirmation that something is happening.

## The \`navigating\` Store

SvelteKit exports a \`navigating\` store from \`$app/stores\`. It is \`null\` when idle, and an object when navigation is in progress:

\`\`\`ts
import { navigating } from '$app/stores';

// $navigating is null when idle
// $navigating is { from, to, type, delta } during navigation
\`\`\`

This is all you need to show/hide a loading indicator. Note: \`navigating\` is a **Svelte 4 store** — in Svelte 5 components, read it with the \`$\` prefix (\`$navigating\`).

## Building a Progress Bar Component

\`\`\`svelte
<!-- src/lib/components/NavProgress.svelte -->
<script>
  import { navigating } from '$app/stores';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const progress = new Tween(0, { duration: 400, easing: cubicOut });

  let isVisible = $state(false);
  let timer: ReturnType<typeof setTimeout>;

  $effect(() => {
    if ($navigating) {
      // Navigation started — show bar and animate to ~70% (never complete until done)
      clearTimeout(timer);
      isVisible = true;
      progress.set(0, { duration: 0 }); // instant reset
      progress.target = 70;
    } else {
      // Navigation complete — shoot to 100%, then hide
      progress.target = 100;
      timer = setTimeout(() => {
        isVisible = false;
        progress.set(0, { duration: 0 });
      }, 400);
    }
  });
</script>

{#if isVisible}
  <div
    class="progress-bar"
    style="width: {progress.current}%"
    aria-hidden="true"
  ></div>
{/if}

<style>
  .progress-bar {
    position: fixed;
    inset-block-start: 0;
    inset-inline-start: 0;
    block-size: 3px;
    background: linear-gradient(90deg, #6366f1, #a855f7);
    z-index: 9999;
    border-start-end-radius: 2px;
    border-end-end-radius: 2px;
    box-shadow: 0 0 8px 0 rgba(99, 102, 241, 0.5);
    transition: width 300ms cubic-bezier(0.16, 1, 0.3, 1);
    will-change: width;
  }
</style>
\`\`\`

The key trick: you never animate to 100% while navigation is in progress. You animate to ~70% (fast, looks responsive) and let it hang. When navigation completes, you instantly shoot to 100% and then hide. This creates the illusion of a progress indicator without knowing the actual progress.

## Using \`beforeNavigate\` and \`afterNavigate\`

For more granular control, use lifecycle hooks:

\`\`\`svelte
<script>
  import { beforeNavigate, afterNavigate } from '$app/navigation';

  let isNavigating = $state(false);

  beforeNavigate(() => {
    isNavigating = true;
    // Could also: save scroll position, abort pending requests, etc.
  });

  afterNavigate(() => {
    isNavigating = false;
    // Could also: restore scroll position, focus management, etc.
  });
</script>

{#if isNavigating}
  <div class="loading-indicator" aria-live="polite" aria-label="Loading page...">
    <span class="sr-only">Loading...</span>
  </div>
{/if}
\`\`\`

## Skeleton Loading Screens

For pages with slow data, show a skeleton of the expected layout while the new page loads:

\`\`\`svelte
<script>
  import { navigating } from '$app/stores';
  import { page } from '$app/state';
</script>

{#if $navigating}
  <!-- Show skeleton based on target route -->
  {#if $navigating.to?.url.pathname.startsWith('/blog/')}
    <BlogPostSkeleton />
  {:else}
    <GenericPageSkeleton />
  {/if}
{:else}
  <slot />
{/if}
\`\`\`

\`$navigating.to\` contains the target route, so you can show a contextually appropriate skeleton.

## Navigation Hooks Reference

| Hook | Fires | Use for |
|---|---|---|
| \`beforeNavigate\` | Before navigation starts, cancellable | Show loading state, abort requests, confirm leave |
| \`afterNavigate\` | After new page is rendered | Hide loading state, focus management, analytics |
| \`onNavigate\` | Same as beforeNavigate but can return Promise | View Transitions, async preparation |
| \`navigating\` store | Reactive, updates on nav start/end | Simple loading indicators |

## Cancelling Navigation

\`beforeNavigate\` receives a \`cancel()\` function:

\`\`\`ts
beforeNavigate(({ cancel, from, to }) => {
  if (hasUnsavedChanges) {
    const confirmed = confirm('Leave without saving?');
    if (!confirmed) cancel(); // aborts the navigation
  }
});
\`\`\`

This is how you implement "unsaved changes" protection — a form that warns the user before navigating away.`
		},
		{
			type: 'checkpoint',
			content: 'cp-nav-progress-bar'
		},
		{
			type: 'checkpoint',
			content: 'cp-nav-before-after'
		}
	],

	starterFiles: [
		{
			name: 'NavProgress.svelte',
			path: '/NavProgress.svelte',
			language: 'svelte',
			content: `<script>
  import { navigating } from '$app/stores';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  // TODO: Create a Tween starting at 0 for the progress bar width
  // TODO: Track isVisible state

  // TODO: Use $effect to:
  //   - When $navigating is truthy: show bar, reset to 0, tween to 70
  //   - When $navigating is null: tween to 100, then after 400ms hide and reset
</script>

<!-- TODO: Render a fixed progress bar when isVisible -->
<!-- Bar width should be driven by progress.current -->

<style>
  /* TODO: Style the progress bar */
  /* Fixed top, thin height, gradient color, box shadow glow */
</style>`
		},
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script>
  import NavProgress from './NavProgress.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<NavProgress />

<nav>
  <a href="/">Home</a>
  <a href="/slow-page">Slow Page (1s delay)</a>
  <a href="/fast-page">Fast Page</a>
</nav>

{@render children()}`
		}
	],

	solutionFiles: [
		{
			name: 'NavProgress.svelte',
			path: '/NavProgress.svelte',
			language: 'svelte',
			content: `<script>
  import { navigating } from '$app/stores';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const progress = new Tween(0, { duration: 400, easing: cubicOut });
  let isVisible = $state(false);
  let hideTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    if ($navigating) {
      clearTimeout(hideTimer);
      isVisible = true;
      progress.set(0, { duration: 0 });
      progress.target = 70;
    } else {
      progress.target = 100;
      hideTimer = setTimeout(() => {
        isVisible = false;
        progress.set(0, { duration: 0 });
      }, 400);
    }
  });
</script>

{#if isVisible}
  <div
    class="progress"
    style="width: {progress.current}%"
    aria-hidden="true"
  ></div>
{/if}

<style>
  .progress {
    position: fixed;
    inset-block-start: 0;
    inset-inline-start: 0;
    block-size: 3px;
    background: linear-gradient(90deg, #6366f1, #a855f7);
    z-index: 9999;
    border-start-end-radius: 2px;
    border-end-end-radius: 2px;
    box-shadow: 0 0 10px 0 rgba(99, 102, 241, 0.6);
    will-change: width;
  }
</style>`
		},
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script>
  import NavProgress from './NavProgress.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<NavProgress />

<nav>
  <a href="/">Home</a>
  <a href="/slow-page">Slow Page (1s delay)</a>
  <a href="/fast-page">Fast Page</a>
</nav>

{@render children()}`
		}
	],

	checkpoints: [
		{
			id: 'cp-nav-progress-bar',
			description: 'Build a Tween-powered progress bar that animates during navigation',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'navigating' },
						{ type: 'contains', value: 'new Tween' },
						{ type: 'contains', value: 'progress.current' }
					]
				}
			},
			hints: [
				'Import `navigating` from `$app/stores` — read it as `$navigating` in your template.',
				'Create a `Tween` for the width: `const progress = new Tween(0, { duration: 400 })`.',
				'In `$effect`, when `$navigating` is truthy, reset to 0 then set `progress.target = 70`. When null, set `progress.target = 100` then hide after 400ms.'
			],
			conceptsTested: ['sveltekit.navigation.navigating', 'svelte5.motion.tween']
		},
		{
			id: 'cp-nav-before-after',
			description: 'Use beforeNavigate and afterNavigate for navigation lifecycle events',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'navigating' }
					]
				}
			},
			hints: [
				'`beforeNavigate(() => { ... })` fires before the navigation begins.',
				'`afterNavigate(() => { ... })` fires after the new page renders.',
				'Both are useful for managing loading state, focus, and analytics without the reactive overhead of the `navigating` store.'
			],
			conceptsTested: ['sveltekit.navigation.before-navigate', 'sveltekit.navigation.after-navigate']
		}
	]
};
