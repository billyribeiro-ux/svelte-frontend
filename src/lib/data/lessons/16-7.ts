import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-7',
		title: 'Dynamic import() & Code Splitting',
		phase: 5,
		module: 16,
		lessonIndex: 7
	},
	description: `Dynamic import() is the JavaScript mechanism that powers code splitting. Unlike a static import at the top of a module, import('path') returns a Promise and is evaluated at runtime — which means the bundler can split the imported module into a separate chunk that only loads when needed.

In Svelte 5 and SvelteKit, this pattern is everywhere: route-level splitting is automatic, but you can add component-level splitting for heavy features (charts, rich editors, admin panels) that only a fraction of users need. Combined with the {#await} block, dynamic imports make lazy loading ergonomic: show a spinner during the fetch, render the component when it resolves.

This lesson builds a mock "feature loader" that dynamically imports components on demand, visualizes the chunks being loaded, and shows the real-world import() syntax for SvelteKit routes, components, and libraries.`,
	objectives: [
		'Understand how dynamic import() enables code splitting',
		'Load Svelte components lazily with await import() and <svelte:component>',
		'Use {#await} blocks to render pending, resolved, and error states',
		'Preload chunks proactively on hover/focus for perceived performance',
		'Recognize route-based vs component-based splitting in SvelteKit'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import type { Component } from 'svelte';

  // ============================================================
  // Simulated module registry.
  // In a real app, each "module" would be a .svelte file imported
  // dynamically with: const mod = await import('./Heavy.svelte');
  // ============================================================
  type Feature = {
    id: string;
    name: string;
    size: string;
    description: string;
    loadMs: number;
  };

  const features: Feature[] = [
    { id: 'chart',    name: 'Chart Dashboard', size: '94 KB',  description: 'D3-powered analytics charts', loadMs: 800 },
    { id: 'editor',   name: 'Rich Text Editor', size: '132 KB', description: 'WYSIWYG with markdown export', loadMs: 1100 },
    { id: 'map',      name: 'Interactive Map',  size: '210 KB', description: 'Leaflet + geo tiles', loadMs: 1400 },
    { id: 'calendar', name: 'Calendar Grid',    size: '56 KB',  description: 'Month/week views with DnD', loadMs: 600 },
    { id: 'video',    name: 'Video Player',     size: '78 KB',  description: 'HLS streaming with controls', loadMs: 700 }
  ];

  // Mock loader — replace with \`await import('./features/chart.svelte')\`
  // in real code. Returns a pretend "component" object.
  async function loadFeature(id: string): Promise<{ default: { id: string; name: string } }> {
    const feature = features.find((f) => f.id === id)!;
    loadedChunks.add(id);
    loadedChunks = new Set(loadedChunks);
    await new Promise((r) => setTimeout(r, feature.loadMs));
    if (Math.random() < 0.05) throw new Error('Network error');
    return { default: { id: feature.id, name: feature.name } };
  }

  // Prime cache on hover — same promise is re-used on click
  const cache: Map<string, Promise<{ default: { id: string; name: string } }>> = new Map();
  function preload(id: string): void {
    if (!cache.has(id)) cache.set(id, loadFeature(id));
  }
  function load(id: string): Promise<{ default: { id: string; name: string } }> {
    preload(id);
    return cache.get(id)!;
  }

  let activeId: string | null = $state(null);
  let loadedChunks: Set<string> = $state(new Set());
  let activePromise: Promise<{ default: { id: string; name: string } }> | null = $state(null);

  function activate(id: string): void {
    activeId = id;
    activePromise = load(id);
  }

  function reset(): void {
    activeId = null;
    activePromise = null;
    cache.clear();
    loadedChunks = new Set();
  }
</script>

<h1>Dynamic import() &amp; Code Splitting</h1>

<section>
  <h2>Lazy feature loader</h2>
  <p class="note">
    Each feature is a separate chunk. Hover a card to <strong>preload</strong>,
    click to <strong>activate</strong>. Only loaded chunks show in the bundle
    panel on the right — simulating how Vite splits your app.
  </p>

  <div class="layout">
    <div class="grid">
      {#each features as feature (feature.id)}
        <button
          class="feature-card"
          class:active={activeId === feature.id}
          class:loaded={loadedChunks.has(feature.id)}
          onpointerenter={() => preload(feature.id)}
          onfocus={() => preload(feature.id)}
          onclick={() => activate(feature.id)}
        >
          <div class="feature-header">
            <strong>{feature.name}</strong>
            <span class="size">{feature.size}</span>
          </div>
          <p class="desc">{feature.description}</p>
          {#if loadedChunks.has(feature.id)}
            <span class="chip loaded-chip">cached</span>
          {:else}
            <span class="chip">not loaded</span>
          {/if}
        </button>
      {/each}
    </div>

    <aside class="bundle">
      <h3>Bundle status</h3>
      <div class="bundle-group">
        <div class="bundle-label">Initial (main.js)</div>
        <div class="bundle-bar initial"></div>
        <div class="bundle-meta">32 KB — always loaded</div>
      </div>
      {#each features as feature (feature.id)}
        <div class="bundle-group">
          <div class="bundle-label">{feature.name}</div>
          <div
            class="bundle-bar"
            class:loaded={loadedChunks.has(feature.id)}
          ></div>
          <div class="bundle-meta">
            {feature.size} —
            {loadedChunks.has(feature.id) ? 'fetched' : 'pending'}
          </div>
        </div>
      {/each}
      <button class="reset" onclick={reset}>Reset all</button>
    </aside>
  </div>
</section>

<section>
  <h2>Active feature — loaded with {'{#await}'} block</h2>
  {#if activePromise}
    {#await activePromise}
      <div class="state pending">
        <div class="spinner"></div>
        Loading chunk...
      </div>
    {:then mod}
      <div class="state resolved">
        <strong>{mod.default.name}</strong> is mounted.
        <p>In real code this is where &lt;svelte:component this={'{Component}'} /&gt; renders.</p>
      </div>
    {:catch err}
      <div class="state error">
        Failed to load: {err.message}
        <button onclick={() => activeId && activate(activeId)}>Retry</button>
      </div>
    {/await}
  {:else}
    <div class="state idle">Pick a feature above to lazy-load it.</div>
  {/if}
</section>

<section>
  <h2>Real-world patterns</h2>
  <pre class="code"><code>{\`// 1. Lazy component in Svelte
let Comp: Component | null = $state(null);

async function loadEditor() {
  const mod = await import('./RichEditor.svelte');
  Comp = mod.default;
}

{#if Comp}
  <Comp />
{/if}

// 2. Route-level (SvelteKit does this automatically).
// Every +page.svelte is its own chunk.

// 3. Preload on intent — hover or focus
<a
  href="/editor"
  onmouseenter={() => import('./routes/editor/+page.svelte')}
>
  Open editor
</a>

// 4. Conditional heavy dependency
if (user.isAdmin) {
  const { AdminPanel } = await import('./admin-panel.ts');
  AdminPanel.mount(el);
}

// 5. SvelteKit data-driven preloadCode/preloadData
import { preloadCode, preloadData } from '$app/navigation';
preloadCode('/dashboard');    // JS chunks
preloadData('/dashboard');    // + runs the load fn
\`}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section {
    margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa;
    border-radius: 8px;
  }
  h2 { margin-top: 0; color: #00b894; font-size: 1.05rem; }
  h3 {
    margin-top: 0; color: #2d3436; font-size: 0.9rem;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .note { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem 0; }
  .layout {
    display: grid; grid-template-columns: 1fr 260px; gap: 1rem;
  }
  .grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;
    align-content: start;
  }
  .feature-card {
    text-align: left; padding: 0.75rem; background: white;
    border: 2px solid #dfe6e9; border-radius: 6px; cursor: pointer;
    transition: all 0.15s; font: inherit; color: inherit;
  }
  .feature-card:hover { border-color: #74b9ff; transform: translateY(-1px); }
  .feature-card.active { border-color: #00b894; background: #e6fffa; }
  .feature-card.loaded { background: #f0fff4; }
  .feature-header {
    display: flex; justify-content: space-between;
    align-items: center; margin-bottom: 0.25rem;
  }
  .size {
    font-size: 0.75rem; color: #b2bec3; font-family: monospace;
  }
  .desc { margin: 0; font-size: 0.8rem; color: #636e72; }
  .chip {
    display: inline-block; margin-top: 0.5rem; padding: 0.1rem 0.4rem;
    background: #dfe6e9; color: #636e72; border-radius: 10px;
    font-size: 0.7rem; font-weight: 600;
  }
  .chip.loaded-chip { background: #00b894; color: white; }
  .bundle {
    padding: 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .bundle-group { margin-bottom: 0.5rem; }
  .bundle-label { font-size: 0.75rem; font-weight: 600; color: #2d3436; }
  .bundle-bar {
    height: 6px; background: #dfe6e9; border-radius: 3px;
    margin: 0.15rem 0; transition: background 0.3s;
  }
  .bundle-bar.initial { background: #6c5ce7; }
  .bundle-bar.loaded { background: #00b894; }
  .bundle-meta { font-size: 0.65rem; color: #b2bec3; }
  .reset {
    margin-top: 0.5rem; width: 100%;
    padding: 0.4rem; border: none; border-radius: 4px;
    background: #636e72; color: white; cursor: pointer;
    font-size: 0.75rem; font-weight: 600;
  }
  .state {
    padding: 1rem; border-radius: 6px; text-align: center;
    font-size: 0.9rem;
  }
  .state.idle { background: #dfe6e9; color: #636e72; }
  .state.pending {
    background: #fffbea; color: #b8860b;
    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  }
  .state.resolved { background: #e6fffa; color: #00695c; }
  .state.resolved p {
    font-size: 0.8rem; color: #636e72; margin: 0.25rem 0 0;
  }
  .state.error {
    background: #fff5f5; color: #c0392b;
  }
  .state.error button {
    margin-left: 0.5rem; padding: 0.2rem 0.5rem;
    background: #c0392b; color: white; border: none;
    border-radius: 4px; cursor: pointer; font-size: 0.8rem;
  }
  .spinner {
    width: 16px; height: 16px; border: 2px solid #dfe6e9;
    border-top-color: #f39c12; border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .code {
    padding: 1rem; background: #2d3436; border-radius: 6px;
    overflow-x: auto; margin: 0;
  }
  .code code {
    color: #dfe6e9; font-size: 0.8rem; line-height: 1.5;
    font-family: monospace;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
