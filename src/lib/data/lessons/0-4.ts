import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-4',
		title: 'Functions & Making Things Happen',
		phase: 1,
		module: 0,
		lessonIndex: 4
	},
	description: `A **function** is a named bundle of instructions that you can run over and over again. If \`$state\` is the memory of your app, functions are its muscles — they are how you make things *happen*. Clicking a button, updating a counter, building a greeting message, shuffling a list: every single one of those is "call a function."

The mental model is simple. Imagine a recipe card titled "Make Toast". The card lists steps: get bread, put it in the toaster, press the lever, wait, butter it. You can hand that card to anyone — or run it yourself — any number of times. The function name is the title, the steps inside the curly braces are the instructions, and **calling** the function (by writing its name with parentheses, like \`makeToast()\`) says "do the thing on that card right now."

Functions can also accept **parameters** — little pieces of information you hand in at the moment you call them. \`greet('Alice')\` is different from \`greet('Bob')\` because the parameter \`name\` will be \`'Alice'\` or \`'Bob'\` depending on which call you make. Some functions also **return** a value: they do a little calculation and hand the answer back to whoever called them.

In Svelte, functions really start to shine when you wire them up to events with \`onclick={myFunction}\`. When the user clicks, Svelte runs your function. If that function changes a \`$state\` variable, the UI updates automatically. Combine all three ideas — state, functions, events — and you already know most of what you need to build interactive apps.

In this lesson you will write six different functions with progressively more features: no parameters, one parameter, multiple parameters, a return value, an arrow-function shortcut, and finally a function pulled out of a separate helper file so you can see how code is shared between files.`,
	objectives: [
		'Declare a function using the function keyword',
		'Pass parameters into a function when you call it',
		'Return a value from a function and use it in markup',
		'Recognize the shorter arrow-function syntax () => {}',
		'Wire functions to onclick and call them with or without arguments',
		'Import a helper function from another file to keep code organized'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Import a helper function from another file.
  // "utils.js" lives next to this file and exports "capitalize".
  import { capitalize } from './utils.js';

  // ======================================================
  // Reactive state for the whole component
  // ======================================================
  let message = $state('Click a button to see a function run.');
  let total = $state(0);
  let log = $state([]); // we will push strings into this array

  // ======================================================
  // FUNCTION 1 — no parameters, no return value
  // ======================================================
  // The simplest possible function: just does something.
  function sayHi() {
    message = 'Hi there! You just called sayHi().';
  }

  // ======================================================
  // FUNCTION 2 — one parameter
  // ======================================================
  // "name" is a parameter. It is a local variable that exists
  // only inside this function and gets its value from the caller.
  function greet(name) {
    // Template literals (backticks) let us mix text and variables.
    message = \`Hello, \${name}! Welcome back.\`;
  }

  // ======================================================
  // FUNCTION 3 — multiple parameters
  // ======================================================
  function addToTotal(amount, label) {
    total = total + amount;
    message = \`Added \${amount} (\${label}). Total is now \${total}.\`;
  }

  // ======================================================
  // FUNCTION 4 — returns a value
  // ======================================================
  // This function does NOT change state directly. It takes
  // two numbers and gives back (returns) their sum. The
  // caller decides what to do with the answer.
  function add(a, b) {
    return a + b;
  }

  // We can call "add" right here and store the answer in a variable.
  // This runs once when the component loads.
  let twoPlusThree = add(2, 3);
  console.log('2 + 3 =', twoPlusThree);

  // ======================================================
  // FUNCTION 5 — arrow-function shortcut
  // ======================================================
  // Arrow functions are a shorter way to write small functions.
  // These two are equivalent:
  //     function double(n) { return n * 2; }
  //     const double = (n) => n * 2;
  const double = (n) => n * 2;
  console.log('double(7) =', double(7));

  // ======================================================
  // FUNCTION 6 — uses an imported helper
  // ======================================================
  function logAction(text) {
    // "capitalize" comes from utils.js. We just use it like
    // any other function. This is how real apps stay tidy:
    // small helpers live in their own files.
    const nice = capitalize(text);
    // Build a new array (instead of mutating) so Svelte sees the change.
    log = [...log, nice];
  }

  function clearLog() {
    log = [];
    message = 'Log cleared.';
  }
</script>

<h1>Functions in Action</h1>
<p class="message">{message}</p>

<!-- ===== Section 1: no-param and one-param functions ===== -->
<section class="card">
  <h2>1. Calling functions from buttons</h2>
  <div class="buttons">
    <!-- Passing a function by name: Svelte will call it on click -->
    <button onclick={sayHi}>sayHi()</button>

    <!-- To pass an argument we wrap the call in an arrow function.
         If we wrote onclick={greet('Alice')} it would run INSTANTLY,
         not when clicked. The arrow function delays the call. -->
    <button onclick={() => greet('Alice')}>greet('Alice')</button>
    <button onclick={() => greet('Bob')}>greet('Bob')</button>
    <button onclick={() => greet('Svelte fan')}>greet('Svelte fan')</button>
  </div>
</section>

<!-- ===== Section 2: multiple parameters + running total ===== -->
<section class="card">
  <h2>2. Functions with multiple parameters</h2>
  <p>Running total: <strong class="big">{total}</strong></p>
  <div class="buttons">
    <button onclick={() => addToTotal(1, 'apple')}>+1 apple</button>
    <button onclick={() => addToTotal(5, 'high-five')}>+5 high-five</button>
    <button onclick={() => addToTotal(10, 'bonus')}>+10 bonus</button>
  </div>
</section>

<!-- ===== Section 3: return values ===== -->
<section class="card">
  <h2>3. Functions that return values</h2>
  <!-- We can call a returning function right inside {curly braces}. -->
  <p>add(2, 3) = <strong>{add(2, 3)}</strong></p>
  <p>add(10, 25) = <strong>{add(10, 25)}</strong></p>
  <p>double(7) = <strong>{double(7)}</strong></p>
  <p>double(double(3)) = <strong>{double(double(3))}</strong></p>
</section>

<!-- ===== Section 4: using an imported helper ===== -->
<section class="card">
  <h2>4. Using an imported helper</h2>
  <p>
    The buttons below call <code>logAction</code>, which uses
    <code>capitalize</code> from <code>utils.js</code>.
  </p>
  <div class="buttons">
    <button onclick={() => logAction('hello world')}>Log "hello world"</button>
    <button onclick={() => logAction('svelte is fun')}>Log "svelte is fun"</button>
    <button onclick={() => logAction('functions rule')}>Log "functions rule"</button>
    <button class="secondary" onclick={clearLog}>Clear log</button>
  </div>

  <!-- We will meet #each properly in a later lesson;
       here it just lets us display each log entry. -->
  <ul class="log">
    {#each log as entry, i (i)}
      <li>{entry}</li>
    {/each}
    {#if log.length === 0}
      <li class="empty">(log is empty)</li>
    {/if}
  </ul>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 8px; }
  .message {
    font-family: sans-serif;
    color: #333;
    background: #fff7f2;
    border-left: 4px solid #ff3e00;
    padding: 8px 12px;
    margin: 8px 0 16px;
  }
  .card {
    background: #fafafa;
    border: 2px solid #e5e5e5;
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
  code {
    background: #eee;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 13px;
  }
  .big {
    font-size: 22px;
    color: #ff3e00;
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
  button {
    padding: 8px 14px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-family: sans-serif;
  }
  button:hover { background: #ff3e00; color: white; }
  button.secondary {
    border-color: #888;
    color: #888;
  }
  button.secondary:hover { background: #888; color: white; }
  .log {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 10px 10px 10px 28px;
    border-radius: 6px;
    font-size: 13px;
    margin-top: 10px;
  }
  .log li { margin: 2px 0; }
  .log .empty { color: #777; font-style: italic; list-style: none; margin-left: -18px; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'utils.js',
			content: `// A plain JavaScript file that exports a helper function.
// Any .svelte file can import from here with:
//     import { capitalize } from './utils.js';
//
// Splitting helpers into their own files keeps components
// focused on UI and makes the helpers easy to reuse/test.

export function capitalize(text) {
  // Guard against empty strings so we do not crash.
  if (!text) return '';
  // Take the first letter, upper-case it, and glue the rest on.
  return text[0].toUpperCase() + text.slice(1);
}
`,
			language: 'javascript'
		}
	]
};

export default lesson;
