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

The \`svelte.config.js\` file is the central configuration for your SvelteKit project. It controls:

- **Adapters** — how your app is deployed (Node, static, Vercel, etc.)
- **Aliases** — path shortcuts like \`$lib\`, \`$components\`
- **Preprocess** — transform files before compilation (TypeScript, SCSS, etc.)
- **Kit options** — CSP, paths, version, and more`
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
