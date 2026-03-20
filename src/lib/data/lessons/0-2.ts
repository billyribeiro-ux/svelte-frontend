import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '0-2',
		title: 'Your First SvelteKit Project',
		phase: 1,
		module: 0,
		lessonIndex: 2
	},
	description: `Now that your machine is set up, let's explore what makes Svelte special: reactivity.

In Svelte 5, we use the $state rune to create reactive variables. When the value changes, the UI updates automatically — no extra work needed.

You'll build a simple counter to see reactivity in action. Click the button and watch the number change instantly.`,
	objectives: [
		'Create a reactive variable with $state',
		'Bind a click handler to a button',
		'See the UI update automatically when state changes'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let count = $state(0);

  function increment() {
    count++;
  }

  function decrement() {
    count--;
  }
</script>

<h1>Counter: {count}</h1>

<div class="buttons">
  <button onclick={decrement}>-</button>
  <button onclick={increment}>+</button>
</div>

<p>Click the buttons to change the count.</p>

<style>
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
    text-align: center;
  }
  .buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin: 16px 0;
  }
  button {
    font-size: 24px;
    padding: 8px 20px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
  }
  button:hover {
    background: #ff3e00;
    color: white;
  }
  p {
    text-align: center;
    color: #666;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
