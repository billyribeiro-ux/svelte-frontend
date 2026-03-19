import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-1',
		title: 'Promises & Event Loop',
		phase: 4,
		module: 12,
		lessonIndex: 1
	},
	description: `Asynchronous programming is essential for web development — fetching data, reading files, and waiting for user interactions all happen asynchronously. Promises represent a value that will be available in the future. The event loop is the mechanism that lets JavaScript handle async operations while remaining single-threaded.

This lesson builds your mental model of promises and the event loop, which is fundamental to everything that follows in data loading and API communication.`,
	objectives: [
		'Create and consume promises with .then() and .catch()',
		'Understand how the event loop processes synchronous and asynchronous code',
		'Use setTimeout to observe event loop behavior',
		'Chain promises for sequential async operations'
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

  // Demo 1: Basic Promise
  function demoBasicPromise() {
    clearLog();
    isRunning = true;

    const myPromise: Promise<string> = new Promise((resolve, reject) => {
      addLog('1. Promise created (executor runs synchronously)');
      setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          resolve('Data loaded!');
        } else {
          reject(new Error('Network error'));
        }
      }, 1000);
    });

    addLog('2. Code after promise creation runs immediately');

    myPromise
      .then((value: string) => {
        addLog('3. .then() — ' + value);
      })
      .catch((err: Error) => {
        addLog('3. .catch() — ' + err.message);
      })
      .finally(() => {
        addLog('4. .finally() — cleanup runs either way');
        isRunning = false;
      });
  }

  // Demo 2: Event loop ordering
  function demoEventLoop() {
    clearLog();

    addLog('1. Synchronous — first');

    setTimeout(() => {
      addLog('4. setTimeout(fn, 0) — macro task (last!)');
    }, 0);

    Promise.resolve().then(() => {
      addLog('3. Promise.then — micro task (before setTimeout)');
    });

    addLog('2. Synchronous — second');
  }

  // Demo 3: Promise chaining
  function demoChaining() {
    clearLog();
    isRunning = true;

    function fetchUser(): Promise<{ name: string }> {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ name: 'Alice' }), 500);
      });
    }

    function fetchPosts(userName: string): Promise<string[]> {
      return new Promise((resolve) => {
        setTimeout(() => resolve([userName + "'s Post 1", userName + "'s Post 2"]), 500);
      });
    }

    addLog('Fetching user...');

    fetchUser()
      .then((user) => {
        addLog('Got user: ' + user.name);
        return fetchPosts(user.name);
      })
      .then((posts) => {
        addLog('Got posts: ' + posts.join(', '));
        isRunning = false;
      });
  }
</script>

<main>
  <h1>Promises & Event Loop</h1>

  <section>
    <h2>Basic Promise</h2>
    <button onclick={demoBasicPromise} disabled={isRunning}>
      Run Promise Demo
    </button>
    <pre>{\`const promise = new Promise((resolve, reject) => {
  // async work...
  resolve('success');  // or reject(new Error('fail'))
});

promise
  .then(value => console.log(value))
  .catch(err => console.error(err))
  .finally(() => console.log('done'));\`}</pre>
  </section>

  <section>
    <h2>Event Loop Ordering</h2>
    <button onclick={demoEventLoop}>Run Event Loop Demo</button>
    <p><em>Watch the order: sync code first, then microtasks (Promises), then macrotasks (setTimeout)</em></p>
  </section>

  <section>
    <h2>Promise Chaining</h2>
    <button onclick={demoChaining} disabled={isRunning}>Run Chain Demo</button>
    <pre>{\`fetchUser()
  .then(user => fetchPosts(user.name))  // returns a Promise
  .then(posts => display(posts));       // waits for it\`}</pre>
  </section>

  <section>
    <h2>Console</h2>
    <div class="console">
      {#each log as entry, i}
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
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  .console { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; min-height: 80px; max-height: 200px; overflow-y: auto; margin-bottom: 0.5rem; }
  .log-entry { padding: 0.15rem 0; }
  .empty { color: #666; font-style: italic; }
  button { padding: 0.5rem 1rem; cursor: pointer; margin-right: 0.5rem; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
