import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-5',
		title: 'When NOT to Use $effect',
		phase: 2,
		module: 6,
		lessonIndex: 5
	},
	description: `<code>$effect</code> is an **escape hatch**, not a default tool. The most common Svelte 5 mistake is using it to set state when <code>$derived</code> would do the job better.

If you find yourself reading reactive state inside <code>$effect</code> and writing to another <code>$state</code>, you almost certainly want <code>$derived</code> instead. Effects-that-set-state create indirect data flows that are harder to trace, run an extra re-render cycle, and can briefly show stale values before the effect catches up.

Think of it this way: <code>$derived</code> = "this value is computed from those values". <code>$effect</code> = "when those values change, do something outside Svelte". Mixing them produces the anti-patterns below.`,
	objectives: [
		'Identify the anti-pattern: setting $state inside $effect to sync values',
		'Refactor five common anti-patterns into correct $derived form',
		'Know the rule: $derived for computation, $effect for external side effects',
		'Recognise when you DO need an effect (DOM, network, timers, persistence)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // =================================================================
  // ANTI-PATTERN 1: Concatenating strings via $effect
  // =================================================================
  let firstName_bad = $state('Ada');
  let lastName_bad = $state('Lovelace');
  let fullName_bad = $state('');
  $effect(() => {
    fullName_bad = firstName_bad + ' ' + lastName_bad;
  });

  // CORRECT:
  let firstName = $state('Ada');
  let lastName = $state('Lovelace');
  let fullName = $derived(firstName + ' ' + lastName);

  // =================================================================
  // ANTI-PATTERN 2: Filtering an array via $effect
  // =================================================================
  let items = $state(['apple', 'banana', 'avocado', 'blueberry', 'cherry', 'apricot']);
  let search = $state('');

  let filteredBad = $state([]);
  $effect(() => {
    filteredBad = items.filter((i) => i.includes(search.toLowerCase()));
  });

  // CORRECT:
  let filtered = $derived(items.filter((i) => i.includes(search.toLowerCase())));

  // =================================================================
  // ANTI-PATTERN 3: Summing via $effect
  // =================================================================
  let numbers = $state([10, 20, 30, 40]);
  let sumBad = $state(0);
  $effect(() => {
    sumBad = numbers.reduce((s, n) => s + n, 0);
  });

  // CORRECT:
  let sum = $derived(numbers.reduce((s, n) => s + n, 0));

  // =================================================================
  // ANTI-PATTERN 4: Validation flag via $effect
  // =================================================================
  let emailBad = $state('');
  let isValidBad = $state(false);
  $effect(() => {
    isValidBad = /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(emailBad);
  });

  // CORRECT:
  let email = $state('');
  let isValid = $derived(/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email));

  // =================================================================
  // ANTI-PATTERN 5: Syncing two inputs (celsius <-> fahrenheit)
  // Two effects trying to keep each other in sync is a classic disaster.
  // =================================================================
  let celsius_bad = $state(0);
  let fahrenheit_bad = $state(32);
  // WARNING: effects that write each other's inputs risk infinite loops.
  // (Svelte will bail out after too many updates, but the design is wrong.)
  $effect(() => {
    fahrenheit_bad = celsius_bad * 9 / 5 + 32;
  });

  // CORRECT: pick ONE source of truth, derive the other.
  let celsius = $state(0);
  let fahrenheit = $derived(celsius * 9 / 5 + 32);

  // =================================================================
  // VALID $effect: external side effects
  // =================================================================
  let accent = $state('#4f46e5');

  // This IS a valid effect — it touches the DOM (external world).
  $effect(() => {
    document.body.style.setProperty('--accent', accent);
    return () => document.body.style.removeProperty('--accent');
  });
</script>

<h1>When NOT to Use $effect</h1>

<p class="lead">
  Each card below shows a common mistake on the left and the correct <code>$derived</code>
  version on the right. They look identical in the UI — but the right-hand version is
  simpler, faster, and synchronous.
</p>

<section class="case">
  <h2>1. String Concatenation</h2>
  <div class="comparison">
    <div class="panel bad">
      <h3>Anti-pattern: $effect sets $state</h3>
      <pre>let fullName = $state('');
$effect(() =&gt; {'{'}
  fullName = first + ' ' + last;
{'}'});</pre>
      <div class="demo">
        <input bind:value={firstName_bad} />
        <input bind:value={lastName_bad} />
        <p>Result: <strong>{fullName_bad}</strong></p>
      </div>
    </div>
    <div class="panel good">
      <h3>Correct: $derived</h3>
      <pre>let fullName = $derived(
  first + ' ' + last
);</pre>
      <div class="demo">
        <input bind:value={firstName} />
        <input bind:value={lastName} />
        <p>Result: <strong>{fullName}</strong></p>
      </div>
    </div>
  </div>
</section>

<section class="case">
  <h2>2. Filtering a List</h2>
  <input bind:value={search} placeholder="search..." class="search" />
  <div class="comparison">
    <div class="panel bad">
      <h3>Anti-pattern</h3>
      <pre>$effect(() =&gt; {'{'}
  filteredBad = items.filter(...);
{'}'});</pre>
      <ul>
        {#each filteredBad as item (item)}<li>{item}</li>{/each}
      </ul>
    </div>
    <div class="panel good">
      <h3>Correct</h3>
      <pre>let filtered = $derived(
  items.filter(...)
);</pre>
      <ul>
        {#each filtered as item (item)}<li>{item}</li>{/each}
      </ul>
    </div>
  </div>
</section>

<section class="case">
  <h2>3. Aggregation</h2>
  <p class="note">
    Numbers: {numbers.join(' + ')}
  </p>
  <div class="comparison">
    <div class="panel bad">
      <h3>Anti-pattern</h3>
      <pre>$effect(() =&gt; {'{'}
  sumBad = nums.reduce(...);
{'}'});</pre>
      <p>Sum: <strong>{sumBad}</strong></p>
    </div>
    <div class="panel good">
      <h3>Correct</h3>
      <pre>let sum = $derived(
  nums.reduce(...)
);</pre>
      <p>Sum: <strong>{sum}</strong></p>
    </div>
  </div>
</section>

<section class="case">
  <h2>4. Validation Flag</h2>
  <div class="comparison">
    <div class="panel bad">
      <h3>Anti-pattern</h3>
      <input bind:value={emailBad} placeholder="you@example.com" />
      <p class:ok={isValidBad} class:err={!isValidBad}>
        {isValidBad ? 'valid' : 'invalid'}
      </p>
    </div>
    <div class="panel good">
      <h3>Correct</h3>
      <input bind:value={email} placeholder="you@example.com" />
      <p class:ok={isValid} class:err={!isValid}>
        {isValid ? 'valid' : 'invalid'}
      </p>
    </div>
  </div>
</section>

<section class="case">
  <h2>5. Two-Way Sync (Celsius &harr; Fahrenheit)</h2>
  <div class="comparison">
    <div class="panel bad">
      <h3>Anti-pattern: two effects fighting</h3>
      <label>&deg;C <input type="number" bind:value={celsius_bad} /></label>
      <label>&deg;F <input type="number" bind:value={fahrenheit_bad} /></label>
      <p class="warn">Writing to either triggers an effect that writes the other — prone to loops.</p>
    </div>
    <div class="panel good">
      <h3>Correct: one source, one derived</h3>
      <label>&deg;C <input type="number" bind:value={celsius} /></label>
      <p>&deg;F (derived): <strong>{fahrenheit.toFixed(1)}</strong></p>
    </div>
  </div>
</section>

<section class="valid">
  <h2>Valid $effect: Touching the DOM</h2>
  <label>
    Accent color: <input type="color" bind:value={accent} />
  </label>
  <p>
    This sets a CSS custom property on <code>document.body</code> — a real external side
    effect that <code>$derived</code> cannot do.
  </p>
  <div class="color-demo" style="color: {accent}; border-color: {accent};">
    This text uses the accent color: {accent}
  </div>
</section>

<div class="rule">
  <strong>The rule:</strong> If you're <em>computing</em> a value → <code>$derived</code>.
  If you're <em>doing something external</em> → <code>$effect</code>. If in doubt, start
  with <code>$derived</code>. If you end up needing the escape hatch, you'll know.
</div>

<style>
  h1 { color: #333; }
  .lead { color: #555; max-width: 720px; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 10px; }
  section h2 { margin-top: 0; }

  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .panel { padding: 0.75rem; border-radius: 8px; border: 2px solid; background: white; }
  .bad { border-color: #ef4444; background: #fef2f2; }
  .good { border-color: #22c55e; background: #f0fdf4; }
  .panel h3 { margin: 0 0 0.5rem; font-size: 0.95rem; }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.6rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    overflow-x: auto;
    margin: 0 0 0.5rem;
    white-space: pre;
  }
  .demo { margin: 0.25rem 0; }
  .panel input {
    display: block;
    margin: 0.25rem 0;
    padding: 0.3rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  .panel label { display: flex; gap: 0.5rem; align-items: center; margin: 0.25rem 0; font-size: 0.85rem; }
  .panel ul { list-style: none; padding: 0; margin: 0.25rem 0; }
  .panel li { padding: 0.15rem 0; font-size: 0.85rem; }

  .search {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-sizing: border-box;
    margin-bottom: 0.5rem;
  }
  .note { font-size: 0.85rem; color: #666; margin: 0 0 0.5rem; }
  .ok { color: #16a34a; font-weight: bold; }
  .err { color: #dc2626; font-weight: bold; }
  .warn { font-size: 0.75rem; color: #b91c1c; margin: 0.3rem 0 0; }

  .valid { background: #eef2ff; border: 2px solid #4f46e5; }
  .color-demo {
    margin-top: 0.5rem;
    padding: 0.75rem;
    border: 2px solid;
    border-radius: 6px;
    font-weight: bold;
  }

  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  .rule {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1.5rem;
  }

  @media (max-width: 760px) {
    .comparison { grid-template-columns: 1fr; }
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
