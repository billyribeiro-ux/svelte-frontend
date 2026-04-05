import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-7',
		title: 'let vs const',
		phase: 1,
		module: 0,
		lessonIndex: 7
	},
	description: `In modern JavaScript there are two keywords for creating variables: **\`let\`** and **\`const\`**. (There is also an older one called \`var\` — never use it. It has weird scoping rules that cause bugs.) The difference between \`let\` and \`const\` is simple on the surface: a \`let\` variable can be reassigned later, a \`const\` variable cannot. But there are two twists worth understanding.

**Twist 1: reassignment is not the same as mutation.** A \`const\` stops you from pointing the name at a *different* object, but if the value is an object or array, you can still change the stuff *inside* it. \`const list = [1, 2]; list.push(3);\` is totally fine. \`list = [4, 5];\` is an error. Think of \`const\` as nailing a sign to a house: you cannot move the sign to a new house, but you can still repaint the rooms inside.

**Twist 2: Svelte 5 \`$state\` uses \`let\`.** Reactive state changes over time, so its binding needs to be reassignable. The pattern you will see in every Svelte 5 file is \`let something = $state(initialValue)\`. Everything else — constants, configuration, fixed labels, computed values — should use \`const\`. A good rule of thumb: **start every variable as \`const\`. Only switch it to \`let\` if you actually need to reassign it.** This makes your code easier to read because \`let\` becomes a signal that says "hey, this value changes."

Choosing \`const\` by default has a surprising benefit: it prevents a whole class of bugs where you accidentally overwrite a value you did not mean to. The compiler literally catches the mistake for you.

In this lesson you will see \`const\` used for fixed values, \`let\` + \`$state\` used for reactive values, and the crucial difference between reassignment (forbidden for \`const\`) and mutation (allowed). You will also play with a tiny app that exercises all of these ideas together.`,
	objectives: [
		'Declare variables with let and const and know when to use each',
		'Understand that $state reactive variables must be declared with let',
		'Distinguish reassignment (rebinding the name) from mutation (changing contents)',
		'Know why using const by default makes code safer',
		'Recognize that var exists but should never be used in new code',
		'Predict whether a given assignment will error at runtime'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ======================================================
  // SECTION 1 — const: fixed values
  // ======================================================
  // These never change for the lifetime of the component,
  // so const is the right choice. Convention: ALL_CAPS for
  // "true constants" like limits or configuration.
  const APP_TITLE = 'Let vs Const Playground';
  const MAX_COUNT = 10;
  const MIN_COUNT = 0;
  const PALETTE = ['#ff3e00', '#4ec9b0', '#569cd6', '#c586c0', '#d7ba7d'];

  // ======================================================
  // SECTION 2 — let + $state: reactive values
  // ======================================================
  // These change over time, so they MUST be declared with let.
  // If you wrote "const count = $state(0)" then tried count++,
  // JavaScript would throw a TypeError.
  let count = $state(0);
  let colorIndex = $state(0);
  let note = $state('Try the buttons below.');

  // ======================================================
  // SECTION 3 — functions that reassign state
  // ======================================================
  function increment() {
    if (count >= MAX_COUNT) {
      note = \`Already at the max of \${MAX_COUNT}.\`;
      return;
    }
    count = count + 1; // reassigning a let variable — OK
    note = \`count is now \${count}\`;
  }

  function decrement() {
    if (count <= MIN_COUNT) {
      note = \`Already at the min of \${MIN_COUNT}.\`;
      return;
    }
    count = count - 1;
    note = \`count is now \${count}\`;
  }

  function cycleColor() {
    // The % operator wraps around when we reach the end.
    colorIndex = (colorIndex + 1) % PALETTE.length;
  }

  function resetAll() {
    count = 0;
    colorIndex = 0;
    note = 'Everything reset.';
  }

  // ======================================================
  // SECTION 4 — mutation vs reassignment
  // ======================================================
  // "tags" is declared with const, so we cannot REASSIGN it:
  //     tags = ['new'];  // TypeError: Assignment to constant variable
  // BUT we can still MUTATE its contents:
  //     tags.push('new');  // totally fine
  //
  // Since we want Svelte to react when the array changes,
  // we wrap it in $state() and use a let binding here.
  let tags = $state(['svelte', 'javascript']);

  function addTag() {
    // To keep things reactive and immutable-feeling, we
    // create a NEW array with the extra item. Svelte 5
    // also supports direct mutation of $state arrays,
    // but reassignment is a clearer pattern for beginners.
    tags = [...tags, \`tag\${tags.length + 1}\`];
  }

  function removeLastTag() {
    if (tags.length === 0) return;
    tags = tags.slice(0, -1);
  }
</script>

<h1 style="color: {PALETTE[colorIndex]}">{APP_TITLE}</h1>

<!-- ===== 1: const constants ===== -->
<section class="card">
  <h2>1. Fixed values (const)</h2>
  <p><code>APP_TITLE</code> = "{APP_TITLE}"</p>
  <p><code>MIN_COUNT</code> = {MIN_COUNT}, <code>MAX_COUNT</code> = {MAX_COUNT}</p>
  <p><code>PALETTE</code> has {PALETTE.length} colors (never changes)</p>
  <p class="note">
    These all use <code>const</code> because their values are fixed for
    the lifetime of the component. Using <code>let</code> here would work
    but would signal "this will change" — which would be misleading.
  </p>
</section>

<!-- ===== 2: let + $state ===== -->
<section class="card">
  <h2>2. Reactive values (let + $state)</h2>
  <p class="big" style="color: {PALETTE[colorIndex]}">{count}</p>
  <p>{note}</p>
  <div class="buttons">
    <button onclick={decrement} disabled={count <= MIN_COUNT}>−</button>
    <button onclick={increment} disabled={count >= MAX_COUNT}>+</button>
    <button onclick={cycleColor}>Cycle color</button>
    <button class="secondary" onclick={resetAll}>Reset</button>
  </div>
</section>

<!-- ===== 3: mutation vs reassignment ===== -->
<section class="card">
  <h2>3. Mutation vs reassignment</h2>
  <p>Current tags: <strong>[{tags.join(', ')}]</strong></p>
  <div class="buttons">
    <button onclick={addTag}>Add a tag</button>
    <button class="secondary" onclick={removeLastTag}>Remove last</button>
  </div>
  <p class="note">
    <code>tags</code> is a reactive array. We rebuild it with new contents
    each time so Svelte clearly sees the change. Rebinding the variable
    name is OK because it is declared with <code>let</code>.
  </p>
</section>

<!-- ===== 4: the rule of thumb ===== -->
<section class="card rules">
  <h2>4. The rule of thumb</h2>
  <ul>
    <li>
      <strong>Start with <code>const</code>.</strong>
      Only switch to <code>let</code> if you <em>need</em> to reassign.
    </li>
    <li>
      <strong><code>let</code> + <code>$state(...)</code></strong> for any
      reactive value that will change.
    </li>
    <li>
      <strong>Never use <code>var</code>.</strong>
      It has confusing scoping rules and has been obsolete for a decade.
    </li>
    <li>
      <strong>const does not mean "frozen".</strong>
      You can still mutate the contents of objects and arrays.
    </li>
  </ul>
</section>

<style>
  h1 { font-family: sans-serif; margin-bottom: 16px; transition: color 0.2s; }
  h2 { font-size: 16px; color: #333; margin: 0 0 8px; }
  .card {
    background: #fafafa;
    border: 2px solid #e5e5e5;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    font-family: sans-serif;
  }
  .rules { background: #fff9ec; border-color: #ffe2a8; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .big {
    font-size: 48px;
    font-weight: 700;
    margin: 8px 0;
    text-align: center;
  }
  code {
    background: #eee;
    color: #c7254e;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  }
  ul { color: #444; font-size: 14px; padding-left: 20px; }
  li { margin: 6px 0; }
  .buttons { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin: 8px 0; }
  button {
    padding: 6px 14px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-family: sans-serif;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  button.secondary {
    border-color: #888;
    color: #888;
  }
  button.secondary:hover:not(:disabled) { background: #888; color: white; }
  .note {
    margin-top: 8px;
    padding: 6px 10px;
    background: #f2fbff;
    border-left: 3px solid #569cd6;
    font-size: 12px;
    color: #333;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
