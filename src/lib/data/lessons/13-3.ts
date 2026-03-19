import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-3',
		title: 'Validation, fail() & Errors',
		phase: 4,
		module: 13,
		lessonIndex: 3
	},
	description: `Server-side validation is essential — client-side validation can be bypassed. SvelteKit's fail() function returns validation errors with an HTTP status code while keeping the user on the same page. The page receives these errors through the form prop, allowing you to display error messages and repopulate form fields so the user doesn't have to re-enter everything.

This lesson covers server validation, returning errors with fail(), and creating a smooth validation UX.`,
	objectives: [
		'Validate form data on the server in action functions',
		'Use fail() to return validation errors with appropriate status codes',
		'Access the form prop in the page to display errors',
		'Repopulate form fields after validation failures'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Simulating the form prop that SvelteKit provides
  interface FormResult {
    success?: boolean;
    errors?: Record<string, string>;
    values?: Record<string, string>;
  }

  let form: FormResult | null = $state(null);
  let name: string = $state('');
  let email: string = $state('');
  let age: string = $state('');

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    // Simulating server-side validation
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!email.includes('@')) {
      errors.email = 'Invalid email address';
    }

    if (age && (Number(age) < 13 || Number(age) > 120)) {
      errors.age = 'Age must be between 13 and 120';
    }

    if (Object.keys(errors).length > 0) {
      // This is what fail() does — returns errors + values
      form = { errors, values: { name, email, age } };
    } else {
      form = { success: true };
    }
  }
</script>

<main>
  <h1>Validation, fail() & Errors</h1>

  <section>
    <h2>Server Validation Pattern</h2>
    <pre>{\`// +page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name') as string;
    const email = data.get('email') as string;

    // Validate on the server
    const errors: Record<string, string> = {};

    if (!name?.trim()) {
      errors.name = 'Name is required';
    }
    if (!email?.includes('@')) {
      errors.email = 'Invalid email';
    }

    // Return errors with fail()
    if (Object.keys(errors).length > 0) {
      return fail(400, {
        errors,
        values: { name, email }  // repopulate fields
      });
    }

    // Success — save data
    await db.users.create({ name, email });
    return { success: true };
  }
};\`}</pre>
  </section>

  <section>
    <h2>Using the form Prop</h2>
    <pre>{\`<!-- +page.svelte -->
<script lang="ts">
  let { form } = $props();
  // form is null initially
  // After submission: { errors, values } or { success: true }
</script>

<form method="POST">
  <input
    name="name"
    value={form?.values?.name ?? ''}
  />
  {#if form?.errors?.name}
    <p class="error">{form.errors.name}</p>
  {/if}
</form>\`}</pre>
  </section>

  <section>
    <h2>Live Demo</h2>
    <form onsubmit={handleSubmit}>
      <div class="field">
        <label for="name">Name *</label>
        <input
          id="name"
          bind:value={name}
          class:invalid={form?.errors?.name}
          placeholder="At least 2 characters"
        />
        {#if form?.errors?.name}
          <p class="error">{form.errors.name}</p>
        {/if}
      </div>

      <div class="field">
        <label for="email">Email *</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          class:invalid={form?.errors?.email}
          placeholder="you@example.com"
        />
        {#if form?.errors?.email}
          <p class="error">{form.errors.email}</p>
        {/if}
      </div>

      <div class="field">
        <label for="age">Age (optional)</label>
        <input
          id="age"
          type="number"
          bind:value={age}
          class:invalid={form?.errors?.age}
          placeholder="13-120"
        />
        {#if form?.errors?.age}
          <p class="error">{form.errors.age}</p>
        {/if}
      </div>

      <button type="submit">Submit</button>

      {#if form?.success}
        <p class="success">Form submitted successfully!</p>
      {/if}
    </form>
  </section>
</main>

<style>
  main { max-width: 550px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .field { margin-bottom: 1rem; }
  label { display: block; font-weight: bold; margin-bottom: 0.25rem; }
  input { width: 100%; padding: 0.5rem; font-size: 1rem; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; }
  input.invalid { border-color: #d32f2f; background: #fff5f5; }
  .error { color: #d32f2f; font-size: 0.875rem; margin: 0.25rem 0 0; }
  .success { color: #2e7d32; font-weight: bold; }
  button { padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
