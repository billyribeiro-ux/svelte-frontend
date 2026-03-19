import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-3',
		title: 'Overriding Derived (Optimistic UI)',
		phase: 2,
		module: 6,
		lessonIndex: 3
	},
	description: `Since Svelte 5.25, you can override a $derived value by writing to it directly. The override lasts until the dependencies change, at which point the derived expression takes over again.

This is perfect for optimistic UI patterns. When a user clicks "like", you immediately show the updated count (override), fire off the server request, and if it fails, the derived value snaps back to the real server state.

Think of it as: "show this temporary value until reality catches up." It's a powerful pattern that makes your UI feel instant.`,
	objectives: [
		'Override a $derived value by assigning to it directly',
		'Understand that overrides persist until dependencies change',
		'Implement optimistic UI: show instant feedback, rollback on failure'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Simulate server data
  let serverLikes = $state(42);
  let serverSaved = $state(false);

  // Derived from server state — but can be overridden!
  let displayLikes = $derived(serverLikes);
  let displaySaved = $derived(serverSaved);

  let isPending = $state(false);
  let error = $state('');
  let shouldFail = $state(false);

  async function handleLike() {
    if (isPending) return;

    // Optimistic update — override the derived value immediately
    displayLikes = serverLikes + 1;
    isPending = true;
    error = '';

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (shouldFail) reject(new Error('Server error!'));
          else resolve();
        }, 1500);
      });

      // Success — update the real server state
      // This causes $derived to recompute, replacing our override
      serverLikes = serverLikes + 1;
    } catch (e) {
      // Failure — update serverLikes to itself to trigger $derived recomputation
      // This "cancels" our override and snaps back to the real value
      error = e.message;
      serverLikes = serverLikes; // triggers derived to recalculate
    } finally {
      isPending = false;
    }
  }

  async function toggleSave() {
    if (isPending) return;

    // Optimistic toggle
    displaySaved = !serverSaved;
    isPending = true;
    error = '';

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (shouldFail) reject(new Error('Save failed!'));
          else resolve();
        }, 1000);
      });

      serverSaved = !serverSaved;
    } catch (e) {
      error = e.message;
      serverSaved = serverSaved;
    } finally {
      isPending = false;
    }
  }
</script>

<h1>Overriding $derived (Optimistic UI)</h1>

<div class="demo-card">
  <h2>Photo Post</h2>
  <div class="image-placeholder">
    <span>Beautiful Sunset</span>
  </div>

  <div class="actions">
    <button class="like-btn" onclick={handleLike} disabled={isPending}>
      <span class="heart">{displayLikes > serverLikes ? '&#10084;' : '&#9825;'}</span>
      {displayLikes} likes
    </button>

    <button class="save-btn" onclick={toggleSave} disabled={isPending}>
      {displaySaved ? '&#9733; Saved' : '&#9734; Save'}
    </button>
  </div>

  {#if isPending}
    <p class="pending">Syncing with server...</p>
  {/if}

  {#if error}
    <p class="error">Rolled back! {error}</p>
  {/if}
</div>

<div class="debug">
  <h3>Behind the scenes</h3>
  <table>
    <tr>
      <td>Server likes:</td>
      <td><strong>{serverLikes}</strong></td>
    </tr>
    <tr>
      <td>Display likes (derived + override):</td>
      <td><strong>{displayLikes}</strong></td>
    </tr>
    <tr>
      <td>Server saved:</td>
      <td><strong>{String(serverSaved)}</strong></td>
    </tr>
    <tr>
      <td>Display saved:</td>
      <td><strong>{String(displaySaved)}</strong></td>
    </tr>
  </table>

  <label class="fail-toggle">
    <input type="checkbox" bind:checked={shouldFail} />
    Simulate server failure (to see rollback)
  </label>
</div>

<div class="explanation">
  <h3>How it works</h3>
  <ol>
    <li><code>displayLikes = $derived(serverLikes)</code> — normally mirrors server</li>
    <li>On click: <code>displayLikes = serverLikes + 1</code> — override shows instantly</li>
    <li>On success: <code>serverLikes++</code> — dependency changes, derived recalculates, override gone</li>
    <li>On failure: <code>serverLikes = serverLikes</code> — triggers recalc, snaps back to real value</li>
  </ol>
</div>

<style>
  h1 { color: #333; }
  .demo-card {
    max-width: 350px;
    border: 1px solid #ddd;
    border-radius: 12px;
    overflow: hidden;
    margin: 1.5rem 0;
  }
  .demo-card h2 { padding: 0.75rem 1rem 0; margin: 0; }
  .image-placeholder {
    background: linear-gradient(135deg, #667eea, #764ba2);
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.3rem;
    margin: 0.5rem 1rem;
    border-radius: 8px;
  }
  .actions {
    display: flex;
    gap: 1rem;
    padding: 0.75rem 1rem;
  }
  .actions button {
    background: none;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.95rem;
  }
  .actions button:disabled { opacity: 0.6; }
  .heart { color: #ef4444; font-size: 1.2em; }
  .like-btn:hover { background: #fff5f5; }
  .save-btn:hover { background: #fffbeb; }
  .pending { padding: 0 1rem 0.5rem; color: #f59e0b; font-size: 0.85rem; margin: 0; }
  .error { padding: 0 1rem 0.75rem; color: #ef4444; font-size: 0.85rem; margin: 0; }
  .debug {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
  }
  .debug h3 { margin: 0 0 0.5rem; }
  table { width: 100%; }
  td { padding: 0.25rem 0.5rem; }
  .fail-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    cursor: pointer;
  }
  .explanation {
    background: #e8f4fd;
    padding: 1rem;
    border-radius: 8px;
  }
  .explanation h3 { margin: 0 0 0.5rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  ol { padding-left: 1.2rem; }
  li { margin: 0.3rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
