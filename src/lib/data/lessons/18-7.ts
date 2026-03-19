import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '18-7',
		title: 'Sitemaps, Robots & Indexing',
		phase: 6,
		module: 18,
		lessonIndex: 7
	},
	description: `Sitemaps and robots.txt are the control panel for how search engines discover and index your site. In SvelteKit, you generate dynamic XML sitemaps using +server.ts endpoints, configure robots.txt to guide crawlers, and use meta robots tags for page-level indexing control.

Understanding noindex, nofollow, and canonical directives lets you prevent duplicate content, hide staging environments, and focus crawl budget on your most important pages. Google Search Console is your dashboard for monitoring indexing status and fixing crawl errors.`,
	objectives: [
		'Generate a dynamic XML sitemap using a SvelteKit +server.ts endpoint',
		'Configure robots.txt to control crawler access to different routes',
		'Use meta robots directives (noindex, nofollow) for page-level control',
		'Monitor indexing with Google Search Console'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type SitemapEntry = {
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: number;
    indexed: boolean;
  };

  let sitemapEntries = $state<SitemapEntry[]>([
    { loc: 'https://example.com/', lastmod: '2026-03-19', changefreq: 'weekly', priority: 1.0, indexed: true },
    { loc: 'https://example.com/blog', lastmod: '2026-03-18', changefreq: 'daily', priority: 0.9, indexed: true },
    { loc: 'https://example.com/blog/seo-guide', lastmod: '2026-03-15', changefreq: 'monthly', priority: 0.8, indexed: true },
    { loc: 'https://example.com/about', lastmod: '2026-02-01', changefreq: 'yearly', priority: 0.5, indexed: true },
    { loc: 'https://example.com/admin', lastmod: '2026-03-19', changefreq: 'never', priority: 0.0, indexed: false },
    { loc: 'https://example.com/staging', lastmod: '2026-03-19', changefreq: 'never', priority: 0.0, indexed: false }
  ]);

  // Generate XML output
  let sitemapXml = $derived(\`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
\${sitemapEntries
  .filter(e => e.indexed)
  .map(e => \`  <url>
    <loc>\${e.loc}</loc>
    <lastmod>\${e.lastmod}</lastmod>
    <changefreq>\${e.changefreq}</changefreq>
    <priority>\${e.priority}</priority>
  </url>\`)
  .join('\\n')}
</urlset>\`);

  // SvelteKit sitemap endpoint code
  const sitemapServerCode = \`// src/routes/sitemap.xml/+server.ts
import type { RequestHandler } from './$types';
import { fetchAllPosts } from '$lib/server/posts';

export const GET: RequestHandler = async () => {
  const posts = await fetchAllPosts();

  const sitemap = \\\`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>\\\${new Date().toISOString().split('T')[0]}</lastmod>
    <priority>1.0</priority>
  </url>
  \\\${posts.map(post => \\\`<url>
    <loc>https://example.com/blog/\\\${post.slug}</loc>
    <lastmod>\\\${post.updatedAt}</lastmod>
    <priority>0.8</priority>
  </url>\\\`).join('')}
</urlset>\\\`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600'
    }
  });
};\`;

  const robotsTxtCode = \`// src/routes/robots.txt/+server.ts
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const body = \\\`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /staging/

Sitemap: https://example.com/sitemap.xml\\\`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' }
  });
};\`;

  type MetaDirective = {
    directive: string;
    description: string;
    useCase: string;
  };

  const metaDirectives: MetaDirective[] = [
    { directive: '<meta name="robots" content="noindex">', description: 'Prevent page from appearing in search results', useCase: 'Staging, admin pages, thin content' },
    { directive: '<meta name="robots" content="nofollow">', description: 'Don\\'t follow links on this page', useCase: 'User-generated content, untrusted links' },
    { directive: '<meta name="robots" content="noindex, nofollow">', description: 'No indexing AND no link following', useCase: 'Private pages, login screens' },
    { directive: '<link rel="canonical" href="...">', description: 'Declare the preferred URL for duplicate content', useCase: 'Paginated pages, UTM parameters' }
  ];

  let activeTab = $state<'sitemap' | 'robots' | 'meta'>('sitemap');
</script>

<main>
  <h1>Sitemaps, Robots & Indexing</h1>
  <p class="subtitle">Control how search engines discover and index your SvelteKit app</p>

  <div class="tab-bar">
    <button class:active={activeTab === 'sitemap'} onclick={() => activeTab = 'sitemap'}>Sitemap</button>
    <button class:active={activeTab === 'robots'} onclick={() => activeTab = 'robots'}>Robots.txt</button>
    <button class:active={activeTab === 'meta'} onclick={() => activeTab = 'meta'}>Meta Robots</button>
  </div>

  {#if activeTab === 'sitemap'}
    <section>
      <h2>Dynamic XML Sitemap</h2>

      <div class="entries">
        <h3>Pages</h3>
        {#each sitemapEntries as entry}
          <div class="entry-row">
            <label class="toggle">
              <input type="checkbox" bind:checked={entry.indexed} />
              <code>{entry.loc.replace('https://example.com', '')}</code>
            </label>
            <span class="priority">p:{entry.priority}</span>
          </div>
        {/each}
      </div>

      <h3>Generated sitemap.xml</h3>
      <pre><code>{sitemapXml}</code></pre>

      <h3>SvelteKit +server.ts</h3>
      <pre><code>{sitemapServerCode}</code></pre>
    </section>

  {:else if activeTab === 'robots'}
    <section>
      <h2>Robots.txt in SvelteKit</h2>
      <pre><code>{robotsTxtCode}</code></pre>

      <div class="info-box">
        <h3>Key Rules</h3>
        <ul>
          <li><strong>Allow: /</strong> — Permit crawling of all pages by default</li>
          <li><strong>Disallow: /admin/</strong> — Block specific directories</li>
          <li><strong>Sitemap:</strong> — Tell crawlers where your sitemap lives</li>
          <li><strong>User-agent: *</strong> — Apply rules to all bots</li>
        </ul>
      </div>
    </section>

  {:else}
    <section>
      <h2>Meta Robots Directives</h2>
      <table>
        <thead>
          <tr><th>Directive</th><th>Effect</th><th>Use Case</th></tr>
        </thead>
        <tbody>
          {#each metaDirectives as d}
            <tr>
              <td><code>{d.directive}</code></td>
              <td>{d.description}</td>
              <td>{d.useCase}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="info-box">
        <h3>Google Search Console</h3>
        <ul>
          <li>Monitor which pages are indexed vs excluded</li>
          <li>Submit sitemaps and request re-indexing</li>
          <li>Identify crawl errors and coverage issues</li>
          <li>View search performance (impressions, clicks, CTR)</li>
        </ul>
      </div>
    </section>
  {/if}
</main>

<style>
  main {
    max-width: 850px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .tab-bar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .tab-bar button {
    flex: 1;
    padding: 0.7rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.95rem;
  }

  .tab-bar button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .entry-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }

  .toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .priority {
    font-size: 0.8rem;
    color: #888;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  code {
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.82rem;
  }

  pre code { background: none; padding: 0; }

  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th, td { padding: 0.6rem; text-align: left; border-bottom: 1px solid #e0e0e0; font-size: 0.85rem; }
  th { background: #f0f0f0; }

  .info-box {
    background: #f0f7ff;
    padding: 1.25rem;
    border-radius: 8px;
    margin-top: 1.5rem;
  }

  .info-box ul { padding-left: 1.2rem; }
  .info-box li { margin-bottom: 0.4rem; }

  h3 { margin-top: 1.5rem; }

  section { margin-bottom: 2rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
