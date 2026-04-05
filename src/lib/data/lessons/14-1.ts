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
  // ─────────────────────────────────────────────────────────────
  // $state vs $state.raw — side-by-side with a 10k-item dataset
  // ─────────────────────────────────────────────────────────────
  // $state: deep proxy, every nested read/write is tracked. Great for
  // UI-driven state where individual fields change.
  // $state.raw: only the top-level reference is reactive. Mutations to
  // nested fields are NOT observed — you must reassign the whole value.
  //
  // The #1 best-practice use case: API responses that are assigned
  // wholesale and never mutated in place. You pay zero proxy overhead
  // and avoid \`$state.snapshot()\` gymnastics when handing the data to
  // external libraries (charts, JSON.stringify, structuredClone, etc.).

  interface Point {
    id: number;
    value: number;
    label: string;
    tags: string[];
  }

  function makeDataset(n: number): Point[] {
    return Array.from({ length: n }, (_, i) => ({
      id: i,
      value: Math.round(Math.random() * 1000) / 10,
      label: \`item-\${i}\`,
      tags: ['alpha', 'beta', 'gamma'].slice(0, (i % 3) + 1)
    }));
  }

  // Two datasets — identical contents, different reactivity strategies
  let rawItems: Point[] = $state.raw(makeDataset(10000));
  let proxyItems: Point[] = $state(makeDataset(500));

  // Benchmark: how long does a bulk mutation take?
  let rawBenchMs: number = $state(0);
  let proxyBenchMs: number = $state(0);

  function benchmarkRaw(): void {
    const t0 = performance.now();
    // Must build a new array — in-place mutation would NOT trigger an update
    rawItems = rawItems.map((p) => ({ ...p, value: p.value + 1 }));
    rawBenchMs = performance.now() - t0;
  }

  function benchmarkProxy(): void {
    const t0 = performance.now();
    // Mutate in place — proxy tracks every nested write
    for (const p of proxyItems) p.value += 1;
    proxyBenchMs = performance.now() - t0;
  }

  // ─────────────────────────────────────────────────────────────
  // $state.snapshot — extract a plain (non-reactive) copy
  // ─────────────────────────────────────────────────────────────
  // Passing a reactive proxy to an external library that uses
  // structuredClone, JSON.stringify, or Object.keys deeply can throw
  // or behave surprisingly. $state.snapshot() returns a plain copy.

  let snapshotOutput: string = $state('(click a button to snapshot)');

  function jsonStringifySnapshot(): void {
    const snap = $state.snapshot(proxyItems.slice(0, 3));
    snapshotOutput = JSON.stringify(snap, null, 2);
  }

  function structuredCloneSnapshot(): void {
    // structuredClone would fail on a reactive proxy containing functions —
    // snapshot gives you a vanilla structure it can handle.
    const snap = $state.snapshot(proxyItems.slice(0, 3));
    const cloned = structuredClone(snap);
    snapshotOutput = \`structuredClone ok • \${cloned.length} items\\n\` +
      JSON.stringify(cloned, null, 2);
  }

  function sendToExternalLib(): void {
    // Simulate handing data to a non-Svelte library (e.g. d3, Chart.js)
    const snap = $state.snapshot(rawItems);
    const total = snap.reduce((sum, p) => sum + p.value, 0);
    const avg = total / snap.length;
    snapshotOutput = \`External lib processed \${snap.length} items\\n\` +
      \`sum=\${total.toFixed(2)} avg=\${avg.toFixed(2)}\`;
  }

  // ─────────────────────────────────────────────────────────────
  // API-response pattern — the #1 $state.raw use case
  // ─────────────────────────────────────────────────────────────
  interface ApiResponse {
    loadedAt: string;
    users: { id: number; name: string; email: string }[];
  }

  let apiData: ApiResponse | null = $state.raw(null);
  let loading: boolean = $state(false);

  async function fetchApi(): Promise<void> {
    loading = true;
    await new Promise((r) => setTimeout(r, 400));
    // Wholesale reassignment — NOT mutation. Perfect for $state.raw.
    apiData = {
      loadedAt: new Date().toLocaleTimeString(),
      users: Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        name: \`User \${i + 1}\`,
        email: \`user\${i + 1}@example.com\`
      }))
    };
    loading = false;
  }

  // Derived stats — these recompute when rawItems is reassigned
  let average = $derived(
    rawItems.reduce((sum, p) => sum + p.value, 0) / rawItems.length
  );
  let topFive = $derived(
    [...rawItems].sort((a, b) => b.value - a.value).slice(0, 5)
  );
</script>

<h1>$state.raw & $state.snapshot</h1>

<section class="callout">
  <strong>Best practice:</strong> Use <code>$state.raw</code> for API
  responses and large datasets that are reassigned wholesale. You save the
  per-field proxy cost and hand plain objects to external libraries
  without needing a snapshot.
</section>

<section>
  <h2>1. Benchmark — 10,000 items with $state.raw</h2>
  <p>
    Items: <strong>{rawItems.length.toLocaleString()}</strong> •
    Average: <strong>{average.toFixed(2)}</strong>
  </p>
  <button onclick={benchmarkRaw}>Bump all values (+1)</button>
  <span class="bench">{rawBenchMs.toFixed(2)}ms</span>

  <h3>Top 5 by value</h3>
  <ul class="top">
    {#each topFive as p (p.id)}
      <li>
        <code>#{p.id}</code>
        <span class="bar" style="width: {p.value}%"></span>
        <strong>{p.value.toFixed(1)}</strong>
      </li>
    {/each}
  </ul>
</section>

<section>
  <h2>2. Compare — 500 items with $state (deep proxy)</h2>
  <p>Items: <strong>{proxyItems.length}</strong></p>
  <button onclick={benchmarkProxy}>Bump all values (+1)</button>
  <span class="bench">{proxyBenchMs.toFixed(2)}ms</span>
  <p class="hint">
    Deep proxies cost more per-item. With 500 items it's fine; with
    10,000+ rows the savings from <code>$state.raw</code> become obvious.
  </p>
</section>

<section>
  <h2>3. $state.snapshot for external libraries</h2>
  <div class="controls">
    <button onclick={jsonStringifySnapshot}>JSON.stringify</button>
    <button onclick={structuredCloneSnapshot}>structuredClone</button>
    <button onclick={sendToExternalLib}>Send to external lib</button>
  </div>
  <pre class="snapshot">{snapshotOutput}</pre>
</section>

<section>
  <h2>4. API response pattern ($state.raw)</h2>
  <button onclick={fetchApi} disabled={loading}>
    {loading ? 'Loading...' : 'Fetch Users'}
  </button>
  {#if apiData}
    <p class="loaded">Loaded at {apiData.loadedAt}</p>
    <ul class="users">
      {#each apiData.users as user (user.id)}
        <li><strong>{user.name}</strong> — {user.email}</li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  h1 { color: #1a1a2e; margin-bottom: 0.25rem; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.05rem; }
  h3 { margin: 1rem 0 0.5rem; font-size: 0.95rem; color: #2d3436; }
  .callout {
    background: #f0fdf4; border-left: 3px solid #16a34a;
    font-size: 0.88rem; color: #14532d;
  }
  .callout code { background: #bbf7d0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  .controls { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
  button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  button:hover:not(:disabled) { background: #5a4bd1; }
  button:disabled { background: #b2bec3; cursor: not-allowed; }
  .bench {
    margin-left: 0.5rem; font-family: monospace; font-size: 0.9rem;
    color: #6c5ce7; font-weight: 700;
  }
  .top { list-style: none; padding: 0; margin: 0; }
  .top li {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.25rem 0; font-size: 0.85rem;
  }
  .top code { background: #eee; padding: 0.1rem 0.35rem; border-radius: 3px; min-width: 3rem; }
  .bar {
    display: inline-block; height: 10px; border-radius: 3px;
    background: linear-gradient(90deg, #6c5ce7, #a29bfe); flex: 1; max-width: 60%;
  }
  .snapshot {
    background: #2d3436; color: #dfe6e9; padding: 0.75rem; border-radius: 6px;
    font-size: 0.78rem; max-height: 220px; overflow: auto; white-space: pre-wrap;
  }
  .loaded { font-size: 0.85rem; color: #00b894; font-weight: 600; }
  .users { list-style: none; padding: 0; }
  .users li { padding: 0.4rem 0.6rem; background: white; border-radius: 4px; margin-bottom: 0.25rem; font-size: 0.9rem; }
  .hint { font-size: 0.82rem; color: #636e72; margin-top: 0.5rem; }
  code { font-family: ui-monospace, monospace; font-size: 0.85em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
