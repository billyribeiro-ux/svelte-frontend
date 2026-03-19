import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-6',
		title: 'Shallow Routing & Snapshots',
		phase: 5,
		module: 17,
		lessonIndex: 6
	},
	description: `Shallow routing lets you update the browser URL and store state in the history entry without triggering a full navigation. pushState() and replaceState() from $app/navigation add state to the browser history that you can access via page.state — perfect for opening modals, switching tabs, or showing detail views that should be linkable and support back-button navigation.

Snapshots preserve ephemeral UI state (like form input values, scroll positions, and unsaved text) across navigations. When a user navigates away and comes back, SvelteKit can restore the snapshot, preventing data loss without persisting to the server.`,
	objectives: [
		'Use pushState and replaceState for URL updates without full navigation',
		'Access shallow routing state through page.state in components',
		'Implement snapshots to preserve form data across navigations',
		'Build modal and detail-view patterns with browser history support'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Simulating shallow routing and snapshot concepts

  interface HistoryEntry {
    url: string;
    state: Record<string, unknown>;
    timestamp: string;
  }

  let historyStack: HistoryEntry[] = $state([
    { url: '/gallery', state: {}, timestamp: new Date().toLocaleTimeString() },
  ]);

  let currentState: Record<string, unknown> = $state({});
  let currentUrl: string = $state('/gallery');

  // Simulate pushState
  function pushState(url: string, state: Record<string, unknown>): void {
    historyStack = [...historyStack, {
      url,
      state,
      timestamp: new Date().toLocaleTimeString(),
    }];
    currentUrl = url;
    currentState = state;
  }

  // Simulate replaceState
  function replaceState(url: string, state: Record<string, unknown>): void {
    historyStack = [
      ...historyStack.slice(0, -1),
      { url, state, timestamp: new Date().toLocaleTimeString() },
    ];
    currentUrl = url;
    currentState = state;
  }

  // Simulate back
  function goBack(): void {
    if (historyStack.length > 1) {
      historyStack = historyStack.slice(0, -1);
      const prev = historyStack[historyStack.length - 1];
      currentUrl = prev.url;
      currentState = prev.state;
    }
  }

  // Gallery items for modal demo
  const images = [
    { id: 1, title: 'Mountain Sunrise', color: '#e17055' },
    { id: 2, title: 'Ocean Waves', color: '#0984e3' },
    { id: 3, title: 'Forest Path', color: '#00b894' },
    { id: 4, title: 'City Lights', color: '#6c5ce7' },
    { id: 5, title: 'Desert Dunes', color: '#fdcb6e' },
    { id: 6, title: 'Snowy Peaks', color: '#74b9ff' },
  ];

  let selectedImage = $derived(
    currentState['imageId']
      ? images.find((img) => img.id === currentState['imageId'])
      : null
  );

  function openImage(id: number): void {
    pushState(\`/gallery/\${id}\`, { imageId: id, showModal: true });
  }

  function closeModal(): void {
    goBack();
  }

  // Snapshot simulation
  let formDraft: string = $state('');
  let savedSnapshot: { formDraft: string; scrollY: number } | null = $state(null);

  function saveSnapshot(): void {
    savedSnapshot = { formDraft, scrollY: 0 };
  }

  function restoreSnapshot(): void {
    if (savedSnapshot) {
      formDraft = savedSnapshot.formDraft;
    }
  }
</script>

<h1>Shallow Routing & Snapshots</h1>

<p class="url-bar">
  <span class="url-icon">&#127760;</span>
  <code>{currentUrl}</code>
</p>

<section>
  <h2>Shallow Routing — Gallery Modal</h2>
  <p>Click an image to open it with pushState — the URL updates and back works!</p>

  <div class="gallery">
    {#each images as image (image.id)}
      <button
        class="gallery-item"
        style="background: {image.color}"
        onclick={() => openImage(image.id)}
      >
        <span class="img-title">{image.title}</span>
      </button>
    {/each}
  </div>

  {#if selectedImage && currentState['showModal']}
    <div class="modal-overlay" onclick={closeModal}>
      <div class="modal" onclick={(e) => e.stopPropagation()}>
        <div class="modal-image" style="background: {selectedImage.color}">
          {selectedImage.title}
        </div>
        <div class="modal-info">
          <h3>{selectedImage.title}</h3>
          <p>Image #{selectedImage.id}</p>
          <p class="hint">URL: /gallery/{selectedImage.id}</p>
          <button onclick={closeModal}>Close (or press Back)</button>
        </div>
      </div>
    </div>
  {/if}

  <pre class="code"><code>import &#123; pushState &#125; from '$app/navigation';
import &#123; page &#125; from '$app/state';

function openPhoto(id: number) &#123;
  pushState(\`/gallery/\$&#123;id&#125;\`, &#123; imageId: id &#125;);
&#125;

// Access state:
// page.state.imageId</code></pre>
</section>

<section>
  <h2>History Stack</h2>
  <div class="history">
    {#each historyStack as entry, i}
      <div class="history-entry" class:current={i === historyStack.length - 1}>
        <span class="time">{entry.timestamp}</span>
        <code>{entry.url}</code>
        {#if Object.keys(entry.state).length > 0}
          <span class="state-badge">state: {JSON.stringify(entry.state)}</span>
        {/if}
      </div>
    {/each}
  </div>
  <button onclick={goBack} disabled={historyStack.length <= 1}>Back</button>
</section>

<section>
  <h2>Snapshots — Preserve Form State</h2>
  <p>Type in the field, save a snapshot, clear it, then restore.</p>
  <div class="snapshot-demo">
    <textarea bind:value={formDraft} placeholder="Type your draft here..."></textarea>
    <div class="snapshot-controls">
      <button onclick={saveSnapshot}>Save Snapshot</button>
      <button onclick={() => formDraft = ''}>Clear Field</button>
      <button onclick={restoreSnapshot} disabled={!savedSnapshot}>Restore Snapshot</button>
    </div>
    {#if savedSnapshot}
      <p class="saved">Snapshot saved: "{savedSnapshot.formDraft.slice(0, 40)}..."</p>
    {/if}
  </div>

  <pre class="code"><code>// +page.svelte
export const snapshot = &#123;
  capture: () => &#123;
    return &#123; formDraft, scrollPosition &#125;;
  &#125;,
  restore: (data) => &#123;
    formDraft = data.formDraft;
    window.scrollTo(0, data.scrollPosition);
  &#125;,
&#125;;</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  .url-bar {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.5rem 0.75rem; background: #2d3436; border-radius: 20px;
    margin-bottom: 1.5rem;
  }
  .url-icon { font-size: 1.1rem; }
  .url-bar code { color: #74b9ff; font-size: 0.9rem; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.1rem; }
  .gallery {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem;
    margin-bottom: 1rem;
  }
  .gallery-item {
    aspect-ratio: 1; border: none; border-radius: 8px; cursor: pointer;
    display: flex; align-items: flex-end; padding: 0.5rem;
    transition: transform 0.2s;
  }
  .gallery-item:hover { transform: scale(1.05); }
  .img-title { color: white; font-weight: 600; font-size: 0.8rem; }
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center; z-index: 50;
  }
  .modal {
    background: white; border-radius: 12px; overflow: hidden;
    max-width: 400px; width: 90%;
  }
  .modal-image {
    height: 200px; display: flex; align-items: center; justify-content: center;
    color: white; font-size: 1.5rem; font-weight: 700;
  }
  .modal-info { padding: 1rem; }
  .modal-info h3 { margin-top: 0; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  button:disabled { background: #b2bec3; cursor: not-allowed; }
  .history { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 0.75rem; }
  .history-entry {
    display: flex; gap: 0.5rem; align-items: center; padding: 0.4rem 0.5rem;
    background: white; border-radius: 4px; font-size: 0.85rem;
  }
  .history-entry.current { border-left: 3px solid #6c5ce7; }
  .time { color: #b2bec3; font-size: 0.75rem; }
  .state-badge {
    font-family: monospace; font-size: 0.75rem; padding: 0.1rem 0.4rem;
    background: #dfe6e9; border-radius: 3px;
  }
  .snapshot-demo { margin-bottom: 0.75rem; }
  textarea {
    width: 100%; height: 80px; padding: 0.5rem; border: 1px solid #ddd;
    border-radius: 4px; margin-bottom: 0.5rem; resize: vertical;
    box-sizing: border-box;
  }
  .snapshot-controls { display: flex; gap: 0.5rem; }
  .saved { font-size: 0.85rem; color: #00b894; }
  .hint { font-size: 0.85rem; color: #636e72; }
  .code, pre { background: #2d3436; padding: 0.75rem; border-radius: 6px; overflow-x: auto; margin: 0; }
  code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
