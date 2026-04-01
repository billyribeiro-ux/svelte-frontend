import type { Lesson } from '$types/lesson';

export const serverLoad: Lesson = {
	id: 'sveltekit.data-loading.server-load',
	slug: 'server-load',
	title: 'Server Load Functions',
	description: 'Fetch data on the server with +page.server.ts load functions and access secrets safely.',
	trackId: 'sveltekit',
	moduleId: 'data-loading',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['sveltekit.loading.server', 'sveltekit.loading.page-data'],
	prerequisites: ['sveltekit.routing.file-based'],

	content: [
		{
			type: 'text',
			content: `# Server Load Functions

In SvelteKit, you load data for a page by exporting a \`load\` function from \`+page.server.ts\`. This function runs **only on the server**, making it safe to access databases, API keys, and other secrets.

The data returned from \`load\` is available in the page component via the \`data\` prop.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.loading.server'
		},
		{
			type: 'text',
			content: `## Your First Load Function

Look at the starter code — there's a \`+page.server.ts\` that needs to return data and a \`+page.svelte\` that will display it.

**Your task:** Write a load function that returns a list of posts.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Accessing the Data in Your Page

The data returned from your load function is available as the \`data\` prop in your page component. In Svelte 5, you destructure it from \`$props()\`.

**Task:** Display the posts from the load function in the page component.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Using Server-Only Resources

Since \`+page.server.ts\` only runs on the server, you can safely use environment variables, database connections, and other secrets without them leaking to the client.

**Task:** Use a simulated API key in the load function to demonstrate server-only access.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

// TODO: Export a load function that returns { posts: [...] }

export const load: PageServerLoad = async () => {
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

<h1>Blog Posts</h1>

<!-- TODO: Display the posts from data -->`
		}
	],

	solutionFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

const API_KEY = 'sk-secret-key-123'; // Safe! Only on server

export const load: PageServerLoad = async () => {
  // Simulate fetching posts from a database
  const posts = [
    { id: 1, title: 'Getting Started with SvelteKit', excerpt: 'Learn the basics...' },
    { id: 2, title: 'Server Load Functions', excerpt: 'Fetch data safely...' },
    { id: 3, title: 'Form Actions', excerpt: 'Handle form submissions...' }
  ];

  console.log('Fetching with API key:', API_KEY); // Only logs on server

  return { posts };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>Blog Posts</h1>

<ul>
  {#each data.posts as post}
    <li>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
    </li>
  {/each}
</ul>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a load function that returns posts data',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'return' },
						{ type: 'contains', value: 'posts' }
					]
				}
			},
			hints: [
				'The load function should return an object with your data.',
				'Create an array of post objects with properties like `id`, `title`, `excerpt`.',
				'Return `{ posts }` from the load function.'
			],
			conceptsTested: ['sveltekit.loading.server']
		},
		{
			id: 'cp-2',
			description: 'Display the posts in the page component',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'data.posts' },
						{ type: 'contains', value: '{#each' }
					]
				}
			},
			hints: [
				'Access the data via `data.posts` in your template.',
				'Use `{#each data.posts as post}` to iterate over the posts.',
				'Display each post\'s title and excerpt inside the each block.'
			],
			conceptsTested: ['sveltekit.loading.page-data']
		},
		{
			id: 'cp-3',
			description: 'Use server-only secrets in the load function',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'regex', value: '(API_KEY|secret|private)' }]
				}
			},
			hints: [
				'Define a constant like `const API_KEY = \'...\';` in your server file.',
				'This value never reaches the client because `+page.server.ts` only runs on the server.',
				'You can safely use database credentials, API keys, etc. in server load functions.'
			],
			conceptsTested: ['sveltekit.loading.server']
		}
	]
};
