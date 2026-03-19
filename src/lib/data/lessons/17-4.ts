import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-4',
		title: 'Page Options: prerender, ssr, csr, trailingSlash',
		phase: 5,
		module: 17,
		lessonIndex: 4
	},
	description: `SvelteKit lets you configure rendering behaviour per page or layout using page options. The prerender option generates static HTML at build time, ssr controls whether pages are server-rendered on each request, csr determines if client-side JavaScript hydrates the page, and trailingSlash controls URL formatting.

These options can be mixed and matched throughout your app. A marketing homepage might be prerendered for speed, an admin dashboard might use SSR + CSR for dynamic content, and a lightweight info page might disable CSR entirely for a zero-JS experience. Understanding these options lets you optimize each route independently.`,
	objectives: [
		'Configure prerender for static page generation at build time',
		'Control server-side rendering per route with the ssr option',
		'Disable client-side rendering with csr for zero-JS pages',
		'Set trailingSlash behaviour for consistent URL formatting'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  interface PageConfig {
    route: string;
    prerender: boolean | 'auto';
    ssr: boolean;
    csr: boolean;
    trailingSlash: 'always' | 'never' | 'ignore';
    description: string;
    useCase: string;
  }

  const configurations: PageConfig[] = [
    {
      route: '/',
      prerender: true, ssr: true, csr: true, trailingSlash: 'never',
      description: 'Static homepage — generated at build time',
      useCase: 'Marketing landing pages, documentation',
    },
    {
      route: '/blog/[slug]',
      prerender: true, ssr: true, csr: true, trailingSlash: 'never',
      description: 'Static blog posts — each slug prerendered',
      useCase: 'Content sites where all routes are known at build time',
    },
    {
      route: '/dashboard',
      prerender: false, ssr: true, csr: true, trailingSlash: 'never',
      description: 'Dynamic SSR + CSR — server renders, client hydrates',
      useCase: 'Authenticated pages with user-specific data',
    },
    {
      route: '/about',
      prerender: true, ssr: true, csr: false, trailingSlash: 'never',
      description: 'No JavaScript — pure HTML page',
      useCase: 'Simple info pages, maximum performance, works without JS',
    },
    {
      route: '/app',
      prerender: false, ssr: false, csr: true, trailingSlash: 'never',
      description: 'SPA mode — client-side only rendering',
      useCase: 'Complex interactive apps that don\\'t need SEO',
    },
  ];

  let selectedConfig: number = $state(0);
  let current = $derived(configurations[selectedConfig]);

  // Interactive page option builder
  let customPrerender: boolean = $state(false);
  let customSsr: boolean = $state(true);
  let customCsr: boolean = $state(true);
  let customTrailingSlash: 'always' | 'never' | 'ignore' = $state('never');

  let generatedCode = $derived(\`// +page.ts or +layout.ts
export const prerender = \${customPrerender};
export const ssr = \${customSsr};
export const csr = \${customCsr};
export const trailingSlash = '\${customTrailingSlash}';\`);

  let renderMode = $derived.by(() => {
    if (customPrerender) return 'Static (build-time)';
    if (customSsr && customCsr) return 'SSR + Hydration';
    if (customSsr && !customCsr) return 'SSR only (no JS)';
    if (!customSsr && customCsr) return 'SPA (client only)';
    return 'Nothing renders!';
  });

  let warnings = $derived.by(() => {
    const w: string[] = [];
    if (!customSsr && !customCsr) w.push('Both SSR and CSR are off — nothing will render!');
    if (customPrerender && !customSsr) w.push('Prerender requires SSR to be enabled.');
    if (!customCsr) w.push('No client-side JS — interactive features will not work.');
    return w;
  });
</script>

<h1>Page Options</h1>

<section>
  <h2>Common Configurations</h2>
  <div class="config-list">
    {#each configurations as config, i}
      <button
        class="config-item"
        class:active={selectedConfig === i}
        onclick={() => selectedConfig = i}
      >
        <code>{config.route}</code>
        <span class="desc">{config.description}</span>
      </button>
    {/each}
  </div>

  <div class="config-detail">
    <h3>{current.route}</h3>
    <div class="options">
      <div class="option" class:on={current.prerender}>prerender: {String(current.prerender)}</div>
      <div class="option" class:on={current.ssr}>ssr: {String(current.ssr)}</div>
      <div class="option" class:on={current.csr}>csr: {String(current.csr)}</div>
      <div class="option">trailingSlash: '{current.trailingSlash}'</div>
    </div>
    <p class="use-case"><strong>Use case:</strong> {current.useCase}</p>
  </div>
</section>

<section>
  <h2>Interactive Builder</h2>
  <div class="builder">
    <label>
      <input type="checkbox" bind:checked={customPrerender} />
      prerender
      <span class="option-desc">Generate static HTML at build time</span>
    </label>
    <label>
      <input type="checkbox" bind:checked={customSsr} />
      ssr
      <span class="option-desc">Render HTML on the server per request</span>
    </label>
    <label>
      <input type="checkbox" bind:checked={customCsr} />
      csr
      <span class="option-desc">Load JavaScript and hydrate on the client</span>
    </label>
    <label>
      trailingSlash:
      <select bind:value={customTrailingSlash}>
        <option value="never">never (/about)</option>
        <option value="always">always (/about/)</option>
        <option value="ignore">ignore (both work)</option>
      </select>
    </label>
  </div>

  <div class="render-mode">
    Render mode: <strong>{renderMode}</strong>
  </div>

  {#if warnings.length > 0}
    <div class="warnings">
      {#each warnings as warning}
        <p class="warning">{warning}</p>
      {/each}
    </div>
  {/if}

  <pre class="code"><code>{generatedCode}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #00b894; font-size: 1.1rem; }
  h3 { margin: 0 0 0.5rem; }
  .config-list { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1rem; }
  .config-item {
    display: flex; flex-direction: column; text-align: left;
    padding: 0.6rem; border: 1px solid #dfe6e9; border-radius: 6px;
    background: white; cursor: pointer;
  }
  .config-item.active { border-color: #00b894; background: #e8f8f0; }
  .config-item code { color: #00b894; font-weight: 700; font-size: 0.9rem; }
  .desc { font-size: 0.8rem; color: #636e72; }
  .config-detail { padding: 1rem; background: white; border-radius: 6px; border: 1px solid #dfe6e9; }
  .options { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.5rem 0; }
  .option {
    padding: 0.3rem 0.6rem; background: #dfe6e9; border-radius: 4px;
    font-family: monospace; font-size: 0.85rem; color: #636e72;
  }
  .option.on { background: #00b894; color: white; }
  .use-case { font-size: 0.9rem; color: #636e72; margin-bottom: 0; }
  .builder { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
  .builder label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
  .option-desc { font-weight: 400; font-size: 0.8rem; color: #636e72; }
  select { padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px; }
  .render-mode {
    padding: 0.5rem 0.75rem; background: #e8f8f0; border-radius: 6px;
    margin-bottom: 0.75rem; font-size: 0.95rem;
  }
  .warnings {
    padding: 0.5rem 0.75rem; background: #fff5f5; border-radius: 6px;
    margin-bottom: 0.75rem;
  }
  .warning { margin: 0.25rem 0; color: #d63031; font-size: 0.85rem; }
  .code, pre {
    background: #2d3436; padding: 0.75rem; border-radius: 6px;
    overflow-x: auto; margin: 0;
  }
  code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
