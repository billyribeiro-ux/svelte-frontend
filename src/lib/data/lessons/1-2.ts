import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-2',
		title: 'Arrays: Lists of Things',
		phase: 1,
		module: 1,
		lessonIndex: 2
	},
	description: `Arrays let you store ordered lists of data — todo items, user names, product prices, anything. In Svelte 5, reactive arrays created with $state have deep reactivity, meaning methods like .push() and .pop() automatically trigger UI updates.

In this lesson, you'll create arrays, modify them with push/pop, display them with {#each}, and see how Svelte 5's deep reactivity makes array manipulation seamless.`,
	objectives: [
		'Create and initialize arrays with $state',
		'Use .push() and .pop() to modify arrays reactively',
		'Iterate over arrays with {#each} blocks',
		'Understand that Svelte 5 $state arrays have deep reactivity'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let fruits = $state(['Apple', 'Banana', 'Cherry']);
  let newFruit = $state('');

  // Svelte 5 deep reactivity: .push() and .pop() just work!
  function addFruit() {
    if (newFruit.trim()) {
      fruits.push(newFruit.trim());
      newFruit = '';
    }
  }

  function removeLast() {
    fruits.pop();
  }

  function removeAt(index) {
    fruits.splice(index, 1);
  }

  // A list of objects — more realistic
  let todos = $state([
    { id: 1, text: 'Learn Svelte', done: true },
    { id: 2, text: 'Build something cool', done: false },
    { id: 3, text: 'Ship it', done: false }
  ]);

  let nextId = $state(4);

  function addTodo() {
    todos.push({ id: nextId, text: 'New todo', done: false });
    nextId += 1;
  }

  function toggleTodo(todo) {
    todo.done = !todo.done;
  }

  const completedCount = $derived(todos.filter(t => t.done).length);
</script>

<h1>Arrays: Lists of Things</h1>

<section>
  <h2>Simple Array ({fruits.length} fruits)</h2>
  <div class="input-row">
    <input bind:value={newFruit} placeholder="Add a fruit..." onkeydown={(e) => e.key === 'Enter' && addFruit()} />
    <button onclick={addFruit}>Add</button>
    <button onclick={removeLast} disabled={fruits.length === 0}>Remove Last</button>
  </div>
  <ul>
    {#each fruits as fruit, i}
      <li>
        {fruit}
        <button class="remove" onclick={() => removeAt(i)}>x</button>
      </li>
    {:else}
      <li class="empty">No fruits! Add some above.</li>
    {/each}
  </ul>
</section>

<section>
  <h2>Todo List ({completedCount}/{todos.length} done)</h2>
  <button onclick={addTodo}>Add Todo</button>
  <ul>
    {#each todos as todo (todo.id)}
      <li class:done={todo.done}>
        <label>
          <input type="checkbox" checked={todo.done} onchange={() => toggleTodo(todo)} />
          {todo.text}
        </label>
      </li>
    {/each}
  </ul>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  .input-row { display: flex; gap: 8px; margin-bottom: 8px; }
  input[type="text"], input:not([type]) {
    padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; flex: 1;
  }
  ul { list-style: none; padding: 0; }
  li { padding: 6px 8px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: space-between; }
  li.done { text-decoration: line-through; opacity: 0.6; }
  .empty { color: #999; font-style: italic; }
  .remove {
    background: none; border: none; color: #f44747; cursor: pointer;
    font-size: 14px; padding: 2px 6px;
  }
  label { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
