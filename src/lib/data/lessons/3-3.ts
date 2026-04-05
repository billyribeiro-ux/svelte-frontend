import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-3',
		title: 'Array Methods: map, filter, find',
		phase: 1,
		module: 3,
		lessonIndex: 3
	},
	description: `If you only learn three array methods this year, make them **map**, **filter**, and **find**. Together they replace most of the \`for\` loops you'd write by hand, and they do it with code that reads like English: "transform each item", "keep only the ones that match", "find the first one that matches."

The key insight is that all three return **new** values — they never mutate the original array. That immutability is what makes them play so nicely with Svelte's reactivity: when you assign the result of a .filter() chain to a \`$derived\` expression, Svelte knows exactly when to recompute.

**map** is a 1-to-1 transformer. Input array of length N, output array of length N, each item reshaped. Use it to turn API objects into display labels, calculate derived fields, or adapt data for a different component. **filter** is a gatekeeper: each item is tested against a predicate, only those that pass make it through. Stack multiple \`.filter()\` calls to compose complex conditions readably. **find** returns the *first* item matching a predicate, or \`undefined\` if none match — perfect for looking up a selected record by id.

These three are joined by a small cast of supporting actors: **findIndex** tells you the *position* of the first match, **some** asks "does at least one match?", **every** asks "do all of them match?", and **includes** checks for a specific value. Chained together, they let you express data pipelines top-to-bottom, where each line has a single responsibility.

Common pitfalls: forgetting that filter/map/find don't mutate (assign the result somewhere!), using \`filter(...)[0]\` instead of \`find(...)\` (wasteful — find stops at the first match), and writing one giant filter predicate instead of several small ones (harder to read and debug). In Svelte 5, you'll usually want these chained inside a \`$derived(...)\` so the UI automatically updates when inputs change.

A "Try It Yourself" section at the bottom gives you three hands-on challenges to practice what you just learned.`,
	objectives: [
		'Use .map() to transform arrays one-to-one into new shapes',
		'Stack multiple .filter() calls to compose readable compound conditions',
		'Use .find() and .findIndex() to locate a single item by predicate',
		'Use .some() and .every() for boolean tests across an array',
		'Chain filter → filter → map into top-to-bottom data pipelines',
		'Wire array pipelines to Svelte $derived so the UI updates automatically'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === THE BIG THREE: map, filter, find ===
  // These three methods are the foundation of modern JavaScript data work.
  //   map     — transform each item (input length = output length)
  //   filter  — keep only matching items (output length <= input length)
  //   find    — return the first matching item (or undefined)
  // All three return NEW values — they never mutate the original array.

  const products = [
    { id: 1, name: 'MacBook Pro',     category: 'electronics', price: 1999, rating: 4.8, inStock: true,  tags: ['laptop', 'apple'] },
    { id: 2, name: 'Sony Headphones', category: 'electronics', price: 299,  rating: 4.6, inStock: true,  tags: ['audio', 'wireless'] },
    { id: 3, name: 'Ergonomic Chair', category: 'furniture',   price: 449,  rating: 4.3, inStock: false, tags: ['office', 'comfort'] },
    { id: 4, name: 'Notebook A5',     category: 'stationery',  price: 12,   rating: 4.1, inStock: true,  tags: ['paper', 'journal'] },
    { id: 5, name: '4K Monitor',      category: 'electronics', price: 549,  rating: 4.7, inStock: true,  tags: ['display', 'uhd'] },
    { id: 6, name: 'Standing Desk',   category: 'furniture',   price: 699,  rating: 4.5, inStock: true,  tags: ['office', 'health'] },
    { id: 7, name: 'Fountain Pen',    category: 'stationery',  price: 89,   rating: 4.9, inStock: false, tags: ['writing', 'premium'] },
    { id: 8, name: 'HD Webcam',       category: 'electronics', price: 129,  rating: 4.2, inStock: true,  tags: ['video', 'streaming'] },
    { id: 9, name: 'Bookshelf',       category: 'furniture',   price: 249,  rating: 4.0, inStock: true,  tags: ['storage'] },
    { id: 10, name: 'Mechanical Keyboard', category: 'electronics', price: 189, rating: 4.8, inStock: true, tags: ['input', 'gaming'] }
  ];

  // --- Reactive UI state ---
  let search        = $state('');
  let category      = $state('all');
  let showInStockOnly = $state(false);
  let minRating     = $state(0);
  let maxPrice      = $state(2000);
  let selectedId    = $state(null);

  // --- filter: chain multiple filters for compound conditions ---
  // Each .filter() call is a separate predicate — readable and composable.
  const filtered = $derived(
    products
      .filter(p => category === 'all' || p.category === category)
      .filter(p => !showInStockOnly || p.inStock)
      .filter(p => p.rating >= minRating)
      .filter(p => p.price <= maxPrice)
      .filter(p => {
        // Case-insensitive substring search across name AND tags.
        const q = search.toLowerCase();
        if (!q) return true;
        return p.name.toLowerCase().includes(q)
            || p.tags.some(t => t.includes(q));
      })
  );

  // --- map: transform the filtered list into display strings ---
  const productLabels = $derived(
    filtered.map(p => \\\`\\\${p.name} — $\\\${p.price}\\\`)
  );

  // --- find: locate a single item by id ---
  // Returns the first match, or undefined if no match.
  const selected = $derived(
    selectedId !== null ? products.find(p => p.id === selectedId) : null
  );

  // --- findIndex: where is it in the array? ---
  const selectedIndex = $derived(
    selectedId !== null ? products.findIndex(p => p.id === selectedId) : -1
  );

  // --- some / every: boolean tests ---
  // some: does AT LEAST ONE match? every: do ALL match?
  const anyOutOfStock   = $derived(filtered.some(p => !p.inStock));
  const allHighRated    = $derived(filtered.length > 0 && filtered.every(p => p.rating >= 4.5));

  // --- Chained pipeline: filter → map → quick derived stats ---
  const topPicks = $derived(
    products
      .filter(p => p.inStock)          // only available
      .filter(p => p.rating >= 4.5)    // only great
      .map(p => ({                     // reshape for display
        id: p.id,
        label: \\\`\\\${p.name} (\\\${p.rating}★)\\\`
      }))
  );

  const categories = ['all', 'electronics', 'furniture', 'stationery'];
</script>

<h1>Array Methods: map, filter, find</h1>

<section>
  <h2>1. Search & Filter Controls</h2>
  <div class="controls">
    <input bind:value={search} placeholder="Search name or tag..." />
    <select bind:value={category}>
      {#each categories as cat (cat)}
        <option value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
      {/each}
    </select>
    <label><input type="checkbox" bind:checked={showInStockOnly} /> In stock only</label>
  </div>
  <div class="controls">
    <label>Min rating:
      <input type="number" bind:value={minRating} min="0" max="5" step="0.1" />
    </label>
    <label>Max price: $
      <input type="number" bind:value={maxPrice} min="0" step="50" />
    </label>
  </div>
</section>

<section>
  <h2>2. filter — Results ({filtered.length} of {products.length})</h2>
  <div class="product-list">
    {#each filtered as product (product.id)}
      <button
        type="button"
        class="product"
        class:selected={selectedId === product.id}
        class:out-of-stock={!product.inStock}
        onclick={() => (selectedId = product.id)}
      >
        <span class="name">{product.name}</span>
        <span class="category">{product.category}</span>
        <span class="rating">{product.rating}★</span>
        <span class="price">\\\${product.price}</span>
        {#if !product.inStock}<span class="badge">Out of stock</span>{/if}
      </button>
    {:else}
      <p class="empty">No products match your filters.</p>
    {/each}
  </div>
</section>

<section>
  <h2>3. find — Selected Product</h2>
  {#if selected}
    <div class="detail">
      <p><strong>{selected.name}</strong> (index {selectedIndex} in the original array)</p>
      <p>Category: {selected.category} · Rating: {selected.rating}★ · Price: \\\${selected.price}</p>
      <p>Tags: {selected.tags.join(', ')}</p>
    </div>
  {:else}
    <p class="hint">Click a product to see .find() in action.</p>
  {/if}
</section>

<section>
  <h2>4. some &amp; every — Boolean Tests</h2>
  <p>Any out of stock in filtered results?
    <strong class:yes={anyOutOfStock} class:no={!anyOutOfStock}>{anyOutOfStock ? 'yes' : 'no'}</strong>
  </p>
  <p>Are ALL filtered results rated 4.5+?
    <strong class:yes={allHighRated} class:no={!allHighRated}>{allHighRated ? 'yes' : 'no'}</strong>
  </p>
</section>

<section>
  <h2>5. map — Label Strings</h2>
  <p class="hint">The filtered list transformed into "Name — $price" strings.</p>
  <p class="labels">{productLabels.join(' | ') || '(none)'}</p>
</section>

<section>
  <h2>6. Chained Pipeline — Top Picks</h2>
  <p class="hint">filter → filter → map: only in-stock items rated 4.5+, reshaped for display.</p>
  <ul class="top-picks">
    {#each topPicks as pick (pick.id)}
      <li>{pick.label}</li>
    {/each}
  </ul>
</section>

<section class="practice">
  <h2>Try It Yourself</h2>
  <p class="intro">Edit the code above to add these features. Answers are at the bottom of the lesson (but resist peeking!)</p>
  <ol>
    <li>
      <strong>1.</strong> Add a <code>cartTotal</code> derived value that sums the prices of every product currently in <code>filtered</code>, and display it above the results.
      <span class="hint">Hint: <code>filtered.reduce((sum, p) =&gt; sum + p.price, 0)</code> inside a <code>$derived</code>.</span>
    </li>
    <li>
      <strong>2.</strong> Add a "Most expensive in filtered results" display.
      <span class="hint">Hint: <code>filtered.reduce((max, p) =&gt; p.price &gt; max.price ? p : max, filtered[0])</code> — guard against an empty list.</span>
    </li>
    <li>
      <strong>3.</strong> Build an <code>avgRating</code> derived that shows the average <code>rating</code> of the filtered list.
      <span class="hint">Hint: sum ratings with <code>.reduce()</code>, divide by <code>filtered.length</code>, guard against zero.</span>
    </li>
  </ol>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  .yes { color: #2d8a6e; font-weight: 600; }
  .no  { color: #c62828; font-weight: 600; }
  .controls { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 6px; }
  input, select { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  input[type="number"] { width: 80px; }
  label { font-size: 13px; color: #444; display: flex; align-items: center; gap: 4px; }
  .product-list { display: flex; flex-direction: column; gap: 4px; }
  .product {
    display: flex; align-items: center; gap: 12px; padding: 8px 12px;
    border: 2px solid #eee; border-radius: 6px; cursor: pointer; font-size: 14px;
    background: white; text-align: left; font-family: inherit;
  }
  .product:hover { border-color: #ff3e00; }
  .selected { border-color: #ff3e00; background: #fff5f2; }
  .out-of-stock { opacity: 0.55; }
  .name { flex: 1; color: #333; font-weight: 500; }
  .category { font-size: 11px; color: #999; text-transform: uppercase; }
  .rating { color: #dcb000; font-weight: 600; font-size: 12px; }
  .price { color: #2d8a6e; font-weight: 600; }
  .badge { font-size: 10px; background: #fdecea; color: #c62828; padding: 2px 6px; border-radius: 4px; }
  .detail { background: #f8f8f8; padding: 12px; border-radius: 6px; }
  .labels { font-family: monospace; font-size: 11px; color: #666; word-break: break-all; }
  .empty { color: #999; font-style: italic; text-align: center; padding: 16px; }
  .top-picks { color: #444; font-size: 13px; padding-left: 20px; }
  .top-picks li { padding: 2px 0; }
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
  .practice li { padding: 0.4rem 0; font-size: 0.85rem; color: #1e3a8a; }
  .practice .hint {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #475569;
    font-style: italic;
    font-weight: normal;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
