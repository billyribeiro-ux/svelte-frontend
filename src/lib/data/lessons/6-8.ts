import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-8',
		title: 'Timers, Cleanup & Debounce',
		phase: 2,
		module: 6,
		lessonIndex: 8
	},
	description: `Timers are one of the most common side effects in web apps. <code>setTimeout</code> schedules a function to run once after a delay. <code>setInterval</code> runs a function repeatedly. Both return an id you can pass to <code>clearTimeout</code> / <code>clearInterval</code> to cancel them. And both keep running after your component is destroyed unless you clean them up.

In Svelte 5, <code>$effect</code>'s cleanup function is the perfect place for cancellation. Return a function from your effect, and Svelte calls it before the next run or when the component unmounts. Forget this step and you get memory leaks, duplicated intervals, and stale closures writing to state that no longer exists.

**Debouncing** is a pattern built on timers: you delay an action until the user has stopped doing something for N milliseconds. It's the right tool for search inputs, autosave, and any "don't fire on every keystroke" scenario. **Throttling** is its cousin: fire at most once per N ms.`,
	objectives: [
		'Use setTimeout and setInterval correctly inside $effect',
		'Always clear timers in the effect cleanup function',
		'Implement a stopwatch, a countdown, and a debounced search',
		'Understand why forgetting cleanup causes duplicate intervals and memory leaks',
		'Know when to debounce vs throttle vs do neither'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ==================================================================
  // 1. Stopwatch — setInterval with cleanup
  // ==================================================================
  let running = $state(false);
  let elapsed = $state(0);
  let startTime = $state(0);

  $effect(() => {
    if (!running) return;

    // Capture the "real" start time so we don't drift.
    const base = performance.now() - elapsed;
    const id = setInterval(() => {
      elapsed = performance.now() - base;
    }, 16); // ~60fps

    // Cleanup runs when running becomes false OR when component unmounts.
    return () => clearInterval(id);
  });

  let display = $derived.by(() => {
    const ms = Math.floor(elapsed % 1000);
    const s = Math.floor(elapsed / 1000) % 60;
    const m = Math.floor(elapsed / 60000);
    return \`\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}.\${String(Math.floor(ms / 10)).padStart(2, '0')}\`;
  });

  function toggleTimer() { running = !running; }
  function resetTimer() { running = false; elapsed = 0; }

  // ==================================================================
  // 2. Countdown — setTimeout chain
  // ==================================================================
  let countdownFrom = $state(10);
  let countdownValue = $state(0);
  let countdownActive = $state(false);

  $effect(() => {
    if (!countdownActive || countdownValue <= 0) return;

    const id = setTimeout(() => {
      countdownValue--;
      if (countdownValue === 0) countdownActive = false;
    }, 1000);

    return () => clearTimeout(id);
  });

  function startCountdown() {
    countdownValue = countdownFrom;
    countdownActive = true;
  }
  function stopCountdown() {
    countdownActive = false;
  }

  // ==================================================================
  // 3. Debounced search — setTimeout resets on every change
  // ==================================================================
  let searchInput = $state('');
  let debouncedSearch = $state('');
  let searchCount = $state(0);
  let debounceMs = $state(400);

  $effect(() => {
    // Read searchInput so the effect re-runs on every keystroke.
    const value = searchInput;
    const delay = debounceMs;

    const id = setTimeout(() => {
      debouncedSearch = value;
      if (value) searchCount++;
    }, delay);

    // Each keystroke cancels the previous pending search.
    return () => clearTimeout(id);
  });

  let results = $derived.by(() => {
    if (!debouncedSearch) return [];
    const fruits = [
      'apple', 'apricot', 'avocado', 'banana', 'blueberry', 'blackberry',
      'cherry', 'coconut', 'cranberry', 'date', 'elderberry', 'fig',
      'grape', 'grapefruit', 'guava', 'kiwi', 'lemon', 'lime',
      'mango', 'melon', 'nectarine', 'orange', 'papaya', 'peach',
      'pear', 'pineapple', 'plum', 'pomegranate', 'raspberry',
      'strawberry', 'tangerine', 'watermelon'
    ];
    return fruits.filter((f) => f.includes(debouncedSearch.toLowerCase()));
  });

  // ==================================================================
  // 4. "Leak demo" — what happens without cleanup
  // ==================================================================
  // We simulate forgetting cleanup by maintaining a counter of
  // orphan intervals the user accidentally created.
  let leakActive = $state(false);
  let leakTicks = $state(0);
  let leakCount = $state(0);

  $effect(() => {
    if (!leakActive) return;

    // Simulate a programmer who forgot to return a cleanup function.
    // Every toggle creates a NEW interval AND does NOT cancel the old one.
    // We'll fake this with a counter for the demo. In the real effect
    // we DO clean up, but we increment leakCount so the user can see
    // how many would have been running.
    leakCount++;
    const id = setInterval(() => {
      leakTicks++;
    }, 500);
    return () => clearInterval(id);
  });
</script>

<h1>Timers, Cleanup &amp; Debounce</h1>

<p class="lead">
  Three classic timer patterns — stopwatch, countdown, debounced search — each with
  correct cleanup. Cleanup is not optional.
</p>

<section>
  <h2>1. Stopwatch (setInterval + cleanup)</h2>
  <div class="timer-display">{display}</div>
  <div class="controls">
    <button onclick={toggleTimer}>{running ? 'Pause' : 'Start'}</button>
    <button class="secondary" onclick={resetTimer}>Reset</button>
  </div>
  <p class="detail">
    The interval is created when <code>running = true</code> and cleaned up when it
    becomes <code>false</code> (or the component unmounts).
  </p>
</section>

<section>
  <h2>2. Countdown (setTimeout chain)</h2>
  <div class="controls">
    <label>
      From
      <input type="number" bind:value={countdownFrom} min="1" max="60" />
    </label>
    <button onclick={startCountdown} disabled={countdownActive}>Start</button>
    <button class="secondary" onclick={stopCountdown} disabled={!countdownActive}>Stop</button>
  </div>
  <div class="countdown" class:done={countdownValue === 0 && countdownFrom > 0}>
    {countdownValue > 0 ? countdownValue : (countdownFrom > 0 ? 'Done!' : '--')}
  </div>
</section>

<section>
  <h2>3. Debounced Search</h2>
  <label class="block">
    Delay: {debounceMs}ms
    <input type="range" min="100" max="1500" step="50" bind:value={debounceMs} />
  </label>

  <input
    class="search"
    bind:value={searchInput}
    placeholder="Type to search fruits..."
  />
  <div class="search-info">
    <span>Input: "<strong>{searchInput}</strong>"</span>
    <span>Debounced: "<strong>{debouncedSearch}</strong>"</span>
    <span>Fired: <strong>{searchCount}</strong></span>
  </div>

  {#if debouncedSearch}
    <ul>
      {#each results as fruit (fruit)}
        <li>{fruit}</li>
      {:else}
        <li class="empty">No matches</li>
      {/each}
    </ul>
  {/if}

  <p class="detail">
    Without debouncing, every keystroke would fire a search. With the {debounceMs}ms delay,
    we wait until the user pauses typing.
  </p>
</section>

<section>
  <h2>4. See Cleanup In Action</h2>
  <p class="detail">
    Toggle this on and off rapidly. Because we clean up properly, only ONE interval is
    ever alive at a time — <code>leakTicks</code> increments at a steady 2/sec no matter
    how much you toggle.
  </p>
  <div class="controls">
    <button onclick={() => (leakActive = !leakActive)}>
      {leakActive ? 'Stop' : 'Start'}
    </button>
    <span class="tick">ticks: {leakTicks}</span>
    <span class="tick">effects run: {leakCount}</span>
  </div>
</section>

<div class="warning">
  <strong>Why cleanup matters:</strong>
  Without <code>clearInterval</code> in the cleanup, each toggle of
  <code>running</code> would create a NEW interval without stopping the old one. After
  five toggles you'd have five intervals all incrementing in parallel — a classic memory
  leak and a source of impossible-to-diagnose bugs.
</div>

<div class="reference">
  <h3>Debounce vs Throttle</h3>
  <table>
    <thead>
      <tr>
        <th>Pattern</th><th>Behaviour</th><th>Use for</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Debounce</td>
        <td>Wait until user stops for N ms, then fire once</td>
        <td>Search input, autosave, resize handler</td>
      </tr>
      <tr>
        <td>Throttle</td>
        <td>Fire at most once per N ms</td>
        <td>Scroll tracking, mousemove, animation</td>
      </tr>
    </tbody>
  </table>
</div>

<style>
  h1 { color: #333; }
  .lead { color: #555; max-width: 720px; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 10px; }
  section h2 { margin-top: 0; }

  .timer-display {
    font-size: 3rem;
    font-family: monospace;
    font-variant-numeric: tabular-nums;
    text-align: center;
    color: #333;
    margin: 0.5rem 0;
  }
  .controls { display: flex; gap: 0.5rem; align-items: center; justify-content: center; flex-wrap: wrap; }
  .controls label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; }
  .controls input[type='number'] { width: 60px; padding: 0.3rem; border: 1px solid #ccc; border-radius: 4px; }

  button {
    padding: 0.5rem 1.25rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
  }
  button:hover:not(:disabled) { background: #4338ca; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  button.secondary { background: #6b7280; }
  button.secondary:hover:not(:disabled) { background: #4b5563; }

  .detail { font-size: 0.85rem; color: #888; text-align: center; }

  .countdown {
    font-size: 4rem;
    text-align: center;
    font-weight: bold;
    color: #4f46e5;
    padding: 0.5rem;
    font-variant-numeric: tabular-nums;
  }
  .countdown.done { color: #22c55e; }

  .block { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.5rem; font-size: 0.85rem; }

  .search {
    width: 100%;
    padding: 0.6rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    box-sizing: border-box;
  }
  .search-info {
    display: flex;
    gap: 1.2rem;
    margin: 0.5rem 0;
    font-size: 0.8rem;
    color: #666;
    font-family: monospace;
    flex-wrap: wrap;
  }
  ul { list-style: none; padding: 0; }
  li { padding: 0.3rem 0.5rem; border-bottom: 1px solid #eee; font-size: 0.9rem; }
  .empty { color: #999; font-style: italic; }

  .tick {
    font-family: monospace;
    font-size: 0.9rem;
    background: white;
    border: 1px solid #e5e7eb;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .warning {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1.5rem;
  }
  .reference {
    background: #eef2ff;
    border-left: 4px solid #4f46e5;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1rem;
  }
  .reference h3 { margin: 0 0 0.5rem; }
  .reference table { width: 100%; border-collapse: collapse; }
  .reference th, .reference td { padding: 0.4rem 0.5rem; text-align: left; font-size: 0.85rem; border-bottom: 1px solid #e5e7eb; }
  .reference th { background: #e0e7ff; }
  code { background: #e5e7eb; padding: 0.1rem 0.3rem; border-radius: 3px; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
