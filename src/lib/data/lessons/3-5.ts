import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '3-5',
		title: 'String Methods',
		phase: 1,
		module: 3,
		lessonIndex: 5
	},
	description: `Strings are everywhere in web apps — user input, API responses, display text, URLs. JavaScript has a rich set of string methods for searching, splitting, joining, replacing, and transforming text. Combined with template literals, they give you complete control over text processing.

This lesson covers the most commonly used string methods through an interactive text processing tool.`,
	objectives: [
		'Use string methods like trim, split, join, includes, and replace',
		'Transform strings with toUpperCase, toLowerCase, and slice',
		'Build dynamic text with template literals and string manipulation'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let input = $state('  Hello, Svelte World!  ');

  // Common string methods
  const trimmed = $derived(input.trim());
  const upper = $derived(input.toUpperCase());
  const lower = $derived(input.toLowerCase());
  const length = $derived(input.length);
  const words = $derived(trimmed.split(' ').filter(w => w.length > 0));
  const wordCount = $derived(words.length);
  const reversed = $derived(trimmed.split('').reverse().join(''));
  const slug = $derived(
    trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  );

  // Search methods
  let searchTerm = $state('Svelte');
  const includesSearch = $derived(input.includes(searchTerm));
  const indexOfSearch = $derived(input.indexOf(searchTerm));
  const startsWithSearch = $derived(trimmed.startsWith(searchTerm));
  const endsWithSearch = $derived(trimmed.endsWith(searchTerm));

  // Replace
  let replaceFrom = $state('World');
  let replaceTo = $state('Developer');
  const replaced = $derived(input.replace(replaceFrom, replaceTo));

  // Split & Join
  let separator = $state(',');
  let csvInput = $state('apple,banana,cherry,date');
  const splitResult = $derived(csvInput.split(separator));
  const joined = $derived(splitResult.join(' | '));

  // Slice / Substring
  let sliceStart = $state(0);
  let sliceEnd = $state(5);
  const sliced = $derived(trimmed.slice(sliceStart, sliceEnd));
</script>

<h1>String Methods</h1>

<section>
  <h2>Input</h2>
  <input bind:value={input} class="wide" />
  <p>Length: {length} | Word count: {wordCount}</p>
</section>

<section>
  <h2>Transform</h2>
  <div class="results">
    <div class="row"><span class="label">trim():</span> <code>"{trimmed}"</code></div>
    <div class="row"><span class="label">toUpperCase():</span> <code>"{upper}"</code></div>
    <div class="row"><span class="label">toLowerCase():</span> <code>"{lower}"</code></div>
    <div class="row"><span class="label">reversed:</span> <code>"{reversed}"</code></div>
    <div class="row"><span class="label">slug:</span> <code>"{slug}"</code></div>
  </div>
</section>

<section>
  <h2>Search</h2>
  <input bind:value={searchTerm} placeholder="Search for..." />
  <div class="results">
    <div class="row"><span class="label">includes("{searchTerm}"):</span> <span class:yes={includesSearch} class:no={!includesSearch}>{includesSearch}</span></div>
    <div class="row"><span class="label">indexOf("{searchTerm}"):</span> <span>{indexOfSearch}</span></div>
    <div class="row"><span class="label">startsWith("{searchTerm}"):</span> <span class:yes={startsWithSearch} class:no={!startsWithSearch}>{startsWithSearch}</span></div>
    <div class="row"><span class="label">endsWith("{searchTerm}"):</span> <span class:yes={endsWithSearch} class:no={!endsWithSearch}>{endsWithSearch}</span></div>
  </div>
</section>

<section>
  <h2>Replace</h2>
  <div class="input-row">
    <input bind:value={replaceFrom} placeholder="Find..." />
    <span>→</span>
    <input bind:value={replaceTo} placeholder="Replace with..." />
  </div>
  <p>Result: <code>"{replaced}"</code></p>
</section>

<section>
  <h2>Split & Join</h2>
  <div class="input-row">
    <input bind:value={csvInput} class="wide" />
    <input bind:value={separator} style="width: 40px; text-align: center;" />
  </div>
  <p>Split: [{splitResult.map(s => \`"\${s}"\`).join(', ')}]</p>
  <p>Joined with " | ": <code>{joined}</code></p>
</section>

<section>
  <h2>Slice</h2>
  <div class="input-row">
    <label>Start: <input type="number" bind:value={sliceStart} min="0" max={trimmed.length} /></label>
    <label>End: <input type="number" bind:value={sliceEnd} min="0" max={trimmed.length} /></label>
  </div>
  <p>slice({sliceStart}, {sliceEnd}): <code>"{sliced}"</code></p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
  .results { display: flex; flex-direction: column; gap: 4px; }
  .row { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #444; }
  .label { color: #666; font-family: monospace; font-size: 12px; min-width: 160px; }
  .yes { color: #4ec9b0; font-weight: 600; }
  .no { color: #f44747; }
  .input-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
  input { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  input[type="number"] { width: 60px; }
  .wide { width: 100%; }
  label { font-size: 13px; color: #444; display: flex; align-items: center; gap: 4px; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
