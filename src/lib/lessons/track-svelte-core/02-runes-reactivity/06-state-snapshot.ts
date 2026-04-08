import type { Lesson } from '$types/lesson';

export const stateSnapshot: Lesson = {
	id: 'svelte-core.runes.state-snapshot',
	slug: 'state-snapshot',
	title: '$state.snapshot — Capturing Reactive State',
	description:
		'Learn how to take a deep, non-reactive snapshot of $state values for undo/redo, localStorage persistence, and interoperability with non-Svelte code.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 6,
	estimatedMinutes: 20,
	concepts: ['svelte5.runes.state', 'svelte5.runes.state-snapshot'],
	prerequisites: ['svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# \`$state.snapshot\` — Capturing Reactive State

Here is a subtle but critical problem you will encounter once you start building real applications with Svelte 5.

Imagine you have a reactive todo list and you want to implement undo. The natural instinct is to save a copy of the current state before each mutation:

\`\`\`ts
let items = $state([{ text: 'Buy milk', done: false }]);

function addItem(text: string) {
  const previous = items; // ❌ WRONG — this is a reference, not a copy
  items.push({ text, done: false });
  undoStack.push(previous); // restoring this restores the reactive proxy, not a snapshot
}
\`\`\`

The issue: \`items\` in Svelte 5 is a **reactive proxy**. When you write \`const previous = items\`, you are not copying the array — you are storing a reference to the same proxy. When you push to \`items\`, \`previous\` reflects the change too, because they point to the same underlying data.

This is not a Svelte bug. It is how JavaScript references work, and it is a fundamental property of reactive proxies. You need a way to escape the proxy and get a plain JavaScript snapshot.

## \`$state.snapshot()\` — The Solution

Svelte 5 provides \`$state.snapshot()\` for exactly this purpose. It creates a **deep, non-reactive clone** of any reactive value:

\`\`\`ts
let items = $state([{ text: 'Buy milk', done: false }]);

function addItem(text: string) {
  const previous = $state.snapshot(items); // ✅ deep plain JS copy
  items.push({ text, done: false });
  undoStack.push(previous); // ✅ frozen snapshot, unaffected by future mutations
}
\`\`\`

\`$state.snapshot()\` uses \`structuredClone\` internally to produce a deep copy, but unwraps all reactive proxies in the process. The result is a pure JavaScript value — no reactivity, no proxies, no Svelte internals. You can safely pass it to:

- **localStorage** — \`JSON.stringify($state.snapshot(items))\`
- **Non-Svelte libraries** — pass to a charting library, a map SDK, a drag-and-drop library without it receiving a proxy
- **Undo stacks** — as shown above
- **Diffing** — compare current state to a saved snapshot to compute a diff
- **API calls** — \`fetch('/api/save', { body: JSON.stringify($state.snapshot(formData)) })\``
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.state'
		},
		{
			type: 'text',
			content: `## Building Undo/Redo with \`$state.snapshot\`

The most common use case is undo/redo. Here is the complete pattern:

\`\`\`svelte
<script>
  let items = $state(['Learn $state', 'Build something']);
  let undoStack = $state<string[][]>([]);
  let redoStack = $state<string[][]>([]);

  function addItem(text: string) {
    undoStack.push($state.snapshot(items)); // snapshot BEFORE mutation
    redoStack = [];                          // new action clears redo
    items.push(text);
  }

  function undo() {
    if (undoStack.length === 0) return;
    redoStack.push($state.snapshot(items));
    items = undoStack.pop()!;
  }

  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push($state.snapshot(items));
    items = redoStack.pop()!;
  }
</script>
\`\`\`

Notice the critical pattern: **snapshot BEFORE the mutation**. You want to capture the state you can revert *to*, not the state after the change.

Also note that \`undoStack\` and \`redoStack\` are themselves \`$state\` arrays. This means their length is reactive — your undo/redo buttons can be automatically disabled when there is nothing to undo or redo:

\`\`\`svelte
<button disabled={undoStack.length === 0} onclick={undo}>Undo</button>
<button disabled={redoStack.length === 0} onclick={redo}>Redo</button>
\`\`\`

## \`$state.snapshot\` vs \`structuredClone\` vs JSON

You might wonder: why not just use \`structuredClone()\` or \`JSON.parse(JSON.stringify())\`?

The answer is that **reactive proxies do not behave like plain objects** in all serialization contexts. Some deep clone utilities may not correctly traverse them, producing incomplete or corrupted copies. \`$state.snapshot()\` is specifically designed to unwrap Svelte 5's proxy wrappers before cloning.

Additionally, \`JSON.parse(JSON.stringify())\` has well-known limitations: it cannot handle \`Date\` objects, \`undefined\` values, circular references, \`Map\`, \`Set\`, or \`BigInt\`. \`$state.snapshot()\` uses \`structuredClone\` under the hood, which handles all of these correctly.

The rule is simple: **whenever you need a copy of reactive state that should not change when the original changes, use \`$state.snapshot()\`.**`
		},
		{
			type: 'checkpoint',
			content: 'cp-snapshot-undo'
		},
		{
			type: 'text',
			content: `## Passing Reactive State to External Libraries

A less obvious but equally important use of \`$state.snapshot\` is interoperability with code that does not expect a proxy.

Consider a charting library like Chart.js:

\`\`\`svelte
<script>
  import { Chart } from 'chart.js';

  let salesData = $state([120, 340, 280, 510]);

  $effect(() => {
    // ❌ Passing the proxy directly — Chart.js may not handle it correctly
    chart.data.datasets[0].data = salesData;

    // ✅ Pass a plain array — Chart.js gets a regular JavaScript array
    chart.data.datasets[0].data = $state.snapshot(salesData);
    chart.update();
  });
</script>
\`\`\`

Similarly, when submitting form data via \`fetch\`:

\`\`\`ts
let form = $state({ name: '', email: '', role: 'user' });

async function submit() {
  // $state.snapshot ensures the body is a plain JSON-serializable object
  await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify($state.snapshot(form))
  });
}
\`\`\`

And for localStorage persistence:

\`\`\`ts
$effect(() => {
  // Runs whenever anything in settings changes
  localStorage.setItem('settings', JSON.stringify($state.snapshot(settings)));
});
\`\`\``
		},
		{
			type: 'checkpoint',
			content: 'cp-snapshot-persist'
		},
		{
			type: 'xray-prompt',
			content: 'Open X-Ray and look at the Compiler Output tab. Find where `$state.snapshot` appears. Notice it compiles to a runtime call — unlike most runes that are entirely compiled away, `snapshot` has a small runtime component because it needs to unwrap proxies that only exist at runtime.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  let todos = $state([
    { id: 1, text: 'Learn $state', done: true },
    { id: 2, text: 'Learn $state.snapshot', done: false },
    { id: 3, text: 'Build an app', done: false },
  ]);

  let newText = $state('');
  let undoStack = $state([]);
  let redoStack = $state([]);

  function addTodo() {
    if (!newText.trim()) return;
    // TODO: Push a snapshot of todos to undoStack BEFORE mutating
    // TODO: Clear redoStack
    todos.push({ id: Date.now(), text: newText.trim(), done: false });
    newText = '';
  }

  function toggleTodo(id) {
    // TODO: Push snapshot before mutation
    const todo = todos.find(t => t.id === id);
    if (todo) todo.done = !todo.done;
  }

  function undo() {
    if (undoStack.length === 0) return;
    // TODO: Push current snapshot to redoStack
    // TODO: Pop from undoStack and assign to todos
  }

  function redo() {
    if (redoStack.length === 0) return;
    // TODO: Push current snapshot to undoStack
    // TODO: Pop from redoStack and assign to todos
  }
</script>

<div class="app">
  <div class="toolbar">
    <button onclick={undo} disabled={undoStack.length === 0}>↩ Undo</button>
    <button onclick={redo} disabled={redoStack.length === 0}>↪ Redo</button>
    <span class="history">History: {undoStack.length} steps</span>
  </div>

  <div class="input-row">
    <input bind:value={newText} placeholder="New todo..." onkeydown={(e) => e.key === 'Enter' && addTodo()} />
    <button onclick={addTodo} disabled={!newText.trim()}>Add</button>
  </div>

  <ul class="todos">
    {#each todos as todo (todo.id)}
      <li class="todo" class:done={todo.done} onclick={() => toggleTodo(todo.id)}>
        {todo.text}
      </li>
    {/each}
  </ul>
</div>

<style>
  .app { max-width: 480px; margin: 2rem auto; font-family: system-ui, sans-serif; }
  .toolbar { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
  .toolbar button { padding: 0.3rem 0.7rem; border: 1px solid #d1d5db; border-radius: 5px; background: white; cursor: pointer; }
  .toolbar button:disabled { opacity: 0.4; cursor: not-allowed; }
  .history { margin-left: auto; font-size: 0.75rem; color: #94a3b8; }
  .input-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .input-row input { flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 5px; }
  .input-row button { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer; }
  .todos { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .todo { padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .todo.done { text-decoration: line-through; color: #94a3b8; background: #f1f5f9; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  let todos = $state([
    { id: 1, text: 'Learn $state', done: true },
    { id: 2, text: 'Learn $state.snapshot', done: false },
    { id: 3, text: 'Build an app', done: false },
  ]);

  let newText = $state('');
  let undoStack = $state([]);
  let redoStack = $state([]);

  function addTodo() {
    if (!newText.trim()) return;
    undoStack.push($state.snapshot(todos));
    redoStack = [];
    todos.push({ id: Date.now(), text: newText.trim(), done: false });
    newText = '';
  }

  function toggleTodo(id) {
    undoStack.push($state.snapshot(todos));
    redoStack = [];
    const todo = todos.find(t => t.id === id);
    if (todo) todo.done = !todo.done;
  }

  function undo() {
    if (undoStack.length === 0) return;
    redoStack.push($state.snapshot(todos));
    todos = undoStack.pop();
  }

  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push($state.snapshot(todos));
    todos = redoStack.pop();
  }
</script>

<div class="app">
  <div class="toolbar">
    <button onclick={undo} disabled={undoStack.length === 0}>↩ Undo</button>
    <button onclick={redo} disabled={redoStack.length === 0}>↪ Redo</button>
    <span class="history">History: {undoStack.length} steps</span>
  </div>
  <div class="input-row">
    <input bind:value={newText} placeholder="New todo..." onkeydown={(e) => e.key === 'Enter' && addTodo()} />
    <button onclick={addTodo} disabled={!newText.trim()}>Add</button>
  </div>
  <ul class="todos">
    {#each todos as todo (todo.id)}
      <li class="todo" class:done={todo.done} onclick={() => toggleTodo(todo.id)}>
        {todo.text}
      </li>
    {/each}
  </ul>
</div>

<style>
  .app { max-width: 480px; margin: 2rem auto; font-family: system-ui, sans-serif; }
  .toolbar { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; }
  .toolbar button { padding: 0.3rem 0.7rem; border: 1px solid #d1d5db; border-radius: 5px; background: white; cursor: pointer; }
  .toolbar button:disabled { opacity: 0.4; cursor: not-allowed; }
  .history { margin-left: auto; font-size: 0.75rem; color: #94a3b8; }
  .input-row { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .input-row input { flex: 1; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 5px; }
  .input-row button { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 5px; cursor: pointer; }
  .todos { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .todo { padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
  .todo.done { text-decoration: line-through; color: #94a3b8; background: #f1f5f9; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-snapshot-undo',
			description: 'Implement undo by pushing $state.snapshot(todos) to undoStack before each mutation',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$state.snapshot' },
						{ type: 'contains', value: 'undoStack.push' },
						{ type: 'contains', value: 'undoStack.pop()' }
					]
				}
			},
			hints: [
				'Call `undoStack.push($state.snapshot(todos))` at the top of `addTodo()` and `toggleTodo()`, BEFORE the mutation.',
				'In `undo()`, first push the current state to `redoStack`, then assign `todos = undoStack.pop()`.',
				'Always clear `redoStack` when a new action is taken — any new mutation invalidates the redo history.'
			],
			conceptsTested: ['svelte5.runes.state', 'svelte5.runes.state-snapshot']
		},
		{
			id: 'cp-snapshot-persist',
			description: 'Use $state.snapshot when saving state to localStorage or passing to external APIs',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$state.snapshot' }
					]
				}
			},
			hints: [
				'Whenever you need to pass reactive state outside Svelte — to `JSON.stringify`, `fetch`, or a third-party library — wrap it in `$state.snapshot()`.',
				'`$state.snapshot(value)` returns a deep plain JavaScript copy of the reactive value with all proxies removed.'
			],
			conceptsTested: ['svelte5.runes.state-snapshot']
		}
	]
};
