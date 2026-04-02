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

## Why Error Handling Needs a Dedicated Hook

When an unexpected error occurs in a load function, action, or API route, SvelteKit catches it and renders an error page. But the raw error -- with its stack trace, file paths, and potentially sensitive details -- must never reach the user. SvelteKit's default behavior is to log the error to the console and show a generic "Internal Error" message.

The \`handleError\` hook gives you control over this process. It is your chance to:

1. **Send the error to a monitoring service** (Sentry, Datadog, LogRocket, Bugsnag)
2. **Generate a unique error ID** for support requests ("Please reference error ID abc-123")
3. **Shape the error object** that reaches the client via \`$page.error\`
4. **Filter or redact sensitive information** before logging
5. **Distinguish between error types** for different handling paths

## Expected vs. Unexpected: What handleError Does NOT Catch

**handleError only catches unexpected errors.** If you use SvelteKit's \`error()\` helper to throw a known error, handleError is NOT called:

\`\`\`typescript
// This does NOT trigger handleError -- it's an expected error
error(404, 'Post not found');

// This DOES trigger handleError -- it's an unhandled exception
throw new Error('Database connection failed');

// This DOES trigger handleError -- null reference
const title = post.title; // post is undefined
\`\`\`

This distinction is critical. Expected errors are part of your application logic -- you chose the status code and message. Unexpected errors are bugs or infrastructure failures that you did not anticipate. The handleError hook exists for the second category.

## Server and Client Error Hooks

There are actually TWO error hooks:

- **\`src/hooks.server.ts\`** -- catches server-side errors (load functions, actions, API routes during SSR)
- **\`src/hooks.client.ts\`** -- catches client-side errors (component rendering errors, client-side navigation failures)

The server hook is more important because server errors are invisible without it -- they are logged to the server console which users and most developers never see in production. The client hook is useful for tracking JavaScript errors that happen after hydration.

\`\`\`typescript
// src/hooks.server.ts
export const handleError: HandleServerError = async ({ error, event, status, message }) => {
  const errorId = crypto.randomUUID();

  // Log with full context for debugging
  console.error(\`[\${errorId}] \${event.request.method} \${event.url.pathname}\`);
  console.error(error);

  // Send to monitoring service
  await reportToSentry({
    error,
    errorId,
    url: event.url.toString(),
    userId: event.locals.user?.id,
    method: event.request.method
  });

  // Return the client-safe error shape
  return {
    message: 'An unexpected error occurred. Please try again.',
    errorId
  };
};
\`\`\`

## The Error Object Shape

What you return from handleError becomes \`$page.error\` in the client. You define the shape in \`src/app.d.ts\`:

\`\`\`typescript
declare global {
  namespace App {
    interface Error {
      message: string;
      errorId?: string;
      code?: string;
    }
  }
}
\`\`\`

This type safety ensures your error pages can reliably access the properties you provide. Without this declaration, \`$page.error\` only has \`message\`.

## The event Parameter: Context for Debugging

The \`event\` parameter gives you the full request context at the time of the error:

\`\`\`typescript
export const handleError: HandleServerError = async ({ error, event, status, message }) => {
  // What URL was requested?
  console.error('URL:', event.url.pathname);

  // What HTTP method?
  console.error('Method:', event.request.method);

  // Who was the user?
  console.error('User:', event.locals.user?.id ?? 'anonymous');

  // What were the route params?
  console.error('Params:', event.params);

  // What was the original status and message SvelteKit assigned?
  console.error('Status:', status, 'Message:', message);

  // The actual error object (might be an Error instance or any thrown value)
  console.error('Error:', error);
};
\`\`\`

The \`status\` and \`message\` parameters are what SvelteKit would use by default (typically 500 and "Internal Error"). You can override both by returning a custom object.

## Production Error Tracking Patterns

**Sentry integration:**
\`\`\`typescript
import * as Sentry from '@sentry/sveltekit';

export const handleError: HandleServerError = async ({ error, event }) => {
  const errorId = crypto.randomUUID();
  Sentry.captureException(error, {
    extra: {
      errorId,
      url: event.url.toString(),
      userId: event.locals.user?.id
    }
  });
  return { message: 'Something went wrong.', errorId };
};
\`\`\`

**Structured logging for cloud platforms:**
\`\`\`typescript
export const handleError: HandleServerError = async ({ error, event, status }) => {
  const errorId = crypto.randomUUID();

  // Structured JSON log (works with CloudWatch, GCP Logging, etc.)
  console.error(JSON.stringify({
    severity: 'ERROR',
    errorId,
    status,
    url: event.url.pathname,
    method: event.request.method,
    userId: event.locals.user?.id,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString()
  }));

  return { message: 'An unexpected error occurred.', errorId };
};
\`\`\`

## Displaying Errors in +error.svelte

The error page receives the object you returned from handleError via \`$page.error\`:

\`\`\`svelte
<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="error-page">
  <h1>{page.status}</h1>
  <p>{page.error?.message}</p>

  {#if page.error?.errorId}
    <p class="error-id">
      If this problem persists, contact support with reference:
      <code>{page.error.errorId}</code>
    </p>
  {/if}

  <a href="/">Return to home</a>
</div>
\`\`\`

The error ID pattern is valuable for support workflows. A user reports "the page broke," and you ask for the error ID. You search your logs for that ID and find the full stack trace, request URL, and user context.`
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

The object you return from \`handleError\` becomes \`$page.error\`. You can return any shape you want -- a message, an error code, a support ID, etc.

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
