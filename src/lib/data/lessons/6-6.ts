import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-6',
		title: 'Reactivity Boundaries: What Breaks',
		phase: 2,
		module: 6,
		lessonIndex: 6
	},
	description: `Reactivity in Svelte 5 has boundaries. Cross them, and your UI silently stops updating. This is the #1 source of intermediate-level Svelte bugs.

The main trap: **destructuring** reactive values into plain variables kills the reactive link. When you write <code>const { name } = user</code> and <code>user</code> is <code>$state</code>, <code>name</code> is now a plain string — it holds the value at that moment and won't update when <code>user.name</code> changes.

Another trap: **primitive assignment** like <code>let copy = count</code>. Primitives are copied by value, so <code>copy</code> is frozen at its current number. Passing a primitive as a prop has the same effect.

The fix: keep the **reactive source** accessible. Read <code>user.name</code> directly where you need it, or pass a **getter function** <code>() => user.name</code> across boundaries so the value is re-read each time.`,
	objectives: [
		'Identify when destructuring breaks reactivity and why',
		'Understand pass-by-value for primitives vs pass-by-reference for state',
		'Use getter functions to preserve reactivity across boundaries',
		'Recognise that $derived re-establishes reactivity over a primitive',
		'Debug "why is my value stuck?" issues methodically'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ================================================================
  // Source of truth
  // ================================================================
  let user = $state({ name: 'Alice', age: 25, score: 100 });
  let count = $state(0);

  // ================================================================
  // BROKEN: Destructuring snapshots once
  // ================================================================
  // Reading user.name into a plain variable captures the current value
  // forever. The IIFE is just a way to snapshot without tripping
  // Svelte's "state_referenced_locally" warning — the behaviour is
  // the same as \`const { name: name_broken } = user\`.
  const name_broken = (() => user.name)();
  const age_broken = (() => user.age)();

  // ================================================================
  // BROKEN: Primitive copy
  // ================================================================
  // Primitives (number, string, boolean) are copied by value.
  // countCopy holds the number 0. Changing count later does nothing to it.
  const countCopy = (() => count)();

  // ================================================================
  // FIX 1: Read directly from the source
  // ================================================================
  // user.name is always reactive — read it where you render.

  // ================================================================
  // FIX 2: Getter function — re-reads on every call
  // ================================================================
  function getName() {
    return user.name;
  }
  function getCount() {
    return count;
  }

  // ================================================================
  // FIX 3: $derived creates a reactive binding over a primitive
  // ================================================================
  let countDerived = $derived(count);
  let userNameDerived = $derived(user.name);

  // ================================================================
  // FIX 4: Wrap in a $state object (pass-by-reference)
  // ================================================================
  let countBox = $state({ value: 0 });
  // countBox is an object, so other code can keep a reference to it
  // and read .value at any time.

  // ================================================================
  // Mutation that should trigger updates everywhere
  // ================================================================
  function change() {
    count++;
    user.name = user.name === 'Alice' ? 'Bob' : 'Alice';
    user.age++;
    user.score += 10;
    countBox.value++;
  }

  // ================================================================
  // Explainer function that shows the getter pattern in action.
  // Pretend this is a helper in another file that wants to read
  // a reactive value without capturing a stale snapshot.
  // ================================================================
  function formatName(getter) {
    return \`\u2728 \${getter()} \u2728\`;
  }
</script>

<h1>Reactivity Boundaries</h1>

<p class="lead">
  Svelte 5 makes reactivity feel magical — but there are rules. Cross a boundary and
  your value quietly freezes.
</p>

<button onclick={change}>Change everything</button>

<section>
  <h2>Broken vs Working</h2>
  <div class="comparison">
    <div class="panel broken">
      <h3>Broken: destructured / copied</h3>

      <div class="value">
        <span class="label">const &#123; name &#125; = user</span>
        <span class="result">{name_broken}</span>
      </div>
      <p class="note">Read once at init, never re-reads.</p>

      <div class="value">
        <span class="label">const &#123; age &#125; = user</span>
        <span class="result">{age_broken}</span>
      </div>
      <p class="note">Same story.</p>

      <div class="value">
        <span class="label">let countCopy = count</span>
        <span class="result">{countCopy}</span>
      </div>
      <p class="note">Primitives are copied by value. Frozen forever.</p>
    </div>

    <div class="panel working">
      <h3>Working: reactive access</h3>

      <div class="value">
        <span class="label">user.name</span>
        <span class="result">{user.name}</span>
      </div>
      <p class="note">Reading from the source always works.</p>

      <div class="value">
        <span class="label">$derived(user.name)</span>
        <span class="result">{userNameDerived}</span>
      </div>
      <p class="note">$derived re-reads and re-reacts.</p>

      <div class="value">
        <span class="label">$derived(count)</span>
        <span class="result">{countDerived}</span>
      </div>
      <p class="note">Works for primitives too.</p>

      <div class="value">
        <span class="label">countBox.value</span>
        <span class="result">{countBox.value}</span>
      </div>
      <p class="note">Object property reads are always reactive.</p>
    </div>
  </div>
</section>

<section>
  <h2>The Getter Pattern</h2>
  <p class="note">
    When you need to pass a reactive value to another function, pass a function, not the value.
    Functions re-read every time they're called.
  </p>
  <pre class="code">{\`// Wrong — passes the value at call time
formatName(user.name);

// Right — passes a function that reads it fresh
formatName(() => user.name);\`}</pre>

  <div class="demo">
    <div>Current output: <strong>{formatName(getName)}</strong></div>
    <div>With count: <strong>{formatName(() => String(count))}</strong></div>
  </div>
</section>

<section>
  <h2>Live Inspector</h2>
  <table>
    <thead>
      <tr><th>Expression</th><th>Value</th><th>Reactive?</th></tr>
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
        <td><code>const &#123; name &#125; = user</code></td>
        <td>{name_broken}</td>
        <td class="no">No — frozen at init</td>
      </tr>
      <tr>
        <td><code>let countCopy = count</code></td>
        <td>{countCopy}</td>
        <td class="no">No — primitive snapshot</td>
      </tr>
      <tr>
        <td><code>count ($state)</code></td>
        <td>{count}</td>
        <td class="yes">Yes</td>
      </tr>
      <tr>
        <td><code>$derived(count)</code></td>
        <td>{countDerived}</td>
        <td class="yes">Yes</td>
      </tr>
      <tr>
        <td><code>getName()</code></td>
        <td>{getName()}</td>
        <td class="yes">Yes — re-reads on call</td>
      </tr>
      <tr>
        <td><code>countBox.value</code></td>
        <td>{countBox.value}</td>
        <td class="yes">Yes — object access</td>
      </tr>
    </tbody>
  </table>
</section>

<div class="rules">
  <h3>Rules of thumb</h3>
  <ul>
    <li><strong>Don't destructure</strong> reactive state at the top level of your script.</li>
    <li><strong>Don't copy primitives</strong> out of reactive state — they freeze.</li>
    <li><strong>Do</strong> read properties directly where you render them.</li>
    <li><strong>Do</strong> pass getter functions when crossing component or module boundaries.</li>
    <li><strong>Do</strong> wrap primitives in <code>$state({'{ value: 0 }'})</code> to get reference semantics.</li>
    <li><strong>Do</strong> use <code>$derived</code> to re-establish reactivity around anything.</li>
  </ul>
</div>

<style>
  h1 { color: #333; }
  .lead { color: #555; max-width: 720px; }
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
  button:hover { background: #4338ca; }

  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 10px; }
  section h2 { margin-top: 0; }

  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  .panel { padding: 1rem; border-radius: 8px; border: 2px solid; background: white; }
  .broken { border-color: #ef4444; background: #fef2f2; }
  .working { border-color: #22c55e; background: #f0fdf4; }
  .panel h3 { margin: 0 0 0.5rem; font-size: 1rem; }
  .value {
    display: flex;
    gap: 0.5rem;
    margin: 0.4rem 0 0;
    align-items: baseline;
    flex-wrap: wrap;
  }
  .label { font-size: 0.8rem; color: #555; font-family: monospace; }
  .result { font-weight: bold; font-size: 1.05rem; color: #1f2937; }
  .note { font-size: 0.75rem; color: #888; margin: 0 0 0.5rem; font-style: italic; }

  .code {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre;
    margin: 0.5rem 0;
  }
  .demo {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 0.75rem;
  }
  .demo div { margin: 0.25rem 0; }

  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #eee; font-size: 0.85rem; }
  th { background: #f5f5f5; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  .yes { color: #16a34a; font-weight: bold; }
  .no { color: #dc2626; font-weight: bold; }

  .rules {
    background: #eef2ff;
    border-left: 4px solid #4f46e5;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1.5rem 0;
  }
  .rules h3 { margin: 0 0 0.5rem; }
  .rules ul { margin: 0; padding-left: 1.2rem; }
  .rules li { font-size: 0.9rem; margin: 0.25rem 0; }

  @media (max-width: 760px) {
    .comparison { grid-template-columns: 1fr; }
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
