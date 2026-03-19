import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-2',
		title: 'async/await',
		phase: 4,
		module: 12,
		lessonIndex: 2
	},
	description: `async/await is syntactic sugar over Promises that makes asynchronous code read like synchronous code. An async function always returns a Promise. Inside it, await pauses execution until a Promise settles, letting you write clean, linear async flows. Error handling uses familiar try/catch blocks.

This lesson covers async function syntax, awaiting promises, handling errors, and the difference between sequential and parallel async execution.`,
	objectives: [
		'Write async functions and use await to pause for Promise resolution',
		'Handle async errors with try/catch blocks',
		'Understand sequential vs parallel async execution',
		'Convert .then() chains to async/await syntax'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let log: string[] = $state([]);
  let isRunning: boolean = $state(false);

  function addLog(msg: string) {
    log = [...log, msg];
  }

  function clearLog() {
    log = [];
  }

  // Simulated async API calls
  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function fetchUser(): Promise<{ id: number; name: string }> {
    await delay(600);
    return { id: 1, name: 'Alice' };
  }

  async function fetchPosts(userId: number): Promise<string[]> {
    await delay(600);
    return ['Post A', 'Post B', 'Post C'];
  }

  async function fetchComments(userId: number): Promise<number> {
    await delay(400);
    return 42;
  }

  // Demo 1: Basic async/await
  async function demoBasic() {
    clearLog();
    isRunning = true;

    addLog('Fetching user...');
    const user = await fetchUser();
    addLog('Got user: ' + user.name);

    addLog('Fetching posts...');
    const posts = await fetchPosts(user.id);
    addLog('Got ' + posts.length + ' posts: ' + posts.join(', '));

    isRunning = false;
  }

  // Demo 2: Error handling
  async function demoErrorHandling() {
    clearLog();
    isRunning = true;

    try {
      addLog('Trying risky operation...');
      await delay(500);
      throw new Error('Server returned 500');
    } catch (err) {
      const error = err as Error;
      addLog('Caught error: ' + error.message);
    } finally {
      addLog('Finally block runs regardless');
      isRunning = false;
    }
  }

  // Demo 3: Sequential vs Parallel
  async function demoSequential() {
    clearLog();
    isRunning = true;
    const start = Date.now();

    addLog('Sequential: fetching one at a time...');
    const user = await fetchUser();          // 600ms
    addLog('Got user');
    const posts = await fetchPosts(user.id); // +600ms
    addLog('Got posts');
    const comments = await fetchComments(user.id); // +400ms
    addLog('Got comments');

    const elapsed = Date.now() - start;
    addLog('Total time: ~' + elapsed + 'ms (sequential)');
    isRunning = false;
  }

  async function demoParallel() {
    clearLog();
    isRunning = true;
    const start = Date.now();

    addLog('Parallel: fetching all at once...');
    const [user, posts, comments] = await Promise.all([
      fetchUser(),       // 600ms
      fetchPosts(1),     // 600ms  (runs simultaneously)
      fetchComments(1)   // 400ms  (runs simultaneously)
    ]);
    addLog('Got user: ' + user.name);
    addLog('Got ' + posts.length + ' posts');
    addLog('Got ' + comments + ' comments');

    const elapsed = Date.now() - start;
    addLog('Total time: ~' + elapsed + 'ms (parallel — much faster!)');
    isRunning = false;
  }
</script>

<main>
  <h1>async/await</h1>

  <section>
    <h2>Basic async/await</h2>
    <button onclick={demoBasic} disabled={isRunning}>Run</button>
    <pre>{\`async function loadData() {
  const user = await fetchUser();    // waits
  const posts = await fetchPosts(user.id); // waits
  return { user, posts };
}\`}</pre>
  </section>

  <section>
    <h2>Error Handling</h2>
    <button onclick={demoErrorHandling} disabled={isRunning}>Run</button>
    <pre>{\`async function safeFetch() {
  try {
    const data = await riskyOperation();
    return data;
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    cleanup();
  }
}\`}</pre>
  </section>

  <section>
    <h2>Sequential vs Parallel</h2>
    <div class="button-row">
      <button onclick={demoSequential} disabled={isRunning}>Sequential (~1600ms)</button>
      <button onclick={demoParallel} disabled={isRunning}>Parallel (~600ms)</button>
    </div>
    <pre>{\`// Sequential: total = sum of all delays
const a = await fetchA();  // 600ms
const b = await fetchB();  // 600ms  → total: 1200ms

// Parallel: total = max delay
const [a, b] = await Promise.all([
  fetchA(),  // 600ms ─┐
  fetchB()   // 600ms ─┤→ total: 600ms
]);\`}</pre>
  </section>

  <section>
    <h2>Console</h2>
    <div class="console">
      {#each log as entry}
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
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  .console { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; min-height: 80px; max-height: 200px; overflow-y: auto; margin-bottom: 0.5rem; }
  .log-entry { padding: 0.15rem 0; }
  .empty { color: #666; font-style: italic; }
  .button-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
