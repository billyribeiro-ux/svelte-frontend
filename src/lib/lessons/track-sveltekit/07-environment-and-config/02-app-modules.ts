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

SvelteKit provides several built-in modules for common tasks:

- **\`$app/navigation\`** — \`goto()\`, \`invalidate()\`, \`preloadData()\`, \`afterNavigate()\`
- **\`$app/state\`** — \`page\` (current page state with url, params, data, error)
- **\`$app/environment\`** — \`browser\`, \`building\`, \`dev\`, \`version\`

These are available throughout your app and provide essential SvelteKit functionality.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.app.navigation'
		},
		{
			type: 'text',
			content: `## Programmatic Navigation with goto()

Use \`goto()\` from \`$app/navigation\` to navigate programmatically — after form submission, auth checks, etc.

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
- \`browser\` — are we in the browser?
- \`dev\` — are we in development mode?
- \`building\` — are we building the app?

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
