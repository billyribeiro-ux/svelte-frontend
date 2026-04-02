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

## The Rendering Spectrum

Web applications sit on a spectrum of rendering strategies, and understanding where SvelteKit sits -- and why -- is fundamental to making informed architectural decisions.

**Pure CSR (Client-Side Rendering):** The server sends an empty HTML shell with a \`<script>\` tag. JavaScript downloads, executes, fetches data, and builds the entire DOM. The user sees nothing until JavaScript finishes. This is what Create React App, early Angular, and Vue CLI produce.

**Pure SSR (Server-Side Rendering):** The server renders the complete HTML for every request. No JavaScript runs on the client. Every interaction requires a full page reload. This is how PHP, Rails, and Django traditionally work.

**SSR + Hydration (SvelteKit's default):** The server renders complete HTML (fast first paint, good SEO) and sends it with JavaScript that "hydrates" the page -- attaching event listeners and reactivity to the existing DOM without re-rendering it. Subsequent navigations happen client-side (fast transitions, preserved state).

SvelteKit defaults to SSR + Hydration because it provides the best combination of performance, SEO, and user experience for most applications.

## SSR Step by Step: What Actually Happens

When a user navigates to your SvelteKit app for the first time, here is the precise sequence:

**1. Request arrives at the server**
The user types a URL or clicks a link from an external site. The browser sends an HTTP GET request.

**2. Route resolution**
SvelteKit matches the URL against the route manifest and identifies which \`+page.svelte\`, layouts, and load functions to use.

**3. Load functions execute**
All load functions for the matched route run in parallel (unless \`parent()\` is called, creating a waterfall). Server load functions query databases, call APIs, etc.

**4. Component tree renders to HTML**
SvelteKit passes the loaded data to the component tree (root layout -> nested layouts -> page) and renders it to an HTML string. During this render, Svelte's reactive system is not active -- there are no side effects, no event listeners, no \`$effect\` calls.

**5. HTML response is sent**
The server sends the HTML with:
- The rendered markup (visible content)
- Serialized load function data (embedded as a \`<script>\` tag)
- Links to the JavaScript and CSS bundles
- The initial page state

**6. Browser paints immediately**
The browser receives the HTML and renders it. The user can read content and see the layout before any JavaScript executes. This is the First Contentful Paint (FCP).

**7. JavaScript loads and hydration begins**
The client-side JavaScript bundle loads. Svelte walks the DOM and "hydrates" each component -- comparing the server-rendered HTML to what the component would produce, and attaching event listeners and reactive subscriptions.

**8. Page becomes interactive**
After hydration completes, the page is fully interactive. Button clicks work, forms submit via JavaScript, and navigating to other pages happens client-side.

## Hydration: The Critical Bridge

Hydration is the most misunderstood part of SSR frameworks. It is NOT re-rendering. Svelte does not throw away the server-rendered HTML and rebuild it. Instead, it:

1. Walks the existing DOM nodes
2. Finds the text nodes and elements that correspond to reactive expressions
3. Attaches the reactive subscriptions so that when state changes, those specific DOM nodes update
4. Attaches event listeners to interactive elements

This is why hydration mismatches are problematic. If the server renders \`<p>Hello</p>\` but the client component would produce \`<p>World</p>\` (because of different state), Svelte detects the mismatch and logs a warning. The client wins, but the flash of incorrect content hurts user experience.

**Common hydration mismatch causes:**
- Using \`Date.now()\` or \`Math.random()\` in rendering (different on server vs. client)
- Accessing \`window.innerWidth\` during SSR (window does not exist)
- Browser-specific APIs like \`localStorage\` in reactive expressions
- Timezone differences between server and client

## The browser Check: SSR-Safe Code

SvelteKit provides \`browser\` from \`$app/environment\` to write SSR-safe code:

\`\`\`svelte
<script lang="ts">
  import { browser } from '$app/environment';

  // This runs during SSR (browser = false) and in the browser (browser = true)
  let width = $state(0);

  $effect(() => {
    // $effect only runs in the browser, so this is safe
    width = window.innerWidth;

    const handleResize = () => { width = window.innerWidth; };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
</script>

<!-- Conditional rendering based on environment -->
{#if browser}
  <p>Window width: {width}px</p>
{:else}
  <p>Loading...</p>
{/if}
\`\`\`

Key rules:
- **\`$effect\` is browser-only.** It never runs during SSR. This is the safest place for browser API access.
- **Top-level script code runs in both environments.** Be careful with imports and initializations.
- **Template expressions render on both sides.** Use \`{#if browser}\` for browser-only UI.

## Performance Implications: TTFB, FCP, TTI

SSR affects three critical performance metrics:

- **TTFB (Time to First Byte):** Higher with SSR because the server must run load functions and render HTML. With CSR, the server just sends a static file.
- **FCP (First Contentful Paint):** Lower with SSR because the browser has HTML to paint immediately, without waiting for JavaScript to execute.
- **TTI (Time to Interactive):** Similar for both -- the page is not interactive until JavaScript loads and hydration/rendering completes.

For content-heavy pages (blogs, docs, e-commerce), SSR is a clear win because users see content faster. For app-like pages (dashboards, editors), the TTFB penalty of SSR may not be worth it if the content is meaningless without interactivity.

## When to Disable SSR

Some components genuinely cannot run on the server:
- **Canvas/WebGL** -- requires browser rendering context
- **Third-party widgets** -- libraries that access \`window\` or \`document\` on import
- **Heavy client-side computation** -- WebAssembly modules, audio/video processing

For these cases, disable SSR per-page: \`export const ssr = false\` in \`+page.ts\`. The server sends an empty shell, and the component renders entirely in the browser.`
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
				'Import `browser` from `$app/environment` -- it is `true` in the browser, `false` on the server.',
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
