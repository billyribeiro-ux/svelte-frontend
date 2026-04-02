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

Every web page is built on a standard HTML document structure. Even when working with frameworks like Svelte, understanding this structure is essential because it determines how the browser parses, renders, and exposes your page to the outside world.

A proper HTML document has:
- **\`<!DOCTYPE html>\`** — Tells the browser to use modern standards
- **\`<html>\`** — The root element (with a \`lang\` attribute for accessibility)
- **\`<head>\`** — Metadata, title, links, and scripts
- **\`<body>\`** — The visible content

## WHY: DOCTYPE Prevents Quirks Mode

When browsers encounter a page without a DOCTYPE, they enter **quirks mode** — a backward-compatible rendering mode from the early 2000s that changes how the box model, table sizing, and inline element behavior work. In quirks mode, \`width\` includes padding and borders (like the old IE box model), table cells cannot inherit font sizes, and certain CSS properties are simply ignored.

By declaring \`<!DOCTYPE html>\` as the very first line, you force the browser into **standards mode**, which means consistent, predictable rendering across all modern browsers. This single line is the difference between CSS behaving as documented and CSS behaving unpredictably.

**Decision framework:** Always include \`<!DOCTYPE html>\`. There is no legitimate reason to omit it in any page created after 2010. If you see pages without it, they are either ancient legacy code or a bug.

## WHY: charset Prevents Mojibake

You have probably seen garbled text on a web page — something like "CafÃ©" instead of "Cafe" or "ä¸­æ" instead of Chinese characters. This is called **mojibake**, and it happens when the browser guesses the wrong character encoding.

\`<meta charset="utf-8">\` must appear within the first 1024 bytes of the document. The browser's parsing algorithm reads the raw bytes of the file, and if it does not find a charset declaration early enough, it falls back to heuristics that often guess wrong. UTF-8 covers virtually every writing system on Earth, so declaring it explicitly ensures your text renders correctly regardless of the user's locale.

**Decision framework:** Always use UTF-8. There is no practical reason to choose another encoding for new web projects. Place the charset meta tag as the very first element inside \`<head>\`.

## WHY: Meta Viewport Enables Mobile Rendering

Without \`<meta name="viewport" content="width=device-width, initial-scale=1">\`, mobile browsers render your page as if it were a desktop page scaled down to fit a tiny screen. The page appears zoomed out to around 980px width, and users must pinch to zoom.

This meta tag tells the browser: "The width of my layout should match the device's actual screen width, and start at 1x zoom." It is the single tag that makes responsive design possible on mobile devices.

**Decision framework:** Include the viewport meta tag on every page intended for web consumption. The only exception is content explicitly designed to be viewed only on desktop (and even then, you should question that assumption).`
		},
		{
			type: 'concept-callout',
			content: 'html.document-structure'
		},
		{
			type: 'text',
			content: `## How the Browser Parses Your Document

Understanding the browser's parsing algorithm helps you make better decisions about document structure:

1. **Byte stream** — The browser receives raw bytes from the network
2. **Character encoding** — Bytes are decoded using the charset (which is why charset must come first)
3. **Tokenization** — Characters are converted into tokens: start tags, end tags, attributes, text
4. **Tree construction** — Tokens build the DOM tree, a live representation of your document
5. **Render tree** — The DOM combines with CSSOM (CSS Object Model) to create the render tree
6. **Layout and paint** — The browser calculates positions and paints pixels

The \`<head>\` is parsed first and can block rendering. CSS files referenced in the head are **render-blocking** — the browser will not paint a single pixel until those stylesheets are downloaded and parsed. Scripts in the head are **parser-blocking** by default (unless marked \`async\` or \`defer\`).

This is why element order in \`<head>\` matters: charset first, then viewport, then CSS, then scripts with defer.

## Building the Structure in Svelte

In a Svelte app, the framework handles the overall document shell for you — SvelteKit generates the \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, and \`<body>\` elements automatically. But you still control what goes in the \`<head>\` from within your components using \`<svelte:head>\`.

Look at the starter code. It is a bare component with no structure.

**Task:** Add an HTML skeleton with semantic structure — a heading, a paragraph of content, and a footer.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Meta Tags and the Head

Meta tags provide information about the page to browsers, search engines, and social media platforms. The most important ones are:

\`\`\`html
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="Page description for SEO" />
\`\`\`

Beyond these essentials, there are Open Graph tags for social sharing (\`og:title\`, \`og:image\`), Twitter Card tags, and \`robots\` directives for search engine crawling. But the three above are the non-negotiable minimum.

In Svelte, you add these using \`<svelte:head>\`. This special element lets any component inject elements into the document \`<head>\` at runtime. When the component is destroyed, Svelte automatically removes the injected elements — preventing memory leaks and stale metadata.

**Task:** Add a \`<svelte:head>\` block with a charset meta tag.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how `<svelte:head>` injects elements into the document `<head>` at runtime. Notice that the charset declaration and title appear in the actual document head, not in the component\'s rendered output. This is how Svelte bridges component-level code with the global document structure — each component can contribute to the head independently, and cleanup happens automatically on unmount.'
		},
		{
			type: 'text',
			content: `## Dynamic Page Titles

Every page should have a descriptive \`<title>\`. The title appears in browser tabs, bookmarks, search results, and screen reader announcements when navigating between pages. It is one of the strongest on-page SEO signals.

In Svelte, you can make titles dynamic and reactive:

\`\`\`svelte
<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>
\`\`\`

Because \`<svelte:head>\` participates in Svelte's reactivity system, the document title updates automatically whenever \`pageTitle\` changes. This is useful for showing notification counts, current page names, or dynamic content titles.

**Task:** Add a \`<title>\` inside your \`<svelte:head>\` block.

## Realistic Exercise: Audit a Real Page

After completing the checkpoints above, think about this scenario: you inherit a legacy page that loads slowly and renders incorrectly on mobile. Your audit checklist should be:

1. Is \`<!DOCTYPE html>\` the very first line? (If not, you are in quirks mode)
2. Is \`<meta charset="utf-8">\` within the first 1024 bytes of the \`<head>\`?
3. Is the viewport meta tag present? (If not, mobile users see a tiny zoomed-out page)
4. Are CSS files loaded before scripts in the \`<head>\`? (If not, rendering may be delayed by script parsing)
5. Do all scripts use \`defer\` or \`async\`? (If not, they block HTML parsing)

This is the document structure checklist that professional frontend developers run on every project.`
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
