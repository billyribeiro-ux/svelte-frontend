import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-7',
		title: 'untrack() & Dependency Control',
		phase: 2,
		module: 6,
		lessonIndex: 7
	},
	description: `By default, <code>$effect</code> and <code>$derived</code> track **every** reactive value you read. Usually that's exactly what you want. But sometimes you want to read a value without **subscribing** to it — read its current value now, without causing a re-run when it changes later.

That's what <code>untrack()</code> does. Import it from <code>'svelte'</code> and wrap any read you want to exclude from dependency tracking. The value inside <code>untrack(() => x)</code> is evaluated normally, but Svelte won't add <code>x</code> to the current effect's dependency list.

Three classic use cases: (1) **logging** — capture the current value of something when another value changes without re-running when the captured value changes; (2) **initialisation** — read something once without tracking; (3) **avoiding loops** — when you need to both read and write the same state inside an effect.`,
	objectives: [
		'Import untrack from svelte and use it inside $effect and $derived',
		'Read reactive values without creating dependencies on them',
		'Log "current value of X when Y changed" patterns',
		'Break out of infinite update loops caused by effects reading their own output'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import { untrack } from 'svelte';

  // =================================================================
  // SCENARIO 1 — Selective tracking: log search terms with current
  // category context, WITHOUT re-running when the category changes.
  // =================================================================
  let searchTerm = $state('');
  let category = $state('all');
  let logEntries = $state([]);

  $effect(() => {
    // Tracked — triggers the effect.
    const term = searchTerm;
    if (!term) return;

    // Untracked — reads current value but does NOT add to deps.
    const currentCategory = untrack(() => category);

    logEntries = [
      ...logEntries.slice(-7),
      \`[\${new Date().toLocaleTimeString()}] searched "\${term}" in category "\${currentCategory}"\`
    ];
  });

  // =================================================================
  // SCENARIO 2 — Manual snapshot: capture values on-demand without
  // the effect firing every time they change.
  // =================================================================
  let triggerCount = $state(0);
  let configA = $state('Alpha');
  let configB = $state('Beta');
  let configC = $state(42);
  let snapshot = $state('');
  let snapshotCount = $state(0);

  $effect(() => {
    triggerCount; // only this triggers
    if (triggerCount === 0) return;

    const a = untrack(() => configA);
    const b = untrack(() => configB);
    const c = untrack(() => configC);

    snapshot = \`Snapshot #\${triggerCount}: A=\${a}, B=\${b}, C=\${c}\`;
    snapshotCount++;
  });

  function takeSnapshot() {
    triggerCount++;
  }

  // =================================================================
  // SCENARIO 3 — Breaking an update loop. Here, an effect needs to
  // both read and update the same counter (e.g. increment it on a
  // condition). Reading inside untrack prevents infinite re-runs.
  // =================================================================
  let trigger = $state(0);
  let history = $state([]);

  $effect(() => {
    trigger; // only trigger is tracked

    // Without untrack, reading history inside the effect and
    // then writing to it would create a dependency cycle:
    // history changes -> effect re-runs -> history changes...
    const current = untrack(() => history);
    if (trigger > 0) {
      history = [...current, \`event #\${trigger} at \${new Date().toLocaleTimeString()}\`];
    }
  });

  function fireEvent() {
    trigger++;
  }

  function clearHistory() {
    history = [];
  }
</script>

<h1>untrack() &amp; Dependency Control</h1>

<p class="lead">
  <code>untrack()</code> lets you read a reactive value <em>without subscribing to it</em>.
  Great for logging, snapshots, and breaking update loops.
</p>

<section>
  <h2>1. Selective Tracking</h2>
  <p class="note">
    Type in the search box — the effect logs the search and current category. Change the
    category dropdown — the effect does <strong>not</strong> re-run, but the next search
    log will include the new category value.
  </p>

  <div class="controls">
    <label>
      Search (tracked)
      <input bind:value={searchTerm} placeholder="type..." />
    </label>
    <label>
      Category (untracked)
      <select bind:value={category}>
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
        <option value="clothing">Clothing</option>
      </select>
    </label>
  </div>

  <div class="log">
    <strong>Log (fires on search changes only)</strong>
    {#each logEntries as entry, i (i + entry)}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Type in the search box to see entries...</div>
    {/each}
  </div>
</section>

<section>
  <h2>2. Manual Snapshot</h2>
  <p class="note">
    Edit the config fields freely — the effect stays silent. Click "Take Snapshot" to
    capture the current values.
  </p>

  <div class="controls">
    <label>Config A <input bind:value={configA} /></label>
    <label>Config B <input bind:value={configB} /></label>
    <label>Config C <input type="number" bind:value={configC} /></label>
  </div>
  <button onclick={takeSnapshot}>Take Snapshot</button>

  {#if snapshot}
    <div class="snapshot">{snapshot}</div>
    <p class="count">Total snapshots taken: {snapshotCount}</p>
  {:else}
    <div class="snapshot empty">Click the button to take a snapshot</div>
  {/if}
</section>

<section>
  <h2>3. Avoiding Update Loops</h2>
  <p class="note">
    Without <code>untrack</code>, reading <code>history</code> inside an effect that also
    writes to <code>history</code> would create a dependency cycle. Here we read with
    <code>untrack</code> so only <code>trigger</code> drives re-runs.
  </p>
  <div class="controls-inline">
    <button onclick={fireEvent}>Fire Event (trigger: {trigger})</button>
    <button class="secondary" onclick={clearHistory}>Clear</button>
  </div>

  <ul class="history">
    {#each history as entry, i (i + entry)}
      <li>{entry}</li>
    {:else}
      <li class="empty">No events yet.</li>
    {/each}
  </ul>
</section>

<section class="explain">
  <h3>Cheat sheet</h3>
  <pre>{\`import { untrack } from 'svelte';

$effect(() => {
  const a = reactiveA;          // tracked
  const b = untrack(() => reactiveB); // read, not tracked
});

// untrack also works inside $derived
let x = $derived.by(() => {
  return tracked + untrack(() => other);
});\`}</pre>

  <h4>When to reach for untrack()</h4>
  <ul>
    <li>You want to <strong>read</strong> a value without <strong>subscribing</strong> to it.</li>
    <li>An effect should fire for one specific input, but reference others for context.</li>
    <li>Breaking an update cycle where an effect reads and writes the same state.</li>
    <li>Logging/analytics where you want context without triggering on every change.</li>
  </ul>
</section>

<style>
  h1 { color: #333; }
  .lead { color: #555; max-width: 720px; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 10px; }
  section h2 { margin-top: 0; }
  .note { font-size: 0.85rem; color: #666; }

  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }
  .controls label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  .controls-inline { display: flex; gap: 0.5rem; margin: 0.5rem 0; }
  input, select {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.9rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  button:hover { background: #4338ca; }
  button.secondary { background: #6b7280; }

  .log {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.5rem;
    margin: 0.75rem 0;
    max-height: 220px;
    overflow-y: auto;
    background: white;
  }
  .log-entry {
    padding: 0.3rem;
    font-family: monospace;
    font-size: 0.8rem;
    border-bottom: 1px solid #f0f0f0;
  }
  .empty { color: #999; font-style: italic; }

  .snapshot {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: #e8f5e9;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.85rem;
  }
  .snapshot.empty { background: #f5f5f5; color: #999; font-family: inherit; }
  .count { font-size: 0.75rem; color: #888; margin: 0.25rem 0 0; }

  .history { list-style: none; padding: 0; margin: 0.5rem 0 0; }
  .history li {
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid #eee;
    font-size: 0.85rem;
    font-family: monospace;
  }

  .explain {
    background: #eef2ff;
    border-left: 4px solid #4f46e5;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
  }
  .explain h3, .explain h4 { margin: 0 0 0.5rem; }
  .explain h4 { margin-top: 0.75rem; font-size: 0.95rem; }
  .explain ul { margin: 0; padding-left: 1.2rem; }
  .explain li { font-size: 0.9rem; margin: 0.25rem 0; }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre;
    margin: 0.5rem 0;
  }
  code { background: #e5e7eb; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
