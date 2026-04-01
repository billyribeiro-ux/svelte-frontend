import type { Lesson } from '$types/lesson';

export const pageOptions: Lesson = {
	id: 'sveltekit.ssr-and-rendering.page-options',
	slug: 'page-options',
	title: 'Page Options',
	description: 'Configure SSR, CSR, and prerendering per-page with exported constants.',
	trackId: 'sveltekit',
	moduleId: 'ssr-and-rendering',
	order: 2,
	estimatedMinutes: 10,
	concepts: ['sveltekit.rendering.page-options', 'sveltekit.rendering.prerender'],
	prerequisites: ['sveltekit.rendering.ssr'],

	content: [
		{
			type: 'text',
			content: `# Page Options

SvelteKit lets you configure rendering behavior per-page by exporting constants from \`+page.ts\` or \`+page.server.ts\`:

- \`export const ssr = false\` — disable server rendering
- \`export const csr = false\` — disable client rendering (no JS sent)
- \`export const prerender = true\` — generate static HTML at build time

These can also be set in \`+layout.ts\` to apply to all child pages.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.rendering.page-options'
		},
		{
			type: 'text',
			content: `## Prerendering Static Pages

Pages that don't depend on dynamic data can be prerendered at build time. This creates static HTML files that load instantly.

**Your task:** Mark the about page as prerenderable.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Disabling Client-Side Rendering

For pages that don't need interactivity — like a privacy policy — you can disable CSR to send zero JavaScript.

**Task:** Create a static page with \`csr = false\` that sends no JavaScript to the client.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'about/+page.ts',
			path: '/about/+page.ts',
			language: 'typescript',
			content: `// TODO: Enable prerendering for this page`
		},
		{
			name: 'about/+page.svelte',
			path: '/about/+page.svelte',
			language: 'svelte',
			content: `<h1>About Us</h1>
<p>This page can be prerendered since its content is static.</p>`
		},
		{
			name: 'privacy/+page.ts',
			path: '/privacy/+page.ts',
			language: 'typescript',
			content: `// TODO: Disable client-side rendering`
		},
		{
			name: 'privacy/+page.svelte',
			path: '/privacy/+page.svelte',
			language: 'svelte',
			content: `<h1>Privacy Policy</h1>
<p>This page needs no JavaScript — it's pure HTML content.</p>`
		}
	],

	solutionFiles: [
		{
			name: 'about/+page.ts',
			path: '/about/+page.ts',
			language: 'typescript',
			content: `export const prerender = true;`
		},
		{
			name: 'about/+page.svelte',
			path: '/about/+page.svelte',
			language: 'svelte',
			content: `<h1>About Us</h1>
<p>This page can be prerendered since its content is static.</p>`
		},
		{
			name: 'privacy/+page.ts',
			path: '/privacy/+page.ts',
			language: 'typescript',
			content: `export const csr = false;`
		},
		{
			name: 'privacy/+page.svelte',
			path: '/privacy/+page.svelte',
			language: 'svelte',
			content: `<h1>Privacy Policy</h1>
<p>This page needs no JavaScript — it's pure HTML content.</p>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Enable prerendering for the about page',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'export const prerender = true' }]
				}
			},
			hints: [
				'Export a constant named `prerender` set to `true`.',
				'This goes in the `+page.ts` file for the about page.',
				'Add `export const prerender = true;` to `about/+page.ts`.'
			],
			conceptsTested: ['sveltekit.rendering.prerender']
		},
		{
			id: 'cp-2',
			description: 'Disable client-side rendering for the privacy page',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'export const csr = false' }]
				}
			},
			hints: [
				'Export a constant named `csr` set to `false`.',
				'This tells SvelteKit not to send any JavaScript for this page.',
				'Add `export const csr = false;` to `privacy/+page.ts`.'
			],
			conceptsTested: ['sveltekit.rendering.page-options']
		}
	]
};
