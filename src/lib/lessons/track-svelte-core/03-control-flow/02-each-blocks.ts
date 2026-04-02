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

This iterates over the \`items\` array and renders the template once for each element.

## Why Keyed Blocks Matter — The Identity Tracking Problem

Before we dive into syntax, it is important to understand a fundamental problem in list rendering: **how does the framework know which DOM elements correspond to which data items when the list changes?**

Consider a todo list with three items. You delete the second item. The framework has two options:

1. **Positional update (unkeyed).** The framework updates the first DOM node with item 1's data (no change), updates the second DOM node with item 3's data, and destroys the third DOM node. It does not "know" that you deleted item 2 — it just sees that position 2 now has different data.

2. **Identity-based update (keyed).** The framework knows that item 2 was removed, so it destroys item 2's DOM node and leaves items 1 and 3 untouched.

The difference seems academic until you consider what lives on those DOM nodes:

- **Input values.** If each list item contains an input field, positional update moves the wrong text into the wrong input.
- **Component state.** If each item is a component with its own internal \`$state\`, positional update keeps the old component alive but feeds it new props — the internal state belongs to a different logical item.
- **Animations.** If you want items to animate when reordered, the framework needs to know which physical element maps to which logical item so it can animate the movement.
- **Focus state.** If the user has focused an input in the second item and you reorder the list, positional update moves focus to the wrong item's content.

This is why keyed \`{#each}\` blocks exist. The key expression gives each item a stable identity that persists across list mutations.

### When Unkeyed Is Fine

Not every list needs keys. Keyed blocks have a small overhead because Svelte needs to maintain a map from keys to DOM fragments. If your list is:

- **Static** (never reordered, items never added or removed)
- **Simple** (no component state, no input fields, no animations)
- **Append-only** (items are only ever added to the end)

Then an unkeyed \`{#each}\` is perfectly fine and slightly more efficient.

### Animation Coordination

Keys are essential for Svelte's \`animate:\` directive, which creates flip animations when list items are reordered:

\`\`\`svelte
<script>
  import { flip } from 'svelte/animate';
</script>

{#each items as item (item.id)}
  <div animate:flip={{ duration: 300 }}>
    {item.name}
  </div>
{/each}
\`\`\`

Without a key, Svelte cannot track which element moved where, so \`animate:flip\` will not work. The key is what connects the old position to the new position, enabling the animation to calculate the correct start and end coordinates.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.control-flow.each'
		},
		{
			type: 'text',
			content: `## Basic {#each}

Look at the starter code — there is an array of todo items rendered as a static list. Let's make it dynamic.

The \`{#each}\` block iterates over any iterable (arrays, Sets, Maps, or any object with a \`[Symbol.iterator]\` method), though arrays are by far the most common case.

The syntax is:

\`\`\`svelte
{#each expression as alias}
  <!-- template using alias -->
{/each}
\`\`\`

Where \`expression\` evaluates to an iterable and \`alias\` is the variable name for each element inside the block.

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

### What Makes a Good Key

A key must be:

1. **Unique** within the list. Duplicate keys cause undefined behavior — Svelte may skip items, render duplicates, or associate the wrong state with the wrong element.

2. **Stable** across renders. The same logical item must always produce the same key. Using array index as a key (\`{#each items as item, i (i)}\`) is equivalent to not using a key at all — the index changes when items are inserted or removed.

3. **Primitive.** Keys should be strings or numbers. Objects and arrays are compared by reference, which means a new object literal will never match a previous one even if the contents are identical.

Common good keys:
- Database IDs (\`item.id\`)
- Unique slugs (\`item.slug\`)
- UUIDs generated at creation time

Bad keys:
- Array index (changes when items are reordered)
- Random values generated during render (different every time)
- Non-unique properties (\`item.name\` if names can repeat)

### How Svelte Uses Keys Internally

When a keyed \`{#each}\` block updates, Svelte:

1. Creates a map of \`key -> DOM fragment\` from the current list
2. Iterates through the new data array
3. For each new item, looks up its key in the map
4. If found: moves the existing DOM fragment to the correct position and updates its data
5. If not found: creates a new DOM fragment
6. After processing all new items: destroys any remaining unmapped fragments (deleted items)

This is significantly more work than positional update, which is why keys add overhead. But for dynamic lists with user interaction, the correctness benefits far outweigh the performance cost.

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

This is particularly useful when items have many properties but you only need a few. It keeps the template cleaner by avoiding \`todo.text\`, \`todo.done\`, etc.

### Index Access

You also get the index as a second parameter: \`{#each items as item, i}\`

\`\`\`svelte
{#each items as item, index (item.id)}
  <li>
    <span class="number">{index + 1}.</span>
    {item.text}
  </li>
{/each}
\`\`\`

The index is zero-based and updates automatically when items are added or removed. Combined with destructuring: \`{#each todos as { id, text }, i (id)}\`.

### The {:else} Block for Empty Lists

\`{#each}\` supports an \`{:else}\` clause that renders when the array is empty:

\`\`\`svelte
{#each todos as todo (todo.id)}
  <li>{todo.text}</li>
{:else}
  <li class="empty">No todos yet. Add one above!</li>
{/each}
\`\`\`

This is a clean pattern for empty state UI that avoids a separate \`{#if todos.length === 0}\` check.

### Real-World Pattern: Todo List with Reactive Mutations

In Svelte 5, arrays declared with \`$state\` are deeply reactive. This means you can use standard array methods and the UI updates automatically:

\`\`\`svelte
<script lang="ts">
  let todos = $state([
    { id: 1, text: 'Learn Svelte', done: false },
    { id: 2, text: 'Build an app', done: false }
  ]);

  let nextId = $state(3);

  function addTodo(text: string) {
    todos.push({ id: nextId++, text, done: false });
  }

  function removeTodo(id: number) {
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) todos.splice(index, 1);
  }

  function toggleTodo(id: number) {
    const todo = todos.find(t => t.id === id);
    if (todo) todo.done = !todo.done;
  }
</script>

{#each todos as { id, text, done } (id)}
  <li class:done>
    <input type="checkbox" checked={done} onchange={() => toggleTodo(id)} />
    <span>{text}</span>
    <button onclick={() => removeTodo(id)}>Delete</button>
  </li>
{:else}
  <li>All done!</li>
{/each}
\`\`\`

Notice that \`todos.push()\`, \`todos.splice()\`, and direct property mutation (\`todo.done = !todo.done\`) all trigger UI updates. This is because Svelte 5's \`$state\` wraps the array in a reactive proxy. In Svelte 4, you had to reassign the array (\`todos = [...todos, newItem]\`) to trigger updates — Svelte 5 eliminates that awkwardness.

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
