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

Understanding this pipeline is critical for web developers because Server-Side Rendering (SSR) ensures that Googlebot sees your full content on the first request — no JavaScript execution needed. Without SSR, client-rendered apps may be partially or incorrectly indexed, hurting your visibility in search results.`,
	objectives: [
		'Explain the three stages of how search engines discover and serve web pages',
		'Understand why SSR matters for search engine visibility compared to CSR',
		'Describe the purpose of robots.txt and sitemap.xml in guiding crawlers',
		'Identify how Googlebot processes JavaScript-rendered content'
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
  };

  const stages: Stage[] = [
    {
      name: 'Crawling',
      icon: '🕷️',
      description: 'Googlebot discovers pages by following links and reading sitemaps.',
      details: [
        'Follows links from known pages',
        'Reads sitemap.xml for URL discovery',
        'Respects robots.txt directives',
        'Crawl budget limits how many pages are fetched'
      ]
    },
    {
      name: 'Indexing',
      icon: '📑',
      description: 'Content is parsed, analyzed, and stored in Google\\'s index.',
      details: [
        'Parses HTML, extracts text and metadata',
        'Evaluates <title>, <meta>, headings',
        'Renders JavaScript (delayed — SSR helps!)',
        'Canonical URLs prevent duplicate indexing'
      ]
    },
    {
      name: 'Ranking',
      icon: '🏆',
      description: 'Indexed pages are scored and ordered by relevance and quality.',
      details: [
        'Content relevance to search query',
        'Page experience signals (Core Web Vitals)',
        'E-E-A-T quality signals',
        'Mobile-friendliness and HTTPS'
      ]
    }
  ];

  let activeStage = $state(0);

  // robots.txt example
  const robotsTxt = \`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://example.com/sitemap.xml\`;

  // sitemap.xml example
  const sitemapXml = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-03-01</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/blog</loc>
    <lastmod>2026-03-15</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>\`;

  type RenderMode = { name: string; crawlable: string; speed: string; seoScore: string };

  const renderComparison: RenderMode[] = [
    { name: 'SSR (SvelteKit default)', crawlable: 'Immediate', speed: 'Fast', seoScore: 'Excellent' },
    { name: 'CSR (SPA only)', crawlable: 'Delayed / Partial', speed: 'Slow for bots', seoScore: 'Poor' },
    { name: 'Prerendered (Static)', crawlable: 'Immediate', speed: 'Fastest', seoScore: 'Excellent' }
  ];
</script>

<main>
  <h1>How Search Engines Work</h1>
  <p class="subtitle">The three-stage pipeline: Crawl → Index → Rank</p>

  <section class="stages">
    {#each stages as stage, i}
      <button
        class="stage-card"
        class:active={activeStage === i}
        onclick={() => activeStage = i}
      >
        <span class="icon">{stage.icon}</span>
        <h2>{stage.name}</h2>
        <p>{stage.description}</p>
      </button>
    {/each}
  </section>

  <section class="details">
    <h3>{stages[activeStage].name} — Key Points</h3>
    <ul>
      {#each stages[activeStage].details as detail}
        <li>{detail}</li>
      {/each}
    </ul>
  </section>

  <section class="files-section">
    <h3>robots.txt</h3>
    <pre><code>{robotsTxt}</code></pre>

    <h3>sitemap.xml</h3>
    <pre><code>{sitemapXml}</code></pre>
  </section>

  <section class="comparison">
    <h3>SSR vs CSR for SEO</h3>
    <table>
      <thead>
        <tr>
          <th>Render Mode</th>
          <th>Crawlable</th>
          <th>Bot Speed</th>
          <th>SEO Score</th>
        </tr>
      </thead>
      <tbody>
        {#each renderComparison as mode}
          <tr>
            <td>{mode.name}</td>
            <td>{mode.crawlable}</td>
            <td>{mode.speed}</td>
            <td>{mode.seoScore}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</main>

<style>
  main {
    max-width: 800px;
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
  }

  .stage-card.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .stage-card:hover {
    transform: translateY(-2px);
  }

  .icon {
    font-size: 2rem;
    display: block;
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
    content: '→ ';
    color: #4a90d9;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.85rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f0f0f0;
    font-weight: 600;
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
