import type { Lesson } from '$types/lesson';

export const errorBoundaries: Lesson = {
	id: 'svelte-core.advanced-patterns.error-boundaries',
	slug: 'error-boundaries',
	title: 'Error Boundaries',
	description:
		'Catch and recover from errors in your component tree using <svelte:boundary>.',
	trackId: 'svelte-core',
	moduleId: 'advanced-patterns',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['svelte5.boundaries.error', 'svelte5.boundaries.fallback'],
	prerequisites: ['svelte5.components.basic', 'svelte5.snippets.define'],

	content: [
		{
			type: 'text',
			content: `# Error Boundaries

## WHY Error Boundaries Are Essential

When a component throws an error during rendering, the default behavior in most frameworks is catastrophic: the entire application crashes. The user sees a blank screen or a cryptic error message. In production, this means a single broken widget -- a malformed date, a null reference in a rarely-used component, an API response with an unexpected shape -- can take down an otherwise functional application.

Error boundaries solve this by establishing **fault isolation zones** in your component tree. An error boundary catches errors thrown by its children and displays fallback UI instead. The rest of the application continues working normally.

### How Error Propagation Works

When an error occurs during rendering in Svelte 5, it propagates upward through the component tree until it hits a \`<svelte:boundary>\`. If no boundary catches it, the error reaches the top of the tree and crashes the application.

The propagation follows the component hierarchy, not the DOM hierarchy. An error in a deeply nested component will pass through every ancestor component until a boundary catches it.

\`\`\`
App
  Layout
    <svelte:boundary>      <-- Error caught here
      Sidebar
        UserWidget
          Avatar            <-- Error thrown here
    </svelte:boundary>
    MainContent             <-- Still works fine
\`\`\`

### What Errors Are Caught?

\`<svelte:boundary>\` catches errors thrown during:
- **Component rendering** (errors in the template or derived state)
- **$derived computations** that throw
- **$effect** callbacks that throw (synchronous errors)

It does **not** catch:
- **Asynchronous errors** (unhandled promise rejections, setTimeout callbacks)
- **Event handler errors** (onclick throwing does not propagate to boundaries)
- **Errors in the boundary component itself** (a boundary cannot catch its own errors)

This is by design. Rendering errors are the most dangerous because they prevent the UI from updating. Event handler errors are typically recoverable -- the UI is still rendered, and the next interaction can succeed.

### The failed Snippet: Error and Reset

The \`<svelte:boundary>\` element accepts a \`failed\` snippet that renders when an error is caught:

\`\`\`svelte
<svelte:boundary>
  <RiskyComponent />

  {#snippet failed(error, reset)}
    <div class="error">
      <p>Error: {error.message}</p>
      <button onclick={reset}>Try again</button>
    </div>
  {/snippet}
</svelte:boundary>
\`\`\`

The \`failed\` snippet receives two arguments:
- \`error\`: The caught Error object
- \`reset\`: A function that re-mounts the children, giving them another chance

### WHY reset() Exists

The \`reset\` function is crucial because it enables **recovery**. Without it, the error boundary is a dead end -- once an error occurs, the user is stuck with the fallback UI forever (until page reload). With \`reset\`, you can:

1. Fix the state that caused the error (e.g., reset to valid defaults)
2. Call \`reset()\` to re-mount the children
3. The children render again with the corrected state

This creates a resilient UX where errors are temporary and recoverable. The user clicks "Try again" and the component gets a fresh start.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.boundaries.error'
		},
		{
			type: 'text',
			content: `## Basic Error Boundaries

\`\`\`svelte
<svelte:boundary>
  <RiskyComponent />

  {#snippet failed(error, reset)}
    <div class="error">
      <p>Something went wrong: {error.message}</p>
      <button onclick={reset}>Try again</button>
    </div>
  {/snippet}
</svelte:boundary>
\`\`\`

### Placement Strategy: Where to Put Boundaries

Error boundaries add a small amount of overhead (the boundary must track whether its children have errored). Do not wrap every component -- that is wasteful. Instead, place boundaries at strategic points:

**1. Around risky components.** Components that depend on external data (API responses, user-generated content) are most likely to throw. Wrap them individually.

**2. At layout section boundaries.** Wrap the sidebar, header, and main content separately. If the sidebar breaks, the main content survives.

**3. Around dynamic/plugin content.** If your app loads third-party components or user-created widgets, each one should have its own boundary.

**4. Around route-level components.** In SvelteKit, wrapping the page content in a boundary prevents a page-level error from crashing the layout.

### Anti-Pattern: The Top-Level-Only Boundary

Placing a single boundary at the app root catches everything but provides the worst UX -- the entire UI is replaced with a generic error message. The user loses all context. Granular boundaries are better: they show fallback UI only for the broken section while the rest of the page remains functional.

### Error Logging

The \`failed\` snippet is a natural place to log errors to your monitoring service:

\`\`\`svelte
{#snippet failed(error, reset)}
  {logError(error)}  <!-- Side effect: sends to error tracking -->
  <div class="error">
    <p>Something went wrong</p>
    <button onclick={reset}>Retry</button>
  </div>
{/snippet}
\`\`\`

**Your task:** Wrap a component that might fail in a \`<svelte:boundary>\` with a fallback UI. The UserProfile component throws when given an invalid ID. Wrap it so the error is caught gracefully.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Error Handling with Recovery

The \`reset\` function re-renders the children, giving the component another chance. But calling \`reset()\` alone just re-renders with the same state that caused the error -- which will error again. To achieve true recovery, you must **fix the state before calling reset**.

### The Recovery Pattern

\`\`\`svelte
<svelte:boundary>
  <UserProfile id={userId} />

  {#snippet failed(error, reset)}
    <div class="error">
      <p>{error.message}</p>
      <button onclick={() => { userId = 1; reset(); }}>
        Reset to valid user
      </button>
    </div>
  {/snippet}
</svelte:boundary>
\`\`\`

The handler does two things in sequence:
1. Sets \`userId\` to a known-good value (1)
2. Calls \`reset()\` to re-mount children with the corrected state

The children re-render, find a valid user for ID 1, and display correctly.

### Building Resilient UI: The Full Pattern

In a real application, the recovery pattern might include:
- **Retry with the same data** (for transient errors like network timeouts)
- **Reset to defaults** (for data validation errors)
- **Navigate away** (for unrecoverable errors)
- **Show a detailed error** (for developers in development mode)

\`\`\`svelte
{#snippet failed(error, reset)}
  <div class="error">
    <p>{error.message}</p>
    <div class="actions">
      <button onclick={reset}>Retry</button>
      <button onclick={() => { state = defaults; reset(); }}>Reset</button>
      <button onclick={() => goto('/')}>Go Home</button>
    </div>
    {#if dev}
      <pre>{error.stack}</pre>
    {/if}
  </div>
{/snippet}
\`\`\`

### Nested Boundaries

Boundaries can be nested. The innermost boundary catches the error first. If it does not handle it (e.g., if the \`failed\` snippet itself throws), the error propagates to the next boundary up.

This enables layered error handling:
- Inner boundary: component-level recovery (retry, reset defaults)
- Middle boundary: section-level fallback (placeholder UI)
- Outer boundary: app-level fallback (generic error page with navigation)

**Task:** Create a component that fails when given invalid data, wrap it in an error boundary, and provide a way to fix the data and retry. Verify that the reset button actually recovers from the error by setting valid state before calling reset.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import UserProfile from './UserProfile.svelte';

  let userId = $state(1);
</script>

<div>
  <h2>Error Boundaries</h2>

  <label>
    User ID:
    <input type="number" bind:value={userId} min="0" max="5" />
  </label>

  <!-- TODO: Wrap UserProfile in a <svelte:boundary> -->
  <UserProfile id={userId} />
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    width: 60px;
    margin-left: 0.5rem;
  }

  .error {
    padding: 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #991b1b;
    margin-top: 1rem;
  }

  .error button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .profile {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }
</style>`
		},
		{
			name: 'UserProfile.svelte',
			path: '/UserProfile.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  const users: Record<number, { name: string; email: string }> = {
    1: { name: 'Alice', email: 'alice@example.com' },
    2: { name: 'Bob', email: 'bob@example.com' },
    3: { name: 'Carol', email: 'carol@example.com' }
  };

  let { id } = $props<{ id: number }>();

  // This will throw for unknown IDs
  const user = $derived.by(() => {
    const found = users[id];
    if (!found) throw new Error('User not found: ID ' + id);
    return found;
  });
</script>

<div class="profile">
  <h3>{user.name}</h3>
  <p>{user.email}</p>
</div>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import UserProfile from './UserProfile.svelte';

  let userId = $state(1);
</script>

<div>
  <h2>Error Boundaries</h2>

  <label>
    User ID:
    <input type="number" bind:value={userId} min="0" max="5" />
  </label>

  <svelte:boundary>
    <UserProfile id={userId} />

    {#snippet failed(error, reset)}
      <div class="error">
        <p>Something went wrong: {error.message}</p>
        <button onclick={() => { userId = 1; reset(); }}>
          Reset to valid user
        </button>
      </div>
    {/snippet}
  </svelte:boundary>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    width: 60px;
    margin-left: 0.5rem;
  }

  .error {
    padding: 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #991b1b;
    margin-top: 1rem;
  }

  .error button {
    margin-top: 0.5rem;
    padding: 0.5rem 1rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .profile {
    margin-top: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }
</style>`
		},
		{
			name: 'UserProfile.svelte',
			path: '/UserProfile.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  const users: Record<number, { name: string; email: string }> = {
    1: { name: 'Alice', email: 'alice@example.com' },
    2: { name: 'Bob', email: 'bob@example.com' },
    3: { name: 'Carol', email: 'carol@example.com' }
  };

  let { id } = $props<{ id: number }>();

  const user = $derived.by(() => {
    const found = users[id];
    if (!found) throw new Error('User not found: ID ' + id);
    return found;
  });
</script>

<div class="profile">
  <h3>{user.name}</h3>
  <p>{user.email}</p>
</div>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Wrap the component in <svelte:boundary> with a failed snippet',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<svelte:boundary>' },
						{ type: 'contains', value: '{#snippet failed' }
					]
				}
			},
			hints: [
				'Wrap `<UserProfile>` inside `<svelte:boundary>...</svelte:boundary>`.',
				'Add a `{#snippet failed(error, reset)}` block inside the boundary.',
				'`<svelte:boundary><UserProfile id={userId} />{#snippet failed(error, reset)}<div class="error"><p>{error.message}</p><button onclick={reset}>Retry</button></div>{/snippet}</svelte:boundary>`'
			],
			conceptsTested: ['svelte5.boundaries.error']
		},
		{
			id: 'cp-2',
			description: 'Add error recovery by fixing state before calling reset',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'reset()' },
						{ type: 'contains', value: 'userId' }
					]
				}
			},
			hints: [
				'In the reset button handler, fix the state before calling reset.',
				'Set `userId` to a valid value (1, 2, or 3) before calling `reset()`.',
				'Use `onclick={() => { userId = 1; reset(); }}` to fix the data and retry.'
			],
			conceptsTested: ['svelte5.boundaries.error', 'svelte5.boundaries.fallback']
		}
	]
};
