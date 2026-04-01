import type { Lesson } from '$types/lesson';

export const elementBindings: Lesson = {
	id: 'svelte-core.events-and-bindings.element-bindings',
	slug: 'element-bindings',
	title: 'Element Bindings',
	description:
		'Two-way bind form elements with bind:value, bind:checked, bind:group, and bind:this.',
	trackId: 'svelte-core',
	moduleId: 'events-and-bindings',
	order: 2,
	estimatedMinutes: 15,
	concepts: [
		'svelte5.bindings.value',
		'svelte5.bindings.checked',
		'svelte5.bindings.group',
		'svelte5.bindings.this'
	],
	prerequisites: ['svelte5.runes.state', 'svelte5.events.element'],

	content: [
		{
			type: 'text',
			content: `# Element Bindings

Svelte's \`bind:\` directive creates two-way bindings between state and DOM elements. When the user types in an input, the state updates. When state changes, the input updates.

This is much more concise than manually wiring up event handlers.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.bindings.value'
		},
		{
			type: 'text',
			content: `## bind:value and bind:checked

\`\`\`svelte
<script lang="ts">
  let name = $state('');
  let agreed = $state(false);
</script>

<input bind:value={name} />
<input type="checkbox" bind:checked={agreed} />
\`\`\`

**Your task:** Create a form with a text input (bind:value) and a checkbox (bind:checked). Show the values below the form.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## bind:group for Radio and Checkbox Groups

Use \`bind:group\` to bind multiple radio buttons or checkboxes to a single value.

\`\`\`svelte
<script lang="ts">
  let color = $state('red');
  let features = $state<string[]>([]);
</script>

<!-- Radio group: single value -->
<input type="radio" bind:group={color} value="red" /> Red
<input type="radio" bind:group={color} value="blue" /> Blue

<!-- Checkbox group: array of values -->
<input type="checkbox" bind:group={features} value="dark-mode" /> Dark Mode
<input type="checkbox" bind:group={features} value="notifications" /> Notifications
\`\`\`

**Task:** Add a radio group for selecting a color and a checkbox group for toggling features.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## bind:this for Element References

Use \`bind:this\` to get a reference to the actual DOM element.

\`\`\`svelte
<script lang="ts">
  let inputEl: HTMLInputElement;

  function focusInput() {
    inputEl.focus();
  }
</script>

<input bind:this={inputEl} />
<button onclick={focusInput}>Focus</button>
\`\`\`

This is useful for imperatively controlling elements — focusing, scrolling, measuring, etc.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let name = $state('');
  let agreed = $state(false);
  let color = $state('red');
  let features = $state<string[]>([]);
</script>

<div>
  <section>
    <h2>Text & Checkbox</h2>
    <!-- TODO: Add input with bind:value -->
    <!-- TODO: Add checkbox with bind:checked -->
    <input placeholder="Your name" />
    <label><input type="checkbox" /> I agree</label>
    <p>Name: {name} | Agreed: {agreed}</p>
  </section>

  <section>
    <h2>Groups</h2>
    <!-- TODO: Add radio group with bind:group -->
    <!-- TODO: Add checkbox group with bind:group -->
    <p>Color: {color}</p>
    <p>Features: {features.join(', ') || 'none'}</p>
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

  label {
    display: block;
    margin: 0.25rem 0;
  }

  input[type="text"], input:not([type]) {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
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
  let name = $state('');
  let agreed = $state(false);
  let color = $state('red');
  let features = $state<string[]>([]);
</script>

<div>
  <section>
    <h2>Text & Checkbox</h2>
    <input bind:value={name} placeholder="Your name" />
    <label>
      <input type="checkbox" bind:checked={agreed} /> I agree
    </label>
    <p>Name: {name} | Agreed: {agreed}</p>
  </section>

  <section>
    <h2>Groups</h2>
    <fieldset>
      <legend>Pick a color</legend>
      <label><input type="radio" bind:group={color} value="red" /> Red</label>
      <label><input type="radio" bind:group={color} value="blue" /> Blue</label>
      <label><input type="radio" bind:group={color} value="green" /> Green</label>
    </fieldset>

    <fieldset>
      <legend>Features</legend>
      <label><input type="checkbox" bind:group={features} value="dark-mode" /> Dark Mode</label>
      <label><input type="checkbox" bind:group={features} value="notifications" /> Notifications</label>
      <label><input type="checkbox" bind:group={features} value="auto-save" /> Auto Save</label>
    </fieldset>

    <p>Color: {color}</p>
    <p>Features: {features.join(', ') || 'none'}</p>
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

  label {
    display: block;
    margin: 0.25rem 0;
  }

  fieldset {
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  input[type="text"], input:not([type]) {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use bind:value on a text input and bind:checked on a checkbox',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'bind:value' },
						{ type: 'contains', value: 'bind:checked' }
					]
				}
			},
			hints: [
				'Add `bind:value={name}` to the text input element.',
				'Add `bind:checked={agreed}` to the checkbox input.',
				'Replace the plain `<input>` with `<input bind:value={name}>` and `<input type="checkbox" bind:checked={agreed}>`.'
			],
			conceptsTested: ['svelte5.bindings.value', 'svelte5.bindings.checked']
		},
		{
			id: 'cp-2',
			description: 'Create radio and checkbox groups with bind:group',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'bind:group={color}' },
						{ type: 'contains', value: 'bind:group={features}' }
					]
				}
			},
			hints: [
				'Add radio inputs with `bind:group={color}` and different `value` attributes.',
				'Add checkbox inputs with `bind:group={features}` and different `value` attributes.',
				'For radios: `<input type="radio" bind:group={color} value="red">`. For checkboxes: `<input type="checkbox" bind:group={features} value="dark-mode">`.'
			],
			conceptsTested: ['svelte5.bindings.group']
		}
	]
};
