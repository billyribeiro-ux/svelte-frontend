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

Just like pages, layouts can have load functions. A \`+layout.server.ts\` file provides data to the layout **and** all its child pages.

This is perfect for data that multiple pages need — like user info, navigation items, or global settings.`
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

Page load functions can access data from parent layouts using \`await parent()\`. However, be cautious — this creates a **waterfall** where the page must wait for the layout data.

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
