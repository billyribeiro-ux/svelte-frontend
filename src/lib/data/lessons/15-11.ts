import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-11',
		title: 'Imperative API: mount, unmount & hydrate',
		phase: 5,
		module: 15,
		lessonIndex: 11
	},
	description: `While Svelte components are typically rendered declaratively inside other components, the imperative API lets you create and manage components programmatically. The mount() function renders a component into a target DOM element, unmount() removes it, and hydrate() attaches interactivity to server-rendered HTML.

These functions are essential for integrating Svelte components into non-Svelte applications, creating dynamic component instances at runtime, building widget systems, or gradually migrating a legacy app to Svelte. They replace the legacy new Component() constructor pattern from Svelte 4.`,
	objectives: [
		'Use mount() to programmatically render Svelte components into DOM elements',
		'Clean up mounted components with unmount()',
		'Understand hydrate() for attaching interactivity to SSR markup',
		'Integrate Svelte components into non-Svelte host applications'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import { mount, unmount } from 'svelte';

  let targetContainer: HTMLDivElement | undefined = $state();
  let mountedInstances: { id: number; cleanup: Record<string, any> }[] = $state([]);
  let nextId: number = $state(1);
  let mountCount: number = $derived(mountedInstances.length);

  // A simple inline component definition for demonstration
  // In real usage, you'd import a .svelte component
  function createWidgetComponent() {
    // This demonstrates the concept — in practice you'd do:
    // import Widget from './Widget.svelte';
    // const instance = mount(Widget, { target, props: { ... } });
    return {
      id: nextId++,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      label: \`Widget \${nextId - 1}\`,
      createdAt: new Date().toLocaleTimeString(),
    };
  }

  function mountWidget(): void {
    if (!targetContainer) return;

    const widget = createWidgetComponent();

    // Create a DOM element for this widget
    const el = document.createElement('div');
    el.className = 'widget';
    el.style.borderColor = widget.color;
    el.innerHTML = \`
      <div class="widget-header" style="background: \${widget.color}">
        <strong>\${widget.label}</strong>
        <span>\${widget.createdAt}</span>
      </div>
      <div class="widget-body">
        <p>Programmatically mounted component</p>
        <p>ID: \${widget.id}</p>
      </div>
    \`;
    targetContainer.appendChild(el);

    mountedInstances = [...mountedInstances, { id: widget.id, cleanup: { el } }];
  }

  function unmountWidget(id: number): void {
    const instance = mountedInstances.find((m) => m.id === id);
    if (instance && instance.cleanup.el) {
      // In real usage: unmount(instance.component)
      instance.cleanup.el.remove();
      mountedInstances = mountedInstances.filter((m) => m.id !== id);
    }
  }

  function unmountAll(): void {
    for (const instance of mountedInstances) {
      if (instance.cleanup.el) {
        instance.cleanup.el.remove();
      }
    }
    mountedInstances = [];
  }
</script>

<h1>Imperative Component API</h1>

<section>
  <h2>Programmatic mount() & unmount()</h2>
  <div class="controls">
    <button onclick={mountWidget}>Mount Widget</button>
    <button onclick={unmountAll} disabled={mountCount === 0}>Unmount All</button>
    <span class="count">{mountCount} mounted</span>
  </div>

  <div class="target-area" bind:this={targetContainer}>
    {#if mountCount === 0}
      <p class="placeholder">No widgets mounted. Click "Mount Widget" to add one.</p>
    {/if}
  </div>

  {#if mountedInstances.length > 0}
    <div class="instance-list">
      <h3>Mounted Instances</h3>
      {#each mountedInstances as instance (instance.id)}
        <div class="instance-row">
          <span>Widget {instance.id}</span>
          <button class="small" onclick={() => unmountWidget(instance.id)}>Unmount</button>
        </div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>API Reference</h2>
  <div class="code-examples">
    <div class="example">
      <h3>mount()</h3>
      <pre><code>import &#123; mount &#125; from 'svelte';
import App from './App.svelte';

const app = mount(App, &#123;
  target: document.getElementById('app')!,
  props: &#123; name: 'world' &#125;,
&#125;);</code></pre>
    </div>

    <div class="example">
      <h3>unmount()</h3>
      <pre><code>import &#123; unmount &#125; from 'svelte';

// Clean up the component
unmount(app);</code></pre>
    </div>

    <div class="example">
      <h3>hydrate()</h3>
      <pre><code>import &#123; hydrate &#125; from 'svelte';
import App from './App.svelte';

// Attach to server-rendered HTML
const app = hydrate(App, &#123;
  target: document.getElementById('app')!,
  props: &#123; name: 'world' &#125;,
&#125;);</code></pre>
    </div>
  </div>
</section>

<section>
  <h2>Common Use Cases</h2>
  <ul class="use-cases">
    <li><strong>Legacy migration:</strong> Mount Svelte widgets inside jQuery/Angular/React apps</li>
    <li><strong>Dynamic rendering:</strong> Create components based on runtime configuration</li>
    <li><strong>Widget systems:</strong> Mount/unmount dashboard panels on user action</li>
    <li><strong>Testing:</strong> Programmatically create component instances for unit tests</li>
  </ul>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #e17055; font-size: 1.1rem; }
  h3 { margin: 0 0 0.5rem; font-size: 0.95rem; }
  .controls { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
  .count { font-size: 0.85rem; color: #636e72; margin-left: 0.5rem; }
  button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #e17055; color: white; cursor: pointer; font-weight: 600;
  }
  button:hover { background: #d35d47; }
  button:disabled { background: #b2bec3; cursor: not-allowed; }
  .small { padding: 0.25rem 0.6rem; font-size: 0.8rem; }
  .target-area {
    min-height: 100px; border: 2px dashed #dfe6e9; border-radius: 8px;
    padding: 0.75rem; margin-bottom: 1rem;
  }
  .placeholder { color: #b2bec3; text-align: center; margin: 2rem 0; }
  :global(.widget) {
    border: 2px solid; border-radius: 6px; margin-bottom: 0.5rem;
    overflow: hidden;
  }
  :global(.widget-header) {
    padding: 0.5rem 0.75rem; color: white; display: flex;
    justify-content: space-between; font-size: 0.9rem;
  }
  :global(.widget-body) { padding: 0.5rem 0.75rem; font-size: 0.85rem; }
  :global(.widget-body p) { margin: 0.2rem 0; color: #636e72; }
  .instance-list { border-top: 1px solid #dfe6e9; padding-top: 0.75rem; }
  .instance-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.4rem 0; border-bottom: 1px solid #eee;
  }
  .code-examples { display: grid; gap: 1rem; }
  .example {
    background: #2d3436; color: #dfe6e9; padding: 1rem; border-radius: 6px;
  }
  .example h3 { color: #74b9ff; }
  pre { margin: 0; overflow-x: auto; }
  code { font-size: 0.8rem; line-height: 1.5; }
  .use-cases { padding-left: 1.5rem; }
  .use-cases li { margin-bottom: 0.5rem; color: #636e72; }
  .use-cases strong { color: #2d3436; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
