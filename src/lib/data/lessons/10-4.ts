import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-4',
		title: 'Modules & Shared State',
		phase: 3,
		module: 10,
		lessonIndex: 4
	},
	description: `Svelte modules (.svelte.ts files) let you create reactive state that lives outside any component. When you export reactive state from a module, every component that imports it shares the same instance — making it a true global singleton. This is ideal for app-wide state like authentication, shopping carts, or feature flags.

The key pattern is exporting getter functions rather than raw $state values, since runes are not directly exportable as bindings. A getter ensures consumers always read the current value.`,
	objectives: [
		'Create a .svelte.ts module with exported reactive state',
		'Use the getter pattern to share reactive values across components',
		'Understand singleton behavior of module-level state',
		'Know when to use module state vs context vs props'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // In a real app, you'd import from a .svelte.ts file:
  // import { count, increment, decrement } from './counter.svelte.ts';

  // Simulating a .svelte.ts module's shared state pattern:
  // The module would look like this:

  // --- counter.svelte.ts ---
  // let count = $state(0);
  // export function getCount() { return count; }
  // export function increment() { count++; }
  // export function decrement() { count--; }
  // export function reset() { count = 0; }

  // Here we define the same pattern inline:
  let count: number = $state(0);

  function increment() { count++; }
  function decrement() { count--; }
  function reset() { count = 0; }

  // Another module example: user preferences
  let darkMode: boolean = $state(false);
  let fontSize: number = $state(16);
</script>

<main class:dark={darkMode} style="font-size: {fontSize}px;">
  <h1>Modules & Shared State</h1>

  <!-- The module pattern -->
  <section>
    <h2>The .svelte.ts Module Pattern</h2>
    <pre>{\`// counter.svelte.ts
let count = $state(0);

// Export functions — not raw $state
export function getCount() {
  return count;
}
export function increment() { count++; }
export function decrement() { count--; }
export function reset() { count = 0; }

// --- OR use the getter object pattern ---
export const counter = {
  get count() { return count; },
  increment() { count++; },
  decrement() { count--; },
  reset() { count = 0; }
};\`}</pre>
  </section>

  <!-- Live demo simulating the shared counter -->
  <section>
    <h2>Shared Counter Demo</h2>
    <div class="counter">
      <button onclick={decrement}>-</button>
      <span class="count">{count}</span>
      <button onclick={increment}>+</button>
      <button onclick={reset}>Reset</button>
    </div>
    <p><em>In a real app, every component importing this module sees the same count.</em></p>
  </section>

  <!-- Preferences module example -->
  <section>
    <h2>Shared Preferences</h2>
    <pre>{\`// preferences.svelte.ts
let darkMode = $state(false);
let fontSize = $state(16);

export const preferences = {
  get darkMode() { return darkMode; },
  get fontSize() { return fontSize; },
  toggleDark() { darkMode = !darkMode; },
  setFontSize(size: number) { fontSize = size; }
};\`}</pre>
    <div class="prefs">
      <label>
        <input type="checkbox" bind:checked={darkMode} />
        Dark Mode
      </label>
      <label>
        Font Size: {fontSize}px
        <input type="range" bind:value={fontSize} min={12} max={24} />
      </label>
    </div>
  </section>

  <section>
    <h2>Why Getters?</h2>
    <p>You cannot <code>export let x = $state(0)</code> and have it stay reactive across imports. The importing module gets the <em>value</em> at import time, not a live binding. Wrapping in a getter (<code>get count() &#123; return count; &#125;</code>) ensures each read fetches the current value.</p>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; padding: 1rem; transition: all 0.3s; }
  main.dark { background: #1a1a2e; color: #eee; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  main.dark section { border-color: #444; }
  .counter { display: flex; align-items: center; gap: 1rem; }
  .count { font-size: 2rem; font-weight: bold; min-width: 3rem; text-align: center; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  main.dark pre { background: #0f3460; }
  button { padding: 0.5rem 1rem; cursor: pointer; font-size: 1.2rem; }
  .prefs { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.5rem; }
  label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
  code { background: #e8e8e8; padding: 0.15rem 0.4rem; border-radius: 3px; }
  main.dark code { background: #333; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
