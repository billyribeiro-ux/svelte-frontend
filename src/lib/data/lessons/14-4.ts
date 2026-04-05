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
  import TextInput from './TextInput.svelte';
  import Slider from './Slider.svelte';
  import Toggle from './Toggle.svelte';

  // ─────────────────────────────────────────────────────────────
  // $bindable() lets a child prop flow BOTH ways. The parent
  // writes bind:value={x}; the child declares the prop with
  // $bindable(); each side stays in sync automatically.
  //
  // Without $bindable() on the child, bind: on the parent throws
  // a dev-time error. Without bind: on the parent, the child
  // cannot write to the prop (ownership warning).
  // ─────────────────────────────────────────────────────────────

  // --- Profile form state ---
  let username: string = $state('');
  let bio: string = $state('');
  let volume: number = $state(50);
  let brightness: number = $state(70);
  let notifications: boolean = $state(true);
  let darkMode: boolean = $state(false);
  let agreed: boolean = $state(false);

  // --- Derived state that reacts to bound values ---
  let valid = $derived(username.trim().length >= 3 && agreed);
  let loudness = $derived(
    volume < 30 ? 'quiet' : volume < 70 ? 'normal' : 'loud'
  );

  // --- Live JSON preview of the whole form ---
  let snapshot = $derived(
    JSON.stringify(
      { username, bio, volume, brightness, notifications, darkMode, agreed },
      null,
      2
    )
  );

  function resetAll(): void {
    username = '';
    bio = '';
    volume = 50;
    brightness = 70;
    notifications = true;
    darkMode = false;
    agreed = false;
  }

  function preset(name: 'work' | 'cinema' | 'night'): void {
    if (name === 'work') {
      volume = 40; brightness = 90; darkMode = false; notifications = true;
    } else if (name === 'cinema') {
      volume = 85; brightness = 30; darkMode = true; notifications = false;
    } else {
      volume = 20; brightness = 15; darkMode = true; notifications = false;
    }
  }
</script>

<h1>Two-Way Binding with $bindable</h1>

<section class="callout">
  <strong>How it works:</strong> The child declares the prop with
  <code>$bindable()</code>. The parent uses <code>bind:</code>. Writes on either
  side update the other. Try typing in inputs, then use the reset / preset
  buttons to see parent → child flow.
</section>

<div class="layout">
  <div class="form">
    <section>
      <h2>Text Inputs</h2>
      <TextInput bind:value={username} label="Username" placeholder="At least 3 characters..." />
      <TextInput bind:value={bio} label="Bio" placeholder="Tell us about yourself..." />
    </section>

    <section>
      <h2>Sliders</h2>
      <Slider bind:value={volume} min={0} max={100} label="Volume" />
      <Slider bind:value={brightness} min={0} max={100} label="Brightness" />
    </section>

    <section>
      <h2>Toggles</h2>
      <Toggle bind:checked={notifications} label="Enable notifications" />
      <Toggle bind:checked={darkMode} label="Dark mode" />
      <Toggle bind:checked={agreed} label="I accept the terms" />
    </section>

    <section class="actions">
      <button onclick={() => preset('work')}>Work preset</button>
      <button onclick={() => preset('cinema')}>Cinema preset</button>
      <button onclick={() => preset('night')}>Night preset</button>
      <button class="secondary" onclick={resetAll}>Reset all</button>
    </section>
  </div>

  <aside class="preview">
    <h2>Parent-side view</h2>
    <div class="stat">Username: <strong>{username || '(empty)'}</strong></div>
    <div class="stat">Volume: <strong>{volume}</strong> <em>({loudness})</em></div>
    <div class="stat">Brightness: <strong>{brightness}%</strong></div>
    <div class="stat">Notifications: <strong>{notifications ? 'on' : 'off'}</strong></div>
    <div class="stat">Dark mode: <strong>{darkMode ? 'yes' : 'no'}</strong></div>
    <div class="stat">Form valid: <strong class:ok={valid}>{valid ? 'YES' : 'no'}</strong></div>

    <h3>Live snapshot</h3>
    <pre>{snapshot}</pre>
  </aside>
</div>

<style>
  h1 { color: #2d3436; }
  .callout {
    padding: 0.75rem 0.9rem; background: #fff8e1;
    border-left: 3px solid #fdcb6e; border-radius: 6px;
    font-size: 0.88rem; color: #7c5a00; margin-bottom: 1rem;
  }
  .callout code { background: #fef3c7; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }

  .layout {
    display: grid; grid-template-columns: 1fr 320px; gap: 1rem;
  }
  .form section {
    margin-bottom: 1rem; padding: 1rem;
    background: #f8f9fa; border-radius: 8px;
  }
  .form h2 { margin: 0 0 0.5rem; color: #e17055; font-size: 1rem; }

  .actions { display: flex; flex-wrap: wrap; gap: 0.4rem; }
  button {
    padding: 0.5rem 0.9rem; border: none; border-radius: 6px;
    background: #e17055; color: white; cursor: pointer; font-weight: 600;
    font-size: 0.88rem;
  }
  button:hover { background: #d35d47; }
  button.secondary { background: #b2bec3; }
  button.secondary:hover { background: #95a5a6; }

  .preview {
    padding: 1rem; background: #2d3436; color: #dfe6e9;
    border-radius: 8px; position: sticky; top: 1rem; align-self: start;
  }
  .preview h2 { margin: 0 0 0.5rem; color: #74b9ff; font-size: 1rem; }
  .preview h3 { margin: 1rem 0 0.25rem; color: #ffeaa7; font-size: 0.85rem; }
  .stat { font-size: 0.85rem; padding: 0.2rem 0; }
  .stat strong { color: white; }
  .stat strong.ok { color: #00b894; }
  .stat em { color: #b2bec3; font-style: normal; font-size: 0.78rem; }
  pre {
    background: #1e272e; padding: 0.5rem; border-radius: 4px;
    font-size: 0.72rem; max-height: 180px; overflow: auto;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'TextInput.svelte',
			content: `<script lang="ts">
  // $bindable() makes this prop two-way bindable
  let { value = $bindable(''), label, placeholder = '' }: {
    value: string;
    label: string;
    placeholder?: string;
  } = $props();
</script>

<label class="field">
  <span>{label}</span>
  <input type="text" bind:value {placeholder} />
</label>

<style>
  .field { display: flex; flex-direction: column; gap: 0.25rem; }
  span { font-size: 0.85rem; font-weight: 600; color: #2d3436; }
  input {
    padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;
    font-size: 0.95rem;
  }
  input:focus { outline: 2px solid #e17055; border-color: transparent; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Slider.svelte',
			content: `<script lang="ts">
  // $bindable(50) provides a default fallback value
  let { value = $bindable(50), min = 0, max = 100, label }: {
    value: number;
    min?: number;
    max?: number;
    label: string;
  } = $props();
</script>

<label class="slider-field">
  <span>{label}: <strong>{value}</strong></span>
  <input type="range" bind:value {min} {max} />
</label>

<style>
  .slider-field { display: flex; flex-direction: column; gap: 0.25rem; }
  span { font-size: 0.85rem; font-weight: 600; color: #2d3436; }
  strong { color: #e17055; }
  input[type="range"] { width: 100%; accent-color: #e17055; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Toggle.svelte',
			content: `<script lang="ts">
  // $bindable(false) — bindable boolean prop
  let { checked = $bindable(false), label }: {
    checked: boolean;
    label: string;
  } = $props();
</script>

<label class="toggle-field">
  <input type="checkbox" bind:checked />
  <span>{label}</span>
</label>

<style>
  .toggle-field {
    display: flex; align-items: center; gap: 0.5rem;
    cursor: pointer; font-size: 0.95rem; color: #2d3436;
  }
  input[type="checkbox"] {
    width: 18px; height: 18px; accent-color: #e17055;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
