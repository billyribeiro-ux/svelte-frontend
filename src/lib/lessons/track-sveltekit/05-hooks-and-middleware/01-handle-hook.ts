import type { Lesson } from '$types/lesson';

export const handleHook: Lesson = {
	id: 'sveltekit.hooks-and-middleware.handle-hook',
	slug: 'handle-hook',
	title: 'The handle() Hook',
	description: 'Intercept requests with handle(), add auth checks, and modify responses.',
	trackId: 'sveltekit',
	moduleId: 'hooks-and-middleware',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['sveltekit.hooks.handle', 'sveltekit.hooks.locals'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# The handle() Hook

## Why handle() Is the Most Important Hook

The \`handle\` hook in \`src/hooks.server.ts\` is the single most powerful extension point in SvelteKit. It intercepts **every server-side request** -- page loads, form submissions, API calls, data fetches during client-side navigation -- before any route matching, load function, or action runs.

This makes it the right place for cross-cutting concerns that must apply globally:
- **Authentication:** Verify session tokens, decode JWTs, look up users
- **Authorization:** Block or redirect requests to protected routes
- **Logging:** Record every request for observability
- **Headers:** Add security headers (CORS, CSP, HSTS)
- **Rate limiting:** Throttle requests by IP or user
- **Localization:** Detect language preferences from cookies or headers

Without hooks, you would need to repeat these checks in every load function and every action. Hooks centralize this logic.

## The Request Lifecycle with handle()

Here is the complete request lifecycle when \`handle()\` is in play:

\`\`\`
Browser Request
  |
  v
handle({ event, resolve })
  |
  |--> event.locals.user = getUserFromCookie(event.cookies)
  |
  |--> if (protected route && !user) redirect(303, '/login')
  |
  |--> response = await resolve(event)
  |
  |--> response.headers.set('X-Request-Id', uuid)
  |
  v
Response to Browser
\`\`\`

The \`resolve\` function is what actually processes the request -- matching routes, running load functions, rendering pages, or executing API handlers. By wrapping \`resolve()\`, you control what happens before AND after the request is processed.

**You MUST call \`resolve(event)\` unless you want to short-circuit.** Forgetting to call resolve means the request never reaches your routes. Intentionally not calling resolve is valid for implementing things like maintenance mode or IP blocking.

## event.locals: Passing Data Through the Request

\`event.locals\` is an object that lives for the duration of a single request. You set values in the handle hook, and they are available in:
- Load functions (via \`locals\` parameter)
- Form actions (via \`locals\` parameter)
- API routes (via \`locals\` parameter)
- Other hooks (\`handleError\`, subsequent \`handle\` hooks in a sequence)

\`\`\`typescript
// hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');

  if (token) {
    const user = await verifyAndDecodeToken(token);
    event.locals.user = user;
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};

// +page.server.ts -- anywhere in your app
export const load: PageServerLoad = async ({ locals }) => {
  // locals.user is available here, set by the hook
  if (!locals.user) {
    redirect(303, '/login');
  }
  return { user: locals.user };
};
\`\`\`

To get TypeScript support for \`event.locals\`, declare the types in \`src/app.d.ts\`:

\`\`\`typescript
declare global {
  namespace App {
    interface Locals {
      user: { id: string; name: string; role: string } | null;
    }
  }
}
\`\`\`

## Authentication Patterns

**Cookie-based sessions (most common):**
\`\`\`typescript
export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session');

  if (sessionId) {
    const session = await db.sessions.find(sessionId);
    if (session && session.expiresAt > new Date()) {
      event.locals.user = await db.users.find(session.userId);
    }
  }

  return resolve(event);
};
\`\`\`

**JWT tokens:**
\`\`\`typescript
export const handle: Handle = async ({ event, resolve }) => {
  const authHeader = event.request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.slice(7), SECRET);
      event.locals.user = payload;
    } catch {
      event.locals.user = null;
    }
  }
  return resolve(event);
};
\`\`\`

## Route Protection: Where to Redirect

A common pattern is protecting entire route subtrees:

\`\`\`typescript
export const handle: Handle = async ({ event, resolve }) => {
  // ... set event.locals.user ...

  const protectedPaths = ['/dashboard', '/settings', '/api/private'];
  const isProtected = protectedPaths.some(p => event.url.pathname.startsWith(p));

  if (isProtected && !event.locals.user) {
    // Redirect to login with the original URL as a return-to parameter
    const returnTo = encodeURIComponent(event.url.pathname + event.url.search);
    redirect(303, \`/login?returnTo=\${returnTo}\`);
  }

  return resolve(event);
};
\`\`\`

**Why 303?** The 303 status code means "See Other" -- it tells the browser to GET the redirect target regardless of the original request method. This is correct for auth redirects because you want the browser to GET /login, even if the original request was a POST to a form action.

## Modifying Responses

The \`resolve\` function returns a \`Response\`. You can modify it before returning:

\`\`\`typescript
const response = await resolve(event);

// Add security headers to every response
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

return response;
\`\`\`

You can also use the \`transformPageChunk\` option to modify HTML before it is sent:

\`\`\`typescript
const response = await resolve(event, {
  transformPageChunk: ({ html }) => {
    return html.replace('%lang%', event.locals.language ?? 'en');
  }
});
\`\`\`

This is useful for injecting the language attribute into \`<html lang="%lang%">\` in your \`app.html\`.

## Decision Framework: Hook vs. Layout Load vs. Per-Route Check

| Approach | Scope | When to Use |
|---|---|---|
| handle() hook | Every request | Auth, logging, security headers, CORS |
| Layout load function | All pages in a layout group | Loading shared UI data (user profile for nav) |
| Page load guard | Single page | Page-specific authorization (admin-only pages) |

Use hooks for cross-cutting concerns. Use layout loads for shared data. Use page-level checks for fine-grained access control that varies per page.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.hooks.handle'
		},
		{
			type: 'text',
			content: `## Basic handle() Hook

The simplest hook just passes the request through:

\`\`\`typescript
export async function handle({ event, resolve }) {
  return resolve(event);
}
\`\`\`

**Your task:** Create a handle hook that adds a user object to \`event.locals\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Authentication Checks

A common pattern is checking for authentication in the handle hook. If the user isn't authenticated, redirect them to the login page.

**Task:** Add an auth check that redirects unauthenticated users from protected routes.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Modifying Responses

You can transform the response after resolve by using the \`transformPageChunk\` option or by modifying the response directly.

**Task:** Add a custom response header using the handle hook.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: 'hooks.server.ts',
			path: '/hooks.server.ts',
			language: 'typescript',
			content: `import type { Handle } from '@sveltejs/kit';

// TODO: Create a handle hook that sets event.locals.user
export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event);
};`
		},
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    user: locals.user
  };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>Home</h1>

<!-- TODO: Display user info from locals -->`
		}
	],

	solutionFiles: [
		{
			name: 'hooks.server.ts',
			path: '/hooks.server.ts',
			language: 'typescript',
			content: `import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Simulate getting user from session/cookie
  const token = event.cookies.get('session');
  event.locals.user = token ? { name: 'Alice', role: 'admin' } : null;

  // Protect dashboard routes
  if (event.url.pathname.startsWith('/dashboard') && !event.locals.user) {
    redirect(303, '/login');
  }

  const response = await resolve(event);

  // Add custom header
  response.headers.set('X-Custom-Header', 'SvelteKit');

  return response;
};`
		},
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  return {
    user: locals.user
  };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<h1>Home</h1>

{#if data.user}
  <p>Welcome, {data.user.name}! Role: {data.user.role}</p>
{:else}
  <p>You are not logged in.</p>
{/if}`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add user data to event.locals in the handle hook',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'event.locals' }]
				}
			},
			hints: [
				'`event.locals` is an object you can attach data to for the current request.',
				'Set `event.locals.user = { name: \'Alice\' }` before calling resolve.',
				'Load functions can then access `locals.user` to get the user data.'
			],
			conceptsTested: ['sveltekit.hooks.locals']
		},
		{
			id: 'cp-2',
			description: 'Add route protection with redirect for unauthenticated users',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'redirect(' },
						{ type: 'contains', value: 'pathname' }
					]
				}
			},
			hints: [
				'Check `event.url.pathname` to see which route is being accessed.',
				'Use `redirect(303, \'/login\')` from `@sveltejs/kit` to redirect.',
				'Only redirect if the user is not authenticated and the route is protected.'
			],
			conceptsTested: ['sveltekit.hooks.handle']
		},
		{
			id: 'cp-3',
			description: 'Add a custom response header',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'response.headers' }]
				}
			},
			hints: [
				'Store the result of `await resolve(event)` in a variable.',
				'Use `response.headers.set()` to add custom headers.',
				'Return the modified response.'
			],
			conceptsTested: ['sveltekit.hooks.handle']
		}
	]
};
