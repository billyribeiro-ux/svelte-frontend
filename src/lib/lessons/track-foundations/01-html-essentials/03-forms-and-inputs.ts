import type { Lesson } from '$types/lesson';

export const formsAndInputs: Lesson = {
	id: 'foundations.html-essentials.forms-and-inputs',
	slug: 'forms-and-inputs',
	title: 'Forms and Inputs',
	description: 'Build accessible forms with proper labels, input types, fieldsets, and legends.',
	trackId: 'foundations',
	moduleId: 'html-essentials',
	order: 3,
	estimatedMinutes: 15,
	concepts: ['html.forms', 'html.input-types', 'html.form-accessibility'],
	prerequisites: ['html.document-structure'],

	content: [
		{
			type: 'text',
			content: `# Forms and Inputs

Forms are how users interact with web applications — logging in, searching, submitting data. Building forms correctly means using the right input types, associating labels, and grouping related fields.

Proper form markup is critical for:
- **Accessibility** — Screen readers announce labels for each input
- **Mobile UX** — The right input type shows the right keyboard
- **Validation** — Browsers provide free validation for email, URL, number types`
		},
		{
			type: 'concept-callout',
			content: 'html.forms'
		},
		{
			type: 'text',
			content: `## Adding Labels

Every input needs a label. There are two ways to associate them:

\`\`\`html
<!-- Method 1: for/id -->
<label for="email">Email</label>
<input id="email" type="email" />

<!-- Method 2: wrapping -->
<label>
  Email
  <input type="email" />
</label>
\`\`\`

Look at the starter code — the form has inputs without labels.

**Task:** Add proper \`<label>\` elements with \`for\`/\`id\` associations for each input.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Correct Input Types

HTML5 provides many specialized input types. Using the right one improves UX:

- \`type="email"\` — Shows @ keyboard on mobile, validates format
- \`type="password"\` — Masks input
- \`type="number"\` — Shows numeric keyboard
- \`type="tel"\` — Shows phone keypad
- \`type="date"\` — Shows date picker
- \`type="url"\` — Validates URL format

**Task:** Change the generic \`type="text"\` inputs to their correct types.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Try tabbing through the form with your keyboard. Proper labels mean clicking the label focuses the input. Proper types mean the browser can validate automatically on submit.'
		},
		{
			type: 'text',
			content: `## Grouping with Fieldset and Legend

Related form fields should be grouped with \`<fieldset>\` and labeled with \`<legend>\`:

\`\`\`html
<fieldset>
  <legend>Contact Information</legend>
  <label for="name">Name</label>
  <input id="name" type="text" />
  <label for="email">Email</label>
  <input id="email" type="email" />
</fieldset>
\`\`\`

This is especially important for radio buttons and checkboxes.

**Task:** Wrap the form fields in a \`<fieldset>\` with a \`<legend>\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let name = $state('');
  let email = $state('');
  let age = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    console.log('Submitted:', { name, email, age });
  }
</script>

<h1>Registration Form</h1>

<form onsubmit={handleSubmit}>
  <!-- TODO: Add labels with for/id -->
  <!-- TODO: Use correct input types -->
  <!-- TODO: Wrap in fieldset/legend -->
  <input type="text" bind:value={name} placeholder="Name" />
  <input type="text" bind:value={email} placeholder="Email" />
  <input type="text" bind:value={age} placeholder="Age" />

  <button type="submit">Register</button>
</form>

<style>
  h1 {
    color: var(--sf-accent, #6366f1);
    font-family: system-ui, sans-serif;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 400px;
    font-family: system-ui, sans-serif;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
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
  let name = $state('');
  let email = $state('');
  let age = $state('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    console.log('Submitted:', { name, email, age });
  }
</script>

<h1>Registration Form</h1>

<form onsubmit={handleSubmit}>
  <fieldset>
    <legend>Personal Information</legend>

    <label for="name">Name</label>
    <input id="name" type="text" bind:value={name} placeholder="Enter your name" />

    <label for="email">Email</label>
    <input id="email" type="email" bind:value={email} placeholder="you@example.com" />

    <label for="age">Age</label>
    <input id="age" type="number" bind:value={age} placeholder="25" min="0" max="150" />
  </fieldset>

  <button type="submit">Register</button>
</form>

<style>
  h1 {
    color: var(--sf-accent, #6366f1);
    font-family: system-ui, sans-serif;
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 400px;
    font-family: system-ui, sans-serif;
  }

  fieldset {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  legend {
    font-weight: 600;
    color: #1e293b;
    padding: 0 0.5rem;
  }

  label {
    font-weight: 500;
    color: #475569;
    font-size: 0.875rem;
  }

  input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
  }

  button {
    padding: 0.75rem 1.5rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add label elements with for/id associations',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '<label\\s+for=' },
						{ type: 'regex', value: '<input\\s+id=' }
					]
				}
			},
			hints: [
				'Each input needs a matching `<label>` element. The `for` attribute on the label must match the `id` on the input.',
				'Add `<label for="name">Name</label>` before the name input, and add `id="name"` to the input.',
				'For each input: `<label for="email">Email</label><input id="email" ... />`'
			],
			conceptsTested: ['html.form-accessibility']
		},
		{
			id: 'cp-2',
			description: 'Use correct input types (email, number)',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'type="email"' },
						{ type: 'contains', value: 'type="number"' }
					]
				}
			},
			hints: [
				'HTML5 input types help browsers show the right keyboard and validate input.',
				'Change the email input to `type="email"` and the age input to `type="number"`.',
				'Update: `<input id="email" type="email" ... />` and `<input id="age" type="number" ... />`'
			],
			conceptsTested: ['html.input-types']
		},
		{
			id: 'cp-3',
			description: 'Wrap fields in a fieldset with a legend',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<fieldset>' },
						{ type: 'contains', value: '<legend>' }
					]
				}
			},
			hints: [
				'`<fieldset>` groups related form controls, and `<legend>` provides a caption for the group.',
				'Wrap all the label/input pairs in `<fieldset>` and add a `<legend>` at the top.',
				'Add: `<fieldset><legend>Personal Information</legend><!-- inputs here --></fieldset>`'
			],
			conceptsTested: ['html.form-accessibility']
		}
	]
};
