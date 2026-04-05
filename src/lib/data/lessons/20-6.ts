import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-6',
		title: 'Testing & Audit',
		phase: 7,
		module: 20,
		lessonIndex: 6
	},
	description: `Before shipping your capstone you need a full quality gate: Vitest unit tests for pure utilities, rune modules, and components; Playwright E2E tests for the critical user flows; Lighthouse audits that enforce Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, and SEO = 100. All three run in CI on every pull request so nothing ships without passing.

This lesson pulls together everything from Module 19's testing lessons and shows you the test suite layout, a realistic CI pipeline, and a pre-deploy checklist you can actually ship against.`,
	objectives: [
		'Structure unit tests, component tests, and E2E tests in one project',
		'Write tests that cover each critical user flow of the capstone',
		'Configure Lighthouse CI with per-category score assertions',
		'Build a complete CI pipeline: lint → check → unit → e2e → lighthouse',
		'Work through a pre-deploy checklist with zero outstanding issues'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'strategy' | 'unit' | 'e2e' | 'lighthouse' | 'ci' | 'checklist';
  let activeTab = $state<Tab>('strategy');

  // Pre-deploy checklist
  type Check = { id: string; label: string; done: boolean; required: boolean };
  let checklist = $state<Check[]>([
    { id: 'types',    label: 'pnpm check passes with zero errors', done: false, required: true },
    { id: 'lint',     label: 'pnpm lint passes', done: false, required: true },
    { id: 'unit',     label: 'All unit tests pass (pnpm test:unit)', done: false, required: true },
    { id: 'e2e',      label: 'All E2E tests pass on Chromium + Firefox + WebKit', done: false, required: true },
    { id: 'build',    label: 'pnpm build succeeds with no warnings', done: false, required: true },
    { id: 'preview',  label: 'pnpm preview smoke-tested manually', done: false, required: true },
    { id: 'lh-perf',  label: 'Lighthouse Performance ≥ 90', done: false, required: true },
    { id: 'lh-a11y',  label: 'Lighthouse Accessibility ≥ 95', done: false, required: true },
    { id: 'lh-bp',    label: 'Lighthouse Best Practices ≥ 90', done: false, required: true },
    { id: 'lh-seo',   label: 'Lighthouse SEO = 100', done: false, required: true },
    { id: 'og',       label: 'OG images exist for every page', done: false, required: false },
    { id: 'sitemap',  label: 'sitemap.xml returns 200 and lists all routes', done: false, required: true },
    { id: 'robots',   label: 'robots.txt returns 200 and points to sitemap', done: false, required: true },
    { id: 'env',      label: 'Production env vars set on hosting platform', done: false, required: true }
  ]);

  let doneCount = $derived(checklist.filter((c) => c.done).length);
  let totalRequired = $derived(checklist.filter((c) => c.required).length);
  let doneRequired = $derived(checklist.filter((c) => c.required && c.done).length);
  let percent = $derived(Math.round((doneCount / checklist.length) * 100));
  let readyToShip = $derived(doneRequired === totalRequired);

  function toggle(id: string) {
    checklist = checklist.map((c) => (c.id === id ? { ...c, done: !c.done } : c));
  }

  // Lighthouse score simulator
  let perfScore = $state(87);
  let a11yScore = $state(94);
  let bpScore = $state(92);
  let seoScore = $state(100);

  function scoreColor(score: number): string {
    if (score >= 90) return '#16a34a';
    if (score >= 50) return '#f59e0b';
    return '#dc2626';
  }

  const unitCode = \`// src/lib/state/cart.svelte.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { flushSync } from 'svelte';
import { createCart } from './cart.svelte';

describe('cart', () => {
  let cart: ReturnType<typeof createCart>;

  beforeEach(() => {
    cart = createCart();
  });

  it('starts empty', () => {
    expect(cart.items).toEqual([]);
    expect(cart.total).toBe(0);
  });

  it('adds items and updates total', () => {
    cart.add({ id: 'shirt', name: 'Shirt', price: 25, qty: 2 });
    flushSync();
    expect(cart.total).toBe(50);
  });

  it('merges duplicate items', () => {
    cart.add({ id: 'shirt', name: 'Shirt', price: 25, qty: 1 });
    cart.add({ id: 'shirt', name: 'Shirt', price: 25, qty: 1 });
    flushSync();
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(2);
  });

  it('removes items', () => {
    cart.add({ id: 'shirt', name: 'Shirt', price: 25, qty: 1 });
    cart.remove('shirt');
    flushSync();
    expect(cart.items).toEqual([]);
  });
});\`;

  const e2eCode = \`// e2e/critical-paths.spec.ts
import { expect, test } from '@playwright/test';

test.describe('critical user flows', () => {
  test('homepage loads and nav works', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Acme/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.getByRole('link', { name: 'Features' }).click();
    await expect(page).toHaveURL('/features');
  });

  test('blog post renders', async ({ page }) => {
    await page.goto('/blog');
    await page.getByRole('link').first().click();
    await expect(page.getByRole('article')).toBeVisible();
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
  });

  test('sign up flow', async ({ page }) => {
    await page.goto('/signup');
    await page.getByLabel('Name').fill('Jane Doe');
    await page.getByLabel('Email').fill('jane@example.com');
    await page.getByLabel('Password').fill('hunter2hunter2');
    await page.getByRole('button', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/welcome, jane/i)).toBeVisible();
  });

  test('sitemap is reachable', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('xml');
  });
});\`;

  const lighthouseCode = \`// lighthouserc.json
{
  "ci": {
    "collect": {
      "staticDistDir": "./build",
      "url": [
        "http://localhost/",
        "http://localhost/features",
        "http://localhost/blog",
        "http://localhost/blog/hello-world"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance":    ["error", { "minScore": 0.9 }],
        "categories:accessibility":  ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo":            ["error", { "minScore": 1.0 }],
        "cumulative-layout-shift":   ["error", { "maxNumericValue": 0.1 }],
        "largest-contentful-paint":  ["error", { "maxNumericValue": 2500 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}\`;

  const ciCode = \`# .github/workflows/ci.yml — full quality gate
name: CI
on: [pull_request, push]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm check
      - run: pnpm lint
      - run: pnpm test:unit --run

  e2e:
    runs-on: ubuntu-latest
    needs: quality
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps \${{ matrix.browser }}
      - run: pnpm exec playwright test --project=\${{ matrix.browser }}

  lighthouse:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm dlx @lhci/cli autorun\`;
</script>

<main>
  <h1>Testing & Audit</h1>
  <p class="subtitle">The quality gate before deployment</p>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'strategy'} onclick={() => (activeTab = 'strategy')}>Strategy</button>
    <button class:active={activeTab === 'unit'} onclick={() => (activeTab = 'unit')}>Unit</button>
    <button class:active={activeTab === 'e2e'} onclick={() => (activeTab = 'e2e')}>E2E</button>
    <button class:active={activeTab === 'lighthouse'} onclick={() => (activeTab = 'lighthouse')}>Lighthouse</button>
    <button class:active={activeTab === 'ci'} onclick={() => (activeTab = 'ci')}>CI</button>
    <button class:active={activeTab === 'checklist'} onclick={() => (activeTab = 'checklist')}>Checklist</button>
  </nav>

  {#if activeTab === 'strategy'}
    <section>
      <h2>Testing Pyramid</h2>
      <div class="pyramid">
        <div class="pyr-layer e2e">E2E — critical flows (Playwright)</div>
        <div class="pyr-layer comp">Component — @testing-library/svelte</div>
        <div class="pyr-layer unit">Unit — pure functions + runes (Vitest)</div>
      </div>
      <p class="note">Write many cheap unit tests, fewer component tests, and a small E2E suite that covers only the flows that would break the business if they failed.</p>
    </section>
  {:else if activeTab === 'unit'}
    <section>
      <h2>Unit & Rune Tests</h2>
      <pre><code>{unitCode}</code></pre>
    </section>
  {:else if activeTab === 'e2e'}
    <section>
      <h2>E2E Critical Path Tests</h2>
      <pre><code>{e2eCode}</code></pre>
    </section>
  {:else if activeTab === 'lighthouse'}
    <section>
      <h2>Lighthouse Targets</h2>
      <div class="lh-grid">
        <div class="lh-circle">
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#eee" stroke-width="8" /><circle cx="50" cy="50" r="46" fill="none" stroke={scoreColor(perfScore)} stroke-width="8" stroke-dasharray={\`\${(perfScore / 100) * 289} 289\`} transform="rotate(-90 50 50)" /></svg>
          <div class="lh-num">{perfScore}</div>
          <div class="lh-label">Performance</div>
        </div>
        <div class="lh-circle">
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#eee" stroke-width="8" /><circle cx="50" cy="50" r="46" fill="none" stroke={scoreColor(a11yScore)} stroke-width="8" stroke-dasharray={\`\${(a11yScore / 100) * 289} 289\`} transform="rotate(-90 50 50)" /></svg>
          <div class="lh-num">{a11yScore}</div>
          <div class="lh-label">Accessibility</div>
        </div>
        <div class="lh-circle">
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#eee" stroke-width="8" /><circle cx="50" cy="50" r="46" fill="none" stroke={scoreColor(bpScore)} stroke-width="8" stroke-dasharray={\`\${(bpScore / 100) * 289} 289\`} transform="rotate(-90 50 50)" /></svg>
          <div class="lh-num">{bpScore}</div>
          <div class="lh-label">Best Practices</div>
        </div>
        <div class="lh-circle">
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#eee" stroke-width="8" /><circle cx="50" cy="50" r="46" fill="none" stroke={scoreColor(seoScore)} stroke-width="8" stroke-dasharray={\`\${(seoScore / 100) * 289} 289\`} transform="rotate(-90 50 50)" /></svg>
          <div class="lh-num">{seoScore}</div>
          <div class="lh-label">SEO</div>
        </div>
      </div>

      <div class="simulate">
        <p>Simulate scores:</p>
        <label>Performance <input type="range" min="0" max="100" bind:value={perfScore} /></label>
        <label>Accessibility <input type="range" min="0" max="100" bind:value={a11yScore} /></label>
        <label>Best Practices <input type="range" min="0" max="100" bind:value={bpScore} /></label>
        <label>SEO <input type="range" min="0" max="100" bind:value={seoScore} /></label>
      </div>

      <pre><code>{lighthouseCode}</code></pre>
    </section>
  {:else if activeTab === 'ci'}
    <section>
      <h2>Full CI Pipeline</h2>
      <pre><code>{ciCode}</code></pre>
    </section>
  {:else}
    <section>
      <h2>Pre-Deploy Checklist</h2>
      <div class="progress">
        <div class="progress-bar"><div class="progress-fill" class:ready={readyToShip} style="width: {percent}%"></div></div>
        <span class="progress-num">{doneCount} / {checklist.length}</span>
      </div>

      <div class="check-list">
        {#each checklist as c (c.id)}
          <button class="check-row" class:done={c.done} onclick={() => toggle(c.id)}>
            <span class="cbox">{c.done ? '✓' : ''}</span>
            <span class="c-label">{c.label}</span>
            {#if c.required}<span class="c-req">required</span>{/if}
          </button>
        {/each}
      </div>

      {#if readyToShip}
        <div class="ready-banner">All required checks pass. Ready for lesson 20-7 — deploy.</div>
      {/if}
    </section>
  {/if}
</main>

<style>
  main { max-width: 940px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .tabs { display: flex; gap: 0.35rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
  .tabs button { padding: 0.55rem 1rem; border: none; background: transparent; border-radius: 6px 6px 0 0; font-weight: 500; cursor: pointer; font-size: 0.86rem; }
  .tabs button.active { background: #eef4fb; color: #1e40af; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }

  .pyramid { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; margin: 1rem 0; }
  .pyr-layer {
    padding: 0.8rem 1.5rem;
    color: white;
    font-weight: 700;
    text-align: center;
    border-radius: 6px;
  }
  .pyr-layer.e2e { background: #dc2626; width: 40%; }
  .pyr-layer.comp { background: #f59e0b; width: 65%; }
  .pyr-layer.unit { background: #16a34a; width: 90%; }

  .note { background: #fffbeb; border-left: 3px solid #f59e0b; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.75rem;
    line-height: 1.5;
    max-height: 620px;
  }
  pre code { background: none; padding: 0; }
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }

  .lh-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin: 1rem 0; }
  @media (max-width: 700px) { .lh-grid { grid-template-columns: 1fr 1fr; } }
  .lh-circle { position: relative; text-align: center; }
  .lh-circle svg { width: 100px; height: 100px; }
  .lh-num { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -65%); font-size: 1.5rem; font-weight: 800; }
  .lh-label { font-size: 0.8rem; color: #666; margin-top: -0.3rem; }

  .simulate { background: #f8f9fa; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.85rem; }
  .simulate p { margin: 0 0 0.5rem; font-weight: 600; }
  .simulate label { display: grid; grid-template-columns: 140px 1fr; gap: 0.5rem; align-items: center; margin-bottom: 0.35rem; }

  .progress { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }
  .progress-bar { flex: 1; background: #e5e7eb; border-radius: 999px; height: 10px; overflow: hidden; }
  .progress-fill { background: #4a90d9; height: 100%; transition: width 200ms; }
  .progress-fill.ready { background: #16a34a; }
  .progress-num { font-weight: 700; font-family: monospace; font-size: 0.85rem; }

  .check-list { display: flex; flex-direction: column; gap: 0.3rem; }
  .check-row {
    display: grid;
    grid-template-columns: 24px 1fr auto;
    gap: 0.6rem;
    align-items: center;
    padding: 0.55rem 0.8rem;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    font-size: 0.88rem;
  }
  .check-row.done { background: #dcfce7; border-color: #16a34a; }
  .cbox {
    width: 22px; height: 22px;
    border: 2px solid #888;
    border-radius: 4px;
    display: grid;
    place-items: center;
    font-weight: bold;
    color: #16a34a;
  }
  .check-row.done .cbox { border-color: #16a34a; }
  .c-req {
    background: #fee2e2;
    color: #991b1b;
    padding: 0.1rem 0.4rem;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
  }
  .check-row.done .c-req { background: #dcfce7; color: #166534; }

  .ready-banner {
    margin-top: 1rem;
    padding: 1rem;
    background: #dcfce7;
    border-radius: 10px;
    text-align: center;
    font-weight: 700;
    color: #166534;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
