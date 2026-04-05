import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-6',
		title: 'Shallow Routing & Snapshots',
		phase: 5,
		module: 17,
		lessonIndex: 6
	},
	description: `Shallow routing lets you create history entries that do NOT trigger a full navigation. You can open a modal, expand a drawer, or switch a tab and have it become a real back-button destination — without re-running load functions or swapping the page component.

The API is in $app/navigation: pushState(url, state) adds a history entry with an associated state object, replaceState replaces the current one. The state is readable via page.state (from $app/state) and is fully typed if you define it in app.d.ts. If a user shares the URL or refreshes, the server renders the "full" route — so shallow routing is an enhancement, not a shortcut around real routes.

Snapshots solve a different problem: preserving form input, scroll position, or filter state when the user navigates AWAY and then BACK. Export \`snapshot\` from a page or layout with capture() (called before unload) and restore() (called when the user returns). SvelteKit keeps snapshots per-history-entry, so the back button restores exactly what the user had.`,
	objectives: [
		'Use pushState/replaceState from $app/navigation for shallow history entries',
		'Read shallow state with page.state from $app/state',
		'Build a modal dialog that is bookmarkable and back-button-friendly',
		'Export snapshot = { capture, restore } to persist form state',
		'Understand when to use shallow routing vs full navigation',
		'Combine snapshots with data that must survive back navigation'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Simulated shallow routing + snapshots.
  // In a real SvelteKit page:
  //   import { pushState, replaceState } from '$app/navigation';
  //   import { page } from '$app/state';
  //
  //   function openPhoto(id: string) {
  //     pushState(\`?photo=\${id}\`, { selected: id });
  //   }
  //
  //   {#if page.state.selected}
  //     <Modal id={page.state.selected} onclose={() => history.back()} />
  //   {/if}
  // ============================================================

  type HistoryEntry = {
    url: string;
    state: Record<string, unknown>;
  };

  let history: HistoryEntry[] = $state([{ url: '/gallery', state: {} }]);
  let cursor: number = $state(0);
  let current = $derived(history[cursor]);

  function pushState(url: string, state: Record<string, unknown>): void {
    history = [...history.slice(0, cursor + 1), { url, state }];
    cursor = history.length - 1;
  }
  function replaceState(url: string, state: Record<string, unknown>): void {
    history[cursor] = { url, state };
  }
  function back(): void {
    if (cursor > 0) cursor -= 1;
  }
  function forward(): void {
    if (cursor < history.length - 1) cursor += 1;
  }

  // ============================================================
  // Demo 1: photo gallery with shallow modal
  // ============================================================
  type Photo = { id: string; title: string; color: string };
  const photos: Photo[] = [
    { id: 'p1', title: 'Sunset', color: '#fd79a8' },
    { id: 'p2', title: 'Forest', color: '#00b894' },
    { id: 'p3', title: 'Ocean', color: '#0984e3' },
    { id: 'p4', title: 'Mountain', color: '#a29bfe' },
    { id: 'p5', title: 'Desert', color: '#e17055' },
    { id: 'p6', title: 'Sky', color: '#74b9ff' }
  ];

  function openPhoto(photo: Photo): void {
    pushState(\`?photo=\${photo.id}\`, { selectedPhoto: photo.id });
  }

  function closePhoto(): void {
    back();
  }

  let selectedPhoto = $derived(
    photos.find((p) => p.id === current.state.selectedPhoto)
  );

  // ============================================================
  // Demo 2: snapshot for form state
  // ============================================================
  type SnapshotData = {
    email: string;
    bio: string;
    notify: boolean;
  };

  // Per-history-entry snapshots, keyed by cursor index.
  let snapshots: Map<number, SnapshotData> = $state(new Map());

  // Current form state
  let email: string = $state('');
  let bio: string = $state('');
  let notify: boolean = $state(true);
  let onFormPage: boolean = $state(false);

  function enterFormPage(): void {
    onFormPage = true;
    pushState('/settings', { page: 'form' });
    // Restore snapshot if the user is returning
    const snap = snapshots.get(cursor);
    if (snap) {
      email = snap.email;
      bio = snap.bio;
      notify = snap.notify;
    }
  }

  function captureSnapshot(): void {
    snapshots.set(cursor, { email, bio, notify });
    snapshots = new Map(snapshots);
  }

  function leaveFormPage(): void {
    captureSnapshot();
    onFormPage = false;
    back();
  }

  // When the history cursor changes, restore snapshot
  $effect(() => {
    const snap = snapshots.get(cursor);
    if (snap && onFormPage) {
      email = snap.email;
      bio = snap.bio;
      notify = snap.notify;
    }
  });
</script>

<h1>Shallow Routing &amp; Snapshots</h1>

<section>
  <h2>History simulator</h2>
  <div class="history">
    <button onclick={back} disabled={cursor === 0}>&larr; Back</button>
    <button onclick={forward} disabled={cursor === history.length - 1}>
      Forward &rarr;
    </button>
    <div class="url-bar">
      <code>{current.url}</code>
      {#if Object.keys(current.state).length > 0}
        <span class="state-badge">state: {JSON.stringify(current.state)}</span>
      {/if}
    </div>
  </div>
  <div class="history-stack">
    {#each history as entry, i (i)}
      <div class="entry" class:current={i === cursor}>
        <span class="idx">#{i}</span>
        <code>{entry.url}</code>
      </div>
    {/each}
  </div>
</section>

<section>
  <h2>Demo 1: photo gallery with shallow modal</h2>
  <p class="note">
    Clicking a photo calls <code>pushState()</code> — the URL updates
    and the browser adds a history entry, but the underlying gallery
    stays mounted. Close with back button OR the X button.
  </p>

  {#if !onFormPage}
    <div class="gallery">
      {#each photos as photo (photo.id)}
        <button
          class="photo"
          style="background: {photo.color}"
          onclick={() => openPhoto(photo)}
        >
          <span>{photo.title}</span>
        </button>
      {/each}
    </div>
  {/if}

  {#if selectedPhoto}
    <div class="modal-backdrop" onclick={closePhoto} role="presentation">
      <div
        class="modal"
        style="background: {selectedPhoto.color}"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => { if (e.key === 'Escape') closePhoto(); }}
        role="dialog"
        tabindex="-1"
      >
        <button class="close" onclick={closePhoto}>x</button>
        <h3>{selectedPhoto.title}</h3>
        <p class="modal-note">
          URL contains <code>?photo={selectedPhoto.id}</code> —
          shareable and back-button closable.
        </p>
      </div>
    </div>
  {/if}
</section>

<section>
  <h2>Demo 2: snapshot preserves form state</h2>
  <p class="note">
    Type into the form, navigate away with Back, then return — your
    input is restored from the snapshot captured on leave.
  </p>

  {#if !onFormPage}
    <button class="primary" onclick={enterFormPage}>
      Open settings form
    </button>
    {#if snapshots.size > 0}
      <p class="snap-meta">
        {snapshots.size} snapshot(s) stored, one per history entry.
      </p>
    {/if}
  {:else}
    <div class="form">
      <label>
        Email
        <input type="email" bind:value={email} placeholder="you@example.com" />
      </label>
      <label>
        Bio
        <textarea bind:value={bio} rows="3" placeholder="Tell us about yourself..."></textarea>
      </label>
      <label class="checkbox">
        <input type="checkbox" bind:checked={notify} />
        Email notifications
      </label>
      <div class="form-actions">
        <button onclick={leaveFormPage}>&larr; Back (capture snapshot)</button>
        <button class="primary" onclick={captureSnapshot}>Save snapshot now</button>
      </div>
    </div>
  {/if}
</section>

<section>
  <h2>Real code</h2>
  <pre class="code"><code>{\`// +page.svelte — shallow modal
<script lang="ts">
  import { pushState } from '$app/navigation';
  import { page } from '$app/state';

  function open(id: string) {
    pushState(\\\`?photo=\\\${id}\\\`, { selected: id });
  }
</script>

{#each photos as photo}
  <button onclick={() => open(photo.id)}>{photo.title}</button>
{/each}

{#if page.state.selected}
  <Modal
    id={page.state.selected}
    onclose={() => history.back()}
  />
{/if}

// app.d.ts — type page.state
declare global {
  namespace App {
    interface PageState {
      selected?: string;
    }
  }
}

// +page.svelte — snapshots
<script lang="ts">
  import type { Snapshot } from './$types';

  let form = $state({ email: '', bio: '' });

  export const snapshot: Snapshot<typeof form> = {
    capture: () => form,
    restore: (value) => { form = value; }
  };
</script>

// SvelteKit persists the snapshot in sessionStorage keyed by
// the history entry, so back/forward navigation restores it.
\`}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #e84393; font-size: 1.05rem; }
  .note { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem; }
  .note code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  .history {
    display: flex; gap: 0.5rem; align-items: center;
    margin-bottom: 0.5rem;
  }
  .history button {
    padding: 0.3rem 0.75rem; border: none; border-radius: 4px;
    background: #2d3436; color: white; cursor: pointer;
    font-weight: 600; font-size: 0.8rem;
  }
  .history button:disabled { opacity: 0.3; cursor: not-allowed; }
  .url-bar {
    flex: 1; padding: 0.4rem 0.75rem; background: #2d3436;
    border-radius: 4px; display: flex; align-items: center; gap: 0.5rem;
  }
  .url-bar code { color: #74b9ff; font-size: 0.85rem; font-family: monospace; }
  .state-badge {
    margin-left: auto; color: #55efc4; font-size: 0.7rem;
    font-family: monospace;
  }
  .history-stack {
    display: flex; gap: 0.25rem; flex-wrap: wrap;
    padding: 0.5rem; background: white; border-radius: 4px;
    border: 1px solid #dfe6e9;
  }
  .entry {
    display: flex; align-items: center; gap: 0.3rem;
    padding: 0.2rem 0.5rem; background: #dfe6e9;
    border-radius: 3px; font-size: 0.75rem;
  }
  .entry.current { background: #e84393; color: white; }
  .entry code { font-family: monospace; font-size: 0.7rem; }
  .idx { font-weight: 700; opacity: 0.7; }
  .gallery {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;
  }
  .photo {
    aspect-ratio: 1; border: none; border-radius: 6px;
    color: white; font-weight: 700; cursor: pointer;
    font-size: 0.9rem; transition: transform 0.15s;
  }
  .photo:hover { transform: scale(1.03); }
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }
  .modal {
    position: relative; padding: 2rem; border-radius: 12px;
    color: white; min-width: 320px; text-align: center;
  }
  .modal h3 { margin: 0; font-size: 1.5rem; }
  .modal-note {
    margin: 0.5rem 0 0; font-size: 0.8rem; opacity: 0.9;
  }
  .modal-note code {
    background: rgba(0,0,0,0.3); padding: 0.1rem 0.3rem;
    border-radius: 3px;
  }
  .close {
    position: absolute; top: 0.5rem; right: 0.5rem;
    background: rgba(0,0,0,0.3); color: white; border: none;
    width: 28px; height: 28px; border-radius: 50%;
    cursor: pointer; font-weight: 700;
  }
  .primary {
    padding: 0.5rem 1rem; background: #e84393; color: white;
    border: none; border-radius: 4px; cursor: pointer; font-weight: 600;
  }
  .snap-meta { margin: 0.5rem 0 0; font-size: 0.8rem; color: #636e72; }
  .form {
    display: flex; flex-direction: column; gap: 0.75rem;
    background: white; padding: 1rem; border-radius: 6px;
    border: 1px solid #dfe6e9; max-width: 400px;
  }
  .form label {
    display: flex; flex-direction: column; gap: 0.25rem;
    font-size: 0.85rem; font-weight: 600; color: #2d3436;
  }
  .form input, .form textarea {
    padding: 0.5rem; border: 1px solid #dfe6e9;
    border-radius: 4px; font: inherit;
  }
  .form .checkbox {
    flex-direction: row; align-items: center; gap: 0.4rem;
    font-weight: normal;
  }
  .form-actions { display: flex; gap: 0.5rem; }
  .form-actions button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #636e72; color: white; cursor: pointer;
    font-weight: 600; font-size: 0.85rem;
  }
  .form-actions .primary { background: #e84393; }
  .code {
    padding: 1rem; background: #2d3436; border-radius: 6px;
    overflow-x: auto; margin: 0;
  }
  .code code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; font-family: monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
