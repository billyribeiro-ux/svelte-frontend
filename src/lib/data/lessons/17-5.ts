import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-5',
		title: 'Advanced Routing & Layout Groups',
		phase: 5,
		module: 17,
		lessonIndex: 5
	},
	description: `SvelteKit's advanced routing lets you organize complex applications with layout groups, optional parameters, and parameter matchers. Layout groups like (marketing) and (app) apply different layouts to different sections without affecting the URL. Optional parameters like [[lang]] match with or without a value. Parameter matchers like [id=integer] validate route segments at the routing level, preventing invalid URLs from ever reaching your load functions.

Together these patterns let you build sophisticated URL structures while keeping your codebase clean and maintainable.`,
	objectives: [
		'Organize routes with layout groups like (marketing) and (app)',
		'Use optional parameters [[lang]] for multi-language URL patterns',
		'Create and apply parameter matchers like [id=integer] for route validation',
		'Combine advanced routing patterns for real-world application architectures'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Advanced Routing & Layout Groups — interactive reference

  type RoutingConcept = {
    name: string;
    syntax: string;
    description: string;
    example: string;
    urlExamples: { url: string; matches: boolean; note: string }[];
  };

  const concepts: RoutingConcept[] = [
    {
      name: 'Layout Groups',
      syntax: '(groupname)',
      description: 'Group routes under a shared layout WITHOUT affecting the URL path. Routes inside (marketing)/ and (app)/ can have completely different layouts but both live at the root level of your site.',
      example: \`src/routes/
  (marketing)/
    +layout.svelte         # Marketing header + footer
    +page.svelte           # / (homepage)
    about/+page.svelte     # /about
    pricing/+page.svelte   # /pricing

  (app)/
    +layout.server.ts      # Auth guard
    +layout.svelte         # Dashboard sidebar + nav
    dashboard/+page.svelte # /dashboard
    settings/+page.svelte  # /settings
    profile/+page.svelte   # /profile

  (auth)/
    +layout.svelte         # Centered card layout
    login/+page.svelte     # /login
    register/+page.svelte  # /register\`,
      urlExamples: [
        { url: '/', matches: true, note: 'Renders inside (marketing) layout' },
        { url: '/about', matches: true, note: 'Renders inside (marketing) layout' },
        { url: '/dashboard', matches: true, note: 'Renders inside (app) layout' },
        { url: '/login', matches: true, note: 'Renders inside (auth) layout' }
      ]
    },
    {
      name: 'Optional Parameters',
      syntax: '[[param]]',
      description: 'Double brackets make a route parameter optional. The route matches both with and without the parameter. Perfect for locale prefixes like /en/about and /about matching the same page.',
      example: \`src/routes/
  [[lang]]/
    +layout.server.ts  # Detect language from param or header
    +page.svelte       # / or /en or /fr
    about/+page.svelte # /about or /en/about

// +layout.server.ts
import type { LayoutServerLoad } from './$types';

const supportedLangs = ['en', 'fr', 'de', 'es'];

export const load: LayoutServerLoad = async ({ params }) => {
  const lang = params.lang && supportedLangs.includes(params.lang)
    ? params.lang
    : 'en';

  return { lang };
};\`,
      urlExamples: [
        { url: '/', matches: true, note: 'lang = undefined, defaults to "en"' },
        { url: '/en', matches: true, note: 'lang = "en"' },
        { url: '/fr/about', matches: true, note: 'lang = "fr"' },
        { url: '/about', matches: true, note: 'lang = undefined, page = about' }
      ]
    },
    {
      name: 'Parameter Matchers',
      syntax: '[param=matcher]',
      description: 'Matchers validate route parameters at the routing level. If a matcher returns false, SvelteKit tries the next route or returns a 404. Matchers are defined in src/params/ as functions that return boolean.',
      example: \`// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\\d+$/.test(param);
};

// src/params/slug.ts
export const match: ParamMatcher = (param) => {
  return /^[a-z0-9-]+$/.test(param);
};

// src/params/uuid.ts
export const match: ParamMatcher = (param) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(param);
};

// Usage in routes:
// src/routes/posts/[id=integer]/+page.svelte
// src/routes/blog/[slug=slug]/+page.svelte
// src/routes/users/[id=uuid]/+page.svelte\`,
      urlExamples: [
        { url: '/posts/42', matches: true, note: '[id=integer] matches — id is "42"' },
        { url: '/posts/abc', matches: false, note: '[id=integer] rejects — not a number' },
        { url: '/blog/hello-world', matches: true, note: '[slug=slug] matches' },
        { url: '/blog/Hello World!', matches: false, note: '[slug=slug] rejects — invalid chars' }
      ]
    },
    {
      name: 'Rest Parameters',
      syntax: '[...rest]',
      description: 'Catch-all parameters match any number of path segments. Useful for file paths, nested categories, or custom 404 pages. The value is the entire remaining path as a string.',
      example: \`// src/routes/docs/[...path]/+page.svelte
// Matches /docs/getting-started
// Matches /docs/api/components/button

// +page.server.ts
export const load = async ({ params }) => {
  // params.path = "api/components/button"
  const segments = params.path.split('/');
  const doc = await loadDoc(segments);
  return { doc, breadcrumbs: segments };
};

// Custom 404 page
// src/routes/[...catchall]/+page.svelte
// Matches any URL not matched by other routes

// src/routes/[...catchall]/+page.ts
import { error } from '@sveltejs/kit';
export const load = () => { error(404, 'Page not found'); };\`,
      urlExamples: [
        { url: '/docs/intro', matches: true, note: 'path = "intro"' },
        { url: '/docs/api/auth/login', matches: true, note: 'path = "api/auth/login"' },
        { url: '/anything/else', matches: true, note: 'catchall matches everything' }
      ]
    }
  ];

  let activeConcept = $state('Layout Groups');
  let activeData = $derived(concepts.find(c => c.name === activeConcept)!);
</script>

<main>
  <h1>Advanced Routing & Layout Groups</h1>
  <p class="subtitle">Layout groups, optional params, matchers, and rest parameters</p>

  <div class="concept-tabs">
    {#each concepts as concept}
      <button
        class={['tab', activeConcept === concept.name && 'active']}
        onclick={() => activeConcept = concept.name}
      >
        <code>{concept.syntax}</code>
        <span>{concept.name}</span>
      </button>
    {/each}
  </div>

  <div class="concept-detail">
    <div class="concept-header">
      <code class="syntax">{activeData.syntax}</code>
      <h2>{activeData.name}</h2>
    </div>
    <p class="concept-desc">{activeData.description}</p>

    <h3>URL Matching</h3>
    <div class="url-table">
      {#each activeData.urlExamples as ex}
        <div class="url-row" class:match={ex.matches} class:no-match={!ex.matches}>
          <span class="url-status">{ex.matches ? '\u2713' : '\u2717'}</span>
          <code class="url-path">{ex.url}</code>
          <span class="url-note">{ex.note}</span>
        </div>
      {/each}
    </div>

    <h3>Example</h3>
    <pre><code>{activeData.example}</code></pre>
  </div>
</main>

<style>
  main { max-width: 850px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  h1 { text-align: center; color: #333; }
  h2 { margin: 0; }
  h3 { color: #555; margin: 1.25rem 0 0.5rem; }
  .subtitle { text-align: center; color: #666; }

  .concept-tabs { display: flex; gap: 0.5rem; margin: 2rem 0 1.5rem; flex-wrap: wrap; }
  .tab {
    display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
    padding: 0.6rem 1rem; border: 2px solid #e0e0e0; border-radius: 10px;
    background: #f8f9fa; cursor: pointer; flex: 1; min-width: 120px;
  }
  .tab code { font-size: 0.85rem; color: #7b1fa2; }
  .tab span { font-size: 0.8rem; color: #666; }
  .tab.active { border-color: #1976d2; background: #e3f2fd; }
  .tab.active code { color: #1976d2; }

  .concept-detail { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; }
  .concept-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
  .syntax {
    font-size: 1.1rem; background: #f3e5f5; color: #7b1fa2;
    padding: 0.3rem 0.75rem; border-radius: 6px;
  }
  .concept-desc { color: #555; line-height: 1.6; }

  .url-table { display: flex; flex-direction: column; gap: 0.25rem; }
  .url-row {
    display: flex; align-items: center; gap: 0.75rem; padding: 0.4rem 0.75rem;
    border-radius: 6px; font-size: 0.88rem;
  }
  .url-row.match { background: #e8f5e9; }
  .url-row.no-match { background: #fef2f2; }
  .url-status { font-weight: 700; width: 20px; text-align: center; }
  .match .url-status { color: #16a34a; }
  .no-match .url-status { color: #dc2626; }
  .url-path { background: #e0e0e0; padding: 0.15rem 0.4rem; border-radius: 4px; }
  .url-note { color: #666; font-size: 0.82rem; }

  pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; font-size: 0.78rem; overflow-x: auto; line-height: 1.5; }
  code { font-family: 'Fira Code', monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
