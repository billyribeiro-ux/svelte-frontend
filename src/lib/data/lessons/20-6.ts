import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-6',
		title: 'Testing & Audit',
		phase: 7,
		module: 20,
		lessonIndex: 6
	},
	description: `Before shipping, your capstone needs a comprehensive test suite and performance audit. Vitest covers unit tests for reactive modules and components, Playwright handles end-to-end user flows, and Lighthouse audits ensure you hit 95+ accessibility scores and 90+ across all categories.

This lesson shows how to structure your test suite, write meaningful tests for each layer, and run a full Lighthouse audit to identify and fix issues before deployment.`,
	objectives: [
		'Structure a test suite with unit tests (Vitest) and E2E tests (Playwright)',
		'Write tests for reactive modules, components, and user flows',
		'Run Lighthouse audits targeting 95+ accessibility and 90+ performance',
		'Create a CI pipeline that runs all tests and audits on every PR'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type TestCategory = {
    name: string;
    tool: string;
    tests: { name: string; status: 'pass' | 'fail'; time: number }[];
  };

  let testCategories = $state<TestCategory[]>([
    {
      name: 'Unit Tests — Reactive Modules',
      tool: 'Vitest',
      tests: [
        { name: 'createCounter: initializes correctly', status: 'pass', time: 2 },
        { name: 'createCounter: increment/decrement', status: 'pass', time: 1 },
        { name: 'createTheme: toggles light/dark', status: 'pass', time: 3 },
        { name: 'createTheme: persists to localStorage', status: 'pass', time: 5 },
        { name: 'formatDate: handles ISO strings', status: 'pass', time: 1 },
        { name: 'validateEmail: rejects invalid', status: 'pass', time: 1 }
      ]
    },
    {
      name: 'Component Tests',
      tool: 'Vitest + @testing-library/svelte',
      tests: [
        { name: 'Button: renders with variant', status: 'pass', time: 15 },
        { name: 'Button: fires onclick', status: 'pass', time: 12 },
        { name: 'Button: disabled state', status: 'pass', time: 10 },
        { name: 'Input: shows error state', status: 'pass', time: 18 },
        { name: 'Input: aria attributes', status: 'pass', time: 14 },
        { name: 'Card: renders slots', status: 'pass', time: 20 },
        { name: 'SEO: sets meta tags', status: 'fail', time: 25 }
      ]
    },
    {
      name: 'E2E Tests — User Flows',
      tool: 'Playwright',
      tests: [
        { name: 'Homepage loads with correct title', status: 'pass', time: 450 },
        { name: 'Navigation between pages', status: 'pass', time: 820 },
        { name: 'Blog post rendering', status: 'pass', time: 650 },
        { name: 'Contact form submission', status: 'pass', time: 1200 },
        { name: 'Dark mode toggle persists', status: 'pass', time: 900 },
        { name: 'Search returns results', status: 'pass', time: 750 },
        { name: 'Mobile responsive layout', status: 'pass', time: 500 }
      ]
    }
  ]);

  let totalTests = $derived(testCategories.flatMap(c => c.tests).length);
  let passedTests = $derived(testCategories.flatMap(c => c.tests).filter(t => t.status === 'pass').length);
  let failedTests = $derived(totalTests - passedTests);

  type LighthouseScore = {
    category: string;
    score: number;
    target: number;
    details: string[];
  };

  let lighthouseScores = $state<LighthouseScore[]>([
    {
      category: 'Performance',
      score: 94,
      target: 90,
      details: ['LCP: 1.8s (good)', 'INP: 120ms (good)', 'CLS: 0.03 (good)', 'Total Blocking Time: 150ms']
    },
    {
      category: 'Accessibility',
      score: 98,
      target: 95,
      details: ['All images have alt text', 'Color contrast passes', 'ARIA attributes valid', 'Keyboard navigation works']
    },
    {
      category: 'Best Practices',
      score: 95,
      target: 90,
      details: ['HTTPS enabled', 'No console errors', 'Proper image aspect ratios', 'No deprecated APIs']
    },
    {
      category: 'SEO',
      score: 100,
      target: 100,
      details: ['Valid title and meta', 'Crawlable links', 'Structured data valid', 'Mobile-friendly']
    }
  ]);

  function scoreColor(score: number, target: number): string {
    if (score >= target) return '#16a34a';
    if (score >= target - 10) return '#ca8a04';
    return '#dc2626';
  }

  // CI pipeline code
  const ciCode = \`# .github/workflows/ci.yml
name: Test & Audit

on:
  push: { branches: [main] }
  pull_request: { branches: [main] }

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }

      - run: pnpm install --frozen-lockfile
      - run: pnpm svelte-check
      - run: pnpm eslint .
      - run: pnpm vitest run --coverage
      - run: pnpm exec playwright install --with-deps
      - run: pnpm exec playwright test

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            coverage/
            playwright-report/

  lighthouse:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'pnpm' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: '.lighthouserc.json'
          uploadArtifacts: true\`;

  let activeTab = $state<'tests' | 'lighthouse' | 'ci'>('tests');
</script>

<main>
  <h1>Testing & Audit</h1>
  <p class="subtitle">Vitest + Playwright + Lighthouse >= 95 accessibility</p>

  <div class="summary">
    <div class="summary-item">
      <span class="big-num" style="color: #16a34a">{passedTests}</span>
      <span>passed</span>
    </div>
    <div class="summary-item">
      <span class="big-num" style="color: #dc2626">{failedTests}</span>
      <span>failed</span>
    </div>
    <div class="summary-item">
      <span class="big-num">{totalTests}</span>
      <span>total</span>
    </div>
    {#each lighthouseScores as ls}
      <div class="summary-item">
        <span class="big-num" style="color: {scoreColor(ls.score, ls.target)}">{ls.score}</span>
        <span>{ls.category}</span>
      </div>
    {/each}
  </div>

  <div class="tab-bar">
    <button class:active={activeTab === 'tests'} onclick={() => activeTab = 'tests'}>Test Results</button>
    <button class:active={activeTab === 'lighthouse'} onclick={() => activeTab = 'lighthouse'}>Lighthouse</button>
    <button class:active={activeTab === 'ci'} onclick={() => activeTab = 'ci'}>CI Pipeline</button>
  </div>

  {#if activeTab === 'tests'}
    <section>
      {#each testCategories as category}
        <div class="test-category">
          <div class="cat-header">
            <h3>{category.name}</h3>
            <span class="tool-badge">{category.tool}</span>
          </div>
          {#each category.tests as test}
            <div class="test-row" class:failed={test.status === 'fail'}>
              <span class="test-icon" style="color: {test.status === 'pass' ? '#16a34a' : '#dc2626'}">
                {test.status === 'pass' ? '\u2713' : '\u2717'}
              </span>
              <span class="test-name">{test.name}</span>
              <span class="test-time">{test.time}ms</span>
            </div>
          {/each}
        </div>
      {/each}
    </section>

  {:else if activeTab === 'lighthouse'}
    <section>
      <h2>Lighthouse Audit</h2>
      <div class="lighthouse-grid">
        {#each lighthouseScores as ls}
          <div class="lh-card">
            <div class="lh-header">
              <svg viewBox="0 0 100 100" width="70" height="70">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e0e0e0" stroke-width="6" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke={scoreColor(ls.score, ls.target)} stroke-width="6"
                  stroke-dasharray="{ls.score * 2.64} 264"
                  stroke-linecap="round" transform="rotate(-90 50 50)"
                />
                <text x="50" y="55" text-anchor="middle" font-size="22" font-weight="bold"
                  fill={scoreColor(ls.score, ls.target)}>{ls.score}</text>
              </svg>
              <div>
                <h3>{ls.category}</h3>
                <span class="target">Target: {ls.target}+</span>
              </div>
            </div>
            <ul>
              {#each ls.details as detail}
                <li>{detail}</li>
              {/each}
            </ul>
          </div>
        {/each}
      </div>
    </section>

  {:else}
    <section>
      <h2>CI Pipeline</h2>
      <pre><code>{ciCode}</code></pre>
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

  .summary {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    flex-wrap: wrap;
  }

  .summary-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    min-width: 70px;
  }

  .big-num {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .summary-item span:last-child {
    font-size: 0.75rem;
    color: #666;
  }

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

  .test-category {
    margin-bottom: 1.5rem;
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
  }

  .cat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f0f0f0;
  }

  .cat-header h3 { margin: 0; font-size: 0.95rem; }

  .tool-badge {
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    background: #4a90d9;
    color: white;
    border-radius: 4px;
  }

  .test-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 1rem;
    border-bottom: 1px solid #eee;
    font-size: 0.88rem;
  }

  .test-row.failed { background: #fef2f2; }

  .test-icon { font-weight: 700; width: 20px; text-align: center; }
  .test-name { flex: 1; }
  .test-time { color: #888; font-size: 0.78rem; }

  .lighthouse-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .lh-card {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    padding: 1.25rem;
  }

  .lh-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .lh-header h3 { margin: 0; font-size: 1rem; }
  .target { font-size: 0.8rem; color: #888; }

  .lh-card ul {
    padding-left: 1rem;
    margin: 0;
  }

  .lh-card li {
    font-size: 0.82rem;
    color: #555;
    margin-bottom: 0.25rem;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.76rem;
    line-height: 1.4;
  }

  section { margin-bottom: 2rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
