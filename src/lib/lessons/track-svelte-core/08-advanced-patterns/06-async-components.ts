import type { Lesson } from '$types/lesson';

export const asyncComponents: Lesson = {
	id: 'svelte-core.advanced-patterns.async-components',
	slug: 'async-components',
	title: 'Async Components & Await Expressions',
	description:
		'Use top-level await and await expressions for self-contained async components with built-in loading states.',
	trackId: 'svelte-core',
	moduleId: 'advanced-patterns',
	order: 6,
	estimatedMinutes: 18,
	concepts: ['svelte5.async.await-expression', 'svelte5.async.top-level-await', 'svelte5.async.boundary-integration'],
	prerequisites: ['svelte5.control-flow.await-blocks', 'svelte5.advanced.error-boundaries'],

	content: [
		{
			type: 'text',
			content: `# Async Components & Await Expressions

## Why Async Components Exist

In traditional Svelte, handling async data requires either {#await} blocks in templates or loading data in SvelteKit's load functions. Both work, but each has limitations:

**{#await} blocks** handle a single promise inline, but complex data dependencies create deeply nested templates:

\`\`\`svelte
{#await fetchUser(id)}
  <p>Loading user...</p>
{:then user}
  {#await fetchPosts(user.id)}
    <p>Loading posts...</p>
  {:then posts}
    {#await fetchComments(posts[0].id)}
      <!-- This nesting gets painful -->
    {/await}
  {/await}
{/await}
\`\`\`

**Load functions** work great for page-level data but cannot be used for individual components. A widget that needs its own data has to receive it as a prop from the page.

Svelte 5 introduces **async components** — components that can use \`await\` directly in their script section and in template expressions. This makes components self-contained: they fetch their own data, handle their own loading states, and compose naturally.

## The Await Expression

The simplest form is the **await expression** — using \`await\` directly in the template:

\`\`\`svelte
<script>
  let { userId } = $props();

  async function fetchUser(id: string) {
    const res = await fetch(\\\`/api/users/\\\${id}\\\`);
    return res.json();
  }
</script>

<h1>{(await fetchUser(userId)).name}</h1>
\`\`\`

When Svelte encounters an \`await\` expression in the template, it suspends rendering of this component until the promise resolves. The parent component (or a \`<svelte:boundary>\`) provides the loading state.

### How It Differs from {#await}

| Feature | \`{#await promise}\` | \`await\` expression |
|---------|---------------------|---------------------|
| Loading UI | Inline in same component | Provided by parent/boundary |
| Error handling | \`{:catch}\` block | \`<svelte:boundary>\` |
| Multiple async values | Nested blocks | Flat, natural code |
| Component suspension | No | Yes |
| SSR behavior | Streams when ready | Server awaits, then sends |

## Top-Level Await

Components can also use top-level \`await\` in the script section:

\`\`\`svelte
<script>
  let { userId } = $props();

  const response = await fetch(\\\`/api/users/\\\${userId}\\\`);
  const user = await response.json();
</script>

<h1>{user.name}</h1>
<p>{user.email}</p>
\`\`\`

The entire component suspends until all top-level awaits resolve. This is the cleanest pattern for components that need data before they can render anything meaningful.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.async.await-expression'
		},
		{
			type: 'text',
			content: `## Integration with <svelte:boundary>

Async components need a boundary to display loading and error states. The \`<svelte:boundary>\` element (which we covered in the error boundaries lesson) serves double duty — it catches both errors AND provides loading fallbacks for suspended components:

\`\`\`svelte
<!-- Parent.svelte -->
<svelte:boundary>
  <UserProfile userId="123" />

  {#snippet pending()}
    <div class="skeleton">
      <div class="skeleton-avatar"></div>
      <div class="skeleton-text"></div>
    </div>
  {/snippet}

  {#snippet failed(error, reset)}
    <div class="error">
      <p>Failed to load profile: {error.message}</p>
      <button onclick={reset}>Retry</button>
    </div>
  {/snippet}
</svelte:boundary>
\`\`\`

The \`pending\` snippet renders while the async component is suspended (awaiting data). The \`failed\` snippet renders if the await rejects. This separation of concerns is powerful — the async component focuses on what to render, and the boundary handles loading/error states.

### Nested Boundaries

You can nest boundaries to create granular loading states:

\`\`\`svelte
<svelte:boundary>
  <!-- Page-level loading -->
  <header>
    <svelte:boundary>
      <UserNav />
      {#snippet pending()}<NavSkeleton />{/snippet}
    </svelte:boundary>
  </header>

  <main>
    <svelte:boundary>
      <Dashboard />
      {#snippet pending()}<DashboardSkeleton />{/snippet}
    </svelte:boundary>
  </main>

  {#snippet pending()}<FullPageLoader />{/snippet}
</svelte:boundary>
\`\`\`

Each boundary catches the nearest suspended descendant, allowing independent loading states for different parts of the page.`
		},
		{
			type: 'xray-prompt',
			content: 'Consider the rendering sequence: parent renders boundary shell, async component starts fetching, pending snippet displays, data arrives, component renders, pending snippet replaced. On the server, the component awaits before sending HTML — no pending state is visible in the initial SSR output.'
		},
		{
			type: 'text',
			content: `## When to Use Async Components vs {#await} vs Load Functions

| Scenario | Best Approach | Why |
|----------|--------------|-----|
| Page-level data | SvelteKit \`load()\` | Runs before render, type-safe, cacheable |
| Self-contained widget | Async component | Widget owns its data, reusable anywhere |
| Single inline promise | \`{#await}\` block | Simple, no boundary needed |
| Multiple related promises | Async component | Flat code, no nesting |
| User-triggered fetch | \`{#await}\` with \`$state\` | Promise assigned on interaction |

**The decision framework:**

1. **Is it page data?** → Use SvelteKit load functions
2. **Is the component reusable and self-contained?** → Use async component
3. **Is it a simple one-off promise?** → Use {#await}
4. **Do you need granular loading states?** → Use async component + boundaries

## Lazy Loading with Dynamic Imports

Async components combine powerfully with dynamic \`import()\` for code splitting:

\`\`\`svelte
<script>
  const HeavyChart = (await import('./HeavyChart.svelte')).default;
</script>

<HeavyChart data={chartData} />
\`\`\`

The chart component's JavaScript is only loaded when this component renders. Combined with a \`<svelte:boundary>\` providing a loading skeleton, you get automatic code splitting with built-in loading states.

## SSR Behavior

On the server, async components work differently than on the client:

- **Server**: Svelte awaits all promises before sending HTML. The client receives fully rendered content. No loading spinner flashes.
- **Client hydration**: The client sees the already-rendered HTML and hydrates it. No re-fetching needed if data was serialized.
- **Client navigation**: On subsequent navigations, the pending snippet shows while data loads.

This gives you the best of both worlds: instant server-rendered content on first load, and smooth loading states on client navigations.

**Your task:** Create an async UserCard component that fetches user data and displays it. Wrap it in a \`<svelte:boundary>\` with loading and error states. Use the provided mock API function.`
		},
		{
			type: 'checkpoint',
			content: 'cp-async-components-1'
		},
		{
			type: 'text',
			content: `## Summary

Async components and await expressions let Svelte components own their data fetching, creating self-contained widgets that compose naturally. Combined with \`<svelte:boundary>\` for loading and error states, they eliminate the need for complex state management around async operations. Use them for reusable widgets, code-split components, and any situation where a component needs to fetch its own data. For page-level data, continue using SvelteKit's load functions — they provide server-side execution, type safety, and caching that async components do not.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // Mock API function — simulates network request
  async function fetchUser(id: number) {
    await new Promise(r => setTimeout(r, 1500));
    if (id === 0) throw new Error('User not found');

    const users: Record<number, { name: string; email: string; role: string; avatar: string }> = {
      1: { name: 'Alice Chen', email: 'alice@example.com', role: 'Engineer', avatar: 'AC' },
      2: { name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', avatar: 'BS' },
      3: { name: 'Carol Diaz', email: 'carol@example.com', role: 'Product Manager', avatar: 'CD' },
    };
    return users[id] ?? { name: 'Unknown', email: 'n/a', role: 'n/a', avatar: '??' };
  }

  let selectedId = $state(1);
</script>

<div class="app">
  <div class="controls">
    <h2>Select a User</h2>
    <div class="buttons">
      <button class:active={selectedId === 1} onclick={() => selectedId = 1}>Alice</button>
      <button class:active={selectedId === 2} onclick={() => selectedId = 2}>Bob</button>
      <button class:active={selectedId === 3} onclick={() => selectedId = 3}>Carol</button>
      <button class:active={selectedId === 0} onclick={() => selectedId = 0}>Invalid (Error)</button>
    </div>
  </div>

  <!-- TODO: Wrap in <svelte:boundary> with pending and failed snippets -->
  <!-- TODO: Create an async user card that fetches and displays user data -->
  <!-- For now, just show a placeholder: -->
  <div class="card">
    <p>Replace this with an async component that fetches user {selectedId}</p>
  </div>
</div>

<style>
  .app { max-width: 500px; margin: 2rem auto; font-family: system-ui; }
  .controls { margin-bottom: 2rem; }
  h2 { margin-bottom: 1rem; color: #1f2937; }
  .buttons { display: flex; gap: 0.5rem; }
  .buttons button {
    padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 6px;
    background: white; cursor: pointer; font-size: 14px;
  }
  .buttons button.active { background: #4f46e5; color: white; border-color: #4f46e5; }
  .card {
    padding: 2rem; background: white; border: 1px solid #e5e7eb;
    border-radius: 12px; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
  }
  .avatar {
    width: 64px; height: 64px; border-radius: 50%; background: #4f46e5;
    color: white; display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 700; margin-bottom: 1rem;
  }
  .name { font-size: 1.25rem; font-weight: 600; color: #1f2937; }
  .email { color: #6b7280; font-size: 14px; }
  .role { color: #4f46e5; font-size: 14px; font-weight: 500; margin-top: 0.5rem; }
  .skeleton { animation: pulse 1.5s ease-in-out infinite; }
  .skeleton-circle { width: 64px; height: 64px; border-radius: 50%; background: #e5e7eb; margin-bottom: 1rem; }
  .skeleton-line { height: 16px; background: #e5e7eb; border-radius: 4px; margin-bottom: 0.5rem; }
  .skeleton-line.short { width: 60%; }
  .error { text-align: center; color: #991b1b; }
  .error button { margin-top: 1rem; padding: 0.5rem 1rem; background: #fee2e2; border: none; border-radius: 6px; color: #991b1b; cursor: pointer; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  async function fetchUser(id: number) {
    await new Promise(r => setTimeout(r, 1500));
    if (id === 0) throw new Error('User not found');

    const users: Record<number, { name: string; email: string; role: string; avatar: string }> = {
      1: { name: 'Alice Chen', email: 'alice@example.com', role: 'Engineer', avatar: 'AC' },
      2: { name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', avatar: 'BS' },
      3: { name: 'Carol Diaz', email: 'carol@example.com', role: 'Product Manager', avatar: 'CD' },
    };
    return users[id] ?? { name: 'Unknown', email: 'n/a', role: 'n/a', avatar: '??' };
  }

  let selectedId = $state(1);
</script>

<div class="app">
  <div class="controls">
    <h2>Select a User</h2>
    <div class="buttons">
      <button class:active={selectedId === 1} onclick={() => selectedId = 1}>Alice</button>
      <button class:active={selectedId === 2} onclick={() => selectedId = 2}>Bob</button>
      <button class:active={selectedId === 3} onclick={() => selectedId = 3}>Carol</button>
      <button class:active={selectedId === 0} onclick={() => selectedId = 0}>Invalid (Error)</button>
    </div>
  </div>

  {#key selectedId}
    <svelte:boundary>
      {#await fetchUser(selectedId)}
        <div class="card skeleton">
          <div class="skeleton-circle"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      {:then user}
        <div class="card">
          <div class="avatar">{user.avatar}</div>
          <div class="name">{user.name}</div>
          <div class="email">{user.email}</div>
          <div class="role">{user.role}</div>
        </div>
      {:catch error}
        <div class="card error">
          <p>Failed: {error.message}</p>
          <button onclick={() => selectedId = 1}>Try Alice</button>
        </div>
      {/await}

      {#snippet failed(error, reset)}
        <div class="card error">
          <p>Component error: {error instanceof Error ? error.message : 'Unknown'}</p>
          <button onclick={reset}>Retry</button>
        </div>
      {/snippet}
    </svelte:boundary>
  {/key}
</div>

<style>
  .app { max-width: 500px; margin: 2rem auto; font-family: system-ui; }
  .controls { margin-bottom: 2rem; }
  h2 { margin-bottom: 1rem; color: #1f2937; }
  .buttons { display: flex; gap: 0.5rem; }
  .buttons button {
    padding: 0.5rem 1rem; border: 1px solid #d1d5db; border-radius: 6px;
    background: white; cursor: pointer; font-size: 14px;
  }
  .buttons button.active { background: #4f46e5; color: white; border-color: #4f46e5; }
  .card {
    padding: 2rem; background: white; border: 1px solid #e5e7eb;
    border-radius: 12px; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
  }
  .avatar {
    width: 64px; height: 64px; border-radius: 50%; background: #4f46e5;
    color: white; display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 700; margin-bottom: 1rem;
  }
  .name { font-size: 1.25rem; font-weight: 600; color: #1f2937; }
  .email { color: #6b7280; font-size: 14px; }
  .role { color: #4f46e5; font-size: 14px; font-weight: 500; margin-top: 0.5rem; }
  .skeleton { animation: pulse 1.5s ease-in-out infinite; }
  .skeleton-circle { width: 64px; height: 64px; border-radius: 50%; background: #e5e7eb; margin-bottom: 1rem; }
  .skeleton-line { height: 16px; background: #e5e7eb; border-radius: 4px; margin-bottom: 0.5rem; }
  .skeleton-line.short { width: 60%; }
  .error { text-align: center; color: #991b1b; }
  .error button { margin-top: 1rem; padding: 0.5rem 1rem; background: #fee2e2; border: none; border-radius: 6px; color: #991b1b; cursor: pointer; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-async-components-1',
			description: 'Create an async user card with boundary-based loading and error handling',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'svelte:boundary' },
						{ type: 'contains', value: 'await' },
						{ type: 'contains', value: 'fetchUser' }
					]
				}
			},
			hints: [
				'Wrap the card area in <svelte:boundary> with {#snippet failed(error, reset)} for error recovery.',
				'Use {#await fetchUser(selectedId)} with {:then user} and {:catch error} blocks to handle the async data.',
				'Add {#key selectedId} around the boundary so it resets when the selected user changes, triggering a fresh fetch.'
			],
			conceptsTested: ['svelte5.async.await-expression', 'svelte5.async.boundary-integration']
		}
	]
};
