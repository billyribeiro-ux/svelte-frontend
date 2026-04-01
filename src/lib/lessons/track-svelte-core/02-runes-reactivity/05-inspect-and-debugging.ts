import type { Lesson } from '$types/lesson';

export const inspectAndDebugging: Lesson = {
	id: 'svelte-core.runes.inspect-and-debugging',
	slug: 'inspect-and-debugging',
	title: 'Debugging with $inspect',
	description: 'Use the $inspect rune to debug reactive values during development.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 5,
	estimatedMinutes: 10,
	concepts: ['svelte5.runes.inspect', 'svelte5.runes.inspect-with'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived'],

	content: [
		{
			type: 'text',
			content: `# Debugging with \`$inspect\`

When building reactive UIs, it's invaluable to see exactly when and how values change. Svelte 5 provides the \`$inspect\` rune — a reactive \`console.log\` that fires whenever the inspected values change.

\`\`\`svelte
let count = $state(0);
$inspect(count); // logs whenever count changes
\`\`\`

**Important:** \`$inspect\` only works during development. It is completely stripped from production builds, so you never need to worry about removing it.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.inspect'
		},
		{
			type: 'text',
			content: `## Basic $inspect

Look at the starter code — there are several reactive values changing, but no visibility into when changes happen.

**Task:** Add \`$inspect\` calls for the \`count\` and \`name\` state variables.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Custom Callbacks with $inspect().with()

By default, \`$inspect\` uses \`console.log\`. You can customize this with \`.with()\` to use any callback:

\`\`\`svelte
$inspect(count).with(console.trace);
$inspect(items).with((type, value) => {
  console.log(type, value); // type is 'init' or 'update'
});
\`\`\`

Using \`console.trace\` is especially useful — it shows you the full call stack of what caused the value to change.

**Task:** Change one of your \`$inspect\` calls to use \`console.trace\` via \`.with()\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and search for `$inspect` in the compiled output. In dev mode, you will see the inspect calls wired up. In a production build, they would be completely absent — zero runtime cost.'
		},
		{
			type: 'text',
			content: `## Dev-Only Nature

Remember: \`$inspect\` is **dev-only**. It serves as a reactive debugger during development but has zero cost in production.

This means you can leave \`$inspect\` calls in your code during development without worrying about performance or information leaks in production.

You can also inspect multiple values at once and derived values:

\`\`\`svelte
$inspect(count, name, items);
let total = $derived(items.length);
$inspect(total);
\`\`\`

**Task:** Add an \`$inspect\` that tracks multiple values in a single call.`
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
  let count = $state(0);
  let name = $state('World');
  let items = $state<string[]>(['Apple', 'Banana']);

  let total = $derived(items.length);

  // TODO: Add $inspect for count and name
  // TODO: Add $inspect().with(console.trace)
  // TODO: Add $inspect with multiple values
</script>

<button onclick={() => count++}>Count: {count}</button>

<input bind:value={name} placeholder="Enter name" />
<p>Hello, {name}!</p>

<button onclick={() => items.push('Item ' + (items.length + 1))}>
  Add Item ({total} items)
</button>

<ul>
  {#each items as item}
    <li>{item}</li>
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
    margin-inline-end: 0.5rem;
    margin-block-end: 0.5rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    margin-block-end: 0.5rem;
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
  let name = $state('World');
  let items = $state<string[]>(['Apple', 'Banana']);

  let total = $derived(items.length);

  $inspect(count);
  $inspect(name).with(console.trace);
  $inspect(count, name, items);
</script>

<button onclick={() => count++}>Count: {count}</button>

<input bind:value={name} placeholder="Enter name" />
<p>Hello, {name}!</p>

<button onclick={() => items.push('Item ' + (items.length + 1))}>
  Add Item ({total} items)
</button>

<ul>
  {#each items as item}
    <li>{item}</li>
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
    margin-inline-end: 0.5rem;
    margin-block-end: 0.5rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    margin-block-end: 0.5rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add $inspect calls for count and name',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '\\$inspect\\(count' },
						{ type: 'regex', value: '\\$inspect\\(name' }
					]
				}
			},
			hints: [
				'`$inspect` works like `console.log` but re-runs whenever the value changes.',
				'Add `$inspect(count);` and `$inspect(name);` in the script block.',
				'Place `$inspect(count);` and `$inspect(name);` after the variable declarations.'
			],
			conceptsTested: ['svelte5.runes.inspect']
		},
		{
			id: 'cp-2',
			description: 'Use $inspect().with(console.trace) for one of the values',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '.with(console.trace)' }
					]
				}
			},
			hints: [
				'Chain `.with()` after `$inspect()` to customize the logging callback.',
				'`console.trace` shows the full call stack — very useful for understanding what triggered a change.',
				'Change one call to: `$inspect(name).with(console.trace);`'
			],
			conceptsTested: ['svelte5.runes.inspect-with']
		},
		{
			id: 'cp-3',
			description: 'Add a single $inspect that tracks multiple values',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '\\$inspect\\([^)]*,\\s*[^)]*,\\s*[^)]*\\)' }
					]
				}
			},
			hints: [
				'`$inspect` accepts multiple arguments, just like `console.log`.',
				'Pass several reactive values separated by commas.',
				'Add: `$inspect(count, name, items);`'
			],
			conceptsTested: ['svelte5.runes.inspect']
		}
	]
};
