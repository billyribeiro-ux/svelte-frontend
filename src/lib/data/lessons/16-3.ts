import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-3',
		title: 'Reactive Built-ins',
		phase: 5,
		module: 16,
		lessonIndex: 3
	},
	description: `Svelte 5 provides reactive versions of JavaScript's built-in collection types through svelte/reactivity. SvelteMap, SvelteSet, SvelteDate, SvelteURL, and SvelteURLSearchParams are drop-in replacements for their native counterparts, but with full Svelte reactivity — any mutation to these objects automatically triggers UI updates.

This is especially useful because native Map, Set, Date, and URL objects use method-based mutation (like .set(), .add(), .setMonth()) rather than property assignment, which $state's proxy system can't automatically detect. These reactive built-ins bridge that gap.`,
	objectives: [
		'Use SvelteMap and SvelteSet for reactive key-value and unique collection state',
		'Track time-based state changes with SvelteDate',
		'Manage reactive URL state with SvelteURL and SvelteURLSearchParams',
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
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
