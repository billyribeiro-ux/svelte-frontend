import type { Lesson } from '$types/lesson';

export const deployment: Lesson = {
	id: 'sveltekit.advanced-sveltekit.deployment',
	slug: 'deployment',
	title: 'Building & Deploying',
	description: 'Build, preview, and deploy your SvelteKit app to production.',
	trackId: 'sveltekit',
	moduleId: 'advanced-sveltekit',
	order: 3,
	estimatedMinutes: 10,
	concepts: ['sveltekit.deployment.build', 'sveltekit.deployment.preview'],
	prerequisites: ['sveltekit.deployment.adapters'],

	content: [
		{
			type: 'text',
			content: `# Building and Deploying

The deployment process for SvelteKit is straightforward:

1. **Build** — \`vite build\` compiles your app using the configured adapter
2. **Preview** — \`vite preview\` lets you test the production build locally
3. **Deploy** — upload the output to your hosting platform

The build output depends on your adapter — Node.js server, static files, serverless functions, etc.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.deployment.build'
		},
		{
			type: 'text',
			content: `## Build Commands

SvelteKit uses Vite under the hood. The standard build commands are:

\`\`\`bash
npm run build    # Build for production
npm run preview  # Preview the production build
\`\`\`

**Your task:** Review the package.json scripts and understand the build pipeline.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Environment-Specific Configuration

Different environments may need different settings. Use environment variables and adapter options to customize.

**Task:** Create a production-ready configuration with proper settings.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'package.json',
			path: '/package.json',
			language: 'typescript',
			content: `{
  "name": "my-sveltekit-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview"
  }
}`
		},
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
    // TODO: Add production-ready settings
  }
};

export default config;`
		}
	],

	solutionFiles: [
		{
			name: 'package.json',
			path: '/package.json',
			language: 'typescript',
			content: `{
  "name": "my-sveltekit-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json"
  }
}`
		},
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
    csp: {
      directives: {
        'script-src': ['self']
      }
    },
    version: {
      name: process.env.npm_package_version
    }
  }
};

export default config;`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Understand the build and preview commands',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'vite build' },
						{ type: 'contains', value: 'vite preview' }
					]
				}
			},
			hints: [
				'The `build` script runs `vite build` to create the production output.',
				'The `preview` script runs `vite preview` to test locally.',
				'Consider adding a `check` script for type-checking: `svelte-kit sync && svelte-check`.'
			],
			conceptsTested: ['sveltekit.deployment.build']
		},
		{
			id: 'cp-2',
			description: 'Add production-ready configuration settings',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'regex', value: '(csp|version|prerender)' }]
				}
			},
			hints: [
				'Add CSP (Content Security Policy) directives for security.',
				'Set `version.name` to track deployed versions.',
				'These settings improve security and observability in production.'
			],
			conceptsTested: ['sveltekit.deployment.preview']
		}
	]
};
