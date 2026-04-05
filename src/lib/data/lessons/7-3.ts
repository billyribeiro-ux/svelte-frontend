import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '7-3',
		title: 'Custom Errors & Patterns',
		phase: 2,
		module: 7,
		lessonIndex: 3
	},
	description: `Built-in error types are generic. In real apps, you want errors that carry structured information: error codes, HTTP statuses, user-friendly messages, and metadata.

Custom error classes extend the built-in Error class, giving you typed errors you can check with instanceof. The Result pattern ({ok: true, data} | {ok: false, error}) is an alternative to throwing — it forces callers to handle both success and failure cases.

Both patterns are used heavily in production Svelte apps. Custom errors for unexpected failures, Result pattern for expected outcomes like form validation or API responses. In this lesson you'll build ValidationError, NetworkError, and NotFoundError, use a Result type, and build a retry helper that knows which errors are worth retrying.`,
	objectives: [
		'Create custom error classes that extend Error with extra properties',
		'Use instanceof to handle different error types differently',
		'Implement the Result pattern as an alternative to try/catch',
		'Write a retry helper that distinguishes transient vs permanent errors'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // 1. CUSTOM ERROR CLASSES
  // ============================================================
  // Extend Error to carry structured info. Always set name to the
  // class name so logs and error.name reflect the real type.

  class ValidationError extends Error {
    constructor(message, field) {
      super(message);
      this.name = 'ValidationError';
      this.field = field;
    }
  }

  class NetworkError extends Error {
    constructor(message, status) {
      super(message);
      this.name = 'NetworkError';
      this.status = status;
      // Retry 5xx, not 4xx
      this.isTransient = status >= 500;
    }
  }

  class NotFoundError extends Error {
    constructor(resource, id) {
      super(\`\${resource} with id \${id} not found\`);
      this.name = 'NotFoundError';
      this.resource = resource;
      this.id = id;
    }
  }

  // ============================================================
  // 2. VALIDATING A FORM WITH CUSTOM ERRORS
  // ============================================================

  let email = $state('not-an-email');
  let age = $state(15);
  let formMessage = $state('');
  let formStatus = $state('');

  function validateUser(user) {
    if (!user.email.includes('@')) {
      throw new ValidationError('Invalid email format', 'email');
    }
    if (user.age < 18) {
      throw new ValidationError('Must be 18 or older', 'age');
    }
    return user;
  }

  function submitForm() {
    try {
      validateUser({ email, age });
      formMessage = 'Form submitted successfully';
      formStatus = 'ok';
    } catch (err) {
      if (err instanceof ValidationError) {
        formMessage = \`[\${err.field}] \${err.message}\`;
        formStatus = 'err';
      } else {
        formMessage = 'Unexpected error: ' + err.message;
        formStatus = 'err';
      }
    }
  }

  // ============================================================
  // 3. THE RESULT PATTERN
  // ============================================================
  // Instead of throwing, return { ok, data } | { ok: false, error }.
  // Forces the caller to handle both branches explicitly.

  function parseInteger(str) {
    const n = Number(str);
    if (Number.isNaN(n)) {
      return { ok: false, error: 'Not a number' };
    }
    if (!Number.isInteger(n)) {
      return { ok: false, error: 'Not an integer' };
    }
    return { ok: true, data: n };
  }

  let intInput = $state('42');
  let intResult = $state(null);

  function runParse() {
    intResult = parseInteger(intInput);
  }

  // ============================================================
  // 4. RETRY LOGIC — distinguish transient from permanent failures
  // ============================================================

  let attempts = 0;

  function flakyCall() {
    attempts++;
    // First 2 attempts fail with a transient error, then succeed
    if (attempts < 3) {
      throw new NetworkError('Service temporarily unavailable', 503);
    }
    return { ok: true, message: 'Service responded' };
  }

  async function retry(fn, maxAttempts = 3) {
    let lastError;
    for (let i = 1; i <= maxAttempts; i++) {
      try {
        return { ok: true, data: fn() };
      } catch (err) {
        lastError = err;
        // Only retry transient network errors
        if (err instanceof NetworkError && err.isTransient && i < maxAttempts) {
          retryLog = [...retryLog, \`Attempt \${i} failed (\${err.status}), retrying...\`];
          await new Promise((r) => setTimeout(r, 300));
          continue;
        }
        // Permanent error or out of attempts
        return { ok: false, error: lastError };
      }
    }
    return { ok: false, error: lastError };
  }

  let retryLog = $state([]);
  let retryResult = $state('');

  async function runRetry() {
    attempts = 0;
    retryLog = [];
    retryResult = '';
    const result = await retry(flakyCall);
    if (result.ok) {
      retryResult = 'Success: ' + result.data.message;
      retryLog = [...retryLog, \`Succeeded on attempt \${attempts}\`];
    } else {
      retryResult = 'Failed: ' + result.error.message;
    }
  }

  // ============================================================
  // 5. DATABASE LOOKUP using NotFoundError
  // ============================================================

  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];

  function findUser(id) {
    const user = users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundError('User', id);
    }
    return user;
  }

  let lookupId = $state(3);
  let lookupMessage = $state('');
  let lookupStatus = $state('');

  function doLookup() {
    try {
      const user = findUser(lookupId);
      lookupMessage = 'Found: ' + user.name;
      lookupStatus = 'ok';
    } catch (err) {
      if (err instanceof NotFoundError) {
        lookupMessage = \`[\${err.resource} #\${err.id}] \${err.message}\`;
        lookupStatus = 'err';
      } else {
        lookupMessage = 'Unexpected error';
        lookupStatus = 'err';
      }
    }
  }
</script>

<h1>Custom Errors & Patterns</h1>

<section>
  <h2>1. ValidationError (custom class)</h2>
  <p class="intro">Custom errors carry a <code>field</code> so the UI can highlight the right input.</p>
  <div class="form">
    <label>Email <input bind:value={email} /></label>
    <label>Age <input type="number" bind:value={age} /></label>
    <button onclick={submitForm}>Submit</button>
  </div>
  {#if formMessage}
    <p class="result-text {formStatus}">{formMessage}</p>
  {/if}
</section>

<section>
  <h2>2. Result Pattern</h2>
  <p class="intro">Return <code>{'{ok, data}'}</code> or <code>{'{ok: false, error}'}</code>. No throw, no catch.</p>
  <input bind:value={intInput} />
  <button onclick={runParse}>Parse</button>
  {#if intResult}
    {#if intResult.ok}
      <p class="result-text ok">ok: true, data: {intResult.data}</p>
    {:else}
      <p class="result-text err">ok: false, error: {intResult.error}</p>
    {/if}
  {/if}
  <p class="hint">Try "42", "3.14", and "hello" to see each branch.</p>
</section>

<section>
  <h2>3. Retry Logic (NetworkError)</h2>
  <p class="intro">Retry only transient failures (5xx). Permanent errors (4xx) fail fast.</p>
  <button onclick={runRetry}>Call Flaky Service</button>
  {#if retryLog.length > 0}
    <ul class="log">
      {#each retryLog as line, i (i)}
        <li>{line}</li>
      {/each}
    </ul>
  {/if}
  {#if retryResult}
    <p class="result-text ok">{retryResult}</p>
  {/if}
</section>

<section>
  <h2>4. NotFoundError</h2>
  <div class="form">
    <label>User ID <input type="number" bind:value={lookupId} /></label>
    <button onclick={doLookup}>Look up</button>
  </div>
  {#if lookupMessage}
    <p class="result-text {lookupStatus}">{lookupMessage}</p>
  {/if}
  <p class="hint">IDs 1 and 2 exist. Try 3 for NotFoundError.</p>
</section>

<section class="cheat">
  <h2>When to Throw vs Return a Result</h2>
  <ul>
    <li><strong>Throw</strong> for unexpected failures (bugs, infrastructure errors, invariant violations).</li>
    <li><strong>Return a Result</strong> for expected outcomes (validation, parsing, API responses with known failure modes).</li>
    <li><strong>Custom Error classes</strong> let callers distinguish types with <code>instanceof</code>.</li>
    <li><strong>Always set name</strong> in the constructor so <code>error.name</code> is meaningful.</li>
  </ul>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .intro { font-size: 0.9rem; color: #555; margin: 0 0 0.5rem; }
  .form { display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; }
  label { display: flex; gap: 0.3rem; align-items: center; font-size: 0.9rem; }
  input {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:hover { background: #4338ca; }
  .result-text {
    margin-top: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-weight: bold;
    font-family: monospace;
    font-size: 0.9rem;
  }
  .ok { background: #f0fdf4; color: #065f46; border: 1px solid #86efac; }
  .err { background: #fef2f2; color: #991b1b; border: 1px solid #fca5a5; }
  .log {
    font-size: 0.8rem;
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.5rem 1.5rem;
    border-radius: 4px;
    margin: 0.5rem 0;
  }
  .hint { font-size: 0.85rem; color: #666; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85rem; }
  .cheat { background: #fffbeb; border: 1px solid #fde68a; }
  .cheat ul { margin: 0; padding-left: 1.2rem; line-height: 1.7; font-size: 0.9rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
