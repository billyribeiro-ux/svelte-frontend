import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '1-4',
		title: 'Spread & Copying',
		phase: 1,
		module: 1,
		lessonIndex: 4
	},
	description: `The three dots \`...\` — called the **spread operator** — are a tiny piece of syntax with enormous power. Spread "unpacks" an array or object so you can create a new one that includes those items plus extras. It's how you copy, merge, and extend data *without mutating the original*.

Why does that matter? Because in modern UI code, **immutability** is a powerful idea: instead of editing data in place (which can cause bugs and make change detection tricky), you create a **new** copy with the changes you want. Spread is the main tool for doing that.

There's one critical gotcha beginners must understand: \`{ ...obj }\` creates a **shallow** copy. Primitive values (strings, numbers, booleans) are duplicated, but nested objects and arrays are **shared by reference**. If you change a nested item through either the original or the copy, you'll see it in both. This lesson shows you exactly when that bites.

By the end of this lesson, you'll be comfortable copying arrays, merging objects, adding items without mutation, and avoiding the shallow-copy trap.`,
	objectives: [
		'Use the spread operator to copy arrays and objects',
		'Merge multiple objects with spread and understand override order',
		'Understand the difference between shallow and deep copying',
		'Add and remove items from arrays immutably using spread',
		'Override specific properties when creating new state',
		'Use rest parameters in functions for variable-length arguments'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // ============================================================
  // EXAMPLE 1 — Spreading arrays
  // ------------------------------------------------------------
  // [...a, ...b] creates a NEW array containing every item
  // from a followed by every item from b. Originals untouched.
  // ============================================================
  const fruits = ['apple', 'banana'];
  const moreFruits = ['cherry', 'date'];
  const allFruits = [...fruits, ...moreFruits, 'elderberry'];

  // Cloning an array (shallow)
  const fruitsCopy = [...fruits];

  // Prepending/appending items
  const withFirst = ['GRAPE', ...fruits];
  const withLast = [...fruits, 'KIWI'];

  // ============================================================
  // EXAMPLE 2 — Spreading objects (merge)
  // ------------------------------------------------------------
  // { ...a, ...b } creates a NEW object with all properties of
  // a, then b. If b has the same key as a, b wins ("later wins").
  // ============================================================
  const defaults = {
    theme: 'light',
    fontSize: 14,
    language: 'en',
    showSidebar: true
  };

  const userPrefs = {
    theme: 'dark',
    fontSize: 18
  };

  // userPrefs overrides theme and fontSize, but keeps language
  // and showSidebar from defaults. Classic "apply settings" pattern.
  const merged = { ...defaults, ...userPrefs };

  // ============================================================
  // EXAMPLE 3 — The SHALLOW copy gotcha
  // ------------------------------------------------------------
  // Watch closely: we spread an object to make a "copy", then
  // we mutate a nested array inside the original. Both the
  // original and the copy show the change — because they share
  // the SAME hobbies array.
  // ============================================================
  // Build a shared hobbies array FIRST so both objects below
  // point to the exact same array reference. Then the shallow
  // copy (made with ...original) captures that same reference.
  const sharedHobbies = ['reading', 'coding'];
  let original = $state({
    name: 'Alice',
    hobbies: sharedHobbies
  });

  // Shallow spread: 'name' is copied, but 'hobbies' is the SAME
  // array that 'original' uses — that's the whole point of the demo.
  let shallowCopy = $state({
    name: 'Alice',
    hobbies: sharedHobbies
  });

  function changeOriginalName() {
    // Primitives are independent — this ONLY affects original.
    original.name = original.name === 'Alice' ? 'Bob' : 'Alice';
  }

  function addHobbyToOriginal() {
    // Mutates the shared hobbies array. Both sides see it!
    original.hobbies.push('gaming');
  }

  function resetDemo() {
    const fresh = ['reading', 'coding'];
    original = { name: 'Alice', hobbies: fresh };
    shallowCopy = { name: 'Alice', hobbies: fresh };
  }

  // ============================================================
  // EXAMPLE 4 — Immutable array updates with spread
  // ------------------------------------------------------------
  // This is the "functional" style: never mutate, always return
  // a new array. It pairs beautifully with reactive state.
  // ============================================================
  let items = $state(['todo 1', 'todo 2']);
  let newItem = $state('');

  function addItem() {
    if (newItem.trim()) {
      items = [...items, newItem.trim()];  // append
      newItem = '';
    }
  }

  function prependItem() {
    items = ['*** URGENT ***', ...items];  // prepend
  }

  function removeFirst() {
    // Array destructuring + rest = "drop the first one"
    const [, ...remaining] = items;
    items = remaining;
  }

  function removeLast() {
    items = items.slice(0, -1);
  }

  // ============================================================
  // EXAMPLE 5 — Overriding specific object properties
  // ------------------------------------------------------------
  // Instead of mutating card.color, create a NEW card with the
  // color changed. This is the core pattern for immutable state.
  // ============================================================
  let card = $state({
    title: 'My Card',
    color: '#ff3e00',
    size: 'medium',
    rotation: 0
  });

  function makeBlue() {
    card = { ...card, color: '#569cd6' };
  }

  function makeGreen() {
    card = { ...card, color: '#4ec9b0' };
  }

  function makeLarge() {
    card = { ...card, size: 'large' };
  }

  function rotate() {
    card = { ...card, rotation: (card.rotation + 15) % 360 };
  }

  function resetCard() {
    card = { title: 'My Card', color: '#ff3e00', size: 'medium', rotation: 0 };
  }

  // ============================================================
  // EXAMPLE 6 — Rest parameters in functions
  // ------------------------------------------------------------
  // When a function should accept "any number of arguments",
  // use ...name to collect them into an array.
  // ============================================================
  function sum(...numbers) {
    return numbers.reduce((total, n) => total + n, 0);
  }

  const sumA = sum(1, 2, 3);
  const sumB = sum(10, 20, 30, 40, 50);
</script>

<h1>Spread &amp; Copying</h1>

<section>
  <h2>1. Spreading Arrays</h2>
  <p>fruits: <strong>{fruits.join(', ')}</strong></p>
  <p>allFruits: <strong>{allFruits.join(', ')}</strong></p>
  <p>withFirst: {withFirst.join(', ')}</p>
  <p>withLast: {withLast.join(', ')}</p>
  <p class="note">fruitsCopy is a separate array: {fruitsCopy.join(', ')}</p>
</section>

<section>
  <h2>2. Spreading Objects (merge)</h2>
  <p>defaults: theme={defaults.theme}, fontSize={defaults.fontSize}, lang={defaults.language}</p>
  <p>userPrefs: theme={userPrefs.theme}, fontSize={userPrefs.fontSize}</p>
  <p>merged: theme=<strong>{merged.theme}</strong>, fontSize=<strong>{merged.fontSize}</strong>, lang=<strong>{merged.language}</strong>, sidebar=<strong>{merged.showSidebar}</strong></p>
  <p class="note">Later spreads override earlier ones (userPrefs wins).</p>
</section>

<section>
  <h2>3. The Shallow Copy Gotcha</h2>
  <div class="compare">
    <div class="box">
      <h3>Original</h3>
      <p>name: <strong>{original.name}</strong></p>
      <p>hobbies: {original.hobbies.join(', ')}</p>
    </div>
    <div class="box">
      <h3>shallowCopy</h3>
      <p>name: <strong>{shallowCopy.name}</strong></p>
      <p>hobbies: {shallowCopy.hobbies.join(', ')}</p>
    </div>
  </div>
  <div class="buttons">
    <button onclick={changeOriginalName}>Change Original Name</button>
    <button onclick={addHobbyToOriginal}>Add Hobby to Original</button>
    <button onclick={resetDemo}>Reset</button>
  </div>
  <p class="note">
    Names diverge (primitives are copied). Hobbies stay in sync
    (nested arrays are shared by reference).
  </p>
</section>

<section>
  <h2>4. Immutable Array Updates</h2>
  <div class="input-row">
    <input bind:value={newItem} placeholder="New item..." onkeydown={(e) => e.key === 'Enter' && addItem()} />
    <button onclick={addItem}>Append</button>
    <button onclick={prependItem}>Prepend</button>
    <button onclick={removeFirst} disabled={items.length === 0}>- First</button>
    <button onclick={removeLast} disabled={items.length === 0}>- Last</button>
  </div>
  <ul>
    {#each items as item, i (i + item)}
      <li>{item}</li>
    {:else}
      <li class="empty">empty</li>
    {/each}
  </ul>
</section>

<section>
  <h2>5. Override Properties Immutably</h2>
  <div
    class="card"
    style="border-color: {card.color}; transform: rotate({card.rotation}deg); font-size: {card.size === 'large' ? '18px' : '14px'};"
  >
    <p><strong>{card.title}</strong></p>
    <p>color: {card.color}</p>
    <p>size: {card.size}</p>
    <p>rotation: {card.rotation}°</p>
  </div>
  <div class="buttons">
    <button onclick={makeBlue}>Blue</button>
    <button onclick={makeGreen}>Green</button>
    <button onclick={makeLarge}>Large</button>
    <button onclick={rotate}>Rotate</button>
    <button onclick={resetCard}>Reset</button>
  </div>
</section>

<section>
  <h2>6. Rest Parameters in Functions</h2>
  <p>sum(1, 2, 3) = <strong>{sumA}</strong></p>
  <p>sum(10, 20, 30, 40, 50) = <strong>{sumB}</strong></p>
  <p class="note">function sum(...numbers) {'{'} ... {'}'}</p>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  h3 { margin: 0 0 6px 0; color: #333; font-size: 14px; }
  section { margin-bottom: 24px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .note { color: #999; font-size: 12px; font-style: italic; }
  .input-row { display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
  input { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; flex: 1; min-width: 140px; }
  ul { list-style: none; padding: 0; }
  li { padding: 4px 8px; border-bottom: 1px solid #eee; color: #444; font-size: 14px; }
  .empty { color: #999; font-style: italic; }
  .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 8px 0; }
  .box { background: #f8f8f8; padding: 10px; border-radius: 6px; border: 1px solid #eee; }
  .card {
    border: 3px solid; padding: 14px; border-radius: 10px; margin: 8px 0;
    max-width: 240px; background: white; transition: all 0.3s;
  }
  .buttons { display: flex; gap: 8px; margin: 8px 0; flex-wrap: wrap; }
  button {
    padding: 6px 14px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover:not(:disabled) { background: #ff3e00; color: white; }
  button:disabled { opacity: 0.4; cursor: not-allowed; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
