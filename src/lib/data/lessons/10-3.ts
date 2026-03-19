import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-3',
		title: 'Context: Sharing Without Props',
		phase: 3,
		module: 10,
		lessonIndex: 3
	},
	description: `When components are deeply nested, passing data through every intermediate level via props becomes tedious — this is called "prop drilling." Svelte's Context API (setContext/getContext) solves this by allowing an ancestor component to provide a value that any descendant can read directly.

Context is set during component initialization and is available synchronously to all children. It's perfect for themes, locale settings, or any shared configuration that should be accessible throughout a component subtree.`,
	objectives: [
		'Use setContext to provide values from a parent component',
		'Use getContext to consume context values in child components',
		'Understand the prop drilling problem that context solves',
		'Know when to use context vs props vs module state'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // In a real app, setContext/getContext are used across component files.
  // Here we demonstrate the concept and pattern.

  // The theme context key (use a unique string or Symbol)
  // import { setContext } from 'svelte';

  type Theme = 'light' | 'dark';
  let currentTheme: Theme = $state('light');

  // Simulating context — in real components you'd use:
  // setContext('theme', { get current() { return currentTheme; } });

  // Props vs Context comparison
  let depth: number = $state(3);
</script>

<main class={currentTheme}>
  <h1>Context: Sharing Without Props</h1>

  <div class="controls">
    <button onclick={() => currentTheme = currentTheme === 'light' ? 'dark' : 'light'}>
      Toggle Theme ({currentTheme})
    </button>
  </div>

  <!-- Demonstrating the prop drilling problem -->
  <section>
    <h2>The Prop Drilling Problem</h2>
    <pre>{\`<!-- Without context: pass "theme" through every level -->
<GrandParent theme={theme}>     <!-- knows about theme -->
  <Parent theme={theme}>         <!-- just passing through! -->
    <Child theme={theme}>        <!-- just passing through! -->
      <DeepChild {theme} />      <!-- actually uses theme -->
    </Child>
  </Parent>
</GrandParent>\`}</pre>
  </section>

  <section>
    <h2>The Context Solution</h2>
    <pre>{\`<!-- ThemeProvider.svelte — sets context once -->
<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  // Provide a reactive getter so children see updates
  let theme = $state('light');
  setContext('theme', {
    get current() { return theme; },
    toggle() { theme = theme === 'light' ? 'dark' : 'light'; }
  });
</script>

{@render children()}

<!-- DeepChild.svelte — reads context directly -->
<script lang="ts">
  import { getContext } from 'svelte';

  // No props needed! Just grab it from context.
  const theme = getContext<{
    current: string;
    toggle: () => void;
  }>('theme');
</script>

<p>Current theme: {theme.current}</p>
<button onclick={theme.toggle}>Toggle</button>\`}</pre>
  </section>

  <!-- Visual demo of the themed content -->
  <section class="themed-box">
    <h2>Themed Content</h2>
    <p>This box changes based on the current theme: <strong>{currentTheme}</strong></p>
    <div class="nested">
      <p>Deeply nested component would read theme from context</p>
      <div class="nested">
        <p>No prop drilling needed at any level</p>
      </div>
    </div>
  </section>

  <section>
    <h2>When to Use What</h2>
    <ul>
      <li><strong>Props</strong> — direct parent-child communication</li>
      <li><strong>Context</strong> — shared config across a subtree (theme, locale, auth)</li>
      <li><strong>Module state</strong> — global singleton state (covered next)</li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; padding: 1rem; transition: all 0.3s; }
  main.dark { background: #1a1a2e; color: #eee; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  main.dark section { border-color: #444; }
  .themed-box { transition: all 0.3s; }
  main.dark .themed-box { background: #16213e; }
  .nested { margin-left: 1.5rem; padding: 0.5rem; border-left: 3px solid #6690ff; margin-top: 0.5rem; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  main.dark pre { background: #0f3460; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
  .controls { margin-bottom: 1rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
