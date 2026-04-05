import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-6',
		title: 'Error Pages & <svelte:boundary>',
		phase: 3,
		module: 11,
		lessonIndex: 6
	},
	description: `Errors are inevitable — network failures, invalid data, bugs. SvelteKit gives you three complementary tools for handling them:

1. <svelte:boundary> — Svelte 5's component-level error boundary. Catches runtime errors in child components and renders a failed snippet with a reset function.
2. +error.svelte — SvelteKit's route-level error page. Catches errors thrown from load functions, form actions, or (with handleRenderingErrors) rendering.
3. handleError hook — the lowest-level catch-all in hooks.server.ts and hooks.client.ts for logging and transforming errors into App.Error.

Boundaries nest: an inner boundary catches errors first, and only unhandled errors propagate out. As of SvelteKit 2.54 and Svelte 5.53, error boundaries can catch rendering errors on the SERVER as well. Enable the experimental.handleRenderingErrors flag in svelte.config.js.

The end of the lesson lists 4-6 common pitfalls and pro tips to help you avoid the traps students most often hit.`,
	objectives: [
		'Use <svelte:boundary> to catch and handle component errors',
		'Render a fallback UI with the failed snippet',
		'Use the reset function to retry after an error',
		'Nest boundaries so granular failures do not take down the whole page',
		'Distinguish expected errors (error(404)) from unexpected ones',
		'Wire up +error.svelte at multiple route levels',
		'Use the handleError hook for logging and App.Error shaping',
		'Enable handleRenderingErrors for server-side error boundaries (kit@2.54)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let widgetAError: boolean = $state(false);
  let widgetBError: boolean = $state(false);
  let outerError: boolean = $state(false);
  let errorCount: number = $state(0);

  function riskyWidget(label: string, shouldFail: boolean): string {
    if (shouldFail) {
      throw new Error(\`Widget "\${label}" failed (#\${++errorCount})\`);
    }
    return \`Widget \${label}: OK\`;
  }
</script>

<main>
  <h1>Error Pages & &lt;svelte:boundary&gt;</h1>

  <section>
    <h2>&lt;svelte:boundary&gt; — Component Error Boundaries</h2>
    <pre>{\`<!-- Catches errors thrown during render or in effects of child components -->
<svelte:boundary onerror={(err, reset) => console.error(err)}>
  <RiskyComponent />

  {#snippet failed(error, reset)}
    <p>Error: {(error as Error).message}</p>
    <button onclick={reset}>Try Again</button>
  {/snippet}
</svelte:boundary>\`}</pre>
    <p class="callout">
      The <code>failed</code> snippet receives <code>(error, reset)</code>.
      Calling <code>reset()</code> re-creates the boundary's children from
      scratch. An optional <code>onerror</code> handler fires for every caught
      error — perfect for reporting to Sentry.
    </p>
  </section>

  <section>
    <h2>Single Boundary Demo</h2>
    <label>
      <input type="checkbox" bind:checked={outerError} />
      Enable error in outer boundary
    </label>

    <svelte:boundary>
      <div class="safe-zone">
        <p>Result: <strong>{riskyWidget('outer', outerError)}</strong></p>
        <p>This content is inside a single error boundary.</p>
      </div>

      {#snippet failed(error, reset)}
        <div class="error-ui">
          <h3>Something Broke</h3>
          <p class="error-msg">{(error as Error).message}</p>
          <button onclick={() => { outerError = false; reset(); }}>
            Fix & Retry
          </button>
          <button onclick={reset}>
            Retry (may fail again)
          </button>
        </div>
      {/snippet}
    </svelte:boundary>
  </section>

  <section>
    <h2>Nested Boundaries — Granular Recovery</h2>
    <p>
      Wrap each independent widget in its own boundary so one broken component
      doesn't take down the entire page. Errors bubble up to the <em>nearest</em>
      boundary only.
    </p>
    <label>
      <input type="checkbox" bind:checked={widgetAError} />
      Break Widget A
    </label>
    <label>
      <input type="checkbox" bind:checked={widgetBError} />
      Break Widget B
    </label>

    <div class="dashboard">
      <svelte:boundary>
        <div class="widget">
          <h4>Widget A</h4>
          <p>{riskyWidget('A', widgetAError)}</p>
        </div>
        {#snippet failed(error, reset)}
          <div class="widget widget-failed">
            <h4>Widget A — failed</h4>
            <p class="error-msg">{(error as Error).message}</p>
            <button onclick={() => { widgetAError = false; reset(); }}>Recover</button>
          </div>
        {/snippet}
      </svelte:boundary>

      <svelte:boundary>
        <div class="widget">
          <h4>Widget B</h4>
          <p>{riskyWidget('B', widgetBError)}</p>
        </div>
        {#snippet failed(error, reset)}
          <div class="widget widget-failed">
            <h4>Widget B — failed</h4>
            <p class="error-msg">{(error as Error).message}</p>
            <button onclick={() => { widgetBError = false; reset(); }}>Recover</button>
          </div>
        {/snippet}
      </svelte:boundary>
    </div>
    <p class="callout">
      Break one widget — the other keeps working. Each boundary is a blast
      radius. In a real app this might be a charts panel, a chat widget, and
      a notifications list all on one dashboard.
    </p>
  </section>

  <section>
    <h2>Server-Side Rendering Errors (new in kit@2.54)</h2>
    <pre>{\`// svelte.config.js — opt in to server-side error boundaries
export default {
  kit: {
    experimental: {
      handleRenderingErrors: true
    }
  }
};\`}</pre>
    <p class="note">
      Before kit@2.54, errors thrown during SSR (inside component &lt;script&gt; blocks or
      templates) produced a generic 500 page. With <code>handleRenderingErrors</code>,
      SvelteKit wraps every route in an error boundary so rendering errors route to the
      nearest <code>+error.svelte</code> just like load errors.
    </p>
    <pre>{\`<!-- +error.svelte — now receives error as a prop -->
<script lang="ts">
  // For rendering errors, the error is passed as a prop
  // (page.error is NOT updated for rendering errors).
  let { error } = $props<{ error: App.Error }>();
</script>

<h1>{error.message}</h1>\`}</pre>
    <p class="note">
      Rendering errors first pass through <code>handleError</code> in
      <code>hooks.server.ts</code>, so you can report them and transform them into
      <code>App.Error</code> objects before they reach the UI.
    </p>
  </section>

  <section>
    <h2>SvelteKit Route Error Pages</h2>
    <p>
      <code>+error.svelte</code> is SvelteKit's route-level error page. It renders
      whenever a load function or form action in that route (or any descendant)
      throws. Place one at each level of your tree to provide context-aware
      fallbacks.
    </p>
    <pre>{\`src/routes/
├── +error.svelte          ← Root fallback (catches everything)
├── +page.svelte
├── blog/
│   ├── +error.svelte      ← Blog-specific error page
│   ├── +page.svelte
│   └── [slug]/
│       ├── +page.svelte
│       └── +page.server.ts
└── admin/
    ├── +error.svelte      ← Admin-specific (maybe different styling)
    └── +page.svelte\`}</pre>
    <pre>{\`<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/state';
</script>

<h1>{page.status}</h1>
<p>{page.error?.message}</p>

{#if page.status === 404}
  <p>The page you're looking for doesn't exist.</p>
  <a href="/">Go home</a>
{:else if page.status === 403}
  <p>You don't have permission to view this page.</p>
{:else}
  <p>Something went wrong. We've been notified.</p>
{/if}\`}</pre>
  </section>

  <section>
    <h2>Expected Errors: error(status, message)</h2>
    <pre>{\`// +page.server.ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const post = await db.getPost(params.slug);
  if (!post) {
    // This is an EXPECTED error — 404, renders the nearest +error.svelte
    error(404, { message: 'Post not found' });
  }
  if (post.draft && !locals.user?.isAdmin) {
    error(403, { message: 'Not published yet' });
  }
  return { post };
};\`}</pre>
    <p class="callout">
      <code>error(status, message)</code> throws a special error that SvelteKit
      recognizes as <em>expected</em>. It does NOT go through <code>handleError</code>
      and is not logged as a crash. Unexpected errors (anything else thrown) DO
      go through <code>handleError</code>.
    </p>
  </section>

  <section>
    <h2>Typed Errors with App.Error</h2>
    <pre>{\`// src/app.d.ts
declare global {
  namespace App {
    interface Error {
      message: string;
      code?: string;      // your custom fields
      requestId?: string;
    }
  }
}

export {};\`}</pre>
    <pre>{\`// Anywhere in the app — error() now accepts your shape
error(500, {
  message: 'Database unreachable',
  code: 'DB_DOWN',
  requestId: crypto.randomUUID()
});\`}</pre>
  </section>

  <section>
    <h2>handleError Hook</h2>
    <pre>{\`// src/hooks.server.ts
import type { HandleServerError } from '@sveltejs/kit';
import * as Sentry from '@sentry/sveltekit';

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
  const requestId = crypto.randomUUID();

  // Log & report — only unexpected errors reach this hook
  console.error('[server error]', requestId, error);
  Sentry.captureException(error, { extra: { requestId, url: event.url.href } });

  // The return value becomes page.error on the error page
  return {
    message: 'An unexpected error occurred',
    code: 'INTERNAL',
    requestId
  };
};\`}</pre>
    <pre>{\`// src/hooks.client.ts — same API, for client-side errors
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ error, event }) => {
  console.error('[client error]', error);
  return { message: 'Something went wrong on the client' };
};\`}</pre>
  </section>

  <section class="pitfalls">
    <h2>Common Pitfalls & Pro Tips</h2>
    <ul class="pitfall-list">
      <li>
        <strong>Forgetting the failed snippet entirely</strong>
        Without a <code>failed</code> snippet, <code>&lt;svelte:boundary&gt;</code> silently renders nothing on error — always provide fallback UI.
      </li>
      <li>
        <strong>reset() doesn't clear errored state</strong>
        It re-runs the children but leaves whatever reactive state caused the crash — clean up the bad state yourself before calling reset.
      </li>
      <li>
        <strong>Errors in event handlers are NOT caught</strong>
        Boundaries catch render and effect errors only; wrap event handlers in try/catch or report manually.
      </li>
      <li>
        <strong>error() from @sveltejs/kit vs throwing plain Error</strong>
        Use <code>error(status, body)</code> for expected HTTP errors (they don't hit handleError); plain throws are treated as unexpected and get logged.
      </li>
      <li>
        <strong>App.Error shape must be declared in app.d.ts</strong>
        If you return extra fields from handleError without declaring them, TypeScript will strip them out.
      </li>
      <li>
        <strong>Don't leak internals in error messages</strong>
        handleError is the place to sanitize — never surface raw database or stack-trace text to users.
      </li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; padding: 1rem; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.78rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
  .safe-zone { background: #e8f5e9; padding: 1rem; border-radius: 4px; border: 2px solid #4caf50; }
  .error-ui { background: #ffebee; padding: 1rem; border-radius: 4px; border: 2px solid #f44336; }
  .error-msg { color: #d32f2f; font-family: monospace; font-size: 0.85rem; }
  label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.5rem; }
  button { padding: 0.4rem 0.8rem; cursor: pointer; margin-right: 0.5rem; font-size: 0.85rem; }
  .dashboard { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem; }
  .widget { background: #e8f5e9; border: 2px solid #4caf50; border-radius: 6px; padding: 0.75rem; }
  .widget h4 { margin: 0 0 0.5rem; font-size: 0.9rem; }
  .widget-failed { background: #ffebee; border-color: #f44336; }
  .note {
    margin-top: 0.75rem;
    padding: 0.6rem 0.8rem;
    background: #fff7ed;
    border-left: 3px solid #f59e0b;
    border-radius: 4px;
    font-size: 0.85rem;
    color: #78350f;
  }
  .note code { background: #fde68a; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .pitfalls { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.25rem; margin-top: 1.5rem; }
  .pitfalls h2 { color: #78350f; margin: 0 0 0.5rem; font-size: 1rem; }
  .pitfall-list { list-style: none; padding: 0; margin: 0; }
  .pitfall-list li { padding: 0.4rem 0; border-bottom: 1px dashed #fbbf24; font-size: 0.85rem; color: #78350f; }
  .pitfall-list li:last-child { border-bottom: none; }
  .pitfall-list strong { display: block; color: #92400e; margin-bottom: 0.15rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
