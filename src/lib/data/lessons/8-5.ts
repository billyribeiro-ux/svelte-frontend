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

The unknown type is the safe alternative to any. Unlike any, unknown forces you to check the type before using it — making it perfect for catch blocks and data from external sources.`,
	objectives: [
		'Write generic functions with type parameters like <T>',
		'Understand type inference: TypeScript figures out T from arguments',
		'Use unknown instead of any for type-safe error handling',
		'Build reusable type-safe utility functions'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // === Generic utility functions ===
  function first<T>(arr: T[]): T | undefined {
    return arr.length > 0 ? arr[0] : undefined;
  }

  function last<T>(arr: T[]): T | undefined {
    return arr.length > 0 ? arr[arr.length - 1] : undefined;
  }

  function unique<T>(arr: T[]): T[] {
    return [...new Set(arr)];
  }

  function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
    const groups: Record<string, T[]> = {};
    for (const item of arr) {
      const key = keyFn(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }

  // Using the generics
  let numbers: number[] = $state([3, 1, 4, 1, 5, 9, 2, 6, 5]);
  let words: string[] = $state(['svelte', 'react', 'svelte', 'vue', 'react']);

  let firstNum = $derived(first(numbers));      // TypeScript knows: number | undefined
  let lastWord = $derived(last(words));          // TypeScript knows: string | undefined
  let uniqueNums = $derived(unique(numbers));    // TypeScript knows: number[]
  let uniqueWords = $derived(unique(words));     // TypeScript knows: string[]

  interface Person {
    name: string;
    department: string;
    age: number;
  }

  let people: Person[] = $state([
    { name: 'Alice', department: 'Engineering', age: 28 },
    { name: 'Bob', department: 'Design', age: 34 },
    { name: 'Carol', department: 'Engineering', age: 22 },
    { name: 'Dave', department: 'Design', age: 30 },
    { name: 'Eve', department: 'Marketing', age: 27 }
  ]);

  let grouped = $derived(groupBy(people, (p: Person) => p.department));

  // === unknown vs any ===
  let errorResult: string = $state('');

  function handleErrorSafely(err: unknown): string {
    // With unknown, you MUST check before using
    if (err instanceof Error) {
      return \`Error: \${err.message}\`;
    }
    if (typeof err === 'string') {
      return \`String error: \${err}\`;
    }
    if (typeof err === 'object' && err !== null && 'code' in err) {
      return \`Error object with code: \${(err as { code: number }).code}\`;
    }
    return \`Unknown error type: \${String(err)}\`;
  }

  function testError(type: string): void {
    try {
      switch (type) {
        case 'error': throw new Error('Something broke');
        case 'string': throw 'A string error';
        case 'object': throw { code: 404, detail: 'Not found' };
        case 'number': throw 42;
      }
    } catch (e: unknown) {
      errorResult = handleErrorSafely(e);
    }
  }
</script>

<h1>Generic Functions & unknown</h1>

<section>
  <h2>Generic Utility Functions</h2>
  <pre class="code">function first&lt;T&gt;(arr: T[]): T | undefined
function last&lt;T&gt;(arr: T[]): T | undefined
function unique&lt;T&gt;(arr: T[]): T[]</pre>

  <div class="demo-grid">
    <div class="demo-card">
      <h3>number[]</h3>
      <p>Input: [{numbers.join(', ')}]</p>
      <p>first(): <strong>{firstNum}</strong></p>
      <p>unique(): [{uniqueNums.join(', ')}]</p>
    </div>
    <div class="demo-card">
      <h3>string[]</h3>
      <p>Input: [{words.map(w => \`"\${w}"\`).join(', ')}]</p>
      <p>last(): <strong>"{lastWord}"</strong></p>
      <p>unique(): [{uniqueWords.map(w => \`"\${w}"\`).join(', ')}]</p>
    </div>
  </div>
  <p class="note">Same functions, different types — TypeScript infers T from the arguments.</p>
</section>

<section>
  <h2>Generic groupBy&lt;T&gt;</h2>
  <pre class="code">function groupBy&lt;T&gt;(arr: T[], keyFn: (item: T) =&gt; string): Record&lt;string, T[]&gt;</pre>

  <div class="groups">
    {#each Object.entries(grouped) as [dept, members]}
      <div class="group-card">
        <h3>{dept}</h3>
        <ul>
          {#each members as person}
            <li>{person.name} (age {person.age})</li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>

<section>
  <h2>unknown vs any</h2>
  <div class="comparison">
    <div class="bad">
      <h3>any (unsafe)</h3>
      <pre class="code">catch (e: any) {'{'}
  console.log(e.message);
  // No error if e is not an Error!
  // Crashes at runtime
{'}'}</pre>
    </div>
    <div class="good">
      <h3>unknown (safe)</h3>
      <pre class="code">catch (e: unknown) {'{'}
  if (e instanceof Error) {'{'}
    console.log(e.message);
    // TypeScript knows e is Error here
  {'}'}
{'}'}</pre>
    </div>
  </div>

  <h3>Test Error Handling</h3>
  <div class="buttons">
    <button onclick={() => testError('error')}>throw Error</button>
    <button onclick={() => testError('string')}>throw string</button>
    <button onclick={() => testError('object')}>throw object</button>
    <button onclick={() => testError('number')}>throw number</button>
  </div>
  {#if errorResult}
    <div class="error-result">{errorResult}</div>
  {/if}
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
    overflow-x: auto;
    white-space: pre;
    margin: 0.5rem 0;
  }
  .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
  .demo-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 0.75rem;
  }
  .demo-card h3 { margin: 0 0 0.5rem; color: #4f46e5; }
  .demo-card p { margin: 0.25rem 0; font-size: 0.9rem; }
  .note { font-size: 0.85rem; color: #666; font-style: italic; }
  .groups { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 0.75rem 0; }
  .group-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 0.75rem;
  }
  .group-card h3 { margin: 0 0 0.5rem; color: #4f46e5; }
  ul { padding-left: 1.2rem; margin: 0; }
  li { margin: 0.2rem 0; font-size: 0.9rem; }
  .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 0.75rem 0; }
  .bad { padding: 0.75rem; border: 2px solid #ef4444; border-radius: 8px; background: #fef2f2; }
  .good { padding: 0.75rem; border: 2px solid #22c55e; border-radius: 8px; background: #f0fdf4; }
  .bad h3, .good h3 { margin: 0 0 0.5rem; }
  .buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.5rem 0; }
  button {
    padding: 0.4rem 0.8rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .error-result {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-family: monospace;
    font-size: 0.9rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
