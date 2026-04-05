import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-5',
		title: 'Text, Numbers & Booleans',
		phase: 1,
		module: 0,
		lessonIndex: 5
	},
	description: `Programs exist to shuffle **data** around — read it, transform it, display it, save it. Before you can shuffle anything, you have to know what *kind* of data you are holding. In JavaScript the three most common kinds are called **primitives**: strings (text), numbers, and booleans (true/false). Almost every variable you create in a normal app will be one of these three, or an object/array built out of them.

A **string** is text. "Hello", "Ada", and even "42" (with quotes) are strings. You write them between single quotes, double quotes, or backticks. The backtick version is called a **template literal** and has a superpower: you can embed expressions inside it using \`\${...}\` syntax, so you can build a sentence out of variables without a bunch of \`+\` signs.

A **number** is, well, a number. JavaScript does not distinguish between integers and decimals the way some languages do — \`5\` and \`9.8\` are both just "number". You can do math with them using the usual operators: \`+\`, \`-\`, \`*\`, \`/\`, and \`%\` (remainder).

A **boolean** has exactly two possible values: \`true\` or \`false\`. Booleans are how you answer yes/no questions in code. "Is the user logged in?" "Is the form valid?" "Should we show the menu?" Every one of those is a boolean. Booleans are the fuel of conditional rendering: Svelte's \`{#if}\` block shows or hides content based on whether a boolean is true.

In this lesson you will play with all three types, mix them together using template literals, use the \`typeof\` operator to confirm the type of a value, and use booleans with \`{#if}\` to make content appear and disappear on demand.`,
	objectives: [
		'Create variables of string, number, and boolean type',
		'Use typeof to check what type a value is',
		'Build strings with template literals and ${...} interpolation',
		'Perform arithmetic with numeric operators (+ - * / %)',
		'Flip a boolean with the ! operator and use it in {#if} blocks',
		'Combine all three primitives into a single interactive example'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import { describeType } from './utils.js';

  // ======================================================
  // STRINGS — text data
  // ======================================================
  // Three ways to write a string. They all work, but
  // backticks are the most powerful because they support
  // \${...} placeholders.
  let firstName = $state('Ada');
  let lastName = $state('Lovelace');
  let favoriteEmoji = $state('🚀');

  // ======================================================
  // NUMBERS — numeric data
  // ======================================================
  let age = $state(28);
  let height = $state(1.68);   // decimals are fine
  let lessonsDone = $state(4);
  let lessonsTotal = $state(50);

  // ======================================================
  // BOOLEANS — true / false
  // ======================================================
  let isStudent = $state(true);
  let isPremium = $state(false);
  let darkMode = $state(false);

  // ======================================================
  // STRING FUN — template literals
  // ======================================================
  // A template literal uses backticks and \${}.
  // Everything inside \${} is real JavaScript.
  function fullGreeting() {
    return \`Hi, I'm \${firstName} \${lastName} \${favoriteEmoji}\`;
  }

  // ======================================================
  // NUMBER FUN — arithmetic
  // ======================================================
  function progressPercent() {
    // Basic math. We also use Math.round to drop decimals.
    return Math.round((lessonsDone / lessonsTotal) * 100);
  }

  // ======================================================
  // BOOLEAN FUN — flipping and combining
  // ======================================================
  function toggleDarkMode() {
    // ! means "not". It flips true to false and false to true.
    darkMode = !darkMode;
  }

  function togglePremium() {
    isPremium = !isPremium;
  }

  // Two booleans can be combined with && (and) / || (or).
  // We use that combination directly inside the markup below
  // to show one message if EITHER condition is true.

  // ======================================================
  // Buttons that modify numbers
  // ======================================================
  function completeLesson() {
    if (lessonsDone < lessonsTotal) lessonsDone = lessonsDone + 1;
  }
  function undoLesson() {
    if (lessonsDone > 0) lessonsDone = lessonsDone - 1;
  }
</script>

<!-- Toggle a CSS class on the root based on darkMode -->
<div class="page" class:dark={darkMode}>
  <h1>Text, Numbers & Booleans</h1>

  <!-- ===== Strings ===== -->
  <section class="card">
    <h2>Strings (text)</h2>
    <p><strong>firstName:</strong> {firstName} — <code>{typeof firstName}</code></p>
    <p><strong>lastName:</strong> {lastName}</p>
    <p><strong>favoriteEmoji:</strong> {favoriteEmoji}</p>
    <!-- Using a function that returns a string -->
    <p class="headline">{fullGreeting()}</p>
    <!-- Using describeType() imported from utils.js -->
    <p class="note">{describeType(firstName)}</p>
  </section>

  <!-- ===== Numbers ===== -->
  <section class="card">
    <h2>Numbers</h2>
    <p><strong>age:</strong> {age} — <code>{typeof age}</code></p>
    <p><strong>height:</strong> {height} m</p>
    <p><strong>age + 1:</strong> {age + 1}</p>
    <p><strong>age * 2:</strong> {age * 2}</p>
    <p><strong>age % 10:</strong> {age % 10} (remainder when dividing by 10)</p>

    <p class="progress-label">
      Progress: {lessonsDone} / {lessonsTotal} ({progressPercent()}%)
    </p>
    <div class="bar">
      <div class="bar-fill" style="width: {progressPercent()}%"></div>
    </div>
    <div class="buttons">
      <button onclick={undoLesson}>− lesson</button>
      <button onclick={completeLesson}>+ lesson</button>
    </div>
    <p class="note">{describeType(age)}</p>
  </section>

  <!-- ===== Booleans ===== -->
  <section class="card">
    <h2>Booleans</h2>
    <p><strong>isStudent:</strong> {isStudent} — <code>{typeof isStudent}</code></p>
    <p><strong>isPremium:</strong> {isPremium}</p>
    <p><strong>darkMode:</strong> {darkMode}</p>

    <div class="buttons">
      <button onclick={togglePremium}>Toggle premium</button>
      <button onclick={toggleDarkMode}>Toggle dark mode</button>
    </div>

    <!-- Booleans power conditional rendering -->
    {#if isPremium}
      <p class="yes">Premium features unlocked!</p>
    {:else}
      <p class="no">Free tier — upgrade for extras.</p>
    {/if}

    {#if isStudent || isPremium}
      <p class="yes">You can access the course.</p>
    {:else}
      <p class="no">Access denied.</p>
    {/if}
    <p class="note">{describeType(isPremium)}</p>
  </section>

  <!-- ===== Bringing them together ===== -->
  <section class="card">
    <h2>All three together</h2>
    <!--
      A template literal can mix strings, numbers, and booleans.
      Numbers are auto-converted to strings when used in text.
    -->
    <pre>{\`\${firstName} is \${age} years old and has finished \${progressPercent()}% of the course. Premium: \${isPremium}.\`}</pre>
  </section>
</div>

<style>
  .page {
    padding: 16px;
    border-radius: 10px;
    font-family: sans-serif;
    background: #ffffff;
    color: #222;
    transition: background 0.2s, color 0.2s;
  }
  .page.dark {
    background: #1e1e1e;
    color: #eee;
  }
  h1 { color: #ff3e00; margin-top: 0; }
  h2 { font-size: 16px; margin: 0 0 8px; }
  .card {
    background: #fafafa;
    border: 2px solid #e5e5e5;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
  }
  .page.dark .card {
    background: #2a2a2a;
    border-color: #444;
  }
  p { font-size: 14px; margin: 4px 0; }
  code {
    background: #eee;
    color: #c7254e;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  }
  .page.dark code { background: #333; color: #ffa; }
  .headline {
    font-size: 18px;
    font-weight: 600;
    color: #ff3e00;
    margin-top: 8px;
  }
  .progress-label { font-weight: 600; }
  .bar {
    width: 100%;
    height: 14px;
    background: #eee;
    border-radius: 7px;
    overflow: hidden;
    margin: 6px 0;
  }
  .bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff3e00, #ffa05e);
    transition: width 0.2s;
  }
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
  .no { color: #c94141; font-style: italic; }
  .note {
    margin-top: 8px;
    padding: 6px 10px;
    background: #f2fbff;
    border-left: 3px solid #569cd6;
    font-size: 12px;
    color: #333;
  }
  .page.dark .note { background: #1a2a3a; color: #cde; }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 12px;
    border-radius: 6px;
    font-size: 13px;
    white-space: pre-wrap;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'utils.js',
			content: `// Helper to describe the type of a value in a friendly sentence.
// Imported by App.svelte with:
//     import { describeType } from './utils.js';

export function describeType(value) {
  if (typeof value === 'string') {
    return \`"\${value}" is a string with \${value.length} characters\`;
  }
  if (typeof value === 'number') {
    const kind = Number.isInteger(value) ? 'integer' : 'decimal';
    return \`\${value} is a \${kind} number\`;
  }
  if (typeof value === 'boolean') {
    return \`\${value} is a boolean\`;
  }
  return \`\${value} is of type \${typeof value}\`;
}
`,
			language: 'javascript'
		}
	]
};

export default lesson;
