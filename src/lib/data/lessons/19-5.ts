import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-5',
		title: 'E2E Testing with Playwright',
		phase: 7,
		module: 19,
		lessonIndex: 5
	},
	description: `Playwright drives a real browser — Chromium, Firefox, and WebKit — against your built SvelteKit app. Unlike unit tests, E2E tests verify user-visible behavior: navigation, form submission, authentication flows, and the interaction between your client and server code. SvelteKit scaffolds Playwright when you answer "yes" to the testing prompt in \`sv create\`.

The locator API is the heart of Playwright. Instead of brittle CSS selectors, you query by role, label, and text — the same way a user finds things on the page. Combined with auto-waiting assertions (toBeVisible, toHaveText) the tests are stable and readable.`,
	objectives: [
		'Configure playwright.config.ts with webServer, projects, and baseURL',
		'Write tests using locators (getByRole, getByLabel, getByText)',
		'Use auto-waiting assertions (toBeVisible, toHaveURL, toHaveText)',
		'Run tests across Chromium, Firefox and WebKit in CI',
		'Debug failing tests with traces and the UI mode'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'config' | 'basics' | 'forms' | 'ci' | 'simulator';
  let activeTab = $state<Tab>('config');

  // Interactive "test runner" simulator
  type Step = {
    action: string;
    target: string;
    expected: string;
    status: 'pending' | 'running' | 'pass' | 'fail';
  };

  let steps = $state<Step[]>([
    { action: 'goto', target: '/', expected: 'page loads with status 200', status: 'pending' },
    { action: 'getByRole', target: "heading name='Welcome'", expected: 'is visible', status: 'pending' },
    { action: 'getByRole', target: "link name='Sign in'", expected: 'is visible', status: 'pending' },
    { action: 'click', target: "link 'Sign in'", expected: 'navigates to /login', status: 'pending' },
    { action: 'getByLabel', target: "'Email'", expected: 'is editable', status: 'pending' },
    { action: 'fill', target: "Email = 'me@example.com'", expected: 'value committed', status: 'pending' },
    { action: 'fill', target: "Password = '••••••••'", expected: 'value committed', status: 'pending' },
    { action: 'click', target: "button 'Log in'", expected: 'navigates to /dashboard', status: 'pending' },
    { action: 'getByText', target: "'Welcome back, Jane'", expected: 'is visible', status: 'pending' }
  ]);

  let running = $state(false);
  let currentBrowser = $state<'chromium' | 'firefox' | 'webkit'>('chromium');

  async function runFlow() {
    running = true;
    steps = steps.map((s) => ({ ...s, status: 'pending' as const }));

    for (let i = 0; i < steps.length; i++) {
      const next = [...steps];
      next[i] = { ...next[i], status: 'running' };
      steps = next;

      await new Promise((r) => setTimeout(r, 350));

      const pass = Math.random() > 0.08;
      const done = [...steps];
      done[i] = { ...done[i], status: pass ? 'pass' : 'fail' };
      steps = done;

      if (!pass) break;
    }

    running = false;
  }

  const configCode = \`// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],

  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  webServer: {
    command: 'pnpm build && pnpm preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },

  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox',  use: devices['Desktop Firefox'] },
    { name: 'webkit',   use: devices['Desktop Safari'] },
    { name: 'mobile',   use: devices['iPhone 14'] }
  ]
});\`;

  const basicsCode = \`// e2e/home.spec.ts
import { expect, test } from '@playwright/test';

test('home page loads', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/SvelteKit/);
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});

test('nav menu works', async ({ page }) => {
  await page.goto('/');

  // Prefer semantic locators — mirror how users find things
  await page.getByRole('link', { name: 'About' }).click();

  await expect(page).toHaveURL('/about');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About us');
});

test('mobile menu opens', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile' })).toBeVisible();
});\`;

  const formsCode = \`// e2e/auth.spec.ts
import { expect, test } from '@playwright/test';

test.describe('login flow', () => {
  test('happy path', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('hunter2!');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });

  test('shows validation errors', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('rejects invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('wrong@example.com');
    await page.getByLabel('Password').fill('nope');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByRole('alert')).toHaveText(/invalid credentials/i);
  });
});\`;

  const ciCode = \`# .github/workflows/e2e.yml
name: E2E

on: [pull_request, push]

jobs:
  e2e:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        project: [chromium, firefox, webkit]

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }

      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps \${{ matrix.project }}

      - run: pnpm exec playwright test --project=\${{ matrix.project }}

      - uses: actions/upload-artifact@v4
        if: \${{ failure() }}
        with:
          name: playwright-report-\${{ matrix.project }}
          path: playwright-report/\`;
</script>

<main>
  <h1>E2E Testing with Playwright</h1>
  <p class="subtitle">Real browsers, real users, real regressions caught</p>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'config'} onclick={() => (activeTab = 'config')}>Config</button>
    <button class:active={activeTab === 'basics'} onclick={() => (activeTab = 'basics')}>Basics</button>
    <button class:active={activeTab === 'forms'} onclick={() => (activeTab = 'forms')}>Forms</button>
    <button class:active={activeTab === 'ci'} onclick={() => (activeTab = 'ci')}>CI</button>
    <button class:active={activeTab === 'simulator'} onclick={() => (activeTab = 'simulator')}>Simulator</button>
  </nav>

  {#if activeTab === 'config'}
    <section>
      <h2>playwright.config.ts</h2>
      <p>SvelteKit's scaffolding generates this file. The <code>webServer</code> block builds and previews your app; <code>projects</code> runs the same tests across browsers.</p>
      <pre><code>{configCode}</code></pre>
    </section>
  {:else if activeTab === 'basics'}
    <section>
      <h2>Navigation & Locators</h2>
      <p>Locators auto-retry until they succeed (or the test times out). You never need manual <code>sleep()</code>.</p>
      <pre><code>{basicsCode}</code></pre>

      <h3>Locator priority</h3>
      <ol class="locator-list">
        <li><code>getByRole</code> — what assistive tech sees</li>
        <li><code>getByLabel</code> — form inputs</li>
        <li><code>getByPlaceholder</code> — inputs without labels</li>
        <li><code>getByText</code> — visible copy</li>
        <li><code>getByTestId</code> — last resort for elements with no semantics</li>
      </ol>
    </section>
  {:else if activeTab === 'forms'}
    <section>
      <h2>Forms & Assertions</h2>
      <pre><code>{formsCode}</code></pre>

      <h3>Common assertions</h3>
      <table class="assertions">
        <thead><tr><th>Assertion</th><th>Checks</th></tr></thead>
        <tbody>
          <tr><td><code>toBeVisible()</code></td><td>Element is in the DOM and rendered</td></tr>
          <tr><td><code>toHaveText(text)</code></td><td>Exact or regex text match</td></tr>
          <tr><td><code>toHaveValue(value)</code></td><td>Form element value</td></tr>
          <tr><td><code>toHaveURL(url)</code></td><td>Page navigated to URL</td></tr>
          <tr><td><code>toBeEnabled()</code></td><td>Control is interactive</td></tr>
          <tr><td><code>toHaveCount(n)</code></td><td>Locator matches n elements</td></tr>
        </tbody>
      </table>
    </section>
  {:else if activeTab === 'ci'}
    <section>
      <h2>Multi-Browser CI</h2>
      <p>Matrix strategy runs each browser in parallel. Upload the HTML report on failure for debugging.</p>
      <pre><code>{ciCode}</code></pre>
    </section>
  {:else}
    <section>
      <h2>Login Flow Simulator</h2>
      <p>Watch a Playwright run step-by-step against a simulated login flow.</p>

      <div class="sim-header">
        <div class="browser-picker">
          {#each ['chromium', 'firefox', 'webkit'] as const as b (b)}
            <button
              class="browser-btn"
              class:active={currentBrowser === b}
              onclick={() => (currentBrowser = b)}
            >{b}</button>
          {/each}
        </div>
        <button class="run-btn" disabled={running} onclick={runFlow}>
          {running ? 'Running...' : 'Run Test'}
        </button>
      </div>

      <div class="flow">
        {#each steps as step, i (i)}
          <div class="step {step.status}">
            <span class="step-num">{i + 1}</span>
            <span class="step-action">{step.action}</span>
            <span class="step-target">{step.target}</span>
            <span class="step-expect">→ {step.expected}</span>
            <span class="step-icon">
              {#if step.status === 'pass'}✓{:else if step.status === 'fail'}✗{:else if step.status === 'running'}…{:else}○{/if}
            </span>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</main>

<style>
  main { max-width: 920px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .tabs { display: flex; gap: 0.35rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
  .tabs button { padding: 0.55rem 1rem; border: none; background: transparent; border-radius: 6px 6px 0 0; font-weight: 500; cursor: pointer; }
  .tabs button.active { background: #eef4fb; color: #1e40af; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.76rem;
    line-height: 1.45;
    max-height: 560px;
  }
  pre code { background: none; padding: 0; }
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85rem; }

  .locator-list li { margin: 0.35rem 0; }

  .assertions { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  .assertions th, .assertions td { padding: 0.55rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
  .assertions th { background: #f0f0f0; }

  .sim-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
  .browser-picker { display: flex; gap: 0.25rem; }
  .browser-btn {
    padding: 0.35rem 0.8rem;
    border: 1px solid #ccc;
    background: white;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
  }
  .browser-btn.active { background: #4a90d9; color: white; border-color: #4a90d9; }

  .run-btn {
    padding: 0.55rem 1.2rem;
    background: #16a34a;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .run-btn:disabled { opacity: 0.6; cursor: wait; }

  .flow { display: flex; flex-direction: column; gap: 0.4rem; font-family: monospace; font-size: 0.8rem; }
  .step {
    display: grid;
    grid-template-columns: 30px 90px 1fr 1.3fr 24px;
    gap: 0.5rem;
    padding: 0.45rem 0.7rem;
    background: #f8f9fa;
    border-radius: 6px;
    align-items: center;
    border-left: 3px solid #ccc;
  }
  .step.running { border-left-color: #f59e0b; background: #fffbeb; }
  .step.pass { border-left-color: #16a34a; background: #dcfce7; }
  .step.fail { border-left-color: #dc2626; background: #fee2e2; }
  .step-num { color: #888; }
  .step-action { font-weight: 700; color: #1e40af; }
  .step-target { color: #111; }
  .step-expect { color: #666; font-style: italic; }
  .step-icon { font-weight: bold; text-align: center; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
