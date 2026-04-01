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

Adapters transform your SvelteKit app for different deployment platforms. They run at build time and produce output optimized for the target environment.

**Built-in adapters:**
- \`adapter-auto\` — auto-detects the platform
- \`adapter-node\` — Node.js server
- \`adapter-static\` — fully static site (no server)
- \`adapter-vercel\` — Vercel with edge/serverless functions
- \`adapter-cloudflare\` — Cloudflare Workers/Pages`
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

\`adapter-static\` prerenders your entire site at build time. Every page becomes a static HTML file — no server needed.

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
