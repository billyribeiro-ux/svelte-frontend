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
- **Maintainability** — Developers can read the structure at a glance

## WHY: The Accessibility Tree

When the browser parses your HTML, it builds two trees: the **DOM tree** (which JavaScript and CSS interact with) and the **accessibility tree** (which assistive technology reads). The accessibility tree is a simplified version of the DOM that strips out purely decorative elements and exposes semantic information.

A \`<div>\` with a class name like \`"header"\` appears in the accessibility tree as a generic group with no role. A \`<header>\` element automatically receives the ARIA role of \`banner\`, which screen readers announce as a landmark. This distinction is the difference between a screen reader user hearing "group" (meaningless) and hearing "banner navigation" (they know exactly where they are).

**Screen reader navigation pattern:** Users do not read pages linearly. They press shortcut keys to jump between landmarks:
- **H** — Jump to next heading
- **D** — Jump to next landmark region
- **K** — Jump to next link
- **Tab** — Jump to next focusable element

If your page is all \`<div>\` elements, landmarks do not exist, and users cannot jump. They are forced to tab through every single element. On a complex page with 50+ elements, this is the difference between 3 seconds and 3 minutes to find the main content.

## WHY: SEO Semantic Signals

Search engine crawlers use semantic elements to understand content hierarchy and importance. When Google encounters an \`<article>\` element, it treats the content as a self-contained piece that could appear in search snippets, news carousels, or featured results. A \`<nav>\` tells crawlers "these are navigation links, not content links" — so they are weighted differently in link analysis.

The \`<main>\` element is particularly important: it signals "this is the primary content of this page." If your main content is buried inside nested \`<div>\` elements, crawlers rely on heuristics (and sometimes guess wrong) to identify what matters.

## Decision Framework: article vs section vs div

Choosing the right element is a common source of confusion. Use this decision tree:

1. **Can this content stand alone?** (syndicated, shared, or reposted independently) → \`<article>\`. Examples: blog post, news story, comment, product card, social media post.
2. **Is this a thematic grouping with a heading?** (part of a larger document, grouped by topic) → \`<section>\`. Examples: "Features" section on a landing page, chapters of a document, tabbed content panels.
3. **Is this purely for layout or styling?** (no semantic meaning) → \`<div>\`. Examples: flex wrapper, grid container, styling hook.

**The litmus test for \`<article>\`:** If you removed this content from the page and put it on a blank page, would it still make sense? If yes, it is an article.

**The litmus test for \`<section>\`:** Does it have a natural heading? If you cannot think of a heading for it, it probably should not be a \`<section>\`.`
		},
		{
			type: 'concept-callout',
			content: 'html.semantic-elements'
		},
		{
			type: 'text',
			content: `## Replace Divs with Semantic Elements

Look at the starter code — it is "div soup." Every structural element is a generic \`<div>\` with a class name for styling. This pattern is common in legacy codebases and in code written by developers who learned HTML before HTML5 semantic elements existed.

The problem is not just philosophical. Screen readers announce \`<div class="header">\` as "group" and \`<header>\` as "banner." Search engines cannot distinguish your navigation from your content. New developers joining the project must read class names to understand structure instead of seeing it in the element names.

**Task:** Replace the outer layout divs with their semantic equivalents: \`<header>\`, \`<main>\`, and \`<footer>\`.

When you make this change, remember to update the CSS selectors too. \`.header { }\` becomes \`header { }\`. In Svelte's scoped styles, this is safe because selectors are automatically scoped to the component.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Navigation with <nav>

The \`<nav>\` element represents a section of navigation links. It tells assistive technology "this is a navigation area," which creates a landmark that users can jump to directly.

\`\`\`html
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/contact">Contact</a>
</nav>
\`\`\`

**Not every group of links is a \`<nav>\`.** A list of links in a footer or a set of social media icons does not necessarily need \`<nav>\`. Reserve \`<nav>\` for major navigation blocks — primary site navigation, breadcrumbs, pagination, and table of contents. If your page has multiple \`<nav>\` elements, use \`aria-label\` to distinguish them:

\`\`\`html
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Breadcrumb">...</nav>
\`\`\`

**Task:** Add a \`<nav>\` element inside the header with navigation links.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Think about how a screen reader user would navigate this page. With semantic elements in place, they hear: "banner" (header), "navigation" with 3 links, "main" (content area), "article" with heading "My First Post", and "content info" (footer). Without semantic elements, they hear: "group, group, group, group" — completely useless. Toggle X-Ray mode and trace the landmark regions that assistive technology uses to let users jump between sections.'
		},
		{
			type: 'text',
			content: `## Content with <article> and <section>

- **\`<article>\`** — Self-contained content that could stand alone (blog post, news story, comment, product review)
- **\`<section>\`** — A thematic grouping of content, typically with a heading

\`\`\`html
<main>
  <article>
    <h2>Blog Post Title</h2>
    <p>Post content...</p>
  </article>
</main>
\`\`\`

Articles can be nested: a blog post (\`<article>\`) containing comments (each also an \`<article>\`). Sections can contain articles: a "Latest Posts" \`<section>\` containing multiple \`<article>\` elements.

**Common mistakes to avoid:**
- Using \`<section>\` as a generic wrapper (use \`<div>\` instead)
- Using \`<article>\` for content that does not stand alone (use \`<section>\`)
- Nesting \`<main>\` inside other landmarks (there should be only one \`<main>\` per page, and it should not be inside \`<article>\`, \`<aside>\`, \`<header>\`, \`<footer>\`, or \`<nav>\`)

**Task:** Wrap the content area in an \`<article>\` element.

## Realistic Exercise: Semantic Audit

After completing the checkpoints, try this exercise with any website you use daily:

1. Open browser DevTools and inspect the page structure
2. Count how many \`<div>\` elements are used where semantic elements would be appropriate
3. Identify the landmark regions: is there a \`<main>\`? A \`<nav>\`? Is the footer a \`<footer>\` or a \`<div>\`?
4. Use a screen reader (VoiceOver on Mac, NVDA on Windows) to navigate the page by landmarks — press D to jump between landmark regions

You will quickly discover that even major websites often have poor semantic HTML. This is a genuine competitive advantage — pages with proper semantics rank better, are more accessible, and are easier to maintain.`
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
