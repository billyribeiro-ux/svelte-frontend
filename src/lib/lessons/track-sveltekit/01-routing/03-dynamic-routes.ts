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

## Why Dynamic Routes Are Necessary

Static routes can only take you so far. The moment your app manages content -- blog posts, user profiles, product pages, documentation sections -- you need URLs that contain variable segments. \`/blog/my-first-post\` and \`/blog/svelte-is-great\` are different URLs that should render the same component with different data. Hard-coding a route file for every possible blog post is obviously impractical.

Dynamic routes solve this by letting you define **parameterized segments** in your file structure. SvelteKit uses square brackets to denote dynamic segments:

- \`src/routes/blog/[slug]/+page.svelte\` matches \`/blog/hello-world\`, \`/blog/my-post\`, \`/blog/anything\`
- The value of \`slug\` is extracted and made available through \`$page.params\` in components and the \`params\` object in load functions

This is a compile-time convention. SvelteKit reads the directory name, sees the brackets, and generates a route entry with a regex pattern that captures the segment. At runtime, the captured value is a plain string -- always a string, even if it looks like a number.

## Route Priority and Conflict Resolution

When multiple routes could match a URL, SvelteKit follows a deterministic priority system:

1. **Static segments beat dynamic segments.** \`/blog/featured\` (a static route) will match before \`/blog/[slug]\` for the URL \`/blog/featured\`.
2. **Dynamic segments beat rest parameters.** \`/files/[name]\` matches before \`/files/[...path]\` for a single-segment path.
3. **More specific matchers beat less specific ones.** \`/items/[id=integer]\` (with a matcher constraint) takes priority over \`/items/[id]\` (unconstrained).
4. **Earlier segments take priority.** If two routes differ only in later segments, the one with more static segments earlier wins.

This priority system means you can layer routes without worrying about ordering -- unlike Express or other frameworks where route definition order matters. The file system has no inherent order, so SvelteKit must use structural rules instead.

Understanding these priorities is critical when you encounter unexpected 404s or wrong-route matches. If a URL is hitting a different route than expected, examine the route tree for more specific or more static alternatives that might be matching first.

## Rest Parameters: Capturing Variable Depth

Sometimes a parameter spans multiple path segments. A file browser needs to handle \`/files/docs\`, \`/files/docs/2024\`, and \`/files/docs/2024/reports/q3.pdf\` with a single route. Rest parameters using the \`[...name]\` syntax capture everything from that point forward:

\`\`\`
src/routes/files/[...path]/+page.svelte
\`\`\`

The \`path\` parameter will be \`"docs"\`, \`"docs/2024"\`, or \`"docs/2024/reports/q3.pdf"\` -- a single string with slashes intact. You split it yourself if you need individual segments.

Rest parameters also match the **empty string**. \`/files/[...path]/+page.svelte\` matches \`/files\` itself, with \`path\` being an empty string. This makes rest parameters useful for optional catch-all routes, but it can also cause unexpected matches if you are not careful.

**Key design decision:** Use rest parameters only when the depth is genuinely variable. If you always have exactly two dynamic segments, use \`[category]/[item]\` rather than \`[...path]\`. Explicit parameters give you type safety and clearer intent.

## Parameter Matchers: Constraining What Matches

Unconstrained dynamic parameters match any string, which can lead to ambiguity. If \`/users/[id]\` and \`/users/settings\` both exist, the static route wins for \`/users/settings\`, but what about \`/users/abc\`? If IDs are always numeric, you want \`/users/abc\` to 404 rather than trying to load a non-existent user.

Parameter matchers solve this. Create a file in \`src/params/\` that exports a \`match\` function:

\`\`\`typescript
// src/params/integer.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  return /^\\d+$/.test(param);
};
\`\`\`

Then reference the matcher in your route directory name:

\`\`\`
src/routes/users/[id=integer]/+page.svelte
\`\`\`

Now \`/users/42\` matches but \`/users/abc\` does not. If no other route matches \`/users/abc\`, the user sees a 404.

Matchers run during route resolution on both server and client. They must be pure functions (no side effects, no async) and should be fast -- they run on every navigation attempt. Common matchers include \`integer\`, \`uuid\`, and \`slug\` (alphanumeric with hyphens).

## SSR Considerations for Dynamic Routes

During server-side rendering, parameters come from the URL of the incoming HTTP request. The server parses the URL, matches it against the route tree, extracts parameters, and passes them to your load function. The load function uses these parameters to fetch the right data (e.g., querying a database for a blog post by slug).

During client-side navigation, SvelteKit extracts parameters from the new URL, calls the load function (which may run on the server or client depending on whether it is a \`+page.server.ts\` or \`+page.ts\`), and updates the page. The component receives new params reactively.

**Critical pattern:** Always validate parameters in your load function. A dynamic route parameter is user-controlled input. Even with matchers, you should validate that the resource exists:

\`\`\`typescript
export const load: PageServerLoad = async ({ params }) => {
  const post = await db.posts.findBySlug(params.slug);
  if (!post) {
    error(404, 'Post not found');
  }
  return { post };
};
\`\`\`

Without this check, your page component will try to render with \`undefined\` data, producing a confusing runtime error instead of a clean 404.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.routing.dynamic'
		},
		{
			type: 'text',
			content: `## Basic Dynamic Params

Look at the starter code -- you have a blog post page with a \`[slug]\` parameter.

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

- \`src/routes/files/[...path]/+page.svelte\` matches \`/files/docs/2024/report.pdf\`

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
