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
	estimatedMinutes: 18,
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

## Performance Deep Dive: Lazy Listeners vs Always-On Bindings

Understanding the performance characteristics of \`svelte/reactivity/window\` versus \`<svelte:window>\` goes beyond just "singleton vs multiple listeners." The two approaches differ fundamentally in *when* listeners are active and *how* updates propagate.

**\`<svelte:window>\` uses always-on listeners.** The moment a component mounts with \`<svelte:window bind:scrollY>\`, a scroll listener is attached to the window. It fires on every scroll event for the entire lifetime of the component, whether or not any reactive consumer is currently reading the bound variable. If your component only reads \`scrollY\` in a conditional branch that is rarely taken, the listener still fires on every scroll and updates the bound variable.

**\`svelte/reactivity/window\` uses lazy listeners.** The reactive window values internally use Svelte's \`createSubscriber\` pattern. A listener is only attached when at least one reactive consumer is actively tracking the value. If no component template, \`$derived\`, or \`$effect\` is currently reading \`scrollY.current\`, no scroll listener is registered. The moment a consumer reads \`.current\` inside a reactive context, the listener activates. When all consumers stop tracking (their components unmount or their effects are cleaned up), the listener is removed.

This lazy behavior means that importing \`scrollY\` at the top of a module does not cost anything by itself. The cost is only incurred when \`.current\` is read inside a reactive context. This is a significant advantage in large applications where many modules might import reactive window values but only a subset of them are actively rendered at any given time.

**Batching.** Both approaches benefit from Svelte 5's update batching. When scroll events fire rapidly (60+ times per second), the reactive system coalesces multiple value changes into a single DOM update in the next microtask. However, with \`<svelte:window>\`, each component processes its own listener callback independently before batching takes effect. With the singleton approach, only one callback processes the event, and all consumers are notified through the reactivity graph.

## Building Custom Reactive Window Values with createSubscriber

The \`svelte/reactivity/window\` module covers the most common window properties, but you may need to track values it does not export -- \`window.visualViewport\` height (important for mobile keyboards), \`window.orientation\`, or the result of a \`matchMedia\` query. You can build your own reactive window values using the same pattern Svelte uses internally.

The key primitive is \`createSubscriber\` from \`svelte/reactivity\`. It creates a function that, when called inside a reactive context, subscribes to a notification callback. When you call the notification callback, all reactive consumers that called the subscriber function are invalidated and re-read the value.

\`\`\`typescript
// reactive-viewport-height.svelte.ts
import { createSubscriber } from 'svelte/reactivity';

function createReactiveViewportHeight() {
  const subscribe = createSubscriber((notify) => {
    // Called when first consumer subscribes
    const onResize = () => notify();

    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', onResize);
      return () => {
        // Called when last consumer unsubscribes
        window.visualViewport!.removeEventListener('resize', onResize);
      };
    }
  });

  return {
    get current() {
      subscribe(); // track this read
      return typeof window !== 'undefined'
        ? window.visualViewport?.height ?? window.innerHeight
        : undefined;
    }
  };
}

export const viewportHeight = createReactiveViewportHeight();
\`\`\`

Usage is identical to the built-in reactive window values:

\`\`\`svelte
<script lang="ts">
  import { viewportHeight } from './reactive-viewport-height.svelte';

  const height = $derived(viewportHeight.current ?? 0);
</script>

<p>Visible viewport height: {height}px</p>
\`\`\`

Another common custom value is a reactive \`matchMedia\` query result:

\`\`\`typescript
// reactive-media-query.svelte.ts
import { createSubscriber } from 'svelte/reactivity';

export function createMediaQuery(query: string) {
  const subscribe = createSubscriber((notify) => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = () => notify();
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  });

  return {
    get current() {
      subscribe();
      return typeof window !== 'undefined'
        ? window.matchMedia(query).matches
        : undefined;
    }
  };
}
\`\`\`

\`\`\`svelte
<script lang="ts">
  import { createMediaQuery } from './reactive-media-query.svelte';

  const prefersDark = createMediaQuery('(prefers-color-scheme: dark)');
  const prefersReducedMotion = createMediaQuery('(prefers-reduced-motion: reduce)');

  const theme = $derived(prefersDark.current ? 'dark' : 'light');
</script>

<div class="app" data-theme={theme}>
  {#if prefersReducedMotion.current}
    <p>Animations disabled</p>
  {/if}
</div>
\`\`\`

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

### Combining Multiple Reactive Window Values

Real-world responsive logic often needs to combine several window properties. For example, computing the viewport's aspect ratio from \`innerWidth\` and \`innerHeight\`:

\`\`\`typescript
// viewport-utils.svelte.ts
import { innerWidth, innerHeight, scrollY } from 'svelte/reactivity/window';

export class ViewportInfo {
  width = $derived(innerWidth.current ?? 0);
  height = $derived(innerHeight.current ?? 0);

  aspectRatio = $derived.by(() => {
    const w = innerWidth.current ?? 0;
    const h = innerHeight.current ?? 0;
    return h > 0 ? w / h : 1;
  });

  isLandscape = $derived(this.aspectRatio > 1);
  isPortrait = $derived(this.aspectRatio <= 1);

  // Categorize orientation with thresholds
  orientation = $derived(
    this.aspectRatio > 1.5 ? 'wide-landscape' as const :
    this.aspectRatio > 1 ? 'landscape' as const :
    this.aspectRatio > 0.67 ? 'portrait' as const :
    'tall-portrait' as const
  );

  // Scroll-derived values
  scrollY = $derived(scrollY.current ?? 0);

  scrollProgress = $derived.by(() => {
    if (typeof document === 'undefined') return 0;
    const docHeight = document.documentElement.scrollHeight - (innerHeight.current ?? 0);
    return docHeight > 0 ? Math.min(100, ((scrollY.current ?? 0) / docHeight) * 100) : 0;
  });
}
\`\`\`

Then in any component:

\`\`\`svelte
<script lang="ts">
  import { ViewportInfo } from './viewport-utils.svelte';

  const viewport = new ViewportInfo();
</script>

<div class={["layout", viewport.isLandscape && "landscape"]}>
  <p>Aspect ratio: {viewport.aspectRatio.toFixed(2)}</p>
  <p>Orientation: {viewport.orientation}</p>
  <progress value={viewport.scrollProgress} max="100"></progress>
</div>
\`\`\`

This pattern centralizes responsive logic in one place. If your design system changes breakpoints from 640/1024 to 600/960, you update a single file. Every component that uses the shared helper automatically reflects the change.

You can also create a module-level singleton rather than instantiating per-component:

\`\`\`typescript
// responsive.svelte.ts
import { innerWidth } from 'svelte/reactivity/window';

class Responsive {
  breakpoint = $derived(
    (innerWidth.current ?? 1024) < 640 ? 'sm' as const :
    (innerWidth.current ?? 1024) < 1024 ? 'md' as const : 'lg' as const
  );
  isMobile = $derived(this.breakpoint === 'sm');
}

export const responsive = new Responsive();
\`\`\`

\`\`\`svelte
<script lang="ts">
  import { responsive } from './responsive.svelte';
</script>

{#if responsive.isMobile}
  <MobileNav />
{:else}
  <DesktopNav />
{/if}
\`\`\`

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

**Task:** Add an online/offline status badge to your component. When the user is online, show a green badge with "Online". When offline, show a red badge with "Offline". Also display the current viewport dimensions using \`innerWidth\` and \`innerHeight\`, and show the aspect ratio computed from both values.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Testing Components That Use Reactive Window Values

Components that depend on \`svelte/reactivity/window\` read from singletons that ultimately rely on the browser's \`window\` object. In a test environment (Node.js with jsdom or happy-dom), these values either do not exist or behave differently from a real browser. To write reliable tests, you need to mock the reactive window imports.

### Mocking with Vitest

The simplest approach is to mock the entire \`svelte/reactivity/window\` module:

\`\`\`typescript
import { vi, test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';

// Create reactive-like mock objects
const mockInnerWidth = { current: 1024 };
const mockScrollY = { current: 0 };
const mockOnline = { current: true };

vi.mock('svelte/reactivity/window', () => ({
  innerWidth: mockInnerWidth,
  innerHeight: { current: 768 },
  scrollX: { current: 0 },
  scrollY: mockScrollY,
  online: mockOnline,
  devicePixelRatio: { current: 2 }
}));

import ResponsiveHeader from './ResponsiveHeader.svelte';

test('shows mobile layout for narrow viewport', () => {
  mockInnerWidth.current = 480;
  render(ResponsiveHeader);
  expect(screen.getByText('App')).toBeInTheDocument();
});

test('shows desktop layout for wide viewport', () => {
  mockInnerWidth.current = 1200;
  render(ResponsiveHeader);
  expect(screen.getByText('My Application')).toBeInTheDocument();
});

test('shows offline banner when offline', () => {
  mockOnline.current = false;
  render(ResponsiveHeader);
  expect(screen.getByRole('alert')).toHaveTextContent('offline');
});
\`\`\`

This approach works because the component reads \`.current\` during rendering. By setting \`.current\` on the mock objects before rendering, you control what the component sees.

### Simulating Value Changes After Render

To test that a component reacts to window value *changes* (not just initial values), you need the mock objects to participate in Svelte's reactivity system. In a test, the simplest approach is to re-render the component with updated mock values:

\`\`\`typescript
import { render, screen, cleanup } from '@testing-library/svelte';

test('updates layout when viewport changes', () => {
  mockInnerWidth.current = 1200;
  const { rerender } = render(ResponsiveHeader);
  expect(screen.getByText('My Application')).toBeInTheDocument();

  // Simulate a resize
  mockInnerWidth.current = 480;
  // In a real reactive system, the component would auto-update.
  // In tests with mocked modules, you may need to re-render.
  cleanup();
  render(ResponsiveHeader);
  expect(screen.getByText('App')).toBeInTheDocument();
});
\`\`\`

For more sophisticated testing where you need true reactivity from mocks, consider using \`$state\` in your mock setup (if your test runner compiles \`.svelte.ts\` files) or use an integration test that renders the component in a real browser with Playwright.`
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

The \`svelte/reactivity/window\` module provides reactive, singleton-based access to key browser window properties. Each export (\`innerWidth\`, \`innerHeight\`, \`scrollX\`, \`scrollY\`, \`online\`, \`devicePixelRatio\`) has a \`.current\` property that is reactive -- reading it in a template, \`$derived\`, or \`$effect\` automatically subscribes to changes. The values return \`undefined\` during SSR, so always provide fallback defaults with \`??\`. Unlike \`<svelte:window bind:...>\`, these values work in \`.svelte.ts\` modules, reactive classes, and shared utilities. They are singletons, meaning only one event listener per property exists across your entire application regardless of how many consumers read the value. The listeners are lazy -- they only activate when at least one reactive consumer is tracking the value, and deactivate when all consumers stop. For window properties not covered by the module, build your own reactive values using \`createSubscriber\` from \`svelte/reactivity\`. Combine multiple reactive window values in shared \`.svelte.ts\` utility classes to centralize responsive logic, and mock the module in tests to control viewport-dependent behavior.`
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

  // TODO: Create a $derived expression for aspect ratio from innerWidth and innerHeight
</script>

<div class="progress-bar">
  <!-- TODO: Set width based on scrollProgress -->
  <div class="progress-fill" style="width: 0%"></div>
</div>

<div class="status-bar">
  <!-- TODO: Show online/offline badge -->
  <span class="badge">Unknown</span>

  <!-- TODO: Show viewport dimensions and aspect ratio -->
  <span class="dimensions">? x ?</span>
  <span class="aspect-ratio">Aspect: ?</span>
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

  .aspect-ratio {
    color: #94a3b8;
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

  const aspectRatio = $derived.by(() => {
    const w = innerWidth.current ?? 0;
    const h = innerHeight.current ?? 0;
    return h > 0 ? (w / h).toFixed(2) : '0.00';
  });
</script>

<div class="progress-bar">
  <div class="progress-fill" style="width: {scrollProgress}%"></div>
</div>

<div class="status-bar">
  <span class={["badge", isOnline && "online", !isOnline && "offline"]}>
    {isOnline ? 'Online' : 'Offline'}
  </span>

  <span class="dimensions">
    {innerWidth.current ?? '?'} x {innerHeight.current ?? '?'}
  </span>

  <span class="aspect-ratio">
    Aspect: {aspectRatio}
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

  .aspect-ratio {
    color: #94a3b8;
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
