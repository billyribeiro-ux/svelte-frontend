import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '19-8',
		title: 'File Organization & Naming',
		phase: 7,
		module: 19,
		lessonIndex: 8
	},
	description: `A well-organized SvelteKit project follows clear conventions: PascalCase for component files (Button.svelte), kebab-case for route directories (/blog-post), and a structured $lib directory for shared code. Co-locating related files (component + test + types) keeps maintenance simple, while barrel exports (index.ts) provide clean import paths.

Route grouping with (parentheses) directories lets you share layouts without affecting URLs. This lesson covers the file organization patterns that scale from solo projects to team codebases.`,
	objectives: [
		'Apply PascalCase naming for components and kebab-case for routes',
		'Organize $lib with components, utils, server, and types directories',
		'Use barrel exports (index.ts) for clean import paths',
		'Implement route grouping and co-location patterns'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type FileEntry = {
    name: string;
    type: 'file' | 'folder';
    indent: number;
    highlight?: string;
    children?: FileEntry[];
  };

  const projectStructure: FileEntry[] = [
    { name: 'src/', type: 'folder', indent: 0 },
    { name: 'lib/', type: 'folder', indent: 1, highlight: '$lib alias' },
    { name: 'components/', type: 'folder', indent: 2 },
    { name: 'ui/', type: 'folder', indent: 3 },
    { name: 'Button.svelte', type: 'file', indent: 4, highlight: 'PascalCase' },
    { name: 'Button.test.ts', type: 'file', indent: 4, highlight: 'Co-located test' },
    { name: 'Card.svelte', type: 'file', indent: 4 },
    { name: 'Input.svelte', type: 'file', indent: 4 },
    { name: 'index.ts', type: 'file', indent: 4, highlight: 'Barrel export' },
    { name: 'layout/', type: 'folder', indent: 3 },
    { name: 'Header.svelte', type: 'file', indent: 4 },
    { name: 'Footer.svelte', type: 'file', indent: 4 },
    { name: 'Sidebar.svelte', type: 'file', indent: 4 },
    { name: 'index.ts', type: 'file', indent: 4, highlight: 'Barrel export' },
    { name: 'data/', type: 'folder', indent: 2 },
    { name: 'lessons/', type: 'folder', indent: 3 },
    { name: '1-1.ts', type: 'file', indent: 4 },
    { name: '1-2.ts', type: 'file', indent: 4 },
    { name: 'server/', type: 'folder', indent: 2, highlight: 'Server-only code' },
    { name: 'db.ts', type: 'file', indent: 3 },
    { name: 'auth.ts', type: 'file', indent: 3 },
    { name: 'types/', type: 'folder', indent: 2 },
    { name: 'index.ts', type: 'file', indent: 3 },
    { name: 'utils/', type: 'folder', indent: 2 },
    { name: 'format.ts', type: 'file', indent: 3 },
    { name: 'validation.ts', type: 'file', indent: 3 },
    { name: 'index.ts', type: 'file', indent: 3, highlight: 'Barrel export' },
    { name: 'state/', type: 'folder', indent: 2 },
    { name: 'counter.svelte.ts', type: 'file', indent: 3, highlight: 'Reactive module' },
    { name: 'theme.svelte.ts', type: 'file', indent: 3 },
    { name: 'routes/', type: 'folder', indent: 1, highlight: 'kebab-case' },
    { name: '+layout.svelte', type: 'file', indent: 2 },
    { name: '+page.svelte', type: 'file', indent: 2, highlight: 'Homepage' },
    { name: '(marketing)/', type: 'folder', indent: 2, highlight: 'Route group' },
    { name: 'about/', type: 'folder', indent: 3 },
    { name: '+page.svelte', type: 'file', indent: 4 },
    { name: 'pricing/', type: 'folder', indent: 3 },
    { name: '+page.svelte', type: 'file', indent: 4 },
    { name: '+layout.svelte', type: 'file', indent: 3, highlight: 'Shared layout' },
    { name: 'blog/', type: 'folder', indent: 2 },
    { name: '+page.svelte', type: 'file', indent: 3 },
    { name: '[slug]/', type: 'folder', indent: 3 },
    { name: '+page.svelte', type: 'file', indent: 4 },
    { name: '+page.server.ts', type: 'file', indent: 4 },
    { name: '(app)/', type: 'folder', indent: 2, highlight: 'Auth route group' },
    { name: 'dashboard/', type: 'folder', indent: 3 },
    { name: '+page.svelte', type: 'file', indent: 4 },
    { name: 'settings/', type: 'folder', indent: 3 },
    { name: '+page.svelte', type: 'file', indent: 4 },
    { name: '+layout.svelte', type: 'file', indent: 3, highlight: 'Auth check layout' },
    { name: 'app.css', type: 'file', indent: 1 },
    { name: 'app.html', type: 'file', indent: 1 }
  ];

  const barrelExportCode = \`// src/lib/components/ui/index.ts
export { default as Button } from './Button.svelte';
export { default as Card } from './Card.svelte';
export { default as Input } from './Input.svelte';

// Usage in any component:
import { Button, Card, Input } from '$lib/components/ui';

// Instead of:
import Button from '$lib/components/ui/Button.svelte';
import Card from '$lib/components/ui/Card.svelte';
import Input from '$lib/components/ui/Input.svelte';\`;

  const routeGroupCode = \`// Route groups: (parentheses) = shared layout, no URL impact

// (marketing)/about/+page.svelte  → /about
// (marketing)/pricing/+page.svelte → /pricing
// Both share (marketing)/+layout.svelte

// (app)/dashboard/+page.svelte    → /dashboard
// (app)/settings/+page.svelte     → /settings
// Both share (app)/+layout.svelte (auth guard)\`;

  type NamingRule = { pattern: string; convention: string; example: string };

  const namingRules: NamingRule[] = [
    { pattern: 'Components', convention: 'PascalCase', example: 'Button.svelte, UserCard.svelte' },
    { pattern: 'Routes', convention: 'kebab-case', example: '/blog-post, /user-settings' },
    { pattern: 'Utilities', convention: 'camelCase', example: 'formatDate.ts, validateEmail.ts' },
    { pattern: 'Reactive modules', convention: 'camelCase + .svelte.ts', example: 'counter.svelte.ts' },
    { pattern: 'Types', convention: 'PascalCase exports', example: 'type UserProfile, interface PageData' },
    { pattern: 'Constants', convention: 'UPPER_SNAKE_CASE', example: 'MAX_RETRIES, API_BASE_URL' },
    { pattern: 'Server modules', convention: '$lib/server/', example: 'db.ts, auth.ts (never sent to client)' }
  ];
</script>

<main>
  <h1>File Organization & Naming</h1>
  <p class="subtitle">PascalCase components, kebab-case routes, structured $lib</p>

  <section class="file-tree">
    <h2>Project Structure</h2>
    <div class="tree">
      {#each projectStructure as entry}
        <div
          class="tree-entry"
          class:folder={entry.type === 'folder'}
          class:file={entry.type === 'file'}
          style="padding-left: {entry.indent * 1.25 + 0.5}rem"
        >
          <span class="entry-icon">{entry.type === 'folder' ? '\u{1F4C1}' : '\u{1F4C4}'}</span>
          <span class="entry-name">{entry.name}</span>
          {#if entry.highlight}
            <span class="entry-note">{entry.highlight}</span>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <section>
    <h2>Naming Conventions</h2>
    <table>
      <thead>
        <tr><th>Pattern</th><th>Convention</th><th>Example</th></tr>
      </thead>
      <tbody>
        {#each namingRules as rule}
          <tr>
            <td><strong>{rule.pattern}</strong></td>
            <td><code>{rule.convention}</code></td>
            <td>{rule.example}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Barrel Exports</h2>
    <pre><code>{barrelExportCode}</code></pre>
  </section>

  <section>
    <h2>Route Grouping</h2>
    <pre><code>{routeGroupCode}</code></pre>
  </section>
</main>

<style>
  main {
    max-width: 850px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .tree {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 10px;
    font-family: 'Fira Code', monospace;
    font-size: 0.82rem;
    line-height: 1.6;
  }

  .tree-entry {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .tree-entry.folder .entry-name {
    color: #4ec9b0;
    font-weight: 600;
  }

  .tree-entry.file .entry-name {
    color: #9cdcfe;
  }

  .entry-icon {
    font-size: 0.9rem;
    width: 1.2rem;
    text-align: center;
  }

  .entry-note {
    font-size: 0.7rem;
    color: #888;
    margin-left: 0.5rem;
    padding: 0.1rem 0.4rem;
    background: #2d2d2d;
    border-radius: 3px;
  }

  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th, td { padding: 0.6rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
  th { background: #f0f0f0; }

  code {
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }

  pre code { background: none; padding: 0; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.5;
  }

  section { margin-bottom: 2.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
