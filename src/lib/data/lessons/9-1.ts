import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-1',
		title: 'Two-Way Binding: bind:value',
		phase: 3,
		module: 9,
		lessonIndex: 1
	},
	description: `In Svelte, data normally flows one way: from parent to child via props. Form inputs need the opposite — as the user types, drags, or picks, the state needs to flow back up. The \`bind:value\` directive is Svelte's answer. It creates a two-way binding: when the user changes the input, the variable updates; when the variable changes, the input reflects it. Either direction just works.

Under the hood \`bind:value={x}\` is sugar for \`value={x}\` plus an \`oninput\` handler that writes the new value back to \`x\`. Svelte picks the right event and the right coercion automatically — \`<input type="number">\` gives you a real \`number\` (or \`null\` when empty), \`<input type="range">\` gives you a \`number\`, \`<input type="date">\` gives you a \`YYYY-MM-DD\` string, \`<input type="color">\` gives you an \`#rrggbb\` string, and \`<textarea>\` gives you a plain \`string\`.

This lesson walks through every common input type, shows how \`$derived\` pairs naturally with bound values to build live previews and filtered lists, and calls out the pitfalls that trip people up — especially the \`null\` from empty number inputs and the string-not-Date surprise from date inputs.`,
	objectives: [
		'Understand that bind:value is sugar for value={x} plus an oninput handler',
		'Use bind:value on text, number, textarea, range, color, date, and time inputs',
		'Know that empty number inputs produce null (not NaN) and date inputs produce strings',
		'Pair bound values with $derived to build live previews, counters, and filters',
		'Bind two inputs (e.g. a number and a range) to the same variable to keep them in sync',
		'Reset a form by writing to the bound variables directly'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // bind:value — the foundation of two-way binding in Svelte 5
  // ============================================================
  //
  // Without bind:, you'd have to write:
  //   <input value={name} oninput={(e) => name = e.currentTarget.value} />
  //
  // With bind:value, Svelte generates that wiring for you and
  // keeps the variable and the DOM element in perfect sync.
  //
  // bind:value works on every input type (text, number, range,
  // color, date, email, url, password, search, tel, time, ...)
  // plus <textarea> and <select>. Svelte picks the right
  // coercion automatically — number inputs give you numbers,
  // date inputs give you strings in YYYY-MM-DD format, etc.

  // --- Text inputs --------------------------------------------
  let name: string = $state('Ada Lovelace');
  let search: string = $state('');

  // --- Number inputs ------------------------------------------
  // When the input is empty Svelte sets the value to null, not
  // NaN, so a \`number | null\` type is often the honest choice.
  let age: number | null = $state(30);
  let score: number = $state(75);

  // --- Textarea -----------------------------------------------
  let bio: string = $state('Write something about yourself...');

  // --- Range --------------------------------------------------
  // Range inputs coerce to numbers automatically.
  let volume: number = $state(50);
  let hue: number = $state(200);

  // --- Color --------------------------------------------------
  // Color inputs are always strings in #rrggbb form.
  let accent: string = $state('#6690ff');

  // --- Date / Time --------------------------------------------
  // Date inputs bind to YYYY-MM-DD strings, not Date objects.
  // If you need a real Date, derive it.
  let birthday: string = $state('2000-01-01');
  let meetingTime: string = $state('09:30');

  // --- Derived preview values ---------------------------------
  // $derived recomputes automatically whenever any dependency
  // changes — the perfect partner for live form previews.
  const wordCount = $derived(
    bio.trim() === '' ? 0 : bio.trim().split(/\\s+/).length
  );
  const charCount = $derived(bio.length);

  const birthDate = $derived(new Date(birthday));
  // $derived.by takes a function — use it when the logic
  // needs more than a single expression.
  const yearsOld = $derived.by(() => {
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      years--;
    }
    return years;
  });

  // Lowercased copy of the search string — shows how bind:value
  // plays nicely with $derived for filtered lists.
  const fruit = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape'];
  const filtered = $derived(
    search.trim() === ''
      ? fruit
      : fruit.filter((f) => f.toLowerCase().includes(search.toLowerCase()))
  );

  // Reset button demonstrates the "other direction" of the
  // binding — writing to the variable updates the input.
  function reset() {
    name = '';
    age = null;
    bio = '';
    volume = 50;
    hue = 200;
    accent = '#6690ff';
    birthday = '2000-01-01';
    meetingTime = '09:30';
    search = '';
    score = 75;
  }
</script>

<main style="--accent: {accent}; --hue: {hue};">
  <h1>Two-Way Binding: bind:value</h1>
  <p class="lede">
    Type, drag, pick — every input is wired straight into a
    <code>$state</code> variable. The preview column updates
    on every keystroke.
  </p>

  <div class="grid">
    <section>
      <h2>Text</h2>
      <label>
        Name
        <input type="text" bind:value={name} placeholder="Your name" />
      </label>
      <p class="echo">Hello, <strong>{name || '(empty)'}</strong>!</p>
    </section>

    <section>
      <h2>Number</h2>
      <label>
        Age
        <input type="number" bind:value={age} min="0" max="150" />
      </label>
      <p class="echo">
        Stored as <code>{age === null ? 'null' : age}</code>
        (typeof: <em>{age === null ? 'object' : typeof age}</em>)
      </p>
      <p class="hint">
        Empty number inputs bind to <code>null</code>, not
        <code>NaN</code>. Type a value to see it coerce to a
        real <code>number</code>.
      </p>
    </section>

    <section>
      <h2>Textarea + derived counters</h2>
      <label>
        Bio
        <textarea bind:value={bio} rows="4"></textarea>
      </label>
      <p class="echo">
        <strong>{wordCount}</strong> words,
        <strong>{charCount}</strong> characters
      </p>
    </section>

    <section>
      <h2>Range</h2>
      <label>
        Volume: {volume}
        <input type="range" bind:value={volume} min="0" max="100" />
      </label>
      <label>
        Hue: {hue}&deg;
        <input type="range" bind:value={hue} min="0" max="360" />
      </label>
      <div class="swatch" style="background: hsl({hue} 80% 55%);"></div>
    </section>

    <section>
      <h2>Color</h2>
      <label>
        Accent
        <input type="color" bind:value={accent} />
      </label>
      <p class="echo">
        Value: <code>{accent}</code>
      </p>
      <div class="swatch" style="background: {accent};"></div>
    </section>

    <section>
      <h2>Date &amp; Time</h2>
      <label>
        Birthday
        <input type="date" bind:value={birthday} />
      </label>
      <label>
        Meeting
        <input type="time" bind:value={meetingTime} />
      </label>
      <p class="echo">
        You are <strong>{yearsOld}</strong> years old, and
        your meeting is at <strong>{meetingTime}</strong>.
      </p>
      <p class="hint">
        Date inputs bind to <code>YYYY-MM-DD</code> strings.
        Convert to a <code>Date</code> in a <code>$derived</code>
        when you need one.
      </p>
    </section>

    <section>
      <h2>Score (number + range together)</h2>
      <p class="hint">
        Two inputs, one variable. Drag the slider or edit the
        number — they stay in sync because they share
        <code>score</code>.
      </p>
      <label>
        <input type="number" bind:value={score} min="0" max="100" />
      </label>
      <label>
        <input type="range" bind:value={score} min="0" max="100" />
      </label>
      <div class="bar"><div class="bar-fill" style="width: {score}%;"></div></div>
    </section>

    <section>
      <h2>Live filter</h2>
      <label>
        Search fruit
        <input type="search" bind:value={search} placeholder="type to filter..." />
      </label>
      <ul>
        {#each filtered as f (f)}
          <li>{f}</li>
        {:else}
          <li class="empty">no matches</li>
        {/each}
      </ul>
    </section>
  </div>

  <div class="actions">
    <button type="button" onclick={reset}>Reset all fields</button>
  </div>

  <section class="pitfalls">
    <h2>Common pitfalls</h2>
    <ul>
      <li>
        <strong>Empty number inputs are <code>null</code>.</strong>
        Use <code>number | null</code> in your types, or guard
        with <code>age ?? 0</code> before doing math.
      </li>
      <li>
        <strong>Date inputs bind to strings.</strong> If you need
        a <code>Date</code>, wrap it in a <code>$derived</code>
        that calls <code>new Date(str)</code>.
      </li>
      <li>
        <strong>bind: is two-way.</strong> Writing to the variable
        updates the DOM and vice versa. Don't also attach an
        <code>oninput</code> that writes to the same variable —
        it's redundant.
      </li>
      <li>
        <strong>Readonly props can't be bound.</strong> If a
        parent passes a plain prop (not <code>$bindable</code>),
        you can't use <code>bind:value</code> on it inside the
        child.
      </li>
    </ul>
  </section>
</main>

<style>
  main {
    max-width: 820px;
    margin: 0 auto;
    padding: 1.25rem;
    font-family: system-ui, sans-serif;
  }
  h1 { margin-top: 0; }
  .lede { color: #555; margin-bottom: 1.25rem; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }
  section {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-left: 3px solid var(--accent, #6690ff);
    border-radius: 8px;
    background: #fff;
  }
  h2 { margin: 0 0 0.5rem; font-size: 1rem; color: #1f2937; }
  label {
    display: block;
    font-size: 0.85rem;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  input[type="text"],
  input[type="number"],
  input[type="search"],
  input[type="date"],
  input[type="time"],
  textarea {
    width: 100%;
    padding: 0.45rem 0.6rem;
    font-size: 0.9rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    box-sizing: border-box;
    margin-top: 0.2rem;
  }
  input[type="range"] { width: 100%; margin-top: 0.2rem; }
  input[type="color"] { width: 3rem; height: 2rem; border: none; padding: 0; }
  .echo { margin: 0.25rem 0; font-size: 0.85rem; color: #1f2937; }
  .hint { font-size: 0.75rem; color: #6b7280; margin: 0.25rem 0 0; }
  .swatch {
    height: 2rem;
    border-radius: 4px;
    border: 1px solid #d1d5db;
    margin-top: 0.4rem;
  }
  .bar {
    height: 0.6rem;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
    margin-top: 0.4rem;
  }
  .bar-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.15s;
  }
  ul { margin: 0.3rem 0 0; padding-left: 1.1rem; font-size: 0.85rem; }
  li.empty { color: #9ca3af; font-style: italic; list-style: none; margin-left: -1rem; }
  .actions { margin: 1rem 0; }
  button {
    padding: 0.55rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    font-size: 0.9rem;
  }
  button:hover { background: #f9fafb; }
  .pitfalls {
    margin-top: 1.25rem;
    background: #fffbeb;
    border-color: #fbbf24;
    border-left-color: #f59e0b;
  }
  .pitfalls h2 { color: #78350f; }
  .pitfalls li { margin: 0.35rem 0; color: #78350f; }
  code {
    background: #f3f4f6;
    padding: 0 0.25rem;
    border-radius: 3px;
    font-size: 0.8em;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
