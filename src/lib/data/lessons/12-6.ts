import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-6',
		title: 'Universal Load (+page.js)',
		phase: 4,
		module: 12,
		lessonIndex: 6
	},
	description: `SvelteKit's load functions run before a page renders, providing data that the page component receives as props. Universal load functions (+page.js or +page.ts) run on both the server during SSR and in the browser during client-side navigation. They receive a context object with params, fetch, url, and more.

Best practice: the data prop from $props() is already a plain object — if you need to derive reactive state from it inside the component, prefer a $derived over copying into $state. When you must copy (e.g. to hold editable form drafts), prefer $state.raw for anything reassigned wholesale.

This lesson covers writing load functions, returning data, and consuming it in page components with the data prop.`,
	objectives: [
		'Write a universal load function in +page.ts',
		'Access params, fetch, url, route and parent from the load context',
		'Declare dependencies with depends() for targeted invalidation',
		'Return data from load and receive it in the page via $props()',
		'Understand that universal load runs on both server and client',
		'Use $derived over copying data into $state in the receiving component',
		'Return deferred promises (streaming) alongside awaited data'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // SvelteKit's load function provides data before rendering
  // This demo shows the pattern conceptually

  // This lesson simulates the SvelteKit load flow since a single
  // playground file can't host real routes. The code examples show
  // exactly what you'd write in a real +page.ts.

  type Example = 'basic' | 'params' | 'fetch' | 'types' | 'derived' | 'depends' | 'streaming';
  let selectedExample: Example = $state('basic');

  const examples: Example[] = ['basic', 'params', 'fetch', 'types', 'derived', 'depends', 'streaming'];

  // Simulated "data prop" from a load function to demonstrate the
  // $derived-over-$state pattern in the receiving component.
  interface LoadedData {
    user: { id: number; firstName: string; lastName: string };
    posts: { id: number; title: string }[];
  }
  const fakeData: LoadedData = {
    user: { id: 1, firstName: 'Ada', lastName: 'Lovelace' },
    posts: [
      { id: 1, title: 'Note on analytical engine' },
      { id: 2, title: 'First algorithm' }
    ]
  };
  // In a real page you'd have: let { data } = $props();
  // Here we just alias fakeData to data for illustration.
  const data = fakeData;

  // BEST PRACTICE: derive from data, don't copy into $state.
  // The load prop is already plain — $derived stays in sync
  // with navigations. Copying into $state freezes it to the
  // first snapshot and silently breaks reactivity on re-load.
  const fullName = $derived(data.user.firstName + ' ' + data.user.lastName);
  const postCount = $derived(data.posts.length);
</script>

<main>
  <h1>Universal Load (+page.js)</h1>

  <nav>
    {#each examples as example (example)}
      <button
        class:active={selectedExample === example}
        onclick={() => (selectedExample = example)}
      >
        {example}
      </button>
    {/each}
  </nav>

  {#if selectedExample === 'basic'}
    <section>
      <h2>Basic Load Function</h2>
      <pre>{\`// src/routes/+page.ts
export function load() {
  return {
    title: 'Welcome',
    message: 'Hello from load!'
  };
}

// src/routes/+page.svelte
<script lang="ts">
  let { data } = $props();
  // data.title = 'Welcome'
  // data.message = 'Hello from load!'
</script>

<h1>{data.title}</h1>
<p>{data.message}</p>\`}</pre>
      <div class="demo-box">
        <p><strong>Key point:</strong> The load function runs <em>before</em> the page renders. The returned object becomes the page's <code>data</code> prop.</p>
      </div>
    </section>

  {:else if selectedExample === 'params'}
    <section>
      <h2>Using Route Parameters</h2>
      <pre>{\`// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
  // params.slug comes from the URL
  // e.g., /blog/hello-world → params.slug = 'hello-world'

  return {
    slug: params.slug,
    title: formatTitle(params.slug)
  };
};

function formatTitle(slug: string): string {
  return slug
    .split('-')
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

// src/routes/blog/[slug]/+page.svelte
<script lang="ts">
  let { data } = $props();
</script>
<h1>{data.title}</h1>\`}</pre>
    </section>

  {:else if selectedExample === 'fetch'}
    <section>
      <h2>Fetching Data in Load</h2>
      <pre>{\`// src/routes/posts/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // Use the provided fetch — not global fetch!
  // It handles cookies, relative URLs, and SSR correctly
  const response = await fetch('/api/posts');

  if (!response.ok) {
    throw new Error('Failed to load posts');
  }

  const posts = await response.json();

  return { posts };
};

// src/routes/posts/+page.svelte
<script lang="ts">
  interface Post {
    id: number;
    title: string;
  }
  let { data }: { data: { posts: Post[] } } = $props();
</script>

{#each data.posts as post}
  <article>
    <h2>{post.title}</h2>
  </article>
{/each}\`}</pre>
      <div class="demo-box">
        <p><strong>Important:</strong> Always use the <code>fetch</code> from the load context, not the global <code>fetch</code>. SvelteKit's version handles relative URLs, cookies, and server-side requests correctly.</p>
      </div>
    </section>

  {:else if selectedExample === 'derived'}
    <section>
      <h2>Best Practice: $derived over $state</h2>
      <p>
        The <code>data</code> prop from <code>$props()</code> is already a plain,
        reactive object — SvelteKit re-invokes load on navigation and pushes a fresh
        snapshot into the prop. So the rule is: <strong>derive from data, don't copy</strong>.
      </p>
      <pre>{\`// ✅ Good — $derived stays in sync with every navigation
<script lang="ts">
  let { data } = $props();
  const fullName = $derived(data.user.firstName + ' ' + data.user.lastName);
  const isAdmin  = $derived(data.user.roles.includes('admin'));
</\${''}script>

// ❌ Bad — freezes to the first snapshot; breaks on re-navigation
<script lang="ts">
  let { data } = $props();
  let fullName = $state(data.user.firstName + ' ' + data.user.lastName);
  // fullName NEVER updates when data changes!
</\${''}script>

// 🟡 Sometimes — $state.raw for an EDITABLE local copy
<script lang="ts">
  let { data } = $props();
  // A draft the user can modify, reset from data on demand
  let draft = $state.raw({ ...data.user });
  function reset() { draft = { ...data.user }; }
</\${''}script>\`}</pre>

      <div class="demo-box">
        <p><strong>Live example from this playground:</strong></p>
        <ul>
          <li><code>data.user</code> = {data.user.firstName} {data.user.lastName}</li>
          <li><code>fullName</code> ($derived) = {fullName}</li>
          <li><code>postCount</code> ($derived) = {postCount}</li>
        </ul>
      </div>
    </section>

  {:else if selectedExample === 'depends'}
    <section>
      <h2>depends() & Targeted Invalidation</h2>
      <p>
        By default, SvelteKit only re-runs a load function when its URL/params change
        or when you call <code>invalidateAll()</code>. For finer control, declare a
        dependency with <code>depends('tag')</code> and invalidate that tag specifically.
      </p>
      <pre>{\`// src/routes/todos/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, depends }) => {
  // Register a custom dependency — any string prefixed
  // with 'app:' is convention but not required.
  depends('app:todos');

  const res = await fetch('/api/todos');
  return { todos: await res.json() };
};

// Elsewhere, after a mutation:
import { invalidate } from '$app/navigation';
await fetch('/api/todos', { method: 'POST', body: JSON.stringify(newTodo) });
await invalidate('app:todos');  // re-runs ONLY loads that depend on this tag

// Built-in dependencies: every load automatically depends on its
// URL, so invalidate('/api/todos') also works if that URL is fetched.\`}</pre>
    </section>

  {:else if selectedExample === 'streaming'}
    <section>
      <h2>Streaming with Deferred Promises</h2>
      <p>
        You can <strong>return a Promise</strong> directly from load (not awaited).
        SvelteKit renders the page immediately with the awaited fields and streams the
        unawaited promises down as they resolve. Pair with <code>{'{#await}'}</code> in the page.
      </p>
      <pre>{\`// src/routes/feed/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  // Fast: await the critical data
  const user = await fetch('/api/me').then(r => r.json());

  // Slow: DON'T await — return the Promise itself
  return {
    user,
    stats: fetch('/api/slow-stats').then(r => r.json()),  // streamed
    feed:  fetch('/api/slow-feed').then(r => r.json())    // streamed
  };
};\`}</pre>
      <pre>{\`<!-- src/routes/feed/+page.svelte -->
<script lang="ts">
  let { data } = $props();
</\${''}script>

<h1>Welcome, {data.user.name}</h1>

{#await data.stats}
  <p>Loading stats...</p>
{:then stats}
  <p>Posts: {stats.posts}, Followers: {stats.followers}</p>
{:catch err}
  <p class="error">Stats failed: {err.message}</p>
{/await}

{#await data.feed then feed}
  <ul>{#each feed as item (item.id)}<li>{item.title}</li>{/each}</ul>
{/await}\`}</pre>
      <div class="demo-box">
        <p><strong>Rule:</strong> the awaited fields are sent with the initial HTML (and block SSR).
          Unawaited promises stream in later. Use this to keep TTFB fast when one slow query
          shouldn't hold up the rest of the page.</p>
      </div>
    </section>

  {:else if selectedExample === 'types'}
    <section>
      <h2>Type Safety with PageLoad</h2>
      <pre>{\`// src/routes/users/[id]/+page.ts
import type { PageLoad } from './$types';
// $types is auto-generated by SvelteKit!

interface User {
  id: number;
  name: string;
  email: string;
}

export const load: PageLoad = async ({ params, fetch }) => {
  const res = await fetch('/api/users/' + params.id);

  if (!res.ok) {
    // Throwing an error renders +error.svelte
    throw error(404, 'User not found');
  }

  const user: User = await res.json();

  return { user };
};

// The page automatically gets typed data:
// src/routes/users/[id]/+page.svelte
<script lang="ts">
  // TypeScript knows data.user exists and its shape
  let { data } = $props();
</script>

<h1>{data.user.name}</h1>
<p>{data.user.email}</p>\`}</pre>
    </section>
  {/if}

  <section>
    <h2>Load Context Properties</h2>
    <table>
      <thead><tr><th>Property</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><code>params</code></td><td>Route parameters from the URL</td></tr>
        <tr><td><code>fetch</code></td><td>Enhanced fetch for making requests</td></tr>
        <tr><td><code>url</code></td><td>The current URL object</td></tr>
        <tr><td><code>route</code></td><td>The current route info</td></tr>
        <tr><td><code>depends</code></td><td>Declare dependencies for invalidation</td></tr>
        <tr><td><code>parent</code></td><td>Get data from parent layout's load</td></tr>
      </tbody>
    </table>
  </section>
</main>

<style>
  main { max-width: 650px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  nav button { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; }
  nav button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .demo-box { background: #fff3e0; padding: 0.75rem 1rem; border-radius: 4px; border-left: 3px solid #ff9800; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
  th { background: #f5f5f5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
