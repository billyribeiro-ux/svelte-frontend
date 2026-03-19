import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-7',
		title: 'Dynamic import() & Code Splitting',
		phase: 5,
		module: 16,
		lessonIndex: 7
	},
	description: `Dynamic import() lets you load JavaScript modules on demand rather than bundling everything upfront. This is the foundation of code splitting — breaking your application into smaller chunks that load only when needed, dramatically improving initial page load times.

In Svelte, you can dynamically import components, utility libraries, or data modules. Combined with async/await and Svelte's reactivity, you can build interfaces that lazily load heavy features on user interaction, show loading states during import, and gracefully handle import failures.`,
	objectives: [
		'Use dynamic import() to load modules on demand',
		'Implement lazy component loading with loading states',
		'Handle import failures gracefully with error boundaries',
		'Identify opportunities for code splitting in application architecture'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Simulate dynamically imported modules
  interface HeavyModule {
    processData: (input: number[]) => { sum: number; avg: number; max: number; min: number };
    formatReport: (data: { sum: number; avg: number; max: number; min: number }) => string;
  }

  let heavyModule: HeavyModule | null = $state(null);
  let moduleLoading: boolean = $state(false);
  let moduleError: string | null = $state(null);
  let reportResult: string | null = $state(null);

  let chartLoaded: boolean = $state(false);
  let chartLoading: boolean = $state(false);

  let editorLoaded: boolean = $state(false);
  let editorLoading: boolean = $state(false);

  // Simulate dynamic import of a heavy data processing module
  async function loadAnalyticsModule(): Promise<void> {
    if (heavyModule) return;
    moduleLoading = true;
    moduleError = null;

    try {
      // Simulate: const module = await import('./analytics.ts');
      await new Promise((r) => setTimeout(r, 1500));

      // Simulated module exports
      heavyModule = {
        processData(input: number[]) {
          const sum = input.reduce((a, b) => a + b, 0);
          return {
            sum,
            avg: sum / input.length,
            max: Math.max(...input),
            min: Math.min(...input),
          };
        },
        formatReport(data) {
          return \`Sum: \${data.sum.toFixed(1)} | Avg: \${data.avg.toFixed(1)} | Max: \${data.max} | Min: \${data.min}\`;
        },
      };
    } catch (e) {
      moduleError = 'Failed to load analytics module';
    } finally {
      moduleLoading = false;
    }
  }

  function runAnalysis(): void {
    if (!heavyModule) return;
    const data = Array.from({ length: 100 }, () => Math.floor(Math.random() * 1000));
    const result = heavyModule.processData(data);
    reportResult = heavyModule.formatReport(result);
  }

  // Simulate loading a chart component
  async function loadChart(): Promise<void> {
    if (chartLoaded) return;
    chartLoading = true;
    // Simulate: const { Chart } = await import('./Chart.svelte');
    await new Promise((r) => setTimeout(r, 2000));
    chartLoaded = true;
    chartLoading = false;
  }

  // Simulate loading an editor component
  async function loadEditor(): Promise<void> {
    if (editorLoaded) return;
    editorLoading = true;
    // Simulate: const { Editor } = await import('./Editor.svelte');
    await new Promise((r) => setTimeout(r, 1800));
    editorLoaded = true;
    editorLoading = false;
  }

  let sampleData = [45, 72, 38, 91, 63, 27, 84, 56];
  let maxVal = $derived(Math.max(...sampleData));
</script>

<h1>Dynamic import() & Code Splitting</h1>

<section>
  <h2>Lazy Module Loading</h2>
  <p>The analytics module is loaded only when you click the button.</p>

  {#if !heavyModule}
    <button onclick={loadAnalyticsModule} disabled={moduleLoading}>
      {#if moduleLoading}
        <span class="spinner"></span> Loading Module...
      {:else}
        Load Analytics Module
      {/if}
    </button>
  {:else}
    <div class="loaded-badge">Module Loaded</div>
    <button onclick={runAnalysis}>Run Analysis (100 random numbers)</button>
    {#if reportResult}
      <div class="result">{reportResult}</div>
    {/if}
  {/if}

  {#if moduleError}
    <div class="error">{moduleError}</div>
  {/if}

  <pre class="code"><code>// Code splitting with dynamic import
const module = await import('./analytics.ts');
const result = module.processData(data);</code></pre>
</section>

<section>
  <h2>Lazy Component Loading</h2>
  <div class="lazy-grid">
    <div class="lazy-card">
      <h3>Chart Component</h3>
      <p class="size">~250 KB (simulated)</p>
      {#if chartLoaded}
        <!-- Simulated chart rendering -->
        <div class="chart">
          {#each sampleData as val, i}
            <div
              class="bar"
              style="height: {(val / maxVal) * 100}%; background: hsl({i * 45}, 70%, 60%)"
              title="{val}"
            ></div>
          {/each}
        </div>
      {:else}
        <button onclick={loadChart} disabled={chartLoading}>
          {#if chartLoading}
            <span class="spinner"></span> Loading...
          {:else}
            Load Chart
          {/if}
        </button>
      {/if}
    </div>

    <div class="lazy-card">
      <h3>Editor Component</h3>
      <p class="size">~180 KB (simulated)</p>
      {#if editorLoaded}
        <!-- Simulated editor rendering -->
        <div class="editor">
          <div class="editor-toolbar">
            <button class="tool">B</button>
            <button class="tool">I</button>
            <button class="tool">U</button>
            <button class="tool">Link</button>
          </div>
          <textarea placeholder="Start typing..."></textarea>
        </div>
      {:else}
        <button onclick={loadEditor} disabled={editorLoading}>
          {#if editorLoading}
            <span class="spinner"></span> Loading...
          {:else}
            Load Editor
          {/if}
        </button>
      {/if}
    </div>
  </div>

  <pre class="code"><code>// Lazy component loading pattern
const &#123; default: Chart &#125; = await import('./Chart.svelte');
mount(Chart, &#123; target: el, props &#125;);</code></pre>
</section>

<section>
  <h2>Code Splitting Tips</h2>
  <ul class="tips">
    <li><strong>Route-based splitting:</strong> SvelteKit automatically code-splits per route</li>
    <li><strong>Feature-based splitting:</strong> Load heavy features (editors, charts) on demand</li>
    <li><strong>Library splitting:</strong> Import large libraries only when their function is needed</li>
    <li><strong>Preloading:</strong> Use hover or intersection observer to preload likely-needed chunks</li>
  </ul>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #00b894; font-size: 1.1rem; }
  button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #00b894; color: white; cursor: pointer; font-weight: 600;
    display: inline-flex; align-items: center; gap: 0.5rem;
  }
  button:disabled { background: #b2bec3; cursor: not-allowed; }
  .spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid white; border-top-color: transparent;
    border-radius: 50%; animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loaded-badge {
    display: inline-block; padding: 0.3rem 0.8rem; background: #00b894;
    color: white; border-radius: 12px; font-size: 0.8rem; margin-bottom: 0.75rem;
  }
  .result {
    margin-top: 0.75rem; padding: 0.5rem; background: white;
    border-radius: 4px; font-family: monospace; border: 1px solid #00b894;
  }
  .error { margin-top: 0.5rem; color: #d63031; }
  .code {
    margin-top: 1rem; padding: 0.75rem; background: #2d3436;
    border-radius: 6px; overflow-x: auto;
  }
  .code code { color: #dfe6e9; font-size: 0.8rem; }
  .lazy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .lazy-card {
    padding: 1rem; background: white; border-radius: 8px;
    border: 1px solid #dfe6e9;
  }
  .lazy-card h3 { margin-top: 0; }
  .size { font-size: 0.8rem; color: #636e72; }
  .chart {
    height: 120px; display: flex; align-items: flex-end; gap: 4px;
    padding: 0.5rem 0;
  }
  .bar { flex: 1; border-radius: 3px 3px 0 0; transition: height 0.3s; min-width: 20px; }
  .editor { border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
  .editor-toolbar {
    display: flex; gap: 2px; padding: 0.3rem; background: #f0f0f0;
    border-bottom: 1px solid #ddd;
  }
  .tool {
    padding: 0.2rem 0.5rem; background: white; border: 1px solid #ddd;
    border-radius: 3px; font-size: 0.8rem; color: #2d3436; cursor: pointer;
  }
  .editor textarea {
    width: 100%; height: 60px; border: none; padding: 0.5rem;
    resize: none; font-size: 0.9rem; box-sizing: border-box;
  }
  .tips { padding-left: 1.5rem; }
  .tips li { margin-bottom: 0.5rem; color: #636e72; }
  .tips strong { color: #2d3436; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
