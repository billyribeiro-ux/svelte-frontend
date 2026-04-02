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

## Why Remote Functions Represent a Paradigm Shift

Traditional SvelteKit data flow involves load functions (for reading) and form actions (for writing). While powerful, this model has friction points:

- **Load functions are tied to routes.** You cannot easily call a server function from an arbitrary component.
- **Form actions require HTML forms.** Programmatic mutations need \`fetch\` calls to API routes.
- **Type safety across the boundary is manual.** You define types on the server and hope they match the client.

Remote functions eliminate this friction by letting you write server-side functions in \`.remote.ts\` files and call them directly from components. SvelteKit handles the network layer, serialization, and type safety automatically. You write a function on the server; you call it on the client; the types flow through.

This is conceptually similar to tRPC, Server Actions (React), or Telefunc -- but deeply integrated with SvelteKit's architecture and Svelte 5's reactivity system.

## The Three Remote Function Types

SvelteKit provides three wrappers that correspond to different intent:

**\`query(fn)\`** -- for reading data. Analogous to a GET request.
- Returns a reactive object with a \`.current\` property
- Automatically refetches when dependencies change
- Results are cached and deduplicated
- Used with \`$derived\` and reactive expressions

**\`command(fn)\`** -- for mutations. Analogous to a POST request.
- Returns an async function you call imperatively
- Automatically invalidates related queries after execution
- Does NOT cache results
- Used for create, update, delete operations

**\`form(fn)\`** -- for form submissions with progressive enhancement.
- Works like form actions but defined as remote functions
- Supports progressive enhancement (works without JS)
- Returns validation errors via Standard Schema

## How .remote.ts Files Work

Functions exported from \`.remote.ts\` files are server-only. SvelteKit transforms the imports at build time:

\`\`\`typescript
// todos.remote.ts
// This file ONLY runs on the server

import { db } from '$lib/server/database';

export async function getTodos(userId: string) {
  return db.todos.findMany({ where: { userId } });
}

export async function addTodo(userId: string, title: string) {
  return db.todos.create({ data: { userId, title, done: false } });
}

export async function toggleTodo(id: string) {
  const todo = await db.todos.find(id);
  return db.todos.update(id, { done: !todo.done });
}
\`\`\`

When you import these functions in a \`.svelte\` file, SvelteKit replaces the import with a client-side proxy that makes HTTP requests to an auto-generated endpoint. The actual function code never reaches the browser.

\`\`\`svelte
<script lang="ts">
  import { query, command } from '$app/state';
  import { getTodos, addTodo, toggleTodo } from './todos.remote.ts';

  // query() creates a reactive query
  const todos = query(() => getTodos(userId));

  // command() creates an imperative mutation function
  const add = command(addTodo);
  const toggle = command(toggleTodo);
</script>

<ul>
  {#each todos.current as todo}
    <li>
      <button onclick={() => toggle(todo.id)}>
        {todo.done ? 'Undo' : 'Done'}
      </button>
      {todo.title}
    </li>
  {/each}
</ul>
\`\`\`

## Type Safety: The End-to-End Story

The most significant advantage of remote functions is automatic type safety. The function signature on the server defines the contract:

\`\`\`typescript
// products.remote.ts
export async function getProduct(id: string): Promise<Product | null> {
  return db.products.find(id);
}

export async function updatePrice(id: string, price: number): Promise<Product> {
  if (price < 0) throw new Error('Price must be positive');
  return db.products.update(id, { price });
}
\`\`\`

In the component, TypeScript knows:
- \`query(() => getProduct(id))\` has \`.current\` of type \`Product | null\`
- \`command(updatePrice)\` expects \`(id: string, price: number)\` as arguments
- The return type of the command is \`Product\`

No type duplication. No API schema definitions. No code generation step. The types are derived directly from the function signatures.

## Standard Schema Validation

Remote functions support Standard Schema (a universal schema interface that works with Zod, Valibot, ArkType, and others) for input validation:

\`\`\`typescript
// todos.remote.ts
import { z } from 'zod';

const AddTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

export async function addTodo(input: z.infer<typeof AddTodoSchema>) {
  const validated = AddTodoSchema.parse(input);
  return db.todos.create({ data: validated });
}
addTodo.schema = AddTodoSchema;
\`\`\`

When a schema is attached, SvelteKit validates input before the function executes. Validation errors are returned to the client in a structured format that you can display in forms.

## Query Reactivity and Refetching

Queries created with \`query()\` are reactive. If the arguments to the query function change, the query automatically refetches:

\`\`\`svelte
<script lang="ts">
  import { query } from '$app/state';
  import { searchProducts } from './products.remote.ts';

  let searchTerm = $state('');

  // This refetches whenever searchTerm changes
  const results = query(() => searchProducts(searchTerm));
</script>

<input bind:value={searchTerm} placeholder="Search..." />

{#each results.current ?? [] as product}
  <div>{product.name}</div>
{/each}
\`\`\`

The reactivity is debounced -- rapid changes to \`searchTerm\` do not fire dozens of requests. SvelteKit batches and deduplicates.

## Command Invalidation

After a command executes, SvelteKit automatically invalidates related queries. The invalidation is based on the \`.remote.ts\` file -- all queries from the same file are invalidated when a command from that file completes:

\`\`\`svelte
<script lang="ts">
  import { query, command } from '$app/state';
  import { getTodos, addTodo } from './todos.remote.ts';

  const todos = query(() => getTodos());
  const add = command(addTodo);

  async function handleAdd(title: string) {
    await add(title);
    // todos.current is automatically refreshed
    // because addTodo and getTodos are in the same .remote.ts file
  }
</script>
\`\`\`

## Decision Framework: Remote Functions vs. Load Functions vs. API Routes

| Feature | Remote Functions | Load Functions | API Routes |
|---|---|---|---|
| Called from components | Yes | No (route-level) | Yes (via fetch) |
| Type-safe | Automatic | Via \`$types\` | Manual |
| Reactive queries | Yes | Via invalidation | Manual |
| Progressive enhancement | Yes (form()) | Yes (actions) | No |
| External consumers | No | No | Yes |
| SSR data loading | No | Yes | Indirect |
| Bound to routes | No | Yes | Yes |

Use remote functions for component-level data needs, load functions for route-level data (SEO, SSR), and API routes for external consumers.`
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
