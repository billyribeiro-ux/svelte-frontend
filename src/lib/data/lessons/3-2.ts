import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-2',
		title: 'Loops & Recursion',
		phase: 1,
		module: 3,
		lessonIndex: 2
	},
	description: `Loops let you repeat operations — building arrays of data, processing items, or generating content programmatically. Recursion takes this further by having a function call itself, which is perfect for tree-like structures such as file browsers or nested menus.

This lesson covers for, for...of, and while loops in script, plus a recursive component that renders a nested file tree.`,
	objectives: [
		'Use for, for...of, and while loops in script blocks',
		'Understand recursion with a clear base case',
		'Build a recursive component for tree-structured data'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import FileTree from './FileTree.svelte';

  // for loop — generate data
  let squares = [];
  for (let i = 1; i <= 10; i++) {
    squares.push({ n: i, square: i * i });
  }

  // for...of loop — process data
  const words = ['Hello', 'Svelte', 'World'];
  let uppercased = [];
  for (const word of words) {
    uppercased.push(word.toUpperCase());
  }

  // while loop — Fibonacci sequence
  let fibs = [0, 1];
  while (fibs.length < 10) {
    const len = fibs.length;
    fibs.push(fibs[len - 1] + fibs[len - 2]);
  }

  // Recursive data structure — file tree
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
            { name: 'api.js', type: 'file' }
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
</script>

<h1>Loops & Recursion</h1>

<section>
  <h2>for loop — Squares</h2>
  <div class="grid">
    {#each squares as { n, square }}
      <div class="cell">{n}<sup>2</sup> = {square}</div>
    {/each}
  </div>
</section>

<section>
  <h2>for...of — Uppercase</h2>
  <p>{words.join(', ')} &rarr; {uppercased.join(', ')}</p>
</section>

<section>
  <h2>while — Fibonacci</h2>
  <p>{fibs.join(', ')}</p>
</section>

<section>
  <h2>Recursive Component — File Tree</h2>
  <div class="tree-container">
    <FileTree items={fileTree} depth={0} />
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .grid { display: flex; gap: 8px; flex-wrap: wrap; }
  .cell {
    padding: 6px 12px; background: #f8f8f8; border-radius: 4px;
    font-size: 13px; color: #444; font-family: monospace;
  }
  .tree-container {
    background: #1e1e1e; color: #d4d4d4; padding: 16px;
    border-radius: 8px; font-family: monospace; font-size: 14px;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'FileTree.svelte',
			content: `<script>
  let { items = [], depth = 0 } = $props();
</script>

<!-- Recursive component: renders itself for child folders -->
{#each items as item}
  <div class="item" style="padding-left: {depth * 16}px">
    {#if item.type === 'folder'}
      <span class="folder">📁 {item.name}/</span>
      {#if item.children}
        <!-- Base case: recursion stops when there are no children -->
        <svelte:self items={item.children} depth={depth + 1} />
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
