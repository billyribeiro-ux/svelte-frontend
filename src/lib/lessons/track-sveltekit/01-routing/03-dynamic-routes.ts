import type { Lesson } from '$types/lesson';

export const dynamicRoutes: Lesson = {
	id: 'sveltekit.routing.dynamic-routes',
	slug: 'dynamic-routes',
	title: 'Dynamic Routes',
	description: 'Use [param], [...rest], and optional parameters to build dynamic route patterns.',
	trackId: 'sveltekit',
	moduleId: 'routing',
	order: 3,
	estimatedMinutes: 15,
	concepts: ['sveltekit.routing.dynamic', 'sveltekit.routing.params'],
	prerequisites: ['sveltekit.routing.file-based'],

	content: [
		{
			type: 'text',
			content: `# Dynamic Route Parameters

Static routes are useful, but most apps need dynamic segments. In SvelteKit, you create dynamic routes by wrapping a directory name in square brackets:

- \`src/routes/blog/[slug]/+page.svelte\` → matches \`/blog/hello-world\`, \`/blog/my-post\`
- The value of \`slug\` is available via the \`params\` object in load functions and via \`$page.params\` in components.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.routing.dynamic'
		},
		{
			type: 'text',
			content: `## Basic Dynamic Params

Look at the starter code — you have a blog post page with a \`[slug]\` parameter.

**Your task:** Display the slug from the URL in the page using \`$page.params\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Rest Parameters

Sometimes you need to match an unknown number of route segments. Use \`[...rest]\` to capture everything:

- \`src/routes/files/[...path]/+page.svelte\` → matches \`/files/docs/2024/report.pdf\`

**Task:** Create a catch-all route that displays the full path.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Parameter Matchers

You can constrain parameters with matchers. Create a matcher in \`src/params/\` and reference it with \`[param=matcher]\`:

\`\`\`typescript
// src/params/integer.ts
export function match(param: string) {
  return /^\\d+$/.test(param);
}
\`\`\`

Then use \`[id=integer]\` in your route directory name.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: 'blog/[slug]/+page.svelte',
			path: '/blog/[slug]/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { page } from '$app/state';
</script>

<!-- TODO: Display the blog post slug from the URL -->
<h1>Blog Post</h1>`
		},
		{
			name: 'files/[...path]/+page.svelte',
			path: '/files/[...path]/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { page } from '$app/state';
</script>

<!-- TODO: Display the full file path from the URL -->
<h1>File Viewer</h1>`
		},
		{
			name: 'params/integer.ts',
			path: '/params/integer.ts',
			language: 'typescript',
			content: `// TODO: Create a parameter matcher that only matches integers
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return false; // Fix this
};`
		}
	],

	solutionFiles: [
		{
			name: 'blog/[slug]/+page.svelte',
			path: '/blog/[slug]/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { page } from '$app/state';
</script>

<h1>Blog Post: {page.params.slug}</h1>
<p>You are reading the post with slug: <code>{page.params.slug}</code></p>`
		},
		{
			name: 'files/[...path]/+page.svelte',
			path: '/files/[...path]/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { page } from '$app/state';
</script>

<h1>File Viewer</h1>
<p>Current path: <code>{page.params.path}</code></p>`
		},
		{
			name: 'params/integer.ts',
			path: '/params/integer.ts',
			language: 'typescript',
			content: `import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\\d+$/.test(param);
};`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Display the dynamic slug parameter from the URL',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'page.params.slug' }]
				}
			},
			hints: [
				'Import `page` from `$app/state` to access route params.',
				'Use `page.params.slug` to read the slug value from the URL.',
				'Display it in the template: `{page.params.slug}`.'
			],
			conceptsTested: ['sveltekit.routing.dynamic']
		},
		{
			id: 'cp-2',
			description: 'Create a catch-all route using rest parameters',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'page.params.path' }]
				}
			},
			hints: [
				'Rest params capture all remaining URL segments as a single string.',
				'Access the value with `page.params.path`.',
				'Display the captured path: `{page.params.path}`.'
			],
			conceptsTested: ['sveltekit.routing.params']
		},
		{
			id: 'cp-3',
			description: 'Create a parameter matcher for integers',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'regex', value: '/\\^\\\\d\\+\\$/' }]
				}
			},
			hints: [
				'A matcher is a function that returns `true` if the param is valid.',
				'Use a regex like `/^\\d+$/` to test for integer values.',
				'Return `true` from the match function when the regex test passes.'
			],
			conceptsTested: ['sveltekit.routing.params']
		}
	]
};
