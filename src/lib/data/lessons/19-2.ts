import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-2',
		title: 'Styling: Variants, :global() & Component Props',
		phase: 7,
		module: 19,
		lessonIndex: 2
	},
	description: `Svelte's scoped styles handle most cases, but sometimes you need escape hatches. data-variant attributes provide a clean, typed variant API that maps directly to CSS attribute selectors. :global() selectively escapes scoping when you need to style children that come from another component or a third-party library. CSS custom properties let parents configure children without breaking encapsulation. And @container queries make components responsive to their container — not the viewport — so a card behaves the same way whether it lives in a sidebar or a full-width hero.

Together these four tools cover 95% of real styling needs while keeping styles scoped and predictable.`,
	objectives: [
		'Implement component variants using data-* attributes and attribute selectors',
		'Use :global() to target deeply nested or third-party content safely',
		'Expose component styling APIs via CSS custom properties',
		'Make components responsive with @container queries',
		'Combine all four patterns into a single production-ready component API'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type Size = 'sm' | 'md' | 'lg';
  type Tab = 'variants' | 'global' | 'props' | 'container';

  let activeTab = $state<Tab>('variants');

  // Builder state for the live variant explorer
  let currentVariant = $state<Variant>('primary');
  let currentSize = $state<Size>('md');
  let rounded = $state(false);
  let fullWidth = $state(false);

  // CSS custom property controls
  let btnHue = $state(250);
  let btnRadius = $state(8);
  let btnPaddingX = $state(1.25);

  // @container width simulator
  let containerWidth = $state(480);

  const variantCode = \`<!-- Button.svelte — data-variant pattern -->
<script lang="ts">
  type Props = {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    rounded?: boolean;
    fullWidth?: boolean;
    children: import('svelte').Snippet;
  };
  let {
    variant = 'primary',
    size = 'md',
    rounded = false,
    fullWidth = false,
    children
  }: Props = $props();
<\\/script>

<button
  data-variant={variant}
  data-size={size}
  class:rounded
  class:full-width={fullWidth}
>
  {@render children()}
</button>

<style>
  button {
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background 150ms, transform 100ms;
  }

  button[data-size='sm'] { padding: 0.25rem 0.75rem; font-size: 0.8rem; }
  button[data-size='md'] { padding: 0.5rem 1.25rem; font-size: 0.95rem; }
  button[data-size='lg'] { padding: 0.75rem 1.75rem; font-size: 1.1rem; }

  button[data-variant='primary'] {
    background: var(--color-primary);
    color: white;
  }
  button[data-variant='secondary'] {
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
  }
  button[data-variant='ghost'] {
    background: transparent;
    color: var(--color-primary);
  }
  button[data-variant='danger'] {
    background: var(--color-danger);
    color: white;
  }

  .rounded { border-radius: 999px; }
  .full-width { width: 100%; }

  button:hover { transform: translateY(-1px); }
</style>\`;

  const globalCode = \`<!-- RichText.svelte — :global() for child HTML -->
<div class="prose">
  {@html rendered}
</div>

<style>
  .prose :global(h2) {
    font-size: 1.5rem;
    margin-top: 2rem;
  }
  .prose :global(p) {
    line-height: 1.7;
    margin: 1rem 0;
  }
  .prose :global(code) {
    background: var(--color-surface);
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
  }
  .prose :global(a:hover) { text-decoration: underline; }

  /* BAD — unscoped :global leaks everywhere
  :global(h2) { color: red; }
  */
</style>\`;

  const propsCode = \`<!-- Parent.svelte — configure child via CSS custom properties -->
<script lang="ts">
  import Button from './Button.svelte';
<\\/script>

<Button style="--btn-hue: 150; --btn-radius: 999px;">
  Configured child
</Button>

<div class="brand">
  <Button>Inherits brand vars</Button>
  <Button variant="ghost">Second button</Button>
</div>

<style>
  .brand {
    --btn-hue: 320;
    --btn-radius: 4px;
    --btn-padding-x: 2rem;
  }
</style>

<!-- Button.svelte reads them -->
<style>
  button {
    background: oklch(0.55 0.2 var(--btn-hue, 250));
    border-radius: var(--btn-radius, 8px);
    padding-inline: var(--btn-padding-x, 1.25rem);
  }
</style>\`;

  const containerCode = \`<!-- Card.svelte — container queries -->
<div class="card-wrapper">
  <article class="card">
    <img src={cover} alt="" />
    <div class="body">
      <h3>{title}</h3>
      <p>{summary}</p>
    </div>
  </article>
</div>

<style>
  .card-wrapper {
    container-type: inline-size;
    container-name: card;
  }

  .card { display: grid; gap: 1rem; padding: 1rem; }

  @container card (max-width: 400px) {
    .card { grid-template-columns: 1fr; }
    .card img { aspect-ratio: 16/9; }
  }

  @container card (min-width: 401px) {
    .card { grid-template-columns: 200px 1fr; }
    .card img { height: 100%; object-fit: cover; }
  }
</style>\`;
</script>

<main>
  <h1>Styling: Variants, :global() & Component Props</h1>
  <p class="subtitle">Four escape hatches for scoped styles</p>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'variants'} onclick={() => (activeTab = 'variants')}>Variants</button>
    <button class:active={activeTab === 'global'} onclick={() => (activeTab = 'global')}>:global()</button>
    <button class:active={activeTab === 'props'} onclick={() => (activeTab = 'props')}>CSS Props</button>
    <button class:active={activeTab === 'container'} onclick={() => (activeTab = 'container')}>@container</button>
  </nav>

  {#if activeTab === 'variants'}
    <section>
      <h2>data-variant Builder</h2>
      <div class="builder">
        <div class="builder-controls">
          <label>
            Variant
            <select bind:value={currentVariant}>
              <option value="primary">primary</option>
              <option value="secondary">secondary</option>
              <option value="ghost">ghost</option>
              <option value="danger">danger</option>
            </select>
          </label>
          <label>
            Size
            <select bind:value={currentSize}>
              <option value="sm">sm</option>
              <option value="md">md</option>
              <option value="lg">lg</option>
            </select>
          </label>
          <label><input type="checkbox" bind:checked={rounded} /> Rounded</label>
          <label><input type="checkbox" bind:checked={fullWidth} /> Full width</label>
        </div>
        <div class="builder-preview">
          <button
            class="demo-btn"
            data-variant={currentVariant}
            data-size={currentSize}
            class:rounded
            class:full-width={fullWidth}
          >
            Button Label
          </button>
          <pre class="snippet"><code>&lt;Button
  variant="{currentVariant}"
  size="{currentSize}"
  rounded={String(rounded)}
  fullWidth={String(fullWidth)}
&gt;Label&lt;/Button&gt;</code></pre>
        </div>
      </div>

      <h3>Component Source</h3>
      <pre><code>{variantCode}</code></pre>
    </section>
  {:else if activeTab === 'global'}
    <section>
      <h2>:global() Escape Hatch</h2>
      <p>
        Scoped styles only match elements rendered by <em>this</em> component. <code>:global()</code>
        lets a selector pierce that boundary — but stays scoped to the parent selector it sits inside.
      </p>
      <pre><code>{globalCode}</code></pre>
      <div class="rule">
        <strong>Rule of thumb:</strong> always nest <code>:global()</code> under a local class.
        A bare <code>:global(h2) {'{}'}</code> leaks across the whole app.
      </div>

      <h3>Live rendered prose</h3>
      <div class="prose-demo">
        <h2>A generated heading</h2>
        <p>This paragraph was produced by <code>{'{@html}'}</code> and styled with <code>.prose :global(p)</code>.</p>
        <p>Inline <code>code</code> and links are themed too.</p>
      </div>
    </section>
  {:else if activeTab === 'props'}
    <section>
      <h2>CSS Custom Properties as a Public API</h2>
      <p>Expose styling knobs as custom properties. Parents override them without ever touching scoped CSS.</p>

      <div class="prop-builder">
        <div class="prop-controls">
          <label>Hue <input type="range" min="0" max="360" bind:value={btnHue} /> {btnHue}</label>
          <label>Radius <input type="range" min="0" max="24" bind:value={btnRadius} /> {btnRadius}px</label>
          <label>Padding X <input type="range" min="0.5" max="3" step="0.05" bind:value={btnPaddingX} /> {btnPaddingX.toFixed(2)}rem</label>
        </div>
        <div
          class="prop-preview"
          style="--btn-hue: {btnHue}; --btn-radius: {btnRadius}px; --btn-padding-x: {btnPaddingX}rem"
        >
          <button class="prop-btn">Themed</button>
          <button class="prop-btn alt">Second</button>
        </div>
      </div>

      <pre><code>{propsCode}</code></pre>
    </section>
  {:else}
    <section>
      <h2>@container Queries</h2>
      <p>A component's layout should depend on <em>its own</em> width — not the viewport.</p>

      <label class="cq-slider">
        Container width: {containerWidth}px
        <input type="range" min="260" max="900" bind:value={containerWidth} />
      </label>

      <div class="cq-frame" style="width: {containerWidth}px; max-width: 100%;">
        <div class="cq-card">
          <div class="cq-cover"></div>
          <div class="cq-body">
            <h3>Responsive Card</h3>
            <p>This layout reflows at the 400px container boundary, independent of the viewport.</p>
          </div>
        </div>
      </div>

      <pre><code>{containerCode}</code></pre>
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }
  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .tabs {
    display: flex;
    gap: 0.35rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #e0e0e0;
  }
  .tabs button {
    padding: 0.55rem 1rem;
    border: none;
    background: transparent;
    border-radius: 6px 6px 0 0;
    font-weight: 500;
    cursor: pointer;
  }
  .tabs button.active { background: #eef4fb; color: #1e40af; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }

  .builder {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 10px;
    margin-bottom: 1rem;
  }
  @media (max-width: 700px) { .builder { grid-template-columns: 1fr; } }

  .builder-controls { display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.9rem; }
  .builder-controls label { display: flex; flex-direction: column; gap: 0.25rem; }
  .builder-controls select {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  .builder-preview { display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; }

  .demo-btn { border: none; font-weight: 600; cursor: pointer; transition: 150ms; color: white; }
  .demo-btn[data-variant='primary'] { background: oklch(0.55 0.2 250); }
  .demo-btn[data-variant='secondary'] { background: #e5e7eb; color: #111; border: 1px solid #ccc; }
  .demo-btn[data-variant='ghost'] { background: transparent; color: oklch(0.55 0.2 250); }
  .demo-btn[data-variant='danger'] { background: oklch(0.6 0.22 25); }
  .demo-btn[data-size='sm'] { padding: 0.25rem 0.75rem; font-size: 0.8rem; border-radius: 6px; }
  .demo-btn[data-size='md'] { padding: 0.5rem 1.25rem; font-size: 0.95rem; border-radius: 8px; }
  .demo-btn[data-size='lg'] { padding: 0.75rem 1.75rem; font-size: 1.1rem; border-radius: 10px; }
  .demo-btn.rounded { border-radius: 999px; }
  .demo-btn.full-width { width: 100%; }

  .snippet {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.6rem 0.8rem;
    border-radius: 6px;
    font-size: 0.75rem;
    margin: 0;
    align-self: stretch;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.76rem;
    line-height: 1.45;
    max-height: 500px;
  }
  pre code { background: none; padding: 0; }

  .rule {
    background: #fffbeb;
    border-left: 3px solid #f59e0b;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    margin: 1rem 0;
  }

  .prose-demo {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem 1.25rem;
  }
  .prose-demo h2 { font-size: 1.25rem; margin: 0.25rem 0 0.75rem; }
  .prose-demo p { margin: 0.5rem 0; font-size: 0.92rem; }
  .prose-demo code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }

  .prop-builder {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 10px;
    margin-bottom: 1rem;
  }
  @media (max-width: 700px) { .prop-builder { grid-template-columns: 1fr; } }
  .prop-controls label { display: flex; flex-direction: column; font-size: 0.85rem; gap: 0.25rem; margin-bottom: 0.5rem; }
  .prop-preview { display: flex; gap: 0.5rem; align-items: center; justify-content: center; flex-wrap: wrap; }

  .prop-btn {
    background: oklch(0.55 0.2 var(--btn-hue, 250));
    color: white;
    border: none;
    border-radius: var(--btn-radius, 8px);
    padding-inline: var(--btn-padding-x, 1.25rem);
    padding-block: 0.55rem;
    font-weight: 600;
    cursor: pointer;
  }
  .prop-btn.alt {
    background: transparent;
    color: oklch(0.55 0.2 var(--btn-hue, 250));
    border: 2px solid currentColor;
  }

  .cq-slider { display: block; margin: 0.75rem 0 0.5rem; font-size: 0.9rem; }
  .cq-slider input { width: 100%; margin-top: 0.25rem; }

  .cq-frame {
    margin: 0 auto 1rem;
    container-type: inline-size;
    container-name: card;
    border: 2px dashed #999;
    border-radius: 10px;
    padding: 0.5rem;
    background: #f8f9fa;
    transition: width 120ms;
  }

  .cq-card {
    display: grid;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
  }
  .cq-cover {
    background: linear-gradient(135deg, oklch(0.7 0.18 250), oklch(0.7 0.18 320));
    border-radius: 6px;
  }
  .cq-body h3 { margin: 0 0 0.25rem; }
  .cq-body p { margin: 0; font-size: 0.88rem; color: #555; }

  @container card (max-width: 400px) {
    .cq-card { grid-template-columns: 1fr; }
    .cq-cover { aspect-ratio: 16/9; }
  }
  @container card (min-width: 401px) {
    .cq-card { grid-template-columns: 180px 1fr; }
    .cq-cover { min-height: 100%; }
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
