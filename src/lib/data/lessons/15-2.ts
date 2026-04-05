import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-2',
		title: '<svelte:boundary>: Error Recovery',
		phase: 5,
		module: 15,
		lessonIndex: 2
	},
	description: `A single thrown error in a component can bring down an entire page. <svelte:boundary> is Svelte 5's error fence: errors raised while rendering its children, or inside $effect callbacks within them, are caught and turned into a fallback UI.

The boundary accepts a failed snippet that receives (error, reset). Calling reset() destroys the current instance of the children and recreates them — a clean slate. Boundaries compose naturally: wrap each widget in its own boundary for per-widget recovery, then wrap the whole region in a final safety net. Combined with your own retry counters and error reporting, this is the building block for resilient, production-grade UIs.`,
	objectives: [
		'Wrap risky subtrees in <svelte:boundary> to prevent total crashes',
		'Render error UI via the failed snippet with access to error and reset',
		'Implement retry counters and max-attempt logic before giving up',
		'Nest boundaries so independent widgets can fail and recover in isolation',
		'Catch both render-time and effect-time errors'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ─────────────────────────────────────────────────────────────
  // Demo state: several independent widgets, each wrapped in its
  // own <svelte:boundary>. Break one — the others keep running.
  // ─────────────────────────────────────────────────────────────

  // Widget A — a counter that crashes at a threshold
  let counterA: number = $state(0);

  function computeA(n: number): string {
    if (n > 5) {
      throw new Error(\`Counter overflow: \${n} > 5 (this was intentional)\`);
    }
    return \`result = \${n * 10}\`;
  }

  // Widget B — parse some user-entered JSON
  let jsonInput: string = $state('{ "name": "svelte", "version": 5 }');
  function parseJson(src: string) {
    // Throws on invalid JSON — the boundary catches it
    return JSON.parse(src);
  }

  // Widget C — simulated network call via $effect that can fail
  let endpoint: 'users' | 'products' | 'broken' = $state('users');
  let attemptCount: number = $state(0);
  let data: { id: number; label: string }[] = $state([]);
  $effect(() => {
    attemptCount++;
    if (endpoint === 'broken') {
      throw new Error('Endpoint "/broken" returned 500 Internal Server Error');
    }
    data =
      endpoint === 'users'
        ? [{ id: 1, label: 'Alice' }, { id: 2, label: 'Bob' }]
        : [{ id: 1, label: 'Widget' }, { id: 2, label: 'Gadget' }];
  });

  // Widget D — retry counter logic
  let retryCount: number = $state(0);
  const MAX_RETRIES = 3;
  let forceFailD: boolean = $state(true);
  function riskyD(): string {
    if (forceFailD) {
      throw new Error('Operation failed — intermittent error');
    }
    return 'success on attempt ' + (retryCount + 1);
  }
</script>

<h1>&lt;svelte:boundary&gt; — Error Recovery</h1>

<p class="lede">
  Each card below is wrapped in its own boundary. Crash one on purpose and
  watch the others keep working.
</p>

<div class="grid">
  <!-- WIDGET A — render-time error -->
  <svelte:boundary>
    <div class="card">
      <h2>A. Counter</h2>
      <p>Increment past 5 to crash this widget only.</p>
      <p class="display">{computeA(counterA)}</p>
      <div class="actions">
        <button onclick={() => counterA++}>Increment</button>
        <button class="secondary" onclick={() => counterA = 0}>Zero</button>
      </div>
      <p class="value">current: {counterA}</p>
    </div>

    {#snippet failed(error, reset)}
      <div class="card error">
        <h2>A. Counter crashed</h2>
        <pre class="msg">{error instanceof Error ? error.message : String(error)}</pre>
        <button onclick={() => { counterA = 0; reset(); }}>
          Reset counter & recover
        </button>
      </div>
    {/snippet}
  </svelte:boundary>

  <!-- WIDGET B — JSON parse errors -->
  <svelte:boundary>
    <div class="card">
      <h2>B. Live JSON parser</h2>
      <textarea bind:value={jsonInput} rows="4"></textarea>
      {#if jsonInput}
        <pre class="display">{JSON.stringify(parseJson(jsonInput), null, 2)}</pre>
      {/if}
    </div>

    {#snippet failed(error, reset)}
      <div class="card error">
        <h2>B. Invalid JSON</h2>
        <pre class="msg">{error instanceof Error ? error.message : String(error)}</pre>
        <button onclick={() => { jsonInput = '{}'; reset(); }}>
          Replace with {'{}'} & recover
        </button>
      </div>
    {/snippet}
  </svelte:boundary>

  <!-- WIDGET C — effect-time error -->
  <svelte:boundary>
    <div class="card">
      <h2>C. Data loader</h2>
      <p>Switch endpoints. "broken" throws inside an $effect.</p>
      <div class="actions">
        <button onclick={() => endpoint = 'users'}>/users</button>
        <button onclick={() => endpoint = 'products'}>/products</button>
        <button class="danger" onclick={() => endpoint = 'broken'}>/broken</button>
      </div>
      <ul class="rows">
        {#each data as row (row.id)}
          <li>#{row.id} — {row.label}</li>
        {/each}
      </ul>
      <p class="value">attempts: {attemptCount}</p>
    </div>

    {#snippet failed(error, reset)}
      <div class="card error">
        <h2>C. Load failed</h2>
        <pre class="msg">{error instanceof Error ? error.message : String(error)}</pre>
        <button onclick={() => { endpoint = 'users'; reset(); }}>
          Fall back to /users
        </button>
      </div>
    {/snippet}
  </svelte:boundary>

  <!-- WIDGET D — retry counter with max attempts -->
  <svelte:boundary>
    <div class="card">
      <h2>D. Retry with limit</h2>
      <p class="display">{riskyD()}</p>
    </div>

    {#snippet failed(error, reset)}
      <div class="card error">
        <h2>D. Failed (attempt {retryCount + 1} / {MAX_RETRIES})</h2>
        <pre class="msg">{error instanceof Error ? error.message : String(error)}</pre>
        {#if retryCount < MAX_RETRIES - 1}
          <button onclick={() => { retryCount++; reset(); }}>
            Retry ({MAX_RETRIES - retryCount - 1} attempts remaining)
          </button>
        {:else}
          <p class="warn">Maximum retries exhausted. Manual intervention required.</p>
          <button onclick={() => { retryCount = 0; forceFailD = false; reset(); }}>
            Fix & reset
          </button>
        {/if}
      </div>
    {/snippet}
  </svelte:boundary>
</div>

<!-- Outer "last resort" boundary wrapping an inner one -->
<section class="nested">
  <h2>Nested: inner catches, outer is last resort</h2>
  <p class="hint">
    Inner boundary handles most errors. If the failed snippet itself
    throws, the outer boundary takes over.
  </p>
  <svelte:boundary>
    <svelte:boundary>
      {@render brokenInner()}

      {#snippet failed(error, reset)}
        <div class="card error">
          <p><strong>Inner caught:</strong> {error instanceof Error ? error.message : error}</p>
          <button onclick={reset}>Inner reset</button>
        </div>
      {/snippet}
    </svelte:boundary>

    {#snippet failed(error, reset)}
      <div class="card error critical">
        <strong>Outer last-resort:</strong>
        {error instanceof Error ? error.message : error}
        <button onclick={reset}>Outer reset</button>
      </div>
    {/snippet}
  </svelte:boundary>
</section>

{#snippet brokenInner()}
  <div class="card">
    <p>(inner content — healthy)</p>
  </div>
{/snippet}

<style>
  h1 { color: #2d3436; }
  .lede { color: #636e72; font-size: 0.9rem; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
  .card {
    padding: 1rem; background: #f8f9fa; border-radius: 10px;
    border: 1px solid #dfe6e9;
  }
  .card h2 { margin: 0 0 0.5rem; font-size: 1rem; color: #2d3436; }
  .card.error {
    background: #fff5f5; border: 2px solid #ff7675;
  }
  .card.error h2 { color: #d63031; }
  .card.error.critical { background: #fab1a0; }
  .display {
    background: white; padding: 0.5rem 0.75rem; border-radius: 6px;
    font-family: ui-monospace, monospace; font-size: 0.85rem;
    margin: 0.5rem 0; color: #2d3436;
  }
  .msg {
    background: rgba(255,255,255,0.7); padding: 0.5rem;
    border-radius: 4px; font-size: 0.78rem; color: #d63031;
    white-space: pre-wrap; word-break: break-word; margin: 0.5rem 0;
  }
  textarea {
    width: 100%; padding: 0.5rem; border-radius: 4px;
    border: 1px solid #ddd; font-family: ui-monospace, monospace;
    font-size: 0.82rem; box-sizing: border-box;
  }
  .actions { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-top: 0.5rem; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #0984e3; color: white; cursor: pointer;
    font-weight: 600; font-size: 0.82rem;
  }
  button:hover { background: #0770c0; }
  button.secondary { background: #b2bec3; }
  button.danger { background: #d63031; }
  .rows { list-style: none; padding: 0; margin: 0.5rem 0; font-size: 0.85rem; }
  .rows li { padding: 0.2rem 0; }
  .value { font-size: 0.78rem; color: #636e72; margin-top: 0.25rem; }
  .warn { color: #d63031; font-weight: 600; font-size: 0.85rem; }

  .nested { margin-top: 1.5rem; padding: 1rem; background: #fff8e1; border-radius: 10px; }
  .nested h2 { margin: 0 0 0.5rem; color: #b8860b; font-size: 1rem; }
  .hint { font-size: 0.82rem; color: #7c5a00; }
  p { margin: 0.25rem 0; font-size: 0.85rem; color: #636e72; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
