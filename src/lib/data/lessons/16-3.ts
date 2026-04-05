import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-3',
		title: 'Reactive Built-ins',
		phase: 5,
		module: 16,
		lessonIndex: 3
	},
	description: `Svelte 5 provides reactive versions of JavaScript's built-in collection types through svelte/reactivity. SvelteMap, SvelteSet, SvelteDate, SvelteURL, SvelteURLSearchParams, and MediaQuery are drop-in replacements for their native counterparts, but with full Svelte reactivity — any mutation to these objects automatically triggers UI updates.

This is especially useful because native Map, Set, Date, and URL objects use method-based mutation (like .set(), .add(), .setMonth()) rather than property assignment, which $state's proxy system can't automatically detect. These reactive built-ins bridge that gap. MediaQuery exposes a reactive \`.current\` boolean that tracks CSS media queries live, perfect for responsive logic in script code.

A common workflow is to pair SvelteURLSearchParams with $effect to keep application filter state in sync with the URL — bookmarkable, shareable, and browser-back-friendly.`,
	objectives: [
		'Use SvelteMap and SvelteSet for reactive key-value and unique collection state',
		'Track time-based state changes with SvelteDate',
		'Manage reactive URL state with SvelteURL and SvelteURLSearchParams',
		'Track responsive breakpoints and user preferences with MediaQuery',
		'Build a standalone filter UI backed by SvelteURLSearchParams',
		'Understand why native Map/Set/Date need reactive wrappers in Svelte'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import { SvelteMap, SvelteSet, SvelteDate, SvelteURL, SvelteURLSearchParams, MediaQuery } from 'svelte/reactivity';

  // MediaQuery — reactive media query matching
  const isMobile = new MediaQuery('max-width: 768px');
  const prefersDark = new MediaQuery('prefers-color-scheme: dark');

  // SvelteMap — reactive key-value store
  const userScores = new SvelteMap<string, number>([
    ['Alice', 95],
    ['Bob', 87],
    ['Carol', 92],
  ]);
  let newName: string = $state('');
  let newScore: number = $state(0);

  function addUser(): void {
    if (newName.trim()) {
      userScores.set(newName.trim(), newScore);
      newName = '';
      newScore = 0;
    }
  }

  // SvelteSet — reactive unique values
  const tags = new SvelteSet<string>(['svelte', 'typescript', 'reactive']);
  let newTag: string = $state('');

  function addTag(): void {
    if (newTag.trim()) {
      tags.add(newTag.trim().toLowerCase());
      newTag = '';
    }
  }

  // SvelteDate — reactive date
  const now = new SvelteDate();
  $effect(() => {
    const id = setInterval(() => {
      now.setTime(Date.now());
    }, 1000);
    return () => clearInterval(id);
  });

  // SvelteURL — reactive URL manipulation
  const url = new SvelteURL('https://example.com/search?q=svelte&page=1');

  // SvelteURLSearchParams — standalone reactive query string
  // Think of this as a reactive Map that stringifies to a URL query.
  const filters = new SvelteURLSearchParams('category=all&sort=newest&minPrice=0');
  const categories = ['all', 'books', 'music', 'games', 'tech'];
  const sorts = ['newest', 'oldest', 'price-asc', 'price-desc'];

  // Derived: pretty-printed query string
  const queryString = $derived(filters.toString());
  // Derived: typed access helpers
  const currentCategory = $derived(filters.get('category') ?? 'all');
  const currentSort = $derived(filters.get('sort') ?? 'newest');
  const currentMinPrice = $derived(Number(filters.get('minPrice') ?? 0));

  function setFilter(key: string, value: string): void {
    filters.set(key, value);
  }

  function clearFilters(): void {
    for (const key of Array.from(filters.keys())) {
      filters.delete(key);
    }
  }

  let totalScore = $derived(
    Array.from(userScores.values()).reduce((sum, s) => sum + s, 0)
  );
</script>

<h1>Reactive Built-ins</h1>

<section>
  <h2>SvelteMap</h2>
  <div class="add-row">
    <input bind:value={newName} placeholder="Name" />
    <input type="number" bind:value={newScore} placeholder="Score" />
    <button onclick={addUser}>Add</button>
  </div>
  <table>
    <thead><tr><th>Name</th><th>Score</th><th></th></tr></thead>
    <tbody>
      {#each Array.from(userScores.entries()) as [name, score] (name)}
        <tr>
          <td>{name}</td>
          <td>{score}</td>
          <td><button class="small" onclick={() => userScores.delete(name)}>Remove</button></td>
        </tr>
      {/each}
    </tbody>
  </table>
  <p class="meta">Size: {userScores.size} | Total: {totalScore} | Has Alice: {userScores.has('Alice')}</p>
</section>

<section>
  <h2>SvelteSet</h2>
  <div class="add-row">
    <input bind:value={newTag} placeholder="Add tag..." onkeydown={(e) => e.key === 'Enter' && addTag()} />
    <button onclick={addTag}>Add</button>
  </div>
  <div class="tags">
    {#each Array.from(tags) as tag (tag)}
      <span class="tag">
        {tag}
        <button class="tag-remove" onclick={() => tags.delete(tag)}>x</button>
      </span>
    {/each}
  </div>
  <p class="meta">Size: {tags.size} | Has "svelte": {tags.has('svelte')}</p>
</section>

<section>
  <h2>SvelteDate</h2>
  <div class="clock">
    <div class="time">{now.toLocaleTimeString()}</div>
    <div class="date">{now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>
  <div class="date-controls">
    <button onclick={() => now.setFullYear(now.getFullYear() + 1)}>+1 Year</button>
    <button onclick={() => now.setMonth(now.getMonth() + 1)}>+1 Month</button>
    <button onclick={() => now.setTime(Date.now())}>Reset to Now</button>
  </div>
</section>

<section>
  <h2>MediaQuery</h2>
  <p>Reactive media query matching — updates automatically when viewport or preferences change.</p>
  <div class="mq-status">
    <div class="mq-row">
      <span>Mobile viewport (max-width: 768px):</span>
      <strong class:active={isMobile.current} class:inactive={!isMobile.current}>
        {isMobile.current ? 'YES' : 'NO'}
      </strong>
    </div>
    <div class="mq-row">
      <span>Prefers dark mode:</span>
      <strong class:active={prefersDark.current} class:inactive={!prefersDark.current}>
        {prefersDark.current ? 'YES' : 'NO'}
      </strong>
    </div>
  </div>
  <p class="meta">Resize the browser or toggle system dark mode to see changes.</p>
</section>

<section>
  <h2>SvelteURL</h2>
  <div class="url-display">
    <code>{url.href}</code>
  </div>
  <div class="url-parts">
    <label>Protocol: <input bind:value={url.protocol} /></label>
    <label>Hostname: <input bind:value={url.hostname} /></label>
    <label>Pathname: <input bind:value={url.pathname} /></label>
    <label>Search: <input bind:value={url.search} /></label>
    <label>Hash: <input bind:value={url.hash} /></label>
  </div>
  <div class="params">
    <h3>Search Params</h3>
    {#each Array.from(url.searchParams.entries()) as [key, value]}
      <div class="param-row">
        <span>{key} = {value}</span>
      </div>
    {/each}
    <button onclick={() => url.searchParams.set('lang', 'en')}>Add lang=en</button>
  </div>
</section>

<section>
  <h2>SvelteURLSearchParams — standalone filter state</h2>
  <p class="small">
    A shop-style filter bar backed by SvelteURLSearchParams. The rendered
    query string updates live as you change any control — and could be
    written into window.location.search from an $effect.
  </p>
  <div class="filter-bar">
    <label>
      Category:
      <select
        value={currentCategory}
        onchange={(e) => setFilter('category', (e.target as HTMLSelectElement).value)}
      >
        {#each categories as c (c)}
          <option value={c}>{c}</option>
        {/each}
      </select>
    </label>
    <label>
      Sort:
      <select
        value={currentSort}
        onchange={(e) => setFilter('sort', (e.target as HTMLSelectElement).value)}
      >
        {#each sorts as s (s)}
          <option value={s}>{s}</option>
        {/each}
      </select>
    </label>
    <label>
      Min $:
      <input
        type="number"
        min="0"
        value={currentMinPrice}
        oninput={(e) => setFilter('minPrice', (e.target as HTMLInputElement).value)}
      />
    </label>
    <button class="small-btn" onclick={clearFilters}>Clear</button>
  </div>
  <div class="query-display">
    <code>?{queryString}</code>
  </div>
  <p class="meta">
    {filters.size} active filter(s). Iterate with for..of:
    {#each Array.from(filters) as [k, v] (k)}
      <span class="chip">{k}={v}</span>
    {/each}
  </p>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #0984e3; font-size: 1.1rem; }
  h3 { font-size: 0.95rem; margin: 0.5rem 0; }
  .add-row { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
  .add-row input {
    padding: 0.4rem; border: 1px solid #ddd; border-radius: 4px; flex: 1;
  }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #0984e3; color: white; cursor: pointer; font-weight: 600;
  }
  button:hover { background: #0770c2; }
  .small { padding: 0.2rem 0.5rem; font-size: 0.8rem; background: #ff7675; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.4rem 0.6rem; text-align: left; border-bottom: 1px solid #eee; }
  th { background: white; font-weight: 600; }
  .meta { font-size: 0.8rem; color: #636e72; margin-top: 0.5rem; }
  .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
  .tag {
    display: inline-flex; align-items: center; gap: 0.3rem;
    padding: 0.3rem 0.6rem; background: #74b9ff; color: white;
    border-radius: 12px; font-size: 0.85rem;
  }
  .tag-remove {
    padding: 0; background: transparent; color: white; font-size: 0.8rem;
    cursor: pointer; border: none;
  }
  .clock { text-align: center; margin: 1rem 0; }
  .time { font-size: 2rem; font-weight: 700; color: #0984e3; font-family: monospace; }
  .date { color: #636e72; }
  .date-controls { display: flex; gap: 0.5rem; justify-content: center; }
  .url-display {
    padding: 0.75rem; background: #2d3436; border-radius: 6px;
    margin-bottom: 0.75rem; overflow-x: auto;
  }
  .url-display code { color: #74b9ff; font-size: 0.85rem; }
  .url-parts { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.75rem; }
  .url-parts label { font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.2rem; }
  .url-parts input {
    padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem;
  }
  .param-row { font-family: monospace; font-size: 0.85rem; padding: 0.2rem 0; }
  .mq-status { display: flex; flex-direction: column; gap: 0.5rem; }
  .mq-row { display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; }
  .mq-row span { color: #636e72; }
  .active { color: #00b894; }
  .inactive { color: #d63031; }
  .filter-bar {
    display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;
    margin-bottom: 0.75rem;
  }
  .filter-bar label {
    display: flex; align-items: center; gap: 0.3rem; font-size: 0.85rem;
    color: #2d3436;
  }
  .filter-bar select, .filter-bar input {
    padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px;
    font-size: 0.85rem;
  }
  .filter-bar input { width: 5rem; }
  .small-btn {
    padding: 0.3rem 0.6rem; font-size: 0.8rem; background: #636e72;
  }
  .query-display {
    padding: 0.5rem 0.75rem; background: #2d3436; border-radius: 4px;
    margin-bottom: 0.5rem; overflow-x: auto;
  }
  .query-display code { color: #55efc4; font-size: 0.85rem; }
  .chip {
    display: inline-block; padding: 0.15rem 0.5rem;
    background: #dfe6e9; border-radius: 10px; font-size: 0.75rem;
    margin: 0 0.2rem; font-family: monospace;
  }
  .small { font-size: 0.85rem; color: #636e72; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
