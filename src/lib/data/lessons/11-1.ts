import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-1',
		title: 'File-Based Routing',
		phase: 3,
		module: 11,
		lessonIndex: 1
	},
	description: `SvelteKit uses file-based routing — the structure of your src/routes directory determines your app's URLs. Each folder can contain a +page.svelte file that renders for that route, and a +layout.svelte file that wraps pages in shared UI. This convention eliminates manual route configuration.

This lesson introduces the routing file tree, the role of each special file, and how URLs map directly to your folder structure.`,
	objectives: [
		'Understand how folder structure maps to URL paths in SvelteKit',
		'Know the purpose of +page.svelte and +layout.svelte files',
		'Identify the special files in the SvelteKit routing convention',
		'Navigate the relationship between file tree and rendered pages'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // SvelteKit routing is file-based — this lesson is conceptual
  // since routing requires SvelteKit's file system conventions.

  let selectedRoute: string = $state('/');

  interface RouteInfo {
    path: string;
    file: string;
    description: string;
  }

  const routes: RouteInfo[] = [
    { path: '/', file: 'src/routes/+page.svelte', description: 'Home page' },
    { path: '/about', file: 'src/routes/about/+page.svelte', description: 'About page' },
    { path: '/blog', file: 'src/routes/blog/+page.svelte', description: 'Blog listing' },
    { path: '/blog/first-post', file: 'src/routes/blog/first-post/+page.svelte', description: 'A specific blog post' },
    { path: '/settings', file: 'src/routes/settings/+page.svelte', description: 'Settings page' }
  ];
</script>

<main>
  <h1>File-Based Routing</h1>

  <section>
    <h2>The File Tree</h2>
    <pre>{\`src/routes/
├── +page.svelte          → /
├── +layout.svelte        → wraps ALL pages
├── about/
│   └── +page.svelte      → /about
├── blog/
│   ├── +page.svelte      → /blog
│   ├── +layout.svelte    → wraps all /blog/* pages
│   └── first-post/
│       └── +page.svelte  → /blog/first-post
└── settings/
    └── +page.svelte      → /settings\`}</pre>
  </section>

  <section>
    <h2>Special Files</h2>
    <table>
      <thead>
        <tr><th>File</th><th>Purpose</th></tr>
      </thead>
      <tbody>
        <tr><td><code>+page.svelte</code></td><td>The page component for a route</td></tr>
        <tr><td><code>+page.js</code></td><td>Load data for the page (runs on client + server)</td></tr>
        <tr><td><code>+page.server.js</code></td><td>Load data server-side only</td></tr>
        <tr><td><code>+layout.svelte</code></td><td>Shared UI wrapping child pages</td></tr>
        <tr><td><code>+layout.js</code></td><td>Load data for the layout</td></tr>
        <tr><td><code>+error.svelte</code></td><td>Error page for this route segment</td></tr>
        <tr><td><code>+server.js</code></td><td>API endpoint (GET, POST, etc.)</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Route Explorer</h2>
    <p>Click a route to see which file renders it:</p>
    <div class="routes">
      {#each routes as route}
        <button
          class:active={selectedRoute === route.path}
          onclick={() => selectedRoute = route.path}
        >
          {route.path}
        </button>
      {/each}
    </div>
    {#each routes as route}
      {#if selectedRoute === route.path}
        <div class="route-info">
          <p><strong>URL:</strong> {route.path}</p>
          <p><strong>File:</strong> <code>{route.file}</code></p>
          <p><strong>Description:</strong> {route.description}</p>
        </div>
      {/if}
    {/each}
  </section>

  <section>
    <h2>Key Rules</h2>
    <ul>
      <li>Every route needs a <code>+page.svelte</code> file</li>
      <li>Folders without <code>+page.svelte</code> are just organizational grouping</li>
      <li>Layouts cascade — a layout wraps all pages in its folder and subfolders</li>
      <li>The root <code>+layout.svelte</code> wraps every page in your app</li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
  th { background: #f5f5f5; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9rem; }
  .routes { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  .routes button { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; }
  .routes button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .route-info { background: #f0f7ff; padding: 1rem; border-radius: 4px; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
