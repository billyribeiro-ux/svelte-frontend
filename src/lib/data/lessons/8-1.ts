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

In Svelte, you opt into TypeScript by adding lang="ts" to your script tag: <script lang="ts">. Everything else stays the same — runes, reactivity, templates — but now you get type safety.

This is your first TypeScript lesson. We'll start with the basics: annotating variables, function parameters, return types, and arrays. You'll see how TypeScript catches bugs that would silently break in plain JavaScript.`,
	objectives: [
		'Add lang="ts" to a Svelte component script tag',
		'Annotate variables with basic types: string, number, boolean',
		'Type function parameters and return values',
		'Use typed arrays and the generic $state<T>() syntax'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Basic type annotations
  let name: string = $state('Alice');
  let age: number = $state(25);
  let isOnline: boolean = $state(true);

  // Typed arrays
  let scores: number[] = $state([95, 87, 92, 78]);
  let tags: string[] = $state(['svelte', 'typescript', 'frontend']);

  // Typed functions
  function greet(person: string, greeting: string = 'Hello'): string {
    return \`\${greeting}, \${person}!\`;
  }

  function calculateAverage(nums: number[]): number {
    if (nums.length === 0) return 0;
    const sum = nums.reduce((total, n) => total + n, 0);
    return Math.round((sum / nums.length) * 10) / 10;
  }

  // Derived with inferred types (TypeScript figures out the type)
  let message = $derived(greet(name));
  let average = $derived(calculateAverage(scores));
  let highScores = $derived(scores.filter((s: number) => s >= 90));

  // State with explicit generic type
  let newScore: number = $state(0);
  let newTag: string = $state('');

  function addScore(): void {
    if (newScore > 0) {
      scores = [...scores, newScore];
      newScore = 0;
    }
  }

  function addTag(): void {
    if (newTag.trim()) {
      tags = [...tags, newTag.trim().toLowerCase()];
      newTag = '';
    }
  }

  function removeTag(index: number): void {
    tags = tags.filter((_: string, i: number) => i !== index);
  }
</script>

<h1>Why Types & lang="ts"</h1>

<div class="notice">
  This component uses <code>&lt;script lang="ts"&gt;</code> — TypeScript is active!
</div>

<section>
  <h2>Basic Types</h2>
  <div class="type-grid">
    <div class="type-card">
      <code>string</code>
      <label>Name: <input bind:value={name} /></label>
      <span class="value">{name}</span>
    </div>
    <div class="type-card">
      <code>number</code>
      <label>Age: <input type="number" bind:value={age} /></label>
      <span class="value">{age}</span>
    </div>
    <div class="type-card">
      <code>boolean</code>
      <label>
        <input type="checkbox" bind:checked={isOnline} /> Online
      </label>
      <span class="value">{String(isOnline)}</span>
    </div>
  </div>
</section>

<section>
  <h2>Typed Functions</h2>
  <div class="function-demo">
    <pre>function greet(person: string, greeting: string = 'Hello'): string</pre>
    <p class="result">Result: {message}</p>
  </div>
</section>

<section>
  <h2>Typed Arrays: number[]</h2>
  <div class="scores">
    <div class="score-list">
      {#each scores as score, i}
        <span class="score" class:high={score >= 90}>{score}</span>
      {/each}
    </div>
    <p>Average: <strong>{average}</strong> | High scores (90+): <strong>{highScores.length}</strong></p>
    <div class="add-row">
      <input type="number" bind:value={newScore} placeholder="New score" min="0" max="100" />
      <button onclick={addScore}>Add Score</button>
    </div>
  </div>
</section>

<section>
  <h2>Typed Arrays: string[]</h2>
  <div class="tags">
    {#each tags as tag, i}
      <span class="tag">
        {tag}
        <button class="remove" onclick={() => removeTag(i)}>x</button>
      </span>
    {/each}
  </div>
  <div class="add-row">
    <input bind:value={newTag} placeholder="New tag" onkeydown={(e) => e.key === 'Enter' && addTag()} />
    <button onclick={addTag}>Add Tag</button>
  </div>
</section>

<div class="why-types">
  <h3>Why bother with types?</h3>
  <ul>
    <li><strong>Catch bugs early:</strong> TypeScript tells you <code>greet(42)</code> is wrong before you run it</li>
    <li><strong>Better autocomplete:</strong> Your editor knows what methods are available on each type</li>
    <li><strong>Self-documenting:</strong> Types show what a function expects and returns</li>
    <li><strong>Safer refactoring:</strong> Rename a property and TypeScript finds every usage</li>
  </ul>
</div>

<style>
  h1 { color: #333; }
  .notice {
    background: #dbeafe;
    border: 1px solid #93c5fd;
    padding: 0.75rem;
    border-radius: 6px;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  .type-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
  .type-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .type-card code {
    background: #4f46e5;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    align-self: flex-start;
    font-size: 0.8rem;
  }
  .value { font-weight: bold; color: #333; }
  label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
  input { padding: 0.3rem; border: 1px solid #ccc; border-radius: 4px; }
  input[type="number"] { width: 80px; }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin: 0;
  }
  .result { font-size: 1.1rem; margin: 0.5rem 0 0; }
  .score-list { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
  .score {
    background: #e0e0e0;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    font-weight: bold;
  }
  .score.high { background: #bbf7d0; color: #166534; }
  .add-row { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  button {
    padding: 0.4rem 0.8rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
  .tag {
    background: #e0e7ff;
    color: #3730a3;
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .remove {
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 0.7rem;
    padding: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .why-types {
    background: #f0fdf4;
    border-left: 4px solid #22c55e;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-top: 1.5rem;
  }
  .why-types h3 { margin: 0 0 0.5rem; }
  ul { padding-left: 1.2rem; }
  li { margin: 0.3rem 0; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
