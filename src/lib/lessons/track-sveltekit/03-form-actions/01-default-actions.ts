import type { Lesson } from '$types/lesson';

export const defaultActions: Lesson = {
	id: 'sveltekit.form-actions.default-actions',
	slug: 'default-actions',
	title: 'Default Form Actions',
	description: 'Handle form submissions with default actions using the form element and POST requests.',
	trackId: 'sveltekit',
	moduleId: 'form-actions',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['sveltekit.forms.default-action', 'sveltekit.forms.form-data'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Form Actions in SvelteKit

SvelteKit handles form submissions with **actions**, defined in \`+page.server.ts\`. When a \`<form>\` with \`method="POST"\` is submitted, SvelteKit calls the corresponding action on the server.

The default action handles any POST request to the page. No JavaScript required — it works with plain HTML forms.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.forms.default-action'
		},
		{
			type: 'text',
			content: `## Creating a Default Action

Define a \`default\` action in your \`+page.server.ts\` \`actions\` object. It receives a \`request\` from which you can extract form data.

**Your task:** Create a form that submits a todo item and an action that processes it.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Reading Form Data

Inside the action, use \`await request.formData()\` to get the submitted data. Each form field is accessible by its \`name\` attribute.

**Task:** Read the form data and return it to the page using the \`form\` prop.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { Actions } from './$types';

// TODO: Define a default action that reads form data
export const actions: Actions = {
  default: async ({ request }) => {
    return {};
  }
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { form } = $props();
</script>

<h1>Add Todo</h1>

<!-- TODO: Create a form with method="POST" and an input -->`
		}
	],

	solutionFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title') as string;

    // In a real app, save to database
    return { success: true, title };
  }
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { form } = $props();
</script>

<h1>Add Todo</h1>

{#if form?.success}
  <p>Added: {form.title}</p>
{/if}

<form method="POST">
  <input name="title" placeholder="Enter a todo" required />
  <button type="submit">Add</button>
</form>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a form with method="POST" and a default action',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'method="POST"' },
						{ type: 'contains', value: 'default' }
					]
				}
			},
			hints: [
				'Add `method="POST"` to your `<form>` element.',
				'The `default` key in the `actions` object handles the POST request.',
				'Include an `<input>` with a `name` attribute inside the form.'
			],
			conceptsTested: ['sveltekit.forms.default-action']
		},
		{
			id: 'cp-2',
			description: 'Read form data in the action and return results',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'request.formData()' },
						{ type: 'contains', value: 'formData.get' }
					]
				}
			},
			hints: [
				'Use `await request.formData()` to get the submitted data.',
				'Access fields with `formData.get(\'fieldName\')`.',
				'Return an object from the action — it becomes available as the `form` prop.'
			],
			conceptsTested: ['sveltekit.forms.form-data']
		}
	]
};
