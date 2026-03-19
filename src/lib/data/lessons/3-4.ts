import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-4',
		title: 'Sorting, Reducing & Mutating',
		phase: 1,
		module: 3,
		lessonIndex: 4
	},
	description: `Sorting arranges data in order, reduce collapses an array into a single value (like a total), and understanding which methods mutate vs return new arrays helps you avoid bugs. .sort() and .splice() mutate in place, while .slice(), .map(), and .filter() return new arrays.

This lesson builds a sortable product list with a cart total calculated by reduce.`,
	objectives: [
		'Sort arrays with custom comparator functions',
		'Use reduce to aggregate array values into a single result',
		'Know which array methods mutate and which return new arrays'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let items = $state([
    { name: 'Laptop', price: 999, quantity: 1 },
    { name: 'Mouse', price: 29, quantity: 3 },
    { name: 'Keyboard', price: 79, quantity: 1 },
    { name: 'Monitor', price: 449, quantity: 2 },
    { name: 'USB Cable', price: 12, quantity: 5 },
    { name: 'Webcam', price: 89, quantity: 1 }
  ]);

  let sortBy = $state('name');
  let sortAsc = $state(true);

  // Sorting with comparators (does NOT mutate — we use toSorted)
  const sorted = $derived(
    [...items].sort((a, b) => {
      let result;
      if (sortBy === 'name') {
        result = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        result = a.price - b.price;
      } else {
        result = a.quantity - b.quantity;
      }
      return sortAsc ? result : -result;
    })
  );

  // reduce — calculate totals
  const totalItems = $derived(
    items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const totalCost = $derived(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const averagePrice = $derived(
    items.reduce((sum, item) => sum + item.price, 0) / items.length
  );

  // Mutating methods demo
  function addItem() {
    // .push() mutates the array — Svelte 5 deep reactivity handles it
    items.push({ name: 'New Item', price: 50, quantity: 1 });
  }

  function removeFirst() {
    // .splice() mutates — removes from the original
    items.splice(0, 1);
  }

  function toggleSort(field) {
    if (sortBy === field) {
      sortAsc = !sortAsc;
    } else {
      sortBy = field;
      sortAsc = true;
    }
  }

  // slice (non-mutating) — get a portion
  const topThree = $derived(
    [...items].sort((a, b) => b.price - a.price).slice(0, 3)
  );
</script>

<h1>Sorting, Reducing & Mutating</h1>

<section>
  <h2>Sortable Table</h2>
  <table>
    <thead>
      <tr>
        <th onclick={() => toggleSort('name')} class="sortable">
          Name {sortBy === 'name' ? (sortAsc ? '↑' : '↓') : ''}
        </th>
        <th onclick={() => toggleSort('price')} class="sortable">
          Price {sortBy === 'price' ? (sortAsc ? '↑' : '↓') : ''}
        </th>
        <th onclick={() => toggleSort('quantity')} class="sortable">
          Qty {sortBy === 'quantity' ? (sortAsc ? '↑' : '↓') : ''}
        </th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      {#each sorted as item}
        <tr>
          <td>{item.name}</td>
          <td>\${item.price}</td>
          <td>{item.quantity}</td>
          <td class="subtotal">\${item.price * item.quantity}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="buttons">
    <button onclick={addItem}>Add Item</button>
    <button onclick={removeFirst} disabled={items.length === 0}>Remove First</button>
  </div>
</section>

<section>
  <h2>reduce — Totals</h2>
  <div class="stats">
    <div class="stat"><span>Total Items</span><strong>{totalItems}</strong></div>
    <div class="stat"><span>Total Cost</span><strong>\${totalCost}</strong></div>
    <div class="stat"><span>Avg Price</span><strong>\${averagePrice.toFixed(2)}</strong></div>
  </div>
</section>

<section>
  <h2>slice — Top 3 Most Expensive</h2>
  <ol>
    {#each topThree as item}
      <li>{item.name} — \${item.price}</li>
    {/each}
  </ol>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; padding: 8px; border-bottom: 2px solid #eee; color: #666; font-size: 12px; text-transform: uppercase; }
  .sortable { cursor: pointer; user-select: none; }
  .sortable:hover { color: #ff3e00; }
  td { padding: 8px; border-bottom: 1px solid #f0f0f0; color: #444; }
  .subtotal { color: #4ec9b0; font-weight: 600; }
  .stats { display: flex; gap: 16px; flex-wrap: wrap; }
  .stat { background: #f8f8f8; padding: 12px 16px; border-radius: 6px; text-align: center; }
  .stat span { display: block; font-size: 12px; color: #999; text-transform: uppercase; }
  .stat strong { font-size: 20px; color: #ff3e00; }
  ol { padding-left: 20px; color: #444; font-size: 14px; }
  .buttons { display: flex; gap: 8px; margin-top: 8px; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
