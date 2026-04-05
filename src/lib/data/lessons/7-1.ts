import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '7-1',
		title: 'try/catch/finally',
		phase: 2,
		module: 7,
		lessonIndex: 1
	},
	description: `Errors are inevitable — users enter bad data, networks fail, APIs return unexpected responses. JavaScript's try/catch/finally lets you handle errors gracefully instead of crashing.

The try block contains code that might fail. If it throws, execution jumps to the catch block where you can handle the error. The finally block always runs — whether the code succeeded or failed — making it perfect for cleanup like hiding spinners, closing connections, or releasing locks.

Knowing when to throw an error vs return null is a design decision. Throw when something is truly unexpected; return null or a default when a missing value is normal. This lesson walks through JSON parsing, numeric failures, a simulated fetch, and a multi-step pipeline where finally guarantees cleanup.`,
	objectives: [
		'Use try/catch to handle errors without crashing the app',
		'Use finally for cleanup that must run regardless of success or failure',
		'Decide when to throw an error vs return null or a default value',
		'Handle async errors from fetch-like operations with try/catch',
		'Build multi-step pipelines where finally guarantees cleanup'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // 1. JSON PARSING — the classic try/catch use case
  // ============================================================
  let jsonInput = $state('{"name": "Alice", "age": 25}');
  let parseResult = $state(null);
  let parseError = $state('');
  let parseLog = $state([]);

  function parseJSON() {
    parseResult = null;
    parseError = '';
    parseLog = [];

    parseLog = [...parseLog, 'try block entered'];
    try {
      // JSON.parse throws SyntaxError on invalid input
      const data = JSON.parse(jsonInput);
      parseResult = data;
      parseLog = [...parseLog, 'parse succeeded'];
    } catch (error) {
      // Never let a parse error crash the app
      parseError = error.message;
      parseLog = [...parseLog, 'catch block ran: ' + error.name];
    } finally {
      // Always runs — whether we succeeded or failed
      parseLog = [...parseLog, 'finally block ran (cleanup)'];
    }
  }

  // ============================================================
  // 2. THROW vs RETURN NULL — a design decision
  // ============================================================
  // Throw when something is truly unexpected (bug, bad state).
  // Return null/default when absence is a normal outcome.

  function divideStrict(a, b) {
    if (b === 0) throw new Error('Cannot divide by zero!');
    return a / b;
  }

  function divideSafe(a, b) {
    if (b === 0) return null; // caller must handle null
    return a / b;
  }

  let numerator = $state(10);
  let denominator = $state(0);
  let divResult = $state('');
  let divStyle = $state('');

  function tryDivide() {
    try {
      const result = divideStrict(numerator, denominator);
      divResult = \`divideStrict → \${result}\`;
      divStyle = 'ok';
    } catch (e) {
      divResult = \`Caught: \${e.message}\`;
      divStyle = 'err';
    }
  }

  function safeDivide() {
    const result = divideSafe(numerator, denominator);
    if (result === null) {
      divResult = 'divideSafe → null (handled without throwing)';
      divStyle = 'warn';
    } else {
      divResult = \`divideSafe → \${result}\`;
      divStyle = 'ok';
    }
  }

  // ============================================================
  // 3. SIMULATED FETCH — async errors with try/catch
  // ============================================================
  // Real fetch() rejects the promise on network failure, and
  // returns an ok=false response on HTTP errors. We simulate both.

  let fetchStatus = $state('idle');
  let fetchData = $state(null);
  let fetchError = $state('');
  let fakeEndpoint = $state('/api/users/1');

  function fakeFetch(url) {
    // Returns a promise that resolves or rejects based on url
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (url.includes('fail-network')) {
          reject(new Error('Network error: connection refused'));
        } else if (url.includes('404')) {
          resolve({ ok: false, status: 404, json: () => ({ error: 'Not found' }) });
        } else {
          resolve({
            ok: true,
            status: 200,
            json: () => ({ id: 1, name: 'Alice', role: 'admin' })
          });
        }
      }, 400);
    });
  }

  async function loadData() {
    fetchStatus = 'loading';
    fetchData = null;
    fetchError = '';

    try {
      const response = await fakeFetch(fakeEndpoint);

      // HTTP errors don't throw — we must check manually
      if (!response.ok) {
        throw new Error(\`HTTP \${response.status}\`);
      }

      fetchData = response.json();
      fetchStatus = 'success';
    } catch (e) {
      // Catches both network errors and our manual throw
      fetchError = e.message;
      fetchStatus = 'error';
    } finally {
      // Perfect place to hide a loading spinner
      if (fetchStatus === 'loading') fetchStatus = 'idle';
    }
  }

  // ============================================================
  // 4. MULTI-STEP PIPELINE — finally for guaranteed cleanup
  // ============================================================
  // Imagine a resource (lock, DB connection, file handle) that
  // must be released no matter what. finally is your friend.

  let pipelineSteps = $state([]);
  let pipelineLockHeld = $state(false);
  let pipelineInput = $state('{"retries": 3, "timeout": 1000}');

  function runPipeline() {
    pipelineSteps = [];
    pipelineLockHeld = true;
    pipelineSteps = [...pipelineSteps, '🔒 Lock acquired'];

    try {
      pipelineSteps = [...pipelineSteps, '1. Parsing config...'];
      const config = JSON.parse(pipelineInput);

      pipelineSteps = [...pipelineSteps, '2. Validating config...'];
      if (typeof config.retries !== 'number') {
        throw new Error('config.retries must be a number');
      }
      if (config.retries > 5) {
        throw new Error('Too many retries (max 5)');
      }

      pipelineSteps = [...pipelineSteps, '3. Running job...'];
      pipelineSteps = [...pipelineSteps, \`   retries=\${config.retries}, timeout=\${config.timeout}\`];

      pipelineSteps = [...pipelineSteps, '✅ Pipeline completed'];
    } catch (e) {
      pipelineSteps = [...pipelineSteps, \`❌ Failed: \${e.message}\`];
    } finally {
      // This ALWAYS runs — even if we returned early or threw
      pipelineLockHeld = false;
      pipelineSteps = [...pipelineSteps, '🔓 Lock released (finally)'];
    }
  }
</script>

<h1>try / catch / finally</h1>

<section>
  <h2>1. JSON Parsing</h2>
  <p class="intro">JSON.parse throws a SyntaxError on invalid input. Catch it so the app keeps running.</p>
  <textarea bind:value={jsonInput} rows="3"></textarea>
  <button onclick={parseJSON}>Parse JSON</button>

  {#if parseResult}
    <div class="result success">
      <strong>Parsed:</strong>
      <pre>{JSON.stringify(parseResult, null, 2)}</pre>
    </div>
  {/if}
  {#if parseError}
    <div class="result error">
      <strong>Error:</strong> {parseError}
    </div>
  {/if}
  {#if parseLog.length > 0}
    <ul class="log">
      {#each parseLog as line, i (i)}
        <li>{line}</li>
      {/each}
    </ul>
  {/if}
  <p class="hint">Try broken JSON like <code>{'{'}name: Alice{'}'}</code> (missing quotes).</p>
</section>

<section>
  <h2>2. Throw vs Return Null</h2>
  <div class="controls">
    <label>a: <input type="number" bind:value={numerator} /></label>
    <label>b: <input type="number" bind:value={denominator} /></label>
  </div>
  <div class="controls">
    <button onclick={tryDivide}>divideStrict (throws)</button>
    <button class="alt" onclick={safeDivide}>divideSafe (returns null)</button>
  </div>
  {#if divResult}
    <p class="result-text {divStyle}">{divResult}</p>
  {/if}
  <p class="hint">Set b to 0 to compare the two strategies.</p>
</section>

<section>
  <h2>3. Async Errors with fetch</h2>
  <p class="intro">try/catch works with await — it catches both network failures and manually-thrown HTTP errors.</p>
  <div class="controls">
    <select bind:value={fakeEndpoint}>
      <option value="/api/users/1">/api/users/1 (success)</option>
      <option value="/api/users/404">/api/users/404 (HTTP 404)</option>
      <option value="/api/fail-network">/api/fail-network (reject)</option>
    </select>
    <button onclick={loadData} disabled={fetchStatus === 'loading'}>
      {fetchStatus === 'loading' ? 'Loading...' : 'Load'}
    </button>
  </div>
  {#if fetchStatus === 'success' && fetchData}
    <div class="result success">
      <pre>{JSON.stringify(fetchData, null, 2)}</pre>
    </div>
  {/if}
  {#if fetchStatus === 'error'}
    <div class="result error"><strong>Error:</strong> {fetchError}</div>
  {/if}
</section>

<section>
  <h2>4. Multi-Step Pipeline with Finally</h2>
  <p class="intro">finally guarantees the lock is released even when a step throws.</p>
  <textarea bind:value={pipelineInput} rows="2"></textarea>
  <div class="controls">
    <button onclick={runPipeline}>Run Pipeline</button>
    <span class="lock" class:held={pipelineLockHeld}>
      Lock: {pipelineLockHeld ? 'HELD' : 'released'}
    </span>
  </div>
  {#if pipelineSteps.length > 0}
    <pre class="steps">{pipelineSteps.join('\\n')}</pre>
  {/if}
  <p class="hint">Try setting retries to 10 or using invalid JSON — the lock is still released.</p>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .intro { font-size: 0.9rem; color: #555; margin: 0 0 0.5rem; }
  textarea {
    width: 100%;
    font-family: monospace;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    resize: vertical;
    box-sizing: border-box;
  }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 0.5rem;
  }
  button:hover:not(:disabled) { background: #4338ca; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .alt { background: #059669; }
  .alt:hover { background: #047857; }
  select { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
  .result {
    margin-top: 0.75rem;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid;
  }
  .success { background: #f0fdf4; border-color: #86efac; }
  .error { background: #fef2f2; border-color: #fca5a5; }
  pre { margin: 0.5rem 0; font-size: 0.85rem; white-space: pre-wrap; }
  .log { font-size: 0.8rem; color: #555; background: #fff; padding: 0.5rem 1.5rem; border-radius: 4px; margin: 0.5rem 0; }
  .controls { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin: 0.5rem 0; }
  label { display: flex; align-items: center; gap: 0.5rem; }
  input { padding: 0.3rem; width: 80px; border: 1px solid #ccc; border-radius: 4px; }
  .result-text { font-weight: bold; padding: 0.5rem; border-radius: 4px; }
  .result-text.ok { background: #f0fdf4; color: #065f46; }
  .result-text.err { background: #fef2f2; color: #991b1b; }
  .result-text.warn { background: #fffbeb; color: #92400e; }
  .hint { font-size: 0.85rem; color: #666; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .steps {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    margin-top: 0.75rem;
    font-size: 0.85rem;
  }
  .lock {
    font-size: 0.85rem;
    padding: 0.3rem 0.6rem;
    background: #e5e7eb;
    border-radius: 4px;
    font-family: monospace;
  }
  .lock.held { background: #fecaca; color: #991b1b; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
