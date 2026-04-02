import type { Lesson } from '$types/lesson';

export const appModules: Lesson = {
	id: 'sveltekit.environment-and-config.app-modules',
	slug: 'app-modules',
	title: 'App Modules',
	description: 'Use $app/navigation, $app/state, and $app/environment for SvelteKit utilities.',
	trackId: 'sveltekit',
	moduleId: 'environment-and-config',
	order: 2,
	estimatedMinutes: 12,
	concepts: ['sveltekit.app.navigation', 'sveltekit.app.state'],
	prerequisites: ['sveltekit.routing.file-based'],

	content: [
		{
			type: 'text',
			content: `# SvelteKit App Modules

## Why SvelteKit Provides Built-in Modules

SvelteKit is not just a router -- it is a full application framework. The \`$app/*\` modules provide essential utilities that integrate deeply with the framework's internals: navigation, page state, environment detection, and form enhancement. These are not convenience wrappers you could easily build yourself; they depend on framework-level state management and SSR awareness.

Understanding these modules is essential because they are the primary API surface for interacting with SvelteKit's runtime from your components.

## $app/navigation: Programmatic Routing

The \`$app/navigation\` module provides functions for controlling navigation and data loading:

**\`goto(url, options?)\`** -- navigate programmatically:
\`\`\`typescript
import { goto } from '$app/navigation';

// Simple navigation
await goto('/dashboard');

// Replace history entry (back button skips this page)
await goto('/settings', { replaceState: true });

// Keep scroll position
await goto('/dashboard/analytics', { noScroll: true });

// Invalidate data after navigation
await goto('/dashboard', { invalidateAll: true });
\`\`\`

\`goto()\` returns a Promise that resolves when navigation completes. This is useful for sequential operations: submit a form, then navigate to a success page.

**\`invalidate(url)\` and \`invalidateAll()\`** -- re-run load functions (covered in the data loading module, but imported from here).

**\`preloadData(url)\`** -- prefetch data for a route before navigation:
\`\`\`typescript
import { preloadData } from '$app/navigation';

// Prefetch on hover for instant navigation
function handleMouseEnter(url: string) {
  preloadData(url);
}
\`\`\`

SvelteKit automatically prefetches routes when a link with \`data-sveltekit-preload-data\` is hovered. \`preloadData\` gives you manual control over this behavior.

**\`afterNavigate(callback)\`** and **\`beforeNavigate(callback)\`** -- lifecycle hooks for navigation:
\`\`\`typescript
import { afterNavigate, beforeNavigate } from '$app/navigation';

beforeNavigate(({ cancel, to, from, type }) => {
  if (hasUnsavedChanges && !confirm('Discard changes?')) {
    cancel(); // Prevent the navigation
  }
});

afterNavigate(({ to, from, type }) => {
  // Track page views in analytics
  analytics.pageView(to?.url.pathname);
});
\`\`\`

\`beforeNavigate\` is particularly valuable for preventing accidental data loss. If a user has unsaved form data and clicks a link, you can intercept the navigation and ask for confirmation.

**\`onNavigate(callback)\`** -- runs during navigation, can return a promise for view transitions:
\`\`\`typescript
import { onNavigate } from '$app/navigation';

onNavigate((navigation) => {
  if (!document.startViewTransition) return;
  return new Promise((resolve) => {
    document.startViewTransition(async () => {
      resolve();
      await navigation.complete;
    });
  });
});
\`\`\`

## $app/state: Reactive Page State

The \`page\` object from \`$app/state\` is a deeply reactive representation of the current page. It updates automatically on navigation:

\`\`\`typescript
import { page } from '$app/state';

// Current URL
page.url          // URL object
page.url.pathname // '/dashboard/analytics'
page.url.searchParams.get('q') // query parameter

// Route information
page.route.id     // '/dashboard/[section]'
page.params       // { section: 'analytics' }

// Page data (from load functions)
page.data         // The merged layout + page data

// Error state (on error pages)
page.status       // 404, 500, etc.
page.error        // The error object from handleError

// Form action result
page.form         // Data returned from the last form action
\`\`\`

In Svelte 5, \`page\` is a reactive object (using \`$state\` semantics). You can read its properties directly in templates and they update reactively:

\`\`\`svelte
<script lang="ts">
  import { page } from '$app/state';
</script>

<nav>
  <a href="/" class:active={page.url.pathname === '/'}>Home</a>
  <a href="/about" class:active={page.url.pathname === '/about'}>About</a>
</nav>
\`\`\`

## $app/environment: Runtime Detection

The \`$app/environment\` module exports boolean flags for conditional logic:

\`\`\`typescript
import { browser, building, dev, version } from '$app/environment';
\`\`\`

- **\`browser\`** -- \`true\` in the browser, \`false\` during SSR. Use for browser API access.
- **\`building\`** -- \`true\` during \`vite build\`, \`false\` during dev and runtime. Rare use case.
- **\`dev\`** -- \`true\` during \`vite dev\`, \`false\` in production builds.
- **\`version\`** -- the app version string from \`config.kit.version.name\`.

\`\`\`svelte
<script lang="ts">
  import { dev, browser } from '$app/environment';
</script>

{#if dev}
  <div class="debug-panel">
    <h3>Debug Info</h3>
    <p>Environment: Development</p>
    <p>Rendering: {browser ? 'Client' : 'Server'}</p>
  </div>
{/if}
\`\`\`

The \`dev\` flag is tree-shaken in production builds. If you wrap code in \`if (dev) { ... }\`, the entire block is removed from the production bundle. This makes it safe to include verbose debugging code.

## $app/forms: Form Enhancement

The \`enhance\` action from \`$app/forms\` upgrades HTML forms to submit via JavaScript (covered in detail in the form actions module):

\`\`\`svelte
<script lang="ts">
  import { enhance } from '$app/forms';
</script>

<form method="POST" use:enhance>
  <!-- Submits via fetch instead of full page reload -->
</form>
\`\`\`

## SSR Considerations for App Modules

All \`$app/*\` modules are SSR-aware:
- \`$app/navigation\` functions (\`goto\`, \`invalidate\`, etc.) are browser-only. Calling them during SSR throws an error. Use them only in event handlers, \`$effect\`, or \`onMount\`.
- \`$app/state\`'s \`page\` object works in both environments. During SSR, it reflects the current request. In the browser, it updates reactively.
- \`$app/environment\` works everywhere -- that is its entire purpose.

## Decision Framework: Which Module for Which Task

| Task | Module | Function |
|---|---|---|
| Navigate after an action | \`$app/navigation\` | \`goto()\` |
| Refresh page data | \`$app/navigation\` | \`invalidate()\` / \`invalidateAll()\` |
| Prefetch a route | \`$app/navigation\` | \`preloadData()\` |
| Prevent accidental navigation | \`$app/navigation\` | \`beforeNavigate()\` |
| Read current URL/params | \`$app/state\` | \`page.url\` / \`page.params\` |
| Active link styling | \`$app/state\` | \`page.url.pathname\` |
| Show error info | \`$app/state\` | \`page.error\` / \`page.status\` |
| Check if in browser | \`$app/environment\` | \`browser\` |
| Dev-only debug UI | \`$app/environment\` | \`dev\` |
| Enhance forms | \`$app/forms\` | \`enhance\` |`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.app.navigation'
		},
		{
			type: 'text',
			content: `## Programmatic Navigation with goto()

Use \`goto()\` from \`$app/navigation\` to navigate programmatically -- after form submission, auth checks, etc.

**Your task:** Add a button that navigates to another page using \`goto()\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Reading Page State

The \`page\` object from \`$app/state\` gives you access to the current URL, route params, data, and error state.

**Task:** Display the current URL and route information using \`page\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Environment Checks

\`$app/environment\` exports boolean flags useful for conditional logic:
- \`browser\` -- are we in the browser?
- \`dev\` -- are we in development mode?
- \`building\` -- are we building the app?

**Task:** Use environment checks to conditionally render debug info.`
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
			content: `<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { browser, dev } from '$app/environment';
</script>

<h1>App Modules</h1>

<!-- TODO: Add a goto() button -->

<!-- TODO: Display current URL from page -->

<!-- TODO: Show debug info in dev mode -->`
		}
	],

	solutionFiles: [
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { browser, dev } from '$app/environment';
</script>

<h1>App Modules</h1>

<button onclick={() => goto('/about')}>Go to About</button>

<section>
  <h2>Current Page</h2>
  <p>URL: {page.url.pathname}</p>
  <p>Route: {page.route.id}</p>
</section>

{#if dev}
  <section class="debug">
    <h2>Debug Info</h2>
    <p>Browser: {browser}</p>
    <p>Dev mode: {dev}</p>
  </section>
{/if}

<style>
  .debug {
    background: #fef3c7;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Navigate programmatically with goto()',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'goto(' }]
				}
			},
			hints: [
				'Import `goto` from `$app/navigation`.',
				'Call `goto(\'/about\')` to navigate to the about page.',
				'Use it in a button\'s onclick: `onclick={() => goto(\'/about\')}`.'
			],
			conceptsTested: ['sveltekit.app.navigation']
		},
		{
			id: 'cp-2',
			description: 'Display current page information from $app/state',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'page.url' }]
				}
			},
			hints: [
				'Import `page` from `$app/state`.',
				'Access `page.url.pathname` for the current URL path.',
				'Use `page.route.id` to see the route pattern.'
			],
			conceptsTested: ['sveltekit.app.state']
		},
		{
			id: 'cp-3',
			description: 'Conditionally show debug info using environment checks',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'dev' },
						{ type: 'contains', value: '{#if' }
					]
				}
			},
			hints: [
				'Import `dev` from `$app/environment`.',
				'Use `{#if dev}` to conditionally render debug information.',
				'This block will only show during development, not in production.'
			],
			conceptsTested: ['sveltekit.app.state']
		}
	]
};
