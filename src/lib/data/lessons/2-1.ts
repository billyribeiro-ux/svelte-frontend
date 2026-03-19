import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-1',
		title: 'Your First Component',
		phase: 1,
		module: 2,
		lessonIndex: 1
	},
	description: `Components are the heart of Svelte. Each .svelte file is a self-contained component with its own markup, styles, and logic. You build applications by composing small, focused components together — just like building with blocks.

In this lesson, you'll create your first component, import it into another file, and see how components keep your code organized and reusable.`,
	objectives: [
		'Create a .svelte component file with script, markup, and styles',
		'Import and use a component inside another component',
		'Understand that each component is a self-contained unit'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import Card from './Card.svelte';

  let greeting = $state('Welcome to Components!');
</script>

<h1>{greeting}</h1>
<p>Each card below is a separate Card component:</p>

<div class="grid">
  <Card />
  <Card />
  <Card />
</div>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 8px; }
  p { color: #666; margin-bottom: 16px; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Card.svelte',
			content: `<script>
  let likes = $state(0);

  function like() {
    likes += 1;
  }
</script>

<div class="card">
  <h3>My Card</h3>
  <p>This is a reusable card component. Each card has its own state!</p>
  <div class="footer">
    <button onclick={like}>Like ({likes})</button>
  </div>
</div>

<style>
  .card {
    border: 2px solid #eee;
    border-radius: 8px;
    padding: 16px;
    background: white;
    transition: border-color 0.2s;
  }
  .card:hover {
    border-color: #ff3e00;
  }
  h3 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 16px;
  }
  p {
    color: #666;
    font-size: 13px;
    margin: 0 0 12px 0;
  }
  .footer {
    display: flex;
    justify-content: flex-end;
  }
  button {
    padding: 4px 12px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
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
