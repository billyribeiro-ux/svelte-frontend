import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-8',
		title: 'Timers, Cleanup & Debounce',
		phase: 2,
		module: 6,
		lessonIndex: 8
	},
	description: `Timers (setTimeout, setInterval) are one of the most common side effects in web apps. They run code after a delay or on a repeating schedule — but they keep running even after your component is destroyed unless you clean them up.

In Svelte 5, $effect's cleanup function is the perfect place to cancel timers. Return a function from $effect, and Svelte calls it when dependencies change or the component unmounts.

Debouncing is a pattern that delays execution until the user stops doing something (like typing). It prevents firing expensive operations on every keystroke — a must-know for search inputs and API calls.`,
	objectives: [
		'Use setTimeout and setInterval correctly inside $effect',
		'Clean up timers with clearTimeout/clearInterval in effect cleanup',
		'Implement a debounced input that waits for the user to stop typing',
		'Understand why forgetting cleanup causes memory leaks'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === Stopwatch with setInterval + cleanup ===
  let running = $state(false);
  let elapsed = $state(0);

  $effect(() => {
    if (!running) return;

    const id = setInterval(() => {
      elapsed += 10;
    }, 10);

    return () => clearInterval(id);
  });

  let display = $derived.by(() => {
    const ms = elapsed % 1000;
    const s = Math.floor(elapsed / 1000) % 60;
    const m = Math.floor(elapsed / 60000);
    return \`\${String(m).padStart(2, '0')}:\${String(s).padStart(2, '0')}.\${String(Math.floor(ms / 10)).padStart(2, '0')}\`;
  });

  function toggleTimer() { running = !running; }
  function resetTimer() { running = false; elapsed = 0; }

  // === Countdown with setTimeout ===
  let countdownFrom = $state(5);
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

  // === Debounced Search ===
  let searchInput = $state('');
  let debouncedSearch = $state('');
  let searchCount = $state(0);

  $effect(() => {
    const value = searchInput;
    const id = setTimeout(() => {
      debouncedSearch = value;
      if (value) searchCount++;
    }, 400);

    return () => clearTimeout(id);
  });

  let results = $derived.by(() => {
    if (!debouncedSearch) return [];
    const fruits = ['apple', 'apricot', 'avocado', 'banana', 'blueberry', 'cherry', 'coconut', 'date', 'elderberry', 'fig', 'grape', 'guava', 'kiwi', 'lemon', 'lime', 'mango', 'melon', 'nectarine', 'orange', 'papaya', 'peach', 'pear', 'pineapple', 'plum', 'pomegranate', 'raspberry', 'strawberry', 'watermelon'];
    return fruits.filter(f => f.includes(debouncedSearch.toLowerCase()));
  });
</script>

<h1>Timers, Cleanup & Debounce</h1>

<section>
  <h2>Stopwatch (setInterval + cleanup)</h2>
  <div class="timer-display">{display}</div>
  <div class="controls">
    <button onclick={toggleTimer}>{running ? 'Pause' : 'Start'}</button>
    <button class="secondary" onclick={resetTimer}>Reset</button>
  </div>
  <p class="detail">The interval is created when running=true and cleaned up when it becomes false.</p>
</section>

<section>
  <h2>Countdown (setTimeout chain)</h2>
  <div class="controls">
    <label>
      From: <input type="number" bind:value={countdownFrom} min="1" max="30" style="width:60px" />
    </label>
    <button onclick={startCountdown} disabled={countdownActive}>Start</button>
  </div>
  <div class="countdown" class:done={countdownValue === 0 && countdownFrom > 0}>
    {countdownValue > 0 ? countdownValue : 'Done!'}
  </div>
</section>

<section>
  <h2>Debounced Search</h2>
  <input
    class="search"
    bind:value={searchInput}
    placeholder="Type to search fruits (400ms debounce)..."
  />
  <div class="search-info">
    <span>Input: "{searchInput}"</span>
    <span>Debounced: "{debouncedSearch}"</span>
    <span>Searches fired: {searchCount}</span>
  </div>

  {#if debouncedSearch}
    <ul>
      {#each results as fruit}
        <li>{fruit}</li>
      {:else}
        <li class="empty">No matches</li>
      {/each}
    </ul>
  {/if}

  <p class="detail">Without debouncing, every keystroke would trigger a search. With the 400ms delay, we wait for the user to pause typing.</p>
</section>

<div class="warning">
  <strong>Why cleanup matters:</strong> Without <code>clearInterval</code> in the cleanup, each toggle would create a NEW interval without stopping the old one. After 5 toggles you'd have 5 intervals all incrementing — a memory leak!
</div>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .timer-display {
    font-size: 3rem;
    font-family: monospace;
    font-variant-numeric: tabular-nums;
    text-align: center;
    color: #333;
    margin: 0.5rem 0;
  }
  .controls { display: flex; gap: 0.5rem; justify-content: center; }
  button {
    padding: 0.5rem 1.5rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  }
  button:hover { background: #4338ca; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .secondary { background: #6b7280; }
  .secondary:hover { background: #4b5563; }
  .detail { font-size: 0.85rem; color: #888; text-align: center; }
  .countdown {
    font-size: 4rem;
    text-align: center;
    font-weight: bold;
    color: #4f46e5;
    padding: 0.5rem;
  }
  .countdown.done { color: #22c55e; }
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
    gap: 1.5rem;
    margin: 0.5rem 0;
    font-size: 0.8rem;
    color: #666;
    font-family: monospace;
    flex-wrap: wrap;
  }
  ul { list-style: none; padding: 0; }
  li { padding: 0.3rem 0.5rem; border-bottom: 1px solid #eee; }
  .empty { color: #999; font-style: italic; }
  .warning {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1.5rem;
  }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
