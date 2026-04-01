import type { Lesson } from '$types/lesson';

export const snippetsAsProps: Lesson = {
	id: 'svelte-core.snippets-and-composition.snippets-as-props',
	slug: 'snippets-as-props',
	title: 'Snippets as Props',
	description:
		'Pass snippets to components as props, replacing the old slot pattern with a more explicit API.',
	trackId: 'svelte-core',
	moduleId: 'snippets-and-composition',
	order: 2,
	estimatedMinutes: 15,
	concepts: ['svelte5.snippets.as-props', 'svelte5.snippets.replacing-slots'],
	prerequisites: ['svelte5.snippets.define', 'svelte5.snippets.render'],

	content: [
		{
			type: 'text',
			content: `# Snippets as Props

In Svelte 5, snippets can be passed as props to components. This replaces the old \`<slot>\` pattern with something more explicit and type-safe.

A component declares snippet props, and the parent provides them — either as named snippet blocks or inline.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.snippets.as-props'
		},
		{
			type: 'text',
			content: `## Passing Snippets to Components

When you use a snippet block directly inside a component tag, it becomes a prop of that component.

\`\`\`svelte
<!-- Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { header, body }: { header: Snippet; body: Snippet } = $props();
</script>

<div class="card">
  <div class="header">{@render header()}</div>
  <div class="body">{@render body()}</div>
</div>

<!-- App.svelte -->
<Card>
  {#snippet header()}
    <h2>My Card</h2>
  {/snippet}
  {#snippet body()}
    <p>Card content goes here.</p>
  {/snippet}
</Card>
\`\`\`

**Your task:** Create a \`Card\` component that accepts \`header\` and \`body\` snippet props. Use it in App.svelte.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Snippets with Parameters

Components can pass data back to snippets by calling \`{@render}\` with arguments. This is how you create renderless or data-providing components.

\`\`\`svelte
<!-- List.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { items, row }: { items: string[]; row: Snippet<[string, number]> } = $props();
</script>

<ul>
  {#each items as item, i}
    <li>{@render row(item, i)}</li>
  {/each}
</ul>
\`\`\`

**Task:** Create a \`List\` component that accepts an \`items\` array and a \`row\` snippet prop with parameters. The parent controls how each item renders.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Card from './Card.svelte';
  import List from './List.svelte';

  const fruits = ['Apple', 'Banana', 'Cherry'];
</script>

<div>
  <!-- TODO: Use Card with header and body snippets -->
  <!-- TODO: Use List with a row snippet -->
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>`
		},
		{
			name: 'Card.svelte',
			path: '/Card.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Accept header and body snippet props
</script>

<div class="card">
  <!-- TODO: Render header and body snippets -->
</div>

<style>
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }
</style>`
		},
		{
			name: 'List.svelte',
			path: '/List.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Accept items and row snippet props
</script>

<!-- TODO: Render each item using the row snippet -->`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Card from './Card.svelte';
  import List from './List.svelte';

  const fruits = ['Apple', 'Banana', 'Cherry'];
</script>

<div>
  <Card>
    {#snippet header()}
      <h2>Fruit List</h2>
    {/snippet}
    {#snippet body()}
      <p>Here are some delicious fruits.</p>
    {/snippet}
  </Card>

  <List items={fruits}>
    {#snippet row(item, index)}
      <strong>{index + 1}.</strong> {item}
    {/snippet}
  </List>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>`
		},
		{
			name: 'Card.svelte',
			path: '/Card.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { header, body }: { header: Snippet; body: Snippet } = $props();
</script>

<div class="card">
  <div class="header">{@render header()}</div>
  <div class="body">{@render body()}</div>
</div>

<style>
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .header {
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .body {
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'List.svelte',
			path: '/List.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { items, row }: { items: string[]; row: Snippet<[string, number]> } = $props();
</script>

<ul>
  {#each items as item, i}
    <li>{@render row(item, i)}</li>
  {/each}
</ul>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a Card component with header and body snippet props',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'Snippet' },
						{ type: 'contains', value: '{@render header' }
					]
				}
			},
			hints: [
				'Import `Snippet` from svelte and use it as the type for your props.',
				'In Card.svelte: `let { header, body }: { header: Snippet; body: Snippet } = $props();`',
				'Render with `{@render header()}` and `{@render body()}` inside the card div.'
			],
			conceptsTested: ['svelte5.snippets.as-props']
		},
		{
			id: 'cp-2',
			description: 'Create a List component with a parameterized row snippet',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'Snippet<' },
						{ type: 'contains', value: '{@render row(' }
					]
				}
			},
			hints: [
				'The `row` prop should be typed as `Snippet<[string, number]>` to accept item and index.',
				'In the each block, call `{@render row(item, i)}`.',
				'Define `let { items, row }: { items: string[]; row: Snippet<[string, number]> } = $props();` and use `{#each items as item, i}<li>{@render row(item, i)}</li>{/each}`.'
			],
			conceptsTested: ['svelte5.snippets.as-props', 'svelte5.snippets.replacing-slots']
		}
	]
};
