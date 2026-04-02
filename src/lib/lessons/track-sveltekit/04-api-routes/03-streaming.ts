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

## Why Streaming Changes the User Experience

Traditional HTTP responses are atomic -- the server computes the entire response, then sends it all at once. For fast operations this is fine. But some operations are inherently slow or incremental:

- **AI/LLM text generation** -- tokens are produced one at a time over seconds
- **Large data exports** -- CSV or JSON files with millions of rows
- **Real-time feeds** -- stock prices, chat messages, live notifications
- **Long-running computations** -- progress updates for multi-step processes

Without streaming, the user stares at a blank screen (or a loading spinner) until the entire response is ready. With streaming, they see results appear incrementally. For AI-generated text, this is the difference between a 10-second wait and text that appears to "type" in real time.

## ReadableStream: The Streaming Primitive

The Web Streams API provides \`ReadableStream\`, the fundamental building block for streaming in SvelteKit. You create a stream, enqueue chunks of data, and return it as a \`Response\` body:

\`\`\`typescript
export const GET: RequestHandler = async () => {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // start() is called once when the stream begins
      for (const chunk of ['Hello', ' World', '!']) {
        controller.enqueue(encoder.encode(chunk));
        await new Promise(r => setTimeout(r, 500));
      }
      controller.close(); // Signal that the stream is done
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain' }
  });
};
\`\`\`

The key concepts:
- **\`controller.enqueue(data)\`** -- push a chunk of data into the stream. The data must be a \`Uint8Array\` (use \`TextEncoder\` to convert strings).
- **\`controller.close()\`** -- signal that no more data will be sent. The client sees the stream end.
- **\`controller.error(err)\`** -- signal that an error occurred. The client's reader will reject.

## Server-Sent Events (SSE): Persistent Connections

SSE is a Web standard for server-to-client push over HTTP. Unlike WebSockets, SSE is unidirectional (server to client only), uses standard HTTP, works through proxies and load balancers, and automatically reconnects on disconnection.

The protocol is simple: the response has Content-Type \`text/event-stream\`, and each event is formatted as lines starting with \`data:\`:

\`\`\`typescript
export const GET: RequestHandler = async () => {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        const event = \`data: \${JSON.stringify({ count, time: Date.now() })}\\n\\n\`;
        controller.enqueue(encoder.encode(event));

        if (count >= 10) {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
};
\`\`\`

**SSE event format rules:**
- Each event ends with two newlines (\`\\n\\n\`)
- Data lines start with \`data: \`
- You can include event names: \`event: notification\\ndata: {...}\\n\\n\`
- You can include IDs for reconnection: \`id: 42\\ndata: {...}\\n\\n\`

**Client-side consumption with EventSource:**
\`\`\`typescript
const source = new EventSource('/api/events');

source.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

source.onerror = () => {
  // EventSource automatically reconnects
};

// Clean up when done
source.close();
\`\`\`

Or using the fetch API for more control:
\`\`\`typescript
const response = await fetch('/api/stream');
const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value);
  // Process the chunk
}
\`\`\`

## Streaming in the SSR Context

Streaming responses interact with SvelteKit's SSR in specific ways:

1. **Streaming endpoints are server-only.** They are \`+server.ts\` files, so they always run on the server. The client consumes the stream via fetch.
2. **They bypass the normal render pipeline.** Unlike load functions (which feed data into component rendering), streaming endpoints return raw Response objects. SvelteKit does not process the response body.
3. **Adapter compatibility varies.** Not all deployment targets support streaming equally. Node.js and Deno support it natively. Some serverless platforms (like AWS Lambda) buffer the entire response before sending. Cloudflare Workers support streaming. Check your adapter's documentation.

## Streaming Load Data with Promises

SvelteKit also supports streaming at the load function level. Return a promise in your load function data, and SvelteKit will stream the page -- rendering available data immediately and filling in the promise result when it resolves:

\`\`\`typescript
// +page.server.ts
export const load = async () => {
  return {
    fastData: await getQuickData(),           // available immediately
    slowData: getSlowData()                   // promise -- streamed when ready
  };
};
\`\`\`

In the component, use \`{#await}\` to handle the streaming promise:
\`\`\`svelte
<h1>{data.fastData.title}</h1>

{#await data.slowData}
  <p>Loading recommendations...</p>
{:then recommendations}
  <ul>
    {#each recommendations as rec}
      <li>{rec.title}</li>
    {/each}
  </ul>
{/await}
\`\`\`

This is particularly powerful for pages where some data is fast (page title, layout) and other data is slow (recommendations, analytics). The user sees the fast content immediately while the slow content streams in.

## Decision Framework: When to Stream

**Use ReadableStream when:**
- You generate data incrementally (AI text, large exports)
- You need fine-grained control over chunk timing
- The client needs to process data as it arrives

**Use SSE when:**
- You need persistent server-to-client push (notifications, live updates)
- You want automatic reconnection (built into EventSource)
- You need named events with different handlers

**Use streaming promises in load functions when:**
- Some data is fast and some is slow
- You want the page to render progressively
- You do not need fine-grained streaming -- just "fast data now, slow data later"

**Use WebSockets (via a separate server or adapter-specific APIs) when:**
- You need bidirectional communication
- You need sub-millisecond latency
- You are building real-time collaboration features`
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
