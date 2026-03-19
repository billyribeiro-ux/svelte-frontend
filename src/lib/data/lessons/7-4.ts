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

JSON.stringify converts objects to strings; JSON.parse converts strings back to objects. But this round-trip loses functions, undefined values, Dates, and more.

When working with reactive state, you often need copies that don't share references with the original. Spread ({...obj}) gives you a shallow copy. structuredClone() gives you a deep copy. And Svelte's $state.snapshot() gives you a non-reactive deep copy of state — perfect for sending to APIs.`,
	objectives: [
		'Convert between JSON strings and JavaScript objects with parse/stringify',
		'Understand what JSON drops: functions, undefined, circular refs, Dates',
		'Compare shallow copy (spread) vs deep copy (structuredClone)',
		'Use $state.snapshot() to get a plain deep copy of reactive state'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === JSON round-trip ===
  let originalObj = $state({
    name: 'Alice',
    age: 30,
    hobbies: ['reading', 'coding'],
    address: { city: 'Portland', state: 'OR' },
    createdAt: new Date().toISOString()
  });

  let jsonString = $derived(JSON.stringify(originalObj, null, 2));
  let parsedBack = $derived(JSON.parse(jsonString));

  // === What JSON loses ===
  let lossyObj = {
    name: 'Bob',
    greet: function() { return 'hi'; },  // functions: lost
    score: undefined,                     // undefined: lost
    count: NaN,                          // NaN: becomes null
    date: new Date(),                    // Date: becomes string
    regex: /test/g                       // RegExp: becomes {}
  };

  let lossyJson = JSON.stringify(lossyObj, null, 2);
  let lossyParsed = JSON.parse(lossyJson);

  // === Shallow vs Deep Copy ===
  let source = $state({
    name: 'Team A',
    members: ['Alice', 'Bob'],
    config: { theme: 'dark' }
  });

  let shallowCopy = $state(null);
  let deepCopy = $state(null);
  let snapshotCopy = $state(null);
  let copyResult = $state('');

  function makeShallowCopy() {
    shallowCopy = { ...source };
    // Modify nested array in copy
    shallowCopy.members.push('Charlie');
    // Oops! source.members is also modified because spread is shallow
    copyResult = 'Shallow copy: modifying copy.members also changed source.members! They share the same array reference.';
  }

  function makeDeepCopy() {
    // Reset source first
    source.members = ['Alice', 'Bob'];
    deepCopy = structuredClone(source);
    deepCopy.members.push('Charlie');
    // source.members is NOT modified — structuredClone creates independent copies
    copyResult = 'Deep copy: source.members is unchanged. structuredClone creates fully independent copies.';
  }

  function makeSnapshot() {
    source.members = ['Alice', 'Bob'];
    snapshotCopy = $state.snapshot(source);
    // snapshotCopy is a plain (non-reactive) deep copy
    copyResult = '$state.snapshot: creates a plain, non-reactive deep copy. Perfect for sending to APIs or localStorage.';
  }

  // === Editable JSON ===
  let editableJson = $state('{\n  "name": "Edit me",\n  "count": 42\n}');
  let parseError = $state('');
  let parsedEditable = $derived.by(() => {
    try {
      parseError = '';
      return JSON.parse(editableJson);
    } catch (e) {
      parseError = e.message;
      return null;
    }
  });
</script>

<h1>JSON & Deep Copying</h1>

<section>
  <h2>JSON Round-Trip</h2>
  <div class="columns">
    <div>
      <h3>Object</h3>
      <pre>{JSON.stringify(originalObj, null, 2)}</pre>
    </div>
    <div>
      <h3>JSON.stringify &rarr; JSON.parse</h3>
      <pre>{JSON.stringify(parsedBack, null, 2)}</pre>
    </div>
  </div>
</section>

<section>
  <h2>What JSON Loses</h2>
  <div class="columns">
    <div>
      <h3>Original (JS Object)</h3>
      <ul>
        <li>name: "Bob"</li>
        <li>greet: function() ... </li>
        <li>score: undefined</li>
        <li>count: NaN</li>
        <li>date: Date object</li>
        <li>regex: /test/g</li>
      </ul>
    </div>
    <div>
      <h3>After JSON round-trip</h3>
      <pre>{lossyJson}</pre>
      <p class="note">function and undefined are gone. NaN became null. Date became a string. RegExp became empty object.</p>
    </div>
  </div>
</section>

<section>
  <h2>Shallow vs Deep Copy vs $state.snapshot()</h2>
  <p>Source: {JSON.stringify(source)}</p>
  <div class="buttons">
    <button class="warning" onclick={makeShallowCopy}>Shallow Copy (spread)</button>
    <button class="success" onclick={makeDeepCopy}>Deep Copy (structuredClone)</button>
    <button class="info" onclick={makeSnapshot}>$state.snapshot()</button>
  </div>

  {#if copyResult}
    <div class="copy-result">{copyResult}</div>
    <div class="copy-compare">
      <div>
        <strong>source.members:</strong>
        <pre>{JSON.stringify(source.members)}</pre>
      </div>
      <div>
        <strong>copy.members:</strong>
        <pre>{JSON.stringify(
          shallowCopy?.members ?? deepCopy?.members ?? snapshotCopy?.members ?? []
        )}</pre>
      </div>
    </div>
  {/if}
</section>

<section>
  <h2>Live JSON Editor</h2>
  <div class="columns">
    <div>
      <h3>Edit JSON</h3>
      <textarea bind:value={editableJson} rows="6"></textarea>
      {#if parseError}
        <p class="error">{parseError}</p>
      {/if}
    </div>
    <div>
      <h3>Parsed Result</h3>
      {#if parsedEditable}
        <pre>{JSON.stringify(parsedEditable, null, 2)}</pre>
      {:else}
        <p class="error">Invalid JSON</p>
      {/if}
    </div>
  </div>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre-wrap;
    margin: 0.25rem 0;
  }
  ul { list-style: none; padding: 0; }
  li { padding: 0.25rem 0; font-family: monospace; font-size: 0.85rem; }
  .note { font-size: 0.8rem; color: #dc2626; font-style: italic; }
  .buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.75rem 0; }
  button {
    padding: 0.5rem 1rem;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .warning { background: #d97706; }
  .success { background: #16a34a; }
  .info { background: #4f46e5; }
  .copy-result {
    padding: 0.75rem;
    background: #f0f4ff;
    border-radius: 6px;
    margin: 0.5rem 0;
    font-size: 0.9rem;
  }
  .copy-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem; }
  textarea {
    width: 100%;
    font-family: monospace;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    resize: vertical;
    box-sizing: border-box;
  }
  .error { color: #dc2626; font-size: 0.85rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
