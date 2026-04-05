import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-4',
		title: 'Unit Testing with Vitest',
		phase: 7,
		module: 19,
		lessonIndex: 4
	},
	description: `Vitest is the default test runner for SvelteKit — fast, ESM-native, and powered by Vite so tests use the same transform pipeline as your app. You test three kinds of code: plain utilities, reactive .svelte.ts modules (runes inside them work because Vitest runs them through the Svelte plugin), and components via @testing-library/svelte with the mount() renderer.

Tests use the familiar describe/it/expect pattern. Mocks are created with vi.fn() for spies and vi.mock() for modules. A good unit suite gives you confidence to refactor — you change implementation, not tests.`,
	objectives: [
		'Configure Vitest with the SvelteKit Vite plugin and vitest-environment-jsdom',
		'Write unit tests using describe/it/expect',
		'Test .svelte.ts modules that use runes',
		'Render and interact with Svelte components via @testing-library/svelte',
		'Mock modules and functions with vi.fn() and vi.mock()'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'setup' | 'utility' | 'runes' | 'component' | 'mocking' | 'runner';
  let activeTab = $state<Tab>('setup');

  // Live test runner simulation
  type TestResult = { name: string; status: 'pending' | 'pass' | 'fail'; duration: number; error?: string };
  type Suite = { name: string; tests: TestResult[] };

  let suites = $state<Suite[]>([
    {
      name: 'src/lib/utils/format.test.ts',
      tests: [
        { name: 'formats currency with default locale', status: 'pending', duration: 0 },
        { name: 'handles zero values', status: 'pending', duration: 0 },
        { name: 'rounds to 2 decimals', status: 'pending', duration: 0 }
      ]
    },
    {
      name: 'src/lib/state/counter.svelte.test.ts',
      tests: [
        { name: 'initial count is 0', status: 'pending', duration: 0 },
        { name: 'increment updates derived doubled', status: 'pending', duration: 0 },
        { name: 'reset returns to 0', status: 'pending', duration: 0 }
      ]
    },
    {
      name: 'src/lib/components/Button.test.ts',
      tests: [
        { name: 'renders label', status: 'pending', duration: 0 },
        { name: 'calls onclick handler', status: 'pending', duration: 0 },
        { name: 'applies variant class', status: 'pending', duration: 0 }
      ]
    }
  ]);

  let running = $state(false);
  let passCount = $derived(suites.flatMap((s) => s.tests).filter((t) => t.status === 'pass').length);
  let failCount = $derived(suites.flatMap((s) => s.tests).filter((t) => t.status === 'fail').length);
  let totalCount = $derived(suites.flatMap((s) => s.tests).length);

  async function runTests() {
    running = true;
    // Reset
    suites = suites.map((s) => ({
      ...s,
      tests: s.tests.map((t) => ({ ...t, status: 'pending' as const, duration: 0, error: undefined }))
    }));

    for (let i = 0; i < suites.length; i++) {
      for (let j = 0; j < suites[i].tests.length; j++) {
        await new Promise((r) => setTimeout(r, 150));
        const next = [...suites];
        const passed = Math.random() > 0.15;
        next[i] = {
          ...next[i],
          tests: next[i].tests.map((t, k) =>
            k === j
              ? {
                  ...t,
                  status: passed ? 'pass' : 'fail',
                  duration: Math.floor(Math.random() * 30) + 5,
                  error: passed ? undefined : 'Expected 4 to equal 5'
                }
              : t
          )
        };
        suites = next;
      }
    }
    running = false;
  }

  const configCode = \`// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    workspace: [
      {
        extends: './vite.config.ts',
        test: {
          name: 'client',
          environment: 'jsdom',
          include: ['src/**/*.svelte.{test,spec}.ts'],
          setupFiles: ['./vitest-setup.ts']
        }
      },
      {
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.ts'],
          exclude: ['src/**/*.svelte.{test,spec}.ts']
        }
      }
    ]
  }
});\`;

  const utilityTest = \`// src/lib/utils/format.ts
export function formatCurrency(
  value: number,
  locale = 'en-US',
  currency = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(value);
}

// src/lib/utils/format.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './format';

describe('formatCurrency', () => {
  it('formats with default locale', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('rounds to 2 decimals', () => {
    expect(formatCurrency(10.123)).toBe('$10.12');
  });

  it('respects locale argument', () => {
    expect(formatCurrency(1000, 'de-DE', 'EUR')).toMatch(/1.000,00/);
  });
});\`;

  const runesTest = \`// src/lib/state/counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);
  let doubled = $derived(count * 2);

  return {
    get count() { return count; },
    get doubled() { return doubled; },
    increment() { count++; },
    reset() { count = initial; }
  };
}

// src/lib/state/counter.svelte.test.ts
import { describe, it, expect } from 'vitest';
import { flushSync } from 'svelte';
import { createCounter } from './counter.svelte';

describe('createCounter', () => {
  it('starts at 0', () => {
    const c = createCounter();
    expect(c.count).toBe(0);
    expect(c.doubled).toBe(0);
  });

  it('increment updates count and derived', () => {
    const c = createCounter();
    c.increment();
    flushSync();
    expect(c.count).toBe(1);
    expect(c.doubled).toBe(2);
  });

  it('reset returns to initial', () => {
    const c = createCounter(5);
    c.increment();
    c.reset();
    flushSync();
    expect(c.count).toBe(5);
  });
});\`;

  const componentTest = \`// src/lib/components/Button.svelte
<script lang="ts">
  type Props = {
    variant?: 'primary' | 'ghost';
    onclick?: () => void;
    children: import('svelte').Snippet;
  };
  let { variant = 'primary', onclick, children }: Props = $props();
<\\/script>

<button data-variant={variant} {onclick}>
  {@render children()}
</button>

// src/lib/components/Button.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Button from './Button.svelte';

describe('Button', () => {
  it('renders children', () => {
    render(Button, { props: { children: 'Click me' } });
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onclick when clicked', async () => {
    const onclick = vi.fn();
    render(Button, { props: { onclick, children: 'Go' } });

    await userEvent.click(screen.getByRole('button'));

    expect(onclick).toHaveBeenCalledOnce();
  });

  it('applies variant attribute', () => {
    render(Button, { props: { variant: 'ghost', children: 'x' } });
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost');
  });
});\`;

  const mockingCode = \`// Mock a module — vi.mock is hoisted
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/posts', () => ({
  fetchPosts: vi.fn()
}));

import { fetchPosts } from '$lib/api/posts';
import { loadFeed } from './feed';

describe('loadFeed', () => {
  beforeEach(() => {
    vi.mocked(fetchPosts).mockReset();
  });

  it('returns posts from api', async () => {
    vi.mocked(fetchPosts).mockResolvedValue([
      { id: 1, title: 'Hello' }
    ]);

    const feed = await loadFeed();

    expect(feed).toHaveLength(1);
    expect(fetchPosts).toHaveBeenCalledOnce();
  });

  it('handles api errors', async () => {
    vi.mocked(fetchPosts).mockRejectedValue(new Error('500'));
    await expect(loadFeed()).rejects.toThrow('500');
  });
});

// Spy on an existing function without replacing it
const log = vi.spyOn(console, 'log');
// ... do something ...
expect(log).toHaveBeenCalledWith('hello');\`;
</script>

<main>
  <h1>Unit Testing with Vitest</h1>
  <p class="subtitle">Fast, Vite-native, ESM-first test runner for SvelteKit</p>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'setup'} onclick={() => (activeTab = 'setup')}>Setup</button>
    <button class:active={activeTab === 'utility'} onclick={() => (activeTab = 'utility')}>Utilities</button>
    <button class:active={activeTab === 'runes'} onclick={() => (activeTab = 'runes')}>Runes</button>
    <button class:active={activeTab === 'component'} onclick={() => (activeTab = 'component')}>Components</button>
    <button class:active={activeTab === 'mocking'} onclick={() => (activeTab = 'mocking')}>Mocking</button>
    <button class:active={activeTab === 'runner'} onclick={() => (activeTab = 'runner')}>Runner</button>
  </nav>

  {#if activeTab === 'setup'}
    <section>
      <h2>Vitest Configuration</h2>
      <p>SvelteKit projects use two test environments: a client environment (jsdom) for component tests and a server environment (node) for utilities.</p>
      <pre><code>{configCode}</code></pre>
    </section>
  {:else if activeTab === 'utility'}
    <section>
      <h2>Testing Plain Utilities</h2>
      <p>Start with pure functions — no DOM, no runes, just input/output assertions.</p>
      <pre><code>{utilityTest}</code></pre>
    </section>
  {:else if activeTab === 'runes'}
    <section>
      <h2>Testing Runes in .svelte.ts</h2>
      <p>Files ending in <code>.svelte.ts</code> can use runes. Import <code>flushSync</code> from <code>svelte</code> to wait for derivations to settle.</p>
      <pre><code>{runesTest}</code></pre>
    </section>
  {:else if activeTab === 'component'}
    <section>
      <h2>Component Tests with Testing Library</h2>
      <p>Use <code>@testing-library/svelte</code> + <code>@testing-library/user-event</code> for realistic component interactions.</p>
      <pre><code>{componentTest}</code></pre>
    </section>
  {:else if activeTab === 'mocking'}
    <section>
      <h2>Mocking with vi</h2>
      <p><code>vi.fn()</code> creates spies, <code>vi.mock()</code> replaces entire modules, and <code>vi.spyOn()</code> wraps existing functions.</p>
      <pre><code>{mockingCode}</code></pre>
    </section>
  {:else}
    <section>
      <h2>Live Runner Simulation</h2>
      <div class="runner-header">
        <button class="run-btn" disabled={running} onclick={runTests}>
          {running ? 'Running...' : 'Run Tests'}
        </button>
        <div class="stats">
          <span class="stat pass">{passCount} passed</span>
          <span class="stat fail">{failCount} failed</span>
          <span class="stat total">{totalCount} total</span>
        </div>
      </div>

      <div class="suites">
        {#each suites as suite (suite.name)}
          <div class="suite">
            <div class="suite-header">{suite.name}</div>
            {#each suite.tests as test (test.name)}
              <div class="test-row {test.status}">
                <span class="test-icon">
                  {#if test.status === 'pass'}✓{:else if test.status === 'fail'}✗{:else}○{/if}
                </span>
                <span class="test-name">{test.name}</span>
                {#if test.duration > 0}
                  <span class="test-duration">{test.duration}ms</span>
                {/if}
                {#if test.error}
                  <div class="test-error">{test.error}</div>
                {/if}
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </section>
  {/if}
</main>

<style>
  main { max-width: 900px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
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

  .runner-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .run-btn {
    padding: 0.55rem 1.2rem;
    background: #4a90d9;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }
  .run-btn:disabled { opacity: 0.6; cursor: wait; }
  .stats { display: flex; gap: 0.5rem; }
  .stat {
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    background: #e5e7eb;
  }
  .stat.pass { background: #dcfce7; color: #166534; }
  .stat.fail { background: #fee2e2; color: #991b1b; }
  .stat.total { background: #dbeafe; color: #1e40af; }

  .suites { display: flex; flex-direction: column; gap: 1rem; }
  .suite {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 0.75rem 1rem;
  }
  .suite-header { font-weight: 600; font-family: monospace; font-size: 0.82rem; color: #555; margin-bottom: 0.5rem; }
  .test-row {
    display: grid;
    grid-template-columns: 20px 1fr auto;
    gap: 0.5rem;
    padding: 0.35rem 0.5rem;
    align-items: center;
    border-radius: 4px;
    font-size: 0.85rem;
  }
  .test-row.pass { color: #166534; background: #dcfce7; }
  .test-row.fail { color: #991b1b; background: #fee2e2; }
  .test-icon { font-weight: bold; text-align: center; }
  .test-duration { font-size: 0.72rem; color: #777; }
  .test-error { grid-column: 2 / -1; font-family: monospace; font-size: 0.75rem; color: #991b1b; margin-top: 0.2rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
