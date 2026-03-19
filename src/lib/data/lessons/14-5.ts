import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '14-5',
		title: '$props.id() & Accessible Components',
		phase: 5,
		module: 14,
		lessonIndex: 5
	},
	description: `Accessible components frequently need unique IDs to link labels to inputs, connect aria-labelledby attributes, and associate descriptions with controls. Manually generating IDs is error-prone and can break during SSR/hydration when server and client generate different values.

Svelte 5's $props.id() generates a unique, deterministic ID that is stable across server-side rendering and client-side hydration. It produces consistent IDs without collisions, making it the recommended approach for building accessible, hydration-safe components.`,
	objectives: [
		'Generate unique, hydration-safe IDs with $props.id()',
		'Link label and input elements using for/id attributes',
		'Use aria-labelledby and aria-describedby with generated IDs',
		'Build accessible form components with proper ARIA associations'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // $props.id() generates a unique, hydration-safe ID
  const id = $props.id();

  let name: string = $state('');
  let email: string = $state('');
  let bio: string = $state('');
  let submitted: boolean = $state(false);

  function handleSubmit(): void {
    submitted = true;
  }

  function reset(): void {
    name = '';
    email = '';
    bio = '';
    submitted = false;
  }
</script>

<h1 id="{id}-title">Accessible Form</h1>
<p id="{id}-description">
  All form controls use IDs derived from $props.id() for proper label association.
</p>

<form
  aria-labelledby="{id}-title"
  aria-describedby="{id}-description"
  onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}
>
  <div class="field">
    <label for="{id}-name">Full Name</label>
    <input
      id="{id}-name"
      type="text"
      bind:value={name}
      aria-required="true"
      aria-describedby="{id}-name-hint"
    />
    <span id="{id}-name-hint" class="hint">Your first and last name</span>
  </div>

  <div class="field">
    <label for="{id}-email">Email Address</label>
    <input
      id="{id}-email"
      type="email"
      bind:value={email}
      aria-required="true"
      aria-describedby="{id}-email-hint"
    />
    <span id="{id}-email-hint" class="hint">We'll never share your email</span>
  </div>

  <div class="field">
    <label for="{id}-bio">Bio</label>
    <textarea
      id="{id}-bio"
      bind:value={bio}
      rows="3"
      aria-describedby="{id}-bio-hint"
    ></textarea>
    <span id="{id}-bio-hint" class="hint">Optional: tell us about yourself</span>
  </div>

  <div class="actions">
    <button type="submit">Submit</button>
    <button type="button" onclick={reset}>Reset</button>
  </div>
</form>

{#if submitted}
  <div class="result" role="alert" aria-labelledby="{id}-result-title">
    <h2 id="{id}-result-title">Submitted!</h2>
    <dl>
      <dt>Name</dt><dd>{name || '(not provided)'}</dd>
      <dt>Email</dt><dd>{email || '(not provided)'}</dd>
      <dt>Bio</dt><dd>{bio || '(not provided)'}</dd>
    </dl>
  </div>
{/if}

<div class="debug">
  <h3>Generated IDs (from $props.id())</h3>
  <code>Base ID: {id}</code><br />
  <code>Name field: {id}-name</code><br />
  <code>Email field: {id}-email</code><br />
  <code>Bio field: {id}-bio</code>
</div>

<style>
  h1 { color: #2d3436; margin-bottom: 0.25rem; }
  form { max-width: 450px; }
  .field { margin-bottom: 1rem; }
  label {
    display: block; font-weight: 600; margin-bottom: 0.25rem; color: #2d3436;
  }
  input, textarea {
    width: 100%; padding: 0.5rem; border: 1px solid #ddd;
    border-radius: 4px; font-size: 1rem; box-sizing: border-box;
  }
  input:focus, textarea:focus { outline: 2px solid #0984e3; border-color: transparent; }
  .hint { display: block; font-size: 0.8rem; color: #636e72; margin-top: 0.2rem; }
  .actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
  button {
    padding: 0.5rem 1.25rem; border: none; border-radius: 4px;
    font-weight: 600; cursor: pointer;
  }
  button[type="submit"] { background: #0984e3; color: white; }
  button[type="button"] { background: #dfe6e9; color: #2d3436; }
  .result {
    margin-top: 1.5rem; padding: 1rem; background: #e8f8f0;
    border-radius: 8px; border-left: 4px solid #00b894;
  }
  .result h2 { margin: 0 0 0.5rem; color: #00b894; }
  dl { margin: 0; }
  dt { font-weight: 600; color: #2d3436; }
  dd { margin: 0 0 0.5rem; color: #636e72; }
  .debug {
    margin-top: 1.5rem; padding: 1rem; background: #2d3436;
    border-radius: 8px; color: #dfe6e9;
  }
  .debug h3 { margin: 0 0 0.5rem; font-size: 0.9rem; color: #74b9ff; }
  .debug code { font-size: 0.85rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
