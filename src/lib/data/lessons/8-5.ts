import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '8-5',
		title: 'Generic Functions & unknown',
		phase: 2,
		module: 8,
		lessonIndex: 5
	},
	description: `Generic functions work with any type while preserving type safety. Instead of using 'any' (which disables type checking), you use a type parameter like <T> that adapts to whatever type you pass in.

When you write function first<T>(arr: T[]): T | undefined, TypeScript infers T from the argument. Call first([1, 2, 3]) and T becomes number. Call first(['a', 'b']) and T becomes string. Same function, fully type-safe.

The unknown type is the safe alternative to any. Unlike any, unknown forces you to check the type before using it — making it perfect for catch blocks, JSON parsing results, and data from external sources. If any is "trust me," unknown is "prove it."`,
	objectives: [
		'Write generic functions with type parameters like <T>',
		'Understand type inference: TypeScript figures out T from arguments',
		'Use constraints (T extends X) to require certain capabilities',
		'Use unknown instead of any for type-safe error handling'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // 1. GENERIC FUNCTION — first<T>
  // ============================================================
  // T is a placeholder. TS infers it from the argument.

  function first<T>(arr: T[]): T | undefined {
    return arr[0];
  }

  function last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
  }

  // first([1, 2, 3]) → number | undefined
  // first(['a', 'b']) → string | undefined
  // first([{ id: 1 }, { id: 2 }]) → { id: number } | undefined

  const firstNumber: number | undefined = first([1, 2, 3]);
  const lastWord: string | undefined = last(['svelte', 'is', 'fun']);

  // ============================================================
  // 2. GENERICS WITH MULTIPLE TYPE PARAMETERS
  // ============================================================

  function pair<A, B>(a: A, b: B): [A, B] {
    return [a, b];
  }

  const stringNum: [string, number] = pair('Alice', 30);
  const boolArr: [boolean, string[]] = pair(true, ['a', 'b']);

  // ============================================================
  // 3. GENERIC CONSTRAINTS — T extends ...
  // ============================================================
  // Require T to have certain properties.

  interface HasLength {
    length: number;
  }

  function longest<T extends HasLength>(a: T, b: T): T {
    return a.length >= b.length ? a : b;
  }

  const longerStr: string = longest('short', 'longer one');
  const longerArr: number[] = longest([1, 2], [1, 2, 3, 4]);

  // ============================================================
  // 4. groupBy<T, K> — generic utility
  // ============================================================

  function groupBy<T, K extends string | number>(
    items: T[],
    getKey: (item: T) => K
  ): Record<K, T[]> {
    const result = {} as Record<K, T[]>;
    for (const item of items) {
      const key = getKey(item);
      if (!result[key]) result[key] = [];
      result[key].push(item);
    }
    return result;
  }

  interface Person {
    name: string;
    age: number;
    department: string;
  }

  const people: Person[] = [
    { name: 'Alice', age: 28, department: 'Engineering' },
    { name: 'Bob', age: 34, department: 'Design' },
    { name: 'Carol', age: 25, department: 'Engineering' },
    { name: 'Dave', age: 42, department: 'Design' },
    { name: 'Eve', age: 31, department: 'Marketing' }
  ];

  const byDepartment = groupBy(people, (p) => p.department);
  const departmentNames = Object.keys(byDepartment);

  // ============================================================
  // 5. unknown — the safe "any"
  // ============================================================
  // any: turns off type-checking completely. Avoid.
  // unknown: you MUST narrow before using. Safe.

  function safeParse(input: string): unknown {
    try {
      return JSON.parse(input);
    } catch {
      return null;
    }
  }

  // Narrowing unknown before use
  function extractName(data: unknown): string {
    if (data === null || typeof data !== 'object') {
      return '(invalid data)';
    }
    // data is now 'object' — still need to narrow .name
    if ('name' in data && typeof (data as { name: unknown }).name === 'string') {
      return (data as { name: string }).name;
    }
    return '(no name field)';
  }

  // ============================================================
  // 6. unknown IN CATCH BLOCKS (TS 4.4+ default)
  // ============================================================

  function safeOperation(): string {
    try {
      throw new Error('Boom');
    } catch (err: unknown) {
      // Can't use err.message directly — must narrow
      if (err instanceof Error) {
        return 'Error: ' + err.message;
      }
      return 'Unknown throw';
    }
  }

  // ============================================================
  // Interactive demo
  // ============================================================

  let jsonInput = $state('{"name": "Alice", "age": 28}');
  let parsed = $state<unknown>(null);
  let extracted = $state<string>('');

  function runParse(): void {
    parsed = safeParse(jsonInput);
    extracted = extractName(parsed);
  }

  let arrayInput = $state('1,2,3,4,5');
  let firstItem: number | undefined = $state(undefined);
  let lastItem: number | undefined = $state(undefined);

  function runFirstLast(): void {
    const arr = arrayInput
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !Number.isNaN(n));
    firstItem = first(arr);
    lastItem = last(arr);
  }

  let catchResult = $state('');

  function runCatch(): void {
    catchResult = safeOperation();
  }
</script>

<h1>Generic Functions &amp; unknown</h1>

<section>
  <h2>1. first&lt;T&gt; and last&lt;T&gt;</h2>
  <pre class="code">{\`function first<T>(arr: T[]): T | undefined {
  return arr[0];
}\`}</pre>
  <input bind:value={arrayInput} />
  <button onclick={runFirstLast}>Run</button>
  <p>first = <strong>{firstItem ?? '(undefined)'}</strong></p>
  <p>last = <strong>{lastItem ?? '(undefined)'}</strong></p>
  <p class="hint">
    Same function works with any array type. TS infers <code>T</code> from the argument.
  </p>
</section>

<section>
  <h2>2. Constraints: longest&lt;T extends HasLength&gt;</h2>
  <p>longest('short', 'longer one') = <code>{longerStr}</code></p>
  <p>longest([1,2], [1,2,3,4]).length = <code>{longerArr.length}</code></p>
  <pre class="code">{\`function longest<T extends HasLength>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}\`}</pre>
</section>

<section>
  <h2>3. groupBy&lt;T, K&gt;</h2>
  <p class="hint">Generic over both item type and key type.</p>
  <div class="groups">
    {#each departmentNames as dept (dept)}
      <div class="group">
        <h3>{dept}</h3>
        <ul>
          {#each byDepartment[dept] as p (p.name)}
            <li>{p.name} (age {p.age})</li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

<section>
  <h2>4. unknown (not any)</h2>
  <p class="intro">unknown forces you to check before using — perfect for external data.</p>
  <textarea bind:value={jsonInput} rows="2"></textarea>
  <button onclick={runParse}>Parse &amp; extract name</button>
  {#if parsed !== null}
    <p>Parsed: <code>{JSON.stringify(parsed)}</code></p>
    <p>Extracted name: <strong>{extracted}</strong></p>
  {/if}
</section>

<section>
  <h2>5. unknown in catch</h2>
  <pre class="code">{\`try {
  risky();
} catch (err: unknown) {
  if (err instanceof Error) {
    console.log(err.message);
  }
}\`}</pre>
  <button onclick={runCatch}>Run</button>
  {#if catchResult}
    <p class="result">{catchResult}</p>
  {/if}
</section>

<section class="cheat">
  <h2>any vs unknown</h2>
  <table>
    <thead>
      <tr><th>Feature</th><th>any</th><th>unknown</th></tr>
    </thead>
    <tbody>
      <tr><td>Use without checking</td><td>yes</td><td>no</td></tr>
      <tr><td>Type safety</td><td>off</td><td>on</td></tr>
      <tr><td>When to use</td><td>last resort</td><td>external data, catch</td></tr>
    </tbody>
  </table>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .intro { font-size: 0.9rem; color: #555; margin: 0 0 0.5rem; }
  .code {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    white-space: pre-wrap;
    margin: 0.5rem 0;
  }
  input, textarea {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    box-sizing: border-box;
    font-family: monospace;
  }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 0.5rem;
  }
  button:hover { background: #4338ca; }
  code {
    background: #e8e8e8;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }
  .result {
    padding: 0.5rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    margin-top: 0.5rem;
  }
  .groups { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .group {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 0.6rem;
    flex: 1;
    min-width: 150px;
  }
  .group h3 { margin: 0 0 0.4rem; font-size: 0.9rem; color: #4f46e5; }
  .group ul { margin: 0; padding-left: 1.1rem; font-size: 0.85rem; }
  .hint { font-size: 0.85rem; color: #666; }
  .cheat { background: #fffbeb; border: 1px solid #fde68a; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { padding: 0.4rem 0.6rem; text-align: left; border-bottom: 1px solid #fde68a; }
  th { background: #fef3c7; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
