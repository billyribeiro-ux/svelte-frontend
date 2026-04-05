import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '9-4',
		title: 'Reactive Forms: Validation',
		phase: 3,
		module: 9,
		lessonIndex: 4
	},
	description: `Form validation is the classic test case for a reactive system, and Svelte passes it beautifully. The recipe has just four ingredients:

1. **Store every field in \`$state\`** — either as individual variables or as one object like \`form\`.
2. **Derive an \`errors\` object with \`$derived\` (or \`$derived.by\` for multi-line logic)** — it recomputes automatically on every keystroke.
3. **Derive a single \`isValid\` flag** by folding over the error values.
4. **Show errors conditionally**, typically after the user has "touched" a field (\`onblur\`) or tried to submit.

There are no event handlers that write to \`errors\`, no manual revalidation calls, no stale error messages. The error state is a pure function of the form state, and Svelte's reactivity guarantees they stay in sync.

This lesson builds a full registration form with seven fields, a password strength meter (also \`$derived\`), per-field "touched" tracking, and a live JSON debug panel so you can watch the reactive state flow.`,
	objectives: [
		'Store form data in a single $state object for tidy access',
		'Derive a reactive errors object with $derived.by containing per-field rules',
		'Derive isValid, errorCount and a password strength score from the same state',
		'Track which fields have been "touched" so errors appear at the right time',
		'Disable the submit button until the form is valid',
		'Reset the form by reassigning the state objects'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Reactive form validation with $state + $derived
  // ============================================================
  //
  // Svelte's reactive primitives make form validation almost
  // trivial:
  //
  //   1. Keep each field in a $state variable.
  //   2. Derive an "errors" object with $derived — it recomputes
  //      automatically on every keystroke.
  //   3. Derive an "isValid" flag from the errors.
  //   4. Show per-field errors only after the user has "touched"
  //      the field (or tried to submit), to avoid screaming at
  //      them before they've typed anything.
  //
  // No event handlers. No imperative revalidation. No stale
  // state. Just data flowing through derivations.

  type FormData = {
    name: string;
    email: string;
    password: string;
    confirm: string;
    age: string;
    website: string;
    acceptTerms: boolean;
  };

  type Errors = Record<keyof FormData, string>;

  let form: FormData = $state({
    name: '',
    email: '',
    password: '',
    confirm: '',
    age: '',
    website: '',
    acceptTerms: false
  });

  // "touched" tracks which fields the user has interacted with.
  // Errors are only shown for touched fields, so the form isn't
  // red on first render.
  let touched: Record<keyof FormData, boolean> = $state({
    name: false,
    email: false,
    password: false,
    confirm: false,
    age: false,
    website: false,
    acceptTerms: false
  });

  let submitAttempted: boolean = $state(false);

  // --- Validation rules live in one place, reactively --------
  const errors: Errors = $derived.by(() => {
    const e: Errors = {
      name: '', email: '', password: '', confirm: '',
      age: '', website: '', acceptTerms: ''
    };

    // Name
    if (form.name.trim().length === 0) e.name = 'Name is required.';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';
    else if (form.name.length > 50) e.name = 'Name is too long (max 50).';

    // Email
    if (form.email.length === 0) e.email = 'Email is required.';
    else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email)) {
      e.email = 'Enter a valid email address.';
    }

    // Password
    if (form.password.length === 0) e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(form.password)) e.password = 'Include at least one uppercase letter.';
    else if (!/[0-9]/.test(form.password)) e.password = 'Include at least one digit.';

    // Confirm password
    if (form.confirm.length === 0) e.confirm = 'Please confirm your password.';
    else if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';

    // Age (optional, but validated when present)
    if (form.age.length > 0) {
      const n = Number(form.age);
      if (!Number.isFinite(n)) e.age = 'Age must be a number.';
      else if (n < 13) e.age = 'You must be at least 13.';
      else if (n > 120) e.age = 'Please enter a realistic age.';
    }

    // Website (optional)
    if (form.website.length > 0) {
      try {
        const u = new URL(form.website);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          e.website = 'Website must use http(s).';
        }
      } catch {
        e.website = 'Enter a valid URL (include https://).';
      }
    }

    // Terms
    if (!form.acceptTerms) e.acceptTerms = 'You must accept the terms.';

    return e;
  });

  const isValid: boolean = $derived(
    Object.values(errors).every((msg) => msg === '')
  );

  const errorCount: number = $derived(
    Object.values(errors).filter((msg) => msg !== '').length
  );

  // --- Password strength meter (bonus derivation) -------------
  const passwordStrength: { score: number; label: string } = $derived.by(() => {
    const p = form.password;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['empty', 'weak', 'fair', 'good', 'strong', 'excellent'];
    return { score, label: labels[Math.min(score, 5)] };
  });

  function markTouched(field: keyof FormData) {
    touched[field] = true;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    submitAttempted = true;
    // Mark every field touched so errors become visible.
    for (const k of Object.keys(touched) as (keyof FormData)[]) {
      touched[k] = true;
    }
    if (isValid) {
      alert('Welcome, ' + form.name + '! (In a real app this would submit.)');
    }
  }

  function shouldShowError(field: keyof FormData): boolean {
    return (touched[field] || submitAttempted) && errors[field] !== '';
  }

  function reset() {
    form = {
      name: '', email: '', password: '', confirm: '',
      age: '', website: '', acceptTerms: false
    };
    touched = {
      name: false, email: false, password: false, confirm: false,
      age: false, website: false, acceptTerms: false
    };
    submitAttempted = false;
  }
</script>

<main>
  <h1>Reactive Form Validation</h1>
  <p class="lede">
    Store every field in <code>$state</code>, derive an
    <code>errors</code> object with <code>$derived</code>,
    and let Svelte keep the two in sync on every keystroke.
  </p>

  <form onsubmit={handleSubmit} novalidate>
    <div class="field" class:invalid={shouldShowError('name')}>
      <label for="name">Name *</label>
      <input
        id="name"
        type="text"
        bind:value={form.name}
        onblur={() => markTouched('name')}
      />
      {#if shouldShowError('name')}
        <p class="error">{errors.name}</p>
      {/if}
    </div>

    <div class="field" class:invalid={shouldShowError('email')}>
      <label for="email">Email *</label>
      <input
        id="email"
        type="email"
        bind:value={form.email}
        onblur={() => markTouched('email')}
      />
      {#if shouldShowError('email')}
        <p class="error">{errors.email}</p>
      {/if}
    </div>

    <div class="field" class:invalid={shouldShowError('password')}>
      <label for="password">Password *</label>
      <input
        id="password"
        type="password"
        bind:value={form.password}
        onblur={() => markTouched('password')}
      />
      {#if form.password.length > 0}
        <div class="strength strength-{passwordStrength.score}">
          <div class="strength-bar"></div>
          <span>{passwordStrength.label}</span>
        </div>
      {/if}
      {#if shouldShowError('password')}
        <p class="error">{errors.password}</p>
      {/if}
    </div>

    <div class="field" class:invalid={shouldShowError('confirm')}>
      <label for="confirm">Confirm password *</label>
      <input
        id="confirm"
        type="password"
        bind:value={form.confirm}
        onblur={() => markTouched('confirm')}
      />
      {#if shouldShowError('confirm')}
        <p class="error">{errors.confirm}</p>
      {/if}
    </div>

    <div class="field" class:invalid={shouldShowError('age')}>
      <label for="age">Age (optional)</label>
      <input
        id="age"
        type="number"
        bind:value={form.age}
        onblur={() => markTouched('age')}
      />
      {#if shouldShowError('age')}
        <p class="error">{errors.age}</p>
      {/if}
    </div>

    <div class="field" class:invalid={shouldShowError('website')}>
      <label for="website">Website (optional)</label>
      <input
        id="website"
        type="url"
        placeholder="https://example.com"
        bind:value={form.website}
        onblur={() => markTouched('website')}
      />
      {#if shouldShowError('website')}
        <p class="error">{errors.website}</p>
      {/if}
    </div>

    <div class="field checkbox-field" class:invalid={shouldShowError('acceptTerms')}>
      <label>
        <input
          type="checkbox"
          bind:checked={form.acceptTerms}
          onchange={() => markTouched('acceptTerms')}
        />
        I accept the terms and conditions *
      </label>
      {#if shouldShowError('acceptTerms')}
        <p class="error">{errors.acceptTerms}</p>
      {/if}
    </div>

    <div class="summary" class:ok={isValid} class:bad={!isValid}>
      {#if isValid}
        Ready to submit
      {:else}
        {errorCount} {errorCount === 1 ? 'problem' : 'problems'} to fix
      {/if}
    </div>

    <div class="actions">
      <button type="submit" disabled={!isValid}>Register</button>
      <button type="button" onclick={reset}>Reset</button>
    </div>
  </form>

  <aside>
    <h2>Live state (debug view)</h2>
    <pre>{JSON.stringify({ form, errors, isValid }, null, 2)}</pre>
  </aside>
</main>

<style>
  main {
    max-width: 720px;
    margin: 0 auto;
    padding: 1.25rem;
    font-family: system-ui, sans-serif;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  @media (min-width: 780px) {
    main { grid-template-columns: 1.4fr 1fr; }
    main > h1, main > .lede { grid-column: 1 / -1; }
  }
  h1 { margin: 0; }
  .lede { color: #555; margin: 0 0 0.5rem; }
  form {
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }
  .field { margin-bottom: 1rem; }
  label {
    display: block;
    font-weight: 600;
    font-size: 0.85rem;
    color: #374151;
    margin-bottom: 0.25rem;
  }
  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="number"],
  input[type="url"] {
    width: 100%;
    padding: 0.55rem 0.65rem;
    font-size: 0.95rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    box-sizing: border-box;
    transition: border-color 0.15s;
  }
  .field.invalid input { border-color: #dc2626; background: #fef2f2; }
  .error {
    color: #b91c1c;
    font-size: 0.8rem;
    margin: 0.25rem 0 0;
  }
  .checkbox-field label {
    display: flex; align-items: center; gap: 0.5rem;
    font-weight: 500;
  }
  .summary {
    padding: 0.6rem 0.8rem;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.9rem;
    margin: 0.5rem 0;
    text-align: center;
  }
  .summary.ok { background: #dcfce7; color: #166534; }
  .summary.bad { background: #fef3c7; color: #92400e; }
  .actions { display: flex; gap: 0.5rem; }
  button {
    padding: 0.6rem 1.1rem;
    font-size: 0.95rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
  }
  button[type="submit"] {
    background: #6690ff;
    color: white;
    border-color: #6690ff;
  }
  button[type="submit"]:disabled {
    background: #d1d5db;
    border-color: #d1d5db;
    cursor: not-allowed;
  }
  .strength {
    display: flex; align-items: center; gap: 0.5rem;
    margin: 0.3rem 0;
    font-size: 0.75rem;
    color: #6b7280;
  }
  .strength-bar {
    flex: 1;
    height: 0.3rem;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }
  .strength-bar::after {
    content: '';
    position: absolute;
    top: 0; left: 0; bottom: 0;
    transition: all 0.2s;
  }
  .strength-0 .strength-bar::after { width: 0%; background: #e5e7eb; }
  .strength-1 .strength-bar::after { width: 20%; background: #dc2626; }
  .strength-2 .strength-bar::after { width: 40%; background: #ea580c; }
  .strength-3 .strength-bar::after { width: 60%; background: #eab308; }
  .strength-4 .strength-bar::after { width: 80%; background: #65a30d; }
  .strength-5 .strength-bar::after { width: 100%; background: #16a34a; }
  aside {
    padding: 1rem;
    background: #0f172a;
    border-radius: 8px;
    align-self: start;
  }
  aside h2 {
    margin: 0 0 0.5rem;
    color: #94a3b8;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  pre {
    margin: 0;
    color: #e2e8f0;
    font-size: 0.72rem;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
