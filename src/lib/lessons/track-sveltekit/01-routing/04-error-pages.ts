import type { Lesson } from '$types/lesson';

export const errorPages: Lesson = {
	id: 'sveltekit.routing.error-pages',
	slug: 'error-pages',
	title: 'Error Pages',
	description: 'Handle errors gracefully with +error.svelte, custom 404 pages, and error boundaries.',
	trackId: 'sveltekit',
	moduleId: 'routing',
	order: 4,
	estimatedMinutes: 12,
	concepts: ['sveltekit.routing.errors', 'sveltekit.routing.error-pages'],
	prerequisites: ['sveltekit.routing.file-based'],

	content: [
		{
			type: 'text',
			content: `# Error Handling in SvelteKit

## Why Error Handling Is an Architectural Decision

Error handling in web applications is often an afterthought -- developers build the happy path and bolt on error pages later. SvelteKit inverts this by making error handling a first-class part of the routing system. Error boundaries are defined in the file system alongside layouts and pages, because where and how errors are caught fundamentally shapes the user experience.

Consider the difference: if an API call fails while loading a dashboard widget, should the entire page show an error? Or should the dashboard layout remain visible with just the failing widget showing an error state? The answer depends on your error boundary placement, and SvelteKit lets you control this precisely through the \`+error.svelte\` file hierarchy.

## Expected vs. Unexpected Errors

SvelteKit distinguishes between two categories of errors, and understanding this distinction is essential:

**Expected errors** are errors you explicitly throw using SvelteKit's \`error()\` helper. These are part of your application logic -- a 404 when a resource is not found, a 403 when the user lacks permissions, a 410 when content has been deleted. You control the status code and message. These errors are safe to display to users because you authored them.

\`\`\`typescript
import { error } from '@sveltejs/kit';

// This is an expected error -- you control the message
if (!post) {
  error(404, 'This post does not exist');
}
\`\`\`

**Unexpected errors** are everything else -- unhandled exceptions, network failures, null reference errors, database connection drops. SvelteKit catches these, logs them (via the \`handleError\` hook), and presents a generic error to the user. The actual error details are NEVER sent to the client because they might contain stack traces, file paths, database queries, or other sensitive information.

This is a critical security boundary. When you throw \`error(404, 'Not found')\`, the string \`'Not found'\` reaches the client. When your code throws \`new Error('Connection to postgres://user:password@host failed')\`, SvelteKit replaces this with a generic \`'Internal Error'\` before sending it to the browser.

## The Error Boundary Chain

SvelteKit walks up the route tree to find the nearest \`+error.svelte\` component when an error occurs:

\`\`\`
src/routes/
  +layout.svelte
  +error.svelte              --> catches errors for all pages
  dashboard/
    +layout.svelte
    +error.svelte            --> catches errors in /dashboard/*
    analytics/
      +page.svelte           --> if this errors, dashboard/+error.svelte catches it
  blog/
    [slug]/
      +page.svelte           --> if this errors, root +error.svelte catches it
\`\`\`

The boundary walk follows a specific rule: an error page renders inside the **nearest layout that did NOT error**. If a page's load function throws, the error component replaces the page within the parent layout. If a layout's load function throws, SvelteKit walks further up to find a layout that succeeded.

This means the root \`+layout.svelte\` is special -- if IT throws an error, there is no layout to render the error page inside. SvelteKit falls back to a bare-bones HTML error page. For this reason, keep your root layout's load function as simple and robust as possible. Avoid making API calls or database queries in the root layout load if they could fail.

## How Errors Flow During SSR and Hydration

During SSR, if a load function throws:
1. SvelteKit catches the error
2. It identifies the nearest \`+error.svelte\` boundary
3. It renders the layout tree up to (but not including) the erroring component, placing \`+error.svelte\` where the page would have been
4. The complete HTML (with error UI) is sent to the browser
5. The browser hydrates the error state -- the error page is interactive from the start

During client-side navigation, the process is similar but happens in-browser:
1. SvelteKit calls the load function for the target route
2. If it throws, the error boundary catches it
3. The page component is swapped for the error component
4. Layouts above the error boundary remain mounted -- their state (scroll position, open menus) is preserved

This preservation of layout state during errors is subtle but important. If a user navigates from \`/dashboard/overview\` to \`/dashboard/analytics\` and the analytics load fails, the dashboard sidebar stays open and functional. The user can navigate to another dashboard page without losing context.

## The form Prop and Action Errors

Form actions can also produce errors. When an action calls \`fail(status, data)\`, the error data becomes available as the \`form\` prop rather than triggering the error boundary. This is intentional -- a validation error on a form submission should redisplay the form with error messages, not replace the entire page with an error screen.

Only unhandled exceptions in actions trigger error boundaries. \`fail()\` is for recoverable errors (bad input), while thrown exceptions are for unrecoverable errors (database down).

## Decision Framework: Where to Place Error Boundaries

- **Always have a root \`+error.svelte\`.** This is your catch-all. Every app needs one.
- **Add section-level error pages when the section has a distinct layout.** If \`/dashboard\` has its own layout with a sidebar, add \`dashboard/+error.svelte\` so errors render within the dashboard chrome.
- **Do NOT add error pages to every route.** Most routes should let errors bubble up to their section or root boundary. Over-granular error boundaries create maintenance burden.
- **Consider the user's next action.** An error page should always offer a clear path forward -- a "go home" link, a "try again" button, or navigation to a related page.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.routing.errors'
		},
		{
			type: 'text',
			content: `## Creating a Custom Error Page

The default error page is minimal. You can replace it by creating \`+error.svelte\` in your routes.

**Your task:** Create a custom error page that displays the error status and message using \`$page.error\` and \`$page.status\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Throwing Errors in Load Functions

You can throw errors in load functions using SvelteKit's \`error()\` helper. This triggers the nearest \`+error.svelte\` boundary.

\`\`\`typescript
import { error } from '@sveltejs/kit';

export function load({ params }) {
  if (!params.id) {
    error(404, 'Not found');
  }
}
\`\`\`

**Task:** Add error handling to the load function that returns a 404 when a post is not found.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: '+error.svelte',
			path: '/+error.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { page } from '$app/state';
</script>

<!-- TODO: Display error status and message -->
<h1>Error</h1>`
		},
		{
			name: 'post/[id]/+page.server.ts',
			path: '/post/[id]/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

const posts = new Map([
  ['1', { title: 'First Post', content: 'Hello world' }],
  ['2', { title: 'Second Post', content: 'Another post' }]
]);

export const load: PageServerLoad = async ({ params }) => {
  const post = posts.get(params.id);

  // TODO: Throw a 404 error if post is not found

  return { post };
};`
		},
		{
			name: 'post/[id]/+page.svelte',
			path: '/post/[id]/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>{data.post.title}</h1>
<p>{data.post.content}</p>`
		}
	],

	solutionFiles: [
		{
			name: '+error.svelte',
			path: '/+error.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="error">
  <h1>{page.status}</h1>
  <p>{page.error?.message}</p>
  <a href="/">Go home</a>
</div>

<style>
  .error {
    text-align: center;
    padding: 2rem;
  }

  h1 {
    font-size: 3rem;
    color: #ef4444;
  }
</style>`
		},
		{
			name: 'post/[id]/+page.server.ts',
			path: '/post/[id]/+page.server.ts',
			language: 'typescript',
			content: `import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

const posts = new Map([
  ['1', { title: 'First Post', content: 'Hello world' }],
  ['2', { title: 'Second Post', content: 'Another post' }]
]);

export const load: PageServerLoad = async ({ params }) => {
  const post = posts.get(params.id);

  if (!post) {
    error(404, 'Post not found');
  }

  return { post };
};`
		},
		{
			name: 'post/[id]/+page.svelte',
			path: '/post/[id]/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>{data.post.title}</h1>
<p>{data.post.content}</p>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a custom error page displaying status and message',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'page.status' },
						{ type: 'contains', value: 'page.error' }
					]
				}
			},
			hints: [
				'Import `page` from `$app/state` to access error information.',
				'Use `page.status` for the HTTP status code and `page.error` for the error details.',
				'Display them: `<h1>{page.status}</h1>` and `<p>{page.error?.message}</p>`.'
			],
			conceptsTested: ['sveltekit.routing.error-pages']
		},
		{
			id: 'cp-2',
			description: 'Throw a 404 error when a post is not found',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'error(404' },
						{ type: 'contains', value: 'if (!post)' }
					]
				}
			},
			hints: [
				'Import the `error` helper from `@sveltejs/kit`.',
				'Check if the post exists after looking it up in the map.',
				'Call `error(404, \'Post not found\')` if the post is undefined.'
			],
			conceptsTested: ['sveltekit.routing.errors']
		}
	]
};
