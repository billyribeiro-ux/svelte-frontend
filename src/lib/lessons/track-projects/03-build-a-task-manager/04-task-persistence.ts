import type { Lesson } from '$types/lesson';

export const taskPersistence: Lesson = {
	id: 'projects.build-a-task-manager.task-persistence',
	slug: 'task-persistence',
	title: 'Task Persistence',
	description:
		'Persist task data to localStorage with automatic serialization, hydration on load, and undo/redo history using $effect and $state snapshots.',
	trackId: 'projects',
	moduleId: 'build-a-task-manager',
	order: 4,
	estimatedMinutes: 25,
	concepts: ['svelte5.runes.effect', 'svelte5.runes.state', 'svelte5.state.snapshots'],
	prerequisites: ['projects.build-a-task-manager.drag-and-drop'],

	content: [
		{
			type: 'text',
			content: `# Task Persistence with localStorage

A task manager that loses all data when you refresh the page is a toy, not a tool. In this lesson you will add localStorage persistence to the task store so tasks survive page reloads, implement hydration logic that loads saved data on startup, and build an undo/redo system using state snapshots. This is where \`$effect\` and \`$state.snapshot()\` demonstrate their real-world power.

## The Persistence Strategy

Our strategy has two parts:

1. **Write**: Whenever the task list changes, serialize it to JSON and save it to \`localStorage\`.
2. **Read**: When the store initializes, check \`localStorage\` for existing data and hydrate the state.

The write side is a perfect use case for \`$effect\`. We create an effect that reads the tasks array (establishing a dependency) and writes to localStorage:

\`\`\`ts
$effect(() => {
  const snapshot = $state.snapshot(tasks);
  localStorage.setItem('tasks', JSON.stringify(snapshot));
});
\`\`\`

Why \`$state.snapshot()\`? Svelte 5's \`$state\` wraps arrays and objects in proxies for deep reactivity tracking. These proxies cannot be serialized directly with \`JSON.stringify\` — you would get unexpected results or errors. \`$state.snapshot()\` returns a plain JavaScript copy of the current state, safe for serialization.

The read side runs once during initialization:

\`\`\`ts
function loadFromStorage(): Task[] {
  try {
    const saved = localStorage.getItem('tasks');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load tasks:', e);
  }
  return [];
}

let tasks = $state<Task[]>(loadFromStorage());
\`\`\`

This pattern — load from storage in the initializer, save on change via effect — is clean and reliable. The try/catch guards against corrupted data or storage being unavailable (incognito mode in some browsers, storage full, etc.).

## Debouncing Writes

Saving to localStorage on every keystroke (while editing a task title, for example) is wasteful. We debounce the writes so they only fire after a brief pause:

\`\`\`ts
let saveTimeout: ReturnType<typeof setTimeout>;

$effect(() => {
  const snapshot = $state.snapshot(tasks);
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem('tasks', JSON.stringify(snapshot));
  }, 500);

  return () => clearTimeout(saveTimeout);
});
\`\`\`

The 500ms delay means rapid changes (typing, dragging) batch into a single write. The cleanup function in the effect clears the pending timeout if the effect re-runs before the timer fires.

## Undo/Redo with State Snapshots

Undo/redo is a feature users expect but developers often skip because it seems complex. With \`$state.snapshot()\`, it is surprisingly straightforward. We maintain two stacks — undo and redo — that store snapshots of the task array:

\`\`\`ts
let undoStack = $state<Task[][]>([]);
let redoStack = $state<Task[][]>([]);

function pushUndoState() {
  undoStack.push($state.snapshot(tasks));
  redoStack = []; // Clear redo on new action
}

function undo() {
  if (undoStack.length === 0) return;
  redoStack.push($state.snapshot(tasks));
  const previous = undoStack.pop()!;
  tasks = previous;
}

function redo() {
  if (redoStack.length === 0) return;
  undoStack.push($state.snapshot(tasks));
  const next = redoStack.pop()!;
  tasks = next;
}
\`\`\`

The key insight: \`$state.snapshot()\` creates a deep, plain-object copy of the current state. Pushing this snapshot onto the undo stack preserves that exact moment in time. When the user undoes, we push the *current* state onto the redo stack, then restore the previous snapshot by assigning it to \`tasks\`.

This works because assigning a new value to a \`$state\` variable triggers reactivity. Svelte sees the entire task array change and re-renders everything that depends on it — the task list, the Kanban board, the filter counts, all of it.

## Integrating Undo with CRUD Operations

Call \`pushUndoState()\` before every mutation: before adding, updating, or deleting a task. Wrap the store methods:

\`\`\`ts
return {
  get tasks() { return tasks; },

  addTask(task: Task) {
    pushUndoState();
    tasks.push(task);
  },

  updateTask(id: string, updates: Partial<Task>) {
    pushUndoState();
    const i = tasks.findIndex(t => t.id === id);
    if (i !== -1) tasks[i] = { ...tasks[i], ...updates };
  },

  deleteTask(id: string) {
    pushUndoState();
    tasks = tasks.filter(t => t.id !== id);
  },

  undo,
  redo,

  get canUndo() { return undoStack.length > 0; },
  get canRedo() { return redoStack.length > 0; },
};
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'svelte5.state.snapshots'
		},
		{
			type: 'text',
			content: `## Your Task: Add Persistence and Undo

Open the starter code. You will find the task store from previous lessons, now with TODOs for persistence and undo.

1. Add \`localStorage\` hydration in the store's initialization.
2. Add a \`$effect\` that saves tasks to \`localStorage\` with debouncing.
3. Implement undo/redo stacks using \`$state.snapshot()\`.
4. Add undo/redo buttons to the UI with \`canUndo\`/\`canRedo\` derived getters.`
		},
		{
			type: 'checkpoint',
			content: 'cp-persist-storage'
		},
		{
			type: 'text',
			content: `## Keyboard Shortcuts for Undo/Redo

Power users expect Ctrl+Z for undo and Ctrl+Shift+Z (or Ctrl+Y) for redo. Add a global keyboard listener:

\`\`\`ts
$effect(() => {
  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        taskStore.redo();
      } else {
        taskStore.undo();
      }
    }
  }

  window.addEventListener('keydown', handleKeydown);
  return () => window.removeEventListener('keydown', handleKeydown);
});
\`\`\`

The cleanup function removes the listener when the component unmounts, preventing zombie event handlers. This is the same cleanup pattern you used for \`setInterval\` in the real-time dashboard lesson — \`$effect\`'s return-a-function API handles both cases.

## Storage Size Monitoring

localStorage has a ~5MB limit per origin. While you are unlikely to hit it with task data, a robust application monitors usage. Derive the current storage size:

\`\`\`ts
let storageSize = $derived(() => {
  const data = localStorage.getItem('tasks') ?? '';
  return (new Blob([data]).size / 1024).toFixed(1) + ' KB';
});
\`\`\`

Display this in the footer or settings panel as a reassurance that the app is storing data and has room to grow.

## Clear All Data

Add a "Clear All Data" button that empties both the store and localStorage. This is a destructive action, so protect it with confirmation:

\`\`\`ts
function clearAllData() {
  pushUndoState();
  tasks = [];
  localStorage.removeItem('tasks');
}
\`\`\`

Because we push an undo state first, the user can recover from an accidental clear — another reason the undo system is valuable.

This lesson completes the task manager module. You have built CRUD operations, multi-criteria filtering, a drag-and-drop Kanban board, and persistent storage with undo/redo — a fully functional application that rivals simple commercial task managers.`
		},
		{
			type: 'checkpoint',
			content: 'cp-persist-undo'
		},
		{
			type: 'checkpoint',
			content: 'cp-persist-keyboard'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { taskStore } from './store';
  import TaskCard from './TaskCard.svelte';

  // TODO: Add $effect for keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
</script>

<div class="app">
  <div class="header">
    <h1>Task Manager</h1>
    <div class="undo-controls">
      <!-- TODO: Add undo/redo buttons -->
    </div>
  </div>

  <div class="task-list">
    {#each taskStore.tasks as task (task.id)}
      <TaskCard
        {task}
        onUpdate={(id, updates) => taskStore.updateTask(id, updates)}
        onDelete={(id) => taskStore.deleteTask(id)}
      />
    {/each}
  </div>

  {#if taskStore.tasks.length === 0}
    <p class="empty">No tasks. Add one to get started!</p>
  {/if}
</div>

<style>
  .app { max-width: 700px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .undo-controls { display: flex; gap: 0.5rem; }
  .task-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .empty { text-align: center; color: #94a3b8; margin-top: 2rem; }
</style>`
		},
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { Task } from './types';

// TODO: Add loadFromStorage function that reads from localStorage
// TODO: Add $effect for debounced localStorage writes
// TODO: Add undo/redo stacks with $state.snapshot()

function createTaskStore() {
  let tasks = $state<Task[]>([
    { id: '1', title: 'Learn $state', description: 'Master reactive state.', status: 'done', priority: 'high', createdAt: '2025-11-01', dueDate: '2025-11-05' },
    { id: '2', title: 'Build components', description: 'Create reusable UI.', status: 'in-progress', priority: 'medium', createdAt: '2025-11-02', dueDate: '2025-11-10' },
    { id: '3', title: 'Add persistence', description: 'Save data to localStorage.', status: 'todo', priority: 'high', createdAt: '2025-11-03', dueDate: '2025-11-15' },
  ]);

  // TODO: Replace above with loadFromStorage()
  // TODO: Add $effect for localStorage persistence
  // TODO: Add undo/redo logic

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

<div class="card">
  <div class="header">
    <h3>{task.title}</h3>
    <div class="badges">
      <span class="badge priority-{task.priority}">{task.priority}</span>
      <button class="badge status-{task.status}" onclick={cycleStatus}>{task.status}</button>
    </div>
  </div>
  {#if task.description}<p class="desc">{task.description}</p>{/if}
  <div class="actions">
    <button class="delete" onclick={() => onDelete(task.id)}>Delete</button>
  </div>
</div>

<style>
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; background: white; }
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
  .actions { margin-top: 0.5rem; }
  .delete { padding: 0.3rem 0.5rem; border: 1px solid #fca5a5; border-radius: 5px; background: white; color: #dc2626; cursor: pointer; font-size: 0.75rem; }
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

	solutionFiles: [
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { Task } from './types';

function loadFromStorage(): Task[] {
  try {
    const saved = localStorage.getItem('tasks');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load tasks:', e);
  }
  return [
    { id: '1', title: 'Learn $state', description: 'Master reactive state.', status: 'done', priority: 'high', createdAt: '2025-11-01', dueDate: '2025-11-05' },
    { id: '2', title: 'Build components', description: 'Create reusable UI.', status: 'in-progress', priority: 'medium', createdAt: '2025-11-02', dueDate: '2025-11-10' },
    { id: '3', title: 'Add persistence', description: 'Save data to localStorage.', status: 'todo', priority: 'high', createdAt: '2025-11-03', dueDate: '2025-11-15' },
  ];
}

function createTaskStore() {
  let tasks = $state<Task[]>(loadFromStorage());
  let undoStack = $state<Task[][]>([]);
  let redoStack = $state<Task[][]>([]);
  let saveTimeout: ReturnType<typeof setTimeout>;

  $effect(() => {
    const snapshot = $state.snapshot(tasks);
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      localStorage.setItem('tasks', JSON.stringify(snapshot));
    }, 500);

    return () => clearTimeout(saveTimeout);
  });

  function pushUndoState() {
    undoStack.push($state.snapshot(tasks));
    redoStack = [];
  }

  function undo() {
    if (undoStack.length === 0) return;
    redoStack.push($state.snapshot(tasks));
    const previous = undoStack.pop()!;
    tasks = previous;
  }

  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push($state.snapshot(tasks));
    const next = redoStack.pop()!;
    tasks = next;
  }

  return {
    get tasks() { return tasks; },
    addTask(task: Task) { pushUndoState(); tasks.push(task); },
    updateTask(id: string, updates: Partial<Task>) {
      pushUndoState();
      const i = tasks.findIndex(t => t.id === id);
      if (i !== -1) tasks[i] = { ...tasks[i], ...updates };
    },
    deleteTask(id: string) { pushUndoState(); tasks = tasks.filter(t => t.id !== id); },
    undo,
    redo,
    get canUndo() { return undoStack.length > 0; },
    get canRedo() { return redoStack.length > 0; },
  };
}

export const taskStore = createTaskStore();
`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { taskStore } from './store';
  import TaskCard from './TaskCard.svelte';

  $effect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          taskStore.redo();
        } else {
          taskStore.undo();
        }
      }
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="app">
  <div class="header">
    <h1>Task Manager</h1>
    <div class="undo-controls">
      <button onclick={() => taskStore.undo()} disabled={!taskStore.canUndo}>Undo</button>
      <button onclick={() => taskStore.redo()} disabled={!taskStore.canRedo}>Redo</button>
    </div>
  </div>

  <div class="task-list">
    {#each taskStore.tasks as task (task.id)}
      <TaskCard
        {task}
        onUpdate={(id, updates) => taskStore.updateTask(id, updates)}
        onDelete={(id) => taskStore.deleteTask(id)}
      />
    {/each}
  </div>

  {#if taskStore.tasks.length === 0}
    <p class="empty">No tasks. Add one to get started!</p>
  {/if}
</div>

<style>
  .app { max-width: 700px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .undo-controls { display: flex; gap: 0.5rem; }
  .undo-controls button { padding: 0.4rem 0.8rem; background: #f1f5f9; border: 1px solid #d1d5db; border-radius: 5px; cursor: pointer; font-size: 0.85rem; }
  .undo-controls button:disabled { opacity: 0.4; cursor: not-allowed; }
  .undo-controls button:hover:not(:disabled) { background: #e2e8f0; }
  .task-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .empty { text-align: center; color: #94a3b8; margin-top: 2rem; }
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

<div class="card">
  <div class="header">
    <h3>{task.title}</h3>
    <div class="badges">
      <span class="badge priority-{task.priority}">{task.priority}</span>
      <button class="badge status-{task.status}" onclick={cycleStatus}>{task.status}</button>
    </div>
  </div>
  {#if task.description}<p class="desc">{task.description}</p>{/if}
  <div class="actions">
    <button class="delete" onclick={() => onDelete(task.id)}>Delete</button>
  </div>
</div>

<style>
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; background: white; }
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
  .actions { margin-top: 0.5rem; }
  .delete { padding: 0.3rem 0.5rem; border: 1px solid #fca5a5; border-radius: 5px; background: white; color: #dc2626; cursor: pointer; font-size: 0.75rem; }
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
			id: 'cp-persist-storage',
			description: 'Add localStorage read on init and $effect write with debouncing',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'localStorage' },
						{ type: 'contains', value: '$effect' },
						{ type: 'contains', value: '$state.snapshot' }
					]
				}
			},
			hints: [
				'Create a `loadFromStorage` function that reads and parses `localStorage.getItem(\'tasks\')` with try/catch.',
				'Initialize tasks with `let tasks = $state<Task[]>(loadFromStorage())` and add a `$effect` that saves via `localStorage.setItem`.',
				'Use `$state.snapshot(tasks)` to get a serializable copy, debounce with `setTimeout`, and return a cleanup function: `return () => clearTimeout(saveTimeout)`.'
			],
			conceptsTested: ['svelte5.runes.effect', 'svelte5.state.snapshots']
		},
		{
			id: 'cp-persist-undo',
			description: 'Implement undo/redo with $state.snapshot() stacks',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'undoStack' },
						{ type: 'contains', value: 'redoStack' },
						{ type: 'contains', value: '$state.snapshot' }
					]
				}
			},
			hints: [
				'Create `let undoStack = $state<Task[][]>([])` and `let redoStack = $state<Task[][]>([])` to hold state history.',
				'Before each mutation, call `pushUndoState()` which does `undoStack.push($state.snapshot(tasks)); redoStack = [];`',
				'Implement `undo()` that pushes current state to redo, pops undo to restore, and `redo()` that does the inverse. Expose `canUndo`/`canRedo` getters.'
			],
			conceptsTested: ['svelte5.state.snapshots', 'svelte5.runes.state']
		},
		{
			id: 'cp-persist-keyboard',
			description: 'Add keyboard shortcuts for undo (Ctrl+Z) and redo (Ctrl+Shift+Z) via $effect',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'addEventListener' },
						{ type: 'contains', value: 'removeEventListener' },
						{ type: 'contains', value: 'keydown' }
					]
				}
			},
			hints: [
				'Use `$effect` to add a global `keydown` listener and return a cleanup function that removes it.',
				'Check `(e.ctrlKey || e.metaKey) && e.key === \'z\'` for undo, add `e.shiftKey` check for redo.',
				'Full pattern: `$effect(() => { function handleKeydown(e) { if ((e.ctrlKey || e.metaKey) && e.key === \'z\') { e.preventDefault(); e.shiftKey ? taskStore.redo() : taskStore.undo(); } } window.addEventListener(\'keydown\', handleKeydown); return () => window.removeEventListener(\'keydown\', handleKeydown); });`'
			],
			conceptsTested: ['svelte5.runes.effect']
		}
	]
};
