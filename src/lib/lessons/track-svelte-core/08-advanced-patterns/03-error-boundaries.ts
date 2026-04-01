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

When a component throws an error during rendering, it normally crashes the entire application. Svelte 5 provides \`<svelte:boundary>\` to catch errors and display fallback UI instead.

This is essential for building resilient applications where one broken component doesn't take down the whole page.`
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

The \`failed\` snippet receives the error and a \`reset\` function that re-mounts the children.

**Your task:** Wrap a component that might fail in a \`<svelte:boundary>\` with a fallback UI.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Error Handling with Recovery

The \`reset\` function re-renders the children, giving the component another chance. You can combine this with state changes to fix the underlying issue.

**Task:** Create a component that fails when given invalid data, wrap it in an error boundary, and provide a way to fix the data and retry.`
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
