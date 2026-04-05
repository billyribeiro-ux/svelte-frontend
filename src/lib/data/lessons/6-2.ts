import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-2',
		title: 'Derived Chains & Destructuring',
		phase: 2,
		module: 6,
		lessonIndex: 2
	},
	description: `Real apps rarely have a single computed value — they have **pipelines**. Input data flows through a sequence of transformations: search, filter, sort, group, paginate. Each step is easier to reason about when it's its own <code>$derived</code>.

Breaking a pipeline into named derived steps has three benefits:
1. **Readability** — each variable name documents what the step does.
2. **Debuggability** — you can read any intermediate step in the template to see what's happening.
3. **Laziness** — Svelte only recomputes the steps whose inputs changed.

You can also return objects from <code>$derived.by</code> and destructure them — but we'll see in a later lesson that destructuring outside a derived/effect has gotchas. Here we stay inside the safe zone.`,
	objectives: [
		'Chain multiple $derived values where each depends on the previous step',
		'Build a data pipeline: search -> filter -> sort -> paginate -> stats',
		'Return multiple values from $derived.by via an object',
		'Keep each step small and named for clarity'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === User inputs ===
  let searchTerm = $state('');
  let categoryFilter = $state('all');
  let minPrice = $state(0);
  let maxPrice = $state(2000);
  let sortBy = $state('name');
  let sortAsc = $state(true);
  let pageSize = $state(5);
  let currentPage = $state(1);

  // === Source data ===
  let products = $state([
    { name: 'Laptop',        price: 999, category: 'Electronics', rating: 4.5 },
    { name: 'Headphones',    price: 79,  category: 'Electronics', rating: 4.2 },
    { name: 'Coffee Mug',    price: 12,  category: 'Kitchen',     rating: 4.8 },
    { name: 'Notebook',      price: 8,   category: 'Office',      rating: 4.0 },
    { name: 'Desk Lamp',     price: 45,  category: 'Office',      rating: 4.6 },
    { name: 'Water Bottle',  price: 25,  category: 'Kitchen',     rating: 4.3 },
    { name: 'Keyboard',      price: 149, category: 'Electronics', rating: 4.7 },
    { name: 'Plant Pot',     price: 18,  category: 'Home',        rating: 4.1 },
    { name: 'Monitor',       price: 349, category: 'Electronics', rating: 4.6 },
    { name: 'Yoga Mat',      price: 35,  category: 'Fitness',     rating: 4.4 },
    { name: 'Blender',       price: 89,  category: 'Kitchen',     rating: 4.2 },
    { name: 'Pillow',        price: 22,  category: 'Home',        rating: 4.5 }
  ]);

  // --------------------------------------------------
  // Pipeline — each step is a named $derived for clarity.
  // --------------------------------------------------

  // STEP 1: filter by search term (name or category)
  let searchFiltered = $derived(
    products.filter((p) => {
      const q = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    })
  );

  // STEP 2: filter by category dropdown
  let categoryFiltered = $derived(
    categoryFilter === 'all'
      ? searchFiltered
      : searchFiltered.filter((p) => p.category === categoryFilter)
  );

  // STEP 3: filter by price range
  let priceFiltered = $derived(
    categoryFiltered.filter((p) => p.price >= minPrice && p.price <= maxPrice)
  );

  // STEP 4: sort
  let sorted = $derived.by(() => {
    const copy = [...priceFiltered];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'price') cmp = a.price - b.price;
      else if (sortBy === 'rating') cmp = a.rating - b.rating;
      else if (sortBy === 'category') cmp = a.category.localeCompare(b.category);
      return sortAsc ? cmp : -cmp;
    });
    return copy;
  });

  // STEP 5: paginate — return pagination info AND the slice in one object.
  let paginated = $derived.by(() => {
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    // Clamp current page whenever filters shrink the result set.
    const page = Math.min(currentPage, totalPages);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      page,
      totalPages,
      totalItems,
      items: sorted.slice(start, end),
      firstShown: totalItems === 0 ? 0 : start + 1,
      lastShown: Math.min(end, totalItems)
    };
  });

  // STEP 6: stats on the *final* filtered+sorted set (not paginated).
  let stats = $derived.by(() => {
    if (sorted.length === 0) {
      return { count: 0, total: 0, avg: 0, avgRating: 0, categories: [] };
    }
    const total = sorted.reduce((s, p) => s + p.price, 0);
    const avg = total / sorted.length;
    const avgRating = sorted.reduce((s, p) => s + p.rating, 0) / sorted.length;
    const categories = [...new Set(sorted.map((p) => p.category))];
    return { count: sorted.length, total, avg, avgRating, categories };
  });

  // Unique list of categories for the dropdown — also derived!
  let allCategories = $derived(['all', ...new Set(products.map((p) => p.category))]);

  function toggleSort(field) {
    if (sortBy === field) sortAsc = !sortAsc;
    else {
      sortBy = field;
      sortAsc = true;
    }
  }

  function goTo(page) {
    currentPage = Math.max(1, Math.min(paginated.totalPages, page));
  }
</script>

<h1>Derived Chains: Build a Pipeline</h1>

<p class="lead">
  Six derived steps turn the raw product list into a searchable, filterable, sortable,
  paginated view with live stats — each step is tiny.
</p>

<div class="pipeline">
  <span class="step">all ({products.length})</span>
  <span class="arrow">&rarr;</span>
  <span class="step">search ({searchFiltered.length})</span>
  <span class="arrow">&rarr;</span>
  <span class="step">category ({categoryFiltered.length})</span>
  <span class="arrow">&rarr;</span>
  <span class="step">price ({priceFiltered.length})</span>
  <span class="arrow">&rarr;</span>
  <span class="step">sorted ({sorted.length})</span>
  <span class="arrow">&rarr;</span>
  <span class="step highlight">page {paginated.page}/{paginated.totalPages}</span>
</div>

<div class="filters">
  <input type="text" bind:value={searchTerm} placeholder="Search..." />

  <select bind:value={categoryFilter}>
    {#each allCategories as cat (cat)}
      <option value={cat}>{cat}</option>
    {/each}
  </select>

  <label>
    Min \${minPrice}
    <input type="range" min="0" max="2000" bind:value={minPrice} />
  </label>
  <label>
    Max \${maxPrice}
    <input type="range" min="0" max="2000" bind:value={maxPrice} />
  </label>

  <label>
    Per page
    <select bind:value={pageSize}>
      <option value={3}>3</option>
      <option value={5}>5</option>
      <option value={10}>10</option>
    </select>
  </label>
</div>

<table>
  <thead>
    <tr>
      <th onclick={() => toggleSort('name')} class="sortable">
        Name {sortBy === 'name' ? (sortAsc ? '&uarr;' : '&darr;') : ''}
      </th>
      <th onclick={() => toggleSort('price')} class="sortable">
        Price {sortBy === 'price' ? (sortAsc ? '&uarr;' : '&darr;') : ''}
      </th>
      <th onclick={() => toggleSort('rating')} class="sortable">
        Rating {sortBy === 'rating' ? (sortAsc ? '&uarr;' : '&darr;') : ''}
      </th>
      <th onclick={() => toggleSort('category')} class="sortable">
        Category {sortBy === 'category' ? (sortAsc ? '&uarr;' : '&darr;') : ''}
      </th>
    </tr>
  </thead>
  <tbody>
    {#each paginated.items as product (product.name)}
      <tr>
        <td>{product.name}</td>
        <td>\${product.price}</td>
        <td>{product.rating.toFixed(1)}</td>
        <td>{product.category}</td>
      </tr>
    {:else}
      <tr><td colspan="4" class="empty">No products match your filters</td></tr>
    {/each}
  </tbody>
</table>

<div class="pager">
  <button onclick={() => goTo(1)} disabled={paginated.page === 1}>&laquo;</button>
  <button onclick={() => goTo(paginated.page - 1)} disabled={paginated.page === 1}>&lsaquo;</button>
  <span class="page-label">
    {paginated.firstShown}–{paginated.lastShown} of {paginated.totalItems}
  </span>
  <button onclick={() => goTo(paginated.page + 1)} disabled={paginated.page === paginated.totalPages}>&rsaquo;</button>
  <button onclick={() => goTo(paginated.totalPages)} disabled={paginated.page === paginated.totalPages}>&raquo;</button>
</div>

<div class="stats">
  <h3>Stats (from the full filtered set, not just this page)</h3>
  <div class="stats-grid">
    <div><span class="m-label">Matches</span><span class="m-val">{stats.count}</span></div>
    <div><span class="m-label">Total</span><span class="m-val">\${stats.total.toFixed(2)}</span></div>
    <div><span class="m-label">Avg price</span><span class="m-val">\${stats.avg.toFixed(2)}</span></div>
    <div><span class="m-label">Avg rating</span><span class="m-val">{stats.avgRating.toFixed(2)}</span></div>
  </div>
  <p class="cat-list"><strong>Categories:</strong> {stats.categories.join(', ') || '(none)'}</p>
</div>

<style>
  h1 { color: #333; }
  .lead { color: #555; max-width: 720px; }
  .pipeline {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }
  .step {
    background: #e8f5e9;
    padding: 0.3rem 0.7rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  .step.highlight { background: #4f46e5; color: white; }
  .arrow { color: #999; }

  .filters {
    display: flex;
    gap: 1rem;
    margin: 1rem 0;
    flex-wrap: wrap;
    align-items: center;
    background: #fafafa;
    padding: 0.75rem;
    border-radius: 8px;
  }
  .filters input[type='text'] {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    min-width: 180px;
  }
  .filters select {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .filters label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
  }

  table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; }
  th, td { padding: 0.6rem; text-align: left; border-bottom: 1px solid #eee; font-size: 0.9rem; }
  th { background: #f5f5f5; }
  .sortable { cursor: pointer; user-select: none; }
  .sortable:hover { background: #e8e8e8; }
  .empty { text-align: center; color: #999; padding: 2rem; }

  .pager {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    justify-content: center;
    margin: 0.75rem 0;
  }
  .pager button {
    padding: 0.35rem 0.75rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .pager button:disabled { background: #ccc; cursor: not-allowed; }
  .page-label { font-size: 0.9rem; color: #555; }

  .stats {
    background: #f0f4ff;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
  }
  .stats h3 { margin: 0 0 0.5rem; }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 0.5rem;
  }
  .stats-grid > div {
    background: white;
    border-radius: 6px;
    padding: 0.5rem;
    text-align: center;
  }
  .m-label { display: block; font-size: 0.7rem; text-transform: uppercase; color: #888; }
  .m-val { font-weight: bold; color: #4f46e5; }
  .cat-list { margin: 0.5rem 0 0; font-size: 0.85rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
