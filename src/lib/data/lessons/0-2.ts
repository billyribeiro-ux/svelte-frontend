import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-2',
		title: 'Your First SvelteKit Project',
		phase: 1,
		module: 0,
		lessonIndex: 2
	},
	description: `Now that your machine is set up and you can edit markup, let us see the thing that makes Svelte feel magical: **reactivity**. Reactivity is a fancy word for a simple idea — when a value changes, the parts of the page that use it update automatically, without you telling them to.

In plain HTML and JavaScript, if you want a number on the page to update when a user clicks a button, you have to manually find the element with something like \`document.getElementById\`, then manually rewrite its text. Every. Single. Time. It gets messy fast. Svelte removes that whole step.

In Svelte 5, you declare a reactive value with the **\`$state\` rune**. A rune is just a special function that starts with a \`$\`. Writing \`let count = $state(0)\` says: "I have a variable named \`count\`, it starts at 0, and Svelte should track it." Now anywhere you write \`{count}\` in your markup, the screen will re-render whenever \`count\` changes.

The second half of the puzzle is **event handlers**. These are little instructions like "when this button is clicked, run this function." In Svelte 5 they look just like HTML attributes: \`onclick={myFunction}\`. Together, \`$state\` and event handlers let you build interactive UIs with astonishingly little code.

In this lesson you will build not one but **three small interactive widgets** — a counter, a light switch, and a name greeter — all powered by the same core ideas.`,
	objectives: [
		'Understand what "reactivity" means and why it is useful',
		'Declare reactive variables using the $state rune',
		'Attach event handlers with the onclick={} syntax',
		'Update state from inside a function and see the UI refresh automatically',
		'Combine multiple pieces of state in a single component',
		'Use curly braces {value} to display reactive data in markup'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ===== Widget 1: Classic counter =====
  // $state(0) makes "count" reactive — the UI updates when it changes.
  let count = $state(0);

  // Plain functions that modify the reactive state.
  // Notice: we just reassign the value. No "setState", no magic.
  function increment() {
    count = count + 1; // could also be written count++
  }
  function decrement() {
    count = count - 1;
  }
  function resetCount() {
    count = 0;
  }

  // ===== Widget 2: Light switch =====
  // Reactive values can be booleans (true/false) too.
  let lightOn = $state(false);

  function toggleLight() {
    // The ! operator flips true to false and vice versa.
    lightOn = !lightOn;
  }

  // ===== Widget 3: Name greeter =====
  // Strings work exactly the same way.
  let userName = $state('friend');

  function greetAlice() {
    userName = 'Alice';
  }
  function greetBob() {
    userName = 'Bob';
  }
  function greetStranger() {
    userName = 'mysterious stranger';
  }
</script>

<h1>Three Tiny Reactive Widgets</h1>
<p class="intro">
  Click the buttons. Notice how the text updates instantly — that is reactivity.
</p>

<!-- ===== Widget 1: Counter ===== -->
<section class="widget">
  <h2>1. Counter</h2>
  <p class="big-number">{count}</p>
  <div class="buttons">
    <button onclick={decrement}>−</button>
    <button onclick={resetCount}>Reset</button>
    <button onclick={increment}>+</button>
  </div>
</section>

<!-- ===== Widget 2: Light switch ===== -->
<section class="widget">
  <h2>2. Light Switch</h2>
  <!-- We can use a ternary (condition ? a : b) right inside markup -->
  <p class="bulb">{lightOn ? '💡 The light is ON' : '🌑 The light is OFF'}</p>
  <button onclick={toggleLight}>
    {lightOn ? 'Turn off' : 'Turn on'}
  </button>
</section>

<!-- ===== Widget 3: Greeter ===== -->
<section class="widget">
  <h2>3. Greeter</h2>
  <p class="greeting">Hello, {userName}!</p>
  <div class="buttons">
    <button onclick={greetAlice}>Greet Alice</button>
    <button onclick={greetBob}>Greet Bob</button>
    <button onclick={greetStranger}>Greet a stranger</button>
  </div>
</section>

<p class="note">
  All three widgets share the same pattern:
  <strong>$state</strong> holds the value, a
  <strong>function</strong> updates it, and
  <strong>onclick</strong> wires them together.
</p>

<style>
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
    text-align: center;
    margin-bottom: 4px;
  }
  .intro {
    text-align: center;
    color: #666;
    font-family: sans-serif;
    margin-top: 0;
  }
  .widget {
    background: #fff7f2;
    border: 2px solid #ffd6c2;
    border-radius: 10px;
    padding: 14px 18px;
    margin: 14px 0;
    font-family: sans-serif;
    text-align: center;
  }
  h2 {
    color: #333;
    font-size: 16px;
    margin: 0 0 8px;
  }
  .big-number {
    font-size: 48px;
    font-weight: 700;
    color: #ff3e00;
    margin: 8px 0;
  }
  .bulb {
    font-size: 22px;
    margin: 8px 0;
  }
  .greeting {
    font-size: 20px;
    color: #333;
    margin: 8px 0;
  }
  .buttons {
    display: flex;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  button {
    font-size: 15px;
    padding: 8px 16px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-family: sans-serif;
  }
  button:hover {
    background: #ff3e00;
    color: white;
  }
  .note {
    margin-top: 20px;
    padding: 10px 14px;
    background: #f2fbff;
    border-left: 4px solid #569cd6;
    color: #333;
    font-family: sans-serif;
    font-size: 14px;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
