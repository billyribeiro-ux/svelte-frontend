import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-6',
		title: 'Shallow Routing & Snapshots',
		phase: 5,
		module: 17,
		lessonIndex: 6
	},
	description: `Shallow routing lets you update the URL and associate state with it without a full navigation. pushState() and replaceState() create history entries with custom state accessible via $page.state — perfect for modals, drawers, and tab views that should be URL-addressable and back-button friendly. Snapshots preserve ephemeral form state (scroll position, input values) when users navigate away and return using the browser's back button.

Together these APIs let you build sophisticated navigation patterns where URL state and UI state stay perfectly synchronized.`,
	objectives: [
		'Use pushState and replaceState to update URLs without full navigation',
		'Access shallow state via page.state for modal and drawer patterns',
		'Implement snapshot to preserve form data across back/forward navigation',
		'Combine shallow routing with preloading for instant modal content'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Shallow Routing & Snapshots — interactive demo

  // Simulated shallow routing state
  let currentUrl = $state('/gallery');
  let shallowState = $state<Record<string, unknown>>({});
  let historyStack = $state<{ url: string; state: Record<string, unknown> }[]>([
    { url: '/gallery', state: {} }
  ]);
  let historyIndex = $state(0);

  // Simulated gallery items
  const items = [
    { id: 1, title: 'Mountain Sunset', author: 'Alice', description: 'A beautiful sunset over the mountains.' },
    { id: 2, title: 'Ocean Waves', author: 'Bob', description: 'Crashing waves on a rocky coastline.' },
    { id: 3, title: 'City Lights', author: 'Carol', description: 'Downtown skyline at night.' },
    { id: 4, title: 'Forest Trail', author: 'Dave', description: 'A winding path through ancient woods.' }
  ];

  let selectedItem = $derived(
    shallowState.selectedId
      ? items.find(i => i.id === shallowState.selectedId)
      : null
  );

  function simulatePushState(url: string, state: Record<string, unknown>) {
    historyStack = [...historyStack.slice(0, historyIndex + 1), { url, state }];
    historyIndex = historyStack.length - 1;
    currentUrl = url;
    shallowState = state;
  }

  function simulateBack() {
    if (historyIndex > 0) {
      historyIndex--;
      currentUrl = historyStack[historyIndex].url;
      shallowState = historyStack[historyIndex].state;
    }
  }

  function simulateForward() {
    if (historyIndex < historyStack.length - 1) {
      historyIndex++;
      currentUrl = historyStack[historyIndex].url;
      shallowState = historyStack[historyIndex].state;
    }
  }

  function openItem(id: number) {
    simulatePushState(\`/gallery/\${id}\`, { selectedId: id });
  }

  function closeModal() {
    simulatePushState('/gallery', {});
  }

  // Code examples
  const pushStateCode = \`import { pushState } from '$app/navigation';
import { page } from '$app/state';

// Open a modal and update the URL
function openPhoto(photo) {
  pushState(\\\`/gallery/\\\${photo.id}\\\`, {
    selectedPhoto: photo
  });
}

// In the template:
// {#if page.state.selectedPhoto}
//   <Modal onclose={() => history.back()}>
//     <PhotoDetail photo={page.state.selectedPhoto} />
//   </Modal>
// {/if}\`;

  const replaceStateCode = \`import { replaceState } from '$app/navigation';

// Update state without adding a history entry
// Great for tabs, filters, sort order
function selectTab(tab: string) {
  replaceState(\\\`?tab=\\\${tab}\\\`, { activeTab: tab });
}

// Replace is better than push when you don't want
// the user to go "back" through every tab change\`;

  const snapshotCode = \`<!-- +page.svelte -->
<script lang="ts">
  import type { Snapshot } from './$types';

  let formData = $state({ name: '', email: '', message: '' });
  let scrollY = $state(0);

  // Capture state when user navigates away
  export const snapshot: Snapshot<{
    formData: typeof formData;
    scrollY: number;
  }> = {
    capture: () => ({
      formData: { ...formData },
      scrollY: window.scrollY
    }),
    restore: (value) => {
      formData = value.formData;
      // Restore scroll after DOM updates
      requestAnimationFrame(() => {
        window.scrollTo(0, value.scrollY);
      });
    }
  };
<\\/script>

<form>
  <input bind:value={formData.name} placeholder="Name" />
  <input bind:value={formData.email} placeholder="Email" />
  <textarea bind:value={formData.message}></textarea>
</form>

<!-- User types in form → navigates away → presses Back →
     Form is restored with all their data! -->\`;

  let activeTab = $state<'push' | 'replace' | 'snapshot'>('push');

  // Snapshot demo state
  let demoName = $state('');
  let demoEmail = $state('');
  let snapshotSaved = $state(false);
  let snapshotData = $state<{ name: string; email: string } | null>(null);

  function captureSnapshot() {
    snapshotData = { name: demoName, email: demoEmail };
    snapshotSaved = true;
    demoName = '';
    demoEmail = '';
  }

  function restoreSnapshot() {
    if (snapshotData) {
      demoName = snapshotData.name;
      demoEmail = snapshotData.email;
      snapshotSaved = false;
    }
  }
</script>

<main>
  <h1>Shallow Routing & Snapshots</h1>
  <p class="subtitle">URL-addressable modals, back-button-friendly state, form persistence</p>

  <!-- Interactive shallow routing demo -->
  <section>
    <h2>Shallow Routing Demo</h2>
    <div class="browser-chrome">
      <div class="browser-bar">
        <button class="nav-btn" onclick={simulateBack} disabled={historyIndex <= 0}>&larr;</button>
        <button class="nav-btn" onclick={simulateForward} disabled={historyIndex >= historyStack.length - 1}>&rarr;</button>
        <div class="url-bar">{currentUrl}</div>
      </div>
      <div class="browser-content">
        <div class="gallery-grid">
          {#each items as item}
            <button class="gallery-item" onclick={() => openItem(item.id)}>
              <div class="item-thumb">{item.title[0]}</div>
              <span>{item.title}</span>
            </button>
          {/each}
        </div>

        {#if selectedItem}
          <div class="modal-overlay" onclick={closeModal}>
            <div class="modal" onclick={(e) => e.stopPropagation()}>
              <button class="modal-close" onclick={closeModal}>&times;</button>
              <div class="modal-thumb">{selectedItem.title[0]}</div>
              <h3>{selectedItem.title}</h3>
              <p class="modal-author">by {selectedItem.author}</p>
              <p>{selectedItem.description}</p>
              <p class="modal-note">URL updated via pushState — press Back to close</p>
            </div>
          </div>
        {/if}
      </div>
    </div>
    <p class="demo-hint">Click an item to open a modal. Use the back button to close it.</p>
  </section>

  <!-- Snapshot demo -->
  <section>
    <h2>Snapshot Demo</h2>
    <div class="snapshot-demo">
      <div class="snapshot-form">
        <input type="text" bind:value={demoName} placeholder="Type your name..." />
        <input type="email" bind:value={demoEmail} placeholder="Type your email..." />
        <div class="snapshot-actions">
          <button onclick={captureSnapshot} disabled={!demoName && !demoEmail}>
            Simulate Navigate Away (capture)
          </button>
          {#if snapshotSaved}
            <button class="restore-btn" onclick={restoreSnapshot}>
              Simulate Back Button (restore)
            </button>
          {/if}
        </div>
      </div>
      {#if snapshotSaved && snapshotData}
        <div class="snapshot-saved">
          Snapshot saved: {snapshotData.name}, {snapshotData.email}
        </div>
      {/if}
    </div>
  </section>

  <!-- API Reference -->
  <section>
    <h2>API Reference</h2>
    <div class="tabs">
      <button class:active={activeTab === 'push'} onclick={() => activeTab = 'push'}>pushState</button>
      <button class:active={activeTab === 'replace'} onclick={() => activeTab = 'replace'}>replaceState</button>
      <button class:active={activeTab === 'snapshot'} onclick={() => activeTab = 'snapshot'}>snapshot</button>
    </div>
    <pre><code>{activeTab === 'push' ? pushStateCode : activeTab === 'replace' ? replaceStateCode : snapshotCode}</code></pre>
  </section>
</main>

<style>
  main { max-width: 850px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  h1 { text-align: center; color: #333; }
  h2 { color: #555; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
  .subtitle { text-align: center; color: #666; }
  section { margin: 2rem 0; }

  .browser-chrome { border: 2px solid #ccc; border-radius: 10px; overflow: hidden; }
  .browser-bar {
    display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem;
    background: #f0f0f0; border-bottom: 1px solid #ccc;
  }
  .nav-btn { border: 1px solid #ccc; border-radius: 4px; background: white; padding: 0.2rem 0.5rem; cursor: pointer; }
  .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .url-bar {
    flex: 1; padding: 0.3rem 0.6rem; background: white; border: 1px solid #ddd;
    border-radius: 4px; font-family: 'Fira Code', monospace; font-size: 0.85rem; color: #333;
  }
  .browser-content { padding: 1rem; background: white; position: relative; min-height: 200px; }

  .gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
  .gallery-item {
    display: flex; flex-direction: column; align-items: center; gap: 0.4rem;
    padding: 0.75rem; border: 1px solid #ddd; border-radius: 8px; background: #fafafa;
    cursor: pointer; border: none;
  }
  .gallery-item:hover { background: #e3f2fd; }
  .item-thumb {
    width: 50px; height: 50px; border-radius: 8px; background: #1976d2; color: white;
    display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700;
  }
  .gallery-item span { font-size: 0.8rem; color: #555; }

  .modal-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex;
    align-items: center; justify-content: center; z-index: 10;
  }
  .modal {
    background: white; border-radius: 12px; padding: 1.5rem; max-width: 300px; width: 100%;
    position: relative; text-align: center;
  }
  .modal-close { position: absolute; top: 0.5rem; right: 0.75rem; border: none; background: none; font-size: 1.5rem; cursor: pointer; color: #666; }
  .modal-thumb {
    width: 80px; height: 80px; border-radius: 12px; background: #1976d2; color: white;
    display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700;
    margin: 0 auto 1rem;
  }
  .modal h3 { margin: 0 0 0.25rem; }
  .modal-author { color: #888; font-size: 0.85rem; margin: 0 0 0.5rem; }
  .modal-note { font-size: 0.75rem; color: #1976d2; font-style: italic; margin-top: 1rem; }

  .demo-hint { font-size: 0.85rem; color: #888; text-align: center; margin-top: 0.5rem; }

  .snapshot-demo { background: #f8f9fa; padding: 1.5rem; border-radius: 10px; }
  .snapshot-form { display: flex; flex-direction: column; gap: 0.5rem; }
  .snapshot-form input {
    padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 6px; font-size: 0.9rem;
  }
  .snapshot-actions { display: flex; gap: 0.5rem; }
  .snapshot-actions button {
    padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
    background: #1976d2; color: white;
  }
  .snapshot-actions button:disabled { background: #ccc; cursor: not-allowed; }
  .restore-btn { background: #388e3c !important; }
  .snapshot-saved {
    margin-top: 0.75rem; padding: 0.5rem 0.75rem; background: #e8f5e9;
    border-radius: 6px; font-size: 0.85rem; color: #2e7d32;
  }

  .tabs { display: flex; gap: 0.25rem; margin-bottom: 1rem; }
  .tabs button {
    padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 20px;
    background: white; cursor: pointer; font-size: 0.85rem;
  }
  .tabs button.active { background: #1976d2; color: white; border-color: #1976d2; }

  pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; font-size: 0.78rem; overflow-x: auto; }
  code { font-family: 'Fira Code', monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
