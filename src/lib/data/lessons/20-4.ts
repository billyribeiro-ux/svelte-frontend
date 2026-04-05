import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-4',
		title: 'Page Architecture & Data',
		phase: 7,
		module: 20,
		lessonIndex: 4
	},
	description: `SvelteKit's page architecture connects routes, layouts, load functions, form actions, and error boundaries into a single coherent data flow. +layout.server.ts runs on the server and loads data shared across every nested route. +layout.svelte consumes that data. +page.server.ts loads page-specific data and defines form actions. +page.svelte is the leaf that renders it. +error.svelte catches anything that throws along the way.

This lesson wires all five file types together for a realistic example: an authenticated dashboard with nested routes, shared user data, typed load functions, and progressively-enhanced form actions.`,
	objectives: [
		'Load shared data in +layout.server.ts and consume it in +layout.svelte',
		'Define route-specific load functions in +page.server.ts',
		'Implement form actions with progressive enhancement and use:enhance',
		'Handle errors with +error.svelte boundaries',
		'Compose nested layouts for authenticated vs marketing routes'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'flow' | 'layout-server' | 'layout' | 'page-server' | 'page' | 'action' | 'error';
  let activeTab = $state<Tab>('flow');

  // Data-flow diagram nodes
  type FlowNode = { id: string; label: string; kind: 'server' | 'shared' | 'client'; emits: string };
  const flow: FlowNode[] = [
    { id: '1', label: '+layout.server.ts', kind: 'server', emits: 'auth user, theme preference' },
    { id: '2', label: '+layout.ts',         kind: 'shared', emits: 'derived user permissions' },
    { id: '3', label: '+layout.svelte',     kind: 'client', emits: 'shell, nav, slot children' },
    { id: '4', label: '+page.server.ts',    kind: 'server', emits: 'page data + form actions' },
    { id: '5', label: '+page.ts',           kind: 'shared', emits: 'optional client-side load' },
    { id: '6', label: '+page.svelte',       kind: 'client', emits: 'the UI the user sees' },
    { id: '7', label: '+error.svelte',      kind: 'client', emits: 'renders if anything throws' }
  ];

  const layoutServerCode = \`// src/routes/(app)/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, locals }) => {
  const user = await locals.getUser(cookies.get('session'));

  if (!user) {
    throw redirect(303, '/login');
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    theme: cookies.get('theme') ?? 'light'
  };
};\`;

  const layoutCode = \`<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
  import type { LayoutProps } from './$types';
  import Nav from '$lib/components/Nav.svelte';
  import UserMenu from '$lib/components/UserMenu.svelte';

  let { data, children }: LayoutProps = $props();

  // data.user is typed from +layout.server.ts return
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/projects',  label: 'Projects' },
    { href: '/settings',  label: 'Settings' }
  ];
<\\/script>

<div data-theme={data.theme} class="shell">
  <header>
    <Nav links={navLinks} brand="Acme" />
    <UserMenu user={data.user} />
  </header>

  <main>
    {@render children()}
  </main>
</div>\`;

  const pageServerCode = \`// src/routes/(app)/projects/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
  const page = Number(url.searchParams.get('page') ?? 1);
  const projects = await locals.db.projects.list({
    userId: locals.user.id,
    page,
    perPage: 20
  });

  return {
    projects,
    page,
    hasMore: projects.length === 20
  };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const data = await request.formData();
    const name = data.get('name')?.toString().trim();

    if (!name) {
      return fail(400, { error: 'Name is required', name });
    }

    const project = await locals.db.projects.create({
      name,
      userId: locals.user.id
    });

    throw redirect(303, \\\`/projects/\\\${project.id}\\\`);
  },

  delete: async ({ request, locals }) => {
    const data = await request.formData();
    const id = data.get('id')?.toString();
    if (!id) return fail(400);
    await locals.db.projects.delete(id, locals.user.id);
    return { success: true };
  }
};\`;

  const pageCode = \`<!-- src/routes/(app)/projects/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageProps } from './$types';
  import Button from '$lib/components/Button.svelte';
  import Input from '$lib/components/Input.svelte';
  import Card from '$lib/components/Card.svelte';

  let { data, form }: PageProps = $props();

  let creating = $state(false);
<\\/script>

<h1>Projects</h1>

<form
  method="POST"
  action="?/create"
  use:enhance={() => {
    creating = true;
    return async ({ update }) => {
      await update();
      creating = false;
    };
  }}
>
  <Input
    label="New project"
    name="name"
    value={form?.name ?? ''}
    error={form?.error}
    required
  />
  <Button type="submit" loading={creating}>Create project</Button>
</form>

<div class="grid">
  {#each data.projects as project (project.id)}
    <Card href="/projects/{project.id}">
      <h3>{project.name}</h3>
      <p>Updated {project.updatedAt}</p>
    </Card>
  {/each}
</div>

{#if data.hasMore}
  <a href="?page={data.page + 1}">Next page →</a>
{/if}\`;

  const errorCode = \`<!-- src/routes/+error.svelte — catches any thrown error below -->
<script lang="ts">
  import { page } from '$app/state';
<\\/script>

<main class="error-page">
  <h1>{page.status}</h1>
  <p>{page.error?.message ?? 'Something went wrong.'}</p>
  <a href="/">Go home</a>
</main>\`;

  const actionCode = \`<!-- Progressive enhancement with use:enhance -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';

  let submitting = $state(false);

  const handleSubmit: SubmitFunction = ({ formElement, formData, cancel }) => {
    // Runs before submit — access formData, cancel, or mutate
    submitting = true;

    return async ({ result, update }) => {
      // Runs after the server responds
      submitting = false;

      if (result.type === 'success') {
        formElement.reset();
      }

      // update() applies the default SvelteKit behavior (redirects, errors)
      await update();
    };
  };
<\\/script>

<form method="POST" action="?/create" use:enhance={handleSubmit}>
  <input name="title" />
  <button disabled={submitting}>
    {submitting ? 'Creating…' : 'Create'}
  </button>
</form>\`;
</script>

<main>
  <h1>Page Architecture & Data</h1>
  <p class="subtitle">Layout → page → component data flow</p>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'flow'} onclick={() => (activeTab = 'flow')}>Flow</button>
    <button class:active={activeTab === 'layout-server'} onclick={() => (activeTab = 'layout-server')}>+layout.server</button>
    <button class:active={activeTab === 'layout'} onclick={() => (activeTab = 'layout')}>+layout.svelte</button>
    <button class:active={activeTab === 'page-server'} onclick={() => (activeTab = 'page-server')}>+page.server</button>
    <button class:active={activeTab === 'page'} onclick={() => (activeTab = 'page')}>+page.svelte</button>
    <button class:active={activeTab === 'action'} onclick={() => (activeTab = 'action')}>use:enhance</button>
    <button class:active={activeTab === 'error'} onclick={() => (activeTab = 'error')}>+error</button>
  </nav>

  {#if activeTab === 'flow'}
    <section>
      <h2>Data Flow</h2>
      <p>Data cascades down from layout.server to page.svelte. Each file has a specific role.</p>
      <ol class="flow-list">
        {#each flow as node, i (node.id)}
          <li class="flow-node {node.kind}">
            <div class="flow-step">{i + 1}</div>
            <div>
              <div class="flow-label">{node.label}</div>
              <div class="flow-emits">{node.emits}</div>
            </div>
            <span class="flow-kind">{node.kind}</span>
          </li>
        {/each}
      </ol>

      <div class="legend">
        <span class="leg server">server only</span>
        <span class="leg shared">universal (server + client)</span>
        <span class="leg client">client hydration</span>
      </div>
    </section>
  {:else if activeTab === 'layout-server'}
    <section>
      <h2>+layout.server.ts — shared data</h2>
      <p>Runs on every request to any nested route. Perfect for auth, user data, feature flags.</p>
      <pre><code>{layoutServerCode}</code></pre>
    </section>
  {:else if activeTab === 'layout'}
    <section>
      <h2>+layout.svelte — app shell</h2>
      <p>Consumes layout data via <code>$props()</code>. Renders the shared UI around <code>{'{@render children()}'}</code>.</p>
      <pre><code>{layoutCode}</code></pre>
    </section>
  {:else if activeTab === 'page-server'}
    <section>
      <h2>+page.server.ts — route data + actions</h2>
      <p>Load page-specific data. Export <code>actions</code> for form handlers — they run on the server and return JSON to the client.</p>
      <pre><code>{pageServerCode}</code></pre>
    </section>
  {:else if activeTab === 'page'}
    <section>
      <h2>+page.svelte — the leaf</h2>
      <p>Receives <code>data</code> from every load in the chain (layout + page). Form submissions return to <code>form</code> when they use actions.</p>
      <pre><code>{pageCode}</code></pre>
    </section>
  {:else if activeTab === 'action'}
    <section>
      <h2>Progressive Enhancement with use:enhance</h2>
      <p>Without JavaScript the form still works — it POSTs and reloads. With <code>use:enhance</code>, SvelteKit intercepts the submission and updates the page without a full reload.</p>
      <pre><code>{actionCode}</code></pre>
    </section>
  {:else}
    <section>
      <h2>+error.svelte — error boundary</h2>
      <p>Anywhere in the tree can throw with <code>error(404, 'Not found')</code>. The nearest <code>+error.svelte</code> renders. Place one at the root, and optionally in groups for localized error UI.</p>
      <pre><code>{errorCode}</code></pre>
    </section>
  {/if}
</main>

<style>
  main { max-width: 940px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .tabs { display: flex; gap: 0.35rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
  .tabs button { padding: 0.55rem 0.8rem; border: none; background: transparent; border-radius: 6px 6px 0 0; font-weight: 500; cursor: pointer; font-size: 0.82rem; }
  .tabs button.active { background: #eef4fb; color: #1e40af; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }

  .flow-list { display: flex; flex-direction: column; gap: 0.5rem; list-style: none; padding: 0; }
  .flow-node {
    display: grid;
    grid-template-columns: 40px 1fr auto;
    gap: 0.75rem;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f8f9fa;
    border-radius: 10px;
    border-left: 4px solid #ccc;
  }
  .flow-node.server { border-left-color: #dc2626; background: #fef2f2; }
  .flow-node.shared { border-left-color: #f59e0b; background: #fffbeb; }
  .flow-node.client { border-left-color: #16a34a; background: #dcfce7; }
  .flow-step {
    width: 32px; height: 32px;
    background: #4a90d9;
    color: white;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-weight: 700;
  }
  .flow-label { font-weight: 700; font-family: monospace; font-size: 0.9rem; }
  .flow-emits { font-size: 0.82rem; color: #555; }
  .flow-kind {
    font-size: 0.7rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
    background: white;
    border: 1px solid #ddd;
    text-transform: uppercase;
    font-weight: 600;
    color: #666;
  }

  .legend { display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap; }
  .leg { padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
  .leg.server { background: #fee2e2; color: #991b1b; }
  .leg.shared { background: #fef3c7; color: #92400e; }
  .leg.client { background: #dcfce7; color: #166534; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.76rem;
    line-height: 1.5;
    max-height: 620px;
  }
  pre code { background: none; padding: 0; }
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
