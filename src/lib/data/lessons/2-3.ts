import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-3',
		title: 'Conditional Rendering: {#if}',
		phase: 1,
		module: 2,
		lessonIndex: 3
	},
	description: `Not everything should be visible all the time. Svelte's {#if} blocks let you conditionally show or hide parts of your UI based on any expression that evaluates to truthy or falsy. You can chain {#if}, {:else if}, and {:else} to handle multiple conditions.

This lesson covers all the patterns for conditional rendering, including truthiness checks and nested conditions.`,
	objectives: [
		'Use {#if}, {:else if}, and {:else} blocks for conditional rendering',
		'Understand JavaScript truthiness in the context of {#if}',
		'Combine multiple conditions for complex UI logic'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Simple toggle
  let showMessage = $state(false);

  // Multi-state
  let status = $state('idle');
  const statuses = ['idle', 'loading', 'success', 'error'];

  function nextStatus() {
    const currentIndex = statuses.indexOf(status);
    status = statuses[(currentIndex + 1) % statuses.length];
  }

  // Truthiness checks
  let username = $state('');
  let itemCount = $state(0);
  let data = $state(null);

  function loadData() {
    data = { message: 'Data loaded successfully!', items: ['Item A', 'Item B'] };
  }

  function clearData() {
    data = null;
  }

  // Nested conditions
  let loggedIn = $state(false);
  let isAdmin = $state(false);
</script>

<h1>Conditional Rendering</h1>

<section>
  <h2>Simple Toggle</h2>
  <button onclick={() => showMessage = !showMessage}>
    {showMessage ? 'Hide' : 'Show'} Message
  </button>
  {#if showMessage}
    <p class="message">Hello! I appear and disappear.</p>
  {/if}
</section>

<section>
  <h2>{'{#if} / {:else if} / {:else}'}</h2>
  <button onclick={nextStatus}>Next Status: {status}</button>
  {#if status === 'idle'}
    <div class="status idle">Waiting for action...</div>
  {:else if status === 'loading'}
    <div class="status loading">Loading data...</div>
  {:else if status === 'success'}
    <div class="status success">Data loaded successfully!</div>
  {:else if status === 'error'}
    <div class="status error">Something went wrong!</div>
  {/if}
</section>

<section>
  <h2>Truthiness Checks</h2>
  <input bind:value={username} placeholder="Enter username..." />
  {#if username}
    <p>Welcome, <strong>{username}</strong>!</p>
  {:else}
    <p class="hint">Please enter a username</p>
  {/if}

  <label>Items: <input type="number" bind:value={itemCount} min="0" max="99" /></label>
  {#if itemCount > 0}
    <p>You have <strong>{itemCount}</strong> item{itemCount !== 1 ? 's' : ''} in your cart.</p>
  {:else}
    <p class="hint">Your cart is empty.</p>
  {/if}
</section>

<section>
  <h2>Null Check Pattern</h2>
  <div class="buttons">
    <button onclick={loadData}>Load Data</button>
    <button onclick={clearData}>Clear Data</button>
  </div>
  {#if data}
    <div class="data-box">
      <p>{data.message}</p>
      <ul>
        {#each data.items as item}
          <li>{item}</li>
        {/each}
      </ul>
    </div>
  {:else}
    <p class="hint">No data loaded yet.</p>
  {/if}
</section>

<section>
  <h2>Nested Conditions</h2>
  <div class="toggles">
    <label><input type="checkbox" bind:checked={loggedIn} /> Logged In</label>
    <label><input type="checkbox" bind:checked={isAdmin} /> Is Admin</label>
  </div>
  {#if loggedIn}
    {#if isAdmin}
      <p class="status success">Welcome, Admin! You have full access.</p>
    {:else}
      <p class="status idle">Welcome, User! Standard access granted.</p>
    {/if}
  {:else}
    <p class="status error">Please log in to continue.</p>
  {/if}
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .hint { color: #999; font-style: italic; }
  .message { color: #4ec9b0; font-weight: 600; padding: 8px; background: #e6f7f3; border-radius: 6px; margin-top: 8px; }
  .status { padding: 8px 12px; border-radius: 6px; margin: 8px 0; font-size: 14px; }
  .idle { background: #f0f0f0; color: #666; }
  .loading { background: #e6f0ff; color: #569cd6; }
  .success { background: #e6f7f3; color: #4ec9b0; }
  .error { background: #fdecea; color: #f44747; }
  .data-box { background: #f8f8f8; padding: 12px; border-radius: 6px; margin: 8px 0; }
  ul { padding-left: 20px; }
  li { color: #444; font-size: 14px; }
  .toggles { display: flex; gap: 16px; margin-bottom: 8px; }
  .buttons { display: flex; gap: 8px; margin: 8px 0; }
  label { color: #444; font-size: 14px; display: flex; align-items: center; gap: 4px; }
  input[type="text"], input:not([type]) { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  input[type="number"] { width: 60px; padding: 4px; border: 2px solid #ddd; border-radius: 4px; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
