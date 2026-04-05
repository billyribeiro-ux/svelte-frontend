import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-7',
		title: 'Data Invalidation Patterns',
		phase: 5,
		module: 17,
		lessonIndex: 7
	},
	description: `SvelteKit load functions are cached by the framework — they re-run only when the URL, params, or a tracked dependency changes. Invalidation is how you tell SvelteKit that something has changed and that specific load functions should re-run. Done right, it makes your app feel instant while staying consistent.

The three knobs:
1) depends(key) inside a load function declares that it depends on a user-defined key (e.g. 'app:cart'). Calling invalidate('app:cart') re-runs every load that depends on that key. Keys can also be URLs — depends('/api/cart') auto-registers for fetch() calls to that path.
2) invalidate(urlOrKey) re-runs matching loads on the current page without a full navigation.
3) invalidateAll() re-runs every load on the current page (the big hammer).

SvelteKit 2 adds refreshAll() which broadcasts an invalidation across browser tabs via BroadcastChannel — great for cross-tab consistency after a mutation. This lesson shows how to wire all three into a typical CRUD workflow.

The end of the lesson lists 4-6 common pitfalls and pro tips to help you avoid the traps students most often hit.`,
	objectives: [
		'Declare a dependency key with depends() in load functions',
		'Invalidate a single key with invalidate()',
		"Fall back to invalidateAll() when you don't know which load to refresh",
		'Use refreshAll() for cross-tab synchronization in SvelteKit 2',
		'Combine invalidation with form actions for optimistic + authoritative updates'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Simulated load functions with dependency keys.
  // Each "page" has one or more loads registered under a key.
  // Mutations call invalidate(key) to trigger a re-run.

  type LoadFn = {
    id: string;
    key: string;
    label: string;
    data: string;
    runs: number;
  };

  type LogEntry = {
    id: number;
    kind: 'invalidate' | 'load' | 'mutation';
    text: string;
  };

  let loads: LoadFn[] = $state([
    { id: 'l1', key: 'app:cart',     label: '/cart        load()',      data: '3 items',        runs: 1 },
    { id: 'l2', key: 'app:cart',     label: '/header      load()',      data: 'Cart (3)',       runs: 1 },
    { id: 'l3', key: 'app:user',     label: '/account     load()',      data: 'alice@x.com',    runs: 1 },
    { id: 'l4', key: 'app:posts',    label: '/blog        load()',      data: '12 posts',       runs: 1 },
    { id: 'l5', key: 'app:posts',    label: '/sidebar     load()',      data: 'Latest: Hi',     runs: 1 },
    { id: 'l6', key: '/api/stats',   label: '/dashboard   load()',      data: '98% uptime',     runs: 1 }
  ]);

  let log: LogEntry[] = $state([]);
  let logId: number = $state(0);

  function addLog(kind: LogEntry['kind'], text: string): void {
    log = [{ id: logId++, kind, text }, ...log].slice(0, 15);
  }

  function invalidate(key: string): void {
    addLog('invalidate', \`invalidate('\${key}')\`);
    loads = loads.map((l) => {
      if (l.key === key) {
        addLog('load', \`re-run: \${l.label}\`);
        return { ...l, runs: l.runs + 1, data: mutateData(l) };
      }
      return l;
    });
  }

  function invalidateAll(): void {
    addLog('invalidate', 'invalidateAll()');
    loads = loads.map((l) => {
      addLog('load', \`re-run: \${l.label}\`);
      return { ...l, runs: l.runs + 1, data: mutateData(l) };
    });
  }

  function refreshAll(): void {
    addLog('invalidate', 'refreshAll() — broadcast to all tabs');
    invalidateAll();
  }

  function mutateData(load: LoadFn): string {
    // Simulate each re-run pulling fresh data
    if (load.key === 'app:cart') return \`\${Math.floor(Math.random() * 10)} items\`;
    if (load.key === 'app:posts') return \`\${12 + Math.floor(Math.random() * 5)} posts\`;
    if (load.key === 'app:user') return ['alice@x.com', 'bob@y.com', 'carol@z.com'][Math.floor(Math.random() * 3)];
    if (load.key === '/api/stats') return \`\${90 + Math.floor(Math.random() * 10)}% uptime\`;
    return load.data;
  }

  // Simulated mutations that trigger invalidations
  function addToCart(): void {
    addLog('mutation', 'POST /cart — item added');
    invalidate('app:cart');
  }
  function updateProfile(): void {
    addLog('mutation', 'PATCH /account — profile updated');
    invalidate('app:user');
  }
  function publishPost(): void {
    addLog('mutation', 'POST /posts — new post');
    invalidate('app:posts');
  }
  function globalReset(): void {
    addLog('mutation', 'admin reset — unknown scope');
    invalidateAll();
  }

  let showCode: 'depends' | 'invalidate' | 'actions' | 'refresh' = $state('depends');

  const examples: Record<string, string> = {
    depends: \`// +page.server.ts — declare a dependency key
export const load = async ({ fetch, depends }) => {
  // Key form: 'namespace:name' or an absolute URL.
  // Calling invalidate('app:posts') will re-run this load.
  depends('app:posts');

  const posts = await (await fetch('/api/posts')).json();
  return { posts };
};

// You can depend on multiple keys
depends('app:posts', 'app:user');

// fetch() URLs are auto-registered as dependency keys
// so invalidate('/api/posts') also re-runs this load
// even without the explicit depends() call.\`,

    invalidate: \`// In any component (doesn't need to be a page)
import { invalidate, invalidateAll } from '$app/navigation';

async function addItem(product: Product) {
  await fetch('/api/cart', {
    method: 'POST',
    body: JSON.stringify(product)
  });

  // Re-run every load that depends on 'app:cart'
  // This updates the header cart count, the /cart page,
  // and anything else that depends on this key —
  // without a full page navigation.
  await invalidate('app:cart');
}

// Invalidate multiple keys at once
await Promise.all([
  invalidate('app:cart'),
  invalidate('app:recommendations')
]);

// Function form for fine-grained control
await invalidate((url) => url.pathname.startsWith('/api/products'));

// Nothing to invalidate by key? Use the big hammer.
await invalidateAll();\`,

    actions: \`// +page.server.ts — form actions auto-invalidate
export const actions = {
  addToCart: async ({ request, fetch, locals }) => {
    const formData = await request.formData();
    await db.cart.add(locals.user.id, formData.get('productId'));

    // After a form action, SvelteKit automatically calls
    // invalidateAll() on the current page by default.
    // Return any data you want back as \\\`form\\\` prop.
    return { success: true };
  }
};

// +page.svelte
<form method="POST" action="?/addToCart" use:enhance>
  <input name="productId" value={product.id} />
  <button>Add to cart</button>
</form>

// use:enhance automatically:
// 1. Submits without page refresh
// 2. Runs the action
// 3. Invalidates the page
// 4. Passes the result back as \\\`form\\\`\`,

    refresh: \`// refreshAll() — SvelteKit 2 cross-tab sync
import { refreshAll } from '$app/navigation';

// When the user mutates data in one tab, broadcast the
// invalidation to ALL open tabs of your app via
// BroadcastChannel. Every tab re-runs its load fns.
async function saveSettings(data: Settings) {
  await fetch('/api/settings', { method: 'PUT', body: JSON.stringify(data) });
  await refreshAll();
}

// Each tab listens automatically — no setup needed.
// Great for:
// - Admin dashboards open in multiple tabs
// - Cart state across checkout tabs
// - Logging users out of all tabs when one logs out
// - Keeping draft editors in sync

// NOTE: the broadcast is local to the same origin.
// Server-triggered invalidation (e.g. via SSE) needs
// extra wiring — see realtime patterns in module 14.\`
  };
</script>

<h1>Data Invalidation Patterns</h1>

<section>
  <h2>Live load registry</h2>
  <p class="note">
    Each row is a load function with its dependency key. Trigger a
    mutation to see exactly which loads re-run.
  </p>

  <div class="loads">
    <div class="load-header">
      <span>Load function</span>
      <span>Key</span>
      <span>Runs</span>
      <span>Data</span>
    </div>
    {#each loads as load (load.id)}
      <div class="load-row">
        <code>{load.label}</code>
        <span class="key">{load.key}</span>
        <span class="runs">{load.runs}</span>
        <span class="data">{load.data}</span>
      </div>
    {/each}
  </div>

  <div class="actions">
    <button onclick={addToCart}>Add to cart</button>
    <button onclick={updateProfile}>Update profile</button>
    <button onclick={publishPost}>Publish post</button>
    <button class="all" onclick={globalReset}>invalidateAll()</button>
    <button class="broadcast" onclick={refreshAll}>refreshAll()</button>
  </div>
</section>

<section>
  <h2>Event log</h2>
  {#if log.length === 0}
    <p class="empty">Trigger an action to see invalidations flow.</p>
  {:else}
    <div class="log">
      {#each log as entry (entry.id)}
        <div class="log-entry {entry.kind}">
          {#if entry.kind === 'mutation'}<span class="badge m">MUTATION</span>{/if}
          {#if entry.kind === 'invalidate'}<span class="badge i">INVALIDATE</span>{/if}
          {#if entry.kind === 'load'}<span class="badge l">LOAD</span>{/if}
          <code>{entry.text}</code>
        </div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>Patterns</h2>
  <div class="tabs">
    {#each ['depends', 'invalidate', 'actions', 'refresh'] as tab (tab)}
      <button
        class:active={showCode === tab}
        onclick={() => (showCode = tab as typeof showCode)}
      >
        {tab === 'depends'
          ? 'depends()'
          : tab === 'invalidate'
          ? 'invalidate()'
          : tab === 'actions'
          ? 'form actions'
          : 'refreshAll()'}
      </button>
    {/each}
  </div>
  <pre class="code"><code>{examples[showCode]}</code></pre>
</section>

<section class="pitfalls">
  <h2>Common Pitfalls & Pro Tips</h2>
  <ul class="pitfall-list">
    <li>
      <strong>invalidateAll() re-runs ALL loads</strong>
      It's the nuclear option — expensive on pages with many parallel loads, so reach for targeted <code>invalidate()</code> first.
    </li>
    <li>
      <strong>depends() strings must be consistent across calls</strong>
      Typos mean the load registers one key and invalidation targets another — pull the key into a shared constant.
    </li>
    <li>
      <strong>URL-based depends is tracked automatically</strong>
      A <code>fetch()</code> inside load registers the URL as a dependency, so <code>invalidate('/api/foo')</code> re-runs it without an explicit <code>depends</code> call.
    </li>
    <li>
      <strong>use:enhance invalidates after form actions automatically</strong>
      Manual invalidation after a successful action is usually redundant — <code>use:enhance</code> already re-runs affected loads.
    </li>
    <li>
      <strong>Namespace your keys</strong>
      Prefix keys with an app or feature name (<code>app:cart</code>) to avoid collisions as the codebase grows.
    </li>
    <li>
      <strong>refreshAll() is cross-tab only</strong>
      It broadcasts to other tabs via BroadcastChannel; use <code>invalidate()</code>/<code>invalidateAll()</code> within the current tab.
    </li>
  </ul>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #00cec9; font-size: 1.05rem; }
  .note { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem; }
  .loads {
    background: white; border-radius: 6px; overflow: hidden;
    border: 1px solid #dfe6e9; margin-bottom: 0.75rem;
  }
  .load-header, .load-row {
    display: grid; grid-template-columns: 2fr 1.3fr 0.5fr 1.5fr;
    gap: 0.5rem; padding: 0.5rem 0.75rem; font-size: 0.8rem;
    align-items: center;
  }
  .load-header {
    background: #00cec9; color: white; font-weight: 700;
    text-transform: uppercase; font-size: 0.7rem;
    letter-spacing: 0.05em;
  }
  .load-row { border-top: 1px solid #f1f2f6; }
  .load-row code {
    font-family: monospace; color: #2d3436; font-size: 0.75rem;
  }
  .key {
    padding: 0.1rem 0.4rem; background: #dfe6e9;
    border-radius: 3px; font-size: 0.7rem; font-family: monospace;
    color: #6c5ce7; font-weight: 600; justify-self: start;
  }
  .runs {
    display: inline-block; padding: 0.1rem 0.4rem;
    background: #00cec9; color: white; border-radius: 10px;
    font-weight: 700; font-size: 0.75rem; text-align: center;
  }
  .data { color: #636e72; font-style: italic; }
  .actions {
    display: flex; gap: 0.3rem; flex-wrap: wrap;
  }
  .actions button {
    padding: 0.4rem 0.75rem; border: none; border-radius: 4px;
    background: #0984e3; color: white; cursor: pointer;
    font-weight: 600; font-size: 0.8rem;
  }
  .actions .all { background: #e17055; }
  .actions .broadcast { background: #6c5ce7; }
  .log {
    background: #2d3436; border-radius: 6px; padding: 0.5rem;
    max-height: 300px; overflow-y: auto;
  }
  .log-entry {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.3rem 0.4rem; border-radius: 3px;
    font-size: 0.75rem; margin-bottom: 0.15rem;
  }
  .log-entry code {
    color: #dfe6e9; font-family: monospace;
  }
  .badge {
    padding: 0.1rem 0.4rem; border-radius: 3px;
    font-weight: 700; font-size: 0.65rem; min-width: 72px;
    text-align: center;
  }
  .badge.m { background: #fd79a8; color: white; }
  .badge.i { background: #fdcb6e; color: #2d3436; }
  .badge.l { background: #00cec9; color: white; }
  .empty { color: #b2bec3; text-align: center; font-size: 0.85rem; }
  .tabs { display: flex; gap: 2px; }
  .tabs button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px 4px 0 0;
    background: #dfe6e9; color: #636e72; cursor: pointer;
    font-weight: 600; font-size: 0.8rem;
  }
  .tabs button.active { background: #2d3436; color: #dfe6e9; }
  .code {
    padding: 1rem; background: #2d3436; border-radius: 0 6px 6px 6px;
    overflow-x: auto; margin: 0;
  }
  .code code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; font-family: monospace; }
  .pitfalls { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.25rem; margin-top: 1.5rem; }
  .pitfalls h2 { color: #78350f; margin: 0 0 0.5rem; font-size: 1rem; }
  .pitfall-list { list-style: none; padding: 0; margin: 0; }
  .pitfall-list li { padding: 0.4rem 0; border-bottom: 1px dashed #fbbf24; font-size: 0.85rem; color: #78350f; }
  .pitfall-list li:last-child { border-bottom: none; }
  .pitfall-list strong { display: block; color: #92400e; margin-bottom: 0.15rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
