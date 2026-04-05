import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-3',
		title: 'Validation, fail() & Errors',
		phase: 4,
		module: 13,
		lessonIndex: 3
	},
	description: `Real forms fail. Users leave fields blank, type "not an email" into email fields, and pick passwords like "1". Your server action needs to validate, reject, and tell the user what went wrong — while keeping what they already typed (you don't get a second chance).

SvelteKit gives you fail(status, data) for validation errors. It returns the data to the page via the 'form' prop without touching URL state, so you can render field-level errors next to the inputs and repopulate values the user already entered. For unexpected errors (DB down, network) you throw — SvelteKit renders +error.svelte.

This lesson covers the fail vs throw distinction, field-level errors, and the repopulation pattern that keeps users from re-typing their whole form.`,
	objectives: [
		'Return validation errors with fail(status, {...})',
		'Receive them on the page via let { form } = $props()',
		'Repopulate fields so the user does not lose their input',
		'Render field-level errors next to each control',
		'Distinguish fail() (expected) from error() (unexpected)',
		'Use a validation library like Zod to replace hand-rolled checks'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // This playground simulates the validation flow that happens
  // between a SvelteKit action and its page.
  //
  // The real shape, mapped to SvelteKit:
  //
  //   action:  return fail(400, { email, errors: { email: '...' } });
  //   page:    let { form } = $props();
  //            then bind values to form?.email and render form?.errors?.email
  // ---------------------------------------------------------------

  interface FormErrors {
    email?: string;
    password?: string;
    age?: string;
  }

  interface FormResult {
    status: number;
    values: { email: string; password: string; age: string };
    errors: FormErrors;
    success: boolean;
    message: string;
  }

  let result: FormResult | null = $state.raw(null);
  let submitting: boolean = $state(false);

  // The stand-in "action" runs client-side here, but the code
  // mirrors exactly what a real +page.server.ts action would do.
  async function fakeAction(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const email = (data.get('email') ?? '').toString().trim();
    const password = (data.get('password') ?? '').toString();
    const age = (data.get('age') ?? '').toString();

    submitting = true;
    // Pretend network delay
    await new Promise((r) => setTimeout(r, 300));

    const errors: FormErrors = {};

    if (!email) errors.email = 'Email is required';
    else if (!email.includes('@')) errors.email = 'Must be a valid email';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 8)
      errors.password = 'Password must be at least 8 characters';

    const ageNum = Number(age);
    if (!age) errors.age = 'Age is required';
    else if (Number.isNaN(ageNum)) errors.age = 'Age must be a number';
    else if (ageNum < 13) errors.age = 'Must be 13 or older';

    if (Object.keys(errors).length > 0) {
      // ▶ In a real action: return fail(400, { email, age, errors });
      //   NOTE: we do NOT echo the password — never send it back.
      result = {
        status: 400,
        values: { email, password: '', age },
        errors,
        success: false,
        message: 'Please fix the errors below'
      };
    } else {
      // ▶ In a real action: return { success: true };
      result = {
        status: 200,
        values: { email, password: '', age },
        errors: {},
        success: true,
        message: 'Account created for ' + email
      };
    }

    submitting = false;
  }

  function reset(): void {
    result = null;
  }
</script>

<main>
  <h1>Validation, fail() & Errors</h1>

  <section>
    <h2>1. The Two Error Modes</h2>
    <table>
      <thead>
        <tr><th></th><th><code>fail(status, data)</code></th><th><code>error(status, msg)</code> or throw</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Use for</td>
          <td>Expected validation errors</td>
          <td>Unexpected failures (DB down, etc.)</td>
        </tr>
        <tr>
          <td>Renders</td>
          <td>The same page with <code>form</code> prop populated</td>
          <td>The nearest <code>+error.svelte</code></td>
        </tr>
        <tr>
          <td>HTTP status</td>
          <td>Usually 400 / 422</td>
          <td>Usually 500 / 404</td>
        </tr>
        <tr>
          <td>Preserves user input</td>
          <td>yes (if you return the fields)</td>
          <td>no</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>2. Server: fail() with field errors</h2>
    <pre>{\`// src/routes/signup/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email    = (data.get('email')    ?? '').toString().trim();
    const password = (data.get('password') ?? '').toString();
    const age      = Number(data.get('age') ?? 0);

    const errors: Record<string, string> = {};
    if (!email.includes('@'))  errors.email = 'Must be a valid email';
    if (password.length < 8)   errors.password = 'At least 8 characters';
    if (age < 13)              errors.age = 'Must be 13 or older';

    if (Object.keys(errors).length > 0) {
      // Echo the values back so the form can repopulate —
      // BUT NEVER echo the password!
      return fail(400, { email, age, errors });
    }

    try {
      await db.user.create({ email, password, age });
    } catch (e) {
      // Unexpected — crash to +error.svelte
      throw error(500, 'Could not create account');
    }

    return { success: true };
  }
};\`}</pre>
  </section>

  <section>
    <h2>3. Page: reading the form prop</h2>
    <pre>{\`<!-- src/routes/signup/+page.svelte -->
<script lang="ts">
  import type { ActionData } from './$types';
  let { form }: { form: ActionData } = $props();
</\${''}script>

<form method="POST">
  <label>
    Email
    <input name="email" type="email" value={form?.email ?? ''} />
    {#if form?.errors?.email}
      <span class="error">{form.errors.email}</span>
    {/if}
  </label>

  <label>
    Password
    <input name="password" type="password" />
    {#if form?.errors?.password}
      <span class="error">{form.errors.password}</span>
    {/if}
  </label>

  <label>
    Age
    <input name="age" type="number" value={form?.age ?? ''} />
    {#if form?.errors?.age}
      <span class="error">{form.errors.age}</span>
    {/if}
  </label>

  {#if form?.success}
    <p class="ok">Account created!</p>
  {/if}

  <button>Sign up</button>
</form>\`}</pre>
  </section>

  <section>
    <h2>4. Try the full round-trip</h2>
    <p class="hint">
      This form simulates the action locally. Try submitting with blank fields,
      a bad email, a short password, or age &lt; 13.
    </p>
    <form onsubmit={fakeAction} class="real">
      <label>
        Email
        <input
          name="email"
          type="email"
          value={result?.values.email ?? ''}
          class:invalid={!!result?.errors?.email}
        />
        {#if result?.errors?.email}
          <span class="error">{result.errors.email}</span>
        {/if}
      </label>

      <label>
        Password
        <input
          name="password"
          type="password"
          class:invalid={!!result?.errors?.password}
        />
        {#if result?.errors?.password}
          <span class="error">{result.errors.password}</span>
        {/if}
        <span class="help">Never repopulate password fields.</span>
      </label>

      <label>
        Age
        <input
          name="age"
          type="number"
          value={result?.values.age ?? ''}
          class:invalid={!!result?.errors?.age}
        />
        {#if result?.errors?.age}
          <span class="error">{result.errors.age}</span>
        {/if}
      </label>

      <div class="actions">
        <button disabled={submitting}>
          {submitting ? 'Submitting...' : 'Sign up'}
        </button>
        <button type="button" onclick={reset}>Reset</button>
      </div>

      {#if result}
        <div class="banner" class:ok={result.success} class:fail={!result.success}>
          <strong>Status {result.status}:</strong> {result.message}
        </div>
      {/if}
    </form>
  </section>

  <section>
    <h2>5. Using Zod Instead of Hand-Rolled Checks</h2>
    <pre>{\`import { z } from 'zod';
import { fail } from '@sveltejs/kit';

const Signup = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.coerce.number().int().min(13)
});

export const actions = {
  default: async ({ request }) => {
    const data = Object.fromEntries(await request.formData());
    const parsed = Signup.safeParse(data);

    if (!parsed.success) {
      // Flatten Zod errors into a shape the page can render
      const errors = parsed.error.flatten().fieldErrors;
      return fail(400, {
        email: data.email ?? '',
        age:   data.age ?? '',
        errors
      });
    }

    await db.user.create(parsed.data);
    return { success: true };
  }
};\`}</pre>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  h2 { margin-top: 0; }
  .hint { color: #555; font-size: 0.9rem; margin: 0 0 0.75rem; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; }
  .real { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; background: #fafafa; border-radius: 6px; }
  .real label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.9rem; }
  .real input { padding: 0.45rem; font-family: inherit; font-size: 0.9rem; border: 1px solid #bbb; border-radius: 3px; }
  .real input.invalid { border-color: #c62828; background: #fff5f5; }
  .error { color: #c62828; font-size: 0.78rem; }
  .help { color: #888; font-size: 0.72rem; }
  .actions { display: flex; gap: 0.5rem; }
  .real button { padding: 0.5rem 1rem; cursor: pointer; background: #1565c0; color: white; border: none; border-radius: 4px; }
  .real button[type="button"] { background: #888; }
  .banner { padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.85rem; }
  .banner.ok { background: #e8f5e9; border-left: 3px solid #4caf50; }
  .banner.fail { background: #ffebee; border-left: 3px solid #f44336; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
