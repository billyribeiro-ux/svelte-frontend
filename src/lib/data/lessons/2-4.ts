import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-4',
		title: 'List Rendering: {#each}',
		phase: 1,
		module: 2,
		lessonIndex: 4
	},
	description: `Arrays are everywhere in apps — products, comments, notifications, users, songs, messages. You need a way to render a piece of UI for each item. Svelte's \`{#each}\` block does exactly that: give it an array and a template, and it renders the template once per item.

The basic form is \`{#each items as item}\`. Add an index with \`{#each items as item, i}\`. Handle the empty case with \`{:else}\`. And for anything more than a trivial list, **use keys**: \`{#each items as item (item.id)}\` tells Svelte how to match DOM elements to data items, which is essential when items are added, removed, or reordered.

Why keys matter: without a key, Svelte matches items by position. If you delete the first item, Svelte sees "same item in slot 0, same item in slot 1, one fewer slot". It might update every slot instead of removing the first one. With a key, Svelte recognizes "this item still exists, it just moved" — and the DOM update is precise and fast. With keys, focus and input state also stay with the right item during reorders.

In this lesson you'll iterate strings, objects, and nested arrays; filter and sort a live list; render a leaderboard with rank badges; and see exactly when keys rescue you from visual glitches.

A "Try It Yourself" section at the bottom gives you three hands-on challenges to practice what you just learned.`,
	objectives: [
		'Render lists of data with {#each} blocks',
		'Use keyed iteration with (item.id) for correct & efficient updates',
		'Handle empty lists with {:else} fallback',
		'Use the index variable for numbering and alternating styles',
		'Filter and sort arrays reactively with $derived',
		'Iterate a fixed number of times with {#each {length: N}}'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // EXAMPLE 1 — Basic each over a string array, with index
  // ============================================================
  let colors = $state(['Red', 'Green', 'Blue', 'Purple', 'Orange']);

  function shuffleColors() {
    colors = [...colors].sort(() => Math.random() - 0.5);
  }

  // ============================================================
  // EXAMPLE 2 — Keyed each with add / remove / filter
  // ------------------------------------------------------------
  // Each task has an id, which we use as the key. That lets
  // Svelte efficiently update when tasks are added/removed.
  // ============================================================
  let tasks = $state([
    { id: 1, text: 'Design mockups',   priority: 'high',   done: false },
    { id: 2, text: 'Write components', priority: 'medium', done: true  },
    { id: 3, text: 'Add tests',        priority: 'low',    done: false },
    { id: 4, text: 'Deploy app',       priority: 'high',   done: false }
  ]);

  let nextId = $state(5);
  let newTask = $state('');
  let newPriority = $state('medium');
  let filter = $state('all'); // all | active | done

  function addTask() {
    if (newTask.trim()) {
      tasks.push({ id: nextId, text: newTask.trim(), priority: newPriority, done: false });
      nextId += 1;
      newTask = '';
    }
  }

  function toggleDone(task) { task.done = !task.done; }
  function removeTask(id) {
    const i = tasks.findIndex(t => t.id === id);
    if (i !== -1) tasks.splice(i, 1);
  }
  function clearAll() { tasks.length = 0; }

  // Derived: filter the tasks based on the filter state
  const visibleTasks = $derived(
    filter === 'all' ? tasks :
    filter === 'active' ? tasks.filter(t => !t.done) :
    tasks.filter(t => t.done)
  );

  function priorityColor(p) {
    if (p === 'high') return '#f44747';
    if (p === 'medium') return '#dcdcaa';
    return '#4ec9b0';
  }

  // ============================================================
  // EXAMPLE 3 — Sorted leaderboard
  // ------------------------------------------------------------
  // The source array is unordered. A $derived creates a
  // sorted copy without mutating the original.
  // ============================================================
  let players = $state([
    { id: 'a', name: 'Alice',  score: 42 },
    { id: 'b', name: 'Bob',    score: 71 },
    { id: 'c', name: 'Carol',  score: 58 },
    { id: 'd', name: 'Dan',    score: 89 },
    { id: 'e', name: 'Eve',    score: 65 }
  ]);

  const leaderboard = $derived(
    [...players].sort((a, b) => b.score - a.score)
  );

  function randomizeScores() {
    players = players.map(p => ({ ...p, score: Math.floor(Math.random() * 100) }));
  }

  function medal(rank) {
    if (rank === 0) return 'gold';
    if (rank === 1) return 'silver';
    if (rank === 2) return 'bronze';
    return '';
  }

  // ============================================================
  // EXAMPLE 4 — Fixed-length iteration (no array needed)
  // ============================================================
  let rating = $state(3);
</script>

<h1>List Rendering: {'{#each}'}</h1>

<section>
  <h2>1. Basic {'{#each}'} with Index</h2>
  <button onclick={shuffleColors}>Shuffle</button>
  <ol>
    {#each colors as color, i (color)}
      <li>
        <span class="rank">{i + 1}.</span>
        <span style="color: {color.toLowerCase()}; font-weight: 600;">{color}</span>
      </li>
    {/each}
  </ol>
</section>

<section>
  <h2>2. Keyed Task List (add / remove / filter)</h2>
  <div class="input-row">
    <input
      bind:value={newTask}
      placeholder="New task..."
      onkeydown={(e) => e.key === 'Enter' && addTask()}
    />
    <select bind:value={newPriority}>
      <option value="high">High</option>
      <option value="medium">Medium</option>
      <option value="low">Low</option>
    </select>
    <button onclick={addTask}>Add</button>
    <button onclick={clearAll} class="danger">Clear</button>
  </div>

  <div class="filters">
    <button class:active={filter === 'all'}    onclick={() => filter = 'all'}>All ({tasks.length})</button>
    <button class:active={filter === 'active'} onclick={() => filter = 'active'}>Active ({tasks.filter(t => !t.done).length})</button>
    <button class:active={filter === 'done'}   onclick={() => filter = 'done'}>Done ({tasks.filter(t => t.done).length})</button>
  </div>

  <ul class="task-list">
    {#each visibleTasks as task (task.id)}
      <li class:done={task.done}>
        <input type="checkbox" checked={task.done} onchange={() => toggleDone(task)} />
        <span class="dot" style="background: {priorityColor(task.priority)}"></span>
        <span class="text">{task.text}</span>
        <span class="priority">{task.priority}</span>
        <button class="remove" onclick={() => removeTask(task.id)}>x</button>
      </li>
    {:else}
      <li class="empty">No tasks match this filter.</li>
    {/each}
  </ul>
</section>

<section>
  <h2>3. Sorted Leaderboard</h2>
  <button onclick={randomizeScores}>Randomize Scores</button>
  <ol class="leaderboard">
    {#each leaderboard as player, i (player.id)}
      <li class="player {medal(i)}">
        <span class="rank">#{i + 1}</span>
        <span class="name">{player.name}</span>
        <span class="score">{player.score}</span>
      </li>
    {/each}
  </ol>
  <p class="note">
    The <code>players</code> array isn't mutated — a <code>$derived</code>
    creates a sorted copy. Keys (<code>player.id</code>) let Svelte animate
    items moving between positions if you add transitions later.
  </p>
</section>

<section>
  <h2>4. Fixed-Length Iteration</h2>
  <p>Click a star to rate:</p>
  <div class="stars">
    {#each {length: 5}, i}
      <button class="star" class:filled={i < rating} onclick={() => rating = i + 1}>
        ★
      </button>
    {/each}
  </div>
  <p>Rating: <strong>{rating} / 5</strong></p>
  <p class="note">
    <code>{'{#each {length: N}, i}'}</code> lets you repeat a block N
    times without needing a real array.
  </p>
</section>

<section class="practice">
  <h2>Try It Yourself</h2>
  <p class="intro">Edit the code above to add these features. Answers are at the bottom of the lesson (but resist peeking!)</p>
  <ol>
    <li>
      <strong>1.</strong> Show an "Active tasks: N" counter in the task list header using a <code>$derived</code>.
      <span class="hint">Hint: <code>$derived(tasks.filter(t =&gt; !t.done).length)</code>.</span>
    </li>
    <li>
      <strong>2.</strong> Sort the task list so <code>high</code> priority items come first, then <code>medium</code>, then <code>low</code>.
      <span class="hint">Hint: add a <code>$derived</code> that returns <code>[...visibleTasks].sort((a, b) =&gt; order[a.priority] - order[b.priority])</code> with an order map.</span>
    </li>
    <li>
      <strong>3.</strong> Add a "Promote to high" button on each medium/low task that flips its priority — see keyed <code>{'{#each}'}</code> keep focus on the right row.
      <span class="hint">Hint: mutate <code>task.priority = 'high'</code> directly; deep reactivity handles the rest.</span>
    </li>
  </ol>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 24px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
  .note { color: #999; font-size: 12px; font-style: italic; }
  ol { padding-left: 24px; }
  ol li { color: #444; font-size: 14px; padding: 2px 0; }
  .rank { color: #999; margin-right: 4px; }
  .input-row { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
  input { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; flex: 1; min-width: 140px; }
  select { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  .filters { display: flex; gap: 6px; margin-bottom: 8px; }
  .filters button { padding: 4px 12px; font-size: 12px; border-color: #ddd; color: #666; }
  .filters button.active { background: #ff3e00; border-color: #ff3e00; color: white; }
  .task-list { list-style: none; padding: 0; }
  .task-list li {
    display: flex; align-items: center; gap: 8px; padding: 8px;
    border-bottom: 1px solid #eee;
  }
  .task-list li.done .text { text-decoration: line-through; opacity: 0.55; }
  .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .text { flex: 1; }
  .priority { font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
  .empty { color: #999; font-style: italic; justify-content: center; }
  .remove {
    background: none; border: none; color: #f44747;
    cursor: pointer; font-size: 14px; padding: 2px 8px;
  }
  .remove:hover { background: #f44747; color: white; border-radius: 4px; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  .danger { border-color: #f44747; color: #f44747; }
  .danger:hover { background: #f44747; color: white; }
  .leaderboard { list-style: none; padding: 0; }
  .player {
    display: grid; grid-template-columns: 60px 1fr 80px;
    padding: 8px 12px; margin: 4px 0; border-radius: 6px;
    background: #f8f8f8; font-size: 14px;
    border-left: 4px solid transparent;
  }
  .player .name { color: #222; font-weight: 600; }
  .player .score { text-align: right; color: #ff3e00; font-weight: 700; }
  .player.gold   { background: #fff7d6; border-left-color: #d4af37; }
  .player.silver { background: #f4f4f4; border-left-color: #c0c0c0; }
  .player.bronze { background: #fbf0e4; border-left-color: #cd7f32; }
  .stars { display: flex; gap: 4px; }
  .star {
    border: none; background: none; font-size: 28px;
    color: #ddd; cursor: pointer; padding: 0;
  }
  .star.filled { color: #ffc107; }
  .star:hover { color: #ffc107; }
  .practice {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    margin-top: 1.5rem;
  }
  .practice h2 { color: #1e3a8a; margin: 0 0 0.5rem; font-size: 1rem; border: none; padding: 0; }
  .practice .intro { font-size: 0.88rem; color: #1e40af; margin-bottom: 0.75rem; }
  .practice ol { padding-left: 1.25rem; margin: 0; }
  .practice li { padding: 0.4rem 0; font-size: 0.85rem; color: #1e3a8a; }
  .practice .hint {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #475569;
    font-style: italic;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
