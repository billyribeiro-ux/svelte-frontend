import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-1',
		title: 'Promises & Event Loop',
		phase: 4,
		module: 12,
		lessonIndex: 1
	},
	description: `Asynchronous programming is essential for web development — fetching data, reading files, and waiting for user interactions all happen asynchronously. A Promise represents a value that will be available in the future. It transitions through three states: pending, fulfilled, or rejected — and once settled, it never changes.

The event loop is the mechanism that lets single-threaded JavaScript handle async work without blocking. It runs synchronous code to completion, then drains the microtask queue (Promise callbacks, queueMicrotask), and only then picks up one macrotask (setTimeout, setInterval, I/O, UI events) before repeating.

This lesson builds your mental model of Promises and the event loop, which underpins everything that follows in data loading, form actions, and API communication.`,
	objectives: [
		'Create Promises with new Promise((resolve, reject) => ...)',
		'Consume Promises with .then(), .catch() and .finally()',
		'Track the three Promise states: pending, fulfilled, rejected',
		'Distinguish microtasks (Promise callbacks) from macrotasks (setTimeout)',
		'Chain Promises to serialize async work and flatten nesting',
		'Understand why throwing inside .then() is caught by a downstream .catch()'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // A Promise is a placeholder for a value that will arrive later.
  // It has exactly three states and can transition only once:
  //
  //   pending  ──► fulfilled  (resolve(value))
  //           ╲
  //            ──► rejected   (reject(error))
  //
  // Once settled (fulfilled or rejected), it stays that way forever.
  // ---------------------------------------------------------------

  type PromiseState = 'idle' | 'pending' | 'fulfilled' | 'rejected';

  let log: string[] = $state([]);
  let isRunning: boolean = $state(false);
  let promiseState: PromiseState = $state('idle');
  let promiseValue: string = $state('');

  function addLog(msg: string): void {
    log = [...log, msg];
  }

  function clearLog(): void {
    log = [];
    promiseState = 'idle';
    promiseValue = '';
  }

  // -------------------------------------------------------------
  // Demo 1 — Promise lifecycle
  //
  // The executor function (the arg to new Promise) runs
  // SYNCHRONOUSLY, immediately, during construction. This is a
  // common point of confusion: the Promise starts working right
  // away. resolve/reject simply flips its state later on.
  // -------------------------------------------------------------
  function demoBasicPromise(): void {
    clearLog();
    isRunning = true;
    promiseState = 'pending';

    const myPromise: Promise<string> = new Promise((resolve, reject) => {
      addLog('1. Executor runs SYNCHRONOUSLY during construction');

      // Simulate an async I/O operation with setTimeout.
      setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          resolve('Data loaded!');
        } else {
          reject(new Error('Network error'));
        }
      }, 900);
    });

    // This line runs BEFORE the Promise settles — proof that
    // the async work does not block the surrounding code.
    addLog('2. Code after the Promise keeps running');

    myPromise
      .then((value: string) => {
        addLog('3. .then() — resolved with: ' + value);
        promiseState = 'fulfilled';
        promiseValue = value;
      })
      .catch((err: Error) => {
        addLog('3. .catch() — rejected with: ' + err.message);
        promiseState = 'rejected';
        promiseValue = err.message;
      })
      .finally(() => {
        // .finally runs regardless of fulfilled/rejected.
        // Use it for cleanup: stop spinners, close connections, etc.
        addLog('4. .finally() — cleanup runs either way');
        isRunning = false;
      });
  }

  // -------------------------------------------------------------
  // Demo 2 — Event loop ordering
  //
  // Execution priority (roughly):
  //   1. All synchronous code in the current task
  //   2. Drain the ENTIRE microtask queue (Promise .then, queueMicrotask)
  //   3. Pick up ONE macrotask (setTimeout, I/O, UI event)
  //   4. Back to step 2 — microtasks drain again
  //
  // That's why a setTimeout(fn, 0) always fires AFTER any
  // Promise.resolve().then(fn) queued in the same tick.
  // -------------------------------------------------------------
  function demoEventLoop(): void {
    clearLog();

    addLog('1. Sync — runs first');

    setTimeout(() => {
      addLog('5. setTimeout(fn, 0) — macrotask (last!)');
    }, 0);

    Promise.resolve().then(() => {
      addLog('3. Microtask #1 — before macrotasks');
      return Promise.resolve();
    }).then(() => {
      addLog('4. Microtask #2 — still before macrotasks');
    });

    queueMicrotask(() => {
      addLog('3a. queueMicrotask — also a microtask');
    });

    addLog('2. Sync — runs second');
  }

  // -------------------------------------------------------------
  // Demo 3 — Promise chaining
  //
  // Returning a Promise from inside .then() makes the next .then()
  // wait for it. This is how you serialize dependent async work
  // without deeply nesting callbacks ("callback hell").
  // -------------------------------------------------------------
  function demoChaining(): void {
    clearLog();
    isRunning = true;

    function fetchUser(): Promise<{ id: number; name: string }> {
      return new Promise((resolve) => {
        setTimeout(() => resolve({ id: 1, name: 'Alice' }), 400);
      });
    }

    function fetchPosts(userName: string): Promise<string[]> {
      return new Promise((resolve) => {
        setTimeout(
          () => resolve([userName + "'s Post 1", userName + "'s Post 2"]),
          400
        );
      });
    }

    function fetchTopComment(post: string): Promise<string> {
      return new Promise((resolve) => {
        setTimeout(() => resolve('Top comment on "' + post + '"'), 400);
      });
    }

    addLog('Fetching user...');

    fetchUser()
      .then((user) => {
        addLog('Got user: ' + user.name);
        return fetchPosts(user.name); // return Promise → chain waits
      })
      .then((posts) => {
        addLog('Got ' + posts.length + ' posts');
        return fetchTopComment(posts[0]);
      })
      .then((comment) => {
        addLog(comment);
      })
      .catch((err: Error) => {
        // A single .catch at the end handles ANY error in the chain.
        // That's one of the biggest wins over raw callbacks.
        addLog('Chain failed: ' + err.message);
      })
      .finally(() => {
        isRunning = false;
      });
  }

  // -------------------------------------------------------------
  // Demo 4 — Error propagation
  //
  // Throwing (or returning a rejected Promise) inside .then()
  // skips all following .then() callbacks until it hits a .catch().
  // The .catch can "recover" by returning a normal value, at which
  // point downstream .then()s run again.
  // -------------------------------------------------------------
  function demoErrorPropagation(): void {
    clearLog();
    isRunning = true;

    Promise.resolve(1)
      .then((n) => {
        addLog('step 1 → ' + n);
        return n + 1;
      })
      .then((n) => {
        addLog('step 2 → ' + n);
        throw new Error('boom at step 3');
      })
      .then((n) => {
        // SKIPPED — we threw above.
        addLog('step 3 (skipped) → ' + n);
        return n;
      })
      .catch((err: Error) => {
        addLog('caught: ' + err.message);
        return 99; // recover with a fallback value
      })
      .then((n) => {
        // Runs again because .catch returned a value.
        addLog('recovered → ' + n);
      })
      .finally(() => {
        isRunning = false;
      });
  }
</script>

<main>
  <h1>Promises & Event Loop</h1>

  <section>
    <h2>1. Promise Lifecycle</h2>
    <p class="hint">
      A Promise is <em>pending</em> until it <em>fulfills</em> or <em>rejects</em> — exactly once.
    </p>
    <div class="state-viz">
      <div class="state" class:active={promiseState === 'pending'}>pending</div>
      <div class="arrow">→</div>
      <div class="state" class:fulfilled={promiseState === 'fulfilled'}>fulfilled</div>
      <div class="state" class:rejected={promiseState === 'rejected'}>rejected</div>
    </div>
    {#if promiseValue}
      <p class="value">value: <code>{promiseValue}</code></p>
    {/if}
    <button onclick={demoBasicPromise} disabled={isRunning}>
      Run Promise Demo
    </button>
    <pre>{\`const promise = new Promise((resolve, reject) => {
  // Executor runs SYNCHRONOUSLY. Start the async work here.
  doAsyncThing((err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});

promise
  .then(value => console.log('ok', value))
  .catch(err   => console.error('fail', err))
  .finally(()  => console.log('cleanup'));\`}</pre>
  </section>

  <section>
    <h2>2. Event Loop Ordering</h2>
    <p class="hint">
      Sync → microtasks (Promise.then, queueMicrotask) → ONE macrotask → microtasks again…
    </p>
    <button onclick={demoEventLoop}>Run Event Loop Demo</button>
    <pre>{\`console.log('1 sync');

setTimeout(() => console.log('4 macro'), 0);

Promise.resolve().then(() => console.log('3 micro'));

console.log('2 sync');
// Output order: 1, 2, 3, 4
// Even though setTimeout was queued first!\`}</pre>
  </section>

  <section>
    <h2>3. Promise Chaining</h2>
    <p class="hint">
      Returning a Promise from <code>.then()</code> serializes dependent async work.
    </p>
    <button onclick={demoChaining} disabled={isRunning}>Run Chain Demo</button>
    <pre>{\`fetchUser()
  .then(user  => fetchPosts(user.name))  // returns a Promise
  .then(posts => fetchTopComment(posts[0]))
  .then(comment => render(comment))
  .catch(err  => showError(err));        // one handler for all\`}</pre>
  </section>

  <section>
    <h2>4. Error Propagation & Recovery</h2>
    <p class="hint">
      A thrown error skips <code>.then()</code>s until it hits a <code>.catch()</code>.
      The catch can recover by returning a normal value.
    </p>
    <button onclick={demoErrorPropagation} disabled={isRunning}>Run Error Demo</button>
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
  h2 { margin-top: 0; }
  .hint { color: #555; font-size: 0.9rem; margin: 0 0 0.75rem; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85rem; }
  .console { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 0.82rem; min-height: 80px; max-height: 220px; overflow-y: auto; margin-bottom: 0.5rem; }
  .log-entry { padding: 0.15rem 0; }
  .empty { color: #666; font-style: italic; }
  button { padding: 0.5rem 1rem; cursor: pointer; margin-right: 0.5rem; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .state-viz { display: flex; align-items: center; gap: 0.5rem; margin: 0.5rem 0 0.75rem; }
  .state { padding: 0.35rem 0.75rem; border: 2px solid #ccc; border-radius: 20px; font-size: 0.85rem; color: #888; background: #fafafa; }
  .state.active { border-color: #1565c0; color: #1565c0; background: #e3f2fd; }
  .state.fulfilled { border-color: #2e7d32; color: #2e7d32; background: #e8f5e9; }
  .state.rejected { border-color: #c62828; color: #c62828; background: #ffebee; }
  .arrow { color: #888; }
  .value { font-size: 0.9rem; color: #444; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
