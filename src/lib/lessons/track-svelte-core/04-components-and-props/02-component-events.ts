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
	estimatedMinutes: 25,
	concepts: ['svelte5.events.callback-props', 'svelte5.events.component-communication'],
	prerequisites: ['svelte5.props.destructuring'],

	content: [
		{
			type: 'text',
			content: `# Component Events via Callback Props

In Svelte 5, components communicate upward by accepting **callback props** — regular functions passed as props. This replaces Svelte 4's \`createEventDispatcher\` entirely. The change is not cosmetic; it addresses fundamental problems with the old approach and brings Svelte's component communication model in line with how JavaScript actually works.

## Why Callback Props Replaced createEventDispatcher

Svelte 4 used \`createEventDispatcher\` to send custom events from child to parent. You would call \`dispatch('eventname', data)\` and the parent would listen with \`on:eventname\`. This worked, but it had serious shortcomings that became painful in real applications:

**Problem 1: Type safety was nearly impossible.** The dispatcher returned a generic \`CustomEvent\`, and the event detail was typed as \`any\` unless you jumped through hoops with declaration files. If you changed the shape of the data a child dispatched, TypeScript would not catch the mismatch in the parent. Bugs shipped silently.

\`\`\`svelte
<!-- Svelte 4: no type safety on event payloads -->
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  // What type is the detail? Nobody knows until runtime.
  dispatch('submit', { name: 'Alice', email: 'alice@example.com' });
</script>
\`\`\`

**Problem 2: Event forwarding was verbose.** If a grandchild dispatched an event that needed to reach a grandparent, every intermediate component had to manually re-dispatch it. In a three-level hierarchy, you wrote boilerplate at every level.

**Problem 3: It was a Svelte-specific invention.** Developers coming from React, Vue, or vanilla JavaScript had to learn a custom event system that worked differently from standard DOM events and differently from standard function calls. Callback props are just functions — everyone already understands them.

**The Svelte 5 solution — callback props:**

\`\`\`svelte
<!-- Svelte 5: fully typed, zero boilerplate -->
<script lang="ts">
  let { onSubmit } = $props<{
    onSubmit: (data: { name: string; email: string }) => void;
  }>();
</script>

<button onclick={() => onSubmit({ name: 'Alice', email: 'alice@example.com' })}>
  Submit
</button>
\`\`\`

Now TypeScript checks the callback's parameter types at every call site. If you change the shape, every consumer gets a compile error. The "event forwarding" problem vanishes because you just pass the function reference down — no re-dispatching needed.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.events.callback-props'
		},
		{
			type: 'text',
			content: `## Basic Callback Props

The pattern is straightforward: the child declares a function in its props, the parent passes one in.

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

\`\`\`svelte
<!-- App.svelte -->
<script lang="ts">
  import Counter from './Counter.svelte';
  let count = $state(0);
</script>

<Counter {count} onIncrement={() => count += 1} />
\`\`\`

Notice that the parent owns the state and the child owns the UI. The child does not need to know *how* the count changes — it just calls the callback. This separation of concerns makes components reusable. The same Counter could increment by 1, by 10, or call an API — the child does not care.

**Your task:** Create a \`Counter\` component that accepts a \`count\` prop and an \`onIncrement\` callback prop. Wire it up in App.svelte so clicking the button increments the count.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Passing Data Through Callbacks

Callbacks can accept arguments, letting children pass structured data to parents. This is where the type-safety advantage really shines.

\`\`\`svelte
<!-- SearchBox.svelte -->
<script lang="ts">
  let { onSearch } = $props<{ onSearch: (query: string) => void }>();
  let query = $state('');
</script>

<input bind:value={query} oninput={() => onSearch(query)} />
\`\`\`

The parent receives the search string with full type information. If you later want to pass additional metadata (e.g., \`{ query: string; timestamp: number }\`), you change the type in one place and TypeScript flags every call site that needs updating.

## Typing Event Callbacks: Patterns and Conventions

There are several common patterns for typing callbacks. Choose based on complexity:

**Simple callbacks with no data:**
\`\`\`typescript
onClose: () => void;
onToggle: () => void;
\`\`\`

**Callbacks with typed payloads:**
\`\`\`typescript
onSelect: (item: Item) => void;
onSearch: (query: string) => void;
onChange: (value: string, isValid: boolean) => void;
\`\`\`

**Optional callbacks (the component works without them):**
\`\`\`typescript
interface Props {
  onHover?: (isHovering: boolean) => void;
  onFocus?: () => void;
}

let { onHover, onFocus } = $props<Props>();
// Guard the call since it might be undefined:
<div onmouseenter={() => onHover?.(true)}>
\`\`\`

The optional chaining operator \`?.()\` is essential here. If the parent does not pass \`onHover\`, calling \`onHover(true)\` would throw. The \`?.\` silently skips the call.

**Callbacks that return values:**
\`\`\`typescript
onValidate: (value: string) => boolean;
onTransform: (input: string) => string;
\`\`\`

This is less common but useful — a child can ask a parent to validate or transform data without knowing the rules.

## Event Forwarding Pattern

In Svelte 4, forwarding events through intermediate components was painful. In Svelte 5, it is trivial — just pass the callback reference along.

\`\`\`svelte
<!-- Grandparent.svelte -->
<Parent onAction={handleAction} />

<!-- Parent.svelte (intermediate) -->
<script lang="ts">
  let { onAction } = $props<{ onAction: (id: string) => void }>();
</script>
<Child {onAction} />

<!-- Child.svelte (leaf) -->
<script lang="ts">
  let { onAction } = $props<{ onAction: (id: string) => void }>();
</script>
<button onclick={() => onAction('abc-123')}>Act</button>
\`\`\`

The callback reference passes straight through. No re-dispatching, no event bubbling to manage, no string-based event names to keep in sync. Each level gets full type checking.

## Comparison with Other Frameworks

If you have used other frameworks, callback props will feel natural:
- **React** has always used callback props (\`onClick\`, \`onChange\`). Svelte 5 now matches this pattern.
- **Vue** uses \`$emit\` which is similar to Svelte 4's dispatcher — string-based, loosely typed.
- **Angular** uses \`@Output()\` with \`EventEmitter\`, which is typed but verbose.

Svelte 5's approach is arguably the simplest: a prop is a prop, whether it holds data or a function. No special API to learn.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Exercise: Notification System with Dismiss Callback

Build a notification system that demonstrates callback props with data flow. You will create a \`Notification\` component and wire up dismissal.

**Requirements:**
1. In App.svelte, maintain a list of notifications in \`$state\`, each with an \`id\` and \`message\`.
2. Create a \`Notification\` component that accepts \`message\` (string) and \`onDismiss\` (callback).
3. When the user clicks a dismiss button inside Notification, call \`onDismiss()\` to notify the parent.
4. The parent removes the notification from the list by filtering it out.
5. Add an "Add Notification" button that pushes a new notification with a timestamp-based message.

This exercise forces you to think about who owns the state (the parent), who triggers the change (the child via callback), and how typed callbacks keep the contract clear.

\`\`\`svelte
<!-- Notification.svelte skeleton -->
<script lang="ts">
  let { message, onDismiss } = $props<{
    message: string;
    onDismiss: () => void;
  }>();
</script>

<div class="notification">
  <span>{message}</span>
  <button onclick={onDismiss}>Dismiss</button>
</div>
\`\`\`

Notice that the Notification component does not know *how* dismissal works — whether the parent removes it from an array, archives it to a database, or animates it out. The child just says "I was dismissed" and the parent decides what that means. This is the power of the callback prop pattern.`
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
