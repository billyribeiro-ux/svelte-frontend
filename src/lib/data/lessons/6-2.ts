import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-2',
		title: 'Derived Chains & Destructuring',
		phase: 2,
		module: 6,
		lessonIndex: 2
	},
	description: `Derived values can depend on other derived values, forming chains. This is powerful: you build intermediate results that each depend on the previous step, like a data pipeline.

For example: items -> filtered items -> sorted items -> item count. Each step is its own $derived, making the logic easy to read, debug, and reuse.

You can also destructure derived objects and arrays, giving you named access to computed results without repeating logic.`,
	objectives: [
		'Chain multiple $derived values where each depends on the previous',
		'Build a data pipeline: filter, sort, and summarise in steps',
		'Return objects from $derived.by and access individual properties'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let searchTerm = $state('');
  let sortBy = $state('name');
  let sortAsc = $state(true);
  let minPrice = $state(0);

  let products = $state([
    { name: 'Laptop', price: 999, category: 'Electronics' },
    { name: 'Headphones', price: 79, category: 'Electronics' },
    { name: 'Coffee Mug', price: 12, category: 'Kitchen' },
    { name: 'Notebook', price: 8, category: 'Office' },
    { name: 'Desk Lamp', price: 45, category: 'Office' },
    { name: 'Water Bottle', price: 25, category: 'Kitchen' },
    { name: 'Keyboard', price: 149, category: 'Electronics' },
    { name: 'Plant Pot', price: 18, category: 'Home' }
  ]);

  // Chain 1: filter by search
  let searchFiltered = $derived(
    products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Chain 2: filter by price
  let priceFiltered = $derived(
    searchFiltered.filter(p => p.price >= minPrice)
  );

  // Chain 3: sort
  let sorted = $derived.by(() => {
    const copy = [...priceFiltered];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'price') cmp = a.price - b.price;
      else if (sortBy === 'category') cmp = a.category.localeCompare(b.category);
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  });

  // Chain 4: summary derived from the sorted (final) list
  let stats = $derived.by(() => {
    const count = sorted.length;
    const total = sorted.reduce((sum, p) => sum + p.price, 0);
    const avg = count > 0 ? total / count : 0;
    const categories = [...new Set(sorted.map(p => p.category))];

    return { count, total, avg, categories };
  });

  function toggleSort(field) {
    if (sortBy === field) {
      sortAsc = !sortAsc;
    } else {
      sortBy = field;
      sortAsc = true;
    }
  }
</script>

<h1>Derived Chains & Destructuring</h1>

<div class="pipeline">
  <span class="step">All ({products.length})</span>
  <span class="arrow">&rarr;</span>
  <span class="step">Search ({searchFiltered.length})</span>
  <span class="arrow">&rarr;</span>
  <span class="step">Price ({priceFiltered.length})</span>
  <span class="arrow">&rarr;</span>
  <span class="step">Sorted ({sorted.length})</span>
</div>

<div class="filters">
  <input
    type="text"
    placeholder="Search products..."
    bind:value={searchTerm}
  />
  <label>
    Min price: \${minPrice}
    <input type="range" min="0" max="500" bind:value={minPrice} />
  </label>
</div>

<table>
  <thead>
    <tr>
      <th onclick={() => toggleSort('name')} class="sortable">
        Name {sortBy === 'name' ? (sortAsc ? '&#9650;' : '&#9660;') : ''}
      </th>
      <th onclick={() => toggleSort('price')} class="sortable">
        Price {sortBy === 'price' ? (sortAsc ? '&#9650;' : '&#9660;') : ''}
      </th>
      <th onclick={() => toggleSort('category')} class="sortable">
        Category {sortBy === 'category' ? (sortAsc ? '&#9650;' : '&#9660;') : ''}
      </th>
    </tr>
  </thead>
  <tbody>
    {#each sorted as product}
      <tr>
        <td>{product.name}</td>
        <td>\${product.price}</td>
        <td>{product.category}</td>
      </tr>
    {:else}
      <tr><td colspan="3" class="empty">No products match your filters</td></tr>
    {/each}
  </tbody>
</table>

<div class="stats">
  <h3>Summary (from derived chain)</h3>
  <p>Showing <strong>{stats.count}</strong> products</p>
  <p>Total value: <strong>\${stats.total.toFixed(2)}</strong></p>
  <p>Average price: <strong>\${stats.avg.toFixed(2)}</strong></p>
  <p>Categories: <strong>{stats.categories.join(', ') || 'none'}</strong></p>
</div>

<style>
  h1 { color: #333; }
  .pipeline {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }
  .step {
    background: #e8f5e9;
    padding: 0.3rem 0.75rem;
    border-radius: 4px;
    font-size: 0.85rem;
    font-weight: 600;
  }
  .arrow { color: #999; }
  .filters {
    display: flex;
    gap: 1.5rem;
    margin: 1rem 0;
    flex-wrap: wrap;
    align-items: center;
  }
  .filters input[type="text"] {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-width: 200px;
  }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  th, td { padding: 0.6rem; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #f5f5f5; }
  .sortable { cursor: pointer; user-select: none; }
  .sortable:hover { background: #e8e8e8; }
  .empty { text-align: center; color: #999; padding: 2rem; }
  .stats {
    background: #f0f4ff;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
  }
  .stats h3 { margin: 0 0 0.5rem; }
  .stats p { margin: 0.25rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
