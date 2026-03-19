import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '18-6',
		title: 'SSR, Prerender & SEO Architecture',
		phase: 6,
		module: 18,
		lessonIndex: 6
	},
	description: `SvelteKit gives you three rendering strategies — SSR (Server-Side Rendering), prerendering (static generation at build time), and CSR (Client-Side Rendering) — and you can mix them per route. The key architectural decision is matching each route to the right strategy: prerender blog posts for maximum speed, SSR search pages for dynamic content, and CSR for authenticated dashboards that don't need SEO.

This lesson teaches you to think architecturally about rendering, using SvelteKit's +page.ts exports to configure each route optimally.`,
	objectives: [
		'Compare SSR, prerendering, and CSR and when to use each rendering strategy',
		'Configure per-route rendering in SvelteKit using +page.ts exports',
		'Design a mixed rendering architecture for a real application',
		'Understand the SEO implications of each rendering approach'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type RenderStrategy = {
    name: string;
    label: string;
    code: string;
    description: string;
    bestFor: string[];
    seoImpact: string;
    performance: string;
    tradeoffs: string[];
  };

  const strategies: RenderStrategy[] = [
    {
      name: 'prerender',
      label: 'Prerender (Static)',
      code: \`// +page.ts
export const prerender = true;

// Content is generated at BUILD time
// Served as static HTML — fastest possible\`,
      description: 'Pages are generated at build time and served as static HTML files. No server needed at runtime.',
      bestFor: ['Blog posts & articles', 'Marketing pages', 'Documentation', 'Landing pages'],
      seoImpact: 'Excellent — instant HTML, perfect for crawlers',
      performance: 'Fastest — served from CDN edge',
      tradeoffs: ['Content only updates on rebuild', 'Cannot use dynamic data (cookies, search params)', 'Must know all URLs at build time']
    },
    {
      name: 'ssr',
      label: 'SSR (Server-Side)',
      code: \`// +page.ts (default behavior)
export const ssr = true;  // default
export const csr = true;  // default

// HTML rendered on server per request
// Then hydrated on client\`,
      description: 'Pages are rendered on the server for each request, then hydrated on the client for interactivity.',
      bestFor: ['Search results pages', 'E-commerce product pages', 'User-specific content', 'Dynamic listings'],
      seoImpact: 'Excellent — full HTML on first request',
      performance: 'Good — server render time + TTFB',
      tradeoffs: ['Requires a running server', 'Each request costs compute', 'Cold starts on serverless']
    },
    {
      name: 'csr',
      label: 'CSR (Client-Side)',
      code: \`// +page.ts
export const ssr = false;
export const csr = true;

// No server rendering
// App shell loads, then JS renders content\`,
      description: 'Pages are rendered entirely in the browser. The server sends an empty shell, then JavaScript populates the content.',
      bestFor: ['Authenticated dashboards', 'Admin panels', 'Interactive tools', 'Pages behind login'],
      seoImpact: 'Poor — bots may see empty page',
      performance: 'Slower initial load — JS must execute first',
      tradeoffs: ['Not crawlable by default', 'Slower First Contentful Paint', 'Great for apps that don\\'t need SEO']
    }
  ];

  let activeStrategy = $state(0);

  type RouteConfig = {
    route: string;
    strategy: string;
    reason: string;
  };

  const sampleArchitecture: RouteConfig[] = [
    { route: '/', strategy: 'prerender', reason: 'Static marketing homepage' },
    { route: '/blog', strategy: 'prerender', reason: 'Blog listing — changes on deploy' },
    { route: '/blog/[slug]', strategy: 'prerender', reason: 'Individual posts — static content' },
    { route: '/products', strategy: 'ssr', reason: 'Dynamic inventory, search filters' },
    { route: '/products/[id]', strategy: 'ssr', reason: 'Price/availability changes' },
    { route: '/search', strategy: 'ssr', reason: 'Query-dependent results' },
    { route: '/dashboard', strategy: 'csr', reason: 'Authenticated, no SEO needed' },
    { route: '/settings', strategy: 'csr', reason: 'User-only, no crawling' }
  ];

  const strategyColors: Record<string, string> = {
    prerender: '#16a34a',
    ssr: '#2563eb',
    csr: '#9333ea'
  };

  // Mixed strategy code example
  const layoutExample = \`// src/routes/+layout.ts
// SSR is ON by default for all routes

// src/routes/blog/+page.ts
export const prerender = true;

// src/routes/dashboard/+layout.ts
export const ssr = false; // CSR for all dashboard routes

// src/routes/search/+page.server.ts
export async function load({ url }) {
  const query = url.searchParams.get('q');
  const results = await searchProducts(query);
  return { results, query };
}\`;
</script>

<main>
  <h1>SSR, Prerender & SEO Architecture</h1>
  <p class="subtitle">Choose the right rendering strategy for every route</p>

  <section class="decision-tree">
    <h2>Decision Tree</h2>
    <div class="tree">
      <div class="tree-node root">Does this page need SEO?</div>
      <div class="tree-branches">
        <div class="branch">
          <div class="branch-label yes">Yes</div>
          <div class="tree-node">Does content change per request?</div>
          <div class="tree-branches">
            <div class="branch">
              <div class="branch-label yes">Yes</div>
              <div class="tree-node result ssr">SSR</div>
            </div>
            <div class="branch">
              <div class="branch-label no">No</div>
              <div class="tree-node result prerender">Prerender</div>
            </div>
          </div>
        </div>
        <div class="branch">
          <div class="branch-label no">No</div>
          <div class="tree-node result csr">CSR</div>
        </div>
      </div>
    </div>
  </section>

  <section class="strategies">
    <h2>Rendering Strategies</h2>
    <div class="tab-bar">
      {#each strategies as s, i}
        <button class:active={activeStrategy === i} onclick={() => activeStrategy = i}>
          <span class="dot" style="background: {strategyColors[s.name]}"></span>
          {s.label}
        </button>
      {/each}
    </div>

    <div class="strategy-detail">
      <p>{strategies[activeStrategy].description}</p>
      <pre><code>{strategies[activeStrategy].code}</code></pre>

      <div class="columns">
        <div>
          <h4>Best For</h4>
          <ul>
            {#each strategies[activeStrategy].bestFor as item}
              <li>{item}</li>
            {/each}
          </ul>
        </div>
        <div>
          <h4>Tradeoffs</h4>
          <ul class="tradeoffs">
            {#each strategies[activeStrategy].tradeoffs as item}
              <li>{item}</li>
            {/each}
          </ul>
        </div>
      </div>

      <div class="meta-row">
        <span><strong>SEO:</strong> {strategies[activeStrategy].seoImpact}</span>
        <span><strong>Performance:</strong> {strategies[activeStrategy].performance}</span>
      </div>
    </div>
  </section>

  <section class="architecture">
    <h2>Sample Architecture</h2>
    <table>
      <thead>
        <tr><th>Route</th><th>Strategy</th><th>Reason</th></tr>
      </thead>
      <tbody>
        {#each sampleArchitecture as route}
          <tr>
            <td><code>{route.route}</code></td>
            <td>
              <span class="badge" style="background: {strategyColors[route.strategy]}">
                {route.strategy}
              </span>
            </td>
            <td>{route.reason}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="code-example">
    <h2>SvelteKit Configuration</h2>
    <pre><code>{layoutExample}</code></pre>
  </section>
</main>

<style>
  main {
    max-width: 850px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .tree {
    text-align: center;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 12px;
  }

  .tree-node {
    display: inline-block;
    padding: 0.6rem 1.2rem;
    background: white;
    border: 2px solid #ccc;
    border-radius: 8px;
    font-weight: 500;
    margin: 0.5rem 0;
  }

  .tree-node.root { border-color: #333; background: #f0f0f0; }
  .tree-node.result { color: white; font-weight: 700; }
  .tree-node.ssr { background: #2563eb; border-color: #2563eb; }
  .tree-node.prerender { background: #16a34a; border-color: #16a34a; }
  .tree-node.csr { background: #9333ea; border-color: #9333ea; }

  .tree-branches {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 0.5rem;
  }

  .branch { text-align: center; }
  .branch-label {
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 0.25rem;
  }
  .branch-label.yes { background: #dcfce7; color: #166534; }
  .branch-label.no { background: #fecaca; color: #991b1b; }

  .tab-bar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tab-bar button {
    flex: 1;
    padding: 0.6rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 500;
  }

  .tab-bar button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
  }

  .strategy-detail {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .columns ul { padding-left: 1.2rem; }
  .columns li { margin-bottom: 0.3rem; font-size: 0.9rem; }
  .tradeoffs li { color: #666; }

  .meta-row {
    display: flex;
    gap: 2rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e0e0e0;
    font-size: 0.9rem;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.8rem;
  }

  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th, td { padding: 0.6rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
  th { background: #f0f0f0; }

  code {
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }

  pre code { background: none; padding: 0; }

  .badge {
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  section { margin-bottom: 2.5rem; }
  h4 { margin-bottom: 0.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
