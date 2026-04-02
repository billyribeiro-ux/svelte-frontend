import type { Lesson } from '$types/lesson';

export const namedActions: Lesson = {
	id: 'sveltekit.form-actions.named-actions',
	slug: 'named-actions',
	title: 'Named Actions',
	description: 'Use named actions to handle multiple forms with different action URLs.',
	trackId: 'sveltekit',
	moduleId: 'form-actions',
	order: 2,
	estimatedMinutes: 12,
	concepts: ['sveltekit.forms.named-actions', 'sveltekit.forms.action-urls'],
	prerequisites: ['sveltekit.forms.default-action'],

	content: [
		{
			type: 'text',
			content: `# Named Actions

## Why Named Actions Exist

The default action handles a single form per page. But real pages often have multiple forms: a todo list has a "create" form and a "delete" button for each item. A settings page has forms for profile info, email preferences, and password changes. A comment section has a "post comment" form, "edit" forms, and "delete" buttons.

Named actions solve this by routing different forms to different server-side handlers based on the \`action\` attribute on the \`<form>\` element.

## The action URL Convention

Named actions use a query parameter convention: \`?/actionName\`. When a form has \`action="?/create"\`, the POST request goes to the current page URL with \`?/create\` appended. SvelteKit strips this prefix and routes to the \`create\` handler in your \`actions\` object:

\`\`\`typescript
export const actions: Actions = {
  create: async ({ request }) => {
    // Handles forms with action="?/create"
  },
  delete: async ({ request }) => {
    // Handles forms with action="?/delete"
  }
};
\`\`\`

The \`?/\` prefix is a SvelteKit convention, not a Web standard. It ensures action URLs do not conflict with normal query parameters. The form submits to the same page URL, keeping the URL bar clean.

**Mutual exclusivity rule:** A page can have either a \`default\` action OR named actions, never both. If you define a \`default\` action alongside named actions, SvelteKit will throw an error. This constraint keeps the routing logic unambiguous.

## When to Split into Named Actions vs. Separate Pages

This is a genuine architectural decision. Consider a user settings page:

**Option A: Named actions on one page**
\`\`\`
/settings
  ?/updateProfile
  ?/updateEmail
  ?/changePassword
  ?/deleteAccount
\`\`\`

**Option B: Separate pages**
\`\`\`
/settings/profile    (default action)
/settings/email      (default action)
/settings/password   (default action)
/settings/delete     (default action)
\`\`\`

**Choose named actions when:**
- The forms share the same page and data context
- Users commonly interact with multiple forms in one session
- The forms are part of a single conceptual workflow (like a todo list with create/delete)
- The data displayed on the page is the same regardless of which form was submitted

**Choose separate pages when:**
- Each form has distinct data requirements (its own load function)
- The forms are conceptually independent (profile vs. billing)
- You want distinct URLs for bookmarking/sharing
- The forms are complex enough to warrant their own error boundaries

## How the form Prop Works with Named Actions

After a named action completes, the \`form\` prop contains the returned data, just like default actions. However, when you have multiple forms on a page, you need a way to know WHICH action's result you are displaying.

A common pattern is including the action name in the return value:

\`\`\`typescript
export const actions: Actions = {
  create: async ({ request }) => {
    // ... process creation
    return { action: 'create', success: true };
  },
  delete: async ({ request }) => {
    // ... process deletion
    return { action: 'delete', success: true };
  }
};
\`\`\`

Then in the template:
\`\`\`svelte
{#if form?.action === 'create' && form.success}
  <p>Item created!</p>
{/if}
{#if form?.action === 'delete' && form.success}
  <p>Item deleted.</p>
{/if}
\`\`\`

## Inline Forms for Delete/Toggle Actions

A powerful pattern is embedding small forms directly in list items. Each item has its own delete form with a hidden input carrying the item's ID:

\`\`\`svelte
{#each data.todos as todo}
  <li>
    {todo.title}
    <form method="POST" action="?/delete" style="display:inline">
      <input type="hidden" name="id" value={todo.id} />
      <button type="submit">Delete</button>
    </form>
  </li>
{/each}
\`\`\`

This works without JavaScript -- clicking "Delete" submits the form, the action runs, the page reloads with the item removed. With \`use:enhance\`, it becomes instant and seamless.

The hidden input pattern (\`<input type="hidden" name="id" value={todo.id} />\`) is how you pass non-user-entered data to an action. The form element carries the action route (\`?/delete\`), and hidden inputs carry the context (which item to delete).

## Cross-Page Action Calls

Forms can target actions on OTHER pages using the full path:

\`\`\`svelte
<!-- On /blog/[slug] page, targeting the /blog page's actions -->
<form method="POST" action="/blog?/delete">
  <input type="hidden" name="slug" value={data.post.slug} />
  <button>Delete Post</button>
</form>
\`\`\`

After this action completes, SvelteKit redirects back to the page specified in the action URL (\`/blog\`). This is useful when a child page needs to trigger a mutation that is logically owned by a parent page.

## Security: Actions and CSRF Protection

SvelteKit automatically protects against CSRF (Cross-Site Request Forgery) attacks. It checks the \`Origin\` header of incoming POST requests and rejects requests that do not originate from the same domain. This happens transparently -- you do not need to add CSRF tokens to your forms.

This protection works because SvelteKit validates at the framework level, before your action code runs. If a malicious site tries to submit a form to your SvelteKit app, the request is rejected with a 403.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.forms.named-actions'
		},
		{
			type: 'text',
			content: `## Defining Named Actions

**Your task:** Create two named actions -- \`create\` for adding items and \`delete\` for removing them. Point each form to the correct action using the \`action\` attribute.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Multiple Forms on One Page

Each form can target a different action. The form's \`action\` attribute uses the \`?/actionName\` syntax to specify which action to call.

**Task:** Add both forms to the page and ensure they target the correct actions.`
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
			content: `import type { Actions, PageServerLoad } from './$types';

let todos = [
  { id: 1, title: 'Learn SvelteKit' },
  { id: 2, title: 'Build an app' }
];

export const load: PageServerLoad = async () => {
  return { todos };
};

// TODO: Define named actions for 'create' and 'delete'
export const actions: Actions = {};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data, form } = $props();
</script>

<h1>Todos</h1>

<!-- TODO: Add a create form with action="?/create" -->

<!-- TODO: Add delete buttons with action="?/delete" -->
<ul>
  {#each data.todos as todo}
    <li>{todo.title}</li>
  {/each}
</ul>`
		}
	],

	solutionFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { Actions, PageServerLoad } from './$types';

let todos = [
  { id: 1, title: 'Learn SvelteKit' },
  { id: 2, title: 'Build an app' }
];

let nextId = 3;

export const load: PageServerLoad = async () => {
  return { todos };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    todos.push({ id: nextId++, title });
    return { success: true };
  },
  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get('id'));
    todos = todos.filter((t) => t.id !== id);
    return { success: true };
  }
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data, form } = $props();
</script>

<h1>Todos</h1>

<form method="POST" action="?/create">
  <input name="title" placeholder="New todo" required />
  <button type="submit">Add</button>
</form>

<ul>
  {#each data.todos as todo}
    <li>
      {todo.title}
      <form method="POST" action="?/delete" style="display:inline">
        <input type="hidden" name="id" value={todo.id} />
        <button type="submit">Delete</button>
      </form>
    </li>
  {/each}
</ul>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Define named create and delete actions',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'create:' },
						{ type: 'contains', value: 'delete:' }
					]
				}
			},
			hints: [
				'Replace the empty `actions` object with named action handlers.',
				'Define `create: async ({ request }) => { ... }` and `delete: async ({ request }) => { ... }`.',
				'Each action should read form data with `await request.formData()`.'
			],
			conceptsTested: ['sveltekit.forms.named-actions']
		},
		{
			id: 'cp-2',
			description: 'Target each form to the correct named action',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '?/create' },
						{ type: 'contains', value: '?/delete' }
					]
				}
			},
			hints: [
				'Use `action="?/create"` on the form that adds new items.',
				'Use `action="?/delete"` on the form for each item\'s delete button.',
				'Include a hidden input with the item\'s `id` in the delete form.'
			],
			conceptsTested: ['sveltekit.forms.action-urls']
		}
	]
};
