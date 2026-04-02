import type { Lesson } from '$types/lesson';

export const componentLifecycle: Lesson = {
	id: 'svelte-core.components-and-props.component-lifecycle',
	slug: 'component-lifecycle',
	title: 'Component Lifecycle',
	description:
		'Understand mount, unmount, and how $effect replaces onMount/onDestroy for lifecycle management.',
	trackId: 'svelte-core',
	moduleId: 'components-and-props',
	order: 4,
	estimatedMinutes: 25,
	concepts: ['svelte5.lifecycle.mount', 'svelte5.lifecycle.cleanup', 'svelte5.lifecycle.effect'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.effect'],

	content: [
		{
			type: 'text',
			content: `# Component Lifecycle

Every Svelte component has a lifecycle: it is created, it renders to the DOM, it may update many times, and eventually it is destroyed. Svelte 5 fundamentally changes how you interact with this lifecycle, replacing the old \`onMount\`/\`onDestroy\` pair with the unified \`$effect\` rune for most use cases. Understanding *why* this change happened and how effects actually execute will save you from subtle bugs.

## Why $effect Replaces onMount/onDestroy

Svelte 4 gave you separate lifecycle functions: \`onMount\` for setup, \`onDestroy\` for teardown, \`beforeUpdate\` and \`afterUpdate\` for render cycles. This seemed clean in theory, but in practice it created problems:

**Problem 1: Setup and cleanup were separated.** If you started a timer in \`onMount\`, you cleaned it up in \`onDestroy\`. These two pieces of related logic lived in different places. In a component with several side effects, matching each setup to its cleanup became error-prone.

\`\`\`svelte
<!-- Svelte 4: setup and cleanup are separated -->
<script>
  import { onMount, onDestroy } from 'svelte';

  let timer;
  let resizeHandler;

  onMount(() => {
    timer = setInterval(tick, 1000);
    resizeHandler = () => handleResize();
    window.addEventListener('resize', resizeHandler);
  });

  onDestroy(() => {
    clearInterval(timer);  // Which timer? Hope you got the variable right
    window.removeEventListener('resize', resizeHandler);
  });
</script>
\`\`\`

**Problem 2: No dependency tracking.** \`onMount\` ran once. If you needed to re-run setup when a prop changed (e.g., reconnect a WebSocket when the URL prop changes), you had to use a reactive statement (\`$:\`) *and* manual cleanup — a messy combination.

**Problem 3: \`beforeUpdate\` and \`afterUpdate\` were footguns.** They fired on *every* state change, not just the ones you cared about. Performance problems and infinite loops were common.

**The $effect solution:**

\`\`\`svelte
<!-- Svelte 5: setup and cleanup are co-located -->
<script lang="ts">
  $effect(() => {
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  });

  $effect(() => {
    const handler = () => handleResize();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  });
</script>
\`\`\`

Each effect is self-contained: setup and cleanup live together. If you delete an effect, both its setup and cleanup are removed — you cannot accidentally leave an orphaned cleanup function.

## The Effect Lifecycle Diagram

Understanding the exact sequence of when effects run is critical for avoiding bugs. Here is the complete lifecycle:

\`\`\`
Component created
    │
    ▼
First render to DOM
    │
    ▼
$effect runs (initial execution)  ◄── reads reactive dependencies
    │
    ▼
... component lives, state changes ...
    │
    ▼
Dependency changes detected
    │
    ▼
$effect cleanup runs (return function from previous execution)
    │
    ▼
$effect re-runs (new execution)  ◄── may read new dependencies
    │
    ▼
... more state changes ...
    │
    ▼
Component destroyed
    │
    ▼
$effect cleanup runs (final cleanup)
\`\`\`

**Key points:**
1. Effects run **after** the DOM has been updated. You can safely read DOM measurements inside an effect.
2. The cleanup function runs **before** each re-execution and **once** on component destruction.
3. Dependencies are tracked automatically — whatever reactive values you read during execution become dependencies.
4. Effects do **not** run during SSR (server-side rendering). More on this below.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.lifecycle.effect'
		},
		{
			type: 'text',
			content: `## $effect for Lifecycle Management

The basic pattern is simple: do your setup, return a cleanup function.

\`\`\`svelte
<script lang="ts">
  let count = $state(0);

  $effect(() => {
    // This runs after mount and whenever 'count' changes
    console.log('Count is now:', count);

    const timer = setInterval(() => {
      count += 1;
    }, 1000);

    return () => {
      // This runs before re-execution and on unmount
      clearInterval(timer);
      console.log('Timer cleaned up');
    };
  });
</script>
\`\`\`

The cleanup function is optional. If your effect has no resources to clean up (e.g., it just logs something), you can omit the return.

**Your task:** Create a Timer component that starts an interval on mount and cleans it up on unmount using \`$effect\`. The timer should increment an \`elapsed\` counter every second.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## $effect.pre: Before the DOM Updates

Sometimes you need to run code *before* Svelte updates the DOM. This is the role of \`$effect.pre\`. It replaces Svelte 4's \`beforeUpdate\`.

The most common use case is preserving scroll position. When new items are added to a list, the browser reflows the content and the scroll position jumps. By capturing the scroll position before the DOM update and restoring it after, you can maintain the user's position.

\`\`\`svelte
<script lang="ts">
  let items = $state<string[]>([]);
  let container: HTMLDivElement;

  $effect.pre(() => {
    // This runs BEFORE the DOM is updated
    // Access items.length to track the dependency
    if (items.length && container) {
      const isScrolledToBottom =
        container.scrollHeight - container.scrollTop === container.clientHeight;
      if (isScrolledToBottom) {
        // Schedule a scroll-to-bottom after the DOM updates
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
    }
  });
</script>
\`\`\`

**When to use \`$effect.pre\` vs \`$effect\`:**
- Use \`$effect\` (the default) for almost everything. It runs after the DOM is updated, which is what you want for reading measurements, setting up event listeners, or interacting with third-party libraries.
- Use \`$effect.pre\` only when you need to capture DOM state *before* Svelte modifies it — scroll positions, selection ranges, element dimensions that will change.

## Cleanup Patterns: Timers, Listeners, Subscriptions

Here are the three most common cleanup patterns you will use:

**Timers (setInterval / setTimeout):**
\`\`\`svelte
<script lang="ts">
  $effect(() => {
    const id = setInterval(() => { /* ... */ }, 1000);
    return () => clearInterval(id);
  });
</script>
\`\`\`

**Event listeners:**
\`\`\`svelte
<script lang="ts">
  $effect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  });
</script>
\`\`\`

Note: you must pass the *same function reference* to \`removeEventListener\`. Using an inline arrow in \`addEventListener\` and a different one in \`removeEventListener\` is a common bug — the listener is never actually removed.

**Subscriptions (WebSocket, EventSource, RxJS, etc.):**
\`\`\`svelte
<script lang="ts">
  let { url } = $props<{ url: string }>();

  $effect(() => {
    const ws = new WebSocket(url);
    ws.onmessage = (e) => handleMessage(e.data);
    ws.onerror = (e) => handleError(e);

    return () => {
      ws.close();
    };
  });
</script>
\`\`\`

Because \`$effect\` tracks dependencies automatically, if \`url\` changes, the old WebSocket is closed (cleanup runs) and a new one is opened (effect re-runs). This is the power of co-located setup and cleanup — the reconnection logic is automatic.

## SSR Behavior: Effects Do Not Run on the Server

This is a critical fact for SvelteKit applications: **\`$effect\` does not run during server-side rendering.** The server renders HTML but does not execute effects. Effects only run in the browser after hydration.

This means:
- You can safely use browser-only APIs inside \`$effect\` (\`window\`, \`document\`, \`localStorage\`, \`IntersectionObserver\`).
- You cannot rely on an effect to set initial state that the server-rendered HTML needs. Use \`$state\` with an initial value instead.
- \`onMount\` also does not run on the server, so the behavior is consistent.

\`\`\`svelte
<script lang="ts">
  // SAFE: $effect never runs on the server
  $effect(() => {
    const saved = localStorage.getItem('preference');
    if (saved) applyPreference(saved);
  });

  // WRONG: This would fail on the server if it ran
  // let width = window.innerWidth; // ReferenceError on server
</script>
\`\`\`

If you need data for SSR, load it in a SvelteKit \`load\` function and pass it as a prop. Use \`$effect\` only for browser-side enhancements.

## Toggling Components and Lifecycle

When a component is conditionally rendered with \`{#if}\`, its full lifecycle runs each time it enters the DOM. Mount, effects, cleanup — everything starts fresh. This is the correct place to verify that your cleanup works.

**Task:** Add a toggle button in App.svelte that shows/hides the Timer. Click it several times and verify in the console that the interval stops when the component is removed and starts again when it reappears.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Exercise: Auto-Resize Textarea with Cleanup

Build a textarea component that automatically resizes its height to fit its content, using \`$effect\` for the resize logic and proper cleanup for a \`ResizeObserver\`.

**Requirements:**
1. Create an \`AutoTextarea\` component that accepts a \`value\` prop (bindable string).
2. Use a \`ResizeObserver\` to watch the textarea's parent container. If the container width changes, the textarea height may need recalculation.
3. Inside an \`$effect\`, set the textarea's \`style.height\` to \`'auto'\` and then to \`\${textarea.scrollHeight}px\` whenever the value changes. This forces the textarea to grow and shrink with its content.
4. Return a cleanup function that disconnects the \`ResizeObserver\`.
5. In App.svelte, render the AutoTextarea with a toggle button. Verify that hiding and showing the component properly connects and disconnects the observer.

\`\`\`svelte
<!-- AutoTextarea.svelte skeleton -->
<script lang="ts">
  let { value = $bindable('') } = $props<{ value: string }>();
  let textarea: HTMLTextAreaElement;

  $effect(() => {
    if (!textarea) return;

    // Auto-resize: reset height, then set to scrollHeight
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  });

  $effect(() => {
    if (!textarea) return;

    const observer = new ResizeObserver(() => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });

    observer.observe(textarea.parentElement!);

    return () => observer.disconnect();
  });
</script>

<textarea bind:this={textarea} bind:value rows="1"></textarea>
\`\`\`

This exercise combines multiple lifecycle concepts: effects that track reactive state (\`value\`), effects that set up browser APIs (\`ResizeObserver\`), cleanup functions, and the interaction between conditional rendering and effect teardown. Notice how each effect is self-contained — the resize observer setup and cleanup live in one block, separate from the auto-height logic.

## onMount Still Has Its Place

While \`$effect\` handles most lifecycle needs, \`onMount\` remains useful for one specific case: **async initialization**.

\`\`\`svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let data = $state<string[]>([]);

  onMount(async () => {
    const res = await fetch('/api/items');
    data = await res.json();
  });
</script>
\`\`\`

\`$effect\` cannot be \`async\` — its return value must be a cleanup function (or nothing), not a Promise. For one-time async work that runs only on mount, \`onMount\` is the cleaner tool. You can also use \`$effect\` with an async IIFE inside, but \`onMount\` reads better for this pattern.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Timer from './Timer.svelte';

  let showTimer = $state(true);
</script>

<div>
  <!-- TODO: Add a toggle button for showTimer -->
  <!-- TODO: Conditionally render Timer -->
  <Timer />
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'Timer.svelte',
			path: '/Timer.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let elapsed = $state(0);

  // TODO: Use $effect to start an interval and return cleanup
</script>

<p>Elapsed: {elapsed}s</p>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Timer from './Timer.svelte';

  let showTimer = $state(true);
</script>

<div>
  <button onclick={() => showTimer = !showTimer}>
    {showTimer ? 'Hide' : 'Show'} Timer
  </button>

  {#if showTimer}
    <Timer />
  {/if}
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    margin-bottom: 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
</style>`
		},
		{
			name: 'Timer.svelte',
			path: '/Timer.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let elapsed = $state(0);

  $effect(() => {
    const timer = setInterval(() => {
      elapsed += 1;
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  });
</script>

<p>Elapsed: {elapsed}s</p>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use $effect to start an interval with cleanup',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$effect' },
						{ type: 'contains', value: 'setInterval' },
						{ type: 'contains', value: 'clearInterval' }
					]
				}
			},
			hints: [
				'Use `$effect(() => { ... return () => { ... } })` for setup and cleanup.',
				'Start `setInterval` inside the effect and `clearInterval` in the return function.',
				'`$effect(() => { const timer = setInterval(() => { elapsed += 1; }, 1000); return () => clearInterval(timer); });`'
			],
			conceptsTested: ['svelte5.lifecycle.effect', 'svelte5.lifecycle.cleanup']
		},
		{
			id: 'cp-2',
			description: 'Toggle the Timer component with an {#if} block',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#if' },
						{ type: 'contains', value: 'showTimer' }
					]
				}
			},
			hints: [
				'Add a button that toggles `showTimer` between true and false.',
				'Wrap `<Timer />` in `{#if showTimer}...{/if}`.',
				'Add `<button onclick={() => showTimer = !showTimer}>Toggle</button>` and `{#if showTimer}<Timer />{/if}`'
			],
			conceptsTested: ['svelte5.lifecycle.mount']
		}
	]
};
