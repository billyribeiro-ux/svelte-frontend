import type { Lesson } from '$types/lesson';

export const taskCrud: Lesson = {
	id: 'projects.build-a-task-manager.task-crud',
	slug: 'task-crud',
	title: 'Task CRUD Operations',
	description:
		'Build the core of a task manager with create, read, update, and delete operations using reactive Svelte 5 state and component composition.',
	trackId: 'projects',
	moduleId: 'build-a-task-manager',
	order: 1,
	estimatedMinutes: 30,
	concepts: ['svelte5.runes.state', 'svelte5.components.composition', 'svelte5.bindings.input'],
	prerequisites: ['svelte5.runes.state', 'svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# Task CRUD Operations

Every task manager starts with the same four operations: **C**reate, **R**ead, **U**pdate, and **D**elete. These operations form the backbone of any data-driven application, and building them with Svelte 5 runes teaches you how reactive state flows through a multi-component architecture.

In this lesson you will create a task data model, build a reactive store for task state, implement a form for creating new tasks, render tasks as interactive cards, enable inline editing, and add delete functionality with confirmation. This is a substantial amount of functionality, but each piece builds naturally on the one before it.

## The Task Data Model

A task in our application has more fields than you might expect. Beyond the obvious title and completion status, we need priority levels, due dates, and descriptions to make the task manager genuinely useful:

\`\`\`ts
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate: string;
}
\`\`\`

The \`status\` field uses a union type with three values. This maps naturally to a Kanban board — which we will build in a later lesson. For now, we render tasks in a flat list with status badges.

## The Task Store

We follow the same factory-function pattern from the blog module to create a reactive store:

\`\`\`ts
function createTaskStore() {
  let tasks = $state<Task[]>([]);

  return {
    get tasks() { return tasks; },

    addTask(task: Task) {
      tasks.push(task);
    },

    updateTask(id: string, updates: Partial<Task>) {
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
      }
    },

    deleteTask(id: string) {
      tasks = tasks.filter(t => t.id !== id);
    },

    getTask(id: string) {
      return tasks.find(t => t.id === id);
    }
  };
}

export const taskStore = createTaskStore();
\`\`\`

The \`updateTask\` method uses \`Partial<Task>\` — a TypeScript utility type that makes all fields optional. This lets you update individual fields without specifying the entire object: \`taskStore.updateTask(id, { status: 'done' })\`.

The assignment \`tasks[index] = { ...tasks[index], ...updates }\` triggers Svelte 5's reactivity because we are assigning to an indexed position in a \`$state\` array. Svelte tracks these mutations automatically.

## The Create Form

The create form is a controlled component: each input is bound to a \`$state\` variable, and a submit handler constructs a new task from the current values:

\`\`\`svelte
<script lang="ts">
  import { taskStore } from './store';

  let title = $state('');
  let description = $state('');
  let priority = $state<'low' | 'medium' | 'high'>('medium');
  let dueDate = $state('');

  let isValid = $derived(title.trim().length >= 3);

  function createTask() {
    if (!isValid) return;

    taskStore.addTask({
      id: crypto.randomUUID(),
      title: title.trim(),
      description,
      status: 'todo',
      priority,
      createdAt: new Date().toISOString().split('T')[0],
      dueDate,
    });

    // Reset form
    title = '';
    description = '';
    priority = 'medium';
    dueDate = '';
  }
</script>
\`\`\`

The \`priority\` field uses a \`<select>\` with \`bind:value\`, which works the same as text inputs — Svelte keeps the variable in sync with the selected option.

## The Task Card Component

Each task renders as a card showing its title, description, priority badge, status badge, and action buttons. This is a presentational component that receives the task and callback functions via \`$props()\`:

\`\`\`ts
let { task, onUpdate, onDelete }: {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
} = $props();
\`\`\`

Passing callbacks rather than importing the store directly makes \`TaskCard\` reusable and testable. The parent component decides *what* happens when the user clicks Edit or Delete; the card just triggers the action.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.state'
		},
		{
			type: 'text',
			content: `## Your Task: Build the Task CRUD System

Open the starter code. You will find \`App.svelte\`, \`TaskForm.svelte\`, \`TaskCard.svelte\`, and \`store.ts\`.

1. Complete \`store.ts\` with \`$state\` and CRUD methods (addTask, updateTask, deleteTask).
2. Complete \`TaskForm.svelte\` with bound form fields and a create function.
3. Complete \`TaskCard.svelte\` to display task data with priority and status badges.
4. Wire everything together in \`App.svelte\` — render the form and the task list.`
		},
		{
			type: 'checkpoint',
			content: 'cp-crud-store'
		},
		{
			type: 'text',
			content: `## Inline Editing

Instead of navigating to a separate edit page, we enable inline editing directly on the task card. When the user clicks "Edit", the card switches from display mode to edit mode — input fields appear in place of the text, and Save/Cancel buttons replace Edit/Delete.

This requires local component state for the editing flag and temporary values:

\`\`\`ts
let editing = $state(false);
let editTitle = $state(task.title);
let editDescription = $state(task.description);
let editPriority = $state(task.priority);

function startEditing() {
  editing = true;
  editTitle = task.title;
  editDescription = task.description;
  editPriority = task.priority;
}

function saveEdit() {
  onUpdate(task.id, {
    title: editTitle,
    description: editDescription,
    priority: editPriority,
  });
  editing = false;
}

function cancelEdit() {
  editing = false;
}
\`\`\`

The temporary edit variables are initialized from the task when editing starts. If the user cancels, we discard the temporaries. If they save, we push the changes to the store via the callback. This pattern prevents partial edits from corrupting the store.

## Status Cycling

Add a quick-action button that cycles the task through statuses: todo -> in-progress -> done -> todo. This is the most common task interaction and should require minimal effort:

\`\`\`ts
function cycleStatus() {
  const nextStatus = {
    'todo': 'in-progress' as const,
    'in-progress': 'done' as const,
    'done': 'todo' as const,
  };
  onUpdate(task.id, { status: nextStatus[task.status] });
}
\`\`\`

## Delete Confirmation

Deleting a task should not happen on a single accidental click. We add a two-step confirmation: the first click shows "Are you sure?", the second click actually deletes:

\`\`\`ts
let confirmingDelete = $state(false);

function handleDelete() {
  if (confirmingDelete) {
    onDelete(task.id);
  } else {
    confirmingDelete = true;
    setTimeout(() => confirmingDelete = false, 3000);
  }
}
\`\`\`

The timeout resets the confirmation after 3 seconds, so the user does not get stuck in the "confirm" state. This is a lightweight alternative to a modal dialog — appropriate for a task card where screen space is limited.`
		},
		{
			type: 'checkpoint',
			content: 'cp-crud-form'
		},
		{
			type: 'checkpoint',
			content: 'cp-crud-card'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import TaskForm from './TaskForm.svelte';
  import TaskCard from './TaskCard.svelte';
  import { taskStore } from './store';

  // TODO: Wire up task list rendering and callbacks
</script>

<div class="app">
  <h1>Task Manager</h1>
  <TaskForm />

  <div class="task-list">
    <!-- TODO: Render TaskCard for each task -->
  </div>
</div>

<style>
  .app {
    max-width: 700px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }
</style>`
		},
		{
			name: 'TaskForm.svelte',
			path: '/TaskForm.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { taskStore } from './store';

  // TODO: Declare $state variables for title, description, priority, dueDate
  // TODO: Create $derived isValid
  // TODO: Write createTask function
</script>

<form onsubmit={(e) => { e.preventDefault(); }}>
  <!-- TODO: Add form fields with bind:value -->
  <!-- TODO: Add submit button -->
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }
</style>`
		},
		{
			name: 'TaskCard.svelte',
			path: '/TaskCard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Task } from './types';

  // TODO: Accept task, onUpdate, onDelete via $props()
  // TODO: Add local state for editing mode
</script>

<!-- TODO: Render task card with display/edit modes -->

<style>
  /* Add card styles */
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

// TODO: Create a reactive task store with $state
// Export: taskStore with tasks getter, addTask, updateTask, deleteTask, getTask
`
		}
	],

	solutionFiles: [
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { Task } from './types';

function createTaskStore() {
  let tasks = $state<Task[]>([
    {
      id: '1',
      title: 'Set up project structure',
      description: 'Create the initial folder layout and install dependencies.',
      status: 'done',
      priority: 'high',
      createdAt: '2025-11-01',
      dueDate: '2025-11-05',
    },
    {
      id: '2',
      title: 'Design component architecture',
      description: 'Plan which components the app needs and how they communicate.',
      status: 'in-progress',
      priority: 'high',
      createdAt: '2025-11-02',
      dueDate: '2025-11-10',
    },
    {
      id: '3',
      title: 'Write unit tests',
      description: 'Add test coverage for the task store and utility functions.',
      status: 'todo',
      priority: 'medium',
      createdAt: '2025-11-03',
      dueDate: '2025-11-15',
    },
  ]);

  return {
    get tasks() { return tasks; },
    addTask(task: Task) { tasks.push(task); },
    updateTask(id: string, updates: Partial<Task>) {
      const index = tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updates };
      }
    },
    deleteTask(id: string) { tasks = tasks.filter(t => t.id !== id); },
    getTask(id: string) { return tasks.find(t => t.id === id); },
  };
}

export const taskStore = createTaskStore();
`
		},
		{
			name: 'TaskForm.svelte',
			path: '/TaskForm.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { taskStore } from './store';

  let title = $state('');
  let description = $state('');
  let priority = $state<'low' | 'medium' | 'high'>('medium');
  let dueDate = $state('');

  let isValid = $derived(title.trim().length >= 3);

  function createTask() {
    if (!isValid) return;
    taskStore.addTask({
      id: crypto.randomUUID(),
      title: title.trim(),
      description,
      status: 'todo',
      priority,
      createdAt: new Date().toISOString().split('T')[0],
      dueDate,
    });
    title = '';
    description = '';
    priority = 'medium';
    dueDate = '';
  }
</script>

<form onsubmit={(e) => { e.preventDefault(); createTask(); }}>
  <input bind:value={title} placeholder="Task title (min 3 characters)" />
  <textarea bind:value={description} placeholder="Description (optional)" rows="2"></textarea>
  <div class="row">
    <select bind:value={priority}>
      <option value="low">Low Priority</option>
      <option value="medium">Medium Priority</option>
      <option value="high">High Priority</option>
    </select>
    <input type="date" bind:value={dueDate} />
  </div>
  <button type="submit" disabled={!isValid}>Add Task</button>
</form>

<style>
  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.25rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  input, textarea, select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.9rem;
  }

  .row {
    display: flex;
    gap: 0.5rem;
  }

  .row select, .row input { flex: 1; }

  button {
    padding: 0.625rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  button:disabled { opacity: 0.5; cursor: not-allowed; }
  button:hover:not(:disabled) { background: #4f46e5; }
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

  let editing = $state(false);
  let editTitle = $state(task.title);
  let editDescription = $state(task.description);
  let editPriority = $state(task.priority);
  let confirmingDelete = $state(false);

  function startEditing() {
    editing = true;
    editTitle = task.title;
    editDescription = task.description;
    editPriority = task.priority;
  }

  function saveEdit() {
    onUpdate(task.id, { title: editTitle, description: editDescription, priority: editPriority });
    editing = false;
  }

  function cancelEdit() { editing = false; }

  function cycleStatus() {
    const next = { 'todo': 'in-progress' as const, 'in-progress': 'done' as const, 'done': 'todo' as const };
    onUpdate(task.id, { status: next[task.status] });
  }

  function handleDelete() {
    if (confirmingDelete) {
      onDelete(task.id);
    } else {
      confirmingDelete = true;
      setTimeout(() => confirmingDelete = false, 3000);
    }
  }
</script>

<div class="card" class:done={task.status === 'done'}>
  {#if editing}
    <input class="edit-input" bind:value={editTitle} />
    <textarea class="edit-input" bind:value={editDescription} rows="2"></textarea>
    <select bind:value={editPriority}>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
    <div class="actions">
      <button class="save" onclick={saveEdit}>Save</button>
      <button class="cancel" onclick={cancelEdit}>Cancel</button>
    </div>
  {:else}
    <div class="header">
      <h3>{task.title}</h3>
      <div class="badges">
        <span class="badge priority-{task.priority}">{task.priority}</span>
        <button class="badge status-{task.status}" onclick={cycleStatus}>{task.status}</button>
      </div>
    </div>
    {#if task.description}
      <p class="description">{task.description}</p>
    {/if}
    {#if task.dueDate}
      <small class="due">Due: {task.dueDate}</small>
    {/if}
    <div class="actions">
      <button onclick={startEditing}>Edit</button>
      <button class="delete" onclick={handleDelete}>
        {confirmingDelete ? 'Confirm?' : 'Delete'}
      </button>
    </div>
  {/if}
</div>

<style>
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    background: white;
  }

  .card.done { opacity: 0.6; }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  h3 { margin: 0; font-size: 1rem; color: #1e293b; }

  .badges { display: flex; gap: 0.35rem; }

  .badge {
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
    font-size: 0.7rem;
    border: none;
    cursor: pointer;
  }

  .priority-high { background: #fef2f2; color: #dc2626; }
  .priority-medium { background: #fffbeb; color: #d97706; }
  .priority-low { background: #f0fdf4; color: #16a34a; }

  .status-todo { background: #f1f5f9; color: #475569; }
  .status-in-progress { background: #eff6ff; color: #2563eb; }
  .status-done { background: #f0fdf4; color: #16a34a; }

  .description { color: #64748b; font-size: 0.875rem; margin: 0.5rem 0 0; line-height: 1.4; }
  .due { color: #94a3b8; font-size: 0.8rem; }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .actions button {
    padding: 0.35rem 0.65rem;
    border: 1px solid #d1d5db;
    border-radius: 5px;
    background: white;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .actions .save { background: #6366f1; color: white; border-color: #6366f1; }
  .actions .cancel { background: #f1f5f9; }
  .actions .delete { color: #dc2626; border-color: #fca5a5; }
  .actions .delete:hover { background: #fef2f2; }

  .edit-input {
    width: 100%;
    padding: 0.4rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    box-sizing: border-box;
  }

  select {
    padding: 0.35rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.85rem;
  }
</style>`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import TaskForm from './TaskForm.svelte';
  import TaskCard from './TaskCard.svelte';
  import { taskStore } from './store';

  function handleUpdate(id: string, updates: Partial<import('./types').Task>) {
    taskStore.updateTask(id, updates);
  }

  function handleDelete(id: string) {
    taskStore.deleteTask(id);
  }
</script>

<div class="app">
  <h1>Task Manager</h1>
  <TaskForm />

  <div class="task-list">
    {#each taskStore.tasks as task (task.id)}
      <TaskCard {task} onUpdate={handleUpdate} onDelete={handleDelete} />
    {/each}
  </div>

  {#if taskStore.tasks.length === 0}
    <p class="empty">No tasks yet. Add one above!</p>
  {/if}
</div>

<style>
  .app {
    max-width: 700px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .task-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .empty {
    text-align: center;
    color: #94a3b8;
    margin-top: 2rem;
  }
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
		}
	],

	checkpoints: [
		{
			id: 'cp-crud-store',
			description: 'Create a reactive task store with $state and CRUD methods',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$state' },
						{ type: 'contains', value: 'addTask' },
						{ type: 'contains', value: 'updateTask' },
						{ type: 'contains', value: 'deleteTask' }
					]
				}
			},
			hints: [
				'Follow the factory function pattern: `function createTaskStore() { let tasks = $state<Task[]>([]); return { ... }; }`.',
				'The `updateTask` method should find the task by index and replace it: `tasks[index] = { ...tasks[index], ...updates }`.',
				'Export the store: `export const taskStore = createTaskStore();` with methods for addTask (push), updateTask (find + spread), deleteTask (filter), and getTask (find).'
			],
			conceptsTested: ['svelte5.runes.state']
		},
		{
			id: 'cp-crud-form',
			description: 'Build a task creation form with bound fields and validation',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'bind:value' },
						{ type: 'contains', value: 'isValid' },
						{ type: 'contains', value: 'taskStore.addTask' }
					]
				}
			},
			hints: [
				'Declare `$state` for title, description, priority, and dueDate. Bind each to a form element.',
				'Create `let isValid = $derived(title.trim().length >= 3)` and disable the submit button with `disabled={!isValid}`.',
				'Build a `createTask` function that calls `taskStore.addTask({...})` with a generated UUID and resets all fields afterward.'
			],
			conceptsTested: ['svelte5.bindings.input', 'svelte5.runes.state']
		},
		{
			id: 'cp-crud-card',
			description: 'Build TaskCard with display/edit modes, status cycling, and delete confirmation',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$props()' },
						{ type: 'contains', value: 'editing' },
						{ type: 'contains', value: 'cycleStatus' }
					]
				}
			},
			hints: [
				'Accept `task`, `onUpdate`, and `onDelete` via `$props()`. Use local `$state` for `editing` mode.',
				'Switch between display and edit views with `{#if editing}...{:else}...{/if}`. Initialize edit fields from task data.',
				'Add `cycleStatus` that maps todo->in-progress->done->todo via `onUpdate`, and a two-step delete with `confirmingDelete` state and a timeout.'
			],
			conceptsTested: ['svelte5.components.composition']
		}
	]
};
