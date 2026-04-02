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

## Why SvelteKit Has Four Env Modules

Most frameworks give you a single \`process.env\` and call it a day. This is dangerously permissive -- nothing prevents you from accidentally importing \`process.env.DATABASE_URL\` in client-side code, leaking your database credentials to every user's browser.

SvelteKit enforces environment variable safety through four distinct modules, each with different access rules and timing characteristics:

| Module | Visibility | Timing | Use Case |
|---|---|---|---|
| \`$env/static/private\` | Server only | Build time | API keys, DB URLs, secrets |
| \`$env/static/public\` | Anywhere | Build time | Public API URLs, feature flags |
| \`$env/dynamic/private\` | Server only | Runtime | Secrets that change per deployment |
| \`$env/dynamic/public\` | Anywhere | Runtime | Public config that changes per deployment |

The "static" vs "dynamic" distinction is about WHEN the value is read:
- **Static:** Inlined at build time by Vite. The value is baked into the built JavaScript. Dead code elimination can remove unused branches based on these values.
- **Dynamic:** Read from the environment at runtime. Different values can be used per deployment from the same build artifact.

## The .env File Hierarchy

SvelteKit uses Vite's .env file loading, which follows a priority hierarchy:

\`\`\`
.env                 # Always loaded
.env.local           # Always loaded, git-ignored
.env.[mode]          # Loaded for specific mode (development, production)
.env.[mode].local    # Mode-specific, git-ignored
\`\`\`

Mode-specific files override general ones. \`.local\` files override non-local ones. The loading order (lowest to highest priority):
1. \`.env\`
2. \`.env.local\`
3. \`.env.development\` (or \`.env.production\`)
4. \`.env.development.local\`

**Important:** Only variables prefixed with \`PUBLIC_\` are accessible in public modules. This prefix convention is enforced at the framework level -- importing a non-PUBLIC variable from \`$env/static/public\` will cause a build error.

## Static Private: The Workhorse for Secrets

\`$env/static/private\` is your primary tool for server-side secrets. Values are replaced at build time, enabling tree-shaking and dead code elimination:

\`\`\`typescript
// +page.server.ts
import { DATABASE_URL, API_SECRET } from '$env/static/private';

export const load: PageServerLoad = async () => {
  // DATABASE_URL is inlined at build time
  // In the built output, this becomes a literal string
  const db = connect(DATABASE_URL);
  const data = await db.query('SELECT ...');

  // NEVER return the secret to the client
  return { items: data.rows };
};
\`\`\`

SvelteKit enforces the server-only constraint at build time. If you try to import from \`$env/static/private\` in a \`.svelte\` component or \`+page.ts\` file, the build fails with a clear error message. This is not a runtime check that could be bypassed -- it is a compile-time guarantee.

## Static Public: Client-Safe Configuration

Variables prefixed with \`PUBLIC_\` can be imported anywhere, including client-side code:

\`\`\`typescript
// .env
PUBLIC_API_URL=https://api.example.com
PUBLIC_FEATURE_CHAT=true
\`\`\`

\`\`\`svelte
<!-- +page.svelte -->
<script lang="ts">
  import { PUBLIC_API_URL, PUBLIC_FEATURE_CHAT } from '$env/static/public';
</script>

<p>API: {PUBLIC_API_URL}</p>
{#if PUBLIC_FEATURE_CHAT === 'true'}
  <ChatWidget />
{/if}
\`\`\`

Because these are inlined at build time, Vite can tree-shake code branches that reference feature flags. If \`PUBLIC_FEATURE_CHAT\` is \`'false'\`, the ChatWidget import can be eliminated from the bundle entirely.

## Dynamic Modules: Runtime Configuration

Static modules require rebuilding to change values. Dynamic modules read from the environment at runtime:

\`\`\`typescript
// +page.server.ts
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async () => {
  // env.DATABASE_URL is read at request time
  // Different replicas can have different values
  const db = connect(env.DATABASE_URL);
  return { status: 'connected' };
};
\`\`\`

Dynamic modules are essential for:
- **Docker deployments** where the same image runs in staging and production with different env vars
- **Feature flags** that change without redeployment
- **Secrets rotation** where API keys change periodically

The trade-off is that dynamic values cannot be tree-shaken or inlined, resulting in slightly larger bundles and less optimization.

## Decision Framework: Which Module to Use

1. **Is it a secret?** Use a private module. Never prefix with \`PUBLIC_\`.
2. **Does it change between deployments from the same build?** Use dynamic.
3. **Is it fixed per build?** Use static for better optimization.

Common patterns:
- \`DATABASE_URL\` -> \`$env/static/private\` (secret, fixed per build)
- \`API_SECRET\` -> \`$env/dynamic/private\` (secret, rotated without rebuild)
- \`PUBLIC_API_URL\` -> \`$env/static/public\` (not secret, fixed per build)
- \`PUBLIC_MAINTENANCE_MODE\` -> \`$env/dynamic/public\` (not secret, toggled at runtime)

## Security Pitfalls to Avoid

**Pitfall 1: Returning private vars to the client via load functions.**
\`\`\`typescript
// WRONG -- leaks the secret
export const load = async () => {
  return { apiKey: API_SECRET };
};

// RIGHT -- use the secret server-side, return only results
export const load = async () => {
  const data = await fetchWithSecret(API_SECRET);
  return { data };
};
\`\`\`

**Pitfall 2: Using process.env directly.**
SvelteKit's env modules exist for a reason. \`process.env\` bypasses all safety checks and is not available in all deployment targets (Cloudflare Workers has no \`process.env\`).

**Pitfall 3: Committing .env files with secrets.**
Always add \`.env.local\` and \`.env.*.local\` to \`.gitignore\`. Commit only \`.env\` with non-sensitive defaults or empty placeholders.`
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

Variables prefixed with \`PUBLIC_\` can be used anywhere -- including client-side code. Use these for non-sensitive config like API base URLs.

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
				'These can be imported anywhere -- even in `.svelte` components.'
			],
			conceptsTested: ['sveltekit.env.public']
		}
	]
};
