import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-4',
		title: 'Reactive Forms: Validation',
		phase: 3,
		module: 9,
		lessonIndex: 4
	},
	description: `Real forms need validation. Svelte's reactive system makes form validation elegant: store form data in $state, derive validation errors with $derived, and conditionally show error messages with {#if}. Because $derived recomputes automatically when its dependencies change, your validation stays perfectly in sync as the user types.

This pattern keeps validation logic centralized, declarative, and easy to reason about — no imperative event handlers needed.`,
	objectives: [
		'Store form field values in $state for reactive tracking',
		'Use $derived to compute validation errors from form state',
		'Display validation errors conditionally with {#if} blocks',
		'Disable form submission when validation errors exist'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Form data stored in $state
  let name: string = $state('');
  let email: string = $state('');
  let password: string = $state('');
  let age: string = $state('');

  let submitted: boolean = $state(false);

  // Derive validation errors reactively
  let errors = $derived({
    name: name.length === 0
      ? 'Name is required'
      : name.length < 2
        ? 'Name must be at least 2 characters'
        : '',
    email: email.length === 0
      ? 'Email is required'
      : !email.includes('@')
        ? 'Email must contain @'
        : '',
    password: password.length === 0
      ? 'Password is required'
      : password.length < 6
        ? 'Password must be at least 6 characters'
        : '',
    age: age.length === 0
      ? ''
      : Number(age) < 13
        ? 'Must be at least 13 years old'
        : ''
  });

  // Derive overall validity
  let isValid: boolean = $derived(
    Object.values(errors).every((e) => e === '')
    && name.length > 0
    && email.length > 0
    && password.length > 0
  );

  function handleSubmit(e: Event) {
    e.preventDefault();
    submitted = true;
    if (isValid) {
      alert(\`Welcome, \${name}!\`);
    }
  }
</script>

<main>
  <h1>Reactive Form Validation</h1>

  <form onsubmit={handleSubmit}>
    <div class="field">
      <label for="name">Name</label>
      <input id="name" type="text" bind:value={name} />
      {#if submitted && errors.name}
        <p class="error">{errors.name}</p>
      {/if}
    </div>

    <div class="field">
      <label for="email">Email</label>
      <input id="email" type="email" bind:value={email} />
      {#if submitted && errors.email}
        <p class="error">{errors.email}</p>
      {/if}
    </div>

    <div class="field">
      <label for="password">Password</label>
      <input id="password" type="password" bind:value={password} />
      {#if submitted && errors.password}
        <p class="error">{errors.password}</p>
      {/if}
    </div>

    <div class="field">
      <label for="age">Age (optional)</label>
      <input id="age" type="number" bind:value={age} />
      {#if errors.age}
        <p class="error">{errors.age}</p>
      {/if}
    </div>

    <button type="submit" disabled={submitted && !isValid}>
      {submitted && !isValid ? 'Fix errors above' : 'Register'}
    </button>

    {#if submitted && isValid}
      <p class="success">Form is valid!</p>
    {/if}
  </form>
</main>

<style>
  main { max-width: 450px; margin: 0 auto; font-family: sans-serif; }
  .field { margin-bottom: 1rem; }
  label { display: block; font-weight: bold; margin-bottom: 0.25rem; }
  input { width: 100%; padding: 0.5rem; font-size: 1rem; box-sizing: border-box; }
  .error { color: #d32f2f; font-size: 0.875rem; margin: 0.25rem 0 0; }
  .success { color: #2e7d32; font-weight: bold; }
  button { padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; margin-top: 0.5rem; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
