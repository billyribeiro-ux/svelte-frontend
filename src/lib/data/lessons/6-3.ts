import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-3',
		title: 'Overriding Derived (Optimistic UI)',
		phase: 2,
		module: 6,
		lessonIndex: 3
	},
	description: `Since Svelte 5.25 you can **override** a <code>$derived</code> value by writing to it directly. The override sticks until any of the derived's dependencies change, at which point the expression takes over again and the override is discarded.

This is purpose-built for **optimistic UI**. When a user clicks "like", you don't want them to wait for the server round-trip before the count increments — you want the UI to feel instant. So you:
1. **Override** the derived with the new value immediately (instant feedback).
2. **Fire** the request to the server.
3. On **success**, update the real server state — the derived recomputes from the new truth and the override is replaced.
4. On **failure**, trigger the derived to recompute (by touching its dependency) — the override is discarded and the UI snaps back to reality.

It's a powerful pattern that makes your UI feel instant while keeping a single source of truth.`,
	objectives: [
		'Override a $derived value by assigning to it directly',
		'Understand that overrides persist until dependencies change',
		'Implement optimistic UI: show instant feedback, rollback on failure',
		'Handle the pending, success, and error states of an optimistic action',
		'Recognise when optimistic UI is (and is not) appropriate'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ================================================================
  // Server-side "truth" — what the backend thinks is real.
  // ================================================================
  let serverLikes = $state(42);
  let serverSaved = $state(false);
  let serverComments = $state([
    { id: 1, author: 'Ada', text: 'This view is beautiful!' },
    { id: 2, author: 'Grace', text: 'Where is this photo from?' }
  ]);

  // ================================================================
  // Derived values that MIRROR the server — but can be overridden.
  // Every \`display*\` recomputes whenever its server dependency changes,
  // which conveniently wipes out any override we set earlier.
  // ================================================================
  let displayLikes = $derived(serverLikes);
  let displaySaved = $derived(serverSaved);
  let displayComments = $derived(serverComments);

  // === UI state ===
  let isPending = $state(false);
  let error = $state('');
  let shouldFail = $state(false);
  let latency = $state(1200);

  // === For the comment demo ===
  let newComment = $state('');
  let nextTempId = $state(-1); // negative ids mark optimistic rows

  // -----------------------------------------------------------------
  // Helper: simulate a network round-trip that can succeed or fail.
  // -----------------------------------------------------------------
  function fakeServerCall() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) reject(new Error('Server error (simulated)'));
        else resolve();
      }, latency);
    });
  }

  // -----------------------------------------------------------------
  // 1) Optimistic like
  // -----------------------------------------------------------------
  async function handleLike() {
    if (isPending) return;
    error = '';
    isPending = true;

    // Optimistic: write to the derived immediately.
    displayLikes = serverLikes + 1;

    try {
      await fakeServerCall();
      // Success — replace the source of truth. This recomputes the derived,
      // which makes our override naturally disappear.
      serverLikes = serverLikes + 1;
    } catch (e) {
      error = e.message;
      // Failure — nudge the dependency so the derived recomputes back to truth.
      // Self-assignment is enough to trigger recomputation.
      serverLikes = serverLikes;
    } finally {
      isPending = false;
    }
  }

  // -----------------------------------------------------------------
  // 2) Optimistic save toggle
  // -----------------------------------------------------------------
  async function toggleSave() {
    if (isPending) return;
    error = '';
    isPending = true;

    const optimistic = !serverSaved;
    displaySaved = optimistic;

    try {
      await fakeServerCall();
      serverSaved = optimistic;
    } catch (e) {
      error = e.message;
      serverSaved = serverSaved; // trigger rollback
    } finally {
      isPending = false;
    }
  }

  // -----------------------------------------------------------------
  // 3) Optimistic comment — add an item immediately, replace with
  //    server-assigned id on success, remove on failure.
  // -----------------------------------------------------------------
  async function postComment() {
    const text = newComment.trim();
    if (!text || isPending) return;
    error = '';
    isPending = true;

    const tempId = nextTempId--;
    const optimisticComment = { id: tempId, author: 'You', text, pending: true };
    displayComments = [...serverComments, optimisticComment];
    newComment = '';

    try {
      await fakeServerCall();
      // Server responds with the real id.
      const realComment = { id: Date.now(), author: 'You', text };
      serverComments = [...serverComments, realComment];
    } catch (e) {
      error = e.message;
      // Rollback: trigger the derived.
      serverComments = serverComments;
    } finally {
      isPending = false;
    }
  }
</script>

<h1>Overriding $derived — Optimistic UI</h1>

<p class="lead">
  Three buttons. Three optimistic updates. Toggle the "fail" switch to see every
  rollback path.
</p>

<div class="demo-card">
  <div class="image-placeholder">Beautiful Sunset</div>

  <div class="actions">
    <button class="like-btn" onclick={handleLike} disabled={isPending}>
      <span class="heart">{displayLikes > serverLikes ? '\u2764' : '\u2661'}</span>
      {displayLikes} likes
    </button>

    <button class="save-btn" onclick={toggleSave} disabled={isPending}>
      {displaySaved ? '\u2605 Saved' : '\u2606 Save'}
    </button>
  </div>

  <div class="comments">
    <h3>Comments</h3>
    <ul>
      {#each displayComments as c (c.id)}
        <li class:pending-row={c.pending}>
          <strong>{c.author}:</strong> {c.text}
          {#if c.pending}<span class="pending-tag">sending...</span>{/if}
        </li>
      {/each}
    </ul>
    <div class="comment-input">
      <input
        bind:value={newComment}
        placeholder="Add a comment..."
        onkeydown={(e) => e.key === 'Enter' && postComment()}
      />
      <button onclick={postComment} disabled={isPending}>Post</button>
    </div>
  </div>

  {#if isPending}
    <p class="pending">Syncing with server...</p>
  {/if}
  {#if error}
    <p class="error">Rolled back: {error}</p>
  {/if}
</div>

<div class="debug">
  <h3>Behind the scenes</h3>
  <table>
    <thead>
      <tr>
        <th>State</th><th>Server truth</th><th>Displayed (derived)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>likes</td>
        <td>{serverLikes}</td>
        <td class:override={displayLikes !== serverLikes}>{displayLikes}</td>
      </tr>
      <tr>
        <td>saved</td>
        <td>{String(serverSaved)}</td>
        <td class:override={displaySaved !== serverSaved}>{String(displaySaved)}</td>
      </tr>
      <tr>
        <td>comment count</td>
        <td>{serverComments.length}</td>
        <td class:override={displayComments.length !== serverComments.length}>{displayComments.length}</td>
      </tr>
    </tbody>
  </table>

  <div class="controls">
    <label class="fail-toggle">
      <input type="checkbox" bind:checked={shouldFail} />
      Simulate server failure
    </label>
    <label>
      Latency: {latency}ms
      <input type="range" min="200" max="3000" step="100" bind:value={latency} />
    </label>
  </div>
</div>

<div class="explanation">
  <h3>How it works</h3>
  <ol>
    <li><code>let displayLikes = $derived(serverLikes)</code> — mirrors the truth by default.</li>
    <li>On click: <code>displayLikes = serverLikes + 1</code> — the override shows instantly.</li>
    <li>On success: <code>serverLikes++</code> — dependency changes, derived recomputes, override gone.</li>
    <li>On failure: <code>serverLikes = serverLikes</code> — nudge the dependency to re-evaluate, override discarded, UI snaps back.</li>
  </ol>
</div>

<div class="warning">
  <strong>When NOT to use optimistic UI:</strong>
  <ul>
    <li>Operations that are irreversible (payments, deletions).</li>
    <li>Operations whose real result the user needs to know (validations, availability checks).</li>
    <li>Anything where being briefly wrong would confuse or mislead the user.</li>
  </ul>
</div>

<style>
  h1 { color: #333; }
  .lead { color: #555; max-width: 720px; }

  .demo-card {
    max-width: 420px;
    border: 1px solid #ddd;
    border-radius: 12px;
    overflow: hidden;
    margin: 1.5rem 0;
    background: white;
  }
  .image-placeholder {
    background: linear-gradient(135deg, #667eea, #764ba2);
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.3rem;
  }
  .actions {
    display: flex;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f0f0f0;
  }
  .actions button {
    background: none;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.95rem;
  }
  .actions button:disabled { opacity: 0.6; cursor: not-allowed; }
  .heart { color: #ef4444; font-size: 1.2em; }
  .like-btn:hover:not(:disabled) { background: #fff5f5; }
  .save-btn:hover:not(:disabled) { background: #fffbeb; }

  .comments { padding: 0.75rem 1rem; }
  .comments h3 { margin: 0 0 0.5rem; font-size: 1rem; }
  .comments ul { list-style: none; padding: 0; margin: 0 0 0.5rem; }
  .comments li {
    padding: 0.3rem 0;
    font-size: 0.9rem;
    border-bottom: 1px solid #f3f4f6;
  }
  .pending-row { opacity: 0.6; font-style: italic; }
  .pending-tag {
    background: #fef3c7;
    color: #92400e;
    font-size: 0.7rem;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    margin-left: 0.4rem;
  }
  .comment-input { display: flex; gap: 0.4rem; margin-top: 0.5rem; }
  .comment-input input {
    flex: 1;
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .comment-input button {
    padding: 0.4rem 0.75rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .pending { padding: 0 1rem 0.5rem; color: #f59e0b; font-size: 0.85rem; margin: 0; }
  .error { padding: 0 1rem 0.75rem; color: #ef4444; font-size: 0.85rem; margin: 0; }

  .debug {
    background: #f5f5f5;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem 0;
  }
  .debug h3 { margin: 0 0 0.5rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.3rem 0.5rem; text-align: left; font-size: 0.85rem; border-bottom: 1px solid #e5e7eb; }
  th { background: #e5e7eb; }
  .override { background: #fef3c7; color: #b45309; font-weight: bold; }

  .controls {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
  }
  .fail-toggle { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; }
  .controls label { font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; }

  .explanation {
    background: #e8f4fd;
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid #61affe;
  }
  .explanation h3 { margin: 0 0 0.5rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  ol { padding-left: 1.2rem; }
  ol li { margin: 0.3rem 0; font-size: 0.9rem; }

  .warning {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 0.75rem 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1rem;
  }
  .warning ul { margin: 0.4rem 0 0; padding-left: 1.2rem; }
  .warning li { font-size: 0.85rem; margin: 0.2rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
