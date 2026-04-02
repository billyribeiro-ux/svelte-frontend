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

## WHY Two-Way Bindings Exist

In a one-way data flow model, syncing a form input with state requires two pieces of wiring: a value prop that pushes state into the input, and an event handler that pulls the input's value back into state:

\`\`\`svelte
<input value={name} oninput={(e) => name = e.currentTarget.value} />
\`\`\`

This works, but it is boilerplate. Every text input, every checkbox, every select element needs the same pattern. For a form with 10 fields, you write 10 \`oninput\` handlers that all do the same thing: read \`e.currentTarget.value\` and assign it to a variable.

\`bind:value\` eliminates this ceremony:

\`\`\`svelte
<input bind:value={name} />
\`\`\`

One directive does both: it sets the input's value from the variable, and updates the variable when the user types. This is **syntactic sugar** -- the compiler generates essentially the same code as the manual version. There is no hidden complexity or performance cost.

### The Two-Way Data Flow Debate

Two-way bindings are controversial in the frontend community. React deliberately omits them, arguing that explicit one-way data flow is easier to debug. Svelte's position is pragmatic: for form elements specifically, two-way binding eliminates pure boilerplate without introducing ambiguity. The binding is local (scoped to the component), the data source is obvious (the bound variable), and the behavior is unsurprising (input changes update the variable).

The key constraint is that **bindings are local**. A \`bind:value\` only connects an input to a variable in the same component. It does not create global state or invisible data channels. When you need to share form state with other components, you explicitly pass it via props or use a shared reactive class.

### How Bindings Compile in Svelte 5

In Svelte 5, \`bind:value={name}\` can compile to a **function binding** pattern. Instead of generating separate "set value" and "handle input" code, the compiler can pass a getter/setter pair:

\`\`\`javascript
// Conceptual compiled output
input({
  get value() { return name; },
  set value(v) { name = v; }
});
\`\`\`

This is more efficient than Svelte 4's approach and integrates cleanly with the runes reactivity system. When \`name\` is a \`$state\` variable, the setter triggers reactive updates automatically.

### Decision Framework: bind: vs. Manual Events

Use **bind:** when:
- The relationship is simple: "this input controls this variable"
- You do not need to transform or validate on every keystroke
- You want clean, readable template code

Use **manual events** when:
- You need to transform input (e.g., force uppercase, strip whitespace)
- You need debouncing or throttling
- You need to trigger side effects beyond updating the variable
- You need to conditionally prevent the update`
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

### Which Elements Support Which Bindings

| Element | Binding | Type |
|---|---|---|
| \`<input type="text">\` | \`bind:value\` | string |
| \`<input type="number">\` | \`bind:value\` | number (auto-coerced) |
| \`<input type="range">\` | \`bind:value\` | number |
| \`<input type="checkbox">\` | \`bind:checked\` | boolean |
| \`<input type="radio">\` | \`bind:group\` | single value |
| \`<textarea>\` | \`bind:value\` | string |
| \`<select>\` | \`bind:value\` | the type of the selected option's value |
| \`<select multiple>\` | \`bind:value\` | array |
| \`<details>\` | \`bind:open\` | boolean |
| \`<dialog>\` | \`bind:open\` | boolean |

Note the automatic type coercion for \`type="number"\` and \`type="range"\`. In vanilla JavaScript, \`input.value\` is always a string. Svelte's binding automatically converts to a number, which eliminates parsing boilerplate.

**Your task:** Create a form with a text input (\`bind:value\`) and a checkbox (\`bind:checked\`). Show the values below the form to verify the two-way binding works in both directions.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## bind:group for Radio and Checkbox Groups

Use \`bind:group\` to bind multiple radio buttons or checkboxes to a single value. This is one of the most tedious patterns in vanilla HTML -- Svelte makes it trivial.

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

### How bind:group Works

For **radio buttons**, \`bind:group\` updates the bound variable to the \`value\` of the selected radio. Only one can be selected at a time, so the variable holds a single value.

For **checkboxes**, \`bind:group\` manages an **array**. Checking a box adds its \`value\` to the array; unchecking removes it. The binding handles the array mutation automatically -- no \`push\` or \`filter\` needed.

### bind:this for Element References

\`bind:this\` gives you a direct reference to the DOM element. This is essential for imperative DOM operations that cannot be expressed declaratively:

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

Common use cases for \`bind:this\`:
- **Focusing elements** programmatically
- **Measuring elements** (getBoundingClientRect)
- **Integrating third-party libraries** that need a DOM node (chart libraries, map libraries)
- **Canvas and WebGL** rendering
- **Scroll management** (scrollIntoView, scroll position)

Important: the element reference is \`undefined\` during the first render cycle. The DOM node is only available after mounting. If you need to run code when the element is ready, use \`$effect\` which runs after the DOM is updated.

**Task:** Add a radio group for selecting a color and a checkbox group for toggling features. Display the selected values to verify the bindings work correctly.`
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
