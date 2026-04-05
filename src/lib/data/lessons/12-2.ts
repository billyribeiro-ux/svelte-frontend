import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-2',
		title: 'async/await',
		phase: 4,
		module: 12,
		lessonIndex: 2
	},
	description: `async/await is syntactic sugar over Promises that makes asynchronous code read like synchronous code. An async function always returns a Promise — even if you write 'return 42', the caller gets Promise<number>. Inside an async function, 'await' pauses execution until a Promise settles, then unwraps its value (or throws its rejection).

Error handling uses familiar try/catch/finally blocks — no more .then/.catch chains to reason about. But with power comes responsibility: forgetting 'await' is the #1 async bug, and writing 'await' on each line turns parallel work into slow sequential work by accident.

This lesson covers async function syntax, error handling, and the crucial sequential-vs-parallel distinction.`,
	objectives: [
		'Write async functions and use await to unwrap Promises',
		'Handle async errors with try/catch/finally',
		'Recognize the sequential trap and fix it with Promise.all',
		'Convert .then() chains to async/await',
		'Understand that async functions always return Promises',
		'Know when NOT to await (fire-and-forget patterns)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // KEY MENTAL MODEL
  //
  // async function foo() { return 42; }
  //   ≡ function foo() { return Promise.resolve(42); }
  //
  // const x = await somePromise;
  //   ≡ somePromise.then(x => /* rest of function */)
  //
  // await only works inside async functions (or at the top level
  // of an ES module). Forgetting async → "await is a reserved word".
  // ---------------------------------------------------------------

  let log: string[] = $state([]);
  let isRunning: boolean = $state(false);
  let lastElapsed: number | null = $state(null);

  function addLog(msg: string): void {
    log = [...log, msg];
  }

  function clearLog(): void {
    log = [];
    lastElapsed = null;
  }

  // Simulated async API — deterministic delay so demos are reproducible.
  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchUser(): Promise<{ id: number; name: string }> {
    await delay(600);
    return { id: 1, name: 'Alice' };
  }

  async function fetchPosts(userId: number): Promise<string[]> {
    await delay(600);
    return ['Post A for #' + userId, 'Post B for #' + userId];
  }

  async function fetchComments(userId: number): Promise<number> {
    await delay(400);
    return userId * 10 + 42;
  }

  // A function that throws — to demo error handling
  async function riskyOperation(): Promise<string> {
    await delay(400);
    throw new Error('Server returned 500');
  }

  // -------------------------------------------------------------
  // Demo 1 — basic await
  // -------------------------------------------------------------
  async function demoBasic(): Promise<void> {
    clearLog();
    isRunning = true;

    addLog('Calling fetchUser()...');
    const user = await fetchUser();
    // Execution literally pauses here until the Promise settles.
    addLog('Got user: ' + user.name);

    addLog('Calling fetchPosts(' + user.id + ')...');
    const posts = await fetchPosts(user.id);
    addLog('Got posts: ' + posts.join(', '));

    isRunning = false;
  }

  // -------------------------------------------------------------
  // Demo 2 — try/catch/finally
  // -------------------------------------------------------------
  async function demoErrorHandling(): Promise<void> {
    clearLog();
    isRunning = true;

    try {
      addLog('Trying risky operation...');
      const result = await riskyOperation();
      addLog('Got: ' + result); // never reached
    } catch (err) {
      // Caught because the rejected Promise is rethrown by 'await'.
      const error = err as Error;
      addLog('Caught: ' + error.message);
    } finally {
      // finally is the place for cleanup: spinners, file handles,
      // DB connections, AbortControllers, etc.
      addLog('Finally: cleanup runs either way');
      isRunning = false;
    }
  }

  // -------------------------------------------------------------
  // Demo 3 — THE SEQUENTIAL TRAP
  //
  // This is by far the most common async performance bug.
  // Each 'await' blocks the next line, even though these calls
  // don't depend on each other. Total time = sum of delays.
  // -------------------------------------------------------------
  async function demoSequential(): Promise<void> {
    clearLog();
    isRunning = true;
    const start = performance.now();

    addLog('Sequential: awaiting one at a time...');
    const user = await fetchUser();            // 600ms
    addLog('  got user');
    const posts = await fetchPosts(user.id);   // +600ms
    addLog('  got ' + posts.length + ' posts');
    const comments = await fetchComments(user.id); // +400ms
    addLog('  got ' + comments + ' comments');

    lastElapsed = Math.round(performance.now() - start);
    addLog('Total: ~' + lastElapsed + 'ms');
    isRunning = false;
  }

  // -------------------------------------------------------------
  // Demo 4 — THE FIX: Promise.all
  //
  // Start all the Promises BEFORE awaiting, so they run
  // concurrently. await Promise.all waits for the slowest one.
  // Total time = max delay.
  // -------------------------------------------------------------
  async function demoParallel(): Promise<void> {
    clearLog();
    isRunning = true;
    const start = performance.now();

    addLog('Parallel: kicking off all calls at once...');
    // These calls aren't dependent — they can run concurrently.
    const [user, posts, comments] = await Promise.all([
      fetchUser(),      // 600ms ┐
      fetchPosts(1),    // 600ms ├── all run in parallel
      fetchComments(1)  // 400ms ┘
    ]);
    addLog('  got user: ' + user.name);
    addLog('  got ' + posts.length + ' posts');
    addLog('  got ' + comments + ' comments');

    lastElapsed = Math.round(performance.now() - start);
    addLog('Total: ~' + lastElapsed + 'ms — limited by slowest call');
    isRunning = false;
  }

  // -------------------------------------------------------------
  // Demo 5 — await returns the RESOLVED value
  //
  // await unwraps a Promise<T> to T. If you forget await,
  // you end up working with a Promise object, which is almost
  // always a bug — TypeScript catches most of these.
  // -------------------------------------------------------------
  async function demoForgotAwait(): Promise<void> {
    clearLog();

    const promise = fetchUser();                 // Promise<User>
    const user = await fetchUser();               // User

    addLog('typeof promise: ' + typeof promise); // "object" (Promise)
    addLog('promise instanceof Promise: ' + (promise instanceof Promise));
    addLog('typeof user: ' + typeof user);       // "object" (plain object)
    addLog('user.name: ' + user.name);

    // If we tried: promise.name → undefined (not what you want!)
    addLog('promise.name: ' + (promise as unknown as { name?: string }).name);
  }
</script>

<main>
  <h1>async/await</h1>

  <section>
    <h2>1. Basic async/await</h2>
    <p class="hint">
      <code>async</code> makes a function return a Promise. <code>await</code> pauses until the Promise settles.
    </p>
    <button onclick={demoBasic} disabled={isRunning}>Run</button>
    <pre>{\`async function loadData() {
  const user  = await fetchUser();           // pause here
  const posts = await fetchPosts(user.id);   // then here
  return { user, posts };  // wrapped in a Promise automatically
}

// Caller:
const data = await loadData();   // must be inside async too\`}</pre>
  </section>

  <section>
    <h2>2. Error Handling</h2>
    <button onclick={demoErrorHandling} disabled={isRunning}>Run</button>
    <pre>{\`async function safeFetch() {
  try {
    const data = await riskyOperation();
    return data;
  } catch (err) {
    // Rejected promises become thrown errors here
    console.error('Failed:', (err as Error).message);
    return null;
  } finally {
    // Runs on both success and failure
    stopSpinner();
  }
}\`}</pre>
  </section>

  <section class="compare">
    <h2>3. Sequential vs Parallel — The Biggest Async Bug</h2>
    <div class="button-row">
      <button onclick={demoSequential} disabled={isRunning}>Sequential (~1600ms)</button>
      <button onclick={demoParallel} disabled={isRunning}>Parallel (~600ms)</button>
    </div>
    {#if lastElapsed !== null}
      <p class="elapsed">Last run: <strong>{lastElapsed}ms</strong></p>
    {/if}
    <pre>{\`// ❌ Slow — each await blocks the next line
const a = await fetchA();  // 600ms
const b = await fetchB();  // 600ms  (only starts after A)
const c = await fetchC();  // 400ms  → total: 1600ms

// ✅ Fast — start all, then await once
const [a, b, c] = await Promise.all([
  fetchA(),  // 600ms ┐
  fetchB(),  // 600ms ├─ run concurrently
  fetchC()   // 400ms ┘
]);                   // → total: 600ms

// Rule of thumb: if calls don't depend on each other,
// start them all before the first await.\`}</pre>
  </section>

  <section>
    <h2>4. await Unwraps — Don't Forget It</h2>
    <button onclick={demoForgotAwait} disabled={isRunning}>Run</button>
    <pre>{\`const promise = fetchUser();         // Promise<User>
const user    = await fetchUser();   // User

promise.name   // undefined  ← forgot await!
user.name      // 'Alice'    ← correct\`}</pre>
  </section>

  <section>
    <h2>5. When NOT to await (fire-and-forget)</h2>
    <pre>{\`// Sometimes you intentionally don't await — e.g. logging,
// analytics, or cache warming that shouldn't block the user:
async function handleClick() {
  logAnalytics('clicked');  // no await — returns a Promise we ignore
  await doImportantWork();  // this one we DO wait for
}

// But unhandled rejections in fire-and-forget Promises
// will crash in Node / warn in browsers. Add a .catch:
logAnalytics('clicked').catch(() => { /* swallow */ });\`}</pre>
  </section>

  <section>
    <h2>Console</h2>
    <div class="console">
      {#each log as entry, i (i)}
        <div class="log-entry">{entry}</div>
      {/each}
      {#if log.length === 0}
        <div class="empty">Run a demo to see output...</div>
      {/if}
    </div>
    <button onclick={clearLog}>Clear</button>
  </section>
</main>

<style>
  main { max-width: 650px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  section.compare { background: #fffdf5; border-color: #e0d080; }
  h2 { margin-top: 0; }
  .hint { color: #555; font-size: 0.9rem; margin: 0 0 0.75rem; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .console { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 0.82rem; min-height: 80px; max-height: 220px; overflow-y: auto; margin-bottom: 0.5rem; }
  .log-entry { padding: 0.15rem 0; }
  .empty { color: #666; font-style: italic; }
  .button-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
  .elapsed { margin: 0.5rem 0; color: #1565c0; font-size: 0.9rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
