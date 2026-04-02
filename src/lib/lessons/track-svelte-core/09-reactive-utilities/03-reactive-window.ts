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
	estimatedMinutes: 15,
	concepts: ['svelte5.reactivity.window', 'svelte5.reactivity.window.scroll', 'svelte5.reactivity.window.online'],
	prerequisites: ['svelte5.runes.derived', 'svelte5.runes.effect'],

	content: [
		{
			type: 'text',
			content: `# Reactive Window Values

## Why svelte/reactivity/window Exists

Before this module, accessing reactive window properties required either \`<svelte:window>\` bindings or manual event listeners inside \`$effect\`. Both approaches work, but each has friction points:

**The \`<svelte:window>\` approach** requires adding a template element and binding variables:

\`\`\`svelte
<script>
  let innerWidth = $state(0);
  let scrollY = $state(0);
</script>
<svelte:window bind:innerWidth bind:scrollY />
\`\`\`

This works but has downsides: the template element is visual noise, you need to declare the state variables separately, and you cannot use the values in \`.svelte.ts\` files (which have no template section).

**The manual approach** requires event listeners with cleanup:

\`\`\`svelte
<script>
  let innerWidth = $state(window.innerWidth);

  $effect(() => {
    const handler = () => { innerWidth = window.innerWidth; };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  });
</script>
\`\`\`

This is tedious and error-prone — easy to forget cleanup, and each value needs its own listener.

**\`svelte/reactivity/window\`** solves both problems. It provides pre-built reactive objects for common window properties, each with a \`.current\` getter that is automatically reactive in effects and derived values:

\`\`\`svelte
<script>
  import { innerWidth, scrollY, online } from 'svelte/reactivity/window';
</script>

<p>Width: {innerWidth.current}px</p>
<p>Scroll: {scrollY.current}px</p>
<p>Online: {online.current}</p>
\`\`\`

No template elements. No manual listeners. No cleanup code. And it works in \`.svelte.ts\` files too.

## Available Reactive Values

The module exports these reactive objects (all available since Svelte 5.11):

| Import | Tracks | Event |
|--------|--------|-------|
| \`innerWidth\` | \`window.innerWidth\` | \`resize\` |
| \`innerHeight\` | \`window.innerHeight\` | \`resize\` |
| \`outerWidth\` | \`window.outerWidth\` | \`resize\` |
| \`outerHeight\` | \`window.outerHeight\` | \`resize\` |
| \`scrollX\` | \`window.scrollX\` | \`scroll\` |
| \`scrollY\` | \`window.scrollY\` | \`scroll\` |
| \`online\` | \`navigator.onLine\` | \`online\`/\`offline\` |
| \`devicePixelRatio\` | \`window.devicePixelRatio\` | varies by browser |
| \`screenLeft\` | \`window.screenLeft\` | \`requestAnimationFrame\` |
| \`screenTop\` | \`window.screenTop\` | \`requestAnimationFrame\` |

Each has a single \`.current\` property that returns the live value. Reading \`.current\` in an effect or derived creates a reactive subscription — when the value changes (due to the underlying browser event), any effect or derived that read it will re-run.

### SSR Behavior

On the server, all values return \`undefined\`. This is critical to understand: there is no window during server-side rendering, so the type of each value's \`.current\` is \`number | undefined\` (or \`boolean | undefined\` for \`online\`). You must handle this:

\`\`\`svelte
<script>
  import { innerWidth } from 'svelte/reactivity/window';

  // Wrong: might be undefined on server
  let columns = $derived(innerWidth.current > 768 ? 3 : 1);

  // Correct: provide fallback
  let columns = $derived((innerWidth.current ?? 1024) > 768 ? 3 : 1);
</script>
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'svelte5.reactivity.window'
		},
		{
			type: 'text',
			content: `## How It Works Under the Hood

Each reactive window value is built using \`createSubscriber\` (from the previous lesson). Here is a simplified version of how \`innerWidth\` is implemented internally:

\`\`\`typescript
import { createSubscriber } from 'svelte/reactivity';

function createWindowValue(property, event) {
  const subscribe = createSubscriber((update) => {
    window.addEventListener(event, update);
    return () => window.removeEventListener(event, update);
  });

  return {
    get current() {
      subscribe(); // register as dependency
      return window[property];
    }
  };
}

export const innerWidth = createWindowValue('innerWidth', 'resize');
\`\`\`

The \`createSubscriber\` pattern ensures the event listener is only active while something is reading the value inside an effect. If no effect reads \`innerWidth.current\`, no resize listener is attached — zero overhead.

### Lazy Activation

This is a key performance property: reactive window values are **lazy**. The browser event listener is not attached until the first effect that reads \`.current\` runs. If you import \`innerWidth\` but never read it reactively, there is zero runtime cost. When all effects that read it are destroyed, the listener is removed.

This is fundamentally different from \`<svelte:window bind:innerWidth>\`, which attaches the listener when the component mounts regardless of whether any reactive code reads the value.

## Comparison with <svelte:window>

| Feature | \`svelte/reactivity/window\` | \`<svelte:window>\` |
|---------|---------------------------|-------------------|
| Works in .svelte.ts files | Yes | No (needs template) |
| Lazy listener attachment | Yes | No (always attached) |
| SSR safety | Returns undefined | Requires component mount |
| Event handlers | No | Yes (\`onkeydown\`, etc.) |
| Writeable bindings | No (read-only) | Yes (\`bind:scrollX\` can scroll) |

**Use \`svelte/reactivity/window\`** for reading values reactively (dimensions, scroll position, online status).

**Use \`<svelte:window>\`** when you need event handlers (\`onkeydown\`, \`onhashchange\`) or writeable bindings (\`bind:scrollX\` to programmatically scroll).`
		},
		{
			type: 'xray-prompt',
			content: 'Consider how each reactive window value lazily activates its event listener. No effect reading the value means no listener — zero overhead. This is the createSubscriber pattern at work.'
		},
		{
			type: 'text',
			content: `## Practical Patterns

### Scroll Progress Indicator

A common UI pattern is showing how far the user has scrolled through a page:

\`\`\`svelte
<script>
  import { scrollY, innerHeight } from 'svelte/reactivity/window';

  let progress = $derived(() => {
    const y = scrollY.current ?? 0;
    const viewHeight = innerHeight.current ?? 800;
    const docHeight = document.documentElement.scrollHeight;
    return Math.min(y / (docHeight - viewHeight), 1);
  });
</script>

<div class="progress-bar" style:width="{progress * 100}%"></div>
\`\`\`

### Responsive Breakpoint Logic

Switch between component variants based on viewport:

\`\`\`svelte
<script>
  import { innerWidth } from 'svelte/reactivity/window';

  let layout = $derived(
    (innerWidth.current ?? 1024) >= 1024 ? 'desktop' :
    (innerWidth.current ?? 1024) >= 768 ? 'tablet' : 'mobile'
  );
</script>

{#if layout === 'desktop'}
  <DesktopNav />
{:else}
  <MobileNav />
{/if}
\`\`\`

### Online/Offline Status

Show users when they lose connectivity:

\`\`\`svelte
<script>
  import { online } from 'svelte/reactivity/window';
</script>

{#if online.current === false}
  <div class="offline-banner">
    You are offline. Changes will sync when connection is restored.
  </div>
{/if}
\`\`\`

Note the explicit \`=== false\` check — on the server, \`online.current\` is \`undefined\`, and we do not want to show the banner during SSR.

### Device Pixel Ratio

Serve high-resolution images on Retina displays:

\`\`\`svelte
<script>
  import { devicePixelRatio } from 'svelte/reactivity/window';

  let suffix = $derived(
    (devicePixelRatio.current ?? 1) >= 2 ? '@2x' : ''
  );
</script>

<img src="/images/hero{suffix}.png" alt="Hero" />
\`\`\`

**Your task:** Build a scroll progress indicator that shows a colored bar at the top of the page, plus an online/offline status badge in the corner. Use \`scrollY\`, \`innerHeight\`, and \`online\` from \`svelte/reactivity/window\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-reactive-window-1'
		},
		{
			type: 'text',
			content: `## Using Reactive Window Values in .svelte.ts Files

One of the most powerful features is that these values work outside component files. You can create shared reactive utilities:

\`\`\`typescript
// responsive.svelte.ts
import { innerWidth } from 'svelte/reactivity/window';

export class Responsive {
  get isMobile() { return (innerWidth.current ?? 1024) < 768; }
  get isTablet() { return (innerWidth.current ?? 1024) >= 768 && (innerWidth.current ?? 1024) < 1024; }
  get isDesktop() { return (innerWidth.current ?? 1024) >= 1024; }
  get columns() { return this.isMobile ? 1 : this.isTablet ? 2 : 3; }
}

export const responsive = new Responsive();
\`\`\`

Then use it anywhere:

\`\`\`svelte
<script>
  import { responsive } from './responsive.svelte';
</script>

<div class="grid" style:--columns={responsive.columns}>
  {#each items as item}
    <Card {item} compact={responsive.isMobile} />
  {/each}
</div>
\`\`\`

This is impossible with \`<svelte:window>\` bindings, which are locked to component templates.

## Summary

\`svelte/reactivity/window\` gives you lazy, SSR-safe, reactive access to window properties without template elements or manual event listeners. Use it for reading dimensions, scroll position, and online status. Use \`<svelte:window>\` for event handlers and writeable bindings. The values work everywhere — components, \`.svelte.ts\` files, reactive classes — making them the foundation for responsive logic in Svelte 5.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import scrollY, innerHeight, and online from 'svelte/reactivity/window'

  // TODO: Create a derived progress value (0 to 1) based on scroll position
  // Hint: progress = scrollY / (documentHeight - viewportHeight)
  // Use 2000 as an approximate document height for this exercise

  // TODO: Check online status for the badge
</script>

<!-- TODO: Add a progress bar at the top -->
<div class="progress-bar">
  <!-- Set width based on scroll progress -->
</div>

<!-- TODO: Add online/offline badge -->

<main>
  <h1>Reactive Window Values</h1>

  <section>
    <h2>Scroll down to see the progress bar</h2>
    <p>The progress bar at the top tracks your scroll position using scrollY and innerHeight from svelte/reactivity/window.</p>
  </section>

  <section>
    <h2>How It Works</h2>
    <p>Each reactive window value has a .current property. Reading it in a derived or effect creates a reactive subscription. The browser event listener is lazily attached only when needed.</p>
  </section>

  <section>
    <h2>SSR Safety</h2>
    <p>All values return undefined on the server. Always provide fallbacks with the ?? operator.</p>
  </section>

  <section>
    <h2>Keep Scrolling</h2>
    <p>Watch the progress bar fill up as you scroll through this content.</p>
  </section>

  <section>
    <h2>Almost There</h2>
    <p>The online/offline badge in the corner should show your current network status.</p>
  </section>
</main>

<style>
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    z-index: 100;
    transition: width 50ms ease-out;
  }

  .status-badge {
    position: fixed;
    bottom: 16px;
    right: 16px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    z-index: 100;
  }

  .status-badge.online {
    background: #d1fae5;
    color: #065f46;
  }

  .status-badge.offline {
    background: #fee2e2;
    color: #991b1b;
  }

  main {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  section {
    margin-bottom: 400px;
    padding: 2rem;
    background: #f9fafb;
    border-radius: 8px;
  }

  h1 { text-align: center; margin-bottom: 2rem; }
  h2 { margin-bottom: 1rem; color: #1f2937; }
  p { color: #6b7280; line-height: 1.6; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { scrollY, innerHeight, online } from 'svelte/reactivity/window';

  let progress = $derived(() => {
    const y = scrollY.current ?? 0;
    const viewHeight = innerHeight.current ?? 800;
    const docHeight = 2000;
    return Math.min(y / (docHeight - viewHeight), 1);
  });

  let isOnline = $derived(online.current !== false);
</script>

<div class="progress-bar" style:width="{progress * 100}%"></div>

<div class="status-badge" class:online={isOnline} class:offline={!isOnline}>
  {isOnline ? 'Online' : 'Offline'}
</div>

<main>
  <h1>Reactive Window Values</h1>

  <section>
    <h2>Scroll down to see the progress bar</h2>
    <p>The progress bar at the top tracks your scroll position using scrollY and innerHeight from svelte/reactivity/window.</p>
  </section>

  <section>
    <h2>How It Works</h2>
    <p>Each reactive window value has a .current property. Reading it in a derived or effect creates a reactive subscription. The browser event listener is lazily attached only when needed.</p>
  </section>

  <section>
    <h2>SSR Safety</h2>
    <p>All values return undefined on the server. Always provide fallbacks with the ?? operator.</p>
  </section>

  <section>
    <h2>Keep Scrolling</h2>
    <p>Watch the progress bar fill up as you scroll through this content.</p>
  </section>

  <section>
    <h2>Almost There</h2>
    <p>The online/offline badge in the corner should show your current network status.</p>
  </section>
</main>

<style>
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    z-index: 100;
    transition: width 50ms ease-out;
  }

  .status-badge {
    position: fixed;
    bottom: 16px;
    right: 16px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    z-index: 100;
  }

  .status-badge.online {
    background: #d1fae5;
    color: #065f46;
  }

  .status-badge.offline {
    background: #fee2e2;
    color: #991b1b;
  }

  main { max-width: 600px; margin: 0 auto; padding: 2rem; }
  section { margin-bottom: 400px; padding: 2rem; background: #f9fafb; border-radius: 8px; }
  h1 { text-align: center; margin-bottom: 2rem; }
  h2 { margin-bottom: 1rem; color: #1f2937; }
  p { color: #6b7280; line-height: 1.6; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-reactive-window-1',
			description: 'Import reactive window values and create a scroll progress indicator with online status badge',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'svelte/reactivity/window' },
						{ type: 'contains', value: 'scrollY' },
						{ type: 'contains', value: '.current' }
					]
				}
			},
			hints: [
				'Import scrollY, innerHeight, and online from \'svelte/reactivity/window\'.',
				'Create a $derived that calculates progress from scrollY.current and innerHeight.current. Remember to use ?? for SSR fallbacks.',
				'Use style:width="{progress * 100}%" on the progress bar div, and class:online / class:offline on the status badge.'
			],
			conceptsTested: ['svelte5.reactivity.window']
		}
	]
};
