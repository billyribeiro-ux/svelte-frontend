import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '7-2',
		title: 'Error Types & Stack Traces',
		phase: 2,
		module: 7,
		lessonIndex: 2
	},
	description: `Not all errors are the same. JavaScript has built-in error types that tell you what went wrong: TypeError (wrong type), ReferenceError (variable doesn't exist), SyntaxError (invalid code), RangeError (value out of range), and more.

Each error carries a message (what happened) and a stack trace (where it happened). The stack trace shows the chain of function calls that led to the error — it's your debugging roadmap.

Learning to read stack traces quickly is one of the most valuable debugging skills. Start from the top (where the error occurred) and work down (who called what).`,
	objectives: [
		'Identify common error types: TypeError, ReferenceError, RangeError',
		'Read a stack trace to find where and why an error occurred',
		'Use error.name, error.message, and error.stack for debugging'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let selectedError = $state('');
  let caughtError = $state(null);
  let errorDetails = $state(null);

  function triggerTypeError() {
    try {
      const num = null;
      num.toString(); // Cannot read property of null
    } catch (e) {
      captureError(e);
    }
  }

  function triggerRangeError() {
    try {
      const arr = new Array(-1); // Invalid array length
    } catch (e) {
      captureError(e);
    }
  }

  function triggerURIError() {
    try {
      decodeURIComponent('%'); // Malformed URI
    } catch (e) {
      captureError(e);
    }
  }

  function triggerCustom() {
    try {
      function validateAge(age) {
        if (typeof age !== 'number') throw new TypeError('Age must be a number');
        if (age < 0 || age > 150) throw new RangeError('Age must be between 0 and 150');
        return age;
      }

      function processUser(user) {
        return validateAge(user.age);
      }

      function handleForm() {
        const user = { name: 'Bob', age: 'twenty' };
        return processUser(user);
      }

      handleForm();
    } catch (e) {
      captureError(e);
    }
  }

  function captureError(e) {
    caughtError = e;
    errorDetails = {
      name: e.name,
      message: e.message,
      stack: e.stack || 'No stack trace available',
      isTypeError: e instanceof TypeError,
      isRangeError: e instanceof RangeError,
      isURIError: e instanceof URIError
    };
  }

  function clearError() {
    caughtError = null;
    errorDetails = null;
  }

  let stackLines = $derived.by(() => {
    if (!errorDetails) return [];
    return errorDetails.stack.split('\\n').map(line => {
      const isUserCode = !line.includes('node_modules') && !line.includes('svelte');
      return { text: line.trim(), isUserCode };
    });
  });
</script>

<h1>Error Types & Stack Traces</h1>

<section>
  <h2>Trigger an Error</h2>
  <div class="buttons">
    <button class="type-error" onclick={triggerTypeError}>TypeError</button>
    <button class="range-error" onclick={triggerRangeError}>RangeError</button>
    <button class="uri-error" onclick={triggerURIError}>URIError</button>
    <button class="custom" onclick={triggerCustom}>Nested TypeError</button>
    {#if caughtError}
      <button class="clear" onclick={clearError}>Clear</button>
    {/if}
  </div>
</section>

{#if errorDetails}
  <section class="error-display">
    <h2>Caught Error</h2>

    <div class="error-header">
      <span class="error-badge">{errorDetails.name}</span>
      <span class="error-message">{errorDetails.message}</span>
    </div>

    <div class="properties">
      <div class="prop">
        <code>error.name</code>
        <span>{errorDetails.name}</span>
      </div>
      <div class="prop">
        <code>error.message</code>
        <span>{errorDetails.message}</span>
      </div>
      <div class="prop">
        <code>instanceof TypeError</code>
        <span>{String(errorDetails.isTypeError)}</span>
      </div>
      <div class="prop">
        <code>instanceof RangeError</code>
        <span>{String(errorDetails.isRangeError)}</span>
      </div>
    </div>

    <h3>Stack Trace</h3>
    <div class="stack">
      {#each stackLines as line, i}
        <div class="stack-line" class:user-code={line.isUserCode}>
          <span class="line-num">{i}</span>
          <span>{line.text}</span>
        </div>
      {/each}
    </div>
    <p class="stack-tip">Lines from your code are highlighted. Read from the top — that's where the error originated.</p>
  </section>
{/if}

<section class="reference">
  <h2>Common Error Types</h2>
  <table>
    <thead>
      <tr><th>Type</th><th>Cause</th><th>Example</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><code>TypeError</code></td>
        <td>Wrong type or null access</td>
        <td>null.toString()</td>
      </tr>
      <tr>
        <td><code>ReferenceError</code></td>
        <td>Variable doesn't exist</td>
        <td>console.log(x) // x not defined</td>
      </tr>
      <tr>
        <td><code>SyntaxError</code></td>
        <td>Invalid code syntax</td>
        <td>JSON.parse("invalid")</td>
      </tr>
      <tr>
        <td><code>RangeError</code></td>
        <td>Value out of valid range</td>
        <td>new Array(-1)</td>
      </tr>
      <tr>
        <td><code>URIError</code></td>
        <td>Malformed URI</td>
        <td>decodeURIComponent('%')</td>
      </tr>
    </tbody>
  </table>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  button {
    padding: 0.5rem 1rem;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
  }
  .type-error { background: #dc2626; }
  .range-error { background: #d97706; }
  .uri-error { background: #7c3aed; }
  .custom { background: #0891b2; }
  .clear { background: #6b7280; }
  .error-display { background: #fef2f2; border: 1px solid #fca5a5; }
  .error-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
  .error-badge {
    background: #dc2626;
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9rem;
  }
  .error-message { font-size: 1.1rem; color: #991b1b; }
  .properties { display: grid; gap: 0.5rem; margin: 1rem 0; }
  .prop {
    display: flex;
    gap: 1rem;
    padding: 0.4rem;
    background: white;
    border-radius: 4px;
    align-items: center;
  }
  .prop code { min-width: 160px; font-size: 0.85rem; background: #f0f0f0; padding: 0.2rem 0.4rem; border-radius: 3px; }
  .stack {
    background: #1e1e1e;
    border-radius: 6px;
    padding: 0.5rem;
    overflow-x: auto;
    max-height: 250px;
    overflow-y: auto;
  }
  .stack-line {
    display: flex;
    gap: 0.5rem;
    padding: 0.2rem 0.4rem;
    font-family: monospace;
    font-size: 0.75rem;
    color: #888;
  }
  .stack-line.user-code { color: #fbbf24; background: rgba(251, 191, 36, 0.1); }
  .line-num { color: #555; min-width: 1.5rem; }
  .stack-tip { font-size: 0.8rem; color: #666; margin-top: 0.5rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #f0f0f0; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
