import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-7',
		title: 'animate:flip & List Reordering',
		phase: 5,
		module: 15,
		lessonIndex: 7
	},
	description: `When items in a keyed each block change position, Svelte's animate:flip directive smoothly animates them from their old position to their new one. FLIP stands for First, Last, Invert, Play — a technique that calculates where elements were, where they are now, and animates the difference.

Combined with in: and out: transitions, animate:flip creates polished list interactions where items slide into place when reordered, fade in when added, and slide out when removed. This is essential for drag-and-drop interfaces, sortable lists, and any UI where list order changes dynamically.`,
	objectives: [
		'Apply animate:flip to smoothly animate list reordering',
		'Combine animate:flip with in: and out: transitions for complete list animations',
		'Configure flip duration and easing for natural-feeling motion',
		'Implement drag-and-drop reorder with animated position changes'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  interface Task {
    id: number;
    text: string;
    priority: 'high' | 'medium' | 'low';
  }

  let nextId: number = $state(6);
  let newTask: string = $state('');
  let draggedId: number | null = $state(null);

  let tasks: Task[] = $state([
    { id: 1, text: 'Review pull requests', priority: 'high' },
    { id: 2, text: 'Write documentation', priority: 'medium' },
    { id: 3, text: 'Fix login bug', priority: 'high' },
    { id: 4, text: 'Update dependencies', priority: 'low' },
    { id: 5, text: 'Design new dashboard', priority: 'medium' },
  ]);

  function addTask(): void {
    if (newTask.trim()) {
      tasks = [...tasks, { id: nextId++, text: newTask.trim(), priority: 'medium' }];
      newTask = '';
    }
  }

  function removeTask(id: number): void {
    tasks = tasks.filter((t) => t.id !== id);
  }

  function moveUp(index: number): void {
    if (index <= 0) return;
    const updated = [...tasks];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    tasks = updated;
  }

  function moveDown(index: number): void {
    if (index >= tasks.length - 1) return;
    const updated = [...tasks];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    tasks = updated;
  }

  function sortByPriority(): void {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    tasks = [...tasks].sort((a, b) => order[a.priority] - order[b.priority]);
  }

  function shuffle(): void {
    const shuffled = [...tasks];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    tasks = shuffled;
  }

  function handleDragStart(id: number): void {
    draggedId = id;
  }

  function handleDragOver(e: DragEvent, index: number): void {
    e.preventDefault();
    if (draggedId === null) return;
    const draggedIndex = tasks.findIndex((t) => t.id === draggedId);
    if (draggedIndex === index) return;
    const updated = [...tasks];
    const [item] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, item);
    tasks = updated;
  }

  function handleDragEnd(): void {
    draggedId = null;
  }

  const priorityColors: Record<string, string> = {
    high: '#ff7675',
    medium: '#fdcb6e',
    low: '#74b9ff',
  };
</script>

<h1>animate:flip — List Reordering</h1>

<div class="toolbar">
  <button onclick={sortByPriority}>Sort by Priority</button>
  <button onclick={shuffle}>Shuffle</button>
</div>

<div class="add-row">
  <input
    bind:value={newTask}
    placeholder="Add a task..."
    onkeydown={(e) => e.key === 'Enter' && addTask()}
  />
  <button onclick={addTask}>Add</button>
</div>

<ul class="task-list">
  {#each tasks as task, i (task.id)}
    <li
      class:dragging={draggedId === task.id}
      draggable="true"
      ondragstart={() => handleDragStart(task.id)}
      ondragover={(e) => handleDragOver(e, i)}
      ondragend={handleDragEnd}
      animate:flip={{ duration: 300, easing: quintOut }}
      in:fly={{ x: -30, duration: 250 }}
      out:fade={{ duration: 200 }}
    >
      <span
        class="priority-dot"
        style="background: {priorityColors[task.priority]}"
      ></span>
      <span class="task-text">{task.text}</span>
      <span class="priority-label">{task.priority}</span>
      <div class="actions">
        <button class="small" onclick={() => moveUp(i)} disabled={i === 0}>&#9650;</button>
        <button class="small" onclick={() => moveDown(i)} disabled={i === tasks.length - 1}>&#9660;</button>
        <button class="small remove" onclick={() => removeTask(task.id)}>&#10005;</button>
      </div>
    </li>
  {/each}
</ul>

{#if tasks.length === 0}
  <p class="empty">No tasks. Add one above!</p>
{/if}

<style>
  h1 { color: #2d3436; }
  .toolbar { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .add-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .add-row input {
    flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;
  }
  button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  button:hover { background: #5a4bd1; }
  button:disabled { background: #b2bec3; cursor: not-allowed; }
  .task-list { list-style: none; padding: 0; margin: 0; }
  .task-list li {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1rem; margin-bottom: 0.25rem;
    background: white; border: 1px solid #dfe6e9; border-radius: 6px;
    cursor: grab; user-select: none;
  }
  .task-list li.dragging { opacity: 0.5; border-color: #6c5ce7; }
  .priority-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .task-text { flex: 1; }
  .priority-label {
    font-size: 0.75rem; color: #636e72; text-transform: uppercase;
    font-weight: 600; min-width: 50px;
  }
  .actions { display: flex; gap: 0.25rem; }
  .small { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
  .remove { background: #ff7675; }
  .remove:hover { background: #d63031; }
  .empty { text-align: center; color: #b2bec3; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
