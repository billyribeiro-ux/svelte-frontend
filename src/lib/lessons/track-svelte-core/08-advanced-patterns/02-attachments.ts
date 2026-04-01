import type { Lesson } from '$types/lesson';

export const attachments: Lesson = {
	id: 'svelte-core.advanced-patterns.attachments',
	slug: 'attachments',
	title: 'Attachments',
	description:
		'Use {@attach} to run code when elements are created and destroyed, replacing use: actions.',
	trackId: 'svelte-core',
	moduleId: 'advanced-patterns',
	order: 2,
	estimatedMinutes: 15,
	concepts: ['svelte5.attachments.basic', 'svelte5.attachments.lifecycle'],
	prerequisites: ['svelte5.runes.state', 'svelte5.lifecycle.effect'],

	content: [
		{
			type: 'text',
			content: `# Attachments

Attachments are Svelte 5's way to run code when an element is added to (and removed from) the DOM. They replace the \`use:\` action directive with a more composable pattern using \`{@attach}\`.

An attachment is a function that receives the element and optionally returns a cleanup function.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.attachments.basic'
		},
		{
			type: 'text',
			content: `## Basic Attachments

\`\`\`svelte
<script lang="ts">
  function autoFocus(node: HTMLElement) {
    node.focus();
    return () => {
      // cleanup when element is removed
    };
  }
</script>

<input {@attach autoFocus} placeholder="I'm focused!" />
\`\`\`

The function runs when the element mounts. If it returns a function, that function runs when the element is removed.

**Your task:** Create a \`tooltip\` attachment that shows a tooltip on hover.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Attachments with Parameters

You can create attachment factories — functions that return an attachment function. This lets you pass configuration.

\`\`\`svelte
<script lang="ts">
  function clickOutside(callback: () => void) {
    return (node: HTMLElement) => {
      function handler(e: MouseEvent) {
        if (!node.contains(e.target as Node)) callback();
      }
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    };
  }

  let open = $state(false);
</script>

{#if open}
  <div {@attach clickOutside(() => open = false)}>
    Click outside to close
  </div>
{/if}
\`\`\`

**Task:** Create a \`clickOutside\` attachment that closes a dropdown when clicking outside it.`
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
  let open = $state(false);

  // TODO: Create a tooltip attachment

  // TODO: Create a clickOutside attachment factory
</script>

<div>
  <section>
    <h2>Tooltip Attachment</h2>
    <!-- TODO: Add tooltip attachment to this button -->
    <button>Hover me</button>
  </section>

  <section>
    <h2>Click Outside</h2>
    <button onclick={() => open = true}>Open Dropdown</button>
    {#if open}
      <!-- TODO: Add clickOutside attachment -->
      <div class="dropdown">
        <p>Dropdown content</p>
        <p>Click outside to close</p>
      </div>
    {/if}
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 2rem;
    position: relative;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.5rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
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
  let open = $state(false);

  function tooltip(text: string) {
    return (node: HTMLElement) => {
      const tip = document.createElement('div');
      tip.textContent = text;
      tip.style.cssText =
        'position:absolute;background:#1e1b4b;color:white;padding:4px 8px;border-radius:4px;font-size:0.75rem;pointer-events:none;white-space:nowrap;z-index:100;';

      function show() {
        const rect = node.getBoundingClientRect();
        tip.style.left = rect.left + rect.width / 2 + 'px';
        tip.style.top = rect.top - 30 + 'px';
        tip.style.transform = 'translateX(-50%)';
        document.body.appendChild(tip);
      }

      function hide() {
        tip.remove();
      }

      node.addEventListener('mouseenter', show);
      node.addEventListener('mouseleave', hide);

      return () => {
        node.removeEventListener('mouseenter', show);
        node.removeEventListener('mouseleave', hide);
        tip.remove();
      };
    };
  }

  function clickOutside(callback: () => void) {
    return (node: HTMLElement) => {
      function handler(e: MouseEvent) {
        if (!node.contains(e.target as Node)) {
          callback();
        }
      }
      // Delay to avoid catching the opening click
      setTimeout(() => document.addEventListener('click', handler), 0);
      return () => document.removeEventListener('click', handler);
    };
  }
</script>

<div>
  <section>
    <h2>Tooltip Attachment</h2>
    <button {@attach tooltip('Click to do something!')}>Hover me</button>
  </section>

  <section>
    <h2>Click Outside</h2>
    <button onclick={() => open = true}>Open Dropdown</button>
    {#if open}
      <div class="dropdown" {@attach clickOutside(() => open = false)}>
        <p>Dropdown content</p>
        <p>Click outside to close</p>
      </div>
    {/if}
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 2rem;
    position: relative;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.5rem;
    padding: 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a tooltip attachment and apply it with {@attach}',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'function tooltip' },
						{ type: 'contains', value: '{@attach tooltip' }
					]
				}
			},
			hints: [
				'Create a factory function: `function tooltip(text) { return (node) => { ... }; }`',
				'Add event listeners for mouseenter/mouseleave and return a cleanup function.',
				'Apply with `{@attach tooltip(\'My tooltip text\')}` on the element.'
			],
			conceptsTested: ['svelte5.attachments.basic']
		},
		{
			id: 'cp-2',
			description: 'Create a clickOutside attachment factory',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'function clickOutside' },
						{ type: 'contains', value: '{@attach clickOutside' }
					]
				}
			},
			hints: [
				'`clickOutside` should accept a callback and return an attachment function.',
				'Inside the attachment, add a document click listener that checks `node.contains(e.target)`.',
				'Return a cleanup that removes the listener: `return () => document.removeEventListener(\'click\', handler);`'
			],
			conceptsTested: ['svelte5.attachments.basic', 'svelte5.attachments.lifecycle']
		}
	]
};
