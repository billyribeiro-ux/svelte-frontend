import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '8-1',
		title: 'Why Types & lang=ts',
		phase: 2,
		module: 8,
		lessonIndex: 1
	},
	description: `TypeScript adds type annotations to JavaScript. Instead of hoping a variable is a number, you declare it: let count: number = 0. The compiler catches mistakes before your code runs.

In Svelte, you opt into TypeScript by adding lang="ts" to your script tag: <script lang="ts">. Everything else stays the same — runes, reactivity, templates — but now you get type safety, autocomplete, and refactoring confidence.

This is your first TypeScript lesson. We'll start with the basics: annotating variables, function parameters, return types, arrays, and typed $state. You'll also see real errors that TypeScript would catch if you broke the contract — the "why" behind every annotation.`,
	objectives: [
		'Add lang="ts" to a Svelte component script tag',
		'Annotate variables with basic types: string, number, boolean',
		'Type function parameters and return values',
		'Use typed arrays and the generic $state<T>() syntax',
		'Understand type inference: when you can omit annotations'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // 1. BASIC PRIMITIVE ANNOTATIONS
  // ============================================================
  // The syntax is: let name: Type = value
  // TypeScript will refuse assignments of the wrong type.

  let username: string = $state('Alice');
  let age: number = $state(28);
  let isActive: boolean = $state(true);

  // If you try: age = 'twenty-eight'
  // TS error: Type 'string' is not assignable to type 'number'.

  // ============================================================
  // 2. TYPE INFERENCE — often you don't need to annotate
  // ============================================================
  // TypeScript is smart. From a literal, it infers the type.

  let inferredString = $state('hello');   // inferred as string
  let inferredNumber = $state(42);        // inferred as number
  let inferredBool = $state(false);       // inferred as boolean

  // Best practice: let TS infer when it's obvious, annotate when
  // you're declaring an empty/nullable variable or want docs.

  // ============================================================
  // 3. TYPED ARRAYS
  // ============================================================
  // Two syntaxes: T[] and Array<T>. Use T[] for simple cases.

  let tags: string[] = $state(['svelte', 'typescript']);
  let scores: number[] = $state([10, 20, 30]);

  let newTag: string = $state('');

  function addTag(): void {
    const t = newTag.trim();
    if (t.length === 0) return;
    tags = [...tags, t];
    newTag = '';
  }

  function removeTag(tag: string): void {
    tags = tags.filter((t) => t !== tag);
  }

  // ============================================================
  // 4. TYPED FUNCTIONS — parameters AND return type
  // ============================================================
  // function greet(name: string): string { ... }
  //         params have types ---^       ^--- return type

  function greet(name: string): string {
    return \`Hello, \${name}!\`;
  }

  function add(a: number, b: number): number {
    return a + b;
  }

  // void means "returns nothing"
  function logMessage(msg: string): void {
    console.log(msg);
  }

  // A function that takes an array of numbers and returns their sum
  function sum(nums: number[]): number {
    return nums.reduce((acc, n) => acc + n, 0);
  }

  let greeting: string = $derived(greet(username));
  let total: number = $derived(sum(scores));
  let aPlusB: number = $state(add(2, 3));

  // ============================================================
  // 5. GENERIC $state<T>() — when inference isn't enough
  // ============================================================
  // When you start with null or an empty array, TS can't infer
  // the eventual type. Use the generic form: $state<T>(initial).

  interface Todo {
    id: number;
    text: string;
    done: boolean;
  }

  let todos = $state<Todo[]>([]);
  let selectedTodo = $state<Todo | null>(null);
  let nextId: number = 1;
  let newTodoText: string = $state('');

  function addTodo(): void {
    const text = newTodoText.trim();
    if (text.length === 0) return;
    // TS enforces that the object matches Todo
    const todo: Todo = { id: nextId++, text, done: false };
    todos = [...todos, todo];
    newTodoText = '';
  }

  function toggleTodo(id: number): void {
    todos = todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  }

  function selectTodo(todo: Todo): void {
    selectedTodo = todo;
  }

  // ============================================================
  // 6. ERRORS TS WOULD CATCH (commented out so the code runs)
  // ============================================================
  // The comments below are examples of mistakes the compiler
  // catches before runtime. Uncomment to see them red-squiggle.

  // age = 'twenty-eight';
  //   ^ Type 'string' is not assignable to type 'number'.

  // tags.push(42);
  //             ^ Argument of type 'number' is not assignable to 'string'.

  // const bad: Todo = { id: 1, text: 'oops' };
  //             ^ Property 'done' is missing in type '{ id: number; text: string; }'.

  // const wrong = add('1', '2');
  //                   ^ Argument of type 'string' is not assignable to 'number'.
</script>

<h1>Why Types &amp; lang="ts"</h1>

<section>
  <h2>1. Primitive Annotations</h2>
  <pre class="code">{\`let username: string = $state('Alice');
let age: number = $state(28);
let isActive: boolean = $state(true);\`}</pre>
  <div class="form">
    <label>Name <input bind:value={username} /></label>
    <label>Age <input type="number" bind:value={age} /></label>
    <label>
      <input type="checkbox" bind:checked={isActive} /> Active
    </label>
  </div>
  <p class="greet">{greeting}</p>
  <p class="info">isActive: <strong>{isActive}</strong></p>
</section>

<section>
  <h2>2. Typed Function</h2>
  <pre class="code">{\`function add(a: number, b: number): number {
  return a + b;
}\`}</pre>
  <p>2 + 3 = <strong>{aPlusB}</strong></p>
</section>

<section>
  <h2>3. Typed Array: string[]</h2>
  <div class="tags">
    {#each tags as tag (tag)}
      <span class="tag">
        {tag}
        <button class="x" onclick={() => removeTag(tag)}>x</button>
      </span>
    {/each}
  </div>
  <div class="form">
    <input bind:value={newTag} placeholder="new tag" />
    <button onclick={addTag}>Add tag</button>
  </div>
</section>

<section>
  <h2>4. sum(nums: number[]): number</h2>
  <p>scores = [{scores.join(', ')}]</p>
  <p>sum = <strong>{total}</strong></p>
</section>

<section>
  <h2>5. Typed State with $state&lt;Todo[]&gt;</h2>
  <pre class="code">{\`interface Todo { id: number; text: string; done: boolean }
let todos = $state<Todo[]>([]);\`}</pre>
  <div class="form">
    <input bind:value={newTodoText} placeholder="new todo" />
    <button onclick={addTodo}>Add todo</button>
  </div>
  <ul class="todos">
    {#each todos as todo (todo.id)}
      <li class:done={todo.done}>
        <input type="checkbox" checked={todo.done} onchange={() => toggleTodo(todo.id)} />
        <button type="button" class="todo-text" onclick={() => selectTodo(todo)}>{todo.text}</button>
      </li>
    {/each}
  </ul>
  {#if selectedTodo}
    <p class="selected">Selected: #{selectedTodo.id} — {selectedTodo.text}</p>
  {/if}
</section>

<section class="cheat">
  <h2>Errors TypeScript Would Catch</h2>
  <pre class="code">{\`age = 'twenty-eight';
// Type 'string' is not assignable to type 'number'.

tags.push(42);
// Argument of type 'number' is not assignable to 'string'.

const bad: Todo = { id: 1, text: 'oops' };
// Property 'done' is missing.\`}</pre>
  <p class="hint">Every error is caught at <em>compile time</em>, before the app runs.</p>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .code {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    margin: 0.5rem 0;
    white-space: pre-wrap;
  }
  .form { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin: 0.5rem 0; }
  label { display: flex; gap: 0.3rem; align-items: center; font-size: 0.9rem; }
  input {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  button {
    padding: 0.4rem 0.9rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:hover { background: #4338ca; }
  .greet { font-size: 1.1rem; color: #4f46e5; font-weight: bold; }
  .info { font-size: 0.9rem; color: #555; }
  .tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.5rem; }
  .tag {
    background: #dbeafe;
    color: #1e40af;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    font-size: 0.85rem;
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
  }
  .x {
    background: transparent;
    color: #1e40af;
    border: none;
    cursor: pointer;
    padding: 0;
    font-weight: bold;
  }
  .todos { list-style: none; padding: 0; margin: 0.5rem 0; }
  .todos li {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.4rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-bottom: 0.3rem;
    cursor: pointer;
  }
  .todos li.done .todo-text { text-decoration: line-through; color: #888; }
  .todo-text {
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
    font: inherit;
    color: inherit;
    text-align: left;
  }
  .selected {
    padding: 0.5rem;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  .cheat { background: #fffbeb; border: 1px solid #fde68a; }
  .hint { font-size: 0.85rem; color: #666; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
