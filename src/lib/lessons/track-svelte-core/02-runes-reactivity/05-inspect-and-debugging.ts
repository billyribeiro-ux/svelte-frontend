import type { Lesson } from '$types/lesson';

export const inspectAndDebugging: Lesson = {
	id: 'svelte-core.runes.inspect-and-debugging',
	slug: 'inspect-and-debugging',
	title: 'Debugging with $inspect',
	description: 'Use the $inspect rune to debug reactive values during development.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 5,
	estimatedMinutes: 15,
	concepts: ['svelte5.runes.inspect', 'svelte5.runes.inspect-with'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived'],

	content: [
		{
			type: 'text',
			content: `# Debugging with \`$inspect\`

When building reactive UIs, it is invaluable to see exactly when and how values change. Svelte 5 provides the \`$inspect\` rune — a reactive \`console.log\` that fires whenever the inspected values change.

\`\`\`svelte
let count = $state(0);
$inspect(count); // logs whenever count changes
\`\`\`

## Why Dev-Only? The Philosophy Behind \`$inspect\`

**\`$inspect\` is completely stripped from production builds.** This is not an afterthought — it is a core design decision with important implications:

1. **Zero production cost.** Unlike \`console.log\` statements that you must remember to remove before deploying, \`$inspect\` calls vanish automatically in production. The compiled output in a production build contains no trace of them — no function calls, no string allocations, no conditional checks. They simply do not exist.

2. **Safe to leave in your code.** During active development, you can scatter \`$inspect\` calls throughout your components and never worry about them leaking into production. This encourages thorough debugging rather than the common pattern of adding a \`console.log\`, debugging, removing it, then needing it again a week later and adding it back.

3. **No information leaks.** Console output in production can reveal sensitive data — user IDs, authentication states, internal data structures. Because \`$inspect\` is stripped entirely, there is zero risk of leaking reactive state to the browser console in production.

4. **Reactive-aware logging.** Unlike a regular \`console.log\` that runs once when you write it, \`$inspect\` is integrated with Svelte's reactivity system. It automatically re-fires whenever any of its arguments change. You do not need to wrap it in an effect or remember to place it at the right point in the execution flow.

The Svelte compiler detects \`$inspect\` calls and, depending on the build mode, either wires them into the reactive system (development) or removes them entirely (production). If you look at the compiled output in X-Ray mode, you will see the inspect machinery in dev mode. Switch to a production build and it disappears completely.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.inspect'
		},
		{
			type: 'text',
			content: `## Basic \`$inspect\`

The simplest usage mirrors \`console.log\`:

\`\`\`svelte
let count = $state(0);
let name = $state('World');

$inspect(count);  // logs: "init" 0, then "update" <new value> on each change
$inspect(name);   // logs: "init" "World", then "update" <new value> on each change
\`\`\`

When the component first mounts, each \`$inspect\` call logs with the type \`"init"\` and the current value. On subsequent changes, it logs with the type \`"update"\` and the new value. This distinction between \`init\` and \`update\` is useful for understanding whether you are seeing the initial render or a reactive update.

You can inspect any reactive value — \`$state\` variables, \`$derived\` values, even expressions:

\`\`\`svelte
let items = $state([1, 2, 3]);
let total = $derived(items.reduce((a, b) => a + b, 0));

$inspect(items);   // logs the array whenever it changes
$inspect(total);   // logs the derived sum whenever it updates
\`\`\`

Look at the starter code — there are several reactive values changing, but no visibility into when changes happen.

**Task:** Add \`$inspect\` calls for the \`count\` and \`name\` state variables.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Custom Callbacks with \`$inspect().with()\`

By default, \`$inspect\` uses \`console.log\`. You can customize this with \`.with()\` to use any callback:

\`\`\`svelte
$inspect(count).with(console.trace);
$inspect(items).with((type, value) => {
  console.log(type, value); // type is 'init' or 'update'
});
\`\`\`

### \`console.trace\` for Deep Debugging

Using \`console.trace\` is especially powerful. It shows the full call stack of what caused the value to change, answering the question "what triggered this update?" that is otherwise difficult to answer in reactive systems.

\`\`\`svelte
$inspect(count).with(console.trace);
\`\`\`

When you click a button that increments \`count\`, the console will show not just the new value but the entire call stack leading to the change — from the click handler through Svelte's internal signal setter to the inspect callback. This is invaluable for tracking down unexpected updates in complex components.

### Tracing Reactive Dependency Chains

In a complex component, you might have a chain of dependencies: a state variable feeds into a derived value, which feeds into another derived value, which triggers an effect. When something goes wrong, you need to trace the chain to find the root cause.

Here is a systematic approach using \`$inspect\`:

\`\`\`svelte
let searchQuery = $state('');
let filterCategory = $state('all');
let sortOrder = $state<'asc' | 'desc'>('asc');

let filteredItems = $derived.by(() => {
  return items.filter(i =>
    i.name.includes(searchQuery) &&
    (filterCategory === 'all' || i.category === filterCategory)
  );
});

let sortedItems = $derived.by(() => {
  return filteredItems.toSorted((a, b) =>
    sortOrder === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  );
});

// Trace the entire chain
$inspect('query:', searchQuery);
$inspect('category:', filterCategory);
$inspect('filtered count:', filteredItems.length);
$inspect('sorted first:', sortedItems[0]?.name);
\`\`\`

By inspecting each link in the chain, you can see exactly where a change originates and how it propagates. The string labels help you distinguish the different inspect calls in the console output.

### Custom Debugger Callbacks

You can go beyond \`console.log\` and \`console.trace\`. For example, you could trigger the browser's built-in debugger to pause execution:

\`\`\`svelte
$inspect(criticalValue).with((type, value) => {
  if (type === 'update' && value > 100) {
    debugger; // Pauses execution — inspect variables in DevTools
  }
});
\`\`\`

Or you could log to an in-app debug panel instead of the console:

\`\`\`svelte
let debugLog = $state<string[]>([]);

$inspect(count).with((type, value) => {
  debugLog.push(\`[\${type}] count = \${value} at \${Date.now()}\`);
});
\`\`\`

**Task:** Change one of your \`$inspect\` calls to use \`console.trace\` via \`.with()\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and search for `$inspect` in the compiled output. In dev mode, you will see the inspect calls wired up as reactive subscriptions. In a production build, they would be completely absent — zero runtime cost, zero bundle size impact.'
		},
		{
			type: 'text',
			content: `## Debugging Strategies for Svelte 5

Beyond \`$inspect\`, here are practical debugging strategies for working with Svelte 5's reactivity system:

### Strategy 1: Inspect Multiple Values in a Single Call

You can pass multiple arguments to \`$inspect\`, just like \`console.log\`. The inspect callback fires when *any* of the arguments change:

\`\`\`svelte
$inspect(count, name, items);
\`\`\`

This gives you a snapshot of all three values whenever any one of them changes, making it easy to see the full state at each point in time.

### Strategy 2: Label Your Inspect Calls

When you have many inspect calls, label them with a string prefix to tell them apart in the console:

\`\`\`svelte
$inspect('COUNT:', count);
$inspect('NAME:', name);
$inspect('ITEMS:', items);
\`\`\`

The string prefix is not reactive (it never changes), so it does not trigger extra logging — it just makes the output easier to read.

### Strategy 3: Use the Browser DevTools Effectively

Svelte 5 components are compiled to plain JavaScript, which means browser DevTools work well. You can:
- Set breakpoints in the compiled output (use source maps to map back to your \`.svelte\` files)
- Use the browser Performance tab to profile reactive updates
- Use the Network tab to correlate data fetches with state changes

### Strategy 4: Combine \`$inspect\` with \`$derived\` for Computed Debug Info

Create derived values purely for debugging:

\`\`\`svelte
let debugInfo = $derived(\`items: \${items.length}, filtered: \${filtered.length}, visible: \${visible.length}\`);
$inspect(debugInfo);
\`\`\`

Since both the derived value and the inspect call are stripped in production, this has zero cost. But during development, it gives you a running summary of your component's state.

### Strategy 5: Isolate Reactivity Issues

If a component behaves unexpectedly, add inspect calls to each reactive variable and derived value. Then interact with the component and watch the console. You will quickly see which value updates unexpectedly, which value fails to update, or which update happens in the wrong order.

**Task:** Add an \`$inspect\` that tracks multiple values in a single call. Pass at least three reactive values separated by commas.`
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
