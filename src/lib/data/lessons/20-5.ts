import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '20-5',
		title: 'SEO Implementation',
		phase: 7,
		module: 20,
		lessonIndex: 5
	},
	description: `This capstone lesson brings together every SEO technique from Module 18: dynamic <svelte:head> with title and meta tags, JSON-LD structured data, XML sitemap generation, prerendering strategy, and Core Web Vitals optimization. Applied together, these techniques ensure your capstone project is fully discoverable, crawlable, and ranked by search engines.

The goal is a complete SEO implementation that you can adapt to any SvelteKit project.`,
	objectives: [
		'Implement a complete <svelte:head> SEO component with dynamic meta and OG tags',
		'Add JSON-LD structured data schemas to key pages',
		'Generate a dynamic XML sitemap and configure robots.txt',
		'Apply prerendering to static pages for maximum SEO performance'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Complete SEO implementation for a capstone project

  type PageSEO = {
    title: string;
    description: string;
    url: string;
    image: string;
    type: 'website' | 'article';
    author?: string;
    publishedAt?: string;
    modifiedAt?: string;
  };

  let pageSeo = $state<PageSEO>({
    title: 'My SvelteKit Capstone',
    description: 'A production-ready SvelteKit application with full SEO, structured data, and Core Web Vitals optimization.',
    url: 'https://my-capstone.com',
    image: 'https://my-capstone.com/og-image.jpg',
    type: 'website'
  });

  // SEO Component code
  const seoComponentCode = \`<!-- src/lib/components/SEO.svelte -->
<script lang="ts">
  let {
    title,
    description,
    url,
    image = 'https://my-capstone.com/default-og.jpg',
    type = 'website',
    author,
    publishedAt,
    modifiedAt,
    noindex = false
  }: {
    title: string;
    description: string;
    url: string;
    image?: string;
    type?: 'website' | 'article';
    author?: string;
    publishedAt?: string;
    modifiedAt?: string;
    noindex?: boolean;
  } = $props();

  const siteName = 'My Capstone';
  const fullTitle = \\\`\\\${title} — \\\${siteName}\\\`;
<\\/script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />

  {#if noindex}
    <meta name="robots" content="noindex, nofollow" />
  {/if}

  <!-- Open Graph -->
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={image} />
  <meta property="og:type" content={type} />
  <meta property="og:site_name" content={siteName} />

  {#if type === 'article' && publishedAt}
    <meta property="article:published_time" content={publishedAt} />
    {#if modifiedAt}
      <meta property="article:modified_time" content={modifiedAt} />
    {/if}
    {#if author}
      <meta property="article:author" content={author} />
    {/if}
  {/if}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
</svelte:head>\`;

  // JSON-LD helper code
  const jsonLdCode = \`// src/lib/utils/jsonld.ts
export function articleSchema(data: {
  title: string;
  description: string;
  url: string;
  image: string;
  author: string;
  publishedAt: string;
  modifiedAt: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: data.image,
    author: { '@type': 'Person', name: data.author },
    datePublished: data.publishedAt,
    dateModified: data.modifiedAt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': data.url }
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// Usage in +page.svelte:
// {@html \\\`<script type="application/ld+json">
//   \\\${JSON.stringify(articleSchema(data.post))}
// </script>\\\`}\`;

  // Sitemap endpoint code
  const sitemapCode = \`// src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from './$types';
import { fetchAllPosts } from '$lib/server/posts';

export const prerender = true;

export const GET: RequestHandler = async () => {
  const posts = await fetchAllPosts();
  const pages = ['', '/about', '/blog', '/pricing'];
  const baseUrl = 'https://my-capstone.com';

  const sitemap = \\\`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  \\\${pages.map(page => \\\`<url>
    <loc>\\\${baseUrl}\\\${page}</loc>
    <changefreq>\\\${page === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>\\\${page === '' ? '1.0' : '0.7'}</priority>
  </url>\\\`).join('\\n  ')}
  \\\${posts.map(post => \\\`<url>
    <loc>\\\${baseUrl}/blog/\\\${post.slug}</loc>
    <lastmod>\\\${post.updatedAt}</lastmod>
    <priority>0.8</priority>
  </url>\\\`).join('\\n  ')}
</urlset>\\\`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  });
};\`;

  // Prerender config code
  const prerenderCode = \`// Static pages — prerender for max speed + SEO
// src/routes/+page.ts
export const prerender = true;  // Homepage

// src/routes/about/+page.ts
export const prerender = true;  // About page

// src/routes/blog/+page.ts
export const prerender = true;  // Blog listing

// src/routes/blog/[slug]/+page.ts
export const prerender = true;  // Each blog post

// Dynamic pages — SSR for fresh data + SEO
// src/routes/search/+page.ts (default SSR)

// Private pages — CSR only, no SEO needed
// src/routes/(app)/+layout.ts
export const ssr = false;       // Dashboard area\`;

  type SEOChecklist = {
    category: string;
    items: { task: string; status: 'done' | 'pending' }[];
  };

  let checklist = $state<SEOChecklist[]>([
    {
      category: 'Meta Tags',
      items: [
        { task: '<title> on every page (< 60 chars)', status: 'done' },
        { task: 'Meta description (< 160 chars)', status: 'done' },
        { task: 'Canonical URL on every page', status: 'done' },
        { task: 'OG title, description, image, type', status: 'done' },
        { task: 'Twitter card tags', status: 'done' }
      ]
    },
    {
      category: 'Structured Data',
      items: [
        { task: 'Article schema on blog posts', status: 'done' },
        { task: 'BreadcrumbList schema', status: 'pending' },
        { task: 'FAQ schema where applicable', status: 'pending' },
        { task: 'Validated with Rich Results Test', status: 'pending' }
      ]
    },
    {
      category: 'Crawling & Indexing',
      items: [
        { task: 'XML sitemap at /sitemap.xml', status: 'done' },
        { task: 'robots.txt at /robots.txt', status: 'done' },
        { task: 'noindex on admin/private pages', status: 'done' },
        { task: 'Submitted to Google Search Console', status: 'pending' }
      ]
    },
    {
      category: 'Performance',
      items: [
        { task: 'Prerender static pages', status: 'done' },
        { task: 'Images optimized (WebP/AVIF)', status: 'pending' },
        { task: 'Lighthouse Performance >= 90', status: 'pending' },
        { task: 'Core Web Vitals passing', status: 'pending' }
      ]
    }
  ]);

  function toggleItem(catIndex: number, itemIndex: number) {
    checklist[catIndex].items[itemIndex].status =
      checklist[catIndex].items[itemIndex].status === 'done' ? 'pending' : 'done';
  }

  let activeTab = $state<'component' | 'jsonld' | 'sitemap' | 'prerender'>('component');
</script>

<main>
  <h1>SEO Implementation</h1>
  <p class="subtitle">Complete SEO setup for the capstone project</p>

  <section class="checklist-section">
    <h2>SEO Checklist</h2>
    <div class="checklist-grid">
      {#each checklist as category, ci}
        <div class="checklist-card">
          <h3>{category.category}</h3>
          {#each category.items as item, ii}
            <label class="check-item">
              <input type="checkbox" checked={item.status === 'done'} onchange={() => toggleItem(ci, ii)} />
              <span class:completed={item.status === 'done'}>{item.task}</span>
            </label>
          {/each}
        </div>
      {/each}
    </div>
  </section>

  <div class="code-tabs">
    <button class:active={activeTab === 'component'} onclick={() => activeTab = 'component'}>SEO Component</button>
    <button class:active={activeTab === 'jsonld'} onclick={() => activeTab = 'jsonld'}>JSON-LD</button>
    <button class:active={activeTab === 'sitemap'} onclick={() => activeTab = 'sitemap'}>Sitemap</button>
    <button class:active={activeTab === 'prerender'} onclick={() => activeTab = 'prerender'}>Prerender</button>
  </div>

  {#if activeTab === 'component'}
    <section>
      <h2>Reusable SEO Component</h2>
      <pre><code>{seoComponentCode}</code></pre>
    </section>
  {:else if activeTab === 'jsonld'}
    <section>
      <h2>JSON-LD Helper Functions</h2>
      <pre><code>{jsonLdCode}</code></pre>
    </section>
  {:else if activeTab === 'sitemap'}
    <section>
      <h2>Dynamic Sitemap Generation</h2>
      <pre><code>{sitemapCode}</code></pre>
    </section>
  {:else}
    <section>
      <h2>Prerender Strategy</h2>
      <pre><code>{prerenderCode}</code></pre>
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .checklist-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .checklist-card {
    background: #f8f9fa;
    padding: 1.25rem;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
  }

  .checklist-card h3 {
    margin: 0 0 0.75rem;
    font-size: 0.95rem;
  }

  .check-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .check-item input { margin-top: 0.15rem; }
  .completed { text-decoration: line-through; color: #888; }

  .code-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .code-tabs button {
    flex: 1;
    padding: 0.6rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .code-tabs button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.76rem;
    line-height: 1.4;
  }

  section { margin-bottom: 2rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
