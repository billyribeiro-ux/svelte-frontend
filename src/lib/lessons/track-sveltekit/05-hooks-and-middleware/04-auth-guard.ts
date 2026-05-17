import type { Lesson } from '$types/lesson';

export const authGuard: Lesson = {
	id: 'sveltekit.hooks.auth-guard',
	slug: 'auth-guard',
	title: 'Auth Guards — Protecting Routes with Hooks',
	description:
		'Use the handle hook to validate sessions, inject users into locals, and protect entire route groups from unauthenticated access without repeating auth logic in every load function.',
	trackId: 'sveltekit',
	moduleId: 'hooks-and-middleware',
	order: 4,
	estimatedMinutes: 25,
	concepts: ['sveltekit.hooks.handle', 'sveltekit.locals', 'sveltekit.cookies'],
	prerequisites: ['sveltekit.hooks.handle', 'sveltekit.load.server'],

	content: [
		{
			type: 'text',
			content: `# Auth Guards — Protecting Routes with Hooks

The most important thing a server hook can do is protect your routes.

Consider what happens without centralised auth:

\`\`\`ts
// Every single load function repeats this boilerplate
export const load: PageServerLoad = async ({ cookies, locals }) => {
  const session = await validateSession(cookies.get('session'));
  if (!session) throw redirect(302, '/login');
  
  // Now we can do real work...
  return { user: session.user };
};
\`\`\`

If you have 50 protected routes, you write this 50 times. And if one developer forgets, you have a security hole. The \`handle\` hook in \`src/hooks.server.ts\` solves this at the architectural level.

## \`event.locals\` — Your Server-Side Request Context

\`event.locals\` is an object that persists for the lifetime of a single request. It is the right place to store things like the current authenticated user — you set it once in the hook, and every \`load\` function, form action, and API endpoint in that request can read it without re-validating the session.

\`\`\`ts
// In app.d.ts — declare the shape of locals
declare global {
  namespace App {
    interface Locals {
      user: { id: string; email: string; name: string } | null;
    }
  }
}
\`\`\`

## A Complete Auth Guard

\`\`\`ts
// src/hooks.server.ts
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/learn', '/settings'];

// Routes that authenticated users should not see
const AUTH_ONLY_ROUTES = ['/login', '/register'];

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Validate session from cookie
  const sessionToken = event.cookies.get('session');
  const user = sessionToken ? await validateSession(sessionToken) : null;

  // 2. Inject user into locals (available to all load functions)
  event.locals.user = user;

  // 3. Redirect authenticated users away from auth pages
  if (user && AUTH_ONLY_ROUTES.some(r => event.url.pathname.startsWith(r))) {
    throw redirect(302, '/dashboard');
  }

  // 4. Redirect unauthenticated users away from protected pages
  if (!user && PROTECTED_PREFIXES.some(p => event.url.pathname.startsWith(p))) {
    const returnTo = encodeURIComponent(event.url.pathname + event.url.search);
    throw redirect(302, \`/login?returnTo=\${returnTo}\`);
  }

  // 5. Proceed with the request
  return resolve(event);
};

async function validateSession(token: string) {
  // In production: verify JWT, query database, etc.
  // For now: stub
  if (token === 'valid-session') {
    return { id: 'user-1', email: 'dev@example.com', name: 'Developer' };
  }
  return null;
}
\`\`\`

## Reading Locals in Load Functions

Once \`event.locals.user\` is set by the hook, every server-side function receives it:

\`\`\`ts
// src/routes/(app)/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
  // No auth check needed here — the hook already ensured we're authenticated
  return { user: locals.user! };
};
\`\`\`

\`\`\`ts
// src/routes/api/data/+server.ts
export const GET: RequestHandler = ({ locals }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });
  return json({ data: getUserData(locals.user.id) });
};
\`\`\`

## The Return-To Pattern

When redirecting an unauthenticated user to login, preserve where they were trying to go so you can redirect them back after they log in:

\`\`\`ts
// In hook:
const returnTo = encodeURIComponent(event.url.pathname + event.url.search);
throw redirect(302, \`/login?returnTo=\${returnTo}\`);

// In login form action:
import { redirect } from '@sveltejs/kit';

export const actions = {
  login: async ({ request, cookies, url }) => {
    const data = await request.formData();
    // validate credentials...
    
    cookies.set('session', newToken, { path: '/', httpOnly: true, sameSite: 'strict' });
    
    const returnTo = url.searchParams.get('returnTo') ?? '/dashboard';
    throw redirect(302, decodeURIComponent(returnTo));
  }
};
\`\`\`

## Role-Based Access Control

Extend the pattern for role-based routes:

\`\`\`ts
// Admin routes require admin role
if (event.url.pathname.startsWith('/admin')) {
  if (!user) throw redirect(302, '/login');
  if (user.role !== 'admin') throw error(403, 'Access denied');
}
\`\`\`

## Cookie Security Best Practices

When setting session cookies, always use security attributes:

\`\`\`ts
cookies.set('session', token, {
  path: '/',
  httpOnly: true,    // not accessible via JS — prevents XSS theft
  secure: true,      // only sent over HTTPS
  sameSite: 'lax',   // prevents CSRF for top-level navigations
  maxAge: 60 * 60 * 24 * 30 // 30 days
});
\`\`\`

**\`httpOnly: true\`** is the most critical setting. It prevents JavaScript (including malicious scripts injected via XSS attacks) from reading the cookie. The session token never appears in \`document.cookie\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-hook-locals'
		},
		{
			type: 'checkpoint',
			content: 'cp-hook-redirect'
		}
	],

	starterFiles: [
		{
			name: 'hooks.server.ts',
			path: '/hooks.server.ts',
			language: 'typescript',
			content: `import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

async function validateSession(token: string) {
  // Stub: 'valid-token' is authenticated
  if (token === 'valid-token') {
    return { id: '1', email: 'alex@example.com', name: 'Alex' };
  }
  return null;
}

export const handle: Handle = async ({ event, resolve }) => {
  // TODO 1: Read 'session' cookie from event.cookies.get()
  // TODO 2: Validate it using validateSession()
  // TODO 3: Set event.locals.user to the result (or null)
  // TODO 4: If pathname starts with '/app' and user is null, redirect to '/login'

  return resolve(event);
};`
		},
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `export function load({ locals }) {
  // locals.user is injected by the hook — no auth check needed here
  return {
    user: locals.user,
    message: locals.user
      ? \`Welcome back, \${locals.user.name}!\`
      : 'You are not logged in.'
  };
}`
		}
	],

	solutionFiles: [
		{
			name: 'hooks.server.ts',
			path: '/hooks.server.ts',
			language: 'typescript',
			content: `import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

async function validateSession(token: string) {
  if (token === 'valid-token') {
    return { id: '1', email: 'alex@example.com', name: 'Alex' };
  }
  return null;
}

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Read session cookie
  const sessionToken = event.cookies.get('session');

  // 2. Validate and inject user into locals
  event.locals.user = sessionToken
    ? await validateSession(sessionToken)
    : null;

  // 3. Protect /app routes
  if (!event.locals.user && event.url.pathname.startsWith('/app')) {
    const returnTo = encodeURIComponent(event.url.pathname);
    throw redirect(302, \`/login?returnTo=\${returnTo}\`);
  }

  return resolve(event);
};`
		},
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `export function load({ locals }) {
  return {
    user: locals.user,
    message: locals.user
      ? \`Welcome back, \${locals.user.name}!\`
      : 'You are not logged in.'
  };
}`
		}
	],

	checkpoints: [
		{
			id: 'cp-hook-locals',
			description: 'Validate the session cookie and inject the user into event.locals',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'event.cookies.get' },
						{ type: 'contains', value: 'event.locals.user' },
						{ type: 'contains', value: 'validateSession' }
					]
				}
			},
			hints: [
				'Read the cookie with `const token = event.cookies.get("session")`.',
				'Validate it: `event.locals.user = token ? await validateSession(token) : null`.',
				'`event.locals` is your per-request storage — any server load function can read `locals.user` without re-validating.'
			],
			conceptsTested: ['sveltekit.hooks.handle', 'sveltekit.locals', 'sveltekit.cookies']
		},
		{
			id: 'cp-hook-redirect',
			description: 'Redirect unauthenticated users away from /app routes to /login',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'redirect(302' },
						{ type: 'contains', value: '/login' },
						{ type: 'contains', value: 'event.url.pathname.startsWith' }
					]
				}
			},
			hints: [
				'After setting `event.locals.user`, check if the user is null AND the route needs protection.',
				'`throw redirect(302, "/login")` immediately stops processing and sends the redirect.',
				'Add `?returnTo=${encodeURIComponent(event.url.pathname)}` to the redirect URL so the login page can redirect back after authentication.'
			],
			conceptsTested: ['sveltekit.hooks.handle', 'sveltekit.locals']
		}
	]
};
