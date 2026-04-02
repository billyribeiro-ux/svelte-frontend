import type { Lesson } from '$types/lesson';

export const sequence: Lesson = {
	id: 'sveltekit.hooks-and-middleware.sequence',
	slug: 'sequence',
	title: 'Composing Hooks with sequence()',
	description: 'Chain multiple handle hooks together with sequence() for modular middleware.',
	trackId: 'sveltekit',
	moduleId: 'hooks-and-middleware',
	order: 3,
	estimatedMinutes: 10,
	concepts: ['sveltekit.hooks.sequence', 'sveltekit.hooks.middleware'],
	prerequisites: ['sveltekit.hooks.handle'],

	content: [
		{
			type: 'text',
			content: `# Composing Hooks with sequence()

## Why a Single Handle Function Is Not Enough

As your application grows, the \`handle\` hook accumulates responsibilities: authentication, logging, CORS headers, rate limiting, feature flags, A/B testing, localization. A single function handling all of these becomes hundreds of lines of tangled logic where every concern is interleaved with every other.

The solution is \`sequence()\` -- a utility that composes multiple handle functions into one, each responsible for a single concern. This is SvelteKit's version of middleware, designed for the hooks architecture rather than a traditional middleware stack.

\`\`\`typescript
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(auth, logging, cors, rateLimit);
\`\`\`

Each function in the sequence receives the event and a resolve function. It can:
- Modify the event before passing it to the next handler
- Short-circuit by returning a response without calling resolve
- Modify the response after the next handler returns

## Execution Order and the Resolve Chain

The sequence creates a nested resolve chain. When you call \`sequence(a, b, c)\`:

1. \`a\` receives the original event and a resolve function
2. When \`a\` calls resolve, it actually calls \`b\`
3. When \`b\` calls resolve, it actually calls \`c\`
4. When \`c\` calls resolve, it actually processes the request (routes, load functions, etc.)
5. The response flows back: \`c\` gets it first, then \`b\`, then \`a\`

This is exactly like nested middleware in Express or Koa, but expressed as function composition rather than a linear stack. The before-resolve code runs in sequence order (a, b, c). The after-resolve code runs in reverse order (c, b, a).

\`\`\`typescript
const first: Handle = async ({ event, resolve }) => {
  console.log('first: before');    // runs 1st
  const response = await resolve(event);
  console.log('first: after');     // runs 6th
  return response;
};

const second: Handle = async ({ event, resolve }) => {
  console.log('second: before');   // runs 2nd
  const response = await resolve(event);
  console.log('second: after');    // runs 5th
  return response;
};

const third: Handle = async ({ event, resolve }) => {
  console.log('third: before');    // runs 3rd
  const response = await resolve(event);
  console.log('third: after');     // runs 4th
  return response;
};

export const handle = sequence(first, second, third);
\`\`\`

## Practical Middleware Patterns

**Authentication middleware:**
\`\`\`typescript
const auth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');
  event.locals.user = token ? await verifySession(token) : null;
  return resolve(event);
};
\`\`\`

**Request timing middleware:**
\`\`\`typescript
const timing: Handle = async ({ event, resolve }) => {
  const start = performance.now();
  const response = await resolve(event);
  const duration = performance.now() - start;

  console.log(
    \`\${event.request.method} \${event.url.pathname} \${response.status} \${duration.toFixed(1)}ms\`
  );

  response.headers.set('Server-Timing', \`total;dur=\${duration.toFixed(1)}\`);
  return response;
};
\`\`\`

**Route guard middleware:**
\`\`\`typescript
const guard: Handle = async ({ event, resolve }) => {
  const protectedRoutes = ['/dashboard', '/settings', '/admin'];
  const isProtected = protectedRoutes.some(r => event.url.pathname.startsWith(r));

  if (isProtected && !event.locals.user) {
    redirect(303, '/login');
  }

  // Admin routes need admin role
  if (event.url.pathname.startsWith('/admin') && event.locals.user?.role !== 'admin') {
    error(403, 'Forbidden');
  }

  return resolve(event);
};
\`\`\`

**CORS middleware:**
\`\`\`typescript
const cors: Handle = async ({ event, resolve }) => {
  // Handle preflight requests
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': 'https://trusted.com',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  const response = await resolve(event);
  response.headers.set('Access-Control-Allow-Origin', 'https://trusted.com');
  return response;
};
\`\`\`

## Short-Circuiting: Stopping the Chain

Any handler in the sequence can return a response without calling \`resolve()\`. This stops the chain -- subsequent handlers and the actual route processing never execute:

\`\`\`typescript
const maintenance: Handle = async ({ event, resolve }) => {
  if (MAINTENANCE_MODE && !event.url.pathname.startsWith('/api/health')) {
    return new Response('Service temporarily unavailable', {
      status: 503,
      headers: { 'Retry-After': '300' }
    });
  }
  return resolve(event);
};

const rateLimit: Handle = async ({ event, resolve }) => {
  const ip = event.getClientAddress();
  if (isRateLimited(ip)) {
    return new Response('Too many requests', { status: 429 });
  }
  return resolve(event);
};

// maintenance runs first -- if active, nothing else executes
export const handle = sequence(maintenance, rateLimit, auth, guard, timing);
\`\`\`

## Ordering Considerations

The order of handlers in \`sequence()\` matters significantly:

1. **Maintenance/health checks first** -- fast rejection without any processing
2. **Rate limiting** -- reject excessive requests before doing auth lookups
3. **Authentication** -- set \`event.locals.user\` for subsequent handlers
4. **Authorization/guards** -- check permissions (requires auth to have run)
5. **Logging/timing** -- wrap everything else for complete metrics
6. **Response modification** -- add headers, transform HTML

A common mistake is putting auth AFTER a guard -- the guard checks \`event.locals.user\` which has not been set yet, so every request appears unauthenticated.

## Testing Individual Handlers

Because each handler is an independent function, you can test them in isolation:

\`\`\`typescript
import { describe, it, expect } from 'vitest';

describe('auth hook', () => {
  it('sets user when session cookie exists', async () => {
    const event = createMockEvent({ cookies: { session: 'valid-token' } });
    const resolve = vi.fn().mockResolvedValue(new Response());

    await auth({ event, resolve });

    expect(event.locals.user).toBeDefined();
    expect(resolve).toHaveBeenCalledWith(event);
  });
});
\`\`\`

This testability is a major advantage over monolithic handle functions.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.hooks.sequence'
		},
		{
			type: 'text',
			content: `## Splitting Hooks into Functions

**Your task:** Create separate hook functions for authentication and logging, then combine them with \`sequence()\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Middleware Pattern

Each hook in the sequence can:
- Modify the event before passing it along
- Short-circuit by returning a response directly
- Modify the response after the chain resolves

**Task:** Create a timing middleware that logs how long each request takes.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'hooks.server.ts',
			path: '/hooks.server.ts',
			language: 'typescript',
			content: `import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

// TODO: Create an auth hook
const auth: Handle = async ({ event, resolve }) => {
  return resolve(event);
};

// TODO: Create a logging/timing hook
const logging: Handle = async ({ event, resolve }) => {
  return resolve(event);
};

// TODO: Combine with sequence()
export const handle = auth;`
		}
	],

	solutionFiles: [
		{
			name: 'hooks.server.ts',
			path: '/hooks.server.ts',
			language: 'typescript',
			content: `import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

const auth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');
  event.locals.user = token ? { name: 'Alice' } : null;
  return resolve(event);
};

const logging: Handle = async ({ event, resolve }) => {
  const start = performance.now();
  const response = await resolve(event);
  const duration = performance.now() - start;
  console.log(\`\${event.request.method} \${event.url.pathname} — \${duration.toFixed(2)}ms\`);
  return response;
};

export const handle = sequence(auth, logging);`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create separate hook functions and combine with sequence()',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'sequence(' },
						{ type: 'regex', value: 'const (auth|logging)' }
					]
				}
			},
			hints: [
				'Define each hook as a separate `Handle` function.',
				'Import `sequence` from `@sveltejs/kit/hooks`.',
				'Export `handle = sequence(auth, logging)` to combine them.'
			],
			conceptsTested: ['sveltekit.hooks.sequence']
		},
		{
			id: 'cp-2',
			description: 'Create a timing middleware that measures request duration',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'performance.now()' },
						{ type: 'contains', value: 'duration' }
					]
				}
			},
			hints: [
				'Record `performance.now()` before calling `resolve(event)`.',
				'Calculate the duration after the response is returned.',
				'Log the method, URL, and duration with `console.log()`.'
			],
			conceptsTested: ['sveltekit.hooks.middleware']
		}
	]
};
