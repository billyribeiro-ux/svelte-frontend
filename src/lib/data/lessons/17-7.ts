import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-7',
		title: 'Data Invalidation Patterns',
		phase: 5,
		module: 17,
		lessonIndex: 7
	},
	description: `SvelteKit's data invalidation system lets you surgically re-run load functions when data changes. depends('app:data') declares that a load function depends on a custom identifier, and invalidate('app:data') triggers re-execution of all load functions that declared that dependency. invalidateAll() re-runs every load function on the page. These patterns enable cross-route data synchronization, real-time updates, and efficient cache management.

Understanding invalidation is key to building apps where data stays fresh without unnecessary re-fetching.`,
	objectives: [
		'Declare custom dependencies with depends() in load functions',
		'Trigger selective re-fetching with invalidate() for specific data',
		'Use invalidateAll() to refresh all page data at once',
		'Build cross-route data synchronization patterns'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Data Invalidation Patterns — interactive reference

  type InvalidationPattern = {
    name: string;
    description: string;
    code: string;
    flow: string[];
  };

  const patterns: InvalidationPattern[] = [
    {
      name: 'depends + invalidate',
      description: 'Declare a custom dependency in your load function, then trigger it from anywhere. Only load functions with that dependency re-run.',
      code: \`// +layout.server.ts
export const load = async ({ depends, locals }) => {
  depends('app:notifications');  // Declare dependency

  const notifications = await db.getNotifications(locals.user.id);
  return { notifications };
};

// +page.svelte — after marking notification as read
import { invalidate } from '$app/navigation';

async function markRead(id: string) {
  await fetch(\\\`/api/notifications/\\\${id}\\\`, { method: 'PATCH' });

  // Only re-runs load functions with depends('app:notifications')
  await invalidate('app:notifications');
}\`,
      flow: [
        'Load function calls depends("app:notifications")',
        'User marks notification as read',
        'Component calls invalidate("app:notifications")',
        'SvelteKit re-runs ONLY load functions with that dependency',
        'UI updates with fresh data'
      ]
    },
    {
      name: 'URL-based invalidation',
      description: 'invalidate() also accepts URLs. Load functions that fetch from a matching URL will re-run automatically.',
      code: \`// +page.server.ts
export const load = async ({ fetch }) => {
  // SvelteKit tracks this URL as a dependency automatically
  const res = await fetch('/api/todos');
  const todos = await res.json();
  return { todos };
};

// +page.svelte — after adding a todo
import { invalidate } from '$app/navigation';

async function addTodo(text: string) {
  await fetch('/api/todos', {
    method: 'POST',
    body: JSON.stringify({ text }),
    headers: { 'Content-Type': 'application/json' }
  });

  // Re-runs any load function that fetched from /api/todos
  await invalidate('/api/todos');
}\`,
      flow: [
        'Load function fetches /api/todos — SvelteKit auto-tracks this',
        'User adds a new todo via POST',
        'Component calls invalidate("/api/todos")',
        'Load functions that fetched that URL re-run',
        'Page shows the new todo'
      ]
    },
    {
      name: 'invalidateAll',
      description: 'Re-runs every load function on the current page. Use it when multiple data sources may have changed, or after a global action like login/logout.',
      code: \`// After logging out — everything needs refreshing
import { invalidateAll } from '$app/navigation';
import { goto } from '$app/navigation';

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });

  // Re-run ALL load functions (layout + page)
  await invalidateAll();

  // Then navigate
  goto('/login');
}

// After bulk operations
async function deleteAllCompleted() {
  await fetch('/api/todos/completed', { method: 'DELETE' });

  // Everything might be affected
  await invalidateAll();
}\`,
      flow: [
        'User logs out or performs a bulk action',
        'Component calls invalidateAll()',
        'ALL load functions re-run (layout + page)',
        'Entire page state is refreshed',
        'UI reflects the new state'
      ]
    },
    {
      name: 'Cross-Route Sync',
      description: 'Custom dependencies work across routes. A sidebar and main content can stay in sync because they share a dependency identifier.',
      code: \`// src/routes/+layout.server.ts
export const load = async ({ depends, locals }) => {
  depends('app:cart');
  const cartCount = await db.getCartCount(locals.user.id);
  return { cartCount };  // Shown in header/nav
};

// src/routes/products/[id]/+page.svelte
import { invalidate } from '$app/navigation';

async function addToCart(productId: string) {
  await fetch('/api/cart', {
    method: 'POST',
    body: JSON.stringify({ productId })
  });

  // Layout's load re-runs → header cart count updates!
  await invalidate('app:cart');
}

// src/routes/cart/+page.server.ts
export const load = async ({ depends, locals }) => {
  depends('app:cart');  // Same dependency
  const items = await db.getCartItems(locals.user.id);
  return { items };
};
// Both the layout AND cart page re-run when cart changes\`,
      flow: [
        'Layout + cart page both depend on "app:cart"',
        'User adds item on product page',
        'invalidate("app:cart") fires',
        'Layout load re-runs → nav cart badge updates',
        'If on /cart, cart page load also re-runs'
      ]
    }
  ];

  let activePattern = $state(0);
</script>

<main>
  <h1>Data Invalidation Patterns</h1>
  <p class="subtitle">depends, invalidate, invalidateAll — surgical data re-fetching</p>

  <div class="pattern-tabs">
    {#each patterns as pattern, i}
      <button
        class={['tab', activePattern === i && 'active']}
        onclick={() => activePattern = i}
      >
        {pattern.name}
      </button>
    {/each}
  </div>

  <div class="pattern-detail">
    <h2>{patterns[activePattern].name}</h2>
    <p class="pattern-desc">{patterns[activePattern].description}</p>

    <h3>Data Flow</h3>
    <div class="flow">
      {#each patterns[activePattern].flow as step, i}
        <div class="flow-step">
          <span class="flow-num">{i + 1}</span>
          <span>{step}</span>
        </div>
        {#if i < patterns[activePattern].flow.length - 1}
          <div class="flow-arrow">&darr;</div>
        {/if}
      {/each}
    </div>

    <h3>Code</h3>
    <pre><code>{patterns[activePattern].code}</code></pre>
  </div>

  <section class="comparison">
    <h2>When to Use What</h2>
    <div class="compare-grid">
      <div class="compare-card">
        <h4>invalidate('app:...')</h4>
        <p>Surgical. Re-runs only matching load functions. Best for targeted updates.</p>
        <code class="use-when">After a specific data mutation</code>
      </div>
      <div class="compare-card">
        <h4>invalidate('/api/...')</h4>
        <p>URL-based. Re-runs loads that fetched from that URL. Great with REST APIs.</p>
        <code class="use-when">After mutating a specific API resource</code>
      </div>
      <div class="compare-card">
        <h4>invalidateAll()</h4>
        <p>Nuclear option. Re-runs everything. Use sparingly for global state changes.</p>
        <code class="use-when">After login/logout, bulk operations</code>
      </div>
      <div class="compare-card">
        <h4>goto() with invalidateAll</h4>
        <p>Navigate and refresh. Use the invalidateAll option on goto for combined navigation.</p>
        <code class="use-when">After form submission with redirect</code>
      </div>
    </div>
  </section>
</main>

<style>
  main { max-width: 850px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  h1 { text-align: center; color: #333; }
  h2 { color: #555; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
  h3 { color: #555; margin: 1.25rem 0 0.5rem; }
  h4 { margin: 0 0 0.5rem; }
  .subtitle { text-align: center; color: #666; }
  section { margin: 2rem 0; }

  .pattern-tabs { display: flex; gap: 0.5rem; margin: 2rem 0 1.5rem; flex-wrap: wrap; }
  .tab {
    flex: 1; min-width: 140px; padding: 0.6rem 0.75rem; border: 2px solid #e0e0e0;
    border-radius: 8px; background: #f8f9fa; cursor: pointer; font-size: 0.85rem; font-weight: 500;
  }
  .tab.active { border-color: #1976d2; background: #e3f2fd; color: #1976d2; }

  .pattern-detail { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; }
  .pattern-desc { color: #555; line-height: 1.6; }

  .flow { display: flex; flex-direction: column; align-items: center; gap: 0; }
  .flow-step {
    display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 1.25rem;
    border: 2px solid #e0e0e0; border-radius: 8px; background: white;
    width: 100%; max-width: 500px; font-size: 0.88rem;
  }
  .flow-num {
    width: 24px; height: 24px; border-radius: 50%; background: #1976d2; color: white;
    display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;
    flex-shrink: 0;
  }
  .flow-arrow { color: #1976d2; font-size: 1rem; }

  .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .compare-card {
    background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 10px; padding: 1rem;
  }
  .compare-card p { font-size: 0.85rem; color: #555; margin: 0 0 0.5rem; }
  .use-when {
    display: block; font-size: 0.8rem; background: #e8f5e9; color: #2e7d32;
    padding: 0.25rem 0.5rem; border-radius: 4px;
  }

  pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; font-size: 0.78rem; overflow-x: auto; line-height: 1.5; }
  code { font-family: 'Fira Code', monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
