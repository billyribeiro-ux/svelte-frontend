import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-4',
		title: 'Sorting, Reducing & Mutating',
		phase: 1,
		module: 3,
		lessonIndex: 4
	},
	description: `This lesson gathers three closely-related topics that trip up even experienced JavaScript developers: **sorting**, **reducing**, and **knowing which array methods mutate**. They're bundled because the confusion comes from a single root cause — array methods have inconsistent contracts. Some return new arrays (\`map\`, \`filter\`, \`slice\`), some mutate the original and return it (\`sort\`, \`reverse\`, \`push\`, \`splice\`), and some do both (\`splice\` mutates AND returns removed items).

**Sorting** requires a comparator function that returns a number: negative means "a comes first", positive means "b comes first", zero means "leave them". The classic mistake is writing \`arr.sort()\` with no comparator on a list of numbers — it sorts *lexicographically*, so 10 comes before 2. Always pass a comparator. And remember: \`.sort()\` mutates. In 2026 we have the non-mutating alternative \`toSorted()\`, but spreading into a copy (\`[...arr].sort(...)\`) is still the most common pattern.

**Reduce** is the Swiss army knife of array methods. Signature: \`arr.reduce((accumulator, current) => newAccumulator, initialValue)\`. It walks the array, carrying an accumulator forward and letting you update it on each step. Sum, max, average — but also grouping into objects, flattening nested arrays, building indexes. Any "many values into one result" operation is a reduce.

**Mutation** is where Svelte 5 and the runes system really shine. In older reactive frameworks, you had to reassign arrays to trigger updates. In Svelte 5, a \`$state\` array is a deep-reactive proxy — so \`items.push(x)\` just works. You still need to understand which methods mutate for debugging and for non-reactive contexts, but the mental load is lighter than it used to be.

Key pitfalls: sorting numbers without a comparator, calling \`.sort()\` on data you still need in the original order (use a copy), forgetting \`reduce\`'s initial value (results in \`undefined\` bugs), and assuming \`.filter()\` mutates (it doesn't — assign the result somewhere).`,
	objectives: [
		'Sort arrays with custom comparator functions including localeCompare for strings',
		'Use .reduce() for sums, averages, min/max, and object aggregation',
		'Group array items into categories using reduce with an object accumulator',
		'Distinguish mutating methods (sort, push, pop, splice) from non-mutating ones (map, filter, slice)',
		'Leverage Svelte 5 deep reactivity with in-place array mutations on $state arrays',
		'Apply the [...arr].sort() idiom to sort without modifying the original'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === SORTING, REDUCING, and MUTATION SEMANTICS ===
  // Three topics bundled because they're the trickiest corners of arrays:
  //   .sort()   — mutates, needs a comparator, returns the same array
  //   .reduce() — collapses an array into a single value
  //   mutation  — knowing which methods change the original vs return new

  // --- Shopping cart data ---
  let items = $state([
    { id: 1, name: 'Laptop',     price: 1299, quantity: 1, category: 'tech' },
    { id: 2, name: 'Mouse',      price: 29,   quantity: 3, category: 'tech' },
    { id: 3, name: 'Keyboard',   price: 89,   quantity: 1, category: 'tech' },
    { id: 4, name: 'Monitor',    price: 449,  quantity: 2, category: 'tech' },
    { id: 5, name: 'USB Cable',  price: 12,   quantity: 5, category: 'accessory' },
    { id: 6, name: 'Webcam',     price: 89,   quantity: 1, category: 'tech' },
    { id: 7, name: 'Desk Lamp',  price: 39,   quantity: 2, category: 'accessory' }
  ]);

  let sortBy  = $state('name');
  let sortAsc = $state(true);

  // --- Sorting with a comparator ---
  // A comparator returns:
  //   negative  → a comes first
  //   positive  → b comes first
  //   zero      → keep order
  // .sort() MUTATES — so we spread first to keep items untouched.
  // (Modern alternative: items.toSorted(...) returns a new array.)
  const sorted = $derived(
    [...items].sort((a, b) => {
      let result;
      if (sortBy === 'name')         result = a.name.localeCompare(b.name);
      else if (sortBy === 'price')   result = a.price - b.price;
      else if (sortBy === 'quantity')result = a.quantity - b.quantity;
      else                            result = a.price * a.quantity - b.price * b.quantity;
      return sortAsc ? result : -result;
    })
  );

  // --- reduce: many items → one value ---
  // reduce((accumulator, current) => newAccumulator, initialValue)
  const totalItems = $derived(
    items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const totalCost = $derived(
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  const averagePrice = $derived(
    items.length > 0
      ? items.reduce((sum, item) => sum + item.price, 0) / items.length
      : 0
  );

  // --- reduce for non-numeric aggregation: build an object ---
  // Group items by category — a classic "reduce to an object" pattern.
  const byCategory = $derived(
    items.reduce((groups, item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
      return groups;
    }, {})
  );

  // --- reduce to find min/max ---
  const mostExpensive = $derived(
    items.reduce(
      (best, item) => (item.price > best.price ? item : best),
      items[0] ?? { name: '—', price: 0 }
    )
  );

  // --- Mutating methods — Svelte 5 deep reactivity handles them ---
  let nextId = 100;
  function addItem() {
    // .push() MUTATES the array. In Svelte 5 with runes, this triggers
    // reactivity because items is a $state proxy.
    items.push({
      id: nextId++,
      name: 'New Item',
      price: Math.floor(Math.random() * 100) + 10,
      quantity: 1,
      category: 'accessory'
    });
  }

  function removeLast() {
    // .pop() MUTATES and returns the removed item.
    items.pop();
  }

  function removeFirst() {
    // .splice(start, deleteCount) MUTATES in place.
    if (items.length > 0) items.splice(0, 1);
  }

  function doubleQuantities() {
    // Here we reassign using .map() — produces a NEW array.
    items = items.map(item => ({ ...item, quantity: item.quantity * 2 }));
  }

  function toggleSort(field) {
    if (sortBy === field) sortAsc = !sortAsc;
    else { sortBy = field; sortAsc = true; }
  }

  // --- slice: non-mutating, returns a portion ---
  const topThree = $derived(
    [...items].sort((a, b) => b.price - a.price).slice(0, 3)
  );
</script>

<h1>Sorting, Reducing & Mutating</h1>

<section>
  <h2>1. Sortable Cart Table</h2>
  <p class="hint">Click a header to sort. Click again to reverse direction.</p>
  <table>
    <thead>
      <tr>
        <th onclick={() => toggleSort('name')}     class="sortable">Name {sortBy === 'name'     ? (sortAsc ? '↑' : '↓') : ''}</th>
        <th onclick={() => toggleSort('price')}    class="sortable">Price {sortBy === 'price'    ? (sortAsc ? '↑' : '↓') : ''}</th>
        <th onclick={() => toggleSort('quantity')} class="sortable">Qty {sortBy === 'quantity' ? (sortAsc ? '↑' : '↓') : ''}</th>
        <th onclick={() => toggleSort('subtotal')} class="sortable">Subtotal {sortBy === 'subtotal' ? (sortAsc ? '↑' : '↓') : ''}</th>
      </tr>
    </thead>
    <tbody>
      {#each sorted as item (item.id)}
        <tr>
          <td>{item.name}</td>
          <td>\\\${item.price}</td>
          <td>{item.quantity}</td>
          <td class="subtotal">\\\${item.price * item.quantity}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<section>
  <h2>2. Mutation Buttons</h2>
  <p class="hint">Svelte 5's deep reactivity makes .push(), .pop(), .splice() all reactive.</p>
  <div class="buttons">
    <button onclick={addItem}>Add Item (push)</button>
    <button onclick={removeLast}   disabled={items.length === 0}>Remove Last (pop)</button>
    <button onclick={removeFirst}  disabled={items.length === 0}>Remove First (splice)</button>
    <button onclick={doubleQuantities}>Double All Qty (map reassign)</button>
  </div>
</section>

<section>
  <h2>3. reduce — Totals</h2>
  <div class="stats">
    <div class="stat"><span>Total Items</span><strong>{totalItems}</strong></div>
    <div class="stat"><span>Total Cost</span><strong>\\\${totalCost}</strong></div>
    <div class="stat"><span>Avg Price</span><strong>\\\${averagePrice.toFixed(2)}</strong></div>
  </div>
</section>

<section>
  <h2>4. reduce — Most Expensive</h2>
  <p>{mostExpensive.name} at <strong>\\\${mostExpensive.price}</strong></p>
</section>

<section>
  <h2>5. reduce into an Object — Group by Category</h2>
  {#each Object.entries(byCategory) as [cat, list] (cat)}
    <div class="group">
      <h3>{cat} ({list.length})</h3>
      <ul>
        {#each list as item (item.id)}
          <li>{item.name}</li>
        {/each}
      </ul>
    </div>
  {/each}
</section>

<section>
  <h2>6. slice — Top 3 Most Expensive</h2>
  <ol>
    {#each topThree as item (item.id)}
      <li>{item.name} — \\\${item.price}</li>
    {/each}
  </ol>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  h3 { font-size: 13px; color: #666; margin: 6px 0 2px 0; text-transform: capitalize; }
  section { margin-bottom: 22px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  strong { color: #222; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; padding: 8px; border-bottom: 2px solid #eee; color: #666; font-size: 11px; text-transform: uppercase; }
  .sortable { cursor: pointer; user-select: none; }
  .sortable:hover { color: #ff3e00; }
  td { padding: 8px; border-bottom: 1px solid #f0f0f0; color: #444; }
  .subtotal { color: #2d8a6e; font-weight: 600; }
  .stats { display: flex; gap: 12px; flex-wrap: wrap; }
  .stat { background: #f8f8f8; padding: 12px 16px; border-radius: 6px; text-align: center; min-width: 100px; }
  .stat span { display: block; font-size: 11px; color: #999; text-transform: uppercase; }
  .stat strong { font-size: 20px; color: #ff3e00; }
  ol, ul { padding-left: 20px; color: #444; font-size: 14px; }
  .group { background: #f8f8f8; padding: 8px 12px; border-radius: 6px; margin-bottom: 4px; }
  .buttons { display: flex; gap: 8px; margin-top: 8px; flex-wrap: wrap; }
  button { padding: 6px 14px; border: 2px solid #ff3e00; background: white; color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px; }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
