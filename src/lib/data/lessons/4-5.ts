import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '4-5',
		title: 'Scope & Closures',
		phase: 1,
		module: 4,
		lessonIndex: 5
	},
	description: `Closures are one of JavaScript's most important concepts. A closure is created when a function "remembers" the variables from its surrounding scope, even after that scope has finished executing. This is why event handlers can access your component's state, why each iteration of a loop can capture its own value, and how $effect cleanup functions work.

This lesson demystifies closures with visual, interactive examples.`,
	objectives: [
		'Understand how closures capture variables from their surrounding scope',
		'Know why event handlers in loops work correctly with closures',
		'Use closures in $effect teardown for cleanup logic'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Closure basics: the handler "closes over" count
  let count = $state(0);
  let log = $state([]);

  function addLog(msg) {
    log = [\`\${new Date().toLocaleTimeString()} — \${msg}\`, ...log].slice(0, 12);
  }

  function increment() {
    count += 1;
    // This function closes over 'count' and 'addLog'
    addLog(\`Count is now \${count}\`);
  }

  // Closure in a loop: each button captures its own 'i' value
  const buttons = [
    { label: 'First', value: 1 },
    { label: 'Second', value: 2 },
    { label: 'Third', value: 3 }
  ];

  // This works because each arrow function closes over its own 'btn' from the iteration
  function handleButtonClick(btn) {
    addLog(\`Clicked "\${btn.label}" (value: \${btn.value})\`);
  }

  // Closure as a factory: makeGreeter returns a function that remembers 'greeting'
  function makeGreeter(greeting) {
    return function (name) {
      return \`\${greeting}, \${name}!\`;
    };
  }

  const sayHello = makeGreeter('Hello');
  const sayHowdy = makeGreeter('Howdy');

  let nameInput = $state('World');
  const helloResult = $derived(sayHello(nameInput));
  const howdyResult = $derived(sayHowdy(nameInput));

  // $effect with closure cleanup
  let timerActive = $state(false);
  let elapsed = $state(0);

  $effect(() => {
    if (timerActive) {
      // The cleanup function is a closure that captures 'id'
      const id = setInterval(() => {
        elapsed += 1;
      }, 1000);

      addLog('Timer started (interval created)');

      // Return cleanup — this closure remembers 'id'
      return () => {
        clearInterval(id);
        addLog('Timer stopped (interval cleared)');
      };
    }
  });

  function toggleTimer() {
    timerActive = !timerActive;
    if (!timerActive) {
      elapsed = 0;
    }
  }

  // Closure capturing stale vs fresh values
  let snapshots = $state([]);

  function captureSnapshot() {
    const captured = count; // captured is a snapshot of count at this moment
    snapshots = [
      ...snapshots,
      { captured, capturedAt: new Date().toLocaleTimeString() }
    ].slice(-5);
    addLog(\`Snapshot captured: count was \${captured}\`);
  }
</script>

<h1>Scope & Closures</h1>

<section>
  <h2>Closures in Event Handlers</h2>
  <p>The handler function "closes over" the component's state variables.</p>
  <button onclick={increment}>Count: {count}</button>
  <button onclick={captureSnapshot}>Capture Snapshot</button>
  {#if snapshots.length > 0}
    <div class="snapshots">
      {#each snapshots as snap}
        <span class="snapshot">count={snap.captured} at {snap.capturedAt}</span>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>Closures in Loops</h2>
  <p>Each button's handler captures its own <code>btn</code> variable from the iteration.</p>
  <div class="btn-row">
    {#each buttons as btn}
      <button onclick={() => handleButtonClick(btn)}>{btn.label} ({btn.value})</button>
    {/each}
  </div>
</section>

<section>
  <h2>Closure Factory</h2>
  <p><code>makeGreeter</code> returns a function that remembers the greeting.</p>
  <input bind:value={nameInput} placeholder="Enter a name..." />
  <p>sayHello("{nameInput}"): <strong>{helloResult}</strong></p>
  <p>sayHowdy("{nameInput}"): <strong>{howdyResult}</strong></p>
</section>

<section>
  <h2>$effect Cleanup Closure</h2>
  <p>The cleanup function returned from $effect is a closure that remembers the interval ID.</p>
  <button onclick={toggleTimer}>
    {timerActive ? 'Stop Timer' : 'Start Timer'}
  </button>
  <p>Elapsed: <strong>{elapsed}s</strong></p>
</section>

<section>
  <h2>Event Log</h2>
  <div class="event-log">
    {#each log as entry}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Interact with elements above...</div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
  .btn-row { display: flex; gap: 8px; margin: 8px 0; }
  .snapshots { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
  .snapshot {
    padding: 4px 8px; background: #e6f0ff; color: #569cd6; border-radius: 4px;
    font-size: 12px; font-family: monospace;
  }
  input {
    padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px;
    font-size: 13px; width: 100%; box-sizing: border-box; margin-bottom: 4px;
  }
  .event-log {
    background: #1e1e1e; border-radius: 6px; padding: 8px;
    max-height: 180px; overflow-y: auto; font-family: monospace;
  }
  .log-entry { color: #d4d4d4; font-size: 12px; padding: 2px 8px; }
  .log-entry.empty { color: #666; font-style: italic; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
