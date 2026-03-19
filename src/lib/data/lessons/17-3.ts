import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-3',
		title: '$app/server: getRequestEvent & read',
		phase: 5,
		module: 17,
		lessonIndex: 3
	},
	description: `SvelteKit's $app/server module provides two important server-only utilities. getRequestEvent() returns the current request event from anywhere in server-side code during request handling — useful for accessing cookies, headers, and locals from deeply nested utility functions without passing the event through every function call.

The read() function lets you access files from the server's filesystem in a platform-agnostic way. Together, these utilities enable patterns like auth guards in utility modules, reading uploaded files, and accessing configuration files — all while maintaining SvelteKit's portability across deployment platforms.`,
	objectives: [
		'Access the current request event with getRequestEvent() in server utilities',
		'Read cookies, headers, and locals without prop drilling the event',
		'Use read() for platform-agnostic file access on the server',
		'Understand server-only module restrictions and their security benefits'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Demonstrates $app/server concepts
  // These APIs only work on the server in real SvelteKit

  interface RequestEvent {
    cookies: Map<string, string>;
    request: { headers: Map<string, string>; method: string };
    locals: Record<string, unknown>;
    url: URL;
  }

  let simulatedEvent: RequestEvent | null = $state(null);
  let authResult: { authenticated: boolean; user?: string; role?: string } | null = $state(null);
  let fileContent: string | null = $state(null);
  let activeDemo: 'event' | 'auth' | 'read' = $state('event');

  function createMockEvent(authenticated: boolean): RequestEvent {
    const cookies = new Map<string, string>();
    const headers = new Map<string, string>();

    if (authenticated) {
      cookies.set('session', 'abc123-valid-token');
      headers.set('authorization', 'Bearer eyJhbG...');
    }
    headers.set('user-agent', 'Mozilla/5.0 (Demo Browser)');
    headers.set('accept-language', 'en-US,en;q=0.9');

    return {
      cookies,
      request: { headers, method: 'GET' },
      locals: { requestId: crypto.randomUUID().slice(0, 8) },
      url: new URL('https://example.com/dashboard'),
    };
  }

  function simulateGetRequestEvent(auth: boolean): void {
    simulatedEvent = createMockEvent(auth);
  }

  function simulateAuthGuard(): void {
    if (!simulatedEvent) {
      authResult = { authenticated: false };
      return;
    }

    const session = simulatedEvent.cookies.get('session');
    if (session) {
      authResult = {
        authenticated: true,
        user: 'alice@example.com',
        role: 'admin',
      };
      simulatedEvent.locals['user'] = authResult;
    } else {
      authResult = { authenticated: false };
    }
  }

  function simulateFileRead(filename: string): void {
    const mockFiles: Record<string, string> = {
      'config.json': JSON.stringify({ theme: 'dark', lang: 'en', version: '2.1.0' }, null, 2),
      'template.html': '<html>\\n  <body>\\n    <h1>{{title}}</h1>\\n    <p>{{content}}</p>\\n  </body>\\n</html>',
      'data.csv': 'name,email,role\\nAlice,alice@ex.com,admin\\nBob,bob@ex.com,user\\nCarol,carol@ex.com,editor',
    };
    fileContent = mockFiles[filename] ?? 'File not found';
  }
</script>

<h1>$app/server Utilities</h1>

<div class="tabs">
  <button class:active={activeDemo === 'event'} onclick={() => activeDemo = 'event'}>
    getRequestEvent()
  </button>
  <button class:active={activeDemo === 'auth'} onclick={() => activeDemo = 'auth'}>
    Auth Guard Pattern
  </button>
  <button class:active={activeDemo === 'read'} onclick={() => activeDemo = 'read'}>
    read()
  </button>
</div>

{#if activeDemo === 'event'}
  <section>
    <h2>getRequestEvent()</h2>
    <p>Access the current request from anywhere in server-side code.</p>

    <div class="controls">
      <button onclick={() => simulateGetRequestEvent(true)}>Simulate Authenticated Request</button>
      <button onclick={() => simulateGetRequestEvent(false)}>Simulate Anonymous Request</button>
    </div>

    {#if simulatedEvent}
      <div class="event-display">
        <div class="event-section">
          <h3>Cookies</h3>
          {#each Array.from(simulatedEvent.cookies.entries()) as [key, val]}
            <div class="kv"><span class="key">{key}</span><span class="val">{val}</span></div>
          {/each}
          {#if simulatedEvent.cookies.size === 0}
            <p class="none">No cookies</p>
          {/if}
        </div>

        <div class="event-section">
          <h3>Headers</h3>
          {#each Array.from(simulatedEvent.request.headers.entries()) as [key, val]}
            <div class="kv"><span class="key">{key}</span><span class="val">{val}</span></div>
          {/each}
        </div>

        <div class="event-section">
          <h3>Locals</h3>
          <pre>{JSON.stringify(Object.fromEntries(Object.entries(simulatedEvent.locals)), null, 2)}</pre>
        </div>
      </div>
    {/if}

    <pre class="code"><code>import &#123; getRequestEvent &#125; from '$app/server';

export function getUserLocale(): string &#123;
  const event = getRequestEvent();
  return event.request.headers.get('accept-language')
    ?? 'en-US';
&#125;</code></pre>
  </section>

{:else if activeDemo === 'auth'}
  <section>
    <h2>Auth Guard with getRequestEvent()</h2>
    <div class="controls">
      <button onclick={() => { simulateGetRequestEvent(true); simulateAuthGuard(); }}>
        Check Auth (with session)
      </button>
      <button onclick={() => { simulateGetRequestEvent(false); simulateAuthGuard(); }}>
        Check Auth (no session)
      </button>
    </div>

    {#if authResult}
      <div class="auth-result" class:success={authResult.authenticated} class:fail={!authResult.authenticated}>
        {#if authResult.authenticated}
          <h3>Authenticated</h3>
          <p>User: {authResult.user}</p>
          <p>Role: {authResult.role}</p>
        {:else}
          <h3>Not Authenticated</h3>
          <p>No valid session found. Redirect to login.</p>
        {/if}
      </div>
    {/if}

    <pre class="code"><code>// $lib/server/auth.ts
import &#123; getRequestEvent &#125; from '$app/server';

export function requireAuth() &#123;
  const event = getRequestEvent();
  const session = event.cookies.get('session');

  if (!session) &#123;
    throw redirect(303, '/login');
  &#125;

  return validateSession(session);
&#125;</code></pre>
  </section>

{:else}
  <section>
    <h2>read() — File Access</h2>
    <div class="controls">
      <button onclick={() => simulateFileRead('config.json')}>Read config.json</button>
      <button onclick={() => simulateFileRead('template.html')}>Read template.html</button>
      <button onclick={() => simulateFileRead('data.csv')}>Read data.csv</button>
    </div>

    {#if fileContent}
      <pre class="file-content"><code>{fileContent}</code></pre>
    {/if}

    <pre class="code"><code>import &#123; read &#125; from '$app/server';

export async function GET() &#123;
  const file = read('static/data.csv');
  const text = await file.text();
  return new Response(text);
&#125;</code></pre>
  </section>
{/if}

<style>
  h1 { color: #2d3436; }
  .tabs { display: flex; gap: 2px; margin-bottom: 1rem; }
  .tabs button {
    flex: 1; padding: 0.6rem; border: none; background: #dfe6e9;
    cursor: pointer; font-weight: 600; border-radius: 4px 4px 0 0;
  }
  .tabs button.active { background: #6c5ce7; color: white; }
  section { padding: 1rem; background: #f8f9fa; border-radius: 0 0 8px 8px; }
  h2 { margin-top: 0; color: #6c5ce7; font-size: 1.1rem; }
  h3 { font-size: 0.95rem; margin: 0.5rem 0 0.25rem; color: #2d3436; }
  .controls { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }
  button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #6c5ce7; color: white; cursor: pointer; font-weight: 600;
    font-size: 0.85rem;
  }
  .event-display { display: grid; gap: 0.75rem; margin-bottom: 1rem; }
  .event-section {
    padding: 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .kv {
    display: flex; gap: 0.5rem; padding: 0.2rem 0;
    font-family: monospace; font-size: 0.85rem;
  }
  .key { color: #6c5ce7; font-weight: 600; min-width: 120px; }
  .val { color: #636e72; word-break: break-all; }
  .none { color: #b2bec3; font-size: 0.85rem; }
  .auth-result { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
  .auth-result.success { background: #e8f8f0; border: 1px solid #00b894; }
  .auth-result.fail { background: #fff5f5; border: 1px solid #ff7675; }
  .auth-result h3 { margin-top: 0; }
  .auth-result.success h3 { color: #00b894; }
  .auth-result.fail h3 { color: #d63031; }
  .file-content {
    padding: 1rem; background: white; border: 1px solid #dfe6e9;
    border-radius: 6px; margin-bottom: 1rem; overflow-x: auto;
  }
  .code, pre { background: #2d3436; padding: 0.75rem; border-radius: 6px; overflow-x: auto; margin: 0; }
  code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
