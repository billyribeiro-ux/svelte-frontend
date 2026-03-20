import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-4',
		title: 'List Rendering: {#each}',
		phase: 1,
		module: 2,
		lessonIndex: 4
	},
	description: `When you have a list of data, Svelte's {#each} block renders a piece of markup for every item. Keyed each blocks — using (item.id) — help Svelte efficiently update the DOM when items are added, removed, or reordered.

This lesson covers basic iteration, keyed each, the {:else} fallback for empty lists, and the index variable.`,
	objectives: [
		'Render lists of data with {#each} blocks',
		'Use keyed iteration with (item.id) for efficient updates',
		'Handle empty lists with {:else} and use the index variable'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Simple list
  let colors = $state(['Red', 'Green', 'Blue', 'Purple', 'Orange']);

  // Keyed list with objects
  let tasks = $state([
    { id: 1, text: 'Design mockups', priority: 'high' },
    { id: 2, text: 'Write components', priority: 'medium' },
    { id: 3, text: 'Add tests', priority: 'low' },
    { id: 4, text: 'Deploy app', priority: 'high' }
  ]);

  let nextId = $state(5);
  let newTask = $state('');
  let newPriority = $state('medium');

  function addTask() {
    if (newTask.trim()) {
      tasks.push({ id: nextId, text: newTask.trim(), priority: newPriority });
      nextId += 1;
      newTask = '';
    }
  }

  function removeTask(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) tasks.splice(index, 1);
  }

  function clearAll() {
    tasks.length = 0;
  }

  function getPriorityColor(priority) {
    if (priority === 'high') return '#f44747';
    if (priority === 'medium') return '#dcdcaa';
    return '#4ec9b0';
  }
</script>

<h1>List Rendering: {'{#each}'}</h1>

<section>
  <h2>Basic {'{#each}'} with Index</h2>
  <ol>
    {#each colors as color, i}
      <li>{i + 1}. <span style="color: {color.toLowerCase()}">{color}</span></li>
    {/each}
  </ol>
</section>

<section>
  <h2>Keyed {'{#each}'} with (item.id)</h2>
  <div class="input-row">
    <input bind:value={newTask} placeholder="New task..." onkeydown={(e) => e.key === 'Enter' && addTask()} />
    <select bind:value={newPriority}>
      <option value="high">High</option>
      <option value="medium">Medium</option>
      <option value="low">Low</option>
    </select>
    <button onclick={addTask}>Add</button>
    <button onclick={clearAll} class="danger">Clear All</button>
  </div>

  <ul class="task-list">
    {#each tasks as task (task.id)}
      <li>
        <span class="dot" style="background: {getPriorityColor(task.priority)}"></span>
        <span class="task-text">{task.text}</span>
        <span class="priority">{task.priority}</span>
        <button class="remove" onclick={() => removeTask(task.id)}>x</button>
      </li>
    {:else}
      <li class="empty">No tasks! Add one above.</li>
    {/each}
  </ul>
</section>

<section>
  <h2>Fixed-Length Iteration</h2>
  <p>Need to repeat something N times without an array? Use <code>{'{#each {length: N}, i}'}</code>:</p>
  <div class="stars">
    {#each {length: 5}, i}
      <span class="star">{i + 1}</span>
    {/each}
  </div>
</section>

<section>
  <h2>Why Keys Matter</h2>
  <p>Keys like <code>(task.id)</code> tell Svelte which DOM elements correspond to which data items. Without keys, reordering or removing items can cause visual glitches.</p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
  ol { padding-left: 20px; }
  li { color: #444; font-size: 14px; padding: 2px 0; }
  .input-row { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
  input { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; flex: 1; }
  select { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  .task-list { list-style: none; padding: 0; }
  .task-list li {
    display: flex; align-items: center; gap: 8px; padding: 8px;
    border-bottom: 1px solid #eee;
  }
  .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .task-text { flex: 1; }
  .priority { font-size: 11px; color: #999; text-transform: uppercase; }
  .empty { color: #999; font-style: italic; justify-content: center; }
  .remove { background: none; border: none; color: #f44747; cursor: pointer; font-size: 14px; padding: 2px 6px; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { background: #ff3e00; color: white; }
  .danger { border-color: #f44747; color: #f44747; }
  .danger:hover { background: #f44747; color: white; }
  .stars { display: flex; gap: 8px; margin-top: 8px; }
  .star { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #ff3e00; color: white; border-radius: 50%; font-size: 14px; font-weight: 600; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
