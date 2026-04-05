import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-1',
		title: 'Your First Component',
		phase: 1,
		module: 2,
		lessonIndex: 1
	},
	description: `Components are the **heart** of Svelte. Every \`.svelte\` file is a self-contained component — its own little world with markup (HTML), logic (JavaScript), and styles (CSS) living together in one file. This co-location is what makes Svelte so pleasant: no jumping between three files to understand one piece of UI.

Think of components as **reusable LEGO blocks** for your UI. Instead of writing a hundred-line \`App.svelte\` with every button, card, and form mixed together, you extract a \`Button.svelte\`, a \`Card.svelte\`, a \`LoginForm.svelte\`. Then you compose your app by dropping those components in wherever you need them. The same Card can appear ten times on a page — and each instance has its own independent state.

Every component has a clear structure: \`<script>\` for logic at the top, then markup, then \`<style>\` for CSS. Styles are **scoped** automatically — a \`.title\` class in one component won't leak out and affect \`.title\` classes in other components. That removes a huge class of bugs from traditional CSS.

In this lesson, you'll build your first multi-component app: an \`App.svelte\` that imports and renders a \`Card.svelte\` and a \`Greeting.svelte\`. You'll see how each component is its own island with its own state, and how importing and using them is as simple as writing an HTML tag.`,
	objectives: [
		'Create a .svelte component file with script, markup, and styles',
		'Import a component from another file using import',
		'Render a component multiple times in a parent',
		'Understand that each component instance has its own independent state',
		'Recognize that component styles are scoped by default',
		'Compose a page from multiple small, focused components'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // Importing components — just like any JS module
  // ------------------------------------------------------------
  // The file extension (.svelte) is required. By convention,
  // component names start with a capital letter so Svelte
  // knows this is a component, not an HTML element.
  // ============================================================
  import Card from './Card.svelte';
  import Greeting from './Greeting.svelte';

  let appTitle = $state('Welcome to Components!');

  function shout() {
    appTitle = appTitle.toUpperCase() + '!';
  }

  function reset() {
    appTitle = 'Welcome to Components!';
  }
</script>

<h1>{appTitle}</h1>

<!-- Using a component is as simple as writing an HTML tag. -->
<Greeting />

<p class="intro">
  Each card below is a separate <code>Card</code> component.
  Click the like buttons — notice each card's counter is
  <strong>completely independent</strong>. That's because
  every instance has its own state.
</p>

<div class="grid">
  <Card />
  <Card />
  <Card />
  <Card />
</div>

<div class="actions">
  <button onclick={shout}>SHOUT the title</button>
  <button onclick={reset}>Reset title</button>
</div>

<p class="note">
  Try editing <code>Card.svelte</code> — change the background
  color, or the button label. All four cards update together
  because they all come from the same component definition.
</p>

<style>
  h1 {
    color: #ff3e00;
    font-family: sans-serif;
    margin-bottom: 8px;
  }
  .intro {
    color: #555;
    font-size: 14px;
    margin: 12px 0;
    line-height: 1.5;
  }
  code {
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
  }
  strong { color: #ff3e00; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
    margin: 16px 0;
  }
  .actions { display: flex; gap: 8px; margin: 12px 0; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { background: #ff3e00; color: white; }
  .note {
    color: #999; font-size: 12px; font-style: italic;
    padding: 8px; background: #fafafa; border-left: 3px solid #ff3e00; border-radius: 4px;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Card.svelte',
			content: `<script>
  // ============================================================
  // Every instance of this component gets its OWN 'likes'
  // counter. That's why clicking one card doesn't affect others.
  // ============================================================
  let likes = $state(0);
  let liked = $state(false);

  function toggleLike() {
    if (liked) {
      likes -= 1;
      liked = false;
    } else {
      likes += 1;
      liked = true;
    }
  }
</script>

<div class="card" class:liked>
  <div class="avatar">C</div>
  <h3>My Card</h3>
  <p>A reusable card with its own local state.</p>
  <button onclick={toggleLike}>
    {liked ? '♥' : '♡'} {likes}
  </button>
</div>

<style>
  /* These styles are SCOPED to this component.
     They won't affect .card classes in other files. */
  .card {
    border: 2px solid #eee;
    border-radius: 10px;
    padding: 14px;
    background: white;
    text-align: center;
    transition: all 0.2s;
  }
  .card:hover {
    border-color: #ff3e00;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 62, 0, 0.15);
  }
  .card.liked {
    background: #fff7f3;
    border-color: #ff3e00;
  }
  .avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: #ff3e00; color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; margin: 0 auto 8px;
  }
  h3 { margin: 0 0 6px 0; color: #333; font-size: 15px; }
  p { color: #666; font-size: 12px; margin: 0 0 10px 0; }
  button {
    padding: 4px 12px;
    border: 2px solid #ff3e00;
    background: white;
    color: #ff3e00;
    border-radius: 16px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
  }
  button:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Greeting.svelte',
			content: `<script>
  // A tiny component — it's totally fine to make components
  // this small. Small pieces compose into bigger ones.
  const hours = new Date().getHours();
  const timeOfDay =
    hours < 12 ? 'morning' :
    hours < 18 ? 'afternoon' : 'evening';
</script>

<div class="greeting">
  Good {timeOfDay}! Ready to learn Svelte components?
</div>

<style>
  .greeting {
    padding: 10px 14px;
    background: linear-gradient(135deg, #ff3e00, #ff8a50);
    color: white;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    margin: 8px 0 12px;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
