import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-3',
		title: 'Function Bindings (Since 5.9)',
		phase: 3,
		module: 9,
		lessonIndex: 3
	},
	description: `Svelte 5.9 introduced function bindings — instead of binding directly to a variable, you can pass getter and setter functions to bind:value. This gives you a hook to transform the value as it flows in or out. A common use case is trimming whitespace or normalizing input to lowercase automatically.

Function bindings are powerful for any scenario where you need to intercept or transform data at the binding boundary, keeping your reactive state clean without extra derived values or event handlers.`,
	objectives: [
		'Understand the function binding syntax with getter/setter pairs',
		'Use function bindings to trim whitespace from input values',
		'Transform input to lowercase using a setter function',
		'Compare function bindings to traditional event-handler approaches'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Function bindings let you transform values as they flow in and out
  let username: string = $state('');
  let email: string = $state('');
  let tag: string = $state('');

  // Traditional bind:value — no transformation
  let raw: string = $state('');
</script>

<main>
  <h1>Function Bindings</h1>

  <!-- Traditional binding for comparison -->
  <section>
    <h2>Traditional bind:value</h2>
    <input type="text" bind:value={raw} placeholder="Type anything..." />
    <p>Raw value: "{raw}"</p>
  </section>

  <!-- Function binding: auto-trim -->
  <section>
    <h2>Auto-Trim Binding</h2>
    <input
      type="text"
      bind:value={() => username, (v: string) => username = v.trim()}
      placeholder="Try typing with spaces..."
    />
    <p>Trimmed value: "{username}"</p>
    <p><em>Leading/trailing spaces are removed automatically</em></p>
  </section>

  <!-- Function binding: lowercase -->
  <section>
    <h2>Auto-Lowercase Binding</h2>
    <input
      type="text"
      bind:value={() => email, (v: string) => email = v.toLowerCase()}
      placeholder="Enter email..."
    />
    <p>Lowercased value: "{email}"</p>
  </section>

  <!-- Function binding: hashtag prefix -->
  <section>
    <h2>Auto-Prefix Binding</h2>
    <input
      type="text"
      bind:value={
        () => tag.startsWith('#') ? tag.slice(1) : tag,
        (v: string) => tag = '#' + v.replace(/^#+/, '')
      }
      placeholder="Enter a tag..."
    />
    <p>Stored value: "{tag}"</p>
    <p><em>The # prefix is added automatically to the stored value</em></p>
  </section>
</main>

<style>
  main { max-width: 500px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  input { width: 100%; padding: 0.5rem; font-size: 1rem; box-sizing: border-box; }
  p { margin: 0.5rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
