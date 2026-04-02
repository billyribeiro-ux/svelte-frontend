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

## WHY Reactive Classes Replace Stores

Svelte 4's store system (\`writable\`, \`readable\`, \`derived\`) was a custom state management solution built specifically for Svelte. While it worked, it had significant drawbacks that became clearer as the ecosystem matured:

**1. Stores were not standard JavaScript.** The \`$store\` auto-subscription syntax was Svelte-specific magic. It worked only in \`.svelte\` files, not in \`.ts\` files. If you wanted to read a store in a utility function, you had to use the verbose \`get(store)\` function or manually subscribe. This created a divide between "Svelte-aware" and "plain JavaScript" code.

**2. The subscribe/unsubscribe protocol was error-prone.** Every store subscription returned an unsubscribe function that had to be called during cleanup. Forgetting to unsubscribe caused memory leaks. The \`$store\` syntax handled this automatically in components, but manual subscriptions in \`onMount\` or utility code were leak-prone.

**3. Composing stores was awkward.** A \`derived\` store could depend on other stores, but complex derivations required verbose factory functions. Building a todo list with \`writable\` meant writing wrapper functions for every mutation (add, remove, toggle) that called \`update\` with a callback.

**4. Stores had no natural home for methods.** A writable store is a value container, not an object with behavior. You would create a store and then export standalone functions that operated on it -- spreading the API across multiple exports rather than encapsulating it in a single object.

Reactive classes solve all four problems by using standard JavaScript classes with rune-powered fields:

\`\`\`typescript
// counter.svelte.ts
export class Counter {
  count = $state(0);
  doubled = $derived(this.count * 2);

  increment() { this.count += 1; }
  reset() { this.count = 0; }
}
\`\`\`

This is just a class. It works in any file with the \`.svelte.ts\` extension. Methods are co-located with state. There is no subscribe/unsubscribe -- reactivity is automatic. TypeScript understands it natively because it is standard class syntax.

### The .svelte.ts Extension

The \`.svelte.ts\` file extension tells the Svelte compiler to process runes (\`$state\`, \`$derived\`, \`$effect\`) in the file. Without this extension, runes are syntax errors because the standard TypeScript compiler does not understand them.

The compiler transforms rune calls into reactive signal primitives:
- \`$state(0)\` becomes a signal with getter/setter
- \`$derived(this.count * 2)\` becomes a computed signal that tracks \`this.count\`
- \`$effect\` becomes a side-effect that re-runs when dependencies change

After transformation, the file is standard JavaScript/TypeScript. It can be imported from any \`.svelte\` component or from other \`.svelte.ts\` files.

### Decision Framework: When to Use Reactive Classes

| Scenario | Solution |
|---|---|
| Component-local state | \`$state\` directly in the component's \`<script>\` |
| Shared state between sibling components | Reactive class instance passed via props |
| Global application state | Singleton reactive class instance (exported \`const\`) |
| Complex domain logic with state | Reactive class with methods |
| Simple derived value | \`$derived\` in the component (no class needed) |
| State that survives component unmount/remount | Module-level reactive class instance |

### Reactive Classes vs. Context API

Svelte's context API (\`setContext\`/\`getContext\`) provides component-tree-scoped state. A reactive class instance set as context combines both patterns:

\`\`\`typescript
// In a layout component:
setContext('cart', new ShoppingCart());

// In a descendant component:
const cart = getContext<ShoppingCart>('cart');
\`\`\`

This gives you tree-scoped state with encapsulated methods and full type safety.`
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

### How Reactivity Works in Classes

When you write \`count = $state(0)\` in a class field, the compiler replaces it with a signal-backed property. Accessing \`this.count\` reads the signal (creating a dependency). Assigning \`this.count = 5\` writes the signal (triggering updates). This happens transparently -- to your code and to TypeScript, it looks like a regular class property.

The \`$derived\` field works the same way. \`doubled = $derived(this.count * 2)\` creates a computed signal that tracks \`this.count\`. When \`count\` changes, \`doubled\` recomputes. Components that read \`counter.doubled\` in their template automatically re-render.

### Private State with #

JavaScript private fields work naturally with reactive classes:

\`\`\`typescript
class TodoStore {
  todos = $state<Todo[]>([]);
  #nextId = 0;  // Private, not reactive (no $state needed)

  remaining = $derived(this.todos.filter(t => !t.done).length);

  add(text: string) {
    this.todos.push({ id: this.#nextId++, text, done: false });
  }
}
\`\`\`

Use \`#\` for implementation details that should not be exposed or reactive. The \`#nextId\` counter does not need to trigger UI updates, so it is a plain private field.

**Your task:** Create a \`Counter\` class in a \`.svelte.ts\` file with \`$state\`, \`$derived\`, and methods. Use it in App.svelte. Verify that clicking increment updates both the count and the derived doubled value.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Shared Reactive State

You can export a class instance to share state across components -- similar to a global store, but using plain JavaScript.

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

### The Singleton Pattern

When you export a class instance (not the class itself), every module that imports it gets the same object. This is JavaScript's module singleton pattern -- modules are evaluated once and cached. Multiple components importing \`todoStore\` all reference the same reactive state.

### Building a Shopping Cart (WHY This Pattern Shines)

Consider a shopping cart with these requirements:
- Add items, remove items, change quantities
- Computed total price, item count, and "is empty" flag
- Accessible from the header (cart icon with count), product pages (add-to-cart buttons), and cart page (full list with editing)

With stores, you would create a \`writable<CartItem[]>\`, then export 5-6 standalone functions (\`addToCart\`, \`removeFromCart\`, \`updateQuantity\`, etc.) plus 3-4 \`derived\` stores (\`totalPrice\`, \`itemCount\`, \`isEmpty\`). The API surface is scattered across multiple exports.

With a reactive class:

\`\`\`typescript
class CartState {
  items = $state<CartItem[]>([]);
  totalPrice = $derived(this.items.reduce((sum, i) => sum + i.price * i.qty, 0));
  itemCount = $derived(this.items.reduce((sum, i) => sum + i.qty, 0));
  isEmpty = $derived(this.items.length === 0);

  add(product: Product) { /* ... */ }
  remove(id: string) { /* ... */ }
  updateQty(id: string, qty: number) { /* ... */ }
  clear() { this.items = []; }
}

export const cart = new CartState();
\`\`\`

Every consumer just imports \`cart\` and uses \`cart.add(product)\`, \`cart.totalPrice\`, etc. The API is a single object. Autocomplete shows all available methods and properties. TypeScript validates everything.

**Task:** Create a shared \`TodoStore\` reactive class with add, remove, and toggle methods. Export it as a singleton and use it from App.svelte. Add a \`remaining\` derived property that counts incomplete items.`
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
