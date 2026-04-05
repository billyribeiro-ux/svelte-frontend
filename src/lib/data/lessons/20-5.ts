import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-5',
		title: 'SEO Implementation',
		phase: 7,
		module: 20,
		lessonIndex: 5
	},
	description: `SEO is not a decoration — it is architecture. This capstone lesson wires together every SEO technique from Module 18 into a single reusable SEO component: dynamic <svelte:head> with title and meta, Open Graph and Twitter cards, canonical URLs, JSON-LD structured data for articles and products, a prerender strategy with a dynamic sitemap endpoint, and a robots.txt that matches your deploy target.

The result is one <SEO /> component you drop into every page and one +server.ts that produces a sitemap. Together they make every page discoverable, crawlable, and ranked.`,
	objectives: [
		'Build a reusable <SEO /> component that handles title, meta, OG, and canonical',
		'Generate JSON-LD structured data for articles and products',
		'Implement a dynamic sitemap.xml via a +server.ts endpoint',
		'Pick a prerender strategy per route (static, SSR, on-demand)',
		'Preview Google and Twitter card results for a given page'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Tab = 'seo-component' | 'json-ld' | 'sitemap' | 'prerender' | 'preview';
  let activeTab = $state<Tab>('seo-component');

  // Live SEO preview
  let title = $state('Ship Svelte 5 faster with Acme');
  let description = $state('Component kit and tooling for SvelteKit teams. Typed, accessible, production-ready.');
  let url = $state('https://acme.dev/features');
  let ogImage = $state('https://acme.dev/og/features.png');

  let googleTitle = $derived(title.length > 60 ? title.slice(0, 57) + '…' : title);
  let googleDesc = $derived(description.length > 155 ? description.slice(0, 152) + '…' : description);

  const seoComponent = \`<!-- src/lib/components/SEO.svelte -->
<script lang="ts">
  import { page } from '$app/state';

  type Props = {
    title: string;
    description: string;
    image?: string;
    type?: 'website' | 'article' | 'product';
    jsonLd?: Record<string, unknown>;
    noindex?: boolean;
    canonical?: string;
  };

  let {
    title,
    description,
    image = 'https://acme.dev/og/default.png',
    type = 'website',
    jsonLd,
    noindex = false,
    canonical
  }: Props = $props();

  const siteName = 'Acme';
  const twitter = '@acme_dev';

  const fullTitle = \\\`\\\${title} — \\\${siteName}\\\`;
  const canonicalUrl = canonical ?? \\\`https://acme.dev\\\${page.url.pathname}\\\`;
<\\/script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />

  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
  {:else}
    <meta name="robots" content="index, follow, max-image-preview:large" />
  {/if}

  <!-- Open Graph -->
  <meta property="og:site_name" content={siteName} />
  <meta property="og:type" content={type} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="og:image" content={image} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content={twitter} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />

  {#if jsonLd}
    {@html \\\`<script type="application/ld+json">\\\${JSON.stringify(jsonLd)}</scr\\\` + \\\`ipt>\\\`}
  {/if}
</svelte:head>

<!-- Usage in a page -->
<script lang="ts">
  import SEO from '$lib/components/SEO.svelte';
<\\/script>

<SEO
  title="Features"
  description="Everything that ships in Acme 1.0"
  image="https://acme.dev/og/features.png"
/>\`;

  const jsonLdCode = \`// src/lib/seo/schemas.ts — typed JSON-LD helpers

export function articleSchema(params: {
  title: string;
  description: string;
  image: string;
  url: string;
  author: string;
  published: string;
  modified: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    image: [params.image],
    datePublished: params.published,
    dateModified: params.modified,
    author: {
      '@type': 'Person',
      name: params.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'Acme',
      logo: {
        '@type': 'ImageObject',
        url: 'https://acme.dev/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': params.url
    }
  };
}

export function productSchema(params: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock';
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    description: params.description,
    image: params.image,
    offers: {
      '@type': 'Offer',
      price: params.price,
      priceCurrency: params.currency,
      availability: \\\`https://schema.org/\\\${params.availability}\\\`
    }
  };
}

// In src/routes/blog/[slug]/+page.svelte
<script lang="ts">
  import SEO from '$lib/components/SEO.svelte';
  import { articleSchema } from '$lib/seo/schemas';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const jsonLd = articleSchema({
    title: data.post.title,
    description: data.post.excerpt,
    image: data.post.cover,
    url: \\\`https://acme.dev/blog/\\\${data.post.slug}\\\`,
    author: data.post.author,
    published: data.post.publishedAt,
    modified: data.post.updatedAt
  });
<\\/script>

<SEO
  title={data.post.title}
  description={data.post.excerpt}
  image={data.post.cover}
  type="article"
  {jsonLd}
/>\`;

  const sitemapCode = \`// src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from './$types';
import { getAllPosts } from '$lib/server/posts';
import { getAllProducts } from '$lib/server/products';

const site = 'https://acme.dev';

const staticRoutes = ['/', '/about', '/pricing', '/blog', '/contact'];

export const GET: RequestHandler = async () => {
  const posts = await getAllPosts();
  const products = await getAllProducts();

  const urls = [
    ...staticRoutes.map((path) => ({
      loc: site + path,
      changefreq: 'weekly',
      priority: path === '/' ? 1.0 : 0.8
    })),
    ...posts.map((p) => ({
      loc: \\\`\\\${site}/blog/\\\${p.slug}\\\`,
      lastmod: p.updatedAt,
      changefreq: 'monthly',
      priority: 0.7
    })),
    ...products.map((p) => ({
      loc: \\\`\\\${site}/products/\\\${p.slug}\\\`,
      lastmod: p.updatedAt,
      changefreq: 'weekly',
      priority: 0.9
    }))
  ];

  const xml = \\\`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\\\${urls.map((u) => \\\`  <url>
    <loc>\\\${u.loc}</loc>
    \\\${u.lastmod ? \\\`<lastmod>\\\${u.lastmod}</lastmod>\\\` : ''}
    <changefreq>\\\${u.changefreq}</changefreq>
    <priority>\\\${u.priority}</priority>
  </url>\\\`).join('\\\\n')}
</urlset>\\\`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=0, s-maxage=3600'
    }
  });
};

// src/routes/robots.txt/+server.ts
export const GET: RequestHandler = () => {
  const body = \\\`User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api
Sitemap: \\\${site}/sitemap.xml\\\`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' }
  });
};\`;

  const prerenderCode = \`// Per-route prerender strategy

// 1. Marketing pages — fully prerendered at build time
// src/routes/(marketing)/+layout.ts
export const prerender = true;

// 2. Blog — prerender all posts from the loader
// src/routes/blog/[slug]/+page.server.ts
export const prerender = true;
export const entries = async () => {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
};

// 3. Dashboard — never prerender (per-user data)
// src/routes/(app)/+layout.ts
export const prerender = false;
export const ssr = true;

// 4. Sitemap — prerender once
// src/routes/sitemap.xml/+server.ts
export const prerender = true;

// svelte.config.js — disallow accidental non-prerendered links
export default {
  kit: {
    prerender: {
      crawl: true,
      entries: ['*'],
      handleHttpError: ({ path, status }) => {
        if (path.startsWith('/api')) return;
        throw new Error(\\\`\\\${status} on \\\${path}\\\`);
      }
    }
  }
};\`;
</script>

<main>
  <h1>SEO Implementation</h1>
  <p class="subtitle">A complete SEO stack for the capstone</p>

  <nav class="tabs" aria-label="Sections">
    <button class:active={activeTab === 'seo-component'} onclick={() => (activeTab = 'seo-component')}>SEO Component</button>
    <button class:active={activeTab === 'json-ld'} onclick={() => (activeTab = 'json-ld')}>JSON-LD</button>
    <button class:active={activeTab === 'sitemap'} onclick={() => (activeTab = 'sitemap')}>Sitemap</button>
    <button class:active={activeTab === 'prerender'} onclick={() => (activeTab = 'prerender')}>Prerender</button>
    <button class:active={activeTab === 'preview'} onclick={() => (activeTab = 'preview')}>Live Preview</button>
  </nav>

  {#if activeTab === 'seo-component'}
    <section>
      <h2>Reusable &lt;SEO /&gt; Component</h2>
      <pre><code>{seoComponent}</code></pre>
    </section>
  {:else if activeTab === 'json-ld'}
    <section>
      <h2>JSON-LD Structured Data</h2>
      <p>JSON-LD tells search engines the <em>meaning</em> of your content. Articles get rich snippets; products get price/availability cards.</p>
      <pre><code>{jsonLdCode}</code></pre>
    </section>
  {:else if activeTab === 'sitemap'}
    <section>
      <h2>Dynamic Sitemap + robots.txt</h2>
      <pre><code>{sitemapCode}</code></pre>
    </section>
  {:else if activeTab === 'prerender'}
    <section>
      <h2>Prerender Strategy</h2>
      <pre><code>{prerenderCode}</code></pre>
    </section>
  {:else}
    <section>
      <h2>Live SERP + Card Preview</h2>
      <div class="preview-controls">
        <label>Title <input bind:value={title} /></label>
        <label>Description <textarea rows={2} bind:value={description}></textarea></label>
        <label>URL <input bind:value={url} /></label>
        <label>OG Image URL <input bind:value={ogImage} /></label>
      </div>

      <h3>Google Search Result</h3>
      <div class="google-result">
        <div class="g-url">{url}</div>
        <div class="g-title">{googleTitle}</div>
        <div class="g-desc">{googleDesc}</div>
      </div>

      <h3>Open Graph / Twitter Card</h3>
      <div class="og-card">
        <div class="og-image" style="background-image: linear-gradient(135deg, oklch(0.7 0.18 250), oklch(0.7 0.18 320))"></div>
        <div class="og-body">
          <div class="og-domain">acme.dev</div>
          <div class="og-title">{title}</div>
          <div class="og-desc">{description}</div>
        </div>
      </div>
    </section>
  {/if}
</main>

<style>
  main { max-width: 920px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  .subtitle { color: #666; margin-bottom: 1.5rem; }

  .tabs { display: flex; gap: 0.35rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0; flex-wrap: wrap; }
  .tabs button { padding: 0.55rem 1rem; border: none; background: transparent; border-radius: 6px 6px 0 0; font-weight: 500; cursor: pointer; font-size: 0.86rem; }
  .tabs button.active { background: #eef4fb; color: #1e40af; }

  section { margin-bottom: 2rem; }
  h2 { margin-top: 0; }
  h3 { margin-top: 1.25rem; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.74rem;
    line-height: 1.5;
    max-height: 620px;
  }
  pre code { background: none; padding: 0; }
  code { background: #f0f0f0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }

  .preview-controls {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 10px;
    margin-bottom: 1rem;
  }
  .preview-controls label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; font-weight: 600; }
  .preview-controls input, .preview-controls textarea {
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.85rem;
  }

  .google-result {
    padding: 1rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-family: 'Arial', sans-serif;
  }
  .g-url { color: #202124; font-size: 0.82rem; }
  .g-title { color: #1a0dab; font-size: 1.25rem; margin: 0.15rem 0; }
  .g-desc { color: #4d5156; font-size: 0.88rem; line-height: 1.45; }

  .og-card {
    max-width: 520px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    overflow: hidden;
    background: white;
  }
  .og-image {
    aspect-ratio: 1200/630;
    background-size: cover;
  }
  .og-body { padding: 0.75rem 1rem; }
  .og-domain { color: #888; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; }
  .og-title { font-weight: 700; font-size: 1rem; margin: 0.2rem 0; }
  .og-desc { color: #666; font-size: 0.85rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
