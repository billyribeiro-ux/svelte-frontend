import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '14-3',
		title: '$effect.pre, $effect.tracking, $effect.root',
		phase: 5,
		module: 14,
		lessonIndex: 3
	},
	description: `The plain $effect rune is the 80% tool — but Svelte 5 exposes three advanced variants for the remaining 20%:

• $effect.pre runs BEFORE the DOM updates. Use it to read layout (scroll position, bounding rects) from the old DOM so you can make decisions for the new one. The canonical example is "auto-scroll a chat log only when the user is already near the bottom".

• $effect.tracking() returns true when called from inside a reactive dependency graph (a $derived, $effect, or template expression). Use it when writing library code that should behave differently inside vs. outside a reactive context.

• $effect.root creates a manually-managed reactive scope outside the normal component lifecycle. Return the teardown function, call it yourself, and you've got effects that outlive — or are independent of — component mount/unmount. Essential for app-level services, global shortcut handlers, and integration code.`,
	objectives: [
		'Use $effect.pre for scroll-preservation and pre-render measurement',
		'Detect reactive context with $effect.tracking() for library integration',
		'Create manual, disposable reactive scopes with $effect.root',
		'Choose the right effect primitive for each reactive scenario'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ─────────────────────────────────────────────────────────────
  // 1. $effect.pre — auto-scroll a chat, but ONLY if the user
  //    was already near the bottom. We must read scroll position
  //    BEFORE the new message is appended to the DOM.
  // ─────────────────────────────────────────────────────────────

  interface Message {
    id: number;
    author: string;
    text: string;
    time: string;
  }

  let messages: Message[] = $state([
    { id: 1, author: 'Alice', text: 'Welcome to the chat!', time: '09:00' },
    { id: 2, author: 'Bob', text: 'Svelte 5 is incredible.', time: '09:01' },
    { id: 3, author: 'Carol', text: 'Wait until you see runes.', time: '09:02' }
  ]);
  let nextId: number = $state(4);
  let chatEl: HTMLDivElement | undefined = $state();
  let autoStick: boolean = $state(true);

  // Read scroll position BEFORE DOM mutates
  $effect.pre(() => {
    // Re-runs when messages changes (length is the trigger)
    messages.length;
    if (!chatEl) return;
    const { scrollTop, scrollHeight, clientHeight } = chatEl;
    // Are we within 40px of the bottom right now?
    autoStick = scrollHeight - scrollTop - clientHeight < 40;
  });

  // Apply the decision AFTER DOM updates
  $effect(() => {
    messages.length;
    if (autoStick && chatEl) {
      chatEl.scrollTop = chatEl.scrollHeight;
    }
  });

  const authors = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve'];
  const phrases = [
    'Anyone else seeing this?',
    'Ship it!',
    'Docs look clean.',
    'Reviewed the PR, LGTM.',
    'Morning everyone!',
    'Need a rubber duck on this bug.',
    'Coffee break in 5.',
    'Runes for the win.'
  ];

  function pushMessage(): void {
    const now = new Date();
    messages = [
      ...messages,
      {
        id: nextId++,
        author: authors[Math.floor(Math.random() * authors.length)],
        text: phrases[Math.floor(Math.random() * phrases.length)],
        time: \`\${now.getHours().toString().padStart(2, '0')}:\${now.getMinutes().toString().padStart(2, '0')}\`
      }
    ];
  }

  function burst(): void {
    for (let i = 0; i < 5; i++) pushMessage();
  }

  // ─────────────────────────────────────────────────────────────
  // 2. $effect.tracking() — behaves differently inside and
  //    outside a reactive graph. Useful for library helpers.
  // ─────────────────────────────────────────────────────────────

  let trackingSamples: { context: string; tracking: boolean }[] = $state([]);

  function probe(context: string): boolean {
    const t = $effect.tracking();
    return t;
  }

  // Called from a $derived — tracking should be true
  let insideDerived = $derived(probe('derived'));

  // Call from a regular event handler — tracking should be false
  function sampleFromHandler(): void {
    trackingSamples = [
      ...trackingSamples,
      { context: 'event handler', tracking: probe('handler') },
      { context: '$derived (cached)', tracking: insideDerived }
    ].slice(-6);
  }

  // ─────────────────────────────────────────────────────────────
  // 3. $effect.root — manual scope outside component lifecycle.
  //    Perfect for global services, app-level shortcuts, and
  //    "start/stop" style APIs that don't tie to a specific tree.
  // ─────────────────────────────────────────────────────────────

  let serviceCounter: number = $state(0);
  let serviceRunning: boolean = $state(false);
  let serviceLog: string[] = $state([]);
  let stopService: (() => void) | null = null;

  function logService(msg: string): void {
    serviceLog = [\`[\${new Date().toLocaleTimeString()}] \${msg}\`, ...serviceLog].slice(0, 6);
  }

  function startService(): void {
    if (stopService) return;
    logService('service started');

    stopService = $effect.root(() => {
      // Inside a root scope, you can declare $effect/$derived freely.
      // They will NOT be destroyed when this component unmounts —
      // only when the cleanup function is invoked.

      $effect(() => {
        // This runs whenever serviceCounter changes
        if (serviceCounter > 0) {
          logService(\`observed counter=\${serviceCounter}\`);
        }
      });

      // Inner teardown — runs when stopService() is called
      return () => {
        logService('service cleanup executed');
      };
    });

    serviceRunning = true;
  }

  function stopServiceNow(): void {
    if (stopService) {
      stopService();
      stopService = null;
      serviceRunning = false;
      logService('service stopped');
    }
  }

  function bumpCounter(): void {
    serviceCounter++;
  }
</script>

<h1>Advanced Effect Primitives</h1>

<section>
  <h2>1. $effect.pre — Sticky Auto-Scroll Chat</h2>
  <p class="hint">
    Scroll up inside the chat, then click "Burst". Messages append, but the view
    stays where you left it. Scroll back to the bottom and the auto-stick re-engages.
  </p>
  <div class="chat" bind:this={chatEl}>
    {#each messages as msg (msg.id)}
      <div class="message">
        <div class="meta">
          <strong>{msg.author}</strong>
          <span>{msg.time}</span>
        </div>
        <div class="body">{msg.text}</div>
      </div>
    {/each}
  </div>
  <div class="row">
    <button onclick={pushMessage}>Add 1</button>
    <button onclick={burst}>Burst (5)</button>
    <span class="pill" class:on={autoStick}>
      {autoStick ? 'auto-sticking' : 'scroll unpinned'}
    </span>
  </div>
</section>

<section>
  <h2>2. $effect.tracking() — Context Detection</h2>
  <p class="hint">
    The same helper returns true when called from a reactive dependency graph,
    false otherwise. Libraries can use this to warn about misuse or opt into
    reactive behaviour.
  </p>
  <button onclick={sampleFromHandler}>Sample tracking() from an event handler</button>
  <ul class="samples">
    {#each trackingSamples as s, i (i)}
      <li>
        <span class="ctx">{s.context}</span>
        <span class="val" class:yes={s.tracking} class:no={!s.tracking}>
          {s.tracking ? 'TRACKING' : 'not tracking'}
        </span>
      </li>
    {/each}
    {#if trackingSamples.length === 0}
      <li class="empty">Click the button to collect samples.</li>
    {/if}
  </ul>
</section>

<section>
  <h2>3. $effect.root — Manual Scope & Cleanup</h2>
  <p class="hint">
    Start the "service" and bump the counter. The inner <code>$effect</code> logs
    updates until you stop the scope. Unmounting this component does NOT
    automatically tear down the root — you own the cleanup.
  </p>
  <div class="row">
    <button onclick={startService} disabled={serviceRunning}>Start service</button>
    <button onclick={stopServiceNow} disabled={!serviceRunning}>Stop service</button>
    <button onclick={bumpCounter}>Bump counter ({serviceCounter})</button>
  </div>
  <div class="service-log">
    <h3>Service Log</h3>
    {#if serviceLog.length === 0}
      <p class="empty">(no events)</p>
    {:else}
      {#each serviceLog as entry, i (i)}
        <div class="entry">{entry}</div>
      {/each}
    {/if}
  </div>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.75rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.05rem; }
  h3 { margin: 0 0 0.5rem; font-size: 0.9rem; color: #74b9ff; }
  .hint { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem; }
  .row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-top: 0.75rem; }

  button {
    padding: 0.5rem 0.9rem; border: none; border-radius: 6px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  button:hover:not(:disabled) { background: #5a4bd1; }
  button:disabled { background: #b2bec3; cursor: not-allowed; }

  .chat {
    height: 220px; overflow-y: auto; background: white;
    border: 1px solid #dfe6e9; border-radius: 8px; padding: 0.75rem;
  }
  .message { padding: 0.5rem 0.6rem; border-radius: 8px; background: #eef2ff; margin-bottom: 0.5rem; }
  .meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #636e72; }
  .meta strong { color: #6c5ce7; }
  .body { font-size: 0.9rem; margin-top: 0.15rem; }

  .pill {
    padding: 0.25rem 0.6rem; border-radius: 999px;
    background: #dfe6e9; color: #636e72; font-size: 0.75rem; font-weight: 600;
  }
  .pill.on { background: #d1fadf; color: #00a36c; }

  .samples { list-style: none; padding: 0; margin: 0.5rem 0 0; }
  .samples li {
    display: flex; justify-content: space-between;
    padding: 0.4rem 0.6rem; background: white; border-radius: 6px;
    margin-bottom: 0.3rem; font-size: 0.88rem;
  }
  .ctx { color: #2d3436; font-family: ui-monospace, monospace; }
  .val { font-weight: 700; font-size: 0.78rem; padding: 0.15rem 0.5rem; border-radius: 4px; }
  .val.yes { background: #d1fadf; color: #00a36c; }
  .val.no { background: #ffe4e6; color: #d63031; }
  .empty { color: #b2bec3; }

  .service-log {
    margin-top: 0.75rem; padding: 0.75rem; background: #2d3436;
    border-radius: 8px; color: #dfe6e9;
  }
  .entry { font-family: ui-monospace, monospace; font-size: 0.78rem; padding: 0.1rem 0; }
  code { background: #eef; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
