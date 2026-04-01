import type { Lesson } from '$types/lesson';

export const semanticElements: Lesson = {
	id: 'foundations.html-essentials.semantic-elements',
	slug: 'semantic-elements',
	title: 'Semantic HTML Elements',
	description: 'Replace generic divs with semantic elements like header, main, article, section, nav, and footer.',
	trackId: 'foundations',
	moduleId: 'html-essentials',
	order: 2,
	estimatedMinutes: 12,
	concepts: ['html.semantic-elements', 'html.landmarks', 'html.accessibility'],
	prerequisites: ['html.document-structure'],

	content: [
		{
			type: 'text',
			content: `# Semantic HTML Elements

Semantic HTML uses elements that describe their **meaning** rather than just their appearance. Instead of using \`<div>\` for everything, you use elements like \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, and \`<footer>\`.

This helps:
- **Accessibility** — Screen readers can navigate by landmarks
- **SEO** — Search engines understand your content structure
- **Maintainability** — Developers can read the structure at a glance`
		},
		{
			type: 'concept-callout',
			content: 'html.semantic-elements'
		},
		{
			type: 'text',
			content: `## Replace Divs with Semantic Elements

Look at the starter code — it's "div soup". Every structural element is a generic \`<div>\` with a class name for styling.

**Task:** Replace the outer layout divs with their semantic equivalents: \`<header>\`, \`<main>\`, and \`<footer>\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Navigation with <nav>

The \`<nav>\` element represents a section of navigation links. It tells assistive technology "this is a navigation area":

\`\`\`html
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
\`\`\`

**Task:** Add a \`<nav>\` element inside the header with navigation links.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Think about how a screen reader user would navigate this page. Semantic elements create an invisible outline that assistive technology uses to let users jump between sections — header, nav, main content, footer.'
		},
		{
			type: 'text',
			content: `## Content with <article> and <section>

- **\`<article>\`** — Self-contained content that could stand alone (blog post, news story, comment)
- **\`<section>\`** — A thematic grouping of content, typically with a heading

\`\`\`html
<main>
  <article>
    <h2>Blog Post Title</h2>
    <p>Post content...</p>
  </article>
</main>
\`\`\`

**Task:** Wrap the content area in an \`<article>\` element.`
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
  let siteName = $state('My Blog');
</script>

<!-- TODO: Replace divs with semantic elements -->
<div class="header">
  <h1>{siteName}</h1>
  <!-- TODO: Add nav element -->
</div>

<div class="main">
  <!-- TODO: Wrap in article -->
  <h2>My First Post</h2>
  <p>This is the content of my first blog post. It covers important topics and should be wrapped in semantic HTML.</p>
  <p>Using the right elements makes the web better for everyone.</p>
</div>

<div class="footer">
  <p>&copy; 2025 {siteName}</p>
</div>

<style>
  .header {
    border-bottom: 2px solid #e2e8f0;
    padding-block-end: 1rem;
    margin-block-end: 1.5rem;
  }

  h1 {
    color: var(--sf-accent, #6366f1);
    font-family: system-ui, sans-serif;
    margin: 0;
  }

  .main {
    padding: 1rem 0;
    font-family: system-ui, sans-serif;
    line-height: 1.6;
  }

  .footer {
    border-top: 2px solid #e2e8f0;
    padding-block-start: 1rem;
    margin-block-start: 1.5rem;
    color: #94a3b8;
    font-family: system-ui, sans-serif;
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
  let siteName = $state('My Blog');
</script>

<header>
  <h1>{siteName}</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
  </nav>
</header>

<main>
  <article>
    <h2>My First Post</h2>
    <p>This is the content of my first blog post. It covers important topics and should be wrapped in semantic HTML.</p>
    <p>Using the right elements makes the web better for everyone.</p>
  </article>
</main>

<footer>
  <p>&copy; 2025 {siteName}</p>
</footer>

<style>
  header {
    border-bottom: 2px solid #e2e8f0;
    padding-block-end: 1rem;
    margin-block-end: 1.5rem;
  }

  h1 {
    color: var(--sf-accent, #6366f1);
    font-family: system-ui, sans-serif;
    margin: 0;
  }

  nav {
    display: flex;
    gap: 1rem;
    margin-block-start: 0.75rem;
  }

  nav a {
    color: #6366f1;
    text-decoration: none;
  }

  nav a:hover {
    text-decoration: underline;
  }

  main {
    padding: 1rem 0;
    font-family: system-ui, sans-serif;
    line-height: 1.6;
  }

  footer {
    border-top: 2px solid #e2e8f0;
    padding-block-start: 1rem;
    margin-block-start: 1.5rem;
    color: #94a3b8;
    font-family: system-ui, sans-serif;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Replace div.header, div.main, and div.footer with semantic elements',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<header>' },
						{ type: 'contains', value: '<main>' },
						{ type: 'contains', value: '<footer>' }
					]
				}
			},
			hints: [
				'HTML5 provides semantic equivalents for common layout divs.',
				'Replace `<div class="header">` with `<header>`, `<div class="main">` with `<main>`, and `<div class="footer">` with `<footer>`.',
				'Change the tags and update the CSS selectors to match: `header { ... }` instead of `.header { ... }`.'
			],
			conceptsTested: ['html.semantic-elements']
		},
		{
			id: 'cp-2',
			description: 'Add a nav element with links inside the header',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<nav>' },
						{ type: 'regex', value: '<a\\s+href=' }
					]
				}
			},
			hints: [
				'The `<nav>` element groups navigation links together.',
				'Add `<nav>` inside `<header>` with a few `<a>` links.',
				'Add: `<nav><a href="/">Home</a><a href="/about">About</a><a href="/contact">Contact</a></nav>`'
			],
			conceptsTested: ['html.landmarks']
		},
		{
			id: 'cp-3',
			description: 'Wrap the post content in an article element',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<article>' },
						{ type: 'contains', value: '</article>' }
					]
				}
			},
			hints: [
				'`<article>` represents self-contained content — like a blog post.',
				'Wrap the `<h2>` and `<p>` tags inside an `<article>` element.',
				'Inside `<main>`, add `<article>` around all the post content.'
			],
			conceptsTested: ['html.semantic-elements']
		}
	]
};
