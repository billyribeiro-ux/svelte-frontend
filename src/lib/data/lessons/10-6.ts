import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-6',
		title: 'Packages & Dependencies',
		phase: 3,
		module: 10,
		lessonIndex: 6
	},
	description: `Real applications rely on external packages from npm. Understanding how to install, import, and use third-party libraries is essential for building production Svelte apps. The package.json file tracks your dependencies, and bundlers resolve imports automatically.

This lesson covers the mechanics of working with packages in a Svelte project, from installing a library to importing and using it in your components.`,
	objectives: [
		'Understand the role of package.json and node_modules',
		'Import and use third-party packages in Svelte components',
		'Distinguish between dependencies and devDependencies',
		'Handle common package import patterns and side effects'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // In a real project, you'd install packages with:
  // npm install date-fns
  // npm install -D @types/some-package

  // Then import them:
  // import { format, formatDistanceToNow } from 'date-fns';
  // import confetti from 'canvas-confetti';

  // For this lesson, we demonstrate the patterns without actual imports

  let now: Date = $state(new Date());
  let selectedFormat: string = $state('full');

  // Simulating what a date library would do
  function formatDate(date: Date, style: string): string {
    switch (style) {
      case 'full': return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      case 'short': return date.toLocaleDateString('en-US');
      case 'time': return date.toLocaleTimeString('en-US');
      case 'iso': return date.toISOString();
      default: return date.toString();
    }
  }

  // Simulating a utility library
  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  let inputValue: number = $state(50);
  let clamped: number = $derived(clamp(inputValue, 0, 100));
</script>

<main>
  <h1>Packages & Dependencies</h1>

  <section>
    <h2>Installing Packages</h2>
    <pre>{\`# Install a runtime dependency
npm install date-fns

# Install a dev-only dependency
npm install -D @sveltejs/adapter-auto

# package.json tracks everything:
{
  "dependencies": {
    "date-fns": "^3.6.0"    // needed at runtime
  },
  "devDependencies": {
    "@sveltejs/kit": "^2.0.0"  // needed only for building
  }
}\`}</pre>
  </section>

  <section>
    <h2>Using a Package</h2>
    <pre>{\`<script lang="ts">
  // Named imports (tree-shakeable)
  import { format, addDays } from 'date-fns';

  // Default import
  import confetti from 'canvas-confetti';

  // Type-only import (stripped at build time)
  import type { Duration } from 'date-fns';

  let formatted = format(new Date(), 'PPPP');
</script>\`}</pre>

    <h3>Live Demo (simulated)</h3>
    <select bind:value={selectedFormat}>
      <option value="full">Full Date</option>
      <option value="short">Short Date</option>
      <option value="time">Time Only</option>
      <option value="iso">ISO 8601</option>
    </select>
    <p>Formatted: <strong>{formatDate(now, selectedFormat)}</strong></p>
    <button onclick={() => now = new Date()}>Refresh Time</button>
  </section>

  <section>
    <h2>Common Patterns</h2>
    <pre>{\`// Re-exporting from a barrel file (index.ts)
export { default as Button } from './Button.svelte';
export { default as Input } from './Input.svelte';

// Importing CSS from a package
import 'some-package/styles.css';

// Dynamic import (code splitting)
const module = await import('heavy-library');\`}</pre>
  </section>

  <section>
    <h2>Utility Example: clamp()</h2>
    <label>
      Value: <input type="number" bind:value={inputValue} />
    </label>
    <p>clamp({inputValue}, 0, 100) = <strong>{clamped}</strong></p>
    <p><em>In a real app, you might use a library like "lodash-es" for utility functions.</em></p>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  select, input[type="number"] { padding: 0.5rem; font-size: 1rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; margin-top: 0.5rem; }
  label { display: flex; align-items: center; gap: 0.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
