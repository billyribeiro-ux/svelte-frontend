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

## Why File-Based Routing Exists

Every web framework must answer a fundamental question: how does a URL map to code? Historically, frameworks used explicit route configuration files -- arrays of objects pairing path patterns to handler functions. This approach works, but it creates a maintenance burden. The configuration drifts from the actual file structure, new developers must read two things (the config and the files) to understand the app, and refactoring requires changes in multiple places.

SvelteKit chose **file-based routing** because the file system is already a tree structure, and URL paths are also a tree structure. By making one mirror the other, the mapping becomes self-documenting. When you look at \`src/routes/blog/[slug]/+page.svelte\`, you immediately know this handles \`/blog/anything\`. No indirection, no routing table to consult.

This is not merely a convenience -- it is a design constraint that prevents an entire class of bugs. You cannot accidentally register two handlers for the same route because the file system enforces uniqueness. You cannot forget to register a route because the file's existence IS the registration.

## How Route Resolution Works Under the Hood

When a request arrives at your SvelteKit app, the router performs a deterministic resolution process:

1. **Normalize the URL path** -- strip trailing slashes (configurable), decode URI components
2. **Walk the route tree** -- SvelteKit builds a route manifest at build time by scanning \`src/routes\`. Each directory becomes a node in a tree. Each \`+page.svelte\` marks that node as a valid route endpoint
3. **Match segments left to right** -- static segments match exactly, dynamic segments (\`[param]\`) match any single segment, rest parameters (\`[...rest]\`) consume remaining segments
4. **Apply priority rules** -- when multiple routes could match, static segments win over dynamic ones, and more specific routes win over less specific ones
5. **Execute the route** -- once matched, SvelteKit runs load functions, resolves layouts, and renders the component tree

The route manifest is generated at build time and embedded in both the server and client bundles. This means route resolution has zero runtime cost for discovery -- it is a simple tree lookup, not a linear scan through route definitions.

## The +page.svelte Convention

Every route in SvelteKit requires a \`+page.svelte\` file. The \`+\` prefix is intentional and significant -- it signals to SvelteKit that this file has framework-level meaning, distinguishing it from regular components that you might co-locate in the same directory.

This convention enables **co-location**: you can place utility functions, child components, test files, and other assets alongside your route files. Only files prefixed with \`+\` participate in routing. This eliminates the artificial separation between "page code" and "supporting code" that plagues frameworks that treat the entire routes directory as sacred.

\`\`\`
src/routes/
  +page.svelte          --> /
  +layout.svelte        --> wraps all pages
  about/
    +page.svelte        --> /about
  blog/
    +page.svelte        --> /blog
    post-utils.ts       --> NOT a route (no + prefix)
    PostCard.svelte      --> NOT a route (no + prefix)
    [slug]/
      +page.svelte      --> /blog/:slug
\`\`\`

## SSR and Route Resolution

When a user navigates to your app for the first time (or hits refresh), the request hits your server. SvelteKit resolves the route server-side, runs the load functions, renders the component to HTML, and sends that HTML to the browser. The browser then hydrates the page, attaching event listeners and making it interactive.

On subsequent navigations (clicking internal links), SvelteKit intercepts the click, resolves the route client-side using the same manifest, fetches only the data needed (not the full HTML), and swaps the page component. This is why navigation feels instant -- there is no full page reload, no flash of white, no lost scroll position (unless you want it reset).

This dual nature -- server-rendered first load, client-navigated subsequent loads -- is central to understanding why SvelteKit routes work the way they do. The file-based structure must produce code that works identically in both environments.

## Decision Framework: When to Create a New Route

Ask yourself these questions when deciding on route structure:

- **Does this content deserve its own URL?** If users should be able to bookmark it, share it, or navigate to it directly, it needs a route. Modal dialogs and tab panels within a page typically do not.
- **Does this content need its own layout?** If a section of your app has a distinct navigation structure (like a dashboard with a sidebar), it should be a directory with its own \`+layout.svelte\`.
- **Is this a logical grouping?** Routes like \`/settings/profile\`, \`/settings/billing\`, and \`/settings/notifications\` should live under a \`settings/\` directory, reflecting their conceptual relationship.
- **Will this route need its own data?** Each route can have its own load function. If the data requirements are fundamentally different, that is a signal for a separate route.

## Common Pitfalls

**Pitfall 1: Forgetting that directories without +page.svelte are not routes.** Creating \`src/routes/blog/\` without a \`+page.svelte\` inside means \`/blog\` returns a 404. The directory exists only as a namespace.

**Pitfall 2: Confusing file-system routing with URL structure.** SvelteKit supports layout groups using parentheses -- \`(marketing)\`, \`(app)\` -- that affect the layout hierarchy without appearing in the URL. Understanding this distinction is crucial for complex apps.

**Pitfall 3: Over-nesting routes.** Just because you can nest deeply does not mean you should. URLs like \`/app/dashboard/analytics/reports/monthly\` are harder to work with than \`/reports/monthly\`. Flatten when possible.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.routing.file-based'
		},
		{
			type: 'text',
			content: `## Creating Your First Page

Look at the starter code -- you have a basic \`+page.svelte\` file. This is the home page of the app, rendered at \`/\`.

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

In SvelteKit, you navigate between pages using standard \`<a>\` tags. SvelteKit automatically intercepts these clicks and performs **client-side navigation** -- no full page reload needed. This interception happens transparently: the framework listens for click events on \`<a>\` elements, checks if the href points to an internal route, and if so, prevents the default browser navigation and performs a client-side transition instead.

This means your links are progressively enhanced by default. If JavaScript fails to load, the links still work as normal HTML links with full page reloads. This is a core SvelteKit principle: build on the platform, enhance with JavaScript.

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
