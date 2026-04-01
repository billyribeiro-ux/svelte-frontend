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

When something goes wrong — a page isn't found, a load function throws, or a server error occurs — SvelteKit renders an \`+error.svelte\` component.

You can create error pages at any level of your route hierarchy. SvelteKit walks up the tree to find the nearest error boundary.`
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
