import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '4-2',
		title: 'Bubbling & stopPropagation',
		phase: 1,
		module: 4,
		lessonIndex: 2
	},
	description: `When you click an element, the event doesn't just fire on that element — it "bubbles" up through every parent element. This is useful (you can listen on a parent instead of every child) but sometimes causes unwanted behavior (clicking a button inside a card also clicks the card).

This lesson demonstrates event bubbling, stopPropagation to prevent it, and preventDefault for forms and links.`,
	objectives: [
		'Understand how events bubble from child to parent elements',
		'Use event.stopPropagation() to prevent unwanted bubbling',
		'Use event.preventDefault() to stop default browser behavior'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  let log = $state([]);
  let formResult = $state('');

  function addLog(source, stopped) {
    const msg = stopped
      ? \`\${source} (propagation stopped)\`
      : source;
    log = [\`\${new Date().toLocaleTimeString()} — \${msg}\`, ...log].slice(0, 15);
  }

  function clearLog() {
    log = [];
  }

  // Bubbling demo — all three fire
  function handleOuterClick() {
    addLog('Outer (grandparent)');
  }

  function handleMiddleClick() {
    addLog('Middle (parent)');
  }

  function handleInnerClick() {
    addLog('Inner (target)');
  }

  // With stopPropagation
  function handleInnerClickStopped(event) {
    event.stopPropagation();
    addLog('Inner (target)', true);
  }

  // preventDefault demo
  function handleSubmit(event) {
    event.preventDefault();
    formResult = 'Form submitted without page reload!';
    addLog('Form submit prevented');
  }

  function handleLinkClick(event) {
    event.preventDefault();
    addLog('Link click prevented');
  }

  // Card with button pattern
  let selectedCard = $state('');

  function handleCardClick(name) {
    selectedCard = name;
    addLog(\`Card selected: \${name}\`);
  }

  function handleCardAction(event, action) {
    event.stopPropagation();
    addLog(\`Button clicked: \${action}\`);
  }
</script>

<h1>Bubbling & stopPropagation</h1>

<section>
  <h2>Event Bubbling (click the inner box)</h2>
  <div class="outer" onclick={handleOuterClick}>
    Outer
    <div class="middle" onclick={handleMiddleClick}>
      Middle
      <div class="inner" onclick={handleInnerClick}>
        Inner — Click me!
      </div>
    </div>
  </div>
  <p class="note">All three handlers fire because the event bubbles up.</p>
</section>

<section>
  <h2>stopPropagation (click the inner box)</h2>
  <div class="outer" onclick={handleOuterClick}>
    Outer
    <div class="middle" onclick={handleMiddleClick}>
      Middle
      <div class="inner stopped" onclick={handleInnerClickStopped}>
        Inner — Stops here!
      </div>
    </div>
  </div>
  <p class="note">Only the inner handler fires — propagation is stopped.</p>
</section>

<section>
  <h2>preventDefault</h2>
  <form onsubmit={handleSubmit}>
    <input placeholder="Type something..." />
    <button type="submit">Submit</button>
  </form>
  {#if formResult}
    <p class="success">{formResult}</p>
  {/if}

  <p>
    <a href="https://example.com" onclick={handleLinkClick}>
      This link won't navigate (preventDefault)
    </a>
  </p>
</section>

<section>
  <h2>Practical: Card with Buttons</h2>
  <div class="card-grid">
    {#each ['Project Alpha', 'Project Beta'] as name}
      <div class="card" class:selected={selectedCard === name} onclick={() => handleCardClick(name)}>
        <h3>{name}</h3>
        <p>Click the card to select. Buttons don't select.</p>
        <div class="card-actions">
          <button onclick={(e) => handleCardAction(e, \`Edit \${name}\`)}>Edit</button>
          <button onclick={(e) => handleCardAction(e, \`Delete \${name}\`)}>Delete</button>
        </div>
      </div>
    {/each}
  </div>
  <p>Selected: <strong>{selectedCard || 'none'}</strong></p>
</section>

<section>
  <h2>Event Log</h2>
  <button onclick={clearLog}>Clear</button>
  <div class="event-log">
    {#each log as entry}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Click on elements above...</div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  section { margin-bottom: 20px; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  strong { color: #222; }
  .note { color: #999; font-size: 12px; font-style: italic; }
  .success { color: #4ec9b0; font-weight: 600; }
  .outer {
    background: #fdecea; border: 2px solid #f44747; border-radius: 8px;
    padding: 16px; cursor: pointer; text-align: center; color: #c62828;
  }
  .middle {
    background: #fff3e0; border: 2px solid #ff9800; border-radius: 6px;
    padding: 12px; margin-top: 8px; color: #e65100;
  }
  .inner {
    background: #e6f7f3; border: 2px solid #4ec9b0; border-radius: 4px;
    padding: 10px; margin-top: 8px; color: #2d8a6e; font-weight: 600;
  }
  .stopped { background: #e6f0ff; border-color: #569cd6; color: #3b7dd8; }
  form { display: flex; gap: 8px; margin-bottom: 8px; }
  form input { flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; }
  a { color: #569cd6; cursor: pointer; }
  .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card {
    border: 2px solid #eee; border-radius: 8px; padding: 16px; cursor: pointer;
    transition: border-color 0.2s;
  }
  .card:hover { border-color: #ff3e00; }
  .selected { border-color: #ff3e00; background: #fff5f2; }
  .card h3 { margin: 0 0 4px 0; font-size: 15px; color: #333; }
  .card p { font-size: 12px; color: #999; }
  .card-actions { display: flex; gap: 8px; margin-top: 8px; }
  .event-log {
    background: #1e1e1e; border-radius: 6px; padding: 8px;
    max-height: 180px; overflow-y: auto; font-family: monospace; margin-top: 8px;
  }
  .log-entry { color: #d4d4d4; font-size: 12px; padding: 2px 8px; }
  .log-entry.empty { color: #666; font-style: italic; }
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
