import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '7-4',
		title: 'JSON & Deep Copying',
		phase: 2,
		module: 7,
		lessonIndex: 4
	},
	description: `JSON (JavaScript Object Notation) is the universal data format of the web. APIs send it, localStorage stores it, config files use it. Understanding how JSON maps to JavaScript objects — and where they differ — is essential.

JSON.stringify converts objects to strings; JSON.parse converts strings back to objects. But this round-trip loses functions, undefined values, Dates, Maps, Sets, and circular references. JSON.parse also accepts a reviver function that can transform values during parsing.

When working with reactive state, you often need copies that don't share references with the original. Spread gives you a shallow copy. structuredClone() gives you a deep copy that handles Dates and Maps. And Svelte's $state.snapshot() gives you a non-reactive deep copy of state — perfect for sending to APIs or logging.`,
	objectives: [
		'Convert between JSON strings and JavaScript objects with parse/stringify',
		'Understand what JSON drops: functions, undefined, Dates, Maps, Sets',
		'Use JSON.parse reviver and JSON.stringify replacer for transforms',
		'Compare shallow copy, JSON clone, structuredClone, and $state.snapshot()'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // 1. JSON.stringify and JSON.parse — the basics
  // ============================================================

  let jsObject = $state({
    name: 'Alice',
    age: 30,
    tags: ['admin', 'pro'],
    active: true
  });

  let jsonString = $derived(JSON.stringify(jsObject, null, 2));
  let roundTrip = $derived(JSON.parse(jsonString));

  // ============================================================
  // 2. WHAT JSON LOSES
  // ============================================================

  const rich = {
    name: 'Alice',
    greet: function () {
      return 'hi';
    }, // function → lost
    age: undefined, // undefined → lost
    joined: new Date('2024-01-15'), // Date → becomes string
    tags: new Set(['a', 'b']), // Set → becomes {}
    roles: new Map([['admin', true]]), // Map → becomes {}
    nan: NaN, // NaN → null
    inf: Infinity // Infinity → null
  };

  const lossyJson = JSON.stringify(rich, null, 2);
  const afterParse = JSON.parse(lossyJson);

  // ============================================================
  // 3. REVIVER and REPLACER
  // ============================================================

  const order = {
    id: 42,
    placedAt: new Date('2024-06-01T12:00:00Z'),
    total: 99.99,
    secret: 'DO_NOT_LEAK'
  };

  // Replacer: drop secrets, stringify Date
  const replaced = JSON.stringify(
    order,
    (key, value) => {
      if (key === 'secret') return undefined; // drop
      return value;
    },
    2
  );

  // Reviver: revive Date strings back into Date objects
  const reviverParsed = JSON.parse(replaced, (key, value) => {
    if (key === 'placedAt' && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  });

  const placedAtIsDate = reviverParsed.placedAt instanceof Date;

  // ============================================================
  // 4. SHALLOW vs DEEP COPY
  // ============================================================

  let original = $state({
    name: 'Alice',
    meta: { score: 100, level: 5 },
    tags: ['a', 'b']
  });

  let shallowLog = $state('(not yet created)');
  let deepLog = $state('(not yet created)');

  function testShallow() {
    // Spread creates a shallow copy — nested objects are shared
    const copy = { ...original };
    copy.meta.score = 999; // mutates ORIGINAL's nested object!
    shallowLog = \`original.meta.score is now \${original.meta.score} (shared reference)\`;
    // Reset for demo
    original.meta.score = 100;
  }

  function testDeep() {
    // structuredClone does a full deep copy
    const copy = structuredClone(original);
    copy.meta.score = 999; // only mutates the copy
    deepLog = \`original.meta.score is still \${original.meta.score} (independent copy)\`;
  }

  // ============================================================
  // 5. $state.snapshot — plain deep copy of reactive state
  // ============================================================

  let profile = $state({
    name: 'Bob',
    prefs: { theme: 'dark', notifications: true },
    scores: [10, 20, 30]
  });

  let snapshotJson = $state('');

  function takeSnapshot() {
    // $state.snapshot returns a plain, non-reactive deep copy.
    // Perfect for sending to fetch(), localStorage, or logging.
    const snap = $state.snapshot(profile);
    snapshotJson = JSON.stringify(snap, null, 2);
  }

  function mutateAfterSnapshot() {
    profile.scores.push(99);
    profile.prefs.theme = 'light';
  }

  // ============================================================
  // 6. structuredClone handles Dates, Maps, Sets, cycles
  // ============================================================

  let cloneOutput = $state('');

  function demoStructuredClone() {
    const obj = {
      when: new Date(),
      tags: new Set(['svelte', 'ts']),
      meta: new Map([['lang', 'en']])
    };

    const copy = structuredClone(obj);
    cloneOutput = [
      'original.when instanceof Date: ' + (obj.when instanceof Date),
      'copy.when instanceof Date: ' + (copy.when instanceof Date),
      'copy.tags instanceof Set: ' + (copy.tags instanceof Set),
      'copy.meta instanceof Map: ' + (copy.meta instanceof Map),
      'same reference? ' + (obj === copy)
    ].join('\\n');
  }
</script>

<h1>JSON & Deep Copying</h1>

<section>
  <h2>1. JSON Round Trip</h2>
  <p class="intro">stringify converts object → string, parse converts string → object.</p>
  <div class="cols">
    <div>
      <h3>JS Object</h3>
      <input bind:value={jsObject.name} />
      <input type="number" bind:value={jsObject.age} />
    </div>
    <div>
      <h3>JSON string</h3>
      <pre class="code">{jsonString}</pre>
    </div>
    <div>
      <h3>Parsed back</h3>
      <pre class="code">{JSON.stringify(roundTrip, null, 2)}</pre>
    </div>
  </div>
</section>

<section>
  <h2>2. What JSON Loses</h2>
  <p class="intro">Functions, undefined, Dates, Maps, and Sets do not survive the round trip.</p>
  <pre class="code">{lossyJson}</pre>
  <p class="hint">
    Notice: <code>greet</code> and <code>age</code> are gone. <code>joined</code> became a string.
    <code>tags</code> and <code>roles</code> became empty objects.
  </p>
  <details>
    <summary>After JSON.parse</summary>
    <pre class="code">{JSON.stringify(afterParse, null, 2)}</pre>
  </details>
</section>

<section>
  <h2>3. Reviver & Replacer</h2>
  <p class="intro">A replacer can drop secrets. A reviver can rehydrate Dates.</p>
  <pre class="code">{replaced}</pre>
  <p>placedAt is now a Date object again: <strong>{placedAtIsDate}</strong></p>
</section>

<section>
  <h2>4. Shallow vs Deep Copy</h2>
  <p class="intro">Spread copies the top level only — nested objects are shared.</p>
  <button onclick={testShallow}>Test shallow copy</button>
  <button onclick={testDeep}>Test deep copy</button>
  <p class="log">shallow: {shallowLog}</p>
  <p class="log">deep: {deepLog}</p>
</section>

<section>
  <h2>5. $state.snapshot()</h2>
  <p class="intro">
    Returns a plain non-reactive deep copy of reactive state. Use it before calling APIs.
  </p>
  <div>
    <strong>Live state:</strong>
    <pre class="code">{JSON.stringify(profile, null, 2)}</pre>
  </div>
  <button onclick={takeSnapshot}>Take snapshot</button>
  <button onclick={mutateAfterSnapshot}>Mutate state after snapshot</button>
  {#if snapshotJson}
    <div>
      <strong>Snapshot (frozen in time):</strong>
      <pre class="code">{snapshotJson}</pre>
    </div>
  {/if}
</section>

<section>
  <h2>6. structuredClone() handles exotic types</h2>
  <button onclick={demoStructuredClone}>Clone with Dates/Maps/Sets</button>
  {#if cloneOutput}
    <pre class="code">{cloneOutput}</pre>
  {/if}
</section>

<section class="cheat">
  <h2>Copying Cheat Sheet</h2>
  <table>
    <thead>
      <tr><th>Method</th><th>Depth</th><th>Handles Date/Map/Set</th><th>Use for</th></tr>
    </thead>
    <tbody>
      <tr><td>spread <code>{'{...o}'}</code></td><td>shallow</td><td>no</td><td>top-level copy</td></tr>
      <tr><td>JSON round-trip</td><td>deep</td><td>no</td><td>plain data only</td></tr>
      <tr><td><code>structuredClone</code></td><td>deep</td><td>yes</td><td>rich data, cycles</td></tr>
      <tr><td><code>$state.snapshot</code></td><td>deep</td><td>plain</td><td>reactive → plain</td></tr>
    </tbody>
  </table>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .intro { font-size: 0.9rem; color: #555; margin: 0 0 0.5rem; }
  .cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
  .cols h3 { font-size: 0.85rem; margin: 0 0 0.3rem; color: #666; }
  input {
    padding: 0.3rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-bottom: 0.3rem;
    width: 100%;
    box-sizing: border-box;
  }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin: 0.25rem 0.25rem 0.25rem 0;
  }
  button:hover { background: #4338ca; }
  .code {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    margin: 0.3rem 0;
    white-space: pre-wrap;
    overflow-x: auto;
  }
  .log {
    font-family: monospace;
    font-size: 0.85rem;
    background: white;
    border: 1px solid #e0e0e0;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    margin: 0.25rem 0;
  }
  .hint { font-size: 0.85rem; color: #666; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  details { margin-top: 0.5rem; }
  summary { cursor: pointer; color: #4f46e5; font-size: 0.9rem; }
  .cheat { background: #fffbeb; border: 1px solid #fde68a; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.4rem 0.6rem; text-align: left; border-bottom: 1px solid #fde68a; }
  th { background: #fef3c7; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
