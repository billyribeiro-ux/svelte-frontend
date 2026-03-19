import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-4',
		title: 'Page Options: prerender, ssr, csr, trailingSlash',
		phase: 5,
		module: 17,
		lessonIndex: 4
	},
	description: `SvelteKit page options let you control how each route is rendered and served. The four key options — prerender, ssr, csr, and trailingSlash — can be set per page or per layout, and they cascade down to child routes. prerender generates static HTML at build time, ssr controls server-side rendering at request time, csr controls whether the client-side router hydrates the page, and trailingSlash determines URL normalization.

Combining these options lets you mix static marketing pages, SSR'd dynamic pages, and SPA-style dashboard routes in a single application.`,
	objectives: [
		'Configure prerender for static page generation at build time',
		'Toggle ssr and csr to control rendering strategies per route',
		'Set trailingSlash for consistent URL formatting',
		'Combine page options in layouts for route-group rendering strategies'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Page Options reference — interactive comparison

  type PageOption = {
    name: string;
    type: string;
    default: string;
    description: string;
    values: { value: string; effect: string }[];
    example: string;
  };

  const options: PageOption[] = [
    {
      name: 'prerender',
      type: 'boolean | "auto"',
      default: 'false',
      description: 'Generates static HTML at build time. The page is rendered once during pnpm build and served as a static file — no server needed at runtime.',
      values: [
        { value: 'true', effect: 'Page is rendered at build time to static HTML' },
        { value: 'false', effect: 'Page is rendered on each request (SSR)' },
        { value: '"auto"', effect: 'SvelteKit decides based on whether the page has dynamic features' }
      ],
      example: \`// src/routes/about/+page.ts
export const prerender = true;

// Prerender all blog posts via entries()
// src/routes/blog/[slug]/+page.ts
export const prerender = true;

export function entries() {
  return [
    { slug: 'hello-world' },
    { slug: 'intro-to-svelte' },
    { slug: 'advanced-routing' }
  ];
}

// Disable prerender for dynamic pages
// src/routes/search/+page.ts
export const prerender = false;\`
    },
    {
      name: 'ssr',
      type: 'boolean',
      default: 'true',
      description: 'Controls whether the page is server-side rendered on each request. When false, the server sends an empty HTML shell and the page renders entirely in the browser.',
      values: [
        { value: 'true', effect: 'Page is rendered on the server (SEO-friendly, fast first paint)' },
        { value: 'false', effect: 'SPA mode — empty shell sent, client renders everything' }
      ],
      example: \`// SPA-style dashboard — no SSR needed
// src/routes/(app)/+layout.ts
export const ssr = false;

// This applies to ALL routes inside (app)/
// /dashboard, /settings, /profile — all client-rendered

// Why disable SSR?
// - Pages behind auth (no SEO value)
// - Heavy client-side libraries (canvas, WebGL)
// - Avoid server load for internal tools\`
    },
    {
      name: 'csr',
      type: 'boolean',
      default: 'true',
      description: 'Controls whether SvelteKit loads client-side JavaScript to hydrate the page. When false, the page is pure static HTML with no interactivity — no click handlers, no reactivity.',
      values: [
        { value: 'true', effect: 'Page is hydrated with JavaScript (interactive)' },
        { value: 'false', effect: 'No JS sent — pure static HTML, zero interactivity' }
      ],
      example: \`// Zero-JS static pages (fastest possible)
// src/routes/legal/+page.ts
export const prerender = true;
export const csr = false;

// Perfect for:
// - Legal pages (terms, privacy)
// - Simple content pages
// - Maximum Lighthouse performance score
// - Accessibility-first pages\`
    },
    {
      name: 'trailingSlash',
      type: '"never" | "always" | "ignore"',
      default: '"never"',
      description: 'Controls how trailing slashes in URLs are handled. SvelteKit will redirect to the canonical form based on this setting, ensuring consistent URLs for SEO.',
      values: [
        { value: '"never"', effect: '/about/ redirects to /about' },
        { value: '"always"', effect: '/about redirects to /about/' },
        { value: '"ignore"', effect: 'Both /about and /about/ are accepted' }
      ],
      example: \`// Global setting
// src/routes/+layout.ts
export const trailingSlash = 'never';

// Required for adapter-static with certain hosts
// src/routes/+layout.ts
export const trailingSlash = 'always';

// Per-route override
// src/routes/api/+layout.ts
export const trailingSlash = 'ignore';\`
    }
  ];

  let activeOption = $state('prerender');
  let activeData = $derived(options.find(o => o.name === activeOption)!);

  // Combination examples
  type Combo = {
    name: string;
    settings: string;
    description: string;
  };

  const combos: Combo[] = [
    {
      name: 'Static Marketing Site',
      settings: 'prerender = true, csr = false',
      description: 'Build-time HTML, zero JavaScript. Fastest possible pages.'
    },
    {
      name: 'SSR Blog with Hydration',
      settings: 'prerender = true, ssr = true, csr = true',
      description: 'Static HTML with client interactivity. Best of both worlds.'
    },
    {
      name: 'SPA Dashboard',
      settings: 'ssr = false, csr = true',
      description: 'Client-only rendering. No server load, auth-gated pages.'
    },
    {
      name: 'Full SSR (Default)',
      settings: 'ssr = true, csr = true',
      description: 'Server renders on each request, client hydrates. Dynamic data, SEO-friendly.'
    }
  ];
</script>

<main>
  <h1>Page Options</h1>
  <p class="subtitle">prerender, ssr, csr, trailingSlash — control how every route is rendered</p>

  <section>
    <h2>Options Reference</h2>
    <div class="option-tabs">
      {#each options as opt}
        <button
          class={['opt-tab', activeOption === opt.name && 'active']}
          onclick={() => activeOption = opt.name}
        >
          {opt.name}
        </button>
      {/each}
    </div>

    <div class="option-detail">
      <div class="opt-header">
        <code class="opt-name">{activeData.name}</code>
        <span class="opt-type">{activeData.type}</span>
        <span class="opt-default">default: {activeData.default}</span>
      </div>
      <p class="opt-desc">{activeData.description}</p>

      <div class="values-table">
        <h4>Values</h4>
        {#each activeData.values as v}
          <div class="value-row">
            <code class="val">{v.value}</code>
            <span>{v.effect}</span>
          </div>
        {/each}
      </div>

      <h4>Example</h4>
      <pre><code>{activeData.example}</code></pre>
    </div>
  </section>

  <section>
    <h2>Common Combinations</h2>
    <div class="combo-grid">
      {#each combos as combo}
        <div class="combo-card">
          <h3>{combo.name}</h3>
          <code class="combo-settings">{combo.settings}</code>
          <p>{combo.description}</p>
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h2>Cascade Rule</h2>
    <div class="cascade-note">
      <p>Page options set in a <code>+layout.ts</code> cascade to <strong>all child routes</strong>. A child route can override the parent's option.</p>
      <pre><code>{\`src/routes/
  +layout.ts          → ssr = true (default for everything)
  (marketing)/
    +layout.ts        → prerender = true, csr = false
    about/+page.svelte    → static, no JS
    pricing/+page.svelte  → static, no JS
  (app)/
    +layout.ts        → ssr = false
    dashboard/+page.svelte  → SPA mode
    settings/+page.svelte   → SPA mode\`}</code></pre>
    </div>
  </section>
</main>

<style>
  main { max-width: 850px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  h1 { text-align: center; color: #333; }
  h2 { color: #555; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
  h4 { color: #555; margin: 1rem 0 0.5rem; }
  .subtitle { text-align: center; color: #666; }
  section { margin: 2rem 0; }

  .option-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.5rem; }
  .opt-tab {
    padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 20px;
    background: white; cursor: pointer; font-size: 0.85rem; font-family: 'Fira Code', monospace;
  }
  .opt-tab.active { background: #1976d2; color: white; border-color: #1976d2; }

  .option-detail { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; }
  .opt-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .opt-name { font-size: 1.1rem; font-weight: 700; background: #e3f2fd; padding: 0.3rem 0.6rem; border-radius: 6px; color: #1976d2; }
  .opt-type { font-size: 0.85rem; color: #7b1fa2; background: #f3e5f5; padding: 0.2rem 0.5rem; border-radius: 4px; }
  .opt-default { font-size: 0.85rem; color: #666; }
  .opt-desc { color: #555; line-height: 1.6; }

  .values-table { margin-top: 1rem; }
  .value-row {
    display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.4rem 0;
    border-bottom: 1px solid #eee; font-size: 0.88rem;
  }
  .val { background: #e8f5e9; color: #2e7d32; padding: 0.15rem 0.4rem; border-radius: 4px; white-space: nowrap; }

  .combo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .combo-card {
    background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 10px; padding: 1.25rem;
  }
  .combo-card h3 { margin: 0 0 0.5rem; font-size: 0.95rem; }
  .combo-settings { display: block; font-size: 0.8rem; background: #e8e8e8; padding: 0.3rem 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; }
  .combo-card p { margin: 0; font-size: 0.85rem; color: #555; }

  .cascade-note {
    background: #fff3e0; border: 1px solid #ffcc80; border-radius: 10px; padding: 1.25rem;
  }
  .cascade-note p { margin: 0 0 0.75rem; color: #e65100; font-size: 0.9rem; }

  pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; font-size: 0.78rem; overflow-x: auto; }
  code { font-family: 'Fira Code', monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
