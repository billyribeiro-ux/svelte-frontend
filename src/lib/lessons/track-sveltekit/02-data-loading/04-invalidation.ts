import type { Lesson } from '$types/lesson';

export const invalidation: Lesson = {
	id: 'sveltekit.data-loading.invalidation',
	slug: 'invalidation',
	title: 'Data Invalidation',
	description: 'Re-run load functions with depends(), invalidate(), and invalidateAll().',
	trackId: 'sveltekit',
	moduleId: 'data-loading',
	order: 4,
	estimatedMinutes: 12,
	concepts: ['sveltekit.loading.invalidation', 'sveltekit.loading.depends'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Data Invalidation

## Why SvelteKit Caches Load Function Results

SvelteKit does not re-run load functions on every navigation by default. When you navigate from \`/dashboard\` to \`/settings\` and back to \`/dashboard\`, the dashboard's data is reused from cache. This is essential for performance -- without caching, every back/forward navigation would trigger server requests, making the app feel sluggish.

But cached data becomes stale. A user creates a new post, but the posts list still shows the old data. A team member changes permissions, but the UI still reflects the old state. You need a mechanism to tell SvelteKit: "this data is no longer valid, refetch it."

This is the invalidation system: \`depends()\`, \`invalidate()\`, and \`invalidateAll()\`.

## How the Dependency Graph Works

The invalidation system is built on a dependency graph. Every load function implicitly and explicitly declares what it depends on:

**Implicit dependencies:** When a load function calls \`fetch(url)\`, SvelteKit automatically registers that URL as a dependency. If someone later calls \`invalidate(url)\`, the load function re-runs.

**Explicit dependencies:** The \`depends(key)\` function lets you declare custom dependency keys. These keys are arbitrary strings, but by convention use the format \`app:resource\`:

\`\`\`typescript
export const load: PageServerLoad = async ({ depends, fetch }) => {
  depends('app:posts');  // explicit custom dependency

  const res = await fetch('/api/posts');  // implicit dependency on '/api/posts'
  const posts = await res.json();

  return { posts };
};
\`\`\`

This load function will re-run when ANY of these conditions are met:
- \`invalidate('app:posts')\` is called
- \`invalidate('/api/posts')\` is called
- \`invalidate((url) => url.pathname === '/api/posts')\` is called
- \`invalidateAll()\` is called
- A navigation occurs that changes the route params this load function uses

## invalidate(): Surgical Data Refresh

The \`invalidate()\` function accepts either a string URL or a predicate function:

\`\`\`typescript
import { invalidate } from '$app/navigation';

// Invalidate by exact custom key
invalidate('app:posts');

// Invalidate by URL
invalidate('/api/posts');

// Invalidate by predicate -- all URLs matching a pattern
invalidate((url) => url.pathname.startsWith('/api/'));
\`\`\`

When you call \`invalidate()\`, SvelteKit:
1. Walks through all currently active load functions (page + all ancestor layouts)
2. Checks if any of them depend on the invalidated key/URL
3. Re-runs ONLY the load functions that match
4. Merges the new data with existing data
5. Reactively updates the UI

This is surgical -- invalidating \`'app:posts'\` does not re-run the user session load function or the navigation data load function. Only the load functions that declared \`depends('app:posts')\` or fetched \`/api/posts\` will re-execute.

## invalidateAll(): The Nuclear Option

\`invalidateAll()\` re-runs every load function on the current page -- all page and layout load functions, regardless of dependencies. Use it when:

- The user performs an action that could affect any data on the page
- You cannot determine exactly which dependencies changed
- After a destructive operation (bulk delete, role change) where many things might be stale

\`\`\`typescript
import { invalidateAll } from '$app/navigation';

// After a major action
async function handleBulkDelete() {
  await fetch('/api/items/bulk-delete', { method: 'POST', body: selectedIds });
  await invalidateAll(); // refresh everything
}
\`\`\`

**Performance warning:** \`invalidateAll()\` can be expensive. If your page has five load functions making database queries, all five re-run. In most cases, targeted \`invalidate()\` is preferable.

## Automatic Invalidation After Form Actions

SvelteKit automatically calls \`invalidateAll()\` after a form action completes (when using \`use:enhance\`). This is why forms "just work" -- you submit a form that creates a post, the action runs, and the page's load function re-runs to include the new post.

You can override this default behavior in the \`use:enhance\` callback:

\`\`\`svelte
<form method="POST" use:enhance={() => {
  return async ({ update }) => {
    // Instead of invalidateAll(), only invalidate posts
    await invalidate('app:posts');
    // Skip the default update behavior
    // await update(); <-- not called
  };
}}>
\`\`\`

## Cache Busting Strategies

For time-sensitive data, combine invalidation with polling or event-driven updates:

**Polling pattern:**
\`\`\`typescript
// In a component
$effect(() => {
  const interval = setInterval(() => {
    invalidate('app:notifications');
  }, 30000); // Check every 30 seconds

  return () => clearInterval(interval);
});
\`\`\`

**Event-driven pattern:**
\`\`\`typescript
// After receiving a WebSocket message
socket.on('posts:updated', () => {
  invalidate('app:posts');
});
\`\`\`

**Navigation-driven pattern:**
\`\`\`typescript
// In +layout.ts
import { afterNavigate } from '$app/navigation';

afterNavigate(() => {
  // Refresh notifications on every page change
  invalidate('app:notifications');
});
\`\`\`

## Designing Dependency Keys

Good dependency key design makes your invalidation predictable and maintainable:

- **Use namespaces:** \`app:posts\`, \`app:user\`, \`app:team:settings\`
- **Be granular but not excessive:** \`app:posts\` is good. \`app:posts:list:page:1:sort:date\` is too granular.
- **Document your keys:** Keep a list of dependency keys and which load functions use them. This becomes the map of your data flow.
- **Avoid URL-based dependencies for custom data:** Use \`depends('app:posts')\` instead of relying on the implicit \`fetch('/api/posts')\` dependency. Custom keys are more readable, refactor-safe, and work even if you change your API routes.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.loading.invalidation'
		},
		{
			type: 'text',
			content: `## Using depends() and invalidate()

In your load function, call \`depends('app:posts')\` to declare a custom dependency. Then from your page, call \`invalidate('app:posts')\` to re-run that load function.

**Your task:** Add a dependency to the load function and a refresh button that invalidates it.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Using invalidateAll()

When you want to refresh everything on the page, use \`invalidateAll()\`. This re-runs every load function for the current page.

**Task:** Add a "Refresh All" button that calls \`invalidateAll()\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends }) => {
  // TODO: Add a dependency with depends()

  const posts = [
    { id: 1, title: 'Post 1', updatedAt: new Date().toISOString() },
    { id: 2, title: 'Post 2', updatedAt: new Date().toISOString() }
  ];

  return { posts };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { invalidate, invalidateAll } from '$app/navigation';

  let { data } = $props();
</script>

<h1>Posts</h1>

<!-- TODO: Add refresh buttons and display posts -->`
		}
	],

	solutionFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends }) => {
  depends('app:posts');

  const posts = [
    { id: 1, title: 'Post 1', updatedAt: new Date().toISOString() },
    { id: 2, title: 'Post 2', updatedAt: new Date().toISOString() }
  ];

  return { posts };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { invalidate, invalidateAll } from '$app/navigation';

  let { data } = $props();
</script>

<h1>Posts</h1>

<button onclick={() => invalidate('app:posts')}>Refresh Posts</button>
<button onclick={() => invalidateAll()}>Refresh All</button>

<ul>
  {#each data.posts as post}
    <li>{post.title} — updated {post.updatedAt}</li>
  {/each}
</ul>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add depends() in the load function and invalidate() in the page',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'depends(' },
						{ type: 'contains', value: 'invalidate(' }
					]
				}
			},
			hints: [
				'Call `depends(\'app:posts\')` inside your load function to declare a dependency.',
				'Import `invalidate` from `$app/navigation` in your page.',
				'Add a button with `onclick={() => invalidate(\'app:posts\')}` to trigger a refresh.'
			],
			conceptsTested: ['sveltekit.loading.depends']
		},
		{
			id: 'cp-2',
			description: 'Add an invalidateAll() button to refresh all data',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'invalidateAll()' }]
				}
			},
			hints: [
				'Import `invalidateAll` from `$app/navigation`.',
				'Add a button that calls `invalidateAll()` on click.',
				'`invalidateAll()` re-runs every load function on the current page.'
			],
			conceptsTested: ['sveltekit.loading.invalidation']
		}
	]
};
