import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-1',
		title: '$derived: Computed Values',
		phase: 2,
		module: 6,
		lessonIndex: 1
	},
	description: `When one piece of state depends on another, you use <code>$derived</code> instead of a second <code>$state</code>. Think of it as a spreadsheet formula — you describe how to compute the value, and Svelte recalculates it automatically whenever its inputs change.

<code>$derived(expression)</code> works for simple expressions like <code>count * 2</code>. For multi-statement logic — loops, conditionals, intermediate variables — use <code>$derived.by(() => { ... return value; })</code>. Both give you the same reactive guarantees.

The key insight: **derived values are read-only**. You don't set them — Svelte computes them for you. This eliminates an entire category of bugs where computed values get out of sync with their source. Derived values are also **lazy** and **memoised** — they only recompute when someone reads them and a dependency has actually changed.`,
	objectives: [
		'Create derived state with $derived for simple expressions',
		'Use $derived.by for multi-step computed values',
		'Chain multiple derived values — derived from derived',
		'Derive summaries (count, sum, average) from arrays',
		'Understand why $derived is safer than manually syncing state'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ========================================================
  // 1. Simple derived: numbers
  // ========================================================
  let count = $state(0);
  let doubled = $derived(count * 2);
  let quadrupled = $derived(doubled * 2); // derived of a derived
  let isEven = $derived(count % 2 === 0);
  let sign = $derived(count > 0 ? 'positive' : count < 0 ? 'negative' : 'zero');

  // ========================================================
  // 2. Derived from multiple sources (shopping cart)
  // ========================================================
  let price = $state(29.99);
  let quantity = $state(1);
  let taxRate = $state(0.08);
  let discountPercent = $state(0);

  let subtotal = $derived(price * quantity);
  let discount = $derived(subtotal * (discountPercent / 100));
  let taxed = $derived((subtotal - discount) * taxRate);
  let total = $derived(subtotal - discount + taxed);

  // ========================================================
  // 3. Derived from arrays
  // ========================================================
  let items = $state([
    { name: 'Apples',   price: 2.5, qty: 3, inStock: true },
    { name: 'Bananas',  price: 1.2, qty: 6, inStock: true },
    { name: 'Cherries', price: 4.0, qty: 1, inStock: false },
    { name: 'Dates',    price: 6.5, qty: 2, inStock: true },
    { name: 'Elderberries', price: 9.0, qty: 1, inStock: false }
  ]);

  // Using $derived.by for complex multi-step logic.
  // Everything inside is tracked — Svelte watches every reactive read.
  let summary = $derived.by(() => {
    const available = items.filter((i) => i.inStock);
    const unavailable = items.length - available.length;

    const totalValue = available.reduce((sum, i) => sum + i.price * i.qty, 0);
    const totalUnits = available.reduce((sum, i) => sum + i.qty, 0);

    const cheapest =
      available.length > 0
        ? available.reduce((min, i) => (i.price < min.price ? i : min))
        : null;

    const mostExpensive =
      available.length > 0
        ? available.reduce((max, i) => (i.price > max.price ? i : max))
        : null;

    const avgPrice = available.length > 0 ? totalValue / totalUnits : 0;

    return {
      availableCount: available.length,
      unavailableCount: unavailable,
      totalCount: items.length,
      totalValue: totalValue.toFixed(2),
      totalUnits,
      avgPrice: avgPrice.toFixed(2),
      cheapest: cheapest?.name ?? 'N/A',
      mostExpensive: mostExpensive?.name ?? 'N/A'
    };
  });

  // ========================================================
  // 4. Derived objects — return whole objects
  // ========================================================
  let firstName = $state('Ada');
  let lastName = $state('Lovelace');
  let birthYear = $state(1815);
  let currentYear = $state(new Date().getFullYear());

  let person = $derived.by(() => ({
    fullName: \`\${firstName} \${lastName}\`,
    initials: \`\${firstName[0] ?? ''}\${lastName[0] ?? ''}\`.toUpperCase(),
    age: currentYear - birthYear,
    generation:
      currentYear - birthYear < 13 ? 'child' :
      currentYear - birthYear < 20 ? 'teen' :
      currentYear - birthYear < 65 ? 'adult' :
      'senior'
  }));

  function toggleStock(i) {
    items[i].inStock = !items[i].inStock;
  }
</script>

<h1>$derived: Computed Values</h1>

<p class="lead">
  <code>$derived</code> is the reactive spreadsheet formula of Svelte 5. Describe the
  result, and Svelte keeps it in sync automatically.
</p>

<section>
  <h2>1. Simple Derived Chains</h2>
  <button onclick={() => count++}>count: {count}</button>
  <button onclick={() => count--} class="secondary">-1</button>
  <button onclick={() => (count = 0)} class="secondary">reset</button>

  <div class="grid">
    <div class="stat">
      <span class="m-label">doubled</span>
      <span class="m-val">{doubled}</span>
    </div>
    <div class="stat">
      <span class="m-label">quadrupled</span>
      <span class="m-val">{quadrupled}</span>
    </div>
    <div class="stat">
      <span class="m-label">isEven</span>
      <span class="m-val">{isEven ? 'yes' : 'no'}</span>
    </div>
    <div class="stat">
      <span class="m-label">sign</span>
      <span class="m-val">{sign}</span>
    </div>
  </div>
  <p class="note">
    <code>quadrupled</code> is a derived value that depends on another derived value —
    chains propagate automatically.
  </p>
</section>

<section>
  <h2>2. Shopping Cart (Multiple Sources)</h2>
  <div class="controls">
    <label>Price $<input type="number" bind:value={price} step="0.01" min="0" /></label>
    <label>Quantity <input type="number" bind:value={quantity} min="1" max="99" /></label>
    <label>Tax <input type="number" bind:value={taxRate} step="0.01" min="0" max="0.5" /> ({(taxRate * 100).toFixed(0)}%)</label>
    <label>Discount {discountPercent}% <input type="range" bind:value={discountPercent} min="0" max="50" /></label>
  </div>
  <div class="receipt">
    <div class="line"><span>Subtotal</span><span>\${subtotal.toFixed(2)}</span></div>
    <div class="line"><span>Discount</span><span>-\${discount.toFixed(2)}</span></div>
    <div class="line"><span>Tax</span><span>\${taxed.toFixed(2)}</span></div>
    <div class="line total"><span>Total</span><span>\${total.toFixed(2)}</span></div>
  </div>
</section>

<section>
  <h2>3. $derived.by with Arrays</h2>
  <p class="note">Click any row to toggle stock — every derived statistic updates at once.</p>

  <ul class="items">
    {#each items as item, i (item.name)}
      <li class:out-of-stock={!item.inStock}>
        <button class="row-btn" onclick={() => toggleStock(i)}>
          <span class="name">{item.name}</span>
          <span class="qty">×{item.qty}</span>
          <span class="price">\${item.price.toFixed(2)}</span>
          {#if !item.inStock}<span class="badge">out</span>{/if}
        </button>
      </li>
    {/each}
  </ul>

  <div class="summary">
    <div class="sum-row"><strong>Available</strong><span>{summary.availableCount} / {summary.totalCount}</span></div>
    <div class="sum-row"><strong>Total value</strong><span>\${summary.totalValue}</span></div>
    <div class="sum-row"><strong>Total units</strong><span>{summary.totalUnits}</span></div>
    <div class="sum-row"><strong>Avg unit price</strong><span>\${summary.avgPrice}</span></div>
    <div class="sum-row"><strong>Cheapest</strong><span>{summary.cheapest}</span></div>
    <div class="sum-row"><strong>Priciest</strong><span>{summary.mostExpensive}</span></div>
  </div>
</section>

<section>
  <h2>4. Derived Objects</h2>
  <div class="controls">
    <label>First <input bind:value={firstName} /></label>
    <label>Last <input bind:value={lastName} /></label>
    <label>Birth year <input type="number" bind:value={birthYear} min="1800" max={currentYear} /></label>
  </div>

  <div class="person-card">
    <div class="avatar">{person.initials}</div>
    <div>
      <div class="full-name">{person.fullName}</div>
      <div class="meta">
        age {person.age} &middot; {person.generation}
      </div>
    </div>
  </div>
</section>

<div class="rule">
  <strong>The rule:</strong> If a value can be computed from other values, use
  <code>$derived</code>. Don't store it in <code>$state</code> and keep it in sync yourself —
  that's the #1 source of stale-state bugs.
</div>

<style>
  h1 { color: #333; }
  .lead { color: #555; max-width: 720px; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 10px; }
  section h2 { margin-top: 0; }

  button {
    padding: 0.5rem 1.25rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin-right: 0.4rem;
  }
  button:hover { background: #4338ca; }
  .secondary { background: #6b7280; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
    margin: 0.75rem 0;
  }
  .stat {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 0.5rem;
    text-align: center;
  }
  .m-label {
    display: block;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: #888;
  }
  .m-val { font-weight: bold; color: #4f46e5; }

  .controls { display: flex; flex-direction: column; gap: 0.5rem; }
  .controls label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
  .controls input { padding: 0.3rem; width: 100px; border: 1px solid #ccc; border-radius: 4px; }

  .receipt {
    margin-top: 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.75rem;
    max-width: 280px;
    background: white;
  }
  .line { display: flex; justify-content: space-between; padding: 0.25rem 0; font-size: 0.9rem; }
  .total {
    border-top: 2px solid #333;
    font-weight: bold;
    font-size: 1.1rem;
    margin-top: 0.25rem;
    padding-top: 0.5rem;
  }

  .note { font-size: 0.85rem; color: #888; font-style: italic; }

  .items { list-style: none; padding: 0; margin: 0.5rem 0; }
  .items li { margin-bottom: 0.3rem; }
  .row-btn {
    width: 100%;
    text-align: left;
    background: white;
    color: #333;
    border: 1px solid #e5e7eb;
    display: grid;
    grid-template-columns: 2fr 0.5fr 1fr auto;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.75rem;
    margin: 0;
    font-size: 0.9rem;
  }
  .row-btn:hover { background: #f8f9fa; }
  .out-of-stock .row-btn { opacity: 0.5; text-decoration: line-through; }
  .name { font-weight: 500; }
  .qty { color: #888; font-size: 0.85rem; }
  .price { text-align: right; }
  .badge {
    background: #ef4444;
    color: white;
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
  }

  .summary {
    background: #e8f5e9;
    padding: 0.75rem;
    border-radius: 6px;
    margin-top: 0.75rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem 1rem;
  }
  .sum-row { display: flex; justify-content: space-between; font-size: 0.85rem; }

  .person-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    max-width: 340px;
    margin-top: 0.75rem;
  }
  .avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: #4f46e5;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 1.1rem;
  }
  .full-name { font-weight: bold; }
  .meta { font-size: 0.8rem; color: #666; }

  .rule {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1.5rem;
  }
  code { background: #e5e7eb; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
