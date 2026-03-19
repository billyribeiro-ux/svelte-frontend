import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-5',
		title: 'E2E Testing with Playwright',
		phase: 7,
		module: 19,
		lessonIndex: 5
	},
	description: `Playwright provides end-to-end (E2E) testing that drives a real browser, testing your SvelteKit application the way users actually interact with it. Unlike unit tests, E2E tests verify entire user flows: navigating pages, filling forms, clicking buttons, and asserting on visible content.

SvelteKit comes with Playwright support out of the box. Combined with GitHub Actions, you can run E2E tests on every pull request across Chromium, Firefox, and WebKit — catching regressions that unit tests miss.`,
	objectives: [
		'Write Playwright tests for navigation, form submission, and user flows',
		'Use Playwright locators (getByRole, getByText) for resilient selectors',
		'Configure Playwright for CI with GitHub Actions',
		'Test across multiple browsers with Playwright projects'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type E2ETest = {
    name: string;
    description: string;
    status: 'pass' | 'fail' | 'running';
    browser: string;
    duration: number;
  };

  let tests = $state<E2ETest[]>([
    { name: 'homepage loads correctly', description: 'Navigate to / and verify heading', status: 'pass', browser: 'chromium', duration: 450 },
    { name: 'navigation works', description: 'Click nav links, verify page content', status: 'pass', browser: 'chromium', duration: 820 },
    { name: 'contact form submits', description: 'Fill form, submit, verify success message', status: 'pass', browser: 'chromium', duration: 1200 },
    { name: 'search returns results', description: 'Type query, verify results render', status: 'pass', browser: 'chromium', duration: 950 },
    { name: 'dark mode toggle persists', description: 'Toggle theme, reload, verify persistence', status: 'fail', browser: 'firefox', duration: 1500 },
    { name: 'mobile menu opens', description: 'Resize viewport, tap hamburger menu', status: 'pass', browser: 'webkit', duration: 680 }
  ]);

  let totalPassed = $derived(tests.filter(t => t.status === 'pass').length);
  let totalFailed = $derived(tests.filter(t => t.status === 'fail').length);

  const navigationTestCode = \`// tests/navigation.test.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('homepage has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/My SvelteKit App/);
    await expect(page.getByRole('heading', { level: 1 }))
      .toHaveText('Welcome');
  });

  test('can navigate to about page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { level: 1 }))
      .toHaveText('About Us');
  });

  test('back button works', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Blog' }).click();
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});\`;

  const formTestCode = \`// tests/contact-form.test.ts
import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('submits form successfully', async ({ page }) => {
    // Fill in the form
    await page.getByLabel('Name').fill('Jane Doe');
    await page.getByLabel('Email').fill('jane@example.com');
    await page.getByLabel('Message').fill('Hello!');

    // Submit
    await page.getByRole('button', { name: 'Send' }).click();

    // Verify success
    await expect(page.getByText('Message sent!')).toBeVisible();
  });

  test('shows validation errors', async ({ page }) => {
    // Submit empty form
    await page.getByRole('button', { name: 'Send' }).click();

    // Verify error messages
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Email is required')).toBeVisible();
  });

  test('email validation works', async ({ page }) => {
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Invalid email')).toBeVisible();
  });
});\`;

  const playwrightConfigCode = \`// playwright.config.ts
import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'pnpm build && pnpm preview',
    port: 4173
  },
  testDir: 'tests',
  retries: process.env.CI ? 2 : 0,
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } }
  ]
};

export default config;\`;

  const ciCode = \`# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm exec playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/\`;

  let activeTab = $state<'results' | 'navigation' | 'forms' | 'config'>('results');
</script>

<main>
  <h1>E2E Testing with Playwright</h1>
  <p class="subtitle">Browser automation for real user flow testing</p>

  <div class="tab-bar">
    <button class:active={activeTab === 'results'} onclick={() => activeTab = 'results'}>Results</button>
    <button class:active={activeTab === 'navigation'} onclick={() => activeTab = 'navigation'}>Navigation</button>
    <button class:active={activeTab === 'forms'} onclick={() => activeTab = 'forms'}>Form Tests</button>
    <button class:active={activeTab === 'config'} onclick={() => activeTab = 'config'}>Config & CI</button>
  </div>

  {#if activeTab === 'results'}
    <section>
      <div class="summary-bar">
        <span class="pass">{totalPassed} passed</span>
        <span class="fail">{totalFailed} failed</span>
        <span class="total">{tests.length} total</span>
      </div>

      <div class="test-list">
        {#each tests as test}
          <div class="test-row" class:failed={test.status === 'fail'}>
            <span class="status-icon" class:pass={test.status === 'pass'} class:fail-icon={test.status === 'fail'}>
              {test.status === 'pass' ? '\u2713' : '\u2717'}
            </span>
            <div class="test-info">
              <span class="test-name">{test.name}</span>
              <span class="test-desc">{test.description}</span>
            </div>
            <span class="test-browser">{test.browser}</span>
            <span class="test-time">{test.duration}ms</span>
          </div>
        {/each}
      </div>
    </section>

  {:else if activeTab === 'navigation'}
    <section>
      <h2>Navigation Tests</h2>
      <pre><code>{navigationTestCode}</code></pre>
    </section>

  {:else if activeTab === 'forms'}
    <section>
      <h2>Form Submission Tests</h2>
      <pre><code>{formTestCode}</code></pre>
    </section>

  {:else}
    <section>
      <h2>Playwright Config</h2>
      <pre><code>{playwrightConfigCode}</code></pre>

      <h2>GitHub Actions CI</h2>
      <pre><code>{ciCode}</code></pre>
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

  .summary-bar {
    display: flex;
    gap: 1.5rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .pass { color: #16a34a; }
  .fail { color: #dc2626; }
  .total { color: #333; margin-left: auto; }

  .test-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .test-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 3px solid #16a34a;
  }

  .test-row.failed {
    border-left-color: #dc2626;
    background: #fef2f2;
  }

  .status-icon {
    font-weight: 700;
    font-size: 1.1rem;
    width: 24px;
    text-align: center;
  }

  .status-icon.pass { color: #16a34a; }
  .status-icon.fail-icon { color: #dc2626; }

  .test-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .test-name {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .test-desc {
    font-size: 0.8rem;
    color: #666;
  }

  .test-browser {
    font-size: 0.8rem;
    padding: 0.15rem 0.5rem;
    background: #e8e8e8;
    border-radius: 4px;
    color: #555;
  }

  .test-time {
    font-size: 0.8rem;
    color: #888;
    min-width: 50px;
    text-align: right;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  section { margin-bottom: 2rem; }
  h2 { margin-bottom: 1rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
