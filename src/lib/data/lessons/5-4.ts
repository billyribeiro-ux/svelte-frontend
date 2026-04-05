import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '5-4',
		title: 'Browser Storage',
		phase: 2,
		module: 5,
		lessonIndex: 4
	},
	description: `Browsers give you simple key-value storage that survives page reloads. There are two flavours you'll use constantly:

- **localStorage** — persists until you (or the user) explicitly clear it. Use it for preferences, drafts, auth tokens.
- **sessionStorage** — cleared when the tab closes. Use it for per-tab wizard state or multi-step forms.

Both APIs are identical: \`setItem\`, \`getItem\`, \`removeItem\`, \`clear\`. Both store **only strings** — so to save objects or arrays, you use \`JSON.stringify\` on the way in and \`JSON.parse\` on the way out. Both have a ~5MB limit per origin. Both are **synchronous**, so don't dump megabytes in there.

One more superpower: the \`storage\` event fires in *other* tabs on the same origin when you change storage. This lets you synchronise state across tabs for free.`,
	objectives: [
		'Use localStorage and sessionStorage to persist key-value data',
		'Convert objects to JSON strings and back for storage',
		'Handle missing data, corrupted JSON, and quota errors gracefully',
		'Listen for the storage event to sync state across tabs',
		'Know the difference between localStorage, sessionStorage, cookies and IndexedDB'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === Preferences stored in localStorage ===
  let username = $state('');
  let theme = $state('light');
  let fontSize = $state(16);

  // === Session-only state ===
  let sessionNote = $state('');

  // === List of items ===
  let savedItems = $state([]);
  let newItem = $state('');

  // === Storage info ===
  let storageUsed = $state('0 KB');
  let keyCount = $state(0);

  // === Messaging ===
  let message = $state('');
  let messageKind = $state('info');

  // === Cross-tab sync ===
  let otherTabUpdate = $state('');

  function showMessage(text, kind = 'info') {
    message = text;
    messageKind = kind;
    setTimeout(() => {
      if (message === text) message = '';
    }, 2500);
  }

  // Load everything from storage on mount.
  $effect(() => {
    try {
      const rawPrefs = localStorage.getItem('preferences');
      if (rawPrefs) {
        const prefs = JSON.parse(rawPrefs);
        username = prefs.username ?? '';
        theme = prefs.theme ?? 'light';
        fontSize = prefs.fontSize ?? 16;
      }

      const rawItems = localStorage.getItem('items');
      if (rawItems) savedItems = JSON.parse(rawItems);

      const rawNote = sessionStorage.getItem('note');
      if (rawNote) sessionNote = rawNote;
    } catch (e) {
      showMessage('Could not load storage: ' + e.message, 'error');
    }
    updateStorageInfo();
  });

  // Listen for changes from OTHER tabs.
  $effect(() => {
    function handleStorage(event) {
      if (event.storageArea !== localStorage) return;
      otherTabUpdate = \`[\${new Date().toLocaleTimeString()}] Another tab changed \${event.key}\`;

      // Live-sync the items list if that was what changed.
      if (event.key === 'items' && event.newValue) {
        try {
          savedItems = JSON.parse(event.newValue);
        } catch {
          // ignore bad JSON
        }
      }
      updateStorageInfo();
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  });

  function savePreferences() {
    try {
      const prefs = { username, theme, fontSize };
      localStorage.setItem('preferences', JSON.stringify(prefs));
      showMessage('Preferences saved to localStorage', 'success');
      updateStorageInfo();
    } catch (e) {
      // QuotaExceededError is the classic failure — storage is full.
      showMessage('Save failed: ' + e.message, 'error');
    }
  }

  function saveSessionNote() {
    try {
      sessionStorage.setItem('note', sessionNote);
      showMessage('Note saved to sessionStorage (this tab only)', 'success');
      updateStorageInfo();
    } catch (e) {
      showMessage('Save failed: ' + e.message, 'error');
    }
  }

  function addItem() {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    savedItems = [...savedItems, trimmed];
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
    if (!confirm('Clear ALL localStorage and sessionStorage?')) return;
    localStorage.clear();
    sessionStorage.clear();
    username = '';
    theme = 'light';
    fontSize = 16;
    savedItems = [];
    sessionNote = '';
    showMessage('All storage cleared!', 'success');
    updateStorageInfo();
  }

  function updateStorageInfo() {
    let total = 0;
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null) continue;
      const val = localStorage.getItem(key) ?? '';
      total += key.length + val.length;
      count++;
    }
    // UTF-16 → 2 bytes per char
    const kb = ((total * 2) / 1024).toFixed(2);
    storageUsed = \`\${kb} KB / ~5120 KB\`;
    keyCount = count;
  }

  // Demo: try to corrupt the data and recover gracefully.
  function corruptAndRead() {
    localStorage.setItem('preferences', 'not valid JSON!!!');
    try {
      const raw = localStorage.getItem('preferences');
      JSON.parse(raw ?? '');
      showMessage('Somehow parsed invalid JSON?', 'info');
    } catch {
      showMessage('Caught corrupted JSON — resetting to defaults', 'error');
      localStorage.removeItem('preferences');
      username = '';
      theme = 'light';
      fontSize = 16;
      updateStorageInfo();
    }
  }
</script>

<h1>Browser Storage</h1>

<p class="lead">
  Three APIs, three lifetimes. <code>localStorage</code> lives forever,
  <code>sessionStorage</code> lives for one tab, and cookies live wherever you set them to.
  In this lesson we'll use the first two, plus JSON round-tripping.
</p>

<section>
  <h2>Preferences (localStorage)</h2>
  <div class="form">
    <label>
      Username
      <input type="text" bind:value={username} placeholder="Your name" />
    </label>
    <label>
      Theme
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

  <div
    class="preview"
    style="font-size: {fontSize}px; background: {theme === 'dark' ? '#333' : '#fff'}; color: {theme === 'dark' ? '#fff' : '#333'};"
  >
    Hello{username ? ', ' + username : ''}! This is {fontSize}px on the {theme} theme.
  </div>
</section>

<section>
  <h2>Session Note (sessionStorage)</h2>
  <p class="note">
    This persists across reloads <em>in this tab only</em>. Close the tab and it's gone.
    Open a second tab to see the difference.
  </p>
  <textarea bind:value={sessionNote} rows="3" placeholder="Write something..."></textarea>
  <button onclick={saveSessionNote}>Save Session Note</button>
</section>

<section>
  <h2>Items List (JSON in localStorage)</h2>
  <p class="note">Each item is stored as a string, so we <code>JSON.stringify</code> the array.</p>
  <div class="add-row">
    <input
      bind:value={newItem}
      placeholder="Add an item"
      onkeydown={(e) => e.key === 'Enter' && addItem()}
    />
    <button onclick={addItem}>Add</button>
  </div>
  {#if savedItems.length > 0}
    <ul>
      {#each savedItems as item, i (i + item)}
        <li>
          <span>{item}</span>
          <button class="remove" onclick={() => removeItem(i)}>&times;</button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="empty">No items saved yet.</p>
  {/if}
</section>

<section>
  <h2>Error Recovery</h2>
  <p class="note">
    What if the data in storage is corrupted (bad JSON from an old version,
    another app writing there, etc.)? Always wrap <code>JSON.parse</code> in try/catch.
  </p>
  <button class="danger-soft" onclick={corruptAndRead}>Simulate corrupt data &amp; recover</button>
</section>

<section class="info-box">
  <h2>Storage Info</h2>
  <div class="info-grid">
    <div><span class="m-label">Used</span><span class="m-val">{storageUsed}</span></div>
    <div><span class="m-label">Keys</span><span class="m-val">{keyCount}</span></div>
    <div><span class="m-label">Quota</span><span class="m-val">~5 MB</span></div>
  </div>
  {#if otherTabUpdate}
    <p class="tab-update">{otherTabUpdate}</p>
  {/if}
  <button class="danger" onclick={clearAll}>Clear All Storage</button>
</section>

{#if message}
  <p class="message {messageKind}">{message}</p>
{/if}

<div class="compare">
  <h3>Which storage should I use?</h3>
  <table>
    <thead>
      <tr><th>API</th><th>Lifetime</th><th>Size</th><th>Sync?</th><th>Best for</th></tr>
    </thead>
    <tbody>
      <tr><td><code>localStorage</code></td><td>Until cleared</td><td>~5 MB</td><td>Yes</td><td>Preferences, drafts</td></tr>
      <tr><td><code>sessionStorage</code></td><td>Tab lifetime</td><td>~5 MB</td><td>Yes</td><td>Per-tab wizard state</td></tr>
      <tr><td>Cookies</td><td>Configurable</td><td>~4 KB</td><td>Yes (sent to server)</td><td>Auth, server state</td></tr>
      <tr><td>IndexedDB</td><td>Until cleared</td><td>Huge</td><td>No (async)</td><td>Large structured data</td></tr>
    </tbody>
  </table>
</div>

<style>
  h1 { color: #333; }
  .lead { color: #555; max-width: 720px; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 10px; }
  section h2 { margin-top: 0; }

  .form { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
  label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
  input[type='text'], select, textarea {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
  }
  textarea {
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
  }

  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  button:hover { background: #4338ca; }
  .danger { background: #dc2626; }
  .danger:hover { background: #b91c1c; }
  .danger-soft { background: #f59e0b; }
  .danger-soft:hover { background: #d97706; }

  .preview {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    transition: all 0.3s;
  }

  .add-row { display: flex; gap: 0.5rem; margin-bottom: 0.5rem; }
  .add-row input {
    flex: 1;
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

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
  .note { font-size: 0.85rem; color: #666; margin: 0.25rem 0 0.5rem; }

  .info-box { background: #f0f4ff; }
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 0.5rem;
    margin: 0.5rem 0;
  }
  .info-grid > div {
    background: white;
    border-radius: 6px;
    padding: 0.5rem;
    text-align: center;
  }
  .m-label { display: block; font-size: 0.7rem; text-transform: uppercase; color: #888; }
  .m-val { font-weight: bold; font-family: monospace; color: #333; }
  .tab-update {
    background: #fef3c7;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin: 0.5rem 0;
  }

  .message {
    margin-top: 1rem;
    padding: 0.5rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  .message.success { background: #e8f5e9; color: #2e7d32; }
  .message.error { background: #ffebee; color: #c62828; }
  .message.info { background: #e3f2fd; color: #1565c0; }

  .compare {
    background: #fafafa;
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid #e5e7eb;
  }
  .compare h3 { margin: 0 0 0.5rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.4rem 0.5rem; text-align: left; border-bottom: 1px solid #eee; font-size: 0.85rem; }
  th { background: #f5f5f5; }
  code { background: #e5e7eb; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
