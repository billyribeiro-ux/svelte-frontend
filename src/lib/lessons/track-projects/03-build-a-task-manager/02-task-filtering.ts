import type { Lesson } from '$types/lesson';

export const taskFiltering: Lesson = {
	id: 'projects.build-a-task-manager.task-filtering',
	slug: 'task-filtering',
	title: 'Task Filtering and Sorting',
	description:
		'Add multi-criteria filtering, sorting, and search to the task manager using chained $derived computations and reactive UI controls.',
	trackId: 'projects',
	moduleId: 'build-a-task-manager',
	order: 2,
	estimatedMinutes: 25,
	concepts: ['svelte5.runes.derived', 'svelte5.runes.state', 'svelte5.control-flow.each'],
	prerequisites: ['projects.build-a-task-manager.task-crud'],

	content: [
		{
			type: 'text',
			content: `# Task Filtering and Sorting

With CRUD operations in place, the task list grows quickly. Ten tasks are manageable; fifty are overwhelming without filtering and sorting tools. In this lesson you will add a comprehensive filter system that lets users narrow down tasks by status, priority, and search query, then sort the results by different criteria. All of this is built with chained \`$derived\` computations — the same reactive pipeline pattern you have used in previous modules.

## The Filter State

Our filter system has four independent controls:

1. **Status filter** — Show all tasks, or only todo / in-progress / done.
2. **Priority filter** — Show all priorities, or only high / medium / low.
3. **Search query** — Free-text search across title and description.
4. **Sort criteria** — Sort by creation date, due date, priority, or title.

Each is an independent \`$state\` variable:

\`\`\`ts
let statusFilter = $state<'all' | 'todo' | 'in-progress' | 'done'>('all');
let priorityFilter = $state<'all' | 'low' | 'medium' | 'high'>('all');
let searchQuery = $state('');
let sortBy = $state<'createdAt' | 'dueDate' | 'priority' | 'title'>('createdAt');
let sortDirection = $state<'asc' | 'desc'>('desc');
\`\`\`

Keeping each filter as an independent variable means changes to one filter do not disturb the others. This is important for UX — the user sets a status filter, then adds a priority filter, then types a search. Each action is independent and reversible.

## The Derived Pipeline

We chain four \`$derived\` computations, each building on the previous:

\`\`\`ts
// Step 1: Filter by status
let statusFiltered = $derived(
  statusFilter === 'all'
    ? taskStore.tasks
    : taskStore.tasks.filter(t => t.status === statusFilter)
);

// Step 2: Filter by priority
let priorityFiltered = $derived(
  priorityFilter === 'all'
    ? statusFiltered
    : statusFiltered.filter(t => t.priority === priorityFilter)
);

// Step 3: Filter by search query
let searchFiltered = $derived(
  searchQuery.trim() === ''
    ? priorityFiltered
    : priorityFiltered.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
);

// Step 4: Sort
let sortedTasks = $derived(
  [...searchFiltered].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;

    if (sortBy === 'priority') {
      const order = { high: 3, medium: 2, low: 1 };
      return (order[a.priority] - order[b.priority]) * modifier;
    }

    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * modifier;
    }
    return 0;
  })
);
\`\`\`

Each step reads from the previous step's output and applies one transformation. Svelte tracks the dependency graph: if \`priorityFilter\` changes, steps 2-4 re-run but step 1 is skipped. If \`searchQuery\` changes, only steps 3-4 re-run. This is automatic optimization — you get fine-grained reactivity without manual memoization.

## Filter Counts

Show the user how many tasks match the current filters, broken down by status. These counts update as filters change:

\`\`\`ts
let statusCounts = $derived({
  all: taskStore.tasks.length,
  todo: taskStore.tasks.filter(t => t.status === 'todo').length,
  'in-progress': taskStore.tasks.filter(t => t.status === 'in-progress').length,
  done: taskStore.tasks.filter(t => t.status === 'done').length,
});

let resultCount = $derived(sortedTasks.length);
\`\`\`

Display counts in the filter buttons: "Todo (5)" / "In Progress (3)" / "Done (8)". This gives users immediate feedback about the data distribution and helps them choose useful filters.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.derived'
		},
		{
			type: 'text',
			content: `## Your Task: Add Filtering and Sorting

Open the starter code. You will find \`FilterBar.svelte\` and \`App.svelte\` with the task list from the previous lesson.

1. Add filter \`$state\` variables for status, priority, search, sort, and sort direction.
2. Build the chained \`$derived\` pipeline: status -> priority -> search -> sort.
3. Create a \`FilterBar\` component with buttons for status, priority, a search input, and a sort dropdown.
4. Display the result count and status counts in the filter bar.`
		},
		{
			type: 'checkpoint',
			content: 'cp-filter-pipeline'
		},
		{
			type: 'text',
			content: `## Building the Filter Bar UI

The filter bar should be visually clear and compact. Use button groups for status and priority filters, where the active filter is highlighted:

\`\`\`svelte
<div class="filter-group">
  <label>Status</label>
  <div class="button-group">
    {#each ['all', 'todo', 'in-progress', 'done'] as status}
      <button
        class:active={statusFilter === status}
        onclick={() => statusFilter = status}
      >
        {status === 'all' ? 'All' : status} ({statusCounts[status]})
      </button>
    {/each}
  </div>
</div>
\`\`\`

The \`class:active\` directive highlights the selected filter. Clicking a button simply assigns the \`$state\` variable — no event dispatching, no imperative DOM updates.

## Clearing All Filters

Add a "Clear Filters" button that resets every filter to its default:

\`\`\`ts
function clearFilters() {
  statusFilter = 'all';
  priorityFilter = 'all';
  searchQuery = '';
  sortBy = 'createdAt';
  sortDirection = 'desc';
}
\`\`\`

Show this button only when at least one filter is active. Derive that condition:

\`\`\`ts
let hasActiveFilters = $derived(
  statusFilter !== 'all' ||
  priorityFilter !== 'all' ||
  searchQuery.trim() !== ''
);
\`\`\`

## Empty State

When filters produce zero results, show a helpful message rather than a blank page:

\`\`\`svelte
{#if sortedTasks.length === 0}
  <div class="empty-state">
    <p>No tasks match your current filters.</p>
    {#if hasActiveFilters}
      <button onclick={clearFilters}>Clear all filters</button>
    {/if}
  </div>
{/if}
\`\`\`

This pattern — showing an action to recover from empty state — is a UX best practice. Never leave the user staring at nothing with no way forward.

Test the complete filter system by creating tasks with different statuses and priorities, then combining filters. Verify that counts update, the pipeline chains correctly, and clearing filters restores the full list.`
		},
		{
			type: 'checkpoint',
			content: 'cp-filter-bar'
		},
		{
			type: 'checkpoint',
			content: 'cp-filter-counts'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import FilterBar from './FilterBar.svelte';
  import TaskCard from './TaskCard.svelte';
  import { taskStore } from './store';
  import type { Task } from './types';

  // TODO: Add filter $state variables
  // TODO: Build $derived pipeline: statusFiltered -> priorityFiltered -> searchFiltered -> sortedTasks
  // TODO: Add $derived statusCounts and resultCount
</script>

<div class="app">
  <h1>Task Manager</h1>

  <!-- TODO: Add FilterBar with bound filter values -->

  <div class="task-list">
    <!-- TODO: Render sortedTasks with TaskCard -->
  </div>
</div>

<style>
  .app {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }
</style>`
		},
		{
			name: 'FilterBar.svelte',
			path: '/FilterBar.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Accept filter state and callbacks via $props()
  // OR accept bindable state via $bindable()
</script>

<!-- TODO: Status filter buttons with counts -->
<!-- TODO: Priority filter buttons -->
<!-- TODO: Search input -->
<!-- TODO: Sort dropdown and direction toggle -->
<!-- TODO: Result count and clear filters button -->

<style>
  /* Add your filter bar styles here */
</style>`
		},
		{
			name: 'TaskCard.svelte',
			path: '/TaskCard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Task } from './types';

  let { task, onUpdate, onDelete }: {
    task: Task;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
  } = $props();

  function cycleStatus() {
    const next = { 'todo': 'in-progress' as const, 'in-progress': 'done' as const, 'done': 'todo' as const };
    onUpdate(task.id, { status: next[task.status] });
  }
</script>

<div class="card" class:done={task.status === 'done'}>
  <div class="header">
    <h3>{task.title}</h3>
    <div class="badges">
      <span class="badge priority-{task.priority}">{task.priority}</span>
      <button class="badge status-{task.status}" onclick={cycleStatus}>{task.status}</button>
    </div>
  </div>
  {#if task.description}<p class="desc">{task.description}</p>{/if}
</div>

<style>
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; background: white; }
  .card.done { opacity: 0.6; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; }
  h3 { margin: 0; font-size: 1rem; }
  .badges { display: flex; gap: 0.35rem; }
  .badge { padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.7rem; border: none; cursor: pointer; }
  .priority-high { background: #fef2f2; color: #dc2626; }
  .priority-medium { background: #fffbeb; color: #d97706; }
  .priority-low { background: #f0fdf4; color: #16a34a; }
  .status-todo { background: #f1f5f9; color: #475569; }
  .status-in-progress { background: #eff6ff; color: #2563eb; }
  .status-done { background: #f0fdf4; color: #16a34a; }
  .desc { color: #64748b; font-size: 0.875rem; margin: 0.5rem 0 0; }
</style>`
		},
		{
			name: 'types.ts',
			path: '/types.ts',
			language: 'typescript',
			content: `export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate: string;
}
`
		},
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { Task } from './types';

function createTaskStore() {
  let tasks = $state<Task[]>([
    { id: '1', title: 'Set up project', description: 'Initialize the codebase.', status: 'done', priority: 'high', createdAt: '2025-11-01', dueDate: '2025-11-05' },
    { id: '2', title: 'Design components', description: 'Plan the component tree.', status: 'in-progress', priority: 'high', createdAt: '2025-11-02', dueDate: '2025-11-10' },
    { id: '3', title: 'Write tests', description: 'Add unit and integration tests.', status: 'todo', priority: 'medium', createdAt: '2025-11-03', dueDate: '2025-11-15' },
    { id: '4', title: 'Update docs', description: 'Document the API and usage.', status: 'todo', priority: 'low', createdAt: '2025-11-04', dueDate: '2025-11-20' },
    { id: '5', title: 'Fix login bug', description: 'Session expires too early.', status: 'in-progress', priority: 'high', createdAt: '2025-11-05', dueDate: '2025-11-08' },
    { id: '6', title: 'Add dark mode', description: 'Support system and manual theme.', status: 'todo', priority: 'low', createdAt: '2025-11-06', dueDate: '2025-11-25' },
    { id: '7', title: 'Performance audit', description: 'Profile and optimize renders.', status: 'todo', priority: 'medium', createdAt: '2025-11-07', dueDate: '2025-11-22' },
  ]);

  return {
    get tasks() { return tasks; },
    addTask(task: Task) { tasks.push(task); },
    updateTask(id: string, updates: Partial<Task>) {
      const i = tasks.findIndex(t => t.id === id);
      if (i !== -1) tasks[i] = { ...tasks[i], ...updates };
    },
    deleteTask(id: string) { tasks = tasks.filter(t => t.id !== id); },
  };
}

export const taskStore = createTaskStore();
`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import FilterBar from './FilterBar.svelte';
  import TaskCard from './TaskCard.svelte';
  import { taskStore } from './store';
  import type { Task } from './types';

  let statusFilter = $state<'all' | 'todo' | 'in-progress' | 'done'>('all');
  let priorityFilter = $state<'all' | 'low' | 'medium' | 'high'>('all');
  let searchQuery = $state('');
  let sortBy = $state<'createdAt' | 'dueDate' | 'priority' | 'title'>('createdAt');
  let sortDirection = $state<'asc' | 'desc'>('desc');

  let statusFiltered = $derived(
    statusFilter === 'all' ? taskStore.tasks : taskStore.tasks.filter(t => t.status === statusFilter)
  );

  let priorityFiltered = $derived(
    priorityFilter === 'all' ? statusFiltered : statusFiltered.filter(t => t.priority === priorityFilter)
  );

  let searchFiltered = $derived(
    searchQuery.trim() === '' ? priorityFiltered : priorityFiltered.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  let sortedTasks = $derived(
    [...searchFiltered].sort((a, b) => {
      const mod = sortDirection === 'asc' ? 1 : -1;
      if (sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 };
        return (order[a.priority] - order[b.priority]) * mod;
      }
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return typeof aVal === 'string' && typeof bVal === 'string' ? aVal.localeCompare(bVal) * mod : 0;
    })
  );

  let statusCounts = $derived({
    all: taskStore.tasks.length,
    todo: taskStore.tasks.filter(t => t.status === 'todo').length,
    'in-progress': taskStore.tasks.filter(t => t.status === 'in-progress').length,
    done: taskStore.tasks.filter(t => t.status === 'done').length,
  });

  let hasActiveFilters = $derived(
    statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery.trim() !== ''
  );

  function clearFilters() {
    statusFilter = 'all';
    priorityFilter = 'all';
    searchQuery = '';
    sortBy = 'createdAt';
    sortDirection = 'desc';
  }
</script>

<div class="app">
  <h1>Task Manager</h1>

  <FilterBar
    bind:statusFilter
    bind:priorityFilter
    bind:searchQuery
    bind:sortBy
    bind:sortDirection
    {statusCounts}
    resultCount={sortedTasks.length}
    {hasActiveFilters}
    onClear={clearFilters}
  />

  <div class="task-list">
    {#each sortedTasks as task (task.id)}
      <TaskCard {task} onUpdate={(id, updates) => taskStore.updateTask(id, updates)} onDelete={(id) => taskStore.deleteTask(id)} />
    {/each}
  </div>

  {#if sortedTasks.length === 0}
    <div class="empty">
      <p>No tasks match your filters.</p>
      {#if hasActiveFilters}
        <button onclick={clearFilters}>Clear all filters</button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .app { max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, -apple-system, sans-serif; }
  .task-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
  .empty { text-align: center; color: #94a3b8; padding: 2rem; }
  .empty button { margin-top: 0.5rem; padding: 0.4rem 0.8rem; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer; }
</style>`
		},
		{
			name: 'FilterBar.svelte',
			path: '/FilterBar.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let {
    statusFilter = $bindable('all'),
    priorityFilter = $bindable('all'),
    searchQuery = $bindable(''),
    sortBy = $bindable('createdAt'),
    sortDirection = $bindable('desc'),
    statusCounts,
    resultCount,
    hasActiveFilters,
    onClear,
  }: {
    statusFilter: string;
    priorityFilter: string;
    searchQuery: string;
    sortBy: string;
    sortDirection: string;
    statusCounts: Record<string, number>;
    resultCount: number;
    hasActiveFilters: boolean;
    onClear: () => void;
  } = $props();
</script>

<div class="filter-bar">
  <input class="search" bind:value={searchQuery} placeholder="Search tasks..." />

  <div class="filter-group">
    <label>Status</label>
    <div class="button-group">
      {#each ['all', 'todo', 'in-progress', 'done'] as status}
        <button class:active={statusFilter === status} onclick={() => statusFilter = status}>
          {status === 'all' ? 'All' : status} ({statusCounts[status]})
        </button>
      {/each}
    </div>
  </div>

  <div class="filter-group">
    <label>Priority</label>
    <div class="button-group">
      {#each ['all', 'low', 'medium', 'high'] as priority}
        <button class:active={priorityFilter === priority} onclick={() => priorityFilter = priority}>
          {priority === 'all' ? 'All' : priority}
        </button>
      {/each}
    </div>
  </div>

  <div class="sort-row">
    <select bind:value={sortBy}>
      <option value="createdAt">Created</option>
      <option value="dueDate">Due Date</option>
      <option value="priority">Priority</option>
      <option value="title">Title</option>
    </select>
    <button class="dir-btn" onclick={() => sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'}>
      {sortDirection === 'asc' ? '↑' : '↓'}
    </button>
    <span class="count">{resultCount} tasks</span>
    {#if hasActiveFilters}
      <button class="clear-btn" onclick={onClear}>Clear filters</button>
    {/if}
  </div>
</div>

<style>
  .filter-bar { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
  .search { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem; }
  .filter-group label { font-size: 0.75rem; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem; display: block; }
  .button-group { display: flex; gap: 0.3rem; flex-wrap: wrap; }
  .button-group button { padding: 0.3rem 0.6rem; border: 1px solid #d1d5db; border-radius: 5px; background: white; cursor: pointer; font-size: 0.8rem; }
  .button-group button.active { background: #6366f1; color: white; border-color: #6366f1; }
  .sort-row { display: flex; align-items: center; gap: 0.5rem; }
  .sort-row select { padding: 0.3rem; border: 1px solid #d1d5db; border-radius: 5px; font-size: 0.8rem; }
  .dir-btn { padding: 0.3rem 0.5rem; border: 1px solid #d1d5db; border-radius: 5px; background: white; cursor: pointer; }
  .count { font-size: 0.8rem; color: #64748b; margin-left: auto; }
  .clear-btn { padding: 0.3rem 0.6rem; border: none; background: #ef4444; color: white; border-radius: 5px; cursor: pointer; font-size: 0.75rem; }
</style>`
		},
		{
			name: 'TaskCard.svelte',
			path: '/TaskCard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Task } from './types';

  let { task, onUpdate, onDelete }: {
    task: Task;
    onUpdate: (id: string, updates: Partial<Task>) => void;
    onDelete: (id: string) => void;
  } = $props();

  function cycleStatus() {
    const next = { 'todo': 'in-progress' as const, 'in-progress': 'done' as const, 'done': 'todo' as const };
    onUpdate(task.id, { status: next[task.status] });
  }
</script>

<div class="card" class:done={task.status === 'done'}>
  <div class="header">
    <h3>{task.title}</h3>
    <div class="badges">
      <span class="badge priority-{task.priority}">{task.priority}</span>
      <button class="badge status-{task.status}" onclick={cycleStatus}>{task.status}</button>
    </div>
  </div>
  {#if task.description}<p class="desc">{task.description}</p>{/if}
</div>

<style>
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; background: white; }
  .card.done { opacity: 0.6; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; }
  h3 { margin: 0; font-size: 1rem; }
  .badges { display: flex; gap: 0.35rem; }
  .badge { padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.7rem; border: none; cursor: pointer; }
  .priority-high { background: #fef2f2; color: #dc2626; }
  .priority-medium { background: #fffbeb; color: #d97706; }
  .priority-low { background: #f0fdf4; color: #16a34a; }
  .status-todo { background: #f1f5f9; color: #475569; }
  .status-in-progress { background: #eff6ff; color: #2563eb; }
  .status-done { background: #f0fdf4; color: #16a34a; }
  .desc { color: #64748b; font-size: 0.875rem; margin: 0.5rem 0 0; }
</style>`
		},
		{
			name: 'types.ts',
			path: '/types.ts',
			language: 'typescript',
			content: `export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate: string;
}
`
		},
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { Task } from './types';

function createTaskStore() {
  let tasks = $state<Task[]>([
    { id: '1', title: 'Set up project', description: 'Initialize the codebase.', status: 'done', priority: 'high', createdAt: '2025-11-01', dueDate: '2025-11-05' },
    { id: '2', title: 'Design components', description: 'Plan the component tree.', status: 'in-progress', priority: 'high', createdAt: '2025-11-02', dueDate: '2025-11-10' },
    { id: '3', title: 'Write tests', description: 'Add unit and integration tests.', status: 'todo', priority: 'medium', createdAt: '2025-11-03', dueDate: '2025-11-15' },
    { id: '4', title: 'Update docs', description: 'Document the API and usage.', status: 'todo', priority: 'low', createdAt: '2025-11-04', dueDate: '2025-11-20' },
    { id: '5', title: 'Fix login bug', description: 'Session expires too early.', status: 'in-progress', priority: 'high', createdAt: '2025-11-05', dueDate: '2025-11-08' },
    { id: '6', title: 'Add dark mode', description: 'Support system and manual theme.', status: 'todo', priority: 'low', createdAt: '2025-11-06', dueDate: '2025-11-25' },
    { id: '7', title: 'Performance audit', description: 'Profile and optimize renders.', status: 'todo', priority: 'medium', createdAt: '2025-11-07', dueDate: '2025-11-22' },
  ]);

  return {
    get tasks() { return tasks; },
    addTask(task: Task) { tasks.push(task); },
    updateTask(id: string, updates: Partial<Task>) {
      const i = tasks.findIndex(t => t.id === id);
      if (i !== -1) tasks[i] = { ...tasks[i], ...updates };
    },
    deleteTask(id: string) { tasks = tasks.filter(t => t.id !== id); },
  };
}

export const taskStore = createTaskStore();
`
		}
	],

	checkpoints: [
		{
			id: 'cp-filter-pipeline',
			description: 'Build a chained $derived pipeline: status -> priority -> search -> sort',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'statusFilter' },
						{ type: 'contains', value: 'priorityFilter' },
						{ type: 'regex', value: '\\$derived.*filter' }
					]
				}
			},
			hints: [
				'Create separate `$state` variables for each filter criterion: statusFilter, priorityFilter, searchQuery, sortBy, sortDirection.',
				'Chain `$derived` computations: each reads from the previous step and applies one filter. The final step sorts the result.',
				'Use `let statusFiltered = $derived(statusFilter === \'all\' ? taskStore.tasks : taskStore.tasks.filter(...))` then `let priorityFiltered = $derived(priorityFilter === \'all\' ? statusFiltered : statusFiltered.filter(...))` and continue the chain.'
			],
			conceptsTested: ['svelte5.runes.derived']
		},
		{
			id: 'cp-filter-bar',
			description: 'Create a FilterBar component with status, priority, search, and sort controls',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$props()' },
						{ type: 'contains', value: 'bind:value' },
						{ type: 'contains', value: 'class:active' }
					]
				}
			},
			hints: [
				'Accept filter values as bindable props or as regular props with change callbacks.',
				'Render button groups for status and priority using `{#each}` with `class:active` for the selected option.',
				'Use `$bindable()` for two-way binding from the parent: `let { statusFilter = $bindable(\'all\'), ... } = $props()` and render `<button class:active={statusFilter === status} onclick={() => statusFilter = status}>`.'
			],
			conceptsTested: ['svelte5.runes.state', 'svelte5.control-flow.each']
		},
		{
			id: 'cp-filter-counts',
			description: 'Display status counts and result count using $derived',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'statusCounts' },
						{ type: 'contains', value: 'resultCount' },
						{ type: 'contains', value: '$derived' }
					]
				}
			},
			hints: [
				'Create `let statusCounts = $derived({ all: taskStore.tasks.length, todo: taskStore.tasks.filter(t => t.status === \'todo\').length, ... })`.',
				'Create `let resultCount = $derived(sortedTasks.length)` and pass both to the FilterBar.',
				'Display counts in filter buttons: `{status} ({statusCounts[status]})` and show the total result count in the toolbar.'
			],
			conceptsTested: ['svelte5.runes.derived']
		}
	]
};
