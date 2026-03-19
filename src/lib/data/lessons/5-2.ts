import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '5-2',
		title: 'The DOM & Hydration',
		phase: 2,
		module: 5,
		lessonIndex: 2
	},
	description: `The DOM (Document Object Model) is the browser's live representation of your HTML as a tree of JavaScript objects. Every element you see on screen is a node in this tree.

Svelte manages the DOM for you — you write declarative templates and Svelte surgically updates only the parts that change. But sometimes you need direct access to a DOM element (for measuring size, focusing inputs, or integrating third-party libraries). That's where bind:this comes in.

Hydration is what happens when a server-rendered page "wakes up" in the browser — Svelte attaches event listeners and reactivity to the existing HTML instead of re-creating it from scratch.`,
	objectives: [
		'Understand the DOM as a tree of JavaScript objects the browser creates from HTML',
		'Use bind:this to get a reference to a real DOM element',
		'Measure DOM elements and react to size changes',
		'Explain hydration and why Svelte manages the DOM for you'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let boxElement = $state(null);
  let boxWidth = $state(0);
  let boxHeight = $state(0);
  let boxColor = $state('#ff3e00');
  let boxSize = $state(200);

  $effect(() => {
    if (boxElement) {
      const rect = boxElement.getBoundingClientRect();
      boxWidth = Math.round(rect.width);
      boxHeight = Math.round(rect.height);
    }
  });

  // Re-measure when boxSize changes
  $effect(() => {
    // Read boxSize to track it
    boxSize;
    if (boxElement) {
      // Use requestAnimationFrame to measure after the DOM updates
      requestAnimationFrame(() => {
        const rect = boxElement.getBoundingClientRect();
        boxWidth = Math.round(rect.width);
        boxHeight = Math.round(rect.height);
      });
    }
  });
</script>

<h1>The DOM & bind:this</h1>

<p>The box below is a real DOM element. We use <code>bind:this</code> to
  get a reference to it and measure its dimensions.</p>

<div class="controls">
  <label>
    Size: {boxSize}px
    <input type="range" min="80" max="400" bind:value={boxSize} />
  </label>
  <label>
    Color:
    <input type="color" bind:value={boxColor} />
  </label>
</div>

<div
  class="measured-box"
  bind:this={boxElement}
  style="width: {boxSize}px; height: {boxSize}px; background: {boxColor};"
>
  <span>{boxWidth} x {boxHeight}</span>
</div>

<div class="info">
  <h3>DOM Tree Visualisation</h3>
  <pre>
document
 └─ html
     ├─ head
     │   └─ title
     └─ body
         └─ div.measured-box   ← bind:this gives us this node
             └─ span            ← "{boxWidth} x {boxHeight}"
  </pre>
</div>

<div class="concept">
  <h3>What is Hydration?</h3>
  <p>When SvelteKit renders HTML on the server, the browser receives static markup.
    <strong>Hydration</strong> is the process where Svelte "wakes up" that HTML —
    attaching event listeners and reactivity without re-creating the DOM from scratch.</p>
  <p>This gives you the best of both worlds: fast initial paint (server) +
    full interactivity (client).</p>
</div>

<style>
  h1 { color: #333; }
  code { background: #f0f0f0; padding: 0.15rem 0.4rem; border-radius: 3px; font-size: 0.9em; }
  .controls {
    display: flex;
    gap: 1.5rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }
  label { display: flex; align-items: center; gap: 0.5rem; }
  .measured-box {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: all 0.2s;
    margin: 1rem 0;
  }
  .measured-box span {
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    text-shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  .info {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
  }
  .info h3 { margin: 0 0 0.5rem; }
  pre { margin: 0; font-size: 0.85rem; line-height: 1.4; }
  .concept {
    background: #e8f4fd;
    border-left: 4px solid #61affe;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1rem;
  }
  .concept h3 { margin: 0 0 0.5rem; }
  .concept p { margin: 0.5rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
