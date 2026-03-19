import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-5',
		title: 'Advanced Routing & Layout Groups',
		phase: 5,
		module: 17,
		lessonIndex: 5
	},
	description: `SvelteKit's file-based router supports advanced patterns for complex application architectures. Layout groups — directories wrapped in parentheses like (marketing) or (app) — let you apply different layouts to different sections of your site without affecting the URL structure.

Optional parameters with [[param]], parameter matchers like [id=integer], and rest parameters [...path] give you fine-grained control over route matching. These patterns enable multi-locale apps, shared authentication layouts, and clean URL hierarchies.`,
	objectives: [
		'Organize routes with layout groups like (marketing) and (app)',
		'Use optional parameters [[lang]] for multi-locale URL patterns',
		'Create parameter matchers for type-safe route parameters',
		'Design complex route hierarchies with nested layouts'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  interface RouteDefinition {
    path: string;
    file: string;
    layout: string;
    params: Record<string, string>;
    description: string;
  }

  const routeExamples: RouteDefinition[] = [
    {
      path: '/', file: 'src/routes/(marketing)/+page.svelte',
      layout: '(marketing)', params: {},
      description: 'Marketing layout — full-width, public header',
    },
    {
      path: '/pricing', file: 'src/routes/(marketing)/pricing/+page.svelte',
      layout: '(marketing)', params: {},
      description: 'Shares marketing layout without affecting URL',
    },
    {
      path: '/dashboard', file: 'src/routes/(app)/dashboard/+page.svelte',
      layout: '(app)', params: {},
      description: 'App layout — sidebar navigation, auth required',
    },
    {
      path: '/settings', file: 'src/routes/(app)/settings/+page.svelte',
      layout: '(app)', params: {},
      description: 'Shares app layout with dashboard',
    },
    {
      path: '/en/blog', file: 'src/routes/[[lang]]/blog/+page.svelte',
      layout: 'default', params: { lang: 'en (optional)' },
      description: 'Optional locale prefix — /blog and /en/blog both work',
    },
    {
      path: '/products/42', file: 'src/routes/products/[id=integer]/+page.svelte',
      layout: 'default', params: { id: '42 (must match integer)' },
      description: 'Param matcher ensures id is a valid integer',
    },
    {
      path: '/docs/api/auth/login', file: 'src/routes/docs/[...path]/+page.svelte',
      layout: 'default', params: { path: 'api/auth/login (rest)' },
      description: 'Rest parameter catches entire sub-path',
    },
  ];

  let selectedRoute: number = $state(0);
  let current = $derived(routeExamples[selectedRoute]);

  let showStructure: boolean = $state(false);

  const fileStructure = \`src/routes/
  (marketing)/
    +layout.svelte      # Public layout (no sidebar)
    +page.svelte        # /
    pricing/
      +page.svelte      # /pricing
    about/
      +page.svelte      # /about

  (app)/
    +layout.svelte      # Auth layout (sidebar)
    +layout.server.ts   # Auth guard
    dashboard/
      +page.svelte      # /dashboard
    settings/
      +page.svelte      # /settings

  [[lang]]/
    blog/
      +page.svelte      # /blog or /en/blog
      [slug]/
        +page.svelte    # /blog/my-post or /en/blog/my-post

  products/
    [id=integer]/
      +page.svelte      # /products/42

  docs/
    [...path]/
      +page.svelte      # /docs/any/nested/path

  params/
    integer.ts          # Matcher: return /^\\d+$/.test(param)\`;

  const matcherCode = \`// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\\\\d+$/.test(param);
};

// Usage: src/routes/products/[id=integer]/
// /products/42    -> matches (id = '42')
// /products/abc   -> does not match (404)\`;
</script>

<h1>Advanced Routing</h1>

<section>
  <h2>Route Examples</h2>
  <div class="route-list">
    {#each routeExamples as route, i}
      <button
        class="route-item"
        class:active={selectedRoute === i}
        onclick={() => selectedRoute = i}
      >
        <code class="path">{route.path}</code>
        <span class="file">{route.file}</span>
      </button>
    {/each}
  </div>

  <div class="route-detail">
    <h3>{current.path}</h3>
    <div class="detail-row">
      <span class="label">File:</span>
      <code>{current.file}</code>
    </div>
    <div class="detail-row">
      <span class="label">Layout group:</span>
      <span class="group-badge">{current.layout}</span>
    </div>
    {#if Object.keys(current.params).length > 0}
      <div class="detail-row">
        <span class="label">Params:</span>
        <div class="params">
          {#each Object.entries(current.params) as [key, val]}
            <span class="param">{key}: {val}</span>
          {/each}
        </div>
      </div>
    {/if}
    <p class="desc">{current.description}</p>
  </div>
</section>

<section>
  <h2>File Structure</h2>
  <button onclick={() => showStructure = !showStructure}>
    {showStructure ? 'Hide' : 'Show'} File Structure
  </button>
  {#if showStructure}
    <pre class="structure"><code>{fileStructure}</code></pre>
  {/if}
</section>

<section>
  <h2>Parameter Matchers</h2>
  <pre class="code"><code>{matcherCode}</code></pre>
</section>

<section>
  <h2>Layout Groups Summary</h2>
  <div class="group-grid">
    <div class="group-card marketing">
      <h3>(marketing)</h3>
      <p>Public pages with marketing header/footer</p>
      <ul>
        <li>/ (home)</li>
        <li>/pricing</li>
        <li>/about</li>
      </ul>
    </div>
    <div class="group-card app">
      <h3>(app)</h3>
      <p>Authenticated pages with sidebar navigation</p>
      <ul>
        <li>/dashboard</li>
        <li>/settings</li>
        <li>/profile</li>
      </ul>
    </div>
  </div>
  <p class="hint">Parenthesized group names don't appear in the URL — they only affect layout inheritance.</p>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #e17055; font-size: 1.1rem; }
  h3 { margin: 0 0 0.5rem; }
  .route-list { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1rem; }
  .route-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.5rem 0.75rem; border: 1px solid #dfe6e9; border-radius: 6px;
    background: white; cursor: pointer; text-align: left;
  }
  .route-item.active { border-color: #e17055; background: #fff5f2; }
  .path { color: #e17055; font-weight: 700; }
  .file { font-size: 0.75rem; color: #636e72; }
  .route-detail { padding: 1rem; background: white; border-radius: 6px; border: 1px solid #dfe6e9; }
  .detail-row { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.4rem; }
  .label { font-weight: 600; color: #2d3436; font-size: 0.85rem; min-width: 90px; }
  .group-badge {
    padding: 0.15rem 0.5rem; background: #e17055; color: white;
    border-radius: 10px; font-size: 0.8rem;
  }
  .params { display: flex; gap: 0.25rem; flex-wrap: wrap; }
  .param {
    padding: 0.15rem 0.5rem; background: #dfe6e9; border-radius: 4px;
    font-family: monospace; font-size: 0.8rem;
  }
  .desc { color: #636e72; font-size: 0.9rem; margin-bottom: 0; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #e17055; color: white; cursor: pointer; font-weight: 600;
  }
  .structure, .code, pre {
    background: #2d3436; padding: 1rem; border-radius: 6px;
    overflow-x: auto; margin: 0.75rem 0 0;
  }
  code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; }
  .group-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .group-card {
    padding: 1rem; border-radius: 8px; border: 2px solid;
  }
  .group-card.marketing { border-color: #74b9ff; background: #f0f8ff; }
  .group-card.app { border-color: #00b894; background: #f0fff4; }
  .group-card h3 { margin-top: 0; font-family: monospace; }
  .group-card p { font-size: 0.85rem; color: #636e72; }
  .group-card ul { margin: 0; padding-left: 1.2rem; }
  .group-card li { font-family: monospace; font-size: 0.85rem; }
  .hint { font-size: 0.8rem; color: #636e72; margin-top: 0.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
