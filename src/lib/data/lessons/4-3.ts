import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '4-3',
		title: 'Keyboard Events & Accessibility',
		phase: 1,
		module: 4,
		lessonIndex: 3
	},
	description: `A truly good app works without a mouse. That's not an accessibility afterthought — it's core usability. Keyboard-only users aren't a niche: power users live on the keyboard, screen-reader users navigate by tab stops, and many motor disabilities make precise mouse movement difficult or impossible. Every click in your app should have a keyboard equivalent, and every modal should close on \`Escape\`.

JavaScript gives you three keyboard events: \`keydown\` (fires when a key goes down, and repeats while held), \`keyup\` (fires when released), and the legacy \`keypress\` (avoid; use \`keydown\`). The event object carries the crucial info: \`event.key\` is the logical key value (\`'Enter'\`, \`'Escape'\`, \`'ArrowUp'\`, \`'a'\`), \`event.code\` is the physical key (layout-independent), and \`event.ctrlKey\`/\`shiftKey\`/\`altKey\`/\`metaKey\` are booleans for the modifier keys.

The patterns you'll implement over and over: **Enter to submit** on inputs, **Escape to close** modals and dropdowns, **Arrow keys** to navigate lists (plus Home/End to jump to ends), **Tab** to move focus (with \`tabindex\` to make non-interactive elements focusable), and **Ctrl/Cmd + Letter** for keyboard shortcuts. There's also a subtler pattern called the **focus trap**: when a modal is open, Tab should cycle *within* the modal — never escape back to the background content. You build one by catching Tab at the modal's boundary elements and wrapping focus with \`.focus()\`.

Accessibility-wise, a few rules of thumb save you headaches. If you put a click handler on a non-button element, you almost always need a keydown handler too (Svelte's accessibility warnings will remind you). \`tabindex="0"\` adds an element to the natural tab order; \`tabindex="-1"\` removes it from tab but keeps it programmatically focusable. ARIA roles (\`role="listbox"\`, \`role="option"\`, \`aria-selected\`) tell screen readers what your custom widgets *are*.

Pitfalls: forgetting \`event.preventDefault()\` on arrow keys (they scroll the page by default), using \`event.keyCode\` (deprecated — use \`event.key\`), testing only with a mouse (always try your interface with Tab/Shift+Tab and the keyboard), and trapping focus in a modal without a way to close it.`,
	objectives: [
		'Handle keyboard events with onkeydown and event.key, event.code, modifier flags',
		'Implement Enter-to-submit and Escape-to-close patterns',
		'Build arrow-key list navigation with Home/End support',
		'Create a focus trap that cycles Tab within a modal',
		'Register global keyboard shortcuts like Ctrl/Cmd+K with svelte:window',
		'Use tabindex and ARIA roles to make custom widgets keyboard-accessible'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === KEYBOARD EVENTS & ACCESSIBILITY ===
  // A truly usable app works with keyboards, not just mice. Every click
  // should have a keyboard equivalent. Every modal should close on
  // Escape. Every list should navigate with arrow keys. This isn't
  // extra polish — it's what makes apps usable for screen-reader users,
  // keyboard power users, and anyone on a device without a pointer.
  //
  // The three main keyboard events:
  //   onkeydown — fired when a key goes down (repeats while held)
  //   onkeyup   — fired when a key is released
  //   onkeypress — legacy; avoid, use keydown instead
  //
  // Key properties on the event object:
  //   event.key       — logical key: 'Enter', 'Escape', 'ArrowUp', 'a'
  //   event.code      — physical key: 'Enter', 'KeyA' (layout-independent)
  //   event.ctrlKey, shiftKey, altKey, metaKey — modifier booleans
  //   event.repeat    — true if the key is being auto-repeated

  // --- Global key logger ---
  let lastKey = $state('');
  let keyModifiers = $state('');
  function handleGlobalKeydown(event) {
    lastKey = event.key;
    const mods = [];
    if (event.ctrlKey)  mods.push('Ctrl');
    if (event.shiftKey) mods.push('Shift');
    if (event.altKey)   mods.push('Alt');
    if (event.metaKey)  mods.push('Meta');
    keyModifiers = mods.join(' + ');
  }

  // --- Example 1: Enter to submit ---
  let searchQuery = $state('');
  let searchResult = $state('');
  function handleSearchKeydown(event) {
    if (event.key === 'Enter') {
      searchResult = \\\`Searched for: "\\\${searchQuery}"\\\`;
    }
  }

  // --- Example 2: Escape to close modal ---
  let showModal = $state(false);
  function openModal() { showModal = true; }
  function closeModal() { showModal = false; }

  // --- Example 3: Arrow-key list navigation (roving tabindex pattern) ---
  const items = ['Home', 'About', 'Projects', 'Blog', 'Contact', 'Settings'];
  let activeIndex = $state(0);
  let selectedItem = $state('');
  function handleNavKeydown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      event.preventDefault();
      activeIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      activeIndex = items.length - 1;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectedItem = items[activeIndex];
    }
  }

  // --- Example 4: Focus trap inside a modal ---
  // When a modal is open, Tab should CYCLE through only its focusable
  // elements — never escaping to the background.
  function handleModalTrap(event) {
    if (event.key === 'Escape') { closeModal(); return; }
    if (event.key !== 'Tab') return;

    const modal = event.currentTarget;
    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // --- Example 5: Keyboard shortcut (Ctrl/Cmd + K) ---
  let commandPaletteOpen = $state(false);
  function handleAppShortcuts(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      commandPaletteOpen = !commandPaletteOpen;
    }
  }

  function handleWindowKeydown(event) {
    handleGlobalKeydown(event);
    handleAppShortcuts(event);
  }
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<h1>Keyboard Events & Accessibility</h1>

<section>
  <h2>1. Key Press Monitor</h2>
  <p class="hint">Press any key — the svelte:window listener catches it.</p>
  <div class="key-display">
    <div class="key-box">
      <span class="key-label">Key</span>
      <span class="key-value">{lastKey || '...'}</span>
    </div>
    {#if keyModifiers}
      <div class="key-box modifier">
        <span class="key-label">Modifiers</span>
        <span class="key-value">{keyModifiers}</span>
      </div>
    {/if}
  </div>
</section>

<section>
  <h2>2. Enter to Submit</h2>
  <input
    bind:value={searchQuery}
    onkeydown={handleSearchKeydown}
    placeholder="Type and press Enter..."
  />
  {#if searchResult}<p class="result">{searchResult}</p>{/if}
</section>

<section>
  <h2>3. Arrow-key List Navigation</h2>
  <p class="hint">Tab into the list, then ↑/↓ to navigate, Home/End to jump, Enter to select.</p>
  <ul class="nav-list" tabindex="0" role="listbox" aria-label="Navigation" onkeydown={handleNavKeydown}>
    {#each items as item, i (item)}
      <li
        class:active={activeIndex === i}
        role="option"
        aria-selected={activeIndex === i}
      >
        {item}
      </li>
    {/each}
  </ul>
  {#if selectedItem}<p class="result">Selected: <strong>{selectedItem}</strong></p>{/if}
</section>

<section>
  <h2>4. Escape to Close + Focus Trap</h2>
  <p class="hint">Tab inside the modal — focus cycles between its buttons. Escape closes it.</p>
  <button onclick={openModal}>Open Modal</button>
  {#if showModal}
    <div
      class="modal-backdrop"
      role="presentation"
      onclick={closeModal}
    >
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Demo modal"
        tabindex="-1"
        onkeydown={handleModalTrap}
        onclick={(e) => e.stopPropagation()}
      >
        <h3>Focus-Trapped Modal</h3>
        <p>Press <kbd>Tab</kbd> — focus wraps around inside.</p>
        <p>Press <kbd>Escape</kbd> to close.</p>
        <input placeholder="Type here..." />
        <div class="modal-actions">
          <button onclick={closeModal}>Cancel</button>
          <button onclick={closeModal}>Confirm</button>
        </div>
      </div>
    </div>
  {/if}
</section>

<section>
  <h2>5. Keyboard Shortcut: Ctrl/Cmd + K</h2>
  <p class="hint">Press <kbd>Ctrl</kbd> + <kbd>K</kbd> (or <kbd>Cmd</kbd> + <kbd>K</kbd>) to toggle the command palette.</p>
  {#if commandPaletteOpen}
    <div class="palette">
      <input placeholder="Type a command..." />
      <div class="palette-item">📄 New file</div>
      <div class="palette-item">📁 Open folder</div>
      <div class="palette-item">⚙️ Settings</div>
    </div>
  {:else}
    <p class="closed">Palette is closed</p>
  {/if}
</section>

<section>
  <h2>6. Tabindex &amp; Focus Order</h2>
  <p class="hint">Tab through these. tabindex="0" makes non-interactive elements focusable; -1 removes from tab order.</p>
  <div class="focus-demo">
    <button>Normal button</button>
    <div class="focus-box" tabindex="0" role="button">tabindex=0</div>
    <div class="focus-box" tabindex="0" role="button">tabindex=0</div>
    <div class="focus-box" tabindex="-1" role="button">tabindex=-1 (programmatic only)</div>
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  h3 { color: #333; margin: 0 0 8px 0; }
  section { margin-bottom: 20px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  .result { color: #2d8a6e; font-weight: 600; }
  .closed { color: #999; font-style: italic; font-size: 13px; }
  strong { color: #222; }
  .key-display { display: flex; gap: 12px; margin: 8px 0; }
  .key-box { background: #1e1e1e; border-radius: 8px; padding: 12px 20px; text-align: center; min-width: 80px; }
  .key-label { display: block; font-size: 11px; color: #888; text-transform: uppercase; }
  .key-value { display: block; font-size: 22px; color: #4ec9b0; font-family: monospace; font-weight: bold; }
  .modifier .key-value { color: #dcdcaa; font-size: 16px; }
  kbd { background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px; padding: 2px 6px; font-family: monospace; font-size: 12px; }
  input { padding: 8px 12px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; width: 100%; box-sizing: border-box; font-family: inherit; }
  .nav-list { list-style: none; padding: 0; border: 2px solid #eee; border-radius: 6px; outline: none; margin: 0; }
  .nav-list:focus { border-color: #ff3e00; box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.15); }
  .nav-list li { padding: 8px 16px; font-size: 14px; color: #444; border-bottom: 1px solid #f0f0f0; }
  .nav-list li:last-child { border-bottom: none; }
  .nav-list li.active { background: #fff5f2; color: #ff3e00; font-weight: 600; }
  .modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5); display: flex; align-items: center;
    justify-content: center; z-index: 100;
  }
  .modal {
    background: white; border-radius: 12px; padding: 24px; max-width: 400px;
    width: 90%; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2); outline: none;
  }
  .modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }
  .palette { border: 2px solid #ff3e00; border-radius: 8px; padding: 8px; background: white; }
  .palette-item { padding: 8px 12px; font-size: 13px; color: #444; cursor: pointer; border-radius: 4px; }
  .palette-item:hover { background: #fff5f2; color: #ff3e00; }
  .focus-demo { display: flex; gap: 8px; flex-wrap: wrap; }
  .focus-box {
    padding: 10px 14px; border: 2px solid #eee; border-radius: 6px;
    cursor: pointer; font-size: 13px; color: #666; outline: none; transition: all 0.2s;
  }
  .focus-box:focus { border-color: #ff3e00; background: #fff5f2; color: #ff3e00; box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.2); }
  button { padding: 6px 14px; border: 2px solid #ff3e00; background: white; color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px; }
  button:hover { background: #ff3e00; color: white; }
  button:focus { outline: 2px solid #ff3e00; outline-offset: 2px; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
