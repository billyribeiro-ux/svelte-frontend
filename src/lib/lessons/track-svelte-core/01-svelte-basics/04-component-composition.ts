import type { Lesson } from '$types/lesson';

export const componentComposition: Lesson = {
	id: 'svelte-core.svelte-basics.component-composition',
	slug: 'component-composition',
	title: 'Component Composition',
	description: 'Learn how to nest components, pass children, and build composable UIs in Svelte 5.',
	trackId: 'svelte-core',
	moduleId: 'svelte-basics',
	order: 4,
	estimatedMinutes: 15,
	concepts: ['svelte5.components.nesting', 'svelte5.components.children', 'svelte5.components.composition'],
	prerequisites: ['svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# Component Composition

Real applications are built from many small, focused components combined together. In Svelte 5, you compose UIs by **nesting** components — importing one component and using it inside another.

This keeps each piece simple and reusable.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.components.nesting'
		},
		{
			type: 'text',
			content: `## Creating a Child Component

Look at the starter code. Right now, \`App.svelte\` has everything hardcoded in one file. Let's break it up.

**Task:** Create a \`Card.svelte\` component that renders a styled card with a title and description.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Importing and Using Components

Once you have a child component, import it in the parent and use it like an HTML element:

\`\`\`svelte
<script lang="ts">
  import Card from './Card.svelte';
</script>

<Card />
\`\`\`

**Task:** Import \`Card\` into \`App.svelte\` and use it.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and inspect how Svelte compiles the parent-child relationship. Each component becomes its own module — no runtime component tree overhead like in virtual-DOM frameworks.'
		},
		{
			type: 'text',
			content: `## Passing Children with Snippets

In Svelte 5, you can pass content between a component's opening and closing tags. The child component renders it using the \`{@render children()}\` syntax:

\`\`\`svelte
<!-- Parent -->
<Card>
  <p>This content is passed as children</p>
</Card>

<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div class="card">
  {@render children()}
</div>
\`\`\`

**Task:** Update your \`Card\` component to accept and render children content.`
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
  // TODO: Import the Card component
</script>

<!-- TODO: Use the Card component instead of this hardcoded markup -->
<div class="card">
  <h2>Welcome</h2>
  <p>This is a hardcoded card.</p>
</div>
<div class="card">
  <h2>About</h2>
  <p>This should be a reusable component.</p>
</div>

<style>
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    margin-block-end: 1rem;
    background: white;
  }
</style>`
		},
		{
			name: 'Card.svelte',
			path: '/Card.svelte',
			language: 'svelte',
			content: `<!-- TODO: Create a Card component -->
<!-- It should accept a 'title' prop and render children -->
`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Card from './Card.svelte';
</script>

<Card title="Welcome">
  <p>This content is passed as children!</p>
</Card>
<Card title="About">
  <p>Each card is a reusable component now.</p>
</Card>

<style>
  :global(.card) {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    margin-block-end: 1rem;
    background: white;
  }
</style>`
		},
		{
			name: 'Card.svelte',
			path: '/Card.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, children }: { title: string; children: Snippet } = $props();
</script>

<div class="card">
  <h2>{title}</h2>
  {@render children()}
</div>

<style>
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    margin-block-end: 1rem;
    background: white;
  }

  h2 {
    margin: 0 0 0.5rem;
    color: #1e293b;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a Card.svelte component with a title prop',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$props()' },
						{ type: 'contains', value: 'title' }
					]
				}
			},
			hints: [
				'In `Card.svelte`, add a `<script lang="ts">` block to accept props.',
				'Use `let { title } = $props()` to declare the title prop.',
				'Full Card.svelte: `<script lang="ts">let { title }: { title: string } = $props();</script><div class="card"><h2>{title}</h2></div>`'
			],
			conceptsTested: ['svelte5.components.nesting']
		},
		{
			id: 'cp-2',
			description: 'Import and use the Card component in App.svelte',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: "import Card from './Card.svelte'" },
						{ type: 'regex', value: '<Card[\\s/>]' }
					]
				}
			},
			hints: [
				'In App.svelte, add an import statement inside the `<script>` block.',
				'Import syntax: `import Card from \'./Card.svelte\';`',
				'Then replace the hardcoded `<div class="card">` markup with `<Card title="Welcome" />`.'
			],
			conceptsTested: ['svelte5.components.nesting']
		},
		{
			id: 'cp-3',
			description: 'Pass children content to the Card component',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@render children()' },
						{ type: 'regex', value: '<Card[^/]*>.*</Card>' }
					]
				}
			},
			hints: [
				'In Card.svelte, accept `children` from `$props()` — it\'s a `Snippet` type.',
				'Render it in the template with `{@render children()}`.',
				'In App.svelte, place content between `<Card>` and `</Card>` tags instead of using self-closing `<Card />`.'
			],
			conceptsTested: ['svelte5.components.children', 'svelte5.components.composition']
		}
	]
};
