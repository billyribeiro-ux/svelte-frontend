import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-6',
		title: 'Symbol, WeakMap & Iterators',
		phase: 5,
		module: 16,
		lessonIndex: 6
	},
	description: `Advanced JavaScript patterns like Symbols, WeakMaps, and custom iterators integrate well with Svelte 5's reactivity system. Symbols provide guaranteed unique keys that prevent naming collisions — perfect for component registries or plugin systems. WeakMaps hold references to objects without preventing garbage collection, making them ideal for caching computed data or metadata about DOM elements.

Custom iterators and generators let you define how your objects are iterated with for...of loops, enabling elegant patterns for tree traversal, pagination, and lazy evaluation within reactive Svelte components.`,
	objectives: [
		'Use Symbols as unique keys for component registries and context',
		'Leverage WeakMap for caching data without memory leaks',
		'Implement custom iterators using Symbol.iterator',
		'Combine these patterns with Svelte reactivity for advanced state management'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // === Symbols as unique keys ===
  const THEME_KEY = Symbol('theme');
  const AUTH_KEY = Symbol('auth');

  // Symbol registry for component features
  const featureRegistry = new Map<symbol, { name: string; enabled: boolean }>();
  featureRegistry.set(THEME_KEY, { name: 'Dark Theme', enabled: false });
  featureRegistry.set(AUTH_KEY, { name: 'Authentication', enabled: true });

  // Reactive wrapper around feature state
  let features: { key: symbol; name: string; enabled: boolean }[] = $state(
    Array.from(featureRegistry.entries()).map(([key, val]) => ({
      key,
      name: val.name,
      enabled: val.enabled,
    }))
  );

  function toggleFeature(index: number): void {
    features = features.map((f, i) =>
      i === index ? { ...f, enabled: !f.enabled } : f
    );
  }

  // === WeakMap for caching ===
  interface DataItem {
    id: number;
    rawValue: number;
  }

  // WeakMap stores computed results keyed by object reference
  // When the object is garbage collected, the cache entry is too
  const computeCache = new WeakMap<DataItem, { result: number; computed: boolean }>();

  let dataItems: DataItem[] = $state([
    { id: 1, rawValue: 42 },
    { id: 2, rawValue: 17 },
    { id: 3, rawValue: 88 },
  ]);

  let computeCount: number = $state(0);

  function expensiveCompute(item: DataItem): number {
    const cached = computeCache.get(item);
    if (cached) return cached.result;

    // Simulate expensive work
    const result = item.rawValue * item.rawValue + Math.sqrt(item.rawValue);
    computeCache.set(item, { result, computed: true });
    computeCount++;
    return result;
  }

  function addDataItem(): void {
    const newItem = { id: dataItems.length + 1, rawValue: Math.floor(Math.random() * 100) };
    dataItems = [...dataItems, newItem];
  }

  // === Custom Iterator ===
  class NumberRange {
    #start: number;
    #end: number;
    #step: number;

    constructor(start: number, end: number, step: number = 1) {
      this.#start = start;
      this.#end = end;
      this.#step = step;
    }

    *[Symbol.iterator](): Iterator<number> {
      for (let i = this.#start; i <= this.#end; i += this.#step) {
        yield i;
      }
    }

    get length(): number {
      return Math.max(0, Math.floor((this.#end - this.#start) / this.#step) + 1);
    }
  }

  let rangeStart: number = $state(1);
  let rangeEnd: number = $state(10);
  let rangeStep: number = $state(1);

  let range = $derived(new NumberRange(rangeStart, rangeEnd, rangeStep));
  let rangeValues = $derived(Array.from(range));
  let rangeSum = $derived(rangeValues.reduce((a, b) => a + b, 0));

  // === Generator for lazy pagination ===
  function* paginate<T>(items: T[], pageSize: number): Generator<T[], void, unknown> {
    for (let i = 0; i < items.length; i += pageSize) {
      yield items.slice(i, i + pageSize);
    }
  }

  const allNames = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Karl', 'Lucy'];
  let pageSize: number = $state(4);
  let currentPage: number = $state(0);

  let pages = $derived(Array.from(paginate(allNames, pageSize)));
  let visiblePage = $derived(pages[currentPage] ?? []);
  let totalPages = $derived(pages.length);
</script>

<h1>Symbol, WeakMap & Iterators</h1>

<section>
  <h2>Symbols as Unique Keys</h2>
  <div class="feature-list">
    {#each features as feature, i (feature.name)}
      <div class="feature-item">
        <label>
          <input type="checkbox" checked={feature.enabled} onchange={() => toggleFeature(i)} />
          {feature.name}
        </label>
        <code class="symbol-tag">Symbol('{feature.key.description}')</code>
      </div>
    {/each}
  </div>
  <p class="hint">Each feature uses a unique Symbol key — no string collisions possible.</p>
</section>

<section>
  <h2>WeakMap for Caching</h2>
  <table>
    <thead><tr><th>ID</th><th>Raw</th><th>Computed</th></tr></thead>
    <tbody>
      {#each dataItems as item (item.id)}
        <tr>
          <td>{item.id}</td>
          <td>{item.rawValue}</td>
          <td>{expensiveCompute(item).toFixed(2)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="cache-info">
    <button onclick={addDataItem}>Add Item</button>
    <span>Computations performed: {computeCount}</span>
  </div>
  <p class="hint">WeakMap caches results per object — re-renders don't recompute.</p>
</section>

<section>
  <h2>Custom Iterator (for...of)</h2>
  <div class="range-controls">
    <label>Start: <input type="number" bind:value={rangeStart} /></label>
    <label>End: <input type="number" bind:value={rangeEnd} /></label>
    <label>Step: <input type="number" bind:value={rangeStep} min="1" /></label>
  </div>
  <div class="range-values">
    {#each rangeValues as val}
      <span class="range-item">{val}</span>
    {/each}
  </div>
  <p class="meta">Length: {range.length} | Sum: {rangeSum}</p>
</section>

<section>
  <h2>Generator Pagination</h2>
  <div class="page-controls">
    <button onclick={() => currentPage = Math.max(0, currentPage - 1)} disabled={currentPage === 0}>Prev</button>
    <span>Page {currentPage + 1} of {totalPages}</span>
    <button onclick={() => currentPage = Math.min(totalPages - 1, currentPage + 1)} disabled={currentPage >= totalPages - 1}>Next</button>
    <label>
      Page size: <input type="number" min="1" max="12" bind:value={pageSize}
        oninput={() => currentPage = 0} />
    </label>
  </div>
  <div class="page-items">
    {#each visiblePage as name}
      <div class="page-item">{name}</div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #0984e3; font-size: 1.1rem; }
  .feature-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.5rem 0; border-bottom: 1px solid #eee;
  }
  .symbol-tag {
    font-size: 0.75rem; padding: 0.2rem 0.5rem;
    background: #dfe6e9; border-radius: 4px; color: #636e72;
  }
  table { width: 100%; border-collapse: collapse; margin-bottom: 0.75rem; }
  th, td { padding: 0.4rem 0.6rem; text-align: left; border-bottom: 1px solid #eee; }
  th { font-weight: 600; background: white; }
  .cache-info { display: flex; align-items: center; gap: 1rem; }
  .cache-info span { font-size: 0.85rem; color: #636e72; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #0984e3; color: white; cursor: pointer; font-weight: 600;
  }
  button:disabled { background: #b2bec3; cursor: not-allowed; }
  .range-controls { display: flex; gap: 1rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
  .range-controls label { display: flex; align-items: center; gap: 0.3rem; font-size: 0.9rem; }
  .range-controls input { width: 60px; padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px; }
  .range-values { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
  .range-item {
    padding: 0.3rem 0.6rem; background: #74b9ff; color: white;
    border-radius: 4px; font-weight: 600; font-size: 0.9rem;
  }
  .meta { font-size: 0.85rem; color: #636e72; }
  .page-controls { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
  .page-controls input { width: 50px; padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px; }
  .page-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.5rem; }
  .page-item {
    padding: 0.6rem; background: white; border: 1px solid #dfe6e9;
    border-radius: 6px; text-align: center; font-weight: 600;
  }
  .hint { font-size: 0.8rem; color: #636e72; margin-top: 0.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
