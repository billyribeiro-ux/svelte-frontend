import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-6',
		title: 'The Void: null, undefined & Falsy',
		phase: 1,
		module: 0,
		lessonIndex: 6
	},
	description: `Not every value is something. Sometimes a value is intentionally empty, sometimes it was never set, and sometimes it exists but counts as "false-ish" when you check it. Handling these "void-ish" cases is one of the most important (and most forgotten) skills in JavaScript. Miss them and your app crashes with the classic error: "Cannot read properties of undefined."

JavaScript has two different flavors of emptiness: **\`undefined\`** and **\`null\`**. The distinction is small but worth learning. \`undefined\` means "nothing was ever assigned here" — it is the default value for a variable you declared but did not set. \`null\`, on the other hand, is a value you choose on purpose to mean "nothing." Think of \`undefined\` as an unopened birthday present and \`null\` as an empty box you deliberately gift-wrapped.

Beyond those two, there is a broader idea called **falsy**. A falsy value is any value that JavaScript treats as \`false\` when forced into a boolean context (like inside an \`if\` statement). The falsy values are: \`false\`, \`0\`, \`''\` (empty string), \`null\`, \`undefined\`, and \`NaN\`. Everything else is **truthy**. This is why \`if (name)\` is a common shortcut for "if name is set and not empty."

Modern JavaScript gives us two beautiful operators for dealing with these cases. **Optional chaining (\`?.\`)** lets you reach deep into a possibly-missing object without crashing — if any link in the chain is nullish, the whole thing safely returns \`undefined\`. **Nullish coalescing (\`??\`)** provides a fallback value, but *only* when the left side is \`null\` or \`undefined\` (unlike \`||\` which also triggers on \`0\` or \`''\`).

In this lesson you will poke at each of these concepts with hands-on examples: compare \`null\` and \`undefined\`, see every falsy value side by side, safely navigate nested objects that may or may not have data, and use fallback text when a value is missing.`,
	objectives: [
		'Explain the difference between null and undefined',
		'List the six falsy values and identify them in code',
		'Use optional chaining (?.) to safely read nested properties',
		'Use nullish coalescing (??) to provide fallback values',
		'Know when ?? is safer than the older || operator',
		'Render "missing" fallback UI using {#if} when data is null or undefined'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ======================================================
  // SECTION 1 — undefined vs null
  // ======================================================
  // A variable declared but never assigned is "undefined".
  // Here we assign it explicitly so the example is clear.
  let neverSet = undefined;

  // "null" is a value you choose on purpose to mean "empty".
  let clearedOnPurpose = null;

  // typeof quirk: typeof null is 'object' (a famous old bug
  // in JavaScript). typeof undefined is 'undefined'.
  const typeOfNever = typeof neverSet;   // 'undefined'
  const typeOfCleared = typeof clearedOnPurpose; // 'object' (!)

  // ======================================================
  // SECTION 2 — the six falsy values
  // ======================================================
  // These are ALL the values that count as "false" in an if().
  // Learning them by heart saves hours of debugging.
  const falsyValues = [
    { label: 'false', value: false },
    { label: '0', value: 0 },
    { label: "'' (empty string)", value: '' },
    { label: 'null', value: null },
    { label: 'undefined', value: undefined },
    { label: 'NaN', value: NaN }
  ];

  // Anything NOT in that list is truthy — including surprising
  // things like the string 'false', the number -1, and [] / {}.
  const truthyExamples = [
    { label: "'false' (a string)", value: 'false' },
    { label: '-1', value: -1 },
    { label: '[] (empty array)', value: [] },
    { label: '{} (empty object)', value: {} }
  ];

  // ======================================================
  // SECTION 3 — optional chaining ?.
  // ======================================================
  // We have a user whose profile MIGHT be missing.
  // Click the buttons below to swap the user and see
  // what happens without any crashes.
  let user = $state({
    name: 'Ada',
    profile: {
      bio: 'Loves algorithms',
      social: { url: 'https://example.com/ada' }
    }
  });

  function setAda() {
    user = {
      name: 'Ada',
      profile: {
        bio: 'Loves algorithms',
        social: { url: 'https://example.com/ada' }
      }
    };
  }

  function setGrace() {
    // Grace has a profile but no social link.
    user = {
      name: 'Grace',
      profile: { bio: 'Debugger pioneer', social: null }
    };
  }

  function setMystery() {
    // Mystery user: no profile object at all.
    user = { name: 'Mystery', profile: null };
  }

  // ======================================================
  // SECTION 4 — nullish coalescing ??
  // ======================================================
  // ?? gives a fallback ONLY when the left side is null/undefined.
  // || also triggers on 0 and ''. Usually ?? is what you want.
  let count = $state(0);
  let username = $state('');

  function plusOne() { count = count + 1; }
  function reset() { count = 0; }
  function toggleName() {
    username = username === '' ? 'Ada' : '';
  }
</script>

<h1>The Void: null, undefined & Falsy</h1>

<!-- ===== 1: undefined vs null ===== -->
<section class="card">
  <h2>1. undefined vs null</h2>
  <p><strong>neverSet</strong> = <code>{String(neverSet)}</code> — typeof is <code>{typeOfNever}</code></p>
  <p><strong>clearedOnPurpose</strong> = <code>{String(clearedOnPurpose)}</code> — typeof is <code>{typeOfCleared}</code></p>
  <p>
    Equal with <code>==</code>? <strong>{String(neverSet == clearedOnPurpose)}</strong>
    &nbsp;|&nbsp;
    Equal with <code>===</code>? <strong>{String(neverSet === clearedOnPurpose)}</strong>
  </p>
  <p class="note">
    Lesson: <code>==</code> treats null and undefined as equal, but
    <code>===</code> (strict equality) does not. Prefer <code>===</code>.
  </p>
</section>

<!-- ===== 2: falsy values table ===== -->
<section class="card">
  <h2>2. The six falsy values</h2>
  <table>
    <thead><tr><th>Value</th><th>In an if()</th></tr></thead>
    <tbody>
      {#each falsyValues as row, i (i)}
        <tr>
          <td><code>{row.label}</code></td>
          <td>
            {#if row.value}
              <span class="yes">truthy</span>
            {:else}
              <span class="no">falsy</span>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <h3>...and some surprising truthy values:</h3>
  <table>
    <tbody>
      {#each truthyExamples as row, i (i)}
        <tr>
          <td><code>{row.label}</code></td>
          <td>
            {#if row.value}
              <span class="yes">truthy</span>
            {:else}
              <span class="no">falsy</span>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<!-- ===== 3: optional chaining ===== -->
<section class="card">
  <h2>3. Optional chaining (?.)</h2>
  <div class="buttons">
    <button onclick={setAda}>Ada (full data)</button>
    <button onclick={setGrace}>Grace (no social)</button>
    <button onclick={setMystery}>Mystery (no profile)</button>
  </div>

  <p><strong>Name:</strong> {user.name}</p>

  <!--
    Without ?. the next line would crash when profile is null:
      {user.profile.bio}   -> TypeError!
    With ?. it safely returns undefined, and ?? gives a fallback.
  -->
  <p>
    <strong>Bio:</strong>
    {user?.profile?.bio ?? '(no bio provided)'}
  </p>
  <p>
    <strong>Social:</strong>
    {user?.profile?.social?.url ?? '(no social link)'}
  </p>

  <!-- Conditional rendering based on whether data exists -->
  {#if user?.profile}
    <p class="yes">Profile is available.</p>
  {:else}
    <p class="no">No profile on file.</p>
  {/if}
</section>

<!-- ===== 4: ?? vs || ===== -->
<section class="card">
  <h2>4. ?? vs ||</h2>
  <p>count = <strong>{count}</strong></p>
  <div class="buttons">
    <button onclick={plusOne}>+1</button>
    <button onclick={reset}>set to 0</button>
  </div>
  <!--
    When count is 0:
      count || 'fallback'  ->  'fallback'  (because 0 is falsy)
      count ?? 'fallback'  ->  0           (because 0 is NOT null/undefined)
    This is why ?? is usually safer for numbers.
  -->
  <p>count || 'fallback' &nbsp;=&nbsp; <strong>{count || 'fallback'}</strong></p>
  <p>count ?? 'fallback' &nbsp;=&nbsp; <strong>{count ?? 'fallback'}</strong></p>

  <hr />

  <p>username = "<strong>{username}</strong>"</p>
  <button onclick={toggleName}>Toggle empty / "Ada"</button>
  <p>username || 'Guest' &nbsp;=&nbsp; <strong>{username || 'Guest'}</strong></p>
  <p>username ?? 'Guest' &nbsp;=&nbsp; <strong>{username ?? 'Guest'}</strong></p>
  <p class="note">
    Notice: for an empty string, <code>||</code> falls back to "Guest"
    but <code>??</code> keeps the empty string, because '' is not null/undefined.
  </p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin: 0 0 8px; }
  h3 { font-size: 14px; color: #555; margin: 12px 0 4px; }
  .card {
    background: #fafafa;
    border: 2px solid #e5e5e5;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    font-family: sans-serif;
  }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  code {
    background: #eee;
    color: #c7254e;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin: 6px 0;
  }
  th, td {
    text-align: left;
    padding: 6px 8px;
    border-bottom: 1px solid #eee;
  }
  th { background: #f3f3f3; }
  .buttons { display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap; }
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
  button:hover { background: #ff3e00; color: white; }
  .yes { color: #2a9d4a; font-weight: 600; }
  .no { color: #c94141; font-weight: 600; }
  .note {
    margin-top: 8px;
    padding: 6px 10px;
    background: #f2fbff;
    border-left: 3px solid #569cd6;
    font-size: 12px;
    color: #333;
  }
  hr { border: none; border-top: 1px dashed #ddd; margin: 12px 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
