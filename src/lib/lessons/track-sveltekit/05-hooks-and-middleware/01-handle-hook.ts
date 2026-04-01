import type { Lesson } from '$types/lesson';

export const handleHook: Lesson = {
	id: 'sveltekit.hooks-and-middleware.handle-hook',
	slug: 'handle-hook',
	title: 'The handle() Hook',
	description: 'Intercept requests with handle(), add auth checks, and modify responses.',
	trackId: 'sveltekit',
	moduleId: 'hooks-and-middleware',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['sveltekit.hooks.handle', 'sveltekit.hooks.locals'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# The handle() Hook

The \`handle\` hook in \`src/hooks.server.ts\` runs for **every request** — page loads, form submissions, and API calls. It receives the request event and a \`resolve\` function.

You can modify the request, add data to \`event.locals\`, check authentication, or even return a custom response.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.hooks.handle'
		},
		{
			type: 'text',
			content: `## Basic handle() Hook

The simplest hook just passes the request through:

\`\`\`typescript
export async function handle({ event, resolve }) {
  return resolve(event);
}
\`\`\`

**Your task:** Create a handle hook that adds a user object to \`event.locals\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Authentication Checks

A common pattern is checking for authentication in the handle hook. If the user isn't authenticated, redirect them to the login page.

**Task:** Add an auth check that redirects unauthenticated users from protected routes.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Modifying Responses

You can transform the response after resolve by using the \`transformPageChunk\` option or by modifying the response directly.

**Task:** Add a custom response header using the handle hook.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: 'hooks.server.ts',
			path: '/hooks.server.ts',
			language: 'typescript',
			content: `import type { Handle } from '@sveltejs/kit';

// TODO: Create a handle hook that sets event.locals.user
export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event);
};`
		},
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    user: locals.user
  };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>Home</h1>

<!-- TODO: Display user info from locals -->`
		}
	],

	solutionFiles: [
		{
			name: 'hooks.server.ts',
			path: '/hooks.server.ts',
			language: 'typescript',
			content: `import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Simulate getting user from session/cookie
  const token = event.cookies.get('session');
  event.locals.user = token ? { name: 'Alice', role: 'admin' } : null;

  // Protect dashboard routes
  if (event.url.pathname.startsWith('/dashboard') && !event.locals.user) {
    redirect(303, '/login');
  }

  const response = await resolve(event);

  // Add custom header
  response.headers.set('X-Custom-Header', 'SvelteKit');

  return response;
};`
		},
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    user: locals.user
  };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>Home</h1>

{#if data.user}
  <p>Welcome, {data.user.name}! Role: {data.user.role}</p>
{:else}
  <p>You are not logged in.</p>
{/if}`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add user data to event.locals in the handle hook',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'event.locals' }]
				}
			},
			hints: [
				'`event.locals` is an object you can attach data to for the current request.',
				'Set `event.locals.user = { name: \'Alice\' }` before calling resolve.',
				'Load functions can then access `locals.user` to get the user data.'
			],
			conceptsTested: ['sveltekit.hooks.locals']
		},
		{
			id: 'cp-2',
			description: 'Add route protection with redirect for unauthenticated users',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'redirect(' },
						{ type: 'contains', value: 'pathname' }
					]
				}
			},
			hints: [
				'Check `event.url.pathname` to see which route is being accessed.',
				'Use `redirect(303, \'/login\')` from `@sveltejs/kit` to redirect.',
				'Only redirect if the user is not authenticated and the route is protected.'
			],
			conceptsTested: ['sveltekit.hooks.handle']
		},
		{
			id: 'cp-3',
			description: 'Add a custom response header',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'response.headers' }]
				}
			},
			hints: [
				'Store the result of `await resolve(event)` in a variable.',
				'Use `response.headers.set()` to add custom headers.',
				'Return the modified response.'
			],
			conceptsTested: ['sveltekit.hooks.handle']
		}
	]
};
