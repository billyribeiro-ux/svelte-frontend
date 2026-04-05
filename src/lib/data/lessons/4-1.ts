import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '4-1',
		title: 'Events Deep Dive',
		phase: 1,
		module: 4,
		lessonIndex: 1
	},
	description: `Events are how a web app comes alive. Every click, every keystroke, every mouse movement, every focus change — these are events, and responding to them is how you turn a static page into something interactive. In Svelte 5, attaching an event handler is as simple as adding a lowercase attribute: \`onclick={handler}\`, \`oninput={handler}\`, \`onfocus={handler}\`. That's it — no special syntax, no directives, just regular attributes that take regular functions.

(A quick historical note: Svelte 4 used a colon-based directive syntax like \`on:click\`. Svelte 5's runes mode uses the native HTML attribute form \`onclick\`. Both forms compile to efficient event listeners; the new syntax just aligns with vanilla HTML and TypeScript's built-in event types.)

Every handler receives an **Event object** as its first argument. This object is a treasure trove: \`event.target\` is the element that fired the event, \`event.clientX/Y\` are mouse coordinates, \`event.key\` is the pressed key, \`event.ctrlKey/shiftKey/altKey/metaKey\` tell you which modifiers are held. Different event types add specific properties — a \`MouseEvent\` has coordinates, a \`KeyboardEvent\` has key info, an \`InputEvent\` has the typed value on \`event.target.value\`.

You'll use two styles of handler: **named functions** declared in \`<script>\` (best for reusable or complex logic) and **inline arrow functions** (perfect for passing arguments or quick one-liners like \`onclick={() => count += 1}\`). Both compile to the same code; pick whichever reads best.

The most common events you'll wire up: **onclick** for buttons, **oninput** for text fields (fires on every keystroke — vs **onchange** which fires only on blur/commit), **onfocus**/**onblur** for focus tracking, **onmousemove**/**onmouseenter**/**onmouseleave** for hover effects, **onkeydown** for keyboard shortcuts, **onscroll** for scroll position, **ondblclick** for double-clicks, and **oncontextmenu** for right-clicks (usually with \`event.preventDefault()\` to suppress the browser menu).

Pitfalls to watch: confusing \`oninput\` with \`onchange\` (they behave differently for text inputs), forgetting that \`event.target.value\` is always a string (convert to number if needed), and attaching expensive handlers to \`onmousemove\` without throttling — it fires on every pixel of movement.`,
	objectives: [
		'Attach Svelte 5 event handlers with lowercase attributes (onclick, oninput, etc)',
		'Access event object properties like target, clientX/Y, key, and offsetX/Y',
		'Distinguish oninput (every keystroke) from onchange (on blur/commit)',
		'Use named handler functions and inline arrow functions appropriately',
		'Handle mouse events including enter/leave/move with coordinate tracking',
		'Prevent default browser behavior for right-clicks with event.preventDefault()'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === EVENTS DEEP DIVE ===
  // In Svelte 5, you attach event handlers as lowercase attributes:
  //   onclick={handler}   (not on:click)
  // The handler gets an Event object — a rich bag of info about what
  // happened: which element, which key, mouse coordinates, and more.

  // --- Shared logger for every example ---
  let log = $state([]);
  function addLog(msg) {
    const time = new Date().toLocaleTimeString();
    log = [\\\`\\\${time} — \\\${msg}\\\`, ...log].slice(0, 15);
  }
  function clearLog() { log = []; }

  // --- Example 1: Click events ---
  let clickCount = $state(0);
  let lastClickPos = $state({ x: 0, y: 0 });
  function handleClick(event) {
    clickCount += 1;
    // event.clientX/Y are viewport coordinates; offsetX/Y are local.
    lastClickPos = { x: event.clientX, y: event.clientY };
    addLog(\\\`Click #\\\${clickCount} at (\\\${event.clientX}, \\\${event.clientY})\\\`);
  }

  // Inline arrow handler: perfect for small one-liners or passing args.
  function handleCategoryClick(category) {
    addLog(\\\`Category clicked: \\\${category}\\\`);
  }

  // --- Example 2: Input events ---
  let inputValue = $state('');
  let inputChars = $derived(inputValue.length);
  function handleInput(event) {
    // event.target is the element; .value is what they typed.
    inputValue = event.target.value;
  }
  // oninput fires on every keystroke; onchange only fires on blur for text.

  // --- Example 3: Focus events ---
  let focusState = $state('not focused');
  function handleFocus() {
    focusState = 'focused';
    addLog('Input gained focus');
  }
  function handleBlur() {
    focusState = 'not focused';
    addLog('Input lost focus');
  }

  // --- Example 4: Mouse events — the full tour ---
  let mousePos = $state({ x: 0, y: 0 });
  let mouseInArea = $state(false);
  function handleMouseMove(event) {
    // offsetX/Y = position relative to the target element's top-left
    mousePos = { x: event.offsetX, y: event.offsetY };
  }
  function handleMouseEnter() {
    mouseInArea = true;
    addLog('Mouse entered area');
  }
  function handleMouseLeave() {
    mouseInArea = false;
    addLog('Mouse left area');
  }

  // --- Example 5: Keyboard events (full coverage in 4-3) ---
  let lastKey = $state('');
  function handleKeyDown(event) {
    lastKey = event.key;
    // event.key  → logical key ('a', 'Enter', 'ArrowUp')
    // event.code → physical key ('KeyA', 'Enter', 'ArrowUp')
    // event.ctrlKey/shiftKey/altKey/metaKey → modifier booleans
  }

  // --- Example 6: Change and select events ---
  let selectedColor = $state('red');
  const colors = ['red', 'orange', 'green', 'blue', 'purple'];
  function handleColorChange(event) {
    selectedColor = event.target.value;
    addLog(\\\`Color changed to: \\\${event.target.value}\\\`);
  }

  // --- Example 7: Scroll event ---
  let scrollPos = $state(0);
  function handleScroll(event) {
    scrollPos = Math.round(event.target.scrollTop);
  }

  // --- Example 8: Double-click & context menu ---
  let doubleClicks = $state(0);
  function handleDoubleClick() {
    doubleClicks += 1;
    addLog('Double-click detected');
  }
  function handleContextMenu(event) {
    // preventDefault stops the browser's right-click menu from appearing.
    event.preventDefault();
    addLog('Right-click (context menu prevented)');
  }
</script>

<h1>Events Deep Dive</h1>

<section>
  <h2>1. Click Events</h2>
  <p class="hint">event.clientX / clientY give you viewport coordinates.</p>
  <button onclick={handleClick}>Click me! ({clickCount})</button>
  <p>Last click at: ({lastClickPos.x}, {lastClickPos.y})</p>

  <div class="button-row">
    {#each ['tech', 'books', 'music', 'games'] as cat (cat)}
      <button onclick={() => handleCategoryClick(cat)}>{cat}</button>
    {/each}
  </div>
</section>

<section>
  <h2>2. Input Events (every keystroke)</h2>
  <p class="hint">oninput fires on each character; onchange only on blur.</p>
  <input
    value={inputValue}
    oninput={handleInput}
    onfocus={handleFocus}
    onblur={handleBlur}
    onkeydown={handleKeyDown}
    placeholder="Type something..."
  />
  <p>Value: "{inputValue}" ({inputChars} chars) — last key: <strong>{lastKey || '—'}</strong></p>
  <p>Focus state: <strong class:yes={focusState === 'focused'}>{focusState}</strong></p>
</section>

<section>
  <h2>3. Mouse Events</h2>
  <p class="hint">onmousemove, onmouseenter, onmouseleave — plus offsetX/Y for local coordinates.</p>
  <div
    class="mouse-area"
    class:active={mouseInArea}
    role="presentation"
    onmousemove={handleMouseMove}
    onmouseenter={handleMouseEnter}
    onmouseleave={handleMouseLeave}
  >
    <p>Move your mouse here</p>
    <p>Local position: ({mousePos.x}, {mousePos.y})</p>
    <p>In area: {mouseInArea ? 'yes' : 'no'}</p>
  </div>
</section>

<section>
  <h2>4. Change Event (select)</h2>
  <select bind:value={selectedColor} onchange={handleColorChange}>
    {#each colors as color (color)}
      <option value={color}>{color}</option>
    {/each}
  </select>
  <div class="swatch" style="background: {selectedColor}"></div>
</section>

<section>
  <h2>5. Scroll Event</h2>
  <div class="scroll-box" onscroll={handleScroll}>
    {#each Array.from({ length: 30 }) as _, i (i)}
      <div class="scroll-item">Item {i + 1}</div>
    {/each}
  </div>
  <p>scrollTop: <strong>{scrollPos}px</strong></p>
</section>

<section>
  <h2>6. Double-click & Context Menu</h2>
  <p class="hint">Right-click the button — the browser menu is suppressed.</p>
  <button ondblclick={handleDoubleClick} oncontextmenu={handleContextMenu}>
    Double-click or Right-click ({doubleClicks})
  </button>
</section>

<section>
  <h2>Event Log</h2>
  <button onclick={clearLog}>Clear</button>
  <div class="event-log">
    {#each log as entry, i (i)}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Interact with elements above...</div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  strong { color: #222; }
  .yes { color: #2d8a6e; }
  input, select { padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 14px; }
  input { width: 100%; box-sizing: border-box; }
  .button-row { display: flex; gap: 6px; margin-top: 6px; }
  .mouse-area {
    background: #f8f8f8; border: 2px dashed #ddd; border-radius: 8px;
    padding: 24px; text-align: center; cursor: crosshair; user-select: none;
    transition: all 0.2s;
  }
  .mouse-area.active { background: #fff5f2; border-color: #ff3e00; border-style: solid; }
  .swatch { width: 60px; height: 30px; border-radius: 4px; border: 2px solid #ddd; margin-top: 6px; }
  .scroll-box { height: 120px; overflow-y: auto; border: 2px solid #ddd; border-radius: 6px; }
  .scroll-item { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; color: #555; }
  .event-log { background: #1e1e1e; border-radius: 6px; padding: 8px; max-height: 200px; overflow-y: auto; font-family: monospace; margin-top: 6px; }
  .log-entry { color: #d4d4d4; font-size: 12px; padding: 2px 8px; }
  .log-entry.empty { color: #666; font-style: italic; }
  button { padding: 6px 14px; border: 2px solid #ff3e00; background: white; color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 13px; }
  button:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
