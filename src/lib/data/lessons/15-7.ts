import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-7',
		title: 'animate:flip & List Reordering',
		phase: 5,
		module: 15,
		lessonIndex: 7
	},
	description: `When items in a keyed each block change position, Svelte's animate:flip directive smoothly tweens them from their old position to their new one. FLIP stands for First, Last, Invert, Play — a technique that measures where elements were before the update, measures where they are now, applies an inverse transform, then animates back to zero.

Combined with in:/out: transitions, animate:flip produces polished list interactions: items slide into place when reordered, fade in when added, slide out when removed, and filter changes animate naturally. It's the foundation for sortable lists, drag-and-drop reordering, priority queues, and any list where order is dynamic.`,
	objectives: [
		'Apply animate:flip to keyed each blocks for smooth reordering',
		'Combine animate:flip with in:/out: for complete list animations',
		'Build a drag-to-reorder list with animated position changes',
		'Animate filter and sort changes with no flicker'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade, fly, scale } from 'svelte/transition';
  import { quintOut, backOut } from 'svelte/easing';

  interface Task {
    id: number;
    text: string;
    priority: 'high' | 'medium' | 'low';
    tag: 'work' | 'personal' | 'urgent';
    done: boolean;
  }

  let nextId: number = $state(9);
  let newTask: string = $state('');
  let draggedId: number | null = $state(null);
  let filter: 'all' | 'work' | 'personal' | 'urgent' | 'open' | 'done' = $state('all');

  let tasks: Task[] = $state([
    { id: 1, text: 'Review pull requests', priority: 'high', tag: 'work', done: false },
    { id: 2, text: 'Write the new docs section', priority: 'medium', tag: 'work', done: false },
    { id: 3, text: 'Fix login race condition', priority: 'high', tag: 'urgent', done: false },
    { id: 4, text: 'Update dependencies', priority: 'low', tag: 'work', done: true },
    { id: 5, text: 'Call the plumber', priority: 'medium', tag: 'personal', done: false },
    { id: 6, text: 'Renew gym membership', priority: 'low', tag: 'personal', done: false },
    { id: 7, text: 'Design new dashboard', priority: 'medium', tag: 'work', done: false },
    { id: 8, text: 'Respond to customer ticket #4821', priority: 'high', tag: 'urgent', done: false }
  ]);

  let visibleTasks = $derived(
    tasks.filter((t) => {
      if (filter === 'all') return true;
      if (filter === 'open') return !t.done;
      if (filter === 'done') return t.done;
      return t.tag === filter;
    })
  );

  function addTask(): void {
    if (newTask.trim()) {
      tasks = [
        { id: nextId++, text: newTask.trim(), priority: 'medium', tag: 'work', done: false },
        ...tasks
      ];
      newTask = '';
    }
  }

  function removeTask(id: number): void {
    tasks = tasks.filter((t) => t.id !== id);
  }

  function toggleDone(id: number): void {
    tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }

  function moveUp(id: number): void {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx <= 0) return;
    const updated = [...tasks];
    [updated[idx - 1], updated[idx]] = [updated[idx], updated[idx - 1]];
    tasks = updated;
  }

  function moveDown(id: number): void {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1 || idx >= tasks.length - 1) return;
    const updated = [...tasks];
    [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
    tasks = updated;
  }

  function sortByPriority(): void {
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    tasks = [...tasks].sort((a, b) => order[a.priority] - order[b.priority]);
  }

  function sortByStatus(): void {
    tasks = [...tasks].sort((a, b) => Number(a.done) - Number(b.done));
  }

  function shuffle(): void {
    const s = [...tasks];
    for (let i = s.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [s[i], s[j]] = [s[j], s[i]];
    }
    tasks = s;
  }

  function reverse(): void {
    tasks = [...tasks].reverse();
  }

  // Drag and drop
  function handleDragStart(id: number): void {
    draggedId = id;
  }

  function handleDragOver(e: DragEvent, overId: number): void {
    e.preventDefault();
    if (draggedId === null || draggedId === overId) return;
    const fromIdx = tasks.findIndex((t) => t.id === draggedId);
    const toIdx = tasks.findIndex((t) => t.id === overId);
    if (fromIdx === -1 || toIdx === -1) return;
    const updated = [...tasks];
    const [item] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, item);
    tasks = updated;
  }

  function handleDragEnd(): void {
    draggedId = null;
  }

  const priorityColor = { high: '#d63031', medium: '#fdcb6e', low: '#74b9ff' };
  const tagColor = { work: '#6c5ce7', personal: '#00b894', urgent: '#e17055' };
</script>

<h1>animate:flip — Smooth List Reordering</h1>

<div class="toolbar">
  <button onclick={sortByPriority}>Sort by priority</button>
  <button onclick={sortByStatus}>Sort by status</button>
  <button onclick={shuffle}>Shuffle</button>
  <button onclick={reverse}>Reverse</button>
</div>

<div class="filters">
  <span>Filter:</span>
  {#each ['all', 'open', 'done', 'work', 'personal', 'urgent'] as f (f)}
    <button
      class:active={filter === f}
      onclick={() => filter = f as typeof filter}
    >
      {f}
    </button>
  {/each}
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
  {#each visibleTasks as task (task.id)}
    <li
      class:dragging={draggedId === task.id}
      class:done={task.done}
      draggable="true"
      ondragstart={() => handleDragStart(task.id)}
      ondragover={(e) => handleDragOver(e, task.id)}
      ondragend={handleDragEnd}
      animate:flip={{ duration: 400, easing: quintOut }}
      in:fly={{ x: -40, duration: 300, easing: backOut }}
      out:scale={{ duration: 250, start: 0.7 }}
    >
      <input
        type="checkbox"
        checked={task.done}
        onchange={() => toggleDone(task.id)}
        aria-label="Mark done"
      />
      <span class="dot" style="background: {priorityColor[task.priority]}"></span>
      <span class="text">{task.text}</span>
      <span class="tag" style="background: {tagColor[task.tag]}">{task.tag}</span>
      <span class="priority">{task.priority}</span>
      <div class="actions">
        <button class="mini" onclick={() => moveUp(task.id)}>&uarr;</button>
        <button class="mini" onclick={() => moveDown(task.id)}>&darr;</button>
        <button class="mini remove" onclick={() => removeTask(task.id)}>&times;</button>
      </div>
    </li>
  {/each}
</ul>

{#if visibleTasks.length === 0}
  <p class="empty" transition:fade>No tasks match the current filter.</p>
{/if}

<p class="hint">
  Tip: drag any row to reorder. Every transition you see — reorder, filter,
  add, remove, sort — runs through <code>animate:flip</code>.
</p>

<style>
  h1 { color: #2d3436; }
  .toolbar, .filters, .add-row { display: flex; gap: 0.4rem; margin-bottom: 0.6rem; align-items: center; flex-wrap: wrap; }
  .filters span { font-size: 0.85rem; color: #636e72; margin-right: 0.25rem; }
  .add-row input { flex: 1; min-width: 200px; padding: 0.55rem; border: 1px solid #dfe6e9; border-radius: 6px; }

  button {
    padding: 0.45rem 0.85rem; border: none; border-radius: 6px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600; font-size: 0.82rem;
  }
  button:hover { background: #5a4bd1; }
  .filters button { background: white; color: #636e72; border: 1px solid #dfe6e9; }
  .filters button.active { background: #6c5ce7; color: white; border-color: #6c5ce7; }
  .mini { padding: 0.2rem 0.5rem; font-size: 0.8rem; background: #dfe6e9; color: #2d3436; }
  .mini:hover { background: #b2bec3; }
  .mini.remove { background: #ff7675; color: white; }

  .task-list { list-style: none; padding: 0; margin: 0; }
  .task-list li {
    display: flex; align-items: center; gap: 0.6rem;
    padding: 0.6rem 0.85rem; margin-bottom: 0.35rem;
    background: white; border: 1px solid #dfe6e9; border-radius: 8px;
    cursor: grab; user-select: none;
  }
  .task-list li:active { cursor: grabbing; }
  .task-list li.dragging { opacity: 0.4; border-color: #6c5ce7; box-shadow: 0 4px 12px rgba(108,92,231,0.2); }
  .task-list li.done { opacity: 0.6; }
  .task-list li.done .text { text-decoration: line-through; color: #636e72; }
  .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .text { flex: 1; font-size: 0.9rem; }
  .tag {
    font-size: 0.68rem; padding: 0.15rem 0.45rem; border-radius: 999px;
    color: white; font-weight: 700; text-transform: uppercase;
  }
  .priority { font-size: 0.7rem; color: #636e72; text-transform: uppercase; min-width: 50px; }
  .actions { display: flex; gap: 0.2rem; }

  .empty { text-align: center; color: #b2bec3; font-style: italic; }
  .hint { font-size: 0.82rem; color: #636e72; margin-top: 1rem; }
  code { background: #eef; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
