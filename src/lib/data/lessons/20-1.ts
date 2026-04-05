import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-1',
		title: 'Architecture & Planning',
		phase: 7,
		module: 20,
		lessonIndex: 1
	},
	description: `Every production app starts with a plan. Before writing a line of code you map out five things: the component tree (reusable UI building blocks), the route structure (URLs and nested layouts), the state strategy (which runes live where), the render strategy per route (prerender, SSR, or CSR), and the SEO plan (titles, OG tags, JSON-LD). Planning up front saves weeks of refactoring later — you will know which components are shared, which routes need server data, which state crosses layout boundaries, and which pages must be crawlable.

This first capstone lesson gives you a template to fill in for your own app. Work through the interactive planner; by the end you will have a concrete architecture you can start building in lesson 20-2.`,
	objectives: [
		'Sketch a component tree mapping UI blocks to reusable Svelte components',
		'Map a route structure with nested layouts and groups',
		'Pick a state strategy: component-local, context, global rune module',
		'Choose a render strategy per route: prerender, SSR, CSR',
		'Draft a per-route SEO plan covering title, description and OG tags'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'tree' | 'routes' | 'state' | 'render' | 'seo' | 'summary';
  let activeTab = $state<Tab>('tree');

  // ============ Component tree ============
  type CompNode = {
    name: string;
    role: string;
    shared: boolean;
    children?: CompNode[];
  };

  const componentTree: CompNode = {
    name: 'App',
    role: 'root',
    shared: true,
    children: [
      {
        name: 'Header',
        role: 'navigation',
        shared: true,
        children: [
          { name: 'Logo', role: 'brand', shared: true },
          { name: 'NavBar', role: 'links', shared: true },
          { name: 'UserMenu', role: 'auth', shared: true }
        ]
      },
      {
        name: 'Main',
        role: 'content slot',
        shared: true,
        children: [
          { name: 'Hero', role: 'landing section', shared: false },
          { name: 'FeatureGrid', role: 'home features', shared: false },
          { name: 'PostList', role: 'blog index', shared: false },
          { name: 'PostCard', role: 'list item', shared: true },
          { name: 'Article', role: 'post page', shared: false }
        ]
      },
      {
        name: 'Footer',
        role: 'site-wide',
        shared: true,
        children: [
          { name: 'Newsletter', role: 'form', shared: true },
          { name: 'SocialLinks', role: 'icons', shared: true }
        ]
      }
    ]
  };

  // ============ Routes ============
  type Route = { path: string; file: string; render: 'prerender' | 'ssr' | 'csr'; desc: string };
  const routes: Route[] = [
    { path: '/',          file: 'routes/+page.svelte',                    render: 'prerender', desc: 'Landing — fully static' },
    { path: '/about',     file: 'routes/(marketing)/about/+page.svelte',  render: 'prerender', desc: 'About — fully static' },
    { path: '/blog',      file: 'routes/blog/+page.svelte',               render: 'ssr',       desc: 'Index — fresh data' },
    { path: '/blog/[slug]', file: 'routes/blog/[slug]/+page.svelte',     render: 'ssr',       desc: 'Post — SSR for SEO' },
    { path: '/dashboard', file: 'routes/(app)/dashboard/+page.svelte',    render: 'ssr',       desc: 'Per-user dashboard' },
    { path: '/settings',  file: 'routes/(app)/settings/+page.svelte',     render: 'csr',       desc: 'Client-only forms' }
  ];

  // ============ State strategy ============
  type StateRow = { name: string; kind: 'local' | 'context' | 'module'; example: string };
  const stateStrategy: StateRow[] = [
    { name: 'Form input values',     kind: 'local',   example: 'let email = $state("")' },
    { name: 'Modal open flag',       kind: 'local',   example: 'let open = $state(false)' },
    { name: 'Theme (light/dark)',    kind: 'module',  example: '$lib/state/theme.svelte.ts' },
    { name: 'Auth user',             kind: 'context', example: 'setContext("auth", user)' },
    { name: 'Cart items',            kind: 'module',  example: '$lib/state/cart.svelte.ts' },
    { name: 'Active tab in a widget',kind: 'local',   example: 'let tab = $state("overview")' }
  ];

  // ============ SEO plan ============
  type SeoRow = { route: string; title: string; description: string; og: string };
  const seoPlan: SeoRow[] = [
    { route: '/',            title: 'Acme — Ship Svelte Faster', description: 'Component kit and tooling for SvelteKit teams.', og: 'og/home.png' },
    { route: '/blog',        title: 'Blog — Acme',                description: 'Articles on Svelte 5, SvelteKit, testing.',        og: 'og/blog.png' },
    { route: '/blog/[slug]', title: '{post.title} — Acme',        description: '{post.excerpt}',                                  og: 'dynamic: og/{slug}.png' },
    { route: '/pricing',     title: 'Pricing — Acme',             description: 'Simple per-seat pricing.',                        og: 'og/pricing.png' }
  ];

  // Summary progress
  let stepsDone = $state({
    tree: false,
    routes: false,
    state: false,
    render: false,
    seo: false
  });

  let completeness = $derived(
    Math.round((Object.values(stepsDone).filter(Boolean).length / 5) * 100)
  );
</script>

<main>
  <h1>Architecture & Planning</h1>
  <p class="subtitle">Capstone lesson 1 — design before you code</p>

  <div class="progress">
    <div class="progress-bar"><div class="progress-fill" style="width: {completeness}%"></div></div>
    <span class="progress-num">{completeness}% planned</span>
  </div>

  <nav class="tabs" aria-label="Planning stages">
    <button class:active={activeTab === 'tree'} onclick={() => (activeTab = 'tree')}>1. Components</button>
    <button class:active={activeTab === 'routes'} onclick={() => (activeTab = 'routes')}>2. Routes</button>
    <button class:active={activeTab === 'state'} onclick={() => (activeTab = 'state')}>3. State</button>
    <button class:active={activeTab === 'render'} onclick={() => (activeTab = 'render')}>4. Render</button>
    <button class:active={activeTab === 'seo'} onclick={() => (activeTab = 'seo')}>5. SEO</button>
    <button class:active={activeTab === 'summary'} onclick={() => (activeTab = 'summary')}>Summary</button>
  </nav>

  {#if activeTab === 'tree'}
    <section>
      <h2>Component Tree</h2>
      <p>Break your UI into reusable blocks. Shared components live in <code>$lib/components</code>; page-specific ones stay next to the route.</p>
      {@render comp(componentTree, 0)}
      <button class="mark-btn" onclick={() => (stepsDone.tree = !stepsDone.tree)}>
        {stepsDone.tree ? '✓ Marked complete' : 'Mark complete'}
      </button>
    </section>
  {:else if activeTab === 'routes'}
    <section>
      <h2>Route Structure</h2>
      <table class="routes">
        <thead><tr><th>URL</th><th>File</th><th>Render</th><th>Notes</th></tr></thead>
        <tbody>
          {#each routes as r (r.path)}
            <tr>
              <td><code>{r.path}</code></td>
              <td><code>{r.file}</code></td>
              <td><span class="render-badge {r.render}">{r.render}</span></td>
              <td>{r.desc}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <button class="mark-btn" onclick={() => (stepsDone.routes = !stepsDone.routes)}>
        {stepsDone.routes ? '✓ Marked complete' : 'Mark complete'}
      </button>
    </section>
  {:else if activeTab === 'state'}
    <section>
      <h2>State Strategy</h2>
      <p>Default to local. Lift to context when two siblings share it. Reach for a module only when state must outlive component trees or be imported from anywhere.</p>
      <table class="state-table">
        <thead><tr><th>State</th><th>Kind</th><th>Example</th></tr></thead>
        <tbody>
          {#each stateStrategy as s (s.name)}
            <tr>
              <td>{s.name}</td>
              <td><span class="kind kind-{s.kind}">{s.kind}</span></td>
              <td><code>{s.example}</code></td>
            </tr>
          {/each}
        </tbody>
      </table>
      <button class="mark-btn" onclick={() => (stepsDone.state = !stepsDone.state)}>
        {stepsDone.state ? '✓ Marked complete' : 'Mark complete'}
      </button>
    </section>
  {:else if activeTab === 'render'}
    <section>
      <h2>Render Strategy per Route</h2>
      <p>Three modes. Pick the cheapest option that still works.</p>
      <div class="mode-grid">
        <div class="mode-card">
          <h3>Prerender</h3>
          <p>Build-time HTML, shipped as static files. Fastest, cheapest, perfectly cacheable. Use for marketing pages, docs, blogs.</p>
          <code>export const prerender = true</code>
        </div>
        <div class="mode-card">
          <h3>SSR</h3>
          <p>Server renders on every request. Needed for personalized content, user dashboards, SEO on dynamic data.</p>
          <code>export const ssr = true</code>
        </div>
        <div class="mode-card">
          <h3>CSR only</h3>
          <p>Client renders everything. Useful for highly interactive tools where SEO does not matter.</p>
          <code>export const ssr = false</code>
        </div>
      </div>
      <button class="mark-btn" onclick={() => (stepsDone.render = !stepsDone.render)}>
        {stepsDone.render ? '✓ Marked complete' : 'Mark complete'}
      </button>
    </section>
  {:else if activeTab === 'seo'}
    <section>
      <h2>SEO Plan</h2>
      <table class="seo">
        <thead><tr><th>Route</th><th>Title</th><th>Description</th><th>OG Image</th></tr></thead>
        <tbody>
          {#each seoPlan as s (s.route)}
            <tr>
              <td><code>{s.route}</code></td>
              <td>{s.title}</td>
              <td>{s.description}</td>
              <td><code>{s.og}</code></td>
            </tr>
          {/each}
        </tbody>
      </table>
      <button class="mark-btn" onclick={() => (stepsDone.seo = !stepsDone.seo)}>
        {stepsDone.seo ? '✓ Marked complete' : 'Mark complete'}
      </button>
    </section>
  {:else}
    <section>
      <h2>Architecture Summary</h2>
      <div class="summary-grid">
        <div class="summary-card" class:done={stepsDone.tree}>
          <h3>Component Tree</h3>
          <p>{stepsDone.tree ? 'Defined' : 'Pending'}</p>
        </div>
        <div class="summary-card" class:done={stepsDone.routes}>
          <h3>Routes</h3>
          <p>{stepsDone.routes ? 'Mapped' : 'Pending'}</p>
        </div>
        <div class="summary-card" class:done={stepsDone.state}>
          <h3>State Strategy</h3>
          <p>{stepsDone.state ? 'Chosen' : 'Pending'}</p>
        </div>
        <div class="summary-card" class:done={stepsDone.render}>
          <h3>Render Modes</h3>
          <p>{stepsDone.render ? 'Assigned' : 'Pending'}</p>
        </div>
        <div class="summary-card" class:done={stepsDone.seo}>
          <h3>SEO Plan</h3>
          <p>{stepsDone.seo ? 'Drafted' : 'Pending'}</p>
        </div>
      </div>
      {#if completeness === 100}
        <div class="celebrate">Architecture complete. Proceed to lesson 20-2 and start building.</div>
      {/if}
    </section>
  {/if}
</main>

{#snippet comp(node: CompNode, depth: number)}
  <div class="comp-node" style="--depth: {depth}">
    <span class="comp-name">{node.name}</span>
    <span class="comp-role">{node.role}</span>
    {#if node.shared}<span class="comp-shared">shared</span>{/if}
  </div>
  {#if node.children}
    {#each node.children as child (child.name)}
      {@render comp(child, depth + 1)}
    {/each}
  {/if}
{/snippet}

<style>
  main { max-width: 940px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .progress { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
  .progress-bar { flex: 1; background: #e5e7eb; border-radius: 999px; height: 10px; overflow: hidden; }
  .progress-fill { background: #16a34a; height: 100%; transition: width 200ms; }
  .progress-num { font-weight: 700; font-family: monospace; font-size: 0.85rem; }

  .tabs { display: flex; gap: 0.35rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
  .tabs button { padding: 0.55rem 1rem; border: none; background: transparent; border-radius: 6px 6px 0 0; font-weight: 500; cursor: pointer; font-size: 0.88rem; }
  .tabs button.active { background: #eef4fb; color: #1e40af; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }

  .comp-node {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 0.75rem;
    padding: 0.3rem 0.5rem;
    padding-left: calc(var(--depth) * 1.25rem + 0.5rem);
    align-items: center;
    font-size: 0.88rem;
    border-left: 2px solid #e0e0e0;
  }
  .comp-name { font-weight: 700; color: #1e40af; font-family: monospace; }
  .comp-role { color: #666; font-style: italic; font-size: 0.8rem; }
  .comp-shared {
    background: #dcfce7;
    color: #166534;
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
  }

  .routes, .state-table, .seo { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
  .routes th, .routes td,
  .state-table th, .state-table td,
  .seo th, .seo td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
  .routes th, .state-table th, .seo th { background: #f0f0f0; }

  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }

  .render-badge {
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 600;
  }
  .render-badge.prerender { background: #dcfce7; color: #166534; }
  .render-badge.ssr { background: #dbeafe; color: #1e40af; }
  .render-badge.csr { background: #fef3c7; color: #92400e; }

  .kind { padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.72rem; font-weight: 600; }
  .kind-local { background: #dbeafe; color: #1e40af; }
  .kind-context { background: #fef3c7; color: #92400e; }
  .kind-module { background: #fce7f3; color: #9d174d; }

  .mode-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  .mode-card {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 10px;
    border-left: 4px solid #4a90d9;
  }
  .mode-card h3 { margin: 0 0 0.35rem; }
  .mode-card p { font-size: 0.85rem; color: #555; margin: 0 0 0.5rem; }
  .mode-card code { font-size: 0.75rem; background: #111; color: #9ae6b4; padding: 0.2rem 0.5rem; border-radius: 4px; }

  .mark-btn {
    margin-top: 1rem;
    padding: 0.5rem 1.1rem;
    background: #4a90d9;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
  }
  .summary-card {
    padding: 1rem;
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
  }
  .summary-card.done { background: #dcfce7; border-color: #16a34a; }
  .summary-card h3 { margin: 0 0 0.25rem; font-size: 0.95rem; }
  .summary-card p { margin: 0; font-size: 0.8rem; color: #555; }

  .celebrate {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #dcfce7;
    border-radius: 10px;
    text-align: center;
    font-weight: 700;
    color: #166534;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
