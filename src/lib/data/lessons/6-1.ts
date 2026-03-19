import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-1',
		title: '$derived: Computed Values',
		phase: 2,
		module: 6,
		lessonIndex: 1
	},
	description: `When one piece of state depends on another, you use $derived instead of a second $state. It's like a spreadsheet formula — it automatically recalculates whenever its dependencies change.

$derived(expression) works for simple expressions. For more complex logic with multiple statements, use $derived.by(() => { ... return value; }).

The key insight: $derived values are read-only. You don't set them — Svelte computes them for you. This eliminates an entire category of bugs where computed values get out of sync.`,
	objectives: [
		'Create derived state with $derived for simple expressions',
		'Use $derived.by for multi-step computed values',
		'Derive values from multiple state sources',
		'Understand why $derived is preferred over manually syncing state'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Simple $derived
  let count = $state(0);
  let doubled = $derived(count * 2);
  let quadrupled = $derived(doubled * 2);

  // $derived from multiple sources
  let price = $state(29.99);
  let quantity = $state(1);
  let taxRate = $state(0.08);

  let subtotal = $derived(price * quantity);
  let tax = $derived(subtotal * taxRate);
  let total = $derived(subtotal + tax);

  // $derived.by for complex logic
  let items = $state([
    { name: 'Apples', price: 2.5, inStock: true },
    { name: 'Bananas', price: 1.2, inStock: true },
    { name: 'Cherries', price: 4.0, inStock: false },
    { name: 'Dates', price: 6.5, inStock: true }
  ]);

  let summary = $derived.by(() => {
    const available = items.filter(i => i.inStock);
    const totalValue = available.reduce((sum, i) => sum + i.price, 0);
    const cheapest = available.length > 0
      ? available.reduce((min, i) => i.price < min.price ? i : min)
      : null;

    return {
      availableCount: available.length,
      totalCount: items.length,
      totalValue: totalValue.toFixed(2),
      cheapest: cheapest ? cheapest.name : 'N/A'
    };
  });
</script>

<h1>$derived: Computed Values</h1>

<section>
  <h2>Simple $derived</h2>
  <button onclick={() => count++}>count: {count}</button>
  <p>doubled = $derived(count * 2) = <strong>{doubled}</strong></p>
  <p>quadrupled = $derived(doubled * 2) = <strong>{quadrupled}</strong></p>
  <p class="note">Change count and watch derived values update automatically!</p>
</section>

<section>
  <h2>Derived from Multiple Sources</h2>
  <div class="controls">
    <label>
      Price: $<input type="number" bind:value={price} step="0.01" min="0" />
    </label>
    <label>
      Quantity: <input type="number" bind:value={quantity} min="1" max="99" />
    </label>
    <label>
      Tax: <input type="number" bind:value={taxRate} step="0.01" min="0" max="0.5" />
      ({(taxRate * 100).toFixed(0)}%)
    </label>
  </div>
  <div class="receipt">
    <div class="line"><span>Subtotal:</span><span>\${subtotal.toFixed(2)}</span></div>
    <div class="line"><span>Tax:</span><span>\${tax.toFixed(2)}</span></div>
    <div class="line total"><span>Total:</span><span>\${total.toFixed(2)}</span></div>
  </div>
</section>

<section>
  <h2>$derived.by (Complex Logic)</h2>
  <ul>
    {#each items as item}
      <li class:out-of-stock={!item.inStock}>
        {item.name} — \${item.price.toFixed(2)}
        {#if !item.inStock}<span class="badge">Out of stock</span>{/if}
      </li>
    {/each}
  </ul>
  <div class="summary">
    <p>Available: {summary.availableCount} / {summary.totalCount}</p>
    <p>Total value (in stock): \${summary.totalValue}</p>
    <p>Cheapest available: {summary.cheapest}</p>
  </div>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  button {
    padding: 0.5rem 1.5rem;
    font-size: 1.1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .note { font-size: 0.85rem; color: #888; font-style: italic; }
  .controls { display: flex; flex-direction: column; gap: 0.5rem; }
  .controls input { width: 80px; padding: 0.3rem; }
  .receipt {
    margin-top: 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.75rem;
    max-width: 250px;
    background: white;
  }
  .line {
    display: flex;
    justify-content: space-between;
    padding: 0.25rem 0;
  }
  .total {
    border-top: 2px solid #333;
    font-weight: bold;
    font-size: 1.1rem;
    margin-top: 0.25rem;
    padding-top: 0.5rem;
  }
  ul { list-style: none; padding: 0; }
  li {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
  }
  .out-of-stock { opacity: 0.5; text-decoration: line-through; }
  .badge {
    background: #ef4444;
    color: white;
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
  }
  .summary {
    background: #e8f5e9;
    padding: 0.75rem;
    border-radius: 6px;
    margin-top: 0.5rem;
  }
  .summary p { margin: 0.25rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
