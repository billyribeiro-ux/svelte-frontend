import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-4',
		title: 'Unit Testing with Vitest',
		phase: 7,
		module: 19,
		lessonIndex: 4
	},
	description: `Vitest is the test runner of choice for SvelteKit — fast, ESM-native, and Vite-powered. You can test plain TypeScript modules (.svelte.ts files with runes), and use @testing-library/svelte with mount() to render and test Svelte components. Tests follow the describe/it/expect pattern with built-in mocking via vi.fn() and vi.mock().

Writing tests for your reactive state modules, utility functions, and component behavior catches bugs early and gives you confidence to refactor safely.`,
	objectives: [
		'Write unit tests using Vitest with describe/it/expect patterns',
		'Test .svelte.ts reactive modules that use $state and $derived',
		'Use mount() from @testing-library/svelte to test component rendering',
		'Mock dependencies with vi.fn() and vi.mock()'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type TestResult = {
    name: string;
    status: 'pass' | 'fail' | 'skip';
    duration: number;
    error?: string;
  };

  type TestSuite = {
    name: string;
    file: string;
    tests: TestResult[];
  };

  let suites = $state<TestSuite[]>([
    {
      name: 'counter.svelte.ts',
      file: 'src/lib/counter.svelte.test.ts',
      tests: [
        { name: 'should initialize with given value', status: 'pass', duration: 2 },
        { name: 'should increment count', status: 'pass', duration: 1 },
        { name: 'should decrement count', status: 'pass', duration: 1 },
        { name: 'should reset to initial value', status: 'pass', duration: 1 },
        { name: 'should not go below zero', status: 'fail', duration: 3, error: 'Expected: 0, Received: -1' }
      ]
    },
    {
      name: 'formatDate utility',
      file: 'src/lib/utils.test.ts',
      tests: [
        { name: 'formats ISO date to readable string', status: 'pass', duration: 1 },
        { name: 'handles invalid date input', status: 'pass', duration: 1 },
        { name: 'supports relative time format', status: 'skip', duration: 0 }
      ]
    },
    {
      name: 'Button component',
      file: 'src/lib/components/Button.test.ts',
      tests: [
        { name: 'renders with default props', status: 'pass', duration: 15 },
        { name: 'applies variant class', status: 'pass', duration: 12 },
        { name: 'fires onclick handler', status: 'pass', duration: 8 },
        { name: 'renders children content', status: 'pass', duration: 10 }
      ]
    }
  ]);

  let totalPassed = $derived(suites.flatMap(s => s.tests).filter(t => t.status === 'pass').length);
  let totalFailed = $derived(suites.flatMap(s => s.tests).filter(t => t.status === 'fail').length);
  let totalSkipped = $derived(suites.flatMap(s => s.tests).filter(t => t.status === 'skip').length);
  let totalTests = $derived(suites.flatMap(s => s.tests).length);

  const moduleTestCode = \`// src/lib/counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);

  return {
    get count() { return count; },
    increment() { count++; },
    decrement() { count--; },
    reset() { count = initial; }
  };
}

// src/lib/counter.svelte.test.ts
import { describe, it, expect } from 'vitest';
import { createCounter } from './counter.svelte';

describe('createCounter', () => {
  it('should initialize with given value', () => {
    const counter = createCounter(5);
    expect(counter.count).toBe(5);
  });

  it('should increment count', () => {
    const counter = createCounter(0);
    counter.increment();
    expect(counter.count).toBe(1);
  });

  it('should decrement count', () => {
    const counter = createCounter(10);
    counter.decrement();
    expect(counter.count).toBe(9);
  });

  it('should reset to initial value', () => {
    const counter = createCounter(5);
    counter.increment();
    counter.increment();
    counter.reset();
    expect(counter.count).toBe(5);
  });
});\`;

  const componentTestCode = \`// src/lib/components/Button.test.ts
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button', () => {
  it('renders with default props', () => {
    render(Button, { props: { children: 'Click me' } });
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies variant data attribute', () => {
    render(Button, { props: { variant: 'danger' } });
    const btn = screen.getByRole('button');
    expect(btn.dataset.variant).toBe('danger');
  });

  it('fires onclick handler', async () => {
    const handleClick = vi.fn();
    render(Button, { props: { onclick: handleClick } });
    await fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});\`;

  const mockingCode = \`// Mocking example
import { describe, it, expect, vi } from 'vitest';

// Mock an entire module
vi.mock('$lib/api', () => ({
  fetchPosts: vi.fn().mockResolvedValue([
    { id: 1, title: 'Test Post' }
  ])
}));

// Mock a single function
const mockFetch = vi.fn();

describe('API integration', () => {
  it('fetches and transforms data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' })
    });

    const result = await getData(mockFetch);
    expect(mockFetch).toHaveBeenCalledWith('/api/data');
    expect(result).toEqual({ data: 'test' });
  });
});\`;

  function statusIcon(status: string): string {
    if (status === 'pass') return '\u2713';
    if (status === 'fail') return '\u2717';
    return '\u25CB';
  }

  function statusColor(status: string): string {
    if (status === 'pass') return '#16a34a';
    if (status === 'fail') return '#dc2626';
    return '#888';
  }

  let activeTab = $state<'output' | 'module' | 'component' | 'mocking'>('output');
</script>

<main>
  <h1>Unit Testing with Vitest</h1>
  <p class="subtitle">Fast, ESM-native testing for SvelteKit</p>

  <div class="tab-bar">
    <button class:active={activeTab === 'output'} onclick={() => activeTab = 'output'}>Test Output</button>
    <button class:active={activeTab === 'module'} onclick={() => activeTab = 'module'}>Module Tests</button>
    <button class:active={activeTab === 'component'} onclick={() => activeTab = 'component'}>Component Tests</button>
    <button class:active={activeTab === 'mocking'} onclick={() => activeTab = 'mocking'}>Mocking</button>
  </div>

  {#if activeTab === 'output'}
    <section>
      <div class="summary-bar">
        <span class="pass-count">{totalPassed} passed</span>
        <span class="fail-count">{totalFailed} failed</span>
        <span class="skip-count">{totalSkipped} skipped</span>
        <span class="total">{totalTests} total</span>
      </div>

      <div class="terminal">
        <div class="terminal-header">$ pnpm vitest run</div>
        {#each suites as suite}
          <div class="suite-header">{suite.file}</div>
          {#each suite.tests as test}
            <div class="test-line">
              <span class="test-icon" style="color: {statusColor(test.status)}">{statusIcon(test.status)}</span>
              <span class="test-name" class:failed={test.status === 'fail'}>{test.name}</span>
              <span class="test-duration">{test.duration}ms</span>
            </div>
            {#if test.error}
              <div class="test-error">AssertionError: {test.error}</div>
            {/if}
          {/each}
        {/each}
      </div>
    </section>

  {:else if activeTab === 'module'}
    <section>
      <h2>Testing .svelte.ts Modules</h2>
      <pre><code>{moduleTestCode}</code></pre>
    </section>

  {:else if activeTab === 'component'}
    <section>
      <h2>Component Testing with @testing-library/svelte</h2>
      <pre><code>{componentTestCode}</code></pre>
    </section>

  {:else}
    <section>
      <h2>Mocking with vi.fn() and vi.mock()</h2>
      <pre><code>{mockingCode}</code></pre>
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

  .pass-count { color: #16a34a; }
  .fail-count { color: #dc2626; }
  .skip-count { color: #888; }
  .total { color: #333; margin-left: auto; }

  .terminal {
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 8px;
    padding: 1rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.8rem;
  }

  .terminal-header {
    color: #888;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #333;
  }

  .suite-header {
    color: #9cdcfe;
    font-weight: 600;
    margin-top: 0.75rem;
    margin-bottom: 0.25rem;
  }

  .test-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.2rem 0 0.2rem 1rem;
  }

  .test-icon { font-weight: 700; }
  .test-name { flex: 1; }
  .test-name.failed { color: #dc2626; }
  .test-duration { color: #666; font-size: 0.75rem; }

  .test-error {
    padding: 0.3rem 0 0.3rem 2rem;
    color: #dc2626;
    font-size: 0.75rem;
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
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
