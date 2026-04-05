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

Understanding noindex, nofollow, and canonical directives lets you prevent duplicate content, hide staging environments, and focus crawl budget on your most important pages. Google Search Console is your dashboard for monitoring indexing status and fixing crawl errors.

This lesson provides the exact TypeScript +server.ts files you need for sitemap.xml and robots.txt, an interactive meta robots directive builder, and a Search Console walkthrough.`,
	objectives: [
		'Generate a dynamic XML sitemap using a SvelteKit +server.ts endpoint',
		'Configure robots.txt to control crawler access to different routes',
		'Use meta robots directives (noindex, nofollow) for page-level control',
		'Monitor indexing with Google Search Console',
		'Split large sitemaps using a sitemap index for sites over 50k URLs'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Interactive meta robots builder
  let index = $state(true);
  let follow = $state(true);
  let noarchive = $state(false);
  let nosnippet = $state(false);
  let maxImagePreview = $state<'none' | 'standard' | 'large'>('large');
  let maxSnippet = $state(-1);

  const robotsContent = $derived.by(() => {
    const parts: string[] = [];
    parts.push(index ? 'index' : 'noindex');
    parts.push(follow ? 'follow' : 'nofollow');
    if (noarchive) parts.push('noarchive');
    if (nosnippet) parts.push('nosnippet');
    parts.push('max-image-preview:' + maxImagePreview);
    parts.push('max-snippet:' + maxSnippet);
    return parts.join(', ');
  });

  const metaTag = $derived('<meta name="robots" content="' + robotsContent + '" />');

  // Sitemap builder
  type SitemapEntry = { url: string; lastmod: string; priority: number; changefreq: string };

  let entries = $state<SitemapEntry[]>([
    { url: 'https://example.com/', lastmod: '2026-04-01', priority: 1.0, changefreq: 'weekly' },
    { url: 'https://example.com/blog', lastmod: '2026-04-03', priority: 0.9, changefreq: 'daily' },
    { url: 'https://example.com/about', lastmod: '2026-01-15', priority: 0.5, changefreq: 'monthly' }
  ]);

  function addEntry() {
    entries = [
      ...entries,
      { url: 'https://example.com/new-page', lastmod: '2026-04-04', priority: 0.5, changefreq: 'monthly' }
    ];
  }

  function removeEntry(i: number) {
    entries = entries.filter((_, idx) => idx !== i);
  }

  const generatedSitemap = $derived.by(() => {
    const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
    lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    for (const e of entries) {
      lines.push('  <url>');
      lines.push('    <loc>' + e.url + '</loc>');
      lines.push('    <lastmod>' + e.lastmod + '</lastmod>');
      lines.push('    <changefreq>' + e.changefreq + '</changefreq>');
      lines.push('    <priority>' + e.priority.toFixed(1) + '</priority>');
      lines.push('  </url>');
    }
    lines.push('</urlset>');
    return lines.join('\\n');
  });

  // Sitemap +server.ts example
  const sitemapServer = [
    '// src/routes/sitemap.xml/+server.ts',
    "import type { RequestHandler } from './$types';",
    "import { getAllPosts } from '$lib/server/posts';",
    '',
    "const SITE = 'https://example.com';",
    '',
    'export const prerender = true;',
    '',
    'export const GET: RequestHandler = async () => {',
    '  const posts = await getAllPosts();',
    '',
    '  const urls = [',
    "    { loc: SITE, lastmod: new Date().toISOString(), priority: 1.0 },",
    "    { loc: SITE + '/blog', lastmod: new Date().toISOString(), priority: 0.9 },",
    '    ...posts.map((p) => ({',
    '      loc: SITE + \`/blog/\${p.slug}\`,',
    '      lastmod: p.updatedAt,',
    '      priority: 0.7',
    '    }))',
    '  ];',
    '',
    '  const body = \`<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '\${urls',
    '  .map(',
    '    (u) => \`  <url>',
    '    <loc>\${u.loc}</loc>',
    '    <lastmod>\${u.lastmod}</lastmod>',
    '    <priority>\${u.priority}</priority>',
    '  </url>\`',
    "  ).join('\\\\n')}",
    '</urlset>\`;',
    '',
    '  return new Response(body, {',
    '    headers: {',
    "      'Content-Type': 'application/xml',",
    "      'Cache-Control': 'max-age=3600'",
    '    }',
    '  });',
    '};'
  ].join('\\n');

  // robots.txt +server.ts
  const robotsServer = [
    '// src/routes/robots.txt/+server.ts',
    "import type { RequestHandler } from './$types';",
    '',
    'export const prerender = true;',
    '',
    'export const GET: RequestHandler = () => {',
    "  const body = \`User-agent: *",
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/private/',
    '',
    'Sitemap: https://example.com/sitemap.xml\`;',
    '',
    '  return new Response(body, {',
    "    headers: { 'Content-Type': 'text/plain' }",
    '  });',
    '};'
  ].join('\\n');

  // Sitemap index for large sites
  const sitemapIndex = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    '  <sitemap>',
    '    <loc>https://example.com/sitemap-posts.xml</loc>',
    '    <lastmod>2026-04-04</lastmod>',
    '  </sitemap>',
    '  <sitemap>',
    '    <loc>https://example.com/sitemap-products.xml</loc>',
    '    <lastmod>2026-04-04</lastmod>',
    '  </sitemap>',
    '</sitemapindex>'
  ].join('\\n');

  // Search Console checklist
  const gscChecklist = [
    { label: 'Verify domain ownership via DNS TXT record', done: true },
    { label: 'Submit sitemap.xml in Sitemaps section', done: true },
    { label: 'Review Coverage report for indexing errors', done: false },
    { label: 'Check URL Inspection for key pages', done: false },
    { label: 'Monitor Core Web Vitals report weekly', done: false },
    { label: 'Respond to Manual Actions (if any)', done: false }
  ];
</script>

<main>
  <h1>Sitemaps, Robots &amp; Indexing</h1>
  <p class="subtitle">Control what gets crawled and indexed</p>

  <section class="meta-builder">
    <h2>Meta Robots Directive Builder</h2>
    <p>Combine flags to control how a single page is indexed.</p>

    <div class="flags">
      <label><input type="checkbox" bind:checked={index} /> index (allow indexing)</label>
      <label><input type="checkbox" bind:checked={follow} /> follow (crawl links)</label>
      <label><input type="checkbox" bind:checked={noarchive} /> noarchive (no cached copy)</label>
      <label><input type="checkbox" bind:checked={nosnippet} /> nosnippet (no search snippet)</label>
    </div>

    <label class="select-label">
      max-image-preview:
      <select bind:value={maxImagePreview}>
        <option value="none">none</option>
        <option value="standard">standard</option>
        <option value="large">large</option>
      </select>
    </label>

    <label class="select-label">
      max-snippet:
      <input type="number" bind:value={maxSnippet} />
      <small>-1 = unlimited, 0 = no snippet, N = up to N chars</small>
    </label>

    <div class="output">
      <strong>Generated tag:</strong>
      <pre><code>{metaTag}</code></pre>
    </div>
  </section>

  <section class="sitemap-builder">
    <h2>Sitemap Entry Builder</h2>
    {#each entries as entry, i (i)}
      <div class="entry-row">
        <input type="text" bind:value={entry.url} placeholder="URL" />
        <input type="date" bind:value={entry.lastmod} />
        <select bind:value={entry.changefreq}>
          <option value="always">always</option>
          <option value="hourly">hourly</option>
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
          <option value="yearly">yearly</option>
          <option value="never">never</option>
        </select>
        <input type="number" step="0.1" min="0" max="1" bind:value={entry.priority} />
        <button onclick={() => removeEntry(i)}>Remove</button>
      </div>
    {/each}
    <button class="add-btn" onclick={addEntry}>+ Add Entry</button>

    <h3>Generated XML</h3>
    <pre><code>{generatedSitemap}</code></pre>
  </section>

  <section class="code-example">
    <h2>Dynamic sitemap.xml via +server.ts</h2>
    <pre><code>{sitemapServer}</code></pre>
  </section>

  <section class="code-example">
    <h2>robots.txt via +server.ts</h2>
    <pre><code>{robotsServer}</code></pre>
  </section>

  <section class="code-example">
    <h2>Sitemap Index (for sites over 50k URLs)</h2>
    <p>A single sitemap is capped at 50,000 URLs / 50MB. Larger sites split by section.</p>
    <pre><code>{sitemapIndex}</code></pre>
  </section>

  <section class="gsc">
    <h2>Google Search Console Checklist</h2>
    <ul class="checklist">
      {#each gscChecklist as item (item.label)}
        <li class:done={item.done}>
          <span class="check-icon">{item.done ? 'DONE' : 'TODO'}</span>
          {item.label}
        </li>
      {/each}
    </ul>
    <div class="callout">
      <strong>Tip:</strong> After deploying a sitemap, submit it at
      <code>search.google.com/search-console</code> under <em>Sitemaps</em>. Google typically
      discovers new sitemaps within 24-48 hours but explicit submission speeds indexing.
    </div>
  </section>

  <section class="directives">
    <h2>Common Meta Robots Combinations</h2>
    <table>
      <thead>
        <tr><th>Use case</th><th>Directive</th></tr>
      </thead>
      <tbody>
        <tr><td>Default public page</td><td><code>index, follow</code></td></tr>
        <tr><td>Internal search results</td><td><code>noindex, follow</code></td></tr>
        <tr><td>Staging / preview deploy</td><td><code>noindex, nofollow</code></td></tr>
        <tr><td>Login / user settings</td><td><code>noindex, nofollow</code></td></tr>
        <tr><td>Print-friendly version</td><td><code>noindex, follow</code></td></tr>
        <tr><td>Paywalled article preview</td><td><code>index, follow, max-snippet:160</code></td></tr>
      </tbody>
    </table>
  </section>
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle {
    color: #666;
    margin-bottom: 2rem;
  }

  section {
    margin-bottom: 2.5rem;
  }

  .meta-builder,
  .sitemap-builder,
  .gsc {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
  }

  .flags {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .flags label {
    padding: 0.5rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    cursor: pointer;
  }

  .select-label {
    display: block;
    margin-bottom: 0.8rem;
    font-weight: 600;
  }

  .select-label select,
  .select-label input {
    margin-left: 0.5rem;
    padding: 0.3rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .select-label small {
    display: block;
    color: #666;
    font-weight: normal;
    font-size: 0.75rem;
    margin-top: 0.2rem;
  }

  .output {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.8rem;
    border-radius: 6px;
    margin-top: 0.8rem;
  }

  .output strong {
    color: #ffcb6b;
    display: block;
    margin-bottom: 0.3rem;
  }

  .output pre {
    margin: 0;
    padding: 0;
    background: none;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
  }

  .entry-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 0.7fr auto;
    gap: 0.4rem;
    margin-bottom: 0.5rem;
    align-items: center;
  }

  .entry-row input,
  .entry-row select {
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .entry-row button {
    padding: 0.3rem 0.6rem;
    background: #fee;
    color: #c00;
    border: 1px solid #fcc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .add-btn {
    padding: 0.5rem 1rem;
    background: #4a90d9;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-top: 0.5rem;
  }

  .checklist {
    list-style: none;
    padding: 0;
  }

  .checklist li {
    padding: 0.6rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    margin-bottom: 0.4rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .checklist li.done {
    background: #dcfce7;
  }

  .check-icon {
    font-weight: 700;
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    background: #eee;
    color: #666;
  }

  .checklist li.done .check-icon {
    background: #166534;
    color: white;
  }

  .callout {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th,
  td {
    padding: 0.6rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    font-size: 0.9rem;
  }

  th {
    background: #f0f0f0;
  }

  code {
    background: #f0f0f0;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    font-size: 0.85rem;
  }

  pre code {
    background: none;
    padding: 0;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
