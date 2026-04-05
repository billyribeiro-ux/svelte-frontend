import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-1',
		title: 'CSS PE7: Two-Tier Architecture',
		phase: 7,
		module: 19,
		lessonIndex: 1
	},
	description: `The PE7 CSS architecture uses two tiers: a global @layer system in app.css for resets, design tokens and base styles, plus unlayered scoped <style> blocks in each component. Cascade layers (@layer) give you explicit control over specificity — layered styles always lose to unlayered styles, which makes component-level overrides predictable no matter how specific your global selectors get.

CSS custom properties (design tokens) bridge the two tiers: defined globally, consumed locally. Using oklch() for colors gives perceptually uniform palettes; @layer tokens keeps them in one place; dark mode becomes a single override block. This creates a systematic, maintainable design system where every component speaks the same visual language.`,
	objectives: [
		'Implement @layer in app.css for resets, tokens, base styles and components',
		'Understand why unlayered scoped styles beat any layered global rule',
		'Define and consume oklch color tokens as CSS custom properties',
		'Add a dark mode theme by overriding tokens inside a [data-theme="dark"] block',
		'Structure a two-tier CSS architecture that scales to hundreds of components'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Two-tier architecture interactive explorer.
  // Tier 1 = global @layer rules (shown as code samples)
  // Tier 2 = unlayered component <style> (the actual styles on this page)

  type Theme = 'light' | 'dark';
  type Tab = 'tiers' | 'tokens' | 'dark-mode' | 'playground';

  let theme = $state<Theme>('light');
  let activeTab = $state<Tab>('tiers');

  // Live token editor — lets the learner see how token overrides cascade.
  let primaryL = $state(0.55);
  let primaryC = $state(0.2);
  let primaryH = $state(250);
  let radius = $state(8);
  let spacing = $state(1);

  let primaryColor = $derived(\`oklch(\${primaryL} \${primaryC} \${primaryH})\`);

  const appCssCode = \`/* app.css — Tier 1: Global Layers */
@layer reset, tokens, base, components, utilities;

@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  html { -webkit-text-size-adjust: 100%; }
  img, svg, video { display: block; max-width: 100%; }
  button, input, textarea, select { font: inherit; }
}

@layer tokens {
  :root {
    /* Colors — oklch for perceptual uniformity */
    --color-bg:        oklch(0.99 0 0);
    --color-surface:   oklch(0.97 0 0);
    --color-text:      oklch(0.15 0 0);
    --color-muted:     oklch(0.55 0 0);
    --color-border:    oklch(0.88 0 0);
    --color-primary:   oklch(0.55 0.2 250);
    --color-primary-fg: oklch(0.98 0 0);
    --color-success:   oklch(0.65 0.18 150);
    --color-warning:   oklch(0.75 0.18 80);
    --color-danger:    oklch(0.6 0.22 25);

    /* Spacing — 4px base */
    --space-0: 0;
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;

    /* Type scale — 1.25 modular */
    --text-xs:   0.75rem;
    --text-sm:   0.875rem;
    --text-base: 1rem;
    --text-lg:   1.125rem;
    --text-xl:   1.25rem;
    --text-2xl:  1.5rem;
    --text-3xl:  1.875rem;

    /* Radii */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px oklch(0 0 0 / 0.08);
    --shadow-lg: 0 10px 24px oklch(0 0 0 / 0.12);

    /* Motion */
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --duration-fast: 120ms;
    --duration-base: 200ms;
  }

  [data-theme="dark"] {
    --color-bg:      oklch(0.16 0 0);
    --color-surface: oklch(0.22 0 0);
    --color-text:    oklch(0.95 0 0);
    --color-muted:   oklch(0.65 0 0);
    --color-border:  oklch(0.32 0 0);
    --color-primary: oklch(0.7 0.18 250);
  }
}

@layer base {
  html, body {
    font-family: system-ui, -apple-system, sans-serif;
    background: var(--color-bg);
    color: var(--color-text);
    line-height: 1.6;
  }
  a { color: var(--color-primary); }
  h1, h2, h3 { line-height: 1.2; text-wrap: balance; }
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

@layer components {
  .btn {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--color-primary);
    color: var(--color-primary-fg);
    border: none;
  }
}

@layer utilities {
  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0);
  }
}\`;

  const componentCode = \`<!-- Button.svelte — Tier 2: Unlayered Scoped -->
<script lang="ts">
  type Props = {
    variant?: 'primary' | 'ghost' | 'danger';
    children: import('svelte').Snippet;
  };
  let { variant = 'primary', children }: Props = $props();
<\/script>

<button data-variant={variant}>
  {@render children()}
</button>

<style>
  /* Unlayered — wins against ANY @layer rule */
  button {
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-md);
    border: 1px solid transparent;
    font-weight: 600;
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-out);
  }
  button[data-variant="primary"] {
    background: var(--color-primary);
    color: var(--color-primary-fg);
  }
  button[data-variant="ghost"] {
    background: transparent;
    border-color: var(--color-border);
    color: var(--color-text);
  }
  button[data-variant="danger"] {
    background: var(--color-danger);
    color: white;
  }
</style>\`;

  const cascadeOrder = [
    { layer: '@layer reset', specificity: 'Lowest', purpose: 'Box model + element reset' },
    { layer: '@layer tokens', specificity: 'Low', purpose: ':root custom properties' },
    { layer: '@layer base', specificity: 'Medium', purpose: 'body, typography, focus' },
    { layer: '@layer components', specificity: 'Higher', purpose: 'Reusable class helpers' },
    { layer: '@layer utilities', specificity: 'Higher', purpose: 'Single-purpose classes' },
    { layer: 'Unlayered (scoped)', specificity: 'Highest', purpose: 'Component <style> blocks' }
  ];

  type Token = { name: string; value: string; kind: 'color' | 'space' | 'size' | 'radius' };
  const tokens: Token[] = [
    { name: '--color-primary', value: 'oklch(0.55 0.2 250)', kind: 'color' },
    { name: '--color-success', value: 'oklch(0.65 0.18 150)', kind: 'color' },
    { name: '--color-warning', value: 'oklch(0.75 0.18 80)', kind: 'color' },
    { name: '--color-danger', value: 'oklch(0.6 0.22 25)', kind: 'color' },
    { name: '--space-2', value: '0.5rem', kind: 'space' },
    { name: '--space-4', value: '1rem', kind: 'space' },
    { name: '--space-8', value: '2rem', kind: 'space' },
    { name: '--text-base', value: '1rem', kind: 'size' },
    { name: '--text-xl', value: '1.25rem', kind: 'size' },
    { name: '--text-2xl', value: '1.5rem', kind: 'size' },
    { name: '--radius-sm', value: '4px', kind: 'radius' },
    { name: '--radius-md', value: '8px', kind: 'radius' },
    { name: '--radius-lg', value: '16px', kind: 'radius' }
  ];
</script>

<main data-theme={theme}>
  <header>
    <h1>CSS PE7: Two-Tier Architecture</h1>
    <p class="subtitle">@layer globals + unlayered scoped styles</p>
  </header>

  <div class="controls">
    <button class="pill" onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}>
      Theme: {theme}
    </button>
  </div>

  <nav class="tabs" aria-label="Lesson sections">
    <button class:active={activeTab === 'tiers'} onclick={() => (activeTab = 'tiers')}>Two Tiers</button>
    <button class:active={activeTab === 'tokens'} onclick={() => (activeTab = 'tokens')}>Tokens</button>
    <button class:active={activeTab === 'dark-mode'} onclick={() => (activeTab = 'dark-mode')}>Dark Mode</button>
    <button class:active={activeTab === 'playground'} onclick={() => (activeTab = 'playground')}>Playground</button>
  </nav>

  {#if activeTab === 'tiers'}
    <section>
      <h2>Cascade Layer Order</h2>
      <div class="layers">
        {#each cascadeOrder as layer, i (layer.layer)}
          <div class="layer-row" style="--depth: {i}">
            <span class="layer-name">{layer.layer}</span>
            <span class="layer-spec">{layer.specificity}</span>
            <span class="layer-purpose">{layer.purpose}</span>
          </div>
        {/each}
      </div>
      <p class="callout">
        Unlayered styles <strong>always</strong> beat layered rules regardless of selector specificity.
        That is why component <code>&lt;style&gt;</code> blocks can safely override anything in <code>app.css</code>.
      </p>
    </section>

    <section>
      <h2>Tier 1: app.css (Global Layers)</h2>
      <pre><code>{appCssCode}</code></pre>
    </section>

    <section>
      <h2>Tier 2: Component Scoped Styles</h2>
      <pre><code>{componentCode}</code></pre>
    </section>
  {:else if activeTab === 'tokens'}
    <section>
      <h2>Design Tokens</h2>
      <p class="subtitle">Every visual decision flows through a token.</p>
      <div class="token-grid">
        {#each tokens as t (t.name)}
          <div class="token-card">
            <code class="token-name">{t.name}</code>
            <span class="token-value">{t.value}</span>
            {#if t.kind === 'color'}
              <div class="token-swatch" style="background: {t.value}"></div>
            {:else if t.kind === 'space'}
              <div class="token-space" style="width: {t.value}"></div>
            {:else if t.kind === 'radius'}
              <div class="token-radius" style="border-radius: {t.value}"></div>
            {:else}
              <div class="token-text" style="font-size: {t.value}">Aa</div>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  {:else if activeTab === 'dark-mode'}
    <section>
      <h2>Dark Mode via Token Overrides</h2>
      <p>
        Dark mode is a single <code>[data-theme="dark"]</code> rule inside <code>@layer tokens</code>.
        Flip <code>data-theme</code> on <code>&lt;html&gt;</code> and every component re-themes instantly.
      </p>
      <pre><code>{\`[data-theme="dark"] {
  --color-bg:      oklch(0.16 0 0);
  --color-surface: oklch(0.22 0 0);
  --color-text:    oklch(0.95 0 0);
  --color-primary: oklch(0.7 0.18 250);
}\`}</code></pre>

      <div class="theme-preview">
        <div class="theme-card">
          <h3>Surface card</h3>
          <p>All values come from tokens. No per-component dark styles needed.</p>
          <button class="demo-btn">Action</button>
        </div>
      </div>
    </section>
  {:else}
    <section>
      <h2>Token Playground</h2>
      <p>Drag the sliders — every value is a CSS custom property scoped to this preview.</p>
      <div class="pg">
        <div class="pg-controls">
          <label>Lightness <input type="range" min="0" max="1" step="0.01" bind:value={primaryL} /> {primaryL.toFixed(2)}</label>
          <label>Chroma <input type="range" min="0" max="0.4" step="0.01" bind:value={primaryC} /> {primaryC.toFixed(2)}</label>
          <label>Hue <input type="range" min="0" max="360" step="1" bind:value={primaryH} /> {primaryH}</label>
          <label>Radius <input type="range" min="0" max="24" step="1" bind:value={radius} /> {radius}px</label>
          <label>Spacing <input type="range" min="0.25" max="2" step="0.05" bind:value={spacing} /> {spacing}rem</label>
        </div>
        <div
          class="pg-preview"
          style="--color-primary: {primaryColor}; --radius-md: {radius}px; --space-4: {spacing}rem"
        >
          <button class="demo-btn">Preview</button>
          <div class="pg-card">Cards inherit the same tokens.</div>
          <p class="pg-code">--color-primary: {primaryColor}</p>
        </div>
      </div>
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
    background: var(--lesson-bg, #fff);
    color: var(--lesson-fg, #111);
    transition: background 200ms, color 200ms;
  }
  main[data-theme='dark'] {
    --lesson-bg: oklch(0.18 0 0);
    --lesson-fg: oklch(0.95 0 0);
  }
  header h1 { margin: 0; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }
  main[data-theme='dark'] .subtitle { color: #aaa; }

  .controls { margin-bottom: 1rem; }
  .pill {
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    border: 1px solid #ccc;
    background: #f8f9fa;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .tabs {
    display: flex;
    gap: 0.35rem;
    margin-bottom: 1.5rem;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 0.25rem;
  }
  .tabs button {
    padding: 0.5rem 1rem;
    border: none;
    background: transparent;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    font-weight: 500;
    color: inherit;
  }
  .tabs button.active {
    background: #eef4fb;
    color: #1e40af;
  }
  main[data-theme='dark'] .tabs button.active {
    background: #1e3a5f;
    color: #bfdbfe;
  }

  section { margin-bottom: 2.5rem; }
  h2 { margin-top: 0; }

  .layers { display: flex; flex-direction: column; gap: 0.4rem; }
  .layer-row {
    display: grid;
    grid-template-columns: 200px 100px 1fr;
    padding: 0.6rem 1rem;
    border-radius: 6px;
    font-size: 0.88rem;
    background: hsl(calc(var(--depth) * 45 + 200) 60% 92%);
    border-left: 4px solid hsl(calc(var(--depth) * 45 + 200) 60% 50%);
  }
  .layer-name { font-weight: 600; }
  .layer-spec { color: #666; font-size: 0.8rem; }
  .layer-purpose { color: #555; }

  .callout {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    background: #fffbeb;
    border-left: 3px solid #f59e0b;
    border-radius: 6px;
    font-size: 0.9rem;
  }
  .callout code { background: #fef3c7; padding: 0.1rem 0.3rem; border-radius: 3px; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.76rem;
    line-height: 1.45;
    max-height: 480px;
  }
  pre code { background: none; padding: 0; }

  .token-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
  }
  .token-card {
    padding: 0.85rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    background: #fafafa;
  }
  main[data-theme='dark'] .token-card { background: #262626; border-color: #3a3a3a; }
  .token-name { font-size: 0.78rem; font-weight: 600; }
  .token-value { font-size: 0.78rem; color: #666; }
  main[data-theme='dark'] .token-value { color: #aaa; }
  .token-swatch { height: 28px; border-radius: 4px; border: 1px solid #0002; }
  .token-space { height: 10px; background: #4a90d9; border-radius: 2px; }
  .token-radius { width: 40px; height: 40px; background: #4a90d9; }
  .token-text { font-weight: 700; color: #4a90d9; }

  .theme-preview {
    margin-top: 1rem;
    padding: 2rem;
    background: oklch(0.97 0 0);
    border-radius: 12px;
  }
  main[data-theme='dark'] .theme-preview { background: oklch(0.22 0 0); }
  .theme-card {
    padding: 1.5rem;
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  main[data-theme='dark'] .theme-card { background: oklch(0.3 0 0); color: #f5f5f5; }
  .theme-card h3 { margin-top: 0; }
  .demo-btn {
    padding: 0.55rem 1.1rem;
    background: var(--color-primary, #4a90d9);
    color: white;
    border: none;
    border-radius: var(--radius-md, 8px);
    cursor: pointer;
    font-weight: 600;
  }

  .pg { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  @media (max-width: 700px) { .pg { grid-template-columns: 1fr; } }
  .pg-controls { display: flex; flex-direction: column; gap: 0.75rem; }
  .pg-controls label {
    font-size: 0.85rem;
    font-weight: 500;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .pg-preview {
    padding: var(--space-4);
    background: #f8f9fa;
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  main[data-theme='dark'] .pg-preview { background: #262626; }
  .pg-card {
    padding: var(--space-4);
    background: white;
    border-radius: var(--radius-md);
    box-shadow: 0 2px 4px rgba(0,0,0,0.08);
  }
  main[data-theme='dark'] .pg-card { background: #333; color: #eee; }
  .pg-code {
    font-family: monospace;
    font-size: 0.78rem;
    background: #111;
    color: #9ae6b4;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    margin: 0;
  }

  code { font-size: 0.82rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
