import type { Lesson } from '$types/lesson';

export const environmentVariables: Lesson = {
	id: 'sveltekit.environment-and-config.environment-variables',
	slug: 'environment-variables',
	title: 'Environment Variables',
	description: 'Access environment variables safely with $env/static/private and $env/dynamic/public.',
	trackId: 'sveltekit',
	moduleId: 'environment-and-config',
	order: 1,
	estimatedMinutes: 12,
	concepts: ['sveltekit.env.private', 'sveltekit.env.public'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Environment Variables in SvelteKit

SvelteKit provides four modules for accessing environment variables:

- \`$env/static/private\` — private vars, inlined at build time
- \`$env/static/public\` — public vars (prefixed with \`PUBLIC_\`), inlined at build time
- \`$env/dynamic/private\` — private vars, read at runtime
- \`$env/dynamic/public\` — public vars, read at runtime

Private variables can only be imported in server-side code. SvelteKit enforces this at build time.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.env.private'
		},
		{
			type: 'text',
			content: `## Using Private Environment Variables

Private env vars are perfect for API keys, database URLs, and secrets. They can only be used in server files.

**Your task:** Import a private environment variable in a server load function.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Public Environment Variables

Variables prefixed with \`PUBLIC_\` can be used anywhere — including client-side code. Use these for non-sensitive config like API base URLs.

**Task:** Use a public environment variable in a client component.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

// TODO: Import DATABASE_URL from $env/static/private

export const load: PageServerLoad = async () => {
  // TODO: Use the private env var (don't expose it to client!)
  return {
    dbConnected: false
  };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import PUBLIC_API_URL from $env/static/public

  let { data } = $props();
</script>

<h1>Environment Variables</h1>

<p>DB Connected: {data.dbConnected}</p>

<!-- TODO: Display the public API URL -->`
		}
	],

	solutionFiles: [
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import { DATABASE_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // Use the private env var server-side only
  console.log('Connecting to:', DATABASE_URL);

  return {
    dbConnected: true
  };
};`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { PUBLIC_API_URL } from '$env/static/public';

  let { data } = $props();
</script>

<h1>Environment Variables</h1>

<p>DB Connected: {data.dbConnected}</p>
<p>API URL: {PUBLIC_API_URL}</p>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Import and use a private environment variable in server code',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: '$env/static/private' }]
				}
			},
			hints: [
				'Import with `import { DATABASE_URL } from \'$env/static/private\';`.',
				'Private vars can only be imported in `+page.server.ts`, `+server.ts`, etc.',
				'Never return private env vars directly to the client in your load function.'
			],
			conceptsTested: ['sveltekit.env.private']
		},
		{
			id: 'cp-2',
			description: 'Use a public environment variable in client code',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: '$env/static/public' }]
				}
			},
			hints: [
				'Public vars must be prefixed with `PUBLIC_` in your `.env` file.',
				'Import with `import { PUBLIC_API_URL } from \'$env/static/public\';`.',
				'These can be imported anywhere — even in `.svelte` components.'
			],
			conceptsTested: ['sveltekit.env.public']
		}
	]
};
