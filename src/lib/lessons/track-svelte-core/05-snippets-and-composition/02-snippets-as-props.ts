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

## WHY Snippets Replaced Slots

Svelte 4's slot system had three fundamental problems that snippets-as-props solve:

**1. Implicit naming created invisible contracts.** A slot named \`header\` in a child component was filled by a \`<div slot="header">\` in the parent, but nothing in the type system connected these two strings. Rename the slot in the child, and the parent silently breaks. With snippets-as-props, the connection is an explicit TypeScript-typed property: \`header: Snippet\`. Rename it, and the compiler immediately flags every call site.

**2. Data flow through slots was untyped and confusing.** Slots could pass data back to the parent via \`let:\` directives -- \`<slot item={item}>\` consumed as \`<div slot="default" let:item>\`. The \`let:\` syntax was unique to Svelte, unfamiliar to newcomers, and completely invisible to TypeScript. The type of \`item\` was \`any\`. With snippets, you write \`Snippet<[Item, number]>\` and the compiler enforces the shape at every usage site.

**3. The slot compilation model was structurally complex.** Slots compiled into a system where the parent component created "slot fragment" functions and passed them to the child's render context. The child then invoked those fragments inside its own DOM structure. This worked but created a two-phase rendering pipeline that was difficult to optimize and made the compiled output hard to reason about. Snippets compile to simple function calls -- the parent defines a function, passes it as a prop, and the child calls it. The mental model matches standard JavaScript.

### How the Compiler Handles Snippet Props

When you write a snippet block inside a component tag:

\`\`\`svelte
<Card>
  {#snippet header()}
    <h2>Title</h2>
  {/snippet}
</Card>
\`\`\`

The compiler transforms this into something conceptually like:

\`\`\`javascript
Card({
  header: () => { /* create <h2>Title</h2> DOM nodes */ }
});
\`\`\`

The snippet becomes a prop on the component's props object. Inside the child, \`{@render header()}\` simply invokes that function. This is identical to how any other prop works -- no special slot machinery, no hidden rendering phases.

### The Snippet<[T]> Type System

The \`Snippet\` type from \`svelte\` is generic. The type parameter is a **tuple** describing the arguments the snippet expects when rendered:

- \`Snippet\` -- no parameters (equivalent to \`Snippet<[]>\`)
- \`Snippet<[string]>\` -- one string parameter
- \`Snippet<[Item, number]>\` -- two parameters: an Item and an index
- \`Snippet<[T]>\` -- generic, when used with \`generics="T"\` on the script tag

This tuple design (rather than multiple type parameters) was chosen because it maps directly to the \`{@render row(item, i)}\` call syntax -- the tuple elements correspond positionally to the render arguments.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.snippets.as-props'
		},
		{
			type: 'text',
			content: `## Passing Snippets to Components

When you use a snippet block directly inside a component tag, it becomes a prop of that component. The child declares and types these props explicitly.

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

### Migration from Slots

The migration pattern is mechanical:

| Svelte 4 (Slots) | Svelte 5 (Snippets) |
|---|---|
| \`<slot name="header" />\` in child | \`{@render header()}\` in child |
| \`<div slot="header">\` in parent | \`{#snippet header()}...{/snippet}\` in parent |
| \`<slot item={item} />\` (passing data) | \`{@render row(item)}\` |
| \`let:item\` on the slot consumer | Snippet parameter: \`{#snippet row(item)}\` |
| No type safety | Full \`Snippet<[T]>\` typing |

**Your task:** Create a \`Card\` component that accepts \`header\` and \`body\` snippet props. Use it in App.svelte. Notice how the contract between parent and child is now explicit and typed.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Snippets with Parameters (Render Props Pattern)

The most powerful use of snippet-as-props is the **render props pattern**: the child component owns data and behavior, but delegates rendering to the parent. This inverts control -- the child says "I have an item and its index, you decide how it looks."

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

### WHY This Pattern Matters

This is the Svelte equivalent of React's render props or Vue's scoped slots, but with three advantages:

1. **Type safety end-to-end.** The \`Snippet<[string, number]>\` type ensures the parent snippet accepts the right types. If the child passes \`(item, i)\` and the parent declares \`(item: number, i: string)\`, the compiler catches it.

2. **No wrapper component tax.** In React, render props require wrapping in a function component or using \`children\` as a function, creating an additional component in the tree. Svelte snippets add zero component overhead -- they compile to direct function calls within the child's render cycle.

3. **Colocation with consuming code.** The snippet is defined right where it is used, inside the parent's template. You can see the data shape and the rendering logic in the same visual context.

### Decision Framework: When to Use Parameterized Snippets

Use parameterized snippet props when:
- A component manages a **collection** and the consumer controls **item rendering**
- A component provides **computed or fetched data** that multiple consumers render differently
- You are building a **library component** where flexibility in visual output is a requirement

Avoid them when:
- The rendering is fixed and does not vary between consumers (just use normal markup)
- The component is simple enough that props + conditional rendering suffice

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
