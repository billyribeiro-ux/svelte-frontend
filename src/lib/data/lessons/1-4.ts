import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-4',
		title: 'Spread & Copying',
		phase: 1,
		module: 1,
		lessonIndex: 4
	},
	description: `The spread operator (...) lets you expand arrays and objects into new ones, making it easy to copy, merge, and extend data. It's essential for creating new references rather than accidentally sharing mutable data.

This lesson covers spreading arrays and objects, merging data, and the critical difference between shallow and deep copies.`,
	objectives: [
		'Use the spread operator to copy and merge arrays and objects',
		'Understand the difference between shallow and deep copying',
		'Apply spread patterns to create new state without mutating the original'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Spread arrays
  const fruits = ['apple', 'banana'];
  const moreFruits = ['cherry', 'date'];
  const allFruits = [...fruits, ...moreFruits, 'elderberry'];

  // Spread objects
  const defaults = { theme: 'light', fontSize: 14, lang: 'en' };
  const userPrefs = { theme: 'dark', fontSize: 18 };
  const merged = { ...defaults, ...userPrefs }; // userPrefs overrides defaults

  // Shallow copy demo
  let original = $state({
    name: 'Alice',
    hobbies: ['reading', 'coding']
  });

  let shallowCopy = $state({ ...original });

  function addHobbyToOriginal() {
    original.hobbies.push('gaming');
    // The shallow copy's hobbies array is the SAME reference!
    // Both will show the change
  }

  function changeOriginalName() {
    original.name = 'Bob';
    // This does NOT affect the copy — primitive values are copied
  }

  // Creating new state with spread (the right way)
  let items = $state(['todo 1', 'todo 2']);
  let newItem = $state('');

  function addItem() {
    if (newItem.trim()) {
      items = [...items, newItem.trim()];
      newItem = '';
    }
  }

  function removeFirst() {
    const [, ...remaining] = items;
    items = remaining;
  }

  // Spread for overriding specific properties
  let card = $state({ title: 'My Card', color: '#ff3e00', size: 'medium' });

  function makeBlue() {
    card = { ...card, color: '#569cd6' };
  }

  function makeLarge() {
    card = { ...card, size: 'large' };
  }

  function resetCard() {
    card = { title: 'My Card', color: '#ff3e00', size: 'medium' };
  }
</script>

<h1>Spread & Copying</h1>

<section>
  <h2>Spread Arrays</h2>
  <p>fruits: {fruits.join(', ')}</p>
  <p>allFruits: {allFruits.join(', ')}</p>
</section>

<section>
  <h2>Spread Objects (Merge)</h2>
  <p>defaults: theme={defaults.theme}, fontSize={defaults.fontSize}</p>
  <p>merged: theme={merged.theme}, fontSize={merged.fontSize}, lang={merged.lang}</p>
  <p class="note">Later spreads override earlier ones</p>
</section>

<section>
  <h2>Shallow Copy Gotcha</h2>
  <p>Original: {original.name} — hobbies: {original.hobbies.join(', ')}</p>
  <p>Copy: {shallowCopy.name} — hobbies: {shallowCopy.hobbies.join(', ')}</p>
  <div class="buttons">
    <button onclick={changeOriginalName}>Change Original Name</button>
    <button onclick={addHobbyToOriginal}>Add Hobby to Original</button>
  </div>
  <p class="note">Primitives are independent. Nested arrays/objects share references!</p>
</section>

<section>
  <h2>Spread to Add Items</h2>
  <div class="input-row">
    <input bind:value={newItem} placeholder="New item..." onkeydown={(e) => e.key === 'Enter' && addItem()} />
    <button onclick={addItem}>Add</button>
    <button onclick={removeFirst} disabled={items.length === 0}>Remove First</button>
  </div>
  <ul>
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
</section>

<section>
  <h2>Spread to Override Properties</h2>
  <div class="card" style="border-color: {card.color}; font-size: {card.size === 'large' ? '18px' : '14px'};">
    <p><strong>{card.title}</strong></p>
    <p>Color: {card.color} | Size: {card.size}</p>
  </div>
  <div class="buttons">
    <button onclick={makeBlue}>Make Blue</button>
    <button onclick={makeLarge}>Make Large</button>
    <button onclick={resetCard}>Reset</button>
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .note { color: #999; font-size: 12px; font-style: italic; }
  .input-row { display: flex; gap: 8px; margin-bottom: 8px; }
  input { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; flex: 1; }
  ul { list-style: none; padding: 0; }
  li { padding: 4px 8px; border-bottom: 1px solid #eee; color: #444; font-size: 14px; }
  .card { border: 2px solid; padding: 12px; border-radius: 8px; margin: 8px 0; }
  .buttons { display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
