import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-3',
		title: 'Dynamic Routes & Params',
		phase: 3,
		module: 11,
		lessonIndex: 3
	},
	description: `Dynamic routes let a single page component handle infinitely many URLs. Wrapping a folder name in brackets — like [slug] — creates a parameter that captures that part of the URL. SvelteKit passes these parameters to your load function and makes them available via page.params.

Four bracket flavors cover every routing need:
- [slug] captures exactly one segment
- [...rest] captures any number of segments (including zero) as a slash-joined string
- [[optional]] captures zero or one segment — the route matches with or without it
- [id=matcher] adds a runtime constraint — returning false from the matcher falls through to a 404

As of kit@2.55, params constrained by matchers are type-narrowed automatically in $app/types. Import RouteParams<'/blog/[slug]'> and LayoutParams to get fully typed params in load functions and components — no manual type assertions needed.`,
	objectives: [
		'Create dynamic routes with [param] folder naming',
		'Access route parameters in load functions and page components',
		'Use rest parameters [...rest] to match multiple URL segments',
		'Understand optional parameters with [[optional]] syntax',
		'Combine multiple params in a single route segment or path',
		'Use RouteParams and matchers for type-safe params (kit@2.55)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Dynamic routes use brackets in folder names:
  //   [slug]         — one segment
  //   [...rest]      — zero or more segments
  //   [[optional]]   — zero or one segment
  //   [id=matcher]   — one segment, validated at runtime

  interface PostMeta {
    slug: string;
    title: string;
    date: string;
    category: string;
  }

  const posts: PostMeta[] = [
    { slug: 'hello-world', title: 'Hello World', date: '2026-01-15', category: 'intro' },
    { slug: 'svelte-5-runes', title: 'Svelte 5 Runes Deep Dive', date: '2026-02-20', category: 'svelte' },
    { slug: 'sveltekit-routing', title: 'SvelteKit Routing Guide', date: '2026-03-10', category: 'kit' },
    { slug: 'advanced-typescript', title: 'Advanced TypeScript Patterns', date: '2026-03-28', category: 'ts' }
  ];

  let simulatedSlug: string = $state('hello-world');
  let currentPost = $derived(posts.find((p) => p.slug === simulatedSlug) ?? null);

  // --- Route simulator ---
  type Pattern = '[slug]' | '[...rest]' | '[[lang]]' | '[id=integer]';
  let activePattern: Pattern = $state('[slug]');
  let typedUrl: string = $state('/blog/hello-world');

  interface MatchResult {
    matches: boolean;
    params: Record<string, string | undefined>;
    reason?: string;
  }

  let matchResult: MatchResult = $derived.by(() => {
    const url = typedUrl.trim();
    if (!url.startsWith('/')) return { matches: false, params: {}, reason: 'URLs must start with /' };
    const segments = url.slice(1).split('/').filter(Boolean);

    if (activePattern === '[slug]') {
      // /blog/[slug]
      if (segments.length !== 2 || segments[0] !== 'blog') {
        return { matches: false, params: {}, reason: 'Pattern /blog/[slug] needs exactly two segments starting with blog' };
      }
      return { matches: true, params: { slug: segments[1] } };
    }
    if (activePattern === '[...rest]') {
      // /docs/[...path]
      if (segments[0] !== 'docs') return { matches: false, params: {}, reason: 'Pattern /docs/[...path] needs /docs prefix' };
      return { matches: true, params: { path: segments.slice(1).join('/') || '' } };
    }
    if (activePattern === '[[lang]]') {
      // /[[lang]]  — root or /en or /fr
      if (segments.length === 0) return { matches: true, params: { lang: undefined } };
      if (segments.length === 1) return { matches: true, params: { lang: segments[0] } };
      return { matches: false, params: {}, reason: 'Optional param matches 0 or 1 segment only' };
    }
    // [id=integer]
    if (segments.length !== 2 || segments[0] !== 'users') {
      return { matches: false, params: {}, reason: 'Pattern /users/[id=integer] needs /users/:id' };
    }
    if (!/^\\d+$/.test(segments[1])) {
      return { matches: false, params: {}, reason: \`Matcher "integer" rejected "\${segments[1]}" — 404\` };
    }
    return { matches: true, params: { id: segments[1] } };
  });

  function presetUrl(p: Pattern) {
    activePattern = p;
    if (p === '[slug]') typedUrl = '/blog/hello-world';
    else if (p === '[...rest]') typedUrl = '/docs/api/v2/users';
    else if (p === '[[lang]]') typedUrl = '/en';
    else typedUrl = '/users/42';
  }
</script>

<main>
  <h1>Dynamic Routes & Params</h1>

  <section>
    <h2>The Four Bracket Flavors</h2>
    <pre>{\`src/routes/
├── blog/
│   ├── +page.svelte              → /blog
│   └── [slug]/
│       └── +page.svelte          → /blog/hello-world
│                                    (params.slug = "hello-world")
│
├── docs/
│   └── [...path]/
│       └── +page.svelte          → /docs
│                                  → /docs/getting-started
│                                  → /docs/api/v2/users
│                                    (params.path = "api/v2/users")
│
├── [[lang]]/
│   └── +page.svelte              → /        (params.lang = undefined)
│                                  → /en     (params.lang = "en")
│
└── users/
    └── [id=integer]/
        └── +page.svelte          → /users/42   ✓
                                   → /users/bob  → 404\`}</pre>
  </section>

  <section>
    <h2>Accessing Parameters</h2>
    <pre>{\`// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  // params.slug is typed as string
  const res = await fetch(\\\`/api/posts/\\\${params.slug}\\\`);
  if (!res.ok) throw new Error('Post not found');
  return { post: await res.json() };
};\`}</pre>
    <pre>{\`<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Two equivalent ways to read the slug
  // 1. From the load function's return value
  let title = $derived(data.post.title);

  // 2. Directly from page.params (reactive)
  let slug = $derived(page.params.slug);
</script>

<h1>{title}</h1>
<p>Current slug: {slug}</p>\`}</pre>
  </section>

  <section>
    <h2>Multiple Params in One Path</h2>
    <pre>{\`// You can nest dynamic segments freely:
// /shop/[category]/[productId]
// params = { category: "books", productId: "sapiens" }

// Or combine static + dynamic in one segment name:
// src/routes/posts/[year]-[month]/+page.svelte
//   /posts/2026-04 → params = { year: "2026", month: "04" }\`}</pre>
  </section>

  <section>
    <h2>Interactive Route Simulator</h2>
    <p>Pick a pattern and try different URLs to see which ones match:</p>

    <div class="pattern-picker">
      {#each ['[slug]', '[...rest]', '[[lang]]', '[id=integer]'] as p (p)}
        <button class:active={activePattern === p} onclick={() => presetUrl(p as Pattern)}>
          {p}
        </button>
      {/each}
    </div>

    <label class="url-input">
      Try URL:
      <input type="text" bind:value={typedUrl} />
    </label>

    <div class="result" class:ok={matchResult.matches} class:bad={!matchResult.matches}>
      <p><strong>{matchResult.matches ? 'MATCH' : 'NO MATCH'}</strong></p>
      {#if matchResult.matches}
        <p class="params-out">params = {JSON.stringify(matchResult.params)}</p>
      {:else}
        <p class="reason">{matchResult.reason}</p>
      {/if}
    </div>
  </section>

  <section>
    <h2>Static Demo: /blog/[slug]</h2>
    <p>Select a post (simulates navigating to /blog/[slug]):</p>
    <div class="post-links">
      {#each posts as post (post.slug)}
        <button
          class:active={simulatedSlug === post.slug}
          onclick={() => (simulatedSlug = post.slug)}
        >
          /blog/{post.slug}
        </button>
      {/each}
    </div>

    {#if currentPost}
      <div class="post">
        <p class="url">URL: /blog/<strong>{currentPost.slug}</strong></p>
        <p class="param">params.slug = "{currentPost.slug}"</p>
        <h3>{currentPost.title}</h3>
        <p class="date">{currentPost.date} · {currentPost.category}</p>
      </div>
    {/if}
  </section>

  <section>
    <h2>Param Matchers: Runtime Validation</h2>
    <p>
      A matcher is a tiny function that decides whether a captured segment is
      acceptable. Place it in <code>src/params/</code> and reference it from the
      folder name with <code>[id=matcher]</code> syntax. Returning false sends the
      request through to the next matching route — or a 404 if nothing matches.
    </p>
    <pre>{\`// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^\\d+$/.test(param);\`}</pre>
    <pre>{\`// src/params/uuid.ts
import type { ParamMatcher } from '@sveltejs/kit';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const match: ParamMatcher = (param) => UUID_RE.test(param);

// Then in src/routes/users/[id=uuid]/+page.svelte
// /users/550e8400-e29b-41d4-a716-446655440000  ✓
// /users/42                                    → 404\`}</pre>
  </section>

  <section>
    <h2>Type-Safe Params with $app/types (kit@2.55)</h2>
    <p>
      As of SvelteKit 2.55, params constrained by matchers are type-narrowed
      automatically. Import <code>RouteParams</code> to get fully typed params.
    </p>
    <pre>{\`// src/routes/blog/[slug]/+page.ts
import type { RouteParams } from '$app/types';
import type { PageLoad } from './$types';

// RouteParams<'/blog/[slug]'> resolves to { slug: string }
type BlogParams = RouteParams<'/blog/[slug]'>;

export const load: PageLoad = async ({ params }) => {
  // params.slug is typed as string — no casting needed
  const post: BlogParams = params;
  return { slug: post.slug };
};\`}</pre>
    <pre>{\`// With a matcher, the type is narrowed further.
// src/params/slug.ts:
import type { ParamMatcher } from '@sveltejs/kit';

export const match = ((param): param is \\\`\${string}-\${string}\\\` => {
  return /^[a-z]+(-[a-z]+)+$/.test(param);
}) satisfies ParamMatcher;

// src/routes/blog/[slug=slug]/+page.ts
// params.slug is now narrowed to \\\`\${string}-\${string}\\\`
// — enforced at compile time AND runtime.\`}</pre>
    <p class="note">
      Matchers do double duty: at runtime they decide whether a URL segment is
      valid (returning false sends a 404), and at build time SvelteKit uses them
      to narrow the TypeScript type of <code>params</code>.
    </p>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; padding: 1rem; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.78rem; }
  .pattern-picker { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }
  .pattern-picker button { font-family: monospace; padding: 0.4rem 0.75rem; border: 1px solid #ddd; border-radius: 4px; background: white; cursor: pointer; }
  .pattern-picker button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .url-input { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.75rem; }
  .url-input input { flex: 1; padding: 0.5rem; font-family: monospace; border: 1px solid #ccc; border-radius: 4px; }
  .result { padding: 0.75rem; border-radius: 4px; font-size: 0.9rem; }
  .result.ok { background: #e8f5e9; border: 1px solid #66bb6a; }
  .result.bad { background: #ffebee; border: 1px solid #ef5350; }
  .params-out { font-family: monospace; color: #2e7d32; }
  .reason { color: #c62828; font-size: 0.85rem; }
  .post-links { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
  .post-links button { text-align: left; padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; font-family: monospace; }
  .post-links button.active { background: #e3f2fd; border-color: #4a90d9; }
  .post { background: #f9f9f9; padding: 1rem; border-radius: 4px; }
  .url { font-family: monospace; color: #666; }
  .param { font-family: monospace; color: #4a90d9; font-weight: bold; }
  .date { color: #888; }
  .note {
    margin-top: 0.75rem;
    padding: 0.6rem 0.8rem;
    background: #fff7ed;
    border-left: 3px solid #f59e0b;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #78350f;
  }
  .note code { background: #fde68a; padding: 0.1rem 0.3rem; border-radius: 3px; }
  code { background: #fef3c7; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
