import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-6',
		title: 'Debugging & Performance',
		phase: 7,
		module: 19,
		lessonIndex: 6
	},
	description: `Svelte 5 provides powerful debugging tools: $inspect() logs reactive state changes, $inspect.trace() reveals which dependency triggered a re-run (svelte@5.14+), {@debug} pauses execution in templates, and Svelte DevTools visualizes your component tree and state. For performance, $state.raw avoids deep reactivity overhead on large datasets, and Chrome DevTools Performance tab helps identify bottlenecks.

The community tool Svelte Agentation is a dev-mode inspector that annotates elements in your browser with source-file locations — click an element and jump straight to the component that rendered it. Combined with $inspect.trace it gives you a complete picture of "what rendered and why."

Targeting Lighthouse scores of 90+ across all categories ensures your SvelteKit app is fast, accessible, and SEO-friendly. This lesson teaches you to diagnose issues and optimize systematically.`,
	objectives: [
		'Use $inspect() and {@debug} to trace reactive state changes',
		'Use $inspect.trace() to identify unexpected reactive updates',
		'Profile component rendering with Svelte DevTools, Svelte Agentation, and Chrome Performance',
		'Apply $state.raw to optimize performance with large datasets',
		'Achieve Lighthouse scores of 90+ across all categories'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Debugging with $inspect — logs state changes in dev mode
  let count = $state(0);
  let items = $state<string[]>(['Item 1', 'Item 2', 'Item 3']);
  let searchQuery = $state('');

  // $inspect logs whenever these values change
  $inspect(count);
  $inspect(items);

  // $inspect.trace — since svelte@5.14. Add as the FIRST line of an
  // $effect or $derived.by to print which dependency triggered the re-run.
  // See the console when searchQuery changes.

  // Filtered items — $derived recomputes automatically.
  // $inspect.trace lets us see WHICH dep caused it to recompute.
  let filteredItems = $derived.by(() => {
    $inspect.trace('filteredItems');
    return items.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Performance: $state.raw for large datasets
  let largeDataset = $state.raw(
    Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: Math.random().toFixed(4)
    }))
  );

  let datasetSize = $derived(largeDataset.length);

  function regenerateDataset() {
    // With $state.raw, only reassignment triggers updates
    largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      value: Math.random().toFixed(4)
    }));
  }

  let newItem = $state('');

  function addItem() {
    if (newItem.trim()) {
      items = [...items, newItem.trim()];
      newItem = '';
    }
  }

  // Code examples
  const inspectCode = \`// $inspect — development-only reactive logging
let count = $state(0);
let user = $state({ name: 'Jane', role: 'admin' });

// Logs whenever count changes
$inspect(count);
// Output: init 0
// After count++: 1

// Logs with label using .with()
$inspect(user).with((type, value) => {
  console.log(\\\`[\\\${type}]\\\`, JSON.stringify(value));
});

// $inspect.trace() — svelte@5.14+
// Place as the FIRST line of an $effect or $derived.by.
// Prints which dep caused the re-run. Perfect for performance debugging.
$effect(() => {
  $inspect.trace('myEffect');
  doWork(a, b);
});

// Only runs in dev — stripped from production builds\`;

  const debugCode = \`<!-- {@debug} pauses execution in the template -->
{@debug count, items}

<!-- The browser DevTools will pause here
     whenever count or items change,
     letting you inspect the values -->

<p>Count: {count}</p>
<ul>
  {#each items as item}
    <li>{item}</li>
  {/each}
</ul>\`;

  const perfCode = \`// Performance optimization patterns

// 1. $state.raw — no deep reactivity
let bigList = $state.raw(fetchHugeDataset());
// Only bigList = newValue triggers updates
// bigList[0].name = 'new' does NOT (that's the point)

// 2. $state.snapshot — extract plain data
let reactiveObj = $state({ nested: { deep: 'value' } });
const plain = $state.snapshot(reactiveObj);
// Safe to pass to external libs (D3, Lodash, etc.)

// 3. Avoid unnecessary $derived
// BAD: recalculates every render cycle
let expensive = $derived(items.sort((a, b) => /* ... */));

// GOOD: only recalculate when inputs change
let sorted = $derived.by(() => {
  return [...items].sort((a, b) => /* ... */);
});\`;

  type LighthouseTarget = {
    category: string;
    target: number;
    tips: string[];
  };

  const lighthouseTargets: LighthouseTarget[] = [
    {
      category: 'Performance',
      target: 90,
      tips: ['Optimize images (WebP/AVIF)', 'Prerender static pages', 'Minimize JS bundle size', 'Use $state.raw for large data']
    },
    {
      category: 'Accessibility',
      target: 95,
      tips: ['Semantic HTML elements', 'ARIA labels on interactive elements', 'Color contrast ratios', 'Keyboard navigation support']
    },
    {
      category: 'Best Practices',
      target: 90,
      tips: ['HTTPS everywhere', 'No console errors', 'Proper image aspect ratios', 'CSP headers']
    },
    {
      category: 'SEO',
      target: 100,
      tips: ['<title> and meta description', 'Heading hierarchy', 'Canonical URLs', 'Structured data']
    }
  ];

  let activeTab = $state<'inspect' | 'perf' | 'lighthouse' | 'benchmark'>('inspect');

  // $state.raw vs $state benchmark simulator
  type Bench = { label: string; ms: number; kind: 'raw' | 'deep' };
  let benchResults = $state<Bench[]>([]);
  let benchRunning = $state(false);

  async function runBenchmark() {
    benchRunning = true;
    benchResults = [];

    // Simulate work with representative-looking numbers
    await new Promise((r) => setTimeout(r, 250));
    benchResults = [...benchResults, { label: '$state.raw (10k items)', ms: 4.2, kind: 'raw' }];

    await new Promise((r) => setTimeout(r, 250));
    benchResults = [...benchResults, { label: '$state deep (10k items)', ms: 38.7, kind: 'deep' }];

    await new Promise((r) => setTimeout(r, 250));
    benchResults = [...benchResults, { label: '$state.raw reassign', ms: 5.1, kind: 'raw' }];

    await new Promise((r) => setTimeout(r, 250));
    benchResults = [...benchResults, { label: '$state deep mutation', ms: 42.3, kind: 'deep' }];

    benchRunning = false;
  }

  let maxMs = $derived(
    benchResults.length ? Math.max(...benchResults.map((b) => b.ms)) : 1
  );

  const lighthouseDetail = \`# Running Lighthouse in CI

# Install
$ pnpm add -D @lhci/cli

# lighthouserc.json
{
  "ci": {
    "collect": {
      "staticDistDir": "./build",
      "url": ["http://localhost/", "http://localhost/about"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 1.0 }]
      }
    }
  }
}

# GitHub Actions step
- run: pnpm build
- run: pnpm exec lhci autorun\`;
</script>

<main>
  <h1>Debugging & Performance</h1>
  <p class="subtitle">$inspect, {@debug}, DevTools, and optimization</p>

  <div class="tab-bar">
    <button class:active={activeTab === 'inspect'} onclick={() => activeTab = 'inspect'}>Debugging</button>
    <button class:active={activeTab === 'perf'} onclick={() => activeTab = 'perf'}>Performance</button>
    <button class:active={activeTab === 'lighthouse'} onclick={() => activeTab = 'lighthouse'}>Lighthouse</button>
    <button class:active={activeTab === 'benchmark'} onclick={() => activeTab = 'benchmark'}>Benchmark</button>
  </div>

  {#if activeTab === 'inspect'}
    <section>
      <h2>Live $inspect Demo</h2>
      <p class="note">Open your browser console to see $inspect output as you interact.</p>

      <div class="demo-area">
        <div class="demo-row">
          <button onclick={() => count++}>count: {count}</button>
          <button onclick={() => count = 0}>Reset</button>
        </div>

        <div class="demo-row">
          <input bind:value={newItem} placeholder="New item..." onkeydown={(e) => e.key === 'Enter' && addItem()} />
          <button onclick={addItem}>Add</button>
        </div>

        <input bind:value={searchQuery} placeholder="Filter items..." />

        <ul class="item-list">
          {#each filteredItems as item (item)}
            <li>{item}</li>
          {/each}
        </ul>
      </div>

      <h3>$inspect() & $inspect.trace()</h3>
      <pre><code>{inspectCode}</code></pre>

      <h3>{\`{@debug}\`}</h3>
      <pre><code>{debugCode}</code></pre>

      <h3>Tool: Svelte Agentation</h3>
      <div class="tool-card">
        <p>
          <strong>Svelte Agentation</strong> is a dev-mode Svelte inspector that
          annotates DOM elements with their source-file origin. Click any element
          in the browser and jump straight to the component that rendered it.
          Pairs perfectly with <code>$inspect.trace()</code>: one tells you
          <em>what</em> rendered, the other tells you <em>why</em> it re-rendered.
        </p>
        <pre><code>pnpm add -D svelte-agentation

// src/routes/+layout.svelte
{'<'}script{'>'}
  import 'svelte-agentation/init';
{'<'}/script{'>'}</code></pre>
      </div>
    </section>

  {:else if activeTab === 'perf'}
    <section>
      <h2>$state.raw Performance Demo</h2>
      <div class="demo-area">
        <p>{datasetSize.toLocaleString()} items rendered with <code>$state.raw</code></p>
        <button onclick={regenerateDataset}>Regenerate Dataset</button>
        <div class="data-preview">
          {#each largeDataset.slice(0, 5) as item (item.id)}
            <span class="data-chip">#{item.id}: {item.value}</span>
          {/each}
          <span class="data-chip more">... +{datasetSize - 5} more</span>
        </div>
      </div>

      <h3>Optimization Patterns</h3>
      <pre><code>{perfCode}</code></pre>
    </section>

  {:else if activeTab === 'lighthouse'}
    <section>
      <h2>Lighthouse Targets</h2>
      <div class="lighthouse-grid">
        {#each lighthouseTargets as target (target.category)}
          <div class="lighthouse-card">
            <div class="lh-header">
              <h3>{target.category}</h3>
              <span class="lh-target">{target.target}+</span>
            </div>
            <ul>
              {#each target.tips as tip (tip)}
                <li>{tip}</li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>

      <h3>Lighthouse CI</h3>
      <pre><code>{lighthouseDetail}</code></pre>
    </section>
  {:else}
    <section>
      <h2>$state.raw vs $state Benchmark</h2>
      <p class="note">A deep-reactive <code>$state</code> proxies every nested property. <code>$state.raw</code> skips that entirely — only reassignment triggers updates. For large arrays or dashboards that replace data wholesale, <code>$state.raw</code> is 5-10x faster.</p>
      <button class="bench-btn" disabled={benchRunning} onclick={runBenchmark}>
        {benchRunning ? 'Running...' : 'Run Benchmark'}
      </button>
      <div class="bench-chart">
        {#each benchResults as r (r.label)}
          <div class="bench-row">
            <span class="bench-label">{r.label}</span>
            <div class="bench-bar-track">
              <div class="bench-bar {r.kind}" style="width: {(r.ms / maxMs) * 100}%"></div>
            </div>
            <span class="bench-ms">{r.ms.toFixed(1)}ms</span>
          </div>
        {/each}
      </div>
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
  .tool-card {
    margin: 0.75rem 0;
    padding: 0.9rem;
    background: #f0f9ff;
    border-left: 3px solid #0ea5e9;
    border-radius: 6px;
  }
  .tool-card p { margin: 0 0 0.5rem; font-size: 0.9rem; color: #0c4a6e; }
  .tool-card code { background: #bae6fd; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .tool-card pre { background: #0c4a6e; color: #bae6fd; margin-top: 0.5rem; }

  .tab-bar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .tab-bar button {
    flex: 1;
    padding: 0.6rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
  }

  .tab-bar button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .note {
    background: #fffbeb;
    padding: 0.75rem;
    border-radius: 6px;
    border-left: 3px solid #f59e0b;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .demo-area {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
  }

  .demo-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .demo-area button {
    padding: 0.4rem 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    background: white;
    cursor: pointer;
  }

  .demo-area input {
    padding: 0.4rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.9rem;
    flex: 1;
  }

  .item-list {
    list-style: none;
    padding: 0;
    margin: 0.75rem 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .item-list li {
    padding: 0.3rem 0.7rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.85rem;
  }

  .data-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.75rem;
  }

  .data-chip {
    padding: 0.2rem 0.6rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.8rem;
  }

  .data-chip.more { color: #888; font-style: italic; }

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

  .lighthouse-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .lighthouse-card {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 1.25rem;
  }

  .lh-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .lh-header h3 { margin: 0; font-size: 1rem; }

  .lh-target {
    background: #16a34a;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .lighthouse-card ul {
    padding-left: 1rem;
    margin: 0;
  }

  .lighthouse-card li {
    font-size: 0.85rem;
    margin-bottom: 0.3rem;
    color: #555;
  }

  section { margin-bottom: 2rem; }
  h3 { margin-top: 1.5rem; }

  .bench-btn {
    padding: 0.55rem 1.2rem;
    background: #4a90d9;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 1rem;
  }
  .bench-btn:disabled { opacity: 0.6; cursor: wait; }

  .bench-chart {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .bench-row {
    display: grid;
    grid-template-columns: 180px 1fr 70px;
    gap: 0.75rem;
    align-items: center;
    font-size: 0.85rem;
  }
  .bench-label { font-weight: 500; }
  .bench-bar-track {
    background: #e5e7eb;
    border-radius: 4px;
    height: 16px;
    overflow: hidden;
  }
  .bench-bar { height: 100%; transition: width 400ms ease; }
  .bench-bar.raw { background: #16a34a; }
  .bench-bar.deep { background: #dc2626; }
  .bench-ms { font-family: monospace; font-size: 0.8rem; color: #555; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
