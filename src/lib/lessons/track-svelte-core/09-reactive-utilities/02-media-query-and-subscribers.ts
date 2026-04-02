import type { Lesson } from '$types/lesson';

export const mediaQueryAndSubscribers: Lesson = {
	id: 'svelte-core.reactive-utilities.media-query-and-subscribers',
	slug: 'media-query-and-subscribers',
	title: 'MediaQuery & createSubscriber',
	description:
		'Use MediaQuery for reactive responsive design and createSubscriber to bridge external event systems with Svelte reactivity.',
	trackId: 'svelte-core',
	moduleId: 'reactive-utilities',
	order: 2,
	estimatedMinutes: 20,
	concepts: ['svelte5.reactivity.media-query', 'svelte5.reactivity.create-subscriber'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived', 'svelte5.runes.effect'],

	content: [
		{
			type: 'text',
			content: `# MediaQuery & createSubscriber

## Responsive Design Without CSS: The MediaQuery Class

CSS media queries handle responsive layouts well, but sometimes you need responsive logic in JavaScript. You might need to render entirely different component trees based on screen size, change the number of columns passed to a grid algorithm, swap between a table and a card list, or adjust animation parameters. CSS cannot do these things -- you need the media query result as a reactive JavaScript value.

Before Svelte's \`MediaQuery\` class, the standard approach was verbose and error-prone:

\`\`\`svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let isMobile = $state(false);

  onMount(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    isMobile = mql.matches;

    function handler(e: MediaQueryListEvent) {
      isMobile = e.matches;
    }

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  });
</script>
\`\`\`

This requires \`onMount\` (because \`window\` does not exist during SSR), manual event listener setup, manual cleanup, and a separate \`$state\` variable. Every media query you track needs its own copy of this boilerplate. Forget the cleanup and you leak event listeners.

### MediaQuery from svelte/reactivity

The \`MediaQuery\` class from \`svelte/reactivity\` reduces this to a single line:

\`\`\`svelte
<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity';

  const isMobile = new MediaQuery('max-width: 768px');
  const prefersReducedMotion = new MediaQuery('prefers-reduced-motion: reduce');
  const isDarkMode = new MediaQuery('prefers-color-scheme: dark');
</script>

{#if isMobile.current}
  <MobileLayout />
{:else}
  <DesktopLayout />
{/if}
\`\`\`

Note the API: you pass the media query string (without the surrounding parentheses -- Svelte adds them). The result is an object with a reactive \`.current\` property that returns \`true\` or \`false\`. When the media query match state changes (e.g., the user resizes the browser past the breakpoint), \`.current\` updates and any component reading it re-renders.

You do not need \`onMount\`. You do not need manual cleanup. The \`MediaQuery\` class handles listener registration and teardown internally, tied to Svelte's component lifecycle.

### The .current Convention

The \`.current\` property is a convention used throughout \`svelte/reactivity\`. Unlike \`$state\` variables that are read directly by name, reactive utility objects expose their value through \`.current\`. This is because they are class instances, not rune-declared variables. The \`.current\` getter is where the reactive signal read happens -- accessing it creates a dependency, just like reading a \`$state\` variable.

This convention appears in \`MediaQuery\`, the window values module (covered in the next lesson), and custom reactive utilities you build with \`createSubscriber\`.

### SSR Fallback Values

Server-side rendering has no \`window\`, so media queries cannot be evaluated on the server. By default, \`MediaQuery.current\` returns \`false\` during SSR. You can provide a fallback value as the second argument:

\`\`\`typescript
// Default to mobile-first on the server
const isMobile = new MediaQuery('max-width: 768px', true);

// On the server, isMobile.current === true
// On the client, it reflects the actual media query
\`\`\`

This is important for avoiding layout shift. If your server renders the desktop layout but the user is on mobile, they will see the desktop layout flash before switching to mobile on hydration. By setting the fallback to \`true\` for a mobile-first design, the server renders the mobile layout, which is correct for mobile users and acceptable for desktop users (who will see mobile briefly before the query resolves).

### Multiple Breakpoints Pattern

For complex responsive designs, define all your breakpoints as MediaQuery instances:

\`\`\`typescript
import { MediaQuery } from 'svelte/reactivity';

const breakpoints = {
  sm: new MediaQuery('min-width: 640px'),
  md: new MediaQuery('min-width: 768px'),
  lg: new MediaQuery('min-width: 1024px'),
  xl: new MediaQuery('min-width: 1280px'),
};

// In template:
// {#if breakpoints.lg.current} ... large layout
// {:else if breakpoints.md.current} ... medium layout
// {:else} ... small layout
\`\`\`

Or derive a single "current breakpoint" value:

\`\`\`typescript
const currentBreakpoint = $derived(
  breakpoints.xl.current ? 'xl' :
  breakpoints.lg.current ? 'lg' :
  breakpoints.md.current ? 'md' :
  breakpoints.sm.current ? 'sm' : 'xs'
);

const columns = $derived(
  currentBreakpoint === 'xl' ? 4 :
  currentBreakpoint === 'lg' ? 3 :
  currentBreakpoint === 'md' ? 2 : 1
);
\`\`\`

This gives you a single reactive value (\`columns\`) that you can pass to a grid component, and it updates automatically when the viewport crosses any breakpoint.

**Your task:** Build a responsive dashboard that uses \`MediaQuery\` to switch between a multi-column grid layout on wide screens and a single-column stack on narrow screens. Define at least two breakpoints and derive the number of grid columns from them.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.reactivity.media-query'
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## createSubscriber: Bridging External Events with Svelte Reactivity

\`MediaQuery\` solves the specific problem of responsive design. But what about other browser APIs that emit events? \`IntersectionObserver\`, \`WebSocket\`, \`EventSource\`, \`BroadcastChannel\`, geolocation, battery status, network information -- all of these produce values over time through callbacks or events, and you want those values to be reactive in Svelte.

\`createSubscriber\` from \`svelte/reactivity\` is the primitive that makes this possible. It is the building block that \`MediaQuery\` itself is built on. It bridges the gap between "something happened outside Svelte" and "Svelte should re-render."

### How createSubscriber Works

\`createSubscriber\` takes a setup function and returns a \`subscribe\` function. The setup function receives an \`update\` callback. When you call \`update()\`, Svelte knows the value has changed and schedules a re-render for any component that read the value.

\`\`\`typescript
import { createSubscriber } from 'svelte/reactivity';

function createOnlineStatus() {
  let online = navigator.onLine;

  const subscribe = createSubscriber((update) => {
    function handleChange() {
      online = navigator.onLine;
      update(); // Tell Svelte something changed
    }

    window.addEventListener('online', handleChange);
    window.addEventListener('offline', handleChange);

    return () => {
      window.removeEventListener('online', handleChange);
      window.removeEventListener('offline', handleChange);
    };
  });

  return {
    get current() {
      subscribe(); // Register as a dependency
      return online;
    }
  };
}
\`\`\`

The flow is:

1. A component reads \`status.current\`, which calls \`subscribe()\`.
2. Svelte registers the component as a subscriber and calls the setup function.
3. The setup function adds event listeners and returns a cleanup function.
4. When an event fires, the handler updates the internal state and calls \`update()\`.
5. Svelte re-renders components that called \`subscribe()\`.
6. When no component reads the value anymore, Svelte calls the cleanup function.

This is lazy subscription. The event listeners are only added when something actually reads the value, and they are automatically removed when nothing reads it. No manual \`onMount\`/\`onDestroy\` needed.

### The get current() Pattern

The pattern of exposing a \`get current()\` getter that calls \`subscribe()\` internally is the idiomatic way to create reactive utility objects in Svelte 5. The getter serves double duty: it registers the reactive dependency (via \`subscribe()\`) and returns the current value. This is exactly how \`MediaQuery\` works internally.

### Building a Reactive IntersectionObserver

Here is a more complex example -- a reactive element visibility tracker:

\`\`\`typescript
import { createSubscriber } from 'svelte/reactivity';

export function createVisibilityTracker(element: HTMLElement, threshold = 0.5) {
  let isVisible = false;
  let intersectionRatio = 0;

  const subscribe = createSubscriber((update) => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        intersectionRatio = entry.intersectionRatio;
        update();
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  });

  return {
    get visible() {
      subscribe();
      return isVisible;
    },
    get ratio() {
      subscribe();
      return intersectionRatio;
    }
  };
}
\`\`\`

Usage in a component:

\`\`\`svelte
<script lang="ts">
  import { createVisibilityTracker } from './visibility.svelte';

  let sectionEl: HTMLElement;

  const tracker = $derived(
    sectionEl ? createVisibilityTracker(sectionEl) : null
  );
</script>

<section bind:this={sectionEl}>
  {#if tracker}
    <p>Visible: {tracker.visible} ({(tracker.ratio * 100).toFixed(0)}%)</p>
  {/if}
</section>
\`\`\`

### Building a Reactive WebSocket

Another practical example -- a WebSocket connection where the last received message is reactive:

\`\`\`typescript
import { createSubscriber } from 'svelte/reactivity';

export function createReactiveSocket(url: string) {
  let lastMessage: string | null = null;
  let status: 'connecting' | 'open' | 'closed' | 'error' = 'connecting';

  const subscribe = createSubscriber((update) => {
    const ws = new WebSocket(url);

    ws.addEventListener('open', () => {
      status = 'open';
      update();
    });

    ws.addEventListener('message', (event) => {
      lastMessage = event.data;
      update();
    });

    ws.addEventListener('close', () => {
      status = 'closed';
      update();
    });

    ws.addEventListener('error', () => {
      status = 'error';
      update();
    });

    return () => ws.close();
  });

  return {
    get message() {
      subscribe();
      return lastMessage;
    },
    get status() {
      subscribe();
      return status;
    }
  };
}
\`\`\`

The WebSocket connection opens when a component first reads \`socket.message\` or \`socket.status\`, and it closes automatically when no component uses it. This is resource-efficient -- the connection exists only as long as it is needed.

**Task:** Add a "prefers reduced motion" MediaQuery to your dashboard. When reduced motion is preferred, disable any CSS transitions or animations. Also create a simple online/offline status indicator using \`createSubscriber\` that shows a green or red dot.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `A developer writes the following:

\`\`\`typescript
import { createSubscriber } from 'svelte/reactivity';

let count = 0;
const subscribe = createSubscriber((update) => {
  setInterval(() => { count++; update(); }, 1000);
});
\`\`\`

There is a resource leak. Explain what happens when the last component reading this value unmounts, and why the interval keeps running. How should the setup function be corrected?`
		},
		{
			type: 'text',
			content: `## Composing MediaQuery with createSubscriber

The real power of these utilities emerges when you compose them. Consider a dashboard that adapts not just to screen size, but also to user preferences and system state:

\`\`\`svelte
<script lang="ts">
  import { MediaQuery } from 'svelte/reactivity';
  import { createSubscriber } from 'svelte/reactivity';

  // Layout breakpoints
  const isWide = new MediaQuery('min-width: 1024px');
  const isMedium = new MediaQuery('min-width: 768px');

  // User preferences
  const prefersDark = new MediaQuery('prefers-color-scheme: dark');
  const prefersReducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

  // Composite derived state
  const layout = $derived(
    isWide.current ? 'three-column' :
    isMedium.current ? 'two-column' : 'single-column'
  );

  const animationDuration = $derived(
    prefersReducedMotion.current ? '0ms' : '300ms'
  );
</script>

<div
  class="dashboard {layout}"
  class:dark={prefersDark.current}
  style:--animation-duration={animationDuration}
>
  <!-- Dashboard content -->
</div>
\`\`\`

This component reacts to four different media queries simultaneously. Each one is a single-line declaration. The derived values compose them into the exact configuration the component needs. No event listeners, no cleanup, no \`onMount\`.

### When to Use MediaQuery vs CSS Media Queries

| Scenario | Use CSS Media Query | Use MediaQuery Class |
|---|---|---|
| Changing colors, spacing, font sizes | Yes | No |
| Showing/hiding elements | Yes (\`display: none\`) | Depends |
| Rendering different component trees | No | Yes |
| Changing component props (columns, page size) | No | Yes |
| Conditional data fetching based on screen | No | Yes |
| Animation parameter adjustment | Can do partially | Yes |
| Logic branching (different algorithms) | No | Yes |

The rule of thumb: if you need to change what is rendered (structure), use \`MediaQuery\`. If you need to change how it looks (style), use CSS. If you need both, use CSS for styling and \`MediaQuery\` for structural decisions.

### Error Handling in createSubscriber

When building custom reactive primitives with \`createSubscriber\`, consider what happens when the external system fails. The setup function can store error state alongside the value:

\`\`\`typescript
function createGeoLocation() {
  let position: GeolocationPosition | null = null;
  let error: GeolocationPositionError | null = null;

  const subscribe = createSubscriber((update) => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => { position = pos; error = null; update(); },
      (err) => { error = err; update(); }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  });

  return {
    get current() { subscribe(); return position; },
    get error() { subscribe(); return error; }
  };
}
\`\`\`

Consumers check both \`.current\` and \`.error\`, and both are reactive.

## Summary

\`MediaQuery\` provides reactive access to CSS media query results. It replaces the \`window.matchMedia\` boilerplate with a one-liner that handles SSR, event listeners, and cleanup automatically. The \`.current\` property is reactive and can be read in templates or used in \`$derived\` expressions.

\`createSubscriber\` is the lower-level primitive for bridging any external event source with Svelte reactivity. It enables lazy subscription (only active when read), automatic cleanup (when no reader exists), and the idiomatic \`get current()\` pattern. Use it to make IntersectionObserver, WebSocket, geolocation, or any other event-based API reactive.

Together, these tools eliminate the need for manual \`onMount\`/\`onDestroy\` event listener management in the vast majority of cases. Your components declare what reactive values they need, and the framework handles the subscription lifecycle.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.reactivity.create-subscriber'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import MediaQuery from 'svelte/reactivity'
  // TODO: Import createSubscriber from 'svelte/reactivity'
  // TODO: Create breakpoint MediaQuery instances
  // TODO: Create a prefersReducedMotion MediaQuery
  // TODO: Derive column count from breakpoints
  // TODO: Create an online status indicator using createSubscriber

  const cards = [
    { title: 'Revenue', value: '$12,340', change: '+12%' },
    { title: 'Users', value: '1,245', change: '+5%' },
    { title: 'Orders', value: '342', change: '-2%' },
    { title: 'Conversion', value: '3.2%', change: '+0.5%' },
    { title: 'Bounce Rate', value: '42%', change: '-3%' },
    { title: 'Avg Session', value: '4m 32s', change: '+18s' },
  ];
</script>

<div class="dashboard">
  <header>
    <h1>Dashboard</h1>
    <!-- TODO: Show online/offline status dot -->
    <!-- TODO: Show current layout mode -->
  </header>

  <div class="grid">
    <!-- TODO: Render cards in a responsive grid -->
    <!-- The grid column count should be derived from MediaQuery -->
    {#each cards as card}
      <div class="card">
        <h3>{card.title}</h3>
        <p class="value">{card.value}</p>
        <p class="change">{card.change}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  .dashboard {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  header h1 {
    margin: 0;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .status-dot.online { background: #22c55e; }
  .status-dot.offline { background: #ef4444; }

  .layout-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: #f1f5f9;
    border-radius: 4px;
    color: #64748b;
    margin-left: auto;
  }

  .grid {
    display: grid;
    gap: 1rem;
    transition: grid-template-columns 0.3s ease;
  }

  .card {
    padding: 1.25rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .card h3 {
    margin: 0 0 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .change {
    font-size: 0.875rem;
    margin: 0.25rem 0 0;
    color: #64748b;
  }

  .no-motion .card {
    transition: none;
  }

  .no-motion .grid {
    transition: none;
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
  import { MediaQuery, createSubscriber } from 'svelte/reactivity';

  // Breakpoints
  const isWide = new MediaQuery('min-width: 1024px');
  const isMedium = new MediaQuery('min-width: 768px');
  const prefersReducedMotion = new MediaQuery('prefers-reduced-motion: reduce');

  // Derived layout
  const columns = $derived(isWide.current ? 3 : isMedium.current ? 2 : 1);
  const layoutLabel = $derived(
    isWide.current ? 'Desktop (3-col)' : isMedium.current ? 'Tablet (2-col)' : 'Mobile (1-col)'
  );

  // Online status using createSubscriber
  function createOnlineStatus() {
    let online = typeof navigator !== 'undefined' ? navigator.onLine : true;

    const subscribe = createSubscriber((update) => {
      function handler() {
        online = navigator.onLine;
        update();
      }
      window.addEventListener('online', handler);
      window.addEventListener('offline', handler);
      return () => {
        window.removeEventListener('online', handler);
        window.removeEventListener('offline', handler);
      };
    });

    return {
      get current() {
        subscribe();
        return online;
      }
    };
  }

  const onlineStatus = createOnlineStatus();

  const cards = [
    { title: 'Revenue', value: '$12,340', change: '+12%' },
    { title: 'Users', value: '1,245', change: '+5%' },
    { title: 'Orders', value: '342', change: '-2%' },
    { title: 'Conversion', value: '3.2%', change: '+0.5%' },
    { title: 'Bounce Rate', value: '42%', change: '-3%' },
    { title: 'Avg Session', value: '4m 32s', change: '+18s' },
  ];
</script>

<div class="dashboard" class:no-motion={prefersReducedMotion.current}>
  <header>
    <h1>Dashboard</h1>
    <span
      class="status-dot"
      class:online={onlineStatus.current}
      class:offline={!onlineStatus.current}
      title={onlineStatus.current ? 'Online' : 'Offline'}
    ></span>
    <span class="layout-badge">{layoutLabel}</span>
  </header>

  <div class="grid" style:grid-template-columns="repeat({columns}, 1fr)">
    {#each cards as card}
      <div class="card">
        <h3>{card.title}</h3>
        <p class="value">{card.value}</p>
        <p class="change">{card.change}</p>
      </div>
    {/each}
  </div>
</div>

<style>
  .dashboard {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  header h1 {
    margin: 0;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .status-dot.online { background: #22c55e; }
  .status-dot.offline { background: #ef4444; }

  .layout-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: #f1f5f9;
    border-radius: 4px;
    color: #64748b;
    margin-left: auto;
  }

  .grid {
    display: grid;
    gap: 1rem;
    transition: grid-template-columns 0.3s ease;
  }

  .card {
    padding: 1.25rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .card h3 {
    margin: 0 0 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .change {
    font-size: 0.875rem;
    margin: 0.25rem 0 0;
    color: #64748b;
  }

  .no-motion .card {
    transition: none;
  }

  .no-motion .grid {
    transition: none;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a responsive dashboard with MediaQuery-derived column count',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'MediaQuery' },
						{ type: 'contains', value: 'svelte/reactivity' },
						{ type: 'contains', value: '.current' }
					]
				}
			},
			hints: [
				'Import `MediaQuery` from `svelte/reactivity`. Create instances like `const isWide = new MediaQuery(\'min-width: 1024px\')`. Read the result with `.current`.',
				'Derive the column count: `const columns = $derived(isWide.current ? 3 : isMedium.current ? 2 : 1)`. Use it in the grid style: `style:grid-template-columns="repeat({columns}, 1fr)"`.',
				'Add `const prefersReducedMotion = new MediaQuery(\'prefers-reduced-motion: reduce\')` and use `class:no-motion={prefersReducedMotion.current}` on the dashboard container.'
			],
			conceptsTested: ['svelte5.reactivity.media-query']
		},
		{
			id: 'cp-2',
			description: 'Create an online/offline status indicator using createSubscriber',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'createSubscriber' },
						{ type: 'contains', value: 'online' },
						{ type: 'contains', value: 'subscribe' }
					]
				}
			},
			hints: [
				'Import `createSubscriber` from `svelte/reactivity`. Create a function that tracks `navigator.onLine` and listens for `online`/`offline` window events.',
				'Inside the `createSubscriber` callback, add event listeners for `online` and `offline`. Call `update()` in each handler. Return a cleanup function that removes the listeners.',
				'Return an object with `get current() { subscribe(); return online; }`. Use it in the template: `class:online={onlineStatus.current}` on a status dot element.'
			],
			conceptsTested: ['svelte5.reactivity.create-subscriber']
		}
	]
};
