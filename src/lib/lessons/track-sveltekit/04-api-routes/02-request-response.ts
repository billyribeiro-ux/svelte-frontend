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

SvelteKit API routes use the standard Web \`Request\` and \`Response\` APIs. You can parse URL search params, read headers, handle different content types, and set response headers.

The \`json()\` helper is convenient, but you can also construct \`Response\` objects directly for full control.`
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
