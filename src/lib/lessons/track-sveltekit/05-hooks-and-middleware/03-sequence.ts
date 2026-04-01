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

As your app grows, a single \`handle\` function can become unwieldy. SvelteKit provides \`sequence()\` to compose multiple handle functions together. Each runs in order, passing the event through the chain.

\`\`\`typescript
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(authHook, loggingHook, i18nHook);
\`\`\``
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
