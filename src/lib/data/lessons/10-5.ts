import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-5',
		title: '{#key}, {@const} & {@debug}',
		phase: 3,
		module: 10,
		lessonIndex: 5
	},
	description: `Three smaller template directives fill in the gaps between \`$state\`, \`$derived\`, and \`{#each}\`. None of them appears often, but when you need one nothing else will do.

**\`{#key expression}\` … \`{/key}\`** tears down and re-creates its contents whenever \`expression\` changes. The classic use is replaying an enter transition (Svelte otherwise diffs existing DOM and skips the animation), but it's equally useful for resetting component state when the "identity" of what you're showing changes — picking a different user in a selector, for example, should wipe any half-typed edits from the previous one.

**\`{@const name = expression}\`** declares a block-scoped constant inside an \`{#each}\` or \`{#if}\` block. Each iteration gets its own copy. It's the right tool when you want a computed value like \`subtotal = price * qty\` *per row* — you don't need a full \`$derived\` for that, and duplicating the expression everywhere it's used is error-prone.

**\`{@debug var1, var2, ...}\`** is a conditional breakpoint you can check into source control. When any listed variable changes and DevTools is open, the debugger pauses; when DevTools is closed, it's a no-op. Beats sprinkling \`console.log\`s and forgetting to remove them.

This lesson builds a fly-in slideshow (\`{#key}\` replays the transition), a profile selector that resets an editable field (\`{#key}\` on an id), a line-items invoice with four \`{@const}\` derivations per row, and a \`{@debug}\` playground.`,
	objectives: [
		'Use {#key expression} to force a remount when a value changes',
		'Replay enter transitions by wrapping content in {#key}',
		'Reset component state for a new "subject" by keying on an id',
		'Use {@const} inside {#each} for per-iteration derived values',
		'Chain multiple {@const} declarations in a single block',
		'Use {@debug var} as a conditional breakpoint that only triggers when DevTools is open'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import { fly } from 'svelte/transition';

  // ============================================================
  // {#key}, {@const}, {@debug} — special template directives
  // ============================================================
  //
  // {#key expression}
  //   Destroys and re-creates its contents whenever the
  //   expression changes. Useful for:
  //     - replaying enter transitions
  //     - forcing a component to remount with fresh state
  //     - resetting a 3rd-party integration (e.g. a chart)
  //
  // {@const name = expression}
  //   Declares a local constant inside an {#each} or {#if}
  //   block. Scoped to that block. Perfect for per-item
  //   derived values so you don't repeat yourself.
  //
  // {@debug var1, var2, ...}
  //   Pauses the JS debugger whenever any listed variable
  //   changes — BUT only when DevTools is open. It's a
  //   conditional breakpoint you can leave checked in.

  // --- {#key} demo -------------------------------------------
  let slide = $state(0);
  const slides = [
    { title: 'First', body: 'Each time you click "next", the {#key} block re-mounts, so the transition plays again.' },
    { title: 'Second', body: 'Without {#key}, Svelte would diff the existing nodes and you would see no animation.' },
    { title: 'Third', body: 'This is the same pattern many "carousel" and "quote of the day" components use.' }
  ];

  function nextSlide() { slide = (slide + 1) % slides.length; }

  // {#key} for resetting bind:value state: changing the id
  // destroys the inner subtree, wiping any pending edits.
  interface Profile { id: number; name: string; }
  const profiles: Profile[] = [
    { id: 1, name: 'Ada' },
    { id: 2, name: 'Alan' },
    { id: 3, name: 'Grace' }
  ];
  let selectedId = $state(1);

  // --- {@const} demo -----------------------------------------
  type LineItem = { name: string; price: number; qty: number; taxRate: number };
  let items: LineItem[] = $state([
    { name: 'Keyboard', price: 89.99, qty: 1, taxRate: 0.08 },
    { name: 'Mouse', price: 24.5, qty: 2, taxRate: 0.08 },
    { name: 'Monitor', price: 329, qty: 1, taxRate: 0.08 },
    { name: 'Book', price: 15, qty: 3, taxRate: 0 }
  ]);

  // --- {@debug} demo -----------------------------------------
  let debugA = $state('hello');
  let debugB = $state(0);
</script>

<main>
  <h1>{'{#key}'}, {'{@const}'} &amp; {'{@debug}'}</h1>
  <p class="lede">
    Three smaller directives that fill in the gaps between
    <code>$state</code>, <code>$derived</code>, and
    <code>{'{#each}'}</code>.
  </p>

  <section>
    <h2>1. <code>{'{#key}'}</code> — force a remount to replay transitions</h2>
    <p>
      Wrapping content in <code>{'{#key expression}'}</code>
      tells Svelte to tear down and re-create that content
      whenever the expression changes. The most visible effect
      is that enter/exit transitions play again.
    </p>

    {#key slide}
      <div class="slide" in:fly={{ x: 40, duration: 300 }}>
        <h3>{slides[slide].title}</h3>
        <p>{slides[slide].body}</p>
      </div>
    {/key}

    <button type="button" onclick={nextSlide}>Next slide ({slide + 1}/{slides.length})</button>
  </section>

  <section>
    <h2>2. <code>{'{#key}'}</code> — reset state inside the block</h2>
    <p>
      Picking a different profile destroys the editable
      <code>&lt;input&gt;</code> and re-creates it with the
      new initial value. Any unsaved typing is wiped — that's
      exactly what you want when the "identity" of what's
      being edited changes.
    </p>

    <label>
      Profile:
      <select bind:value={selectedId}>
        {#each profiles as p (p.id)}
          <option value={p.id}>{p.name}</option>
        {/each}
      </select>
    </label>

    {#key selectedId}
      {@const profile = profiles.find((p) => p.id === selectedId)!}
      <div class="editor-box">
        <p>Editing profile #{profile.id}</p>
        <input type="text" value={profile.name} />
        <p class="hint">Type here, then switch profiles — your edits vanish because the node is destroyed.</p>
      </div>
    {/key}
  </section>

  <section>
    <h2>3. <code>{'{@const}'}</code> — block-scoped derivations</h2>
    <p>
      Inside an <code>{'{#each}'}</code> or
      <code>{'{#if}'}</code>, <code>{'{@const}'}</code> lets
      you compute a value once and reuse it — no need for a
      separate <code>$derived</code>.
    </p>

    <table>
      <thead>
        <tr>
          <th>Item</th><th>Unit</th><th>Qty</th><th>Subtotal</th><th>Tax</th><th>Total</th>
        </tr>
      </thead>
      <tbody>
        {#each items as item (item.name)}
          {@const subtotal = item.price * item.qty}
          {@const tax = subtotal * item.taxRate}
          {@const total = subtotal + tax}
          {@const isBig = total > 100}
          <tr class:big={isBig}>
            <td>{item.name}</td>
            <td>\${item.price.toFixed(2)}</td>
            <td><input type="number" bind:value={item.qty} min="0" /></td>
            <td>\${subtotal.toFixed(2)}</td>
            <td>\${tax.toFixed(2)}</td>
            <td class:highlight={isBig}>\${total.toFixed(2)}</td>
          </tr>
        {/each}
      </tbody>
    </table>

    <p class="hint">
      Four <code>{'{@const}'}</code> declarations keep the
      template DRY. Each is scoped to one iteration — no
      leakage between rows.
    </p>
  </section>

  <section>
    <h2>4. <code>{'{@debug}'}</code> — conditional breakpoints</h2>
    <p>
      <code>{'{@debug a, b}'}</code> pauses the browser's
      JavaScript debugger whenever <code>a</code> or
      <code>b</code> changes, <em>and only if DevTools is
      currently open</em>. In production with devtools closed,
      it's a no-op.
    </p>

    <label>
      A: <input type="text" bind:value={debugA} />
    </label>
    <label>
      B: <input type="number" bind:value={debugB} />
    </label>

    <p>Current: <code>{debugA}</code> / <code>{debugB}</code></p>

    <pre>{'<!-- Open DevTools and uncomment to pause on each change -->\\n{@debug debugA, debugB}'}</pre>

    <p class="hint">
      Use <code>{'{@debug}'}</code> alone (no arguments) to
      pause whenever any reactive value in scope updates — but
      that's usually too noisy. List the specific variables
      you're investigating.
    </p>
  </section>
</main>

<style>
  main { max-width: 820px; margin: 0 auto; padding: 1.25rem; font-family: system-ui, sans-serif; }
  h1 { margin-top: 0; }
  .lede { color: #555; }
  section {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }
  h2 { margin: 0 0 0.5rem; font-size: 1rem; }
  h3 { margin: 0 0 0.3rem; font-size: 1rem; }
  .slide {
    padding: 1rem;
    background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
    border-radius: 6px;
    margin-bottom: 0.5rem;
  }
  .editor-box {
    padding: 0.75rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    margin-top: 0.5rem;
  }
  button {
    padding: 0.5rem 1rem;
    border: 1px solid #6690ff;
    background: #6690ff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  select, input[type="text"], input[type="number"] {
    padding: 0.4rem 0.55rem;
    font-size: 0.9rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
  }
  label { display: block; margin: 0.4rem 0; font-size: 0.9rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.45rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
  th { background: #f3f4f6; }
  tr.big { background: #fff7ed; }
  td.highlight { font-weight: 700; color: #c2410c; }
  td input[type="number"] { width: 4rem; }
  pre { background: #0f172a; color: #e2e8f0; padding: 0.75rem; border-radius: 4px; font-size: 0.75rem; overflow-x: auto; }
  .hint { font-size: 0.78rem; color: #6b7280; margin-top: 0.5rem; }
  code {
    background: #f3f4f6;
    padding: 0 0.3rem;
    border-radius: 3px;
    font-size: 0.85em;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
