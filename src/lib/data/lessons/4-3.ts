import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '4-3',
		title: 'Keyboard Events & Accessibility',
		phase: 1,
		module: 4,
		lessonIndex: 3
	},
	description: `A truly usable app works with keyboards, not just mice. Users should be able to press Escape to close modals, Enter to submit forms, and Tab to navigate between elements. These keyboard patterns also make your app accessible to users who rely on assistive technology.

This lesson covers keyboard event handling, focus management, tabindex, and common accessibility patterns.`,
	objectives: [
		'Handle keyboard events like Escape, Enter, and arrow keys',
		'Manage focus programmatically for accessible interactions',
		'Use tabindex and ARIA attributes for keyboard navigation'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // Modal pattern — Escape to close
  let showModal = $state(false);

  function openModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  function handleModalKeydown(event) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  // Arrow key navigation
  let items = ['Home', 'About', 'Projects', 'Blog', 'Contact'];
  let activeIndex = $state(0);

  function handleNavKeydown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectedItem = items[activeIndex];
    }
  }

  let selectedItem = $state('');

  // Key logger
  let lastKey = $state('');
  let keyModifiers = $state('');

  function handleGlobalKeydown(event) {
    lastKey = event.key;
    const mods = [];
    if (event.ctrlKey) mods.push('Ctrl');
    if (event.shiftKey) mods.push('Shift');
    if (event.altKey) mods.push('Alt');
    if (event.metaKey) mods.push('Meta');
    keyModifiers = mods.join(' + ');
  }

  // Enter to submit
  let searchQuery = $state('');
  let searchResult = $state('');

  function handleSearch(event) {
    if (event.key === 'Enter') {
      searchResult = \`Searched for: "\${searchQuery}"\`;
    }
  }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<h1>Keyboard Events & Accessibility</h1>

<section>
  <h2>Key Press Monitor</h2>
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
  <p class="note">Press any key to see it here</p>
</section>

<section>
  <h2>Enter to Submit</h2>
  <input
    bind:value={searchQuery}
    onkeydown={handleSearch}
    placeholder="Type and press Enter..."
  />
  {#if searchResult}
    <p class="result">{searchResult}</p>
  {/if}
</section>

<section>
  <h2>Escape to Close Modal</h2>
  <button onclick={openModal}>Open Modal</button>

  {#if showModal}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal-backdrop" onclick={closeModal} onkeydown={handleModalKeydown}>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={handleModalKeydown}>
        <h3>Modal Dialog</h3>
        <p>Press <kbd>Escape</kbd> to close, or click outside.</p>
        <button onclick={closeModal}>Close</button>
      </div>
    </div>
  {/if}
</section>

<section>
  <h2>Arrow Key Navigation</h2>
  <p class="note">Use arrow keys to navigate, Enter to select</p>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <ul class="nav-list" tabindex="0" onkeydown={handleNavKeydown} role="listbox" aria-label="Navigation items">
    {#each items as item, i}
      <li
        class:active={activeIndex === i}
        role="option"
        aria-selected={activeIndex === i}
        onclick={() => { activeIndex = i; selectedItem = item; }}
      >
        {item}
      </li>
    {/each}
  </ul>
  {#if selectedItem}
    <p class="result">Selected: {selectedItem}</p>
  {/if}
</section>

<section>
  <h2>Tabindex & Focus Order</h2>
  <p class="note">Tab through these elements. tabindex="0" makes non-interactive elements focusable.</p>
  <div class="focus-demo">
    <div class="focus-box" tabindex="0" role="button">First (tabindex=0)</div>
    <div class="focus-box" tabindex="0" role="button">Second (tabindex=0)</div>
    <div class="focus-box" tabindex="0" role="button">Third (tabindex=0)</div>
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  h3 { color: #333; margin: 0 0 8px 0; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .note { color: #999; font-size: 12px; font-style: italic; }
  .result { color: #4ec9b0; font-weight: 600; }
  .key-display { display: flex; gap: 12px; margin: 8px 0; }
  .key-box {
    background: #1e1e1e; border-radius: 8px; padding: 12px 20px; text-align: center;
    min-width: 80px;
  }
  .key-label { display: block; font-size: 11px; color: #888; text-transform: uppercase; }
  .key-value { display: block; font-size: 24px; color: #4ec9b0; font-family: monospace; font-weight: bold; }
  .modifier .key-value { color: #dcdcaa; font-size: 16px; }
  kbd {
    background: #f0f0f0; border: 1px solid #ccc; border-radius: 3px;
    padding: 2px 6px; font-family: monospace; font-size: 13px;
  }
  input {
    padding: 8px 12px; border: 2px solid #ddd; border-radius: 6px;
    font-size: 14px; width: 100%; box-sizing: border-box;
  }
  .modal-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0, 0, 0, 0.5); display: flex; align-items: center;
    justify-content: center; z-index: 100;
  }
  .modal {
    background: white; border-radius: 12px; padding: 24px; max-width: 400px;
    width: 90%; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }
  .nav-list {
    list-style: none; padding: 0; border: 2px solid #eee; border-radius: 6px;
    outline: none;
  }
  .nav-list:focus { border-color: #ff3e00; }
  .nav-list li {
    padding: 8px 16px; cursor: pointer; font-size: 14px; color: #444;
    border-bottom: 1px solid #f0f0f0;
  }
  .nav-list li:last-child { border-bottom: none; }
  .nav-list li.active { background: #fff5f2; color: #ff3e00; font-weight: 600; }
  .nav-list li:hover { background: #f8f8f8; }
  .focus-demo { display: flex; gap: 8px; }
  .focus-box {
    flex: 1; padding: 12px; text-align: center; border: 2px solid #eee;
    border-radius: 6px; cursor: pointer; font-size: 13px; color: #666;
    outline: none; transition: all 0.2s;
  }
  .focus-box:focus { border-color: #ff3e00; background: #fff5f2; color: #ff3e00; box-shadow: 0 0 0 3px rgba(255, 62, 0, 0.2); }
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
