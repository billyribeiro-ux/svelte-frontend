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

Both patterns are used heavily in production Svelte apps. Custom errors for unexpected failures, Result pattern for expected outcomes like form validation or API responses.`,
	objectives: [
		'Create custom error classes that extend Error with extra properties',
		'Use instanceof to handle different error types differently',
		'Implement the Result pattern as an alternative to try/catch',
		'Choose between throwing and returning errors based on the situation'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === Custom Error Classes ===
  class AppError extends Error {
    constructor(message, code, details = null) {
      super(message);
      this.name = 'AppError';
      this.code = code;
      this.details = details;
    }
  }

  class ValidationError extends AppError {
    constructor(field, message) {
      super(message, 'VALIDATION_ERROR', { field });
      this.name = 'ValidationError';
      this.field = field;
    }
  }

  class NetworkError extends AppError {
    constructor(status, message) {
      super(message, 'NETWORK_ERROR', { status });
      this.name = 'NetworkError';
      this.status = status;
    }
  }

  // === Result Pattern ===
  function ok(data) {
    return { ok: true, data };
  }

  function err(error) {
    return { ok: false, error };
  }

  // Functions that return Results instead of throwing
  function validateEmail(email) {
    if (!email) return err('Email is required');
    if (!email.includes('@')) return err('Email must contain @');
    if (email.length < 5) return err('Email too short');
    return ok(email.toLowerCase().trim());
  }

  function validateAge(age) {
    const num = Number(age);
    if (isNaN(num)) return err('Age must be a number');
    if (num < 0 || num > 150) return err('Age must be 0-150');
    return ok(num);
  }

  // === Demo State ===
  let email = $state('');
  let age = $state('');
  let formResult = $state(null);

  let throwDemo = $state('');
  let throwResult = $state(null);

  function submitForm() {
    const emailResult = validateEmail(email);
    if (!emailResult.ok) {
      formResult = { ok: false, field: 'email', error: emailResult.error };
      return;
    }

    const ageResult = validateAge(age);
    if (!ageResult.ok) {
      formResult = { ok: false, field: 'age', error: ageResult.error };
      return;
    }

    formResult = {
      ok: true,
      data: { email: emailResult.data, age: ageResult.data }
    };
  }

  function demoThrow(type) {
    throwResult = null;
    try {
      switch (type) {
        case 'validation':
          throw new ValidationError('username', 'Username must be at least 3 characters');
        case 'network':
          throw new NetworkError(503, 'Service temporarily unavailable');
        case 'generic':
          throw new AppError('Something went wrong', 'UNKNOWN');
      }
    } catch (e) {
      if (e instanceof ValidationError) {
        throwResult = {
          handler: 'ValidationError handler',
          name: e.name,
          field: e.field,
          message: e.message,
          code: e.code
        };
      } else if (e instanceof NetworkError) {
        throwResult = {
          handler: 'NetworkError handler',
          name: e.name,
          status: e.status,
          message: e.message,
          code: e.code
        };
      } else if (e instanceof AppError) {
        throwResult = {
          handler: 'AppError handler (fallback)',
          name: e.name,
          message: e.message,
          code: e.code
        };
      }
    }
  }
</script>

<h1>Custom Errors & Patterns</h1>

<section>
  <h2>Custom Error Classes</h2>
  <p>Click to throw and catch different custom error types:</p>
  <div class="buttons">
    <button class="validation" onclick={() => demoThrow('validation')}>Throw ValidationError</button>
    <button class="network" onclick={() => demoThrow('network')}>Throw NetworkError</button>
    <button class="generic" onclick={() => demoThrow('generic')}>Throw AppError</button>
  </div>

  {#if throwResult}
    <div class="error-card">
      <div class="handler-badge">{throwResult.handler}</div>
      <dl>
        {#each Object.entries(throwResult).filter(([k]) => k !== 'handler') as [key, value]}
          <dt>{key}</dt>
          <dd>{value}</dd>
        {/each}
      </dl>
    </div>
  {/if}

  <pre class="code">
class ValidationError extends AppError {'{'}
  constructor(field, message) {'{'}
    super(message, 'VALIDATION_ERROR');
    this.field = field;
  {'}'}
{'}'}

// Catch with instanceof:
catch (e) {'{'}
  if (e instanceof ValidationError) ...
  else if (e instanceof NetworkError) ...
{'}'}
  </pre>
</section>

<section>
  <h2>Result Pattern</h2>
  <p>No throwing — functions return {'{'}ok, data{'}'} or {'{'}ok: false, error{'}'}:</p>

  <div class="form">
    <label>
      Email:
      <input bind:value={email} placeholder="user@example.com"
        class:field-error={formResult && !formResult.ok && formResult.field === 'email'} />
    </label>
    <label>
      Age:
      <input bind:value={age} placeholder="25"
        class:field-error={formResult && !formResult.ok && formResult.field === 'age'} />
    </label>
    <button onclick={submitForm}>Submit (Result pattern)</button>
  </div>

  {#if formResult}
    {#if formResult.ok}
      <div class="success">
        Validated! email: {formResult.data.email}, age: {formResult.data.age}
      </div>
    {:else}
      <div class="failure">
        {formResult.field}: {formResult.error}
      </div>
    {/if}
  {/if}

  <pre class="code">
function validateEmail(email) {'{'}
  if (!email) return err('Email is required');
  return ok(email.trim());
{'}'}

const result = validateEmail(input);
if (!result.ok) showError(result.error);
else useData(result.data);
  </pre>
</section>

<div class="comparison">
  <div class="approach">
    <h3>Throwing (try/catch)</h3>
    <ul>
      <li>Good for unexpected errors</li>
      <li>Propagates up automatically</li>
      <li>Easy to forget to catch</li>
    </ul>
  </div>
  <div class="approach">
    <h3>Result Pattern</h3>
    <ul>
      <li>Good for expected failures</li>
      <li>Forces caller to handle both cases</li>
      <li>No hidden control flow</li>
    </ul>
  </div>
</div>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.5rem 0; }
  button {
    padding: 0.5rem 1rem;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .validation { background: #d97706; }
  .network { background: #dc2626; }
  .generic { background: #7c3aed; }
  .error-card {
    margin: 1rem 0;
    padding: 0.75rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
  }
  .handler-badge {
    background: #4f46e5;
    color: white;
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
  dl { display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 1rem; margin: 0; }
  dt { font-weight: bold; color: #555; font-size: 0.85rem; }
  dd { margin: 0; font-family: monospace; font-size: 0.85rem; }
  pre.code {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre;
    margin-top: 1rem;
  }
  .form { display: flex; flex-direction: column; gap: 0.5rem; margin: 0.75rem 0; }
  .form label { display: flex; align-items: center; gap: 0.5rem; }
  .form input { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
  .field-error { border-color: #ef4444 !important; background: #fef2f2; }
  .form button { background: #4f46e5; align-self: flex-start; }
  .success { background: #f0fdf4; border: 1px solid #86efac; padding: 0.75rem; border-radius: 6px; margin-top: 0.5rem; color: #166534; }
  .failure { background: #fef2f2; border: 1px solid #fca5a5; padding: 0.75rem; border-radius: 6px; margin-top: 0.5rem; color: #991b1b; }
  .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; }
  .approach { padding: 1rem; background: #f0f4ff; border-radius: 8px; }
  .approach h3 { margin: 0 0 0.5rem; }
  ul { padding-left: 1.2rem; margin: 0; }
  li { margin: 0.25rem 0; font-size: 0.9rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
