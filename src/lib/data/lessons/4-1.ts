import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '4-1',
		title: 'Events Deep Dive',
		phase: 1,
		module: 4,
		lessonIndex: 1
	},
	description: `Events are how your app responds to user actions — clicks, typing, hovering, focusing. In Svelte 5, you attach event handlers directly as attributes: onclick, oninput, onfocus, etc. The handler receives an event object with details about what happened.

This lesson explores multiple event types, the event object, and practical patterns for handling user interaction.`,
	objectives: [
		'Handle DOM events like onclick, oninput, and onfocus in Svelte 5',
		'Access the event object and its properties (target, key, clientX)',
		'Use inline handlers and named handler functions'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let clickCount = $state(0);
  let lastEvent = $state('None yet');
  let inputValue = $state('');
  let mousePos = $state({ x: 0, y: 0 });
  let isFocused = $state(false);
  let hoverTarget = $state('');
  let log = $state([]);

  function addLog(msg) {
    log = [\`\${new Date().toLocaleTimeString()} — \${msg}\`, ...log].slice(0, 10);
  }

  function handleClick(event) {
    clickCount += 1;
    lastEvent = \`click at (\${event.clientX}, \${event.clientY})\`;
    addLog(\`Click #\${clickCount}\`);
  }

  function handleInput(event) {
    inputValue = event.target.value;
    addLog(\`Input: "\${event.target.value}"\`);
  }

  function handleMouseMove(event) {
    mousePos = { x: event.clientX, y: event.clientY };
  }

  function handleFocus() {
    isFocused = true;
    addLog('Input focused');
  }

  function handleBlur() {
    isFocused = false;
    addLog('Input blurred');
  }

  function handleKeyDown(event) {
    addLog(\`Key: \${event.key} (code: \${event.code})\`);
  }
</script>

<h1>Events Deep Dive</h1>

<section>
  <h2>onclick</h2>
  <button onclick={handleClick}>Click me! ({clickCount})</button>
  <p>Last event: {lastEvent}</p>
</section>

<section>
  <h2>oninput</h2>
  <input
    value={inputValue}
    oninput={handleInput}
    onfocus={handleFocus}
    onblur={handleBlur}
    onkeydown={handleKeyDown}
    placeholder="Type here..."
    class:focused={isFocused}
  />
  <p>Value: "{inputValue}" ({inputValue.length} chars)</p>
  <p>Focused: <span class:yes={isFocused} class:no={!isFocused}>{isFocused}</span></p>
</section>

<section>
  <h2>onmousemove</h2>
  <div class="mouse-area" onmousemove={handleMouseMove}>
    <p>Move your mouse here</p>
    <p>Position: ({mousePos.x}, {mousePos.y})</p>
  </div>
</section>

<section>
  <h2>Inline Handlers</h2>
  <div class="hover-boxes">
    {#each ['Box A', 'Box B', 'Box C'] as box}
      <div
        class="hover-box"
        class:hovered={hoverTarget === box}
        onmouseenter={() => { hoverTarget = box; addLog(\`Entered \${box}\`); }}
        onmouseleave={() => { hoverTarget = ''; }}
      >
        {box}
      </div>
    {/each}
  </div>
  <p>Hovering: <strong>{hoverTarget || 'nothing'}</strong></p>
</section>

<section>
  <h2>Event Log</h2>
  <div class="event-log">
    {#each log as entry}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Interact with the elements above...</div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .yes { color: #4ec9b0; font-weight: 600; }
  .no { color: #f44747; }
  input {
    padding: 8px 12px; border: 2px solid #ddd; border-radius: 6px;
    font-size: 14px; width: 100%; box-sizing: border-box; transition: border-color 0.2s;
  }
  .focused { border-color: #ff3e00; }
  .mouse-area {
    background: #f8f8f8; border: 2px dashed #ddd; border-radius: 8px;
    padding: 24px; text-align: center; cursor: crosshair; user-select: none;
  }
  .hover-boxes { display: flex; gap: 8px; }
  .hover-box {
    flex: 1; padding: 16px; text-align: center; border: 2px solid #eee;
    border-radius: 6px; cursor: pointer; transition: all 0.2s; user-select: none;
  }
  .hovered { border-color: #ff3e00; background: #fff5f2; color: #ff3e00; font-weight: 600; }
  .event-log {
    background: #1e1e1e; border-radius: 6px; padding: 8px;
    max-height: 200px; overflow-y: auto; font-family: monospace;
  }
  .log-entry { color: #d4d4d4; font-size: 12px; padding: 2px 8px; }
  .log-entry.empty { color: #666; font-style: italic; }
  button {
    padding: 8px 20px; border: 2px solid #ff3e00; background: white;
    color: #ff3e00; border-radius: 6px; cursor: pointer; font-size: 14px;
  }
  button:hover { background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
