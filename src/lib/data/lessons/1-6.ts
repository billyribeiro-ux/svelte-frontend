import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-6',
		title: 'Object Utilities',
		phase: 1,
		module: 1,
		lessonIndex: 6
	},
	description: `You have an object with unknown or dynamic keys — maybe it's settings from a user, scores from an exam, or stats from an API. How do you *iterate* over it? How do you render a UI for every key-value pair? That's where JavaScript's built-in \`Object\` utilities come in.

Three methods form the core toolkit: \`Object.keys(obj)\` gives you an array of the keys, \`Object.values(obj)\` gives you an array of the values, and \`Object.entries(obj)\` gives you an array of \`[key, value]\` pairs. Combined with \`{#each}\`, they let you render any object as a list — without hard-coding which keys exist.

On top of those, the \`in\` operator checks whether an object has a given property (safer than checking \`obj[key] !== undefined\`). And \`delete obj[key]\` removes a property. Together, these let you build dynamic UIs where users can add and remove fields at runtime.

This lesson takes you from simple key-listing through to a live, editable dashboard of student scores — complete with bar charts, averages, and dynamic add/remove.`,
	objectives: [
		'Use Object.keys(), Object.values(), and Object.entries() to inspect objects',
		'Iterate over object properties using {#each Object.entries()}',
		'Check for property existence with the "in" operator',
		'Add and remove properties dynamically (and trigger reactivity)',
		'Compute aggregates (sum, avg, min, max) from object values',
		'Use Object.fromEntries() to build an object from pairs'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // EXAMPLE 1 — The three object utility methods
  // ------------------------------------------------------------
  // Object.keys(obj)    → ['math', 'science', ...]
  // Object.values(obj)  → [92, 88, ...]
  // Object.entries(obj) → [['math', 92], ['science', 88], ...]
  // ============================================================
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

  // Aggregate stats — notice how easy this is once you have values
  const total = $derived(values.reduce((sum, v) => sum + v, 0));
  const average = $derived(values.length ? total / values.length : 0);
  const highest = $derived(values.length ? Math.max(...values) : 0);
  const lowest = $derived(values.length ? Math.min(...values) : 0);

  // ============================================================
  // EXAMPLE 2 — The "in" operator
  // ------------------------------------------------------------
  // Checks if a key exists on an object — even if its value is
  // falsy (0, '', false, null). Safer than obj.key !== undefined.
  // ============================================================
  let checkSubject = $state('math');
  const subjectExists = $derived(checkSubject in scores);

  // ============================================================
  // EXAMPLE 3 — Adding and removing properties dynamically
  // ------------------------------------------------------------
  // With $state, assigning a new key or deleting one is reactive.
  // This lets users literally shape the data at runtime.
  // ============================================================
  let newSubject = $state('');
  let newScore = $state(85);

  function addSubject() {
    const key = newSubject.trim().toLowerCase();
    if (key && !(key in scores)) {
      scores[key] = newScore;
      newSubject = '';
      newScore = 85;
    }
  }

  function removeSubject(key) {
    delete scores[key];
  }

  function resetScores() {
    scores = { math: 92, science: 88, english: 95, history: 79, art: 97 };
  }

  // ============================================================
  // EXAMPLE 4 — Object.fromEntries() (the reverse of entries())
  // ------------------------------------------------------------
  // Take an array of [key, value] pairs and turn it back into
  // an object. Handy for transforming / filtering objects.
  // ============================================================
  // Only keep subjects with a score >= 90 (a "top scores" object)
  const topScores = $derived(
    Object.fromEntries(
      Object.entries(scores).filter(([, score]) => score >= 90)
    )
  );

  // Double every score (for demo purposes)
  const doubled = $derived(
    Object.fromEntries(
      Object.entries(scores).map(([key, score]) => [key, score * 2])
    )
  );

  // ============================================================
  // EXAMPLE 5 — Helper for bar colors based on score
  // ============================================================
  function getBarColor(value) {
    if (value >= 90) return '#4ec9b0';  // teal — excellent
    if (value >= 80) return '#569cd6';  // blue — good
    if (value >= 70) return '#dcdcaa';  // yellow — ok
    return '#f44747';                   // red — needs work
  }
</script>

<h1>Object Utilities</h1>

<section>
  <h2>1. The Three Musketeers</h2>
  <p><strong>Object.keys:</strong> {keys.join(', ')}</p>
  <p><strong>Object.values:</strong> {values.join(', ')}</p>
  <p><strong>Object.entries:</strong></p>
  <ul class="pairs">
    {#each entries as [k, v] (k)}
      <li><code>["{k}", {v}]</code></li>
    {/each}
  </ul>
</section>

<section>
  <h2>2. Aggregate Stats</h2>
  <div class="stats">
    <div class="stat"><span class="label">Total</span><span class="val">{total}</span></div>
    <div class="stat"><span class="label">Average</span><span class="val">{average.toFixed(1)}</span></div>
    <div class="stat"><span class="label">Highest</span><span class="val">{highest}</span></div>
    <div class="stat"><span class="label">Lowest</span><span class="val">{lowest}</span></div>
  </div>
</section>

<section>
  <h2>3. Bar Chart via Object.entries()</h2>
  {#each entries as [subject, score] (subject)}
    <div class="bar-row">
      <span class="bar-label">{subject}</span>
      <div class="bar" style="width: {score}%; background: {getBarColor(score)};">
        {score}
      </div>
      <button class="remove" onclick={() => removeSubject(subject)}>x</button>
    </div>
  {/each}
</section>

<section>
  <h2>4. Add a Subject</h2>
  <div class="input-row">
    <input bind:value={newSubject} placeholder="Subject name..." onkeydown={(e) => e.key === 'Enter' && addSubject()} />
    <input type="number" bind:value={newScore} min="0" max="100" />
    <button onclick={addSubject}>Add</button>
    <button onclick={resetScores}>Reset</button>
  </div>
</section>

<section>
  <h2>5. The "in" Operator</h2>
  <div class="input-row">
    <input bind:value={checkSubject} placeholder="Check subject..." />
    <span class:exists={subjectExists} class:missing={!subjectExists}>
      "{checkSubject}" {subjectExists ? 'exists in scores' : 'not found'}
    </span>
  </div>
</section>

<section>
  <h2>6. Object.fromEntries() — transform objects</h2>
  <p><strong>Top scores (>= 90):</strong></p>
  <ul class="pairs">
    {#each Object.entries(topScores) as [k, v] (k)}
      <li><code>{k}: {v}</code></li>
    {:else}
      <li class="empty">(none)</li>
    {/each}
  </ul>
  <p><strong>Doubled scores (map):</strong></p>
  <ul class="pairs">
    {#each Object.entries(doubled) as [k, v] (k)}
      <li><code>{k}: {v}</code></li>
    {/each}
  </ul>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 22px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
  .pairs { list-style: none; padding: 0; margin: 4px 0; }
  .pairs li { padding: 2px 0; color: #444; font-size: 13px; }
  .empty { color: #999; font-style: italic; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .stat { background: #fff7f3; border: 2px solid #ffd4bf; border-radius: 6px; padding: 8px; text-align: center; }
  .stat .label { display: block; font-size: 11px; color: #999; text-transform: uppercase; }
  .stat .val { display: block; font-size: 20px; font-weight: 700; color: #ff3e00; margin-top: 4px; }
  .bar-row { display: flex; align-items: center; gap: 8px; margin: 6px 0; }
  .bar-label { width: 80px; font-size: 13px; color: #444; text-transform: capitalize; }
  .bar {
    height: 26px; border-radius: 4px; color: white; font-size: 12px;
    display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;
    min-width: 30px; font-weight: 600; transition: width 0.3s;
  }
  .remove {
    background: none; border: none; color: #f44747;
    cursor: pointer; font-size: 14px; padding: 2px 6px;
  }
  .remove:hover { background: #f44747; color: white; border-radius: 4px; }
  .input-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; flex-wrap: wrap; }
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
