import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-7',
		title: 'untrack() & Dependency Control',
		phase: 2,
		module: 6,
		lessonIndex: 7
	},
	description: `By default, $effect and $derived track every reactive value you read. But sometimes you want to read a value without creating a dependency on it — you want to use the value without re-running the effect when it changes.

That's what untrack() does. Import it from 'svelte' and wrap any reactive reads you want to exclude from dependency tracking.

A common use case: logging the current value of something when another value changes, without re-running the logger when the logged value itself changes.`,
	objectives: [
		'Import untrack from svelte and use it inside $effect',
		'Control which dependencies trigger an effect and which are just read',
		'Identify use cases where untrack prevents unwanted re-execution'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import { untrack } from 'svelte';

  let searchTerm = $state('');
  let category = $state('all');
  let logEntries = $state([]);

  // Without untrack: this effect runs when EITHER searchTerm or category changes
  // With untrack: it only runs when searchTerm changes,
  // but still reads category's current value
  $effect(() => {
    // This is tracked — effect re-runs when searchTerm changes
    const term = searchTerm;

    if (!term) return;

    // This is NOT tracked — reading category won't trigger re-run
    const currentCategory = untrack(() => category);

    logEntries = [
      ...logEntries.slice(-7),
      \`Searched "\${term}" (category was: \${currentCategory}) at \${new Date().toLocaleTimeString()}\`
    ];
  });

  // Another example: effect that runs on trigger,
  // reads other values without tracking
  let triggerCount = $state(0);
  let configA = $state('Alpha');
  let configB = $state('Beta');
  let snapshot = $state('');

  $effect(() => {
    // Only this triggers the effect
    triggerCount;

    if (triggerCount === 0) return;

    // Read these without tracking
    const a = untrack(() => configA);
    const b = untrack(() => configB);

    snapshot = \`Snapshot #\${triggerCount}: configA=\${a}, configB=\${b}\`;
  });

  function takeSnapshot() {
    triggerCount++;
  }
</script>

<h1>untrack() & Dependency Control</h1>

<section>
  <h2>Selective Tracking</h2>
  <p>Type in the search box — the effect logs the search term. Change the category — the effect does NOT re-run, but still reads the current category value.</p>

  <div class="controls">
    <label>
      Search (tracked):
      <input bind:value={searchTerm} placeholder="Type to trigger effect..." />
    </label>
    <label>
      Category (untracked):
      <select bind:value={category}>
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
        <option value="books">Books</option>
        <option value="clothing">Clothing</option>
      </select>
    </label>
  </div>

  <div class="log">
    <strong>Effect Log</strong> (only fires on search changes)
    {#each logEntries as entry}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Type in the search box...</div>
    {/each}
  </div>

  <p class="tip">Try changing the category dropdown — notice the log does NOT update. Then type in search — the log shows the current category, but it was read with untrack().</p>
</section>

<section>
  <h2>Manual Snapshot Pattern</h2>
  <p>Change config values freely — the effect won't run. Click "Take Snapshot" to capture current values.</p>

  <div class="controls">
    <label>Config A: <input bind:value={configA} /></label>
    <label>Config B: <input bind:value={configB} /></label>
    <button onclick={takeSnapshot}>Take Snapshot</button>
  </div>

  {#if snapshot}
    <div class="snapshot">{snapshot}</div>
  {:else}
    <div class="snapshot empty">Click the button to take a snapshot</div>
  {/if}
</section>

<div class="explanation">
  <h3>When to use untrack()</h3>
  <ul>
    <li>You want to <strong>read</strong> a reactive value without <strong>subscribing</strong> to it</li>
    <li>An effect should only fire for specific dependencies, but needs to reference other values</li>
    <li>Analytics or logging where you want to capture context without triggering on every change</li>
  </ul>

  <pre>
import {'{'} untrack {'}'} from 'svelte';

$effect(() => {'{'}
  // tracked — triggers the effect
  const term = searchTerm;

  // untracked — just reads the value
  const cat = untrack(() => category);
{'}'});
  </pre>
</div>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0.75rem 0;
  }
  label { display: flex; align-items: center; gap: 0.5rem; }
  input { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
  select { padding: 0.4rem; }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    align-self: flex-start;
  }
  .log {
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.5rem;
    margin: 0.75rem 0;
    max-height: 200px;
    overflow-y: auto;
  }
  .log-entry {
    padding: 0.3rem;
    font-family: monospace;
    font-size: 0.8rem;
    border-bottom: 1px solid #f0f0f0;
  }
  .empty { color: #999; font-style: italic; }
  .tip {
    font-size: 0.85rem;
    color: #4f46e5;
    background: #eef2ff;
    padding: 0.5rem;
    border-radius: 4px;
  }
  .snapshot {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background: #e8f5e9;
    border-radius: 6px;
    font-family: monospace;
  }
  .snapshot.empty { background: #f5f5f5; color: #999; }
  .explanation {
    background: #f0f4ff;
    border-left: 4px solid #4f46e5;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1.5rem;
  }
  .explanation h3 { margin: 0 0 0.5rem; }
  ul { padding-left: 1.2rem; }
  li { margin: 0.3rem 0; }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    margin-top: 0.75rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
