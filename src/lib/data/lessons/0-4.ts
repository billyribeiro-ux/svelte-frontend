import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-4',
		title: 'Functions & Making Things Happen',
		phase: 1,
		module: 0,
		lessonIndex: 4
	},
	description: `Functions are the building blocks of interactivity. They let you package up a set of instructions and run them whenever you want — on a button click, after a timer, or when data changes.

In this lesson, you'll write functions and wire them up to onclick handlers in Svelte. You'll see how functions can read and update $state variables to make the page react.`,
	objectives: [
		'Declare functions with parameters and return values',
		'Wire up onclick handlers to call functions',
		'Update reactive state from inside a function'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let greeting = $state('Click a button below!');
  let clickCount = $state(0);

  function sayHello(name) {
    greeting = \`Hello, \${name}! Nice to meet you.\`;
    clickCount++;
  }

  function reset() {
    greeting = 'Click a button below!';
    clickCount = 0;
  }

  function getEmoji(count) {
    if (count === 0) return '';
    if (count < 3) return '👋';
    if (count < 6) return '🎉';
    return '🚀';
  }
</script>

<h1>{greeting} {getEmoji(clickCount)}</h1>
<p>Total clicks: {clickCount}</p>

<div class="buttons">
  <button onclick={() => sayHello('Alice')}>Greet Alice</button>
  <button onclick={() => sayHello('Bob')}>Greet Bob</button>
  <button onclick={() => sayHello('Svelte')}>Greet Svelte</button>
  <button class="reset" onclick={reset}>Reset</button>
</div>

<style>
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
    font-size: 22px;
    min-height: 36px;
  }
  p {
    color: #666;
    margin: 8px 0 16px;
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  button {
    padding: 8px 16px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  }
  button:hover {
    background: #ff3e00;
    color: white;
  }
  .reset {
    border-color: #666;
    color: #666;
  }
  .reset:hover {
    background: #666;
    color: white;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
