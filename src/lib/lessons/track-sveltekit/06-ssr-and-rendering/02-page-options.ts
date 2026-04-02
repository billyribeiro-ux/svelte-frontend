import type { Lesson } from '$types/lesson';

export const pageOptions: Lesson = {
	id: 'sveltekit.ssr-and-rendering.page-options',
	slug: 'page-options',
	title: 'Page Options',
	description: 'Configure SSR, CSR, and prerendering per-page with exported constants.',
	trackId: 'sveltekit',
	moduleId: 'ssr-and-rendering',
	order: 2,
	estimatedMinutes: 10,
	concepts: ['sveltekit.rendering.page-options', 'sveltekit.rendering.prerender'],
	prerequisites: ['sveltekit.rendering.ssr'],

	content: [
		{
			type: 'text',
			content: `# Page Options

## Why Per-Page Rendering Control Matters

Not every page in your application has the same rendering requirements. A marketing homepage benefits from SSR for SEO and fast first paint. An admin dashboard might work fine as CSR-only since it is behind authentication and SEO is irrelevant. A privacy policy page can be prerendered at build time since its content never changes at runtime.

SvelteKit gives you three rendering toggles, configurable per-page or per-layout:

- **\`ssr\`** -- whether to server-render the page
- **\`csr\`** -- whether to hydrate the page with JavaScript
- **\`prerender\`** -- whether to generate static HTML at build time

These are exported as constants from \`+page.ts\`, \`+page.server.ts\`, or \`+layout.ts\` files.

## The Decision Matrix

| Configuration | SSR | CSR | Behavior |
|---|---|---|---|
| Default | true | true | Server renders, client hydrates. Full interactivity. |
| \`ssr = false\` | false | true | Client-only rendering. Empty shell until JS loads. |
| \`csr = false\` | true | false | Server renders, no JS sent. Static HTML. |
| \`ssr = false, csr = false\` | false | false | Nonsensical. Will error. |
| \`prerender = true\` | build time | true | HTML generated at build, hydrated at runtime. |
| \`prerender = true, csr = false\` | build time | false | Fully static. No JS. Like a traditional static site generator. |

## Prerendering: Build-Time SSR

Prerendering is SSR that happens at build time rather than request time. Instead of rendering the page on every request, SvelteKit renders it once during \`vite build\` and outputs a static HTML file. Benefits:

- **Zero TTFB cost** -- the HTML file is served directly by a CDN, no server computation
- **Infinite scalability** -- CDN serves the same file to millions of users
- **Reliability** -- no server means no server failures

Constraints:
- The page content must not depend on the request (no cookies, no user-specific data, no dynamic query parameters)
- The load function must be deterministic -- same output every build
- URLs must be discoverable at build time (SvelteKit crawls links to find prerenderable pages)

\`\`\`typescript
// about/+page.ts
export const prerender = true;
\`\`\`

SvelteKit automatically discovers prerenderable pages by crawling links starting from your entry points. If a page is only reachable via dynamic navigation, you may need to add it to \`config.kit.prerender.entries\` in \`svelte.config.js\`.

## Disabling CSR: Zero-JavaScript Pages

Setting \`csr = false\` tells SvelteKit to not send any JavaScript for the page. The server renders HTML, the browser displays it, and that is it. No hydration, no interactivity, no client-side navigation from this page.

This is perfect for:
- **Legal pages** (privacy policy, terms of service) -- pure content, no interaction
- **Documentation** -- if you do not need client-side search or interactive examples
- **Error pages** -- minimal pages that should work even when JS bundles fail

\`\`\`typescript
// privacy/+page.ts
export const csr = false;
\`\`\`

**Important trade-off:** When \`csr = false\`, clicking a link on that page causes a full page reload. The user loses the SPA-like navigation experience. This is acceptable for standalone pages but problematic if the page is part of a navigation flow.

## Layout-Level Options: Cascading Configuration

Page options set in a layout apply to ALL child pages:

\`\`\`typescript
// (marketing)/+layout.ts
export const prerender = true;
// All pages under (marketing)/ are prerendered
\`\`\`

A child page can override parent options:

\`\`\`typescript
// (marketing)/contact/+page.ts
export const prerender = false;
// This specific page is NOT prerendered (has a form that needs server actions)
\`\`\`

This cascading model is powerful for structuring your app. A \`(static)/\` layout group with \`prerender = true\` can contain your entire marketing site. A \`(app)/\` layout group with the defaults can contain your dynamic application.

## Streaming SSR

When a load function returns a promise (not awaited), SvelteKit streams the page. The initial HTML is sent immediately with the available data, and the promise result is streamed when it resolves:

\`\`\`typescript
export const load: PageServerLoad = async () => {
  return {
    critical: await getCriticalData(),     // Available immediately
    recommendations: getRecommendations()  // Streamed when ready
  };
};
\`\`\`

This requires no page option -- it happens automatically when you return unresolved promises. The page renders with the critical data first, showing a loading state for the streamed data, then fills in when the promise resolves.

Streaming SSR improves perceived performance by showing meaningful content sooner. The TTFB remains fast because the server does not wait for slow data before starting to send HTML.

**Adapter compatibility note:** Streaming requires a deployment platform that supports HTTP streaming. Node.js and Deno support it natively. Serverless platforms vary -- AWS Lambda does not support streaming in all configurations, while Cloudflare Workers does.

## The Prerender Crawling Algorithm

When you run \`vite build\`, SvelteKit:
1. Starts from the entry points (default: \`/\`)
2. Renders each page and extracts all \`<a href="...">\` links
3. Follows each link to discover new pages
4. Prerenders any discovered page that has \`prerender = true\` (or inherits it)
5. Repeats until no new pages are found

Pages that are only reachable via JavaScript navigation (e.g., \`goto('/hidden-page')\`) will not be discovered. Add them manually:

\`\`\`javascript
// svelte.config.js
kit: {
  prerender: {
    entries: ['/', '/hidden-page', '/api/sitemap.xml']
  }
}
\`\`\`

## Decision Framework

- **Marketing/content pages:** \`prerender = true\`. Fastest possible delivery, best SEO.
- **Legal/static content:** \`prerender = true, csr = false\`. Zero JavaScript, maximum simplicity.
- **App pages (authenticated):** Default (SSR + CSR). Dynamic data, full interactivity.
- **Dashboard/admin pages:** \`ssr = false\` if SEO is irrelevant and the page requires heavy browser APIs.
- **Canvas/WebGL/media editors:** \`ssr = false\`. These simply cannot render on the server.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.rendering.page-options'
		},
		{
			type: 'text',
			content: `## Prerendering Static Pages

Pages that don't depend on dynamic data can be prerendered at build time. This creates static HTML files that load instantly.

**Your task:** Mark the about page as prerenderable.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Disabling Client-Side Rendering

For pages that don't need interactivity -- like a privacy policy -- you can disable CSR to send zero JavaScript.

**Task:** Create a static page with \`csr = false\` that sends no JavaScript to the client.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'about/+page.ts',
			path: '/about/+page.ts',
			language: 'typescript',
			content: `// TODO: Enable prerendering for this page`
		},
		{
			name: 'about/+page.svelte',
			path: '/about/+page.svelte',
			language: 'svelte',
			content: `<h1>About Us</h1>
<p>This page can be prerendered since its content is static.</p>`
		},
		{
			name: 'privacy/+page.ts',
			path: '/privacy/+page.ts',
			language: 'typescript',
			content: `// TODO: Disable client-side rendering`
		},
		{
			name: 'privacy/+page.svelte',
			path: '/privacy/+page.svelte',
			language: 'svelte',
			content: `<h1>Privacy Policy</h1>
<p>This page needs no JavaScript — it's pure HTML content.</p>`
		}
	],

	solutionFiles: [
		{
			name: 'about/+page.ts',
			path: '/about/+page.ts',
			language: 'typescript',
			content: `export const prerender = true;`
		},
		{
			name: 'about/+page.svelte',
			path: '/about/+page.svelte',
			language: 'svelte',
			content: `<h1>About Us</h1>
<p>This page can be prerendered since its content is static.</p>`
		},
		{
			name: 'privacy/+page.ts',
			path: '/privacy/+page.ts',
			language: 'typescript',
			content: `export const csr = false;`
		},
		{
			name: 'privacy/+page.svelte',
			path: '/privacy/+page.svelte',
			language: 'svelte',
			content: `<h1>Privacy Policy</h1>
<p>This page needs no JavaScript — it's pure HTML content.</p>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Enable prerendering for the about page',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'export const prerender = true' }]
				}
			},
			hints: [
				'Export a constant named `prerender` set to `true`.',
				'This goes in the `+page.ts` file for the about page.',
				'Add `export const prerender = true;` to `about/+page.ts`.'
			],
			conceptsTested: ['sveltekit.rendering.prerender']
		},
		{
			id: 'cp-2',
			description: 'Disable client-side rendering for the privacy page',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'export const csr = false' }]
				}
			},
			hints: [
				'Export a constant named `csr` set to `false`.',
				'This tells SvelteKit not to send any JavaScript for this page.',
				'Add `export const csr = false;` to `privacy/+page.ts`.'
			],
			conceptsTested: ['sveltekit.rendering.page-options']
		}
	]
};
