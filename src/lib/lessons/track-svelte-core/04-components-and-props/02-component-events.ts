import type { Lesson } from '$types/lesson';

export const componentEvents: Lesson = {
	id: 'svelte-core.components-and-props.component-events',
	slug: 'component-events',
	title: 'Component Events via Callback Props',
	description:
		'Learn the Svelte 5 pattern for component communication using callback props instead of createEventDispatcher.',
	trackId: 'svelte-core',
	moduleId: 'components-and-props',
	order: 2,
	estimatedMinutes: 15,
	concepts: ['svelte5.events.callback-props', 'svelte5.events.component-communication'],
	prerequisites: ['svelte5.props.destructuring'],

	content: [
		{
			type: 'text',
			content: `# Component Events via Callback Props

In Svelte 5, components communicate upward by accepting **callback props** — regular functions passed as props. This replaces Svelte 4's \`createEventDispatcher\` with a simpler, more idiomatic pattern.

The callback prop approach is easier to type, easier to understand, and works naturally with TypeScript.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.events.callback-props'
		},
		{
			type: 'text',
			content: `## Basic Callback Props

Instead of dispatching events, a child component simply calls a function it received as a prop.

\`\`\`svelte
<!-- Counter.svelte -->
<script lang="ts">
  let { count, onIncrement } = $props<{
    count: number;
    onIncrement: () => void;
  }>();
</script>

<button onclick={onIncrement}>Count: {count}</button>
\`\`\`

**Your task:** Create a \`Counter\` component that accepts an \`onIncrement\` callback and calls it when clicked. Wire it up in App.svelte.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Passing Data Through Callbacks

Callbacks can accept arguments, letting children pass data to parents.

\`\`\`svelte
<!-- SearchBox.svelte -->
<script lang="ts">
  let { onSearch } = $props<{ onSearch: (query: string) => void }>();
  let query = $state('');
</script>

<input bind:value={query} oninput={() => onSearch(query)} />
\`\`\`

**Task:** Create a \`SearchBox\` component that calls an \`onSearch\` callback with the current input value. Display the search term in App.svelte.`
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
  // TODO: Import components and handle callbacks
  let count = $state(0);
  let searchTerm = $state('');
</script>

<div>
  <h2>Counter: {count}</h2>
  <!-- TODO: Add Counter component with onIncrement -->

  <h2>Search: {searchTerm}</h2>
  <!-- TODO: Add SearchBox component with onSearch -->
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'Counter.svelte',
			path: '/Counter.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Accept count and onIncrement via $props()
</script>

<!-- TODO: Render a button that calls onIncrement -->
<button>Count: 0</button>`
		},
		{
			name: 'SearchBox.svelte',
			path: '/SearchBox.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Accept onSearch callback via $props()
  // TODO: Add local state for query
</script>

<!-- TODO: Add input that calls onSearch -->
<input placeholder="Search..." />`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Counter from './Counter.svelte';
  import SearchBox from './SearchBox.svelte';

  let count = $state(0);
  let searchTerm = $state('');
</script>

<div>
  <h2>Counter: {count}</h2>
  <Counter {count} onIncrement={() => count += 1} />

  <h2>Search: {searchTerm}</h2>
  <SearchBox onSearch={(query) => searchTerm = query} />
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'Counter.svelte',
			path: '/Counter.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { count, onIncrement } = $props<{
    count: number;
    onIncrement: () => void;
  }>();
</script>

<button onclick={onIncrement}>Count: {count}</button>`
		},
		{
			name: 'SearchBox.svelte',
			path: '/SearchBox.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { onSearch } = $props<{ onSearch: (query: string) => void }>();
  let query = $state('');
</script>

<input
  bind:value={query}
  oninput={() => onSearch(query)}
  placeholder="Search..."
/>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a Counter component with an onIncrement callback prop',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'onIncrement' },
						{ type: 'contains', value: '$props' }
					]
				}
			},
			hints: [
				'In Counter.svelte, use $props() to destructure an `onIncrement` function.',
				'Call the callback on click: `<button onclick={onIncrement}>`',
				'In Counter.svelte: `let { count, onIncrement } = $props()` and `<button onclick={onIncrement}>Count: {count}</button>`'
			],
			conceptsTested: ['svelte5.events.callback-props']
		},
		{
			id: 'cp-2',
			description: 'Create a SearchBox that passes data through a callback',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'onSearch' },
						{ type: 'contains', value: 'bind:value' }
					]
				}
			},
			hints: [
				'Accept an `onSearch` callback via $props() in SearchBox.svelte.',
				'Use `bind:value` on the input and call `onSearch(query)` on input.',
				'In SearchBox: `let { onSearch } = $props(); let query = $state(\'\');` with `<input bind:value={query} oninput={() => onSearch(query)} />`'
			],
			conceptsTested: ['svelte5.events.callback-props', 'svelte5.events.component-communication']
		}
	]
};
