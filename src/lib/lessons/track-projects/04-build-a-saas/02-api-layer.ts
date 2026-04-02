import type { Lesson } from '$types/lesson';

export const apiLayer: Lesson = {
	id: 'projects.build-a-saas.api-layer',
	slug: 'api-layer',
	title: 'API Integration Layer',
	description:
		'Build a type-safe API client with loading states, error handling, caching, and optimistic updates using Svelte 5 runes.',
	trackId: 'projects',
	moduleId: 'build-a-saas',
	order: 2,
	estimatedMinutes: 30,
	concepts: ['svelte5.runes.state', 'svelte5.runes.derived', 'svelte5.runes.effect'],
	prerequisites: ['projects.build-a-saas.auth-system'],

	content: [
		{
			type: 'text',
			content: `# Building an API Integration Layer

Every SaaS application talks to a backend. Whether you are fetching user data, submitting forms, or loading paginated lists, the front-end needs a structured way to make API calls, track their status, handle errors gracefully, and cache results to avoid redundant network requests. In this lesson you will build a reusable API layer using Svelte 5 runes that handles all of these concerns.

## The Async State Pattern

API calls have three phases: loading, success, and error. We encapsulate this in a reusable type:

\`\`\`ts
interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string;
}
\`\`\`

And a factory function that creates reactive async state:

\`\`\`ts
function createAsyncState<T>(initialData: T | null = null) {
  let data = $state<T | null>(initialData);
  let isLoading = $state(false);
  let error = $state('');

  return {
    get data() { return data; },
    get isLoading() { return isLoading; },
    get error() { return error; },
    get hasData() { return data !== null; },

    async execute(fetcher: () => Promise<T>) {
      isLoading = true;
      error = '';
      try {
        data = await fetcher();
      } catch (e) {
        error = e instanceof Error ? e.message : 'An error occurred';
        data = null;
      } finally {
        isLoading = false;
      }
    },

    reset() {
      data = initialData;
      isLoading = false;
      error = '';
    }
  };
}
\`\`\`

This pattern is incredibly powerful. You create one \`AsyncState\` per API resource, call \`execute()\` with a fetcher function, and the UI automatically shows loading spinners, data, or error messages based on the current state. No manual state management, no forgotten \`isLoading = false\` in error paths.

## The API Client

We build a centralized API client that wraps \`fetch\` with consistent error handling, authentication headers, and response parsing:

\`\`\`ts
function createApiClient() {
  const BASE_URL = '/api';

  async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(\`\${BASE_URL}\${endpoint}\`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(errorBody || \`HTTP \${response.status}\`);
    }

    return response.json();
  }

  return {
    get: <T>(endpoint: string) => request<T>(endpoint),
    post: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: unknown) =>
      request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) =>
      request<T>(endpoint, { method: 'DELETE' }),
  };
}
\`\`\`

For this lesson we simulate API responses with a mock function. The architecture is identical to a real API client — you would simply point \`BASE_URL\` at your actual backend and the rest works unchanged.

## Simulated Backend

Our mock backend stores data in memory and responds with artificial latency:

\`\`\`ts
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
}

let mockProjects: Project[] = [
  { id: '1', name: 'Website Redesign', description: 'Modernize the company website.', status: 'active', createdAt: '2025-10-01' },
  { id: '2', name: 'Mobile App', description: 'Build a native mobile app.', status: 'active', createdAt: '2025-10-15' },
  { id: '3', name: 'Analytics Dashboard', description: 'Internal data visualization tool.', status: 'archived', createdAt: '2025-09-01' },
];

async function simulateApi<T>(data: T, delay = 600): Promise<T> {
  await new Promise(r => setTimeout(r, delay));
  return structuredClone(data);
}
\`\`\`

## Caching with $state

Naive API integrations fetch the same data every time a component mounts. A simple cache avoids this:

\`\`\`ts
let cache = $state(new Map<string, { data: unknown; timestamp: number }>());
const CACHE_TTL = 30000; // 30 seconds

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  return null;
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() });
}
\`\`\`

Before executing a fetch, check the cache. On success, update the cache. This reduces network requests dramatically in navigation-heavy applications where users switch between pages frequently.

## Optimistic Updates

Optimistic updates improve perceived performance by updating the UI *before* the API call completes. If the call fails, you revert to the previous state:

\`\`\`ts
async function deleteProject(id: string) {
  const previousProjects = $state.snapshot(projects);
  // Optimistically remove
  projects = projects.filter(p => p.id !== id);

  try {
    await api.delete(\`/projects/\${id}\`);
  } catch (e) {
    // Revert on failure
    projects = previousProjects;
    throw e;
  }
}
\`\`\`

The user sees the deletion instantly. If the server rejects it (permissions, network failure), the item reappears. This pattern makes applications feel snappy even over slow connections.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.state'
		},
		{
			type: 'text',
			content: `## Your Task: Build the API Layer

Open the starter code. You will find \`api.ts\`, \`ProjectList.svelte\`, and \`App.svelte\`.

1. Implement \`createAsyncState\` with \`$state\` for data, isLoading, error and an \`execute\` method.
2. Build the mock API with simulated latency for CRUD operations on projects.
3. Create \`ProjectList.svelte\` that uses async state to fetch and display projects.
4. Add a delete button with optimistic updates — remove the project immediately, revert on failure.`
		},
		{
			type: 'checkpoint',
			content: 'cp-api-async'
		},
		{
			type: 'text',
			content: `## Loading and Error States in the UI

Display loading and error states explicitly. A common pattern uses three-way conditional rendering:

\`\`\`svelte
{#if projectsState.isLoading}
  <div class="loading">Loading projects...</div>
{:else if projectsState.error}
  <div class="error">
    <p>{projectsState.error}</p>
    <button onclick={retry}>Try again</button>
  </div>
{:else if projectsState.data}
  {#each projectsState.data as project (project.id)}
    <ProjectCard {project} onDelete={handleDelete} />
  {/each}
{/if}
\`\`\`

The "Try again" button on the error state is critical UX — it gives users a recovery path without refreshing the page. The retry function simply calls \`execute()\` again with the same fetcher.

## Automatic Fetching on Mount

Use \`$effect\` to fetch data when the component first renders:

\`\`\`ts
$effect(() => {
  projectsState.execute(() => simulateApi(mockProjects));
});
\`\`\`

Because \`$effect\` runs after the component mounts, this triggers the initial data load. The UI shows the loading state, then transitions to the data view or error view.

## Refresh and Invalidation

Add a "Refresh" button that forces a re-fetch, bypassing the cache:

\`\`\`ts
function refresh() {
  cache.delete('/projects');
  projectsState.execute(() => simulateApi(mockProjects));
}
\`\`\`

This gives users manual control over data freshness — important in SaaS applications where data changes frequently and users need confidence they are seeing the latest version.`
		},
		{
			type: 'checkpoint',
			content: 'cp-api-list'
		},
		{
			type: 'checkpoint',
			content: 'cp-api-optimistic'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import ProjectList from './ProjectList.svelte';
</script>

<div class="app">
  <h1>Projects</h1>
  <ProjectList />
</div>

<style>
  .app { max-width: 700px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
</style>`
		},
		{
			name: 'api.ts',
			path: '/api.ts',
			language: 'typescript',
			content: `// TODO: Define Project interface
// TODO: Create createAsyncState<T>() with $state for data, isLoading, error
// TODO: Create mock data and simulateApi function
// TODO: Export async state factory and mock API functions
`
		},
		{
			name: 'ProjectList.svelte',
			path: '/ProjectList.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import API utilities
  // TODO: Create async state for projects
  // TODO: Fetch projects on mount with $effect
  // TODO: Add delete handler with optimistic update
</script>

<!-- TODO: Render loading, error, and data states -->

<style>
  /* Add your styles here */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'api.ts',
			path: '/api.ts',
			language: 'typescript',
			content: `export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export function createAsyncState<T>(initialData: T | null = null) {
  let data = $state<T | null>(initialData);
  let isLoading = $state(false);
  let error = $state('');

  return {
    get data() { return data; },
    set data(v: T | null) { data = v; },
    get isLoading() { return isLoading; },
    get error() { return error; },
    get hasData() { return data !== null; },

    async execute(fetcher: () => Promise<T>) {
      isLoading = true;
      error = '';
      try {
        data = await fetcher();
      } catch (e) {
        error = e instanceof Error ? e.message : 'An error occurred';
      } finally {
        isLoading = false;
      }
    },

    reset() {
      data = initialData;
      isLoading = false;
      error = '';
    }
  };
}

export let mockProjects = $state<Project[]>([
  { id: '1', name: 'Website Redesign', description: 'Modernize the company website with a fresh design.', status: 'active', createdAt: '2025-10-01' },
  { id: '2', name: 'Mobile App', description: 'Build a cross-platform mobile application.', status: 'active', createdAt: '2025-10-15' },
  { id: '3', name: 'Analytics Dashboard', description: 'Internal data visualization and reporting tool.', status: 'archived', createdAt: '2025-09-01' },
  { id: '4', name: 'API Gateway', description: 'Centralized API management and rate limiting.', status: 'active', createdAt: '2025-11-01' },
]);

export async function simulateApi<T>(data: T, delay = 600): Promise<T> {
  await new Promise(r => setTimeout(r, delay));
  return structuredClone(data) as T;
}
`
		},
		{
			name: 'ProjectList.svelte',
			path: '/ProjectList.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { createAsyncState, mockProjects, simulateApi, type Project } from './api';

  let projectsState = createAsyncState<Project[]>();

  $effect(() => {
    projectsState.execute(() => simulateApi(mockProjects));
  });

  async function handleDelete(id: string) {
    const previous = [...(projectsState.data ?? [])];
    projectsState.data = (projectsState.data ?? []).filter(p => p.id !== id);

    try {
      await simulateApi(null, 300);
      // Also remove from mock backend
      const idx = mockProjects.findIndex(p => p.id === id);
      if (idx !== -1) mockProjects.splice(idx, 1);
    } catch {
      projectsState.data = previous;
    }
  }

  function refresh() {
    projectsState.execute(() => simulateApi(mockProjects));
  }
</script>

<div class="project-list">
  <div class="toolbar">
    <span class="count">
      {#if projectsState.hasData}
        {projectsState.data?.length} projects
      {/if}
    </span>
    <button onclick={refresh} disabled={projectsState.isLoading}>Refresh</button>
  </div>

  {#if projectsState.isLoading}
    <div class="loading">Loading projects...</div>
  {:else if projectsState.error}
    <div class="error">
      <p>{projectsState.error}</p>
      <button onclick={refresh}>Try again</button>
    </div>
  {:else if projectsState.data}
    {#each projectsState.data as project (project.id)}
      <div class="card">
        <div class="card-header">
          <h3>{project.name}</h3>
          <span class="badge" class:archived={project.status === 'archived'}>{project.status}</span>
        </div>
        <p class="desc">{project.description}</p>
        <div class="card-footer">
          <small>Created {project.createdAt}</small>
          <button class="delete" onclick={() => handleDelete(project.id)}>Delete</button>
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .count { font-size: 0.85rem; color: #64748b; }
  .toolbar button { padding: 0.4rem 0.8rem; background: #f1f5f9; border: 1px solid #d1d5db; border-radius: 5px; cursor: pointer; font-size: 0.85rem; }
  .loading { text-align: center; padding: 2rem; color: #64748b; }
  .error { text-align: center; padding: 2rem; color: #dc2626; }
  .error button { margin-top: 0.5rem; padding: 0.4rem 0.8rem; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer; }
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; background: white; }
  .card-header { display: flex; justify-content: space-between; align-items: center; }
  .card-header h3 { margin: 0; font-size: 1rem; }
  .badge { padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.7rem; background: #dcfce7; color: #16a34a; }
  .badge.archived { background: #f1f5f9; color: #64748b; }
  .desc { color: #475569; font-size: 0.875rem; margin: 0.5rem 0; }
  .card-footer { display: flex; justify-content: space-between; align-items: center; }
  .card-footer small { color: #94a3b8; }
  .delete { padding: 0.25rem 0.5rem; border: 1px solid #fca5a5; border-radius: 4px; background: white; color: #dc2626; cursor: pointer; font-size: 0.75rem; }
</style>`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import ProjectList from './ProjectList.svelte';
</script>

<div class="app">
  <h1>Projects</h1>
  <ProjectList />
</div>

<style>
  .app { max-width: 700px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-api-async',
			description: 'Implement createAsyncState with $state for data, isLoading, error and an execute method',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'createAsyncState' },
						{ type: 'contains', value: '$state' },
						{ type: 'contains', value: 'async execute' }
					]
				}
			},
			hints: [
				'Create a generic function `createAsyncState<T>()` that returns an object with `$state` for data, isLoading, and error.',
				'The `execute` method should accept a `fetcher: () => Promise<T>`, set isLoading, call the fetcher, and handle success/error.',
				'Use try/catch/finally: `try { data = await fetcher(); } catch (e) { error = e.message; } finally { isLoading = false; }`.'
			],
			conceptsTested: ['svelte5.runes.state']
		},
		{
			id: 'cp-api-list',
			description: 'Build ProjectList that fetches on mount with $effect and displays loading/error/data states',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$effect' },
						{ type: 'contains', value: 'projectsState' },
						{ type: 'contains', value: 'isLoading' }
					]
				}
			},
			hints: [
				'Create async state with `let projectsState = createAsyncState<Project[]>()` and fetch in `$effect`.',
				'Render three branches: `{#if projectsState.isLoading}...{:else if projectsState.error}...{:else if projectsState.data}...{/if}`.',
				'In the `$effect`, call `projectsState.execute(() => simulateApi(mockProjects))` to trigger the initial load.'
			],
			conceptsTested: ['svelte5.runes.effect', 'svelte5.runes.derived']
		},
		{
			id: 'cp-api-optimistic',
			description: 'Add delete with optimistic update — remove immediately, revert on failure',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'handleDelete' },
						{ type: 'contains', value: 'previous' },
						{ type: 'contains', value: '.filter(' }
					]
				}
			},
			hints: [
				'Save the current data before the delete: `const previous = [...(projectsState.data ?? [])]`.',
				'Optimistically update the UI: `projectsState.data = projectsState.data.filter(p => p.id !== id)`.',
				'Wrap the API call in try/catch and revert on failure: `catch { projectsState.data = previous; }`.'
			],
			conceptsTested: ['svelte5.runes.state']
		}
	]
};
