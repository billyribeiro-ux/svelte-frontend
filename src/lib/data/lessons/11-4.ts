import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-4',
		title: 'Navigation & $app/state',
		phase: 3,
		module: 11,
		lessonIndex: 4
	},
	description: `SvelteKit exposes the current page as a reactive object from $app/state: page.url, page.params, page.route, page.data, page.status, and page.error. A companion navigating object tells you whether a navigation is currently in flight, and updated tells you when a new version of the app is available.

From $app/navigation you get imperative tools — goto() for programmatic navigation, invalidate()/invalidateAll() to re-run load functions, and beforeNavigate/afterNavigate hooks to intercept and react to navigations. Together these form the complete client-side routing API.`,
	objectives: [
		'Access current URL, params, and route via page from $app/state',
		'Read navigating to show loading UI during in-flight navigation',
		'Use goto() with its options (replaceState, keepFocus, noScroll, invalidateAll)',
		'Trigger targeted re-loads with invalidate() and depends()',
		'Intercept navigation with beforeNavigate and afterNavigate',
		'Detect app updates with updated and prompt the user to reload'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // In SvelteKit you'd import:
  //   import { page, navigating, updated } from '$app/state';
  //   import { goto, invalidate, invalidateAll, beforeNavigate, afterNavigate } from '$app/navigation';

  interface NavItem {
    path: string;
    label: string;
  }

  const navItems: NavItem[] = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/blog', label: 'Blog' },
    { path: '/blog/latest', label: 'Latest Post' },
    { path: '/blog/hello-world', label: 'Hello World Post' },
    { path: '/settings?tab=profile', label: 'Settings' }
  ];

  // Simulated page state
  let currentPath: string = $state('/');
  let isNavigating: boolean = $state(false);
  let navigationLog: string[] = $state([]);

  function log(entry: string) {
    navigationLog = [\`[\${new Date().toLocaleTimeString()}] \${entry}\`, ...navigationLog].slice(0, 6);
  }

  // Simulated goto() with async delay
  async function goto(path: string, opts: { replaceState?: boolean } = {}) {
    log(\`beforeNavigate → \${path}\`);
    isNavigating = true;
    await new Promise((r) => setTimeout(r, 350));
    currentPath = path;
    isNavigating = false;
    log(\`afterNavigate \${opts.replaceState ? '(replace)' : '(push)'} \${path}\`);
  }

  function isActive(navPath: string): boolean {
    const base = navPath.split('?')[0];
    if (base === '/') return currentPath === '/';
    return currentPath.startsWith(base);
  }

  // Parse simulated URL into a page-shaped object
  let parsedPage = $derived.by(() => {
    const [pathname, search = ''] = currentPath.split('?');
    const searchParams = new URLSearchParams(search);
    let params: Record<string, string> = {};
    let routeId = pathname;
    if (pathname.startsWith('/blog/') && pathname !== '/blog') {
      params.slug = pathname.split('/').pop() ?? '';
      routeId = '/blog/[slug]';
    }
    return {
      url: { pathname, search, searchParams, href: currentPath },
      params,
      route: { id: routeId },
      status: 200
    };
  });

  // Simulated "new version available" banner
  let updateAvailable: boolean = $state(false);
</script>

<main>
  <h1>Navigation & $app/state</h1>

  <section>
    <h2>The page Object</h2>
    <p><code>page</code> from <code>$app/state</code> is a reactive object. Read any property in a component or <code>$derived</code> and your UI updates automatically when the user navigates.</p>
    <pre>{\`<script lang="ts">
  import { page } from '$app/state';

  // Fully reactive — no subscribe, no assignment
  let slug = $derived(page.params.slug);
  let query = $derived(page.url.searchParams.get('q'));
  let routeId = $derived(page.route.id);
  let title = $derived(page.data.title);
  let status = $derived(page.status);
</script>

<h1>{title}</h1>
<p>Route: {routeId}</p>
<p>URL: {page.url.href}</p>
<p>Search: ?q={query}</p>\`}</pre>
    <table>
      <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>page.url</code></td><td><code>URL</code></td><td>Current URL object</td></tr>
        <tr><td><code>page.params</code></td><td><code>Record&lt;string, string&gt;</code></td><td>Route parameters</td></tr>
        <tr><td><code>page.route.id</code></td><td><code>string | null</code></td><td>Route pattern e.g. "/blog/[slug]"</td></tr>
        <tr><td><code>page.data</code></td><td><code>App.PageData</code></td><td>Merged load data for current page</td></tr>
        <tr><td><code>page.status</code></td><td><code>number</code></td><td>HTTP status (usually 200)</td></tr>
        <tr><td><code>page.error</code></td><td><code>App.Error | null</code></td><td>Present on error pages</td></tr>
        <tr><td><code>page.form</code></td><td><code>any</code></td><td>Return value from the most recent form action</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>navigating & updated</h2>
    <pre>{\`<script lang="ts">
  import { navigating, updated } from '$app/state';
</script>

<!-- Show a loading bar while a navigation is in flight -->
{#if navigating.to}
  <div class="loading">
    Loading {navigating.to.url.pathname}...
  </div>
{/if}

<!-- Prompt user when a new version of the app is deployed -->
{#if updated.current}
  <dialog open>
    A new version is available.
    <button onclick={() => location.reload()}>Reload</button>
  </dialog>
{/if}\`}</pre>
    <p class="callout">
      <code>navigating</code> is <code>null</code> when idle, or
      <code>{'{ from, to, type, delta? }'}</code> during a navigation. Use it for
      progress bars, skeletons, or disabling nav buttons mid-transition.
    </p>
  </section>

  <section>
    <h2>Live Simulation</h2>
    <nav class:navigating={isNavigating}>
      {#each navItems as item (item.path)}
        <button
          class:active={isActive(item.path)}
          onclick={() => goto(item.path)}
          disabled={isNavigating}
        >
          {item.label}
        </button>
      {/each}
    </nav>

    {#if isNavigating}
      <div class="loading-bar">Navigating...</div>
    {/if}

    <div class="page-info">
      <h3>page state</h3>
      <p><strong>url.pathname:</strong> <code>{parsedPage.url.pathname}</code></p>
      <p><strong>url.search:</strong> <code>{parsedPage.url.search || '(none)'}</code></p>
      <p><strong>route.id:</strong> <code>{parsedPage.route.id}</code></p>
      <p><strong>params:</strong> <code>{JSON.stringify(parsedPage.params)}</code></p>
      <p><strong>status:</strong> <code>{parsedPage.status}</code></p>
    </div>

    <div class="log">
      <h4>Navigation log</h4>
      {#each navigationLog as entry (entry)}
        <div class="log-entry">{entry}</div>
      {:else}
        <div class="log-empty">Click a link above to navigate.</div>
      {/each}
    </div>
  </section>

  <section>
    <h2>goto() — Programmatic Navigation</h2>
    <pre>{\`import { goto } from '$app/navigation';

// Simple navigation
await goto('/dashboard');

// With options
await goto('/login', {
  replaceState: true,      // don't push to history
  invalidateAll: true,     // re-run ALL load functions after
  noScroll: true,          // don't scroll to top
  keepFocus: true,         // don't reset focus to <body>
  state: { from: 'modal' } // passed to page.state
});

// Example: after a successful form submit
async function save() {
  const res = await fetch('/api/save', { method: 'POST', body });
  if (res.ok) await goto('/dashboard');
}\`}</pre>
  </section>

  <section>
    <h2>invalidate() — Targeted Re-loading</h2>
    <p>
      Load functions only re-run when their dependencies change. Declare a custom
      dependency with <code>depends()</code>, then trigger a re-run from anywhere
      with <code>invalidate()</code>.
    </p>
    <pre>{\`// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, depends }) => {
  depends('app:posts');                    // custom key
  const res = await fetch('/api/posts');   // fetch() is tracked automatically
  return { posts: await res.json() };
};\`}</pre>
    <pre>{\`// Anywhere in your app
import { invalidate, invalidateAll } from '$app/navigation';

// Re-run every load that depends on 'app:posts'
await invalidate('app:posts');

// Re-run every load that fetched this URL
await invalidate('/api/posts');

// Re-run with a predicate
await invalidate((url) => url.pathname.startsWith('/api/posts'));

// Nuclear option: re-run every load function
await invalidateAll();\`}</pre>
  </section>

  <section>
    <h2>beforeNavigate & afterNavigate</h2>
    <pre>{\`<script lang="ts">
  import { beforeNavigate, afterNavigate } from '$app/navigation';

  let dirty = $state(false);

  // Warn about unsaved changes
  beforeNavigate(({ cancel, to, type }) => {
    if (dirty && type !== 'leave') {
      if (!confirm('You have unsaved changes. Leave anyway?')) {
        cancel();
      }
    }
  });

  // Fire analytics after every successful navigation
  afterNavigate(({ from, to }) => {
    analytics.pageView(to?.url.pathname);
  });
</script>\`}</pre>
    <p class="callout">
      Both hooks must be called during component initialization. They're
      automatically cleaned up when the component is destroyed. <code>type</code>
      can be <code>'enter'</code>, <code>'form'</code>, <code>'leave'</code>,
      <code>'link'</code>, <code>'goto'</code>, or <code>'popstate'</code>.
    </p>
  </section>

  <section>
    <h2>Detecting App Updates</h2>
    <label class="auth-toggle">
      <input type="checkbox" bind:checked={updateAvailable} />
      Simulate new version deployed
    </label>
    {#if updateAvailable}
      <div class="update-banner">
        A new version of this app is available.
        <button onclick={() => (updateAvailable = false)}>Reload</button>
      </div>
    {/if}
    <pre>{\`// svelte.config.js
export default {
  kit: {
    version: {
      pollInterval: 60_000  // check every minute
    }
  }
};

// Anywhere in your app
import { updated } from '$app/state';

$effect(() => {
  if (updated.current) {
    // New version deployed — prompt the user
    showReloadBanner();
  }
});\`}</pre>
  </section>

  <section>
    <h2>Active Link Pattern</h2>
    <pre>{\`<script lang="ts">
  import { page } from '$app/state';

  function isActive(href: string): boolean {
    if (href === '/') return page.url.pathname === '/';
    return page.url.pathname.startsWith(href);
  }
</script>

<nav>
  <a href="/" class:active={isActive('/')}>Home</a>
  <a href="/blog" class:active={isActive('/blog')}>Blog</a>
  <a href="/docs" class:active={isActive('/docs')}>Docs</a>
</nav>\`}</pre>
    <p class="callout">
      <strong>$app/state vs $app/stores:</strong> always use <code>$app/state</code>
      in new code. The legacy <code>$app/stores</code> module still works but is
      deprecated in SvelteKit 2.
    </p>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; padding: 1rem; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.78rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
  table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
  th, td { padding: 0.4rem 0.5rem; border: 1px solid #ddd; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; }
  nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; transition: opacity 0.2s; }
  nav.navigating { opacity: 0.6; }
  nav button {
    padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd;
    border-radius: 4px; background: white; transition: all 0.2s;
    font-size: 0.85rem;
  }
  nav button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  nav button:disabled { cursor: wait; }
  .loading-bar { background: #4a90d9; color: white; padding: 0.4rem 0.75rem; border-radius: 4px; font-size: 0.8rem; margin-bottom: 0.5rem; animation: pulse 1s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: 0.6; } }
  .page-info { background: #f0f7ff; padding: 1rem; border-radius: 4px; margin-top: 0.5rem; }
  .page-info h3 { margin-top: 0; }
  .log { margin-top: 0.75rem; background: #111; color: #8df; padding: 0.75rem; border-radius: 4px; font-family: monospace; font-size: 0.75rem; min-height: 80px; }
  .log h4 { color: white; margin: 0 0 0.5rem; font-family: sans-serif; }
  .log-entry { padding: 0.15rem 0; }
  .log-empty { color: #666; font-style: italic; }
  .auth-toggle { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; cursor: pointer; font-size: 0.9rem; }
  .update-banner { background: #fff3cd; border: 1px solid #ffc107; color: #856404; padding: 0.75rem; border-radius: 4px; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
  .update-banner button { padding: 0.3rem 0.75rem; cursor: pointer; }
  .callout { background: #fff7ed; border-left: 3px solid #f59e0b; padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.85rem; color: #78350f; }
  .callout code { background: #fde68a; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
