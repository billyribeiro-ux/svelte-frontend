import type { Lesson } from '$types/lesson';

export const documentStructure: Lesson = {
	id: 'foundations.html-essentials.document-structure',
	slug: 'document-structure',
	title: 'HTML Document Structure',
	description: 'Understand the essential structure of an HTML document — DOCTYPE, html, head, body, and meta tags.',
	trackId: 'foundations',
	moduleId: 'html-essentials',
	order: 1,
	estimatedMinutes: 10,
	concepts: ['html.document-structure', 'html.meta-tags', 'svelte5.special-elements.head'],
	prerequisites: [],

	content: [
		{
			type: 'text',
			content: `# HTML Document Structure

Every web page is built on a standard HTML document structure. Even when working with frameworks like Svelte, understanding this structure is essential.

A proper HTML document has:
- **\`<!DOCTYPE html>\`** — Tells the browser to use modern standards
- **\`<html>\`** — The root element
- **\`<head>\`** — Metadata, title, links, and scripts
- **\`<body>\`** — The visible content`
		},
		{
			type: 'concept-callout',
			content: 'html.document-structure'
		},
		{
			type: 'text',
			content: `## Building the Structure

In a Svelte app, the framework handles the overall document shell for you. But you still need to understand it — especially when adding to the \`<head>\`.

Look at the starter code. It's a bare component with no structure.

**Task:** Add an HTML skeleton with semantic structure — a heading, a paragraph of content, and a footer.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Meta Tags and the Head

Meta tags provide information about the page to browsers and search engines. The most important ones are:

\`\`\`html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="Page description for SEO" />
\`\`\`

In Svelte, you add these using \`<svelte:head>\`.

**Task:** Add a \`<svelte:head>\` block with a charset meta tag.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how `<svelte:head>` injects elements into the document `<head>` at runtime. This is how Svelte bridges component-level code with the global document structure.'
		},
		{
			type: 'text',
			content: `## Dynamic Page Titles

Every page should have a descriptive \`<title>\`. In Svelte, you can make it dynamic:

\`\`\`svelte
<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>
\`\`\`

**Task:** Add a \`<title>\` inside your \`<svelte:head>\` block.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let pageTitle = $state('My First Page');
</script>

<!-- TODO: Add svelte:head with meta and title -->
<!-- TODO: Add proper HTML structure with heading and content -->

<div>Hello</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let pageTitle = $state('My First Page');
</script>

<svelte:head>
  <meta charset="utf-8" />
  <title>{pageTitle}</title>
</svelte:head>

<header>
  <h1>{pageTitle}</h1>
</header>

<main>
  <p>Welcome to your first properly structured page.</p>
</main>

<footer>
  <p>Built with Svelte</p>
</footer>

<style>
  header {
    border-bottom: 1px solid #e2e8f0;
    padding-block-end: 1rem;
    margin-block-end: 1rem;
  }

  h1 {
    color: var(--sf-accent, #6366f1);
    font-family: system-ui, sans-serif;
  }

  main {
    padding: 1rem 0;
    font-family: system-ui, sans-serif;
  }

  footer {
    border-top: 1px solid #e2e8f0;
    padding-block-start: 1rem;
    margin-block-start: 1rem;
    color: #94a3b8;
    font-family: system-ui, sans-serif;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add proper HTML structure with heading, content, and footer',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '<h[1-6]>' },
						{ type: 'contains', value: '<footer>' }
					]
				}
			},
			hints: [
				'Replace the bare `<div>Hello</div>` with structured content.',
				'Use a heading (`<h1>`), a paragraph (`<p>`), and a `<footer>`.',
				'Add: `<header><h1>{pageTitle}</h1></header><main><p>Welcome!</p></main><footer><p>Built with Svelte</p></footer>`'
			],
			conceptsTested: ['html.document-structure']
		},
		{
			id: 'cp-2',
			description: 'Add svelte:head with a meta charset tag',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<svelte:head>' },
						{ type: 'contains', value: 'charset' }
					]
				}
			},
			hints: [
				'`<svelte:head>` lets you add elements to the document head from a component.',
				'Add `<meta charset="utf-8" />` inside the head block.',
				'Add: `<svelte:head><meta charset="utf-8" /></svelte:head>`'
			],
			conceptsTested: ['html.meta-tags', 'svelte5.special-elements.head']
		},
		{
			id: 'cp-3',
			description: 'Add a dynamic title inside svelte:head',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '<title>\\{.*\\}</title>' }
					]
				}
			},
			hints: [
				'A `<title>` tag goes inside `<svelte:head>` just like any other head element.',
				'Use a template expression to make it dynamic: `<title>{pageTitle}</title>`.',
				'Inside your existing `<svelte:head>`, add `<title>{pageTitle}</title>`.'
			],
			conceptsTested: ['svelte5.special-elements.head']
		}
	]
};
