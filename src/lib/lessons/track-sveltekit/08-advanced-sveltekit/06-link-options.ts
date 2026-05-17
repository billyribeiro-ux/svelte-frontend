import type { Lesson } from '$types/lesson';

export const linkOptions: Lesson = {
	id: 'sveltekit.advanced-sveltekit.link-options',
	slug: 'link-options',
	title: 'Link Options & Preloading',
	description: 'Fine-tune navigation behavior with data-sveltekit attributes for preloading, scroll control, focus management, and reload behavior.',
	trackId: 'sveltekit',
	moduleId: 'advanced-sveltekit',
	order: 6,
	estimatedMinutes: 15,
	concepts: ['sveltekit.advanced.link-options', 'sveltekit.advanced.preloading'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Link Options & Preloading

## Why Link Behavior Matters for Perceived Performance

When a user clicks a link in a SvelteKit app, several things happen: the target route's code is loaded, its load functions execute, data is fetched, and the page renders. Depending on network conditions and server response times, this can take anywhere from milliseconds to seconds.

The user perceives this as a delay between clicking and seeing the new page. Even 200ms of delay feels sluggish. At 500ms, the user notices. At 1000ms, they wonder if something is broken.

SvelteKit provides a set of \`data-sveltekit-*\` attributes that let you control exactly when and how navigation-related work happens. The most impactful is preloading -- starting the work before the user clicks so the page is ready by the time the click fires.

## data-sveltekit-preload-data

This attribute controls when SvelteKit preloads the target route's data (runs its load functions). It accepts three values:

**\`"hover"\`** -- Preloads when the user hovers over the link. On mobile, this triggers on \`touchstart\`. This gives you 100-200ms of head start on desktop (the time between hover and click) and works on mobile too. This is the default if you set it without a value.

**\`"tap"\`** -- Preloads on \`mousedown\` (or \`touchstart\`). This is more conservative -- the head start is only 50-100ms (the time between mousedown and click/mouseup). Use this when preloading is expensive and you do not want to preload on every casual hover.

**\`"off"\`** -- Disables data preloading entirely. The load function runs only after the click. Use this for links where preloading is wasteful (links the user rarely clicks, or links to heavy pages).

\`\`\`svelte
<!-- Preload on hover (default behavior) -->
<a href="/products" data-sveltekit-preload-data="hover">Products</a>

<!-- Preload only on tap (more conservative) -->
<a href="/admin/reports" data-sveltekit-preload-data="tap">Reports</a>

<!-- No preloading at all -->
<a href="/rarely-visited" data-sveltekit-preload-data="off">Rarely Visited</a>
\`\`\`

The difference in perceived performance is dramatic. With hover preloading, a page with a 200ms load function appears to load instantly because the data was fetched during the hover delay. Without preloading, the user sees the 200ms delay after clicking.

## data-sveltekit-preload-code

Distinct from data preloading, code preloading fetches the JavaScript modules for the target route without running load functions. This is lighter weight -- it only downloads and parses the code.

**\`"eager"\`** -- Preloads code as soon as the link enters the viewport. Useful for primary navigation links that the user is very likely to visit.

**\`"viewport"\`** -- Same as eager, preloads when the link is visible.

**\`"hover"\`** -- Preloads code on hover. This is the default.

**\`"tap"\`** -- Preloads code on mousedown/touchstart.

**\`"off"\`** -- No code preloading.

\`\`\`svelte
<!-- Eagerly preload code for main nav links -->
<nav data-sveltekit-preload-code="eager">
  <a href="/">Home</a>
  <a href="/products">Products</a>
  <a href="/about">About</a>
</nav>

<!-- Only preload code on hover for secondary links -->
<aside data-sveltekit-preload-code="hover">
  <a href="/blog">Blog</a>
  <a href="/careers">Careers</a>
</aside>
\`\`\`

You can combine code preloading and data preloading for maximum speed:

\`\`\`svelte
<!-- Code is preloaded eagerly, data preloads on hover -->
<a
  href="/products"
  data-sveltekit-preload-code="eager"
  data-sveltekit-preload-data="hover"
>
  Products
</a>
\`\`\`

This means the code is ready the moment the page loads. When the user hovers, only the data needs to fetch. By the time they click, everything is ready.

## data-sveltekit-reload

Forces a full page reload instead of client-side navigation. The browser makes a traditional HTTP request, and the entire page is loaded from scratch.

\`\`\`svelte
<!-- Full reload navigation -->
<a href="/legacy-page" data-sveltekit-reload>Legacy Page</a>
\`\`\`

Use cases:
- Links to pages served by a different application on the same domain
- Pages that require a fresh server-side render (e.g., after a deploy)
- Links to pages that depend on server-set cookies that need a full request cycle
- Escaping from a broken client-side state

## data-sveltekit-replacestate

Replaces the current history entry instead of pushing a new one. After clicking, pressing back skips over the current page.

\`\`\`svelte
<!-- Replace instead of push -->
<a href="/search?q=updated" data-sveltekit-replacestate>Update Search</a>
\`\`\`

Use cases:
- Pagination links where each page should not create a history entry (the user does not want to press back 15 times through pages)
- Filter/sort changes that refine the current view
- Redirect-like navigations where the source page should not be in history

\`\`\`svelte
<!-- Pagination: replace state so back doesn't traverse every page -->
<nav class="pagination" data-sveltekit-replacestate>
  {#each pages as pageNum}
    <a href="/products?page={pageNum}">{pageNum}</a>
  {/each}
</nav>
\`\`\`

## data-sveltekit-keepfocus

Normally, SvelteKit resets focus to the \`<body>\` after navigation (for accessibility -- screen readers are notified of the new page). This attribute prevents that, keeping focus on the element that triggered the navigation.

\`\`\`svelte
<!-- Keep focus after navigation (useful for search inputs) -->
<form action="/search" data-sveltekit-keepfocus>
  <input name="q" type="search" placeholder="Search..." />
</form>
\`\`\`

Use cases:
- Search forms where the user types, submits, and wants to keep typing
- Inline editing interfaces where navigation updates data but focus should stay on the input
- Autosave forms that navigate to update the URL but should not disrupt the user

**Warning:** Use this carefully. Resetting focus after navigation is an accessibility feature. Screen reader users rely on it to know that the page has changed. Only suppress it when the focused element is logically the same across navigations.

## data-sveltekit-noscroll

Prevents SvelteKit from scrolling to the top of the page after navigation. By default, SvelteKit scrolls to the top (or to a \`#hash\` target) after every navigation, mimicking browser behavior.

\`\`\`svelte
<!-- Don't scroll to top after navigating -->
<a href="/products?category=shoes" data-sveltekit-noscroll>Shoes</a>
\`\`\`

Use cases:
- Filter links in a sidebar that update the main content but should not scroll up
- Tab-like navigation within a section of the page
- "Load more" links that append content below the current viewport

\`\`\`svelte
<!-- Filter sidebar: don't scroll when changing filters -->
<aside data-sveltekit-noscroll>
  <h3>Categories</h3>
  <a href="/products?cat=shoes">Shoes</a>
  <a href="/products?cat=shirts">Shirts</a>
  <a href="/products?cat=hats">Hats</a>
</aside>
\`\`\`

## Attribute Inheritance

Every \`data-sveltekit-*\` attribute is inherited by descendant elements. Set an attribute on a parent, and all links inside inherit it. Override per-link as needed:

\`\`\`svelte
<!-- All links in body preload on hover by default -->
<body data-sveltekit-preload-data="hover">

  <!-- Main nav: eagerly preload code too -->
  <nav data-sveltekit-preload-code="eager">
    <a href="/">Home</a>
    <a href="/products">Products</a>
    <!-- This one overrides: no preloading -->
    <a href="/external-app" data-sveltekit-preload-data="off" data-sveltekit-reload>
      External App
    </a>
  </nav>

  <!-- Pagination: replace state, no scroll -->
  <div class="pagination" data-sveltekit-replacestate data-sveltekit-noscroll>
    <a href="?page=1">1</a>
    <a href="?page=2">2</a>
    <a href="?page=3">3</a>
  </div>
</body>
\`\`\`

This inheritance model is powerful. You typically set aggressive preloading on \`<body>\` in your root layout and only override for specific cases. The default SvelteKit project template includes \`data-sveltekit-preload-data="hover"\` on the body.

## Setting Defaults in app.html

The most common place to set global defaults is in \`src/app.html\`:

\`\`\`html
<!doctype html>
<html lang="en">
<head>%sveltekit.head%</head>
<body data-sveltekit-preload-data="hover">
  <div id="svelte">%sveltekit.body%</div>
</body>
</html>
\`\`\`

This single attribute makes every link in your app preload data on hover, which is usually the right default for most applications.

## Decision Framework: Choosing the Right Preload Strategy

| Link Type | Code Preload | Data Preload | Why |
|---|---|---|---|
| Primary navigation | eager | hover | Always visible, very likely to be clicked |
| Secondary navigation | hover | hover | Visible but less likely; hover is enough |
| Content links | hover | hover | Default behavior works well |
| Pagination | hover | tap | Many links visible; hover would preload too aggressively |
| Rarely used links | off | off | Not worth the bandwidth |
| External/reload links | off | off | SvelteKit navigation does not apply |

## Programmatic Preloading

In addition to attributes, you can preload programmatically:

\`\`\`typescript
import { preloadData, preloadCode } from '$app/navigation';

// Preload data for a route
await preloadData('/products');

// Preload just the code
await preloadCode('/products');
\`\`\`

This is useful for preloading based on user behavior patterns, analytics, or predictions (e.g., preload the most likely next page after the user completes a form).`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.advanced.link-options'
		},
		{
			type: 'text',
			content: `## Exercise: Build an Optimized Navigation Menu

You will build a navigation layout with a primary nav bar, a sidebar with filter links, and pagination. Each section uses different link options to optimize the user experience.

**Your task:**
1. Set \`data-sveltekit-preload-data="hover"\` on the body or a wrapper
2. Set \`data-sveltekit-preload-code="eager"\` on the primary navigation
3. Add \`data-sveltekit-noscroll\` and \`data-sveltekit-replacestate\` to filter and pagination links`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Fine-Tuning Individual Links

Now override the inherited defaults for specific links that need different behavior. Add a link that forces a full reload and another that keeps focus after navigation.

**Task:** Add \`data-sveltekit-reload\` to an external-app link and \`data-sveltekit-keepfocus\` to a search form.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `Explain the performance difference between data-sveltekit-preload-data="hover" and "tap". How much time does each buy you, and when would you choose one over the other? What are the bandwidth implications of aggressive preloading on a page with many links?`
		},
		{
			type: 'text',
			content: `## Summary

SvelteKit's link options give you surgical control over navigation behavior. Preloading (\`preload-data\`, \`preload-code\`) eliminates perceived latency by starting work before the click. State management (\`replacestate\`, \`noscroll\`, \`keepfocus\`) controls how the browser handles history, scroll position, and focus. Escape hatches (\`reload\`) handle edge cases where client-side navigation is not appropriate. Through inheritance, you set sensible defaults once and override only where needed, keeping your markup clean while delivering optimized navigation throughout the application.`
		}
	],

	starterFiles: [
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { children } = $props();
</script>

<!-- TODO: Add data-sveltekit-preload-data="hover" to the wrapper -->
<div class="app">
  <!-- TODO: Add data-sveltekit-preload-code="eager" to the nav -->
  <nav class="primary-nav">
    <a href="/">Home</a>
    <a href="/products">Products</a>
    <a href="/about">About</a>
    <!-- TODO: Add a link with data-sveltekit-reload for an external app -->
  </nav>

  <div class="content-area">
    <!-- TODO: Add data-sveltekit-noscroll to the filter sidebar -->
    <aside class="filters">
      <h3>Categories</h3>
      <a href="/products?cat=shoes">Shoes</a>
      <a href="/products?cat=shirts">Shirts</a>
      <a href="/products?cat=hats">Hats</a>
    </aside>

    <main>
      {@render children()}
    </main>
  </div>

  <!-- TODO: Add data-sveltekit-replacestate and data-sveltekit-noscroll to pagination -->
  <nav class="pagination">
    <a href="?page=1">1</a>
    <a href="?page=2">2</a>
    <a href="?page=3">3</a>
  </nav>

  <!-- TODO: Add data-sveltekit-keepfocus to the search form -->
  <form action="/search">
    <input name="q" type="search" placeholder="Search..." />
  </form>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .primary-nav {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #1a1a2e;
    color: white;
  }
  .primary-nav a { color: white; text-decoration: none; }
  .content-area {
    display: flex;
    flex: 1;
  }
  .filters {
    width: 200px;
    padding: 1rem;
    background: #f4f4f4;
  }
  .pagination {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    justify-content: center;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { children } = $props();
</script>

<div class="app" data-sveltekit-preload-data="hover">
  <nav class="primary-nav" data-sveltekit-preload-code="eager">
    <a href="/">Home</a>
    <a href="/products">Products</a>
    <a href="/about">About</a>
    <a href="/external-app" data-sveltekit-reload data-sveltekit-preload-data="off">
      External App
    </a>
  </nav>

  <div class="content-area">
    <aside class="filters" data-sveltekit-noscroll>
      <h3>Categories</h3>
      <a href="/products?cat=shoes">Shoes</a>
      <a href="/products?cat=shirts">Shirts</a>
      <a href="/products?cat=hats">Hats</a>
    </aside>

    <main>
      {@render children()}
    </main>
  </div>

  <nav class="pagination" data-sveltekit-replacestate data-sveltekit-noscroll>
    <a href="?page=1">1</a>
    <a href="?page=2">2</a>
    <a href="?page=3">3</a>
  </nav>

  <form action="/search" data-sveltekit-keepfocus>
    <input name="q" type="search" placeholder="Search..." />
  </form>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .primary-nav {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #1a1a2e;
    color: white;
  }
  .primary-nav a { color: white; text-decoration: none; }
  .content-area {
    display: flex;
    flex: 1;
  }
  .filters {
    width: 200px;
    padding: 1rem;
    background: #f4f4f4;
  }
  .pagination {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    justify-content: center;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Apply preloading attributes to the navigation layout',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'data-sveltekit-preload-data' },
						{ type: 'contains', value: 'data-sveltekit-preload-code="eager"' },
						{ type: 'contains', value: 'data-sveltekit-noscroll' }
					]
				}
			},
			hints: [
				'Add `data-sveltekit-preload-data="hover"` to the outermost wrapper div to set the global default.',
				'Add `data-sveltekit-preload-code="eager"` to the primary `<nav>` element so main navigation code is preloaded immediately.',
				'Add `data-sveltekit-noscroll` to the filter sidebar and `data-sveltekit-replacestate` to the pagination nav.'
			],
			conceptsTested: ['sveltekit.advanced.preloading']
		},
		{
			id: 'cp-2',
			description: 'Override inherited defaults for specific links with reload and keepfocus',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'data-sveltekit-reload' },
						{ type: 'contains', value: 'data-sveltekit-keepfocus' }
					]
				}
			},
			hints: [
				'Add a link with `data-sveltekit-reload` for a page that should use full browser navigation.',
				'Add `data-sveltekit-keepfocus` to the search `<form>` element so the input stays focused after submission.',
				'Remember to also add `data-sveltekit-preload-data="off"` to the reload link since preloading is pointless for full reloads.'
			],
			conceptsTested: ['sveltekit.advanced.link-options']
		}
	]
};
