import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-3',
		title: 'Array Methods: map, filter, find',
		phase: 1,
		module: 3,
		lessonIndex: 3
	},
	description: `The array methods map, filter, and find are the workhorses of modern JavaScript. map transforms each item, filter selects items that match a condition, and find returns the first match. They can be chained together for powerful data processing pipelines.

This lesson builds a searchable, filterable product list to demonstrate all three methods in a practical context.`,
	objectives: [
		'Use map to transform arrays into new shapes',
		'Use filter to select items matching a condition',
		'Chain map, filter, and find for data processing pipelines'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  const products = [
    { id: 1, name: 'Laptop', category: 'electronics', price: 999, inStock: true },
    { id: 2, name: 'Headphones', category: 'electronics', price: 79, inStock: true },
    { id: 3, name: 'Desk Chair', category: 'furniture', price: 349, inStock: false },
    { id: 4, name: 'Notebook', category: 'stationery', price: 12, inStock: true },
    { id: 5, name: 'Monitor', category: 'electronics', price: 449, inStock: true },
    { id: 6, name: 'Standing Desk', category: 'furniture', price: 599, inStock: true },
    { id: 7, name: 'Pen Set', category: 'stationery', price: 24, inStock: false },
    { id: 8, name: 'Webcam', category: 'electronics', price: 89, inStock: true }
  ];

  let search = $state('');
  let category = $state('all');
  let showInStockOnly = $state(false);
  let selectedId = $state(null);

  // filter — narrow down the list
  const filtered = $derived(
    products
      .filter(p => category === 'all' || p.category === category)
      .filter(p => !showInStockOnly || p.inStock)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  // map — transform into display strings
  const productLabels = $derived(
    filtered.map(p => \`\${p.name} (\$\${p.price})\`)
  );

  // find — select a single item
  const selected = $derived(
    products.find(p => p.id === selectedId)
  );

  const categories = ['all', 'electronics', 'furniture', 'stationery'];
</script>

<h1>Array Methods: map, filter, find</h1>

<section>
  <h2>Search & Filter</h2>
  <div class="controls">
    <input bind:value={search} placeholder="Search products..." />
    <select bind:value={category}>
      {#each categories as cat}
        <option value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
      {/each}
    </select>
    <label><input type="checkbox" bind:checked={showInStockOnly} /> In stock only</label>
  </div>
</section>

<section>
  <h2>Results ({filtered.length} of {products.length})</h2>
  <div class="product-list">
    {#each filtered as product (product.id)}
      <div
        class="product"
        class:selected={selectedId === product.id}
        class:out-of-stock={!product.inStock}
        onclick={() => selectedId = product.id}
      >
        <span class="name">{product.name}</span>
        <span class="category">{product.category}</span>
        <span class="price">\${product.price}</span>
        {#if !product.inStock}
          <span class="badge">Out of stock</span>
        {/if}
      </div>
    {:else}
      <p class="empty">No products match your search.</p>
    {/each}
  </div>
</section>

<section>
  <h2>find — Selected Product</h2>
  {#if selected}
    <div class="detail">
      <p><strong>{selected.name}</strong></p>
      <p>Category: {selected.category}</p>
      <p>Price: \${selected.price}</p>
      <p>In stock: {selected.inStock ? 'Yes' : 'No'}</p>
    </div>
  {:else}
    <p class="hint">Click a product to select it</p>
  {/if}
</section>

<section>
  <h2>map — Labels</h2>
  <p class="labels">{productLabels.join(' | ')}</p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .controls { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  input { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  select { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  label { font-size: 13px; color: #444; display: flex; align-items: center; gap: 4px; }
  .product-list { display: flex; flex-direction: column; gap: 4px; }
  .product {
    display: flex; align-items: center; gap: 12px; padding: 8px 12px;
    border: 2px solid #eee; border-radius: 6px; cursor: pointer; font-size: 14px;
  }
  .product:hover { border-color: #ff3e00; }
  .selected { border-color: #ff3e00; background: #fff5f2; }
  .out-of-stock { opacity: 0.5; }
  .name { flex: 1; color: #333; font-weight: 500; }
  .category { font-size: 11px; color: #999; text-transform: uppercase; }
  .price { color: #4ec9b0; font-weight: 600; }
  .badge { font-size: 10px; background: #fdecea; color: #f44747; padding: 2px 6px; border-radius: 4px; }
  .detail { background: #f8f8f8; padding: 12px; border-radius: 6px; }
  .hint { color: #999; font-style: italic; }
  .labels { font-family: monospace; font-size: 12px; color: #666; }
  .empty { color: #999; font-style: italic; text-align: center; padding: 16px; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
