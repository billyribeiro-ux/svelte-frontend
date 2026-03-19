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

The try block contains code that might fail. If it throws, execution jumps to the catch block where you can handle the error. The finally block always runs — whether the code succeeded or failed — making it perfect for cleanup.

Knowing when to throw an error vs return null is a design decision. Throw when something is truly unexpected; return null or a default when a missing value is normal.`,
	objectives: [
		'Use try/catch to handle errors without crashing the app',
		'Use finally for cleanup that must run regardless of success or failure',
		'Decide when to throw an error vs return null or a default value'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let jsonInput = $state('{"name": "Alice", "age": 25}');
  let parseResult = $state(null);
  let parseError = $state('');
  let parseStatus = $state('');

  function parseJSON() {
    parseResult = null;
    parseError = '';
    parseStatus = '';

    try {
      // This might throw if JSON is invalid
      const data = JSON.parse(jsonInput);
      parseResult = data;
      parseStatus = 'success';
    } catch (error) {
      // Handle the error gracefully
      parseError = error.message;
      parseStatus = 'error';
    } finally {
      // Always runs — good for cleanup, logging, hiding spinners
      parseStatus += ' (finally block ran)';
    }
  }

  // A function that throws vs one that returns null
  function divideStrict(a, b) {
    if (b === 0) throw new Error('Cannot divide by zero!');
    return a / b;
  }

  function divideSafe(a, b) {
    if (b === 0) return null; // Caller handles null
    return a / b;
  }

  let numerator = $state(10);
  let denominator = $state(0);
  let divResult = $state('');

  function tryDivide() {
    // Using the throwing version with try/catch
    try {
      const result = divideStrict(numerator, denominator);
      divResult = \`Result: \${result}\`;
    } catch (e) {
      divResult = \`Caught: \${e.message}\`;
    }
  }

  function safeDivide() {
    // Using the null-returning version
    const result = divideSafe(numerator, denominator);
    divResult = result === null
      ? 'Result: Cannot divide (returned null)'
      : \`Result: \${result}\`;
  }

  // Nested try/catch for multi-step operations
  let multiStepResult = $state('');

  function multiStep() {
    multiStepResult = '';
    const steps = [];

    try {
      steps.push('Step 1: Parse config');
      const config = JSON.parse('{"retries": 3}');

      steps.push('Step 2: Validate');
      if (config.retries > 5) throw new Error('Too many retries');

      steps.push('Step 3: Process');
      // Simulate processing
      steps.push('All steps completed!');
      multiStepResult = steps.join('\\n');
    } catch (error) {
      steps.push(\`Failed: \${error.message}\`);
      multiStepResult = steps.join('\\n');
    } finally {
      multiStepResult += '\\n(Cleanup done in finally)';
    }
  }
</script>

<h1>try / catch / finally</h1>

<section>
  <h2>JSON Parsing (Classic try/catch)</h2>
  <textarea bind:value={jsonInput} rows="4"></textarea>
  <button onclick={parseJSON}>Parse JSON</button>

  {#if parseStatus}
    <div class="result" class:success={parseResult} class:error={parseError}>
      {#if parseResult}
        <strong>Parsed successfully:</strong>
        <pre>{JSON.stringify(parseResult, null, 2)}</pre>
      {/if}
      {#if parseError}
        <strong>Error:</strong> {parseError}
      {/if}
      <p class="status">{parseStatus}</p>
    </div>
  {/if}

  <p class="hint">Try entering invalid JSON like <code>{'{'}name: Alice{'}'}</code> (missing quotes)</p>
</section>

<section>
  <h2>Throw vs Return Null</h2>
  <div class="controls">
    <label>Numerator: <input type="number" bind:value={numerator} /></label>
    <label>Denominator: <input type="number" bind:value={denominator} /></label>
  </div>
  <div class="controls">
    <button onclick={tryDivide}>divideStrict (throws)</button>
    <button class="alt" onclick={safeDivide}>divideSafe (returns null)</button>
  </div>
  {#if divResult}
    <p class="result-text">{divResult}</p>
  {/if}
  <p class="hint">Set denominator to 0 to see both approaches handle the error differently.</p>
</section>

<section>
  <h2>Multi-Step with Finally</h2>
  <button onclick={multiStep}>Run Multi-Step Process</button>
  {#if multiStepResult}
    <pre class="steps">{multiStepResult}</pre>
  {/if}
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
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
  button:hover { background: #4338ca; }
  .alt { background: #059669; }
  .alt:hover { background: #047857; }
  .result {
    margin-top: 0.75rem;
    padding: 0.75rem;
    border-radius: 6px;
    border: 1px solid;
  }
  .success { background: #f0fdf4; border-color: #86efac; }
  .error { background: #fef2f2; border-color: #fca5a5; }
  pre { margin: 0.5rem 0; font-size: 0.85rem; white-space: pre-wrap; }
  .status { font-size: 0.8rem; color: #888; margin: 0.5rem 0 0; }
  .controls { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin: 0.5rem 0; }
  label { display: flex; align-items: center; gap: 0.5rem; }
  input { padding: 0.3rem; width: 80px; border: 1px solid #ccc; border-radius: 4px; }
  .result-text { font-weight: bold; padding: 0.5rem; background: #f5f5f5; border-radius: 4px; }
  .hint { font-size: 0.85rem; color: #666; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .steps {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    margin-top: 0.75rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
