import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-3',
		title: 'Conditional Rendering: {#if}',
		phase: 1,
		module: 2,
		lessonIndex: 3
	},
	description: `Real UIs are full of things that appear and disappear: error messages, loading spinners, "empty state" illustrations, admin-only buttons, logged-in vs logged-out views. Wrapping markup in a JavaScript \`if\` isn't an option — HTML doesn't work that way. Svelte gives you \`{#if}\` blocks instead.

An \`{#if}\` block takes any JavaScript expression. If it's **truthy**, the block's contents are rendered. If it's **falsy**, they're not even in the DOM. You can chain \`{:else if}\` and \`{:else}\` branches to handle multiple possibilities. This is the single most important control flow primitive in Svelte templates — you'll use it in every component you write.

Understanding **truthiness** is crucial here. In JavaScript, the falsy values are: \`false\`, \`0\`, \`''\` (empty string), \`null\`, \`undefined\`, and \`NaN\`. Everything else — including \`[]\`, \`{}\`, and the string \`"false"\` — is truthy. So \`{#if user}\` renders as long as \`user\` isn't null/undefined, and \`{#if items.length}\` renders only if the array has items.

This lesson walks you through simple toggles, multi-state flows (idle → loading → success → error), null checks for async data, nested conditions, and an interactive "form validation" demo where errors show and hide as the user types.`,
	objectives: [
		'Use {#if}, {:else if}, and {:else} blocks for conditional rendering',
		'Understand JavaScript truthiness (0, "", null, undefined are falsy)',
		'Handle loading/success/error states in a single block',
		'Check for null or missing data before rendering',
		'Combine multiple conditions for complex UI logic',
		'Toggle visibility of elements with boolean state'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // EXAMPLE 1 — Simple toggle
  // ============================================================
  let showMessage = $state(false);

  // ============================================================
  // EXAMPLE 2 — Multi-state status flow
  // ------------------------------------------------------------
  // Cycle through 4 states with a single button. Each state
  // has its own UI via {:else if} branches.
  // ============================================================
  let status = $state('idle');
  const statuses = ['idle', 'loading', 'success', 'error'];

  function nextStatus() {
    const i = statuses.indexOf(status);
    status = statuses[(i + 1) % statuses.length];
  }

  // ============================================================
  // EXAMPLE 3 — Truthiness: string, number, null
  // ------------------------------------------------------------
  // {#if username} is true for any non-empty string.
  // {#if itemCount} is true for any non-zero number.
  // ============================================================
  let username = $state('');
  let itemCount = $state(0);

  // ============================================================
  // EXAMPLE 4 — Null check for data
  // ------------------------------------------------------------
  // Very common: you have data that might not be loaded yet.
  // Check it isn't null before rendering.
  // ============================================================
  let data = $state(null);

  function loadData() {
    data = {
      title: 'Latest Report',
      items: ['Item A', 'Item B', 'Item C'],
      updatedAt: '2026-04-04'
    };
  }

  function clearData() {
    data = null;
  }

  // ============================================================
  // EXAMPLE 5 — Nested conditions: auth + role
  // ------------------------------------------------------------
  // A login gate that ALSO distinguishes admins from regular users.
  // ============================================================
  let loggedIn = $state(false);
  let isAdmin = $state(false);

  // ============================================================
  // EXAMPLE 6 — Real-world: live form validation
  // ------------------------------------------------------------
  // Show errors as the user types, but only after they've typed
  // something (don't yell at them for empty fields before they start).
  // ============================================================
  let email = $state('');
  let password = $state('');

  const emailValid = $derived(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email));
  const passwordLongEnough = $derived(password.length >= 8);
  const formValid = $derived(emailValid && passwordLongEnough);
</script>

<h1>Conditional Rendering</h1>

<section>
  <h2>1. Simple Toggle</h2>
  <button onclick={() => showMessage = !showMessage}>
    {showMessage ? 'Hide' : 'Show'} Message
  </button>
  {#if showMessage}
    <p class="message">Hello! I appear and disappear.</p>
  {/if}
</section>

<section>
  <h2>2. Multi-state Status Flow</h2>
  <button onclick={nextStatus}>Next → (current: {status})</button>
  {#if status === 'idle'}
    <div class="status idle">Waiting for action...</div>
  {:else if status === 'loading'}
    <div class="status loading">Loading data...</div>
  {:else if status === 'success'}
    <div class="status success">Data loaded successfully!</div>
  {:else if status === 'error'}
    <div class="status error">Something went wrong.</div>
  {/if}
</section>

<section>
  <h2>3. Truthiness Checks</h2>
  <input bind:value={username} placeholder="Enter username..." />
  {#if username}
    <p>Welcome, <strong>{username}</strong>!</p>
  {:else}
    <p class="hint">Please enter a username.</p>
  {/if}

  <label>
    Cart items:
    <input type="number" bind:value={itemCount} min="0" max="99" />
  </label>
  {#if itemCount > 0}
    <p>You have <strong>{itemCount}</strong> item{itemCount !== 1 ? 's' : ''} in your cart.</p>
  {:else}
    <p class="hint">Your cart is empty.</p>
  {/if}
</section>

<section>
  <h2>4. Null Check for Async Data</h2>
  <div class="buttons">
    <button onclick={loadData}>Load Data</button>
    <button onclick={clearData}>Clear</button>
  </div>
  {#if data}
    <div class="data-box">
      <h3>{data.title}</h3>
      <ul>
        {#each data.items as item (item)}
          <li>{item}</li>
        {/each}
      </ul>
      <p class="hint">Updated: {data.updatedAt}</p>
    </div>
  {:else}
    <p class="hint">No data loaded yet.</p>
  {/if}
</section>

<section>
  <h2>5. Nested Conditions (Auth + Role)</h2>
  <div class="toggles">
    <label><input type="checkbox" bind:checked={loggedIn} /> Logged In</label>
    <label><input type="checkbox" bind:checked={isAdmin} /> Is Admin</label>
  </div>
  {#if loggedIn}
    {#if isAdmin}
      <div class="status success">Welcome, Admin! Full access granted.</div>
    {:else}
      <div class="status idle">Welcome, user! Standard access.</div>
    {/if}
  {:else}
    <div class="status error">Please log in to continue.</div>
  {/if}
</section>

<section>
  <h2>6. Live Form Validation</h2>
  <div class="form">
    <label>
      Email
      <input bind:value={email} type="email" placeholder="you@example.com" />
    </label>
    {#if email.length > 0 && !emailValid}
      <p class="error">Please enter a valid email address.</p>
    {:else if emailValid}
      <p class="ok">Email looks good.</p>
    {/if}

    <label>
      Password
      <input bind:value={password} type="password" placeholder="8+ characters" />
    </label>
    {#if password.length > 0 && !passwordLongEnough}
      <p class="error">Password must be at least 8 characters.</p>
    {:else if passwordLongEnough}
      <p class="ok">Strong enough.</p>
    {/if}

    {#if formValid}
      <button class="submit">Submit</button>
    {:else}
      <button class="submit" disabled>Submit (fill fields)</button>
    {/if}
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  h3 { margin: 0 0 6px 0; color: #333; font-size: 15px; }
  section { margin-bottom: 22px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .hint { color: #999; font-style: italic; font-size: 13px; }
  .message {
    color: #4ec9b0; font-weight: 600; padding: 10px;
    background: #e6f7f3; border-radius: 6px; margin-top: 8px;
  }
  .status { padding: 10px 14px; border-radius: 6px; margin: 8px 0; font-size: 14px; font-weight: 500; }
  .idle { background: #f0f0f0; color: #666; }
  .loading { background: #e6f0ff; color: #569cd6; }
  .success { background: #e6f7f3; color: #4ec9b0; }
  .error { background: #fdecea; color: #f44747; }
  .data-box { background: #f8f8f8; padding: 12px; border-radius: 6px; margin: 8px 0; border-left: 3px solid #ff3e00; }
  ul { padding-left: 20px; margin: 6px 0; }
  li { color: #444; font-size: 14px; }
  .toggles { display: flex; gap: 16px; margin-bottom: 8px; flex-wrap: wrap; }
  .buttons { display: flex; gap: 8px; margin: 8px 0; }
  label { color: #444; font-size: 14px; display: flex; align-items: center; gap: 6px; }
  input:not([type]), input[type="text"], input[type="email"], input[type="password"] {
    padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px;
  }
  input[type="number"] { width: 70px; padding: 4px; border: 2px solid #ddd; border-radius: 4px; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  .form { display: flex; flex-direction: column; gap: 8px; max-width: 320px; }
  .form label { flex-direction: column; align-items: flex-start; gap: 4px; }
  .form input { width: 100%; box-sizing: border-box; }
  .ok { color: #4ec9b0; font-size: 12px; margin: -2px 0 4px; }
  .error { color: #f44747; font-size: 12px; margin: -2px 0 4px; }
  .submit { margin-top: 8px; font-weight: 600; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
