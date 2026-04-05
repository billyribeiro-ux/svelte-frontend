import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-8',
		title: 'File Organization & Naming',
		phase: 7,
		module: 19,
		lessonIndex: 8
	},
	description: `A well-organized SvelteKit project follows clear conventions: PascalCase for component files (Button.svelte), kebab-case for route directories (/blog-post), kebab-case for utility modules, and a structured $lib directory that mirrors your application's concerns. Co-locating related files — component + test + types — keeps maintenance local, while barrel exports (index.ts) provide clean import paths without deep relative chains.

Route grouping with (parentheses) directories lets you share layouts without affecting URLs. Private modules (prefixed with _) keep internal helpers out of the routing tree. This lesson covers the file organization patterns that scale from solo projects to team codebases.`,
	objectives: [
		'Apply PascalCase for components and kebab-case for routes',
		'Structure $lib into components, state, utils, server, and api subfolders',
		'Use barrel exports (index.ts) for clean consumer imports',
		'Co-locate tests, types, and styles with their components',
		'Leverage SvelteKit route groups and private _modules'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'tree' | 'naming' | 'barrels' | 'routes' | 'audit';
  let activeTab = $state<Tab>('tree');

  type Node = {
    name: string;
    kind: 'folder' | 'file';
    comment?: string;
    children?: Node[];
  };

  const tree: Node = {
    name: 'my-app',
    kind: 'folder',
    children: [
      {
        name: 'src',
        kind: 'folder',
        children: [
          {
            name: 'lib',
            kind: 'folder',
            comment: '$lib alias',
            children: [
              {
                name: 'components',
                kind: 'folder',
                children: [
                  { name: 'Button.svelte', kind: 'file' },
                  { name: 'Button.test.ts', kind: 'file', comment: 'co-located test' },
                  { name: 'Card.svelte', kind: 'file' },
                  { name: 'Modal.svelte', kind: 'file' },
                  { name: 'index.ts', kind: 'file', comment: 'barrel export' }
                ]
              },
              {
                name: 'state',
                kind: 'folder',
                children: [
                  { name: 'auth.svelte.ts', kind: 'file' },
                  { name: 'cart.svelte.ts', kind: 'file' },
                  { name: 'counter.svelte.test.ts', kind: 'file' }
                ]
              },
              {
                name: 'server',
                kind: 'folder',
                comment: 'server-only: imports fail on client',
                children: [
                  { name: 'db.ts', kind: 'file' },
                  { name: 'auth.ts', kind: 'file' }
                ]
              },
              {
                name: 'utils',
                kind: 'folder',
                children: [
                  { name: 'format.ts', kind: 'file' },
                  { name: 'format.test.ts', kind: 'file' }
                ]
              },
              { name: 'types.ts', kind: 'file' },
              { name: 'index.ts', kind: 'file' }
            ]
          },
          {
            name: 'routes',
            kind: 'folder',
            children: [
              { name: '+layout.svelte', kind: 'file' },
              { name: '+layout.server.ts', kind: 'file' },
              { name: '+page.svelte', kind: 'file' },
              {
                name: '(marketing)',
                kind: 'folder',
                comment: 'group — no URL segment',
                children: [
                  {
                    name: 'about',
                    kind: 'folder',
                    children: [{ name: '+page.svelte', kind: 'file' }]
                  },
                  {
                    name: 'pricing',
                    kind: 'folder',
                    children: [{ name: '+page.svelte', kind: 'file' }]
                  }
                ]
              },
              {
                name: '(app)',
                kind: 'folder',
                comment: 'auth-gated group',
                children: [
                  { name: '+layout.server.ts', kind: 'file' },
                  {
                    name: 'dashboard',
                    kind: 'folder',
                    children: [
                      { name: '+page.svelte', kind: 'file' },
                      { name: '+page.server.ts', kind: 'file' }
                    ]
                  }
                ]
              },
              {
                name: 'blog',
                kind: 'folder',
                children: [
                  {
                    name: '[slug]',
                    kind: 'folder',
                    children: [
                      { name: '+page.svelte', kind: 'file' },
                      { name: '+page.server.ts', kind: 'file' },
                      { name: '_helpers.ts', kind: 'file', comment: 'private: not routable' }
                    ]
                  }
                ]
              }
            ]
          },
          { name: 'app.css', kind: 'file' },
          { name: 'app.html', kind: 'file' }
        ]
      },
      { name: 'e2e', kind: 'folder', children: [{ name: 'home.spec.ts', kind: 'file' }] },
      { name: 'package.json', kind: 'file' },
      { name: 'svelte.config.js', kind: 'file' }
    ]
  };

  const namingRules = [
    { pattern: 'Button.svelte', rule: 'PascalCase', applies: 'Components' },
    { pattern: 'format.ts',     rule: 'kebab-case or camelCase', applies: 'Utilities' },
    { pattern: 'auth.svelte.ts', rule: '.svelte.ts suffix', applies: 'Rune modules' },
    { pattern: 'blog-post/',     rule: 'kebab-case', applies: 'Route folders' },
    { pattern: '[slug]/',        rule: '[bracket-param]', applies: 'Dynamic routes' },
    { pattern: '(marketing)/',   rule: '(parentheses)', applies: 'Route groups' },
    { pattern: '_helpers.ts',    rule: '_ prefix', applies: 'Private route modules' },
    { pattern: '+page.svelte',   rule: '+ prefix', applies: 'Route files' }
  ];

  const barrelCode = \`// src/lib/components/index.ts — barrel export
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Modal } from './Modal.svelte';
export { default as Nav } from './Nav.svelte';
export type { ButtonProps } from './Button.svelte';

// Consumer gets clean imports
import { Button, Card, Modal } from '$lib/components';
// instead of
import Button from '$lib/components/Button.svelte';
import Card from '$lib/components/Card.svelte';
import Modal from '$lib/components/Modal.svelte';

// src/lib/index.ts — top-level barrel (for library authors)
export * from './components';
export * from './state';
export * from './utils';
// NEVER re-export from './server' — that would leak secrets to the client\`;

  const routeGroupsCode = \`// Route groups — (parens) do not affect URLs
src/routes/
  (marketing)/
    about/+page.svelte        →  /about
    pricing/+page.svelte      →  /pricing
    +layout.svelte            →  marketing layout
  (app)/
    dashboard/+page.svelte    →  /dashboard
    settings/+page.svelte     →  /settings
    +layout.server.ts         →  auth guard
    +layout.svelte            →  app shell
  +layout.svelte              →  root layout wraps BOTH groups

// Private modules — _ prefix hides from routing
src/routes/blog/[slug]/
  +page.svelte
  +page.server.ts
  _helpers.ts                 →  imported by +page.server.ts but not a route
  _MarkdownRenderer.svelte    →  component used only here\`;

  const auditCode = \`# Quick project-structure audit checklist

[ ] Components PascalCase, one file per component
[ ] Tests co-located with implementation (*.test.ts)
[ ] Rune modules use .svelte.ts extension
[ ] $lib/server/ used for secrets, never exported from $lib/index.ts
[ ] Route folders kebab-case, params in [brackets]
[ ] Route groups (parens) for layouts without URL changes
[ ] Private helpers prefixed with _ inside route folders
[ ] Each $lib subfolder has an index.ts barrel
[ ] No deep relative imports — prefer $lib alias
[ ] No circular imports (check with madge or eslint-plugin-import)\`;

  // Audit checker
  let auditChecks = $state([
    { label: 'Components use PascalCase', done: true },
    { label: 'Routes use kebab-case', done: true },
    { label: 'Tests co-located with source', done: false },
    { label: '$lib/server/ for secrets', done: false },
    { label: 'Barrel exports in place', done: false },
    { label: 'No deep relative imports', done: false }
  ]);

  let auditScore = $derived(
    Math.round((auditChecks.filter((c) => c.done).length / auditChecks.length) * 100)
  );

  function toggleCheck(i: number) {
    const next = [...auditChecks];
    next[i] = { ...next[i], done: !next[i].done };
    auditChecks = next;
  }
</script>

<main>
  <h1>File Organization & Naming</h1>
  <p class="subtitle">Conventions that scale from solo to team</p>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'tree'} onclick={() => (activeTab = 'tree')}>Project Tree</button>
    <button class:active={activeTab === 'naming'} onclick={() => (activeTab = 'naming')}>Naming</button>
    <button class:active={activeTab === 'barrels'} onclick={() => (activeTab = 'barrels')}>Barrel Exports</button>
    <button class:active={activeTab === 'routes'} onclick={() => (activeTab = 'routes')}>Route Groups</button>
    <button class:active={activeTab === 'audit'} onclick={() => (activeTab = 'audit')}>Audit</button>
  </nav>

  {#if activeTab === 'tree'}
    <section>
      <h2>Reference Project Layout</h2>
      {@render treeNode(tree, 0)}
    </section>
  {:else if activeTab === 'naming'}
    <section>
      <h2>Naming Conventions</h2>
      <table class="rules">
        <thead><tr><th>Pattern</th><th>Rule</th><th>Applies to</th></tr></thead>
        <tbody>
          {#each namingRules as r (r.pattern)}
            <tr>
              <td><code>{r.pattern}</code></td>
              <td>{r.rule}</td>
              <td>{r.applies}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {:else if activeTab === 'barrels'}
    <section>
      <h2>Barrel Exports</h2>
      <p>An <code>index.ts</code> re-exports everything from a folder so consumers can import from one place.</p>
      <pre><code>{barrelCode}</code></pre>
    </section>
  {:else if activeTab === 'routes'}
    <section>
      <h2>Route Groups & Private Modules</h2>
      <pre><code>{routeGroupsCode}</code></pre>
    </section>
  {:else}
    <section>
      <h2>Project Structure Audit</h2>
      <pre><code>{auditCode}</code></pre>

      <div class="audit-progress">
        <div class="audit-bar"><div class="audit-fill" style="width: {auditScore}%"></div></div>
        <span class="audit-score">{auditScore}%</span>
      </div>

      <div class="audit-list">
        {#each auditChecks as check, i (check.label)}
          <button class="audit-item" class:done={check.done} onclick={() => toggleCheck(i)}>
            <span class="checkbox">{check.done ? '✓' : ''}</span>
            <span>{check.label}</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}
</main>

{#snippet treeNode(node: Node, depth: number)}
  <div class="node" style="--depth: {depth}">
    <span class="icon">{node.kind === 'folder' ? '▸' : '·'}</span>
    <span class="name {node.kind}">{node.name}</span>
    {#if node.comment}<span class="comment">{node.comment}</span>{/if}
  </div>
  {#if node.children}
    {#each node.children as child (child.name)}
      {@render treeNode(child, depth + 1)}
    {/each}
  {/if}
{/snippet}

<style>
  main { max-width: 900px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .tabs { display: flex; gap: 0.35rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
  .tabs button { padding: 0.55rem 1rem; border: none; background: transparent; border-radius: 6px 6px 0 0; font-weight: 500; cursor: pointer; }
  .tabs button.active { background: #eef4fb; color: #1e40af; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }

  .node {
    display: grid;
    grid-template-columns: 20px auto 1fr;
    gap: 0.4rem;
    padding: 0.2rem 0.5rem;
    padding-left: calc(var(--depth) * 1.25rem + 0.5rem);
    font-family: monospace;
    font-size: 0.82rem;
    align-items: center;
  }
  .node:hover { background: #f8f9fa; }
  .icon { color: #888; }
  .name.folder { color: #1e40af; font-weight: 600; }
  .name.file { color: #111; }
  .comment { color: #16a34a; font-style: italic; font-size: 0.75rem; }

  .rules { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  .rules th, .rules td { padding: 0.55rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
  .rules th { background: #f0f0f0; }

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
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }

  .audit-progress { display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0; }
  .audit-bar { flex: 1; background: #e5e7eb; border-radius: 999px; height: 10px; overflow: hidden; }
  .audit-fill { background: #16a34a; height: 100%; transition: width 200ms; }
  .audit-score { font-weight: 700; font-family: monospace; }

  .audit-list { display: flex; flex-direction: column; gap: 0.4rem; }
  .audit-item {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.8rem;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    font-size: 0.9rem;
  }
  .audit-item.done { background: #dcfce7; border-color: #16a34a; }
  .checkbox {
    width: 22px; height: 22px;
    border: 2px solid #888;
    border-radius: 4px;
    display: grid;
    place-items: center;
    font-weight: bold;
    color: #16a34a;
  }
  .audit-item.done .checkbox { border-color: #16a34a; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
