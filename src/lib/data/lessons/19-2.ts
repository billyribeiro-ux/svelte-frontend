import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-2',
		title: 'Styling: Variants, :global() & Component Props',
		phase: 7,
		module: 19,
		lessonIndex: 2
	},
	description: `Svelte's scoped styles handle most cases, but sometimes you need to reach beyond component boundaries. data-variant attributes provide clean variant APIs, :global() selectively escapes scoping for child component styling, @container queries enable responsive components, and CSS custom properties (--color) let parents configure child appearance without breaking encapsulation.

This lesson covers the escape hatches and patterns for when scoped styling alone is not enough.`,
	objectives: [
		'Implement component variants using data-* attributes and CSS selectors',
		'Use :global() to style child components and dynamic content',
		'Apply @container queries for component-level responsive design',
		'Pass CSS custom properties as component-level styling props'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type Size = 'sm' | 'md' | 'lg';

  let selectedVariant = $state<Variant>('primary');
  let selectedSize = $state<Size>('md');
  let customColor = $state('#4a90d9');
  let customRadius = $state(8);

  const variants: Variant[] = ['primary', 'secondary', 'ghost', 'danger'];
  const sizes: Size[] = ['sm', 'md', 'lg'];

  // data-variant pattern code
  const variantCode = \`<!-- Button.svelte -->
<script lang="ts">
  type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type Size = 'sm' | 'md' | 'lg';

  let { variant = 'primary', size = 'md', children }:
    { variant?: Variant; size?: Size; children: any } = $props();
<\\/script>

<button data-variant={variant} data-size={size}>
  {@render children()}
</button>

<style>
  button {
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.15s;
  }

  /* Size variants */
  button[data-size="sm"] { padding: 0.3rem 0.8rem; font-size: 0.85rem; }
  button[data-size="md"] { padding: 0.5rem 1.2rem; font-size: 1rem; }
  button[data-size="lg"] { padding: 0.7rem 1.8rem; font-size: 1.15rem; }

  /* Color variants */
  button[data-variant="primary"] { background: var(--color-primary); color: white; }
  button[data-variant="secondary"] { background: var(--color-secondary); color: white; }
  button[data-variant="ghost"] { background: transparent; border: 2px solid currentColor; }
  button[data-variant="danger"] { background: var(--color-danger); color: white; }
</style>\`;

  // :global() pattern code
  const globalCode = \`<!-- Parent.svelte -->
<div class="rich-content">
  {@html dynamicHtml}
</div>

<style>
  .rich-content :global(h2) {
    font-size: 1.5rem;
    margin-top: 2rem;
  }

  .rich-content :global(pre) {
    background: #1e1e1e;
    padding: 1rem;
    border-radius: 8px;
  }

  .rich-content :global(a) {
    color: var(--color-primary);
    text-decoration: underline;
  }
</style>\`;

  // @container query code
  const containerCode = \`<!-- Card.svelte -->
<style>
  .card-wrapper {
    container-type: inline-size;
    container-name: card;
  }

  .card {
    padding: var(--space-md);
    display: grid;
    gap: var(--space-sm);
  }

  /* Stack vertically when narrow */
  @container card (max-width: 400px) {
    .card { grid-template-columns: 1fr; }
    .card img { aspect-ratio: 16/9; }
  }

  /* Side-by-side when wide */
  @container card (min-width: 401px) {
    .card { grid-template-columns: 200px 1fr; }
  }
</style>\`;

  // CSS custom property prop code
  const cssPropCode = \`<!-- Usage: pass CSS props from parent -->
<Card
  --card-bg="oklch(0.95 0.02 250)"
  --card-radius="16px"
  --card-shadow="0 8px 24px oklch(0 0 0 / 0.12)"
>
  Custom styled card
</Card>

<!-- Card.svelte -->
<div class="card">
  {@render children()}
</div>

<style>
  .card {
    background: var(--card-bg, white);
    border-radius: var(--card-radius, 8px);
    box-shadow: var(--card-shadow, var(--shadow-sm));
    padding: var(--space-md);
  }
</style>\`;

  let activePattern = $state<'variants' | 'global' | 'container' | 'cssprops'>('variants');
</script>

<main>
  <h1>Styling: Variants, :global() & Props</h1>
  <p class="subtitle">When scoped styles need escape hatches</p>

  <div class="pattern-tabs">
    <button class:active={activePattern === 'variants'} onclick={() => activePattern = 'variants'}>
      data-variant
    </button>
    <button class:active={activePattern === 'global'} onclick={() => activePattern = 'global'}>
      :global()
    </button>
    <button class:active={activePattern === 'container'} onclick={() => activePattern = 'container'}>
      @container
    </button>
    <button class:active={activePattern === 'cssprops'} onclick={() => activePattern = 'cssprops'}>
      CSS Props
    </button>
  </div>

  {#if activePattern === 'variants'}
    <section>
      <h2>Variant Pattern with data-* Attributes</h2>

      <div class="demo-area">
        <div class="demo-controls">
          <div class="control-group">
            <span>Variant:</span>
            {#each variants as v}
              <button class="chip" class:selected={selectedVariant === v} onclick={() => selectedVariant = v}>
                {v}
              </button>
            {/each}
          </div>
          <div class="control-group">
            <span>Size:</span>
            {#each sizes as s}
              <button class="chip" class:selected={selectedSize === s} onclick={() => selectedSize = s}>
                {s}
              </button>
            {/each}
          </div>
        </div>

        <div class="demo-preview">
          <button class="demo-btn" data-variant={selectedVariant} data-size={selectedSize}>
            Click Me
          </button>
        </div>
      </div>

      <pre><code>{variantCode}</code></pre>
    </section>

  {:else if activePattern === 'global'}
    <section>
      <h2>:global() for Dynamic & Child Content</h2>
      <p>Use <code>:global()</code> when you need to style content that Svelte cannot scope — like <code>{\`{@html}\`}</code> output or deeply nested child components.</p>
      <pre><code>{globalCode}</code></pre>
    </section>

  {:else if activePattern === 'container'}
    <section>
      <h2>@container Queries</h2>
      <p>Unlike media queries (viewport-based), container queries respond to the <strong>component's own container size</strong>.</p>
      <pre><code>{containerCode}</code></pre>
    </section>

  {:else}
    <section>
      <h2>CSS Custom Property Props</h2>

      <div class="css-prop-demo">
        <label>
          --card-bg color: <input type="color" bind:value={customColor} />
        </label>
        <label>
          --card-radius: <input type="range" min={0} max={24} bind:value={customRadius} /> {customRadius}px
        </label>

        <div class="card-preview" style="--card-bg: {customColor}; --card-radius: {customRadius}px">
          <h3>Styled via CSS props</h3>
          <p>Parent passes custom properties, child consumes with var() fallbacks.</p>
        </div>
      </div>

      <pre><code>{cssPropCode}</code></pre>
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 850px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .pattern-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .pattern-tabs button {
    flex: 1;
    padding: 0.6rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
  }

  .pattern-tabs button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .demo-area {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }

  .demo-controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .chip {
    padding: 0.3rem 0.7rem;
    border: 1px solid #ccc;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .chip.selected {
    background: #4a90d9;
    color: white;
    border-color: #4a90d9;
  }

  .demo-preview {
    display: flex;
    justify-content: center;
    padding: 1rem;
  }

  .demo-btn {
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.15s;
    border-radius: 8px;
  }

  .demo-btn[data-size="sm"] { padding: 0.3rem 0.8rem; font-size: 0.85rem; }
  .demo-btn[data-size="md"] { padding: 0.5rem 1.2rem; font-size: 1rem; }
  .demo-btn[data-size="lg"] { padding: 0.7rem 1.8rem; font-size: 1.15rem; }

  .demo-btn[data-variant="primary"] { background: #4a90d9; color: white; }
  .demo-btn[data-variant="secondary"] { background: #6c757d; color: white; }
  .demo-btn[data-variant="ghost"] { background: transparent; border: 2px solid #333; color: #333; }
  .demo-btn[data-variant="danger"] { background: #dc2626; color: white; }

  .css-prop-demo {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }

  .css-prop-demo label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    font-size: 0.9rem;
  }

  .card-preview {
    background: var(--card-bg, white);
    border-radius: var(--card-radius, 8px);
    padding: 1.5rem;
    color: white;
    margin-top: 1rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  .card-preview h3 { margin: 0 0 0.5rem; }
  .card-preview p { margin: 0; opacity: 0.9; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  code {
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }

  pre code { background: none; padding: 0; }

  section { margin-bottom: 2rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
