import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-3',
		title: 'Seeing Your Data & Leaving Notes',
		phase: 1,
		module: 0,
		lessonIndex: 3
	},
	description: `Every professional developer — even the ones with twenty years of experience — spends a big chunk of the day asking one simple question: **"what is actually in this variable right now?"** The tool they reach for 99% of the time is \`console.log\`. It prints whatever you give it into the browser's developer console, where you can read it, expand it, and inspect it.

Alongside logging, the other essential habit is **leaving notes in your code**. Code is read far more often than it is written — by teammates, by code reviewers, and most of all by future-you who will open this file in three months with absolutely no memory of why you wrote it this way. Comments are how we leave those notes.

A \`.svelte\` file actually supports **four different kinds of comments** depending on where you are writing. Inside \`<script>\` you use JavaScript comments (\`//\` or \`/* */\`). Inside markup you use HTML comments (\`<!-- -->\`). Inside \`<style>\` you use CSS comments (\`/* */\`). Good news: you do not have to memorize them — your editor will usually insert the right one when you press Ctrl/Cmd + /.

In this lesson you will practice both skills. You will log primitives, arrays, nested objects, mixed types, and computed expressions. You will meet a handful of handy console methods beyond \`log\` (\`info\`, \`warn\`, \`error\`, \`table\`, \`group\`). And you will see a side-by-side comparison of the four comment styles in a single component.

**Important habit**: keep the browser devtools open while you work. Right-click the preview → Inspect → Console tab. Every \`console.log\` you write will show up there the moment the component runs.`,
	objectives: [
		'Use console.log to inspect values of any type at runtime',
		'Log primitives, arrays, nested objects, mixed types, and computed expressions',
		'Recognize the difference between console.log, info, warn, error, table, and group',
		'Write JavaScript, HTML, and CSS comments correctly in a .svelte file',
		'Toggle a live comparison of all four comment styles',
		'Use JSON.stringify to display object contents directly in the markup'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ======================================================
  // SECTION 1 — Primitives (the simplest values)
  // ======================================================
  let name = 'Ada Lovelace';
  let age = 28;
  let isStudent = true;

  console.log(name);                      // bare value
  console.log('name is:', name);          // labelled — much easier to read
  console.log('age is:', age);
  console.log('isStudent is:', isStudent);
  console.log('typeof age:', typeof age); // typeof tells you the value kind

  // ======================================================
  // SECTION 2 — Arrays (ordered lists)
  // ======================================================
  // You can log a whole array at once. The console lets you
  // expand it and click individual items.
  let hobbies = ['math', 'poetry', 'steam engines'];
  console.log('hobbies:', hobbies);
  console.log('first hobby:', hobbies[0]);
  console.log('hobby count:', hobbies.length);

  // ======================================================
  // SECTION 3 — Nested objects (grouped data)
  // ======================================================
  // Objects can contain other objects and arrays.
  // Logging the root gives you an expandable tree.
  let student = {
    name: 'Ada',
    lesson: 3,
    active: true,
    hobbies,                     // shorthand for hobbies: hobbies
    address: {
      city: 'London',
      country: 'UK',
      coords: { lat: 51.50, lng: -0.12 }
    }
  };
  console.log('Whole student object:', student);
  console.log('Just the address:', student.address);
  console.log('Deep value:', student.address.coords.lat);

  // ======================================================
  // SECTION 4 — Mixed types & computed expressions
  // ======================================================
  // You can pass as many arguments as you want to console.log
  // and they will all print on the same line, separated by spaces.
  // Expressions are evaluated first, so you can inspect the
  // RESULT of a calculation right where you make it.
  console.log('mix:', 1, 'two', true, [3, 4], { five: 5 });
  console.log('age in 10 years =', age + 10);
  console.log('hobby list =', hobbies.join(', '));
  console.log('uppercased name =', name.toUpperCase());
  console.log('has "math"?', hobbies.includes('math'));

  // ======================================================
  // SECTION 5 — Console methods beyond log
  // ======================================================
  console.info('ℹ️  info — informational message');
  console.warn('⚠️  warn — something to watch out for');
  console.error('❌ error — something is wrong');

  // console.table prints an array of objects as a neat grid.
  console.table([
    { id: 1, name: 'Ada',  score: 95 },
    { id: 2, name: 'Bob',  score: 82 },
    { id: 3, name: 'Cleo', score: 78 }
  ]);

  // console.group lets you nest related logs — collapsible!
  console.group('Student details');
    console.log('name:', student.name);
    console.log('lesson:', student.lesson);
    console.group('Address');
      console.log('city:', student.address.city);
      console.log('country:', student.address.country);
    console.groupEnd();
  console.groupEnd();

  // ======================================================
  // SECTION 6 — Interactive click counter with logging
  // ======================================================
  let clickCount = $state(0);
  function handleClick() {
    clickCount = clickCount + 1;
    console.log('Button clicked! New count =', clickCount);
  }

  // ======================================================
  // SECTION 7 — Comment-style toggle
  // ======================================================
  // We will show a simple on/off toggle so you can compare
  // how comments look in JS, HTML, and CSS side by side.
  let showComments = $state(true);
  function toggleComments() {
    showComments = !showComments;
  }
</script>

<!-- This is an HTML comment. It will NOT render to the page. -->
<!-- Use HTML comments to label sections of your markup.      -->

<h1>Hello, {name}!</h1>
<p class="sub">Open the browser devtools console (F12) to see every log.</p>

<!-- ===== Simple values ===== -->
<section class="card">
  <h2>Simple values</h2>
  <p><strong>Name:</strong> {name}</p>
  <p><strong>Age:</strong> {age}</p>
  <p><strong>Student?</strong> {isStudent}</p>
  <p><strong>Hobbies:</strong> {hobbies.join(', ')}</p>
</section>

<!-- ===== Peek inside an object ===== -->
<section class="card">
  <h2>Peeking inside an object</h2>
  <p>
    <code>JSON.stringify(obj, null, 2)</code> turns an object into
    a pretty-printed string so you can see it ON the page, not
    just in the console:
  </p>
  <pre>{JSON.stringify(student, null, 2)}</pre>
</section>

<!-- ===== Console cheatsheet ===== -->
<section class="card">
  <h2>Console cheatsheet</h2>
  <p class="muted">Handy console methods you will actually use:</p>
  <table class="cheat">
    <thead>
      <tr><th>Method</th><th>When to use it</th></tr>
    </thead>
    <tbody>
      <tr><td><code>console.log</code></td>   <td>Your default. Print any value(s).</td></tr>
      <tr><td><code>console.info</code></td>  <td>Same as log, but marked as informational.</td></tr>
      <tr><td><code>console.warn</code></td>  <td>Yellow, draws attention to potential issues.</td></tr>
      <tr><td><code>console.error</code></td> <td>Red + stack trace, for real problems.</td></tr>
      <tr><td><code>console.table</code></td> <td>Array of objects as a sortable grid.</td></tr>
      <tr><td><code>console.group</code></td> <td>Nest related logs under a collapsible header.</td></tr>
    </tbody>
  </table>
</section>

<!-- ===== Comment styles side by side ===== -->
<section class="card">
  <h2>Comment styles — all four in one file</h2>
  <p class="muted">
    A .svelte file actually speaks three languages: JavaScript in
    <code>&lt;script&gt;</code>, HTML in the middle, and CSS in
    <code>&lt;style&gt;</code>. Each has its own comment syntax.
  </p>
  <button class="toggle" onclick={toggleComments}>
    {showComments ? 'Hide' : 'Show'} comment examples
  </button>

  {#if showComments}
    <div class="grid-2">
      <pre class="snippet js">{\`// JS single-line comment
let x = 1;

/* JS
   block
   comment */
let y = 2;\`}</pre>

      <pre class="snippet html">{\`<!-- HTML comment -->
<h1>Title</h1>

<!-- Spans
     many
     lines -->
<p>Body</p>\`}</pre>

      <pre class="snippet css">{\`/* CSS single-line-ish */
h1 { color: red; }

/* CSS also
   supports
   multi-line */
p { color: gray; }\`}</pre>

      <pre class="snippet tip">{\`💡 Tip
Ctrl / Cmd + / usually
inserts the right kind
of comment for the spot
your cursor is in.\`}</pre>
    </div>
  {/if}
</section>

<!-- ===== Interactive logging ===== -->
<section class="card">
  <h2>Interactive logging</h2>
  <p>Click count: <strong>{clickCount}</strong></p>
  <button onclick={handleClick}>Click me (and watch the console)</button>
  <p class="muted">Every click logs a line with the new count.</p>
</section>

<style>
  /* CSS comments look like this — same as JS block comments. */
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
  }
  .sub {
    color: #888;
    font-family: sans-serif;
    font-style: italic;
    margin-top: -4px;
  }
  .card {
    background: #fff7f2;
    border: 2px solid #ffd6c2;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    font-family: sans-serif;
  }
  h2 {
    color: #333;
    font-size: 16px;
    margin: 0 0 8px;
  }
  p {
    color: #444;
    font-size: 14px;
    margin: 4px 0;
  }
  .muted { color: #888; font-size: 13px; font-style: italic; }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 12px;
    border-radius: 6px;
    font-size: 12.5px;
    overflow-x: auto;
    margin: 6px 0;
    font-family: 'Fira Code', monospace;
  }
  code {
    background: #f0f0f0;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 12.5px;
  }

  .cheat {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .cheat th, .cheat td {
    text-align: left;
    padding: 6px 8px;
    border-bottom: 1px solid #ffd6c2;
  }
  .cheat th { color: #ff3e00; font-weight: 700; }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-top: 8px;
  }
  .snippet { white-space: pre; font-size: 12px; line-height: 1.45; }
  .snippet.js   { border-left: 4px solid #f7df1e; }
  .snippet.html { border-left: 4px solid #e34c26; }
  .snippet.css  { border-left: 4px solid #264de4; }
  .snippet.tip {
    background: #fff8e1;
    color: #5a4500;
    border-left: 4px solid #f6b93b;
  }

  button.toggle {
    padding: 6px 12px;
    border: 2px solid #569cd6;
    background: white;
    color: #569cd6;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    margin: 6px 0;
  }
  button.toggle:hover { background: #569cd6; color: white; }

  button {
    padding: 8px 16px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-family: sans-serif;
  }
  button:hover {
    background: #ff3e00;
    color: white;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
