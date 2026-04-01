import type { Lesson } from '$types/lesson';

export const universalLoad: Lesson = {
	id: 'sveltekit.data-loading.universal-load',
	slug: 'universal-load',
	title: 'Universal Load Functions',
	description: 'Use +page.ts load functions that run on both server and client.',
	trackId: 'sveltekit',
	moduleId: 'data-loading',
	order: 2,
	estimatedMinutes: 15,
	concepts: ['sveltekit.loading.universal', 'sveltekit.loading.fetch'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Universal Load Functions

While \`+page.server.ts\` runs only on the server, \`+page.ts\` runs on **both** server and client. On the first page load, it runs on the server. On subsequent navigations, it runs in the browser.

Universal load functions receive a \`fetch\` function that works identically on both server and client, handling cookies, relative URLs, and avoiding duplicate requests.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.loading.universal'
		},
		{
			type: 'text',
			content: `## When to Use Universal Load

Use \`+page.ts\` when:
- You need to fetch from a public API
- You want client-side navigation to refetch data
- You need to return non-serializable data (like component constructors)

**Your task:** Create a universal load function that fetches data from a public API endpoint.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Using the SvelteKit Fetch

The \`fetch\` provided in the load function is special. On the server, it can make relative requests, forward cookies, and prevents duplicate requests during SSR.

**Task:** Use the provided \`fetch\` to call an API endpoint and return the data.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: '+page.ts',
			path: '/+page.ts',
			language: 'typescript',
			content: `import type { PageLoad } from './$types';

// TODO: Create a universal load function using fetch
export const load: PageLoad = async ({ fetch }) => {
  return {};
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>Users</h1>

<!-- TODO: Display the fetched data -->`
		}
	],

	solutionFiles: [
		{
			name: '+page.ts',
			path: '/+page.ts',
			language: 'typescript',
			content: `import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch('/api/users');
  const users = await response.json();

  return { users };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>Users</h1>

<ul>
  {#each data.users as user}
    <li>{user.name} — {user.email}</li>
  {/each}
</ul>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a universal load function that fetches data',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'fetch' },
						{ type: 'contains', value: 'await' }
					]
				}
			},
			hints: [
				'Destructure `fetch` from the load function parameter.',
				'Use `await fetch(\'/api/users\')` to call an API endpoint.',
				'Parse the response with `await response.json()` and return it.'
			],
			conceptsTested: ['sveltekit.loading.universal']
		},
		{
			id: 'cp-2',
			description: 'Display the fetched data in the page component',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'data.users' },
						{ type: 'contains', value: '{#each' }
					]
				}
			},
			hints: [
				'Access the returned data via `data.users`.',
				'Use `{#each data.users as user}` to iterate and display each user.',
				'Show properties like `user.name` and `user.email` in the list.'
			],
			conceptsTested: ['sveltekit.loading.fetch']
		}
	]
};
