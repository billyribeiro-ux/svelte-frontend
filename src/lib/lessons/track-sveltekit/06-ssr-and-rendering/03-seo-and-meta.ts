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

## Why SSR Makes SEO Work

Search engine optimization in modern web apps depends on one critical factor: can Google's crawler see your content? Googlebot does execute JavaScript, but it is slow, resource-limited, and may not wait for all your async data to load. Pages that rely entirely on client-side rendering often have incomplete or delayed indexing.

SvelteKit's SSR solves this by delivering complete HTML on the first response. When Googlebot requests \`/blog/my-post\`, it receives the full article text, meta tags, and structured data in the initial HTML -- no JavaScript execution needed. This is the single biggest SEO advantage of SSR frameworks over CSR-only solutions.

But SSR alone is not sufficient for SEO. You also need to control the \`<head>\` element: the page title, meta description, canonical URL, Open Graph tags for social sharing, and structured data for rich search results.

## svelte:head: Controlling the Document Head

Svelte provides a special element \`<svelte:head>\` that injects content into the document's \`<head>\`. During SSR, this content is included in the initial HTML response. During client-side navigation, SvelteKit dynamically updates the head:

\`\`\`svelte
<svelte:head>
  <title>My Blog Post | MySite</title>
  <meta name="description" content="A detailed guide to SvelteKit SEO" />
  <link rel="canonical" href="https://mysite.com/blog/sveltekit-seo" />
</svelte:head>
\`\`\`

Every component can include \`<svelte:head>\`. When multiple components set \`<title>\`, the last one wins (deepest component in the tree). This naturally means page-level titles override layout-level titles.

## The Essential Meta Tags

**Title tag** -- the most important single SEO element:
\`\`\`svelte
<title>{data.title} | MySite</title>
\`\`\`
- Keep under 60 characters (Google truncates longer titles)
- Include the primary keyword
- Make each page title unique

**Meta description** -- appears in search results:
\`\`\`svelte
<meta name="description" content={data.excerpt} />
\`\`\`
- Keep between 120-160 characters
- Write compelling copy that encourages clicks
- Include relevant keywords naturally

**Canonical URL** -- prevents duplicate content issues:
\`\`\`svelte
<link rel="canonical" href={\`https://mysite.com\${page.url.pathname}\`} />
\`\`\`
- Essential for pages accessible via multiple URLs
- Tells search engines which version is the "real" one

## Open Graph Tags: Social Media Previews

Open Graph (OG) tags control how your page appears when shared on social media (Facebook, LinkedIn, Slack, Discord, iMessage):

\`\`\`svelte
<svelte:head>
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={data.excerpt} />
  <meta property="og:image" content={data.ogImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content={\`https://mysite.com\${page.url.pathname}\`} />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="MySite" />
</svelte:head>
\`\`\`

**Twitter/X card tags** (for Twitter-specific previews):
\`\`\`svelte
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={data.title} />
<meta name="twitter:description" content={data.excerpt} />
<meta name="twitter:image" content={data.ogImage} />
\`\`\`

The OG image is the single most impactful element for social sharing engagement. Use 1200x630 pixels for optimal display across platforms.

## Dynamic Meta Tags from Load Functions

The real power comes from combining load functions with dynamic meta tags:

\`\`\`typescript
// blog/[slug]/+page.server.ts
export const load: PageServerLoad = async ({ params }) => {
  const post = await getPost(params.slug);
  if (!post) error(404, 'Post not found');

  return {
    title: post.title,
    excerpt: post.excerpt,
    ogImage: post.coverImage ?? 'https://mysite.com/default-og.png',
    publishedAt: post.publishedAt,
    author: post.author.name
  };
};
\`\`\`

\`\`\`svelte
<!-- blog/[slug]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.title} | MySite Blog</title>
  <meta name="description" content={data.excerpt} />
  <meta property="og:title" content={data.title} />
  <meta property="og:description" content={data.excerpt} />
  <meta property="og:image" content={data.ogImage} />
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content={data.publishedAt} />
  <meta property="article:author" content={data.author} />
  <link rel="canonical" href={\`https://mysite.com\${page.url.pathname}\`} />
</svelte:head>
\`\`\`

Because this renders during SSR, social media crawlers (which rarely execute JavaScript) see the correct meta tags in the initial HTML response.

## Structured Data: Rich Search Results

Structured data (JSON-LD) tells search engines about the content type and properties, enabling rich results like recipe cards, product ratings, FAQ dropdowns, and breadcrumbs:

\`\`\`svelte
<svelte:head>
  {@html \`<script type="application/ld+json">
    \${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": data.title,
      "description": data.excerpt,
      "author": {
        "@type": "Person",
        "name": data.author
      },
      "datePublished": data.publishedAt,
      "image": data.ogImage
    })}
  </script>\`}
</svelte:head>
\`\`\`

Use \`{@html}\` because structured data is a script tag that must not be escaped by Svelte.

## Core Web Vitals and Performance SEO

Google uses Core Web Vitals as ranking factors. SvelteKit's architecture inherently supports good scores:

- **LCP (Largest Contentful Paint):** SSR delivers content in the initial HTML, enabling fast LCP. Ensure images have explicit width/height attributes and use responsive images.
- **FID/INP (Interaction to Next Paint):** Svelte's compiled output produces minimal JavaScript, keeping the main thread responsive. Avoid heavy computations during hydration.
- **CLS (Cumulative Layout Shift):** Set explicit dimensions on images and ads. Avoid injecting content above the fold after initial render.

Key optimizations:
- Use \`<link rel="preload">\` in \`<svelte:head>\` for critical resources
- Leverage SvelteKit's automatic code splitting (each page only loads its own JavaScript)
- Use \`prerender\` for static pages to eliminate server computation entirely

## Building a Reusable SEO Component

A common pattern is creating a reusable component for meta tags:

\`\`\`svelte
<!-- src/lib/components/SEO.svelte -->
<script lang="ts">
  import { page } from '$app/state';

  let { title, description, image, type = 'website' }: {
    title: string;
    description: string;
    image?: string;
    type?: string;
  } = $props();

  const siteName = 'MySite';
  const origin = 'https://mysite.com';
  const defaultImage = \`\${origin}/default-og.png\`;
</script>

<svelte:head>
  <title>{title} | {siteName}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={\`\${origin}\${page.url.pathname}\`} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image ?? defaultImage} />
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={siteName} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
\`\`\`

Then use it in every page:
\`\`\`svelte
<SEO title={data.title} description={data.excerpt} image={data.ogImage} />
\`\`\``
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
