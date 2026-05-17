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

The user perceives this as a delay between clicking and seeing the new page. Even 200ms of delay feels sluggish. At 500ms, the user notices. At 1000ms, they wonder if something is broken. Research from Google's Web Vitals team and Amazon's conversion studies consistently shows that every 100ms of added latency reduces conversion rates by roughly 1%. For e-commerce sites, the difference between a 200ms navigation and a 600ms navigation can represent millions in lost revenue annually.

The key insight is that **perceived** latency matters more than actual latency. If you can start loading data and code *before* the user clicks, the navigation appears instantaneous even though the underlying work takes the same amount of time. The user's interaction creates a natural window of opportunity: the time between hovering over a link and clicking it averages 200-300ms on desktop. The time between pressing down on a mouse button and releasing it (the "tap" window) averages 50-100ms. SvelteKit's preloading system exploits these windows to hide network latency.

SvelteKit provides a set of \`data-sveltekit-*\` attributes that let you control exactly when and how navigation-related work happens. The most impactful is preloading -- starting the work before the user clicks so the page is ready by the time the click fires.

## data-sveltekit-preload-data

This attribute controls when SvelteKit preloads the target route's data (runs its load functions). It accepts three values:

**\`"hover"\`** -- Preloads when the user hovers over the link. On mobile, this triggers on \`touchstart\`. This gives you 100-200ms of head start on desktop (the time between hover and click) and works on mobile too. This is the default if you set it without a value.

Why "hover" exists: most users pause briefly over a link before clicking. Eye-tracking studies show that users visually identify their target, move the cursor toward it, and then click. The hover event fires when the cursor enters the link's bounding box, which typically happens 150-300ms before the click. For a load function that takes 200ms to complete, hover preloading makes the navigation feel instant because the data arrives just as the click fires. For a load function that takes 500ms, the user still sees a 200-300ms delay instead of 500ms -- a 40-60% reduction in perceived latency.

**\`"tap"\`** -- Preloads on \`mousedown\` (or \`touchstart\`). This is more conservative -- the head start is only 50-100ms (the time between mousedown and click/mouseup). Use this when preloading is expensive and you do not want to preload on every casual hover.

Why "tap" exists: hover triggers on *every* link the cursor passes over, including links the user has no intention of clicking. On a navigation bar with 8 links, moving the cursor to the rightmost link fires hover events on every link along the way. If each preload triggers a database query or API call, that is 7 wasted requests. "tap" only fires when the user actually presses down, which is a much stronger signal of intent. The tradeoff is a smaller time window (50-100ms versus 200-300ms), but for expensive operations, the bandwidth savings are worth the slightly reduced head start.

**\`"off"\`** -- Disables data preloading entirely. The load function runs only after the click. Use this for links where preloading is wasteful (links the user rarely clicks, or links to heavy pages).

\`\`\`svelte
<!-- Preload on hover (default behavior) -->
<a href="/products" data-sveltekit-preload-data="hover">Products</a>

<!-- Preload only on tap (more conservative) -->
<a href="/admin/reports" data-sveltekit-preload-data="tap">Reports</a>

<!-- No preloading at all -->
<a href="/rarely-visited" data-sveltekit-preload-data="off">Rarely Visited</a>
\`\`\`

### Performance Metrics: Real-World Impact

To put concrete numbers on the improvement, consider a typical SvelteKit page with a load function that queries a database and returns in 250ms:

| Strategy | Hover-to-click gap | Perceived navigation time | Improvement |
|---|---|---|---|
| No preloading | N/A | 250ms | Baseline |
| \`"tap"\` preload | ~75ms | 175ms | 30% faster |
| \`"hover"\` preload | ~200ms | 50ms | 80% faster |

For pages with heavier load functions (500ms+), the improvements are even more dramatic. A 500ms load function with hover preloading and a 250ms hover window becomes a 250ms perceived navigation -- cutting perceived latency in half.

These are not theoretical numbers. SvelteKit's preloading system has been measured in production applications. The SvelteKit documentation site itself uses hover preloading for all internal links, and page transitions consistently complete in under 100ms perceived time despite load functions that fetch markdown, parse it, and compute syntax highlighting.

## data-sveltekit-preload-code vs data-sveltekit-preload-data

These two attributes are complementary but serve different purposes. Understanding when to use each -- and when to combine them -- is critical for optimizing navigation performance.

**\`data-sveltekit-preload-code\`** fetches and parses the JavaScript modules for the target route *without* running any load functions. This is a read-only operation that downloads the route's component code, layout code, and any imported modules. It does not execute server-side logic, make API calls, or touch databases. The cost is purely network bandwidth and JavaScript parse time.

**\`data-sveltekit-preload-data\`** goes further: it fetches the code *and* executes the route's load functions, fetching all the data the page needs to render. This includes server load functions (\`+page.server.ts\`), universal load functions (\`+page.ts\`), and any layout load functions along the route hierarchy.

When to use code-only preloading:
- The route's load function is expensive (database queries, external API calls) and you do not want to trigger it speculatively
- The route has authentication-gated data that should only load on explicit navigation
- You want to reduce the code-download portion of navigation time without risking wasted server work
- The page has large JavaScript bundles that benefit from early download

When to use data preloading:
- The load function is cheap and fast (reading from cache, simple computations)
- The link is highly likely to be clicked (primary navigation, prominent CTAs)
- You want the absolute fastest possible navigation

When to combine both:
- Set code preloading to \`"eager"\` or \`"viewport"\` and data preloading to \`"hover"\` or \`"tap"\`
- This downloads the code as soon as the link is visible, then fetches data when the user shows intent
- By the time the user clicks, both code and data are ready

\`\`\`svelte
<!-- Code downloads immediately, data fetches on hover -->
<a
  href="/products"
  data-sveltekit-preload-code="eager"
  data-sveltekit-preload-data="hover"
>
  Products
</a>

<!-- Code downloads when visible, data fetches on tap -->
<a
  href="/admin/analytics"
  data-sveltekit-preload-code="viewport"
  data-sveltekit-preload-data="tap"
>
  Analytics Dashboard
</a>

<!-- Code preloads on hover, no data preloading (expensive load function) -->
<a
  href="/reports/generate"
  data-sveltekit-preload-code="hover"
  data-sveltekit-preload-data="off"
>
  Generate Report
</a>
\`\`\`

## data-sveltekit-preload-code Values

Distinct from data preloading, code preloading fetches the JavaScript modules for the target route without running load functions. This is lighter weight -- it only downloads and parses the code.

**\`"eager"\`** -- Preloads code as soon as the link enters the viewport. Useful for primary navigation links that the user is very likely to visit. Uses an IntersectionObserver internally.

**\`"viewport"\`** -- Same as eager, preloads when the link is visible. Functionally identical to \`"eager"\` in SvelteKit's current implementation.

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
\`\`\``
		},
		{
			type: 'text',
			content: `## Attribute Inheritance: How Attributes Cascade

Every \`data-sveltekit-*\` attribute is inherited by descendant elements. Set an attribute on a parent, and all links inside inherit it. Override per-link as needed. The inheritance chain follows the DOM tree from the outermost element down to the specific link:

\`\`\`
body (data-sveltekit-preload-data="hover")
  └─ nav (data-sveltekit-preload-code="eager")
  │    └─ a href="/" → inherits: preload-data="hover", preload-code="eager"
  │    └─ a href="/products" → inherits same
  │    └─ a href="/external" data-sveltekit-preload-data="off" data-sveltekit-reload
  │         → overrides: preload-data="off", inherits preload-code="eager", adds reload
  └─ main
  │    └─ div (data-sveltekit-noscroll)
  │         └─ a href="/filter" → inherits: preload-data="hover", noscroll
  │         └─ a href="/details" data-sveltekit-noscroll={false}
  │              → inherits preload-data="hover", explicitly removes noscroll
  └─ footer (data-sveltekit-preload-data="off")
       └─ a href="/privacy" → inherits: preload-data="off" (overrides body's "hover")
       └─ a href="/terms" → inherits: preload-data="off"
\`\`\`

The resolution rules are simple:
1. SvelteKit walks up the DOM tree from the \`<a>\` element
2. For each \`data-sveltekit-*\` attribute, the nearest ancestor's value wins
3. If no ancestor sets the attribute, SvelteKit uses its default behavior
4. An attribute set directly on the \`<a>\` element always takes priority

This means you can build a layered configuration. The body sets global defaults. Sections override for their context. Individual links fine-tune as needed. You never have to repeat attributes on every link.

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

This single attribute makes every link in your app preload data on hover, which is usually the right default for most applications.`
		},
		{
			type: 'text',
			content: `## Common Mistake: Over-Preloading and Bandwidth Waste

One of the most frequent mistakes with SvelteKit preloading is setting \`data-sveltekit-preload-data="hover"\` everywhere without considering the consequences. On a page with many links -- a product listing with 50 items, a blog archive, a dashboard with dozens of navigation options -- hover preloading can trigger dozens of unnecessary data fetches as the user moves their cursor across the page.

Consider a product listing page with 48 product cards. Each card is a link to \`/products/[slug]\` with a load function that queries the database for product details, reviews, and related items. With hover preloading enabled, the user casually moving their mouse from the top of the page to the search bar triggers hover events on every product card the cursor crosses. That is potentially 15-20 data preloads fired in rapid succession, each hitting the database. The user clicks none of them.

The solution is to be strategic:

\`\`\`svelte
<!-- Global default: hover preloading for navigation links -->
<body data-sveltekit-preload-data="hover">

  <!-- Product grid: tap-only preloading (too many links for hover) -->
  <div class="product-grid" data-sveltekit-preload-data="tap">
    {#each products as product}
      <a href="/products/{product.slug}">
        <ProductCard {product} />
      </a>
    {/each}
  </div>

  <!-- Footer links: no preloading (rarely clicked) -->
  <footer data-sveltekit-preload-data="off">
    <a href="/privacy">Privacy Policy</a>
    <a href="/terms">Terms of Service</a>
    <a href="/accessibility">Accessibility</a>
  </footer>
</body>
\`\`\`

**Rules of thumb for avoiding over-preloading:**

1. **More than 10 links visible at once?** Use \`"tap"\` instead of \`"hover"\` for data preloading
2. **Load function hits a database or external API?** Consider \`"tap"\` or preload code only
3. **Links the user almost never clicks?** Use \`"off"\`
4. **Primary navigation (5-8 links)?** \`"hover"\` for data, \`"eager"\` for code
5. **Infinite scroll or paginated lists?** \`"tap"\` for data, \`"viewport"\` for code

The bandwidth cost is real. Each preloaded data fetch is a full load function execution on the server and a network round trip to the client. On a page with 50 product links and hover preloading, a user browsing casually might trigger 20-30 unnecessary data fetches per page view. Multiply that by thousands of concurrent users and the server load becomes significant.

## Integration with Service Workers and Cache Strategies

SvelteKit's preloading system interacts directly with service workers and browser caches. Understanding this interaction helps you build a coherent caching strategy.

When a preload fires, SvelteKit makes a fetch request for the target route's data. If a service worker is installed, that fetch request passes through the service worker's fetch event handler. This means your service worker's caching strategy applies to preloaded data:

- **Cache-first service worker:** Preloaded data is served from cache if available. Preloading a previously visited route is essentially free -- no network request at all.
- **Network-first service worker:** Preloading always hits the network but updates the cache. Subsequent visits (even offline) benefit from the preloaded data.
- **Stale-while-revalidate:** Preloading serves cached data instantly and refreshes in the background. The user sees the page immediately, and the next visit gets fresh data.

\`\`\`typescript
// In your service worker: handle preloaded data requests
self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // SvelteKit data requests use __data.json suffix
  if (url.pathname.endsWith('__data.json')) {
    // Network-first for data: always try fresh, cache as fallback
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cache = caches.open('data-cache');
          cache.then((c) => c.put(event.request, response.clone()));
          return response;
        })
        .catch(() => caches.match(event.request))
        .then((r) => r ?? new Response('{}', { status: 503 }))
    );
    return;
  }
});
\`\`\`

The browser's HTTP cache also plays a role. SvelteKit build assets have hashed filenames and are served with long cache headers. Code preloading for these assets (\`data-sveltekit-preload-code\`) is effectively free on repeat visits because the browser cache already has them. Data preloading, however, typically involves API-like requests that should not be cached by the HTTP layer (they use \`Cache-Control: no-cache\` or similar), so the service worker or SvelteKit's internal cache is the relevant caching layer.

## Decision Framework: Choosing the Right Preload Strategy

| Link Type | Code Preload | Data Preload | Why |
|---|---|---|---|
| Primary navigation | eager | hover | Always visible, very likely to be clicked |
| Secondary navigation | hover | hover | Visible but less likely; hover is enough |
| Content links | hover | hover | Default behavior works well |
| Product/item grids | viewport | tap | Many links visible; hover would preload too aggressively |
| Pagination | hover | tap | Many links visible; tap prevents waste |
| Rarely used links | off | off | Not worth the bandwidth |
| External/reload links | off | off | SvelteKit navigation does not apply |
| Search results | viewport | tap | Code ready early, data on intent |
| Dashboard widgets | eager | tap | Code ready immediately, data on demand |

## Programmatic Preloading

In addition to attributes, you can preload programmatically:

\`\`\`typescript
import { preloadData, preloadCode } from '$app/navigation';

// Preload data for a route
await preloadData('/products');

// Preload just the code
await preloadCode('/products');
\`\`\`

This is useful for preloading based on user behavior patterns, analytics, or predictions (e.g., preload the most likely next page after the user completes a form).

Programmatic preloading opens up advanced patterns:

\`\`\`typescript
// Preload the next step when the user starts filling a form
function handleFirstInput() {
  preloadCode('/checkout/step-2');
}

// Preload based on viewport position (custom logic)
function handleScroll() {
  if (nearBottom) {
    preloadData('/products?page=2');
  }
}

// Preload based on analytics (most common next page)
onMount(async () => {
  const likelyNext = await fetchMostLikelyNextPage();
  preloadData(likelyNext);
});
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.advanced.link-options'
		},
		{
			type: 'text',
			content: `## Exercise: Build an Optimized Navigation Menu with Multiple Preload Strategies

You will build a navigation layout with a primary nav bar, a sidebar with filter links, a product grid, and pagination. Each section uses different link options to optimize the user experience based on the likelihood and cost of each navigation.

**Your task:**
1. Set \`data-sveltekit-preload-data="hover"\` on the body or a wrapper (global default)
2. Set \`data-sveltekit-preload-code="eager"\` on the primary navigation
3. Add \`data-sveltekit-noscroll\` and \`data-sveltekit-replacestate\` to filter and pagination links
4. Set \`data-sveltekit-preload-data="tap"\` on the product grid (too many links for hover)
5. Set \`data-sveltekit-preload-data="off"\` on footer links (rarely clicked)`
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
			type: 'text',
			content: `## Adding Programmatic Preloading

Now enhance the layout with programmatic preloading. Import \`preloadData\` and \`preloadCode\` from \`$app/navigation\` and trigger preloads based on user behavior: preload the next pagination page when the user scrolls near the bottom, and preload the checkout route when the user adds an item to the cart.

**Task:** Add an \`onMount\` or event handler that calls \`preloadCode\` or \`preloadData\` programmatically based on a user action.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'xray-prompt',
			content: `Explain the performance difference between data-sveltekit-preload-data="hover" and "tap". How much time does each buy you, and when would you choose one over the other? What are the bandwidth implications of aggressive preloading on a page with many links? How does preloading interact with service worker caching strategies?`
		},
		{
			type: 'text',
			content: `## Summary

SvelteKit's link options give you surgical control over navigation behavior. Preloading (\`preload-data\`, \`preload-code\`) eliminates perceived latency by starting work before the click. The distinction between code preloading and data preloading lets you balance speed against bandwidth -- eagerly load code (which is cheap and cacheable) while being more conservative with data (which may involve server work). State management (\`replacestate\`, \`noscroll\`, \`keepfocus\`) controls how the browser handles history, scroll position, and focus. Escape hatches (\`reload\`) handle edge cases where client-side navigation is not appropriate. Through inheritance, you set sensible defaults once and override only where needed, keeping your markup clean while delivering optimized navigation throughout the application. Avoid over-preloading by using \`"tap"\` for dense link areas and \`"off"\` for rarely-visited links. When combined with service workers, preloaded data feeds directly into your caching strategy, making repeat visits and offline navigation nearly instantaneous.`
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
      <!-- TODO: Add data-sveltekit-preload-data="tap" to the product grid -->
      <div class="product-grid">
        <a href="/products/sneakers">Sneakers</a>
        <a href="/products/boots">Boots</a>
        <a href="/products/sandals">Sandals</a>
        <a href="/products/loafers">Loafers</a>
        <a href="/products/heels">Heels</a>
        <a href="/products/flats">Flats</a>
      </div>
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

  <!-- TODO: Add data-sveltekit-preload-data="off" to the footer -->
  <footer>
    <a href="/privacy">Privacy Policy</a>
    <a href="/terms">Terms of Service</a>
    <a href="/accessibility">Accessibility</a>
  </footer>
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
  .product-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem;
  }
  .pagination {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    justify-content: center;
  }
  footer {
    padding: 1rem;
    background: #f4f4f4;
    display: flex;
    gap: 1rem;
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
  import { preloadCode } from '$app/navigation';
  import { onMount } from 'svelte';

  let { children } = $props();

  onMount(() => {
    // Programmatically preload the checkout route
    preloadCode('/checkout');
  });
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
      <div class="product-grid" data-sveltekit-preload-data="tap">
        <a href="/products/sneakers">Sneakers</a>
        <a href="/products/boots">Boots</a>
        <a href="/products/sandals">Sandals</a>
        <a href="/products/loafers">Loafers</a>
        <a href="/products/heels">Heels</a>
        <a href="/products/flats">Flats</a>
      </div>
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

  <footer data-sveltekit-preload-data="off">
    <a href="/privacy">Privacy Policy</a>
    <a href="/terms">Terms of Service</a>
    <a href="/accessibility">Accessibility</a>
  </footer>
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
  .product-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem;
  }
  .pagination {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    justify-content: center;
  }
  footer {
    padding: 1rem;
    background: #f4f4f4;
    display: flex;
    gap: 1rem;
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
		},
		{
			id: 'cp-3',
			description: 'Add programmatic preloading with preloadCode or preloadData',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'preloadCode' },
						{ type: 'contains', value: '$app/navigation' }
					]
				}
			},
			hints: [
				'Import `preloadCode` or `preloadData` from `$app/navigation`.',
				'Call `preloadCode(\'/checkout\')` inside an `onMount` callback or event handler.',
				'Programmatic preloading lets you predict user behavior and start loading routes before any link interaction.'
			],
			conceptsTested: ['sveltekit.advanced.preloading']
		}
	]
};
