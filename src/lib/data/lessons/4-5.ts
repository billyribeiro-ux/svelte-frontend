import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '4-5',
		title: 'Scope & Closures',
		phase: 1,
		module: 4,
		lessonIndex: 5
	},
	description: `A **closure** is created every time a function is defined: the function "remembers" the variables from the scope where it was created, and it can access them later, even if that outer scope has finished executing. This sounds abstract, but it's working invisibly in almost every line of Svelte code you write. Every event handler you attach in a component is a closure over that component's state. Every cleanup function you return from \`$effect\` is a closure over whatever it captured. Every callback prop you pass to a child is a closure.

The mental model: imagine each function carries an invisible backpack. When the function is created, it packs into that backpack a reference to every variable in its surrounding scope. Later, even if you call the function from somewhere completely unrelated — a setTimeout, an event listener, another module — it still has that backpack. It can read and even modify those captured variables. That's closure.

Why is this powerful? Closures give you **private state** without classes. The classic pattern is a factory function: \`makeCounter()\` returns a new function that privately holds its own count. No one outside can touch that count except by calling the returned function. It's encapsulation through scoping. Before \`$state\`, this was *the* way to hold state in JavaScript — and it's still the foundation of how \`$state\` works under the hood.

Closures also solve the "each iteration captures its own value" problem that \`var\` used to famously break. With \`let\` and \`const\`, each turn of a loop creates a fresh binding, so arrow functions defined inside a loop each capture their own iteration's values. This is why handlers inside a Svelte \`{#each}\` block work correctly — each handler is a closure over that iteration's item.

The most important practical application: **$effect cleanup**. When you return a function from an \`$effect\`, Svelte stores it and calls it later (on re-run or unmount) to clean up. That cleanup function is a closure over whatever local variables the effect set up — the interval id, the event listener, the subscription handle. Without closures, you'd have no way to remember what to clean up.

Pitfalls: the classic \`var\` in a loop bug (all handlers share the same variable — use \`let\` instead), accidentally closing over stale values when you expected fresh ones (a common React bug, rarer in Svelte thanks to runes), and creating memory leaks by holding closures that reference large objects for longer than needed.`,
	objectives: [
		'Explain closures as functions that remember variables from their defining scope',
		'Use factory functions like makeCounter to create encapsulated private state',
		'Understand why each iteration of a let/const loop captures its own binding',
		'Recognize that event handlers and callback props are closures over component state',
		'Write $effect cleanup functions that close over interval IDs and subscriptions',
		'Use IIFEs (Immediately Invoked Function Expressions) to create module-private state'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === SCOPE & CLOSURES ===
  // A closure is created every time a function is defined: the function
  // "remembers" the variables from its surrounding scope, even after
  // that scope has finished executing. This is one of JavaScript's
  // most powerful features and it's working invisibly in almost every
  // line of Svelte code you write.

  let log = $state([]);
  function addLog(msg) {
    log = [\\\`\\\${new Date().toLocaleTimeString()} — \\\${msg}\\\`, ...log].slice(0, 14);
  }

  // === Example 1: Event handlers are closures ===
  // The increment() function closes over \\\`count\\\` — it can read and
  // modify that variable even though it's defined outside of increment.
  let count = $state(0);
  function increment() {
    count += 1;
    addLog(\\\`Count is now \\\${count}\\\`);
  }

  // === Example 2: Counter factory — closures as state ===
  // makeCounter returns a function that privately holds its own count.
  // Each call to makeCounter produces a brand new, independent counter.
  // Before $state, this was the classic way to create encapsulated state.
  function makeCounter(start = 0) {
    let n = start;                     // private to this closure
    return function () {
      n += 1;                          // closure remembers 'n'
      return n;
    };
  }
  const counterA = makeCounter(0);
  const counterB = makeCounter(100);
  let aValue = $state(0);
  let bValue = $state(100);
  function callA() { aValue = counterA(); addLog(\\\`counterA → \\\${aValue}\\\`); }
  function callB() { bValue = counterB(); addLog(\\\`counterB → \\\${bValue}\\\`); }

  // === Example 3: Closure factory — configured greeters ===
  // makeGreeter returns a function with 'greeting' baked in.
  function makeGreeter(greeting) {
    return function (name) {
      return \\\`\\\${greeting}, \\\${name}!\\\`;
    };
  }
  const sayHello = makeGreeter('Hello');
  const sayHowdy = makeGreeter('Howdy');
  const sayBonjour = makeGreeter('Bonjour');
  let nameInput = $state('World');

  // === Example 4: Each iteration captures its own value ===
  // In \\\`for (const btn of buttons)\\\`, each arrow function captures
  // its own \\\`btn\\\` because \\\`const\\\` creates a new binding per iteration.
  const buttons = [
    { label: 'First',  value: 1 },
    { label: 'Second', value: 2 },
    { label: 'Third',  value: 3 }
  ];
  function handleButtonClick(btn) {
    addLog(\\\`Clicked "\\\${btn.label}" (value \\\${btn.value})\\\`);
  }

  // === Example 5: The classic \\\`var\\\` gotcha (why let/const matter) ===
  // With let, each iteration gets its own 'i'. With var, all timeouts
  // would log "3" because they'd share the SAME i.
  let gotchaResults = $state([]);
  function runGotcha() {
    gotchaResults = [];
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        gotchaResults = [...gotchaResults, \\\`let i = \\\${i}\\\`];
      }, i * 200);
    }
  }

  // === Example 6: Snapshots — capturing values at a moment ===
  let snapshots = $state([]);
  function captureSnapshot() {
    const captured = count;  // snapshot of count RIGHT NOW
    const at = new Date().toLocaleTimeString();
    snapshots = [...snapshots, { captured, at }].slice(-5);
    addLog(\\\`Snapshot: count was \\\${captured}\\\`);
  }

  // === Example 7: $effect cleanup is a closure ===
  // The function we return from $effect closes over the interval id
  // and uses it later to clean up. This is closures doing critical
  // lifecycle work in modern Svelte code.
  let timerActive = $state(false);
  let elapsed = $state(0);

  $effect(() => {
    if (!timerActive) return;

    // id is local to this $effect run
    const id = setInterval(() => { elapsed += 1; }, 1000);
    addLog(\\\`Timer started (interval id captured)\\\`);

    // Returned cleanup: a closure over 'id'
    return () => {
      clearInterval(id);
      addLog(\\\`Timer stopped (interval cleared via closure)\\\`);
    };
  });

  function toggleTimer() {
    timerActive = !timerActive;
    if (!timerActive) elapsed = 0;
  }

  // === Example 8: Module-private counters via IIFE ===
  // An Immediately Invoked Function Expression wraps private state.
  const nextId = (function () {
    let id = 0;
    return function () { return ++id; };
  })();
  let ids = $state([]);
  function generateId() {
    const newId = nextId();
    ids = [...ids, newId].slice(-8);
    addLog(\\\`Generated id: \\\${newId}\\\`);
  }
</script>

<h1>Scope & Closures</h1>

<section>
  <h2>1. Event Handlers ARE Closures</h2>
  <p class="hint">The handler function closes over the component's state variables.</p>
  <button onclick={increment}>count: {count}</button>
  <button onclick={captureSnapshot}>Capture Snapshot</button>
  {#if snapshots.length > 0}
    <div class="snapshots">
      {#each snapshots as snap, i (i)}
        <span class="snapshot">count={snap.captured} @ {snap.at}</span>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>2. Counter Factory — Closures as Private State</h2>
  <p class="hint">Each makeCounter() call creates a fully independent counter.</p>
  <div class="row">
    <button onclick={callA}>counterA → {aValue}</button>
    <button onclick={callB}>counterB → {bValue}</button>
  </div>
</section>

<section>
  <h2>3. Closure Factory — Configured Greeters</h2>
  <p class="hint">makeGreeter returns a function with 'greeting' baked in.</p>
  <input bind:value={nameInput} placeholder="Enter a name..." />
  <p>sayHello: <strong>{sayHello(nameInput)}</strong></p>
  <p>sayHowdy: <strong>{sayHowdy(nameInput)}</strong></p>
  <p>sayBonjour: <strong>{sayBonjour(nameInput)}</strong></p>
</section>

<section>
  <h2>4. Closures in Loops</h2>
  <p class="hint">Each handler captures its own btn — works correctly with let/const.</p>
  <div class="row">
    {#each buttons as btn (btn.value)}
      <button onclick={() => handleButtonClick(btn)}>
        {btn.label} (val: {btn.value})
      </button>
    {/each}
  </div>
</section>

<section>
  <h2>5. The let vs var Gotcha</h2>
  <p class="hint">With let, each loop iteration gets its own binding.</p>
  <button onclick={runGotcha}>Run setTimeout loop</button>
  <div class="gotcha">
    {#each gotchaResults as r, i (i)}<span class="snapshot">{r}</span>{/each}
  </div>
</section>

<section>
  <h2>6. $effect Cleanup Closure</h2>
  <p class="hint">The cleanup function closes over the interval id from its creation.</p>
  <button onclick={toggleTimer}>
    {timerActive ? 'Stop' : 'Start'} Timer
  </button>
  <p>Elapsed: <strong>{elapsed}s</strong></p>
</section>

<section>
  <h2>7. ID Generator (IIFE + closure)</h2>
  <p class="hint">An Immediately Invoked Function Expression wraps private state.</p>
  <button onclick={generateId}>Generate ID</button>
  <div class="row">
    {#each ids as id, i (i)}<span class="id-badge">#{id}</span>{/each}
  </div>
</section>

<section>
  <h2>Event Log</h2>
  <div class="event-log">
    {#each log as entry, i (i)}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Interact with elements above...</div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  strong { color: #222; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; margin: 6px 0; }
  .snapshots, .gotcha { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
  .snapshot { padding: 4px 8px; background: #e6f0ff; color: #3b7dd8; border-radius: 4px; font-size: 12px; font-family: monospace; }
  .id-badge { padding: 4px 10px; background: #e6f7f3; color: #2d8a6e; border-radius: 4px; font-size: 12px; font-family: monospace; }
  input { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; width: 100%; box-sizing: border-box; margin-bottom: 4px; font-family: inherit; }
  .event-log { background: #1e1e1e; border-radius: 6px; padding: 8px; max-height: 200px; overflow-y: auto; font-family: monospace; margin-top: 6px; }
  .log-entry { color: #d4d4d4; font-size: 12px; padding: 2px 8px; }
  .log-entry.empty { color: #666; font-style: italic; }
  button { padding: 6px 14px; border: 2px solid #ff3e00; background: white; color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px; font-family: inherit; }
  button:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
