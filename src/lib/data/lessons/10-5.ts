import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-5',
		title: '{#key}, {@const} & {@debug}',
		phase: 3,
		module: 10,
		lessonIndex: 5
	},
	description: `Svelte provides several template-level directives for special scenarios. {#key expression} destroys and recreates its contents when the expression changes — useful for triggering transitions or resetting component state. {@const} lets you declare a computed variable inside an {#each} or {#if} block. {@debug} pauses the debugger when its watched variables change.

These utilities round out your template toolkit for handling edge cases cleanly.`,
	objectives: [
		'Use {#key} to force component remounting when a value changes',
		'Declare block-scoped computed variables with {@const}',
		'Use {@debug} to pause execution and inspect reactive values',
		'Understand when each directive is the right tool'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  interface Product {
    name: string;
    price: number;
    quantity: number;
  }

  // {#key} demo — changing this re-creates the element
  let animationId: number = $state(0);

  function regenerate() {
    animationId++;
  }

  // {@const} demo — computed values inside {#each}
  let products: Product[] = $state([
    { name: 'Widget', price: 9.99, quantity: 3 },
    { name: 'Gadget', price: 24.50, quantity: 1 },
    { name: 'Doohickey', price: 4.75, quantity: 7 }
  ]);

  // {@debug} demo
  let debugValue: string = $state('hello');
</script>

<main>
  <h1>{'{#key}'}, {'@const'} & {'@debug'}</h1>

  <!-- {#key} — destroys and recreates content when value changes -->
  <section>
    <h2>{'{#key}'} — Force Remount</h2>
    {#key animationId}
      <div class="animated-box">
        Remount #{animationId} — I fade in each time!
      </div>
    {/key}
    <button onclick={regenerate}>Regenerate (key = {animationId})</button>
    <p><em>Each click destroys and recreates the element, replaying the CSS animation.</em></p>
  </section>

  <!-- {@const} — declare computed values inside blocks -->
  <section>
    <h2>{'@const'} — Block-Scoped Computations</h2>
    <table>
      <thead>
        <tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr>
      </thead>
      <tbody>
        {#each products as product}
          {@const total = product.price * product.quantity}
          {@const isExpensive = total > 20}
          <tr class:expensive={isExpensive}>
            <td>{product.name}</td>
            <td>\${product.price.toFixed(2)}</td>
            <td>
              <input type="number" bind:value={product.quantity} min={0} style="width:4rem" />
            </td>
            <td class:highlight={isExpensive}>
              \${total.toFixed(2)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <p><em>{'@const'} computes "total" and "isExpensive" inside the each block — no need for a separate $derived.</em></p>
  </section>

  <!-- {@debug} — pauses debugger -->
  <section>
    <h2>{'@debug'} — Debugger Breakpoint</h2>
    <input type="text" bind:value={debugValue} placeholder="Type to trigger debug..." />
    <!-- Uncomment the line below and open DevTools to see it pause: -->
    <!-- {@debug debugValue} -->
    <p>Current value: <strong>{debugValue}</strong></p>
    <pre>{\`<!-- Uncomment to activate: -->
{@debug debugValue}

<!-- When debugValue changes, the browser
     debugger pauses (if DevTools is open) -->\`}</pre>
    <p><em>{'@debug'} is like a conditional breakpoint — it pauses execution whenever the watched variable changes, but only when DevTools is open.</em></p>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  .animated-box {
    padding: 1rem;
    background: #e3f2fd;
    border-radius: 8px;
    text-align: center;
    font-weight: bold;
    animation: fadeIn 0.5s ease-in;
    margin-bottom: 0.5rem;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
  th { background: #f5f5f5; }
  .expensive { background: #fff3e0; }
  .highlight { font-weight: bold; color: #e65100; }
  pre { background: #f5f5f5; padding: 0.75rem; border-radius: 4px; font-size: 0.85rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
  input[type="text"] { padding: 0.5rem; font-size: 1rem; width: 100%; box-sizing: border-box; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
