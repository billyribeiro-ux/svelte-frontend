import type { Lesson } from '$types/lesson';

export const serverEndpoints: Lesson = {
	id: 'sveltekit.api-routes.server-endpoints',
	slug: 'server-endpoints',
	title: 'Server Endpoints',
	description: 'Create API endpoints with +server.ts and GET/POST/PUT/DELETE handlers.',
	trackId: 'sveltekit',
	moduleId: 'api-routes',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['sveltekit.api.endpoints', 'sveltekit.api.methods'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# API Routes with +server.ts

SvelteKit lets you create API endpoints by exporting HTTP method handlers from \`+server.ts\` files. These are standalone endpoints — not tied to pages.

Each exported function (\`GET\`, \`POST\`, \`PUT\`, \`DELETE\`) handles the corresponding HTTP method and must return a \`Response\`.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.api.endpoints'
		},
		{
			type: 'text',
			content: `## Creating a GET Endpoint

**Your task:** Create a \`+server.ts\` file that exports a \`GET\` handler returning a JSON array of items.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Adding POST, PUT, and DELETE

You can export multiple handlers from the same file. Each handles a different HTTP method.

**Task:** Add a \`POST\` handler that accepts JSON data and returns a success response.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'api/items/+server.ts',
			path: '/api/items/+server.ts',
			language: 'typescript',
			content: `import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// TODO: Export a GET handler that returns items as JSON

// TODO: Export a POST handler that accepts new item data`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let items = $state<{ id: number; name: string }[]>([]);

  async function loadItems() {
    const res = await fetch('/api/items');
    items = await res.json();
  }

  async function addItem() {
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Item' })
    });
    await loadItems();
  }
</script>

<h1>Items API</h1>

<button onclick={loadItems}>Load Items</button>
<button onclick={addItem}>Add Item</button>

<ul>
  {#each items as item}
    <li>{item.name}</li>
  {/each}
</ul>`
		}
	],

	solutionFiles: [
		{
			name: 'api/items/+server.ts',
			path: '/api/items/+server.ts',
			language: 'typescript',
			content: `import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

let items = [
  { id: 1, name: 'Item A' },
  { id: 2, name: 'Item B' }
];

let nextId = 3;

export const GET: RequestHandler = async () => {
  return json(items);
};

export const POST: RequestHandler = async ({ request }) => {
  const { name } = await request.json();
  const item = { id: nextId++, name };
  items.push(item);
  return json(item, { status: 201 });
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let items = $state<{ id: number; name: string }[]>([]);

  async function loadItems() {
    const res = await fetch('/api/items');
    items = await res.json();
  }

  async function addItem() {
    await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New Item' })
    });
    await loadItems();
  }
</script>

<h1>Items API</h1>

<button onclick={loadItems}>Load Items</button>
<button onclick={addItem}>Add Item</button>

<ul>
  {#each items as item}
    <li>{item.name}</li>
  {/each}
</ul>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a GET handler that returns JSON data',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'export const GET' },
						{ type: 'contains', value: 'json(' }
					]
				}
			},
			hints: [
				'Export a `GET` constant that is a `RequestHandler` async function.',
				'Use `json()` from `@sveltejs/kit` to return a JSON response.',
				'`return json(items)` sends the array as a JSON response.'
			],
			conceptsTested: ['sveltekit.api.endpoints']
		},
		{
			id: 'cp-2',
			description: 'Create a POST handler that accepts JSON input',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'export const POST' },
						{ type: 'contains', value: 'request.json()' }
					]
				}
			},
			hints: [
				'Export a `POST` constant as a `RequestHandler` async function.',
				'Use `await request.json()` to parse the incoming JSON body.',
				'Return `json(newItem, { status: 201 })` for the created response.'
			],
			conceptsTested: ['sveltekit.api.methods']
		}
	]
};
