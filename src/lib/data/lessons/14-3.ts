import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '14-3',
		title: '$effect.pre, $effect.tracking, $effect.root',
		phase: 5,
		module: 14,
		lessonIndex: 3
	},
	description: `Svelte 5 provides several advanced effect primitives beyond the basic $effect. $effect.pre runs before the DOM updates, making it ideal for measuring or preparing state before a render — such as saving scroll position before new content is added.

$effect.tracking() returns true when called inside a reactive context (like $derived or $effect), letting you write code that behaves differently depending on whether it's being tracked. $effect.root creates a manually-managed reactive scope that isn't tied to the component lifecycle, useful for creating reactive logic outside components or managing cleanup yourself.`,
	objectives: [
		'Use $effect.pre to run logic before DOM updates for tasks like autoscroll',
		'Check reactive context with $effect.tracking() to write context-aware code',
		'Create manual reactive scopes with $effect.root and handle their cleanup',
		'Choose the right effect primitive for different reactive scenarios'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let messages: string[] = $state([]);
  let chatContainer: HTMLDivElement | undefined = $state();
  let shouldAutoScroll: boolean = $state(true);
  let rootCleanup: (() => void) | null = $state(null);
  let externalCounter: number = $state(0);

  // $effect.pre runs BEFORE DOM update — perfect for measuring scroll
  $effect.pre(() => {
    if (chatContainer) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      // Check if user is near the bottom before new messages render
      shouldAutoScroll = scrollHeight - scrollTop - clientHeight < 50;
    }
  });

  // Regular $effect runs AFTER DOM update — apply the scroll decision
  $effect(() => {
    if (shouldAutoScroll && chatContainer && messages.length > 0) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });

  // Demonstrate $effect.tracking()
  function getTrackingStatus(): string {
    // This would return true inside $derived or $effect, false otherwise
    return $effect.tracking()
      ? 'Inside a reactive context'
      : 'Outside reactive tracking';
  }

  // Call in a derived context to show it returns true
  let trackingInfo: string = $derived(getTrackingStatus());

  function addMessage(): void {
    const greetings = [
      'Hello there!', 'How are you?', 'Great weather today!',
      'Did you see that?', 'Svelte 5 is amazing!', 'Check this out!',
      'What do you think?', 'I agree completely.', 'Interesting point!',
    ];
    const msg = greetings[Math.floor(Math.random() * greetings.length)];
    messages = [...messages, \`[\${new Date().toLocaleTimeString()}] \${msg}\`];
  }

  function startRootEffect(): void {
    if (rootCleanup) return;
    // $effect.root creates a scope that must be cleaned up manually
    rootCleanup = $effect.root(() => {
      $effect(() => {
        // This effect lives outside the normal component lifecycle
        console.log('Root effect: counter is', externalCounter);
      });

      // Return value from the inner $effect.root callback is the cleanup
      return () => {
        console.log('Root effect scope destroyed');
      };
    });
  }

  function stopRootEffect(): void {
    if (rootCleanup) {
      rootCleanup();
      rootCleanup = null;
    }
  }

  function incrementExternal(): void {
    externalCounter++;
  }
</script>

<h1>Advanced Effects</h1>

<section>
  <h2>$effect.pre — Auto-scroll Chat</h2>
  <div class="chat" bind:this={chatContainer}>
    {#each messages as msg}
      <div class="message">{msg}</div>
    {/each}
    {#if messages.length === 0}
      <p class="empty">No messages yet.</p>
    {/if}
  </div>
  <button onclick={addMessage}>Add Message</button>
  <span class="badge">{shouldAutoScroll ? 'Auto-scrolling' : 'Scroll paused'}</span>
</section>

<section>
  <h2>$effect.tracking()</h2>
  <p>Inside $derived: <strong>{trackingInfo}</strong></p>
  <p>Called directly: <strong>{getTrackingStatus()}</strong></p>
</section>

<section>
  <h2>$effect.root — Manual Scope</h2>
  <p>External counter: <strong>{externalCounter}</strong></p>
  <div class="controls">
    <button onclick={startRootEffect} disabled={rootCleanup !== null}>
      Start Root Effect
    </button>
    <button onclick={stopRootEffect} disabled={rootCleanup === null}>
      Stop Root Effect
    </button>
    <button onclick={incrementExternal}>Increment Counter</button>
  </div>
  <p class="hint">
    {rootCleanup ? 'Root effect is active — check the console.' : 'Root effect is stopped.'}
  </p>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.1rem; }
  .chat {
    height: 180px; overflow-y: auto; border: 1px solid #ddd;
    border-radius: 6px; padding: 0.5rem; background: white; margin-bottom: 0.75rem;
  }
  .message {
    padding: 0.4rem 0.6rem; margin-bottom: 0.25rem;
    background: #dfe6e9; border-radius: 12px; font-size: 0.9rem;
  }
  .empty { color: #b2bec3; text-align: center; }
  button {
    padding: 0.5rem 1rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
  }
  button:disabled { background: #b2bec3; cursor: not-allowed; }
  button:hover:not(:disabled) { background: #5a4bd1; }
  .controls { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .badge {
    display: inline-block; margin-left: 0.5rem; padding: 0.25rem 0.6rem;
    background: #00b894; color: white; border-radius: 12px; font-size: 0.8rem;
  }
  .hint { font-size: 0.85rem; color: #636e72; margin-top: 0.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
