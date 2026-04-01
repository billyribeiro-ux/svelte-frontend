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

Snippets become truly powerful when combined with TypeScript generics and composition patterns. You can build type-safe, reusable components that let consumers control rendering while the component manages data and behavior.`
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

**Your task:** Create a \`DataList\` component that accepts typed \`row\` and optional \`empty\` snippets.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Optional Snippets with Fallbacks

Snippets can be optional. Use conditional rendering to provide fallback UI when a snippet isn't provided.

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

**Task:** Add an optional \`footer\` snippet to DataList that shows a default message when not provided.`
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
