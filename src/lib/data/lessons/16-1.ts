import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '16-1',
		title: 'Classes with $state Fields',
		phase: 5,
		module: 16,
		lessonIndex: 1
	},
	description: `Svelte 5's runes work seamlessly inside JavaScript classes, enabling you to create reactive class instances. When you declare a class field with $state(), that field becomes reactive — any component reading it will update when the value changes.

This pattern is powerful for modelling domain objects with encapsulated reactive state and methods. A Todo class can have a reactive done field and a toggle method, and Svelte will track all reads and writes automatically. Class instances behave just like any other reactive state — they work with $derived, $effect, and bind: directives.`,
	objectives: [
		'Declare reactive class fields using $state() in class definitions',
		'Create class methods that mutate reactive state',
		'Use $derived inside classes for computed properties',
		'Integrate reactive class instances with Svelte component templates'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  class Todo {
    text: string = $state('');
    done: boolean = $state(false);
    createdAt: Date;

    // $derived works in classes too
    status: string = $derived(this.done ? 'Complete' : 'Pending');

    constructor(text: string) {
      this.text = text;
      this.createdAt = new Date();
    }

    toggle(): void {
      this.done = !this.done;
    }
  }

  class TodoList {
    items: Todo[] = $state([]);
    filter: 'all' | 'active' | 'done' = $state('all');

    total: number = $derived(this.items.length);
    completed: number = $derived(this.items.filter((t) => t.done).length);
    remaining: number = $derived(this.total - this.completed);
    progress: number = $derived(this.total > 0 ? Math.round((this.completed / this.total) * 100) : 0);

    filtered: Todo[] = $derived.by(() => {
      switch (this.filter) {
        case 'active': return this.items.filter((t) => !t.done);
        case 'done': return this.items.filter((t) => t.done);
        default: return this.items;
      }
    });

    add(text: string): void {
      if (text.trim()) {
        this.items = [...this.items, new Todo(text.trim())];
      }
    }

    remove(todo: Todo): void {
      this.items = this.items.filter((t) => t !== todo);
    }

    clearCompleted(): void {
      this.items = this.items.filter((t) => !t.done);
    }
  }

  const list = new TodoList();
  let newTodoText: string = $state('');

  function handleAdd(): void {
    list.add(newTodoText);
    newTodoText = '';
  }
</script>

<h1>Reactive Classes</h1>

<div class="progress-bar">
  <div class="fill" style="width: {list.progress}%"></div>
</div>
<p class="stats">
  {list.completed}/{list.total} completed ({list.progress}%) — {list.remaining} remaining
</p>

<div class="add-row">
  <input
    bind:value={newTodoText}
    placeholder="Add a todo..."
    onkeydown={(e) => e.key === 'Enter' && handleAdd()}
  />
  <button onclick={handleAdd}>Add</button>
</div>

<div class="filters">
  {#each ['all', 'active', 'done'] as f}
    <button
      class:active={list.filter === f}
      onclick={() => list.filter = f as typeof list.filter}
    >
      {f}
    </button>
  {/each}
  <button class="clear" onclick={() => list.clearCompleted()} disabled={list.completed === 0}>
    Clear Done
  </button>
</div>

<ul class="todo-list">
  {#each list.filtered as todo (todo)}
    <li class:done={todo.done}>
      <label>
        <input type="checkbox" checked={todo.done} onchange={() => todo.toggle()} />
        <span class="text">{todo.text}</span>
      </label>
      <span class="meta">{todo.status} — {todo.createdAt.toLocaleTimeString()}</span>
      <button class="remove" onclick={() => list.remove(todo)}>&#10005;</button>
    </li>
  {/each}
</ul>

{#if list.filtered.length === 0}
  <p class="empty">
    {list.filter === 'all' ? 'No todos yet.' : \`No \${list.filter} todos.\`}
  </p>
{/if}

<style>
  h1 { color: #2d3436; }
  .progress-bar {
    height: 8px; background: #dfe6e9; border-radius: 4px;
    overflow: hidden; margin-bottom: 0.25rem;
  }
  .fill { height: 100%; background: #00b894; transition: width 0.3s; }
  .stats { font-size: 0.85rem; color: #636e72; margin-bottom: 1rem; }
  .add-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .add-row input {
    flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;
  }
  .filters { display: flex; gap: 0.25rem; margin-bottom: 1rem; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #dfe6e9; color: #2d3436; cursor: pointer; font-weight: 600;
  }
  button.active, .add-row button { background: #00b894; color: white; }
  button:hover { opacity: 0.9; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
  .clear { margin-left: auto; background: #ff7675; color: white; }
  .todo-list { list-style: none; padding: 0; margin: 0; }
  .todo-list li {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.6rem 0.75rem; border-bottom: 1px solid #eee;
  }
  .todo-list li.done { opacity: 0.6; }
  .todo-list li.done .text { text-decoration: line-through; }
  label { display: flex; align-items: center; gap: 0.5rem; flex: 1; cursor: pointer; }
  .meta { font-size: 0.75rem; color: #b2bec3; white-space: nowrap; }
  .remove {
    padding: 0.2rem 0.4rem; background: transparent; color: #ff7675;
    font-size: 0.9rem;
  }
  .empty { text-align: center; color: #b2bec3; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
