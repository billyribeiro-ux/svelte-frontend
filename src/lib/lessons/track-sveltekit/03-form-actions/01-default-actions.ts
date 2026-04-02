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

## Why SvelteKit Built Its Own Form Handling

Most modern frameworks handle mutations through client-side JavaScript: call an API with fetch, update local state, maybe show a toast. This approach works when JavaScript is available and reliable, but it creates several fundamental problems:

1. **Fragility.** If JavaScript fails to load (network issues, CDN outage, browser extension conflicts), the entire mutation flow breaks. The user cannot submit a form.
2. **Complexity.** Every form submission requires managing loading states, error states, success states, revalidation, and optimistic updates -- all in client-side code.
3. **Accessibility.** JavaScript-driven forms often break accessibility patterns that native HTML forms handle automatically (keyboard submission, form validation, screen reader announcements).

SvelteKit's form actions are built on a simple insight: HTML forms have worked for 30 years. A \`<form method="POST">\` submits data to the server without any JavaScript. SvelteKit uses this as the **baseline** and layers JavaScript enhancements on top.

## The POST/Redirect/GET Pattern

Form actions implement the classic **POST/Redirect/GET** (PRG) pattern:

1. User submits a form (POST request to the current page)
2. Server processes the submission, performs mutations
3. Server responds -- either with success data or a redirect
4. Browser follows the redirect (GET request) or re-renders with the result
5. The page shows the updated state

This pattern prevents the "double submission" problem: if the user refreshes the page after a POST, the browser does not re-submit the form because the current page state is a GET response.

Without JavaScript, SvelteKit performs a full page reload to display the result. With \`use:enhance\` (covered in the progressive enhancement lesson), the same flow happens asynchronously with no page reload.

## How Actions Are Defined

Actions live in \`+page.server.ts\` alongside your load functions. They are exported as an \`actions\` object:

\`\`\`typescript
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request, cookies, locals }) => {
    const formData = await request.formData();
    // Process the submission
    return { success: true };
  }
};
\`\`\`

The \`default\` action handles any POST request to the page. It receives the same event object as load functions, with full access to cookies, headers, locals (set by hooks), and the raw Request.

**Critical constraint:** When a page has a \`default\` action, it cannot also have named actions (covered in the next lesson). It is one or the other. The \`default\` action is the simplest form -- use it when a page has exactly one form.

## Reading Form Data: The Web Platform Way

Actions receive form data through the standard Web API \`Request.formData()\`:

\`\`\`typescript
const formData = await request.formData();
const title = formData.get('title') as string;
const priority = formData.get('priority') as string;
const tags = formData.getAll('tags'); // for multiple values with same name
\`\`\`

Every form field is identified by its \`name\` attribute. No name, no data. This is a common source of bugs -- forgetting to add \`name\` to an input element.

Form data values are always strings (or \`File\` objects for file uploads). There is no automatic type coercion. If you need a number, parse it explicitly: \`Number(formData.get('count'))\`. This is the Web Platform working as designed, and SvelteKit does not add magic on top of it.

## The form Prop: Returning Data to the Page

Whatever you return from an action becomes available in the page component as the \`form\` prop:

\`\`\`typescript
// In the action
return { success: true, title: 'My Post' };

// In the component
let { form } = $props();
// form is null on first load, then { success: true, title: 'My Post' } after submission
\`\`\`

The \`form\` prop is \`null\` on initial page load and populated only after a form submission. This distinction is important -- you use it to show success messages, display validation errors, or repopulate form fields after a failed submission.

## Validation with fail()

When form input is invalid, you should NOT throw an error (which would trigger the error boundary). Instead, use the \`fail()\` helper to return a non-2xx response with data:

\`\`\`typescript
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title') as string;

    if (!title || title.trim().length === 0) {
      return fail(400, { error: 'Title is required', title });
    }

    if (title.length > 100) {
      return fail(400, { error: 'Title must be under 100 characters', title });
    }

    // Save to database...
    return { success: true };
  }
};
\`\`\`

Notice that we return the submitted \`title\` back in the fail response. This lets the page repopulate the form field with the user's input, so they do not have to retype everything after a validation error.

## SSR and the Action Lifecycle

During a form submission:
1. The browser sends a POST request to the page URL
2. SvelteKit routes this to the matching action
3. The action runs on the server (always -- actions never run in the browser)
4. If the action returns data (not a redirect), SvelteKit also re-runs the page's load function
5. The page is re-rendered with both the fresh load data and the action's return value
6. The HTML response is sent to the browser

This means load functions always run after actions. If your action creates a new post and your load function fetches the posts list, the list will include the new post. No manual cache invalidation needed -- the re-render happens automatically.

## Decision Framework: Actions vs. API Routes

Use **form actions** when:
- The mutation is triggered by a user interaction on a page
- You want progressive enhancement (works without JS)
- The result should be displayed on the same page
- You need the form/load re-run cycle

Use **API routes** (\`+server.ts\`) when:
- External systems need to call the endpoint (webhooks, mobile apps)
- The endpoint is consumed by multiple pages
- You need fine-grained control over the HTTP response (status codes, headers, streaming)
- The mutation is triggered programmatically, not by a form`
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
				'Return an object from the action -- it becomes available as the `form` prop.'
			],
			conceptsTested: ['sveltekit.forms.form-data']
		}
	]
};
