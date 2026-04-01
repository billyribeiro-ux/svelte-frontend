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

SvelteKit caches load function results. When you need fresh data, you **invalidate** it. There are three tools:

- \`depends(url)\` — declares a dependency in a load function
- \`invalidate(url)\` — re-runs load functions that depend on the given URL
- \`invalidateAll()\` — re-runs all load functions on the current page`
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
