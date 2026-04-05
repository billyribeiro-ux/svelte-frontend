import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-4',
		title: 'Modules & Shared State',
		phase: 3,
		module: 10,
		lessonIndex: 4
	},
	description: `Runes normally live inside a component, but Svelte 5 lets you put them in an external file if it ends in **\`.svelte.ts\`** (or \`.svelte.js\`). The compiler runs the same reactivity transform, and the result is a plain JavaScript module that every importing component can share — a true singleton.

The idiomatic pattern is a **store class**:

\`\`\`ts
// cart.svelte.ts
class CartStore {
  items = $state([]);
  total = $derived(this.items.reduce((s, it) => s + it.price * it.qty, 0));

  add = (name, price) => { /* ... */ };
  remove = (id) => { /* ... */ };
}

export const cart = new CartStore();
\`\`\`

Every component that writes \`import { cart } from './cart.svelte.ts'\` sees the same instance, and because \`cart.items\` is a \`$state\`, every component re-renders automatically when it mutates. No \`svelte/store\`, no \`$\` subscription prefix, no boilerplate — just property access.

You can also use bare \`let\`s with **getter functions** instead of a class. The key rule: never \`export const value = $state(0)\` directly, because the importer receives the snapshot at import time, not a live binding. Wrap the read in a getter (or a class field) to keep it reactive.

**SSR safety** is the elephant in the room. On the server, modules are shared between every request in the same Node process. Put user-specific data in a module and it leaks between users. Use module state only for things that genuinely should be shared: feature flags, static config, cached lookup tables. For per-user data, use context (previous lesson) — it's instance-scoped.

This lesson builds a full shopping cart singleton with a class-based store, a preferences "object of getters" to show the alternative style, and a blunt discussion of when stores still matter and when module state is a footgun.

The end of the lesson lists 4-6 common pitfalls and pro tips to help you avoid the traps students most often hit.`,
	objectives: [
		'Create a .svelte.ts module with runes and export it as a singleton',
		'Build a reactive store class with $state, $derived, and arrow-field methods',
		'Use the getter-function pattern to export reactive values from loose let bindings',
		'Understand why `export const x = $state(0)` does not work the way you expect',
		'Know when to prefer module state, context, or Svelte 4 stores',
		'Recognise the SSR leakage risk of module-level state'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // .svelte.ts modules — shared state without stores
  // ============================================================
  //
  // Svelte 5 lets you put $state, $derived, $effect in files
  // outside a component — IF the file ends in .svelte.ts
  // (or .svelte.js). The compiler picks them up and runs
  // them through the same reactivity transform.
  //
  // The classic pattern is a "store class":
  //
  //   // counter.svelte.ts
  //   class CounterStore {
  //     count = $state(0);
  //     increment = () => { this.count++; };
  //   }
  //   export const counter = new CounterStore();
  //
  // Every component that imports \`counter\` shares the same
  // instance — it's a module-level singleton.
  //
  // Why not \`export let count = $state(0)\` directly?
  // Because JS \`export\` gives the importer the value at
  // import time, not a live binding to a rune. A class field
  // or a getter function keeps the read reactive.
  //
  // WARNING: During SSR, modules are shared between every
  // request — so never put per-user data in module state.
  // Use context (previous lesson) for that.

  // In this lesson we can't load a real .svelte.ts file, so
  // we inline the same pattern as if it were one. The runtime
  // behavior is identical.

  class CartStore {
    items: Array<{ id: number; name: string; price: number; qty: number }> = $state([]);

    // $derived can live on a class field, too — it recomputes
    // whenever any item changes.
    total = $derived(
      this.items.reduce((sum, it) => sum + it.price * it.qty, 0)
    );

    count = $derived(
      this.items.reduce((sum, it) => sum + it.qty, 0)
    );

    // Arrow fields are safe to pass directly as handlers.
    add = (name: string, price: number) => {
      const existing = this.items.find((it) => it.name === name);
      if (existing) {
        existing.qty++;
      } else {
        this.items = [
          ...this.items,
          { id: Date.now(), name, price, qty: 1 }
        ];
      }
    };

    remove = (id: number) => {
      this.items = this.items.filter((it) => it.id !== id);
    };

    clear = () => {
      this.items = [];
    };
  }

  // Singleton exported from a .svelte.ts file would be:
  //   export const cart = new CartStore();
  const cart = new CartStore();

  // Another store — this time showing the bare-function style.
  // (Both styles are fine; pick whichever your team prefers.)
  let darkMode = $state(false);
  let fontSize = $state(16);

  const preferences = {
    get darkMode() { return darkMode; },
    get fontSize() { return fontSize; },
    toggleDark() { darkMode = !darkMode; },
    setFontSize(n: number) { fontSize = Math.max(10, Math.min(32, n)); }
  };

  const catalog = [
    { name: 'Svelte sticker', price: 2 },
    { name: 'Runes mug', price: 12 },
    { name: 'Context hoodie', price: 40 },
    { name: 'SvelteKit t-shirt', price: 25 }
  ];
</script>

<main class:dark={preferences.darkMode} style="font-size: {preferences.fontSize}px">
  <h1>Modules &amp; Shared State</h1>

  <section>
    <h2>The <code>.svelte.ts</code> module pattern</h2>
    <p>
      A file ending in <code>.svelte.ts</code> can use runes
      outside a component. Everything you export from that
      file is shared across every importing component.
    </p>
    <pre>{'// cart.svelte.ts\\nclass CartStore {\\n  items = $state([]);\\n  total = $derived(\\n    this.items.reduce((s, it) => s + it.price * it.qty, 0)\\n  );\\n\\n  add = (name, price) => { /* ... */ };\\n  remove = (id) => { /* ... */ };\\n}\\n\\nexport const cart = new CartStore();'}</pre>
  </section>

  <section>
    <h2>Live demo — shopping cart</h2>
    <div class="catalog">
      {#each catalog as product (product.name)}
        <button type="button" onclick={() => cart.add(product.name, product.price)}>
          + {product.name} (\${product.price})
        </button>
      {/each}
    </div>

    <div class="cart">
      <h3>Cart ({cart.count} {cart.count === 1 ? 'item' : 'items'})</h3>
      {#if cart.items.length === 0}
        <p class="empty">Empty.</p>
      {:else}
        <ul>
          {#each cart.items as it (it.id)}
            <li>
              <span>{it.name} × {it.qty}</span>
              <span>\${(it.price * it.qty).toFixed(2)}</span>
              <button type="button" onclick={() => cart.remove(it.id)}>×</button>
            </li>
          {/each}
        </ul>
        <p class="total">Total: <strong>\${cart.total.toFixed(2)}</strong></p>
        <button type="button" onclick={cart.clear}>Clear cart</button>
      {/if}
    </div>
  </section>

  <section>
    <h2>Getter-function style</h2>
    <p>
      If you prefer free-standing <code>let</code>s over a
      class, export <em>getter functions</em>. Getters are
      called every time the value is read, preserving
      reactivity. Plain <code>export const value</code> would
      freeze a snapshot at import time — <strong>not</strong>
      what you want.
    </p>
    <pre>{'// preferences.svelte.ts\\nlet darkMode = $state(false);\\nlet fontSize = $state(16);\\n\\n// Export an object of getters + mutators.\\nexport const preferences = {\\n  get darkMode() { return darkMode; },\\n  get fontSize() { return fontSize; },\\n  toggleDark() { darkMode = !darkMode; },\\n  setFontSize(n) {\\n    fontSize = Math.max(10, Math.min(32, n));\\n  }\\n};'}</pre>

    <div class="prefs">
      <label>
        <input
          type="checkbox"
          checked={preferences.darkMode}
          onchange={() => preferences.toggleDark()}
        />
        Dark mode
      </label>
      <label>
        Font size: {preferences.fontSize}px
        <input
          type="range"
          min="10"
          max="32"
          value={preferences.fontSize}
          oninput={(e) => preferences.setFontSize(Number(e.currentTarget.value))}
        />
      </label>
    </div>
  </section>

  <section class="warn">
    <h2>Why not Svelte 4 stores?</h2>
    <p>
      Stores (<code>writable</code>, <code>readable</code>,
      <code>derived</code> from <code>svelte/store</code>)
      still work — but for new code in Svelte 5, the class +
      <code>$state</code> pattern is simpler, more typed, and
      interoperates directly with the rest of your reactive
      code. You don't need the <code>$</code> prefix to
      auto-subscribe; you just read a property.
    </p>
    <p>
      Stores remain useful for three things:
    </p>
    <ul>
      <li>Backwards compatibility with Svelte 4 libraries.</li>
      <li>Consuming RxJS-style observables via <code>readable</code>.</li>
      <li>Async values that you want to subscribe to imperatively.</li>
    </ul>
  </section>

  <section class="warn">
    <h2>SSR safety</h2>
    <p>
      On the server, every request runs in the same Node
      process with the <strong>same module cache</strong>. If
      you store user-specific data in a module, it will be
      visible to the next request.
    </p>
    <p>
      <strong>Safe module state:</strong> feature flags,
      static config, cached lookup tables, localisation.<br />
      <strong>Not safe:</strong> current user, cart, JWT,
      anything per-request. Use <em>context</em> for those —
      it's instance-scoped.
    </p>
  </section>

  <section class="pitfalls">
    <h2>Common Pitfalls & Pro Tips</h2>
    <ul class="pitfall-list">
      <li>
        <strong>SSR leak: module state is shared across users</strong>
        On the server the module cache is global — per-request data in a module will leak to the next visitor.
      </li>
      <li>
        <strong>Export a class instance, not a raw $state</strong>
        A class with <code>$state</code> fields gives you a stable reference; consumers read <code>store.value</code> and stay reactive.
      </li>
      <li>
        <strong>The getter pattern is the other acceptable style</strong>
        <code>export const count = &#123; get value() &#123; return n &#125; &#125;</code> works when you don't want a class.
      </li>
      <li>
        <strong>Never export $state directly</strong>
        Writing <code>export const x = $state(0)</code> breaks when the importer destructures or re-binds — the reactive link is lost.
      </li>
      <li>
        <strong>File extension matters</strong>
        Runes only work in <code>.svelte.ts</code> / <code>.svelte.js</code> files — the compiler ignores them in plain <code>.ts</code>.
      </li>
      <li>
        <strong>Prefer context for per-request state</strong>
        When SSR safety matters, set state via <code>setContext</code> in the root layout so each request gets a fresh instance.
      </li>
    </ul>
  </section>
</main>

<style>
  main {
    max-width: 760px;
    margin: 0 auto;
    padding: 1.25rem;
    font-family: system-ui, sans-serif;
    transition: background 0.2s, color 0.2s;
  }
  main.dark { background: #0f172a; color: #e2e8f0; }
  main.dark section { background: #1e293b; border-color: #334155; }
  main.dark pre { background: #020617; }
  section {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }
  section.warn { background: #fef3c7; border-color: #f59e0b; }
  main.dark section.warn { background: #451a03; border-color: #b45309; color: #fde68a; }
  h1, h2, h3 { margin: 0 0 0.5rem; }
  h2 { font-size: 1rem; }
  h3 { font-size: 0.95rem; }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    overflow-x: auto;
    white-space: pre;
  }
  .catalog {
    display: flex; flex-wrap: wrap; gap: 0.4rem;
    margin-bottom: 0.75rem;
  }
  button {
    padding: 0.45rem 0.9rem;
    border: 1px solid #6690ff;
    background: #6690ff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .cart {
    padding: 0.75rem 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }
  main.dark .cart { background: #020617; border-color: #334155; }
  .cart ul { list-style: none; padding: 0; margin: 0.5rem 0; }
  .cart li {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.3rem 0;
    border-bottom: 1px dashed #e5e7eb;
    font-size: 0.9rem;
  }
  .cart li span:first-child { flex: 1; }
  .cart li button {
    padding: 0.1rem 0.5rem;
    background: #dc2626;
    border-color: #dc2626;
    font-size: 0.75rem;
  }
  .total { font-size: 1.1rem; margin: 0.5rem 0; }
  .empty { color: #9ca3af; font-style: italic; }
  .prefs { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem; }
  .prefs label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
  .prefs input[type="range"] { flex: 1; }
  code {
    background: #f3f4f6;
    padding: 0 0.3rem;
    border-radius: 3px;
    font-size: 0.85em;
  }
  main.dark code { background: #334155; }
  ul { padding-left: 1.2rem; font-size: 0.9rem; }
  li { margin: 0.3rem 0; }
  .pitfalls { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.25rem; margin-top: 1.5rem; }
  .pitfalls h2 { color: #78350f; margin: 0 0 0.5rem; font-size: 1rem; }
  .pitfall-list { list-style: none; padding: 0; margin: 0; }
  .pitfall-list li { padding: 0.4rem 0; border-bottom: 1px dashed #fbbf24; font-size: 0.85rem; color: #78350f; }
  .pitfall-list li:last-child { border-bottom: none; }
  .pitfall-list strong { display: block; color: #92400e; margin-bottom: 0.15rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
