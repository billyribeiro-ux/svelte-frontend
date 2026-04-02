import type { Lesson } from '$types/lesson';

export const stateBasics: Lesson = {
	id: 'svelte-core.runes.state-basics',
	slug: 'state-basics',
	title: 'Understanding $state',
	description: 'Learn how Svelte 5 makes variables reactive with the $state rune.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 1,
	estimatedMinutes: 20,
	concepts: ['svelte5.runes.state', 'svelte5.reactivity.basic'],
	prerequisites: ['svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# Making Things Reactive with \`$state\`

In Svelte 5, reactivity is **explicit**. When you want a variable to trigger UI updates when it changes, you declare it with the \`$state\` rune.

This is fundamentally different from Svelte 4, where \`let\` declarations at the top level of a component were implicitly reactive. With runes, you are telling the Svelte compiler exactly which values should be tracked. But this raises an important question: why did Svelte move to this model in the first place?

## Why Signals Instead of Proxy or Virtual DOM

Every UI framework must solve the same problem: when application state changes, how does the framework know what parts of the UI to update? Historically, frameworks have taken three broad approaches:

1. **Virtual DOM diffing (React):** Re-run the entire component function on every state change, produce a virtual tree, then diff it against the previous tree to find what changed. This is conceptually simple but carries overhead — you are doing work proportional to the size of your component tree on every update, even if only one value changed.

2. **Proxy-based tracking (Vue 3, old Svelte 4 for objects):** Wrap reactive objects in a JavaScript Proxy that intercepts property reads and writes. This provides fine-grained tracking but comes with gotchas: you must be careful about destructuring (you lose reactivity), you cannot track primitive values without wrapping them in objects (Vue's \`ref()\` wrapper), and the Proxy layer adds runtime cost to every property access.

3. **Signals (Svelte 5, SolidJS, Angular Signals, Preact Signals):** Each reactive value is a signal — a getter/setter pair that knows who depends on it. When you read a signal inside a reactive context (like a template or an effect), the framework records that dependency. When you write to a signal, only the specific subscribers that read that signal are notified. There is no diffing, no tree walking, and no proxy overhead on every property access.

Svelte 5 chose signals because they give you the **finest possible granularity** of updates with the **least runtime overhead**. A \`$state\` variable compiles down to a signal, but thanks to the Svelte compiler, you never have to call \`.get()\` or \`.set()\` yourself — you just read and assign variables normally.

## How \`$state\` Compiles to a Signal

When the Svelte compiler sees \`let count = $state(0)\`, it transforms your code into something conceptually like this:

\`\`\`js
// Simplified conceptual output — not the exact compiler output
import { source, get, set } from 'svelte/internal/client';

const count = source(0); // creates a signal with initial value 0

// When you READ count in template or effect:
get(count); // returns current value, registers dependency

// When you WRITE count += 1:
set(count, get(count) + 1); // updates value, notifies subscribers
\`\`\`

The key insight is that \`$state\` is a **compiler instruction**, not a runtime function. The dollar sign tells the Svelte compiler to rewrite your plain variable access into signal operations. This means you write natural JavaScript — \`count += 1\` — and the compiler handles the reactive wiring.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.state'
		},
		{
			type: 'text',
			content: `## Your First Reactive Variable

Look at the starter code in the editor. You will see a simple component with a \`count\` variable. Right now, clicking the button does nothing visible — the variable updates in memory, but Svelte does not know to re-render because the variable is not reactive.

**Your task:** Make \`count\` reactive using the \`$state\` rune. Change \`let count = 0\` to \`let count = $state(0)\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and look at the **Compiler Output** tab. Notice how `$state(0)` compiles to a signal under the hood — a `source()` call that creates a getter/setter pair. But you never have to interact with the signal directly. Compare the compiled output for the template expression `{count}` — you will see it calls `get()` on the signal, which is what registers the dependency.'
		},
		{
			type: 'text',
			content: `## Deep Reactivity — \`$state\` with Objects and Arrays

When you use \`$state\` with an object or array, Svelte wraps the value in a **Proxy** that deeply tracks mutations. This means you can do things like \`items.push('new')\` or \`user.name = 'Ada'\` and the UI updates automatically — no need to create a new array or spread into a new object.

\`\`\`svelte
let user = $state({ name: 'Ada', score: 0 });
user.score += 10; // UI updates — the Proxy intercepts this write

let items = $state(['apple', 'banana']);
items.push('cherry'); // UI updates — Array.push is intercepted too
\`\`\`

This deep Proxy is what makes Svelte 5 feel so natural. In React, you would need \`setItems([...items, 'cherry'])\` to trigger a re-render. In Svelte 5, you just mutate.

### \`$state.raw\` — Opting Out of Deep Reactivity

The deep Proxy has a cost: every property access on the object goes through the Proxy. For large datasets that you replace wholesale rather than mutate — think a big JSON response from an API — you can use \`$state.raw\` to skip the Proxy:

\`\`\`svelte
let data = $state.raw(hugeArray);
// data[0].name = 'new'; // This WON'T trigger updates!
data = newHugeArray;     // This WILL — you're reassigning the whole signal
\`\`\`

Use \`$state.raw\` when you have large, read-heavy data structures and you only ever replace them, never mutate individual properties. The performance difference is measurable on datasets with thousands of items.

### \`$state.snapshot\` — Getting a Plain Object

Because \`$state\` objects are Proxies, passing them to external APIs (like \`JSON.stringify\`, \`structuredClone\`, or third-party libraries) can produce unexpected results. Use \`$state.snapshot\` to get a plain, non-reactive copy:

\`\`\`svelte
let cart = $state([{ name: 'Widget', qty: 2 }]);

function saveToAPI() {
  const plainData = $state.snapshot(cart);
  // plainData is a regular array — safe to serialize
  fetch('/api/cart', { method: 'POST', body: JSON.stringify(plainData) });
}
\`\`\`

**Task:** Now add a reactive \`items\` array using \`$state\` and a button that pushes a new item. Notice how \`.push()\` just works — the deep Proxy tracks the mutation and updates the \`{#each}\` block automatically.`
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
