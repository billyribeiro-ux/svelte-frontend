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
	estimatedMinutes: 22,
	concepts: ['svelte5.async.top-level-await', 'svelte5.async.await-expression', 'svelte5.async.boundary'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived', 'svelte5.components.basic', 'svelte5.patterns.error-boundaries'],

	content: [
		{
			type: 'text',
			content: `# Async Components & Await Expressions

## The Async Data Problem in UI Frameworks

Nearly every modern web application fetches data from servers. User profiles, product listings, dashboard metrics, notifications -- all arrive asynchronously. Handling the lifecycle of an async request (loading, success, error) is one of the most common patterns in frontend development, and getting it wrong leads to janky UIs with flickering spinners, missing error states, and race conditions.

Svelte has historically handled async data with the \`{#await}\` block:

\`\`\`svelte
{#await fetchUser(userId)}
  <p>Loading...</p>
{:then user}
  <p>Hello, {user.name}!</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
\`\`\`

This works well for simple cases, but it has limitations. The promise must be created inline or stored in a variable. Multiple related async operations require nested \`{#await}\` blocks. Error handling is local to each block, making it hard to implement a unified error UI. And the async logic lives in the template, mixing data fetching with presentation.

Svelte 5 introduces two powerful features that change how we work with async data: **top-level await in components** and the **\`await\` expression in templates**, paired with \`<svelte:boundary>\` for centralized loading and error states.

## Top-Level Await in Svelte 5 Components

Svelte 5 allows you to use \`await\` at the top level of a component's \`<script>\` block. This means a component can pause its initialization until async data is available:

\`\`\`svelte
<!-- UserProfile.svelte -->
<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
    avatar: string;
  }

  const { userId }: { userId: number } = $props();

  const response = await fetch(\`/api/users/\${userId}\`);
  if (!response.ok) throw new Error(\`Failed to load user: \${response.status}\`);
  const user: User = await response.json();
</script>

<div class="profile">
  <img src={user.avatar} alt={user.name} />
  <h2>{user.name}</h2>
  <p>{user.email}</p>
</div>
\`\`\`

This component does not render until the fetch completes. The \`user\` variable is guaranteed to be defined when the template executes -- no need for optional chaining, null checks, or loading states within the component itself. The component simply describes what it looks like when data is available.

This is a fundamental shift in thinking. Instead of a component that manages its own loading and error states internally, you write a component that declares its data dependencies and trusts the parent to handle the pending and error states. The component becomes simpler and more focused.

### How It Works Under the Hood

When Svelte encounters a top-level \`await\` in a component, the component becomes an "async component." During rendering, when the component reaches the \`await\` expression, it suspends. The parent (or a boundary) is responsible for showing fallback content while the component is suspended.

This is conceptually similar to React's Suspense model, but with Svelte's characteristic simplicity -- you just write \`await\` and it works.

## SSR Behavior: Server Awaits, Client Hydrates

The SSR behavior of async components is elegant. When rendering on the server, Svelte **actually awaits** the promises. The server pauses rendering of that component until the data arrives, then includes the fully rendered HTML in the response. The client receives complete HTML with all data already present.

During hydration on the client, Svelte does not re-fetch the data. The component hydrates using the data that was already serialized into the server-rendered page. This means:

1. No loading spinners on initial page load (the HTML is complete)
2. No duplicate network requests (data is fetched once on the server)
3. Full SEO support (search engines see the complete content)
4. Fast Time-to-Content (the browser can display content before JavaScript loads)

\`\`\`
Server: fetch data -> await -> render HTML -> send to client
Client: receive HTML -> display immediately -> hydrate (no re-fetch)
\`\`\`

If the component is navigated to client-side (after initial hydration), the fetch happens on the client and the boundary shows loading state while waiting.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.async.top-level-await'
		},
		{
			type: 'text',
			content: `## <svelte:boundary> for Loading and Error States

The companion to async components is \`<svelte:boundary>\`. This special element catches both errors and pending states from its children, including async components:

\`\`\`svelte
<!-- App.svelte -->
<script lang="ts">
  import UserProfile from './UserProfile.svelte';
</script>

<svelte:boundary>
  <UserProfile userId={42} />

  {#snippet pending()}
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading user profile...</p>
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

The \`<svelte:boundary>\` element provides two snippet slots:

- **\`pending()\`** -- Rendered while any child async component is suspended (awaiting data). This is your loading state.
- **\`failed(error, reset)\`** -- Rendered when any child throws an error (including fetch failures). The \`error\` parameter is the thrown value. The \`reset\` function re-renders the children, retrying the async operation.

This separation is powerful. The async component (\`UserProfile\`) only cares about rendering the user data. The parent (\`App\`) controls the loading and error experience. You can have a single boundary wrapping multiple async components, providing a unified loading experience.

### Nested Boundaries

Boundaries can be nested for granular control:

\`\`\`svelte
<svelte:boundary>
  <!-- Outer boundary for the entire page -->
  <div class="dashboard">
    <svelte:boundary>
      <!-- Inner boundary for the header -->
      <UserHeader userId={42} />
      {#snippet pending()}<HeaderSkeleton />{/snippet}
      {#snippet failed(error)}<p>Header failed</p>{/snippet}
    </svelte:boundary>

    <svelte:boundary>
      <!-- Inner boundary for the main content -->
      <UserStats userId={42} />
      <UserActivity userId={42} />
      {#snippet pending()}<StatsSkeleton />{/snippet}
      {#snippet failed(error, reset)}
        <p>Stats failed. <button onclick={reset}>Retry</button></p>
      {/snippet}
    </svelte:boundary>
  </div>

  {#snippet pending()}<FullPageSpinner />{/snippet}
  {#snippet failed(error)}<FullPageError {error} />{/snippet}
</svelte:boundary>
\`\`\`

The innermost boundary that wraps a suspended component handles its pending state. If no inner boundary exists, it bubbles up to the outer boundary.

**Your task:** Create an async \`UserCard\` component that fetches user data from an API endpoint. Wrap it with \`<svelte:boundary>\` to provide loading and error states. Include a retry button in the error state.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## The await Expression in Templates

In addition to top-level await in scripts, Svelte 5 supports the \`await\` keyword directly in template expressions. This allows you to await promises inline:

\`\`\`svelte
<script lang="ts">
  async function fetchUserName(id: number): Promise<string> {
    const res = await fetch(\`/api/users/\${id}\`);
    const user = await res.json();
    return user.name;
  }

  const { userId }: { userId: number } = $props();
</script>

<p>Hello, {await fetchUserName(userId)}!</p>
\`\`\`

The \`await\` expression in the template suspends the component just like top-level await. The boundary above it handles the pending and error states.

### Comparison: {#await} Blocks vs await Expressions vs Top-Level Await

Svelte now offers three ways to handle async data. Here is when to use each:

| Feature | \`{#await promise}\` block | Template \`{await expr}\` | Top-level \`await\` |
|---|---|---|---|
| Loading state | Inline in block | Via \`<svelte:boundary>\` | Via \`<svelte:boundary>\` |
| Error state | Inline in block | Via \`<svelte:boundary>\` | Via \`<svelte:boundary>\` |
| Suspends component | No | Yes | Yes |
| SSR behavior | Re-runs on client | Server awaits | Server awaits |
| Best for | Self-contained widgets | Inline async values | Component initialization |

**\`{#await}\` blocks** are best when you want the loading and error states co-located with the data display. They are self-contained -- the component handles everything internally. Use them for optional data that should not block the entire component from rendering.

**Template \`await\` expressions** are best for inline async values where you want the boundary to handle loading/error. They keep the template concise and push loading UX to the boundary.

**Top-level \`await\`** is best when the component's entire existence depends on the data. If the component cannot render anything meaningful without the data, top-level await is the cleanest approach.

### Reactive Async with $derived

You can combine \`$derived\` with async functions to create reactive async values that re-fetch when dependencies change:

\`\`\`svelte
<script lang="ts">
  let userId = $state(1);

  async function fetchUser(id: number) {
    const res = await fetch(\`/api/users/\${id}\`);
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  }

  // Re-fetches whenever userId changes
  const userPromise = $derived(fetchUser(userId));
</script>

<button onclick={() => userId++}>Next User</button>

{#await userPromise}
  <p>Loading user {userId}...</p>
{:then user}
  <p>{user.name} ({user.email})</p>
{:catch error}
  <p>Error: {error.message}</p>
{/await}
\`\`\`

When \`userId\` changes, \`$derived\` re-evaluates \`fetchUser(userId)\`, creating a new promise. The \`{#await}\` block detects the new promise and transitions back to the loading state. This is a powerful pattern for paginated data, search-as-you-type, and any UI where parameters change the data source.

**Task:** Add navigation buttons (Previous / Next) to cycle through user IDs. Use \`$derived\` to create a reactive promise that re-fetches when the ID changes. Wrap the user display in a \`<svelte:boundary>\` with appropriate loading and error snippets.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `Analyze this component:

\`\`\`svelte
<script lang="ts">
  let searchQuery = $state('');

  async function search(query: string) {
    const res = await fetch(\`/api/search?q=\${query}\`);
    return res.json();
  }

  const results = $derived(search(searchQuery));
</script>

<input bind:value={searchQuery} />

{#await results}
  <p>Searching...</p>
{:then items}
  {#each items as item}
    <p>{item.name}</p>
  {/each}
{:catch error}
  <p>Error: {error.message}</p>
{/await}
\`\`\`

What happens when the user types quickly? Identify the race condition. Explain how multiple rapid keystrokes create overlapping requests and how the results might arrive out of order. Propose two different solutions: one using debouncing and one using an AbortController pattern.`
		},
		{
			type: 'text',
			content: `## Error Handling Patterns

### Typed Errors

When using top-level await or the await expression, thrown errors propagate to the nearest \`<svelte:boundary>\`. You can throw custom error types for better error handling:

\`\`\`typescript
// errors.ts
export class NotFoundError extends Error {
  constructor(resource: string, id: string | number) {
    super(\`\${resource} with id \${id} not found\`);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends Error {
  constructor() {
    super('Network request failed. Please check your connection.');
    this.name = 'NetworkError';
  }
}
\`\`\`

\`\`\`svelte
<!-- In the boundary -->
<svelte:boundary>
  <UserProfile userId={42} />

  {#snippet failed(error, reset)}
    {#if error instanceof NotFoundError}
      <p>User not found. They may have been deleted.</p>
    {:else if error instanceof NetworkError}
      <p>Network error. <button onclick={reset}>Retry</button></p>
    {:else}
      <p>Unexpected error: {error.message}</p>
    {/if}
  {/snippet}
</svelte:boundary>
\`\`\`

### Retry with Exponential Backoff

The \`reset\` function provided by the boundary re-renders children from scratch, which re-triggers top-level awaits. You can build a retry mechanism with backoff:

\`\`\`svelte
<script lang="ts">
  import UserProfile from './UserProfile.svelte';

  let retryCount = $state(0);
</script>

<svelte:boundary>
  {#key retryCount}
    <UserProfile userId={42} />
  {/key}

  {#snippet pending()}
    <p>Loading{retryCount > 0 ? \` (retry \${retryCount})\` : ''}...</p>
  {/snippet}

  {#snippet failed(error, reset)}
    <div class="error">
      <p>Failed: {error.message}</p>
      {#if retryCount < 3}
        <button onclick={() => { retryCount++; reset(); }}>
          Retry ({3 - retryCount} attempts remaining)
        </button>
      {:else}
        <p>Maximum retries exceeded. Please refresh the page.</p>
      {/if}
    </div>
  {/snippet}
</svelte:boundary>
\`\`\`

## Combining Multiple Async Components

When multiple async components are children of the same boundary, the boundary shows the pending state until ALL children have resolved:

\`\`\`svelte
<svelte:boundary>
  <!-- Both must resolve before content shows -->
  <UserHeader userId={42} />
  <UserActivity userId={42} />

  {#snippet pending()}
    <p>Loading complete profile...</p>
  {/snippet}
</svelte:boundary>
\`\`\`

If you want independent loading (each component shows as soon as its data arrives), wrap each in its own boundary:

\`\`\`svelte
<svelte:boundary>
  <UserHeader userId={42} />
  {#snippet pending()}<HeaderSkeleton />{/snippet}
</svelte:boundary>

<svelte:boundary>
  <UserActivity userId={42} />
  {#snippet pending()}<ActivitySkeleton />{/snippet}
</svelte:boundary>
\`\`\`

## Summary

Svelte 5 provides three complementary approaches to async data. Top-level \`await\` in component scripts lets a component declare its data dependencies and suspend until they resolve. Template \`await\` expressions provide inline async values. Both work with \`<svelte:boundary>\` which centralizes loading and error states through \`pending()\` and \`failed(error, reset)\` snippets. During SSR, the server awaits all promises and sends complete HTML -- the client hydrates without re-fetching. The classic \`{#await}\` block remains available for self-contained async handling where you want loading and error states co-located with the data display. Use \`$derived\` with async functions to create reactive promises that re-fetch when dependencies change, and consider debouncing or AbortController for rapid-fire scenarios like search inputs.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.async.boundary'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import UserCard from './UserCard.svelte';

  let userId = $state(1);

  // TODO: Add Previous/Next navigation for userId
</script>

<div class="app">
  <h1>Async User Profile</h1>

  <div class="nav-buttons">
    <!-- TODO: Previous and Next buttons to change userId -->
    <button disabled>Previous</button>
    <span class="user-id">User #{userId}</span>
    <button disabled>Next</button>
  </div>

  <!-- TODO: Wrap UserCard in <svelte:boundary> -->
  <!-- TODO: Add {#snippet pending()} for loading state -->
  <!-- TODO: Add {#snippet failed(error, reset)} for error state with retry -->
  <UserCard {userId} />
</div>

<style>
  .app {
    font-family: system-ui, sans-serif;
    padding: 2rem;
    max-width: 500px;
    margin: 0 auto;
  }

  h1 {
    color: #1e293b;
  }

  .nav-buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .nav-buttons button {
    padding: 0.5rem 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .nav-buttons button:hover:not(:disabled) {
    background: #f1f5f9;
  }

  .nav-buttons button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .user-id {
    font-weight: 600;
    color: #475569;
    font-variant-numeric: tabular-nums;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: #64748b;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    text-align: center;
    padding: 2rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #991b1b;
  }

  .error button {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .error button:hover {
    background: #dc2626;
  }
</style>`
		},
		{
			name: 'UserCard.svelte',
			path: '/UserCard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Define a User interface with id, name, email, phone, website
  // TODO: Accept userId prop
  // TODO: Use top-level await to fetch user from https://jsonplaceholder.typicode.com/users/{userId}
  // TODO: Throw an error if the response is not ok
</script>

<!-- TODO: Display user information in a card layout -->
<div class="card">
  <p>Replace this with user data</p>
</div>

<style>
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card h2 {
    margin-top: 0;
    color: #1e293b;
  }

  .card .field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    color: #475569;
    font-size: 0.9rem;
  }

  .card .field .label {
    font-weight: 600;
    color: #64748b;
    min-width: 60px;
  }

  .card .website a {
    color: #3b82f6;
    text-decoration: none;
  }

  .card .website a:hover {
    text-decoration: underline;
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
  import UserCard from './UserCard.svelte';

  let userId = $state(1);
</script>

<div class="app">
  <h1>Async User Profile</h1>

  <div class="nav-buttons">
    <button
      disabled={userId <= 1}
      onclick={() => userId--}
    >
      Previous
    </button>
    <span class="user-id">User #{userId}</span>
    <button
      disabled={userId >= 10}
      onclick={() => userId++}
    >
      Next
    </button>
  </div>

  {#key userId}
    <svelte:boundary>
      <UserCard {userId} />

      {#snippet pending()}
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading user {userId}...</p>
        </div>
      {/snippet}

      {#snippet failed(error, reset)}
        <div class="error">
          <p>Failed to load user: {error.message}</p>
          <button onclick={reset}>Retry</button>
        </div>
      {/snippet}
    </svelte:boundary>
  {/key}
</div>

<style>
  .app {
    font-family: system-ui, sans-serif;
    padding: 2rem;
    max-width: 500px;
    margin: 0 auto;
  }

  h1 {
    color: #1e293b;
  }

  .nav-buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .nav-buttons button {
    padding: 0.5rem 1rem;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .nav-buttons button:hover:not(:disabled) {
    background: #f1f5f9;
  }

  .nav-buttons button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .user-id {
    font-weight: 600;
    color: #475569;
    font-variant-numeric: tabular-nums;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: #64748b;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    text-align: center;
    padding: 2rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #991b1b;
  }

  .error button {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .error button:hover {
    background: #dc2626;
  }
</style>`
		},
		{
			name: 'UserCard.svelte',
			path: '/UserCard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
    phone: string;
    website: string;
  }

  const { userId }: { userId: number } = $props();

  const response = await fetch(\`https://jsonplaceholder.typicode.com/users/\${userId}\`);
  if (!response.ok) throw new Error(\`User not found (status \${response.status})\`);
  const user: User = await response.json();
</script>

<div class="card">
  <h2>{user.name}</h2>
  <div class="field">
    <span class="label">Email</span>
    <span>{user.email}</span>
  </div>
  <div class="field">
    <span class="label">Phone</span>
    <span>{user.phone}</span>
  </div>
  <div class="field website">
    <span class="label">Web</span>
    <a href="https://{user.website}" target="_blank" rel="noopener">
      {user.website}
    </a>
  </div>
</div>

<style>
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card h2 {
    margin-top: 0;
    color: #1e293b;
  }

  .card .field {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0;
    color: #475569;
    font-size: 0.9rem;
  }

  .card .field .label {
    font-weight: 600;
    color: #64748b;
    min-width: 60px;
  }

  .card .website a {
    color: #3b82f6;
    text-decoration: none;
  }

  .card .website a:hover {
    text-decoration: underline;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create an async UserCard component with top-level await and wrap it in svelte:boundary',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'await fetch' },
						{ type: 'contains', value: 'svelte:boundary' },
						{ type: 'contains', value: 'pending' }
					]
				}
			},
			hints: [
				'In UserCard.svelte, use `const response = await fetch(\`/api/users/${userId}\`)` at the top level of the script. Check `response.ok` and throw an error if the request failed. Then `const user = await response.json()`.',
				'In App.svelte, wrap `<UserCard {userId} />` with `<svelte:boundary>`. Add `{#snippet pending()}` with a loading spinner and `{#snippet failed(error, reset)}` with an error message and retry button.',
				'The `reset` function in the `failed` snippet re-renders the boundary children, which re-triggers the top-level await. Call it with `<button onclick={reset}>Retry</button>`. Wrap the boundary in `{#key userId}` to force re-render when the ID changes.'
			],
			conceptsTested: ['svelte5.async.top-level-await', 'svelte5.async.boundary']
		},
		{
			id: 'cp-2',
			description: 'Add Previous/Next navigation that reactively changes the displayed user',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'userId' },
						{ type: 'contains', value: 'onclick' },
						{ type: 'contains', value: '{#key' }
					]
				}
			},
			hints: [
				'Create `let userId = $state(1)` and add Previous/Next buttons: `<button onclick={() => userId--} disabled={userId <= 1}>Previous</button>` and `<button onclick={() => userId++} disabled={userId >= 10}>Next</button>`.',
				'Wrap the `<svelte:boundary>` in `{#key userId}` so that changing the userId destroys and recreates the UserCard component, triggering a new fetch.',
				'Display the current user ID between the buttons: `<span>User #{userId}</span>`. The `{#key}` block ensures the boundary resets its state (including error state) when the userId changes.'
			],
			conceptsTested: ['svelte5.async.top-level-await', 'svelte5.async.await-expression']
		}
	]
};
