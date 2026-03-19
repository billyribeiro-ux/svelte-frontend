import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-6',
		title: 'Reactivity Boundaries: What Breaks',
		phase: 2,
		module: 6,
		lessonIndex: 6
	},
	description: `Reactivity in Svelte 5 has boundaries. Cross them, and your UI silently stops updating. This is the #1 source of intermediate Svelte bugs.

The main trap: destructuring reactive values into plain variables kills the reactive link. When you write "const { name } = user" where user is $state, name is now a plain string — it won't update when user.name changes.

The fix: use getter functions to preserve reactivity across boundaries. Instead of passing a reactive value directly, pass a function that reads it: () => user.name.`,
	objectives: [
		'Identify when destructuring breaks reactivity and why',
		'Use getter functions to preserve reactivity across boundaries',
		'Understand pass-by-value vs pass-by-reference in reactive contexts'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ========================================
  // THE BUG: Destructuring kills reactivity
  // ========================================
  let user = $state({ name: 'Alice', age: 25, score: 100 });

  // This destructuring creates plain (non-reactive) copies!
  // name_broken will NOT update when user.name changes
  const { name: name_broken } = user;

  // ========================================
  // FIX 1: Access properties directly
  // ========================================
  // user.name is reactive — always read from the reactive source

  // ========================================
  // FIX 2: Use a getter function
  // ========================================
  function getName() {
    return user.name;
  }

  // ========================================
  // DEMO: Pass-by-value gotcha
  // ========================================
  let count = $state(0);

  // This "captures" count at its current value — won't update!
  let countCopy = count;

  // This stays reactive because it's a $derived
  let countDerived = $derived(count);

  function increment() {
    count++;
    user.name = user.name === 'Alice' ? 'Bob' : 'Alice';
    user.score += 10;
  }
</script>

<h1>Reactivity Boundaries</h1>

<button onclick={increment}>Change values</button>

<div class="comparison">
  <div class="panel broken">
    <h2>Broken (Destructured)</h2>
    <pre>const {'{'} name {'}'} = user;</pre>

    <div class="value">
      <span class="label">name (destructured):</span>
      <span class="result">{name_broken}</span>
    </div>
    <p class="note">This value was copied once and never updates.</p>

    <div class="value">
      <span class="label">countCopy = count:</span>
      <span class="result">{countCopy}</span>
    </div>
    <p class="note">Primitive values are copied by value — the link is broken.</p>
  </div>

  <div class="panel working">
    <h2>Working (Direct Access)</h2>
    <pre>user.name  // always reactive</pre>

    <div class="value">
      <span class="label">user.name (direct):</span>
      <span class="result">{user.name}</span>
    </div>
    <p class="note">Reading from the reactive source always works.</p>

    <div class="value">
      <span class="label">$derived(count):</span>
      <span class="result">{countDerived}</span>
    </div>
    <p class="note">$derived creates a reactive binding — it tracks count.</p>
  </div>
</div>

<section>
  <h2>The Getter Pattern</h2>
  <p>When you need to pass reactive values across boundaries (to helper functions, other modules), use a getter:</p>
  <pre class="code-block">
// Instead of:
const name = user.name;           // snapshots once

// Use a getter:
function getName() {'{'} return user.name; {'}'}  // reads fresh every time

// Current value via getter: <strong>{getName()}</strong>
  </pre>
</section>

<section>
  <h2>Live State Inspector</h2>
  <table>
    <thead>
      <tr><th>What</th><th>Value</th><th>Reactive?</th></tr>
    </thead>
    <tbody>
      <tr>
        <td><code>user.name</code></td>
        <td>{user.name}</td>
        <td class="yes">Yes</td>
      </tr>
      <tr>
        <td><code>user.score</code></td>
        <td>{user.score}</td>
        <td class="yes">Yes</td>
      </tr>
      <tr>
        <td><code>name (destructured)</code></td>
        <td>{name_broken}</td>
        <td class="no">No — frozen!</td>
      </tr>
      <tr>
        <td><code>count ($state)</code></td>
        <td>{count}</td>
        <td class="yes">Yes</td>
      </tr>
      <tr>
        <td><code>countCopy = count</code></td>
        <td>{countCopy}</td>
        <td class="no">No — snapshot!</td>
      </tr>
      <tr>
        <td><code>$derived(count)</code></td>
        <td>{countDerived}</td>
        <td class="yes">Yes</td>
      </tr>
      <tr>
        <td><code>getName()</code></td>
        <td>{getName()}</td>
        <td class="yes">Yes (re-reads)</td>
      </tr>
    </tbody>
  </table>
</section>

<style>
  h1 { color: #333; }
  button {
    padding: 0.6rem 1.5rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0;
  }
  .panel { padding: 1rem; border-radius: 8px; border: 2px solid; }
  .broken { border-color: #ef4444; background: #fef2f2; }
  .working { border-color: #22c55e; background: #f0fdf4; }
  .panel h2 { margin: 0 0 0.75rem; font-size: 1.1rem; }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin: 0.5rem 0;
  }
  .value { display: flex; gap: 0.5rem; margin: 0.5rem 0; align-items: baseline; flex-wrap: wrap; }
  .label { font-size: 0.85rem; color: #666; }
  .result { font-weight: bold; font-size: 1.1rem; }
  .note { font-size: 0.8rem; color: #888; margin: 0 0 0.75rem; font-style: italic; }
  section { margin: 1.5rem 0; }
  .code-block { white-space: pre; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee; }
  th { background: #f5f5f5; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  .yes { color: #16a34a; font-weight: bold; }
  .no { color: #dc2626; font-weight: bold; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
