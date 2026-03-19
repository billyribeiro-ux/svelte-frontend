import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-7',
		title: 'Data Invalidation Patterns',
		phase: 5,
		module: 17,
		lessonIndex: 7
	},
	description: `SvelteKit's data loading system lets you precisely control when data is refetched using invalidation. Load functions can declare dependencies with depends('app:key'), and you invalidate specific keys with invalidate('app:key') to re-run only the load functions that depend on that key.

invalidateAll() re-runs every load function on the current page. For cross-route invalidation, URL-based dependencies with depends(url) let you invalidate data from any route. These patterns ensure your app shows fresh data without unnecessary refetching, keeping the UI responsive and efficient.`,
	objectives: [
		'Declare load function dependencies with depends() for targeted invalidation',
		'Trigger selective data refetching with invalidate() and custom keys',
		'Use invalidateAll() to refresh all page data at once',
		'Implement cross-route invalidation for shared data dependencies'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Simulating SvelteKit's invalidation system

  interface LoadFunction {
    name: string;
    dependencies: string[];
    lastRun: string | null;
    data: string;
    runCount: number;
  }

  let loadFunctions: LoadFunction[] = $state([
    {
      name: 'Layout load (root)',
      dependencies: ['app:user', 'app:notifications'],
      lastRun: null, data: 'User: Alice | Notifications: 3', runCount: 0,
    },
    {
      name: 'Page load (dashboard)',
      dependencies: ['app:dashboard', 'app:user'],
      lastRun: null, data: 'Dashboard stats loaded', runCount: 0,
    },
    {
      name: 'Page load (posts)',
      dependencies: ['app:posts', '/api/posts'],
      lastRun: null, data: 'Posts: 15 items', runCount: 0,
    },
    {
      name: 'Page load (comments)',
      dependencies: ['app:comments', 'app:posts'],
      lastRun: null, data: 'Comments: 42 items', runCount: 0,
    },
  ]);

  let invalidationLog: string[] = $state([]);

  function runLoad(fn: LoadFunction): LoadFunction {
    return {
      ...fn,
      lastRun: new Date().toLocaleTimeString(),
      runCount: fn.runCount + 1,
      data: \`\${fn.data.split(' |')[0]} (refreshed #\${fn.runCount + 1})\`,
    };
  }

  // Simulate invalidate(key)
  function invalidate(key: string): void {
    const affected: string[] = [];
    loadFunctions = loadFunctions.map((fn) => {
      if (fn.dependencies.includes(key)) {
        affected.push(fn.name);
        return runLoad(fn);
      }
      return fn;
    });
    invalidationLog = [
      \`invalidate('\${key}') -> re-ran: \${affected.join(', ') || 'none'}\`,
      ...invalidationLog,
    ].slice(0, 8);
  }

  // Simulate invalidateAll()
  function invalidateAll(): void {
    loadFunctions = loadFunctions.map(runLoad);
    invalidationLog = [
      \`invalidateAll() -> re-ran all \${loadFunctions.length} load functions\`,
      ...invalidationLog,
    ].slice(0, 8);
  }

  // Initial run
  function initializeData(): void {
    loadFunctions = loadFunctions.map(runLoad);
    invalidationLog = ['Initial page load — all load functions executed', ...invalidationLog];
  }

  // Run on mount
  $effect(() => {
    initializeData();
  });

  const availableKeys = ['app:user', 'app:notifications', 'app:dashboard', 'app:posts', 'app:comments', '/api/posts'];
</script>

<h1>Data Invalidation Patterns</h1>

<section>
  <h2>Load Functions & Dependencies</h2>
  <div class="load-functions">
    {#each loadFunctions as fn}
      <div class="load-card">
        <h3>{fn.name}</h3>
        <div class="deps">
          {#each fn.dependencies as dep}
            <span class="dep-tag">{dep}</span>
          {/each}
        </div>
        <div class="load-info">
          <span>Runs: {fn.runCount}</span>
          {#if fn.lastRun}
            <span>Last: {fn.lastRun}</span>
          {/if}
        </div>
        <p class="load-data">{fn.data}</p>
      </div>
    {/each}
  </div>
</section>

<section>
  <h2>invalidate(key) — Selective Refetch</h2>
  <p>Click a key to re-run only the load functions that depend on it:</p>
  <div class="key-buttons">
    {#each availableKeys as key}
      <button onclick={() => invalidate(key)}>{key}</button>
    {/each}
  </div>

  <pre class="code"><code>// In +page.ts load function
export async function load(&#123; depends &#125;) &#123;
  depends('app:posts');  // Register dependency

  const posts = await fetchPosts();
  return &#123; posts &#125;;
&#125;

// Anywhere in client code
import &#123; invalidate &#125; from '$app/navigation';
await invalidate('app:posts');  // Re-runs this load</code></pre>
</section>

<section>
  <h2>invalidateAll() — Refresh Everything</h2>
  <button onclick={invalidateAll}>invalidateAll()</button>
  <p class="hint">Re-runs every load function on the page, regardless of dependencies.</p>
</section>

<section>
  <h2>Invalidation Log</h2>
  <div class="log">
    {#each invalidationLog as entry}
      <div class="log-entry">{entry}</div>
    {/each}
    {#if invalidationLog.length === 0}
      <p class="empty">No invalidations yet.</p>
    {/if}
  </div>
</section>

<section>
  <h2>Common Patterns</h2>
  <div class="patterns">
    <div class="pattern">
      <h3>After form submission</h3>
      <code>await invalidate('app:posts');</code>
    </div>
    <div class="pattern">
      <h3>Polling for updates</h3>
      <code>setInterval(() => invalidate('app:notifications'), 30000);</code>
    </div>
    <div class="pattern">
      <h3>After user action</h3>
      <code>await deletePost(id); await invalidate('app:posts');</code>
    </div>
    <div class="pattern">
      <h3>URL-based dependency</h3>
      <code>depends('/api/posts'); // invalidate('/api/posts')</code>
    </div>
  </div>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #0984e3; font-size: 1.1rem; }
  h3 { margin: 0 0 0.25rem; font-size: 0.95rem; }
  .load-functions { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .load-card {
    padding: 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .deps { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
  .dep-tag {
    padding: 0.15rem 0.4rem; background: #74b9ff; color: white;
    border-radius: 8px; font-size: 0.7rem; font-family: monospace;
  }
  .load-info { display: flex; gap: 1rem; font-size: 0.75rem; color: #636e72; }
  .load-data {
    font-family: monospace; font-size: 0.8rem; color: #2d3436;
    margin: 0.4rem 0 0; padding: 0.3rem; background: #f0f0f0;
    border-radius: 3px;
  }
  .key-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #0984e3; color: white; cursor: pointer; font-weight: 600;
    font-size: 0.85rem;
  }
  button:hover { opacity: 0.9; }
  .log { max-height: 200px; overflow-y: auto; }
  .log-entry {
    font-family: monospace; font-size: 0.8rem; padding: 0.3rem 0.5rem;
    border-bottom: 1px solid #eee; color: #636e72;
  }
  .empty { color: #b2bec3; }
  .hint { font-size: 0.85rem; color: #636e72; margin-top: 0.5rem; }
  .patterns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
  .pattern {
    padding: 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .pattern h3 { font-size: 0.85rem; color: #636e72; }
  .pattern code { font-size: 0.8rem; color: #0984e3; }
  .code, pre { background: #2d3436; padding: 0.75rem; border-radius: 6px; overflow-x: auto; margin: 0; }
  code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
