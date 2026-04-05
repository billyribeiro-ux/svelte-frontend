import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '7-2',
		title: 'Error Types & Stack Traces',
		phase: 2,
		module: 7,
		lessonIndex: 2
	},
	description: `Not all errors are the same. JavaScript has built-in error types that tell you what went wrong: TypeError (wrong type), ReferenceError (variable doesn't exist), SyntaxError (invalid code), RangeError (value out of range), URIError, and EvalError.

Each error carries a name (what kind), a message (what happened), and a stack trace (where it happened). The stack trace shows the chain of function calls that led to the error — it's your debugging roadmap.

Learning to read stack traces quickly is one of the most valuable debugging skills. Start from the top (where the error occurred) and work down (who called what). In this lesson you'll trigger each error type on demand, inspect error.name/message/stack, and walk through a parsed stack trace.`,
	objectives: [
		'Identify common error types: TypeError, ReferenceError, RangeError, SyntaxError',
		'Read a stack trace to find where and why an error occurred',
		'Use error.name, error.message, and error.stack for debugging',
		'Differentiate errors with instanceof checks'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // Each function below triggers a specific built-in error type
  // ============================================================

  function triggerTypeError() {
    // Calling a method on null is the most common TypeError
    const obj = null;
    return obj.foo(); // TypeError: Cannot read properties of null
  }

  function triggerReferenceError() {
    // Using a variable that was never declared
    // eslint-disable-next-line no-undef
    return notDeclared + 1; // ReferenceError
  }

  function triggerRangeError() {
    // An array length that's negative
    return new Array(-1); // RangeError: Invalid array length
  }

  function triggerSyntaxError() {
    // JSON.parse throws SyntaxError on invalid JSON
    return JSON.parse('{ this is not json }');
  }

  function triggerURIError() {
    // Malformed URI sequence
    return decodeURIComponent('%'); // URIError
  }

  function triggerStackOverflow() {
    // Infinite recursion → RangeError: Maximum call stack
    function recurse() {
      return recurse();
    }
    return recurse();
  }

  // ============================================================
  // Catch and inspect each error
  // ============================================================

  let triggered = $state([]);
  let nextId = 0;

  function tryTrigger(label, fn) {
    const id = nextId++;
    try {
      fn();
      triggered = [
        ...triggered,
        { id, label, name: 'none', message: 'no error thrown', isError: false }
      ];
    } catch (err) {
      triggered = [
        ...triggered,
        {
          id,
          label,
          name: err.name,
          message: err.message,
          isError: true,
          isType: err instanceof TypeError,
          isRef: err instanceof ReferenceError,
          isRange: err instanceof RangeError,
          isSyntax: err instanceof SyntaxError,
          isURI: err instanceof URIError
        }
      ];
    }
  }

  function clearAll() {
    triggered = [];
  }

  // ============================================================
  // Stack trace parser — extract frames from err.stack
  // ============================================================

  let sampleStack = $state('');

  function makeStack() {
    function level3() {
      throw new Error('Something went wrong in level3');
    }
    function level2() {
      level3();
    }
    function level1() {
      level2();
    }

    try {
      level1();
    } catch (err) {
      sampleStack = err.stack || '(no stack available)';
    }
  }

  let stackFrames = $derived(
    sampleStack ? sampleStack.split('\\n').map((line, i) => ({ i, line: line.trim() })) : []
  );

  // ============================================================
  // Handling different error types differently
  // ============================================================

  let routerInput = $state('typeerror');
  let routerOutput = $state('');

  function routeError() {
    routerOutput = '';
    try {
      if (routerInput === 'typeerror') {
        const x = undefined;
        x.doStuff();
      } else if (routerInput === 'rangeerror') {
        const n = -1;
        new Array(n);
      } else if (routerInput === 'syntaxerror') {
        JSON.parse('nope');
      } else if (routerInput === 'custom') {
        throw new Error('Plain error');
      }
    } catch (err) {
      // Different responses for different error types
      if (err instanceof TypeError) {
        routerOutput = 'TypeError — check your data shape or nullability';
      } else if (err instanceof RangeError) {
        routerOutput = 'RangeError — a numeric value was out of bounds';
      } else if (err instanceof SyntaxError) {
        routerOutput = 'SyntaxError — likely malformed JSON or code string';
      } else if (err instanceof Error) {
        routerOutput = 'Generic Error — ' + err.message;
      } else {
        routerOutput = 'Unknown thrown value';
      }
    }
  }
</script>

<h1>Error Types & Stack Traces</h1>

<section>
  <h2>1. Trigger Each Built-in Error Type</h2>
  <p class="intro">Click to deliberately throw each error type. Every click catches it safely.</p>
  <div class="grid">
    <button onclick={() => tryTrigger('TypeError', triggerTypeError)}>TypeError</button>
    <button onclick={() => tryTrigger('ReferenceError', triggerReferenceError)}>ReferenceError</button>
    <button onclick={() => tryTrigger('RangeError', triggerRangeError)}>RangeError</button>
    <button onclick={() => tryTrigger('SyntaxError', triggerSyntaxError)}>SyntaxError</button>
    <button onclick={() => tryTrigger('URIError', triggerURIError)}>URIError</button>
    <button onclick={() => tryTrigger('StackOverflow', triggerStackOverflow)}>Stack Overflow</button>
  </div>

  {#if triggered.length > 0}
    <button class="clear" onclick={clearAll}>Clear log</button>
  {/if}

  <div class="errors">
    {#each triggered as t (t.id)}
      <div class="err-box" class:ok={!t.isError}>
        <div class="err-head">
          <span class="label">{t.label}</span>
          <span class="name">{t.name}</span>
        </div>
        <div class="msg">{t.message}</div>
        {#if t.isError}
          <div class="flags">
            instanceof:
            {#if t.isType}<span class="flag">TypeError</span>{/if}
            {#if t.isRef}<span class="flag">ReferenceError</span>{/if}
            {#if t.isRange}<span class="flag">RangeError</span>{/if}
            {#if t.isSyntax}<span class="flag">SyntaxError</span>{/if}
            {#if t.isURI}<span class="flag">URIError</span>{/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>

<section>
  <h2>2. Reading a Stack Trace</h2>
  <p class="intro">
    level1() calls level2() calls level3() which throws. The stack trace shows that chain.
  </p>
  <button onclick={makeStack}>Generate Stack Trace</button>

  {#if stackFrames.length > 0}
    <div class="stack">
      {#each stackFrames as frame (frame.i)}
        <div class="frame" class:top={frame.i === 0}>
          {#if frame.i === 0}
            <span class="badge">error</span>
          {:else}
            <span class="idx">#{frame.i}</span>
          {/if}
          <code>{frame.line}</code>
        </div>
      {/each}
    </div>
    <p class="hint">
      Tip: the top frame is where the error was thrown. Each frame below is the caller.
    </p>
  {/if}
</section>

<section>
  <h2>3. Routing Behavior by Error Type</h2>
  <p class="intro">Use instanceof to give users helpful, specific messages.</p>
  <select bind:value={routerInput}>
    <option value="typeerror">Trigger TypeError</option>
    <option value="rangeerror">Trigger RangeError</option>
    <option value="syntaxerror">Trigger SyntaxError</option>
    <option value="custom">Trigger generic Error</option>
  </select>
  <button onclick={routeError}>Run</button>
  {#if routerOutput}
    <p class="route-result">{routerOutput}</p>
  {/if}
</section>

<section class="cheat">
  <h2>Cheat Sheet</h2>
  <ul>
    <li><code>TypeError</code> — value has wrong type (null.foo, calling non-function)</li>
    <li><code>ReferenceError</code> — undeclared variable</li>
    <li><code>RangeError</code> — numeric value out of range (negative array length, stack overflow)</li>
    <li><code>SyntaxError</code> — invalid JSON, invalid regex, bad eval()</li>
    <li><code>URIError</code> — malformed URI in encode/decode functions</li>
    <li><code>err.name</code>, <code>err.message</code>, <code>err.stack</code> — the debugging trio</li>
  </ul>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .intro { font-size: 0.9rem; color: #555; margin: 0 0 0.5rem; }
  button {
    padding: 0.5rem 0.9rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin: 0.25rem;
    font-size: 0.85rem;
  }
  button:hover { background: #4338ca; }
  .grid { display: flex; flex-wrap: wrap; gap: 0.25rem; }
  .clear { background: #6b7280; margin-top: 0.5rem; }
  select { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
  .errors { display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.75rem; }
  .err-box {
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 6px;
    padding: 0.6rem;
    font-size: 0.85rem;
  }
  .err-box.ok { background: #f0fdf4; border-color: #86efac; }
  .err-head { display: flex; justify-content: space-between; font-weight: bold; }
  .label { color: #333; }
  .name { color: #991b1b; font-family: monospace; }
  .msg { margin-top: 0.25rem; color: #555; }
  .flags { margin-top: 0.3rem; font-size: 0.75rem; color: #666; }
  .flag {
    display: inline-block;
    background: #dbeafe;
    color: #1e40af;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    margin-right: 0.25rem;
    font-family: monospace;
  }
  .stack {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    margin-top: 0.75rem;
    font-size: 0.8rem;
    font-family: monospace;
  }
  .frame { padding: 0.15rem 0; display: flex; gap: 0.5rem; }
  .frame.top { background: #3f1d1d; color: #fecaca; padding: 0.3rem 0.5rem; border-radius: 3px; }
  .badge {
    background: #dc2626;
    color: white;
    padding: 0 0.4rem;
    border-radius: 3px;
    font-size: 0.7rem;
    font-weight: bold;
  }
  .idx { color: #6b7280; width: 2rem; }
  code { background: transparent; color: inherit; }
  .route-result {
    font-weight: bold;
    padding: 0.75rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    margin-top: 0.5rem;
  }
  .cheat { background: #fffbeb; border: 1px solid #fde68a; }
  .cheat ul { margin: 0; padding-left: 1.2rem; font-size: 0.9rem; line-height: 1.7; }
  .cheat code {
    background: #1e1e1e;
    color: #fde68a;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.8rem;
  }
  .hint { font-size: 0.85rem; color: #666; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
