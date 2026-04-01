import type { Lesson } from '$types/lesson';

export const progressiveEnhancement: Lesson = {
	id: 'sveltekit.form-actions.progressive-enhancement',
	slug: 'progressive-enhancement',
	title: 'Progressive Enhancement',
	description: 'Enhance forms with use:enhance for seamless client-side behavior and custom validation.',
	trackId: 'sveltekit',
	moduleId: 'form-actions',
	order: 3,
	estimatedMinutes: 15,
	concepts: ['sveltekit.forms.enhance', 'sveltekit.forms.validation'],
	prerequisites: ['sveltekit.forms.default-action'],

	content: [
		{
			type: 'text',
			content: `# Progressive Enhancement with use:enhance

By default, SvelteKit forms cause a full page reload. Adding \`use:enhance\` from \`$app/forms\` makes them submit via JavaScript instead — no page reload, with automatic UI updates.

The form still works without JavaScript, making it progressively enhanced.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.forms.enhance'
		},
		{
			type: 'text',
			content: `## Adding use:enhance

Import \`enhance\` from \`$app/forms\` and add it as an action on your form element.

**Your task:** Add \`use:enhance\` to the form so it submits without a page reload.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Custom Enhance Callbacks

You can pass a callback to \`use:enhance\` for custom behavior — like showing a loading state, resetting specific fields, or handling errors.

\`\`\`svelte
<form method="POST" use:enhance={() => {
  // Runs before submission
  return async ({ update }) => {
    // Runs after submission
    await update();
  };
}}>
\`\`\`

**Task:** Add a custom enhance callback that shows a loading state during submission.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Server-Side Validation

Actions can return validation errors using the \`fail()\` helper. The returned data is available in the \`form\` prop.

**Task:** Add validation to reject empty submissions and display the error.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const message = formData.get('message') as string;

    // TODO: Add validation — reject empty messages

    return { success: true, message };
  }
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<h1>Guestbook</h1>

<!-- TODO: Add use:enhance to this form -->
<form method="POST">
  <input name="message" placeholder="Leave a message" />
  <button type="submit">Submit</button>
</form>

{#if form?.success}
  <p>Submitted: {form.message}</p>
{/if}`
		}
	],

	solutionFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const message = formData.get('message') as string;

    if (!message || message.trim().length === 0) {
      return fail(400, { error: 'Message cannot be empty', message });
    }

    return { success: true, message };
  }
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<h1>Guestbook</h1>

<form method="POST" use:enhance={() => {
  loading = true;
  return async ({ update }) => {
    loading = false;
    await update();
  };
}}>
  <input name="message" placeholder="Leave a message" />
  <button type="submit" disabled={loading}>
    {loading ? 'Submitting...' : 'Submit'}
  </button>
</form>

{#if form?.error}
  <p class="error">{form.error}</p>
{/if}

{#if form?.success}
  <p>Submitted: {form.message}</p>
{/if}

<style>
  .error {
    color: #ef4444;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add use:enhance to the form',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'use:enhance' }]
				}
			},
			hints: [
				'Import `enhance` from `$app/forms`.',
				'Add `use:enhance` as a directive on your `<form>` element.',
				'The form will now submit via JavaScript without a full page reload.'
			],
			conceptsTested: ['sveltekit.forms.enhance']
		},
		{
			id: 'cp-2',
			description: 'Add a custom enhance callback with loading state',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'loading' },
						{ type: 'contains', value: 'use:enhance=' }
					]
				}
			},
			hints: [
				'Pass a function to `use:enhance`: `use:enhance={() => { ... }}`.',
				'Set `loading = true` before submission and `loading = false` after.',
				'Return an async function that calls `await update()` to apply the result.'
			],
			conceptsTested: ['sveltekit.forms.enhance']
		},
		{
			id: 'cp-3',
			description: 'Add server-side validation with fail()',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'fail(' },
						{ type: 'contains', value: 'form?.error' }
					]
				}
			},
			hints: [
				'Import `fail` from `@sveltejs/kit` in your server file.',
				'Return `fail(400, { error: \'...\' })` when validation fails.',
				'Display the error in the page with `{#if form?.error}`.'
			],
			conceptsTested: ['sveltekit.forms.validation']
		}
	]
};
