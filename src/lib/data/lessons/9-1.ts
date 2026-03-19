import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-1',
		title: 'Two-Way Binding: bind:value',
		phase: 3,
		module: 9,
		lessonIndex: 1
	},
	description: `In Svelte, data usually flows one way: from parent to child via props. But form inputs need to send data back up. The bind:value directive creates a two-way binding — when the user types, the variable updates automatically, and when the variable changes, the input reflects it.

This lesson covers bind:value on text inputs, number inputs, and textareas. You'll see how two-way binding eliminates the need for manual event handlers and keeps your UI perfectly in sync with your state.`,
	objectives: [
		'Use bind:value on text inputs to create two-way data binding',
		'Bind number inputs and understand automatic type coercion',
		'Use bind:value on textareas for multi-line text editing',
		'Display bound values reactively as the user types'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Two-way binding keeps variables and inputs in sync
  let name: string = $state('');
  let age: number = $state(25);
  let bio: string = $state('');

  // TODO: Try typing in each input and watch the preview update instantly
</script>

<main>
  <h1>Two-Way Binding: bind:value</h1>

  <section>
    <label>
      Name:
      <input type="text" bind:value={name} placeholder="Enter your name" />
    </label>
  </section>

  <section>
    <label>
      Age:
      <input type="number" bind:value={age} min={0} max={120} />
    </label>
  </section>

  <section>
    <label>
      Bio:
      <textarea bind:value={bio} placeholder="Tell us about yourself..." rows={4}></textarea>
    </label>
  </section>

  <hr />

  <h2>Live Preview</h2>
  <p><strong>Name:</strong> {name || '(empty)'}</p>
  <p><strong>Age:</strong> {age}</p>
  <p><strong>Bio:</strong> {bio || '(empty)'}</p>
  <p><em>Type of age: {typeof age}</em></p>
</main>

<style>
  main { max-width: 500px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1rem; }
  label { display: block; font-weight: bold; margin-bottom: 0.25rem; }
  input, textarea { width: 100%; padding: 0.5rem; font-size: 1rem; box-sizing: border-box; }
  hr { margin: 1.5rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
