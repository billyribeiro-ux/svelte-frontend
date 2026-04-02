import type { Lesson } from '$types/lesson';

export const elementEvents: Lesson = {
	id: 'svelte-core.events-and-bindings.element-events',
	slug: 'element-events',
	title: 'Element Events',
	description:
		'Handle DOM events the Svelte 5 way with onclick, oninput, onsubmit and other event properties.',
	trackId: 'svelte-core',
	moduleId: 'events-and-bindings',
	order: 1,
	estimatedMinutes: 12,
	concepts: ['svelte5.events.element', 'svelte5.events.handlers', 'svelte5.events.inline'],
	prerequisites: ['svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Element Events in Svelte 5

## WHY Svelte 5 Changed Event Handling

Svelte 4 used a custom \`on:click\` directive syntax for event handling. Svelte 5 replaced this with standard DOM event properties: \`onclick\`, \`oninput\`, \`onsubmit\`. This is not a cosmetic change -- it reflects a fundamental design philosophy shift with concrete technical consequences.

### The Problem with on:click

Svelte 4's \`on:click\` directive compiled into \`addEventListener\` calls. Each directive generated code to:
1. Call \`addEventListener\` during component mount
2. Call \`removeEventListener\` during component destroy
3. Handle the forwarding case (\`on:click\` without a value) by re-dispatching events

This per-element listener setup had a cost. In a list of 1000 items, each with a click handler, Svelte created 1000 \`addEventListener\` calls during mount and 1000 \`removeEventListener\` calls during teardown.

### Event Delegation in Svelte 5

Svelte 5's \`onclick\` compiles differently. For most common events (click, input, keydown, etc.), Svelte uses **event delegation**: it attaches a single listener to the document root and routes events to the correct handler based on the event target. The compiler maintains a registry that maps DOM nodes to their handlers.

This means:
- **1 listener per event type** regardless of how many elements use that event
- **No per-element setup/teardown cost** for delegated events
- **Automatic cleanup** -- no \`removeEventListener\` needed
- **Consistent with standard DOM** -- \`onclick\` is how the DOM actually works

The delegation is invisible to you as a developer. You write \`onclick={handler}\` and it works exactly like you would expect. The optimization happens entirely at the compiler level.

### Which Events Are Delegated?

Not all events can be delegated. Events that **bubble** (click, input, keydown, etc.) are delegated. Events that **do not bubble** (focus, blur, scroll, load, etc.) still use per-element \`addEventListener\`. The compiler decides automatically based on the event type.

### No More Event Modifiers

Svelte 4 had event modifiers: \`on:click|preventDefault|stopPropagation\`. Svelte 5 removes these. Instead, you call the methods directly on the event object:

\`\`\`svelte
<!-- Svelte 4 -->
<form on:submit|preventDefault={handleSubmit}>

<!-- Svelte 5 -->
<form onsubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
\`\`\`

This is more verbose for simple cases but has advantages:
- **No custom syntax to learn** -- it is standard JavaScript
- **Composable** -- you can build helper functions for common patterns
- **TypeScript-friendly** -- the event type is inferred correctly
- **Explicit** -- the behavior is visible in the handler, not hidden in a modifier pipe`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.events.element'
		},
		{
			type: 'text',
			content: `## Basic Event Handling

\`\`\`svelte
<script lang="ts">
  let count = $state(0);
</script>

<button onclick={() => count += 1}>Clicks: {count}</button>
<input oninput={(e) => console.log(e.currentTarget.value)} />
\`\`\`

You can use inline arrow functions or reference a named function. Both compile to the same delegation-based output.

### Inline vs. Named Handlers

**Inline handlers** are concise for simple operations:

\`\`\`svelte
<button onclick={() => count += 1}>
\`\`\`

**Named handlers** are better when:
- The handler has complex logic
- The same handler is used on multiple elements
- You need to test the handler independently
- The handler needs to access the event object for more than one purpose

\`\`\`svelte
<script lang="ts">
  function handleClick(e: MouseEvent) {
    if (e.shiftKey) {
      count += 10;
    } else {
      count += 1;
    }
  }
</script>

<button onclick={handleClick}>
\`\`\`

### TypeScript and Event Types

When using TypeScript, event handlers automatically receive the correct event type. \`onclick\` gives you \`MouseEvent\`, \`oninput\` gives you \`Event\` with \`currentTarget\` typed as the element type, \`onkeydown\` gives you \`KeyboardEvent\`. This happens because Svelte generates proper JSX-like type definitions for element attributes.

Note the use of \`e.currentTarget\` rather than \`e.target\`. The \`currentTarget\` is always the element the handler is attached to, while \`target\` may be a child element. With delegation, this distinction is handled correctly by Svelte -- \`currentTarget\` points to the element with the \`onclick\` attribute.

**Your task:** Create a click counter and an input that displays what you type in real time. Use inline handlers for both.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Form Submission

Forms are a special case because the default behavior (page navigation) almost always needs to be prevented. Use \`onsubmit\` with \`event.preventDefault()\`:

\`\`\`svelte
<form onsubmit={(e) => {
  e.preventDefault();
  // handle form data
}}>
\`\`\`

### Building Reusable Event Helpers

Since modifiers are gone, the community pattern is to build small helper functions:

\`\`\`svelte
<script lang="ts">
  function prevent(fn: (e: Event) => void) {
    return (e: Event) => {
      e.preventDefault();
      fn(e);
    };
  }

  function stopProp(fn: (e: Event) => void) {
    return (e: Event) => {
      e.stopPropagation();
      fn(e);
    };
  }
</script>

<form onsubmit={prevent(handleSubmit)}>
<button onclick={stopProp(handleClick)}>
\`\`\`

These helpers are composable: \`prevent(stopProp(handler))\`. They are also shareable -- put them in a utility module and import them across your project.

### Decision Framework: When to Use Which Pattern

| Scenario | Pattern |
|---|---|
| Simple state mutation | Inline: \`onclick={() => count++}\` |
| Complex logic | Named function: \`onclick={handleClick}\` |
| Form submission | \`onsubmit={prevent(handleSubmit)}\` or inline \`e.preventDefault()\` |
| Event with arguments | Inline wrapper: \`onclick={() => remove(item.id)}\` |
| Multiple elements, same handler | Named function shared across elements |
| Handler needs testing | Named function, exported if needed |

**Task:** Build a simple form that collects a name and adds it to a list when submitted. Use \`onsubmit\` with \`preventDefault\` to handle the submission without page reload.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Event Modifiers via Wrappers

Svelte 5 does not have event modifiers like \`|preventDefault\`. Instead, call methods on the event object directly, or write small wrapper functions.

\`\`\`svelte
<script lang="ts">
  function prevent(fn: (e: Event) => void) {
    return (e: Event) => {
      e.preventDefault();
      fn(e);
    };
  }
</script>

<form onsubmit={prevent(handleSubmit)}>
\`\`\`

### Common Modifier Replacements

| Svelte 4 Modifier | Svelte 5 Equivalent |
|---|---|
| \`on:click\\|preventDefault\` | \`onclick={(e) => { e.preventDefault(); ... }}\` |
| \`on:click\\|stopPropagation\` | \`onclick={(e) => { e.stopPropagation(); ... }}\` |
| \`on:click\\|once\` | Use a flag variable or \`{ once: true }\` on manual addEventListener |
| \`on:click\\|self\` | \`onclick={(e) => { if (e.target === e.currentTarget) ... }}\` |
| \`on:click\\|capture\` | Not directly supported via \`onclick\`; use \`addEventListener\` with \`{ capture: true }\` |

The explicit approach makes the behavior visible in the code. When debugging, you do not need to scan for pipe-delimited modifiers hidden in the template -- the logic is right there in the handler.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let count = $state(0);
  let text = $state('');
  let names = $state<string[]>([]);
  let newName = $state('');

  // TODO: Add event handler functions
</script>

<div>
  <section>
    <h2>Click Counter</h2>
    <!-- TODO: Add button with onclick -->
    <button>Clicks: {count}</button>
  </section>

  <section>
    <h2>Live Input</h2>
    <!-- TODO: Add input with oninput -->
    <input placeholder="Type something..." />
    <p>You typed: {text}</p>
  </section>

  <section>
    <h2>Name List</h2>
    <!-- TODO: Add form with onsubmit -->
    <form>
      <input placeholder="Enter a name" />
      <button type="submit">Add</button>
    </form>
    <ul>
      {#each names as name}
        <li>{name}</li>
      {/each}
    </ul>
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 1.5rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    margin-right: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
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
  let count = $state(0);
  let text = $state('');
  let names = $state<string[]>([]);
  let newName = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (newName.trim()) {
      names.push(newName.trim());
      newName = '';
    }
  }
</script>

<div>
  <section>
    <h2>Click Counter</h2>
    <button onclick={() => count += 1}>Clicks: {count}</button>
  </section>

  <section>
    <h2>Live Input</h2>
    <input
      placeholder="Type something..."
      oninput={(e) => text = e.currentTarget.value}
    />
    <p>You typed: {text}</p>
  </section>

  <section>
    <h2>Name List</h2>
    <form onsubmit={handleSubmit}>
      <input
        placeholder="Enter a name"
        value={newName}
        oninput={(e) => newName = e.currentTarget.value}
      />
      <button type="submit">Add</button>
    </form>
    <ul>
      {#each names as name}
        <li>{name}</li>
      {/each}
    </ul>
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 1.5rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    margin-right: 0.5rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add onclick and oninput event handlers',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'onclick' },
						{ type: 'contains', value: 'oninput' }
					]
				}
			},
			hints: [
				'Use `onclick={() => count += 1}` on the button.',
				'Use `oninput={(e) => text = e.currentTarget.value}` on the input.',
				'Add `onclick={() => count += 1}` to the button and `oninput={(e) => text = e.currentTarget.value}` to the input.'
			],
			conceptsTested: ['svelte5.events.element', 'svelte5.events.inline']
		},
		{
			id: 'cp-2',
			description: 'Handle form submission with onsubmit and preventDefault',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'onsubmit' },
						{ type: 'contains', value: 'preventDefault' }
					]
				}
			},
			hints: [
				'Add `onsubmit={handleSubmit}` to the form element.',
				'Call `e.preventDefault()` inside the handler to stop the page from reloading.',
				'Create `function handleSubmit(e: Event) { e.preventDefault(); names.push(newName.trim()); newName = \'\'; }` and add `onsubmit={handleSubmit}` to the form.'
			],
			conceptsTested: ['svelte5.events.handlers']
		}
	]
};
