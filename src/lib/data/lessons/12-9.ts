import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-9',
		title: 'Streaming, {#await} & Parallel Loading',
		phase: 4,
		module: 12,
		lessonIndex: 9
	},
	description: `Not all data is equally important. The user's name and navigation should appear instantly; the "related products" panel can take its time. SvelteKit's streaming feature lets you return some fields awaited (part of the initial HTML) and others as unawaited Promises that stream in as they resolve.

On the page side, Svelte's {#await} block handles all three states — pending, then, and catch — in one readable chunk of markup. Together they turn a blank 2-second page wait into an instant shell plus progressively-filling widgets.

This lesson covers {#await} in detail and shows how to wire it to streamed load data for a fast, resilient user experience.`,
	objectives: [
		'Render promise states with {#await}/{:then}/{:catch}',
		'Use the {#await expr then value} short form when you do not need a pending state',
		'Return unawaited Promises from a load function to stream them',
		'Display a skeleton shell immediately and fill widgets as data arrives',
		'Handle streamed errors gracefully without crashing the page'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // {#await} — Svelte's built-in Promise renderer
  //
  //   {#await promise}
  //     <p>loading...</p>
  //   {:then value}
  //     <p>got {value}</p>
  //   {:catch err}
  //     <p class="error">{err.message}</p>
  //   {/await}
  //
  // Short form when you don't need a pending state:
  //   {#await promise then value}
  //     <p>got {value}</p>
  //   {/await}
  //
  // The block subscribes reactively — reassigning \`promise\` swaps
  // to a new one and the block re-renders from scratch.
  // ---------------------------------------------------------------

  function wait<T>(ms: number, value: T, shouldFail: boolean = false): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) reject(new Error('Simulated failure'));
        else resolve(value);
      }, ms);
    });
  }

  // Demo 1 — simple pending/then/catch
  let simple: Promise<string> = $state(wait(1000, 'Hello!'));
  function reloadSimple(): void {
    simple = wait(1000, 'Hello @ ' + new Date().toLocaleTimeString());
  }
  function failSimple(): void {
    simple = wait(800, '', true);
  }

  // Demo 2 — simulated load() data with streaming
  //
  // In a real +page.server.ts you'd do:
  //
  //   export const load = async () => {
  //     const user = await db.user.find(...);   // awaited — in SSR HTML
  //     return {
  //       user,
  //       stats: db.stats.compute(user.id),     // NOT awaited — streamed
  //       feed:  db.feed.fetch(user.id)         //  streamed
  //     };
  //   };
  //
  // The page gets: { user: {...}, stats: Promise, feed: Promise }
  // and can render user immediately while {#await} handles the rest.

  interface LoadedShape {
    user: { name: string };
    stats: Promise<{ posts: number; followers: number }>;
    feed: Promise<{ id: number; title: string }[]>;
    related: Promise<{ id: number; name: string }[]>;
  }

  function freshLoad(): LoadedShape {
    return {
      user: { name: 'Ada Lovelace' }, // fast — already resolved
      stats: wait(900, { posts: 42, followers: 1337 }),
      feed: wait(1500, [
        { id: 1, title: 'First note' },
        { id: 2, title: 'Second note' },
        { id: 3, title: 'Third note' }
      ]),
      related: wait(2200, [], false) // slowest
    };
  }

  // Wrap in an object so we can reassign atomically.
  let data: LoadedShape = $state(freshLoad());

  function reloadAll(): void {
    data = freshLoad();
  }

  function reloadWithFailure(): void {
    data = {
      user: { name: 'Ada Lovelace' },
      stats: wait(900, { posts: 42, followers: 1337 }),
      feed: wait(1500, [], true), // this one errors
      related: wait(2200, [{ id: 99, name: 'Related A' }])
    };
  }
</script>

<main>
  <h1>Streaming, {'{#await}'} & Parallel Loading</h1>

  <section>
    <h2>1. The {'{#await}'} Block</h2>
    <div class="button-row">
      <button onclick={reloadSimple}>Reload (success)</button>
      <button onclick={failSimple}>Reload (fail)</button>
    </div>

    <div class="demo">
      {#await simple}
        <p class="pending">Loading...</p>
      {:then value}
        <p class="ok">Got: {value}</p>
      {:catch err}
        <p class="error">Error: {err.message}</p>
      {/await}
    </div>

    <pre>{\`{#await promise}
  <p>Loading...</p>
{:then value}
  <p>Got: {value}</p>
{:catch err}
  <p class="error">Error: {err.message}</p>
{/await}\`}</pre>
  </section>

  <section>
    <h2>2. Short Form — no pending branch</h2>
    <p class="hint">
      When you're fine showing nothing until it resolves (e.g. streaming with an
      outer skeleton), you can drop the pending branch.
    </p>
    <pre>{\`{#await promise then value}
  <li>{value.name}</li>
{/await}

{#await promise catch err}
  <p class="error">{err.message}</p>
{/await}\`}</pre>
  </section>

  <section>
    <h2>3. Streaming: Fast Shell + Slow Widgets</h2>
    <p class="hint">
      The user's name renders instantly. Stats, feed, and related each stream in
      independently — one failing doesn't block the others.
    </p>
    <div class="button-row">
      <button onclick={reloadAll}>Reload (all succeed)</button>
      <button onclick={reloadWithFailure}>Reload (feed fails)</button>
    </div>

    <div class="page-shell">
      <header>
        <h3>Welcome, {data.user.name}</h3>
        <span class="badge">rendered instantly</span>
      </header>

      <div class="widgets">
        <div class="widget">
          <h4>Stats</h4>
          {#await data.stats}
            <div class="skeleton">loading stats...</div>
          {:then s}
            <p>{s.posts} posts · {s.followers} followers</p>
          {:catch err}
            <p class="error">Stats failed: {err.message}</p>
          {/await}
        </div>

        <div class="widget">
          <h4>Feed</h4>
          {#await data.feed}
            <div class="skeleton">loading feed...</div>
          {:then items}
            <ul>
              {#each items as item (item.id)}
                <li>{item.title}</li>
              {/each}
            </ul>
          {:catch err}
            <p class="error">Feed failed: {err.message}</p>
          {/await}
        </div>

        <div class="widget">
          <h4>Related</h4>
          {#await data.related}
            <div class="skeleton">loading related...</div>
          {:then items}
            {#if items.length === 0}
              <p class="muted">No related items.</p>
            {:else}
              <ul>
                {#each items as item (item.id)}
                  <li>{item.name}</li>
                {/each}
              </ul>
            {/if}
          {:catch err}
            <p class="error">Related failed: {err.message}</p>
          {/await}
        </div>
      </div>
    </div>
  </section>

  <section>
    <h2>4. Wiring It to a Real Load Function</h2>
    <pre>{\`// src/routes/feed/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
  // Await the critical data — it blocks the initial HTML.
  const user = await db.user.find(locals.userId);

  // DO NOT await the rest — return the promises directly.
  // SvelteKit will stream them to the client as they resolve.
  return {
    user,
    stats: db.stats.compute(user.id),
    feed:  db.feed.fetch(user.id),
    related: db.recommend(user.id)
  };
};\`}</pre>
    <pre>{\`<!-- src/routes/feed/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</\${''}script>

<h1>Welcome, {data.user.name}</h1>

{#await data.stats}
  <div class="skeleton" />
{:then stats}
  <p>{stats.posts} posts</p>
{:catch err}
  <p class="error">{err.message}</p>
{/await}\`}</pre>
  </section>

  <section>
    <h2>When to Stream vs await</h2>
    <table>
      <thead>
        <tr><th>Characteristic</th><th>await it</th><th>stream it</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Critical for first paint</td>
          <td>yes</td>
          <td>no</td>
        </tr>
        <tr>
          <td>Critical for SEO</td>
          <td>yes</td>
          <td>no (stream chunks may miss some crawlers)</td>
        </tr>
        <tr>
          <td>Slow query (&gt; 500ms)</td>
          <td>no — blocks TTFB</td>
          <td>yes</td>
        </tr>
        <tr>
          <td>May fail without blocking the page</td>
          <td>no — would throw 500</td>
          <td>yes — {'{:catch}'} handles it locally</td>
        </tr>
      </tbody>
    </table>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  h2 { margin-top: 0; }
  .hint { color: #555; font-size: 0.9rem; margin: 0 0 0.75rem; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .button-row { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
  .demo { padding: 1rem; background: #fafafa; border-radius: 4px; margin-bottom: 0.75rem; }
  .pending { color: #1565c0; font-style: italic; }
  .ok { color: #2e7d32; }
  .error { color: #c62828; }
  .page-shell { border: 1px solid #ccc; border-radius: 6px; background: white; overflow: hidden; }
  .page-shell header { padding: 0.75rem 1rem; background: #1565c0; color: white; display: flex; align-items: center; gap: 0.75rem; }
  .page-shell header h3 { margin: 0; font-size: 1rem; }
  .badge { font-size: 0.7rem; background: rgba(255,255,255,0.25); padding: 0.15rem 0.4rem; border-radius: 10px; }
  .widgets { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; padding: 0.75rem; }
  .widget { border: 1px solid #eee; border-radius: 4px; padding: 0.6rem; background: #fafafa; font-size: 0.85rem; }
  .widget h4 { margin: 0 0 0.35rem; font-size: 0.8rem; text-transform: uppercase; color: #666; }
  .widget ul { margin: 0; padding-left: 1rem; }
  .skeleton { height: 2rem; background: linear-gradient(90deg, #eee 0%, #ddd 50%, #eee 100%); border-radius: 3px; color: #999; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; }
  .muted { color: #999; font-style: italic; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
  th { background: #f5f5f5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
