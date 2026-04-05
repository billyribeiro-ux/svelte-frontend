import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-2',
		title: 'Arrays: Lists of Things',
		phase: 1,
		module: 1,
		lessonIndex: 2
	},
	description: `Objects are great for a single "thing" with named parts. But what about a list of things? A shopping list, a feed of posts, a collection of users? That's where **arrays** come in. An array is an ordered list — each item has a numeric position (starting at 0) called its **index**.

Arrays are everywhere in real apps. Every list you see in a UI — search results, comments, notifications, menu items — is backed by an array behind the scenes. The power of Svelte is how little code you need to display one: combine an array with \`{#each}\` and the list renders itself.

Before Svelte 5, mutating arrays with methods like \`.push()\` or \`.splice()\` didn't always trigger reactivity — you had to reassign the whole array. In Svelte 5, \`$state\` arrays have **deep reactivity**: \`.push()\`, \`.pop()\`, \`.splice()\`, and even modifying items by index all "just work".

In this lesson you'll build three increasingly realistic examples: a simple string list, a list of objects (todos), and a mini shopping list with totals. Along the way you'll learn the most common array methods and patterns you'll use every day.

A "Try It Yourself" section at the bottom gives you three hands-on challenges to practice what you just learned.`,
	objectives: [
		'Create and initialize arrays with $state',
		'Use .push(), .pop(), .splice(), and index assignment to modify arrays reactively',
		'Iterate over arrays with {#each} blocks (with and without keys)',
		'Filter, map, and reduce arrays using $derived for computed values',
		'Handle empty-list states with {:else}',
		'Understand that Svelte 5 $state arrays have deep reactivity'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // EXAMPLE 1 — A simple array of strings
  // ------------------------------------------------------------
  // Arrays use square brackets []. Items can be any type:
  // strings, numbers, booleans, objects — even other arrays.
  // ============================================================
  let fruits = $state(['Apple', 'Banana', 'Cherry']);
  let newFruit = $state('');

  function addFruit() {
    const trimmed = newFruit.trim();
    if (trimmed) {
      // .push() adds to the END of the array. In Svelte 5 this
      // is reactive — the UI updates automatically.
      fruits.push(trimmed);
      newFruit = '';
    }
  }

  function removeLast() {
    // .pop() removes and returns the last item
    fruits.pop();
  }

  function removeAt(index) {
    // .splice(start, deleteCount) removes items at a position
    fruits.splice(index, 1);
  }

  function sortFruits() {
    // .sort() sorts the array IN PLACE (mutates)
    fruits.sort();
  }

  function reverseFruits() {
    fruits.reverse();
  }

  // ============================================================
  // EXAMPLE 2 — An array of objects (a todo list)
  // ------------------------------------------------------------
  // Real lists are usually arrays of objects, each with an id.
  // The id is used as a "key" in {#each} so Svelte can track
  // items efficiently as they're added/removed/reordered.
  // ============================================================
  let todos = $state([
    { id: 1, text: 'Learn Svelte', done: true },
    { id: 2, text: 'Build something cool', done: false },
    { id: 3, text: 'Ship it', done: false }
  ]);

  let nextId = $state(4);
  let newTodoText = $state('');

  function addTodo() {
    if (newTodoText.trim()) {
      todos.push({ id: nextId, text: newTodoText.trim(), done: false });
      nextId += 1;
      newTodoText = '';
    }
  }

  function toggleTodo(todo) {
    // Mutating a property of an item inside the array — reactive!
    todo.done = !todo.done;
  }

  function deleteTodo(id) {
    const idx = todos.findIndex(t => t.id === id);
    if (idx !== -1) todos.splice(idx, 1);
  }

  // $derived automatically recomputes whenever todos changes
  const completedCount = $derived(todos.filter(t => t.done).length);
  const pendingCount = $derived(todos.filter(t => !t.done).length);

  // ============================================================
  // EXAMPLE 3 — Real-world: shopping list with totals
  // ------------------------------------------------------------
  // Combines arrays + objects + derived values. Uses .reduce()
  // to sum up prices — a common pattern for totals.
  // ============================================================
  let cart = $state([
    { id: 1, name: 'Bread', price: 3.5, qty: 2 },
    { id: 2, name: 'Milk', price: 2.0, qty: 1 },
    { id: 3, name: 'Eggs', price: 4.0, qty: 1 }
  ]);

  const cartTotal = $derived(
    cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  );

  const itemCount = $derived(
    cart.reduce((sum, item) => sum + item.qty, 0)
  );

  function plusOne(item) { item.qty += 1; }
  function minusOne(item) {
    if (item.qty > 1) item.qty -= 1;
  }
  function removeFromCart(id) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx !== -1) cart.splice(idx, 1);
  }
</script>

<h1>Arrays: Lists of Things</h1>

<section>
  <h2>1. Simple Array ({fruits.length} fruits)</h2>
  <div class="input-row">
    <input
      bind:value={newFruit}
      placeholder="Add a fruit..."
      onkeydown={(e) => e.key === 'Enter' && addFruit()}
    />
    <button onclick={addFruit}>Add</button>
    <button onclick={removeLast} disabled={fruits.length === 0}>Pop</button>
    <button onclick={sortFruits}>Sort</button>
    <button onclick={reverseFruits}>Reverse</button>
  </div>
  <ul>
    {#each fruits as fruit, i (i + fruit)}
      <li>
        <span>{i}: {fruit}</span>
        <button class="remove" onclick={() => removeAt(i)}>x</button>
      </li>
    {:else}
      <li class="empty">No fruits! Add some above.</li>
    {/each}
  </ul>
</section>

<section>
  <h2>2. Todo List ({completedCount} done, {pendingCount} pending)</h2>
  <div class="input-row">
    <input
      bind:value={newTodoText}
      placeholder="What needs doing?"
      onkeydown={(e) => e.key === 'Enter' && addTodo()}
    />
    <button onclick={addTodo}>Add Todo</button>
  </div>
  <ul>
    {#each todos as todo (todo.id)}
      <li class:done={todo.done}>
        <label>
          <input
            type="checkbox"
            checked={todo.done}
            onchange={() => toggleTodo(todo)}
          />
          {todo.text}
        </label>
        <button class="remove" onclick={() => deleteTodo(todo.id)}>x</button>
      </li>
    {:else}
      <li class="empty">Nothing to do. Enjoy your day!</li>
    {/each}
  </ul>
</section>

<section>
  <h2>3. Shopping Cart ({itemCount} items)</h2>
  <ul class="cart">
    {#each cart as item (item.id)}
      <li>
        <span class="name">{item.name}</span>
        <span class="price">\${item.price.toFixed(2)}</span>
        <div class="qty">
          <button onclick={() => minusOne(item)}>-</button>
          <span>{item.qty}</span>
          <button onclick={() => plusOne(item)}>+</button>
        </div>
        <span class="subtotal">\${(item.price * item.qty).toFixed(2)}</span>
        <button class="remove" onclick={() => removeFromCart(item.id)}>x</button>
      </li>
    {:else}
      <li class="empty">Your cart is empty.</li>
    {/each}
  </ul>
  <p class="total">Total: <strong>\${cartTotal.toFixed(2)}</strong></p>
</section>

<section class="practice">
  <h2>Try It Yourself</h2>
  <p class="intro">Edit the code above to add these features. Answers are at the bottom of the lesson (but resist peeking!)</p>
  <ol>
    <li>
      <strong>1.</strong> Add an "Average price" display under the shopping cart that shows the mean price of all items.
      <span class="hint">Hint: use <code>.reduce()</code> to sum prices, then divide by <code>cart.length</code> inside a <code>$derived</code>.</span>
    </li>
    <li>
      <strong>2.</strong> Add a "Double all quantities" button to the cart that doubles every item's <code>qty</code>.
      <span class="hint">Hint: loop with <code>for (const item of cart) item.qty *= 2</code> — mutation is reactive in Svelte 5.</span>
    </li>
    <li>
      <strong>3.</strong> Add a "Clear completed" button to the todo list that removes every todo whose <code>done</code> is true.
      <span class="hint">Hint: reassign <code>todos = todos.filter(t => !t.done)</code> — filter returns a new array.</span>
    </li>
  </ol>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 24px; }
  .input-row { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
  input:not([type]), input[type="text"] {
    padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px;
    font-size: 13px; flex: 1; min-width: 140px;
  }
  ul { list-style: none; padding: 0; margin: 0; }
  li {
    padding: 6px 8px; border-bottom: 1px solid #eee;
    display: flex; align-items: center; justify-content: space-between;
    gap: 8px; font-size: 14px; color: #444;
  }
  li.done { text-decoration: line-through; opacity: 0.55; }
  .empty { color: #999; font-style: italic; justify-content: center; }
  label { display: flex; align-items: center; gap: 8px; cursor: pointer; flex: 1; }
  .remove {
    background: none; border: none; color: #f44747; cursor: pointer;
    font-size: 14px; padding: 2px 8px;
  }
  .remove:hover { color: white; background: #f44747; border-radius: 4px; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  .cart li { display: grid; grid-template-columns: 1fr 60px 90px 60px 30px; align-items: center; }
  .cart .name { font-weight: 600; color: #222; }
  .cart .price { color: #666; font-size: 12px; }
  .cart .qty { display: flex; align-items: center; gap: 6px; }
  .cart .qty button { padding: 2px 8px; font-size: 12px; }
  .cart .subtotal { font-weight: 600; color: #ff3e00; text-align: right; }
  .total { margin-top: 12px; font-size: 16px; text-align: right; }
  .total strong { color: #ff3e00; font-size: 20px; }
  .practice {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-top: 1.5rem;
  }
  .practice h2 { color: #1e3a8a; margin: 0 0 0.5rem; font-size: 1rem; border: none; padding: 0; }
  .practice .intro { font-size: 0.88rem; color: #1e40af; margin-bottom: 0.75rem; }
  .practice ol { padding-left: 1.25rem; margin: 0; }
  .practice li { padding: 0.4rem 0; font-size: 0.85rem; color: #1e3a8a; display: list-item; border: none; }
  .practice .hint {
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
