import type { Lesson } from '$types/lesson';

export const stateBasics: Lesson = {
	id: 'svelte-core.runes.state-basics',
	slug: 'state-basics',
	title: 'Understanding $state',
	description: 'Learn how Svelte 5 makes variables reactive with the $state rune.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['svelte5.runes.state', 'svelte5.reactivity.basic'],
	prerequisites: ['svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# Making Things Reactive with \`$state\`

In Svelte 5, reactivity is **explicit**. When you want a variable to trigger UI updates when it changes, you declare it with the \`$state\` rune.

This is fundamentally different from Svelte 4, where \`let\` declarations at the top level of a component were implicitly reactive. With runes, you're telling the Svelte compiler exactly which values should be tracked.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.state'
		},
		{
			type: 'text',
			content: `## Your First Reactive Variable

Look at the starter code in the editor. You'll see a simple component with a \`count\` variable. Right now, clicking the button does nothing visible — the variable updates, but Svelte doesn't know to re-render.

**Your task:** Make \`count\` reactive using the \`$state\` rune.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and look at the **Compiler Output** tab. Notice how `$state(0)` compiles to a signal under the hood — but you never have to interact with the signal directly.'
		},
		{
			type: 'text',
			content: `## $state with Objects and Arrays

\`$state\` works with any value — numbers, strings, objects, arrays. When you use it with objects or arrays, Svelte deeply tracks mutations.

**Task:** Add a reactive \`items\` array using \`$state\` and a button that pushes a new item.`
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
  // TODO: Make this reactive
  let count = 0;

  function increment() {
    count += 1;
  }
</script>

<button onclick={increment}>
  Clicks: {count}
</button>

<style>
  button {
    font-family: inherit;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }

  button:hover {
    background: #7c7ff2;
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
  let count = $state(0);
  let items = $state<string[]>([]);

  function increment() {
    count += 1;
  }

  function addItem() {
    items.push('Item ' + (items.length + 1));
  }
</script>

<button onclick={increment}>
  Clicks: {count}
</button>

<button onclick={addItem}>
  Add Item
</button>

<ul>
  {#each items as item}
    <li>{item}</li>
  {/each}
</ul>

<style>
  button {
    font-family: inherit;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-inline-end: 0.5rem;
  }

  button:hover {
    background: #7c7ff2;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Make the count variable reactive using $state',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: '$state' }]
				}
			},
			hints: [
				'In Svelte 5, you make a variable reactive by wrapping its initial value with a rune.',
				'The rune you need starts with `$state`. Try wrapping the `0` in `$state(0)`.',
				'Change `let count = 0` to `let count = $state(0)`'
			],
			conceptsTested: ['svelte5.runes.state']
		},
		{
			id: 'cp-2',
			description: 'Add a reactive items array and a button to push items',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '\\$state.*\\[' },
						{ type: 'contains', value: '.push(' }
					]
				}
			},
			hints: [
				'Declare a reactive array: `let items = $state<string[]>([]);`',
				'Create a function that calls `items.push(...)` — Svelte 5 tracks array mutations automatically.',
				'Add `let items = $state<string[]>([]);` and a function that pushes items, plus a button and `{#each}` to display them.'
			],
			conceptsTested: ['svelte5.runes.state']
		}
	]
};
