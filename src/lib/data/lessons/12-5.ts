import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-5',
		title: 'AbortController, Cancellation & getAbortSignal',
		phase: 4,
		module: 12,
		lessonIndex: 5
	},
	description: `Not all async operations should run to completion. When a user navigates away or types a new search query, you need to cancel the previous request. AbortController provides a signal that you pass to fetch — calling abort() cancels the request. Svelte also provides getAbortSignal() to automatically cancel operations when a component is destroyed.

This lesson covers manual cancellation with AbortController and automatic cleanup patterns for Svelte components.`,
	objectives: [
		'Create an AbortController and pass its signal to fetch()',
		'Cancel in-flight requests when they become obsolete',
		'Handle AbortError separately from real errors',
		'Use getAbortSignal() for automatic component cleanup'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let searchQuery: string = $state('');
  let result: string = $state('');
  let loading: boolean = $state(false);
  let abortCount: number = $state(0);
  let currentController: AbortController | null = $state(null);

  // Simulated search with delay
  async function simulateSearch(query: string, signal: AbortSignal): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve('Results for "' + query + '": 42 items found');
      }, 1500);

      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }

  async function search() {
    // Cancel any previous request
    if (currentController) {
      currentController.abort();
      abortCount++;
    }

    // Create new controller for this request
    const controller = new AbortController();
    currentController = controller;

    loading = true;
    result = '';

    try {
      const data = await simulateSearch(searchQuery, controller.signal);
      result = data;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // Aborted — silently ignore, a new request is taking over
        return;
      }
      result = 'Error: ' + (err as Error).message;
    } finally {
      // Only update loading if this controller is still current
      if (currentController === controller) {
        loading = false;
        currentController = null;
      }
    }
  }

  function cancelCurrent() {
    if (currentController) {
      currentController.abort();
      abortCount++;
      loading = false;
      result = 'Request cancelled by user';
      currentController = null;
    }
  }
</script>

<main>
  <h1>AbortController & Cancellation</h1>

  <section>
    <h2>AbortController Pattern</h2>
    <pre>{\`// Create a controller
const controller = new AbortController();

// Pass signal to fetch
const response = await fetch('/api/search?q=svelte', {
  signal: controller.signal
});

// Cancel the request
controller.abort();

// Handle cancellation
try {
  const res = await fetch(url, { signal: controller.signal });
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Request was cancelled');
    return; // don't treat as error
  }
  throw err; // real error
}\`}</pre>
  </section>

  <section>
    <h2>Live Demo: Search with Cancellation</h2>
    <div class="search-row">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Type a search query..."
      />
      <button onclick={search} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      {#if loading}
        <button onclick={cancelCurrent} class="cancel">Cancel</button>
      {/if}
    </div>

    {#if loading}
      <p class="loading">Searching (takes 1.5s)... Try clicking Search again to abort this one!</p>
    {/if}
    {#if result}
      <p class="result">{result}</p>
    {/if}
    <p class="stats">Requests aborted: {abortCount}</p>
    <p><em>Try: type a query, click Search, then quickly type something else and Search again. The first request gets aborted.</em></p>
  </section>

  <section>
    <h2>getAbortSignal() in Svelte</h2>
    <pre>{\`<script lang="ts">
  import { getAbortSignal } from 'svelte';

  // Automatically cancelled when this component unmounts
  async function loadData() {
    const signal = getAbortSignal();

    const res = await fetch('/api/data', { signal });
    const data = await res.json();
    // If component was destroyed, this code
    // never runs — the signal aborted the fetch
  }

  // Perfect for $effect cleanup:
  $effect(() => {
    const signal = getAbortSignal();

    fetch('/api/data?q=' + query, { signal })
      .then(r => r.json())
      .then(data => items = data);
    // When query changes, previous fetch is aborted
    // When component is destroyed, fetch is aborted
  });
</script>\`}</pre>
  </section>

  <section>
    <h2>Real-World Pattern: Debounced Search</h2>
    <pre>{\`let controller: AbortController | null = null;

async function search(query: string) {
  // Cancel previous
  controller?.abort();
  controller = new AbortController();

  try {
    const res = await fetch(
      '/api/search?q=' + encodeURIComponent(query),
      { signal: controller.signal }
    );
    if (!res.ok) throw new Error('Search failed');
    results = await res.json();
  } catch (err) {
    if (err.name !== 'AbortError') {
      error = err.message;
    }
  }
}\`}</pre>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .search-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
  .search-row input { flex: 1; padding: 0.5rem; font-size: 1rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .cancel { background: #f44336; color: white; border: none; border-radius: 4px; }
  .loading { color: #1565c0; font-style: italic; }
  .result { background: #e8f5e9; padding: 0.75rem; border-radius: 4px; }
  .stats { color: #666; font-size: 0.9rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
