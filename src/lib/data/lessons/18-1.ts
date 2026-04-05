import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '18-1',
		title: 'Crawling, Indexing, Ranking',
		phase: 6,
		module: 18,
		lessonIndex: 1
	},
	description: `Search engines like Google use a three-stage pipeline to serve results: crawling, indexing, and ranking. Googlebot discovers your pages by following links and reading your sitemap.xml, respects rules in robots.txt, then indexes the content it finds. Finally, an algorithm ranks pages by relevance, quality, and user experience signals.

Understanding this pipeline is critical for web developers because Server-Side Rendering (SSR) ensures that Googlebot sees your full content on the first request — no JavaScript execution needed. Without SSR, client-rendered apps may be partially or incorrectly indexed, hurting your visibility in search results.

This lesson walks through each stage in depth: how the crawler budgets its fetches, how the indexer normalizes and canonicalizes your pages, and how the ranking system weighs hundreds of signals. By the end you will understand exactly what happens between publishing a page and seeing it appear in Google search results.`,
	objectives: [
		'Explain the three stages of how search engines discover and serve web pages',
		'Understand why SSR matters for search engine visibility compared to CSR',
		'Describe the purpose of robots.txt and sitemap.xml in guiding crawlers',
		'Identify how Googlebot processes JavaScript-rendered content',
		'Reason about crawl budget and how to use it efficiently on large sites'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Stage = {
    name: string;
    icon: string;
    description: string;
    details: string[];
    technical: string;
  };

  const stages: Stage[] = [
    {
      name: 'Crawling',
      icon: 'CRAWL',
      description: 'Googlebot discovers pages by following links and reading sitemaps.',
      details: [
        'Follows links from known pages (href, canonical, sitemap)',
        'Reads sitemap.xml for URL discovery',
        'Respects robots.txt directives per user-agent',
        'Crawl budget limits how many URLs are fetched per day',
        'HTTP status codes steer the crawler (200, 301, 404, 410, 503)',
        'Uses a mobile user-agent by default since 2023'
      ],
      technical: 'User-Agent: Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X) AppleWebKit/537.36 Googlebot/2.1'
    },
    {
      name: 'Indexing',
      icon: 'INDEX',
      description: 'Content is parsed, analyzed, and stored in Google index.',
      details: [
        'Parses raw HTML, extracts text, links, metadata',
        'Evaluates <title>, <meta>, headings, structured data',
        'Renders JavaScript in a second pass (Web Rendering Service)',
        'Canonical URLs prevent duplicate indexing',
        'Deduplication clusters similar pages',
        'Lang + hreflang attributes route by locale'
      ],
      technical: 'Two-wave indexing: HTML pass, then JS render pass (can lag by hours or days).'
    },
    {
      name: 'Ranking',
      icon: 'RANK',
      description: 'Indexed pages are scored and ordered by relevance and quality.',
      details: [
        'Query-document relevance via BERT / MUM / Gemini',
        'Page experience signals (Core Web Vitals)',
        'E-E-A-T quality signals (authority, trust)',
        'HTTPS, mobile-friendliness, safe browsing',
        'Freshness and query-deserves-freshness boost',
        'Personalization (location, history, language)'
      ],
      technical: 'Hundreds of ranking signals combined by learned ranking functions.'
    }
  ];

  let activeStage = $state(0);
  let pipelineStep = $state(0);

  const robotsTxt = \`# robots.txt — served at /robots.txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/private/
Disallow: /*?session=

# Specific bot rules
User-agent: Googlebot
Crawl-delay: 0

User-agent: GPTBot
Disallow: /

Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-blog.xml\`;

  const sitemapXml = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/blog/sveltekit-seo</loc>
    <lastmod>2026-03-15T14:32:00+00:00</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en"
      href="https://example.com/blog/sveltekit-seo" />
    <xhtml:link rel="alternate" hreflang="es"
      href="https://example.com/es/blog/sveltekit-seo" />
  </url>
</urlset>\`;

  type RenderMode = {
    name: string;
    crawlable: string;
    firstPaint: string;
    botExperience: string;
    seoScore: number;
    notes: string;
  };

  const renderComparison: RenderMode[] = [
    {
      name: 'SSR (SvelteKit default)',
      crawlable: 'Immediate',
      firstPaint: '~200ms',
      botExperience: 'Full HTML on first byte',
      seoScore: 95,
      notes: 'Best general-purpose choice'
    },
    {
      name: 'Prerendered (Static)',
      crawlable: 'Immediate',
      firstPaint: '~50ms',
      botExperience: 'Served from CDN edge',
      seoScore: 100,
      notes: 'Ideal for content that rarely changes'
    },
    {
      name: 'CSR only (SPA)',
      crawlable: 'Delayed / Partial',
      firstPaint: '~1200ms',
      botExperience: 'Empty shell, needs JS render',
      seoScore: 40,
      notes: 'Avoid for any public page'
    },
    {
      name: 'Dynamic Rendering (legacy)',
      crawlable: 'Immediate',
      firstPaint: '~400ms',
      botExperience: 'Separate bot-only HTML',
      seoScore: 70,
      notes: 'Deprecated, Google discourages it'
    }
  ];

  const pipelineSteps = [
    { label: 'Discovery', detail: 'URL found via link or sitemap' },
    { label: 'Queue', detail: 'Added to crawl frontier with priority' },
    { label: 'Fetch', detail: 'HTTP request sent with Googlebot UA' },
    { label: 'Parse', detail: 'HTML tokenized, links extracted' },
    { label: 'Render', detail: 'JS executed if required (WRS)' },
    { label: 'Index', detail: 'Content stored in inverted index' },
    { label: 'Rank', detail: 'Retrieved at query time and scored' }
  ];

  function nextStep() {
    pipelineStep = (pipelineStep + 1) % pipelineSteps.length;
  }
  function resetStep() {
    pipelineStep = 0;
  }

  // robots.txt mini-parser demo
  let testUrl = $state('/blog/my-post');
  let testBot = $state('Googlebot');

  const rules: { bot: string; disallow: string[] }[] = [
    { bot: '*', disallow: ['/admin/', '/api/private/'] },
    { bot: 'Googlebot', disallow: [] },
    { bot: 'GPTBot', disallow: ['/'] }
  ];

  const allowed = $derived.by(() => {
    const rule = rules.find((r) => r.bot === testBot) ?? rules[0];
    if (rule.disallow.includes('/')) return false;
    return !rule.disallow.some((d) => testUrl.startsWith(d));
  });
</script>

<main>
  <h1>How Search Engines Work</h1>
  <p class="subtitle">The three-stage pipeline: Crawl &rarr; Index &rarr; Rank</p>

  <section class="stages">
    {#each stages as stage, i (stage.name)}
      <button
        class="stage-card"
        class:active={activeStage === i}
        onclick={() => (activeStage = i)}
      >
        <span class="icon">{stage.icon}</span>
        <h2>{stage.name}</h2>
        <p>{stage.description}</p>
      </button>
    {/each}
  </section>

  <section class="details">
    <h3>{stages[activeStage].name} &mdash; Key Points</h3>
    <ul>
      {#each stages[activeStage].details as detail (detail)}
        <li>{detail}</li>
      {/each}
    </ul>
    <p class="tech-note"><strong>Technical:</strong> {stages[activeStage].technical}</p>
  </section>

  <section class="pipeline">
    <h3>Full Pipeline Walkthrough</h3>
    <div class="pipeline-bar">
      {#each pipelineSteps as step, i (step.label)}
        <div class="pipeline-step" class:current={pipelineStep === i} class:done={pipelineStep > i}>
          <div class="pipeline-num">{i + 1}</div>
          <div class="pipeline-label">{step.label}</div>
        </div>
      {/each}
    </div>
    <p class="pipeline-detail">
      <strong>{pipelineSteps[pipelineStep].label}:</strong>
      {pipelineSteps[pipelineStep].detail}
    </p>
    <div class="pipeline-buttons">
      <button onclick={nextStep}>Next Step &rarr;</button>
      <button onclick={resetStep}>Reset</button>
    </div>
  </section>

  <section class="files-section">
    <h3>robots.txt (served at /robots.txt)</h3>
    <pre><code>{robotsTxt}</code></pre>

    <h3>sitemap.xml (served at /sitemap.xml)</h3>
    <pre><code>{sitemapXml}</code></pre>
  </section>

  <section class="robots-parser">
    <h3>robots.txt Parser Demo</h3>
    <p>See whether a URL is allowed for a given bot using the rules above.</p>
    <label>
      Bot:
      <select bind:value={testBot}>
        <option value="Googlebot">Googlebot</option>
        <option value="GPTBot">GPTBot</option>
        <option value="*">* (generic)</option>
      </select>
    </label>
    <label>
      URL path:
      <input type="text" bind:value={testUrl} />
    </label>
    <p class="result" class:ok={allowed} class:blocked={!allowed}>
      {allowed ? 'ALLOWED' : 'BLOCKED'} &mdash; {testBot} fetching {testUrl}
    </p>
  </section>

  <section class="comparison">
    <h3>Render Mode Comparison for SEO</h3>
    <table>
      <thead>
        <tr>
          <th>Render Mode</th>
          <th>Crawlable</th>
          <th>First Paint</th>
          <th>Bot Experience</th>
          <th>SEO Score</th>
        </tr>
      </thead>
      <tbody>
        {#each renderComparison as mode (mode.name)}
          <tr>
            <td><strong>{mode.name}</strong><br /><small>{mode.notes}</small></td>
            <td>{mode.crawlable}</td>
            <td>{mode.firstPaint}</td>
            <td>{mode.botExperience}</td>
            <td>
              <div class="score-bar">
                <div class="score-fill" style="width: {mode.seoScore}%"></div>
                <span>{mode.seoScore}</span>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="callout">
    <h3>March 2026 Note</h3>
    <p>
      Since the March 2026 Core Update, Googlebot prioritizes pages whose first HTML response
      is complete and semantically rich. Pages that require a JS render pass to expose content
      are increasingly downranked because the Web Rendering Service budget is finite. SvelteKit
      SSR and prerendering both satisfy this requirement.
    </p>
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
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .stages {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stage-card {
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
    font: inherit;
  }

  .stage-card.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .stage-card:hover {
    transform: translateY(-2px);
  }

  .icon {
    font-size: 0.9rem;
    font-weight: 700;
    color: #4a90d9;
    display: block;
    letter-spacing: 0.1em;
    margin-bottom: 0.5rem;
  }

  .details {
    background: #f0f7ff;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .details ul {
    list-style: none;
    padding: 0;
  }

  .details li::before {
    content: '-> ';
    color: #4a90d9;
  }

  .tech-note {
    font-family: monospace;
    font-size: 0.8rem;
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.6rem;
    border-radius: 4px;
    margin-top: 0.8rem;
  }

  .pipeline {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .pipeline-bar {
    display: flex;
    gap: 0.3rem;
    margin: 1rem 0;
    flex-wrap: wrap;
  }

  .pipeline-step {
    flex: 1;
    min-width: 80px;
    text-align: center;
    padding: 0.6rem 0.3rem;
    background: #fff;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
  }

  .pipeline-step.current {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .pipeline-step.done {
    border-color: #16a34a;
    background: #dcfce7;
  }

  .pipeline-num {
    font-weight: 700;
    color: #4a90d9;
  }

  .pipeline-label {
    font-size: 0.8rem;
  }

  .pipeline-detail {
    padding: 0.8rem;
    background: white;
    border-left: 4px solid #4a90d9;
    border-radius: 4px;
  }

  .pipeline-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.8rem;
  }

  .pipeline-buttons button {
    padding: 0.5rem 1rem;
    border: 1px solid #4a90d9;
    background: white;
    color: #4a90d9;
    border-radius: 6px;
    cursor: pointer;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.8rem;
  }

  .robots-parser {
    background: #fff8e6;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .robots-parser label {
    display: block;
    margin: 0.5rem 0;
  }

  .robots-parser input,
  .robots-parser select {
    padding: 0.4rem;
    font-size: 1rem;
    margin-left: 0.5rem;
  }

  .result {
    font-weight: 700;
    padding: 0.6rem;
    border-radius: 6px;
    margin-top: 0.8rem;
  }

  .result.ok {
    background: #dcfce7;
    color: #166534;
  }

  .result.blocked {
    background: #fecaca;
    color: #991b1b;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th,
  td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    font-size: 0.9rem;
  }

  th {
    background: #f0f0f0;
    font-weight: 600;
  }

  .score-bar {
    position: relative;
    background: #eee;
    border-radius: 4px;
    height: 1.4rem;
    overflow: hidden;
  }

  .score-fill {
    background: linear-gradient(90deg, #ef4444, #f59e0b, #16a34a);
    height: 100%;
  }

  .score-bar span {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 700;
    line-height: 1.4rem;
  }

  .callout {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem 1.5rem;
    border-radius: 4px;
  }

  h3 {
    margin-top: 2rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
