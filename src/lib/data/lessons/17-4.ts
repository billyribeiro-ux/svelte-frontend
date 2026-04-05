import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-4',
		title: 'Page Options: prerender, ssr, csr, trailingSlash',
		phase: 5,
		module: 17,
		lessonIndex: 4
	},
	description: `Page options are exported constants from +page.ts, +page.server.ts, +layout.ts, or +layout.server.ts that tell SvelteKit HOW to render each route. They let you pick exactly the right rendering mode for each page — static generation, server rendering, client-only, or any combination — without maintaining separate apps or build pipelines.

The four main options:
- prerender: bake the route to HTML at build time (fastest, cacheable, works offline, no server needed).
- ssr: render HTML on the server per-request (dynamic, SEO-friendly).
- csr: ship the JavaScript runtime and hydrate on the client (interactive).
- trailingSlash: 'never' | 'always' | 'ignore' — normalise URLs.

You can mix these: a marketing page can be prerendered, a dashboard can be SSR-only (csr=false for zero-JS), an interactive game can disable SSR. Options cascade: setting prerender=true in a layout applies to every child unless overridden. This lesson builds an interactive configurator so you can see exactly what output you'd get for any combination.`,
	objectives: [
		'Export page options: prerender, ssr, csr, trailingSlash, config',
		'Understand the trade-offs of prerender vs SSR vs CSR',
		'Know when to set csr = false for zero-JS pages',
		'Use entries() to tell the prerenderer which dynamic routes to build',
		'Combine options at the layout and page level'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Interactive page-options configurator.
  // Pick the combination you want, see the resulting behaviour
  // and the exact code you'd write in +page.ts.

  let prerender: boolean | 'auto' = $state(false);
  let ssr: boolean = $state(true);
  let csr: boolean = $state(true);
  let trailingSlash: 'never' | 'always' | 'ignore' = $state('never');

  type Preset = {
    name: string;
    description: string;
    prerender: boolean | 'auto';
    ssr: boolean;
    csr: boolean;
    trailingSlash: 'never' | 'always' | 'ignore';
  };

  const presets: Preset[] = [
    {
      name: 'Default',
      description: 'SSR + CSR (standard interactive page)',
      prerender: false, ssr: true, csr: true, trailingSlash: 'never'
    },
    {
      name: 'Static marketing',
      description: 'Prerendered HTML, no JS needed until interaction',
      prerender: true, ssr: true, csr: true, trailingSlash: 'never'
    },
    {
      name: 'Zero-JS content',
      description: 'Pure HTML, no hydration (blog post, legal page)',
      prerender: true, ssr: true, csr: false, trailingSlash: 'never'
    },
    {
      name: 'SPA only',
      description: 'No SSR, client-side only (admin panel behind auth)',
      prerender: false, ssr: false, csr: true, trailingSlash: 'never'
    },
    {
      name: 'Dashboard',
      description: 'SSR per request, always fresh (no prerender)',
      prerender: false, ssr: true, csr: true, trailingSlash: 'never'
    }
  ];

  function applyPreset(p: Preset): void {
    prerender = p.prerender;
    ssr = p.ssr;
    csr = p.csr;
    trailingSlash = p.trailingSlash;
  }

  // Derived: the actual behaviour this combo produces
  let behaviour = $derived.by(() => {
    if (prerender === true && !ssr) {
      return {
        label: 'Invalid combination',
        bad: true,
        detail: 'prerender requires SSR — can\\'t generate HTML without rendering it.'
      };
    }
    if (prerender === true && ssr && !csr) {
      return {
        label: 'Prerendered HTML, no JS',
        bad: false,
        detail: 'Pure HTML files at build time. No hydration. Forms must use action URLs.'
      };
    }
    if (prerender === true && ssr && csr) {
      return {
        label: 'Prerendered + hydrated',
        bad: false,
        detail: 'HTML at build time, hydrates to an interactive Svelte app in the browser.'
      };
    }
    if (!ssr && csr) {
      return {
        label: 'SPA mode (client-only)',
        bad: false,
        detail: 'Empty shell HTML, everything renders in the browser. Bad for SEO; OK for gated apps.'
      };
    }
    if (ssr && csr) {
      return {
        label: 'SSR + CSR (default)',
        bad: false,
        detail: 'HTML rendered fresh per request, hydrates in the browser.'
      };
    }
    if (ssr && !csr) {
      return {
        label: 'SSR only (zero JS)',
        bad: false,
        detail: 'Server HTML per request, no Svelte runtime ships. All interactivity must be progressive or form-based.'
      };
    }
    return {
      label: 'Nothing renders',
      bad: true,
      detail: 'Both SSR and CSR disabled — user sees a blank page.'
    };
  });

  let generatedCode = $derived.by(() => {
    const lines: string[] = ['// +page.ts (or +layout.ts)'];
    if (prerender !== false) {
      lines.push(\`export const prerender = \${prerender === 'auto' ? \`'auto'\` : prerender};\`);
    }
    if (!ssr) lines.push(\`export const ssr = false;\`);
    if (!csr) lines.push(\`export const csr = false;\`);
    if (trailingSlash !== 'never') {
      lines.push(\`export const trailingSlash = '\${trailingSlash}';\`);
    }
    if (lines.length === 1) lines.push('// (all options at defaults — nothing to export)');
    return lines.join('\\n');
  });
</script>

<h1>Page Options Configurator</h1>

<section>
  <h2>Presets</h2>
  <div class="presets">
    {#each presets as p (p.name)}
      <button class="preset" onclick={() => applyPreset(p)}>
        <strong>{p.name}</strong>
        <span>{p.description}</span>
      </button>
    {/each}
  </div>
</section>

<section>
  <h2>Options</h2>
  <div class="options">
    <div class="option">
      <label>prerender</label>
      <div class="radio-row">
        {#each [{ v: false, l: 'false' }, { v: true, l: 'true' }, { v: 'auto' as const, l: 'auto' }] as opt (opt.l)}
          <button
            class:active={prerender === opt.v}
            onclick={() => (prerender = opt.v)}
          >
            {opt.l}
          </button>
        {/each}
      </div>
      <p class="hint">
        true = build at compile time. auto = prerender if possible, fall back to SSR.
      </p>
    </div>

    <div class="option">
      <label>ssr</label>
      <div class="radio-row">
        <button class:active={ssr} onclick={() => (ssr = true)}>true</button>
        <button class:active={!ssr} onclick={() => (ssr = false)}>false</button>
      </div>
      <p class="hint">
        false = empty HTML shell; page renders entirely in the browser.
      </p>
    </div>

    <div class="option">
      <label>csr</label>
      <div class="radio-row">
        <button class:active={csr} onclick={() => (csr = true)}>true</button>
        <button class:active={!csr} onclick={() => (csr = false)}>false</button>
      </div>
      <p class="hint">
        false = no JS sent to client. Page is static HTML, no hydration.
      </p>
    </div>

    <div class="option">
      <label>trailingSlash</label>
      <div class="radio-row">
        {#each ['never', 'always', 'ignore'] as ts (ts)}
          <button
            class:active={trailingSlash === ts}
            onclick={() => (trailingSlash = ts as typeof trailingSlash)}
          >
            {ts}
          </button>
        {/each}
      </div>
      <p class="hint">
        never: /foo. always: /foo/. ignore: accept both.
      </p>
    </div>
  </div>
</section>

<section>
  <h2>Result</h2>
  <div class="result" class:bad={behaviour.bad}>
    <div class="result-label">{behaviour.label}</div>
    <p>{behaviour.detail}</p>
  </div>
  <pre class="code"><code>{generatedCode}</code></pre>
</section>

<section>
  <h2>Advanced — entries() &amp; config</h2>
  <pre class="code"><code>{\`// +page.ts — prerender dynamic routes by listing their params
export const prerender = true;

export const entries = () => {
  // Return the set of params the prerenderer should build
  return [
    { slug: 'hello-world' },
    { slug: 'svelte-5-runes' },
    { slug: 'kit-shallow-routing' }
  ];
};

// +page.server.ts — pass adapter config per route
// (e.g. deploy this route to the edge while the rest is on Node)
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'fra1']
};

// trailingSlash at the layout level applies to every child route
// src/routes/+layout.ts
export const trailingSlash = 'always';

// Cascading: marketing/+layout.ts sets prerender = true,
// so marketing/* are all static. marketing/contact/+page.ts
// can override with prerender = false if the form needs SSR.
\`}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #fd79a8; font-size: 1.05rem; }
  .presets {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5rem;
  }
  .preset {
    text-align: left; padding: 0.75rem; background: white;
    border: 2px solid #dfe6e9; border-radius: 6px; cursor: pointer;
    display: flex; flex-direction: column; gap: 0.25rem;
    font: inherit; color: inherit;
  }
  .preset:hover { border-color: #fd79a8; }
  .preset strong { color: #2d3436; font-size: 0.9rem; }
  .preset span { font-size: 0.75rem; color: #636e72; }
  .options {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;
  }
  .option {
    background: white; padding: 0.75rem; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .option label {
    font-weight: 700; color: #fd79a8; font-family: monospace;
    font-size: 0.9rem;
  }
  .radio-row {
    display: flex; gap: 0.25rem; margin: 0.5rem 0;
  }
  .radio-row button {
    padding: 0.3rem 0.75rem; border: none; border-radius: 4px;
    background: #dfe6e9; cursor: pointer; font-weight: 600;
    font-size: 0.8rem; font-family: monospace;
  }
  .radio-row button.active { background: #fd79a8; color: white; }
  .hint { margin: 0.25rem 0 0; font-size: 0.75rem; color: #636e72; }
  .result {
    padding: 0.75rem; background: #d1f2eb; border-radius: 6px;
    border-left: 4px solid #00b894; margin-bottom: 0.75rem;
  }
  .result.bad { background: #fdecea; border-left-color: #d63031; }
  .result-label {
    font-weight: 700; color: #00b894; margin-bottom: 0.25rem;
  }
  .result.bad .result-label { color: #d63031; }
  .result p { margin: 0; font-size: 0.85rem; color: #2d3436; }
  .code {
    padding: 1rem; background: #2d3436; border-radius: 6px;
    overflow-x: auto; margin: 0;
  }
  .code code { color: #dfe6e9; font-size: 0.85rem; line-height: 1.5; font-family: monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
