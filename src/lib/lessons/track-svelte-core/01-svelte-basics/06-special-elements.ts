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

Svelte provides special elements that let you interact with parts of the document that live outside your component's template — the \`<head>\`, the \`window\`, and the \`<body>\`.

These elements look like HTML tags but start with \`svelte:\`.`
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

**Task:** Add a \`<svelte:head>\` block with a dynamic \`<title>\`.`
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

You can also bind to window properties like \`innerWidth\` and \`scrollY\`.

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

\`<svelte:body>\` works like \`<svelte:window>\` but for the \`<body>\` element. It's useful for events that fire on the body, like detecting clicks outside a component:

\`\`\`svelte
<svelte:body onclick={handleBodyClick} />
\`\`\`

**Task:** Add a \`<svelte:body>\` element that tracks clicks and displays a counter.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
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
