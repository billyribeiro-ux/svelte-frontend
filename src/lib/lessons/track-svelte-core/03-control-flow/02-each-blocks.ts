import type { Lesson } from '$types/lesson';

export const eachBlocks: Lesson = {
	id: 'svelte-core.control-flow.each-blocks',
	slug: 'each-blocks',
	title: 'List Rendering with {#each}',
	description: 'Render lists of items using {#each} blocks with keys and destructuring.',
	trackId: 'svelte-core',
	moduleId: 'control-flow',
	order: 2,
	estimatedMinutes: 12,
	concepts: ['svelte5.control-flow.each', 'svelte5.control-flow.each-key', 'svelte5.control-flow.each-destructuring'],
	prerequisites: ['svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# List Rendering with \`{#each}\`

Rendering a list of items is one of the most common tasks in UI development. Svelte uses \`{#each}\` blocks:

\`\`\`svelte
{#each items as item}
  <li>{item}</li>
{/each}
\`\`\`

This iterates over the \`items\` array and renders the template once for each element.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.control-flow.each'
		},
		{
			type: 'text',
			content: `## Basic {#each}

Look at the starter code — there's an array of todo items rendered as a static list. Let's make it dynamic.

**Task:** Replace the hardcoded list items with an \`{#each}\` block that iterates over the \`todos\` array.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Keyed Each Blocks

When list items can be added, removed, or reordered, Svelte needs a unique key to track each item. Without a key, Svelte updates by position — which can cause bugs:

\`\`\`svelte
{#each items as item (item.id)}
  <li>{item.name}</li>
{/each}
\`\`\`

The key expression \`(item.id)\` tells Svelte how to match items across updates.

**Task:** Add a key to your \`{#each}\` block using each todo's \`id\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and compare keyed vs unkeyed each blocks. With a key, Svelte can move DOM nodes instead of recreating them — watch the compiled output to see the keyed block logic.'
		},
		{
			type: 'text',
			content: `## Destructuring in {#each}

You can destructure each item directly in the block expression:

\`\`\`svelte
{#each todos as { id, text, done } (id)}
  <li class:done>{text}</li>
{/each}
\`\`\`

You also get the index as a second parameter: \`{#each items as item, i}\`

**Task:** Use destructuring to pull out the properties directly.`
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
  let todos = $state([
    { id: 1, text: 'Learn Svelte', done: false },
    { id: 2, text: 'Build an app', done: false },
    { id: 3, text: 'Deploy it', done: false }
  ]);

  let nextId = $state(4);

  function addTodo() {
    todos.push({ id: nextId++, text: 'New todo ' + nextId, done: false });
  }

  function toggleTodo(id: number) {
    const todo = todos.find((t) => t.id === id);
    if (todo) todo.done = !todo.done;
  }
</script>

<button onclick={addTodo}>Add Todo</button>

<!-- TODO: Replace this static list with {#each} -->
<ul>
  <li>Learn Svelte</li>
  <li>Build an app</li>
  <li>Deploy it</li>
</ul>

<style>
  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-block-end: 1rem;
  }

  li {
    padding: 0.5rem 0;
    cursor: pointer;
  }

  .done {
    text-decoration: line-through;
    opacity: 0.6;
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
  let todos = $state([
    { id: 1, text: 'Learn Svelte', done: false },
    { id: 2, text: 'Build an app', done: false },
    { id: 3, text: 'Deploy it', done: false }
  ]);

  let nextId = $state(4);

  function addTodo() {
    todos.push({ id: nextId++, text: 'New todo ' + nextId, done: false });
  }

  function toggleTodo(id: number) {
    const todo = todos.find((t) => t.id === id);
    if (todo) todo.done = !todo.done;
  }
</script>

<button onclick={addTodo}>Add Todo</button>

<ul>
  {#each todos as { id, text, done } (id)}
    <li class:done onclick={() => toggleTodo(id)}>
      {text}
    </li>
  {/each}
</ul>

<style>
  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-block-end: 1rem;
  }

  li {
    padding: 0.5rem 0;
    cursor: pointer;
  }

  .done {
    text-decoration: line-through;
    opacity: 0.6;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use {#each} to render the todo list dynamically',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#each todos as' },
						{ type: 'contains', value: '{/each}' }
					]
				}
			},
			hints: [
				'Replace the hardcoded `<li>` elements with an `{#each}` block.',
				'The syntax is: `{#each todos as todo}<li>{todo.text}</li>{/each}`',
				'Wrap it inside `<ul>`: `<ul>{#each todos as todo}<li>{todo.text}</li>{/each}</ul>`'
			],
			conceptsTested: ['svelte5.control-flow.each']
		},
		{
			id: 'cp-2',
			description: 'Add a key expression to the {#each} block',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '\\(\\s*\\w+\\.id\\s*\\)' }
					]
				}
			},
			hints: [
				'Keys go in parentheses after the `as` clause: `{#each items as item (item.id)}`.',
				'Use the `id` property of each todo as the key.',
				'Update to: `{#each todos as todo (todo.id)}`'
			],
			conceptsTested: ['svelte5.control-flow.each-key']
		},
		{
			id: 'cp-3',
			description: 'Use destructuring in the {#each} block',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '\\{#each\\s+todos\\s+as\\s+\\{' }
					]
				}
			},
			hints: [
				'Instead of `as todo`, destructure the properties: `as { id, text, done }`.',
				'Then use `{text}` directly instead of `{todo.text}`.',
				'Full syntax: `{#each todos as { id, text, done } (id)}`'
			],
			conceptsTested: ['svelte5.control-flow.each-destructuring']
		}
	]
};
