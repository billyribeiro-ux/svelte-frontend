import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '6-9',
		title: '$inspect, flushSync, Event Loop & Timing',
		phase: 2,
		module: 6,
		lessonIndex: 9
	},
	description: `Debugging reactive state can be tricky. console.log often shows a Proxy object instead of the actual value. Svelte provides $inspect() — a development-only rune that logs values whenever they change, automatically showing the unwrapped data.

When an effect or derived re-runs more often than you expect, add $inspect.trace() (added in svelte@5.14) as the first line of the function body. Svelte will print exactly which reactive dependency triggered each run — the fastest way to diagnose "why did this update?" bugs.

Svelte batches DOM updates for performance — when you change state, the DOM doesn't update instantly. If you need to force an immediate DOM update (for example, to scroll to a newly added item), use flushSync from 'svelte'.

Understanding the event loop helps you reason about when your code runs relative to DOM updates: synchronous code -> microtasks (Promises) -> DOM paint -> macrotasks (setTimeout).`,
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
  import { flushSync } from 'svelte';

  // === $inspect demo ===
  let count = $state(0);
  let user = $state({ name: 'Alice', score: 0 });

  // $inspect logs to the console whenever these values change
  // Open your browser's dev tools console to see the output!
  $inspect(count);
  $inspect(user);

  function incrementCount() {
    count++;
    user.score += 10;
  }

  // === $inspect.trace demo ===
  // When an effect/derived fires more than expected, $inspect.trace()
  // (added in svelte@5.14) prints exactly which dependency caused it.
  let a = $state(1);
  let b = $state(2);
  let c = $state(3);

  let mysterious = $derived.by(() => {
    $inspect.trace('mysterious');
    return a + b + c;
  });

  // === flushSync demo ===
  let messages = $state(['Hello!', 'Welcome to the chat']);
  let newMessage = $state('');
  let chatContainer = $state(null);

  function addMessage() {
    if (!newMessage.trim()) return;

    // Without flushSync, scrolling happens BEFORE the DOM updates
    // so it scrolls to the second-to-last message instead of the last

    // With flushSync, the DOM updates synchronously,
    // so our scroll targets the correct position
    flushSync(() => {
      messages = [...messages, newMessage];
      newMessage = '';
    });

    // Now the DOM is updated, so we can scroll to the bottom
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  // === Timing demo ===
  let timingLog = $state([]);

  function demonstrateTiming() {
    timingLog = [];
    const log = (msg) => timingLog = [...timingLog, msg];

    log('1. Synchronous (runs first)');

    setTimeout(() => {
      log('5. setTimeout (macrotask - runs last)');
    }, 0);

    Promise.resolve().then(() => {
      log('3. Promise.then (microtask)');
    });

    queueMicrotask(() => {
      log('4. queueMicrotask (microtask)');
    });

    log('2. Synchronous (still first, before any async)');
  }
</script>

<h1>$inspect, flushSync & Timing</h1>

<section>
  <h2>$inspect() — Better Debugging</h2>
  <button onclick={incrementCount}>count: {count} | score: {user.score}</button>

  <div class="tip">
    <p>Open your browser's DevTools console (F12). You'll see <code>$inspect</code> output whenever count or user changes.</p>
    <p><code>$inspect(count)</code> shows the actual value, not a Proxy object.</p>
    <p><strong>Note:</strong> $inspect only works in development mode — it's automatically removed in production builds.</p>
  </div>

  <pre class="console-preview">
// What console.log shows:
console.log(user) → Proxy {'{'}name: 'Alice', score: 0{'}'}

// What $inspect shows:
$inspect(user)    → init {'{'}name: 'Alice', score: 0{'}'}
                  → update {'{'}name: 'Alice', score: 10{'}'}
  </pre>
</section>

<section>
  <h2>$inspect.trace — Find the Culprit</h2>
  <p>Change any of these values. The console will print which one caused <code>mysterious</code> to recompute.</p>
  <div class="trace-controls">
    <button onclick={() => a++}>a = {a}</button>
    <button onclick={() => b++}>b = {b}</button>
    <button onclick={() => c++}>c = {c}</button>
  </div>
  <p>mysterious (a + b + c) = <strong>{mysterious}</strong></p>

  <pre class="console-preview">
// Put $inspect.trace() as the FIRST line of a derived or effect:
let result = $derived.by(() => {'{'}
  $inspect.trace('myDerived');
  return computeStuff(a, b, c);
{'}'});

// Console output (when a changes):
// myDerived
//   a: 1 → 2
  </pre>
</section>

<section>
  <h2>flushSync — Force DOM Update</h2>
  <p>Add messages to the chat. flushSync ensures the DOM updates before we scroll.</p>

  <div class="chat" bind:this={chatContainer}>
    {#each messages as msg, i}
      <div class="chat-message">
        <span class="msg-num">#{i + 1}</span>
        {msg}
      </div>
    {/each}
  </div>

  <div class="chat-input">
    <input
      bind:value={newMessage}
      placeholder="Type a message..."
      onkeydown={(e) => e.key === 'Enter' && addMessage()}
    />
    <button onclick={addMessage}>Send</button>
  </div>

  <pre class="code-block">
// Without flushSync:
messages = [...messages, msg];
container.scrollTop = container.scrollHeight;
// Scrolls BEFORE DOM updates — misses last message!

// With flushSync:
flushSync(() => {'{'}
  messages = [...messages, msg];
{'}'});
container.scrollTop = container.scrollHeight;
// DOM is updated, scroll targets correct position
  </pre>
</section>

<section>
  <h2>Event Loop Timing</h2>
  <button onclick={demonstrateTiming}>Run Timing Demo</button>

  <div class="timing-log">
    {#each timingLog as entry}
      <div class="timing-entry">{entry}</div>
    {:else}
      <div class="timing-entry empty">Click the button to see execution order</div>
    {/each}
  </div>

  <div class="event-loop">
    <div class="phase">
      <strong>1. Synchronous</strong>
      <span>Your code runs top-to-bottom</span>
    </div>
    <div class="phase">
      <strong>2. Microtasks</strong>
      <span>Promise.then, queueMicrotask</span>
    </div>
    <div class="phase">
      <strong>3. DOM Paint</strong>
      <span>Browser renders updates</span>
    </div>
    <div class="phase">
      <strong>4. Macrotasks</strong>
      <span>setTimeout, setInterval</span>
    </div>
  </div>
</section>

<style>
  h1 { color: #333; }
  section { margin: 1.5rem 0; padding: 1rem; background: #fafafa; border-radius: 8px; }
  button {
    padding: 0.5rem 1rem;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .tip {
    background: #e8f4fd;
    padding: 0.75rem;
    border-radius: 6px;
    margin: 0.75rem 0;
    font-size: 0.9rem;
  }
  .tip p { margin: 0.3rem 0; }
  code { background: #e0e0e0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  pre, .console-preview, .code-block {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.8rem;
    overflow-x: auto;
    white-space: pre;
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
  .chat-input { display: flex; gap: 0.5rem; }
  .chat-input input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  .timing-log {
    border: 1px solid #ddd;
    border-radius: 6px;
    margin: 0.75rem 0;
    overflow: hidden;
  }
  .timing-entry {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #f0f0f0;
    font-family: monospace;
    font-size: 0.85rem;
  }
  .empty { color: #999; font-style: italic; }
  .event-loop { display: flex; gap: 0.25rem; margin-top: 1rem; flex-wrap: wrap; }
  .phase {
    flex: 1;
    min-width: 140px;
    padding: 0.6rem;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    text-align: center;
  }
  .phase strong { display: block; font-size: 0.85rem; color: #4f46e5; }
  .phase span { font-size: 0.75rem; color: #888; }
  .trace-controls { display: flex; gap: 0.5rem; margin: 0.5rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
