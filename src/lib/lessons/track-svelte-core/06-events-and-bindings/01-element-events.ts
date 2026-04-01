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

Svelte 5 uses standard DOM event properties like \`onclick\`, \`oninput\`, and \`onsubmit\` instead of the old \`on:click\` directive syntax. This aligns Svelte more closely with how the DOM actually works.

Event handlers are just regular JavaScript functions assigned to element properties.`
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

You can use inline handlers or reference a named function.

**Your task:** Create a click counter and an input that displays what you type in real time.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Form Submission

Use \`onsubmit\` with \`event.preventDefault()\` to handle form submissions without page reloads.

\`\`\`svelte
<form onsubmit={(e) => {
  e.preventDefault();
  // handle form data
}}>
\`\`\`

**Task:** Build a simple form that collects a name and adds it to a list when submitted.`
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
\`\`\``
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
