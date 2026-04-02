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

Forms are how users interact with web applications — logging in, searching, submitting data, configuring settings. Building forms correctly means using the right input types, associating labels, and grouping related fields.

Proper form markup is critical for:
- **Accessibility** — Screen readers announce labels for each input
- **Mobile UX** — The right input type shows the right keyboard
- **Validation** — Browsers provide free validation for email, URL, number types

## WHY: The Form Submission Flow

Understanding what happens when a form submits helps you make better decisions about form architecture:

1. **User clicks submit** — The browser collects all form field values
2. **FormData construction** — The browser creates a \`FormData\` object from all named inputs within the form
3. **Validation** — The browser runs constraint validation on each input (type checks, required checks, pattern matches, min/max)
4. **If validation fails** — The browser shows native error messages and fires the \`invalid\` event on each failing input. The form does NOT submit.
5. **If validation passes** — The browser fires the \`submit\` event on the form element
6. **HTTP request** — Without JavaScript intervention, the browser sends the FormData as an HTTP request (GET query string or POST body, depending on the form's \`method\` attribute)

In Svelte, you typically call \`e.preventDefault()\` in the submit handler to stay in the SPA and handle submission with JavaScript. But the validation step (step 3-4) still happens automatically — for free — if you use the right input types and attributes.

**Decision framework:** Always use native form elements and validation first. Only add custom JavaScript validation when the native API cannot express your constraint (like "password must contain uppercase, lowercase, and a number" or "these two fields must match").

## WHY: Label Association and Accessibility

A form input without a label is invisible to screen reader users. They hear "edit text" with no indication of what to type. There are two mechanisms for label association, and they have different trade-offs:`
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
<!-- Method 1: for/id (explicit association) -->
<label for="email">Email</label>
<input id="email" type="email" />

<!-- Method 2: wrapping (implicit association) -->
<label>
  Email
  <input type="email" />
</label>
\`\`\`

**Method 1 (for/id)** is preferred because:
- It works even when the label and input are not adjacent in the DOM (useful for complex layouts)
- It creates a larger click target — clicking the label focuses the input
- It is more explicit and easier to debug

**Method 2 (wrapping)** is convenient but has limitations:
- Some assistive technologies historically had issues with implicit association
- It forces the label text and input to share a parent element
- It can make styling more complex in grid or flex layouts

Beyond labels, use \`aria-describedby\` to associate help text or error messages with an input:

\`\`\`html
<label for="password">Password</label>
<input id="password" type="password" aria-describedby="password-help password-error" />
<span id="password-help">Must be at least 8 characters</span>
<span id="password-error" role="alert">Password is too short</span>
\`\`\`

The screen reader announces: "Password, edit text, must be at least 8 characters, password is too short." Every piece of information is connected to the input.

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

HTML5 provides many specialized input types. Using the right one improves UX dramatically because browsers provide type-specific behavior for free:

- \`type="email"\` — Shows @ keyboard on mobile, validates email format, offers autocomplete from contacts
- \`type="password"\` — Masks input, triggers password manager autofill
- \`type="number"\` — Shows numeric keyboard on mobile, supports min/max/step attributes, has increment/decrement buttons
- \`type="tel"\` — Shows phone keypad on mobile (note: does NOT validate phone format — phone formats vary too much globally)
- \`type="date"\` — Shows native date picker on mobile and most desktop browsers
- \`type="url"\` — Validates URL format, shows appropriate keyboard with / and .com keys

**Input type constraints and the Validation API:**

Each input type comes with built-in constraint validation. You can enhance this with attributes:

\`\`\`html
<input type="email" required />                    <!-- Must be filled AND valid email -->
<input type="number" min="0" max="150" step="1" /> <!-- Integer between 0-150 -->
<input type="text" pattern="[A-Za-z]{3,}" />       <!-- At least 3 letters -->
<input type="text" minlength="2" maxlength="50" /> <!-- 2-50 characters -->
\`\`\`

You can check validation state in JavaScript using the Constraint Validation API:

\`\`\`js
const input = document.querySelector('input');
input.validity.valid       // true/false
input.validity.typeMismatch // true if email format is wrong
input.validity.valueMissing // true if required and empty
input.validationMessage    // browser's error message string
input.checkValidity()      // triggers validation and returns boolean
input.reportValidity()     // same as above but also shows error UI
\`\`\`

**Task:** Change the generic \`type="text"\` inputs to their correct types.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Try tabbing through the form with your keyboard. Proper labels mean clicking the label focuses the input. Proper types mean the browser can validate automatically on submit. Click the submit button without filling in the email field — notice how the browser shows a native validation error for type="email" that you got for free, without writing any JavaScript.'
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

**WHY fieldset matters:** Screen readers announce the legend text before every input within the fieldset. So a screen reader user hears "Contact Information, Name, edit text" — they know the context of each field. This is especially critical for radio buttons and checkboxes where the individual labels ("Small", "Medium", "Large") only make sense with group context ("T-Shirt Size").

**WHY legend and not just a heading:** A \`<h3>\` above a group of inputs does not create an accessible association. Screen readers do not connect the heading to the inputs below it. Only \`<legend>\` inside \`<fieldset>\` creates this programmatic group-label relationship.

**Task:** Wrap the form fields in a \`<fieldset>\` with a \`<legend>\`.

## Realistic Exercise: Building an Accessible Contact Form

After completing the checkpoints, consider this real-world scenario: you need to build a contact form with name, email, message, and a preferred contact method (email or phone — radio buttons).

Your accessibility checklist should be:
1. Every input has a visible \`<label>\` with \`for\`/\`id\` association
2. The radio button group is wrapped in a \`<fieldset>\` with a \`<legend>\`
3. Help text is connected via \`aria-describedby\`
4. Error messages use \`role="alert"\` so screen readers announce them immediately
5. The submit button has descriptive text (not just "Submit" — try "Send Message")
6. Form-level errors are announced via a live region at the top of the form

This is the standard professional frontend developers follow. Accessibility is not an add-on — it is a requirement.`
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
