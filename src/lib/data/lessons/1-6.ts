import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-6',
		title: 'Object Utilities',
		phase: 1,
		module: 1,
		lessonIndex: 6
	},
	description: `JavaScript provides built-in methods on the Object constructor that let you inspect and iterate over objects: Object.keys() gives you property names, Object.values() gives you values, and Object.entries() gives you [key, value] pairs. Combined with {#each}, these methods make it easy to display and work with object data dynamically.

You'll also learn the "in" operator for checking if a property exists.`,
	objectives: [
		'Use Object.keys(), Object.values(), and Object.entries() to inspect objects',
		'Iterate over object properties using {#each Object.entries()}',
		'Check for property existence with the "in" operator'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let scores = $state({
    math: 92,
    science: 88,
    english: 95,
    history: 79,
    art: 97
  });

  const keys = $derived(Object.keys(scores));
  const values = $derived(Object.values(scores));
  const entries = $derived(Object.entries(scores));
  const average = $derived(
    values.reduce((sum, v) => sum + v, 0) / values.length
  );

  // "in" operator
  let checkSubject = $state('math');
  const subjectExists = $derived(checkSubject in scores);

  // Dynamic property addition
  let newSubject = $state('');
  let newScore = $state(85);

  function addSubject() {
    if (newSubject.trim() && !(newSubject.trim().toLowerCase() in scores)) {
      scores[newSubject.trim().toLowerCase()] = newScore;
      newSubject = '';
      newScore = 85;
    }
  }

  function removeSubject(key) {
    delete scores[key];
    // Trigger reactivity by reassigning
    scores = { ...scores };
  }

  function getBarColor(value) {
    if (value >= 90) return '#4ec9b0';
    if (value >= 80) return '#569cd6';
    if (value >= 70) return '#dcdcaa';
    return '#f44747';
  }
</script>

<h1>Object Utilities</h1>

<section>
  <h2>Object.keys()</h2>
  <p>Subjects: {keys.join(', ')}</p>
  <p>Count: {keys.length} subjects</p>
</section>

<section>
  <h2>Object.values()</h2>
  <p>Scores: {values.join(', ')}</p>
  <p>Average: <strong>{average.toFixed(1)}</strong></p>
</section>

<section>
  <h2>Object.entries() with {'{#each}'}</h2>
  {#each entries as [subject, score]}
    <div class="bar-row">
      <span class="label">{subject}</span>
      <div class="bar" style="width: {score}%; background: {getBarColor(score)};">
        {score}
      </div>
      <button class="remove" onclick={() => removeSubject(subject)}>x</button>
    </div>
  {/each}
</section>

<section>
  <h2>"in" Operator</h2>
  <div class="input-row">
    <input bind:value={checkSubject} placeholder="Check subject..." />
    <span class:exists={subjectExists} class:missing={!subjectExists}>
      "{checkSubject}" {subjectExists ? 'exists' : 'not found'}
    </span>
  </div>
</section>

<section>
  <h2>Add Subject</h2>
  <div class="input-row">
    <input bind:value={newSubject} placeholder="Subject name..." />
    <input type="number" bind:value={newScore} min="0" max="100" />
    <button onclick={addSubject}>Add</button>
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .bar-row { display: flex; align-items: center; gap: 8px; margin: 4px 0; }
  .label { width: 70px; font-size: 13px; color: #444; text-transform: capitalize; }
  .bar {
    height: 24px; border-radius: 4px; color: white; font-size: 12px;
    display: flex; align-items: center; justify-content: flex-end; padding-right: 6px;
    min-width: 30px; transition: width 0.3s;
  }
  .remove { background: none; border: none; color: #f44747; cursor: pointer; font-size: 14px; padding: 2px 6px; }
  .input-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
  input { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  input[type="number"] { width: 70px; }
  .exists { color: #4ec9b0; font-weight: 600; }
  .missing { color: #f44747; font-style: italic; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
