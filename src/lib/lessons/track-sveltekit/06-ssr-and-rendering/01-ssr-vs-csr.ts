import type { Lesson } from '$types/lesson';

export const ssrVsCsr: Lesson = {
	id: 'sveltekit.ssr-and-rendering.ssr-vs-csr',
	slug: 'ssr-vs-csr',
	title: 'SSR vs CSR',
	description: 'Understand server-side rendering, client-side rendering, and hydration tradeoffs.',
	trackId: 'sveltekit',
	moduleId: 'ssr-and-rendering',
	order: 1,
	estimatedMinutes: 12,
	concepts: ['sveltekit.rendering.ssr', 'sveltekit.rendering.hydration'],
	prerequisites: ['sveltekit.routing.file-based'],

	content: [
		{
			type: 'text',
			content: `# Server-Side Rendering vs Client-Side Rendering

By default, SvelteKit **server-renders** every page. This means:

1. The server runs your component and generates HTML
2. The HTML is sent to the browser (fast first paint)
3. JavaScript loads and **hydrates** the page (makes it interactive)

This gives you the best of both worlds — fast initial load and full interactivity.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.rendering.ssr'
		},
		{
			type: 'text',
			content: `## Understanding Hydration

Hydration is the process where Svelte attaches event listeners and reactivity to the server-rendered HTML. During SSR, code that accesses browser APIs (\`window\`, \`document\`) will fail.

**Your task:** Create a component that handles SSR gracefully by checking for the browser environment.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## When to Disable SSR

Some components genuinely cannot run on the server (e.g., they use Canvas or WebGL). You can disable SSR per-page.

**Task:** Create a page that uses browser-only code and configure it to skip SSR.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { browser } from '$app/environment';

  // TODO: Use browser check to safely access window
  let windowWidth = $state(0);
</script>

<h1>SSR vs CSR</h1>

<!-- TODO: Display window width only in the browser -->`
		},
		{
			name: 'canvas/+page.svelte',
			path: '/canvas/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // This page uses browser-only APIs
  let canvas: HTMLCanvasElement;
</script>

<h1>Canvas Demo</h1>
<canvas bind:this={canvas} width="400" height="300"></canvas>`
		},
		{
			name: 'canvas/+page.ts',
			path: '/canvas/+page.ts',
			language: 'typescript',
			content: `// TODO: Disable SSR for this page`
		}
	],

	solutionFiles: [
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { browser } from '$app/environment';

  let windowWidth = $state(0);

  $effect(() => {
    if (browser) {
      windowWidth = window.innerWidth;
    }
  });
</script>

<h1>SSR vs CSR</h1>

{#if browser}
  <p>Window width: {windowWidth}px</p>
{:else}
  <p>Rendering on the server...</p>
{/if}`
		},
		{
			name: 'canvas/+page.svelte',
			path: '/canvas/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let canvas: HTMLCanvasElement;

  $effect(() => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(50, 50, 200, 100);
    }
  });
</script>

<h1>Canvas Demo</h1>
<canvas bind:this={canvas} width="400" height="300"></canvas>`
		},
		{
			name: 'canvas/+page.ts',
			path: '/canvas/+page.ts',
			language: 'typescript',
			content: `export const ssr = false;`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Safely access browser APIs with environment checks',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'browser' }]
				}
			},
			hints: [
				'Import `browser` from `$app/environment` — it is `true` in the browser, `false` on the server.',
				'Wrap browser-only code in `if (browser) { ... }` checks.',
				'Use `{#if browser}` in templates to conditionally render browser-dependent content.'
			],
			conceptsTested: ['sveltekit.rendering.hydration']
		},
		{
			id: 'cp-2',
			description: 'Disable SSR for a page that uses browser-only APIs',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'export const ssr = false' }]
				}
			},
			hints: [
				'In `+page.ts`, export a constant `ssr` set to `false`.',
				'This tells SvelteKit to only render this page in the browser.',
				'Add `export const ssr = false;` to the page\'s `+page.ts` file.'
			],
			conceptsTested: ['sveltekit.rendering.ssr']
		}
	]
};
