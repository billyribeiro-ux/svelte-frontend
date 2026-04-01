import type { Lesson } from '$types/lesson';

export const handleError: Lesson = {
	id: 'sveltekit.hooks-and-middleware.handle-error',
	slug: 'handle-error',
	title: 'The handleError() Hook',
	description: 'Catch unexpected errors with handleError() for logging and error tracking.',
	trackId: 'sveltekit',
	moduleId: 'hooks-and-middleware',
	order: 2,
	estimatedMinutes: 10,
	concepts: ['sveltekit.hooks.handle-error', 'sveltekit.hooks.error-tracking'],
	prerequisites: ['sveltekit.hooks.handle'],

	content: [
		{
			type: 'text',
			content: `# The handleError() Hook

When an **unexpected** error occurs during loading or rendering, SvelteKit calls the \`handleError\` hook. This is your chance to:

- Log the error to an external service (Sentry, LogRocket, etc.)
- Transform the error into a user-friendly message
- Add an error ID for support requests

This hook is defined in \`src/hooks.server.ts\` (server errors) and optionally \`src/hooks.client.ts\` (client errors).`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.hooks.handle-error'
		},
		{
			type: 'text',
			content: `## Implementing handleError

**Your task:** Create a handleError hook that logs errors and returns a user-friendly message with an error ID.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Error Shape

The object you return from \`handleError\` becomes \`$page.error\`. You can return any shape you want — a message, an error code, a support ID, etc.

**Task:** Return a structured error object with a message and error ID.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'hooks.server.ts',
			path: '/hooks.server.ts',
			language: 'typescript',
			content: `import type { HandleServerError } from '@sveltejs/kit';

// TODO: Implement handleError to log errors and return user-friendly messages
export const handleError: HandleServerError = async ({ error, event }) => {
  return {
    message: 'Internal Error'
  };
};`
		},
		{
			name: '+error.svelte',
			path: '/+error.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { page } from '$app/state';
</script>

<h1>Something went wrong</h1>

<!-- TODO: Display the error message and ID -->`
		}
	],

	solutionFiles: [
		{
			name: 'hooks.server.ts',
			path: '/hooks.server.ts',
			language: 'typescript',
			content: `import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = async ({ error, event }) => {
  const errorId = crypto.randomUUID();

  // Log to external service in production
  console.error(\`Error \${errorId}:\`, error);
  console.error('Request URL:', event.url.pathname);

  return {
    message: 'An unexpected error occurred. Please try again.',
    errorId
  };
};`
		},
		{
			name: '+error.svelte',
			path: '/+error.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { page } from '$app/state';
</script>

<h1>Something went wrong</h1>
<p>{page.error?.message}</p>
<p class="error-id">Error ID: {page.error?.errorId}</p>

<style>
  .error-id {
    font-family: monospace;
    color: #6b7280;
    font-size: 0.875rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Log errors and generate an error ID in handleError',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'console.error' },
						{ type: 'regex', value: '(errorId|error_id|UUID|randomUUID)' }
					]
				}
			},
			hints: [
				'Use `console.error()` to log the error details.',
				'Generate a unique ID with `crypto.randomUUID()`.',
				'Include the error ID in the returned object so it appears in the UI.'
			],
			conceptsTested: ['sveltekit.hooks.handle-error']
		},
		{
			id: 'cp-2',
			description: 'Display the error message and ID in the error page',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'page.error' },
						{ type: 'contains', value: 'errorId' }
					]
				}
			},
			hints: [
				'Access the error with `page.error` from `$app/state`.',
				'Display `page.error?.message` for the user-friendly message.',
				'Show `page.error?.errorId` so users can reference it in support requests.'
			],
			conceptsTested: ['sveltekit.hooks.error-tracking']
		}
	]
};
