import type { Lesson } from '$types/lesson';

export const awaitBlocks: Lesson = {
	id: 'svelte-core.control-flow.await-blocks',
	slug: 'await-blocks',
	title: 'Async Data with {#await}',
	description: 'Handle promises declaratively using {#await} blocks for loading, success, and error states.',
	trackId: 'svelte-core',
	moduleId: 'control-flow',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['svelte5.control-flow.await', 'svelte5.control-flow.await-error'],
	prerequisites: ['svelte5.runes.state', 'svelte5.control-flow.if'],

	content: [
		{
			type: 'text',
			content: `# Async Data with \`{#await}\`

Handling asynchronous data is a reality of every web app. Svelte makes it elegant with \`{#await}\` blocks that handle all three states of a promise — pending, fulfilled, and rejected:

\`\`\`svelte
{#await promise}
  <p>Loading...</p>
{:then data}
  <p>Got: {data}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
\`\`\`

No need for manual state variables like \`isLoading\`, \`data\`, and \`error\` — Svelte handles it all.

## Why Declarative Async Matters

In most frameworks, handling asynchronous data requires manually managing multiple pieces of state. Here is a typical React pattern:

\`\`\`jsx
function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchUser()
      .then(data => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return <p>{user.name}</p>;
}
\`\`\`

This is 25 lines of boilerplate for a single fetch. And notice the \`cancelled\` flag — that is there to prevent a race condition where the component unmounts before the fetch completes, and the callback tries to set state on an unmounted component.

The same thing in Svelte:

\`\`\`svelte
{#await fetchUser()}
  <p>Loading...</p>
{:then user}
  <p>{user.name}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
\`\`\`

Six lines. No state variables. No cleanup function. No race condition bug.

### How Svelte Handles Race Conditions

Race conditions are one of the most subtle bugs in async UI code. Here is how they happen: a user clicks a button to fetch data, then clicks again before the first fetch completes. If the second fetch completes before the first, the UI briefly shows the correct data, then the first fetch resolves and overwrites it with stale data.

Svelte's \`{#await}\` blocks handle this automatically. When you reassign the promise variable, Svelte tracks which promise is "current." If an older promise resolves after a newer one, Svelte ignores the stale result. The UI always shows the result of the most recently assigned promise.

\`\`\`svelte
<script lang="ts">
  let userPromise = $state(fetchUser(1));

  function loadUser(id: number) {
    // Each reassignment cancels interest in the previous promise
    userPromise = fetchUser(id);
  }
</script>

<button onclick={() => loadUser(1)}>User 1</button>
<button onclick={() => loadUser(2)}>User 2</button>

{#await userPromise}
  <p>Loading...</p>
{:then user}
  <p>{user.name}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
\`\`\`

If you click "User 1" then immediately click "User 2", Svelte will show "Loading..." during both fetches. If User 1's response arrives after User 2's, it is silently discarded. The UI will always show User 2's data because that is the current promise.

### Loading and Error States as First-Class Concepts

The three-branch structure of \`{#await}\` forces you to think about all three states of an async operation:

1. **Pending** — What does the user see while waiting? A skeleton? A spinner? A shimmer animation? The \`{#await promise}\` block is where this goes.

2. **Fulfilled** — The happy path. The \`{:then data}\` block renders the resolved value.

3. **Rejected** — What went wrong? The \`{:catch error}\` block handles failures. This is where you show error messages, retry buttons, or fallback content.

Many developers skip error handling. The \`{:catch}\` block makes it harder to forget because the three-branch structure makes the omission visually obvious — you see \`{#await}\` and \`{:then}\` without a \`{:catch}\`, and it looks incomplete.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.control-flow.await'
		},
		{
			type: 'text',
			content: `## Using {#await}

Look at the starter code — there is a function that returns a promise simulating a data fetch. Currently, the result is not displayed.

The full \`{#await}\` syntax has three branches:

\`\`\`svelte
{#await promise}
  <!-- Pending: shown while the promise is unresolved -->
  <p class="loading">Loading...</p>
{:then value}
  <!-- Fulfilled: shown when the promise resolves -->
  <p>Result: {value}</p>
{:catch error}
  <!-- Rejected: shown when the promise rejects -->
  <p class="error">{error.message}</p>
{/await}
\`\`\`

The variable names after \`{:then}\` and \`{:catch}\` are yours to choose — they receive the resolved value and rejection reason respectively.

**Task:** Add an \`{#await}\` block that shows a loading message, then displays the fetched user data.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Handling Errors

The \`{:catch}\` branch handles rejected promises. This is crucial for a good user experience — always show the user what went wrong:

\`\`\`svelte
{#await riskyOperation()}
  <p>Working...</p>
{:then result}
  <p>Success: {result}</p>
{:catch error}
  <p class="error">Failed: {error.message}</p>
{/await}
\`\`\`

### Error Recovery Patterns

A common pattern is combining \`{#await}\` with a refetch function for retry-on-error:

\`\`\`svelte
<script lang="ts">
  let dataPromise = $state(fetchData());

  function retry() {
    dataPromise = fetchData();
  }
</script>

{#await dataPromise}
  <p>Loading...</p>
{:then data}
  <p>{data}</p>
{:catch error}
  <div class="error">
    <p>Failed: {error.message}</p>
    <button onclick={retry}>Try Again</button>
  </div>
{/await}
\`\`\`

When the user clicks "Try Again", \`dataPromise\` is reassigned to a new promise, which sends the \`{#await}\` block back to the pending state. The entire retry flow is handled by a single variable reassignment.

### Combining {#await} with {#if}

Sometimes you want to conditionally show an \`{#await}\` block — for example, only when the user has triggered a fetch:

\`\`\`svelte
<script lang="ts">
  let promise = $state<Promise<string> | null>(null);
</script>

<button onclick={() => promise = fetchData()}>Load Data</button>

{#if promise}
  {#await promise}
    <p>Loading...</p>
  {:then data}
    <p>{data}</p>
  {:catch error}
    <p class="error">{error.message}</p>
  {/await}
{/if}
\`\`\`

The \`{#if promise}\` guard prevents the \`{#await}\` block from rendering before the user clicks the button. Without it, the block would try to await \`null\`, which is not a promise.

**Task:** Add a \`{:catch}\` block that displays the error message. Use the "Fetch Error" button to test it.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how Svelte compiles `{#await}` blocks. It creates three separate "branches" of DOM that swap in and out based on the promise state — no virtual DOM diffing needed.'
		},
		{
			type: 'text',
			content: `## Shorthand Await

If you do not need a loading state, use the shorthand:

\`\`\`svelte
{#await promise then data}
  <p>{data}</p>
{/await}
\`\`\`

This skips the pending state and only renders when the promise resolves. Nothing is shown while the promise is pending.

There is also a catch-only shorthand:

\`\`\`svelte
{#await promise catch error}
  <p class="error">{error.message}</p>
{/await}
\`\`\`

### The Refetch Pattern

You can combine \`{#await}\` with \`$state\` to create a refetch pattern — just reassign the promise variable:

\`\`\`svelte
<script lang="ts">
  let userPromise = $state(fetchUser());

  function refetch() {
    userPromise = fetchUser();
  }
</script>

<button onclick={refetch}>Refresh</button>

{#await userPromise}
  <p>Loading...</p>
{:then user}
  <p>{user.name}</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
\`\`\`

Each time \`refetch\` is called, the promise is replaced. The \`{#await}\` block goes back to the pending state, shows "Loading...", and then shows the new data when it arrives.

### Building an API Fetcher Component

Here is a real-world pattern that combines everything we have learned — a reusable API fetcher:

\`\`\`svelte
<script lang="ts">
  let endpoint = $state('/api/users');
  let dataPromise = $state(fetchEndpoint(endpoint));

  async function fetchEndpoint(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    return response.json();
  }

  function refetch() {
    dataPromise = fetchEndpoint(endpoint);
  }
</script>

<div class="api-fetcher">
  <div class="toolbar">
    <input bind:value={endpoint} placeholder="/api/..." />
    <button onclick={refetch}>Fetch</button>
  </div>

  {#await dataPromise}
    <div class="skeleton">
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  {:then data}
    <pre>{JSON.stringify(data, null, 2)}</pre>
  {:catch error}
    <div class="error-panel">
      <p>{error.message}</p>
      <button onclick={refetch}>Retry</button>
    </div>
  {/await}
</div>
\`\`\`

This pattern gives you loading skeletons, formatted JSON output, error messages with retry buttons, and race condition safety — all from a single \`{#await}\` block.

### When to Use {#await} vs Manual State

\`{#await}\` is ideal when:
- You have a single promise that maps directly to UI state
- You want all three states (pending, fulfilled, rejected) handled in the template
- You need automatic race condition handling

Manual state management (\`$state\` variables for loading/data/error) is better when:
- You need to transform or combine data from multiple promises
- You want to keep showing stale data while refreshing (optimistic updates)
- You need fine-grained control over when loading indicators appear (e.g., only show a spinner after a 200ms delay to avoid flash-of-loading)
- You are working with streaming data or WebSockets, not simple request/response`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  function fetchUser(): Promise<{ name: string; email: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ name: 'Ada Lovelace', email: 'ada@example.com' });
      }, 1500);
    });
  }

  function fetchError(): Promise<string> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Network request failed'));
      }, 1000);
    });
  }

  let userPromise = $state(fetchUser());
  let errorPromise = $state<Promise<string> | null>(null);

  function refetch() {
    userPromise = fetchUser();
  }

  function triggerError() {
    errorPromise = fetchError();
  }
</script>

<h2>User Profile</h2>
<button onclick={refetch}>Fetch User</button>

<!-- TODO: Add {#await} block for userPromise -->
<!-- Show loading, then user data, then error handling -->

<h2>Error Handling</h2>
<button onclick={triggerError}>Fetch Error</button>

<!-- TODO: Add {#await} block for errorPromise with {:catch} -->

<style>
  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-block-end: 1rem;
    margin-inline-end: 0.5rem;
  }

  .error {
    color: #dc2626;
    font-weight: 600;
  }

  .loading {
    color: #6366f1;
    font-style: italic;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  function fetchUser(): Promise<{ name: string; email: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ name: 'Ada Lovelace', email: 'ada@example.com' });
      }, 1500);
    });
  }

  function fetchError(): Promise<string> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Network request failed'));
      }, 1000);
    });
  }

  let userPromise = $state(fetchUser());
  let errorPromise = $state<Promise<string> | null>(null);

  function refetch() {
    userPromise = fetchUser();
  }

  function triggerError() {
    errorPromise = fetchError();
  }
</script>

<h2>User Profile</h2>
<button onclick={refetch}>Fetch User</button>

{#await userPromise}
  <p class="loading">Loading user...</p>
{:then user}
  <p><strong>{user.name}</strong></p>
  <p>{user.email}</p>
{:catch error}
  <p class="error">Error: {error.message}</p>
{/await}

<h2>Error Handling</h2>
<button onclick={triggerError}>Fetch Error</button>

{#if errorPromise}
  {#await errorPromise}
    <p class="loading">Fetching...</p>
  {:then data}
    <p>{data}</p>
  {:catch error}
    <p class="error">Failed: {error.message}</p>
  {/await}
{/if}

<style>
  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-block-end: 1rem;
    margin-inline-end: 0.5rem;
  }

  .error {
    color: #dc2626;
    font-weight: 600;
  }

  .loading {
    color: #6366f1;
    font-style: italic;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add an {#await} block that shows loading and then user data',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#await' },
						{ type: 'contains', value: '{:then' },
						{ type: 'contains', value: '{/await}' }
					]
				}
			},
			hints: [
				'`{#await}` blocks have three sections: pending (before `{:then}`), resolved (`{:then}`), and rejected (`{:catch}`).',
				'Start with: `{#await userPromise}<p>Loading...</p>{:then user}<p>{user.name}</p>{/await}`',
				'Full block: `{#await userPromise}<p class="loading">Loading user...</p>{:then user}<p><strong>{user.name}</strong></p><p>{user.email}</p>{/await}`'
			],
			conceptsTested: ['svelte5.control-flow.await']
		},
		{
			id: 'cp-2',
			description: 'Add error handling with {:catch}',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{:catch' },
						{ type: 'regex', value: 'error\\.message' }
					]
				}
			},
			hints: [
				'`{:catch error}` gives you the rejection reason — typically an `Error` object.',
				'Add `{:catch error}<p class="error">{error.message}</p>` before `{/await}`.',
				'Also add an `{#await}` block around `errorPromise` with `{:catch error}<p class="error">Failed: {error.message}</p>{/await}`.'
			],
			conceptsTested: ['svelte5.control-flow.await-error']
		}
	]
};
