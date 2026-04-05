import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-4',
		title: '$effect: Side Effects',
		phase: 2,
		module: 6,
		lessonIndex: 4
	},
	description: `<code>$effect</code> runs code whenever its reactive dependencies change. It's for **side effects** — things that interact with the outside world: logging, DOM manipulation, network requests, timers, and browser APIs.

Svelte automatically tracks which reactive values you read inside <code>$effect</code> and re-runs the function when any of them change. You can return a **cleanup function** that runs right before the next execution (or when the component is destroyed). Cleanup is where you cancel timers, remove listeners, and close sockets.

The golden rule: <code>$effect</code> is for syncing reactive state with something **outside** Svelte's reactive system. If you're just computing a new value from existing state, use <code>$derived</code> instead — you'll learn why in the next lesson.`,
	objectives: [
		'Use $effect to run side effects when reactive values change',
		'Return a cleanup function from $effect for proper teardown',
		'Understand automatic dependency tracking in effects',
		'Sync state to external systems (document.title, localStorage, DOM)',
		'Distinguish between pure computation ($derived) and side effects ($effect)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ===============================================================
  // 1. Logging effect — run code when state changes
  // ===============================================================
  let count = $state(0);
  let name = $state('world');
  let logEntries = $state([]);

  $effect(() => {
    // Reading count here makes it a dependency.
    // The effect re-runs every time count changes.
    const entry = \`[\${new Date().toLocaleTimeString()}] count changed to \${count}\`;
    logEntries = [...logEntries.slice(-9), entry];
  });

  // ===============================================================
  // 2. Sync to document.title — a classic external side effect
  // ===============================================================
  $effect(() => {
    document.title = \`Hello, \${name}! (count: \${count})\`;
  });

  // ===============================================================
  // 3. Sync to localStorage — persist state to the browser
  // ===============================================================
  let draft = $state('');

  // Load once on mount. We use a nested effect to read storage
  // without creating a dependency on draft itself.
  $effect(() => {
    const saved = localStorage.getItem('effect-demo-draft');
    if (saved !== null) draft = saved;
  });

  $effect(() => {
    // Runs whenever draft changes — saves the new value.
    localStorage.setItem('effect-demo-draft', draft);
  });

  // ===============================================================
  // 4. DOM measurement after render
  // ===============================================================
  let paragraphEl = $state(null);
  let paragraphHeight = $state(0);
  let paragraphWidth = $state(0);

  $effect(() => {
    // Read the things we care about so the effect re-runs.
    count;
    name;
    if (!paragraphEl) return;
    // DOM is already up to date by the time effects run.
    const rect = paragraphEl.getBoundingClientRect();
    paragraphHeight = rect.height;
    paragraphWidth = rect.width;
  });

  // ===============================================================
  // 5. Cleanup demonstration — interval timer
  // ===============================================================
  let ticking = $state(false);
  let tickCount = $state(0);

  $effect(() => {
    if (!ticking) return;

    // Side effect: set up an interval.
    const id = setInterval(() => {
      tickCount++;
    }, 1000);

    // Cleanup: clear interval when ticking becomes false
    // or when this component unmounts. Without this, toggling
    // rapidly would leak multiple live intervals.
    return () => clearInterval(id);
  });

  // ===============================================================
  // 6. External subscription — window events with cleanup
  // ===============================================================
  let keyPressed = $state('(press any key)');
  let keyCount = $state(0);

  $effect(() => {
    function onKey(event) {
      keyPressed = event.key;
      keyCount++;
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function clearLog() {
    logEntries = [];
  }
</script>

<h1>$effect: Side Effects</h1>

<p class="lead">
  <code>$effect</code> is how you reach <em>out</em> of your reactive graph — to the DOM,
  the network, the console, timers, or any other non-Svelte world.
</p>

<section>
  <h2>1. Logging State Changes</h2>
  <div class="row">
    <button onclick={() => count++}>count: {count}</button>
    <button onclick={() => count--} class="secondary">-1</button>
    <button onclick={() => (count = 0)} class="secondary">reset</button>
  </div>
  <div class="log">
    <div class="log-header">
      <strong>Effect Log (last 10)</strong>
      <button class="small" onclick={clearLog}>Clear</button>
    </div>
    {#each logEntries as entry, i (i + entry)}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Click the button to see effect run...</div>
    {/each}
  </div>
</section>

<section>
  <h2>2. document.title</h2>
  <label>Name: <input bind:value={name} /></label>
  <p class="info">Look at your browser tab title — the effect syncs it live!</p>
  <code>document.title = "Hello, {name}! (count: {count})"</code>
</section>

<section>
  <h2>3. Persist to localStorage</h2>
  <label class="block">
    Draft (auto-saves on every keystroke):
    <textarea bind:value={draft} rows="3" placeholder="Type something..."></textarea>
  </label>
  <p class="info">Refresh the page — your text comes back.</p>
</section>

<section>
  <h2>4. DOM Measurement</h2>
  <p bind:this={paragraphEl} class="measured">
    This paragraph is measured by an $effect every time count or name changes.
    The name is "{name}" and the count is {count}.
    {count > 5 ? 'The count is getting high, adding more text!' : ''}
    {count > 10 ? 'Even more text now — effects re-measure automatically.' : ''}
  </p>
  <p class="measurement">
    Measured: <strong>{paragraphWidth.toFixed(0)} &times; {paragraphHeight.toFixed(0)}px</strong>
  </p>
</section>

<section>
  <h2>5. Cleanup Is Not Optional: Timers</h2>
  <div class="row">
    <button onclick={() => (ticking = !ticking)}>
      {ticking ? 'Stop Timer' : 'Start Timer'}
    </button>
    <span class="tick-display">Ticks: {tickCount}</span>
  </div>
  <p class="info">
    When you stop, the cleanup function calls <code>clearInterval()</code>. Without it,
    toggling ten times would leak ten live intervals incrementing simultaneously.
  </p>
</section>

<section>
  <h2>6. Window Event Listener</h2>
  <div class="key-card">
    <div class="key-big">{keyPressed}</div>
    <div class="key-count">total keys: {keyCount}</div>
  </div>
  <p class="info">
    The effect adds a <code>keydown</code> listener and returns a cleanup that removes it.
    Click somewhere in this page and press a key.
  </p>
</section>

<div class="reminder">
  <strong>Remember:</strong> effects are for <em>side effects</em>. If all you're doing is
  computing a new value from existing state, use <code>$derived</code> — it's simpler,
  faster, and doesn't require cleanup.
</div>

<style>
  h1 { color: #333; }
  .lead { color: #555; max-width: 720px; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 10px; }
  section h2 { margin-top: 0; }
  .row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:hover { background: #4338ca; }
  button.secondary { background: #6b7280; }
  button.small { padding: 0.2rem 0.5rem; font-size: 0.75rem; background: #888; }

  .log {
    margin-top: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    max-height: 220px;
    overflow-y: auto;
    background: white;
  }
  .log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: #f0f0f0;
    border-bottom: 1px solid #ddd;
  }
  .log-entry {
    padding: 0.35rem 0.5rem;
    font-family: monospace;
    font-size: 0.8rem;
    border-bottom: 1px solid #f0f0f0;
  }
  .log-entry.empty { color: #999; font-style: italic; }

  label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
  label.block { display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem; }
  input, textarea {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
  }
  textarea { width: 100%; box-sizing: border-box; }
  .info { font-size: 0.85rem; color: #666; }
  code { background: #e8e8e8; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.85em; }

  .measured {
    background: #e8f5e9;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid #c8e6c9;
  }
  .measurement { font-family: monospace; color: #4f46e5; }

  .tick-display {
    font-size: 1.3rem;
    font-weight: bold;
    color: #4f46e5;
    font-variant-numeric: tabular-nums;
  }

  .key-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
    max-width: 260px;
  }
  .key-big {
    font-family: monospace;
    font-size: 2rem;
    font-weight: bold;
    color: #4f46e5;
  }
  .key-count { font-size: 0.8rem; color: #888; }

  .reminder {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1.5rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
