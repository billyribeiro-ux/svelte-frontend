import type { Lesson } from '$types/lesson';

export const dragAndDrop: Lesson = {
	id: 'projects.build-a-task-manager.drag-and-drop',
	slug: 'drag-and-drop',
	title: 'Drag and Drop',
	description:
		'Implement a Kanban board with drag-and-drop task reordering using the native HTML Drag and Drop API and Svelte 5 reactive state.',
	trackId: 'projects',
	moduleId: 'build-a-task-manager',
	order: 3,
	estimatedMinutes: 35,
	concepts: ['svelte5.actions.use', 'svelte5.runes.state', 'svelte5.events.drag'],
	prerequisites: ['projects.build-a-task-manager.task-filtering'],

	content: [
		{
			type: 'text',
			content: `# Drag and Drop Kanban Board

The Kanban board is the defining feature of modern task managers. Trello, Jira, Linear, Notion — they all present tasks as cards you can drag between columns representing workflow stages. In this lesson you will build a three-column Kanban board (Todo, In Progress, Done) with full drag-and-drop support using the native HTML Drag and Drop API and Svelte 5 reactive state.

We intentionally avoid third-party drag-and-drop libraries. The browser's native API is well-supported, accessible, and teaches you fundamental concepts that apply regardless of framework. Once you understand how it works, reaching for a library like \`dnd-kit\` or \`Sortable.js\` in a production app becomes an informed choice rather than a cargo-culted dependency.

## The HTML Drag and Drop API

The native API revolves around five events:

| Event | Fires on | Purpose |
|---|---|---|
| \`dragstart\` | The dragged element | Initialize the drag with data |
| \`dragover\` | The drop target | Allow dropping (must call \`preventDefault()\`) |
| \`dragenter\` | The drop target | Visual feedback when entering a zone |
| \`dragleave\` | The drop target | Remove feedback when leaving a zone |
| \`drop\` | The drop target | Handle the dropped data |

The key insight: you must call \`event.preventDefault()\` in the \`dragover\` handler. By default, most elements do not accept drops. Preventing default opt in to drop acceptance.

## Kanban Column Layout

Our board has three columns, one per status. Each column is a drop zone that accepts tasks and changes their status:

\`\`\`svelte
<div class="board">
  {#each columns as column}
    <div
      class="column"
      class:drag-over={dragOverColumn === column.status}
      ondragover={(e) => { e.preventDefault(); dragOverColumn = column.status; }}
      ondragleave={() => dragOverColumn = null}
      ondrop={(e) => handleDrop(e, column.status)}
    >
      <h2>{column.title} ({column.tasks.length})</h2>
      {#each column.tasks as task (task.id)}
        <div
          class="task-card"
          draggable="true"
          ondragstart={(e) => handleDragStart(e, task)}
        >
          <h3>{task.title}</h3>
          <span class="badge priority-{task.priority}">{task.priority}</span>
        </div>
      {/each}
    </div>
  {/each}
</div>
\`\`\`

The \`columns\` array is a \`$derived\` computation that groups tasks by status:

\`\`\`ts
let columns = $derived([
  { status: 'todo' as const, title: 'Todo', tasks: taskStore.tasks.filter(t => t.status === 'todo') },
  { status: 'in-progress' as const, title: 'In Progress', tasks: taskStore.tasks.filter(t => t.status === 'in-progress') },
  { status: 'done' as const, title: 'Done', tasks: taskStore.tasks.filter(t => t.status === 'done') },
]);
\`\`\`

When a task's status changes (via drop), the derived columns recompute automatically. The task disappears from one column and appears in another — no imperative DOM manipulation needed.

## Drag State Management

We need \`$state\` variables to track the drag operation:

\`\`\`ts
let draggedTaskId = $state<string | null>(null);
let dragOverColumn = $state<string | null>(null);
\`\`\`

\`draggedTaskId\` stores the ID of the task being dragged. We set it in \`dragstart\` and clear it in \`drop\` (or \`dragend\`). \`dragOverColumn\` highlights the column that would receive the drop, providing visual feedback.

The drag handlers:

\`\`\`ts
function handleDragStart(e: DragEvent, task: Task) {
  draggedTaskId = task.id;
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', task.id);
  }
}

function handleDrop(e: DragEvent, newStatus: Task['status']) {
  e.preventDefault();
  dragOverColumn = null;

  if (draggedTaskId) {
    taskStore.updateTask(draggedTaskId, { status: newStatus });
    draggedTaskId = null;
  }
}
\`\`\`

The \`dataTransfer\` object is the official way to pass data during a drag. We set the task ID as plain text. In the drop handler, we read the ID and update the task's status through the store. Because the columns are derived from the store, the UI updates immediately.

## Visual Feedback During Drag

Good drag-and-drop UX requires visual feedback at every stage:

1. **The dragged card** should become semi-transparent to indicate it is being moved.
2. **The target column** should highlight to show where the card will land.
3. **Other columns** should remain normal for contrast.

We achieve this with reactive CSS classes:

\`\`\`svelte
<div
  class="task-card"
  class:dragging={draggedTaskId === task.id}
  draggable="true"
  ...
>
\`\`\`

\`\`\`css
.task-card.dragging { opacity: 0.4; }
.column.drag-over { background: #eff6ff; border-color: #6366f1; }
\`\`\`

These classes are derived from \`$state\` — when \`draggedTaskId\` changes, only the affected card's opacity updates. When \`dragOverColumn\` changes, only the affected column's background updates. This is surgical reactivity in action.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.events.drag'
		},
		{
			type: 'text',
			content: `## Your Task: Build the Kanban Board

Open the starter code. You will find a \`KanbanBoard.svelte\` shell and the task store from previous lessons.

1. Create \`$derived\` columns that group tasks by status.
2. Add drag event handlers (\`dragstart\`, \`dragover\`, \`dragleave\`, \`drop\`) to enable task movement between columns.
3. Add \`$state\` for \`draggedTaskId\` and \`dragOverColumn\` to track the drag operation.
4. Apply visual feedback classes for the dragging card and the target column.`
		},
		{
			type: 'checkpoint',
			content: 'cp-dnd-columns'
		},
		{
			type: 'text',
			content: `## Reordering Within a Column

Moving tasks between columns changes their status, but what about reordering within a column? Users expect to drag a task above or below another task within the same column to set priority order.

This requires tracking the drop *position* within a column. We add a \`dragover\` handler to each card that calculates whether the cursor is in the top or bottom half:

\`\`\`ts
function handleCardDragOver(e: DragEvent, targetTask: Task) {
  e.preventDefault();
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const midY = rect.top + rect.height / 2;
  dropPosition = e.clientY < midY ? 'before' : 'after';
  dropTargetId = targetTask.id;
}
\`\`\`

In the drop handler, you then move the dragged task to the correct position in the array. This is more complex than cross-column moves but follows the same principles — track state reactively, update the store, let derived computations handle the UI.

## Drag Handle Accessibility

Not every user can or wants to use a mouse. For accessibility, add keyboard support: when a task card is focused, pressing Enter or Space enters "drag mode", arrow keys move between positions, and Enter/Escape confirms or cancels.

This is simplified with a helper function:

\`\`\`ts
function handleKeyboard(e: KeyboardEvent, task: Task) {
  if (e.key === 'ArrowRight') {
    const statuses: Task['status'][] = ['todo', 'in-progress', 'done'];
    const currentIndex = statuses.indexOf(task.status);
    if (currentIndex < statuses.length - 1) {
      taskStore.updateTask(task.id, { status: statuses[currentIndex + 1] });
    }
  } else if (e.key === 'ArrowLeft') {
    const statuses: Task['status'][] = ['todo', 'in-progress', 'done'];
    const currentIndex = statuses.indexOf(task.status);
    if (currentIndex > 0) {
      taskStore.updateTask(task.id, { status: statuses[currentIndex - 1] });
    }
  }
}
\`\`\`

Arrow left moves the task to the previous column; arrow right moves it to the next. Simple, but it makes the board usable without a mouse — a requirement for accessible applications.`
		},
		{
			type: 'checkpoint',
			content: 'cp-dnd-handlers'
		},
		{
			type: 'checkpoint',
			content: 'cp-dnd-feedback'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import KanbanBoard from './KanbanBoard.svelte';
</script>

<div class="app">
  <h1>Kanban Board</h1>
  <KanbanBoard />
</div>

<style>
  .app {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>`
		},
		{
			name: 'KanbanBoard.svelte',
			path: '/KanbanBoard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { taskStore } from './store';
  import type { Task } from './types';

  // TODO: Add $state for draggedTaskId, dragOverColumn
  // TODO: Add $derived columns grouping tasks by status
  // TODO: Add drag event handlers: handleDragStart, handleDrop
</script>

<div class="board">
  <!-- TODO: Render three columns with drag-and-drop support -->
</div>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    min-height: 500px;
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
		},
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { Task } from './types';

function createTaskStore() {
  let tasks = $state<Task[]>([
    { id: '1', title: 'Set up project', description: 'Initialize the codebase.', status: 'todo', priority: 'high', createdAt: '2025-11-01', dueDate: '2025-11-05' },
    { id: '2', title: 'Design components', description: 'Plan the component tree.', status: 'todo', priority: 'medium', createdAt: '2025-11-02', dueDate: '2025-11-10' },
    { id: '3', title: 'Write tests', description: 'Add test coverage.', status: 'in-progress', priority: 'high', createdAt: '2025-11-03', dueDate: '2025-11-15' },
    { id: '4', title: 'Deploy v1', description: 'Ship first version.', status: 'in-progress', priority: 'medium', createdAt: '2025-11-04', dueDate: '2025-11-20' },
    { id: '5', title: 'Fix login bug', description: 'Session issue.', status: 'done', priority: 'high', createdAt: '2025-11-05', dueDate: '2025-11-08' },
    { id: '6', title: 'Update README', description: 'Add usage docs.', status: 'done', priority: 'low', createdAt: '2025-11-06', dueDate: '2025-11-12' },
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
			name: 'KanbanBoard.svelte',
			path: '/KanbanBoard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { taskStore } from './store';
  import type { Task } from './types';

  let draggedTaskId = $state<string | null>(null);
  let dragOverColumn = $state<string | null>(null);

  let columns = $derived([
    { status: 'todo' as const, title: 'Todo', tasks: taskStore.tasks.filter(t => t.status === 'todo') },
    { status: 'in-progress' as const, title: 'In Progress', tasks: taskStore.tasks.filter(t => t.status === 'in-progress') },
    { status: 'done' as const, title: 'Done', tasks: taskStore.tasks.filter(t => t.status === 'done') },
  ]);

  function handleDragStart(e: DragEvent, task: Task) {
    draggedTaskId = task.id;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task.id);
    }
  }

  function handleDragEnd() {
    draggedTaskId = null;
    dragOverColumn = null;
  }

  function handleDrop(e: DragEvent, newStatus: Task['status']) {
    e.preventDefault();
    dragOverColumn = null;
    if (draggedTaskId) {
      taskStore.updateTask(draggedTaskId, { status: newStatus });
      draggedTaskId = null;
    }
  }

  function handleKeyboard(e: KeyboardEvent, task: Task) {
    const statuses: Task['status'][] = ['todo', 'in-progress', 'done'];
    const idx = statuses.indexOf(task.status);
    if (e.key === 'ArrowRight' && idx < statuses.length - 1) {
      taskStore.updateTask(task.id, { status: statuses[idx + 1] });
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      taskStore.updateTask(task.id, { status: statuses[idx - 1] });
    }
  }
</script>

<div class="board">
  {#each columns as column}
    <div
      class="column"
      class:drag-over={dragOverColumn === column.status}
      ondragover={(e) => { e.preventDefault(); dragOverColumn = column.status; }}
      ondragleave={() => dragOverColumn = null}
      ondrop={(e) => handleDrop(e, column.status)}
    >
      <div class="column-header">
        <h2>{column.title}</h2>
        <span class="count">{column.tasks.length}</span>
      </div>

      <div class="card-list">
        {#each column.tasks as task (task.id)}
          <div
            class="task-card"
            class:dragging={draggedTaskId === task.id}
            draggable="true"
            tabindex="0"
            ondragstart={(e) => handleDragStart(e, task)}
            ondragend={handleDragEnd}
            onkeydown={(e) => handleKeyboard(e, task)}
          >
            <h3>{task.title}</h3>
            {#if task.description}
              <p class="desc">{task.description}</p>
            {/if}
            <div class="meta">
              <span class="badge priority-{task.priority}">{task.priority}</span>
              {#if task.dueDate}
                <span class="due">Due: {task.dueDate}</span>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}
</div>

<style>
  .board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    min-height: 500px;
  }

  .column {
    background: #f8fafc;
    border-radius: 8px;
    padding: 1rem;
    border: 2px solid transparent;
    transition: border-color 0.15s, background 0.15s;
  }

  .column.drag-over {
    background: #eff6ff;
    border-color: #6366f1;
  }

  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .column-header h2 {
    margin: 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.025em;
  }

  .count {
    background: #e2e8f0;
    color: #475569;
    padding: 0.1rem 0.5rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.75rem;
    cursor: grab;
    transition: opacity 0.15s, box-shadow 0.15s;
  }

  .task-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .task-card.dragging {
    opacity: 0.4;
  }

  .task-card:focus {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }

  .task-card h3 {
    margin: 0;
    font-size: 0.9rem;
    color: #1e293b;
  }

  .desc {
    margin: 0.3rem 0 0;
    font-size: 0.8rem;
    color: #64748b;
    line-height: 1.3;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
  }

  .badge {
    padding: 0.1rem 0.4rem;
    border-radius: 8px;
    font-size: 0.65rem;
    font-weight: 600;
  }

  .priority-high { background: #fef2f2; color: #dc2626; }
  .priority-medium { background: #fffbeb; color: #d97706; }
  .priority-low { background: #f0fdf4; color: #16a34a; }

  .due {
    font-size: 0.7rem;
    color: #94a3b8;
  }
</style>`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import KanbanBoard from './KanbanBoard.svelte';
</script>

<div class="app">
  <h1>Kanban Board</h1>
  <KanbanBoard />
</div>

<style>
  .app {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
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
		},
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { Task } from './types';

function createTaskStore() {
  let tasks = $state<Task[]>([
    { id: '1', title: 'Set up project', description: 'Initialize the codebase.', status: 'todo', priority: 'high', createdAt: '2025-11-01', dueDate: '2025-11-05' },
    { id: '2', title: 'Design components', description: 'Plan the component tree.', status: 'todo', priority: 'medium', createdAt: '2025-11-02', dueDate: '2025-11-10' },
    { id: '3', title: 'Write tests', description: 'Add test coverage.', status: 'in-progress', priority: 'high', createdAt: '2025-11-03', dueDate: '2025-11-15' },
    { id: '4', title: 'Deploy v1', description: 'Ship first version.', status: 'in-progress', priority: 'medium', createdAt: '2025-11-04', dueDate: '2025-11-20' },
    { id: '5', title: 'Fix login bug', description: 'Session issue.', status: 'done', priority: 'high', createdAt: '2025-11-05', dueDate: '2025-11-08' },
    { id: '6', title: 'Update README', description: 'Add usage docs.', status: 'done', priority: 'low', createdAt: '2025-11-06', dueDate: '2025-11-12' },
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
			id: 'cp-dnd-columns',
			description: 'Create $derived columns that group tasks by status for the Kanban layout',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$derived' },
						{ type: 'contains', value: 'columns' },
						{ type: 'contains', value: 'filter' }
					]
				}
			},
			hints: [
				'Create a `$derived` array of column objects, each with a status, title, and filtered tasks array.',
				'Filter `taskStore.tasks` by status for each column: `tasks: taskStore.tasks.filter(t => t.status === \'todo\')`.',
				'Use `let columns = $derived([{ status: \'todo\', title: \'Todo\', tasks: taskStore.tasks.filter(t => t.status === \'todo\') }, { status: \'in-progress\', ... }, { status: \'done\', ... }])`.'
			],
			conceptsTested: ['svelte5.runes.derived']
		},
		{
			id: 'cp-dnd-handlers',
			description: 'Implement drag event handlers for cross-column task movement',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'ondragstart' },
						{ type: 'contains', value: 'ondrop' },
						{ type: 'contains', value: 'draggedTaskId' }
					]
				}
			},
			hints: [
				'Create `handleDragStart` that sets `draggedTaskId` and `e.dataTransfer.setData()`, and `handleDrop` that calls `taskStore.updateTask()`.',
				'On drop target columns, add `ondragover={(e) => e.preventDefault()}` to allow dropping.',
				'The drop handler should read `draggedTaskId`, call `taskStore.updateTask(draggedTaskId, { status: newStatus })`, then reset `draggedTaskId = null`.'
			],
			conceptsTested: ['svelte5.events.drag']
		},
		{
			id: 'cp-dnd-feedback',
			description: 'Add visual feedback with reactive CSS classes for dragging and drop targets',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'class:dragging' },
						{ type: 'contains', value: 'class:drag-over' },
						{ type: 'contains', value: 'draggable' }
					]
				}
			},
			hints: [
				'Add `draggable="true"` to task cards and `class:dragging={draggedTaskId === task.id}` for opacity change.',
				'Track `dragOverColumn` with `$state` and apply `class:drag-over={dragOverColumn === column.status}` to columns.',
				'Style `.task-card.dragging { opacity: 0.4; }` and `.column.drag-over { background: #eff6ff; border-color: #6366f1; }` for clear visual feedback.'
			],
			conceptsTested: ['svelte5.runes.state']
		}
	]
};
