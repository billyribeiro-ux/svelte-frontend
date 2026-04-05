import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-7',
		title: 'The this Keyword',
		phase: 3,
		module: 9,
		lessonIndex: 7
	},
	description: `JavaScript's \`this\` keyword is determined by **how** a function is called, not where it was defined. That makes it one of the top sources of bugs when you pass object methods directly as event handlers:

\`\`\`svelte
const counter = { count: 0, increment() { this.count++; } };
<button onclick={counter.increment}>+</button>
\`\`\`

At click time the browser calls the function with no receiver, so \`this\` is \`undefined\` (strict mode) and \`this.count++\` throws. There are three fixes, in increasing order of cleanliness:

1. **Wrap in an arrow function** — \`onclick={() => counter.increment()}\`. Simple, local, no ceremony.
2. **Bind the method at creation** — \`counter.increment = counter.increment.bind(counter)\`.
3. **Use a class with arrow-field methods** — \`increment = () => { this.count++; };\`. The method captures \`this\` once, forever, and can be passed around as a plain function.

This lesson shows the failure and each fix with runnable demos, then pivots to the unrelated \`bind:this\` directive — which has nothing to do with JS \`this\` and everything to do with getting a raw DOM element reference so you can call imperative APIs like \`.focus()\`, \`.showModal()\`, or \`.play()\`.`,
	objectives: [
		'Understand why onclick={obj.method} loses its this context',
		'Fix broken this binding by wrapping the call in an arrow function',
		'Build classes with arrow-field methods so they can be passed around safely',
		'Know that bind:this is unrelated to JavaScript this — it returns a DOM element',
		'Use bind:this to call imperative DOM APIs like focus() and HTMLDialogElement.showModal()'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // JavaScript's "this" keyword in Svelte handlers
  // ============================================================
  //
  // JavaScript's \`this\` is determined by HOW a function is called,
  // not where it was defined. That catches everyone at some
  // point when passing object methods as event handlers:
  //
  //   const counter = {
  //     count: 0,
  //     increment() { this.count++; }
  //   };
  //
  //   <button onclick={counter.increment}>+</button>
  //
  // When the button is clicked, \`counter.increment\` is called
  // as a bare function — not as a method on \`counter\`. In
  // strict mode (which modules use), \`this\` is \`undefined\`,
  // and \`this.count++\` throws "Cannot read properties of
  // undefined".
  //
  // There are three fixes:
  //
  //   1. Wrap in an arrow function: onclick={() => counter.increment()}
  //   2. Bind the method at creation: increment = counter.increment.bind(counter)
  //   3. Use a class with arrow fields: increment = () => { this.count++ }
  //
  // The simplest and most idiomatic in Svelte 5 is #1.
  //
  // This lesson demonstrates each failure and fix, and also
  // covers bind:this — a different meaning of "this" that
  // gives you a DOM element reference.

  // --- Plain object with a method ----------------------------
  const counter = {
    count: 0,
    label: 'Counter',

    increment() {
      // This looks fine... but "this" depends on the caller.
      // @ts-expect-error intentionally showing the breakage
      this.count++;
    },

    describe() {
      // @ts-expect-error intentionally showing the breakage
      return this.label + ': ' + this.count;
    }
  };

  // Svelte 5 idiomatic: a $state-backed class with bound methods.
  class Counter {
    count = $state(0);
    label: string;

    constructor(label: string) {
      this.label = label;
    }

    // Arrow property — "this" is captured once at construction.
    // Safe to pass directly as an event handler.
    increment = () => {
      this.count++;
    };

    // Regular method — "this" depends on the call site.
    // Passing \`decrement\` directly to onclick would break.
    decrement() {
      this.count--;
    }

    reset = () => {
      this.count = 0;
    };
  }

  const safeCounter = new Counter('Safe counter');

  // --- bind:this references ---------------------------------
  let inputEl: HTMLInputElement | null = $state(null);
  let dialogEl: HTMLDialogElement | null = $state(null);

  function focusInput() {
    inputEl?.focus();
    inputEl?.select();
  }

  function openDialog() {
    dialogEl?.showModal();
  }

  function closeDialog() {
    dialogEl?.close();
  }

  // --- Demonstrating the breakage safely --------------------
  // We keep this around but wrap calls in try/catch so the
  // lesson doesn't crash.
  let lastError: string = $state('');
  function tryBrokenCall() {
    try {
      const loose = counter.increment;
      loose(); // "this" is undefined here → throws
      lastError = 'No error (surprising!)';
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }
</script>

<main>
  <h1>The <code>this</code> Keyword</h1>
  <p class="lede">
    JavaScript's <code>this</code> is decided by the caller,
    not the definition. That trips up everyone writing event
    handlers. Here are the patterns that work — and a
    different <code>this</code>, <code>bind:this</code>, that
    hands you a DOM element.
  </p>

  <section class="broken">
    <h2>1. The classic breakage</h2>
    <p>
      This object has a method that uses <code>this.count</code>.
      Passing it directly to <code>onclick</code> detaches it
      from the object, and the call throws.
    </p>
    <pre>{'// Svelte markup:\\n<button onclick={counter.increment}>+</button>\\n\\n// What actually happens at click time:\\nconst fn = counter.increment;\\nfn(); // <-- this is undefined, this.count throws'}</pre>

    <button type="button" onclick={tryBrokenCall}>
      Simulate the broken call
    </button>
    {#if lastError}
      <p class="error">Threw: <code>{lastError}</code></p>
    {/if}
  </section>

  <section class="fixed">
    <h2>2. Fix A — wrap in an arrow function</h2>
    <p>
      An arrow function doesn't change <code>this</code>, but
      here we aren't relying on it: we're calling
      <code>counter.increment()</code> as a method, so the
      receiver is the object itself.
    </p>
    <pre>{'<button onclick={() => counter.increment()}>+</button>'}</pre>
    <button type="button" onclick={() => counter.increment()}>
      counter.increment() → {counter.count}
    </button>
    <p class="hint">
      This is by far the most common fix in Svelte 5 code —
      short, obvious, and you never have to think about
      <code>this</code> again.
    </p>
  </section>

  <section class="fixed">
    <h2>3. Fix B — a class with arrow-field methods</h2>
    <p>
      Class fields initialised to arrow functions capture
      <code>this</code> at construction time, so the method
      can be passed around as a plain function forever after.
    </p>
    <pre>{'class Counter {\\n  count = $state(0);\\n  increment = () => { this.count++; };\\n}'}</pre>
    <div class="buttons">
      <button type="button" onclick={safeCounter.increment}>+</button>
      <span class="count">{safeCounter.count}</span>
      <button type="button" onclick={safeCounter.reset}>reset</button>
    </div>
    <p class="hint">
      Notice <code>onclick={'{safeCounter.increment}'}</code>
      — no arrow wrapper, no <code>bind()</code>. Works because
      <code>increment</code> is defined as an arrow field.
    </p>
  </section>

  <section class="bind-this">
    <h2>4. A different <code>this</code>: <code>bind:this</code></h2>
    <p>
      <code>bind:this</code> has nothing to do with JS
      <code>this</code>. It populates a variable with the
      actual DOM node, letting you call imperative APIs.
    </p>
    <input
      bind:this={inputEl}
      type="text"
      placeholder="I can be focused from a button"
    />
    <button type="button" onclick={focusInput}>Focus the input</button>

    <hr />

    <dialog bind:this={dialogEl}>
      <p>Hello from a &lt;dialog&gt;!</p>
      <button type="button" onclick={closeDialog}>Close</button>
    </dialog>
    <button type="button" onclick={openDialog}>Open dialog</button>
    <p class="hint">
      The native <code>&lt;dialog&gt;</code> element has no
      declarative "open" prop for modals — you call
      <code>.showModal()</code> on it. <code>bind:this</code>
      is the only way to reach that API.
    </p>
  </section>

  <section class="summary">
    <h2>Summary</h2>
    <ul>
      <li>
        <strong>Passing object methods as handlers breaks
        <code>this</code>.</strong> Either wrap in an arrow,
        bind at creation, or use an arrow class field.
      </li>
      <li>
        <strong>Arrow class fields are the cleanest pattern</strong>
        when you want a reusable stateful object whose methods
        can be passed around.
      </li>
      <li>
        <strong><code>bind:this</code> is unrelated to JS
        <code>this</code>.</strong> It gives you a direct
        reference to a DOM element so you can call imperative
        APIs like <code>.focus()</code>, <code>.showModal()</code>,
        or <code>.play()</code>.
      </li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 780px; margin: 0 auto; padding: 1.25rem; font-family: system-ui, sans-serif; }
  h1 { margin-top: 0; }
  .lede { color: #555; }
  section {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }
  section.broken { background: #fef2f2; border-color: #fecaca; }
  section.fixed { background: #f0fdf4; border-color: #bbf7d0; }
  section.bind-this { background: #eff6ff; border-color: #bfdbfe; }
  h2 { margin: 0 0 0.6rem; font-size: 1rem; }
  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.78rem;
    overflow-x: auto;
    white-space: pre-wrap;
  }
  button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    border: 1px solid #6690ff;
    background: #6690ff;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 0.4rem;
  }
  .error {
    font-size: 0.85rem;
    color: #b91c1c;
    margin: 0.5rem 0 0;
  }
  .buttons { display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0; }
  .count { font-size: 1.5rem; font-weight: 700; min-width: 2.5rem; text-align: center; }
  .hint {
    font-size: 0.78rem;
    color: #6b7280;
    margin-top: 0.5rem;
  }
  input[type="text"] {
    width: 100%;
    padding: 0.5rem 0.65rem;
    font-size: 0.95rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    box-sizing: border-box;
    margin-bottom: 0.5rem;
  }
  dialog {
    padding: 1.5rem;
    border: none;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  }
  dialog::backdrop { background: rgba(0,0,0,0.5); }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0; }
  code {
    background: #f3f4f6;
    padding: 0 0.3rem;
    border-radius: 3px;
    font-size: 0.85em;
  }
  .summary ul { padding-left: 1.2rem; font-size: 0.88rem; }
  .summary li { margin: 0.3rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
