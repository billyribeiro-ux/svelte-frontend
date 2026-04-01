import type { Lesson } from '$types/lesson';

export const reactiveClasses: Lesson = {
	id: 'svelte-core.advanced-patterns.reactive-classes',
	slug: 'reactive-classes',
	title: 'Reactive Classes',
	description:
		'Build reactive state classes in .svelte.ts files as a modern replacement for Svelte stores.',
	trackId: 'svelte-core',
	moduleId: 'advanced-patterns',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['svelte5.patterns.reactive-class', 'svelte5.patterns.svelte-ts'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived'],

	content: [
		{
			type: 'text',
			content: `# Reactive Classes

In Svelte 5, you can use runes inside \`.svelte.ts\` files to create reactive classes. These replace Svelte stores with a pattern that is more idiomatic JavaScript — just regular classes with \`$state\` and \`$derived\` properties.

The \`.svelte.ts\` extension tells the compiler to process runes in the file.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.patterns.reactive-class'
		},
		{
			type: 'text',
			content: `## Creating a Reactive Class

\`\`\`typescript
// counter.svelte.ts
export class Counter {
  count = $state(0);
  doubled = $derived(this.count * 2);

  increment() {
    this.count += 1;
  }

  reset() {
    this.count = 0;
  }
}
\`\`\`

\`\`\`svelte
<!-- App.svelte -->
<script lang="ts">
  import { Counter } from './counter.svelte';
  const counter = new Counter();
</script>

<button onclick={() => counter.increment()}>
  {counter.count} (doubled: {counter.doubled})
</button>
\`\`\`

**Your task:** Create a \`Counter\` class in a \`.svelte.ts\` file with \`$state\`, \`$derived\`, and methods. Use it in App.svelte.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Shared Reactive State

You can export a class instance to share state across components — similar to a global store, but using plain JavaScript.

\`\`\`typescript
// theme.svelte.ts
class ThemeState {
  mode = $state<'light' | 'dark'>('light');
  isDark = $derived(this.mode === 'dark');

  toggle() {
    this.mode = this.mode === 'light' ? 'dark' : 'light';
  }
}

export const theme = new ThemeState();
\`\`\`

**Task:** Create a shared \`TodoStore\` reactive class with add, remove, and toggle methods. Use it from App.svelte.`
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
  // TODO: Import Counter class and TodoStore
</script>

<div>
  <section>
    <h2>Counter</h2>
    <!-- TODO: Use Counter class -->
  </section>

  <section>
    <h2>Todo List</h2>
    <!-- TODO: Use TodoStore -->
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 2rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 0.5rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    margin-right: 0.5rem;
  }

  li {
    padding: 0.5rem 0;
  }

  .done {
    text-decoration: line-through;
    opacity: 0.6;
  }
</style>`
		},
		{
			name: 'counter.svelte.ts',
			path: '/counter.svelte.ts',
			language: 'typescript',
			content: `// TODO: Create a reactive Counter class with $state and $derived`
		},
		{
			name: 'todo-store.svelte.ts',
			path: '/todo-store.svelte.ts',
			language: 'typescript',
			content: `// TODO: Create a reactive TodoStore class`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { Counter } from './counter.svelte';
  import { todoStore } from './todo-store.svelte';

  const counter = new Counter();
  let newTodo = $state('');

  function addTodo() {
    if (newTodo.trim()) {
      todoStore.add(newTodo.trim());
      newTodo = '';
    }
  }
</script>

<div>
  <section>
    <h2>Counter</h2>
    <p>Count: {counter.count} | Doubled: {counter.doubled}</p>
    <button onclick={() => counter.increment()}>Increment</button>
    <button onclick={() => counter.reset()}>Reset</button>
  </section>

  <section>
    <h2>Todo List ({todoStore.remaining} remaining)</h2>
    <form onsubmit={(e) => { e.preventDefault(); addTodo(); }}>
      <input bind:value={newTodo} placeholder="New todo..." />
      <button type="submit">Add</button>
    </form>
    <ul>
      {#each todoStore.todos as todo}
        <li>
          <label class:done={todo.done}>
            <input type="checkbox" checked={todo.done} onchange={() => todoStore.toggle(todo.id)} />
            {todo.text}
          </label>
          <button onclick={() => todoStore.remove(todo.id)}>x</button>
        </li>
      {/each}
    </ul>
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 2rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-right: 0.5rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    margin-right: 0.5rem;
  }

  li {
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  li button {
    background: #ef4444;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .done {
    text-decoration: line-through;
    opacity: 0.6;
  }
</style>`
		},
		{
			name: 'counter.svelte.ts',
			path: '/counter.svelte.ts',
			language: 'typescript',
			content: `export class Counter {
  count = $state(0);
  doubled = $derived(this.count * 2);

  increment() {
    this.count += 1;
  }

  reset() {
    this.count = 0;
  }
}`
		},
		{
			name: 'todo-store.svelte.ts',
			path: '/todo-store.svelte.ts',
			language: 'typescript',
			content: `interface Todo {
  id: number;
  text: string;
  done: boolean;
}

class TodoStore {
  todos = $state<Todo[]>([]);
  #nextId = 0;

  remaining = $derived(this.todos.filter(t => !t.done).length);

  add(text: string) {
    this.todos.push({ id: this.#nextId++, text, done: false });
  }

  remove(id: number) {
    const index = this.todos.findIndex(t => t.id === id);
    if (index !== -1) this.todos.splice(index, 1);
  }

  toggle(id: number) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) todo.done = !todo.done;
  }
}

export const todoStore = new TodoStore();`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a reactive Counter class with $state and $derived',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'class Counter' },
						{ type: 'contains', value: '$state' },
						{ type: 'contains', value: '$derived' }
					]
				}
			},
			hints: [
				'In `counter.svelte.ts`, create a class with `count = $state(0)` and `doubled = $derived(this.count * 2)`.',
				'Add `increment()` and `reset()` methods that modify `this.count`.',
				'`export class Counter { count = $state(0); doubled = $derived(this.count * 2); increment() { this.count += 1; } reset() { this.count = 0; } }`'
			],
			conceptsTested: ['svelte5.patterns.reactive-class', 'svelte5.patterns.svelte-ts']
		},
		{
			id: 'cp-2',
			description: 'Create a shared TodoStore reactive class',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'TodoStore' },
						{ type: 'contains', value: 'todoStore' },
						{ type: 'contains', value: '$state<' }
					]
				}
			},
			hints: [
				'Create a `TodoStore` class with `todos = $state<Todo[]>([])` and methods for add, remove, toggle.',
				'Export a singleton instance: `export const todoStore = new TodoStore()`.',
				'Add `remaining = $derived(this.todos.filter(t => !t.done).length)` for a derived count.'
			],
			conceptsTested: ['svelte5.patterns.reactive-class']
		}
	]
};
