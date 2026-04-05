import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-5',
		title: 'Advanced Routing & Layout Groups',
		phase: 5,
		module: 17,
		lessonIndex: 5
	},
	description: `SvelteKit's file-based router has several advanced features that let you handle sophisticated URL structures without losing clarity. This lesson covers four major patterns:

1) Route groups with (parentheses) — directories wrapped in parens do NOT add a URL segment but DO add a layout. Use them to split marketing pages from the authenticated app area while keeping the URL flat: (marketing)/about -> /about, (app)/dashboard -> /dashboard, each with its own layout and even its own root layout.

2) Optional params with [[double brackets]] — make a segment optional. Classic use case: i18n prefixes. [[lang]]/about matches /about AND /en/about.

3) Param matchers — validate a param at the router level. [id=integer] only matches when the id is numeric; non-numeric paths fall through to other routes or 404. Matchers live in src/params/*.ts and return booleans.

4) Rest parameters with [...slug] — catch the rest of a path as a single segment. Perfect for wiki pages, file browsers, or catching unknown routes for a custom 404.`,
	objectives: [
		'Organise routes with (group) directories that affect layout but not URL',
		'Create optional URL segments with [[double bracket]] folders',
		'Validate params with matchers in src/params/*.ts',
		'Catch arbitrary path depth with [...rest] parameters',
		'Combine these patterns for real-world route trees (marketing + app + i18n)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Interactive route resolver — enter a URL and see which
  // file-based route would match it.

  type MatchResult = {
    path: string;
    params: Record<string, string | string[]>;
    layouts: string[];
  };

  // Simulated matchers — in real SvelteKit they live in src/params/*.ts
  // and export a match function.
  const matchers = {
    integer: (p: string) => /^\\d+$/.test(p),
    slug: (p: string) => /^[a-z0-9-]+$/.test(p),
    lang: (p: string) => /^(en|fr|es|de)$/.test(p)
  };

  // Route table ordered by specificity (most specific first).
  // Each entry describes a file tree entry.
  type RouteDef = {
    pattern: string;   // human readable
    regex: RegExp;     // compiled
    paramNames: string[];
    layouts: string[];
    file: string;
  };

  const routes: RouteDef[] = [
    {
      pattern: '(marketing)/+page',
      regex: /^\\/$/,
      paramNames: [],
      layouts: ['root', 'marketing'],
      file: 'src/routes/(marketing)/+page.svelte'
    },
    {
      pattern: '(marketing)/about/+page',
      regex: /^\\/about$/,
      paramNames: [],
      layouts: ['root', 'marketing'],
      file: 'src/routes/(marketing)/about/+page.svelte'
    },
    {
      pattern: '(marketing)/pricing/+page',
      regex: /^\\/pricing$/,
      paramNames: [],
      layouts: ['root', 'marketing'],
      file: 'src/routes/(marketing)/pricing/+page.svelte'
    },
    {
      pattern: '(app)/dashboard/+page',
      regex: /^\\/dashboard$/,
      paramNames: [],
      layouts: ['root', 'app'],
      file: 'src/routes/(app)/dashboard/+page.svelte'
    },
    {
      pattern: '(app)/posts/[id=integer]/+page',
      regex: /^\\/posts\\/(\\d+)$/,
      paramNames: ['id'],
      layouts: ['root', 'app'],
      file: 'src/routes/(app)/posts/[id=integer]/+page.svelte'
    },
    {
      pattern: '(app)/posts/[slug]/+page',
      regex: /^\\/posts\\/([a-z0-9-]+)$/,
      paramNames: ['slug'],
      layouts: ['root', 'app'],
      file: 'src/routes/(app)/posts/[slug]/+page.svelte'
    },
    {
      pattern: '[[lang=lang]]/docs/[...path]/+page',
      regex: /^(?:\\/(en|fr|es|de))?\\/docs\\/(.+)$/,
      paramNames: ['lang', 'path'],
      layouts: ['root', 'docs'],
      file: 'src/routes/[[lang=lang]]/docs/[...path]/+page.svelte'
    },
    {
      pattern: '[[lang=lang]]/+page',
      regex: /^(?:\\/(en|fr|es|de))?\\/?$/,
      paramNames: ['lang'],
      layouts: ['root'],
      file: 'src/routes/[[lang=lang]]/+page.svelte'
    }
  ];

  function resolve(url: string): MatchResult | null {
    const pathname = url.split('?')[0] || '/';
    for (const route of routes) {
      const match = pathname.match(route.regex);
      if (match) {
        const params: Record<string, string | string[]> = {};
        route.paramNames.forEach((name, i) => {
          const value = match[i + 1];
          if (value === undefined) return;
          if (name === 'path') {
            params[name] = value.split('/');
          } else {
            params[name] = value;
          }
        });
        return { path: route.file, params, layouts: route.layouts };
      }
    }
    return null;
  }

  let testUrl: string = $state('/dashboard');
  let resolved = $derived(resolve(testUrl));

  const examples = [
    '/',
    '/about',
    '/pricing',
    '/dashboard',
    '/posts/42',
    '/posts/svelte-5-runes',
    '/docs/getting-started',
    '/docs/advanced/routing/matchers',
    '/en',
    '/fr/docs/intro',
    '/nonsense'
  ];

  let showCode: 'groups' | 'optional' | 'matchers' | 'rest' = $state('groups');

  const codeExamples: Record<string, string> = {
    groups: \`# Route groups — directory wrapped in parens.
# Affects the layout, NOT the URL.

src/routes/
├── +layout.svelte              <- root layout
├── (marketing)/
│   ├── +layout.svelte          <- marketing-only layout
│   ├── +page.svelte            <- /
│   ├── about/+page.svelte      <- /about
│   └── pricing/+page.svelte    <- /pricing
├── (app)/
│   ├── +layout.server.ts       <- auth guard for this group
│   ├── +layout.svelte          <- app shell with sidebar
│   ├── dashboard/+page.svelte  <- /dashboard
│   └── settings/+page.svelte   <- /settings
└── (app)/+layout@.svelte
    # The @ suffix "resets" the layout inheritance,
    # making (app) use its own root instead of src/routes/+layout.

# URLs stay clean: /about, /dashboard — but the two groups
# can have totally different layouts, auth, and styling.\`,

    optional: \`# Optional parameters — [[double brackets]]
# The segment can be present OR absent.

src/routes/
└── [[lang=lang]]/
    ├── +layout.ts              <- detects lang param
    ├── +page.svelte            <- matches "/" AND "/en", "/fr", ...
    └── about/+page.svelte      <- matches "/about" AND "/en/about"

# +layout.ts
export const load = ({ params }) => {
  // params.lang is "en" | "fr" | "es" | "de" | undefined
  return { lang: params.lang ?? 'en' };
};

# src/params/lang.ts — matcher (see next tab)
export const match = (p) => /^(en|fr|es|de)$/.test(p);\`,

    matchers: \`# Param matchers — validate a param at the router level.
# File: src/params/integer.ts
export const match = (param) => /^\\d+$/.test(param);

# File: src/params/slug.ts
export const match = (param) => /^[a-z0-9-]+$/.test(param);

# Then in your route folders:

src/routes/
└── posts/
    ├── [id=integer]/+page.svelte    <- matches /posts/42
    ├── [slug=slug]/+page.svelte     <- matches /posts/hello-world
    └── [other]/+page.svelte         <- matches anything else

# SvelteKit tries matched routes first, in order of specificity.
# /posts/42 -> [id=integer] (because 42 is an integer)
# /posts/hello-world -> [slug=slug]
# /posts/... -> falls through

# This gives you pretty URLs without per-page validation code.\`,

    rest: \`# Rest parameters — [...name]
# Catches all remaining path segments into a single param.

src/routes/
├── docs/
│   └── [...path]/+page.svelte     <- /docs/a, /docs/a/b, /docs/a/b/c
└── [...catchall]/+page.svelte     <- matches EVERYTHING that falls through
    # Useful for a custom 404 that actually wants params,
    # or for a wiki where any path is a page.

# In +page.ts:
export const load = ({ params }) => {
  // params.path === "a/b/c"  (string, NOT an array)
  const segments = params.path.split('/');
  return { segments };
};

# Combined with optional lang:
[[lang=lang]]/docs/[...path]/+page.svelte
# Matches both "/docs/x/y" and "/fr/docs/x/y"\`
  };
</script>

<h1>Advanced Routing &amp; Layout Groups</h1>

<section>
  <h2>Route resolver</h2>
  <p class="note">
    Type a URL and see exactly which file SvelteKit would render, plus
    the layouts that wrap it and the parsed params.
  </p>

  <div class="url-input">
    <span class="proto">https://app</span>
    <input type="text" bind:value={testUrl} />
  </div>

  <div class="examples">
    <span class="ex-label">Try:</span>
    {#each examples as ex (ex)}
      <button onclick={() => (testUrl = ex)}>{ex}</button>
    {/each}
  </div>

  {#if resolved}
    <div class="result">
      <div class="row">
        <span class="k">matched file:</span>
        <code class="file">{resolved.path}</code>
      </div>
      <div class="row">
        <span class="k">layouts:</span>
        <div class="layouts">
          {#each resolved.layouts as layout, i (i)}
            <span class="layout">{layout}</span>
            {#if i < resolved.layouts.length - 1}<span class="arrow">&rarr;</span>{/if}
          {/each}
        </div>
      </div>
      {#if Object.keys(resolved.params).length > 0}
        <div class="row">
          <span class="k">params:</span>
          <pre class="params">{JSON.stringify(resolved.params, null, 2)}</pre>
        </div>
      {:else}
        <div class="row">
          <span class="k">params:</span>
          <em class="none">(none)</em>
        </div>
      {/if}
    </div>
  {:else}
    <div class="result not-found">
      No route matched — SvelteKit would render <code>+error.svelte</code> with 404.
    </div>
  {/if}
</section>

<section>
  <h2>Patterns</h2>
  <div class="tabs">
    {#each ['groups', 'optional', 'matchers', 'rest'] as tab (tab)}
      <button
        class:active={showCode === tab}
        onclick={() => (showCode = tab as typeof showCode)}
      >
        {tab === 'groups'
          ? '(groups)'
          : tab === 'optional'
          ? '[[optional]]'
          : tab === 'matchers'
          ? '[id=matcher]'
          : '[...rest]'}
      </button>
    {/each}
  </div>
  <pre class="code"><code>{codeExamples[showCode]}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #a29bfe; font-size: 1.05rem; }
  .note { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem; }
  .url-input {
    display: flex; align-items: center; gap: 0; background: #2d3436;
    padding: 0.5rem 0.75rem; border-radius: 4px; margin-bottom: 0.75rem;
    font-family: monospace;
  }
  .proto { color: #636e72; font-size: 0.85rem; }
  .url-input input {
    flex: 1; background: transparent; border: none; color: #74b9ff;
    font-family: monospace; font-size: 0.9rem; outline: none;
  }
  .examples {
    display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center;
    margin-bottom: 0.75rem;
  }
  .ex-label { font-size: 0.8rem; color: #636e72; margin-right: 0.25rem; }
  .examples button {
    padding: 0.2rem 0.5rem; border: none; border-radius: 3px;
    background: #dfe6e9; color: #2d3436; cursor: pointer;
    font-family: monospace; font-size: 0.75rem;
  }
  .examples button:hover { background: #a29bfe; color: white; }
  .result {
    background: white; padding: 0.75rem; border-radius: 6px;
    border-left: 4px solid #00b894;
  }
  .result.not-found {
    border-left-color: #d63031; color: #2d3436;
    font-size: 0.85rem;
  }
  .result.not-found code {
    background: #dfe6e9; padding: 0.1rem 0.3rem;
    border-radius: 3px; font-size: 0.8rem;
  }
  .row {
    display: flex; gap: 0.75rem; align-items: flex-start;
    padding: 0.25rem 0; font-size: 0.85rem;
  }
  .k {
    color: #636e72; font-weight: 600; min-width: 110px;
    font-family: monospace; font-size: 0.75rem;
    text-transform: uppercase; letter-spacing: 0.04em;
    padding-top: 0.15rem;
  }
  .file {
    background: #dfe6e9; padding: 0.15rem 0.4rem;
    border-radius: 3px; color: #6c5ce7; font-size: 0.8rem;
  }
  .layouts { display: flex; gap: 0.3rem; flex-wrap: wrap; align-items: center; }
  .layout {
    padding: 0.15rem 0.5rem; background: #a29bfe; color: white;
    border-radius: 10px; font-size: 0.75rem; font-weight: 600;
  }
  .arrow { color: #b2bec3; }
  .params {
    margin: 0; padding: 0.4rem 0.6rem; background: #2d3436;
    color: #55efc4; border-radius: 3px;
    font-size: 0.75rem; font-family: monospace;
  }
  .none { color: #b2bec3; font-size: 0.8rem; }
  .tabs { display: flex; gap: 2px; margin-bottom: 0; }
  .tabs button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px 4px 0 0;
    background: #dfe6e9; color: #636e72; cursor: pointer;
    font-weight: 600; font-size: 0.8rem; font-family: monospace;
  }
  .tabs button.active { background: #2d3436; color: #dfe6e9; }
  .code {
    padding: 1rem; background: #2d3436;
    border-radius: 0 6px 6px 6px; overflow-x: auto; margin: 0;
  }
  .code code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; font-family: monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
