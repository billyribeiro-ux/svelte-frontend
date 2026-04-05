import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-9',
		title: '$inspect, flushSync, Event Loop & Timing',
		phase: 2,
		module: 6,
		lessonIndex: 9
	},
	description: `Debugging reactive state can be tricky. <code>console.log</code> often shows a Proxy object instead of the actual value. Svelte provides <code>$inspect()</code> — a development-only rune that logs values whenever they change, automatically showing the unwrapped data.

When an effect or derived re-runs more often than you expect, add <code>$inspect.trace()</code> (added in svelte@5.14) as the first line of the function body. Svelte will print exactly which reactive dependency triggered each run — the fastest way to diagnose "why did this update?" bugs.

Svelte batches DOM updates for performance — when you change state, the DOM doesn't update instantly. If you need to force an immediate DOM update (for example, to scroll to a newly added item), use <code>flushSync</code> from 'svelte'.

Finally, understanding the **event loop** helps you reason about when your code runs relative to DOM updates: synchronous code → microtasks (Promises) → DOM paint → macrotasks (setTimeout).`,
	objectives: [
		'Use $inspect() to debug reactive values without Proxy confusion',
		'Use $inspect.trace() to discover which dependency triggered a re-run',
		'Force immediate DOM updates with flushSync when needed',
		'Understand why DOM reads after state changes may see stale values',
		'Know the event loop order: sync, microtasks, paint, macrotasks'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import { flushSync, tick } from 'svelte';

  // ================================================================
  // 1. $inspect — log reactive values without Proxy confusion
  // ================================================================
  let count = $state(0);
  let user = $state({ name: 'Alice', score: 0 });

  // $inspect logs to the DevTools console whenever these values change.
  // Open the console (F12) to see the output.
  $inspect(count);
  $inspect(user);

  // You can also label them and use a callback instead of console.log:
  $inspect(count, user).with((type, c, u) => {
    // type is 'init' on first run, 'update' thereafter
    if (type === 'update') {
      // console.log('tracked change', c, u);
    }
  });

  function incrementCount() {
    count++;
    user.score += 10;
  }

  // ================================================================
  // 2. $inspect.trace — find which dependency caused a re-run
  // ================================================================
  let a = $state(1);
  let b = $state(2);
  let c = $state(3);

  let mysterious = $derived.by(() => {
    $inspect.trace('mysterious');
    return a + b + c;
  });

  // ================================================================
  // 3. flushSync — force an immediate DOM flush
  // ================================================================
  let messages = $state([
    { id: 1, text: 'Hello!' },
    { id: 2, text: 'Welcome to the chat.' }
  ]);
  let newMessage = $state('');
  let nextMessageId = $state(3);
  let chatContainer = $state(null);

  function addMessage() {
    const text = newMessage.trim();
    if (!text) return;

    // Without flushSync: messages would update asynchronously,
    // and the scroll below would target the OLD scrollHeight.
    flushSync(() => {
      messages = [...messages, { id: nextMessageId, text }];
      nextMessageId++;
      newMessage = '';
    });

    // Now the DOM is guaranteed to reflect the new message.
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  // ================================================================
  // 4. tick — async alternative to flushSync
  // ================================================================
  async function addAndFocus() {
    messages = [...messages, { id: nextMessageId, text: 'Sent via tick()' }];
    nextMessageId++;

    // tick() returns a promise that resolves once pending
    // state changes have been applied to the DOM.
    await tick();

    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  // ================================================================
  // 5. Event loop timing visualisation
  // ================================================================
  let timingLog = $state([]);

  function demonstrateTiming() {
    timingLog = [];
    const log = (msg, color) => {
      timingLog = [...timingLog, { msg, color, time: performance.now() }];
    };

    const start = performance.now();

    log('1. Synchronous start', 'sync');

    setTimeout(() => {
      log('6. setTimeout 0ms (macrotask)', 'macro');
    }, 0);

    setTimeout(() => {
      log('7. setTimeout 10ms (macrotask)', 'macro');
    }, 10);

    Promise.resolve().then(() => {
      log('4. Promise.then #1 (microtask)', 'micro');
      Promise.resolve().then(() => {
        log('5. Promise.then nested (microtask)', 'micro');
      });
    });

    queueMicrotask(() => {
      log('3. queueMicrotask (microtask)', 'micro');
    });

    log('2. Synchronous end', 'sync');

    // Normalise timestamps after all logging finishes.
    setTimeout(() => {
      timingLog = timingLog.map((e) => ({ ...e, offset: (e.time - start).toFixed(2) }));
    }, 50);
  }
</script>

<h1>$inspect, flushSync &amp; Timing</h1>

<section>
  <h2>1. $inspect() — Better Debugging</h2>
  <button onclick={incrementCount}>
    count: {count} &middot; score: {user.score}
  </button>

  <div class="tip">
    <p>Open DevTools console (F12). You'll see <code>$inspect</code> output on every change.</p>
    <p><code>$inspect(count)</code> shows the real value, not a Proxy.</p>
    <p><strong>Note:</strong> $inspect only works in dev mode — it's stripped in production.</p>
  </div>

  <pre class="console-preview">{\`// console.log shows the proxy:
console.log(user)  // Proxy { name: 'Alice', score: 0 }

// $inspect shows the clean value:
$inspect(user)     // init   { name: 'Alice', score: 0 }
                   // update { name: 'Alice', score: 10 }\`}</pre>
</section>

<section>
  <h2>2. $inspect.trace — Find the Culprit</h2>
  <p>Change any value below. The console prints which one caused <code>mysterious</code> to recompute.</p>
  <div class="trace-controls">
    <button onclick={() => a++}>a = {a}</button>
    <button onclick={() => b++}>b = {b}</button>
    <button onclick={() => c++}>c = {c}</button>
  </div>
  <p>mysterious (a + b + c) = <strong>{mysterious}</strong></p>

  <pre class="console-preview">{\`// Put $inspect.trace() as the FIRST line of a derived or effect:
let result = $derived.by(() => {
  $inspect.trace('myDerived');
  return computeStuff(a, b, c);
});

// Console output (when a changes):
// myDerived
//   a: 1 -> 2\`}</pre>
</section>

<section>
  <h2>3. flushSync — Force DOM Update</h2>
  <p>Add messages — flushSync ensures the DOM is updated <em>before</em> we scroll.</p>

  <div class="chat" bind:this={chatContainer}>
    {#each messages as msg (msg.id)}
      <div class="chat-message">
        <span class="msg-num">#{msg.id}</span>
        {msg.text}
      </div>
    {/each}
  </div>

  <div class="chat-input">
    <input
      bind:value={newMessage}
      placeholder="Type a message..."
      onkeydown={(e) => e.key === 'Enter' && addMessage()}
    />
    <button onclick={addMessage}>Send (flushSync)</button>
    <button class="secondary" onclick={addAndFocus}>Send (tick)</button>
  </div>

  <pre class="console-preview">{\`// Without flushSync:
messages = [...messages, msg];
container.scrollTop = container.scrollHeight;
// Scrolls BEFORE DOM updates - misses the last message!

// With flushSync:
flushSync(() => { messages = [...messages, msg]; });
container.scrollTop = container.scrollHeight;
// DOM is guaranteed up-to-date

// Or async with tick():
messages = [...messages, msg];
await tick();
container.scrollTop = container.scrollHeight;\`}</pre>
</section>

<section>
  <h2>4. Event Loop Timing</h2>
  <button onclick={demonstrateTiming}>Run Timing Demo</button>

  <div class="timing-log">
    {#each timingLog as entry, i (i)}
      <div class="timing-entry {entry.color}">
        {entry.msg}
        {#if entry.offset}<span class="offset">+{entry.offset}ms</span>{/if}
      </div>
    {:else}
      <div class="timing-entry empty">Click the button to see execution order</div>
    {/each}
  </div>

  <div class="event-loop">
    <div class="phase sync-phase">
      <strong>1. Synchronous</strong>
      <span>Your code top-to-bottom</span>
    </div>
    <div class="phase micro-phase">
      <strong>2. Microtasks</strong>
      <span>Promise.then, queueMicrotask</span>
    </div>
    <div class="phase paint-phase">
      <strong>3. DOM Paint</strong>
      <span>Browser renders updates</span>
    </div>
    <div class="phase macro-phase">
      <strong>4. Macrotasks</strong>
      <span>setTimeout, setInterval</span>
    </div>
  </div>

  <p class="note">
    Microtasks always drain completely before the next macrotask or paint. That's why
    nested promises run before any setTimeout, even a 0ms one.
  </p>
</section>

<div class="summary-box">
  <h3>When to reach for each tool</h3>
  <ul>
    <li><code>$inspect(x)</code> — "what's this value right now?"</li>
    <li><code>$inspect.trace('label')</code> — "why did this re-run?"</li>
    <li><code>flushSync(() =&gt; {'{ ... }'})</code> — "I need the DOM updated before my next line"</li>
    <li><code>await tick()</code> — "async version of flushSync, anywhere in an async function"</li>
    <li><code>queueMicrotask(fn)</code> — "run this after the current sync code but before the next paint"</li>
  </ul>
</div>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 10px; }
  section h2 { margin-top: 0; }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:hover { background: #4338ca; }
  button.secondary { background: #6b7280; }

  .tip {
    background: #e8f4fd;
    padding: 0.75rem;
    border-radius: 6px;
    margin: 0.75rem 0;
    font-size: 0.9rem;
  }
  .tip p { margin: 0.3rem 0; }
  code { background: #e5e7eb; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }

  pre.console-preview {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre;
    margin: 0.5rem 0;
  }

  .chat {
    border: 1px solid #ddd;
    border-radius: 8px;
    height: 200px;
    overflow-y: auto;
    padding: 0.5rem;
    background: white;
    margin: 0.5rem 0;
  }
  .chat-message {
    padding: 0.4rem 0.6rem;
    margin: 0.25rem 0;
    background: #e8f5e9;
    border-radius: 6px;
    font-size: 0.9rem;
  }
  .msg-num { color: #999; font-size: 0.75rem; margin-right: 0.3rem; }
  .chat-input { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .chat-input input {
    flex: 1;
    min-width: 160px;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  .trace-controls { display: flex; gap: 0.5rem; margin: 0.5rem 0; }

  .timing-log {
    border: 1px solid #ddd;
    border-radius: 6px;
    margin: 0.75rem 0;
    overflow: hidden;
    background: white;
  }
  .timing-entry {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #f0f0f0;
    font-family: monospace;
    font-size: 0.85rem;
    display: flex;
    justify-content: space-between;
  }
  .timing-entry.sync { background: #eef2ff; color: #3730a3; }
  .timing-entry.micro { background: #ecfdf5; color: #047857; }
  .timing-entry.macro { background: #fff7ed; color: #b45309; }
  .timing-entry.empty { color: #999; font-style: italic; }
  .offset { font-size: 0.7rem; color: #888; }

  .event-loop {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.4rem;
    margin-top: 1rem;
  }
  .phase {
    padding: 0.6rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    text-align: center;
  }
  .phase strong { display: block; font-size: 0.8rem; color: #4f46e5; }
  .phase span { font-size: 0.7rem; color: #888; }
  .sync-phase { border-color: #3730a3; }
  .micro-phase { border-color: #047857; }
  .paint-phase { border-color: #a855f7; }
  .macro-phase { border-color: #b45309; }

  .note { font-size: 0.8rem; color: #666; font-style: italic; }

  .summary-box {
    background: #eef2ff;
    border-left: 4px solid #4f46e5;
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin: 1.5rem 0;
  }
  .summary-box h3 { margin: 0 0 0.5rem; }
  .summary-box ul { margin: 0; padding-left: 1.2rem; }
  .summary-box li { margin: 0.3rem 0; font-size: 0.9rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
