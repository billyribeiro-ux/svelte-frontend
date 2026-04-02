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

## The Philosophy: HTML First, JavaScript Second

Progressive enhancement is not just a technique -- it is an engineering philosophy. Start with the most resilient technology (HTML forms that work without JavaScript), then layer improvements for users who have JavaScript available. This creates applications that:

- Work on slow connections where JavaScript is still loading
- Work in environments where JavaScript is blocked or fails
- Provide an instant upgrade to a smoother experience when JS is available
- Are testable at both levels: basic HTML form tests AND enhanced JS behavior tests

SvelteKit embodies this philosophy in its form actions system. A plain \`<form method="POST">\` works without any JavaScript. Adding \`use:enhance\` upgrades the experience without changing the server-side code.

## What use:enhance Does Under the Hood

When you add \`use:enhance\` to a form, SvelteKit intercepts the native form submission and replaces it with a JavaScript-driven flow:

1. **Prevents the default form submission** (no full page reload)
2. **Serializes the form data** using the same \`FormData\` API
3. **Sends a fetch request** to the action endpoint
4. **Processes the response:**
   - If the action returns data, SvelteKit updates the \`form\` prop
   - If the action returns a redirect, SvelteKit navigates client-side
   - If the action returns \`fail()\`, SvelteKit updates the \`form\` prop with error data
5. **Re-runs load functions** (\`invalidateAll()\` by default) to refresh page data
6. **Resets the form** to its initial state (default behavior, can be overridden)

This entire flow mirrors what the browser does natively with a full page reload, but happens asynchronously within the current page context. Layout state, scroll positions, and other component state are preserved.

## The Custom Enhance Callback: Full Control

The real power of \`use:enhance\` comes from its callback function. The callback runs BEFORE the submission and returns an async function that runs AFTER:

\`\`\`svelte
<form method="POST" use:enhance={() => {
  // BEFORE submission -- set loading states, disable buttons
  loading = true;

  return async ({ result, update }) => {
    // AFTER submission -- handle the result
    loading = false;

    if (result.type === 'success') {
      showToast('Saved!');
    }

    // Call update() to apply the default behavior
    // (update form prop, invalidate data, reset form)
    await update();
  };
}}>
\`\`\`

The \`result\` object has a \`type\` property that tells you what happened:
- \`'success'\` -- the action returned normally (2xx status)
- \`'failure'\` -- the action called \`fail()\` (4xx status)
- \`'redirect'\` -- the action called \`redirect()\`
- \`'error'\` -- an unexpected error occurred

## Controlling Default Behaviors

The \`update()\` function accepts an options object:

\`\`\`typescript
await update({ reset: false }); // Don't reset form fields
await update({ invalidateAll: false }); // Don't re-run load functions
\`\`\`

**\`reset: false\`** is essential for forms where you want to preserve user input after submission. For example, a search form should keep the search query after submitting. A chat input should clear (default), but a settings form should keep the values.

**\`invalidateAll: false\`** is a performance optimization. If your action created a new item and you already know the item's data from the action response, you can update local state directly without re-fetching from the server:

\`\`\`svelte
<form method="POST" action="?/create" use:enhance={() => {
  return async ({ result, update }) => {
    if (result.type === 'success') {
      // Add the new item to local state directly
      items = [...items, result.data.item];
      // Skip the server re-fetch since we already have the data
    } else {
      await update();
    }
  };
}}>
\`\`\`

## Optimistic UI: Update Before the Server Responds

Optimistic UI makes your app feel instant by updating the UI before the server confirms the action:

\`\`\`svelte
<form method="POST" action="?/toggle" use:enhance={() => {
  // Optimistically toggle the item immediately
  const previousState = todo.done;
  todo.done = !todo.done;

  return async ({ result, update }) => {
    if (result.type === 'failure') {
      // Revert if the server rejected the change
      todo.done = previousState;
      showError('Failed to update');
    }
    await update({ reset: false, invalidateAll: false });
  };
}}>
\`\`\`

This pattern works best for simple state toggles (done/undone, like/unlike, archive/unarchive). For complex mutations (create, delete, reorder), it is usually safer to wait for the server response.

## Server-Side Validation with fail()

The \`fail()\` helper is the correct way to handle validation errors. It returns a non-success HTTP status with data that populates the \`form\` prop:

\`\`\`typescript
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    const errors: Record<string, string> = {};

    if (!email || !email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }

    if (!message || message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters';
    }

    if (Object.keys(errors).length > 0) {
      // Return 400 with the errors AND the submitted values
      return fail(400, { errors, email, message });
    }

    // Process the valid submission
    await sendMessage(email, message);
    return { success: true };
  }
};
\`\`\`

In the template, display field-level errors:
\`\`\`svelte
<input name="email" value={form?.email ?? ''} />
{#if form?.errors?.email}
  <span class="error">{form.errors.email}</span>
{/if}
\`\`\`

Returning the submitted values (\`email\`, \`message\`) in the fail response is critical -- it lets you repopulate the form so the user does not have to retype their input.

## Decision Framework: When to Customize use:enhance

Use **plain \`use:enhance\`** (no callback) when:
- The default behavior (reset form, invalidate all, update form prop) is exactly what you want
- The form is simple and does not need loading states

Use **a custom callback** when:
- You need loading/submitting state indicators
- You want optimistic UI updates
- You need to show toast notifications on success
- You want to prevent form reset (\`update({ reset: false })\`)
- You want to skip data invalidation for performance

Use **no \`use:enhance\`** (plain HTML form) when:
- The form must work in environments without JavaScript
- You are building for accessibility-first scenarios
- The full page reload after submission is acceptable`
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

You can pass a callback to \`use:enhance\` for custom behavior -- like showing a loading state, resetting specific fields, or handling errors.

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
