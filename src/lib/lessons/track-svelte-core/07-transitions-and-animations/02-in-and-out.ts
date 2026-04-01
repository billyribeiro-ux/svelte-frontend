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

The \`transition:\` directive uses the same animation for both entering and leaving. If you want **different** animations, use the \`in:\` and \`out:\` directives separately.

This gives you full control over enter and exit behavior.`
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

**Your task:** Create a notification that flies in from the right and slides out to the left using separate \`in:\` and \`out:\` directives.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Practical Example: Toast Notifications

Separate transitions are perfect for toast notifications — they slide in from one edge and fade out.

**Task:** Build a simple toast system where clicking a button adds a notification that flies in and fades out after a delay.`
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
