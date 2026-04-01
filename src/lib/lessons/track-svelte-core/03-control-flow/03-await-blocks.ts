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

No need for manual state variables like \`isLoading\`, \`data\`, and \`error\` — Svelte handles it all.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.control-flow.await'
		},
		{
			type: 'text',
			content: `## Using {#await}

Look at the starter code — there's a function that returns a promise simulating a data fetch. Currently, the result is not displayed.

**Task:** Add an \`{#await}\` block that shows a loading message, then displays the fetched data.`
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

If you don't need a loading state, use the shorthand:

\`\`\`svelte
{#await promise then data}
  <p>{data}</p>
{/await}
\`\`\`

This skips the pending state and only renders when the promise resolves. You can combine this with your understanding of \`$state\` to create a refetch pattern — just reassign the promise variable.`
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
