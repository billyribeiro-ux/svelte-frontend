import type { Lesson } from '$types/lesson';

export const reactiveWindow: Lesson = {
	id: 'svelte-core.reactive-utilities.reactive-window',
	slug: 'reactive-window',
	title: 'Reactive Window Values',
	description:
		'Access reactive window dimensions, scroll position, and online status with svelte/reactivity/window.',
	trackId: 'svelte-core',
	moduleId: 'reactive-utilities',
	order: 3,
	estimatedMinutes: 16,
	concepts: ['svelte5.reactivity.window.innerWidth', 'svelte5.reactivity.window.scrollY', 'svelte5.reactivity.window.online'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived', 'svelte5.reactivity.svelte-map'],

	content: [
		{
			type: 'text',
			content: `# Reactive Window Values

## The Problem: Listening to Window Properties

Every web application eventually needs to react to browser window properties -- the viewport width for responsive layouts, scroll position for progress indicators, network status for offline banners, or device pixel ratio for serving the right image resolution. Traditionally in Svelte, you would handle these with the \`<svelte:window>\` special element and its bindings:

\`\`\`svelte
<script lang="ts">
  let innerWidth = $state(0);
  let scrollY = $state(0);
</script>

<svelte:window bind:innerWidth bind:scrollY />

<p>Width: {innerWidth}, Scroll: {scrollY}</p>
\`\`\`

This approach works but has several drawbacks. First, \`<svelte:window>\` is a template-level construct. You cannot use it inside a \`.svelte.ts\` module file, a reactive class, or a shared utility. The binding is physically tied to a component's markup. If three components need \`innerWidth\`, each one must independently declare \`<svelte:window bind:innerWidth>\` in its template. There is no way to share a single subscription.

Second, the binding sets up and tears down event listeners on mount and unmount. Every component with \`bind:scrollY\` attaches its own \`scroll\` event listener to the window. If you have five components reading scroll position, you have five independent listeners -- five independent callbacks firing on every scroll event.

Third, during server-side rendering (SSR), \`<svelte:window>\` does not exist. The bound variables simply remain at their initial values. You must carefully initialize them to sensible defaults and guard against undefined window properties in your logic.

Svelte 5 provides a cleaner solution: the \`svelte/reactivity/window\` module.

## The svelte/reactivity/window Module

The \`svelte/reactivity/window\` module exports reactive objects that track window properties automatically. Each exported value is an object with a \`.current\` property that always reflects the latest value from the browser. Reading \`.current\` inside a reactive context (a component template, \`$derived\`, or \`$effect\`) automatically subscribes to changes.

\`\`\`typescript
import { innerWidth, innerHeight, scrollX, scrollY, online, devicePixelRatio } from 'svelte/reactivity/window';
\`\`\`

Here is what each value tracks:

| Export | Window Property | Event Listened |
|---|---|---|
| \`innerWidth\` | \`window.innerWidth\` | \`resize\` |
| \`innerHeight\` | \`window.innerHeight\` | \`resize\` |
| \`scrollX\` | \`window.scrollX\` | \`scroll\` |
| \`scrollY\` | \`window.scrollY\` | \`scroll\` |
| \`online\` | \`navigator.onLine\` | \`online\` / \`offline\` |
| \`devicePixelRatio\` | \`window.devicePixelRatio\` | \`matchMedia\` change |

Each of these is a singleton. No matter how many components import \`scrollY\`, there is only one scroll event listener shared across the entire application. This is a major performance improvement over multiple \`<svelte:window bind:scrollY>\` declarations.

### Basic Usage

\`\`\`svelte
<script lang="ts">
  import { innerWidth, innerHeight, scrollY, online } from 'svelte/reactivity/window';
</script>

<p>Viewport: {innerWidth.current} x {innerHeight.current}</p>
<p>Scroll position: {scrollY.current}px</p>
<p>Network: {online.current ? 'Online' : 'Offline'}</p>
\`\`\`

Notice the \`.current\` property. This is the same pattern used by other Svelte 5 reactive primitives. The value is not accessed directly -- you read \`.current\`, which tells Svelte's reactivity system to track this read and re-render when the underlying value changes.

### Using in $derived and $effect

Because \`.current\` is reactive, you can use these values in any reactive context:

\`\`\`svelte
<script lang="ts">
  import { innerWidth, scrollY } from 'svelte/reactivity/window';

  // Derived: responsive breakpoint
  const breakpoint = $derived(
    innerWidth.current < 640 ? 'mobile' :
    innerWidth.current < 1024 ? 'tablet' : 'desktop'
  );

  // Derived: scroll progress as percentage
  const scrollProgress = $derived.by(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.round((scrollY.current / docHeight) * 100) : 0;
  });

  // Effect: log breakpoint changes
  $effect(() => {
    console.log('Breakpoint changed to:', breakpoint);
  });
</script>

<p>Current breakpoint: {breakpoint}</p>
<p>Scroll progress: {scrollProgress}%</p>
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'svelte5.reactivity.window.innerWidth'
		},
		{
			type: 'text',
			content: `## SSR Behavior: .current Returns undefined on the Server

A critical detail: during server-side rendering, there is no \`window\` object. The reactive window values handle this gracefully -- \`.current\` returns \`undefined\` on the server. This means you must account for the possibility of \`undefined\` in your code:

\`\`\`svelte
<script lang="ts">
  import { innerWidth, online } from 'svelte/reactivity/window';

  // WRONG: will error on SSR if you do math with undefined
  // const isMobile = $derived(innerWidth.current < 640);

  // CORRECT: guard against undefined
  const isMobile = $derived((innerWidth.current ?? 0) < 640);
  const isOnline = $derived(online.current ?? true); // assume online during SSR
</script>
\`\`\`

The nullish coalescing operator (\`??\`) is your best friend here. Choose sensible defaults: assume a desktop-width viewport, assume the user is online, assume a device pixel ratio of 1. These defaults will be immediately replaced with real values once the component hydrates on the client.

For TypeScript, the type of \`.current\` is \`number | undefined\` (or \`boolean | undefined\` for \`online\`). If you pass these values to functions that expect a definite number, you will get type errors unless you handle the \`undefined\` case.

### Comparison: svelte/reactivity/window vs <svelte:window>

| Feature | \`svelte/reactivity/window\` | \`<svelte:window bind:...>\` |
|---|---|---|
| Usable in \`.svelte.ts\` files | Yes | No |
| Usable in reactive classes | Yes | No |
| Shared singleton listener | Yes | No (one per component) |
| SSR behavior | Returns \`undefined\` | Variables stay at initial value |
| Access pattern | \`.current\` property | Direct variable binding |
| Two-way binding (write) | Read-only | \`scrollX\`, \`scrollY\` are writable |

One important difference: \`<svelte:window bind:scrollY={y}>\` allows two-way binding. Assigning to \`y\` programmatically scrolls the window. The reactive window module values are read-only. If you need to programmatically scroll, use \`window.scrollTo()\` directly.

## Using Reactive Window Values in Shared Modules

The biggest advantage of the reactive window module is that you can use it outside of component files. This enables powerful patterns for shared utilities:

\`\`\`typescript
// responsive.svelte.ts
import { innerWidth } from 'svelte/reactivity/window';

export class ResponsiveHelper {
  breakpoint = $derived(
    (innerWidth.current ?? 1024) < 640 ? 'mobile' as const :
    (innerWidth.current ?? 1024) < 1024 ? 'tablet' as const : 'desktop' as const
  );

  isMobile = $derived(this.breakpoint === 'mobile');
  isTablet = $derived(this.breakpoint === 'tablet');
  isDesktop = $derived(this.breakpoint === 'desktop');
}
\`\`\`

Any component can instantiate or import a shared \`ResponsiveHelper\` and read \`helper.isMobile\` without touching the template or adding \`<svelte:window>\` bindings. The reactive window module handles the event listener internally, and the singleton pattern means only one resize listener exists regardless of how many ResponsiveHelper instances you create.

**Your task:** Build a scroll progress indicator bar that shows how far the user has scrolled down the page. Use \`scrollY\` from \`svelte/reactivity/window\` and a \`$derived\` expression to calculate the percentage. The bar should be fixed to the top of the viewport.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Combining Multiple Window Values

Real-world UIs often need several window values at once. A common example is a header that changes behavior based on both scroll position and viewport width:

\`\`\`svelte
<script lang="ts">
  import { scrollY, innerWidth } from 'svelte/reactivity/window';

  const isScrolled = $derived((scrollY.current ?? 0) > 50);
  const isMobile = $derived((innerWidth.current ?? 1024) < 640);

  const headerClass = $derived(
    isScrolled
      ? (isMobile ? 'header--compact-mobile' : 'header--compact')
      : 'header--full'
  );
</script>

<header class={headerClass}>
  <h1>{isMobile ? 'App' : 'My Application'}</h1>
</header>
\`\`\`

### The online Property for Network Status

The \`online\` reactive value tracks \`navigator.onLine\`. This is invaluable for building offline-aware applications:

\`\`\`svelte
<script lang="ts">
  import { online } from 'svelte/reactivity/window';

  const networkStatus = $derived(online.current ?? true);

  $effect(() => {
    if (!online.current) {
      console.warn('Network connection lost');
    }
  });
</script>

{#if !networkStatus}
  <div class="offline-banner" role="alert">
    You are currently offline. Changes will be saved locally.
  </div>
{/if}
\`\`\`

The \`online\` / \`offline\` events fire when the browser detects a change in network connectivity. Note that \`navigator.onLine\` is not perfectly reliable -- it can report \`true\` even when the actual internet connection is broken (for example, connected to a router with no upstream). For production applications, supplement this with periodic fetch checks to a known endpoint.

### The devicePixelRatio Property

\`devicePixelRatio\` is less commonly used but important for applications that serve resolution-appropriate assets:

\`\`\`svelte
<script lang="ts">
  import { devicePixelRatio } from 'svelte/reactivity/window';

  const dpr = $derived(devicePixelRatio.current ?? 1);
  const imageSize = $derived(dpr > 1.5 ? '2x' : '1x');
</script>

<img src="/images/hero-{imageSize}.png" alt="Hero" />
\`\`\`

This value changes when a user moves a browser window between monitors with different pixel densities, or when they change their OS display scaling. The reactive version automatically updates the UI when this happens.

**Task:** Add an online/offline status badge to your component. When the user is online, show a green badge with "Online". When offline, show a red badge with "Offline". Also display the current viewport dimensions using \`innerWidth\` and \`innerHeight\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `Consider this code:

\`\`\`svelte
<script lang="ts">
  import { scrollY } from 'svelte/reactivity/window';

  let progress = $state(0);

  $effect(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progress = docHeight > 0 ? (scrollY.current ?? 0) / docHeight * 100 : 0;
  });
</script>

<div style="width: {progress}%"></div>
\`\`\`

Explain why using \`$effect\` + \`$state\` here is suboptimal. What would happen if you replaced this with a \`$derived\` expression? Are there any SSR concerns with accessing \`document.documentElement.scrollHeight\` inside \`$derived\`? Propose the cleanest solution.`
		},
		{
			type: 'text',
			content: `## Performance Considerations

The reactive window values use passive event listeners internally. Scroll and resize events fire at high frequency -- potentially 60+ times per second during active scrolling or resizing. The reactive system handles this efficiently because Svelte batches updates: multiple rapid changes to \`scrollY.current\` are coalesced into a single DOM update in the next microtask.

However, be mindful of what you put in \`$derived\` expressions that read scroll or resize values. Expensive computations will run on every scroll event:

\`\`\`typescript
// AVOID: expensive computation on every scroll
const visibleItems = $derived(
  allItems.filter(item => {
    const el = document.getElementById(item.id);
    return el && isInViewport(el, scrollY.current ?? 0);
  })
);

// BETTER: throttle or use IntersectionObserver for visibility
\`\`\`

For scroll-dependent visibility calculations, prefer \`IntersectionObserver\` over reading \`scrollY\` and computing positions manually. The reactive window values are best for simple derived state like progress bars, sticky headers, and responsive breakpoints -- not for complex per-element visibility calculations.

### Combining with $effect for Imperative Side Effects

Sometimes you need to perform imperative actions when window values change. Use \`$effect\` for this:

\`\`\`svelte
<script lang="ts">
  import { scrollY, online } from 'svelte/reactivity/window';

  // Save scroll position to sessionStorage
  $effect(() => {
    const y = scrollY.current;
    if (y !== undefined) {
      sessionStorage.setItem('scrollPos', String(y));
    }
  });

  // Show toast when going offline
  $effect(() => {
    if (online.current === false) {
      showToast('You are offline');
    }
  });
</script>
\`\`\`

## Summary

The \`svelte/reactivity/window\` module provides reactive, singleton-based access to key browser window properties. Each export (\`innerWidth\`, \`innerHeight\`, \`scrollX\`, \`scrollY\`, \`online\`, \`devicePixelRatio\`) has a \`.current\` property that is reactive -- reading it in a template, \`$derived\`, or \`$effect\` automatically subscribes to changes. The values return \`undefined\` during SSR, so always provide fallback defaults with \`??\`. Unlike \`<svelte:window bind:...>\`, these values work in \`.svelte.ts\` modules, reactive classes, and shared utilities. They are singletons, meaning only one event listener per property exists across your entire application regardless of how many consumers read the value.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.reactivity.window.scrollY'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import scrollY, innerWidth, innerHeight, and online from 'svelte/reactivity/window'

  // TODO: Create a $derived expression for scroll progress percentage
  //       scrollProgress = (scrollY / (documentHeight - viewportHeight)) * 100

  // TODO: Create a $derived expression for online/offline status
</script>

<div class="progress-bar">
  <!-- TODO: Set width based on scrollProgress -->
  <div class="progress-fill" style="width: 0%"></div>
</div>

<div class="status-bar">
  <!-- TODO: Show online/offline badge -->
  <span class="badge">Unknown</span>

  <!-- TODO: Show viewport dimensions -->
  <span class="dimensions">? x ?</span>
</div>

<main class="content">
  <h1>Scroll Progress Demo</h1>
  <p>Scroll down to see the progress bar fill up and the scroll percentage change.</p>

  {#each Array(20) as _, i}
    <section class="section">
      <h2>Section {i + 1}</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
    </section>
  {/each}
</main>

<style>
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: #e2e8f0;
    z-index: 100;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    transition: width 50ms ease-out;
  }

  .status-bar {
    position: fixed;
    top: 8px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 100;
    font-size: 0.8rem;
    font-family: system-ui, sans-serif;
  }

  .badge {
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 0.75rem;
  }

  .badge.online {
    background: #dcfce7;
    color: #166534;
  }

  .badge.offline {
    background: #fee2e2;
    color: #991b1b;
  }

  .dimensions {
    color: #64748b;
    font-variant-numeric: tabular-nums;
  }

  .content {
    padding: 3rem 1.5rem;
    max-width: 700px;
    margin: 0 auto;
    font-family: system-ui, sans-serif;
  }

  .section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 8px;
  }

  .section h2 {
    margin-top: 0;
    color: #334155;
  }

  .section p {
    color: #64748b;
    line-height: 1.7;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { scrollY, innerWidth, innerHeight, online } from 'svelte/reactivity/window';

  const scrollProgress = $derived.by(() => {
    if (typeof document === 'undefined') return 0;
    const docHeight = document.documentElement.scrollHeight - (innerHeight.current ?? 0);
    return docHeight > 0
      ? Math.min(100, Math.round(((scrollY.current ?? 0) / docHeight) * 100))
      : 0;
  });

  const isOnline = $derived(online.current ?? true);
</script>

<div class="progress-bar">
  <div class="progress-fill" style="width: {scrollProgress}%"></div>
</div>

<div class="status-bar">
  <span class="badge" class:online={isOnline} class:offline={!isOnline}>
    {isOnline ? 'Online' : 'Offline'}
  </span>

  <span class="dimensions">
    {innerWidth.current ?? '?'} x {innerHeight.current ?? '?'}
  </span>
</div>

<main class="content">
  <h1>Scroll Progress Demo</h1>
  <p>Scroll down to see the progress bar fill up. Current progress: {scrollProgress}%</p>

  {#each Array(20) as _, i}
    <section class="section">
      <h2>Section {i + 1}</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
    </section>
  {/each}
</main>

<style>
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: #e2e8f0;
    z-index: 100;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    transition: width 50ms ease-out;
  }

  .status-bar {
    position: fixed;
    top: 8px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 100;
    font-size: 0.8rem;
    font-family: system-ui, sans-serif;
  }

  .badge {
    padding: 0.2rem 0.6rem;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 0.75rem;
  }

  .badge.online {
    background: #dcfce7;
    color: #166534;
  }

  .badge.offline {
    background: #fee2e2;
    color: #991b1b;
  }

  .dimensions {
    color: #64748b;
    font-variant-numeric: tabular-nums;
  }

  .content {
    padding: 3rem 1.5rem;
    max-width: 700px;
    margin: 0 auto;
    font-family: system-ui, sans-serif;
  }

  .section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 8px;
  }

  .section h2 {
    margin-top: 0;
    color: #334155;
  }

  .section p {
    color: #64748b;
    line-height: 1.7;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a scroll progress indicator using scrollY from svelte/reactivity/window',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'svelte/reactivity/window' },
						{ type: 'contains', value: 'scrollY' },
						{ type: 'contains', value: '$derived' }
					]
				}
			},
			hints: [
				'Import `scrollY` and `innerHeight` from `svelte/reactivity/window`. Access their values with `.current`, e.g., `scrollY.current`.',
				'Calculate progress with: `const docHeight = document.documentElement.scrollHeight - (innerHeight.current ?? 0)`. Then `scrollProgress = docHeight > 0 ? Math.round(((scrollY.current ?? 0) / docHeight) * 100) : 0`.',
				'Use `$derived.by(() => { ... })` for the calculation since it requires multiple statements. Set the progress bar width with `style="width: {scrollProgress}%"`. Guard against SSR by checking `typeof document !== "undefined"`.'
			],
			conceptsTested: ['svelte5.reactivity.window.scrollY']
		},
		{
			id: 'cp-2',
			description: 'Add an online/offline badge and viewport dimensions display',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'online' },
						{ type: 'contains', value: 'innerWidth' },
						{ type: 'contains', value: 'innerHeight' }
					]
				}
			},
			hints: [
				'Import `online`, `innerWidth`, and `innerHeight` from `svelte/reactivity/window`. Create `const isOnline = $derived(online.current ?? true)` with a sensible SSR default.',
				'Use `class:online={isOnline}` and `class:offline={!isOnline}` on the badge span. Show `{isOnline ? "Online" : "Offline"}` as the badge text.',
				'Display dimensions with `{innerWidth.current ?? "?"} x {innerHeight.current ?? "?"}`. The `??` operator handles the `undefined` value during SSR gracefully.'
			],
			conceptsTested: ['svelte5.reactivity.window.online', 'svelte5.reactivity.window.innerWidth']
		}
	]
};
