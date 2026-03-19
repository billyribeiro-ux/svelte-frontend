import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-5',
		title: 'When NOT to Use $effect',
		phase: 2,
		module: 6,
		lessonIndex: 5
	},
	description: `$effect is an escape hatch, not a default tool. The most common Svelte mistake is using $effect to set state when $derived would do the job better.

If you're reading state inside $effect and writing to another $state, you almost certainly want $derived instead. Effects that set state create indirect data flows that are harder to trace and can cause unnecessary re-renders.

Think of it this way: if you're computing a value from other values, use $derived. Only reach for $effect when you're interacting with something outside Svelte's reactive system (the DOM, localStorage, network, timers).`,
	objectives: [
		'Identify the anti-pattern: setting $state inside $effect to sync values',
		'Refactor $effect + $state into $derived for computed values',
		'Know the rule: $derived for computation, $effect for external side effects'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ========================================
  // ANTI-PATTERN: setting state in $effect
  // ========================================
  let firstName_bad = $state('John');
  let lastName_bad = $state('Doe');
  let fullName_bad = $state('');

  // DON'T DO THIS! Setting state inside $effect
  $effect(() => {
    fullName_bad = firstName_bad + ' ' + lastName_bad;
  });

  // ========================================
  // CORRECT: use $derived instead
  // ========================================
  let firstName = $state('John');
  let lastName = $state('Doe');

  // This is cleaner, faster, and more predictable
  let fullName = $derived(firstName + ' ' + lastName);

  // ========================================
  // Another anti-pattern: filtering in $effect
  // ========================================
  let items = $state(['apple', 'banana', 'avocado', 'blueberry', 'cherry']);
  let search = $state('');

  // DON'T: filter list via effect
  let filteredBad = $state([]);
  $effect(() => {
    filteredBad = items.filter(i => i.includes(search.toLowerCase()));
  });

  // DO: filter list via $derived
  let filtered = $derived(
    items.filter(i => i.includes(search.toLowerCase()))
  );

  // ========================================
  // VALID $effect use: external side effect
  // ========================================
  let color = $state('#4f46e5');

  // This IS a valid effect — it touches the DOM (external world)
  $effect(() => {
    document.body.style.setProperty('--accent', color);
    // cleanup
    return () => {
      document.body.style.removeProperty('--accent');
    };
  });
</script>

<h1>When NOT to Use $effect</h1>

<div class="comparison">
  <div class="panel bad">
    <h2>Anti-Pattern</h2>
    <pre>
// Setting $state inside $effect
let fullName = $state('');
$effect(() => {'{'}
  fullName = first + ' ' + last;
{'}'});
    </pre>
    <div class="demo">
      <input bind:value={firstName_bad} />
      <input bind:value={lastName_bad} />
      <p>Result: {fullName_bad}</p>
    </div>
    <p class="verdict">Works but creates an unnecessary re-render cycle. The value is briefly wrong before the effect runs.</p>
  </div>

  <div class="panel good">
    <h2>Correct</h2>
    <pre>
// Just use $derived!
let fullName = $derived(
  first + ' ' + last
);
    </pre>
    <div class="demo">
      <input bind:value={firstName} />
      <input bind:value={lastName} />
      <p>Result: {fullName}</p>
    </div>
    <p class="verdict">Cleaner, synchronous, no extra re-render. The value is always correct.</p>
  </div>
</div>

<section>
  <h2>Filtering: $effect vs $derived</h2>
  <input bind:value={search} placeholder="Search fruits..." class="search" />

  <div class="comparison">
    <div class="panel bad">
      <h3>$effect + $state (don't)</h3>
      <ul>
        {#each filteredBad as item}
          <li>{item}</li>
        {:else}
          <li class="empty">No matches</li>
        {/each}
      </ul>
    </div>
    <div class="panel good">
      <h3>$derived (do this!)</h3>
      <ul>
        {#each filtered as item}
          <li>{item}</li>
        {:else}
          <li class="empty">No matches</li>
        {/each}
      </ul>
    </div>
  </div>
</section>

<section>
  <h2>Valid $effect: Touching the DOM</h2>
  <label>
    Accent color: <input type="color" bind:value={color} />
  </label>
  <p>This sets a CSS custom property on <code>document.body</code> — a real side effect that $derived cannot do.</p>
  <div class="color-demo" style="color: {color}; border-color: {color};">
    This text uses the accent color: {color}
  </div>
</section>

<div class="rule">
  <strong>The Rule:</strong> If you're computing a value → $derived. If you're doing something external → $effect.
</div>

<style>
  h1 { color: #333; }
  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
  }
  .panel {
    padding: 1rem;
    border-radius: 8px;
    border: 2px solid;
  }
  .bad { border-color: #ef4444; background: #fef2f2; }
  .good { border-color: #22c55e; background: #f0fdf4; }
  .panel h2, .panel h3 { margin: 0 0 0.5rem; }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre;
  }
  .demo { margin: 0.5rem 0; }
  .demo input {
    display: block;
    margin: 0.25rem 0;
    padding: 0.3rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .verdict { font-size: 0.85rem; color: #555; margin: 0.5rem 0 0; }
  section { margin: 1.5rem 0; }
  .search {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-sizing: border-box;
  }
  ul { list-style: none; padding: 0; margin: 0.5rem 0; }
  li { padding: 0.3rem 0; }
  .empty { color: #999; font-style: italic; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .color-demo {
    margin-top: 0.5rem;
    padding: 0.75rem;
    border: 2px solid;
    border-radius: 6px;
    font-weight: bold;
  }
  .rule {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1.5rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
