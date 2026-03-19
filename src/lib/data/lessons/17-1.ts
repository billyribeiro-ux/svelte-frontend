import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-1',
		title: 'Hooks: handle, handleError, init',
		phase: 5,
		module: 17,
		lessonIndex: 1
	},
	description: `SvelteKit hooks are middleware functions that intercept requests and responses at the server level. The handle hook runs on every request, letting you modify the request, add data to event.locals (shared state for the request lifetime), protect routes, and transform responses.

handleError catches unexpected errors and lets you log them or return user-friendly error messages. The init hook runs once when the server starts, perfect for initializing database connections or configuration. Multiple handle functions can be composed with sequence() for clean middleware chains.`,
	objectives: [
		'Implement the handle hook for request middleware in hooks.server.ts',
		'Attach shared request data using event.locals',
		'Compose multiple handlers with sequence() for modular middleware',
		'Use handleError for centralized server error logging'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Simulating SvelteKit hooks concepts in a component
  // In real SvelteKit, these live in src/hooks.server.ts

  interface RequestEvent {
    url: string;
    method: string;
    locals: Record<string, unknown>;
    headers: Record<string, string>;
  }

  interface ResolveResult {
    status: number;
    body: string;
    headers: Record<string, string>;
  }

  let requests: { event: RequestEvent; result: ResolveResult; middleware: string[] }[] = $state([]);
  let showCode: 'handle' | 'sequence' | 'error' | 'init' = $state('handle');

  // Simulate handle hook
  async function simulateHandle(
    event: RequestEvent,
    resolve: (event: RequestEvent) => Promise<ResolveResult>
  ): Promise<ResolveResult> {
    const middlewareLog: string[] = [];

    // Auth middleware
    if (event.url.startsWith('/admin')) {
      if (!event.headers['authorization']) {
        middlewareLog.push('Auth: Blocked (no token)');
        return { status: 401, body: 'Unauthorized', headers: {} };
      }
      middlewareLog.push('Auth: Passed');
    }

    // Logging middleware
    middlewareLog.push(\`Logger: \${event.method} \${event.url}\`);

    // Set locals (shared request state)
    event.locals['requestId'] = crypto.randomUUID().slice(0, 8);
    event.locals['timestamp'] = new Date().toISOString();
    middlewareLog.push(\`Locals: requestId=\${event.locals['requestId']}\`);

    const result = await resolve(event);
    middlewareLog.push(\`Response: \${result.status}\`);

    requests = [{ event, result, middleware: middlewareLog }, ...requests].slice(0, 5);
    return result;
  }

  async function mockResolve(event: RequestEvent): Promise<ResolveResult> {
    // Simulate route resolution
    if (event.url === '/api/error') {
      throw new Error('Database connection failed');
    }
    return {
      status: 200,
      body: \`Response for \${event.url}\`,
      headers: { 'content-type': 'text/html' },
    };
  }

  async function simulateRequest(url: string, method: string = 'GET', auth: boolean = false): Promise<void> {
    const event: RequestEvent = {
      url,
      method,
      locals: {},
      headers: auth ? { authorization: 'Bearer token123' } : {},
    };

    try {
      await simulateHandle(event, mockResolve);
    } catch (e) {
      // handleError would catch this
      requests = [{
        event,
        result: { status: 500, body: (e as Error).message, headers: {} },
        middleware: [\`handleError: \${(e as Error).message}\`],
      }, ...requests].slice(0, 5);
    }
  }

  const codeExamples: Record<string, string> = {
    handle: \`// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Runs on EVERY server request
  const start = Date.now();

  // Add data to event.locals
  event.locals.user = await getUserFromSession(
    event.cookies.get('session')
  );

  // Resolve the request (run the route)
  const response = await resolve(event);

  // Modify response if needed
  console.log(\\\`\\\${event.request.method} \\\${event.url.pathname} - \\\${Date.now() - start}ms\\\`);

  return response;
};\`,

    sequence: \`// Compose multiple handlers
import { sequence } from '@sveltejs/kit/hooks';

const auth: Handle = async ({ event, resolve }) => {
  event.locals.user = await getUser(event);
  return resolve(event);
};

const logger: Handle = async ({ event, resolve }) => {
  console.log(event.url.pathname);
  return resolve(event);
};

// Runs auth first, then logger
export const handle = sequence(auth, logger);\`,

    error: \`// Handle unexpected errors
export const handleError: HandleServerError = async ({
  error, event, status, message
}) => {
  const errorId = crypto.randomUUID();
  console.error(errorId, error);

  // Report to error tracking service
  await reportToSentry(error, { errorId });

  return {
    message: 'An unexpected error occurred',
    errorId
  };
};\`,

    init: \`// Runs once when the server starts
export const init: ServerInit = async () => {
  // Initialize database connection
  await db.connect();

  // Load configuration
  await config.load();

  console.log('Server initialized');
};\`,
  };
</script>

<h1>SvelteKit Hooks</h1>

<section>
  <h2>Simulate Request Pipeline</h2>
  <div class="request-buttons">
    <button onclick={() => simulateRequest('/home')}>GET /home</button>
    <button onclick={() => simulateRequest('/about')}>GET /about</button>
    <button onclick={() => simulateRequest('/admin')}>GET /admin (no auth)</button>
    <button onclick={() => simulateRequest('/admin', 'GET', true)}>GET /admin (with auth)</button>
    <button onclick={() => simulateRequest('/api/data', 'POST')}>POST /api/data</button>
    <button class="danger" onclick={() => simulateRequest('/api/error')}>GET /api/error (throws)</button>
  </div>

  {#if requests.length > 0}
    <div class="request-log">
      {#each requests as req, i}
        <div class="request-entry" class:error={req.result.status >= 400}>
          <div class="req-header">
            <span class="method">{req.event.method}</span>
            <span class="url">{req.event.url}</span>
            <span class="status" class:ok={req.result.status < 400}>{req.result.status}</span>
          </div>
          <div class="middleware-log">
            {#each req.middleware as step}
              <div class="step">{step}</div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>Hook Examples</h2>
  <div class="code-tabs">
    {#each ['handle', 'sequence', 'error', 'init'] as tab}
      <button class:active={showCode === tab} onclick={() => showCode = tab as typeof showCode}>
        {tab === 'error' ? 'handleError' : tab}
      </button>
    {/each}
  </div>
  <pre class="code"><code>{codeExamples[showCode]}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.1rem; }
  .request-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
    font-size: 0.85rem;
  }
  button:hover { opacity: 0.9; }
  button.danger { background: #d63031; }
  .code-tabs { display: flex; gap: 2px; margin-bottom: 0; }
  .code-tabs button {
    border-radius: 4px 4px 0 0; background: #dfe6e9; color: #636e72;
  }
  .code-tabs button.active { background: #2d3436; color: #dfe6e9; }
  .request-log { display: flex; flex-direction: column; gap: 0.5rem; }
  .request-entry {
    padding: 0.75rem; background: white; border-radius: 6px;
    border-left: 3px solid #00b894;
  }
  .request-entry.error { border-left-color: #d63031; }
  .req-header { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem; }
  .method {
    font-weight: 700; font-size: 0.8rem; padding: 0.15rem 0.4rem;
    background: #6c5ce7; color: white; border-radius: 3px;
  }
  .url { font-family: monospace; color: #2d3436; }
  .status {
    margin-left: auto; font-weight: 700; padding: 0.15rem 0.5rem;
    border-radius: 3px; background: #ff7675; color: white; font-size: 0.85rem;
  }
  .status.ok { background: #00b894; }
  .middleware-log { padding-left: 0.5rem; border-left: 2px solid #dfe6e9; }
  .step { font-family: monospace; font-size: 0.8rem; color: #636e72; padding: 0.1rem 0; }
  .code {
    padding: 1rem; background: #2d3436; border-radius: 0 6px 6px 6px;
    overflow-x: auto; margin-top: 0;
  }
  code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
