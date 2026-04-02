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

## Why SvelteKit Includes API Routes

SvelteKit is a full-stack framework. While load functions and form actions handle most data operations tied to pages, applications often need standalone HTTP endpoints for:

- **External consumers:** Mobile apps, third-party integrations, and webhooks that need a JSON API
- **Content negotiation:** The same URL serving HTML to browsers and JSON to API clients
- **Programmatic operations:** WebSocket upgrades, file downloads, image generation, redirect services
- **Internal APIs:** Endpoints consumed by client-side JavaScript for interactive features that do not map to page navigation

SvelteKit API routes use the **Web Platform standard** -- the same \`Request\` and \`Response\` objects you would use in a Cloudflare Worker, Deno, or any standards-compliant runtime. This is a deliberate choice: your API handlers are portable across deployment targets.

## The +server.ts Convention

API routes are defined by exporting named HTTP method handlers from \`+server.ts\` files:

\`\`\`typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, params, cookies, locals }) => {
  return json({ message: 'Hello' });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  return json({ created: true }, { status: 201 });
};

export const PUT: RequestHandler = async ({ request, params }) => {
  return json({ updated: true });
};

export const DELETE: RequestHandler = async ({ params }) => {
  return new Response(null, { status: 204 });
};
\`\`\`

Each exported function handles exactly one HTTP method. If a client sends a method you have not exported, SvelteKit returns \`405 Method Not Allowed\` automatically.

The file path determines the URL: \`src/routes/api/users/+server.ts\` handles requests to \`/api/users\`. Dynamic parameters work the same as pages: \`src/routes/api/users/[id]/+server.ts\` handles \`/api/users/42\`.

## Content Negotiation: Pages and APIs at the Same URL

A route can have BOTH \`+page.svelte\` and \`+server.ts\`. SvelteKit uses the request's \`Accept\` header to decide which to use:

- Browser requests (Accept: text/html) go to the page
- API requests (Accept: application/json) go to the server endpoint
- \`GET\` requests without a clear Accept header go to the page

This enables patterns where \`/users\` renders an HTML page for browsers and returns JSON for API clients. In practice, this is most useful for creating APIs that mirror your page structure.

However, be careful with this pattern. If both exist, a \`POST\` request always goes to the \`+server.ts\` handler (not form actions). You cannot have both form actions and a POST handler on the same route.

## The json() Helper and Response Construction

The \`json()\` helper is syntactic sugar for creating JSON responses:

\`\`\`typescript
// These are equivalent:
return json(data, { status: 201, headers: { 'X-Custom': 'value' } });

return new Response(JSON.stringify(data), {
  status: 201,
  headers: {
    'Content-Type': 'application/json',
    'X-Custom': 'value'
  }
});
\`\`\`

For non-JSON responses, construct \`Response\` objects directly:

\`\`\`typescript
// Plain text
return new Response('Hello, world!', {
  headers: { 'Content-Type': 'text/plain' }
});

// Redirect
return new Response(null, {
  status: 301,
  headers: { 'Location': '/new-url' }
});

// No content
return new Response(null, { status: 204 });
\`\`\`

## Security: The Server Boundary

Like \`+page.server.ts\`, code in \`+server.ts\` runs exclusively on the server. You can safely import from \`$env/static/private\`, query databases, and use secrets. The module is never included in client bundles.

However, the RESPONSE you send is visible to clients. Never include raw database records, internal IDs, or sensitive fields in your JSON responses. Always map your data to a client-safe shape:

\`\`\`typescript
export const GET: RequestHandler = async () => {
  const users = await db.users.findMany();

  // Map to client-safe shape -- exclude password hashes, internal flags
  const safeUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    avatar: u.avatarUrl
  }));

  return json(safeUsers);
};
\`\`\`

## Decision Framework: API Routes vs. Form Actions vs. Remote Functions

| Use Case | API Routes | Form Actions | Remote Functions |
|---|---|---|---|
| External API consumers | Yes | No | No |
| Form submissions | Possible but avoid | Yes | Yes |
| Programmatic client-side mutations | Yes | Possible | Yes |
| Needs progressive enhancement | No | Yes | Yes |
| Needs custom HTTP responses | Yes | Limited | No |
| Type-safe client calls | Manual | Auto | Auto |
| File uploads | Yes | Yes | Limited |`
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
