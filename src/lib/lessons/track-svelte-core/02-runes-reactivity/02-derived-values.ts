import type { Lesson } from '$types/lesson';

export const derivedValues: Lesson = {
	id: 'svelte-core.runes.derived-values',
	slug: 'derived-values',
	title: 'Computed Values with $derived',
	description: 'Use the $derived rune to create values that automatically update when their dependencies change.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 2,
	estimatedMinutes: 15,
	concepts: ['svelte5.runes.derived', 'svelte5.runes.derived-by'],
	prerequisites: ['svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Computed Values with \`$derived\`

When you have values that depend on other reactive values, use \`$derived\` to keep them in sync automatically.

\`$derived\` creates a value that recalculates whenever its dependencies change. Think of it as a formula in a spreadsheet — you define the relationship once, and the framework ensures it always holds true.

## Why \`$derived\` Instead of \`$effect\`

One of the most common mistakes newcomers make is using \`$effect\` to compute values:

\`\`\`svelte
// WRONG — do not do this
let count = $state(0);
let doubled = $state(0);
$effect(() => {
  doubled = count * 2;
});
\`\`\`

This pattern looks reasonable, but it has serious problems:

1. **Unnecessary intermediate states.** When \`count\` changes, there is a brief moment where \`count\` has its new value but \`doubled\` still has the old value. Any code that reads both values during that window sees an inconsistent state.

2. **Extra work.** The effect creates an additional reactive subscription and an additional state variable. The framework must schedule the effect, run it, and then propagate the state change from \`doubled\` to anything that depends on it — two rounds of updates instead of one.

3. **Timing issues.** Effects run *after* the DOM updates. If another piece of code reads \`doubled\` synchronously after changing \`count\`, it gets the stale value.

\`$derived\` solves all of these problems because it is **synchronous** and **lazy** — it computes the new value only when something actually reads it, and it always returns the up-to-date result.

## Lazy Evaluation — Derived Only Recomputes When Accessed AND Dependencies Changed

A critical detail about \`$derived\` is that it uses **lazy evaluation with memoization**. Here is what that means in practice:

1. When a dependency changes, the derived value is **marked as potentially stale** — but it does not immediately recompute.
2. The next time something **reads** the derived value (a template expression, another derived value, an effect), Svelte checks whether the dependencies actually changed.
3. If they did, Svelte recomputes the derived value and caches the new result.
4. If nothing ever reads the derived value, the computation **never runs at all**.

This is far more efficient than eagerly recomputing on every dependency change. Consider a derived value used inside an \`{#if}\` block — when the block is not rendered, the derived value is never read, so it never recomputes, saving CPU cycles.

## The Diamond Dependency Problem

The diamond dependency problem occurs when two derived values depend on the same source, and a third derived value depends on both of them:

\`\`\`
      count
      /    \\
  doubled  tripled
      \\    /
      total
\`\`\`

\`\`\`svelte
let count = $state(1);
let doubled = $derived(count * 2);
let tripled = $derived(count * 3);
let total = $derived(doubled + tripled);
\`\`\`

When \`count\` changes, a naive system might update \`doubled\` first, then recompute \`total\` (seeing old \`tripled\`), then update \`tripled\`, then recompute \`total\` again — producing a glitch where \`total\` briefly shows an incorrect intermediate value.

Svelte solves this with its push-pull reactivity algorithm. When \`count\` changes, both \`doubled\` and \`tripled\` are marked as potentially stale, but neither is recomputed immediately. When something finally reads \`total\`, Svelte walks the dependency graph and ensures \`doubled\` and \`tripled\` are both fresh before computing \`total\`. The result: **no glitches, no wasted computations, no intermediate inconsistent states.**`
		},
		{
			type: 'text',
			content: `## Basic \`$derived\`

The simplest form takes a single expression:

\`\`\`svelte
let count = $state(0);
let doubled = $derived(count * 2);
\`\`\`

\`doubled\` will always be twice \`count\`, automatically. Under the hood, the compiler transforms this into a derived signal that lazily recomputes when accessed after \`count\` changes. If you look at the compiled output, you will see something conceptually like:

\`\`\`js
// Conceptual compiled output
const doubled = derived(() => get(count) * 2);
\`\`\`

The key thing to notice is that \`$derived\` takes an **expression**, not a function. You write \`$derived(count * 2)\`, and the compiler wraps it in a function for you. This is syntactic sugar that makes the common case (a simple expression) feel natural.

**Task:** Add a \`$derived\` value that shows the count doubled.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## \`$derived.by\` for Complex Logic

For derivations that need more than a single expression — loops, conditionals, intermediate variables — use \`$derived.by\`:

\`\`\`svelte
let total = $derived.by(() => {
  let sum = 0;
  for (const item of items) {
    sum += item.price;
  }
  return sum;
});
\`\`\`

\`$derived.by\` takes a function explicitly, giving you full freedom to write any logic. The dependency tracking still works automatically — Svelte tracks every reactive value you read inside the function body.

You might wonder: when should I use \`$derived\` vs \`$derived.by\`? The rule is simple:
- **\`$derived(expr)\`** — when a single expression suffices. Most derived values fall into this category.
- **\`$derived.by(fn)\`** — when you need multiple statements, loops, early returns, try/catch, or any logic that cannot be expressed as a single expression.

Both produce the same kind of reactive derived signal under the hood. The only difference is syntactic convenience.

### A Real-World Example: Filtered and Sorted List

Here is a practical pattern you will use constantly — filtering and sorting a list based on reactive criteria:

\`\`\`svelte
let items = $state([
  { name: 'Banana', price: 1.20, category: 'fruit' },
  { name: 'Carrot', price: 0.80, category: 'vegetable' },
  { name: 'Apple', price: 1.50, category: 'fruit' },
]);
let filterCategory = $state('all');
let sortBy = $state<'name' | 'price'>('name');

let displayed = $derived.by(() => {
  let result = filterCategory === 'all'
    ? items
    : items.filter(i => i.category === filterCategory);

  return result.toSorted((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return a.price - b.price;
  });
});
\`\`\`

This \`displayed\` array automatically re-filters and re-sorts whenever \`items\`, \`filterCategory\`, or \`sortBy\` changes. No manual synchronization, no effect, no stale state. Note the use of \`toSorted()\` (which returns a new array) instead of \`sort()\` (which mutates in place) — this is important because mutating the source array inside a derived computation would create an infinite loop.

**Task:** Add a \`$derived.by\` value that calculates the sum of all numbers in an array.`
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
  let count = $state(0);
  // TODO: Add a $derived value for doubled

  let numbers = $state([1, 2, 3, 4, 5]);
  // TODO: Add a $derived.by value for the sum
</script>

<button onclick={() => count++}>Count: {count}</button>

<!-- Show doubled here -->

<p>Numbers: {numbers.join(', ')}</p>
<button onclick={() => numbers.push(numbers.length + 1)}>Add Number</button>

<!-- Show sum here -->

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
  let doubled = $derived(count * 2);

  let numbers = $state([1, 2, 3, 4, 5]);
  let sum = $derived.by(() => {
    let total = 0;
    for (const n of numbers) {
      total += n;
    }
    return total;
  });
</script>

<button onclick={() => count++}>Count: {count}</button>
<p>Doubled: {doubled}</p>

<p>Numbers: {numbers.join(', ')}</p>
<button onclick={() => numbers.push(numbers.length + 1)}>Add Number</button>
<p>Sum: {sum}</p>

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
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a $derived value that doubles the count',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'regex', value: '\\$derived\\(' }]
				}
			},
			hints: [
				'`$derived` takes a single expression and recomputes it when dependencies change.',
				'Add: `let doubled = $derived(count * 2);`',
				'Then display it in the template: `<p>Doubled: {doubled}</p>`'
			],
			conceptsTested: ['svelte5.runes.derived']
		},
		{
			id: 'cp-2',
			description: 'Create a $derived.by value that calculates the sum of numbers',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: '$derived.by(' }]
				}
			},
			hints: [
				'`$derived.by` takes a function for complex logic.',
				'Use a for loop or reduce inside the function to sum the array.',
				'Add: `let sum = $derived.by(() => { let total = 0; for (const n of numbers) total += n; return total; });`'
			],
			conceptsTested: ['svelte5.runes.derived-by']
		}
	]
};
