import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-1',
		title: 'Snippets: Reusable Markup',
		phase: 3,
		module: 10,
		lessonIndex: 1
	},
	description: `Snippets are Svelte 5's replacement for slots — and they're a huge upgrade. A snippet is a reusable block of template markup that behaves like a function: you define it with \`{#snippet name(args)}\`, call it with \`{@render name(args)}\`, and pass whatever parameters you need.

Unlike slots, snippets are **first-class values**. You can:

- **Parameterise** them (a snippet is essentially a template-returning function).
- **Close over reactive state** from their surrounding scope — a snippet that reads \`users\` re-renders when \`users\` changes.
- **Hoist** them freely — you can \`{@render}\` a snippet before its \`{#snippet}\` block in the file.
- **Pass** them to components as props (next lesson).
- **Recurse** — a snippet can render itself, which is exactly what you want for trees, nested menus, and comment threads.

This lesson builds a user list you can toggle between three views (cards, table, compact) — each view is a different parameterised snippet — and a recursive file-tree renderer that demonstrates the self-referencing pattern.`,
	objectives: [
		'Define and render snippets with {#snippet} and {@render}',
		'Pass parameters (even multiple typed ones) to snippets',
		'Understand that snippets close over surrounding reactive state',
		'Build parameterless snippets that reference $state and $derived from the closure',
		'Write recursive snippets for tree-shaped data',
		'Know that snippet definitions are hoisted within their component'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Snippets — Svelte 5's replacement for slots
  // ============================================================
  //
  // A snippet is a reusable block of template markup. Think of
  // it as a function that returns HTML:
  //
  //   {#snippet greeting(name)}
  //     <p>Hello, {name}!</p>
  //   {/snippet}
  //
  //   {@render greeting('Ada')}
  //
  // Snippets are first-class values. You can:
  //   - define them anywhere in a component
  //   - pass them to components as props
  //   - call them recursively
  //   - pass parameters (they're just like function arguments)
  //   - use reactive state from the surrounding scope
  //
  // Scoping rules:
  //   - A snippet can reference any variable visible at its
  //     definition site. That means the snippet "closes over"
  //     the surrounding state, so reads stay reactive.
  //   - Snippets are hoisted within their declaring component,
  //     so you can {@render snip()} before the {#snippet} block.

  interface User {
    name: string;
    role: 'admin' | 'editor' | 'viewer';
    active: boolean;
    email: string;
  }

  let users: User[] = $state([
    { name: 'Ada Lovelace', role: 'admin', active: true, email: 'ada@example.com' },
    { name: 'Alan Turing', role: 'editor', active: true, email: 'alan@example.com' },
    { name: 'Grace Hopper', role: 'admin', active: false, email: 'grace@example.com' },
    { name: 'Edsger Dijkstra', role: 'viewer', active: true, email: 'edsger@example.com' }
  ]);

  type View = 'cards' | 'table' | 'compact';
  let view: View = $state('cards');

  // Recursive tree data.
  interface Node {
    name: string;
    children?: Node[];
  }

  const fileTree: Node = {
    name: 'project',
    children: [
      {
        name: 'src',
        children: [
          { name: 'App.svelte' },
          { name: 'main.ts' },
          {
            name: 'lib',
            children: [
              { name: 'Button.svelte' },
              { name: 'Card.svelte' }
            ]
          }
        ]
      },
      { name: 'package.json' },
      { name: 'README.md' }
    ]
  };

  // Derived count for use inside the header snippet — proves
  // snippets read reactive state from the surrounding scope.
  const activeCount = $derived(users.filter((u) => u.active).length);
</script>

<!-- Parameterless snippet — referencing $state from the closure -->
{#snippet header()}
  <header class="page-header">
    <h1>Team Members</h1>
    <p>{users.length} total · {activeCount} active</p>
  </header>
{/snippet}

<!-- Snippet with a single parameter -->
{#snippet userCard(user: User)}
  <article class="card" class:inactive={!user.active}>
    <div class="avatar">{user.name.charAt(0)}</div>
    <div>
      <strong>{user.name}</strong>
      <span class="role role-{user.role}">{user.role}</span>
      <div class="email">{user.email}</div>
    </div>
    {#if user.active}
      <span class="dot" title="active"></span>
    {/if}
  </article>
{/snippet}

<!-- Snippet with multiple parameters — zebra striping by index -->
{#snippet userRow(user: User, index: number)}
  <tr class:even={index % 2 === 0}>
    <td>{index + 1}</td>
    <td>{user.name}</td>
    <td><span class="role role-{user.role}">{user.role}</span></td>
    <td>{user.active ? 'Yes' : 'No'}</td>
    <td><a href="mailto:{user.email}">{user.email}</a></td>
  </tr>
{/snippet}

<!-- Compact one-liner snippet — snippets can be tiny -->
{#snippet compact(user: User)}
  <li class:muted={!user.active}>
    {user.name} <span class="role role-{user.role}">{user.role}</span>
  </li>
{/snippet}

<!-- Recursive snippet — a snippet can render itself -->
{#snippet treeNode(node: Node, depth: number = 0)}
  <li style="padding-left: {depth * 1.2}rem">
    <span class="tree-label">
      {node.children ? '📁' : '📄'} {node.name}
    </span>
    {#if node.children && node.children.length > 0}
      <ul class="tree">
        {#each node.children as child (child.name)}
          {@render treeNode(child, depth + 1)}
        {/each}
      </ul>
    {/if}
  </li>
{/snippet}

<main>
  {@render header()}

  <p class="lede">
    Snippets are Svelte 5's replacement for slots. They're
    parameterised, hoisted, can be passed around, and can
    even recurse. Use them wherever you would have copy-pasted
    markup.
  </p>

  <div class="toolbar">
    <span>View:</span>
    {#each (['cards', 'table', 'compact'] as const) as v (v)}
      <label>
        <input type="radio" bind:group={view} value={v} />
        {v}
      </label>
    {/each}
  </div>

  {#if view === 'cards'}
    <div class="cards">
      {#each users as user (user.email)}
        {@render userCard(user)}
      {/each}
    </div>
  {:else if view === 'table'}
    <table>
      <thead>
        <tr><th>#</th><th>Name</th><th>Role</th><th>Active</th><th>Email</th></tr>
      </thead>
      <tbody>
        {#each users as user, i (user.email)}
          {@render userRow(user, i)}
        {/each}
      </tbody>
    </table>
  {:else}
    <ul class="compact">
      {#each users as user (user.email)}
        {@render compact(user)}
      {/each}
    </ul>
  {/if}

  <section>
    <h2>Recursive snippets</h2>
    <p>
      A snippet can call itself — exactly what you want for
      rendering a tree without writing a separate component.
    </p>
    <ul class="tree root">
      {@render treeNode(fileTree, 0)}
    </ul>
  </section>

  <section class="notes">
    <h2>Snippet rules at a glance</h2>
    <ul>
      <li>Defined with <code>{'{#snippet name(args)}'}</code> … <code>{'{/snippet}'}</code>.</li>
      <li>Rendered with <code>{'{@render name(args)}'}</code>.</li>
      <li>Can take any number of parameters, typed just like function arguments.</li>
      <li>Hoisted inside their component — render before declaration if you like.</li>
      <li>Close over surrounding state — reading <code>users</code> or <code>activeCount</code> inside a snippet is reactive.</li>
      <li>Can be recursive (as the file tree above demonstrates).</li>
      <li>Can be passed to components as props — the next lesson covers that.</li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 780px; margin: 0 auto; padding: 1.25rem; font-family: system-ui, sans-serif; }
  .page-header { margin-bottom: 1rem; }
  .page-header h1 { margin: 0; }
  .page-header p { margin: 0.25rem 0 0; color: #6b7280; font-size: 0.9rem; }
  .lede { color: #555; margin: 0 0 1rem; }
  .toolbar {
    display: flex; align-items: center; gap: 1rem;
    padding: 0.6rem 0.8rem;
    background: #f3f4f6;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
  .toolbar label { display: inline-flex; align-items: center; gap: 0.3rem; cursor: pointer; }
  .cards { display: flex; flex-direction: column; gap: 0.5rem; }
  .card {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
  }
  .card.inactive { opacity: 0.55; background: #f9fafb; }
  .avatar {
    width: 36px; height: 36px;
    border-radius: 50%;
    background: #6690ff; color: white;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700;
  }
  .card > div:nth-child(2) { flex: 1; }
  .email { font-size: 0.78rem; color: #6b7280; }
  .dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; }
  .role {
    display: inline-block;
    font-size: 0.7rem;
    padding: 0.05rem 0.45rem;
    border-radius: 999px;
    margin-left: 0.4rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 600;
  }
  .role-admin { background: #fef3c7; color: #92400e; }
  .role-editor { background: #dbeafe; color: #1e40af; }
  .role-viewer { background: #f3f4f6; color: #4b5563; }
  table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  th, td { padding: 0.5rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
  tr.even { background: #fafafa; }
  th { background: #f3f4f6; font-weight: 600; }
  .compact { list-style: none; padding: 0; margin: 0; }
  .compact li { padding: 0.35rem 0.6rem; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem; }
  .compact li.muted { color: #9ca3af; }
  section { margin-top: 1.5rem; padding: 1rem; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
  h2 { margin: 0 0 0.5rem; font-size: 1rem; }
  .tree { list-style: none; padding: 0; margin: 0; }
  .tree.root { padding-left: 0; }
  .tree-label { font-family: ui-monospace, monospace; font-size: 0.85rem; }
  .notes ul { padding-left: 1.2rem; font-size: 0.88rem; }
  .notes li { margin: 0.3rem 0; }
  code {
    background: #f3f4f6;
    padding: 0 0.3rem;
    border-radius: 3px;
    font-size: 0.85em;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
