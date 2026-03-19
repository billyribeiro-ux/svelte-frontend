import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-2',
		title: 'Design System Setup',
		phase: 7,
		module: 20,
		lessonIndex: 2
	},
	description: `A design system starts with app.css: @layer declarations for cascade control, oklch color tokens for perceptually uniform colors, a type scale for consistent typography, motion tokens for animations, and dark mode support via CSS custom properties. This systematic foundation ensures every component in your application speaks the same visual language.

oklch (Lightness, Chroma, Hue) produces more visually consistent color palettes than HSL, and CSS custom properties make theme switching trivial — just swap token values on a parent element.`,
	objectives: [
		'Set up @layer declarations in app.css for predictable cascade control',
		'Define oklch color tokens for a perceptually uniform color palette',
		'Create a modular type scale and spacing system with CSS custom properties',
		'Implement dark mode with token swapping and a theme toggle'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let theme = $state<'light' | 'dark'>('light');
  let accentHue = $state(250);

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
  }

  // The full app.css code
  const appCssCode = \`/* app.css — Design System Foundation */

/* 1. Declare cascade layers */
@layer reset, tokens, base, components, utilities;

/* 2. Reset */
@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  img, svg { display: block; max-width: 100%; }
  input, button, textarea, select { font: inherit; }
}

/* 3. Design Tokens */
@layer tokens {
  :root {
    /* --- Color Tokens (oklch) --- */
    --hue-primary: 250;
    --hue-success: 145;
    --hue-warning: 85;
    --hue-danger: 25;

    --color-primary: oklch(0.55 0.2 var(--hue-primary));
    --color-primary-light: oklch(0.75 0.12 var(--hue-primary));
    --color-primary-dark: oklch(0.4 0.22 var(--hue-primary));

    --color-success: oklch(0.6 0.18 var(--hue-success));
    --color-warning: oklch(0.75 0.15 var(--hue-warning));
    --color-danger: oklch(0.55 0.2 var(--hue-danger));

    /* Neutrals */
    --color-surface-0: oklch(1 0 0);
    --color-surface-1: oklch(0.97 0 0);
    --color-surface-2: oklch(0.93 0 0);
    --color-text: oklch(0.15 0 0);
    --color-text-muted: oklch(0.45 0 0);
    --color-border: oklch(0.85 0 0);

    /* --- Type Scale (1.25 ratio) --- */
    --text-xs: 0.64rem;
    --text-sm: 0.8rem;
    --text-base: 1rem;
    --text-md: 1.25rem;
    --text-lg: 1.563rem;
    --text-xl: 1.953rem;
    --text-2xl: 2.441rem;
    --text-3xl: 3.052rem;

    --leading-tight: 1.2;
    --leading-normal: 1.6;
    --leading-loose: 1.8;

    /* --- Spacing Scale (4px base) --- */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;
    --space-16: 4rem;

    /* --- Border Radius --- */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-full: 9999px;

    /* --- Shadows --- */
    --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px oklch(0 0 0 / 0.07);
    --shadow-lg: 0 10px 25px oklch(0 0 0 / 0.1);

    /* --- Motion --- */
    --duration-fast: 100ms;
    --duration-normal: 200ms;
    --duration-slow: 400ms;
    --easing-default: cubic-bezier(0.4, 0, 0.2, 1);
    --easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

    /* --- Z-Index Scale --- */
    --z-dropdown: 10;
    --z-modal: 100;
    --z-toast: 200;
  }

  /* Dark mode tokens */
  [data-theme="dark"] {
    --color-surface-0: oklch(0.15 0 0);
    --color-surface-1: oklch(0.2 0 0);
    --color-surface-2: oklch(0.25 0 0);
    --color-text: oklch(0.92 0 0);
    --color-text-muted: oklch(0.65 0 0);
    --color-border: oklch(0.3 0 0);

    --color-primary: oklch(0.7 0.18 var(--hue-primary));
    --color-primary-light: oklch(0.8 0.1 var(--hue-primary));

    --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.2);
    --shadow-md: 0 4px 6px oklch(0 0 0 / 0.3);
    --shadow-lg: 0 10px 25px oklch(0 0 0 / 0.4);
  }
}

/* 4. Base styles */
@layer base {
  body {
    font-family: system-ui, -apple-system, sans-serif;
    font-size: var(--text-base);
    line-height: var(--leading-normal);
    color: var(--color-text);
    background: var(--color-surface-0);
    transition: background var(--duration-normal) var(--easing-default),
                color var(--duration-normal) var(--easing-default);
  }

  h1 { font-size: var(--text-2xl); line-height: var(--leading-tight); }
  h2 { font-size: var(--text-xl); line-height: var(--leading-tight); }
  h3 { font-size: var(--text-lg); line-height: var(--leading-tight); }
  h4 { font-size: var(--text-md); }
}\`;

  type TokenCategory = { name: string; tokens: { name: string; value: string; preview?: string }[] };

  const tokenCategories: TokenCategory[] = [
    {
      name: 'Colors',
      tokens: [
        { name: '--color-primary', value: 'oklch(0.55 0.2 250)', preview: 'oklch(0.55 0.2 250)' },
        { name: '--color-success', value: 'oklch(0.6 0.18 145)', preview: 'oklch(0.6 0.18 145)' },
        { name: '--color-warning', value: 'oklch(0.75 0.15 85)', preview: 'oklch(0.75 0.15 85)' },
        { name: '--color-danger', value: 'oklch(0.55 0.2 25)', preview: 'oklch(0.55 0.2 25)' }
      ]
    },
    {
      name: 'Typography',
      tokens: [
        { name: '--text-sm', value: '0.8rem' },
        { name: '--text-base', value: '1rem' },
        { name: '--text-lg', value: '1.563rem' },
        { name: '--text-xl', value: '1.953rem' },
        { name: '--text-2xl', value: '2.441rem' }
      ]
    },
    {
      name: 'Spacing',
      tokens: [
        { name: '--space-2', value: '0.5rem' },
        { name: '--space-4', value: '1rem' },
        { name: '--space-8', value: '2rem' },
        { name: '--space-16', value: '4rem' }
      ]
    },
    {
      name: 'Motion',
      tokens: [
        { name: '--duration-fast', value: '100ms' },
        { name: '--duration-normal', value: '200ms' },
        { name: '--duration-slow', value: '400ms' }
      ]
    }
  ];
</script>

<main data-theme={theme} style="--hue-primary: {accentHue}">
  <div class="header-row">
    <h1>Design System Setup</h1>
    <button class="theme-toggle" onclick={toggleTheme}>
      {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  </div>
  <p class="subtitle">@layer, oklch tokens, type scale, motion, dark mode</p>

  <section class="hue-control">
    <label>
      Accent Hue: <strong>{accentHue}</strong>
      <input type="range" min={0} max={360} bind:value={accentHue} />
    </label>
    <div class="hue-preview">
      <div class="swatch" style="background: oklch(0.55 0.2 {accentHue})"></div>
      <div class="swatch" style="background: oklch(0.65 0.18 {accentHue})"></div>
      <div class="swatch" style="background: oklch(0.75 0.12 {accentHue})"></div>
      <div class="swatch" style="background: oklch(0.85 0.08 {accentHue})"></div>
    </div>
  </section>

  <section class="tokens-section">
    <h2>Design Tokens</h2>
    <div class="token-categories">
      {#each tokenCategories as category}
        <div class="token-category">
          <h3>{category.name}</h3>
          {#each category.tokens as token}
            <div class="token-row">
              <code>{token.name}</code>
              <span class="token-val">{token.value}</span>
              {#if token.preview}
                <div class="token-swatch" style="background: {token.preview}"></div>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </section>

  <section class="type-scale">
    <h2>Type Scale (1.25 ratio)</h2>
    <div class="scale-demo">
      <p style="font-size: 0.64rem">--text-xs: 0.64rem</p>
      <p style="font-size: 0.8rem">--text-sm: 0.8rem</p>
      <p style="font-size: 1rem">--text-base: 1rem</p>
      <p style="font-size: 1.25rem">--text-md: 1.25rem</p>
      <p style="font-size: 1.563rem">--text-lg: 1.563rem</p>
      <p style="font-size: 1.953rem">--text-xl: 1.953rem</p>
      <p style="font-size: 2.441rem">--text-2xl: 2.441rem</p>
    </div>
  </section>

  <section>
    <h2>Full app.css</h2>
    <pre><code>{appCssCode}</code></pre>
  </section>
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .theme-toggle {
    padding: 0.5rem 1rem;
    border: 2px solid #ccc;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .hue-control {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .hue-control label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.95rem;
    margin-bottom: 1rem;
  }

  .hue-control input[type="range"] {
    flex: 1;
    height: 8px;
  }

  .hue-preview {
    display: flex;
    gap: 0.5rem;
  }

  .swatch {
    flex: 1;
    height: 48px;
    border-radius: 8px;
  }

  .token-categories {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .token-category {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
  }

  .token-category h3 {
    margin: 0 0 0.75rem;
    font-size: 0.95rem;
  }

  .token-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0;
    font-size: 0.82rem;
    border-bottom: 1px solid #eee;
  }

  .token-row code {
    background: #e8e8e8;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.75rem;
  }

  .token-val {
    color: #888;
    font-size: 0.78rem;
    margin-left: auto;
  }

  .token-swatch {
    width: 20px;
    height: 20px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .scale-demo {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
  }

  .scale-demo p {
    margin: 0.4rem 0;
    color: #333;
    font-weight: 500;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.72rem;
    line-height: 1.4;
    max-height: 500px;
    overflow-y: auto;
  }

  section { margin-bottom: 2.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
