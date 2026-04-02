import type { Lesson } from '$types/lesson';

export const inAndOut: Lesson = {
	id: 'svelte-core.transitions-and-animations.in-and-out',
	slug: 'in-and-out',
	title: 'In and Out Directives',
	description:
		'Use separate in: and out: directives for different enter and exit animations.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 2,
	estimatedMinutes: 10,
	concepts: ['svelte5.transitions.in', 'svelte5.transitions.out', 'svelte5.transitions.separate'],
	prerequisites: ['svelte5.transitions.directive'],

	content: [
		{
			type: 'text',
			content: `# Separate In and Out Transitions

## WHY Separate Directives Exist

The \`transition:\` directive uses the same animation function for both entering and leaving, just run in opposite directions (\`t: 0->1\` for intro, \`t: 1->0\` for outro). This is elegant and sufficient for many cases, but it creates an inherent symmetry that does not always match the UX you want.

Consider a notification toast: it should **slide in from the right** (directional, attention-grabbing, suggests a new item arriving) and **fade out** (gentle, non-distracting, suggests the item dissolving away). These are fundamentally different animations. With \`transition:\`, you cannot achieve this -- you get the same animation played forward and backward.

The \`in:\` and \`out:\` directives let you assign **completely different transition functions** to the enter and exit phases. Each directive independently specifies its function, parameters, and timing.

### Reversal Mechanics: How Svelte Handles Mid-Animation Toggles

One of the most subtle aspects of transitions is what happens when a user toggles visibility while an animation is still running. Consider this scenario:

1. User clicks "show" -- element begins flying in from the right (\`in:fly\`)
2. Halfway through the animation, user clicks "hide"
3. What should happen?

With \`transition:\` (bidirectional), Svelte reverses the same animation from its current position. The element smoothly changes direction. This works because the same function generates CSS for both directions.

With separate \`in:\` and \`out:\` directives, the behavior is different:
- The \`in:\` animation is **aborted** at its current position
- The \`out:\` animation **starts from the element's current visual state**

If the \`in:\` and \`out:\` transitions animate different properties, this can create visual discontinuities. For example, if \`in:\` animates \`transform\` (position) and \`out:\` animates \`opacity\`, the element will suddenly stop moving and start fading. This is not a bug -- it is the expected behavior of two independent animations.

### Decision Framework: transition: vs. in:/out:

Use **transition:** (bidirectional) when:
- The enter and exit animations are the same effect in reverse
- Mid-animation reversal should be seamless (toggles are common)
- Examples: modals, tooltips, accordions

Use **in:/out:** (separate) when:
- Enter and exit animations are conceptually different
- The element typically completes its animation before being removed
- Examples: notifications (slide in, fade out), list items (fly in from left, fade out), page transitions (slide in from right, slide out to left)

### UX Patterns for In/Out Transitions

**Notification toasts:** \`in:fly={{ x: 300 }}\` (slide in from side) + \`out:fade\` (gentle disappearance). The directional entry draws attention; the fade exit avoids distracting the user.

**Form validation messages:** \`in:slide\` (expand into space, pushing content down) + \`out:fade={{ duration: 150 }}\` (disappear quickly when resolved). The slide-in communicates "new content is being inserted here," while the fast fade communicates "this issue is resolved."

**Route transitions:** \`in:fly={{ x: 100 }}\` (page slides in from right) + \`out:fly={{ x: -100 }}\` (old page slides out to left). This creates a navigation metaphor where pages are arranged left-to-right.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.transitions.in'
		},
		{
			type: 'text',
			content: `## Using in: and out:

\`\`\`svelte
<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  let visible = $state(true);
</script>

{#if visible}
  <p in:fly={{ y: -20 }} out:fade>
    Flies in from above, fades out
  </p>
{/if}
\`\`\`

### Timing Independence

Each directive has its own \`duration\` and \`delay\`. This means the entry animation can be slow and dramatic while the exit is fast and subtle:

\`\`\`svelte
<div
  in:fly={{ x: 200, duration: 600, easing: elasticOut }}
  out:fade={{ duration: 150 }}
>
\`\`\`

This timing independence is critical for polish. Entry animations benefit from longer durations that let users perceive the movement. Exit animations should generally be faster because the user has already decided to dismiss the element and does not want to wait.

A useful heuristic: **exit animations should be 40-60% the duration of entry animations.** An entry of 400ms pairs well with an exit of 200ms.

**Your task:** Create a notification that flies in from the right and fades out using separate \`in:\` and \`out:\` directives. Notice how the two animations feel natural because they serve different UX purposes.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Practical Example: Toast Notifications

Toast notifications are the canonical use case for separate in/out transitions. They need to:
1. **Announce themselves** with a directional entry (sliding in from the edge of the screen)
2. **Disappear gracefully** without drawing attention back (fading out)
3. **Stack properly** when multiple toasts are active
4. **Handle rapid additions** without visual chaos

The combination of \`in:fly\` and \`out:fade\` achieves all of this. The fly-in creates a clear visual signal that something new has appeared. The fade-out avoids the jarring "slide back to where it came from" effect that a bidirectional \`transition:fly\` would produce.

### Keyed Each Blocks and Transitions

When transitions are used inside \`{#each}\` blocks, each item gets its own transition instance. Items added to the list trigger \`in:\` transitions; items removed trigger \`out:\` transitions. This works correctly only when the each block is **keyed** -- \`{#each items as item (item.id)}\`. Without a key, Svelte cannot distinguish between "item added/removed" and "item content changed," which leads to incorrect transition behavior.

### The Auto-Dismiss Pattern

Toast notifications typically auto-dismiss after a timeout. The pattern combines \`setTimeout\` with array manipulation:

\`\`\`typescript
function addToast(message: string) {
  const id = nextId++;
  toasts.push({ id, message });
  setTimeout(() => removeToast(id), 3000);
}
\`\`\`

When \`removeToast\` removes the item from the array, Svelte detects the removal, plays the \`out:\` transition, and then removes the DOM node after the animation completes.

**Task:** Build a simple toast system where clicking a button adds a notification that flies in and fades out after a delay. Each toast should animate independently.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { fly, fade, slide } from 'svelte/transition';

  let visible = $state(true);
  let toasts = $state<{ id: number; message: string }[]>([]);
  let nextId = $state(0);

  function addToast() {
    const id = nextId++;
    toasts.push({ id, message: 'Notification #' + id });
    setTimeout(() => removeToast(id), 3000);
  }

  function removeToast(id: number) {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) toasts.splice(index, 1);
  }
</script>

<div>
  <section>
    <h2>In/Out Directives</h2>
    <button onclick={() => visible = !visible}>Toggle</button>
    {#if visible}
      <!-- TODO: Add separate in: and out: transitions -->
      <div class="notification">
        I should fly in and fade out!
      </div>
    {/if}
  </section>

  <section>
    <h2>Toast Notifications</h2>
    <button onclick={addToast}>Add Toast</button>
    <div class="toast-container">
      {#each toasts as toast (toast.id)}
        <!-- TODO: Add in: and out: transitions to toasts -->
        <div class="toast">
          {toast.message}
          <button onclick={() => removeToast(toast.id)}>x</button>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 2rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .notification {
    margin-top: 1rem;
    padding: 1rem;
    background: #dbeafe;
    border-radius: 8px;
  }

  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toast {
    background: #1e1b4b;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .toast button {
    background: transparent;
    padding: 0;
    font-size: 1rem;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { fly, fade, slide } from 'svelte/transition';

  let visible = $state(true);
  let toasts = $state<{ id: number; message: string }[]>([]);
  let nextId = $state(0);

  function addToast() {
    const id = nextId++;
    toasts.push({ id, message: 'Notification #' + id });
    setTimeout(() => removeToast(id), 3000);
  }

  function removeToast(id: number) {
    const index = toasts.findIndex(t => t.id === id);
    if (index !== -1) toasts.splice(index, 1);
  }
</script>

<div>
  <section>
    <h2>In/Out Directives</h2>
    <button onclick={() => visible = !visible}>Toggle</button>
    {#if visible}
      <div class="notification" in:fly={{ x: 200, duration: 400 }} out:fade={{ duration: 300 }}>
        I fly in from the right and fade out!
      </div>
    {/if}
  </section>

  <section>
    <h2>Toast Notifications</h2>
    <button onclick={addToast}>Add Toast</button>
    <div class="toast-container">
      {#each toasts as toast (toast.id)}
        <div class="toast" in:fly={{ x: 300, duration: 300 }} out:fade={{ duration: 200 }}>
          {toast.message}
          <button onclick={() => removeToast(toast.id)}>x</button>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 2rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .notification {
    margin-top: 1rem;
    padding: 1rem;
    background: #dbeafe;
    border-radius: 8px;
  }

  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .toast {
    background: #1e1b4b;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .toast button {
    background: transparent;
    padding: 0;
    font-size: 1rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use separate in: and out: directives on the notification',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'in:fly' },
						{ type: 'contains', value: 'out:fade' }
					]
				}
			},
			hints: [
				'Replace `transition:` with separate `in:` and `out:` directives.',
				'Use `in:fly={{ x: 200 }}` for entering and `out:fade` for leaving.',
				'Change the notification div to `<div class="notification" in:fly={{ x: 200, duration: 400 }} out:fade={{ duration: 300 }}>`.'
			],
			conceptsTested: ['svelte5.transitions.in', 'svelte5.transitions.out']
		},
		{
			id: 'cp-2',
			description: 'Add in/out transitions to toast notifications in the each block',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'class="toast".*in:' },
						{ type: 'regex', value: 'class="toast".*out:' }
					]
				}
			},
			hints: [
				'Add `in:` and `out:` directives to the toast div inside the `{#each}` block.',
				'Try `in:fly={{ x: 300, duration: 300 }}` and `out:fade={{ duration: 200 }}`.',
				'On the toast div: `<div class="toast" in:fly={{ x: 300, duration: 300 }} out:fade={{ duration: 200 }}>`'
			],
			conceptsTested: ['svelte5.transitions.separate']
		}
	]
};
