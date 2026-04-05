import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-11',
		title: 'Imperative API: mount, unmount & hydrate',
		phase: 5,
		module: 15,
		lessonIndex: 11
	},
	description: `Most Svelte components are rendered declaratively inside other components. The imperative API gives you an escape hatch when that's not enough: mount() renders a component into a DOM node, unmount() tears it down (awaiting any outro transitions), and hydrate() attaches interactivity to server-rendered HTML.

These three functions replace the legacy new Component({ target, props }) constructor from Svelte 3/4. They're the integration layer between Svelte and the rest of the world — use them to embed Svelte widgets in a React or legacy jQuery app, to build plugin systems with runtime-loaded components, or to bootstrap your root app in both CSR and SSR scenarios. mount() returns an exports object (anything you prefixed with export in the component), so parents can still call imperative methods.`,
	objectives: [
		'Bootstrap apps with mount(App, { target, props })',
		'Attach interactivity to SSR markup with hydrate()',
		'Tear down instances with unmount(), optionally awaiting outros',
		'Pass reactive props from outside Svelte and observe updates',
		'Build a dynamic widget system on top of the imperative API'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import { mount, unmount } from 'svelte';

  // ─────────────────────────────────────────────────────────────
  // The real imperative API signatures:
  //
  //   import App from './App.svelte';
  //   const exports = mount(App, {
  //     target: document.getElementById('root')!,
  //     props: { name: 'world' },
  //     intro: true,          // play intro transitions on mount
  //     events: { click: handler }
  //   });
  //   unmount(exports, { outro: true }); // awaits outro transitions
  //
  //   // SSR hydration:
  //   hydrate(App, { target, props });
  //
  // This demo simulates the DOM side-effects because the playground
  // only runs this one component. The concepts and API shape are
  // identical to the real thing.
  // ─────────────────────────────────────────────────────────────

  interface WidgetInstance {
    id: number;
    kind: 'counter' | 'clock' | 'card';
    element: HTMLElement;
    cleanup: () => void;
    props: Record<string, unknown>;
  }

  let nextId: number = $state(1);
  let instances: WidgetInstance[] = $state([]);
  let targetEl: HTMLDivElement | undefined = $state();
  let logs: string[] = $state([]);

  function log(msg: string): void {
    logs = [\`[\${new Date().toLocaleTimeString()}] \${msg}\`, ...logs].slice(0, 8);
  }

  // Simulated component factories — each returns DOM + teardown
  // In real code these are .svelte components passed to mount()
  function createCounter(target: HTMLElement, props: { label: string }) {
    let count = 0;
    const root = document.createElement('div');
    root.className = 'mounted counter';
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = props.label;
    const display = document.createElement('div');
    display.className = 'display';
    display.textContent = String(count);
    const button = document.createElement('button');
    button.textContent = '+1';
    const onClick = () => { count++; display.textContent = String(count); };
    button.addEventListener('click', onClick);
    root.append(header, display, button);
    target.appendChild(root);
    return {
      element: root,
      cleanup: () => {
        button.removeEventListener('click', onClick);
        root.remove();
      }
    };
  }

  function createClock(target: HTMLElement, props: { title: string }) {
    const root = document.createElement('div');
    root.className = 'mounted clock';
    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = props.title;
    const display = document.createElement('div');
    display.className = 'time';
    const update = () => { display.textContent = new Date().toLocaleTimeString(); };
    update();
    const interval = window.setInterval(update, 1000);
    root.append(header, display);
    target.appendChild(root);
    return {
      element: root,
      cleanup: () => {
        clearInterval(interval);
        root.remove();
      }
    };
  }

  function createCard(target: HTMLElement, props: { title: string; body: string; color: string }) {
    const root = document.createElement('div');
    root.className = 'mounted card';
    root.style.borderColor = props.color;
    const header = document.createElement('div');
    header.className = 'header';
    header.style.background = props.color;
    header.textContent = props.title;
    const body = document.createElement('div');
    body.className = 'body';
    body.textContent = props.body;
    root.append(header, body);
    target.appendChild(root);
    return { element: root, cleanup: () => root.remove() };
  }

  function mountWidget(kind: WidgetInstance['kind']): void {
    if (!targetEl) return;
    const id = nextId++;

    let result: { element: HTMLElement; cleanup: () => void };
    let props: Record<string, unknown>;
    if (kind === 'counter') {
      props = { label: \`Counter #\${id}\` };
      result = createCounter(targetEl, props as { label: string });
    } else if (kind === 'clock') {
      props = { title: \`Clock #\${id}\` };
      result = createClock(targetEl, props as { title: string });
    } else {
      const colors = ['#6c5ce7', '#00b894', '#e17055', '#0984e3', '#fd79a8'];
      props = {
        title: \`Card #\${id}\`,
        body: 'A programmatically mounted Svelte widget.',
        color: colors[id % colors.length]
      };
      result = createCard(targetEl, props as { title: string; body: string; color: string });
    }

    instances = [
      ...instances,
      { id, kind, element: result.element, cleanup: result.cleanup, props }
    ];
    log(\`mount(\${kind}) — instance #\${id} created\`);
  }

  function unmountWidget(id: number): void {
    const inst = instances.find((i) => i.id === id);
    if (!inst) return;
    inst.cleanup();
    instances = instances.filter((i) => i.id !== id);
    log(\`unmount(#\${id}) — outro complete, DOM cleaned\`);
  }

  function unmountAll(): void {
    for (const inst of instances) inst.cleanup();
    const count = instances.length;
    instances = [];
    log(\`unmount all — \${count} instance(s) removed\`);
  }

  // Cleanup any remaining widgets when THIS component unmounts
  $effect(() => {
    return () => {
      for (const inst of instances) inst.cleanup();
    };
  });
</script>

<h1>Imperative API — mount / unmount / hydrate</h1>

<section class="callout">
  <strong>When to reach for this API:</strong> bootstrapping a root Svelte
  app, embedding Svelte widgets inside a non-Svelte host (legacy jQuery,
  React, server-rendered pages), or building a plugin system where
  components are resolved at runtime.
</section>

<section>
  <h2>Live demo</h2>
  <div class="controls">
    <button onclick={() => mountWidget('counter')}>mount(Counter)</button>
    <button onclick={() => mountWidget('clock')}>mount(Clock)</button>
    <button onclick={() => mountWidget('card')}>mount(Card)</button>
    <button class="danger" onclick={unmountAll} disabled={instances.length === 0}>
      unmount all
    </button>
    <span class="count">{instances.length} instance{instances.length === 1 ? '' : 's'}</span>
  </div>

  <div class="target" bind:this={targetEl}>
    {#if instances.length === 0}
      <p class="empty">Target DOM node (empty). Click a button above.</p>
    {/if}
  </div>

  {#if instances.length > 0}
    <div class="instance-list">
      <h3>Mounted instances</h3>
      {#each instances as inst (inst.id)}
        <div class="row">
          <span class="kind">{inst.kind}</span>
          <span class="id">#{inst.id}</span>
          <button class="mini" onclick={() => unmountWidget(inst.id)}>unmount</button>
        </div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>API reference</h2>
  <div class="code-grid">
    <div class="ex">
      <h3>mount()</h3>
      <pre><code>import &#123; mount &#125; from 'svelte';
import App from './App.svelte';

const app = mount(App, &#123;
  target: document.getElementById('root')!,
  props: &#123; name: 'world' &#125;,
  intro: true,
  events: &#123;
    click: (e) =&gt; console.log(e)
  &#125;
&#125;);

// \`app\` contains anything exported
// from &lt;script module&gt; in App.svelte</code></pre>
    </div>

    <div class="ex">
      <h3>unmount()</h3>
      <pre><code>import &#123; unmount &#125; from 'svelte';

// Fire-and-forget:
unmount(app);

// Or await outros:
await unmount(app, &#123; outro: true &#125;);
// outros finish before the DOM is removed</code></pre>
    </div>

    <div class="ex">
      <h3>hydrate()</h3>
      <pre><code>import &#123; hydrate &#125; from 'svelte';
import App from './App.svelte';

// Attach interactivity to SSR markup
const app = hydrate(App, &#123;
  target: document.getElementById('root')!,
  props: JSON.parse(
    document.getElementById('__props')!.textContent!
  )
&#125;);</code></pre>
    </div>

    <div class="ex">
      <h3>Reactive props via $state</h3>
      <pre><code>const props = $state(&#123; count: 0 &#125;);
const app = mount(Counter, &#123;
  target, props
&#125;);

// Parent can still update props after mount:
props.count = 5; // Counter re-renders
</code></pre>
    </div>
  </div>
</section>

<section class="log">
  <h3>Mount log</h3>
  {#if logs.length === 0}
    <p class="empty">(no activity yet)</p>
  {:else}
    {#each logs as entry, i (i)}
      <div class="entry">{entry}</div>
    {/each}
  {/if}
</section>

<section class="use-cases">
  <h2>Common use cases</h2>
  <ul>
    <li><strong>App bootstrap:</strong> every SvelteKit/CSR app calls mount() for its root App.svelte.</li>
    <li><strong>SSR hydration:</strong> hydrate() attaches to the HTML the server already rendered.</li>
    <li><strong>Legacy host migration:</strong> mount Svelte widgets inside jQuery, Angular, or raw-HTML pages.</li>
    <li><strong>Plugin systems:</strong> user-provided components loaded at runtime via dynamic import.</li>
    <li><strong>Modal / overlay portals:</strong> mount into document.body instead of the current tree.</li>
    <li><strong>Testing:</strong> programmatically create and destroy instances in unit tests.</li>
  </ul>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 10px; }
  h2 { margin: 0 0 0.5rem; color: #e17055; font-size: 1.05rem; }
  h3 { margin: 0 0 0.5rem; font-size: 0.88rem; color: #74b9ff; }

  .callout {
    background: #fff8e1; border-left: 3px solid #fdcb6e;
    font-size: 0.88rem; color: #7c5a00; padding: 0.75rem 0.9rem;
  }

  .controls { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.75rem; }
  button {
    padding: 0.5rem 0.9rem; border: none; border-radius: 6px;
    background: #e17055; color: white; cursor: pointer; font-weight: 600; font-size: 0.85rem;
  }
  button:hover:not(:disabled) { background: #d35d47; }
  button:disabled { background: #b2bec3; cursor: not-allowed; }
  button.danger { background: #d63031; }
  .mini { padding: 0.25rem 0.55rem; font-size: 0.75rem; background: #b2bec3; }
  .count { font-size: 0.82rem; color: #636e72; margin-left: 0.4rem; }

  .target {
    min-height: 120px; padding: 0.75rem; border: 2px dashed #dfe6e9;
    border-radius: 8px; background: white; margin-bottom: 0.75rem;
  }
  .empty { color: #b2bec3; text-align: center; margin: 1rem 0; font-style: italic; }

  :global(.mounted) {
    padding: 0; margin-bottom: 0.6rem; border-radius: 8px; overflow: hidden;
    border: 1px solid #dfe6e9;
  }
  :global(.mounted .header) {
    padding: 0.4rem 0.75rem; background: #6c5ce7; color: white;
    font-size: 0.85rem; font-weight: 700;
  }
  :global(.mounted .display) {
    padding: 1rem; text-align: center; font-size: 1.6rem; font-weight: 800; color: #2d3436;
  }
  :global(.mounted button) {
    padding: 0.4rem 0.9rem; margin: 0 0.75rem 0.75rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  :global(.mounted.clock .time) {
    padding: 1rem; text-align: center; font-family: ui-monospace, monospace;
    font-size: 1.4rem; font-weight: 700; color: #0984e3;
  }
  :global(.mounted.card) { border-width: 2px; }
  :global(.mounted.card .header) { background: inherit; }
  :global(.mounted.card .body) { padding: 0.75rem; font-size: 0.85rem; color: #636e72; }

  .instance-list {
    background: white; border: 1px solid #dfe6e9;
    border-radius: 6px; padding: 0.5rem 0.75rem;
  }
  .instance-list h3 { color: #2d3436; margin: 0 0 0.35rem; font-size: 0.85rem; }
  .row {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.35rem 0; border-bottom: 1px solid #f1f3f5;
  }
  .row:last-child { border-bottom: none; }
  .kind { text-transform: uppercase; font-size: 0.68rem; padding: 0.15rem 0.5rem; background: #eef; color: #6c5ce7; border-radius: 4px; font-weight: 700; }
  .id { font-family: ui-monospace, monospace; color: #636e72; font-size: 0.82rem; flex: 1; }

  .code-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .ex { background: #2d3436; color: #dfe6e9; padding: 0.75rem; border-radius: 6px; }
  .ex h3 { color: #74b9ff; }
  .ex pre { margin: 0; }
  .ex code { font-size: 0.75rem; line-height: 1.55; }

  .log { background: #2d3436; color: #dfe6e9; max-height: 170px; overflow: auto; }
  .log h3 { color: #74b9ff; }
  .entry { font-family: ui-monospace, monospace; font-size: 0.76rem; padding: 0.1rem 0; }

  .use-cases ul { padding-left: 1.2rem; margin: 0; }
  .use-cases li { margin-bottom: 0.35rem; color: #636e72; font-size: 0.88rem; }
  .use-cases strong { color: #2d3436; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
