import type { Lesson } from '$types/lesson';

export const derivedValues: Lesson = {
	id: 'svelte-core.runes.derived-values',
	slug: 'derived-values',
	title: 'Computed Values with $derived',
	description: 'Use the $derived rune to create values that automatically update when their dependencies change.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 2,
	estimatedMinutes: 12,
	concepts: ['svelte5.runes.derived', 'svelte5.runes.derived-by'],
	prerequisites: ['svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Computed Values with \`$derived\`

When you have values that depend on other reactive values, use \`$derived\` to keep them in sync automatically.

\`$derived\` creates a value that recalculates whenever its dependencies change. Think of it as a formula in a spreadsheet.`
		},
		{
			type: 'text',
			content: `## Basic $derived

The simplest form takes a single expression:

\`\`\`svelte
let count = $state(0);
let doubled = $derived(count * 2);
\`\`\`

\`doubled\` will always be twice \`count\`, automatically.

**Task:** Add a \`$derived\` value that shows the count doubled.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## $derived.by for Complex Logic

For derivations that need more than a single expression, use \`$derived.by\`:

\`\`\`svelte
let total = $derived.by(() => {
  let sum = 0;
  for (const item of items) {
    sum += item.price;
  }
  return sum;
});
\`\`\`

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
