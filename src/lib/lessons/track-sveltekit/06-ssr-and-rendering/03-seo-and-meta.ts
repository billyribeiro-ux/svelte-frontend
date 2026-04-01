import type { Lesson } from '$types/lesson';

export const seoAndMeta: Lesson = {
	id: 'sveltekit.ssr-and-rendering.seo-and-meta',
	slug: 'seo-and-meta',
	title: 'SEO & Meta Tags',
	description: 'Optimize for search engines with svelte:head, meta tags, and Open Graph data.',
	trackId: 'sveltekit',
	moduleId: 'ssr-and-rendering',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['sveltekit.rendering.seo', 'sveltekit.rendering.meta'],
	prerequisites: ['sveltekit.rendering.ssr'],

	content: [
		{
			type: 'text',
			content: `# SEO & Meta Tags

Because SvelteKit server-renders pages, search engines can crawl your content. You control the \`<head>\` of each page using the \`<svelte:head>\` special element.

This lets you set the page title, meta description, Open Graph tags, and structured data — all rendered server-side for perfect SEO.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.rendering.seo'
		},
		{
			type: 'text',
			content: `## Setting Page Title and Description

Use \`<svelte:head>\` to inject elements into the document's \`<head>\`.

**Your task:** Add a title and meta description to the page.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Open Graph Tags

Open Graph tags control how your page appears when shared on social media. They go inside \`<svelte:head>\` as \`<meta>\` tags.

**Task:** Add Open Graph tags for title, description, and image.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Dynamic Meta Tags

Meta tags can use dynamic data from load functions. This is essential for blog posts, product pages, and other content-driven pages.

**Task:** Set meta tags dynamically based on loaded data.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<!-- TODO: Add svelte:head with title and meta tags -->

<h1>{data.title}</h1>
<p>{data.description}</p>`
		},
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    title: 'My SvelteKit App',
    description: 'A blazing fast web application built with SvelteKit.',
    image: 'https://example.com/og-image.png'
  };
};`
		}
	],

	solutionFiles: [
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.title}</title>
  <meta name="description" content={data.description} />
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={data.description} />
  <meta property="og:image" content={data.image} />
  <meta property="og:type" content="website" />
</svelte:head>

<h1>{data.title}</h1>
<p>{data.description}</p>`
		},
		{
			name: '+page.server.ts',
			path: '/+page.server.ts',
			language: 'typescript',
			content: `import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  return {
    title: 'My SvelteKit App',
    description: 'A blazing fast web application built with SvelteKit.',
    image: 'https://example.com/og-image.png'
  };
};`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add a title and meta description using svelte:head',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<svelte:head>' },
						{ type: 'contains', value: '<title>' },
						{ type: 'contains', value: 'name="description"' }
					]
				}
			},
			hints: [
				'Add a `<svelte:head>` block to your component.',
				'Put a `<title>` element inside it.',
				'Add `<meta name="description" content="..." />` for the description.'
			],
			conceptsTested: ['sveltekit.rendering.seo']
		},
		{
			id: 'cp-2',
			description: 'Add Open Graph meta tags',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'og:title' },
						{ type: 'contains', value: 'og:description' }
					]
				}
			},
			hints: [
				'Open Graph tags use `property` instead of `name`.',
				'Add `<meta property="og:title" content="..." />`.',
				'Include `og:title`, `og:description`, and `og:image` for complete social sharing.'
			],
			conceptsTested: ['sveltekit.rendering.meta']
		},
		{
			id: 'cp-3',
			description: 'Use dynamic data from load functions in meta tags',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'regex', value: 'content=\\{data\\.' }]
				}
			},
			hints: [
				'Use Svelte expressions inside the `content` attribute.',
				'Set `content={data.title}` to use data from the load function.',
				'All meta tags can use dynamic values: `<meta property="og:title" content={data.title} />`.'
			],
			conceptsTested: ['sveltekit.rendering.seo']
		}
	]
};
