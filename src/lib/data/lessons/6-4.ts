import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-4',
		title: '$effect: Side Effects',
		phase: 2,
		module: 6,
		lessonIndex: 4
	},
	description: `$effect runs code whenever its reactive dependencies change. It's for side effects — things that interact with the outside world: logging, DOM manipulation, network requests, timers, and browser APIs.

Svelte automatically tracks which reactive values you read inside $effect and re-runs the function when any of them change. You can return a cleanup function that runs before the next execution or when the component is destroyed.

The golden rule: $effect is for syncing reactive state with the outside world. If you're just computing a new value from state, use $derived instead.`,
	objectives: [
		'Use $effect to run side effects when reactive values change',
		'Return a cleanup function from $effect for proper teardown',
		'Understand automatic dependency tracking in effects',
		'Distinguish between pure computation ($derived) and side effects ($effect)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let count = $state(0);
  let name = $state('world');
  let logEntries = $state([]);

  // Effect 1: Log when count changes
  $effect(() => {
    const entry = \`Count changed to \${count} at \${new Date().toLocaleTimeString()}\`;
    logEntries = [...logEntries.slice(-9), entry];
  });

  // Effect 2: Update document title
  $effect(() => {
    document.title = \`Hello, \${name}! (count: \${count})\`;
  });

  // Effect 3: DOM measurement after render
  let paragraphEl = $state(null);
  let paragraphHeight = $state(0);

  $effect(() => {
    if (paragraphEl) {
      // This runs after the DOM updates
      paragraphHeight = paragraphEl.getBoundingClientRect().height;
    }
  });

  // Effect 4: Cleanup demonstration
  let ticking = $state(false);
  let tickCount = $state(0);

  $effect(() => {
    if (!ticking) return;

    // Side effect: set up an interval
    const id = setInterval(() => {
      tickCount++;
    }, 1000);

    // Cleanup: clear interval when ticking becomes false
    // or when component is destroyed
    return () => {
      clearInterval(id);
    };
  });

  function clearLog() {
    logEntries = [];
  }
</script>

<h1>$effect: Side Effects</h1>

<section>
  <h2>Effect: Logging State Changes</h2>
  <div class="controls">
    <button onclick={() => count++}>Increment ({count})</button>
    <button onclick={() => count = 0}>Reset</button>
  </div>
  <div class="log">
    <div class="log-header">
      <strong>Effect Log</strong>
      <button class="small" onclick={clearLog}>Clear</button>
    </div>
    {#each logEntries as entry}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Click the button to see effect run...</div>
    {/each}
  </div>
</section>

<section>
  <h2>Effect: Document Title</h2>
  <label>
    Name: <input bind:value={name} />
  </label>
  <p class="info">Look at your browser tab — the title updates via $effect!</p>
  <code>document.title = "Hello, {name}! (count: {count})"</code>
</section>

<section>
  <h2>Effect: DOM Measurement</h2>
  <p bind:this={paragraphEl} class="measured">
    This paragraph is being measured by an $effect after each render.
    The name is "{name}" and the count is {count}.
    {count > 5 ? 'The count is getting high! This text makes the paragraph taller.' : ''}
    {count > 10 ? 'Even more text now! Effects re-measure automatically.' : ''}
  </p>
  <p>Measured height: <strong>{paragraphHeight.toFixed(1)}px</strong></p>
</section>

<section>
  <h2>Effect: Cleanup (Timer)</h2>
  <div class="controls">
    <button onclick={() => ticking = !ticking}>
      {ticking ? 'Stop Timer' : 'Start Timer'}
    </button>
    <span class="tick-display">Ticks: {tickCount}</span>
  </div>
  <p class="info">
    When you stop the timer, the cleanup function runs <code>clearInterval()</code>.
    Without cleanup, intervals would leak and stack up!
  </p>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .controls { display: flex; gap: 0.5rem; align-items: center; }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:hover { background: #4338ca; }
  button.small { padding: 0.2rem 0.5rem; font-size: 0.75rem; background: #888; }
  .log {
    margin-top: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    max-height: 200px;
    overflow-y: auto;
  }
  .log-header {
    display: flex;
    justify-content: space-between;
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
  label { display: flex; align-items: center; gap: 0.5rem; }
  input { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
  .info { font-size: 0.85rem; color: #666; }
  code { background: #e8e8e8; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.85em; }
  .measured {
    background: #e8f5e9;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid #c8e6c9;
  }
  .tick-display {
    font-size: 1.3rem;
    font-weight: bold;
    color: #4f46e5;
    font-variant-numeric: tabular-nums;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
