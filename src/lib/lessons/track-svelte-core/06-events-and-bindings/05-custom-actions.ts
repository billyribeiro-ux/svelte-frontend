import type { Lesson } from '$types/lesson';

export const customActions: Lesson = {
	id: 'svelte-core.bindings.custom-actions',
	slug: 'custom-actions',
	title: 'Custom Actions — Encapsulating DOM Logic',
	description:
		'Master Svelte actions (use: directive) to encapsulate reusable DOM behaviours — tooltip integrations, click-outside handlers, auto-resize textareas, focus traps, and intersection observers.',
	trackId: 'svelte-core',
	moduleId: 'events-and-bindings',
	order: 5,
	estimatedMinutes: 25,
	concepts: ['svelte5.actions.basics', 'svelte5.actions.parameters', 'svelte5.actions.update'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.effect'],

	content: [
		{
			type: 'text',
			content: `# Custom Actions — Encapsulating DOM Logic

Sometimes you need to do things that live outside Svelte's templating system: attach a third-party tooltip library to an element, observe when it enters the viewport, run cleanup when it is removed from the DOM, or listen for clicks outside a dropdown. These tasks all require direct DOM access, and if you repeat them across multiple components, you end up with duplicated imperative code.

Svelte **actions** are the solution. An action is a function that runs when an element mounts, can respond to updates, and can clean up after itself when the element is destroyed. You apply an action to an element with the \`use:\` directive.

## The Action Interface

\`\`\`ts
function myAction(node: Element, parameter?: any) {
  // Runs when the element is first added to the DOM
  // node = the DOM element
  // parameter = optional argument passed via use:myAction={value}

  return {
    update(newParameter) {
      // Runs when the parameter changes
    },
    destroy() {
      // Runs when the element is removed from the DOM
      // Clean up event listeners, observers, timers, etc.
    }
  };
}
\`\`\`

You can omit \`update\` or \`destroy\` if not needed. The minimal action just does work on mount:

\`\`\`ts
function autofocus(node: HTMLElement) {
  node.focus();
}
\`\`\`

\`\`\`svelte
<input use:autofocus />
\`\`\`

## Example 1 — Click Outside

A classic use case: close a dropdown when the user clicks anything outside it.

\`\`\`ts
function clickOutside(node: Element, callback: () => void) {
  function handleClick(event: MouseEvent) {
    if (!node.contains(event.target as Node)) {
      callback();
    }
  }

  document.addEventListener('click', handleClick, { capture: true });

  return {
    destroy() {
      document.removeEventListener('click', handleClick, { capture: true });
    }
  };
}
\`\`\`

\`\`\`svelte
<script>
  let isOpen = $state(false);
</script>

{#if isOpen}
  <div class="dropdown" use:clickOutside={() => { isOpen = false; }}>
    <p>Dropdown content</p>
  </div>
{/if}
\`\`\`

The action attaches a document-level listener on mount and removes it on destroy. If you used \`$effect\` for this instead, you would need to manually manage when to add/remove the listener based on the open state. The action version is cleaner and reusable.

## Example 2 — Auto-Resize Textarea

\`\`\`ts
function autoResize(node: HTMLTextAreaElement) {
  function resize() {
    node.style.height = 'auto';
    node.style.height = node.scrollHeight + 'px';
  }

  resize(); // Initial size
  node.addEventListener('input', resize);

  return {
    destroy() {
      node.removeEventListener('input', resize);
    }
  };
}
\`\`\`

\`\`\`svelte
<textarea use:autoResize placeholder="Type here, I'll grow as you type..."></textarea>
\`\`\`

## Example 3 — Action with Parameters

Actions can receive parameters and update when they change:

\`\`\`ts
interface LongPressParams {
  duration?: number;
  onpress: () => void;
}

function longPress(node: Element, params: LongPressParams) {
  let timer: ReturnType<typeof setTimeout>;
  const duration = params.duration ?? 500;

  function handleDown() {
    timer = setTimeout(() => params.onpress(), duration);
  }
  function handleUp() {
    clearTimeout(timer);
  }

  node.addEventListener('pointerdown', handleDown);
  node.addEventListener('pointerup', handleUp);
  node.addEventListener('pointerleave', handleUp);

  return {
    update(newParams: LongPressParams) {
      // If params change, update the callback reference
      params = newParams;
    },
    destroy() {
      clearTimeout(timer);
      node.removeEventListener('pointerdown', handleDown);
      node.removeEventListener('pointerup', handleUp);
      node.removeEventListener('pointerleave', handleUp);
    }
  };
}
\`\`\`

\`\`\`svelte
<button use:longPress={{ duration: 800, onpress: handleLongPress }}>
  Hold me
</button>
\`\`\`

## Example 4 — IntersectionObserver

Actions are perfect for wrapping browser APIs that have setup/teardown:

\`\`\`ts
function lazyLoad(node: HTMLImageElement, src: string) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      node.src = src;
      observer.disconnect();
    }
  }, { threshold: 0.1 });

  observer.observe(node);

  return { destroy() { observer.disconnect(); } };
}
\`\`\`

\`\`\`svelte
{#each images as img}
  <!-- Image src only loads when it enters the viewport -->
  <img use:lazyLoad={img.src} alt={img.alt} />
{/each}
\`\`\`

## Actions vs $effect

You might wonder why you would use an action when \`$effect\` can also run DOM code. Here is when each is appropriate:

**Use \`$effect\`** when the DOM logic is specific to one component and depends on reactive state from that component.

**Use an action** when:
- The logic is reusable across multiple components
- The logic is tied to a specific element rather than the whole component
- You want to give other developers a clean \`use:\` API without them needing to understand the implementation
- You are building a component library

The action is effectively a composable DOM lifecycle — the \`use:\` directive is to DOM behaviour what snippets are to markup.`
		},
		{
			type: 'checkpoint',
			content: 'cp-action-click-outside'
		},
		{
			type: 'checkpoint',
			content: 'cp-action-tooltip'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray and look at the Compiler Output for an element with `use:myAction`. Notice how the action call is woven into the element\'s mount/destroy lifecycle in the compiled output — Svelte calls `myAction(node, param)` when mounting and calls the returned `destroy()` when unmounting.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  // Part 1: Click Outside Action
  // TODO: Implement the clickOutside action
  function clickOutside(node, callback) {
    // Your implementation here
  }

  let dropdownOpen = $state(false);

  // Part 2: Auto-Resize Textarea
  // TODO: Implement the autoResize action
  function autoResize(node) {
    // Your implementation here
  }

  let message = $state('');
</script>

<div class="demo">
  <!-- Dropdown with click-outside -->
  <section>
    <h3>Click Outside to Close</h3>
    <button onclick={() => dropdownOpen = true}>Open Dropdown</button>
    {#if dropdownOpen}
      <div class="dropdown">
        <!-- TODO: Add use:clickOutside to this div -->
        <p>I close when you click outside</p>
        <p>Click somewhere else...</p>
      </div>
    {/if}
  </section>

  <!-- Auto-resize textarea -->
  <section>
    <h3>Auto-Resize Textarea</h3>
    <!-- TODO: Add use:autoResize to this textarea -->
    <textarea
      bind:value={message}
      placeholder="Start typing — I'll grow with the content..."
      rows="2"
    ></textarea>
    <p class="char-count">{message.length} chars</p>
  </section>
</div>

<style>
  .demo { max-width: 500px; margin: 2rem auto; font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 2rem; }
  section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; }
  h3 { margin: 0 0 1rem; font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  button { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; }
  .dropdown { margin-top: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .dropdown p { margin: 0 0 0.5rem; font-size: 0.875rem; color: #475569; }
  textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; resize: none; overflow: hidden; font-family: inherit; font-size: 0.875rem; box-sizing: border-box; }
  .char-count { margin: 0.25rem 0 0; font-size: 0.75rem; color: #94a3b8; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  // Click Outside Action
  function clickOutside(node, callback) {
    function handleClick(event) {
      if (!node.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener('click', handleClick, { capture: true });
    return {
      destroy() {
        document.removeEventListener('click', handleClick, { capture: true });
      }
    };
  }

  // Auto-Resize Action
  function autoResize(node) {
    function resize() {
      node.style.height = 'auto';
      node.style.height = node.scrollHeight + 'px';
    }
    resize();
    node.addEventListener('input', resize);
    return {
      destroy() { node.removeEventListener('input', resize); }
    };
  }

  let dropdownOpen = $state(false);
  let message = $state('');
</script>

<div class="demo">
  <section>
    <h3>Click Outside to Close</h3>
    <button onclick={() => (dropdownOpen = true)}>Open Dropdown</button>
    {#if dropdownOpen}
      <div class="dropdown" use:clickOutside={() => { dropdownOpen = false; }}>
        <p>I close when you click outside</p>
        <p>Try clicking somewhere else...</p>
      </div>
    {/if}
  </section>

  <section>
    <h3>Auto-Resize Textarea</h3>
    <textarea
      use:autoResize
      bind:value={message}
      placeholder="Start typing — I'll grow with the content..."
      rows="2"
    ></textarea>
    <p class="char-count">{message.length} chars</p>
  </section>
</div>

<style>
  .demo { max-width: 500px; margin: 2rem auto; font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 2rem; }
  section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; }
  h3 { margin: 0 0 1rem; font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  button { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; }
  .dropdown { margin-top: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
  .dropdown p { margin: 0 0 0.5rem; font-size: 0.875rem; color: #475569; }
  textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; resize: none; overflow: hidden; font-family: inherit; font-size: 0.875rem; box-sizing: border-box; }
  .char-count { margin: 0.25rem 0 0; font-size: 0.75rem; color: #94a3b8; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-action-click-outside',
			description: 'Implement the clickOutside action and apply it to close the dropdown',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'clickOutside' },
						{ type: 'contains', value: 'document.addEventListener' },
						{ type: 'contains', value: 'use:clickOutside' }
					]
				}
			},
			hints: [
				'Attach a `click` event listener to `document` using `{ capture: true }` so it fires before elements handle the click.',
				'Inside the handler, check `!node.contains(event.target)` — if true, the click was outside the element.',
				'Return `{ destroy() { document.removeEventListener(...) } }` to clean up when the element unmounts.'
			],
			conceptsTested: ['svelte5.actions.basics']
		},
		{
			id: 'cp-action-tooltip',
			description: 'Implement the autoResize action and apply it to the textarea',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'autoResize' },
						{ type: 'contains', value: 'scrollHeight' },
						{ type: 'contains', value: 'use:autoResize' }
					]
				}
			},
			hints: [
				'Set `node.style.height = "auto"` first, then `node.style.height = node.scrollHeight + "px"` — the auto-reset is necessary for shrinking.',
				'Call `resize()` immediately when the action mounts (for the initial size), then attach it to the `input` event.',
				'Clean up with `node.removeEventListener("input", resize)` in the `destroy` method.'
			],
			conceptsTested: ['svelte5.actions.basics', 'svelte5.actions.update']
		}
	]
};
