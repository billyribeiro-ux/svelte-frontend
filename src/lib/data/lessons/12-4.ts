import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-4',
		title: 'Parallel Async & Partial Failures',
		phase: 4,
		module: 12,
		lessonIndex: 4
	},
	description: `When you need data from multiple independent sources, running requests in parallel is far faster than sequential execution. Promise.all waits for all promises to resolve but fails entirely if any one rejects. Promise.allSettled waits for all to complete and reports each result individually — perfect when you want partial data even if some requests fail.

This lesson teaches you to choose the right strategy for parallel async operations and handle partial failures gracefully.`,
	objectives: [
		'Use Promise.all to run multiple async operations in parallel',
		'Use Promise.allSettled to handle partial failures gracefully',
		'Display mixed success/failure results to the user',
		'Choose between Promise.all and Promise.allSettled based on requirements'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  interface ApiResult {
    source: string;
    status: 'success' | 'error';
    data?: string;
    error?: string;
  }

  let results: ApiResult[] = $state([]);
  let loading: boolean = $state(false);
  let method: string = $state('');

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Simulated API calls — one will fail
  async function fetchWeather(): Promise<string> {
    await delay(600);
    return 'Sunny, 22°C';
  }

  async function fetchNews(): Promise<string> {
    await delay(800);
    throw new Error('News API rate limited');
  }

  async function fetchStocks(): Promise<string> {
    await delay(500);
    return 'SVLT: $142.50 (+2.3%)';
  }

  // Demo: Promise.all — fails if ANY promise rejects
  async function demoPromiseAll() {
    loading = true;
    results = [];
    method = 'Promise.all';

    try {
      const [weather, news, stocks] = await Promise.all([
        fetchWeather(),
        fetchNews(),    // This will throw!
        fetchStocks()
      ]);
      results = [
        { source: 'Weather', status: 'success', data: weather },
        { source: 'News', status: 'success', data: news },
        { source: 'Stocks', status: 'success', data: stocks }
      ];
    } catch (err) {
      const e = err as Error;
      results = [
        { source: 'ALL', status: 'error', error: 'Promise.all rejected: ' + e.message + ' — no results available!' }
      ];
    } finally {
      loading = false;
    }
  }

  // Demo: Promise.allSettled — always completes, reports each result
  async function demoPromiseAllSettled() {
    loading = true;
    results = [];
    method = 'Promise.allSettled';

    const outcomes = await Promise.allSettled([
      fetchWeather(),
      fetchNews(),    // This will throw, but others still complete
      fetchStocks()
    ]);

    const sources = ['Weather', 'News', 'Stocks'];
    results = outcomes.map((outcome, i) => {
      if (outcome.status === 'fulfilled') {
        return { source: sources[i], status: 'success' as const, data: outcome.value };
      } else {
        return { source: sources[i], status: 'error' as const, error: outcome.reason.message };
      }
    });

    loading = false;
  }
</script>

<main>
  <h1>Parallel Async & Partial Failures</h1>

  <section>
    <h2>Promise.all vs Promise.allSettled</h2>
    <pre>{\`// Promise.all — all or nothing
const [a, b, c] = await Promise.all([
  fetchA(),  // if ANY fails, entire Promise.all rejects
  fetchB(),  // you get nothing — not even successful results
  fetchC()
]);

// Promise.allSettled — always completes
const results = await Promise.allSettled([
  fetchA(),  // each result is { status, value } or { status, reason }
  fetchB(),  // failed ones don't prevent others from completing
  fetchC()
]);\`}</pre>
  </section>

  <section>
    <h2>Live Demo</h2>
    <p><em>The News API will fail. Watch how each method handles it:</em></p>
    <div class="button-row">
      <button onclick={demoPromiseAll} disabled={loading}>
        Promise.all (all-or-nothing)
      </button>
      <button onclick={demoPromiseAllSettled} disabled={loading}>
        Promise.allSettled (partial OK)
      </button>
    </div>

    {#if loading}
      <p class="loading">Fetching from 3 APIs in parallel...</p>
    {/if}

    {#if results.length > 0}
      <h3>Results ({method}):</h3>
      <div class="results">
        {#each results as result}
          <div class="result" class:success={result.status === 'success'} class:error={result.status === 'error'}>
            <strong>{result.source}</strong>
            {#if result.status === 'success'}
              <span class="data">{result.data}</span>
            {:else}
              <span class="err">{result.error}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <section>
    <h2>When to Use Which</h2>
    <table>
      <thead><tr><th></th><th>Promise.all</th><th>Promise.allSettled</th></tr></thead>
      <tbody>
        <tr><td><strong>Behavior</strong></td><td>Rejects on first failure</td><td>Always resolves</td></tr>
        <tr><td><strong>Use when</strong></td><td>All data is required</td><td>Partial data is OK</td></tr>
        <tr><td><strong>Example</strong></td><td>Loading page that needs all data</td><td>Dashboard with independent widgets</td></tr>
        <tr><td><strong>Error handling</strong></td><td>try/catch the whole thing</td><td>Check each result.status</td></tr>
      </tbody>
    </table>
  </section>
</main>

<style>
  main { max-width: 650px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  .button-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .loading { color: #1565c0; font-style: italic; }
  .results { display: flex; flex-direction: column; gap: 0.5rem; }
  .result { padding: 0.75rem 1rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
  .result.success { background: #e8f5e9; border: 1px solid #4caf50; }
  .result.error { background: #ffebee; border: 1px solid #f44336; }
  .data { color: #2e7d32; }
  .err { color: #d32f2f; font-style: italic; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; font-size: 0.9rem; }
  th { background: #f5f5f5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
