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

This lesson introduces the routing file tree, the role of each special file (+page, +layout, +page.server, +layout.server, +error, +server), and how URLs map directly to your folder structure.`,
	objectives: [
		'Understand how folder structure maps to URL paths in SvelteKit',
		'Know the purpose of every + prefixed special file',
		'Distinguish universal (.ts) vs server-only (.server.ts) load files',
		'Build API endpoints with +server.ts',
		'Navigate the relationship between file tree and rendered pages'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // SvelteKit routing is file-based — this lesson is conceptual
  // since routing requires SvelteKit's file system conventions.

  interface RouteInfo {
    path: string;
    file: string;
    description: string;
    kind: 'page' | 'layout' | 'endpoint' | 'error';
  }

  const routes: RouteInfo[] = [
    { path: '/', file: 'src/routes/+page.svelte', description: 'Home page', kind: 'page' },
    { path: '/about', file: 'src/routes/about/+page.svelte', description: 'About page', kind: 'page' },
    { path: '/blog', file: 'src/routes/blog/+page.svelte', description: 'Blog listing', kind: 'page' },
    { path: '/blog/first-post', file: 'src/routes/blog/first-post/+page.svelte', description: 'A specific blog post', kind: 'page' },
    { path: '/settings', file: 'src/routes/settings/+page.svelte', description: 'Settings page', kind: 'page' },
    { path: '/api/posts', file: 'src/routes/api/posts/+server.ts', description: 'JSON API endpoint', kind: 'endpoint' }
  ];

  let selectedRoute: string = $state('/');

  interface SpecialFile {
    name: string;
    runsOn: 'client+server' | 'server-only' | 'both';
    purpose: string;
  }

  const specialFiles: SpecialFile[] = [
    { name: '+page.svelte', runsOn: 'both', purpose: 'The page component for a route' },
    { name: '+page.ts', runsOn: 'client+server', purpose: 'Universal load function — runs on client AND server' },
    { name: '+page.server.ts', runsOn: 'server-only', purpose: 'Server-only load + form actions (access DB, secrets, cookies)' },
    { name: '+layout.svelte', runsOn: 'both', purpose: 'Shared UI wrapping child pages via {@render children()}' },
    { name: '+layout.ts', runsOn: 'client+server', purpose: 'Universal load for layout data (cascades to children)' },
    { name: '+layout.server.ts', runsOn: 'server-only', purpose: 'Server-only load for layout data' },
    { name: '+error.svelte', runsOn: 'both', purpose: 'Error boundary page for this route segment' },
    { name: '+server.ts', runsOn: 'server-only', purpose: 'API endpoint — exports GET, POST, PUT, DELETE, etc.' }
  ];

  let kindFilter: 'all' | 'page' | 'endpoint' = $state('all');

  let filteredRoutes = $derived(
    kindFilter === 'all' ? routes : routes.filter((r) => r.kind === kindFilter)
  );

  let selectedInfo = $derived(routes.find((r) => r.path === selectedRoute));
</script>

<main>
  <h1>File-Based Routing</h1>

  <section>
    <h2>The Core Idea</h2>
    <p>
      In SvelteKit, your URL structure <em>is</em> your folder structure. No routing
      config, no manual registration. Create a folder at <code>src/routes/about/</code>,
      drop a <code>+page.svelte</code> inside, and you now have a <code>/about</code> page.
    </p>
    <p>
      Files starting with <code>+</code> are <strong>special</strong> — SvelteKit
      treats them as route machinery. Anything else (regular <code>.svelte</code>,
      <code>.ts</code>, helpers) is just co-located code, not routed.
    </p>
  </section>

  <section>
    <h2>A Realistic File Tree</h2>
    <pre>{\`src/routes/
├── +layout.svelte              → wraps EVERY page (nav, footer)
├── +layout.server.ts           → global server data (e.g. current user)
├── +page.svelte                → GET  /
├── +error.svelte               → fallback error page
│
├── about/
│   └── +page.svelte            → GET  /about
│
├── blog/
│   ├── +layout.svelte          → wraps /blog/*
│   ├── +page.svelte            → GET  /blog
│   ├── +page.ts                → load posts list (universal)
│   └── [slug]/
│       ├── +page.svelte        → GET  /blog/:slug
│       └── +page.server.ts     → load post from DB (server-only)
│
├── dashboard/
│   ├── +layout.server.ts       → auth check (redirect if not logged in)
│   ├── +layout.svelte          → sidebar layout
│   └── +page.svelte            → GET  /dashboard
│
└── api/
    ├── posts/
    │   └── +server.ts          → GET/POST /api/posts   (JSON endpoint)
    └── health/
        └── +server.ts          → GET /api/health\`}</pre>
  </section>

  <section>
    <h2>Every Special File Explained</h2>
    <table>
      <thead>
        <tr><th>File</th><th>Runs on</th><th>Purpose</th></tr>
      </thead>
      <tbody>
        {#each specialFiles as file (file.name)}
          <tr>
            <td><code>{file.name}</code></td>
            <td>
              <span class="badge badge-{file.runsOn.replace(/[+ ]/g, '-')}">
                {file.runsOn}
              </span>
            </td>
            <td>{file.purpose}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Route Explorer</h2>
    <p>Filter by kind, then click a route to see which file renders it:</p>

    <div class="filters">
      <button class:active={kindFilter === 'all'} onclick={() => (kindFilter = 'all')}>All</button>
      <button class:active={kindFilter === 'page'} onclick={() => (kindFilter = 'page')}>Pages</button>
      <button class:active={kindFilter === 'endpoint'} onclick={() => (kindFilter = 'endpoint')}>Endpoints</button>
    </div>

    <div class="routes">
      {#each filteredRoutes as route (route.path)}
        <button
          class:active={selectedRoute === route.path}
          onclick={() => (selectedRoute = route.path)}
        >
          {route.path}
        </button>
      {/each}
    </div>

    {#if selectedInfo}
      <div class="route-info">
        <p><strong>URL:</strong> <code>{selectedInfo.path}</code></p>
        <p><strong>File:</strong> <code>{selectedInfo.file}</code></p>
        <p><strong>Kind:</strong> {selectedInfo.kind}</p>
        <p><strong>Description:</strong> {selectedInfo.description}</p>
      </div>
    {/if}
  </section>

  <section>
    <h2>Universal vs Server-Only Loads</h2>
    <pre>{\`// src/routes/blog/[slug]/+page.ts  (universal — runs on both)
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  // Use the provided fetch — it works on server AND client
  const res = await fetch(\\\`/api/posts/\\\${params.slug}\\\`);
  return { post: await res.json() };
};\`}</pre>
    <pre>{\`// src/routes/blog/[slug]/+page.server.ts  (server-only)
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params, cookies }) => {
  // Full access to DB, secrets, cookies — NEVER shipped to client
  const user = await db.getUserFromCookie(cookies.get('session'));
  const post = await db.getPost(params.slug);
  return { post, user };
};\`}</pre>
    <p class="callout">
      <strong>Rule of thumb:</strong> use <code>+page.server.ts</code> whenever
      the load needs secrets, direct DB access, or cookies. Use <code>+page.ts</code>
      when the data can come from a public API (and you want to continue loading
      from the client after initial navigation).
    </p>
  </section>

  <section>
    <h2>API Endpoints with +server.ts</h2>
    <pre>{\`// src/routes/api/posts/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
  const limit = Number(url.searchParams.get('limit') ?? 10);
  const posts = await db.listPosts(limit);
  return json(posts);
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const post = await db.createPost(body);
  return json(post, { status: 201 });
};\`}</pre>
    <p>
      A single <code>+server.ts</code> can export any HTTP verb. These are
      standalone endpoints — no page, no layout, just request in, response out.
    </p>
  </section>

  <section>
    <h2>Key Rules</h2>
    <ul>
      <li>Every navigable route needs a <code>+page.svelte</code> <em>or</em> <code>+server.ts</code></li>
      <li>Folders without either are just organizational grouping (still need a file to be reachable)</li>
      <li>Layouts cascade — a layout wraps all pages in its folder and subfolders</li>
      <li>The root <code>+layout.svelte</code> wraps every page in your app</li>
      <li>Files without a <code>+</code> prefix are private — put helpers, components, and tests next to your routes safely</li>
      <li><code>.server.ts</code> code never ships to the client — safe for secrets</li>
    </ul>
  </section>

  <section>
    <h2>Common Pitfalls</h2>
    <ul class="pitfalls">
      <li><strong>Forgetting the <code>+</code>:</strong> <code>page.svelte</code> won't render anything — SvelteKit ignores it.</li>
      <li><strong>Mixing <code>+page.ts</code> and <code>+page.server.ts</code>:</strong> both can exist; the server load runs first, its data flows into the universal load.</li>
      <li><strong>Trying to import server-only code from <code>+page.ts</code>:</strong> anything under <code>$lib/server/</code> or in <code>.server.ts</code> is forbidden from universal files.</li>
      <li><strong>Expecting folders without pages to 404 nicely:</strong> they just don't exist as a route — nearest <code>+error.svelte</code> handles them.</li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; padding: 1rem; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
  .badge { display: inline-block; padding: 0.1rem 0.5rem; border-radius: 10px; font-size: 0.75rem; white-space: nowrap; }
  .badge-client-server { background: #e3f2fd; color: #1565c0; }
  .badge-server-only { background: #fce4ec; color: #ad1457; }
  .badge-both { background: #e8f5e9; color: #2e7d32; }
  .filters { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  .filters button { padding: 0.3rem 0.75rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
  .filters button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .routes { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  .routes button { padding: 0.4rem 0.8rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; font-family: monospace; font-size: 0.85rem; }
  .routes button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .route-info { background: #f0f7ff; padding: 1rem; border-radius: 4px; }
  .callout { background: #fff7ed; border-left: 3px solid #f59e0b; padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.85rem; color: #78350f; }
  .callout code { background: #fde68a; }
  .pitfalls li { margin: 0.4rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
