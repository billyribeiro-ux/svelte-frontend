import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-1',
		title: 'Classes with $state Fields',
		phase: 5,
		module: 16,
		lessonIndex: 1
	},
	description: `Svelte 5's runes work seamlessly inside JavaScript classes, enabling you to create reactive class instances. When you declare a class field with $state(), that field becomes reactive — any component reading it will update when the value changes.

This pattern is powerful for modelling domain objects with encapsulated reactive state and methods. A Todo class can have a reactive done field and a toggle method, and Svelte will track all reads and writes automatically. Class instances behave just like any other reactive state — they work with $derived, $effect, and bind: directives.

Reactive classes replace the old writable-store pattern in Svelte 5. Instead of writing stores that expose subscribe/set/update, you write a plain TypeScript class with runes inside. The class is typed, introspectable, composable, and works with any reactive context — component markup, $derived chains, $effect bodies, or other classes.

A "Try It Yourself" section at the bottom gives you three hands-on challenges to practice what you just learned.`,
	objectives: [
		'Declare reactive class fields using $state() in class definitions',
		'Create class methods that mutate reactive state',
		'Use $derived inside classes for computed properties',
		'Compose multiple reactive classes together (Cart contains CartItem[])',
		'Integrate reactive class instances with Svelte component templates'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Example 1: A reactive Todo class
  // Each instance owns its own reactive state.
  // ============================================================
  class Todo {
    text: string = $state('');
    done: boolean = $state(false);
    priority: 'low' | 'medium' | 'high' = $state('medium');
    createdAt: Date;

    // $derived works inside classes too — recomputes whenever
    // any read dependency changes.
    status: string = $derived(this.done ? 'Complete' : 'Pending');
    ageSeconds: number = $derived.by(() => {
      // This derived depends on tick (see below) so it updates live
      tick;
      return Math.floor((Date.now() - this.createdAt.getTime()) / 1000);
    });

    constructor(text: string, priority: Todo['priority'] = 'medium') {
      this.text = text;
      this.priority = priority;
      this.createdAt = new Date();
    }

    toggle(): void {
      this.done = !this.done;
    }

    cyclePriority(): void {
      const order: Todo['priority'][] = ['low', 'medium', 'high'];
      const i = order.indexOf(this.priority);
      this.priority = order[(i + 1) % order.length];
    }
  }

  // A small reactive "tick" used by derived ages above.
  let tick = $state(0);
  $effect(() => {
    const id = setInterval(() => (tick += 1), 1000);
    return () => clearInterval(id);
  });

  // ============================================================
  // Example 2: TodoList composes many Todo instances
  // Shows filtering, derived counts, and progress.
  // ============================================================
  class TodoList {
    items: Todo[] = $state([]);
    filter: 'all' | 'active' | 'done' = $state('all');
    sort: 'priority' | 'created' = $state('created');

    total: number = $derived(this.items.length);
    completed: number = $derived(this.items.filter((t) => t.done).length);
    remaining: number = $derived(this.total - this.completed);
    progress: number = $derived(
      this.total > 0 ? Math.round((this.completed / this.total) * 100) : 0
    );

    filtered: Todo[] = $derived.by(() => {
      const priorityWeight = { high: 0, medium: 1, low: 2 } as const;
      let list = this.items;
      if (this.filter === 'active') list = list.filter((t) => !t.done);
      if (this.filter === 'done') list = list.filter((t) => t.done);
      if (this.sort === 'priority') {
        list = [...list].sort(
          (a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]
        );
      }
      return list;
    });

    add(text: string, priority: Todo['priority'] = 'medium'): void {
      if (text.trim()) {
        this.items = [...this.items, new Todo(text.trim(), priority)];
      }
    }

    remove(todo: Todo): void {
      this.items = this.items.filter((t) => t !== todo);
    }

    clearCompleted(): void {
      this.items = this.items.filter((t) => !t.done);
    }
  }

  // ============================================================
  // Example 3: A shopping cart — classes composing classes.
  // CartItem holds its own reactive qty, Cart derives totals.
  // ============================================================
  class CartItem {
    readonly id: string;
    readonly name: string;
    readonly price: number;
    qty: number = $state(1);

    subtotal: number = $derived(this.qty * this.price);

    constructor(id: string, name: string, price: number) {
      this.id = id;
      this.name = name;
      this.price = price;
    }
  }

  class Cart {
    items: CartItem[] = $state([]);
    taxRate: number = $state(0.08);

    itemCount: number = $derived(
      this.items.reduce((sum, it) => sum + it.qty, 0)
    );
    subtotal: number = $derived(
      this.items.reduce((sum, it) => sum + it.subtotal, 0)
    );
    tax: number = $derived(this.subtotal * this.taxRate);
    total: number = $derived(this.subtotal + this.tax);

    add(id: string, name: string, price: number): void {
      const existing = this.items.find((it) => it.id === id);
      if (existing) {
        existing.qty += 1;
      } else {
        this.items = [...this.items, new CartItem(id, name, price)];
      }
    }

    remove(item: CartItem): void {
      this.items = this.items.filter((it) => it !== item);
    }

    clear(): void {
      this.items = [];
    }
  }

  // ============================================================
  // Instantiate — classes can be created anywhere
  // ============================================================
  const list = new TodoList();
  list.add('Read Svelte 5 docs', 'high');
  list.add('Refactor stores to classes', 'medium');
  list.add('Write tests', 'low');

  const cart = new Cart();

  const catalog = [
    { id: 'p1', name: 'Svelte Sticker Pack', price: 4.99 },
    { id: 'p2', name: 'Runes T-Shirt', price: 24.0 },
    { id: 'p3', name: 'Reactive Mug', price: 12.5 }
  ];

  let newTodoText: string = $state('');
  let newPriority: Todo['priority'] = $state('medium');

  function handleAdd(): void {
    list.add(newTodoText, newPriority);
    newTodoText = '';
  }

  const priorityColors = {
    low: '#74b9ff',
    medium: '#fdcb6e',
    high: '#ff7675'
  } as const;
</script>

<h1>Reactive Classes</h1>

<section>
  <h2>TodoList — class with derived progress</h2>
  <div class="progress-bar">
    <div class="fill" style="width: {list.progress}%"></div>
  </div>
  <p class="stats">
    {list.completed}/{list.total} completed ({list.progress}%) — {list.remaining} remaining
  </p>

  <div class="add-row">
    <input
      bind:value={newTodoText}
      placeholder="Add a todo..."
      onkeydown={(e) => e.key === 'Enter' && handleAdd()}
    />
    <select bind:value={newPriority}>
      <option value="low">low</option>
      <option value="medium">medium</option>
      <option value="high">high</option>
    </select>
    <button onclick={handleAdd}>Add</button>
  </div>

  <div class="filters">
    {#each ['all', 'active', 'done'] as f (f)}
      <button
        class:active={list.filter === f}
        onclick={() => (list.filter = f as typeof list.filter)}
      >
        {f}
      </button>
    {/each}
    <label class="sort">
      Sort:
      <select bind:value={list.sort}>
        <option value="created">Created</option>
        <option value="priority">Priority</option>
      </select>
    </label>
    <button
      class="clear"
      onclick={() => list.clearCompleted()}
      disabled={list.completed === 0}
    >
      Clear Done
    </button>
  </div>

  <ul class="todo-list">
    {#each list.filtered as todo (todo)}
      <li class:done={todo.done}>
        <label>
          <input
            type="checkbox"
            checked={todo.done}
            onchange={() => todo.toggle()}
          />
          <span class="text">{todo.text}</span>
        </label>
        <button
          class="pri-chip"
          style="background: {priorityColors[todo.priority]}"
          onclick={() => todo.cyclePriority()}
        >
          {todo.priority}
        </button>
        <span class="meta">{todo.status} — {todo.ageSeconds}s ago</span>
        <button class="remove" onclick={() => list.remove(todo)}>x</button>
      </li>
    {/each}
  </ul>

  {#if list.filtered.length === 0}
    <p class="empty">
      {list.filter === 'all'
        ? 'No todos yet.'
        : \`No \${list.filter} todos.\`}
    </p>
  {/if}
</section>

<section>
  <h2>Cart — classes composing classes</h2>
  <div class="catalog">
    {#each catalog as product (product.id)}
      <div class="product">
        <strong>{product.name}</strong>
        <span>\${product.price.toFixed(2)}</span>
        <button onclick={() => cart.add(product.id, product.name, product.price)}>
          + Add
        </button>
      </div>
    {/each}
  </div>

  {#if cart.items.length > 0}
    <table class="cart-table">
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Subtotal</th><th></th></tr>
      </thead>
      <tbody>
        {#each cart.items as item (item.id)}
          <tr>
            <td>{item.name}</td>
            <td>
              <button onclick={() => (item.qty = Math.max(1, item.qty - 1))}>-</button>
              <span class="qty">{item.qty}</span>
              <button onclick={() => (item.qty += 1)}>+</button>
            </td>
            <td>\${item.subtotal.toFixed(2)}</td>
            <td><button class="remove" onclick={() => cart.remove(item)}>x</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="totals">
      <div>Items: <strong>{cart.itemCount}</strong></div>
      <div>Subtotal: <strong>\${cart.subtotal.toFixed(2)}</strong></div>
      <div>Tax ({(cart.taxRate * 100).toFixed(0)}%): <strong>\${cart.tax.toFixed(2)}</strong></div>
      <div class="grand">Total: <strong>\${cart.total.toFixed(2)}</strong></div>
      <button class="clear" onclick={() => cart.clear()}>Empty cart</button>
    </div>
  {:else}
    <p class="empty">Cart is empty.</p>
  {/if}
</section>

<section class="practice">
  <h2>Try It Yourself</h2>
  <p class="intro">Edit the code above to add these features. Answers are at the bottom of the lesson (but resist peeking!)</p>
  <ol>
    <li>
      <strong>1.</strong> Add an <code>undo()</code> method to the <code>TodoList</code> class that restores the most recently removed todo.
      <span class="practice-hint">Hint: keep a private <code>lastRemoved</code> field; set it in <code>remove()</code> and push it back in <code>undo()</code>.</span>
    </li>
    <li>
      <strong>2.</strong> Add a <code>sortedByPriority</code> <code>$derived</code> getter on the <code>TodoList</code> class that returns todos with <code>high</code> first, then <code>medium</code>, then <code>low</code>.
      <span class="practice-hint">Hint: define it like <code>sortedByPriority = $derived.by(() =&gt; [...this.todos].sort(...))</code> using a priority-to-number map.</span>
    </li>
    <li>
      <strong>3.</strong> Add a <code>discount</code> field to the <code>Cart</code> class (a percent) and a derived <code>discountedTotal</code> that applies it before tax.
      <span class="practice-hint">Hint: <code>discount: number = $state(0)</code> and a new <code>$derived</code> that multiplies <code>subtotal * (1 - discount / 100)</code>.</span>
    </li>
  </ol>
</section>

<style>
  h1 { color: #2d3436; }
  section {
    margin-bottom: 2rem; padding: 1rem; background: #f8f9fa;
    border-radius: 8px;
  }
  h2 { margin-top: 0; color: #0984e3; font-size: 1.1rem; }
  .progress-bar {
    height: 8px; background: #dfe6e9; border-radius: 4px;
    overflow: hidden; margin-bottom: 0.25rem;
  }
  .fill { height: 100%; background: #00b894; transition: width 0.3s; }
  .stats { font-size: 0.85rem; color: #636e72; margin-bottom: 1rem; }
  .add-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .add-row input {
    flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;
  }
  .add-row select, .sort select {
    padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;
  }
  .filters {
    display: flex; gap: 0.25rem; margin-bottom: 1rem; align-items: center;
  }
  .sort { font-size: 0.8rem; color: #636e72; margin-left: 0.5rem; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #dfe6e9; color: #2d3436; cursor: pointer; font-weight: 600;
  }
  button.active, .add-row button { background: #00b894; color: white; }
  button:hover { opacity: 0.9; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  .clear { margin-left: auto; background: #ff7675; color: white; }
  .todo-list { list-style: none; padding: 0; margin: 0; }
  .todo-list li {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.6rem 0.75rem; border-bottom: 1px solid #eee;
  }
  .todo-list li.done { opacity: 0.6; }
  .todo-list li.done .text { text-decoration: line-through; }
  label {
    display: flex; align-items: center; gap: 0.5rem;
    flex: 1; cursor: pointer;
  }
  .pri-chip {
    font-size: 0.7rem; padding: 0.15rem 0.5rem;
    color: white; border-radius: 10px;
  }
  .meta { font-size: 0.75rem; color: #b2bec3; white-space: nowrap; }
  .remove {
    padding: 0.2rem 0.4rem; background: transparent;
    color: #ff7675; font-size: 0.9rem;
  }
  .empty { text-align: center; color: #b2bec3; }
  .catalog {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem; margin-bottom: 1rem;
  }
  .product {
    display: flex; flex-direction: column; gap: 0.25rem;
    padding: 0.75rem; background: white; border-radius: 6px;
    text-align: center; font-size: 0.85rem;
  }
  .product button { background: #0984e3; color: white; }
  .cart-table {
    width: 100%; border-collapse: collapse; background: white;
    border-radius: 6px; overflow: hidden;
  }
  .cart-table th, .cart-table td {
    padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee;
  }
  .qty {
    display: inline-block; min-width: 1.5rem; text-align: center;
    font-weight: 600;
  }
  .totals {
    margin-top: 0.75rem; padding: 0.75rem; background: white;
    border-radius: 6px; font-size: 0.9rem;
  }
  .totals .grand {
    margin-top: 0.25rem; padding-top: 0.25rem;
    border-top: 1px solid #eee; font-size: 1rem;
  }
  .practice {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-top: 1.5rem;
  }
  .practice h2 { color: #1e3a8a; margin: 0 0 0.5rem; font-size: 1rem; }
  .practice .intro { font-size: 0.88rem; color: #1e40af; margin-bottom: 0.75rem; }
  .practice ol { padding-left: 1.25rem; margin: 0; }
  .practice li { padding: 0.4rem 0; font-size: 0.85rem; color: #1e3a8a; }
  .practice-hint {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #475569;
    font-style: italic;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
