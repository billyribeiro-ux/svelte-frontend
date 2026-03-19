import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-3',
		title: '$app/server: getRequestEvent & read',
		phase: 5,
		module: 17,
		lessonIndex: 3
	},
	description: `SvelteKit's $app/server module provides two powerful server-only utilities. getRequestEvent() returns the current request event from within any server-side function — not just load or actions — making it invaluable for building auth guards, permission checks, and utility functions that need access to cookies, locals, or headers. The read() function converts imported assets into Response objects, enabling you to serve files from your project at runtime.

These utilities bridge the gap between SvelteKit's request lifecycle and your own server-side utility functions, keeping your code clean and decoupled.`,
	objectives: [
		'Use getRequestEvent() to access the request context from any server function',
		'Build reusable auth guards and permission checks with getRequestEvent()',
		'Serve imported assets as Response objects with read()',
		'Understand the server-only boundary and when these APIs are available'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // $app/server APIs — server-only utilities reference

  interface ApiCard {
    name: string;
    signature: string;
    description: string;
    example: string;
    useCase: string;
  }

  let activeApi = $state<string>('getRequestEvent');

  const apis: ApiCard[] = [
    {
      name: 'getRequestEvent',
      signature: 'getRequestEvent(): RequestEvent',
      description: 'Returns the current RequestEvent from anywhere in server-side code during a request. This means your utility functions can access cookies, locals, url, and headers without passing them explicitly.',
      useCase: 'Auth guards, permission checks, logging utilities, feature flags',
      example: \`// src/lib/server/auth.ts
import { getRequestEvent } from '$app/server';
import { redirect } from '@sveltejs/kit';

export function requireAuth() {
  const event = getRequestEvent();
  const user = event.locals.user;

  if (!user) {
    redirect(303, '/login');
  }

  return user;
}

export function requireRole(role: string) {
  const user = requireAuth();
  const event = getRequestEvent();

  if (user.role !== role) {
    redirect(303, '/unauthorized');
  }

  return user;
}

export function getClientIP() {
  const event = getRequestEvent();
  return event.request.headers.get('x-forwarded-for')
    ?? event.getClientAddress();
}

// Usage in +page.server.ts — no need to pass event!
// import { requireAuth } from '$lib/server/auth';
//
// export const load = async () => {
//   const user = requireAuth(); // Just works!
//   return { user };
// };\`
    },
    {
      name: 'read',
      signature: 'read(asset: string): Response',
      description: 'Takes an imported asset and returns it as a Response object. Useful when you need to serve static files from API routes or manipulate file contents on the server. The asset must be imported using a Vite import.',
      useCase: 'Serving PDFs, generating dynamic images, streaming files from API routes',
      example: \`// src/routes/api/resume/+server.ts
import { read } from '$app/server';
import resume from '$lib/assets/resume.pdf';

export function GET() {
  // read() converts the imported asset to a Response
  return read(resume);
}

// Another example: serve a dynamically chosen asset
// src/routes/api/docs/[slug]/+server.ts
import terms from '$lib/docs/terms.pdf';
import privacy from '$lib/docs/privacy.pdf';
import { error } from '@sveltejs/kit';

const docs: Record<string, string> = { terms, privacy };

export function GET({ params }) {
  const asset = docs[params.slug];
  if (!asset) error(404, 'Document not found');

  return read(asset);
}

// Works with images too
import logo from '$lib/assets/logo.png';

export function GET() {
  return read(logo);
  // Content-Type is automatically set based on the file
}\`
    },
    {
      name: 'Pattern: Auth Middleware',
      signature: 'Composing getRequestEvent with utilities',
      description: 'By combining getRequestEvent with reusable utility functions, you can build a clean middleware-like pattern without passing the event object through every function call.',
      useCase: 'Clean architecture, dependency injection alternative',
      example: \`// src/lib/server/db.ts
import { getRequestEvent } from '$app/server';

// Automatic tenant isolation using request context
export function getTenantDB() {
  const event = getRequestEvent();
  const tenantId = event.locals.user?.tenantId;

  if (!tenantId) throw new Error('No tenant context');

  return db.forTenant(tenantId);
}

// src/lib/server/features.ts
export function isFeatureEnabled(flag: string): boolean {
  const event = getRequestEvent();
  const user = event.locals.user;

  // Check user-specific feature flags
  return featureFlags.check(flag, {
    userId: user?.id,
    plan: user?.plan,
    region: event.request.headers.get('cf-ipcountry')
  });
}

// src/routes/dashboard/+page.server.ts
import { requireAuth } from '$lib/server/auth';
import { getTenantDB } from '$lib/server/db';
import { isFeatureEnabled } from '$lib/server/features';

export const load = async () => {
  const user = requireAuth();
  const db = getTenantDB();

  return {
    stats: await db.getStats(),
    showBeta: isFeatureEnabled('beta-dashboard')
  };
};\`
    }
  ];

  let activeData = $derived(apis.find(a => a.name === activeApi)!);
</script>

<main>
  <h1>$app/server: getRequestEvent & read</h1>
  <p class="subtitle">Server-only utilities for accessing request context and serving assets</p>

  <div class="warning-banner">
    These APIs are <strong>server-only</strong> — they can only be used in +page.server.ts, +server.ts, hooks.server.ts, or files inside $lib/server/.
  </div>

  <div class="api-tabs">
    {#each apis as api}
      <button
        class={['api-tab', activeApi === api.name && 'active']}
        onclick={() => activeApi = api.name}
      >
        {api.name}
      </button>
    {/each}
  </div>

  <div class="api-detail">
    <div class="api-header">
      <code class="signature">{activeData.signature}</code>
    </div>
    <p class="api-desc">{activeData.description}</p>
    <div class="use-case">
      <strong>Common use cases:</strong> {activeData.useCase}
    </div>
    <h3>Example</h3>
    <pre><code>{activeData.example}</code></pre>
  </div>
</main>

<style>
  main { max-width: 850px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  h1 { text-align: center; color: #333; }
  h3 { color: #555; margin-bottom: 0.5rem; }
  .subtitle { text-align: center; color: #666; }

  .warning-banner {
    background: #fff3e0; border: 1px solid #ffcc80; border-radius: 8px;
    padding: 0.75rem 1rem; margin: 1.5rem 0; color: #e65100; font-size: 0.9rem;
  }

  .api-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .api-tab {
    padding: 0.5rem 1rem; border: 1px solid #ddd; border-radius: 20px;
    background: white; cursor: pointer; font-size: 0.85rem;
  }
  .api-tab.active { background: #7b1fa2; color: white; border-color: #7b1fa2; }

  .api-detail { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; }
  .api-header { margin-bottom: 1rem; }
  .signature {
    background: #f3e5f5; color: #7b1fa2; padding: 0.4rem 0.75rem;
    border-radius: 6px; font-size: 0.9rem; font-family: 'Fira Code', monospace;
  }
  .api-desc { color: #555; line-height: 1.6; }
  .use-case {
    background: #e8f5e9; padding: 0.5rem 0.75rem; border-radius: 6px;
    font-size: 0.85rem; color: #2e7d32; margin-bottom: 1rem;
  }

  pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; font-size: 0.78rem; overflow-x: auto; }
  code { font-family: 'Fira Code', monospace; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
