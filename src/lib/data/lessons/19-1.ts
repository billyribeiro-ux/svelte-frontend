import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-1',
		title: 'CSS PE7: Two-Tier Architecture',
		phase: 7,
		module: 19,
		lessonIndex: 1
	},
	description: `The PE7 CSS architecture uses two tiers: a global @layer system in app.css for design tokens and base styles, plus unlayered scoped <style> blocks in each component. Cascade layers (@layer) give you explicit control over specificity — layered styles always lose to unlayered styles, making component overrides predictable.

CSS custom properties (design tokens) bridge the two tiers: defined globally, consumed locally. This creates a systematic, maintainable design system where every component speaks the same visual language.`,
	objectives: [
		'Implement @layer in app.css for base styles and design tokens',
		'Understand why unlayered scoped styles override layered global styles',
		'Define and consume CSS custom properties as design tokens',
		'Structure a two-tier CSS architecture for scalable applications'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Simulating the two-tier architecture within a single component
  // In production, the @layer styles would be in app.css

  let theme = $state<'light' | 'dark'>('light');
  let showLayers = $state(true);

  const appCssCode = \`/* app.css — Global Layer (Tier 1) */
@layer reset, tokens, base, components;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
  }
}

@layer tokens {
  :root {
    /* Color tokens (oklch for perceptual uniformity) */
    --color-primary: oklch(0.55 0.2 250);
    --color-secondary: oklch(0.65 0.15 160);
    --color-surface: oklch(0.98 0 0);
    --color-text: oklch(0.15 0 0);

    /* Spacing scale */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 2rem;
    --space-xl: 4rem;

    /* Type scale */
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.25rem;
    --text-xl: 1.5rem;
    --text-2xl: 2rem;

    /* Border radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;

    /* Shadows */
    --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px oklch(0 0 0 / 0.1);
  }

  [data-theme="dark"] {
    --color-surface: oklch(0.2 0 0);
    --color-text: oklch(0.9 0 0);
  }
}

@layer base {
  body {
    font-family: system-ui, sans-serif;
    color: var(--color-text);
    background: var(--color-surface);
    line-height: 1.6;
  }
}

@layer components {
  .btn {
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-size: var(--text-base);
    cursor: pointer;
  }
}\`;

  const componentStyleCode = \`<!-- Button.svelte — Scoped Style (Tier 2) -->
<style>
  /* Unlayered = always beats @layer styles */
  button {
    /* Consumes global tokens */
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    background: var(--color-primary);
    color: white;
    border: none;
    font-size: var(--text-base);
    cursor: pointer;
    transition: opacity 0.15s;
  }

  button:hover {
    opacity: 0.9;
  }

  /* Component-level overrides via custom properties */
  button {
    background: var(--btn-color, var(--color-primary));
    border-radius: var(--btn-radius, var(--radius-md));
  }
</style>\`;

  const cascadeOrder = [
    { layer: '@layer reset', specificity: 'Lowest', purpose: 'Box model, margin reset' },
    { layer: '@layer tokens', specificity: 'Low', purpose: 'CSS custom properties' },
    { layer: '@layer base', specificity: 'Medium', purpose: 'Body, typography defaults' },
    { layer: '@layer components', specificity: 'Higher', purpose: 'Reusable component styles' },
    { layer: 'Unlayered (scoped)', specificity: 'Highest', purpose: 'Component <style> blocks' }
  ];

  type Token = { name: string; value: string; preview: string };

  const tokenExamples: Token[] = [
    { name: '--color-primary', value: 'oklch(0.55 0.2 250)', preview: 'oklch(0.55 0.2 250)' },
    { name: '--space-md', value: '1rem', preview: '' },
    { name: '--text-lg', value: '1.25rem', preview: '' },
    { name: '--radius-md', value: '8px', preview: '' },
    { name: '--shadow-md', value: '0 4px 6px ...', preview: '' }
  ];
</script>

<main data-theme={theme}>
  <h1>CSS PE7: Two-Tier Architecture</h1>
  <p class="subtitle">@layer globals + unlayered scoped styles</p>

  <div class="controls">
    <button class="toggle-btn" onclick={() => theme = theme === 'light' ? 'dark' : 'light'}>
      {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
    <button class="toggle-btn" onclick={() => showLayers = !showLayers}>
      {showLayers ? 'Hide' : 'Show'} Layer Diagram
    </button>
  </div>

  {#if showLayers}
    <section class="layer-diagram">
      <h2>Cascade Layer Order</h2>
      <div class="layers">
        {#each cascadeOrder as layer, i}
          <div class="layer-row" style="--depth: {i}">
            <span class="layer-name">{layer.layer}</span>
            <span class="layer-spec">{layer.specificity}</span>
            <span class="layer-purpose">{layer.purpose}</span>
          </div>
        {/each}
      </div>
      <p class="layer-note">Unlayered styles <strong>always</strong> beat layered styles regardless of specificity.</p>
    </section>
  {/if}

  <section class="code-section">
    <h2>Tier 1: app.css (Global Layers)</h2>
    <pre><code>{appCssCode}</code></pre>
  </section>

  <section class="code-section">
    <h2>Tier 2: Component Scoped Styles</h2>
    <pre><code>{componentStyleCode}</code></pre>
  </section>

  <section class="tokens-section">
    <h2>Design Tokens</h2>
    <div class="token-grid">
      {#each tokenExamples as token}
        <div class="token-card">
          <code>{token.name}</code>
          <span class="token-value">{token.value}</span>
          {#if token.preview}
            <div class="token-preview" style="background: {token.preview}"></div>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <section class="demo">
    <h2>Live Token Demo</h2>
    <div class="demo-buttons">
      <button class="demo-btn" style="--btn-color: oklch(0.55 0.2 250)">Primary</button>
      <button class="demo-btn" style="--btn-color: oklch(0.65 0.15 160)">Secondary</button>
      <button class="demo-btn" style="--btn-color: oklch(0.55 0.2 30)">Danger</button>
      <button class="demo-btn" style="--btn-color: oklch(0.7 0 0); color: #333">Neutral</button>
    </div>
    <p class="demo-note">Each button uses the same component with different <code>--btn-color</code> custom property values.</p>
  </section>
</main>

<style>
  main {
    max-width: 850px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .toggle-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #ccc;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
  }

  .layer-diagram {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .layers {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .layer-row {
    display: grid;
    grid-template-columns: 200px 100px 1fr;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    background: hsl(calc(var(--depth) * 50 + 200), 60%, 92%);
    border-left: 4px solid hsl(calc(var(--depth) * 50 + 200), 60%, 50%);
  }

  .layer-name { font-weight: 600; }
  .layer-spec { color: #666; font-size: 0.85rem; }
  .layer-purpose { color: #555; }

  .layer-note {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #fffbeb;
    border-radius: 6px;
    font-size: 0.9rem;
    border-left: 3px solid #f59e0b;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .token-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .token-card {
    padding: 1rem;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .token-card code {
    font-size: 0.8rem;
    font-weight: 600;
    background: #e8e8e8;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
  }

  .token-value {
    font-size: 0.8rem;
    color: #666;
  }

  .token-preview {
    height: 24px;
    border-radius: 4px;
    margin-top: 0.25rem;
  }

  .demo-buttons {
    display: flex;
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .demo-btn {
    padding: 0.6rem 1.5rem;
    background: var(--btn-color, #333);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .demo-btn:hover { opacity: 0.85; }

  .demo-note {
    font-size: 0.85rem;
    color: #888;
  }

  .demo-note code {
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
  }

  section { margin-bottom: 2.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
