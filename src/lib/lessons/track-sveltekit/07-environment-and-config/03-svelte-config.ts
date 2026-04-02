import type { Lesson } from '$types/lesson';

export const svelteConfig: Lesson = {
	id: 'sveltekit.environment-and-config.svelte-config',
	slug: 'svelte-config',
	title: 'SvelteKit Configuration',
	description: 'Configure svelte.config.js with adapters, aliases, and preprocessing.',
	trackId: 'sveltekit',
	moduleId: 'environment-and-config',
	order: 3,
	estimatedMinutes: 10,
	concepts: ['sveltekit.config.adapters', 'sveltekit.config.aliases'],
	prerequisites: ['sveltekit.routing.file-based'],

	content: [
		{
			type: 'text',
			content: `# SvelteKit Configuration

## Why Configuration Matters for Architecture

The \`svelte.config.js\` file is the central configuration for your SvelteKit project. Unlike many frameworks where configuration is scattered across multiple files, SvelteKit consolidates critical decisions into one place. The choices you make here directly affect your deployment target, build output, module resolution, and security policy.

Understanding these options is not just about "filling in the config file" -- it is about making informed architectural decisions that shape how your application is built and deployed.

## The Configuration Structure

\`\`\`javascript
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Preprocessors -- transform files before Svelte compilation
  preprocess: vitePreprocess(),

  kit: {
    // Adapter -- how the app is built for deployment
    adapter: adapter(),

    // Path aliases -- shorthand imports
    alias: {
      $components: 'src/lib/components',
      $utils: 'src/lib/utils'
    },

    // Security -- Content Security Policy
    csp: {
      directives: {
        'script-src': ['self']
      }
    },

    // Paths -- base path and asset paths
    paths: {
      base: '',      // For apps not at the domain root
      assets: ''     // CDN URL for static assets
    },

    // Prerendering -- control static generation
    prerender: {
      entries: ['*'],        // Which pages to discover
      handleHttpError: 'warn' // What to do with broken links
    },

    // Version management
    version: {
      name: process.env.npm_package_version,
      pollInterval: 0 // Check for updates (ms), 0 = disabled
    },

    // Environment variable prefix
    env: {
      publicPrefix: 'PUBLIC_' // Default
    }
  }
};

export default config;
\`\`\`

## The Adapter Decision Tree

Choosing an adapter is the most consequential configuration decision. It determines where and how your app runs:

**Do you need server-side rendering?**
- No -> \`adapter-static\` (fully static site, no server)
- Yes -> Continue below

**Are you deploying to a specific platform?**
- Vercel -> \`adapter-vercel\` (auto-configures serverless/edge functions)
- Cloudflare -> \`adapter-cloudflare\` (Workers/Pages)
- Netlify -> \`adapter-netlify\` (serverless functions)
- AWS Lambda -> \`adapter-aws\` (community) or \`adapter-node\` behind API Gateway
- Not sure yet -> \`adapter-auto\` (detects platform at build time)

**Are you running your own infrastructure?**
- Docker/VPS/bare metal -> \`adapter-node\` (standalone Node.js server)

**\`adapter-auto\`** is the default for new projects. It detects the deployment platform during build and selects the right adapter automatically. This is convenient for development but should be replaced with an explicit adapter before production deployment for predictability.

**\`adapter-node\`** produces a standalone Node.js server. You get full control over the runtime -- environment variables, process management, clustering. Output goes to the \`build/\` directory by default:

\`\`\`javascript
import adapter from '@sveltejs/adapter-node';

kit: {
  adapter: adapter({
    out: 'build',
    precompress: true,  // Generate .gz and .br files
    envPrefix: ''       // Allow any env var name
  })
}
\`\`\`

**\`adapter-static\`** generates a completely static site. Every page is prerendered to HTML. No server is needed -- just upload the files to any static hosting:

\`\`\`javascript
import adapter from '@sveltejs/adapter-static';

kit: {
  adapter: adapter({
    pages: 'build',
    assets: 'build',
    fallback: '200.html',  // SPA fallback page
    precompress: true
  })
}
\`\`\`

The \`fallback\` option is key for SPAs. When set, the adapter generates a fallback HTML page that handles client-side routing. Without it, navigating directly to \`/about\` returns a 404 because there is no \`about.html\` file (unless the page is prerendered).

## Path Aliases: Clean Imports

SvelteKit gives you \`$lib\` by default, aliased to \`src/lib\`. Custom aliases make imports cleaner and refactoring easier:

\`\`\`javascript
alias: {
  $components: 'src/lib/components',
  $utils: 'src/lib/utils',
  $stores: 'src/lib/stores',
  $server: 'src/lib/server'
}
\`\`\`

Now instead of:
\`\`\`typescript
import Button from '../../../lib/components/Button.svelte';
\`\`\`

You write:
\`\`\`typescript
import Button from '$components/Button.svelte';
\`\`\`

Aliases are resolved at build time by Vite. They work in TypeScript, Svelte files, and regular JavaScript. SvelteKit automatically updates \`tsconfig.json\` paths to match your aliases for editor intellisense.

## Content Security Policy (CSP)

CSP protects against XSS attacks by controlling which resources the browser can load. SvelteKit has first-class CSP support:

\`\`\`javascript
csp: {
  directives: {
    'script-src': ['self'],
    'style-src': ['self', 'unsafe-inline'], // Svelte uses inline styles
    'img-src': ['self', 'https://cdn.example.com'],
    'connect-src': ['self', 'https://api.example.com']
  },
  mode: 'auto' // 'hash', 'nonce', or 'auto'
}
\`\`\`

In \`auto\` mode, SvelteKit uses hashes for prerendered pages (deterministic content) and nonces for server-rendered pages (dynamic content). This provides strong CSP protection without manual nonce management.

## Preprocessing: TypeScript, SCSS, and More

The \`preprocess\` option controls how files are transformed before Svelte compilation. \`vitePreprocess()\` handles TypeScript, PostCSS, and SCSS out of the box:

\`\`\`javascript
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

preprocess: vitePreprocess()
\`\`\`

For additional preprocessing (like mdsvex for Markdown in Svelte files):
\`\`\`javascript
import { mdsvex } from 'mdsvex';

preprocess: [vitePreprocess(), mdsvex()]
\`\`\`

Preprocessors run in order. Each one transforms the file before the next one sees it. Put language-level transforms (TypeScript) before content-level transforms (Markdown).

## Version Management and Client Updates

The \`version\` config enables version-aware updates:

\`\`\`javascript
version: {
  name: process.env.npm_package_version,
  pollInterval: 60000 // Check every 60 seconds
}
\`\`\`

When \`pollInterval\` is set, SvelteKit periodically checks if a new version has been deployed. If the version changes, subsequent navigations trigger a full page reload to fetch the new code. This prevents users from running stale JavaScript after a deployment.

You can also detect version changes manually:
\`\`\`svelte
<script>
  import { updated } from '$app/state';
</script>

{#if updated.current}
  <div class="update-banner">
    A new version is available.
    <button onclick={() => location.reload()}>Reload</button>
  </div>
{/if}
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.config.adapters'
		},
		{
			type: 'text',
			content: `## Setting Up an Adapter

Every SvelteKit app needs an adapter. It transforms your app for the target platform.

**Your task:** Configure \`svelte.config.js\` with the auto adapter and add a custom alias.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Adding Path Aliases

Custom aliases make imports cleaner. SvelteKit gives you \`$lib\` by default, but you can add more.

**Task:** Add a \`$components\` alias pointing to \`src/lib/components\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'svelte.config.js',
			path: '/svelte.config.js',
			language: 'typescript',
			content: `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    // TODO: Configure adapter and aliases
  }
};

export default config;`
		}
	],

	solutionFiles: [
		{
			name: 'svelte.config.js',
			path: '/svelte.config.js',
			language: 'typescript',
			content: `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    alias: {
      $components: 'src/lib/components',
      $utils: 'src/lib/utils'
    }
  }
};

export default config;`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Configure the adapter in svelte.config.js',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'adapter:' }]
				}
			},
			hints: [
				'Add `adapter: adapter()` to the `kit` object.',
				'The adapter-auto package automatically selects the right adapter for your deploy target.',
				'You can replace it with adapter-node, adapter-static, etc. for specific platforms.'
			],
			conceptsTested: ['sveltekit.config.adapters']
		},
		{
			id: 'cp-2',
			description: 'Add custom path aliases',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'alias:' },
						{ type: 'contains', value: '$components' }
					]
				}
			},
			hints: [
				'Add an `alias` object inside the `kit` config.',
				'Map `$components` to `src/lib/components`.',
				'You can then import with `import Button from \'$components/Button.svelte\';`.'
			],
			conceptsTested: ['sveltekit.config.aliases']
		}
	]
};
