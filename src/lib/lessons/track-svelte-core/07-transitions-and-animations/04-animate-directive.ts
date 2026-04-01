import type { Lesson } from '$types/lesson';

export const animateDirective: Lesson = {
	id: 'svelte-core.transitions-and-animations.animate-directive',
	slug: 'animate-directive',
	title: 'The Animate Directive',
	description:
		'Use animate:flip for smooth reordering animations in keyed each blocks with the FLIP technique.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 4,
	estimatedMinutes: 12,
	concepts: ['svelte5.animations.flip', 'svelte5.animations.keyed-each'],
	prerequisites: ['svelte5.transitions.directive'],

	content: [
		{
			type: 'text',
			content: `# The Animate Directive

When items in a keyed \`{#each}\` block change order, Svelte can smoothly animate the movement using the \`animate:\` directive. The most common animation is \`flip\` (First, Last, Invert, Play).

The \`animate:\` directive only works inside a **keyed** each block — \`{#each items as item (item.id)}\`.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.animations.flip'
		},
		{
			type: 'text',
			content: `## Using animate:flip

\`\`\`svelte
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';

  let items = $state([
    { id: 1, name: 'First' },
    { id: 2, name: 'Second' },
    { id: 3, name: 'Third' }
  ]);

  function shuffle() {
    items.sort(() => Math.random() - 0.5);
  }
</script>

{#each items as item (item.id)}
  <div animate:flip={{ duration: 300 }} transition:fade>
    {item.name}
  </div>
{/each}
\`\`\`

**Your task:** Create a sortable list with \`animate:flip\` that smoothly animates when items are reordered.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Combining Animate with Transitions

You can combine \`animate:\` with \`in:\` and \`out:\` transitions. The animate directive handles reordering while transitions handle adding/removing.

**Task:** Add the ability to add and remove items from the list, with transitions for enter/exit and flip animation for reordering.`
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
  // TODO: Import flip from 'svelte/animate'
  // TODO: Import transitions

  let nextId = $state(4);
  let items = $state([
    { id: 1, name: 'Learn Svelte' },
    { id: 2, name: 'Build App' },
    { id: 3, name: 'Ship to Production' }
  ]);

  function shuffle() {
    items.sort(() => Math.random() - 0.5);
  }

  function addItem() {
    items.push({ id: nextId++, name: 'New Task #' + (nextId - 1) });
  }

  function removeItem(id: number) {
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) items.splice(index, 1);
  }
</script>

<div>
  <h2>Animated List</h2>

  <div class="actions">
    <button onclick={shuffle}>Shuffle</button>
    <button onclick={addItem}>Add Item</button>
  </div>

  <ul>
    {#each items as item (item.id)}
      <!-- TODO: Add animate:flip and transitions -->
      <li>
        <span>{item.name}</span>
        <button onclick={() => removeItem(item.id)}>x</button>
      </li>
    {/each}
  </ul>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  li button {
    background: #ef4444;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
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
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';

  let nextId = $state(4);
  let items = $state([
    { id: 1, name: 'Learn Svelte' },
    { id: 2, name: 'Build App' },
    { id: 3, name: 'Ship to Production' }
  ]);

  function shuffle() {
    items.sort(() => Math.random() - 0.5);
  }

  function addItem() {
    items.push({ id: nextId++, name: 'New Task #' + (nextId - 1) });
  }

  function removeItem(id: number) {
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) items.splice(index, 1);
  }
</script>

<div>
  <h2>Animated List</h2>

  <div class="actions">
    <button onclick={shuffle}>Shuffle</button>
    <button onclick={addItem}>Add Item</button>
  </div>

  <ul>
    {#each items as item (item.id)}
      <li animate:flip={{ duration: 300 }} in:fly={{ x: -100, duration: 300 }} out:fade={{ duration: 200 }}>
        <span>{item.name}</span>
        <button onclick={() => removeItem(item.id)}>x</button>
      </li>
    {/each}
  </ul>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  li button {
    background: #ef4444;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add animate:flip to the keyed each block items',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'animate:flip' },
						{ type: 'regex', value: '#each.*\\(item\\.id\\)' }
					]
				}
			},
			hints: [
				'Import `flip` from `svelte/animate`.',
				'Add `animate:flip={{ duration: 300 }}` to the `<li>` element inside the keyed each block.',
				'The each block must be keyed: `{#each items as item (item.id)}` and the li needs `animate:flip={{ duration: 300 }}`.'
			],
			conceptsTested: ['svelte5.animations.flip', 'svelte5.animations.keyed-each']
		},
		{
			id: 'cp-2',
			description: 'Combine animate:flip with in/out transitions for add/remove',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'animate:flip' },
						{ type: 'contains', value: 'in:' },
						{ type: 'contains', value: 'out:' }
					]
				}
			},
			hints: [
				'Add `in:fly` and `out:fade` alongside `animate:flip` on the li element.',
				'Use `in:fly={{ x: -100, duration: 300 }}` for enter and `out:fade` for exit.',
				'The li should have all three: `animate:flip={{ duration: 300 }} in:fly={{ x: -100, duration: 300 }} out:fade={{ duration: 200 }}`.'
			],
			conceptsTested: ['svelte5.animations.flip']
		}
	]
};
