import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '14-1',
		title: '$state.raw & $state.snapshot',
		phase: 5,
		module: 14,
		lessonIndex: 1
	},
	description: `When working with large datasets or integrating with external libraries, Svelte 5's default deep reactivity can introduce unnecessary overhead. $state.raw creates state that is only reactive at the top level — reassignments trigger updates, but mutations to properties within the object do not.

The official Best Practices guide calls this out explicitly: use $state.raw for API responses that are reassigned wholesale rather than mutated. That's the most common case in SvelteKit apps — fetch returns a fresh object, you assign it once, you never mutate nested fields. See lessons 12-3, 12-6, and 12-7 for real-world examples in fetch and load functions.

$state.snapshot takes a reactive proxy and returns a plain, non-reactive copy of its current value. This is essential when passing data to external libraries (like D3, chart libraries, or JSON.stringify) that cannot work with Svelte's reactive proxies.

In this lesson, you'll compare $state vs $state.raw for a large dataset, and use $state.snapshot to safely export reactive data for external consumption.`,
	objectives: [
		'Understand when $state.raw is preferable over $state for performance',
		'Apply $state.raw to API responses (the #1 best-practice use case)',
		'Use $state.snapshot to extract plain data from reactive proxies',
		'Compare mutation behaviour between $state and $state.raw',
		'Integrate reactive Svelte data with external libraries safely'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Large data array with $state.raw — only reassignment is reactive
  let items: { id: number; value: number }[] = $state.raw(
    Array.from({ length: 1000 }, (_, i) => ({ id: i, value: Math.random() * 100 }))
  );

  // Regular $state for comparison
  let label: string = $state('Dataset Viewer');

  // Track render count to show reactivity differences
  let renderCount: number = $state(0);

  function regenerateData(): void {
    // Reassignment triggers update with $state.raw
    items = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: Math.random() * 100
    }));
    renderCount++;
  }

  function sortByValue(): void {
    // Must reassign — mutating in place won't trigger update with $state.raw
    items = [...items].sort((a, b) => a.value - b.value);
    renderCount++;
  }

  function getSnapshot(): void {
    // $state.snapshot returns a plain object, safe for JSON or external libs
    const snapshot = $state.snapshot(items);
    alert(
      'Snapshot (first 3 items):\\n' +
      JSON.stringify(snapshot.slice(0, 3), null, 2)
    );
  }

  let topTen = $derived(items.slice(0, 10));
  let average = $derived(
    items.reduce((sum, item) => sum + item.value, 0) / items.length
  );
</script>

<h1>{label}</h1>
<p>Showing {items.length} items | Average: {average.toFixed(2)} | Renders: {renderCount}</p>

<div class="controls">
  <input type="text" bind:value={label} placeholder="Edit label..." />
  <button onclick={regenerateData}>Regenerate Data</button>
  <button onclick={sortByValue}>Sort by Value</button>
  <button onclick={getSnapshot}>Get Snapshot</button>
</div>

<h2>Top 10 Items</h2>
<table>
  <thead>
    <tr><th>ID</th><th>Value</th><th>Bar</th></tr>
  </thead>
  <tbody>
    {#each topTen as item (item.id)}
      <tr>
        <td>{item.id}</td>
        <td>{item.value.toFixed(2)}</td>
        <td>
          <div class="bar" style="width: {item.value}%"></div>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  h1 { color: #1a1a2e; margin-bottom: 0.25rem; }
  p { color: #555; margin-bottom: 1rem; }
  .controls { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .controls input {
    padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; flex: 1; min-width: 150px;
  }
  .controls button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  .controls button:hover { background: #5a4bd1; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #f8f9fa; font-weight: 600; }
  .bar {
    height: 16px; background: linear-gradient(90deg, #6c5ce7, #a29bfe);
    border-radius: 3px; transition: width 0.3s;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
