import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-3',
		title: '$app/server: getRequestEvent & read',
		phase: 5,
		module: 17,
		lessonIndex: 3
	},
	description: `$app/server is a SvelteKit 2 module that exposes server-only helpers you can call from any server code — not just load functions or endpoints. The two stars of the show are getRequestEvent() and read().

getRequestEvent() returns the current RequestEvent inside an async context. This means you can write reusable server utilities (auth guards, audit loggers, i18n resolvers) that access cookies, locals, the URL, and headers WITHOUT having to thread event through every function call. It's the SvelteKit equivalent of AsyncLocalStorage — when you call a helper from inside a load function or endpoint, it transparently sees the request.

read() takes an import URL of an asset (an image, a font, a static file) imported with ?url and returns a Response containing the asset's bytes. This works during SSR, prerendering, and in deployed environments — SvelteKit transparently handles filesystem vs CDN. It's perfect for generating social card images, reading JSON fixtures on the server, or building dynamic manifests.`,
	objectives: [
		'Use getRequestEvent() to access the current RequestEvent from helper modules',
		'Build a reusable requireUser() auth guard that throws 401 without passing event',
		'Read files with read(asset) where asset comes from ?url imports',
		'Generate dynamic responses (images, JSON manifests) from static inputs',
		'Understand the async context boundary of getRequestEvent'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // Visual walkthrough of $app/server APIs.
  // In a real SvelteKit 2 project:
  //   import { getRequestEvent, read } from '$app/server';
  //
  // These APIs only work in SERVER code (hooks.server.ts,
  // +page.server.ts, +server.ts, lib/server/*.ts).
  // ============================================================

  type DemoEvent = {
    locals: { user: { id: string; email: string; role: 'admin' | 'user' } | null };
    cookies: { session?: string };
    url: string;
    headers: Record<string, string>;
  };

  type CallLog = {
    id: number;
    helper: string;
    result: string;
    ok: boolean;
  };

  let logs: CallLog[] = $state([]);
  let logId: number = $state(0);
  let scenario: 'anon' | 'user' | 'admin' = $state('anon');

  const scenarios: Record<typeof scenario, DemoEvent> = {
    anon: {
      locals: { user: null },
      cookies: {},
      url: '/dashboard',
      headers: { 'user-agent': 'Mozilla/5.0' }
    },
    user: {
      locals: { user: { id: 'u42', email: 'alice@example.com', role: 'user' } },
      cookies: { session: 'sess_abc' },
      url: '/dashboard',
      headers: { 'user-agent': 'Mozilla/5.0' }
    },
    admin: {
      locals: { user: { id: 'u1', email: 'root@example.com', role: 'admin' } },
      cookies: { session: 'sess_root' },
      url: '/admin/users',
      headers: { 'user-agent': 'Mozilla/5.0' }
    }
  };

  // Simulated async context — the real thing uses AsyncLocalStorage
  let currentEvent: DemoEvent | null = null;
  function getRequestEvent(): DemoEvent {
    if (!currentEvent) throw new Error('Called outside a request');
    return currentEvent;
  }

  // Reusable helpers that use getRequestEvent — no event param!
  function requireUser(): DemoEvent['locals']['user'] {
    const event = getRequestEvent();
    if (!event.locals.user) {
      const err = new Error('401 Unauthorized');
      (err as Error & { status: number }).status = 401;
      throw err;
    }
    return event.locals.user;
  }

  function requireAdmin(): DemoEvent['locals']['user'] {
    const user = requireUser();
    if (user?.role !== 'admin') {
      const err = new Error('403 Forbidden');
      (err as Error & { status: number }).status = 403;
      throw err;
    }
    return user;
  }

  function getClientIp(): string {
    const event = getRequestEvent();
    return event.headers['x-forwarded-for'] ?? '127.0.0.1';
  }

  // Simulated read() — in real code, returns a Response
  const fakeAssets: Record<string, { type: string; size: number; preview: string }> = {
    '/fonts/Inter.woff2': { type: 'font/woff2', size: 84200, preview: '(binary font data)' },
    '/data/cities.json': { type: 'application/json', size: 2100, preview: '[{"name":"Tokyo","pop":37.4},...]' },
    '/images/logo.svg': { type: 'image/svg+xml', size: 540, preview: '<svg xmlns="..." viewBox="0 0 32 32">...</svg>' }
  };

  function read(asset: string): { type: string; size: number; preview: string } {
    const a = fakeAssets[asset];
    if (!a) throw new Error(\`Asset not found: \${asset}\`);
    return a;
  }

  // Run a helper inside a "request"
  function runIn(name: string, fn: () => string): void {
    currentEvent = scenarios[scenario];
    try {
      const result = fn();
      logs = [{ id: logId++, helper: name, result, ok: true }, ...logs].slice(0, 8);
    } catch (e) {
      logs = [{ id: logId++, helper: name, result: (e as Error).message, ok: false }, ...logs].slice(0, 8);
    } finally {
      currentEvent = null;
    }
  }

  function callRequireUser(): void {
    runIn('requireUser()', () => {
      const user = requireUser();
      return \`OK — \${user?.email}\`;
    });
  }
  function callRequireAdmin(): void {
    runIn('requireAdmin()', () => {
      const user = requireAdmin();
      return \`OK — \${user?.email}\`;
    });
  }
  function callGetIp(): void {
    runIn('getClientIp()', () => getClientIp());
  }
  function callGetEvent(): void {
    runIn('getRequestEvent()', () => {
      const e = getRequestEvent();
      return \`\${e.url} — user=\${e.locals.user?.email ?? 'none'}\`;
    });
  }

  let selectedAsset: keyof typeof fakeAssets = $state('/data/cities.json');
  let readResult: { type: string; size: number; preview: string } | null = $state(null);
  function callRead(): void {
    try {
      readResult = read(selectedAsset);
    } catch (e) {
      logs = [
        { id: logId++, helper: \`read('\${selectedAsset}')\`, result: (e as Error).message, ok: false },
        ...logs
      ].slice(0, 8);
      readResult = null;
    }
  }
</script>

<h1>$app/server: getRequestEvent &amp; read</h1>

<section>
  <h2>getRequestEvent() — ambient access from helpers</h2>
  <p class="note">
    Pick a request scenario, then call helpers. Notice: the helpers never
    receive <code>event</code> as an argument — they grab it from async
    context. This is exactly how SvelteKit 2 works on the server.
  </p>

  <div class="scenario">
    {#each Object.keys(scenarios) as s (s)}
      <button
        class:active={scenario === s}
        onclick={() => (scenario = s as typeof scenario)}
      >
        {s}
      </button>
    {/each}
  </div>

  <div class="event-box">
    <strong>Active event</strong>
    <pre>{JSON.stringify(scenarios[scenario], null, 2)}</pre>
  </div>

  <div class="helpers">
    <button onclick={callGetEvent}>getRequestEvent()</button>
    <button onclick={callRequireUser}>requireUser()</button>
    <button onclick={callRequireAdmin}>requireAdmin()</button>
    <button onclick={callGetIp}>getClientIp()</button>
  </div>

  {#if logs.length > 0}
    <div class="log">
      {#each logs as entry (entry.id)}
        <div class="log-entry" class:ok={entry.ok} class:fail={!entry.ok}>
          <code>{entry.helper}</code>
          <span>{entry.result}</span>
        </div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>read() — load static assets on the server</h2>
  <p class="note">
    <code>read(asset)</code> takes a URL imported from a static file and
    returns a Response with its bytes. Use cases: OG image generation,
    JSON fixtures, server-side PDF assembly.
  </p>

  <div class="asset-picker">
    {#each Object.keys(fakeAssets) as path (path)}
      <button
        class:active={selectedAsset === path}
        onclick={() => (selectedAsset = path as keyof typeof fakeAssets)}
      >
        {path.split('/').pop()}
      </button>
    {/each}
    <button class="primary" onclick={callRead}>read(asset)</button>
  </div>

  {#if readResult}
    <div class="asset-result">
      <div class="row"><span>Content-Type:</span> <code>{readResult.type}</code></div>
      <div class="row"><span>Size:</span> <code>{readResult.size.toLocaleString()} bytes</code></div>
      <div class="row"><span>Preview:</span></div>
      <pre class="preview">{readResult.preview}</pre>
    </div>
  {/if}
</section>

<section>
  <h2>Real code</h2>
  <pre class="code"><code>{\`// src/lib/server/auth.ts
import { getRequestEvent } from '$app/server';
import { error, redirect } from '@sveltejs/kit';

// Reusable from load functions, endpoints, or other server code.
// No need to pass \\\`event\\\` around.
export function requireUser() {
  const { locals, url } = getRequestEvent();
  if (!locals.user) {
    redirect(303, \\\`/login?redirect=\\\${url.pathname}\\\`);
  }
  return locals.user;
}

export function requireAdmin() {
  const user = requireUser();
  if (user.role !== 'admin') error(403, 'Forbidden');
  return user;
}

// src/routes/dashboard/+page.server.ts
import { requireUser } from '$lib/server/auth';

export const load = async () => {
  const user = requireUser(); // no event arg!
  return { user };
};

// src/routes/og/[slug]/+server.ts
import { read } from '$app/server';
import template from '$lib/og-template.png?url';

export const GET = async ({ params }) => {
  // read() returns a Response with the asset bytes
  const bg = await read(template).arrayBuffer();

  const png = await renderOgImage(bg, params.slug);

  return new Response(png, {
    headers: { 'content-type': 'image/png' }
  });
};

// Works with any asset imported via ?url
import cities from '$lib/data/cities.json?url';
const response = read(cities);
const data = await response.json();
\`}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #00b894; font-size: 1.05rem; }
  .note { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem; }
  .note code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  .scenario { display: flex; gap: 0.25rem; margin-bottom: 0.5rem; }
  .scenario button, .asset-picker button, .helpers button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #dfe6e9; color: #2d3436; cursor: pointer;
    font-weight: 600; font-size: 0.85rem;
  }
  .scenario button.active, .asset-picker button.active {
    background: #00b894; color: white;
  }
  .event-box {
    background: white; padding: 0.75rem; border-radius: 6px;
    border: 1px solid #dfe6e9; margin-bottom: 0.75rem;
  }
  .event-box strong { font-size: 0.8rem; color: #2d3436; }
  .event-box pre {
    margin: 0.3rem 0 0; font-size: 0.75rem; color: #636e72;
    overflow-x: auto; font-family: monospace;
  }
  .helpers { display: flex; gap: 0.25rem; flex-wrap: wrap; }
  .helpers button { background: #0984e3; color: white; font-family: monospace; }
  .log {
    margin-top: 0.75rem; background: white; border-radius: 6px;
    padding: 0.5rem; border: 1px solid #dfe6e9;
  }
  .log-entry {
    display: flex; gap: 0.75rem; padding: 0.25rem 0.5rem;
    font-size: 0.8rem; border-left: 3px solid;
    margin-bottom: 0.25rem; border-radius: 2px;
  }
  .log-entry.ok {
    border-color: #00b894; background: #f0fff4;
  }
  .log-entry.fail {
    border-color: #d63031; background: #fff5f5;
  }
  .log-entry code {
    font-family: monospace; color: #2d3436;
    font-weight: 600; white-space: nowrap;
  }
  .asset-picker {
    display: flex; gap: 0.25rem; flex-wrap: wrap; margin-bottom: 0.75rem;
  }
  .asset-picker .primary { background: #00b894; color: white; margin-left: auto; }
  .asset-result {
    background: white; padding: 0.75rem; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .row {
    display: flex; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.2rem;
  }
  .row span { color: #636e72; min-width: 110px; }
  .row code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  .preview {
    padding: 0.5rem; background: #2d3436; color: #dfe6e9;
    border-radius: 4px; font-size: 0.75rem; overflow-x: auto;
    margin: 0.3rem 0 0; font-family: monospace;
  }
  .code {
    padding: 1rem; background: #2d3436; border-radius: 6px;
    overflow-x: auto; margin: 0;
  }
  .code code { color: #dfe6e9; font-size: 0.8rem; line-height: 1.5; font-family: monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
