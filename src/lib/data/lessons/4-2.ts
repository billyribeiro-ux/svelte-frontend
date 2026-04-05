import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '4-2',
		title: 'Bubbling & stopPropagation',
		phase: 1,
		module: 4,
		lessonIndex: 2
	},
	description: `Click on a button inside a card. The button's onclick fires — obviously. But so does the *card's* onclick. And if the card is inside a container with its own click handler, that one fires too. This isn't a bug; it's **event bubbling**, a fundamental part of how the DOM dispatches events.

Here's the mental model. When you click an element, the browser creates an event object and fires it on the clicked element first (the **target**). Then it walks *up* the DOM tree, firing the same event on every ancestor in turn — parent, grandparent, all the way to \`<body>\` and \`window\`. Every handler along the way gets called. This is the **bubble phase**, and it's how one click can trigger handlers at many levels.

Bubbling is incredibly useful when you want it. You can attach a single click handler to a long list and use \`event.target\` to figure out which item was clicked — this is called **event delegation**, and it's a performance win for long or dynamic lists (one listener instead of a thousand). But bubbling bites you when you *don't* want it: clicking a button inside a clickable card shouldn't also select the card.

The tool for controlling this is \`event.stopPropagation()\`. Call it from a handler and the event stops bubbling — ancestors don't get notified. Use sparingly: stopping propagation breaks event delegation and can cause bugs elsewhere. Often the cleaner fix is to structure your UI so that bubbling doesn't matter.

There's a sibling method, \`event.preventDefault()\`, which does something different: it cancels the browser's *default behavior* for the event. A click on a link navigates; a form submit reloads the page; a right-click opens the context menu. Calling \`preventDefault()\` cancels these defaults. Forms in single-page apps almost always need \`event.preventDefault()\` on submit.

One more distinction worth memorizing: \`event.target\` is the element that was actually clicked (could be a deeply nested child), while \`event.currentTarget\` is the element the handler is attached to. They're often different during bubbling, and confusing them is a classic bug.

Pitfalls: forgetting \`preventDefault()\` on form submit (the page reloads and you lose state), calling \`stopPropagation()\` when you should have used CSS \`pointer-events\` or a different structure, and confusing \`target\` with \`currentTarget\` in delegated handlers.`,
	objectives: [
		'Understand how events bubble up through the DOM from target to ancestors',
		'Use event.stopPropagation() to halt bubbling when it causes unwanted side effects',
		'Use event.preventDefault() to cancel default browser behaviors like form reload',
		'Distinguish event.target (what was clicked) from event.currentTarget (listener owner)',
		'Apply event delegation by attaching one parent listener to handle many children',
		'Build a card-with-buttons pattern where buttons stop propagation to the card'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  // === EVENT BUBBLING & stopPropagation ===
  // When you click an element, the click event doesn't fire only there.
  // It starts at the target and "bubbles" UP through every ancestor,
  // firing handlers at each level. This is powerful (listen once on a
  // parent!) but can cause surprises (clicking a button inside a card
  // also fires the card's click handler).
  //
  // Tools to control propagation:
  //   event.stopPropagation() — stop bubbling upward from here
  //   event.preventDefault()  — cancel the browser's default behavior
  //   event.target             — the element that was actually clicked
  //   event.currentTarget      — the element the handler is attached to

  let log = $state([]);
  function addLog(msg) {
    log = [\\\`\\\${new Date().toLocaleTimeString()} — \\\${msg}\\\`, ...log].slice(0, 20);
  }
  function clearLog() { log = []; }

  // --- Example 1: Pure bubbling — all three handlers fire ---
  function handleOuter()  { addLog('🔴 Outer (grandparent) fired'); }
  function handleMiddle() { addLog('🟠 Middle (parent) fired'); }
  function handleInner()  { addLog('🟢 Inner (target) fired'); }

  // --- Example 2: stopPropagation halts bubbling ---
  function handleInnerStopped(event) {
    event.stopPropagation();
    addLog('🟢 Inner — stopped propagation; outer/middle will NOT fire');
  }

  // --- Example 3: preventDefault — stop browser default behavior ---
  let formResult = $state('');
  function handleSubmit(event) {
    // Without preventDefault, the form would reload the page.
    event.preventDefault();
    const data = new FormData(event.target);
    formResult = \\\`Submitted: \\\${data.get('username')} / \\\${data.get('email')}\\\`;
    addLog('Form submitted (page reload prevented)');
  }

  function handleLinkClick(event) {
    // Without preventDefault, the browser navigates away.
    event.preventDefault();
    addLog('Link click prevented');
  }

  // --- Example 4: target vs currentTarget ---
  // target = what was clicked (could be a child); currentTarget = listener owner
  let targetInfo = $state('(click a child)');
  function handleContainer(event) {
    targetInfo = \\\`target=\\\${event.target.tagName}, currentTarget=\\\${event.currentTarget.tagName}\\\`;
  }

  // --- Example 5: Card with action buttons — real-world pattern ---
  let selectedCard = $state('');
  const cards = [
    { id: 'alpha', title: 'Project Alpha', desc: 'Prototype phase' },
    { id: 'beta',  title: 'Project Beta',  desc: 'Beta testing' },
    { id: 'gamma', title: 'Project Gamma', desc: 'Released' }
  ];
  function handleCardClick(card) {
    selectedCard = card.id;
    addLog(\\\`Card selected: \\\${card.title}\\\`);
  }
  function handleCardAction(event, action, card) {
    // Crucial: stop the card's click handler from firing too.
    event.stopPropagation();
    addLog(\\\`Action "\\\${action}" on \\\${card.title}\\\`);
  }

  // --- Example 6: Event delegation ---
  let lastDelegatedItem = $state(null);
  const items = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, name: \\\`Item \\\${i + 1}\\\` }));
  function handleListClick(event) {
    const li = event.target.closest('[data-id]');
    if (!li) return;
    lastDelegatedItem = li.dataset.id;
    addLog(\\\`Delegated click: item \\\${li.dataset.id}\\\`);
  }
</script>

<h1>Bubbling & stopPropagation</h1>

<section>
  <h2>1. Pure Bubbling (click the inner box)</h2>
  <p class="hint">One click — three handlers fire. The event bubbles up.</p>
  <div class="outer" role="presentation" onclick={handleOuter}>
    Outer
    <div class="middle" role="presentation" onclick={handleMiddle}>
      Middle
      <div class="inner" role="presentation" onclick={handleInner}>
        Inner — Click me!
      </div>
    </div>
  </div>
</section>

<section>
  <h2>2. stopPropagation (click the inner box)</h2>
  <p class="hint">Only the inner handler fires — bubbling is halted.</p>
  <div class="outer" role="presentation" onclick={handleOuter}>
    Outer
    <div class="middle" role="presentation" onclick={handleMiddle}>
      Middle
      <div class="inner stopped" role="presentation" onclick={handleInnerStopped}>
        Inner — Stops here!
      </div>
    </div>
  </div>
</section>

<section>
  <h2>3. preventDefault — Forms and Links</h2>
  <p class="hint">Stops the browser from navigating or reloading.</p>
  <form onsubmit={handleSubmit}>
    <input name="username" placeholder="Username" />
    <input name="email" type="email" placeholder="Email" />
    <button type="submit">Submit</button>
  </form>
  {#if formResult}<p class="success">{formResult}</p>{/if}
  <p>
    <a href="https://example.com" onclick={handleLinkClick}>
      This link won't navigate (preventDefault)
    </a>
  </p>
</section>

<section>
  <h2>4. target vs currentTarget</h2>
  <p class="hint">Click any child element. The listener sits on the container.</p>
  <div class="target-demo" role="presentation" onclick={handleContainer}>
    <span>span</span>
    <button>button</button>
    <em>em</em>
  </div>
  <p class="mono">{targetInfo}</p>
</section>

<section>
  <h2>5. Real-world: Cards with Action Buttons</h2>
  <p class="hint">Clicking the card selects it. Clicking Edit/Delete stops propagation so the card isn't also selected.</p>
  <div class="card-grid">
    {#each cards as card (card.id)}
      <div
        class="card"
        class:selected={selectedCard === card.id}
        role="presentation"
        onclick={() => handleCardClick(card)}
      >
        <h3>{card.title}</h3>
        <p class="desc">{card.desc}</p>
        <div class="card-actions">
          <button onclick={(e) => handleCardAction(e, 'Edit', card)}>Edit</button>
          <button onclick={(e) => handleCardAction(e, 'Delete', card)}>Delete</button>
        </div>
      </div>
    {/each}
  </div>
  <p>Selected: <strong>{selectedCard || '(none)'}</strong></p>
</section>

<section>
  <h2>6. Event Delegation</h2>
  <p class="hint">One listener on the UL handles all LI clicks — great for long/dynamic lists.</p>
  <ul class="delegated">
    {#each items as item (item.id)}
      <li>
        <button type="button" data-id={item.id} onclick={handleListClick}>{item.name}</button>
      </li>
    {/each}
  </ul>
  <p>Last delegated click: <strong>{lastDelegatedItem ?? '(none)'}</strong></p>
</section>

<section>
  <h2>Event Log</h2>
  <button onclick={clearLog}>Clear</button>
  <div class="event-log">
    {#each log as entry, i (i)}
      <div class="log-entry">{entry}</div>
    {:else}
      <div class="log-entry empty">Click on elements above...</div>
    {/each}
  </div>
</section>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  h2 { font-size: 16px; color: #333; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  h3 { margin: 0 0 4px 0; color: #333; font-size: 14px; }
  section { margin-bottom: 20px; font-family: sans-serif; }
  p { color: #444; font-size: 14px; margin: 4px 0; }
  .hint { color: #999; font-size: 12px; font-style: italic; }
  .mono { font-family: monospace; font-size: 12px; background: #f8f8f8; padding: 4px 8px; border-radius: 3px; display: inline-block; }
  strong { color: #222; }
  .success { color: #2d8a6e; font-weight: 600; }
  .outer { background: #fdecea; border: 2px solid #c62828; border-radius: 8px; padding: 16px; cursor: pointer; text-align: center; color: #c62828; }
  .middle { background: #fff3e0; border: 2px solid #ff9800; border-radius: 6px; padding: 12px; margin-top: 8px; color: #e65100; }
  .inner  { background: #e6f7f3; border: 2px solid #2d8a6e; border-radius: 4px; padding: 10px; margin-top: 8px; color: #2d8a6e; font-weight: 600; }
  .stopped { background: #e6f0ff; border-color: #3b7dd8; color: #3b7dd8; }
  form { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px; }
  form input { flex: 1; padding: 6px 10px; border: 2px solid #ddd; border-radius: 6px; font-size: 13px; min-width: 120px; }
  a { color: #3b7dd8; cursor: pointer; }
  .target-demo { background: #f8f8f8; border: 2px solid #ddd; border-radius: 6px; padding: 12px; display: flex; gap: 10px; align-items: center; cursor: pointer; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
  .card { border: 2px solid #eee; border-radius: 8px; padding: 12px; cursor: pointer; transition: all 0.2s; }
  .card:hover { border-color: #ff3e00; }
  .card.selected { border-color: #ff3e00; background: #fff5f2; }
  .desc { font-size: 12px; color: #999; }
  .card-actions { display: flex; gap: 6px; margin-top: 6px; }
  .delegated { list-style: none; padding: 0; border: 2px solid #eee; border-radius: 6px; max-height: 160px; overflow-y: auto; margin: 0; }
  .delegated li { border-bottom: 1px solid #f0f0f0; }
  .delegated li button {
    width: 100%; padding: 6px 12px; background: transparent; border: none;
    text-align: left; font-size: 13px; color: #444; cursor: pointer; font-family: inherit;
  }
  .delegated li button:hover { background: #fff5f2; color: #ff3e00; }
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
