import type { Lesson } from '$types/lesson';

export const fileBasedRouting: Lesson = {
	id: 'sveltekit.routing.file-based-routing',
	slug: 'file-based-routing',
	title: 'File-Based Routing',
	description: 'Learn how SvelteKit maps files in the routes directory to URLs in your app.',
	trackId: 'sveltekit',
	moduleId: 'routing',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['sveltekit.routing.file-based', 'sveltekit.routing.pages'],
	prerequisites: ['svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# File-Based Routing in SvelteKit

SvelteKit uses **file-based routing**, meaning the structure of your \`src/routes\` directory directly maps to the URLs in your application.

Every \`+page.svelte\` file inside \`src/routes\` becomes a page. The file path determines the URL:

- \`src/routes/+page.svelte\` → \`/\`
- \`src/routes/about/+page.svelte\` → \`/about\`
- \`src/routes/blog/post/+page.svelte\` → \`/blog/post\``
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.routing.file-based'
		},
		{
			type: 'text',
			content: `## Creating Your First Page

Look at the starter code — you have a basic \`+page.svelte\` file. This is the home page of the app, rendered at \`/\`.

**Your task:** Create a simple home page with a heading and a navigation link to an about page.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Adding More Routes

Each directory inside \`src/routes\` creates a new route segment. By adding a \`+page.svelte\` file inside a directory, you create a new page.

**Task:** Create an about page by adding content to the \`about/+page.svelte\` file. Include a link back to the home page using an \`<a>\` tag.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Navigation with Anchor Tags

In SvelteKit, you navigate between pages using standard \`<a>\` tags. SvelteKit automatically intercepts these clicks and performs client-side navigation — no full page reload needed.

**Task:** Add navigation links between both pages so users can move back and forth.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<!-- Home page: src/routes/+page.svelte -->
<h1>Welcome</h1>

<!-- TODO: Add a paragraph and a link to /about -->`
		},
		{
			name: 'about/+page.svelte',
			path: '/about/+page.svelte',
			language: 'svelte',
			content: `<!-- About page: src/routes/about/+page.svelte -->
<!-- TODO: Add content and a link back to / -->`
		}
	],

	solutionFiles: [
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<!-- Home page: src/routes/+page.svelte -->
<h1>Welcome</h1>

<p>This is the home page of our SvelteKit app.</p>

<nav>
  <a href="/about">About</a>
</nav>`
		},
		{
			name: 'about/+page.svelte',
			path: '/about/+page.svelte',
			language: 'svelte',
			content: `<!-- About page: src/routes/about/+page.svelte -->
<h1>About</h1>

<p>This is the about page.</p>

<nav>
  <a href="/">Home</a>
</nav>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a home page with a heading and navigation link',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<h1>' },
						{ type: 'contains', value: 'href=' }
					]
				}
			},
			hints: [
				'Start by adding an `<h1>` element with a welcome message.',
				'Use a standard `<a>` tag with an `href` attribute to link to another page.',
				'Add `<a href="/about">About</a>` to create a link to the about page.'
			],
			conceptsTested: ['sveltekit.routing.file-based']
		},
		{
			id: 'cp-2',
			description: 'Create an about page with content and a link back to home',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<h1>' },
						{ type: 'regex', value: 'href=["\']/' }
					]
				}
			},
			hints: [
				'Add an `<h1>` heading to the about page.',
				'Include an `<a>` tag linking back to the home page at `/`.',
				'Add `<a href="/">Home</a>` to navigate back to the root route.'
			],
			conceptsTested: ['sveltekit.routing.pages']
		},
		{
			id: 'cp-3',
			description: 'Both pages have working navigation links to each other',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '/about' },
						{ type: 'regex', value: 'href=["\']/"' }
					]
				}
			},
			hints: [
				'Make sure the home page links to `/about`.',
				'Make sure the about page links to `/`.',
				'Wrap your links in a `<nav>` element for semantic HTML.'
			],
			conceptsTested: ['sveltekit.routing.file-based', 'sveltekit.routing.pages']
		}
	]
};
