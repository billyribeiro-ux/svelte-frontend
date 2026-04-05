import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-4',
		title: 'Parallel Async & Partial Failures',
		phase: 4,
		module: 12,
		lessonIndex: 4
	},
	description: `When you have multiple independent async operations, running them concurrently instead of sequentially is free performance — as long as you pick the right combinator.

JavaScript gives you four: Promise.all (all must succeed), Promise.allSettled (collect every outcome), Promise.race (first to settle wins), and Promise.any (first to succeed wins, failures ignored until all fail). Choosing the wrong one turns an elegant dashboard into a brittle page that goes fully blank if any single widget fails.

This lesson covers all four combinators and the partial-failure pattern that real production dashboards depend on.

A "Try It Yourself" section at the bottom gives you three hands-on challenges to practice what you just learned.`,
	objectives: [
		'Use Promise.all for "all must succeed" workloads',
		'Use Promise.allSettled to collect every outcome (partial failure tolerance)',
		'Use Promise.race for timeouts and "first response wins"',
		'Use Promise.any for redundant backends (first success wins)',
		'Build a dashboard that degrades gracefully when one widget fails',
		'Know when Promise.all fail-fast is a feature, not a bug'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // The four Promise combinators at a glance
  //
  //                 | resolves when        | rejects when
  //   --------------|----------------------|-----------------
  //   Promise.all   | ALL fulfil           | ANY rejects (fail-fast)
  //   allSettled    | ALL settle           | NEVER rejects
  //   Promise.race  | FIRST settles        | first settles with rejection
  //   Promise.any   | FIRST fulfils        | ALL reject (AggregateError)
  //
  // Pick based on what "success" means for your use case.
  // ---------------------------------------------------------------

  type Widget = 'profile' | 'stats' | 'feed' | 'ads';
  type WidgetStatus = 'idle' | 'loading' | 'ok' | 'error';

  interface WidgetData {
    status: WidgetStatus;
    value: string;
    error: string;
  }

  let log: string[] = $state([]);
  let widgets: Record<Widget, WidgetData> = $state({
    profile: { status: 'idle', value: '', error: '' },
    stats: { status: 'idle', value: '', error: '' },
    feed: { status: 'idle', value: '', error: '' },
    ads: { status: 'idle', value: '', error: '' }
  });

  function addLog(msg: string): void {
    log = [...log, msg];
  }

  function clearLog(): void {
    log = [];
  }

  function resetWidgets(): void {
    (Object.keys(widgets) as Widget[]).forEach((k) => {
      widgets[k] = { status: 'loading', value: '', error: '' };
    });
  }

  // A simulated API call: either resolves after \`ms\` with \`value\`,
  // or rejects with an Error after \`ms\` if \`shouldFail\` is true.
  function call<T>(
    label: string,
    ms: number,
    value: T,
    shouldFail: boolean = false
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(new Error(label + ' failed'));
        } else {
          resolve(value);
        }
      }, ms);
    });
  }

  // -------------------------------------------------------------
  // Demo 1 — Promise.all (fail-fast)
  //
  // Resolves with [v1, v2, v3] when ALL resolve.
  // If ANY rejects, the whole Promise.all rejects immediately
  // with that one error — the others keep running but their
  // results are discarded.
  // -------------------------------------------------------------
  async function demoAll(): Promise<void> {
    clearLog();
    addLog('Promise.all: launching 3 calls (one will fail)');
    try {
      const results = await Promise.all([
        call('profile', 400, 'Alice'),
        call('stats', 600, { posts: 42 }, true),
        call('feed', 800, ['post 1', 'post 2'])
      ]);
      addLog('All succeeded: ' + JSON.stringify(results));
    } catch (err) {
      addLog('REJECTED: ' + (err as Error).message);
      addLog('(the other promises continued but results were thrown away)');
    }
  }

  // -------------------------------------------------------------
  // Demo 2 — Promise.allSettled (partial failure)
  //
  // NEVER rejects. Returns an array of { status, value } or
  // { status, reason } — one per input, in order.
  // -------------------------------------------------------------
  async function demoAllSettled(): Promise<void> {
    clearLog();
    resetWidgets();
    addLog('Promise.allSettled: 4 widgets, 1 will fail');

    const results = await Promise.allSettled([
      call<string>('profile', 400, 'Alice'),
      call<{ posts: number }>('stats', 600, { posts: 42 }),
      call<string[]>('feed', 800, ['post 1', 'post 2'], true),
      call<string>('ads', 300, 'Buy stuff!')
    ]);

    const keys: Widget[] = ['profile', 'stats', 'feed', 'ads'];
    results.forEach((r, i) => {
      const key = keys[i];
      if (r.status === 'fulfilled') {
        widgets[key] = {
          status: 'ok',
          value: JSON.stringify(r.value),
          error: ''
        };
        addLog('  ok ' + key + ' -> ' + JSON.stringify(r.value));
      } else {
        widgets[key] = {
          status: 'error',
          value: '',
          error: (r.reason as Error).message
        };
        addLog('  FAIL ' + key + ' -> ' + (r.reason as Error).message);
      }
    });
    addLog('Page still renders — failed widgets show errors in place');
  }

  // -------------------------------------------------------------
  // Demo 3 — Promise.race (first settles wins)
  // -------------------------------------------------------------
  async function demoRace(): Promise<void> {
    clearLog();
    addLog('Promise.race: slow fetch vs 500ms timeout');

    const slowFetch = call('api', 1200, 'api response');
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timed out after 500ms')), 500)
    );

    try {
      const winner = await Promise.race([slowFetch, timeout]);
      addLog('Winner: ' + winner);
    } catch (err) {
      addLog('Race rejected: ' + (err as Error).message);
    }
  }

  // -------------------------------------------------------------
  // Demo 4 — Promise.any (first success wins)
  // -------------------------------------------------------------
  async function demoAny(): Promise<void> {
    clearLog();
    addLog('Promise.any: 3 mirrors (first 2 fail, third succeeds)');

    try {
      const fastest = await Promise.any([
        call('mirror-eu', 200, 'eu', true),
        call('mirror-us', 400, 'us', true),
        call('mirror-asia', 600, 'asia response')
      ]);
      addLog('Got response from: ' + fastest);
    } catch (err) {
      const agg = err as AggregateError;
      addLog('All mirrors failed:');
      agg.errors.forEach((e) => addLog('  - ' + (e as Error).message));
    }
  }

  let widgetEntries = $derived(
    (Object.keys(widgets) as Widget[]).map((k) => ({ key: k, w: widgets[k] }))
  );
</script>

<main>
  <h1>Parallel Async & Partial Failures</h1>

  <section>
    <h2>Four Combinators, One Chart</h2>
    <table>
      <thead>
        <tr>
          <th>Combinator</th>
          <th>Resolves</th>
          <th>Rejects</th>
          <th>Use case</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>Promise.all</code></td>
          <td>ALL fulfil</td>
          <td>ANY rejects</td>
          <td>All-or-nothing workloads</td>
        </tr>
        <tr>
          <td><code>Promise.allSettled</code></td>
          <td>ALL settle</td>
          <td>Never</td>
          <td>Dashboards, partial failure</td>
        </tr>
        <tr>
          <td><code>Promise.race</code></td>
          <td>First settles</td>
          <td>First settles (reject)</td>
          <td>Timeouts</td>
        </tr>
        <tr>
          <td><code>Promise.any</code></td>
          <td>First fulfils</td>
          <td>ALL reject</td>
          <td>Redundant backends</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>1. Promise.all — Fail Fast</h2>
    <button onclick={demoAll}>Run</button>
    <pre>{\`// ALL must succeed. One failure throws the whole thing away.
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
]);\`}</pre>
  </section>

  <section>
    <h2>2. Promise.allSettled — Partial Failure</h2>
    <button onclick={demoAllSettled}>Run Dashboard Demo</button>

    <div class="dashboard">
      {#each widgetEntries as entry (entry.key)}
        <div
          class="widget"
          class:ok={entry.w.status === 'ok'}
          class:error={entry.w.status === 'error'}
          class:loading={entry.w.status === 'loading'}
        >
          <div class="widget-name">{entry.key}</div>
          {#if entry.w.status === 'loading'}
            <div class="widget-body">loading...</div>
          {:else if entry.w.status === 'ok'}
            <div class="widget-body">{entry.w.value}</div>
          {:else if entry.w.status === 'error'}
            <div class="widget-body err">{entry.w.error}</div>
          {:else}
            <div class="widget-body muted">idle</div>
          {/if}
        </div>
      {/each}
    </div>

    <pre>{\`const results = await Promise.allSettled([
  fetchProfile(),
  fetchStats(),
  fetchFeed(),
  fetchAds()
]);

// results is always an array — never throws.
for (const r of results) {
  if (r.status === 'fulfilled') use(r.value);
  else                          showError(r.reason);
}\`}</pre>
  </section>

  <section>
    <h2>3. Promise.race — Timeouts</h2>
    <button onclick={demoRace}>Run</button>
    <pre>{\`function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    )
  ]);
}

// Usage:
const data = await withTimeout(fetchData(), 5000);\`}</pre>
  </section>

  <section>
    <h2>4. Promise.any — Redundant Backends</h2>
    <button onclick={demoAny}>Run</button>
    <pre>{\`// Try several mirrors, use whichever answers first.
try {
  const data = await Promise.any([
    fetch('https://eu.api.example.com/data'),
    fetch('https://us.api.example.com/data'),
    fetch('https://asia.api.example.com/data')
  ]);
} catch (err) {
  // Only reached if EVERY mirror fails
  const agg = err as AggregateError;
  agg.errors.forEach(e => console.error(e));
}\`}</pre>
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

  <section class="practice">
    <h2>Try It Yourself</h2>
    <p class="intro">Edit the code above to add these features. Answers are at the bottom of the lesson (but resist peeking!)</p>
    <ol>
      <li>
        <strong>1.</strong> Add a new demo that fetches a fake <code>user</code>, <code>posts</code> and <code>comments</code> in parallel with <code>Promise.all</code> and logs the total time.
        <span class="practice-hint">Hint: wrap three <code>fakeFetch</code> calls in <code>Promise.all([...])</code> and subtract <code>performance.now()</code>.</span>
      </li>
      <li>
        <strong>2.</strong> Add a fifth widget to the dashboard that always throws, and confirm the other four still render thanks to <code>Promise.allSettled</code>.
        <span class="practice-hint">Hint: push another entry into the widgets state and return a rejected promise from its loader.</span>
      </li>
      <li>
        <strong>3.</strong> Build a "redundant search" demo: race two <code>fakeFetch</code> calls with different delays using <code>Promise.race</code> and display whichever wins.
        <span class="practice-hint">Hint: <code>await Promise.race([fastMirror(), slowMirror()])</code> and log the winner.</span>
      </li>
    </ol>
  </section>
</main>

<style>
  main { max-width: 680px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  h2 { margin-top: 0; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
  th { background: #f5f5f5; }
  .console { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 4px; font-family: monospace; font-size: 0.82rem; min-height: 80px; max-height: 220px; overflow-y: auto; margin-bottom: 0.5rem; }
  .log-entry { padding: 0.15rem 0; }
  .empty { color: #666; font-style: italic; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
  .dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin: 0.75rem 0; }
  .widget { border: 1px solid #ddd; border-radius: 6px; padding: 0.75rem; background: #fafafa; }
  .widget.ok { border-color: #4caf50; background: #e8f5e9; }
  .widget.error { border-color: #f44336; background: #ffebee; }
  .widget.loading { border-color: #2196f3; background: #e3f2fd; }
  .widget-name { font-weight: bold; font-size: 0.8rem; text-transform: uppercase; color: #555; }
  .widget-body { margin-top: 0.25rem; font-size: 0.9rem; }
  .widget-body.err { color: #c62828; }
  .widget-body.muted { color: #999; font-style: italic; }
  .practice {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-top: 1.5rem;
  }
  .practice h2 { color: #1e3a8a; margin: 0 0 0.5rem; font-size: 1rem; }
  .practice .intro { font-size: 0.88rem; color: #1e40af; margin-bottom: 0.75rem; }
  .practice ol { padding-left: 1.25rem; margin: 0; }
  .practice li { padding: 0.4rem 0; font-size: 0.85rem; color: #1e3a8a; }
  .practice-hint {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #475569;
    font-style: italic;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
