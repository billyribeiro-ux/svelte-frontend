import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-2',
		title: 'Design System Setup',
		phase: 7,
		module: 20,
		lessonIndex: 2
	},
	description: `A design system starts with app.css. You declare your @layer order, define oklch color tokens, set up a type scale, pick spacing and radius scales, add motion tokens, and wire in dark mode via a single [data-theme] override. Every component downstream consumes these tokens instead of hard-coding values — which means a single token change updates the entire app.

oklch (Lightness, Chroma, Hue) produces more visually consistent palettes than HSL because L is perceptual brightness. Derived shades (hover, active, pressed) come from chroma and lightness shifts rather than arbitrary color edits.`,
	objectives: [
		'Declare @layer order in app.css for predictable cascade',
		'Define oklch color tokens including derived states',
		'Build a type scale based on a modular ratio',
		'Set up spacing, radius, shadow, and motion tokens',
		'Implement dark mode via [data-theme] token overrides'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'layers' | 'colors' | 'typography' | 'spacing' | 'motion' | 'full';
  let activeTab = $state<Tab>('layers');

  let theme = $state<'light' | 'dark'>('light');

  // Live color explorer
  let hue = $state(250);
  let chroma = $state(0.2);
  let lightness = $state(0.55);

  let primary = $derived(\`oklch(\${lightness} \${chroma} \${hue})\`);
  let primaryHover = $derived(\`oklch(\${lightness - 0.05} \${chroma} \${hue})\`);
  let primaryActive = $derived(\`oklch(\${lightness - 0.1} \${chroma} \${hue})\`);
  let primaryMuted = $derived(\`oklch(\${Math.min(0.97, lightness + 0.35)} \${chroma * 0.3} \${hue})\`);

  const typeScale = [
    { name: '--text-xs',   value: '0.75rem',  px: 12 },
    { name: '--text-sm',   value: '0.875rem', px: 14 },
    { name: '--text-base', value: '1rem',     px: 16 },
    { name: '--text-lg',   value: '1.125rem', px: 18 },
    { name: '--text-xl',   value: '1.25rem',  px: 20 },
    { name: '--text-2xl',  value: '1.5rem',   px: 24 },
    { name: '--text-3xl',  value: '1.875rem', px: 30 },
    { name: '--text-4xl',  value: '2.25rem',  px: 36 },
    { name: '--text-5xl',  value: '3rem',     px: 48 }
  ];

  const spacingScale = [
    { name: '--space-0',  value: '0',        px: 0 },
    { name: '--space-1',  value: '0.25rem',  px: 4 },
    { name: '--space-2',  value: '0.5rem',   px: 8 },
    { name: '--space-3',  value: '0.75rem',  px: 12 },
    { name: '--space-4',  value: '1rem',     px: 16 },
    { name: '--space-6',  value: '1.5rem',   px: 24 },
    { name: '--space-8',  value: '2rem',     px: 32 },
    { name: '--space-12', value: '3rem',     px: 48 },
    { name: '--space-16', value: '4rem',     px: 64 }
  ];

  const motionTokens = [
    { name: '--duration-fast',   value: '120ms', desc: 'hover, focus, small toggles' },
    { name: '--duration-base',   value: '200ms', desc: 'page transitions, dropdowns' },
    { name: '--duration-slow',   value: '320ms', desc: 'modals, drawers' },
    { name: '--ease-out',        value: 'cubic-bezier(0.16, 1, 0.3, 1)', desc: 'enter animations' },
    { name: '--ease-in-out',     value: 'cubic-bezier(0.65, 0, 0.35, 1)', desc: 'bidirectional' },
    { name: '--ease-spring',     value: 'cubic-bezier(0.5, 1.5, 0.5, 1)', desc: 'playful bounces' }
  ];

  const fullCss = \`/* src/app.css — complete capstone design system */
@layer reset, tokens, base, components, utilities;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; text-rendering: optimizeLegibility; }
  img, svg, video, canvas { display: block; max-width: 100%; height: auto; }
  button, input, textarea, select { font: inherit; color: inherit; }
  a { color: inherit; text-decoration: none; }
}

@layer tokens {
  :root {
    /* Brand */
    --color-primary:        oklch(0.55 0.2 250);
    --color-primary-hover:  oklch(0.5 0.2 250);
    --color-primary-active: oklch(0.45 0.2 250);
    --color-primary-muted:  oklch(0.92 0.05 250);
    --color-primary-fg:     oklch(0.99 0 0);

    /* Neutrals */
    --color-bg:      oklch(0.99 0 0);
    --color-surface: oklch(0.97 0 0);
    --color-elevate: oklch(1 0 0);
    --color-text:    oklch(0.15 0 0);
    --color-muted:   oklch(0.55 0 0);
    --color-border:  oklch(0.9 0 0);

    /* Semantic */
    --color-success: oklch(0.65 0.18 150);
    --color-warning: oklch(0.75 0.18 80);
    --color-danger:  oklch(0.6 0.22 25);
    --color-info:    oklch(0.65 0.15 220);

    /* Typography */
    --font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
    --font-mono: ui-monospace, 'Cascadia Code', Menlo, monospace;

    --text-xs:   0.75rem;
    --text-sm:   0.875rem;
    --text-base: 1rem;
    --text-lg:   1.125rem;
    --text-xl:   1.25rem;
    --text-2xl:  1.5rem;
    --text-3xl:  1.875rem;
    --text-4xl:  2.25rem;
    --text-5xl:  3rem;

    --leading-tight: 1.2;
    --leading-snug: 1.4;
    --leading-normal: 1.6;
    --leading-relaxed: 1.8;

    /* Spacing */
    --space-0: 0;
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;
    --space-16: 4rem;

    /* Radius */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px oklch(0 0 0 / 0.08), 0 2px 4px oklch(0 0 0 / 0.04);
    --shadow-lg: 0 10px 24px oklch(0 0 0 / 0.12);
    --shadow-xl: 0 20px 40px oklch(0 0 0 / 0.18);

    /* Motion */
    --duration-fast: 120ms;
    --duration-base: 200ms;
    --duration-slow: 320ms;
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
    --ease-spring: cubic-bezier(0.5, 1.5, 0.5, 1);

    /* Layout */
    --container-sm: 640px;
    --container-md: 768px;
    --container-lg: 1024px;
    --container-xl: 1280px;
  }

  [data-theme='dark'] {
    --color-bg:      oklch(0.16 0 0);
    --color-surface: oklch(0.22 0 0);
    --color-elevate: oklch(0.28 0 0);
    --color-text:    oklch(0.95 0 0);
    --color-muted:   oklch(0.65 0 0);
    --color-border:  oklch(0.32 0 0);

    --color-primary:       oklch(0.7 0.18 250);
    --color-primary-hover: oklch(0.75 0.18 250);
    --color-primary-muted: oklch(0.32 0.08 250);
  }

  @media (prefers-reduced-motion: reduce) {
    :root {
      --duration-fast: 0ms;
      --duration-base: 0ms;
      --duration-slow: 0ms;
    }
  }
}

@layer base {
  html, body {
    font-family: var(--font-sans);
    background: var(--color-bg);
    color: var(--color-text);
    line-height: var(--leading-normal);
  }
  h1, h2, h3, h4 { line-height: var(--leading-tight); text-wrap: balance; }
  p { text-wrap: pretty; }
  :focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
}

@layer utilities {
  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    overflow: hidden; clip: rect(0 0 0 0);
  }
  .container {
    max-width: var(--container-lg);
    margin-inline: auto;
    padding-inline: var(--space-6);
  }
}\`;
</script>

<main data-theme={theme}>
  <div class="header">
    <div>
      <h1>Design System Setup</h1>
      <p class="subtitle">app.css for the capstone — tokens, layers, dark mode</p>
    </div>
    <button class="theme-btn" onclick={() => (theme = theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? 'Dark mode' : 'Light mode'}
    </button>
  </div>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'layers'} onclick={() => (activeTab = 'layers')}>Layers</button>
    <button class:active={activeTab === 'colors'} onclick={() => (activeTab = 'colors')}>Colors</button>
    <button class:active={activeTab === 'typography'} onclick={() => (activeTab = 'typography')}>Typography</button>
    <button class:active={activeTab === 'spacing'} onclick={() => (activeTab = 'spacing')}>Spacing</button>
    <button class:active={activeTab === 'motion'} onclick={() => (activeTab = 'motion')}>Motion</button>
    <button class:active={activeTab === 'full'} onclick={() => (activeTab = 'full')}>Full app.css</button>
  </nav>

  {#if activeTab === 'layers'}
    <section>
      <h2>@layer Order</h2>
      <p>Declare order once at the top. Every later rule joins one of these layers.</p>
      <pre><code>@layer reset, tokens, base, components, utilities;</code></pre>
      <ol class="layer-list">
        <li><strong>reset</strong> — normalize the box model and browser defaults</li>
        <li><strong>tokens</strong> — :root custom properties (the design system)</li>
        <li><strong>base</strong> — body, headings, focus styles</li>
        <li><strong>components</strong> — shared component classes (.btn, .card)</li>
        <li><strong>utilities</strong> — single-purpose helpers (.sr-only, .container)</li>
      </ol>
      <p>Unlayered component <code>&lt;style&gt;</code> blocks beat everything above.</p>
    </section>
  {:else if activeTab === 'colors'}
    <section>
      <h2>oklch Color System</h2>
      <div class="color-lab">
        <div class="color-controls">
          <label>Hue <input type="range" min="0" max="360" bind:value={hue} /> {hue}</label>
          <label>Chroma <input type="range" min="0" max="0.4" step="0.01" bind:value={chroma} /> {chroma.toFixed(2)}</label>
          <label>Lightness <input type="range" min="0" max="1" step="0.01" bind:value={lightness} /> {lightness.toFixed(2)}</label>
        </div>
        <div class="color-swatches">
          <div class="swatch" style="background: {primary}">primary</div>
          <div class="swatch" style="background: {primaryHover}">hover</div>
          <div class="swatch" style="background: {primaryActive}">active</div>
          <div class="swatch" style="background: {primaryMuted}; color: #111;">muted</div>
        </div>
      </div>
      <p class="note">Hover and active states are derived from the primary by shifting L. This is why oklch scales so well — small L changes produce perceptually even steps.</p>
    </section>
  {:else if activeTab === 'typography'}
    <section>
      <h2>Type Scale</h2>
      <div class="type-list">
        {#each typeScale as t (t.name)}
          <div class="type-row">
            <code class="type-name">{t.name}</code>
            <span class="type-value">{t.value} ({t.px}px)</span>
            <span class="type-preview" style="font-size: {t.value}">Aa — Ship it</span>
          </div>
        {/each}
      </div>
    </section>
  {:else if activeTab === 'spacing'}
    <section>
      <h2>Spacing Scale</h2>
      <div class="space-list">
        {#each spacingScale as s (s.name)}
          <div class="space-row">
            <code>{s.name}</code>
            <span>{s.value}</span>
            <div class="space-bar" style="width: {s.px}px"></div>
          </div>
        {/each}
      </div>
    </section>
  {:else if activeTab === 'motion'}
    <section>
      <h2>Motion Tokens</h2>
      <table class="motion-table">
        <thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead>
        <tbody>
          {#each motionTokens as m (m.name)}
            <tr>
              <td><code>{m.name}</code></td>
              <td><code>{m.value}</code></td>
              <td>{m.desc}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      <p class="note">Always respect <code>prefers-reduced-motion</code>. Override durations to 0ms in that media query.</p>
    </section>
  {:else}
    <section>
      <h2>Complete app.css</h2>
      <p>Copy this into <code>src/app.css</code> and import it from your root <code>+layout.svelte</code>.</p>
      <pre><code>{fullCss}</code></pre>
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 940px;
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
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
  .header h1 { margin: 0; }
  .subtitle { color: #666; }
  main[data-theme='dark'] .subtitle { color: #aaa; }

  .theme-btn {
    padding: 0.45rem 1rem;
    border: 1px solid #ccc;
    background: #f8f9fa;
    border-radius: 999px;
    font-size: 0.85rem;
    cursor: pointer;
    color: inherit;
  }
  main[data-theme='dark'] .theme-btn { background: #333; border-color: #555; }

  .tabs { display: flex; gap: 0.35rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
  .tabs button { padding: 0.55rem 1rem; border: none; background: transparent; border-radius: 6px 6px 0 0; font-weight: 500; cursor: pointer; color: inherit; font-size: 0.86rem; }
  .tabs button.active { background: #eef4fb; color: #1e40af; }
  main[data-theme='dark'] .tabs button.active { background: #1e3a5f; color: #bfdbfe; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.76rem;
    line-height: 1.5;
    max-height: 620px;
  }
  pre code { background: none; padding: 0; }
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }
  main[data-theme='dark'] code { background: #333; color: #eee; }

  .layer-list { padding-left: 1.25rem; }
  .layer-list li { margin: 0.4rem 0; }

  .color-lab {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 10px;
  }
  main[data-theme='dark'] .color-lab { background: #262626; }
  @media (max-width: 700px) { .color-lab { grid-template-columns: 1fr; } }
  .color-controls { display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem; }
  .color-controls label { display: flex; flex-direction: column; gap: 0.25rem; }

  .color-swatches { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem; }
  .swatch {
    padding: 1.25rem 0.75rem;
    border-radius: 8px;
    color: white;
    font-size: 0.78rem;
    text-align: center;
    font-weight: 600;
  }

  .note {
    background: #fffbeb;
    border-left: 3px solid #f59e0b;
    padding: 0.75rem 1rem;
    border-radius: 6px;
    font-size: 0.88rem;
    margin: 1rem 0;
  }
  main[data-theme='dark'] .note { background: #3f2f10; color: #fde68a; }

  .type-list { display: flex; flex-direction: column; gap: 0.4rem; }
  .type-row {
    display: grid;
    grid-template-columns: 140px 120px 1fr;
    gap: 0.75rem;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: #f8f9fa;
    border-radius: 6px;
  }
  main[data-theme='dark'] .type-row { background: #262626; }
  .type-name { font-size: 0.75rem; font-weight: 700; }
  .type-value { font-size: 0.75rem; color: #666; }
  main[data-theme='dark'] .type-value { color: #aaa; }
  .type-preview { font-weight: 600; }

  .space-list { display: flex; flex-direction: column; gap: 0.35rem; }
  .space-row {
    display: grid;
    grid-template-columns: 110px 90px 1fr;
    gap: 0.75rem;
    align-items: center;
    font-size: 0.82rem;
  }
  .space-bar { height: 14px; background: oklch(0.6 0.18 250); border-radius: 3px; min-width: 2px; }

  .motion-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  .motion-table th, .motion-table td { padding: 0.55rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
  .motion-table th { background: #f0f0f0; }
  main[data-theme='dark'] .motion-table th { background: #333; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
