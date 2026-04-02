import type { Lesson } from '$types/lesson';

export const layoutData: Lesson = {
	id: 'sveltekit.data-loading.layout-data',
	slug: 'layout-data',
	title: 'Layout Data',
	description: 'Share data across pages with +layout.server.ts and understand data waterfalls.',
	trackId: 'sveltekit',
	moduleId: 'data-loading',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['sveltekit.loading.layout', 'sveltekit.loading.waterfall'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Layout Data Loading

## Why Layout Data Is Structurally Different from Page Data

Layout load functions (\`+layout.server.ts\` or \`+layout.ts\`) seem similar to page load functions, but they serve a fundamentally different purpose and follow different lifecycle rules. Understanding these differences is critical for building performant applications.

A page load function runs when you navigate TO that page. A layout load function runs when you navigate to ANY page within that layout's scope. The root layout's load function runs on every single navigation. A dashboard layout's load function runs whenever you navigate to any \`/dashboard/*\` page.

This difference has profound performance implications. If your root layout load function makes a database query, that query runs on every page navigation in your entire app. If it takes 200ms, you have added 200ms to every navigation. Choose carefully what you load at each layout level.

## The Data Merge Model

SvelteKit merges data from layout load functions with page load function data. The merge follows the component hierarchy:

\`\`\`
Root Layout data: { user: { name: 'Alice' } }
  +
Dashboard Layout data: { team: { name: 'Engineering' } }
  +
Analytics Page data: { metrics: [...] }
  =
Page receives: { user, team, metrics }
\`\`\`

The page component (and every component in the tree) receives the merged result via its \`data\` prop. If there are key collisions, child data overwrites parent data. If both the layout and page return \`{ title: '...' }\`, the page's title wins.

**Important architectural rule:** Avoid key collisions between layout and page data. Use distinct, descriptive property names. A layout returning \`{ user }\` and a page returning \`{ pageUser }\` is much clearer than both returning \`{ data }\`.

## Waterfalls: The parent() Problem

Page load functions can access parent layout data using \`await parent()\`. This creates a **data loading waterfall** -- the page load function must wait for the layout load function to complete before it can start:

\`\`\`typescript
// +layout.server.ts -- takes 200ms
export const load = async () => {
  const user = await fetchUser(); // 200ms
  return { user };
};

// +page.server.ts -- takes 300ms, but WAITS for layout first
export const load = async ({ parent }) => {
  const { user } = await parent(); // blocks until layout finishes
  const posts = await fetchUserPosts(user.id); // 300ms
  return { posts };
};
// Total time: 200ms + 300ms = 500ms (sequential)
\`\`\`

Without \`parent()\`, both load functions run in parallel:

\`\`\`typescript
// +page.server.ts -- runs in PARALLEL with layout
export const load = async ({ locals }) => {
  // Use locals.user (set by hooks) instead of parent()
  const posts = await fetchUserPosts(locals.user.id); // 300ms
  return { posts };
};
// Total time: max(200ms, 300ms) = 300ms (parallel)
\`\`\`

**SvelteKit runs all load functions for a navigation in parallel by default.** The waterfall only occurs when you explicitly call \`parent()\`. This is why hooks are often better for shared data like user sessions -- setting \`event.locals.user\` in the handle hook makes user data available to all load functions without waterfalls.

## The depends() Mechanism for Layout Data

Layout load functions can declare dependencies using \`depends()\`, just like page load functions. When you call \`invalidate()\` with a matching URL, only the load functions that declared that dependency re-run:

\`\`\`typescript
// +layout.server.ts
export const load = async ({ depends }) => {
  depends('app:user');
  const user = await fetchCurrentUser();
  return { user };
};
\`\`\`

Calling \`invalidate('app:user')\` from any page within this layout will re-run just this layout load function and re-render the layout with fresh user data. Pages that did not change their own data will receive the new layout data automatically.

This is the correct way to handle scenarios like "user updates their profile name" -- invalidate the layout data that contains the user, and the nav bar updates everywhere.

## Parallel Loading Strategy

The most performant SvelteKit applications minimize waterfalls by following these rules:

1. **Use hooks for auth/session data.** Set \`event.locals.user\` in \`handle()\` so every load function can access user data without \`parent()\`.
2. **Keep layout loads lightweight.** Layout loads run on every child navigation. Fetch only what the layout UI actually needs.
3. **Prefer independent data fetching.** If a page needs user data AND posts, fetch both independently rather than fetching the user first and then using the user ID to fetch posts.
4. **Use \`depends()\` for targeted invalidation.** Instead of \`invalidateAll()\` (which re-runs everything), declare specific dependencies and invalidate only what changed.

## When Layout Data Re-runs

Layout load functions do NOT re-run on every navigation within their scope -- they are cached. A layout load re-runs when:

1. A navigation changes a parameter that the layout's route uses
2. A parent layout's load function re-ran
3. \`invalidate()\` is called with a matching URL
4. \`invalidateAll()\` is called
5. The load function calls \`fetch(url)\` and \`invalidate(url)\` is later called with that URL
6. The load function calls \`depends(url)\` and \`invalidate(url)\` is later called

This caching is essential for performance. If you have a root layout that loads user data, it does not re-fetch the user on every page change -- only when explicitly invalidated.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.loading.layout'
		},
		{
			type: 'text',
			content: `## Loading Shared Data

**Your task:** Create a layout load function that returns user information, then access it in both the layout and a child page.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Accessing Parent Data in Pages

Page load functions can access data from parent layouts using \`await parent()\`. However, be cautious -- this creates a **waterfall** where the page must wait for the layout data.

**Task:** Access the layout data from a child page's load function using \`parent()\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: '+layout.server.ts',
			path: '/+layout.server.ts',
			language: 'typescript',
			content: `import type { LayoutServerLoad } from './$types';

// TODO: Return shared data like user info
export const load: LayoutServerLoad = async () => {
  return {};
};`
		},
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { data, children }: { data: any; children: Snippet } = $props();
</script>

<!-- TODO: Display user info from layout data -->
<nav>
  <span>App</span>
</nav>

<main>
  {@render children()}
</main>`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>Dashboard</h1>

<!-- TODO: Access layout data here too -->`
		}
	],

	solutionFiles: [
		{
			name: '+layout.server.ts',
			path: '/+layout.server.ts',
			language: 'typescript',
			content: `import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
  return {
    user: {
      name: 'Alice',
      email: 'alice@example.com',
      role: 'admin'
    }
  };
};`
		},
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { data, children }: { data: any; children: Snippet } = $props();
</script>

<nav>
  <span>App</span>
  <span>Welcome, {data.user.name}</span>
</nav>

<main>
  {@render children()}
</main>

<style>
  nav {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    background: #1e293b;
    color: white;
  }

  main {
    padding: 1rem;
  }
</style>`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>Dashboard</h1>

<p>Logged in as: {data.user.name} ({data.user.role})</p>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a layout load function that returns shared user data',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'return' },
						{ type: 'contains', value: 'user' }
					]
				}
			},
			hints: [
				'Return an object with a `user` property from the layout load function.',
				'Include fields like `name`, `email`, and `role` on the user object.',
				'The returned data is available to the layout and all child pages.'
			],
			conceptsTested: ['sveltekit.loading.layout']
		},
		{
			id: 'cp-2',
			description: 'Display layout data in both the layout and child page',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'data.user' }]
				}
			},
			hints: [
				'Layout data is merged with page data and available via `data`.',
				'Access `data.user.name` in both the layout and page components.',
				'In the layout, show the username in the nav. In the page, show full user details.'
			],
			conceptsTested: ['sveltekit.loading.layout']
		}
	]
};
