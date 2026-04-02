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

## WHY Attachments Replace use: Actions

Svelte 4's \`use:\` directive let you run code when an element was created and optionally return a cleanup function. This "action" pattern was useful but had several design problems that \`{@attach}\` resolves.

### Problem 1: Actions Could Not Be Composed

In Svelte 4, each \`use:\` directive occupied a dedicated attribute slot. If you wanted to apply two actions to the same element, you wrote:

\`\`\`svelte
<div use:tooltip={'Help text'} use:clickOutside={close}>
\`\`\`

This worked, but there was no way to programmatically compose actions. You could not create a function that combined \`tooltip\` and \`clickOutside\` into a single action without creating a wrapper action that manually managed both. Attachments solve this because they are just functions -- you can compose them with standard function composition.

### Problem 2: The Update Lifecycle Was Confusing

Actions in Svelte 4 could return an \`update\` method that was called when the action's parameter changed. But the semantics were subtle: the \`update\` function received the new parameter value, and you had to manually diff it against the old value to decide what to change. This created a three-phase lifecycle (create, update, destroy) that was often more complex than needed.

Attachments simplify to two phases: **attach** (element enters DOM) and **cleanup** (element leaves DOM). If you need to react to parameter changes, you use \`$effect\` inside the attachment function, which handles dependency tracking automatically.

### Problem 3: Actions Were Not Compatible with SSR

Actions depend on DOM APIs (\`addEventListener\`, \`getBoundingClientRect\`, etc.) that do not exist during server-side rendering. The \`use:\` directive silently skipped during SSR, but this could lead to hydration mismatches if the action affected visible state. Attachments have clear SSR semantics: they run only on the client, during the attachment phase.

### How {@attach} Works

An attachment is a function that receives a DOM element and optionally returns a cleanup function:

\`\`\`typescript
function myAttachment(node: HTMLElement) {
  // Setup: runs when element enters the DOM
  node.style.border = '2px solid red';

  return () => {
    // Cleanup: runs when element leaves the DOM
    node.style.border = '';
  };
}
\`\`\`

You apply it with \`{@attach}\` in the template:

\`\`\`svelte
<div {@attach myAttachment}>
\`\`\`

### Attachment Factories (Parameterized Attachments)

Since attachments are just functions, you create parameterized attachments with a factory pattern -- a function that returns an attachment function:

\`\`\`typescript
function tooltip(text: string) {
  return (node: HTMLElement) => {
    // setup with 'text' parameter
    return () => { /* cleanup */ };
  };
}

// Usage:
<button {@attach tooltip('Click me!')}>
\`\`\`

This is standard JavaScript currying -- no special Svelte syntax needed. The outer function captures parameters; the inner function receives the DOM node.

### Observers: The Primary Use Case

The most common use of attachments is setting up DOM observers that need cleanup:

| Observer | Attachment Does |
|---|---|
| \`IntersectionObserver\` | Detect when element enters/leaves viewport (lazy loading, analytics) |
| \`MutationObserver\` | Watch for DOM changes within the element |
| \`ResizeObserver\` | Track element size changes (alternative to dimension bindings) |
| \`addEventListener\` | Listen for events on the document or window, scoped to element lifetime |

Each observer requires disconnection on cleanup. Attachments make this pattern safe and concise:

\`\`\`typescript
function lazyLoad(src: string) {
  return (node: HTMLImageElement) => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.src = src;
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  };
}
\`\`\``
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

### Building a Tooltip Attachment

A tooltip attachment demonstrates the full lifecycle pattern:

1. **Factory function** accepts the tooltip text
2. **Attachment function** creates the tooltip element, adds event listeners for hover
3. **Cleanup function** removes event listeners and the tooltip element

\`\`\`typescript
function tooltip(text: string) {
  return (node: HTMLElement) => {
    const tip = document.createElement('div');
    tip.textContent = text;
    // ... position and style the tooltip ...

    function show() { document.body.appendChild(tip); }
    function hide() { tip.remove(); }

    node.addEventListener('mouseenter', show);
    node.addEventListener('mouseleave', hide);

    return () => {
      node.removeEventListener('mouseenter', show);
      node.removeEventListener('mouseleave', hide);
      tip.remove();  // Clean up if tooltip is visible when element is removed
    };
  };
}
\`\`\`

### WHY Cleanup Matters

Without cleanup, you create memory leaks and ghost event listeners. Consider a list of items with tooltips. When an item is removed from the list, its DOM element is removed. But if the tooltip attachment added a \`mouseenter\` listener to the document (not the element), that listener persists indefinitely. The cleanup function prevents this.

The rule is simple: **every \`addEventListener\` needs a corresponding \`removeEventListener\` in cleanup. Every \`observer.observe\` needs an \`observer.disconnect\`. Every DOM element you create and append needs to be removed.**

**Your task:** Create a \`tooltip\` attachment that shows a tooltip on hover. Apply it with \`{@attach tooltip('tooltip text')}\` on a button.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Attachments with Parameters: clickOutside

The \`clickOutside\` pattern is one of the most common UI behaviors: dismiss a dropdown, modal, or popover when the user clicks outside of it. Without an attachment, implementing this correctly requires:

1. Adding a \`click\` listener to \`document\`
2. In the handler, checking if the click target is inside the element (\`node.contains(target)\`)
3. If outside, calling the dismiss callback
4. Removing the document listener when the element is removed
5. Avoiding catching the click that opened the element (using \`setTimeout\` or event phase tricks)

The attachment pattern encapsulates all of this:

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

### The setTimeout Trick

Notice a subtlety: when the user clicks a button to open the dropdown, that same click event bubbles up to the document. If the \`clickOutside\` listener is added synchronously, it catches the opening click and immediately closes the dropdown.

The fix is to delay adding the listener:

\`\`\`typescript
setTimeout(() => document.addEventListener('click', handler), 0);
\`\`\`

This pushes the listener registration to the next task, after the opening click event has finished propagating.

### Decision Framework: Attachment vs. $effect vs. Event Handler

| Need | Use |
|---|---|
| Run code when an element enters/leaves the DOM | Attachment |
| React to state changes (no DOM element needed) | \`$effect\` |
| Respond to user interaction on a specific element | Event handler (\`onclick\`, etc.) |
| Set up a global listener scoped to an element's lifetime | Attachment |
| Imperatively control a DOM element (focus, scroll) | Attachment or \`$effect\` with \`bind:this\` |

The key distinction: attachments are element-scoped lifecycle hooks. \`$effect\` is state-scoped reactive computation. Use attachments when you need the DOM node; use \`$effect\` when you need reactive values.

**Task:** Create a \`clickOutside\` attachment that closes a dropdown when clicking outside it. Remember to handle the opening click edge case.`
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
