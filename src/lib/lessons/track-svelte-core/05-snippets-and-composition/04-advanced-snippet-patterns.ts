import type { Lesson } from '$types/lesson';

export const advancedSnippetPatterns: Lesson = {
	id: 'svelte-core.snippets-and-composition.advanced-snippet-patterns',
	slug: 'advanced-snippet-patterns',
	title: 'Advanced Snippet Patterns',
	description:
		'Explore typed snippets, generic snippet patterns, and building reusable snippet libraries.',
	trackId: 'svelte-core',
	moduleId: 'snippets-and-composition',
	order: 4,
	estimatedMinutes: 18,
	concepts: ['svelte5.snippets.typed', 'svelte5.snippets.generic', 'svelte5.snippets.patterns'],
	prerequisites: ['svelte5.snippets.as-props', 'svelte5.snippets.children'],

	content: [
		{
			type: 'text',
			content: `# Advanced Snippet Patterns

## WHY Generic Snippets Change Everything

In the previous lessons, snippets were typed with concrete types: \`Snippet<[string, number]>\`. This works when you know the data type at component-authoring time. But library components -- data tables, autocomplete inputs, tree views, sortable lists -- must work with *any* data type the consumer provides. Without generics, you would need to type snippet parameters as \`any\` or \`unknown\`, losing the type safety that makes snippets superior to slots.

Svelte 5 solves this with the \`generics\` attribute on the script tag:

\`\`\`svelte
<script lang="ts" generics="T">
\`\`\`

This tells the compiler: "This component is generic over \`T\`. Infer \`T\` from the props the consumer provides." When you pass \`items={['a', 'b']}\`, TypeScript infers \`T = string\`. When you pass \`items={[{id: 1}]}\`, it infers \`T = {id: number}\`. The snippet types flow from this inference:

\`\`\`svelte
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  let { items, row }: { items: T[]; row: Snippet<[T, number]> } = $props();
</script>
\`\`\`

Now the consumer's snippet is type-checked against the actual items they passed. If \`items\` is \`Todo[]\`, then the \`row\` snippet must accept \`(item: Todo, index: number)\`. The compiler enforces this at the call site -- no runtime checks, no \`any\` escape hatches.

### How the Compiler Handles Generics

When the compiler sees \`generics="T"\`, it generates a TypeScript generic function signature for the component's constructor. The props type becomes parameterized:

\`\`\`typescript
// Conceptually generated
function DataList<T>(props: {
  items: T[];
  row: Snippet<[T, number]>;
  empty?: Snippet;
}): void;
\`\`\`

TypeScript's inference engine then determines \`T\` from the call site. Multiple generics are supported (\`generics="T, U"\`), and you can add constraints (\`generics="T extends { id: number }"\`).

### Recursive Snippets

Because snippets are just functions, a snippet can call itself recursively. This enables rendering tree structures:

\`\`\`svelte
{#snippet treeNode(node)}
  <li>
    {node.name}
    {#if node.children?.length}
      <ul>
        {#each node.children as child}
          {@render treeNode(child)}
        {/each}
      </ul>
    {/if}
  </li>
{/snippet}
\`\`\`

The compiler handles this correctly because snippets compile to regular JavaScript functions, and JavaScript functions naturally support recursion. There is no stack-depth limit imposed by Svelte -- only the engine's native call stack limit.

### Decision Framework: Typed vs. Generic vs. Recursive

| Pattern | When to Use |
|---|---|
| **Concrete typed** \`Snippet<[string]>\` | Component works with a known, fixed data type |
| **Generic** \`Snippet<[T]>\` with \`generics="T"\` | Library component that must handle any data type |
| **Constrained generic** \`T extends Base\` | Generic component that needs specific properties on T |
| **Recursive snippet** | Tree structures, nested data, fractal layouts |
| **Optional snippet** \`snippet?: Snippet\` | Component with fallback UI when snippet not provided |`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.snippets.typed'
		},
		{
			type: 'text',
			content: `## Typed Snippet Props

Use the \`Snippet\` type with parameters to ensure type safety between the component and its consumers.

\`\`\`svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props<T> {
    items: T[];
    row: Snippet<[T, number]>;
    empty?: Snippet;
  }

  let { items, row, empty }: Props<string> = $props();
</script>
\`\`\`

### WHY You Should Type Every Snippet Prop

Leaving snippet props untyped (\`row: Snippet\` without parameters) means the child can call \`{@render row(anything)}\` and the parent has no guarantee about what arguments it will receive. This defeats the purpose of moving from slots to snippets. The rule is: **if a snippet receives arguments, type those arguments.**

For snippets that take no arguments (like \`empty\` above), \`Snippet\` without parameters is correct and complete.

**Your task:** Create a \`DataList\` component that accepts typed \`row\` and optional \`empty\` snippets. The \`row\` snippet should be typed to receive the item and its index. When the items array is empty, render the \`empty\` snippet or a default message.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Optional Snippets with Fallbacks

Snippets can be optional. Use conditional rendering to provide fallback UI when a snippet is not provided. This is a fundamental pattern for building flexible components that work well with zero configuration but can be customized when needed.

\`\`\`svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { header, children }: { header?: Snippet; children: Snippet } = $props();
</script>

{#if header}
  {@render header()}
{:else}
  <p>Default header</p>
{/if}
{@render children()}
\`\`\`

### The Progressive Disclosure Principle

Well-designed components follow progressive disclosure: they work with minimal configuration, but every rendering aspect can be overridden when needed. Optional snippets implement this perfectly:

- **Zero-config usage:** \`<DataList items={data}>\` renders with defaults for everything
- **Custom row rendering:** \`<DataList items={data}>{#snippet row(item)}...{/snippet}</DataList>\`
- **Custom empty state:** Add an \`empty\` snippet to override the "no items" message
- **Custom footer:** Add a \`footer\` snippet for summary information

Each level of customization is opt-in. The component grows in sophistication without growing in complexity for simple use cases.

### Composing Multiple Optional Snippets

Real-world data components often have many optional snippet slots. A well-designed data table might accept:

\`\`\`typescript
interface DataTableProps<T> {
  items: T[];
  row: Snippet<[T, number]>;      // Required: how to render each row
  header?: Snippet;                 // Optional: custom table header
  footer?: Snippet;                 // Optional: custom footer
  empty?: Snippet;                  // Optional: custom empty state
  loading?: Snippet;                // Optional: custom loading state
  error?: Snippet<[Error]>;         // Optional: custom error state
}
\`\`\`

Each optional snippet has a sensible default. This approach gives consumers full control over every visual aspect of the component while keeping the simple case simple.

**Task:** Add an optional \`footer\` snippet to DataList that shows a default message when not provided. Test it by using DataList once with a custom footer and once without to verify the fallback renders correctly.`
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
  import DataList from './DataList.svelte';

  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }

  const todos: Todo[] = [
    { id: 1, text: 'Learn snippets', done: true },
    { id: 2, text: 'Build components', done: false },
    { id: 3, text: 'Ship app', done: false }
  ];

  const emptyList: Todo[] = [];
</script>

<div>
  <!-- TODO: Use DataList with row snippet -->
  <!-- TODO: Use DataList with empty list to show empty snippet -->
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .todo-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .done {
    text-decoration: line-through;
    opacity: 0.6;
  }
</style>`
		},
		{
			name: 'DataList.svelte',
			path: '/DataList.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Accept items, row, empty, and footer snippet props
</script>

<!-- TODO: Render items with row snippet, or empty snippet when no items -->
<!-- TODO: Render footer or default footer -->`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import DataList from './DataList.svelte';

  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }

  const todos: Todo[] = [
    { id: 1, text: 'Learn snippets', done: true },
    { id: 2, text: 'Build components', done: false },
    { id: 3, text: 'Ship app', done: false }
  ];

  const emptyList: Todo[] = [];
</script>

<div>
  <h2>Todo List</h2>
  <DataList items={todos}>
    {#snippet row(item: Todo, index: number)}
      <div class="todo-item">
        <span class:done={item.done}>{index + 1}. {item.text}</span>
        {#if item.done}
          <span>&#10003;</span>
        {/if}
      </div>
    {/snippet}
    {#snippet footer()}
      <p><em>{todos.length} items total</em></p>
    {/snippet}
  </DataList>

  <h2>Empty List</h2>
  <DataList items={emptyList}>
    {#snippet row(item: Todo, index: number)}
      <span>{item.text}</span>
    {/snippet}
    {#snippet empty()}
      <p>No items yet. Add some!</p>
    {/snippet}
  </DataList>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .todo-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .done {
    text-decoration: line-through;
    opacity: 0.6;
  }
</style>`
		},
		{
			name: 'DataList.svelte',
			path: '/DataList.svelte',
			language: 'svelte',
			content: `<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';

  let { items, row, empty, footer }: {
    items: T[];
    row: Snippet<[T, number]>;
    empty?: Snippet;
    footer?: Snippet;
  } = $props();
</script>

{#if items.length === 0}
  {#if empty}
    {@render empty()}
  {:else}
    <p>No items to display.</p>
  {/if}
{:else}
  <ul>
    {#each items as item, i}
      <li>{@render row(item, i)}</li>
    {/each}
  </ul>
{/if}

{#if footer}
  {@render footer()}
{:else}
  <p><small>End of list</small></p>
{/if}`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a DataList with typed row and empty snippet props',
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
				'Import `Snippet` from svelte and type the row prop as `Snippet<[T, number]>`.',
				'Use `{#each items as item, i}` and call `{@render row(item, i)}`.',
				'Define props: `let { items, row, empty }: { items: T[]; row: Snippet<[T, number]>; empty?: Snippet } = $props();`'
			],
			conceptsTested: ['svelte5.snippets.typed']
		},
		{
			id: 'cp-2',
			description: 'Add an optional footer snippet with a default fallback',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'footer' },
						{ type: 'regex', value: '#if footer' }
					]
				}
			},
			hints: [
				'Add `footer?: Snippet` to your props type.',
				'Use `{#if footer}{@render footer()}{:else}...default...{/if}`.',
				'Add `footer?: Snippet` to props and conditionally render: `{#if footer}{@render footer()}{:else}<p>End of list</p>{/if}`'
			],
			conceptsTested: ['svelte5.snippets.patterns']
		}
	]
};
