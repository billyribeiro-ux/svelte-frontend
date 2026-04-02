import type { Lesson } from '$types/lesson';

export const specialElements: Lesson = {
	id: 'svelte-core.svelte-basics.special-elements',
	slug: 'special-elements',
	title: 'Special Elements',
	description: 'Use svelte:head, svelte:window, and svelte:body to interact with the document and browser.',
	trackId: 'svelte-core',
	moduleId: 'svelte-basics',
	order: 6,
	estimatedMinutes: 12,
	concepts: ['svelte5.special-elements.head', 'svelte5.special-elements.window', 'svelte5.special-elements.body'],
	prerequisites: ['svelte5.components.basic', 'svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Special Elements

Svelte provides special elements that let you interact with parts of the document that live outside your component's template — the \`<head>\`, the \`window\`, and the \`<body>\`. These elements look like HTML tags but start with \`svelte:\`.

## Why Special Elements Exist

In a typical web application, your components render into a specific mount point inside the \`<body>\`. But many real-world features need to reach beyond that boundary. You might need to set the page title, listen for keyboard shortcuts on the window, or detect clicks anywhere on the body to close a dropdown. Without special elements, you would need to write imperative code — calling \`document.title = ...\` or \`window.addEventListener(...)\` inside lifecycle hooks and manually cleaning up when the component is destroyed.

This imperative approach has several problems:

1. **Cleanup burden.** Every \`addEventListener\` needs a corresponding \`removeEventListener\`. Forget one and you have a memory leak. In a large application with dozens of components binding to the window, tracking cleanup becomes a real maintenance burden.

2. **SSR incompatibility.** Server-side rendering does not have a \`window\` or \`document\` object. Any imperative code that touches these globals needs to be guarded with \`if (typeof window !== 'undefined')\` checks, which clutters your code and is easy to forget.

3. **Readability.** When event listeners are set up inside \`$effect\` blocks, the connection between the event and its handler is buried in imperative code. The template does not tell you that this component listens for keydown events — you have to read the script section carefully.

Svelte's special elements solve all three problems. They are declarative, automatically cleaned up, and SSR-safe.

### The Full List of Special Elements

Svelte provides several special elements beyond the three we will focus on today:

- \`<svelte:head>\` — Inject elements into the document \`<head>\`
- \`<svelte:window>\` — Bind events and properties on the \`window\` object
- \`<svelte:body>\` — Bind events on the \`<body>\` element
- \`<svelte:element>\` — Render a dynamic HTML tag
- \`<svelte:component>\` — Render a dynamic component (less needed in Svelte 5 where you can use \`{@render}\` blocks)
- \`<svelte:self>\` — Recursively render the current component
- \`<svelte:fragment>\` — Group elements without adding a wrapper DOM node

Today we will work with \`<svelte:head>\`, \`<svelte:window>\`, and \`<svelte:body>\`, then briefly touch on \`<svelte:element>\`.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.special-elements.head'
		},
		{
			type: 'text',
			content: `## svelte:head

Use \`<svelte:head>\` to add elements to the document \`<head>\` — perfect for page titles, meta tags, and external stylesheets:

\`\`\`svelte
<svelte:head>
  <title>My Page</title>
  <meta name="description" content="Page description" />
</svelte:head>
\`\`\`

This is more than syntactic sugar. It integrates with Svelte's reactivity system, so when a \`$state\` variable used in the title changes, the document title updates automatically. No \`$effect\` needed, no manual DOM manipulation.

### SSR and svelte:head

In a server-side rendered SvelteKit application, \`<svelte:head>\` is essential. During SSR, Svelte collects all \`<svelte:head>\` content from every component in the render tree and injects it into the HTML response. This means your page arrives with the correct \`<title>\` and \`<meta>\` tags already in place — critical for SEO and social media sharing.

Without \`<svelte:head>\`, you would need a completely separate mechanism to set page metadata during SSR. Frameworks like React require libraries like \`react-helmet\` or framework-level solutions. Svelte gives you this out of the box.

**Important details:**

- Multiple components can each add their own \`<svelte:head>\` content. All of it is collected and injected.
- If two components set conflicting \`<title>\` tags, the last one rendered wins.
- When a component with a \`<svelte:head>\` block is destroyed, its head content is removed from the document.
- During SSR, the head content is serialized into the HTML response string.

### Common svelte:head Patterns

\`\`\`svelte
<!-- Dynamic page title based on data -->
<svelte:head>
  <title>{product.name} | My Store</title>
  <meta property="og:title" content={product.name} />
  <meta property="og:image" content={product.imageUrl} />
  <link rel="canonical" href="https://mystore.com/products/{product.slug}" />
</svelte:head>

<!-- Loading external resources -->
<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
</svelte:head>
\`\`\`

**Task:** Add a \`<svelte:head>\` block with a dynamic \`<title>\` that reflects the \`pageTitle\` state variable.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## svelte:window

\`<svelte:window>\` lets you declaratively bind event listeners to the \`window\` object. This is cleaner than manually calling \`addEventListener\`:

\`\`\`svelte
<svelte:window onkeydown={handleKeydown} />
\`\`\`

### Lifecycle and Automatic Cleanup

When Svelte encounters a \`<svelte:window>\` element in your template, the compiler generates \`addEventListener\` calls that run when the component mounts and \`removeEventListener\` calls that run when it unmounts. You never write cleanup code. This is not just convenient — it eliminates an entire class of memory-leak bugs.

Consider the imperative alternative:

\`\`\`svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let innerWidth = $state(0);

  function handleResize() {
    innerWidth = window.innerWidth;
  }

  onMount(() => {
    window.addEventListener('resize', handleResize);
    handleResize(); // get initial value
  });

  onDestroy(() => {
    window.removeEventListener('resize', handleResize);
  });
</script>
\`\`\`

Compare with the declarative version:

\`\`\`svelte
<svelte:window bind:innerWidth />
\`\`\`

One line replaces twelve. And the one-line version cannot have cleanup bugs because Svelte handles the lifecycle for you.

### Bindable Window Properties

You can bind to several read-only window properties:

- \`innerWidth\` / \`innerHeight\` — Viewport dimensions
- \`outerWidth\` / \`outerHeight\` — Full window dimensions including browser chrome
- \`scrollX\` / \`scrollY\` — Scroll position (these are read-write, so you can set them to scroll programmatically)
- \`online\` — Whether the browser has network connectivity

\`\`\`svelte
<svelte:window bind:innerWidth bind:scrollY />

{#if scrollY > 200}
  <button onclick={() => scrollY = 0}>Back to top</button>
{/if}
\`\`\`

### Keyboard Shortcuts Pattern

One of the most common uses of \`<svelte:window>\` is implementing global keyboard shortcuts:

\`\`\`svelte
<script lang="ts">
  function handleKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      openCommandPalette();
    }
    if (event.key === 'Escape') {
      closeModal();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />
\`\`\`

**Task:** Add a \`<svelte:window>\` element that listens for \`keydown\` events and displays the last key pressed.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and check the compiled output. Notice how `<svelte:window>` compiles to a proper `addEventListener`/`removeEventListener` pair with automatic cleanup.'
		},
		{
			type: 'text',
			content: `## svelte:body

\`<svelte:body>\` works like \`<svelte:window>\` but for the \`<body>\` element. It is useful for events that fire on the body, like detecting clicks outside a component:

\`\`\`svelte
<svelte:body onclick={handleBodyClick} />
\`\`\`

### When to Use svelte:body vs svelte:window

The distinction matters because event bubbling works differently:

- **\`<svelte:window>\`** captures events on the \`window\` object. Window events include \`resize\`, \`scroll\` (for the main document scroll), \`online\`/\`offline\`, \`hashchange\`, \`popstate\`, and keyboard events. Some events like \`resize\` only fire on the window, not on the body.

- **\`<svelte:body>\`** captures events on the \`<body>\` element. This is where you want to listen for \`click\`, \`mouseenter\`, \`mouseleave\`, \`dragover\`, \`drop\`, and similar DOM events that bubble up from child elements. The \`mouseenter\` event, for example, does not fire on the window — only on the body.

A practical rule: use \`<svelte:window>\` for window-level events (resize, keyboard, connectivity) and \`<svelte:body>\` for document-level DOM events (click, drag, pointer events).

### Click-Outside Pattern

A common use for \`<svelte:body>\` is the "click outside to close" pattern for dropdowns and modals:

\`\`\`svelte
<script lang="ts">
  let open = $state(false);
  let dropdownRef: HTMLElement;

  function handleBodyClick(event: MouseEvent) {
    if (open && dropdownRef && !dropdownRef.contains(event.target as Node)) {
      open = false;
    }
  }
</script>

<svelte:body onclick={handleBodyClick} />

<div bind:this={dropdownRef}>
  <button onclick={() => open = !open}>Menu</button>
  {#if open}
    <ul class="dropdown">
      <li>Option 1</li>
      <li>Option 2</li>
    </ul>
  {/if}
</div>
\`\`\`

**Task:** Add a \`<svelte:body>\` element that tracks clicks and displays a counter.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## svelte:element — Dynamic Tags

\`<svelte:element>\` lets you render a tag whose name is determined at runtime:

\`\`\`svelte
<script lang="ts">
  let tag = $state('h1');
</script>

<svelte:element this={tag}>
  I am rendered as a {tag} element
</svelte:element>
\`\`\`

This is useful when building component libraries where the semantic tag should be configurable — for example, a \`Heading\` component that can render as \`h1\` through \`h6\`:

\`\`\`svelte
<script lang="ts">
  let { level = 2 }: { level: 1 | 2 | 3 | 4 | 5 | 6 } = $props();
</script>

<svelte:element this={\`h\${level}\`}>
  {@render children?.()}
</svelte:element>
\`\`\`

The \`this\` attribute must be a valid HTML tag name. If you pass \`null\` or \`undefined\`, nothing is rendered. If you pass an unknown string, the browser will render it as a generic inline element (like a custom element without a definition).

### When Dynamic Tags Shine

- **Design system components.** A \`Box\` component that can render as \`div\`, \`section\`, \`article\`, or \`aside\`.
- **Typography components.** A \`Text\` component that renders the semantically appropriate heading level or paragraph tag.
- **Polymorphic components.** Components where the rendered element depends on props — like a \`Button\` that renders as \`<a>\` when given an \`href\` prop and \`<button>\` otherwise.

## Summary

Special elements let you reach beyond your component's template boundary in a declarative, cleanup-safe, SSR-compatible way. \`<svelte:head>\` manages document metadata. \`<svelte:window>\` binds to the window for global events and viewport state. \`<svelte:body>\` handles body-level DOM events. And \`<svelte:element>\` renders dynamic HTML tags when the tag name is not known at compile time.

The key insight is that all of these elements participate in Svelte's reactivity system. They update when state changes, they clean up when components unmount, and they work correctly during server-side rendering. This makes them strictly better than the imperative alternatives.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let pageTitle = $state('My Svelte App');
  let lastKey = $state('');
  let clickCount = $state(0);

  // TODO: Create a function to handle keydown events
  // TODO: Create a function to handle body clicks
</script>

<!-- TODO: Add svelte:head with a dynamic title -->
<!-- TODO: Add svelte:window for keydown -->
<!-- TODO: Add svelte:body for click -->

<h1>{pageTitle}</h1>

<label>
  Page title:
  <input bind:value={pageTitle} />
</label>

<p>Last key pressed: {lastKey || 'none yet'}</p>
<p>Body clicks: {clickCount}</p>

<style>
  h1 {
    color: var(--sf-accent, #6366f1);
  }

  label {
    display: block;
    margin-block: 1rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let pageTitle = $state('My Svelte App');
  let lastKey = $state('');
  let clickCount = $state(0);

  function handleKeydown(event: KeyboardEvent) {
    lastKey = event.key;
  }

  function handleBodyClick() {
    clickCount += 1;
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<svelte:body onclick={handleBodyClick} />

<h1>{pageTitle}</h1>

<label>
  Page title:
  <input bind:value={pageTitle} />
</label>

<p>Last key pressed: {lastKey || 'none yet'}</p>
<p>Body clicks: {clickCount}</p>

<style>
  h1 {
    color: var(--sf-accent, #6366f1);
  }

  label {
    display: block;
    margin-block: 1rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add a svelte:head element with a dynamic title',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<svelte:head>' },
						{ type: 'regex', value: '<title>\\{.*\\}</title>' }
					]
				}
			},
			hints: [
				'`<svelte:head>` works like a regular HTML element — put it anywhere in your template.',
				'Inside it, add a `<title>` tag with a dynamic expression: `<title>{pageTitle}</title>`.',
				'Add `<svelte:head><title>{pageTitle}</title></svelte:head>` to the template.'
			],
			conceptsTested: ['svelte5.special-elements.head']
		},
		{
			id: 'cp-2',
			description: 'Add svelte:window with a keydown handler',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<svelte:window' },
						{ type: 'regex', value: 'onkeydown=\\{' }
					]
				}
			},
			hints: [
				'`<svelte:window>` is a self-closing tag that accepts event handlers as attributes.',
				'Create a function that takes a `KeyboardEvent` and updates `lastKey = event.key`.',
				'Add `<svelte:window onkeydown={handleKeydown} />` and define `function handleKeydown(event: KeyboardEvent) { lastKey = event.key; }`.'
			],
			conceptsTested: ['svelte5.special-elements.window']
		},
		{
			id: 'cp-3',
			description: 'Add svelte:body with a click handler',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<svelte:body' },
						{ type: 'regex', value: 'onclick=\\{' }
					]
				}
			},
			hints: [
				'`<svelte:body>` works just like `<svelte:window>` but attaches to the body element.',
				'Create a function that increments `clickCount` on each call.',
				'Add `<svelte:body onclick={handleBodyClick} />` and define `function handleBodyClick() { clickCount += 1; }`.'
			],
			conceptsTested: ['svelte5.special-elements.body']
		}
	]
};
