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

When a page has multiple forms, you need **named actions** to distinguish them. Instead of a single \`default\` action, define named actions like \`create\` and \`delete\`.

Forms target a specific action using the \`action\` attribute: \`action="?/create"\` or \`action="?/delete"\`.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.forms.named-actions'
		},
		{
			type: 'text',
			content: `## Defining Named Actions

**Your task:** Create two named actions — \`create\` for adding items and \`delete\` for removing them. Point each form to the correct action using the \`action\` attribute.`
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
