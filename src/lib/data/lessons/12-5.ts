import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-5',
		title: 'AbortController, Cancellation & getAbortSignal',
		phase: 4,
		module: 12,
		lessonIndex: 5
	},
	description: `Async operations need a way to say "never mind" — the user typed another character into search, navigated away, or clicked cancel. Without cancellation, every keystroke fires a request and late responses race each other, silently overwriting your latest data with stale results.

AbortController is the standard cancellation mechanism for fetch (and many other APIs). You create one, pass its .signal to fetch, and call .abort() to cancel. The fetch rejects with an AbortError — which you handle separately from real errors.

SvelteKit layers a modern helper on top: getAbortSignal() inside $derived and $effect returns a signal that is automatically aborted when the computation re-runs or the effect cleans up. This kills an entire class of "stale request" bugs without any manual bookkeeping.`,
	objectives: [
		'Create an AbortController and wire its signal into fetch',
		'Handle AbortError separately from real network errors',
		'Build a debounced search with manual cancellation',
		'Use getAbortSignal() in $effect for automatic cleanup',
		'Understand why cancellation prevents stale-response bugs'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // AbortController — the standard cancellation primitive
  //
  //   const ctrl = new AbortController();
  //   fetch(url, { signal: ctrl.signal });
  //   ctrl.abort();   // → fetch rejects with DOMException 'AbortError'
  //
  // Key points:
  //   - One controller can abort many operations (pass .signal to all)
  //   - Once aborted, a controller is DEAD — make a new one for the next request
  //   - AbortError is not a real failure; you usually swallow it silently
  // ---------------------------------------------------------------

  let log: string[] = $state([]);

  function addLog(msg: string): void {
    log = [...log, msg];
  }

  function clearLog(): void {
    log = [];
  }

  // Simulated fetch that respects an AbortSignal.
  function mockFetch(label: string, ms: number, signal: AbortSignal): Promise<string> {
    return new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException('Aborted before start', 'AbortError'));
        return;
      }
      const id = setTimeout(() => resolve(label + ' done'), ms);
      // When the signal fires, clear the timer and reject.
      signal.addEventListener('abort', () => {
        clearTimeout(id);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });
  }

  // -------------------------------------------------------------
  // Demo 1 — Manual abort
  // -------------------------------------------------------------
  let inFlight: AbortController | null = null;

  async function startRequest(): Promise<void> {
    // Cancel any previous in-flight request first.
    inFlight?.abort();

    // Make a fresh controller — abort() can only fire once per instance.
    inFlight = new AbortController();
    addLog('Request started (2s)...');

    try {
      const result = await mockFetch('request', 2000, inFlight.signal);
      addLog('Success: ' + result);
    } catch (err) {
      const e = err as DOMException;
      if (e.name === 'AbortError') {
        addLog('Aborted — safely ignoring');
      } else {
        addLog('Real error: ' + e.message);
      }
    }
  }

  function cancelRequest(): void {
    if (inFlight) {
      inFlight.abort();
      addLog('Called .abort()');
    }
  }

  // -------------------------------------------------------------
  // Demo 2 — Debounced search with cancellation
  //
  // Every keystroke:
  //   1. aborts the previous in-flight request
  //   2. waits 300ms of "quiet" (debounce)
  //   3. starts a new request with a fresh controller
  //
  // This is the canonical pattern for search-as-you-type.
  // -------------------------------------------------------------
  let query: string = $state('');
  let searchResult: string = $state('');
  let searching: boolean = $state(false);
  let searchCtrl: AbortController | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  async function doSearch(q: string): Promise<void> {
    searchCtrl?.abort();
    searchCtrl = new AbortController();
    searching = true;

    try {
      // Simulate a ~700ms server lookup
      const result = await mockFetch('results for "' + q + '"', 700, searchCtrl.signal);
      searchResult = result;
    } catch (err) {
      // Aborted searches leave the previous result alone.
      if ((err as DOMException).name !== 'AbortError') {
        searchResult = 'error: ' + (err as Error).message;
      }
    } finally {
      // Only stop the spinner if this was the latest request.
      if (!searchCtrl.signal.aborted) searching = false;
    }
  }

  function onQueryInput(e: Event): void {
    query = (e.target as HTMLInputElement).value;
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!query.trim()) {
      searchResult = '';
      searching = false;
      searchCtrl?.abort();
      return;
    }
    debounceTimer = setTimeout(() => doSearch(query), 300);
  }

  // -------------------------------------------------------------
  // Demo 3 — getAbortSignal() pattern (SvelteKit)
  //
  // Inside a load function, $effect, or $derived, SvelteKit gives
  // you an abort signal that is AUTOMATICALLY aborted when the
  // computation re-runs or tears down. No bookkeeping needed.
  //
  //   // +page.ts
  //   export const load = async ({ fetch, params }) => {
  //     const signal = getAbortSignal();   // auto-aborts on nav
  //     const res = await fetch('/api/' + params.id, { signal });
  //     return { data: await res.json() };
  //   };
  //
  // In components:
  //   let data = $state(null);
  //   $effect(() => {
  //     const signal = getAbortSignal();
  //     fetch('/api/x', { signal })
  //       .then(r => r.json())
  //       .then(d => (data = d))
  //       .catch(err => {
  //         if (err.name !== 'AbortError') throw err;
  //       });
  //   });
  //
  // When selectedId changes (triggering the effect to re-run),
  // the old fetch is cancelled automatically. No more stale data.
  // -------------------------------------------------------------
</script>

<main>
  <h1>AbortController & Cancellation</h1>

  <section>
    <h2>1. Manual AbortController</h2>
    <div class="button-row">
      <button onclick={startRequest}>Start 2s Request</button>
      <button onclick={cancelRequest}>Cancel</button>
    </div>
    <pre>{\`const ctrl = new AbortController();

fetch('/api/slow', { signal: ctrl.signal })
  .then(res => res.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      // user cancelled — ignore
    } else {
      throw err;  // real error
    }
  });

// Elsewhere:
ctrl.abort();  // cancels the fetch\`}</pre>
  </section>

  <section>
    <h2>2. Debounced Search with Cancellation</h2>
    <p class="hint">
      Type fast: every keystroke cancels the previous request, so only the final
      search actually completes. Without this, late responses can overwrite fresh ones.
    </p>
    <input
      type="text"
      placeholder="Type to search..."
      value={query}
      oninput={onQueryInput}
    />
    <div class="result">
      {#if searching}
        <em>Searching...</em>
      {:else if searchResult}
        {searchResult}
      {:else}
        <span class="muted">Results appear here</span>
      {/if}
    </div>

    <pre>{\`let ctrl: AbortController | null = null;

async function search(q: string) {
  ctrl?.abort();               // cancel previous
  ctrl = new AbortController();

  try {
    const res = await fetch('/api/search?q=' + q, {
      signal: ctrl.signal
    });
    results = await res.json();
  } catch (err) {
    if (err.name === 'AbortError') return; // ignored
    throw err;
  }
}\`}</pre>
  </section>

  <section>
    <h2>3. Modern Pattern: getAbortSignal()</h2>
    <p class="hint">
      SvelteKit's <code>getAbortSignal()</code> returns a signal that is
      automatically aborted when the caller re-runs or tears down.
      No more manual bookkeeping.
    </p>
    <pre>{\`// src/routes/users/[id]/+page.ts
import { getAbortSignal } from '$app/navigation';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  // This signal aborts automatically if the user navigates
  // away or the load re-runs before this fetch finishes.
  const signal = getAbortSignal();

  const res = await fetch('/api/users/' + params.id, { signal });
  return { user: await res.json() };
};\`}</pre>

    <pre>{\`// Inside a component $effect — same idea
<script lang="ts">
  import { getAbortSignal } from '$app/navigation';

  let id = $state(1);
  let data = $state.raw(null);

  $effect(() => {
    // Reading id makes this effect re-run when it changes.
    // The PREVIOUS run's signal is aborted automatically.
    const signal = getAbortSignal();

    fetch('/api/items/' + id, { signal })
      .then(r => r.json())
      .then(d => data = d)
      .catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });
  });
</\${''}script>\`}</pre>

    <div class="callout">
      <strong>Why this matters:</strong> The #1 bug in naive search boxes is the
      "stale response race" — a slow request from 3 keystrokes ago resolves AFTER
      a fast one from the current keystroke, clobbering your fresh results.
      getAbortSignal() makes this whole class of bugs disappear.
    </div>
  </section>

  <section>
    <h2>Console</h2>
    <div class="console">
      {#each log as entry, i (i)}
        <div class="log-entry">{entry}</div>
      {/each}
      {#if log.length === 0}
        <div class="empty">Run a demo...</div>
      {/if}
    </div>
    <button onclick={clearLog}>Clear</button>
  </section>
</main>

<style>
  main { max-width: 680px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  h2 { margin-top: 0; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85rem; }
  .hint { color: #555; font-size: 0.9rem; margin: 0 0 0.75rem; }
  .button-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
  input[type="text"] { width: 100%; padding: 0.5rem; font-size: 1rem; box-sizing: border-box; }
  .result { margin-top: 0.5rem; padding: 0.75rem; background: #f5f5f5; border-radius: 4px; min-height: 1.5rem; font-family: monospace; font-size: 0.9rem; }
  .muted { color: #999; font-style: italic; }
  .console { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 0.82rem; min-height: 80px; max-height: 200px; overflow-y: auto; margin-bottom: 0.5rem; }
  .log-entry { padding: 0.15rem 0; }
  .empty { color: #666; font-style: italic; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
  .callout { margin-top: 0.75rem; padding: 0.75rem 1rem; background: #fff3e0; border-left: 3px solid #ff9800; border-radius: 4px; font-size: 0.9rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
