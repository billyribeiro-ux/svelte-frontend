import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-3',
		title: 'Code Quality: ESLint & svelte-check',
		phase: 7,
		module: 19,
		lessonIndex: 3
	},
	description: `Code quality in SvelteKit relies on two key tools: svelte-check for TypeScript type checking across .svelte files, and ESLint for enforcing code style and catching bugs. Running pnpm svelte-check catches type errors that your editor might miss, while ESLint with @eslint/js and eslint-plugin-svelte ensures consistent code across your team.

Integrating both into a CI pipeline (GitHub Actions) means every pull request is automatically validated before merging, preventing type errors and lint violations from reaching production.`,
	objectives: [
		'Run pnpm svelte-check to catch TypeScript errors across .svelte files',
		'Configure ESLint with eslint-plugin-svelte for Svelte-specific rules',
		'Set up a CI pipeline with GitHub Actions for automated code quality checks',
		'Interpret and fix common svelte-check and ESLint errors'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type LintError = {
    file: string;
    line: number;
    severity: 'error' | 'warning';
    message: string;
    rule: string;
  };

  type TypeCheckResult = {
    file: string;
    line: number;
    message: string;
    code: string;
  };

  let lintErrors = $state<LintError[]>([
    { file: 'src/routes/+page.svelte', line: 12, severity: 'error', message: "'count' is assigned a value but never used", rule: 'no-unused-vars' },
    { file: 'src/lib/utils.ts', line: 5, severity: 'warning', message: "Unexpected any. Specify a different type", rule: '@typescript-eslint/no-explicit-any' },
    { file: 'src/routes/about/+page.svelte', line: 8, severity: 'error', message: "A11y: <img> element should have an alt attribute", rule: 'svelte/a11y-missing-attribute' },
    { file: 'src/lib/store.svelte.ts', line: 22, severity: 'warning', message: "Prefer using $state over writable stores", rule: 'svelte/prefer-runes' }
  ]);

  let typeErrors = $state<TypeCheckResult[]>([
    { file: 'src/routes/+page.svelte', line: 15, message: "Type 'string' is not assignable to type 'number'", code: 'ts(2322)' },
    { file: 'src/lib/api.ts', line: 42, message: "Property 'name' does not exist on type '{}'", code: 'ts(2339)' },
    { file: 'src/routes/blog/[slug]/+page.svelte', line: 8, message: "Type 'PageData' is missing property 'posts'", code: 'ts(2741)' }
  ]);

  let activeTab = $state<'eslint' | 'typecheck' | 'ci'>('eslint');

  const eslintConfigCode = \`// eslint.config.js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  { ignores: ['build/', '.svelte-kit/', 'dist/'] }
);\`;

  const ciPipelineCode = \`# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Type Check
        run: pnpm svelte-check --threshold error

      - name: Lint
        run: pnpm eslint .

      - name: Unit Tests
        run: pnpm vitest run

      - name: Build
        run: pnpm build\`;

  const packageScripts = \`// package.json scripts
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-check --tsconfig ./tsconfig.json --watch",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "ci": "pnpm check && pnpm lint && pnpm vitest run"
  }
}\`;

  function severityColor(s: string): string {
    return s === 'error' ? '#dc2626' : '#ca8a04';
  }
</script>

<main>
  <h1>Code Quality: ESLint & svelte-check</h1>
  <p class="subtitle">Automated type checking and linting for SvelteKit</p>

  <div class="tab-bar">
    <button class:active={activeTab === 'eslint'} onclick={() => activeTab = 'eslint'}>ESLint</button>
    <button class:active={activeTab === 'typecheck'} onclick={() => activeTab = 'typecheck'}>svelte-check</button>
    <button class:active={activeTab === 'ci'} onclick={() => activeTab = 'ci'}>CI Pipeline</button>
  </div>

  {#if activeTab === 'eslint'}
    <section>
      <h2>ESLint Output</h2>
      <div class="terminal">
        <div class="terminal-header">$ pnpm eslint .</div>
        {#each lintErrors as err}
          <div class="lint-line">
            <span class="file">{err.file}:{err.line}</span>
            <span class="severity" style="color: {severityColor(err.severity)}">{err.severity}</span>
            <span class="message">{err.message}</span>
            <span class="rule">{err.rule}</span>
          </div>
        {/each}
        <div class="summary">
          {lintErrors.filter(e => e.severity === 'error').length} errors,
          {lintErrors.filter(e => e.severity === 'warning').length} warnings
        </div>
      </div>

      <h3>ESLint Configuration</h3>
      <pre><code>{eslintConfigCode}</code></pre>
    </section>

  {:else if activeTab === 'typecheck'}
    <section>
      <h2>svelte-check Output</h2>
      <div class="terminal">
        <div class="terminal-header">$ pnpm svelte-check</div>
        {#each typeErrors as err}
          <div class="lint-line">
            <span class="file">{err.file}:{err.line}</span>
            <span class="severity" style="color: #dc2626">error</span>
            <span class="message">{err.message}</span>
            <span class="rule">{err.code}</span>
          </div>
        {/each}
        <div class="summary error">
          {typeErrors.length} errors found. svelte-check failed.
        </div>
      </div>

      <h3>Package Scripts</h3>
      <pre><code>{packageScripts}</code></pre>
    </section>

  {:else}
    <section>
      <h2>GitHub Actions CI Pipeline</h2>
      <div class="pipeline-steps">
        {#each ['Checkout', 'Install', 'Type Check', 'Lint', 'Test', 'Build'] as step, i}
          <div class="step">
            <span class="step-num">{i + 1}</span>
            <span class="step-name">{step}</span>
          </div>
          {#if i < 5}<span class="arrow">→</span>{/if}
        {/each}
      </div>

      <pre><code>{ciPipelineCode}</code></pre>
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

  .terminal {
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 8px;
    padding: 1rem;
    font-family: 'Fira Code', monospace;
    font-size: 0.8rem;
    margin-bottom: 1.5rem;
  }

  .terminal-header {
    color: #888;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #333;
  }

  .lint-line {
    display: grid;
    grid-template-columns: 280px 60px 1fr auto;
    gap: 0.75rem;
    padding: 0.3rem 0;
    border-bottom: 1px solid #2a2a2a;
  }

  .file { color: #9cdcfe; }
  .severity { font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
  .message { color: #d4d4d4; }
  .rule { color: #666; font-size: 0.75rem; }

  .summary {
    margin-top: 0.75rem;
    padding-top: 0.5rem;
    border-top: 1px solid #333;
    color: #ca8a04;
  }

  .summary.error { color: #dc2626; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  .pipeline-steps {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    background: #eef4fb;
    border: 1px solid #4a90d9;
    border-radius: 8px;
  }

  .step-num {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #4a90d9;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .step-name { font-weight: 500; font-size: 0.9rem; }
  .arrow { color: #999; font-size: 1.2rem; }

  section { margin-bottom: 2rem; }
  h3 { margin-top: 1.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
