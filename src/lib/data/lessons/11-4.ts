import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-4',
		title: 'Navigation & $app/state',
		phase: 3,
		module: 11,
		lessonIndex: 4
	},
	description: `SvelteKit provides the page object from $app/state to access the current URL, route parameters, and page data reactively. For programmatic navigation, goto() from $app/navigation lets you navigate without anchor tags. Combining these tools, you can build dynamic navigation with active link highlighting.

This lesson covers reading page state, navigating programmatically, and styling active links based on the current route.`,
	objectives: [
		'Access current URL and params via page from $app/state',
		'Navigate programmatically with goto() from $app/navigation',
		'Style active navigation links based on the current route',
		'Use page.url, page.params, and page.data effectively'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // In SvelteKit, you'd import:
  // import { page } from '$app/state';
  // import { goto } from '$app/navigation';

  // Simulating page state for this demo
  let currentPath: string = $state('/');

  interface NavItem {
    path: string;
    label: string;
  }

  const navItems: NavItem[] = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/blog', label: 'Blog' },
    { path: '/blog/latest', label: 'Latest Post' },
    { path: '/settings', label: 'Settings' }
  ];

  // Simulating goto()
  function goto(path: string) {
    currentPath = path;
  }

  // Check if a nav item is active (exact or prefix match)
  function isActive(navPath: string): boolean {
    if (navPath === '/') return currentPath === '/';
    return currentPath.startsWith(navPath);
  }

  // Simulated page object
  let pageState = $derived({
    url: { pathname: currentPath, search: '', hash: '' },
    params: currentPath.startsWith('/blog/') && currentPath !== '/blog'
      ? { slug: currentPath.split('/').pop() }
      : {},
    route: { id: currentPath }
  });
</script>

<main>
  <h1>Navigation & $app/state</h1>

  <section>
    <h2>$app/state — Page Info</h2>
    <pre>{\`<script lang="ts">
  // page is a reactive object with current route info
  import { page } from '$app/state';
</script>

<!-- Access current URL -->
<p>Path: {page.url.pathname}</p>
<p>Search: {page.url.searchParams.get('q')}</p>

<!-- Access route params -->
<p>Slug: {page.params.slug}</p>

<!-- Access loaded data -->
<p>Title: {page.data.title}</p>\`}</pre>
  </section>

  <section>
    <h2>Simulated Navigation</h2>
    <nav>
      {#each navItems as item}
        <button
          class:active={isActive(item.path)}
          onclick={() => goto(item.path)}
        >
          {item.label}
        </button>
      {/each}
    </nav>

    <div class="page-info">
      <h3>Current Page State</h3>
      <p><strong>pathname:</strong> <code>{pageState.url.pathname}</code></p>
      <p><strong>route.id:</strong> <code>{pageState.route.id}</code></p>
      {#if Object.keys(pageState.params).length > 0}
        <p><strong>params:</strong> <code>{JSON.stringify(pageState.params)}</code></p>
      {/if}
    </div>
  </section>

  <section>
    <h2>Programmatic Navigation</h2>
    <pre>{\`<script lang="ts">
  import { goto } from '$app/navigation';

  function handleLogin() {
    // Navigate after action
    goto('/dashboard');
  }

  function goBack() {
    // With options
    goto('/home', { replaceState: true });
  }
</script>\`}</pre>
    <div class="actions">
      <button onclick={() => goto('/')}>goto('/')</button>
      <button onclick={() => goto('/about')}>goto('/about')</button>
      <button onclick={() => goto('/blog/latest')}>goto('/blog/latest')</button>
    </div>
  </section>

  <section>
    <h2>Active Link Pattern</h2>
    <pre>{\`<script lang="ts">
  import { page } from '$app/state';
</script>

<nav>
  <a href="/" class:active={page.url.pathname === '/'}>
    Home
  </a>
  <a
    href="/blog"
    class:active={page.url.pathname.startsWith('/blog')}
  >
    Blog
  </a>
</nav>\`}</pre>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  nav button {
    padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd;
    border-radius: 4px; background: white; transition: all 0.2s;
  }
  nav button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .page-info { background: #f0f7ff; padding: 1rem; border-radius: 4px; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .actions button { padding: 0.5rem 1rem; cursor: pointer; font-family: monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
