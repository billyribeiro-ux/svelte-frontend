import type { Lesson } from '$types/lesson';

export const layouts: Lesson = {
	id: 'sveltekit.routing.layouts',
	slug: 'layouts',
	title: 'Layouts',
	description: 'Share UI across pages with +layout.svelte, nested layouts, and layout groups.',
	trackId: 'sveltekit',
	moduleId: 'routing',
	order: 2,
	estimatedMinutes: 15,
	concepts: ['sveltekit.routing.layouts', 'sveltekit.routing.nested-layouts'],
	prerequisites: ['sveltekit.routing.file-based'],

	content: [
		{
			type: 'text',
			content: `# Shared Layouts with +layout.svelte

## Why Layouts Exist

Every non-trivial application has UI that persists across page navigations -- a navigation bar, a sidebar, a footer, a notification area. Without layouts, you would duplicate this UI in every page component, creating a maintenance nightmare where a single change to the navigation requires editing dozens of files.

But layouts in SvelteKit solve a deeper problem than mere code reuse. They are **architectural boundaries** in your rendering tree. When you navigate from \`/dashboard/analytics\` to \`/dashboard/settings\`, SvelteKit does not destroy and recreate the dashboard layout. It keeps the layout mounted and only swaps the page content inside it. This means layout state -- scroll positions, open dropdowns, WebSocket connections, animated sidebars -- survives navigation. This is not an optimization; it is a fundamental aspect of how SvelteKit handles the component lifecycle during routing.

## The Layout Hierarchy and How Rendering Works

SvelteKit constructs a **component tree** based on the layout hierarchy:

\`\`\`
Root Layout (+layout.svelte)
  --> Page (+page.svelte)

Root Layout (+layout.svelte)
  --> Dashboard Layout (dashboard/+layout.svelte)
    --> Dashboard Page (dashboard/+page.svelte)
\`\`\`

A layout wraps all pages in its directory and all subdirectories. The page content renders where the \`{@render children()}\` snippet appears. This is Svelte 5's snippet-based composition -- the layout receives \`children\` as a prop, and you decide exactly where in the layout's markup the page content should appear.

During SSR, the entire tree is rendered top-down: root layout first, then nested layouts, then the page. The resulting HTML is a single string sent to the browser. During hydration, Svelte walks the same tree and attaches reactivity to each component. On client-side navigation, only the components that change are swapped -- layouts above the changing route segment remain mounted.

## Data Inheritance in Layouts

Every layout can have its own load function (\`+layout.server.ts\` or \`+layout.ts\`). The data returned from a layout's load function is available to the layout itself AND to every child page. This creates a natural data inheritance model:

- Root layout loads user session data --> available everywhere
- Dashboard layout loads dashboard-specific config --> available to all dashboard pages
- Individual pages load their specific data

Child pages receive the merged data from all ancestor layouts plus their own load function. If a layout returns \`{ user }\` and a page returns \`{ posts }\`, the page component receives \`{ user, posts }\` in its \`data\` prop.

This inheritance follows the layout nesting, not arbitrary dependency graphs. This constraint is intentional -- it makes data flow predictable and debuggable.

## Layout Groups: Different Layouts Without URL Segments

Sometimes you want different sections of your app to have completely different layouts without that distinction appearing in the URL. A marketing site and an authenticated app might coexist under the same domain:

- \`/\` -- marketing homepage (minimal layout)
- \`/pricing\` -- marketing pricing page (same minimal layout)
- \`/dashboard\` -- authenticated app (sidebar + header layout)
- \`/settings\` -- authenticated app (same sidebar + header layout)

Layout groups solve this with parenthesized directory names:

\`\`\`
src/routes/
  (marketing)/
    +layout.svelte     --> minimal marketing layout
    +page.svelte       --> / (home)
    pricing/
      +page.svelte     --> /pricing
  (app)/
    +layout.svelte     --> full app layout with sidebar
    dashboard/
      +page.svelte     --> /dashboard
    settings/
      +page.svelte     --> /settings
\`\`\`

The group names \`(marketing)\` and \`(app)\` do NOT appear in the URL. They exist solely to organize layout boundaries. This is a powerful architectural tool -- it lets you have completely independent layout trees without polluting your URL structure.

## Breaking Out of Layouts with +page@.svelte

Occasionally a page needs to escape its parent layout. A login page under \`(app)/login\` should not show the authenticated sidebar. SvelteKit handles this with the \`@\` suffix:

- \`+page@.svelte\` -- resets to the root layout (no parent layouts)
- \`+page@(app).svelte\` -- resets to the (app) group layout
- \`+page@dashboard.svelte\` -- resets to the dashboard layout

Use this sparingly. If you find yourself breaking out of layouts frequently, your layout hierarchy probably does not match your actual UI structure.

## Decision Framework: Designing Your Layout Hierarchy

1. **Start with what persists.** List the UI elements that should survive page navigation. Group pages that share the same persistent UI under the same layout.
2. **Think about state.** If a sidebar's open/closed state should persist across page changes, those pages need a shared layout.
3. **Consider data loading.** If multiple pages need the same data (user session, team info), load it in a shared layout rather than duplicating the fetch in each page.
4. **Use groups for divergent UIs.** When two sections of your app look completely different but share a URL prefix (or lack one), use layout groups.
5. **Keep it shallow.** Three levels of layout nesting is usually the practical maximum. Beyond that, the component tree becomes hard to reason about and load waterfalls become problematic.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.routing.layouts'
		},
		{
			type: 'text',
			content: `## Creating a Root Layout

The \`src/routes/+layout.svelte\` file wraps **every** page in your app. It receives a \`children\` snippet that renders the current page.

**Your task:** Create a root layout with a navigation bar and a main content area using \`{@render children()}\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Nested Layouts

Layouts can be nested. A layout in \`src/routes/dashboard/+layout.svelte\` wraps all pages under \`/dashboard\`, and itself is wrapped by the root layout.

**Task:** Create a nested layout for the dashboard section that adds a sidebar.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Layout Groups

Sometimes you want different layouts for different sections without adding a URL segment. Layout groups use parentheses in directory names: \`(app)\`, \`(auth)\`.

Routes inside \`src/routes/(auth)/login\` will be at \`/login\`, not \`/(auth)/login\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<!-- TODO: Add a nav bar and render children -->
{@render children()}`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<h1>Home</h1>
<p>Welcome to the app.</p>`
		},
		{
			name: 'dashboard/+layout.svelte',
			path: '/dashboard/+layout.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<!-- TODO: Add a sidebar and render children -->
{@render children()}`
		},
		{
			name: 'dashboard/+page.svelte',
			path: '/dashboard/+page.svelte',
			language: 'svelte',
			content: `<h1>Dashboard</h1>
<p>Dashboard overview content.</p>`
		}
	],

	solutionFiles: [
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<nav>
  <a href="/">Home</a>
  <a href="/dashboard">Dashboard</a>
</nav>

<main>
  {@render children()}
</main>

<style>
  nav {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #1e293b;
  }

  nav a {
    color: white;
    text-decoration: none;
  }

  main {
    padding: 1rem;
  }
</style>`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<h1>Home</h1>
<p>Welcome to the app.</p>`
		},
		{
			name: 'dashboard/+layout.svelte',
			path: '/dashboard/+layout.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="dashboard-layout">
  <aside>
    <a href="/dashboard">Overview</a>
    <a href="/dashboard/settings">Settings</a>
  </aside>
  <section>
    {@render children()}
  </section>
</div>

<style>
  .dashboard-layout {
    display: flex;
    gap: 1rem;
  }

  aside {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 200px;
    padding: 1rem;
    background: #f1f5f9;
    border-radius: 8px;
  }

  section {
    flex: 1;
  }
</style>`
		},
		{
			name: 'dashboard/+page.svelte',
			path: '/dashboard/+page.svelte',
			language: 'svelte',
			content: `<h1>Dashboard</h1>
<p>Dashboard overview content.</p>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a root layout with navigation and children rendering',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<nav>' },
						{ type: 'contains', value: '{@render children()}' }
					]
				}
			},
			hints: [
				'Add a `<nav>` element with links to your pages.',
				'Use `{@render children()}` to render the current page content.',
				'Wrap the children rendering in a `<main>` element for semantic structure.'
			],
			conceptsTested: ['sveltekit.routing.layouts']
		},
		{
			id: 'cp-2',
			description: 'Create a nested dashboard layout with a sidebar',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'aside' },
						{ type: 'contains', value: '{@render children()}' }
					]
				}
			},
			hints: [
				'Add an `<aside>` element for the sidebar navigation.',
				'Use a flex container to position the sidebar next to the content.',
				'Remember to include `{@render children()}` so the page content appears.'
			],
			conceptsTested: ['sveltekit.routing.nested-layouts']
		},
		{
			id: 'cp-3',
			description: 'Understand layout groups and their URL behavior',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'children' }]
				}
			},
			hints: [
				'Layout groups use parentheses in the directory name, like `(auth)`.',
				'The group name does not appear in the URL -- `(auth)/login` maps to `/login`.',
				'This lets you have different layouts for different sections without extra URL segments.'
			],
			conceptsTested: ['sveltekit.routing.layouts']
		}
	]
};
