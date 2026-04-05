import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-3',
		title: 'Function Bindings (Since 5.9)',
		phase: 3,
		module: 9,
		lessonIndex: 3
	},
	description: `Svelte 5.9 introduced function bindings — a way to hook into both sides of a two-way binding so you can transform data as it flows in or out. Instead of a plain variable, \`bind:value\` accepts a \`[getter, setter]\` pair:

\`\`\`svelte
<input bind:value={
  () => display,
  (v) => display = transform(v)
} />
\`\`\`

Every keystroke calls the setter, every render calls the getter. This lets you build masked inputs, auto-formatters, and clamped fields with a single source of truth — no duplicate "raw" and "normalised" copies in state.

This lesson builds six real examples: auto-trim, auto-lowercase, a phone mask, a currency mask that stores cents as an integer, a clamped number, and a "hidden prefix" tag input. Each one is something you'd ordinarily write five lines of event handling for — function bindings collapse it into three.

The end of the lesson lists 4-6 common pitfalls and pro tips to help you avoid the traps students most often hit.`,
	objectives: [
		'Understand the [getter, setter] form of bind:value introduced in Svelte 5.9',
		'Trim and lowercase input values at the binding boundary',
		'Build masked inputs (phone, currency) that store a clean value internally',
		'Clamp numeric input into a valid range using the setter',
		'Show a transformed display (e.g. hidden prefix) while storing the canonical form',
		'Compare function bindings with the older $derived + oninput pattern'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Function bindings (Svelte 5.9+)
  // ============================================================
  //
  // A normal binding takes a single variable:
  //
  //   <input bind:value={name} />
  //
  // A function binding takes a [getter, setter] pair, letting
  // you transform the value as it flows in either direction:
  //
  //   <input bind:value={
  //     () => display,                // read: what to show in the input
  //     (v) => display = transform(v) // write: where the typed value goes
  //   } />
  //
  // Use it for:
  //   - normalising input (trim, lowercase, strip punctuation)
  //   - masked inputs (phone, credit card, currency)
  //   - clamping numbers into a valid range
  //   - storing one shape but showing another
  //
  // The alternative is a $derived + oninput pair, which is
  // more verbose and easy to get wrong.

  // --- Auto-trim ----------------------------------------------
  let username: string = $state('');

  // --- Auto-lowercase email -----------------------------------
  let email: string = $state('');

  // --- Phone number mask --------------------------------------
  // Stored as raw digits, displayed as (xxx) xxx-xxxx
  let phoneDigits: string = $state('');

  function formatPhone(digits: string): string {
    const d = digits.slice(0, 10);
    if (d.length === 0) return '';
    if (d.length <= 3) return '(' + d;
    if (d.length <= 6) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }

  // --- Currency mask ------------------------------------------
  // Stored as a number of cents (integer avoids float issues),
  // displayed as $1,234.56
  let priceCents: number = $state(0);

  function formatCurrency(cents: number): string {
    const dollars = cents / 100;
    return dollars.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  }

  function parseCurrency(display: string): number {
    // Strip anything that isn't a digit, then treat as cents.
    const digits = display.replace(/[^\\d]/g, '');
    return digits === '' ? 0 : parseInt(digits, 10);
  }

  // --- Clamped number -----------------------------------------
  let clamped: number = $state(50);

  // --- Tag input with # prefix --------------------------------
  let tag: string = $state('#svelte');

  // --- Traditional binding for comparison ---------------------
  let raw: string = $state('');

  const comparisonSnippet = \`// $derived approach — two pieces of state + handler:
let raw = $state('');
const trimmed = $derived(raw.trim());
<input
  value={raw}
  oninput={(e) => raw = e.currentTarget.value}
/>
// ...and "trimmed" is read-only, separate from "raw".

// Function binding — ONE state, transform at the edge:
let username = $state('');
<input bind:value={
  () => username,
  (v) => username = v.trim()
} />\`;
</script>

<main>
  <h1>Function Bindings</h1>
  <p class="lede">
    Since Svelte 5.9, <code>bind:value</code> accepts a
    <code>[getter, setter]</code> pair instead of a plain
    variable. Every keystroke passes through the setter —
    the perfect place to trim, mask, or clamp.
  </p>

  <div class="grid">
    <section>
      <h2>Plain binding (for comparison)</h2>
      <input type="text" bind:value={raw} placeholder="Type anything..." />
      <p class="echo">Stored: <code>"{raw}"</code></p>
      <p class="hint">
        No transformation — whatever you type is what you get.
      </p>
    </section>

    <section>
      <h2>Auto-trim</h2>
      <input
        type="text"
        placeholder="Try pasting '   hello   '"
        bind:value={
          () => username,
          (v: string) => (username = v.trim())
        }
      />
      <p class="echo">Stored: <code>"{username}"</code> ({username.length} chars)</p>
      <p class="hint">
        Leading/trailing whitespace is stripped on every keystroke.
      </p>
    </section>

    <section>
      <h2>Auto-lowercase email</h2>
      <input
        type="email"
        placeholder="ADA@Example.COM"
        bind:value={
          () => email,
          (v: string) => (email = v.toLowerCase())
        }
      />
      <p class="echo">Stored: <code>"{email}"</code></p>
      <p class="hint">
        Typing in caps is fine — the setter normalises everything
        to lowercase before it lands in state.
      </p>
    </section>

    <section>
      <h2>Phone number mask</h2>
      <input
        type="tel"
        placeholder="(555) 123-4567"
        bind:value={
          () => formatPhone(phoneDigits),
          (v: string) => (phoneDigits = v.replace(/[^\\d]/g, '').slice(0, 10))
        }
      />
      <p class="echo">
        Display: <code>"{formatPhone(phoneDigits)}"</code><br />
        Stored: <code>"{phoneDigits}"</code>
      </p>
      <p class="hint">
        The bound value shows the formatted version; the stored
        state is the raw 10-digit string.
      </p>
    </section>

    <section>
      <h2>Currency mask</h2>
      <input
        type="text"
        placeholder="$0.00"
        bind:value={
          () => formatCurrency(priceCents),
          (v: string) => (priceCents = parseCurrency(v))
        }
      />
      <p class="echo">
        Display: <code>"{formatCurrency(priceCents)}"</code><br />
        Stored: <code>{priceCents}</code> cents
      </p>
      <p class="hint">
        Stored as an integer number of cents (no floats), shown
        as a locale-formatted currency string.
      </p>
    </section>

    <section>
      <h2>Clamped number (0–100)</h2>
      <input
        type="number"
        bind:value={
          () => clamped,
          (v: number) => (clamped = Math.max(0, Math.min(100, v ?? 0)))
        }
      />
      <p class="echo">Stored: <code>{clamped}</code></p>
      <div class="bar"><div class="bar-fill" style="width: {clamped}%;"></div></div>
      <p class="hint">
        Try typing <code>999</code> or <code>-50</code> — the
        setter clamps instantly.
      </p>
    </section>

    <section>
      <h2>Hidden # prefix</h2>
      <input
        type="text"
        placeholder="svelte"
        bind:value={
          () => tag.replace(/^#/, ''),
          (v: string) => (tag = '#' + v.replace(/^#+/, ''))
        }
      />
      <p class="echo">Stored: <code>"{tag}"</code></p>
      <p class="hint">
        The input shows the tag without its <code>#</code>;
        the stored value always has one.
      </p>
    </section>

    <section class="vs-derived">
      <h2>Why not just use $derived?</h2>
      <pre>{comparisonSnippet}</pre>
      <p class="hint">
        Function bindings keep a single source of truth. You
        don't accumulate "raw" + "normalised" copies in state.
      </p>
    </section>

    <section class="pitfalls">
      <h2>Common Pitfalls & Pro Tips</h2>
      <ul class="pitfall-list">
        <li>
          <strong>The setter must actually assign</strong>
          Returning a value from the setter does nothing — you must write <code>x = newValue</code> inside the body.
        </li>
        <li>
          <strong>The getter runs on every keystroke</strong>
          Keep it cheap — no heavy formatting, regex replacement only as needed, because it runs every render.
        </li>
        <li>
          <strong>Not a replacement for $derived</strong>
          Function bindings are for two-way data transformation, not pure computation — use <code>$derived</code> for read-only values.
        </li>
        <li>
          <strong>Can't be used with bind:group or bind:files</strong>
          Those bindings don't accept the <code>[getter, setter]</code> form — you need manual change handlers instead.
        </li>
        <li>
          <strong>Validate in the setter, not the getter</strong>
          Rejecting or clamping input belongs in the write path so stored state is always canonical.
        </li>
        <li>
          <strong>Returning without assigning silently drops input</strong>
          A forgotten assignment looks correct but the field never updates — watch for this in copy-pasted snippets.
        </li>
      </ul>
    </section>
  </div>
</main>

<style>
  main { max-width: 820px; margin: 0 auto; padding: 1.25rem; font-family: system-ui, sans-serif; }
  h1 { margin-top: 0; }
  .lede { color: #555; margin-bottom: 1.25rem; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1rem;
  }
  section {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-left: 3px solid #6690ff;
    border-radius: 8px;
    background: #fff;
  }
  h2 { margin: 0 0 0.5rem; font-size: 1rem; }
  input {
    width: 100%;
    padding: 0.5rem 0.6rem;
    font-size: 0.95rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    box-sizing: border-box;
    font-family: inherit;
  }
  .echo { margin: 0.5rem 0 0.25rem; font-size: 0.85rem; }
  .hint { font-size: 0.75rem; color: #6b7280; margin: 0.25rem 0 0; }
  code {
    background: #f3f4f6;
    padding: 0.05rem 0.3rem;
    border-radius: 3px;
    font-size: 0.85em;
  }
  .bar {
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
    margin: 0.5rem 0;
  }
  .bar-fill {
    height: 100%;
    background: #6690ff;
    transition: width 0.1s;
  }
  .vs-derived { grid-column: 1 / -1; background: #f0fdf4; border-left-color: #22c55e; }
  pre { background: #0f172a; color: #e2e8f0; padding: 0.75rem; border-radius: 4px; font-size: 0.75rem; overflow-x: auto; }
  .pitfalls { grid-column: 1 / -1; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.25rem; margin-top: 1.5rem; }
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
