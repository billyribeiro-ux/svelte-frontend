import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '14-5',
		title: '$props.id() & Accessible Components',
		phase: 5,
		module: 14,
		lessonIndex: 5
	},
	description: `Accessible components constantly need unique IDs: linking <label for> to <input id>, wiring aria-labelledby to a heading, associating aria-describedby with help text and error messages. Hand-rolling these IDs (Math.random, counters, crypto.randomUUID) breaks server-side rendering because the server and client generate different values, leading to hydration mismatches.

$props.id() is Svelte 5's solution: a deterministic, hydration-safe unique ID that is stable between server and client. Each call inside a component instance gives you a unique prefix; you concatenate suffixes (-name, -error, -hint) to build related IDs for the whole component. That lets you render two copies of the same component on one page without collisions.`,
	objectives: [
		'Generate hydration-safe unique IDs with $props.id()',
		'Wire label/input pairs using for and id attributes',
		'Use aria-describedby to associate hints and validation messages',
		'Use aria-labelledby to connect group labels to fieldsets and regions',
		'Build re-usable form-field components that never collide across instances'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // $props.id() returns a unique, SSR-stable string for this component
  // instance. Use it as a PREFIX for every related element ID.
  const uid = $props.id();

  // Form state
  let name: string = $state('');
  let email: string = $state('');
  let password: string = $state('');
  let plan: 'free' | 'pro' | 'enterprise' = $state('free');
  let newsletter: boolean = $state(true);
  let bio: string = $state('');
  let submitted: boolean = $state(false);

  // Validation
  let nameError = $derived(
    name.length > 0 && name.trim().length < 2
      ? 'Name must be at least 2 characters'
      : ''
  );
  let emailError = $derived(
    email.length > 0 && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)
      ? 'Please enter a valid email address'
      : ''
  );
  let passwordError = $derived(
    password.length > 0 && password.length < 8
      ? 'Password must be at least 8 characters'
      : ''
  );
  let bioError = $derived(
    bio.length > 200 ? \`Bio must be 200 characters or fewer (\${bio.length})\` : ''
  );
  let formValid = $derived(
    name.trim().length >= 2 &&
    /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) &&
    password.length >= 8 &&
    bio.length <= 200
  );

  function submit(e: SubmitEvent): void {
    e.preventDefault();
    if (formValid) submitted = true;
  }

  function reset(): void {
    name = ''; email = ''; password = ''; plan = 'free';
    newsletter = true; bio = ''; submitted = false;
  }
</script>

<h1 id="{uid}-title">Create Your Account</h1>
<p id="{uid}-desc" class="lede">
  Every field below is wired through <code>$props.id()</code> — labels,
  descriptions, and error messages are all announced correctly to screen readers.
</p>

<form
  aria-labelledby="{uid}-title"
  aria-describedby="{uid}-desc"
  onsubmit={submit}
  novalidate
>
  <!-- Name with aria-describedby for hint + error -->
  <div class="field">
    <label for="{uid}-name">
      Full name <span class="req" aria-hidden="true">*</span>
    </label>
    <input
      id="{uid}-name"
      type="text"
      bind:value={name}
      required
      aria-required="true"
      aria-invalid={nameError ? 'true' : undefined}
      aria-describedby="{uid}-name-hint {nameError ? \`\${uid}-name-error\` : ''}"
    />
    <span id="{uid}-name-hint" class="hint">First and last name</span>
    {#if nameError}
      <span id="{uid}-name-error" class="error" role="alert">{nameError}</span>
    {/if}
  </div>

  <!-- Email -->
  <div class="field">
    <label for="{uid}-email">
      Email <span class="req" aria-hidden="true">*</span>
    </label>
    <input
      id="{uid}-email"
      type="email"
      bind:value={email}
      required
      aria-required="true"
      aria-invalid={emailError ? 'true' : undefined}
      aria-describedby="{uid}-email-hint {emailError ? \`\${uid}-email-error\` : ''}"
    />
    <span id="{uid}-email-hint" class="hint">We will never share this</span>
    {#if emailError}
      <span id="{uid}-email-error" class="error" role="alert">{emailError}</span>
    {/if}
  </div>

  <!-- Password -->
  <div class="field">
    <label for="{uid}-password">
      Password <span class="req" aria-hidden="true">*</span>
    </label>
    <input
      id="{uid}-password"
      type="password"
      bind:value={password}
      required
      aria-required="true"
      aria-invalid={passwordError ? 'true' : undefined}
      aria-describedby="{uid}-password-hint {passwordError ? \`\${uid}-password-error\` : ''}"
    />
    <span id="{uid}-password-hint" class="hint">At least 8 characters</span>
    {#if passwordError}
      <span id="{uid}-password-error" class="error" role="alert">{passwordError}</span>
    {/if}
  </div>

  <!-- Radio group with aria-labelledby on the fieldset legend -->
  <fieldset aria-labelledby="{uid}-plan-label" aria-describedby="{uid}-plan-hint">
    <legend id="{uid}-plan-label">Choose a plan</legend>
    <span id="{uid}-plan-hint" class="hint">You can change this later</span>
    <div class="radios">
      <label>
        <input type="radio" name="plan" value="free" bind:group={plan} />
        Free
      </label>
      <label>
        <input type="radio" name="plan" value="pro" bind:group={plan} />
        Pro
      </label>
      <label>
        <input type="radio" name="plan" value="enterprise" bind:group={plan} />
        Enterprise
      </label>
    </div>
  </fieldset>

  <!-- Checkbox with inline description -->
  <div class="field field-inline">
    <input
      id="{uid}-news"
      type="checkbox"
      bind:checked={newsletter}
      aria-describedby="{uid}-news-hint"
    />
    <label for="{uid}-news">Send me the weekly newsletter</label>
    <span id="{uid}-news-hint" class="hint">One email per week, easy to unsubscribe</span>
  </div>

  <!-- Textarea with live counter announced via aria-describedby -->
  <div class="field">
    <label for="{uid}-bio">Bio</label>
    <textarea
      id="{uid}-bio"
      bind:value={bio}
      rows="3"
      aria-describedby="{uid}-bio-count {bioError ? \`\${uid}-bio-error\` : ''}"
    ></textarea>
    <span id="{uid}-bio-count" class="hint" aria-live="polite">
      {bio.length} / 200 characters
    </span>
    {#if bioError}
      <span id="{uid}-bio-error" class="error" role="alert">{bioError}</span>
    {/if}
  </div>

  <div class="actions">
    <button type="submit" disabled={!formValid}>Create account</button>
    <button type="button" class="secondary" onclick={reset}>Reset</button>
  </div>
</form>

{#if submitted}
  <div class="result" role="status" aria-labelledby="{uid}-result-title">
    <h2 id="{uid}-result-title">Account created</h2>
    <dl>
      <dt>Name</dt><dd>{name}</dd>
      <dt>Email</dt><dd>{email}</dd>
      <dt>Plan</dt><dd>{plan}</dd>
      <dt>Newsletter</dt><dd>{newsletter ? 'yes' : 'no'}</dd>
      <dt>Bio</dt><dd>{bio || '(none)'}</dd>
    </dl>
  </div>
{/if}

<section class="debug">
  <h3>Generated ID tree</h3>
  <code>base = {uid}</code>
  <ul>
    <li><code>{uid}-title</code> — page heading (aria-labelledby target)</li>
    <li><code>{uid}-desc</code> — page description (aria-describedby target)</li>
    <li><code>{uid}-name / -name-hint / -name-error</code></li>
    <li><code>{uid}-email / -email-hint / -email-error</code></li>
    <li><code>{uid}-password / -password-hint / -password-error</code></li>
    <li><code>{uid}-plan-label / -plan-hint</code></li>
    <li><code>{uid}-news / -news-hint</code></li>
    <li><code>{uid}-bio / -bio-count / -bio-error</code></li>
  </ul>
</section>

<style>
  h1 { color: #2d3436; margin-bottom: 0.25rem; }
  .lede { color: #636e72; font-size: 0.9rem; margin-bottom: 1rem; }
  .lede code { background: #eef; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.88em; }

  form { max-width: 520px; }
  .field { margin-bottom: 1rem; }
  .field-inline { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 0.4rem 0.6rem; }
  .field-inline .hint { grid-column: 2; }
  label { display: block; font-weight: 600; margin-bottom: 0.2rem; color: #2d3436; font-size: 0.9rem; }
  .req { color: #d63031; margin-left: 2px; }
  input[type="text"], input[type="email"], input[type="password"], textarea {
    width: 100%; padding: 0.55rem; border: 1px solid #ddd;
    border-radius: 6px; font-size: 0.95rem; box-sizing: border-box;
  }
  input:focus, textarea:focus {
    outline: 2px solid #0984e3; border-color: transparent;
  }
  input[aria-invalid="true"], textarea[aria-invalid="true"] {
    border-color: #d63031; background: #fff5f5;
  }
  .hint { display: block; font-size: 0.78rem; color: #636e72; margin-top: 0.2rem; }
  .error {
    display: block; font-size: 0.8rem; color: #d63031;
    font-weight: 600; margin-top: 0.25rem;
  }

  fieldset {
    border: 1px solid #dfe6e9; border-radius: 8px;
    padding: 0.6rem 0.8rem 0.8rem; margin: 0 0 1rem;
  }
  legend { font-weight: 600; padding: 0 0.4rem; color: #2d3436; font-size: 0.9rem; }
  .radios { display: flex; gap: 1rem; margin-top: 0.4rem; }
  .radios label { font-weight: 400; }

  .actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
  button {
    padding: 0.6rem 1.2rem; border: none; border-radius: 6px;
    font-weight: 600; cursor: pointer; font-size: 0.9rem;
  }
  button[type="submit"] { background: #0984e3; color: white; }
  button[type="submit"]:disabled { background: #b2bec3; cursor: not-allowed; }
  button.secondary { background: #dfe6e9; color: #2d3436; }

  .result {
    margin-top: 1.5rem; padding: 1rem 1.25rem;
    background: #e8f8f0; border-radius: 8px; border-left: 4px solid #00b894;
  }
  .result h2 { margin: 0 0 0.5rem; color: #00b894; font-size: 1.05rem; }
  dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 0.15rem 0.75rem; }
  dt { font-weight: 600; color: #2d3436; }
  dd { margin: 0; color: #636e72; }

  .debug {
    margin-top: 1.5rem; padding: 1rem; background: #2d3436;
    border-radius: 8px; color: #dfe6e9;
  }
  .debug h3 { margin: 0 0 0.5rem; font-size: 0.9rem; color: #74b9ff; }
  .debug code { font-size: 0.8rem; color: #fdcb6e; }
  .debug ul { margin: 0.5rem 0 0; padding-left: 1.2rem; font-size: 0.78rem; }
  .debug li { padding: 0.1rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
