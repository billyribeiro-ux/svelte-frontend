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

Most apps have UI that should appear on every page — a navigation bar, a footer, or a sidebar. In SvelteKit, you define shared UI in \`+layout.svelte\` files.

A layout wraps all pages in its directory (and subdirectories). The page content is rendered where the \`{@render children()}\` snippet appears.`
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
				'The group name does not appear in the URL — `(auth)/login` maps to `/login`.',
				'This lets you have different layouts for different sections without extra URL segments.'
			],
			conceptsTested: ['sveltekit.routing.layouts']
		}
	]
};
