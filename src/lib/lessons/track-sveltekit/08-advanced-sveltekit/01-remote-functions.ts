import type { Lesson } from '$types/lesson';

export const remoteFunctions: Lesson = {
	id: 'sveltekit.advanced-sveltekit.remote-functions',
	slug: 'remote-functions',
	title: 'Remote Functions',
	description: 'Call server code directly from components with query(), command(), form(), and .remote.ts files.',
	trackId: 'sveltekit',
	moduleId: 'advanced-sveltekit',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['sveltekit.advanced.remote-functions', 'sveltekit.advanced.query'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Remote Functions

SvelteKit remote functions let you call server-side code directly from your components. Define functions in \`.remote.ts\` files, and SvelteKit handles the network layer.

There are three types:
- **\`query()\`** — read data (like a GET request)
- **\`command()\`** — mutate data (like a POST request)
- **\`form()\`** — handle form submissions with progressive enhancement`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.advanced.remote-functions'
		},
		{
			type: 'text',
			content: `## Creating a Remote Query

Define a server function in a \`.remote.ts\` file and use \`query()\` to call it from a component.

**Your task:** Create a remote function that fetches data and call it from a component.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Using command() for Mutations

For operations that change data (create, update, delete), use \`command()\`. It works like a POST request under the hood.

**Task:** Create a remote command function for adding items.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'todos.remote.ts',
			path: '/todos.remote.ts',
			language: 'typescript',
			content: `// TODO: Define server functions for todos

const todos = [
  { id: 1, title: 'Learn remote functions', done: false },
  { id: 2, title: 'Build an app', done: false }
];

// TODO: Export a function to get todos

// TODO: Export a function to add a todo`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import query and command, use remote functions
</script>

<h1>Todos</h1>

<!-- TODO: Display todos and add form -->`
		}
	],

	solutionFiles: [
		{
			name: 'todos.remote.ts',
			path: '/todos.remote.ts',
			language: 'typescript',
			content: `const todos = [
  { id: 1, title: 'Learn remote functions', done: false },
  { id: 2, title: 'Build an app', done: false }
];

let nextId = 3;

export function getTodos() {
  return todos;
}

export function addTodo(title: string) {
  const todo = { id: nextId++, title, done: false };
  todos.push(todo);
  return todo;
}`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { query, command } from '$app/state';
  import { getTodos, addTodo } from './todos.remote.ts';

  const todos = query(getTodos);
  const add = command(addTodo);

  let title = $state('');

  async function handleAdd() {
    if (title.trim()) {
      await add(title);
      title = '';
    }
  }
</script>

<h1>Todos</h1>

<form onsubmit={(e) => { e.preventDefault(); handleAdd(); }}>
  <input bind:value={title} placeholder="New todo" />
  <button type="submit">Add</button>
</form>

<ul>
  {#each todos.current as todo}
    <li>{todo.title}</li>
  {/each}
</ul>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a remote query function to fetch data',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'export function' },
						{ type: 'contains', value: 'query' }
					]
				}
			},
			hints: [
				'Export a function from a `.remote.ts` file that returns data.',
				'Import `query` from `$app/state` in your component.',
				'Use `const data = query(myFunction)` to call it reactively.'
			],
			conceptsTested: ['sveltekit.advanced.query']
		},
		{
			id: 'cp-2',
			description: 'Create a remote command function for mutations',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'command' },
						{ type: 'contains', value: 'addTodo' }
					]
				}
			},
			hints: [
				'Export a mutation function from the `.remote.ts` file.',
				'Import `command` from `$app/state` in your component.',
				'Use `const add = command(addTodo)` and call `await add(args)`.'
			],
			conceptsTested: ['sveltekit.advanced.remote-functions']
		}
	]
};
