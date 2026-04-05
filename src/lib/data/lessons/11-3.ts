import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-3',
		title: 'Dynamic Routes & Params',
		phase: 3,
		module: 11,
		lessonIndex: 3
	},
	description: `Dynamic routes let a single page component handle multiple URLs. Wrapping a folder name in brackets — like [slug] — creates a parameter that captures that part of the URL. SvelteKit passes these parameters to your load function and makes them available via the page state.

You can also use rest parameters ([...rest]) to match multiple segments and optional parameters ([[optional]]) for flexible URL patterns. Matchers (e.g. [id=integer]) constrain what strings are allowed.

As of kit@2.55, params constrained by matchers are type-narrowed automatically in $app/types. Import RouteParams<'/blog/[slug]'> and LayoutParams to get fully typed params in load functions and components — no manual type assertions needed.`,
	objectives: [
		'Create dynamic routes with [param] folder naming',
		'Access route parameters in load functions and page components',
		'Use rest parameters [...rest] to match multiple URL segments',
		'Understand optional parameters with [[optional]] syntax',
		'Use RouteParams and matchers for type-safe params (kit@2.55)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Dynamic routes use brackets in folder names
  // [slug] captures a single URL segment
  // [...rest] captures remaining segments
  // [[optional]] is an optional segment

  let simulatedSlug: string = $state('hello-world');

  interface PostMeta {
    slug: string;
    title: string;
    date: string;
  }

  const posts: PostMeta[] = [
    { slug: 'hello-world', title: 'Hello World', date: '2026-01-15' },
    { slug: 'svelte-5-runes', title: 'Svelte 5 Runes Deep Dive', date: '2026-02-20' },
    { slug: 'sveltekit-routing', title: 'SvelteKit Routing Guide', date: '2026-03-10' }
  ];

  let currentPost = $derived(
    posts.find((p) => p.slug === simulatedSlug) ?? null
  );
</script>

<main>
  <h1>Dynamic Routes & Params</h1>

  <section>
    <h2>Route Patterns</h2>
    <pre>{\`src/routes/
├── blog/
│   ├── +page.svelte          → /blog
│   └── [slug]/
│       └── +page.svelte      → /blog/hello-world
│                              → /blog/any-slug-here
├── docs/
│   └── [...path]/
│       └── +page.svelte      → /docs/getting-started
│                              → /docs/api/reference/v2
└── [[lang]]/
    └── +page.svelte          → /        (lang = undefined)
                               → /en     (lang = "en")
                               → /fr     (lang = "fr")\`}</pre>
  </section>

  <section>
    <h2>Accessing Parameters</h2>
    <pre>{\`<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  // In +page.js load function:
  export function load({ params }) {
    // params.slug = "hello-world"
    return { slug: params.slug };
  }

  // In the page component via $app/state:
  import { page } from '$app/state';
  // page.params.slug = "hello-world"
</script>

<h1>Post: {page.params.slug}</h1>\`}</pre>
  </section>

  <section>
    <h2>Simulated Dynamic Route</h2>
    <p>Select a post (simulates navigating to /blog/[slug]):</p>
    <div class="post-links">
      {#each posts as post}
        <button
          class:active={simulatedSlug === post.slug}
          onclick={() => simulatedSlug = post.slug}
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
        <p class="date">{currentPost.date}</p>
      </div>
    {/if}
  </section>

  <section>
    <h2>Rest & Optional Parameters</h2>
    <pre>{\`// [...path] captures multiple segments as a string
// /docs/api/v2/users → params.path = "api/v2/users"

// [[lang]] is optional — matches with or without
// /        → params.lang = undefined
// /en      → params.lang = "en"

// Param matcher — constrains [id] to integers only
// src/params/integer.ts:
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\\d+$/.test(param);
};\`}</pre>
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
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
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
