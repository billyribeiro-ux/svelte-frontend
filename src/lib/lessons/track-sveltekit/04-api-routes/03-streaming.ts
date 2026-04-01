import type { Lesson } from '$types/lesson';

export const streaming: Lesson = {
	id: 'sveltekit.api-routes.streaming',
	slug: 'streaming',
	title: 'Streaming Responses',
	description: 'Stream data to the client with ReadableStream and Server-Sent Events.',
	trackId: 'sveltekit',
	moduleId: 'api-routes',
	order: 3,
	estimatedMinutes: 15,
	concepts: ['sveltekit.api.streaming', 'sveltekit.api.sse'],
	prerequisites: ['sveltekit.api.endpoints'],

	content: [
		{
			type: 'text',
			content: `# Streaming Responses

Sometimes you need to send data incrementally — live updates, progress indicators, or AI-generated text. SvelteKit supports streaming by returning a \`Response\` with a \`ReadableStream\` body.

You can also implement **Server-Sent Events (SSE)** for real-time push notifications from server to client.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.api.streaming'
		},
		{
			type: 'text',
			content: `## Creating a Streaming Endpoint

Use \`ReadableStream\` to create a stream that sends data in chunks.

**Your task:** Create an endpoint that streams text chunks with a delay between each.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Server-Sent Events

SSE uses a special \`text/event-stream\` content type. Each event is formatted as \`data: ...\` followed by two newlines.

**Task:** Create an SSE endpoint that sends periodic updates to connected clients.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'api/stream/+server.ts',
			path: '/api/stream/+server.ts',
			language: 'typescript',
			content: `import type { RequestHandler } from './$types';

// TODO: Create a GET handler that returns a ReadableStream
export const GET: RequestHandler = async () => {
  return new Response('Not yet implemented');
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let output = $state('');

  async function startStream() {
    output = '';
    const res = await fetch('/api/stream');
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output += decoder.decode(value);
    }
  }
</script>

<h1>Streaming Demo</h1>

<button onclick={startStream}>Start Stream</button>

<pre>{output}</pre>`
		}
	],

	solutionFiles: [
		{
			name: 'api/stream/+server.ts',
			path: '/api/stream/+server.ts',
			language: 'typescript',
			content: `import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const encoder = new TextEncoder();
  const chunks = ['Hello', ' from', ' a', ' streaming', ' response!'];

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, 500));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked'
    }
  });
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let output = $state('');

  async function startStream() {
    output = '';
    const res = await fetch('/api/stream');
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output += decoder.decode(value);
    }
  }
</script>

<h1>Streaming Demo</h1>

<button onclick={startStream}>Start Stream</button>

<pre>{output}</pre>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a streaming endpoint with ReadableStream',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'ReadableStream' },
						{ type: 'contains', value: 'controller' }
					]
				}
			},
			hints: [
				'Create a `new ReadableStream({ start(controller) { ... } })`.',
				'Use `controller.enqueue()` to send each chunk of data.',
				'Call `controller.close()` when done, and return `new Response(stream)`.'
			],
			conceptsTested: ['sveltekit.api.streaming']
		},
		{
			id: 'cp-2',
			description: 'Set proper content type headers for streaming',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'Content-Type' }]
				}
			},
			hints: [
				'For plain text streaming, set `Content-Type: text/plain`.',
				'For SSE, set `Content-Type: text/event-stream`.',
				'Pass headers as the second argument to `new Response(stream, { headers: { ... } })`.'
			],
			conceptsTested: ['sveltekit.api.sse']
		}
	]
};
