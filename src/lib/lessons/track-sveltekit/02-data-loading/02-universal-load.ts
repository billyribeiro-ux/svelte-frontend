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

## The Dual-Environment Execution Model

Universal load functions in \`+page.ts\` have a unique execution characteristic: they run on the **server during SSR** and in the **browser during client-side navigation**. This dual execution model opens capabilities that server-only load functions cannot provide, but it also introduces constraints and subtleties you must understand.

On the first page load (user types a URL or refreshes), SvelteKit server-renders the page. The universal load function runs on the server, fetches data, and the result is rendered into HTML. The serialized data is embedded in the page so the browser does not re-run the load function during hydration.

On subsequent navigations (user clicks an internal link), the universal load function runs in the browser. It makes fetch requests directly from the browser, processes the response, and the page updates client-side.

This means your universal load function must work in both environments. You cannot use Node.js APIs (\`fs\`, \`crypto\`, database drivers) because those do not exist in the browser. You cannot access \`window\` or \`document\` because those do not exist on the server. The function must be environment-agnostic.

## The Server vs. Universal Decision Matrix

Choosing between \`+page.server.ts\` and \`+page.ts\` is one of the most important architectural decisions in SvelteKit. Here is a rigorous framework:

| Criterion | Server Load | Universal Load |
|---|---|---|
| Access private secrets | Yes | No |
| Query databases directly | Yes | No |
| Return non-serializable data | No | Yes |
| Run in browser on navigation | No (JSON fetch) | Yes |
| Access cookies/headers | Yes (directly) | Limited |
| Bundle size impact | None (server only) | Adds to client bundle |
| Can return component constructors | No | Yes |
| Can return functions | No | Yes |

**The key differentiator is serializability.** Server load functions must return serializable data because the result crosses a network boundary (server to client). Universal load functions return data directly to the component in the same JavaScript context, so they can return anything -- including component constructors, class instances, and functions.

This is why universal load is essential for patterns like:
- Dynamic component selection: \`return { Component: (await import('./renderers/Markdown.svelte')).default }\`
- Computed getters or derived state that should be functions
- Third-party SDK instances that lose their prototype when serialized

## The Special fetch Function

Universal load functions receive a \`fetch\` parameter that is not the global \`fetch\`. SvelteKit wraps the native fetch to provide critical behaviors:

**On the server during SSR:**
- Relative URLs work (e.g., \`fetch('/api/users')\` resolves against the origin)
- Cookies from the incoming request are forwarded automatically
- The response is captured and replayed -- if a load function and the page both fetch \`/api/users\`, only one actual request is made

**On the client during navigation:**
- It is essentially the native \`fetch\`, but SvelteKit tracks the URLs fetched for invalidation purposes
- Cookies are sent automatically (standard browser behavior)

**Critical rule:** Always use the provided \`fetch\`, never the global \`fetch\`. If you use the global \`fetch\` on the server, cookies will not be forwarded, relative URLs will fail, and deduplication will not work.

\`\`\`typescript
export const load: PageLoad = async ({ fetch }) => {
  // CORRECT: Uses the provided fetch
  const response = await fetch('/api/users');

  // WRONG: Uses the global fetch -- no cookie forwarding, no dedup
  // const response = await globalThis.fetch('/api/users');

  const users = await response.json();
  return { users };
};
\`\`\`

## Coexistence with Server Load

A page can have BOTH \`+page.server.ts\` and \`+page.ts\`. When both exist:

1. The server load function runs first and returns its data
2. The universal load function receives the server data via the \`data\` property on its event object
3. The universal load function's return value is what the page component receives

This pattern is useful when you need server-side secrets to fetch initial data but want to augment it with non-serializable values:

\`\`\`typescript
// +page.server.ts -- has access to secrets
export const load: PageServerLoad = async () => {
  const rawPosts = await db.query('SELECT * FROM posts');
  return { posts: rawPosts };
};

// +page.ts -- can return non-serializable data
export const load: PageLoad = async ({ data }) => {
  // data.posts comes from the server load
  return {
    posts: data.posts,
    renderPost: (post) => marked(post.content) // function -- not serializable
  };
};
\`\`\`

## Performance Implications

Universal load functions are included in the client-side JavaScript bundle. Every import in \`+page.ts\` adds to the bundle size your users download. Server load functions have zero client-side bundle impact.

For data fetching from public APIs, the tradeoff is:
- **Server load:** User requests page -> server fetches API -> server renders HTML -> sends to user. Latency = user-to-server + server-to-API.
- **Universal load (on navigation):** User clicks link -> browser fetches API directly. Latency = user-to-API (often lower if API has a CDN).

For APIs that are geographically close to the user (or served via CDN), universal load can be faster on navigation. For APIs that are close to your server (same data center), server load can be faster.`
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
