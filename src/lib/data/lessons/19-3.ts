import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-3',
		title: 'Code Quality: ESLint & svelte-check',
		phase: 7,
		module: 19,
		lessonIndex: 3
	},
	description: `Two tools carry the code-quality story in a modern SvelteKit project. svelte-check runs the Svelte compiler and TypeScript against every .svelte file to catch type errors, a11y warnings, and unused exports that your editor might miss. ESLint — configured with the new flat config format and eslint-plugin-svelte — enforces consistent style, catches bugs, and prevents footguns across .ts and .svelte files.

Wire both into a GitHub Actions workflow and every pull request is validated before merging. A green CI pipeline means no type error, no lint violation, and no accessibility regression reaches main.`,
	objectives: [
		'Run pnpm svelte-check and interpret its output (errors, warnings, hints)',
		'Configure ESLint flat config with eslint-plugin-svelte and typescript-eslint',
		'Write a CI workflow that fails when lint or typecheck fails',
		'Integrate lint-staged + husky for pre-commit checks',
		'Silence a specific rule without disabling linting globally'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'svelte-check' | 'eslint' | 'ci' | 'simulator';
  let activeTab = $state<Tab>('svelte-check');

  type CheckItem = {
    severity: 'error' | 'warning' | 'hint';
    file: string;
    line: number;
    col: number;
    message: string;
    rule?: string;
  };

  // Simulated svelte-check output
  const checkOutput: CheckItem[] = [
    { severity: 'error',   file: 'src/routes/+page.svelte',       line: 12, col: 5,  message: "Type 'string' is not assignable to type 'number'.", rule: 'TS2322' },
    { severity: 'warning', file: 'src/lib/components/Avatar.svelte', line: 8,  col: 3,  message: "<img> element should have an alt attribute", rule: 'a11y_missing_attribute' },
    { severity: 'warning', file: 'src/lib/components/Modal.svelte',  line: 23, col: 9,  message: 'Non-interactive element <div> should not have a click handler', rule: 'a11y_click_events_have_key_events' },
    { severity: 'hint',    file: 'src/lib/utils/format.ts',        line: 4,  col: 10, message: "'unused' is declared but never read", rule: 'TS6133' }
  ];

  let filter = $state<'all' | 'error' | 'warning' | 'hint'>('all');
  let filteredOutput = $derived(
    filter === 'all' ? checkOutput : checkOutput.filter((c) => c.severity === filter)
  );

  let errorCount = $derived(checkOutput.filter((c) => c.severity === 'error').length);
  let warningCount = $derived(checkOutput.filter((c) => c.severity === 'warning').length);
  let hintCount = $derived(checkOutput.filter((c) => c.severity === 'hint').length);

  // Interactive fixer
  let fixed = $state<Set<string>>(new Set());
  function toggleFix(id: string) {
    const next = new Set(fixed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    fixed = next;
  }
  let remaining = $derived(checkOutput.length - fixed.size);

  const eslintConfig = \`// eslint.config.js — flat config
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import svelteConfig from './svelte.config.js';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],

  {
    languageOptions: {
      globals: { browser: 'readonly', node: 'readonly' },
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte']
      }
    }
  },

  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
        svelteConfig
      }
    }
  },

  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' }
      ],
      'svelte/no-at-html-tags': 'warn',
      'svelte/valid-compile': 'error'
    }
  },

  {
    ignores: ['build/', '.svelte-kit/', 'dist/', 'node_modules/']
  }
);\`;

  const svelteCheckCmd = \`# package.json scripts
{
  "scripts": {
    "check":       "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "lint":        "eslint . && prettier --check .",
    "lint:fix":    "eslint . --fix && prettier --write ."
  }
}

# Run locally
$ pnpm check
$ pnpm lint

# Typical output
====================================
svelte-check found 1 error and 2 warnings in 156 files
====================================\`;

  const ciYaml = \`# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: svelte-check
        run: pnpm check

      - name: ESLint
        run: pnpm lint

      - name: Unit tests
        run: pnpm test:unit --run

      - name: Build
        run: pnpm build\`;

  const husky = \`# lint-staged + husky for pre-commit
$ pnpm add -D husky lint-staged
$ pnpm exec husky init

# .husky/pre-commit
pnpm exec lint-staged

# package.json
{
  "lint-staged": {
    "*.{ts,svelte}": ["eslint --fix", "prettier --write"],
    "*.svelte":      "svelte-check --fail-on-warnings"
  }
}\`;
</script>

<main>
  <h1>Code Quality: ESLint & svelte-check</h1>
  <p class="subtitle">Type-checking, linting, and CI integration</p>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'svelte-check'} onclick={() => (activeTab = 'svelte-check')}>svelte-check</button>
    <button class:active={activeTab === 'eslint'} onclick={() => (activeTab = 'eslint')}>ESLint</button>
    <button class:active={activeTab === 'ci'} onclick={() => (activeTab = 'ci')}>CI Pipeline</button>
    <button class:active={activeTab === 'simulator'} onclick={() => (activeTab = 'simulator')}>Fix Simulator</button>
  </nav>

  {#if activeTab === 'svelte-check'}
    <section>
      <h2>svelte-check</h2>
      <p>Runs the Svelte compiler + TypeScript across every .svelte and .ts file. Catches type errors, a11y issues, and compiler warnings across the whole project.</p>
      <pre><code>{svelteCheckCmd}</code></pre>

      <h3>Sample Output</h3>
      <div class="summary">
        <span class="badge err">{errorCount} error</span>
        <span class="badge warn">{warningCount} warnings</span>
        <span class="badge hint">{hintCount} hints</span>
      </div>

      <div class="filter-bar">
        <button class:active={filter === 'all'} onclick={() => (filter = 'all')}>All</button>
        <button class:active={filter === 'error'} onclick={() => (filter = 'error')}>Errors</button>
        <button class:active={filter === 'warning'} onclick={() => (filter = 'warning')}>Warnings</button>
        <button class:active={filter === 'hint'} onclick={() => (filter = 'hint')}>Hints</button>
      </div>

      <div class="output">
        {#each filteredOutput as item, i (i)}
          <div class="output-row {item.severity}">
            <span class="sev">{item.severity}</span>
            <span class="loc">{item.file}:{item.line}:{item.col}</span>
            {#if item.rule}<span class="rule">[{item.rule}]</span>{/if}
            <span class="msg">{item.message}</span>
          </div>
        {/each}
      </div>
    </section>
  {:else if activeTab === 'eslint'}
    <section>
      <h2>ESLint Flat Config</h2>
      <p>Flat config is the modern ESLint API (ESLint 9+). It replaces <code>.eslintrc.*</code> with a single <code>eslint.config.js</code> array, giving you explicit file-scope rules and simpler overrides.</p>
      <pre><code>{eslintConfig}</code></pre>

      <h3>Common Rules for SvelteKit</h3>
      <ul class="rules">
        <li><code>svelte/no-at-html-tags</code> — flags <code>{'{@html}'}</code> usage (XSS risk)</li>
        <li><code>svelte/valid-compile</code> — errors on compiler warnings</li>
        <li><code>@typescript-eslint/no-unused-vars</code> — unused imports/variables</li>
        <li><code>svelte/require-each-key</code> — enforce keyed <code>{'{#each}'}</code> blocks</li>
        <li><code>svelte/no-reactive-reassign</code> — catches legacy \`$:\` patterns</li>
      </ul>
    </section>
  {:else if activeTab === 'ci'}
    <section>
      <h2>GitHub Actions CI</h2>
      <p>A minimal but complete pipeline that runs on every pull request and push to main.</p>
      <pre><code>{ciYaml}</code></pre>

      <h3>Pre-commit Hooks</h3>
      <pre><code>{husky}</code></pre>
    </section>
  {:else}
    <section>
      <h2>Fix Simulator</h2>
      <p>Click each issue to mark it fixed. Your goal: zero remaining.</p>
      <div class="summary">
        <span class="badge">{remaining} remaining</span>
        <span class="badge ok">{fixed.size} fixed</span>
      </div>
      <div class="sim-list">
        {#each checkOutput as item, i (i)}
          {@const id = \`\${item.file}:\${item.line}\`}
          <button
            class="sim-row {item.severity}"
            class:done={fixed.has(id)}
            onclick={() => toggleFix(id)}
          >
            <span class="sev">{item.severity}</span>
            <span class="loc">{item.file}:{item.line}</span>
            <span class="msg">{item.message}</span>
            <span class="mark">{fixed.has(id) ? 'Fixed' : 'Fix'}</span>
          </button>
        {/each}
      </div>

      {#if remaining === 0}
        <div class="celebrate">All clean. CI will pass.</div>
      {/if}
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
    max-height: 500px;
  }
  pre code { background: none; padding: 0; }
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85rem; }

  .summary { display: flex; gap: 0.5rem; margin: 1rem 0; flex-wrap: wrap; }
  .badge {
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    background: #e5e7eb;
  }
  .badge.err { background: #fee2e2; color: #991b1b; }
  .badge.warn { background: #fef3c7; color: #92400e; }
  .badge.hint { background: #dbeafe; color: #1e40af; }
  .badge.ok { background: #dcfce7; color: #166534; }

  .filter-bar { display: flex; gap: 0.35rem; margin: 0.5rem 0 1rem; }
  .filter-bar button {
    padding: 0.3rem 0.7rem;
    border: 1px solid #ddd;
    background: white;
    border-radius: 999px;
    cursor: pointer;
    font-size: 0.8rem;
  }
  .filter-bar button.active { background: #4a90d9; color: white; border-color: #4a90d9; }

  .output { display: flex; flex-direction: column; gap: 0.3rem; font-family: monospace; font-size: 0.82rem; }
  .output-row {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    display: grid;
    grid-template-columns: 70px 1fr;
    grid-template-areas: 'sev loc' 'sev msg';
    column-gap: 0.5rem;
    background: #f8f9fa;
    border-left: 3px solid #999;
  }
  .output-row.error { border-color: #dc2626; background: #fef2f2; }
  .output-row.warning { border-color: #f59e0b; background: #fffbeb; }
  .output-row.hint { border-color: #3b82f6; background: #eff6ff; }
  .sev { grid-area: sev; font-weight: 700; text-transform: uppercase; font-size: 0.7rem; color: #555; }
  .loc { grid-area: loc; color: #555; }
  .msg { grid-area: msg; color: #111; }
  .rule { font-size: 0.7rem; color: #777; }

  .rules { padding-left: 1.25rem; }
  .rules li { margin-bottom: 0.5rem; font-size: 0.9rem; }

  .sim-list { display: flex; flex-direction: column; gap: 0.4rem; }
  .sim-row {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 0.5rem;
    align-items: center;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    border: 1px solid transparent;
    background: #f8f9fa;
    text-align: left;
    cursor: pointer;
    font-size: 0.82rem;
    border-left: 3px solid #999;
  }
  .sim-row.error { border-left-color: #dc2626; background: #fef2f2; }
  .sim-row.warning { border-left-color: #f59e0b; background: #fffbeb; }
  .sim-row.hint { border-left-color: #3b82f6; background: #eff6ff; }
  .sim-row.done { opacity: 0.4; text-decoration: line-through; }
  .sim-row .mark {
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background: #4a90d9;
    color: white;
    font-size: 0.72rem;
    font-weight: 600;
  }
  .sim-row.done .mark { background: #16a34a; }

  .celebrate {
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
