import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-2',
		title: 'Loops & Recursion',
		phase: 1,
		module: 3,
		lessonIndex: 2
	},
	description: `Loops are how we repeat work — generating data, processing items, building up results. JavaScript gives you several loop constructs and each has a sweet spot. Picking the right one isn't about style; it's about matching the shape of your problem so the code reads like a sentence.

The **classic \`for\` loop** (\`for (let i = 0; i < n; i++)\`) is best when you need the index, custom steps, or bounded iteration. **\`for...of\`** is the cleanest way to iterate over the *values* of any iterable — arrays, strings, Maps, Sets. **\`for...in\`** iterates over *object keys* (a common trap: it's not for arrays). **\`while\`** is condition-driven: keep going until some predicate flips. **\`do...while\`** is the same, but always runs the body at least once — perfect for retry or poll patterns.

**Recursion** is a different beast: a function that calls itself. It might sound exotic, but it's exactly the right tool for tree-shaped problems — file systems, nested comments, category menus, the DOM itself. Every recursive function needs two ingredients: a **base case** that stops the recursion (otherwise you'll blow the stack), and a **recursive step** that makes progress toward that base case. If either is missing or wrong, your function either loops forever or never enters the recursion at all.

Svelte adds a gorgeous dimension to recursion: **recursive components**. A component can import itself and render itself inside its own template. In 2026 the modern pattern is \`import Self from './Self.svelte'\` — this replaces the older \`<svelte:self>\` syntax, type-checks cleanly, and makes the recursion obvious at a glance.

Pitfalls to watch for: forgetting the base case (infinite recursion), confusing \`for...in\` with \`for...of\`, mutating arrays while iterating (use a copy or index backward), and unkeyed \`{#each}\` blocks that cause surprising DOM reuse in Svelte.`,
	objectives: [
		'Choose between for, for...of, for...in, while, and do...while appropriately',
		'Build nested loops for grid-shaped data like multiplication tables',
		'Write recursive functions with a clear base case and recursive step',
		'Understand tree-shaped data as a natural fit for recursion',
		"Use recursive components with `import Self from './Self.svelte'` (the modern replacement for <svelte:self>)",
		'Recognize and avoid common loop bugs like off-by-one errors and missing base cases'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import FileTree from './FileTree.svelte';

  // === LOOPS: THREE FLAVORS ===
  // JavaScript has several loop constructs. Pick the one whose intent
  // matches your task — it makes code easier to read and harder to bug.

  // --- for loop: classic, index-based ---
  // Best when you need the index, or when iterating with steps.
  let squares = [];
  for (let i = 1; i <= 10; i++) {
    squares.push({ n: i, square: i * i });
  }

  // --- for...of loop: cleanest for iterating values ---
  // Use when you only need the item, not the index.
  const words = ['Hello', 'Svelte', 'World', 'Runes'];
  let uppercased = [];
  for (const word of words) {
    uppercased.push(word.toUpperCase());
  }

  // --- for...in loop: iterate object *keys* ---
  // Note: for...in returns keys, for...of returns values. Easy to confuse!
  const scores = { alice: 95, bob: 82, carol: 78, dave: 90 };
  let scoreEntries = [];
  for (const name in scores) {
    scoreEntries.push({ name, score: scores[name] });
  }

  // --- while loop: condition-driven, unknown iteration count ---
  // The Fibonacci sequence — keep going until we reach our size.
  let fibs = [0, 1];
  while (fibs.length < 12) {
    const len = fibs.length;
    // Each new number is the sum of the two previous.
    fibs.push(fibs[len - 1] + fibs[len - 2]);
  }

  // --- do...while loop: runs at least once, then checks ---
  // Used here to simulate retries — always try once, keep going if failed.
  let attempts = [];
  let tries = 0;
  do {
    tries++;
    // Fake a "success" on the 3rd try.
    attempts.push({ n: tries, success: tries === 3 });
  } while (tries < 3);

  // --- Nested loops: multiplication table ---
  // Two-level iteration produces a grid — any time you see "every X paired
  // with every Y", you need nested loops.
  let multiplicationTable = [];
  for (let row = 1; row <= 5; row++) {
    const rowValues = [];
    for (let col = 1; col <= 5; col++) {
      rowValues.push(row * col);
    }
    multiplicationTable.push(rowValues);
  }

  // === RECURSION: A FUNCTION THAT CALLS ITSELF ===
  // Every recursive function needs two things:
  //   1. A *base case* that stops the recursion.
  //   2. A *recursive step* that moves toward the base case.

  // --- factorial: the classic example ---
  function factorial(n) {
    if (n <= 1) return 1;            // base case
    return n * factorial(n - 1);     // recursive step
  }

  // --- sum of digits: recursively chop off the last digit ---
  function sumOfDigits(n) {
    if (n < 10) return n;                              // base case
    return (n % 10) + sumOfDigits(Math.floor(n / 10)); // recursive step
  }

  // --- Recursive tree data — perfect match for a recursive component ---
  let fileTree = $state([
    {
      name: 'src',
      type: 'folder',
      children: [
        {
          name: 'lib',
          type: 'folder',
          children: [
            { name: 'utils.js', type: 'file' },
            { name: 'api.js', type: 'file' },
            {
              name: 'components',
              type: 'folder',
              children: [
                { name: 'Button.svelte', type: 'file' },
                { name: 'Modal.svelte', type: 'file' }
              ]
            }
          ]
        },
        { name: 'App.svelte', type: 'file' },
        { name: 'main.js', type: 'file' }
      ]
    },
    {
      name: 'public',
      type: 'folder',
      children: [
        { name: 'index.html', type: 'file' },
        { name: 'favicon.png', type: 'file' }
      ]
    },
    { name: 'package.json', type: 'file' },
    { name: 'README.md', type: 'file' }
  ]);

  // Interactive demos
  let factInput = $state(5);
  let digitInput = $state(12345);
</script>

<h1>Loops & Recursion</h1>

<section>
  <h2>1. for loop — Squares (index-based)</h2>
  <p class="hint">Use when you need the index or custom step.</p>
  <div class="grid">
    {#each squares as { n, square } (n)}
      <div class="cell">{n}<sup>2</sup> = {square}</div>
    {/each}
  </div>
</section>

<section>
  <h2>2. for...of — Uppercased Words</h2>
  <p class="hint">Cleanest way to iterate over array values.</p>
  <p>{words.join(', ')} &rarr; <strong>{uppercased.join(', ')}</strong></p>
</section>

<section>
  <h2>3. for...in — Object Keys</h2>
  <p class="hint">Iterates over property names; use for...of on Object.entries() for [key, value] pairs.</p>
  <ul class="score-list">
    {#each scoreEntries as entry (entry.name)}
      <li><span>{entry.name}</span><strong>{entry.score}</strong></li>
    {/each}
  </ul>
</section>

<section>
  <h2>4. while — Fibonacci Sequence</h2>
  <p class="hint">Condition-driven; stops when the length reaches 12.</p>
  <p class="mono">{fibs.join(', ')}</p>
</section>

<section>
  <h2>5. do...while — Retry Loop</h2>
  <p class="hint">Body runs at least once — ideal for retry/poll patterns.</p>
  <div class="attempts">
    {#each attempts as a (a.n)}
      <span class="attempt" class:ok={a.success}>Try #{a.n} {a.success ? '✓' : '✗'}</span>
    {/each}
  </div>
</section>

<section>
  <h2>6. Nested Loops — Multiplication Table</h2>
  <p class="hint">Every row × every column requires two levels.</p>
  <table>
    <tbody>
      {#each multiplicationTable as row, i (i)}
        <tr>
          {#each row as cell, j (j)}
            <td>{cell}</td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<section>
  <h2>7. Recursion — factorial(n)</h2>
  <p class="hint">A function that calls itself, with a base case to stop.</p>
  <label>n = <input type="number" bind:value={factInput} min="0" max="12" /></label>
  <p>factorial({factInput}) = <strong>{factorial(factInput)}</strong></p>
</section>

<section>
  <h2>8. Recursion — sumOfDigits(n)</h2>
  <label>n = <input type="number" bind:value={digitInput} min="0" /></label>
  <p>sumOfDigits({digitInput}) = <strong>{sumOfDigits(digitInput)}</strong></p>
</section>

<section>
  <h2>9. Recursive Component — File Tree</h2>
  <p class="hint">The component imports itself to render its children.</p>
  <div class="tree-container">
    <FileTree items={fileTree} depth={0} />
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 22px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  .mono { font-family: monospace; font-size: 12px; color: #666; }
  strong { color: #222; }
  .grid { display: flex; gap: 8px; flex-wrap: wrap; }
  .cell { padding: 6px 12px; background: #f8f8f8; border-radius: 4px; font-size: 13px; color: #444; font-family: monospace; }
  .score-list { list-style: none; padding: 0; margin: 0; display: flex; gap: 6px; flex-wrap: wrap; }
  .score-list li { background: #e6f7f3; color: #2d8a6e; padding: 4px 10px; border-radius: 4px; font-size: 13px; display: flex; gap: 6px; }
  .attempts { display: flex; gap: 6px; }
  .attempt { padding: 4px 10px; background: #fdecea; color: #c62828; border-radius: 4px; font-size: 12px; font-family: monospace; }
  .attempt.ok { background: #e6f7f3; color: #2d8a6e; }
  table { border-collapse: collapse; font-family: monospace; font-size: 13px; }
  td { border: 1px solid #eee; padding: 6px 10px; text-align: right; color: #444; min-width: 32px; }
  input[type="number"] { padding: 4px 8px; border: 2px solid #ddd; border-radius: 4px; width: 90px; }
  label { font-size: 13px; color: #444; display: inline-flex; align-items: center; gap: 4px; }
  .tree-container { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px; font-family: monospace; font-size: 14px; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'FileTree.svelte',
			content: `<script>
  // Import ourselves by name — the modern replacement for <svelte:self>.
  // This is the April 2026 best practice: plain imports work anywhere,
  // type-check cleanly, and make the recursion explicit.
  import Self from './FileTree.svelte';

  let { items = [], depth = 0 } = $props();
</script>

<!-- Recursive component: renders itself for child folders.
     Use a keyed each block so Svelte can surgically update the DOM. -->
{#each items as item (item.name + '-' + depth)}
  <div class="item" style="padding-left: {depth * 16}px">
    {#if item.type === 'folder'}
      <span class="folder">📁 {item.name}/</span>
      {#if item.children}
        <!-- Base case: recursion stops when there are no children -->
        <Self items={item.children} depth={depth + 1} />
      {/if}
    {:else}
      <span class="file">📄 {item.name}</span>
    {/if}
  </div>
{/each}

<style>
  .item { padding: 2px 0; }
  .folder { color: #dcdcaa; }
  .file { color: #9cdcfe; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
