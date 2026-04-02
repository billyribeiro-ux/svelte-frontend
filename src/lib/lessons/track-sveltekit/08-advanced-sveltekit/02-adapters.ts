import type { Lesson } from '$types/lesson';

export const adapters: Lesson = {
	id: 'sveltekit.advanced-sveltekit.adapters',
	slug: 'adapters',
	title: 'Adapters',
	description: 'Deploy SvelteKit apps anywhere with adapter-node, adapter-static, adapter-vercel, and more.',
	trackId: 'sveltekit',
	moduleId: 'advanced-sveltekit',
	order: 2,
	estimatedMinutes: 12,
	concepts: ['sveltekit.deployment.adapters', 'sveltekit.deployment.platforms'],
	prerequisites: ['sveltekit.config.adapters'],

	content: [
		{
			type: 'text',
			content: `# SvelteKit Adapters

## Why Adapters Are a Fundamental Architecture Decision

SvelteKit is deployment-agnostic by design. Your application code (routes, load functions, actions, hooks) is written once and runs the same way regardless of where it deploys. The adapter is the translation layer that takes your universal SvelteKit application and transforms it into output that a specific platform understands.

This separation is deliberate and powerful. You can develop locally, deploy to Vercel for staging, and switch to a Docker container on your own infrastructure for production -- without changing a single line of application code. The adapter handles everything platform-specific: entry points, request/response translation, file layout, and bundling.

## How Adapters Work Under the Hood

When you run \`vite build\`, SvelteKit:

1. **Compiles your Svelte components** into optimized JavaScript
2. **Generates the route manifest** from your file system
3. **Bundles client-side code** into chunks (code-split per route)
4. **Bundles server-side code** into a server handler function
5. **Calls the adapter** with the server handler, client assets, and prerendered pages
6. **The adapter produces platform-specific output** in the configured directory

The adapter receives a standard interface: a handler function that accepts Web \`Request\` objects and returns Web \`Response\` objects. The adapter wraps this handler with platform-specific code. For Node.js, it creates an HTTP server. For Cloudflare, it creates a Worker script. For static hosting, it prerenders all pages and skips the handler entirely.

## adapter-node: Self-Hosted Server

\`adapter-node\` produces a standalone Node.js server that you can run anywhere Node.js is available -- VPS, Docker containers, Kubernetes, bare metal.

\`\`\`javascript
import adapter from '@sveltejs/adapter-node';

kit: {
  adapter: adapter({
    out: 'build',          // Output directory
    precompress: true,     // Generate .gz and .br files for static assets
    envPrefix: ''          // Environment variable prefix (default: none)
  })
}
\`\`\`

After building, run your app:
\`\`\`bash
node build/index.js
\`\`\`

Environment variables control runtime behavior:
- \`HOST\` -- bind address (default: \`0.0.0.0\`)
- \`PORT\` -- listen port (default: \`3000\`)
- \`ORIGIN\` -- the app's URL origin (required for CSRF protection in production)
- \`BODY_SIZE_LIMIT\` -- max request body size (default: \`512kb\`)

**Platform object:** \`adapter-node\` exposes the raw Node.js \`req\` and \`res\` objects via \`event.platform\`:
\`\`\`typescript
export const GET: RequestHandler = async ({ platform }) => {
  const req = platform?.req;  // Node's IncomingMessage
  return json({ ok: true });
};
\`\`\`

## adapter-static: Fully Static Sites

\`adapter-static\` prerenders every page at build time and produces plain HTML/CSS/JS files with no server requirement.

\`\`\`javascript
import adapter from '@sveltejs/adapter-static';

kit: {
  adapter: adapter({
    pages: 'build',      // Where to write HTML files
    assets: 'build',     // Where to write static assets
    fallback: '200.html', // SPA fallback (optional)
    precompress: true,
    strict: true          // Fail build if any page cannot be prerendered
  })
}
\`\`\`

**The fallback page** is critical for SPAs. Without it, only prerendered URLs work. With \`fallback: '200.html'\`, the hosting platform serves this file for any unmatched URL, and SvelteKit's client-side router takes over. Configure your hosting platform to serve the fallback:

- **Netlify:** Automatic with \`_redirects\` file
- **Vercel:** Automatic with \`vercel.json\` rewrites
- **Nginx:** \`try_files $uri $uri/ /200.html;\`
- **Apache:** \`.htaccess\` FallbackResource

**Constraints of adapter-static:**
- Every page must be prerenderable (no request-dependent data)
- Form actions do not work (no server to process them)
- Server load functions do not work at runtime
- API routes (\`+server.ts\`) only work if they are prerenderable (GET only, no dynamic params)

## adapter-vercel: Serverless and Edge

\`adapter-vercel\` auto-configures your app for Vercel's infrastructure:

\`\`\`javascript
import adapter from '@sveltejs/adapter-vercel';

kit: {
  adapter: adapter({
    runtime: 'nodejs20.x',  // or 'edge' for Cloudflare-compatible edge functions
    regions: ['iad1'],       // Deploy to specific regions
    memory: 1024,            // Memory limit in MB
    maxDuration: 30          // Timeout in seconds
  })
}
\`\`\`

Vercel-specific features:
- **ISR (Incremental Static Regeneration):** Set \`config.isr\` on routes to serve cached HTML that regenerates in the background
- **Edge functions:** Run server code at the edge for lower latency
- **Image optimization:** Vercel's image CDN works with SvelteKit's \`<enhanced:img>\`

You can also configure per-route overrides:
\`\`\`typescript
// +page.server.ts
export const config = {
  runtime: 'edge',         // This specific route runs at the edge
  regions: ['iad1', 'sfo1'] // Multi-region
};
\`\`\`

## adapter-cloudflare: Workers and Pages

\`adapter-cloudflare\` targets Cloudflare's edge network:

\`\`\`javascript
import adapter from '@sveltejs/adapter-cloudflare';

kit: {
  adapter: adapter({
    routes: {
      include: ['/*'],
      exclude: ['<all>']  // Exclude static assets from the worker
    }
  })
}
\`\`\`

Cloudflare provides \`platform.env\` for accessing Cloudflare bindings (KV, R2, D1, Queues):
\`\`\`typescript
export const load: PageServerLoad = async ({ platform }) => {
  const value = await platform?.env.MY_KV.get('key');
  return { value };
};
\`\`\`

## Platform Features via event.platform

Each adapter can expose platform-specific features through \`event.platform\`:

| Adapter | \`event.platform\` contents |
|---|---|
| adapter-node | \`{ req, res }\` -- Node.js request/response |
| adapter-vercel | \`{ request }\` -- Vercel request context |
| adapter-cloudflare | \`{ env, context, caches }\` -- CF bindings |
| adapter-static | Not available (no runtime) |

Using \`event.platform\` creates adapter-specific code. Wrap it in an abstraction if you want to maintain portability:
\`\`\`typescript
// $lib/server/storage.ts
export async function getFromKV(key: string, platform?: App.Platform) {
  if (platform?.env?.MY_KV) {
    return platform.env.MY_KV.get(key); // Cloudflare
  }
  return redis.get(key); // Fallback for Node.js
}
\`\`\`

## Decision Framework: Choosing Your Adapter

1. **Do you need a server at all?** If your site is purely content (blog, docs, marketing), use \`adapter-static\`.
2. **Are you deploying to a managed platform?** Use the platform-specific adapter (Vercel, Cloudflare, Netlify) for the best integration.
3. **Do you need maximum control?** Use \`adapter-node\` for Docker, Kubernetes, or any self-hosted setup.
4. **Are you unsure?** Use \`adapter-auto\` during development and switch to an explicit adapter before production.
5. **Do you need edge performance?** Use \`adapter-cloudflare\` or \`adapter-vercel\` with edge runtime.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.deployment.adapters'
		},
		{
			type: 'text',
			content: `## Configuring adapter-node

For a traditional Node.js server, use \`adapter-node\`. It outputs a standalone server you can run anywhere.

**Your task:** Configure the app to use adapter-node with custom output directory.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Static Site Generation

\`adapter-static\` prerenders your entire site at build time. Every page becomes a static HTML file -- no server needed.

**Task:** Configure adapter-static with a fallback page for SPA mode.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'svelte.config.node.js',
			path: '/svelte.config.node.js',
			language: 'typescript',
			content: `// TODO: Configure for Node.js deployment
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // TODO: Add adapter-node
  }
};

export default config;`
		},
		{
			name: 'svelte.config.static.js',
			path: '/svelte.config.static.js',
			language: 'typescript',
			content: `// TODO: Configure for static site generation
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // TODO: Add adapter-static
  }
};

export default config;`
		}
	],

	solutionFiles: [
		{
			name: 'svelte.config.node.js',
			path: '/svelte.config.node.js',
			language: 'typescript',
			content: `import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      out: 'build'
    })
  }
};

export default config;`
		},
		{
			name: 'svelte.config.static.js',
			path: '/svelte.config.static.js',
			language: 'typescript',
			content: `import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '200.html'
    })
  }
};

export default config;`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Configure adapter-node for Node.js deployment',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'adapter-node' },
						{ type: 'contains', value: 'adapter(' }
					]
				}
			},
			hints: [
				'Import the adapter: `import adapter from \'@sveltejs/adapter-node\';`.',
				'Add `adapter: adapter()` to the `kit` config.',
				'Pass `{ out: \'build\' }` to customize the output directory.'
			],
			conceptsTested: ['sveltekit.deployment.adapters']
		},
		{
			id: 'cp-2',
			description: 'Configure adapter-static for static site generation',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'adapter-static' },
						{ type: 'contains', value: 'fallback' }
					]
				}
			},
			hints: [
				'Import: `import adapter from \'@sveltejs/adapter-static\';`.',
				'Set `fallback: \'200.html\'` for SPA mode with client-side routing.',
				'The `pages` and `assets` options control where files are written.'
			],
			conceptsTested: ['sveltekit.deployment.platforms']
		}
	]
};
