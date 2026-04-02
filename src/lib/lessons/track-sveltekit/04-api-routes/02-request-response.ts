import type { Lesson } from '$types/lesson';

export const requestResponse: Lesson = {
	id: 'sveltekit.api-routes.request-response',
	slug: 'request-response',
	title: 'Request & Response',
	description: 'Parse request data, set headers, and construct JSON responses in API routes.',
	trackId: 'sveltekit',
	moduleId: 'api-routes',
	order: 2,
	estimatedMinutes: 12,
	concepts: ['sveltekit.api.request', 'sveltekit.api.response'],
	prerequisites: ['sveltekit.api.endpoints'],

	content: [
		{
			type: 'text',
			content: `# Working with Requests and Responses

## Why SvelteKit Uses Web Standards

SvelteKit API routes use the standard Web \`Request\` and \`Response\` APIs -- the same objects specified in the WHATWG Fetch Standard that browsers, Deno, Cloudflare Workers, and modern Node.js all implement. This is a deliberate architectural decision with concrete benefits:

1. **Portability.** Your endpoint code works identically whether deployed to Node.js, Cloudflare, Vercel Edge, or Deno. The adapter handles platform differences; your code stays the same.
2. **No framework lock-in.** Knowledge of the Request/Response API transfers to any platform. Unlike Express's \`req.query\` or Fastify's \`request.body\`, the Web API is a standard you can rely on anywhere.
3. **No abstraction overhead.** There is no middleware layer, no body parser configuration, no response helper library. You work directly with the primitives.

## Anatomy of the Request Event

API handlers receive a \`RequestEvent\` object that combines the raw Request with SvelteKit-specific context:

\`\`\`typescript
export const GET: RequestHandler = async ({
  request,   // The raw Web Request object
  url,       // Parsed URL object (url.searchParams, url.pathname, etc.)
  params,    // Route parameters ({ id: '42' })
  cookies,   // Cookie helper (get, set, delete)
  locals,    // Data from hooks (locals.user)
  fetch,     // Server-side fetch with cookie forwarding
  getClientAddress, // Client IP address
  platform,  // Platform-specific context (Cloudflare bindings, etc.)
  setHeaders // Set response headers (for load functions; less common in +server.ts)
}) => {
  // ...
};
\`\`\`

The \`url\` property is particularly useful. It gives you a fully parsed URL object with access to search parameters, pathname, origin, and more -- no manual parsing needed.

## Parsing Request Data: Every Format

**Query parameters** (GET requests):
\`\`\`typescript
export const GET: RequestHandler = async ({ url }) => {
  const search = url.searchParams.get('q');        // single value
  const tags = url.searchParams.getAll('tag');      // multiple values
  const page = Number(url.searchParams.get('page') ?? '1');
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '20'), 100);

  return json({ search, tags, page, limit });
};
\`\`\`

**JSON body** (POST/PUT/PATCH):
\`\`\`typescript
export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  // body is unknown -- validate before using
  return json({ received: body });
};
\`\`\`

**Form data** (multipart/form-data or URL-encoded):
\`\`\`typescript
export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const file = formData.get('avatar') as File;
  return json({ name, fileSize: file.size });
};
\`\`\`

**Raw text or binary**:
\`\`\`typescript
export const POST: RequestHandler = async ({ request }) => {
  const text = await request.text();        // plain text
  const buffer = await request.arrayBuffer(); // binary data
  return new Response('OK');
};
\`\`\`

**Important:** You can only consume the request body ONCE. Calling \`request.json()\` and then \`request.text()\` will fail because the body stream has already been read.

## Headers: Reading and Writing

**Reading request headers:**
\`\`\`typescript
const auth = request.headers.get('authorization');
const contentType = request.headers.get('content-type');
const userAgent = request.headers.get('user-agent');
\`\`\`

**Setting response headers:**
\`\`\`typescript
return json(data, {
  headers: {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'X-Request-Id': crypto.randomUUID(),
    'Access-Control-Allow-Origin': 'https://trusted-domain.com'
  }
});
\`\`\`

## Cookies: The SvelteKit Helper

While you can read cookies from \`request.headers.get('cookie')\`, SvelteKit provides a \`cookies\` helper that handles parsing, signing, and setting:

\`\`\`typescript
export const POST: RequestHandler = async ({ cookies }) => {
  // Read
  const session = cookies.get('session_id');

  // Set (with options)
  cookies.set('session_id', 'abc123', {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });

  // Delete
  cookies.delete('old_cookie', { path: '/' });

  return json({ ok: true });
};
\`\`\`

The \`cookies\` helper automatically sets the \`Set-Cookie\` response header. You do not need to construct the header manually. It also handles the \`path\` requirement -- you must always specify \`path\` when setting or deleting cookies, as SvelteKit enforces this to prevent subtle bugs where cookies are set on unexpected paths.

## Caching Strategy for API Routes

HTTP caching is one of the most impactful performance optimizations for API routes. The key headers:

- **\`Cache-Control: public, max-age=60\`** -- CDN and browser cache for 60 seconds
- **\`Cache-Control: private, max-age=300\`** -- browser cache only (user-specific data)
- **\`Cache-Control: no-store\`** -- never cache (real-time data)
- **\`s-maxage=3600\`** -- CDN caches for 1 hour, even if \`max-age\` is shorter
- **\`stale-while-revalidate=60\`** -- serve stale data while refreshing in the background

\`\`\`typescript
export const GET: RequestHandler = async ({ url }) => {
  const data = await fetchData(url.searchParams);

  return json(data, {
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=60'
    }
  });
};
\`\`\`

This strategy serves users from the CDN cache (fast), refreshes the CDN cache every hour, and lets the CDN serve slightly stale data while fetching fresh data in the background.

## Error Handling in API Routes

Unlike load functions (which use the \`error()\` helper to trigger error boundaries), API routes must construct error responses manually:

\`\`\`typescript
import { json, error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
  const item = await db.items.find(params.id);

  if (!item) {
    // Option 1: Use error() helper (returns JSON for API requests)
    error(404, 'Item not found');
  }

  // Option 2: Manual response
  if (!item) {
    return json({ error: 'Item not found' }, { status: 404 });
  }

  return json(item);
};
\`\`\`

The \`error()\` helper works in API routes and returns a JSON error response. For more control over the error shape, construct the response manually.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.api.request'
		},
		{
			type: 'text',
			content: `## Parsing URL Parameters

Access query parameters from the \`url\` property of the request event.

**Your task:** Create a GET endpoint that reads a \`search\` query parameter and filters results.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Custom Response Headers

You can pass options to \`json()\` or create a \`new Response()\` to set custom headers like \`Cache-Control\` or \`X-Custom-Header\`.

**Task:** Add cache control headers to the response.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'api/search/+server.ts',
			path: '/api/search/+server.ts',
			language: 'typescript',
			content: `import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

// TODO: Create a GET handler that filters by ?search= param
export const GET: RequestHandler = async ({ url }) => {
  return json(items);
};`
		}
	],

	solutionFiles: [
		{
			name: 'api/search/+server.ts',
			path: '/api/search/+server.ts',
			language: 'typescript',
			content: `import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

export const GET: RequestHandler = async ({ url }) => {
  const search = url.searchParams.get('search')?.toLowerCase() ?? '';
  const filtered = items.filter((item) => item.toLowerCase().includes(search));

  return json(filtered, {
    headers: {
      'Cache-Control': 'max-age=60'
    }
  });
};`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Read search params from the URL and filter results',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'url.searchParams' },
						{ type: 'contains', value: 'filter' }
					]
				}
			},
			hints: [
				'Destructure `url` from the handler parameter.',
				'Use `url.searchParams.get(\'search\')` to read the query parameter.',
				'Filter the items array based on the search value and return the result.'
			],
			conceptsTested: ['sveltekit.api.request']
		},
		{
			id: 'cp-2',
			description: 'Add custom headers to the response',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'headers' }]
				}
			},
			hints: [
				'Pass an options object as the second argument to `json()`.',
				'Include a `headers` object with your custom headers.',
				'Example: `json(data, { headers: { \'Cache-Control\': \'max-age=60\' } })`.'
			],
			conceptsTested: ['sveltekit.api.response']
		}
	]
};
