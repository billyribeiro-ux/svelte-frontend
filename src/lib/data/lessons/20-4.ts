import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-4',
		title: 'Page Architecture & Data',
		phase: 7,
		module: 20,
		lessonIndex: 4
	},
	description: `SvelteKit's page architecture connects routes, layouts, load functions, form actions, and error boundaries into a cohesive data flow. Each +page.server.ts loads data on the server, +layout.svelte provides shared UI, form actions handle mutations with progressive enhancement, and +error.svelte catches failures gracefully.

This lesson shows the complete picture — how data flows from server to page to component, and how to architect routes, layouts, and error handling for a production application.`,
	objectives: [
		'Architect routes with nested layouts and shared data loading',
		'Implement +page.server.ts load functions with proper typing',
		'Handle form mutations with form actions and progressive enhancement',
		'Set up error boundaries with +error.svelte for graceful error handling'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type DataFlowStep = {
    file: string;
    role: string;
    direction: 'server' | 'shared' | 'client';
    code: string;
  };

  const dataFlow: DataFlowStep[] = [
    {
      file: '+layout.server.ts',
      role: 'Root data loading — auth, shared data',
      direction: 'server',
      code: \`// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { getUser } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const sessionId = cookies.get('session');
  const user = sessionId ? await getUser(sessionId) : null;

  return {
    user  // Available in ALL child routes
  };
};\`
    },
    {
      file: '+layout.svelte',
      role: 'Shared UI — header, footer, navigation',
      direction: 'shared',
      code: \`<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import type { LayoutData } from './$types';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';

  let { data, children }: { data: LayoutData; children: any } = $props();
<\\/script>

<Header user={data.user} />
<main>
  {@render children()}
</main>
<Footer />\`
    },
    {
      file: '+page.server.ts',
      role: 'Page data loading & form actions',
      direction: 'server',
      code: \`// src/routes/blog/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { fetchPosts, createPost } from '$lib/server/posts';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page') ?? '1');
  const { posts, total } = await fetchPosts({ page, limit: 10 });

  return {
    posts,
    total,
    page
  };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (!locals.user) return fail(401, { message: 'Not authenticated' });

    const formData = await request.formData();
    const title = formData.get('title')?.toString();
    const content = formData.get('content')?.toString();

    if (!title || title.length < 3) {
      return fail(400, { title, content, message: 'Title must be at least 3 characters' });
    }

    const post = await createPost({ title, content, authorId: locals.user.id });
    throw redirect(303, \\\`/blog/\\\${post.slug}\\\`);
  }
};\`
    },
    {
      file: '+page.svelte',
      role: 'Page component — renders data, handles forms',
      direction: 'client',
      code: \`<!-- src/routes/blog/+page.svelte -->
<script lang="ts">
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import PostCard from '$lib/components/PostCard.svelte';
  import Pagination from '$lib/components/ui/Pagination.svelte';

  let { data, form }: { data: PageData; form: ActionData } = $props();
<\\/script>

<svelte:head>
  <title>Blog — My App</title>
  <meta name="description" content="Latest posts and articles" />
</svelte:head>

<h1>Blog</h1>

{#if form?.message}
  <p class="error" role="alert">{form.message}</p>
{/if}

<div class="post-grid">
  {#each data.posts as post}
    <PostCard {post} />
  {/each}
</div>

<Pagination total={data.total} current={data.page} />\`
    },
    {
      file: '+error.svelte',
      role: 'Error boundary — catches load/render errors',
      direction: 'client',
      code: \`<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
<\\/script>

<svelte:head>
  <title>Error {page.status} — My App</title>
</svelte:head>

<div class="error-page">
  <h1>{page.status}</h1>
  <p>{page.error?.message ?? 'Something went wrong'}</p>
  <a href="/">Go home</a>
</div>\`
    }
  ];

  let activeStep = $state(0);

  const directionColors: Record<string, string> = {
    server: '#dc2626',
    shared: '#ca8a04',
    client: '#16a34a'
  };

  // Route architecture overview
  const routeOverview = \`src/routes/
  +layout.server.ts    # Auth, global data
  +layout.svelte       # Header, Footer, <main>
  +error.svelte        # Global error boundary
  +page.svelte         # Homepage

  (marketing)/
    +layout.svelte     # Marketing layout
    about/+page.svelte
    pricing/+page.svelte

  blog/
    +page.server.ts    # Load posts list
    +page.svelte       # Post grid + pagination
    [slug]/
      +page.server.ts  # Load single post
      +page.svelte     # Post detail
      +error.svelte    # Post-level error

  (app)/
    +layout.server.ts  # Auth guard
    +layout.svelte     # Dashboard layout
    dashboard/+page.svelte
    settings/+page.svelte\`;

  // Form actions with progressive enhancement
  const formActionsCode = \`<!-- Progressive form with enhance -->
<form method="POST" action="?/create" use:enhance={() => {
  // Called before submit
  return async ({ result, update }) => {
    if (result.type === 'redirect') {
      // Custom redirect handling
      goto(result.location);
    } else {
      // Default: rerun load functions, update form prop
      await update();
    }
  };
}}>
  <input name="title" value={form?.title ?? ''} />
  <textarea name="content">{form?.content ?? ''}</textarea>
  <button type="submit">Create Post</button>
</form>

<!-- Works WITHOUT JavaScript! -->
<!-- With JS: no full page reload -->\`;
</script>

<main>
  <h1>Page Architecture & Data</h1>
  <p class="subtitle">Routes, layouts, load, form actions, error boundaries</p>

  <section class="data-flow">
    <h2>Data Flow</h2>
    <div class="flow-nav">
      {#each dataFlow as step, i}
        <button
          class="flow-step"
          class:active={activeStep === i}
          onclick={() => activeStep = i}
          style="border-left: 3px solid {directionColors[step.direction]}"
        >
          <code>{step.file}</code>
          <span class="step-role">{step.role}</span>
        </button>
      {/each}
    </div>

    <div class="flow-detail">
      <div class="detail-header">
        <code>{dataFlow[activeStep].file}</code>
        <span class="direction-badge" style="background: {directionColors[dataFlow[activeStep].direction]}">
          {dataFlow[activeStep].direction}
        </span>
      </div>
      <pre><code>{dataFlow[activeStep].code}</code></pre>
    </div>
  </section>

  <section>
    <h2>Route Architecture</h2>
    <pre class="tree"><code>{routeOverview}</code></pre>
  </section>

  <section>
    <h2>Form Actions + Progressive Enhancement</h2>
    <pre><code>{formActionsCode}</code></pre>
  </section>
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .flow-nav {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1.5rem;
  }

  .flow-step {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.6rem 1rem;
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
  }

  .flow-step.active {
    background: #eef4fb;
    border-color: #4a90d9;
  }

  .flow-step code {
    font-weight: 600;
    font-size: 0.85rem;
    background: #e8e8e8;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
  }

  .step-role {
    font-size: 0.8rem;
    color: #666;
    margin-top: 0.15rem;
  }

  .flow-detail {
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: #f0f0f0;
    border-bottom: 1px solid #e0e0e0;
  }

  .detail-header code {
    font-weight: 600;
    background: #e0e0e0;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
  }

  .direction-badge {
    color: white;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.4;
    margin: 0;
  }

  .flow-detail pre {
    border-radius: 0 0 10px 10px;
  }

  pre.tree {
    font-size: 0.85rem;
    line-height: 1.6;
    color: #4ec9b0;
  }

  section { margin-bottom: 2.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
