import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '5-4',
		title: 'Browser Storage',
		phase: 2,
		module: 5,
		lessonIndex: 4
	},
	description: `Browsers give you simple key-value storage that persists across page reloads. localStorage keeps data until you explicitly clear it. sessionStorage keeps data only until the tab closes.

Both use string keys and string values, so you need JSON.stringify to save objects and JSON.parse to read them back. There's a 5MB limit per origin — plenty for user preferences, not for large datasets.

In this lesson you'll build a preferences panel that saves to localStorage and survives page refreshes. You'll also see the gotchas: storage only works in the browser (not on the server), and it's synchronous — never store huge amounts of data.`,
	objectives: [
		'Save and load data with localStorage and sessionStorage',
		'Convert objects to strings with JSON.stringify and back with JSON.parse',
		'Understand storage limits and when to use each storage type',
		'Handle the case where storage is unavailable or data is corrupted'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let username = $state('');
  let theme = $state('light');
  let fontSize = $state(16);
  let savedItems = $state([]);
  let newItem = $state('');
  let storageUsed = $state('');
  let message = $state('');

  // Load saved preferences on mount
  $effect(() => {
    try {
      const saved = localStorage.getItem('preferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        username = prefs.username || '';
        theme = prefs.theme || 'light';
        fontSize = prefs.fontSize || 16;
      }

      const items = localStorage.getItem('items');
      if (items) {
        savedItems = JSON.parse(items);
      }

      updateStorageInfo();
    } catch (e) {
      message = 'Could not load saved data: ' + e.message;
    }

    // Cleanup not needed here, but shown for pattern
    return () => {};
  });

  function savePreferences() {
    try {
      const prefs = { username, theme, fontSize };
      localStorage.setItem('preferences', JSON.stringify(prefs));
      message = 'Preferences saved!';
      updateStorageInfo();
    } catch (e) {
      message = 'Save failed: ' + e.message;
    }
  }

  function addItem() {
    if (!newItem.trim()) return;
    savedItems = [...savedItems, newItem.trim()];
    localStorage.setItem('items', JSON.stringify(savedItems));
    newItem = '';
    updateStorageInfo();
  }

  function removeItem(index) {
    savedItems = savedItems.filter((_, i) => i !== index);
    localStorage.setItem('items', JSON.stringify(savedItems));
    updateStorageInfo();
  }

  function clearAll() {
    localStorage.clear();
    username = '';
    theme = 'light';
    fontSize = 16;
    savedItems = [];
    message = 'All storage cleared!';
    updateStorageInfo();
  }

  function updateStorageInfo() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      total += key.length + localStorage.getItem(key).length;
    }
    const kb = (total * 2 / 1024).toFixed(2);
    storageUsed = kb + ' KB / 5,120 KB';
  }
</script>

<h1>Browser Storage</h1>

<section>
  <h2>Preferences (saved to localStorage)</h2>
  <div class="form">
    <label>
      Username:
      <input type="text" bind:value={username} placeholder="Your name" />
    </label>
    <label>
      Theme:
      <select bind:value={theme}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="auto">Auto</option>
      </select>
    </label>
    <label>
      Font size: {fontSize}px
      <input type="range" min="12" max="24" bind:value={fontSize} />
    </label>
  </div>
  <button onclick={savePreferences}>Save Preferences</button>

  <div class="preview" style="font-size: {fontSize}px; background: {theme === 'dark' ? '#333' : '#fff'}; color: {theme === 'dark' ? '#fff' : '#333'};">
    Hello{username ? ', ' + username : ''}! This is {fontSize}px on {theme} theme.
  </div>
</section>

<section>
  <h2>Saved Items List</h2>
  <div class="add-row">
    <input bind:value={newItem} placeholder="Add an item" onkeydown={(e) => e.key === 'Enter' && addItem()} />
    <button onclick={addItem}>Add</button>
  </div>
  {#if savedItems.length > 0}
    <ul>
      {#each savedItems as item, i}
        <li>
          {item}
          <button class="remove" onclick={() => removeItem(i)}>x</button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="empty">No items saved yet.</p>
  {/if}
</section>

<footer>
  <span class="storage-info">Storage used: {storageUsed}</span>
  <button class="danger" onclick={clearAll}>Clear All Storage</button>
</footer>

{#if message}
  <p class="message">{message}</p>
{/if}

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; }
  .form { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
  label { display: flex; align-items: center; gap: 0.5rem; }
  input[type="text"] { padding: 0.4rem; border: 1px solid #ccc; border-radius: 4px; }
  select { padding: 0.4rem; }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  button:hover { background: #4338ca; }
  .preview {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    transition: all 0.3s;
  }
  .add-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
  ul { list-style: none; padding: 0; }
  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }
  .remove {
    background: #ef4444;
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
  }
  .empty { color: #999; font-style: italic; }
  footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }
  .storage-info { font-size: 0.85rem; color: #666; }
  .danger { background: #dc2626; }
  .danger:hover { background: #b91c1c; }
  .message {
    margin-top: 1rem;
    padding: 0.5rem;
    background: #e8f5e9;
    border-radius: 4px;
    color: #2e7d32;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
