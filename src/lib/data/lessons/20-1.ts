import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-1',
		title: 'Architecture & Planning',
		phase: 7,
		module: 20,
		lessonIndex: 1
	},
	description: `Every successful project starts with a plan. Before writing a single line of code, you need to map out your component tree, route structure, state management strategy, and SEO plan. This capstone lesson guides you through the architectural planning phase — defining what to build, how to organize it, and which patterns to apply.

Planning before coding saves time, prevents refactoring, and ensures your application scales. Use this template as a starting point for any SvelteKit project.`,
	objectives: [
		'Plan a component tree that maps UI to reusable Svelte components',
		'Design a route structure with appropriate rendering strategies per route',
		'Choose state management patterns for different data requirements',
		'Create an SEO plan covering meta tags, structured data, and sitemaps'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type ComponentNode = {
    name: string;
    type: 'layout' | 'page' | 'ui' | 'feature';
    children?: ComponentNode[];
  };

  const componentTree: ComponentNode = {
    name: 'Root Layout',
    type: 'layout',
    children: [
      {
        name: 'Header',
        type: 'ui',
        children: [
          { name: 'Nav', type: 'ui' },
          { name: 'ThemeToggle', type: 'ui' },
          { name: 'SearchBar', type: 'feature' }
        ]
      },
      {
        name: 'Main Content',
        type: 'layout',
        children: [
          {
            name: 'HomePage',
            type: 'page',
            children: [
              { name: 'Hero', type: 'ui' },
              { name: 'FeatureGrid', type: 'feature' },
              { name: 'Testimonials', type: 'feature' }
            ]
          },
          {
            name: 'BlogPage',
            type: 'page',
            children: [
              { name: 'PostList', type: 'feature' },
              { name: 'PostCard', type: 'ui' },
              { name: 'Pagination', type: 'ui' }
            ]
          },
          {
            name: 'DashboardPage',
            type: 'page',
            children: [
              { name: 'StatsGrid', type: 'feature' },
              { name: 'DataTable', type: 'feature' },
              { name: 'Chart', type: 'ui' }
            ]
          }
        ]
      },
      { name: 'Footer', type: 'ui' }
    ]
  };

  type RouteEntry = {
    path: string;
    render: 'prerender' | 'ssr' | 'csr';
    dataSource: string;
    seo: boolean;
  };

  const routes: RouteEntry[] = [
    { path: '/', render: 'prerender', dataSource: 'Static content', seo: true },
    { path: '/about', render: 'prerender', dataSource: 'Static content', seo: true },
    { path: '/blog', render: 'prerender', dataSource: 'mdsvex / CMS', seo: true },
    { path: '/blog/[slug]', render: 'prerender', dataSource: 'mdsvex markdown', seo: true },
    { path: '/products', render: 'ssr', dataSource: 'Database query', seo: true },
    { path: '/products/[id]', render: 'ssr', dataSource: 'Database + cache', seo: true },
    { path: '/search', render: 'ssr', dataSource: 'Search API', seo: true },
    { path: '/dashboard', render: 'csr', dataSource: 'Authenticated API', seo: false },
    { path: '/settings', render: 'csr', dataSource: 'User API', seo: false }
  ];

  type StateDecision = {
    data: string;
    pattern: string;
    reason: string;
  };

  const stateStrategy: StateDecision[] = [
    { data: 'UI state (modals, tabs)', pattern: '$state in component', reason: 'Local, no sharing needed' },
    { data: 'Theme / preferences', pattern: '$state in .svelte.ts module', reason: 'Shared across components' },
    { data: 'Shopping cart', pattern: '$state in .svelte.ts + localStorage', reason: 'Persisted, shared' },
    { data: 'Auth user', pattern: '+layout.server.ts → context', reason: 'Server-validated, cascading' },
    { data: 'Blog posts list', pattern: '+page.server.ts load', reason: 'Server data, page-scoped' },
    { data: 'Search results', pattern: '+page.server.ts + URL params', reason: 'Shareable, SSR for SEO' },
    { data: 'Large dataset', pattern: '$state.raw', reason: 'Performance — no deep reactivity' }
  ];

  type SEOPlanItem = {
    area: string;
    implementation: string;
    priority: 'high' | 'medium' | 'low';
  };

  const seoPlan: SEOPlanItem[] = [
    { area: 'Page titles & meta descriptions', implementation: '<svelte:head> per page from load data', priority: 'high' },
    { area: 'Open Graph tags', implementation: 'Dynamic OG image, title, description', priority: 'high' },
    { area: 'JSON-LD structured data', implementation: 'Article + FAQ schemas on blog pages', priority: 'high' },
    { area: 'XML Sitemap', implementation: '+server.ts generating dynamic sitemap', priority: 'high' },
    { area: 'robots.txt', implementation: '+server.ts with crawl directives', priority: 'medium' },
    { area: 'Canonical URLs', implementation: '<link rel="canonical"> on all pages', priority: 'medium' },
    { area: 'Heading hierarchy', implementation: 'One <h1> per page, logical nesting', priority: 'medium' },
    { area: 'Core Web Vitals', implementation: 'Lighthouse audit, image optimization', priority: 'high' }
  ];

  const typeColors: Record<string, string> = {
    layout: '#2563eb',
    page: '#16a34a',
    ui: '#9333ea',
    feature: '#ea580c'
  };

  const renderColors: Record<string, string> = {
    prerender: '#16a34a',
    ssr: '#2563eb',
    csr: '#9333ea'
  };

  const priorityColors: Record<string, string> = {
    high: '#dc2626',
    medium: '#ca8a04',
    low: '#888'
  };

  let activeSection = $state<'components' | 'routes' | 'state' | 'seo'>('components');

  function renderTree(node: ComponentNode, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    const prefix = depth === 0 ? '' : '\u251C\u2500 ';
    let result = \`\${indent}\${prefix}\${node.name} [\${node.type}]\\n\`;
    if (node.children) {
      for (const child of node.children) {
        result += renderTree(child, depth + 1);
      }
    }
    return result;
  }
</script>

<main>
  <h1>Architecture & Planning</h1>
  <p class="subtitle">Plan before you code — component tree, routes, state, SEO</p>

  <div class="section-tabs">
    <button class:active={activeSection === 'components'} onclick={() => activeSection = 'components'}>
      Component Tree
    </button>
    <button class:active={activeSection === 'routes'} onclick={() => activeSection = 'routes'}>
      Routes
    </button>
    <button class:active={activeSection === 'state'} onclick={() => activeSection = 'state'}>
      State Strategy
    </button>
    <button class:active={activeSection === 'seo'} onclick={() => activeSection = 'seo'}>
      SEO Plan
    </button>
  </div>

  {#if activeSection === 'components'}
    <section>
      <h2>Component Tree</h2>
      <div class="legend">
        {#each ['layout', 'page', 'ui', 'feature'] as type}
          <span class="legend-item">
            <span class="dot" style="background: {typeColors[type]}"></span>
            {type}
          </span>
        {/each}
      </div>
      <pre class="tree-view"><code>{renderTree(componentTree)}</code></pre>
    </section>

  {:else if activeSection === 'routes'}
    <section>
      <h2>Route Structure</h2>
      <table>
        <thead>
          <tr><th>Route</th><th>Render</th><th>Data Source</th><th>SEO</th></tr>
        </thead>
        <tbody>
          {#each routes as route}
            <tr>
              <td><code>{route.path}</code></td>
              <td><span class="badge" style="background: {renderColors[route.render]}">{route.render}</span></td>
              <td>{route.dataSource}</td>
              <td>{route.seo ? '\u2713' : '\u2717'}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>

  {:else if activeSection === 'state'}
    <section>
      <h2>State Management Strategy</h2>
      <table>
        <thead>
          <tr><th>Data</th><th>Pattern</th><th>Reason</th></tr>
        </thead>
        <tbody>
          {#each stateStrategy as item}
            <tr>
              <td><strong>{item.data}</strong></td>
              <td><code>{item.pattern}</code></td>
              <td>{item.reason}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>

  {:else}
    <section>
      <h2>SEO Plan</h2>
      <table>
        <thead>
          <tr><th>Area</th><th>Implementation</th><th>Priority</th></tr>
        </thead>
        <tbody>
          {#each seoPlan as item}
            <tr>
              <td><strong>{item.area}</strong></td>
              <td>{item.implementation}</td>
              <td><span class="priority" style="color: {priorityColors[item.priority]}">{item.priority}</span></td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .section-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .section-tabs button {
    flex: 1;
    padding: 0.6rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
  }

  .section-tabs button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .legend {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .tree-view {
    background: #1e1e1e;
    color: #4ec9b0;
    padding: 1.5rem;
    border-radius: 10px;
    font-size: 0.85rem;
    line-height: 1.6;
  }

  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th, td { padding: 0.6rem; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 0.88rem; }
  th { background: #f0f0f0; }

  code {
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.82rem;
  }

  pre code { background: none; padding: 0; }

  .badge {
    color: white;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .priority {
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.8rem;
  }

  section { margin-bottom: 2rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
