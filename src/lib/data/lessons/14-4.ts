import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '14-4',
		title: '$bindable & Two-Way Component Binding',
		phase: 5,
		module: 14,
		lessonIndex: 4
	},
	description: `In Svelte 5, components can declare props as bindable using the $bindable() rune, enabling parent components to use bind: directives on them — creating true two-way data flow between parent and child.

By default, props flow one way (parent to child). When a child declares a prop with $bindable(), the parent can write bind:propName={variable} and both sides stay in sync. Svelte also provides ownership warnings in development to help catch unintended mutations when data crosses component boundaries without binding.`,
	objectives: [
		'Declare bindable props using $bindable() in component $props',
		'Use bind:value on custom components for two-way data flow',
		'Provide default values for bindable props with $bindable(fallback)',
		'Understand ownership warnings and when they appear'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Parent state that will be bound to child components
  let username: string = $state('');
  let volume: number = $state(50);
  let agreed: boolean = $state(false);

  // This object is passed without binding — mutations cause ownership warnings
  let config = $state({ theme: 'light', fontSize: 16 });
</script>

<h1>Two-Way Binding with $bindable</h1>

<section>
  <h2>Text Input Component</h2>
  <TextInput bind:value={username} label="Username" placeholder="Enter your name..." />
  <p>Parent sees: <strong>{username || '(empty)'}</strong></p>
</section>

<section>
  <h2>Slider Component</h2>
  <Slider bind:value={volume} min={0} max={100} label="Volume" />
  <p>Parent sees: <strong>{volume}</strong></p>
</section>

<section>
  <h2>Toggle Component</h2>
  <Toggle bind:checked={agreed} label="I agree to the terms" />
  <p>Parent sees: <strong>{agreed ? 'Agreed' : 'Not agreed'}</strong></p>
</section>

<section>
  <h2>Reset from Parent</h2>
  <button onclick={() => { username = ''; volume = 50; agreed = false; }}>
    Reset All Values
  </button>
</section>

<style>
  h1 { color: #2d3436; }
  section {
    margin-bottom: 1.5rem; padding: 1rem;
    background: #f8f9fa; border-radius: 8px;
  }
  h2 { margin-top: 0; color: #e17055; font-size: 1.1rem; }
  p { margin: 0.5rem 0 0; color: #636e72; }
  button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #e17055; color: white; cursor: pointer; font-weight: 600;
  }
  button:hover { background: #d35d47; }
</style>

<!-- Inline child components using {#snippet} won't work for $bindable demo,
     so we define them as script-level components below. In a real project,
     these would be separate .svelte files. For this lesson, the key concepts
     are shown in the template patterns above. -->

<!-- TextInput would be: -->
<!-- <script lang="ts">
  let { value = $bindable(''), label, placeholder = '' }: {
    value: string; label: string; placeholder?: string;
  } = $props();
</script>
<label>{label}</label>
<input type="text" bind:value {placeholder} /> -->

<!-- Slider would be: -->
<!-- <script lang="ts">
  let { value = $bindable(50), min = 0, max = 100, label }: {
    value: number; min?: number; max?: number; label: string;
  } = $props();
</script>
<label>{label}: {value}</label>
<input type="range" bind:value {min} {max} /> -->

<!-- Toggle would be: -->
<!-- <script lang="ts">
  let { checked = $bindable(false), label }: {
    checked: boolean; label: string;
  } = $props();
</script>
<label><input type="checkbox" bind:checked /> {label}</label> -->`,
			language: 'svelte'
		}
	]
};

export default lesson;
