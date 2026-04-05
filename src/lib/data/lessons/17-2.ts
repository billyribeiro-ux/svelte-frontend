import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-2',
		title: '$app/navigation & Lifecycle',
		phase: 5,
		module: 17,
		lessonIndex: 2
	},
	description: `The $app/navigation module exposes the imperative navigation API of SvelteKit. While <a href> handles most cases, sometimes you need to navigate programmatically (goto), force data reloads (invalidate, invalidateAll, refreshAll), preload routes on hover (preloadCode, preloadData), or manipulate history without routing (pushState, replaceState for shallow routing).

On top of that, $app/navigation exposes the navigation lifecycle: beforeNavigate (cancel or warn before leaving), afterNavigate (run code after a navigation completes), and onNavigate (run an async task DURING navigation, with the new page blocked on your promise — perfect for view transitions).

This lesson stitches these APIs together into a single interactive playground: a fake router, navigation guards, preloading, and lifecycle observers. In a real SvelteKit app these functions live anywhere in components — they don't need to be inside load() or hooks.`,
	objectives: [
		'Navigate programmatically with goto() including options like replaceState and invalidateAll',
		'Invalidate dependencies with invalidate() and invalidateAll()',
		'Preload routes on hover using preloadCode and preloadData',
		'Guard navigations with beforeNavigate — cancel or warn on unsaved changes',
		'React to navigations with afterNavigate and onNavigate',
		'Manipulate history with pushState/replaceState without full navigation'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Simulated SvelteKit navigation API for an isolated demo.
  // In a real app you'd import from '$app/navigation':
  //
  //   import {
  //     goto, invalidate, invalidateAll, refreshAll,
  //     preloadCode, preloadData, pushState, replaceState,
  //     beforeNavigate, afterNavigate, onNavigate
  //   } from '$app/navigation';
  //
  // and call them directly. This mock simulates the flow so
  // we can visualise guard/before/after hooks interactively.
  // ============================================================

  type Route = '/' | '/dashboard' | '/posts' | '/posts/123' | '/settings';

  type NavLog =
    | { t: number; kind: 'before'; from: Route; to: Route; cancelled?: boolean }
    | { t: number; kind: 'onNavigate'; from: Route; to: Route }
    | { t: number; kind: 'after'; from: Route; to: Route }
    | { t: number; kind: 'invalidate'; key: string }
    | { t: number; kind: 'preload'; target: Route; data: boolean };

  let currentRoute: Route = $state('/');
  let hasUnsavedChanges: boolean = $state(false);
  let navLog: NavLog[] = $state([]);
  let preloaded: Set<Route> = $state(new Set());
  let loadCount: Record<Route, number> = $state({
    '/': 1,
    '/dashboard': 0,
    '/posts': 0,
    '/posts/123': 0,
    '/settings': 0
  });
  let invalidationKey: number = $state(0);

  function log(entry: Omit<NavLog, 't'>): void {
    navLog = [{ t: Date.now(), ...entry } as NavLog, ...navLog].slice(0, 12);
  }

  async function goto(
    to: Route,
    opts: { replaceState?: boolean; invalidateAll?: boolean } = {}
  ): Promise<void> {
    const from = currentRoute;
    if (from === to && !opts.invalidateAll) return;

    // beforeNavigate guard
    if (hasUnsavedChanges && !confirm('Discard unsaved changes?')) {
      log({ kind: 'before', from, to, cancelled: true });
      return;
    }
    log({ kind: 'before', from, to });

    // onNavigate (async — blocks the navigation on its promise)
    log({ kind: 'onNavigate', from, to });
    await new Promise((r) => setTimeout(r, 150));

    currentRoute = to;
    loadCount[to] = (loadCount[to] ?? 0) + 1;

    // afterNavigate
    log({ kind: 'after', from, to });
  }

  function invalidate(key: string): void {
    log({ kind: 'invalidate', key });
    invalidationKey += 1;
    // Re-run the load fn for the current route
    loadCount[currentRoute] = (loadCount[currentRoute] ?? 0) + 1;
  }

  function invalidateAll(): void {
    log({ kind: 'invalidate', key: 'ALL' });
    invalidationKey += 1;
    loadCount[currentRoute] = (loadCount[currentRoute] ?? 0) + 1;
  }

  async function preloadCode(target: Route): Promise<void> {
    preloaded.add(target);
    preloaded = new Set(preloaded);
    log({ kind: 'preload', target, data: false });
  }

  async function preloadData(target: Route): Promise<void> {
    preloaded.add(target);
    preloaded = new Set(preloaded);
    log({ kind: 'preload', target, data: true });
  }

  const routes: { path: Route; label: string }[] = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/posts', label: 'Posts' },
    { path: '/posts/123', label: 'Post #123' },
    { path: '/settings', label: 'Settings' }
  ];

  let showExample: 'goto' | 'invalidate' | 'preload' | 'guard' | 'shallow' = $state('goto');

  const examples: Record<string, string> = {
    goto: \`import { goto } from '$app/navigation';

// Basic navigation
await goto('/dashboard');

// Replace current history entry (no back-button entry)
await goto('/login', { replaceState: true });

// Re-run all load functions after navigating
await goto('/posts', { invalidateAll: true });

// Keep focus/scroll state
await goto('/settings', {
  keepFocus: true,
  noScroll: true,
  state: { from: 'menu' }
});\`,

    invalidate: \`import { invalidate, invalidateAll, refreshAll } from '$app/navigation';

// In +page.server.ts — mark the load fn with a key
export const load = async ({ fetch, depends }) => {
  depends('app:posts');
  return { posts: await (await fetch('/api/posts')).json() };
};

// In a component — re-run any load that depends on this key
await invalidate('app:posts');

// Or re-run every load function on the current page
await invalidateAll();

// Available in SvelteKit 2.x: re-run load fns in ALL open tabs
// (via BroadcastChannel). Great for cross-tab sync after mutations.
await refreshAll();\`,

    preload: \`import { preloadCode, preloadData } from '$app/navigation';

// Kick off the JS chunk fetch for a route — cheap, idempotent
preloadCode('/dashboard');

// Also run its load function and cache the result
await preloadData('/posts/123');

// Preload on hover for instant navigation
<a
  href="/posts/123"
  onmouseenter={() => preloadData('/posts/123')}
>
  View post
</a>

// SvelteKit does this automatically for links in the viewport
// when you set data-sveltekit-preload-data on a parent element.
<div data-sveltekit-preload-data="hover">...</div>\`,

    guard: \`import { beforeNavigate, afterNavigate, onNavigate } from '$app/navigation';

// Warn on unsaved changes
let dirty = $state(false);
beforeNavigate(({ cancel, to, type }) => {
  if (dirty && type !== 'leave') {
    if (!confirm('Discard unsaved changes?')) cancel();
  }
});

// Run code after every navigation (including first mount)
afterNavigate(({ from, to, type }) => {
  analytics.page(to?.url.pathname ?? '/');
  scrollTo(0, 0);
});

// Async — blocks rendering of the new page on your promise.
// Perfect for View Transitions API.
onNavigate((navigation) => {
  if (!document.startViewTransition) return;
  return new Promise((resolve) => {
    document.startViewTransition(async () => {
      resolve();
      await navigation.complete;
    });
  });
});\`,

    shallow: \`import { pushState, replaceState } from '$app/navigation';
import { page } from '$app/state';

// Add a history entry WITHOUT running load functions or
// changing the active route. Used for shallow routing:
// modal dialogs, tab selections, expandable details.
function openPhoto(id: string) {
  pushState(\\\`?photo=\\\${id}\\\`, { photoId: id });
}

// Read the custom state
if (page.state.photoId) {
  // Render the modal
}

// Replace without adding a history entry
replaceState('', { filter: 'active' });

// Combined with pushState for bookmarkable modals:
// refresh the page with ?photo=42 in the URL and
// SvelteKit will render the full photo page instead.\`
  };
</script>

<h1>$app/navigation &amp; Lifecycle</h1>

<section class="router">
  <h2>Interactive router playground</h2>
  <p class="note">
    Simulated SvelteKit navigation. Watch the log on the right — every
    beforeNavigate, onNavigate, and afterNavigate fires in order.
  </p>

  <div class="router-grid">
    <div class="router-main">
      <div class="url-bar">
        <span class="proto">https://app</span><strong>{currentRoute}</strong>
      </div>
      <nav class="router-nav">
        {#each routes as r (r.path)}
          <button
            class:active={currentRoute === r.path}
            class:preloaded={preloaded.has(r.path)}
            onpointerenter={() => preloadCode(r.path)}
            onfocus={() => preloadData(r.path)}
            onclick={() => goto(r.path)}
          >
            {r.label}
            {#if preloaded.has(r.path)}<span class="pre">&bull;</span>{/if}
          </button>
        {/each}
      </nav>

      <div class="page">
        <h3>Route: {currentRoute}</h3>
        <p>
          load() has been called
          <strong>{loadCount[currentRoute]}</strong> time(s).
        </p>
        <label class="dirty-toggle">
          <input type="checkbox" bind:checked={hasUnsavedChanges} />
          Mark page as dirty (triggers beforeNavigate guard)
        </label>
        <div class="page-actions">
          <button onclick={() => invalidate('app:page-data')}>
            invalidate('app:page-data')
          </button>
          <button onclick={invalidateAll}>invalidateAll()</button>
          <button onclick={() => goto('/dashboard', { replaceState: true })}>
            goto('/dashboard', replaceState)
          </button>
        </div>
      </div>
    </div>

    <div class="router-log">
      <h3>Navigation log</h3>
      {#if navLog.length === 0}
        <p class="empty">No events yet — click a link.</p>
      {:else}
        <ul>
          {#each navLog as entry, i (i)}
            <li class="log-entry {entry.kind}">
              {#if entry.kind === 'before'}
                before: {entry.from} -> {entry.to}
                {#if entry.cancelled}<strong class="cancel">(cancelled)</strong>{/if}
              {:else if entry.kind === 'onNavigate'}
                onNavigate: {entry.from} -> {entry.to}
              {:else if entry.kind === 'after'}
                after: {entry.from} -> {entry.to}
              {:else if entry.kind === 'invalidate'}
                invalidate: {entry.key}
              {:else if entry.kind === 'preload'}
                preload{entry.data ? 'Data' : 'Code'}: {entry.target}
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</section>

<section>
  <h2>API reference</h2>
  <div class="tabs">
    {#each ['goto', 'invalidate', 'preload', 'guard', 'shallow'] as tab (tab)}
      <button
        class:active={showExample === tab}
        onclick={() => (showExample = tab as typeof showExample)}
      >
        {tab}
      </button>
    {/each}
  </div>
  <pre class="code"><code>{examples[showExample]}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section {
    margin-bottom: 1.5rem; padding: 1rem;
    background: #f8f9fa; border-radius: 8px;
  }
  h2 { margin-top: 0; color: #e17055; font-size: 1.05rem; }
  h3 {
    margin: 0 0 0.5rem; color: #2d3436; font-size: 0.85rem;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .note { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem; }
  .router-grid {
    display: grid; grid-template-columns: 1fr 300px; gap: 1rem;
  }
  .router-main {
    background: white; border-radius: 6px; padding: 0.75rem;
    border: 1px solid #dfe6e9;
  }
  .url-bar {
    padding: 0.5rem 0.75rem; background: #2d3436;
    border-radius: 4px; font-family: monospace; font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }
  .proto { color: #636e72; }
  .url-bar strong { color: #74b9ff; }
  .router-nav {
    display: flex; gap: 0.25rem; flex-wrap: wrap;
    padding-bottom: 0.5rem; margin-bottom: 0.75rem;
    border-bottom: 1px solid #eee;
  }
  .router-nav button {
    padding: 0.4rem 0.75rem; background: #dfe6e9; color: #2d3436;
    border: none; border-radius: 4px; cursor: pointer;
    font-weight: 600; font-size: 0.85rem; position: relative;
  }
  .router-nav button.active { background: #e17055; color: white; }
  .router-nav button.preloaded:not(.active) { background: #81ecec; }
  .pre {
    color: #00b894; font-size: 0.8rem; margin-left: 0.2rem;
  }
  .page p { font-size: 0.85rem; color: #636e72; }
  .dirty-toggle {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.85rem; margin: 0.5rem 0;
  }
  .page-actions {
    display: flex; flex-wrap: wrap; gap: 0.25rem;
  }
  .page-actions button {
    padding: 0.3rem 0.6rem; background: #0984e3; color: white;
    border: none; border-radius: 4px; cursor: pointer;
    font-size: 0.75rem; font-weight: 600; font-family: monospace;
  }
  .router-log {
    background: white; border-radius: 6px; padding: 0.75rem;
    border: 1px solid #dfe6e9; max-height: 400px; overflow-y: auto;
  }
  .router-log ul { list-style: none; padding: 0; margin: 0; }
  .log-entry {
    padding: 0.3rem 0.5rem; margin-bottom: 0.25rem;
    border-radius: 3px; font-family: monospace;
    font-size: 0.75rem; background: #f8f9fa;
    border-left: 3px solid #b2bec3;
  }
  .log-entry.before { border-left-color: #fdcb6e; }
  .log-entry.onNavigate { border-left-color: #74b9ff; }
  .log-entry.after { border-left-color: #00b894; }
  .log-entry.invalidate { border-left-color: #6c5ce7; }
  .log-entry.preload { border-left-color: #81ecec; }
  .cancel { color: #d63031; margin-left: 0.3rem; }
  .empty { color: #b2bec3; font-size: 0.8rem; }
  .tabs { display: flex; gap: 2px; margin-bottom: 0; }
  .tabs button {
    padding: 0.4rem 0.8rem; border: none;
    border-radius: 4px 4px 0 0; background: #dfe6e9; color: #636e72;
    cursor: pointer; font-weight: 600; font-size: 0.8rem;
  }
  .tabs button.active { background: #2d3436; color: #dfe6e9; }
  .code {
    padding: 1rem; background: #2d3436;
    border-radius: 0 6px 6px 6px; overflow-x: auto; margin: 0;
  }
  .code code {
    color: #dfe6e9; font-size: 0.8rem; line-height: 1.5;
    font-family: monospace;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
