import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '18-8',
		title: 'Content Strategy Post-March 2026',
		phase: 6,
		module: 18,
		lessonIndex: 8
	},
	description: `With 69% of Google searches ending in zero clicks, your content strategy must evolve. The March 2026 update's Information Gain scoring means rehashed content is penalized — Google rewards original research, unique datasets, first-hand experience, and expert perspectives that add genuinely new information to the web.

For SvelteKit developers, mdsvex (Markdown + Svelte) enables rich, interactive content. Depth beats breadth: fewer, more comprehensive articles outperform many thin pages. This lesson teaches you to plan content that both humans and algorithms value.

You will explore zero-click statistics, build a topical authority cluster map, analyze content freshness, and see a working mdsvex blog post template.`,
	objectives: [
		'Develop content strategies that maximize Information Gain scoring',
		'Balance depth vs breadth in content planning for zero-click search',
		'Use mdsvex to create rich, interactive Markdown content in SvelteKit',
		'Apply original research and unique data to differentiate content',
		'Design topical authority clusters around pillar content'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Zero-click stats
  const zeroClickStats = [
    { year: 2020, percent: 50 },
    { year: 2022, percent: 58 },
    { year: 2024, percent: 65 },
    { year: 2026, percent: 69 }
  ];

  // Information Gain principles
  type Principle = { title: string; description: string; example: string };

  const principles: Principle[] = [
    {
      title: 'Original Data',
      description: 'Publish numbers nobody else has. Surveys, benchmarks, experiments.',
      example: 'Benchmark 12 frameworks on identical Hetzner hardware; publish the raw CSV.'
    },
    {
      title: 'First-hand Experience',
      description: 'Tell stories only you can tell because you were there.',
      example: '"We migrated 2.3M users from Next to SvelteKit. Here is what broke at 4am."'
    },
    {
      title: 'Synthesis Across Domains',
      description: 'Connect ideas from fields that rarely talk to each other.',
      example: 'Apply supply-chain queueing theory to front-end request batching.'
    },
    {
      title: 'Updated Primary Sources',
      description: 'Replace stale data with current numbers, citing your methodology.',
      example: 'Re-run the 2019 "cost of JavaScript" study on 2026 mid-range Android phones.'
    },
    {
      title: 'Counterintuitive Angles',
      description: 'Challenge conventional wisdom with evidence.',
      example: '"Prefetching everything made our site slower. Here is the flame graph."'
    }
  ];

  // Topical cluster builder
  type Cluster = { pillar: string; spokes: string[] };

  const sampleClusters: Cluster[] = [
    {
      pillar: 'SvelteKit SEO (complete guide)',
      spokes: [
        'Crawling and indexing basics',
        'Meta tags in svelte:head',
        'JSON-LD structured data',
        'Core Web Vitals in SvelteKit',
        'Sitemaps via +server.ts',
        'E-E-A-T for technical blogs',
        'Prerender vs SSR decision tree'
      ]
    },
    {
      pillar: 'Production SvelteKit Deployment',
      spokes: [
        'Adapter selection (node, cloudflare, vercel)',
        'Environment variables and secrets',
        'Error handling and logging',
        'CI/CD with GitHub Actions',
        'Monitoring and alerting'
      ]
    }
  ];

  let activeCluster = $state(0);

  // Content freshness planner
  type ContentAge = { title: string; published: string; lastUpdated: string; status: 'fresh' | 'stale' | 'rot' };

  const contentInventory: ContentAge[] = [
    { title: 'Svelte 5 migration guide', published: '2024-10-15', lastUpdated: '2026-03-10', status: 'fresh' },
    { title: 'Legacy stores tutorial', published: '2022-01-20', lastUpdated: '2022-01-20', status: 'rot' },
    { title: 'SvelteKit form actions', published: '2023-06-11', lastUpdated: '2025-09-22', status: 'stale' },
    { title: 'Runes deep dive', published: '2025-02-05', lastUpdated: '2026-03-28', status: 'fresh' },
    { title: 'Old adapter-node guide', published: '2021-11-03', lastUpdated: '2021-11-03', status: 'rot' }
  ];

  const statusColors: Record<string, string> = {
    fresh: '#16a34a',
    stale: '#f59e0b',
    rot: '#ef4444'
  };

  const statusLabels: Record<string, string> = {
    fresh: 'Fresh',
    stale: 'Needs refresh',
    rot: 'Archive or rewrite'
  };

  // mdsvex example
  const mdsvexConfig = [
    '// svelte.config.js',
    "import { mdsvex } from 'mdsvex';",
    "import adapter from '@sveltejs/adapter-auto';",
    '',
    'export default {',
    "  extensions: ['.svelte', '.svx', '.md'],",
    '  preprocess: [',
    '    mdsvex({',
    "      extensions: ['.svx', '.md'],",
    '      layout: {',
    "        blog: 'src/lib/layouts/BlogPost.svelte'",
    '      }',
    '    })',
    '  ],',
    '  kit: { adapter: adapter() }',
    '};'
  ].join('\\n');

  const mdsvexPost = [
    '---',
    'title: "We migrated 2.3M users from Next.js to SvelteKit"',
    'author: "Jane Developer"',
    'date: "2026-04-04"',
    'layout: "blog"',
    '---',
    '',
    '<script>',
    "  import BenchmarkChart from '$lib/charts/BenchmarkChart.svelte';",
    "  import { migrationData } from '$lib/data/migration';",
    '</' + 'script>',
    '',
    '# We migrated 2.3M users from Next.js to SvelteKit',
    '',
    'In March 2026 we finished our 9-month migration. Here is what we learned,',
    'including the raw numbers nobody else will share.',
    '',
    '## TL;DR',
    '',
    '- Bundle size dropped 62% (890 KB -> 338 KB)',
    '- LCP improved from 3.1s to 1.4s on mid-range Android',
    '- Infrastructure cost fell 41% on Cloudflare Workers',
    '',
    '## The benchmark (original data)',
    '',
    '<BenchmarkChart data={migrationData} />',
    '',
    '## What broke at 4am',
    '',
    'Our session middleware assumed Next.js request context. In SvelteKit...',
    '(first-hand experience, specific details only we know)'
  ].join('\\n');

  const maxPercent = $derived(Math.max(...zeroClickStats.map((s) => s.percent)));
</script>

<main>
  <h1>Content Strategy Post-March 2026</h1>
  <p class="subtitle">Depth beats breadth. Information Gain beats keyword density.</p>

  <section class="zero-click">
    <h2>The Zero-Click Reality</h2>
    <p>
      In 2026, <strong>69% of Google searches end without a click</strong>. Users get their
      answer from AI Overviews, featured snippets, and knowledge panels. Your content must be
      good enough to either be that answer, or be interesting enough that people click through.
    </p>

    <div class="chart">
      {#each zeroClickStats as stat (stat.year)}
        <div class="bar-row">
          <div class="bar-year">{stat.year}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: {(stat.percent / maxPercent) * 100}%">
              <span>{stat.percent}%</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="principles">
    <h2>Information Gain Principles</h2>
    <div class="principle-list">
      {#each principles as p (p.title)}
        <div class="principle">
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <blockquote>{p.example}</blockquote>
        </div>
      {/each}
    </div>
  </section>

  <section class="clusters">
    <h2>Topical Authority Clusters</h2>
    <p>
      Pillar content covers a broad topic. Spoke articles drill into specific subtopics and link
      back to the pillar. This demonstrates topical depth to Google.
    </p>

    <div class="cluster-picker">
      {#each sampleClusters as cluster, i (cluster.pillar)}
        <button class:active={activeCluster === i} onclick={() => (activeCluster = i)}>
          {cluster.pillar}
        </button>
      {/each}
    </div>

    <div class="cluster-diagram">
      <div class="pillar">{sampleClusters[activeCluster].pillar}</div>
      <div class="spokes">
        {#each sampleClusters[activeCluster].spokes as spoke (spoke)}
          <div class="spoke">{spoke}</div>
        {/each}
      </div>
    </div>
  </section>

  <section class="freshness">
    <h2>Content Freshness Audit</h2>
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Published</th>
          <th>Last Updated</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {#each contentInventory as content (content.title)}
          <tr>
            <td>{content.title}</td>
            <td>{content.published}</td>
            <td>{content.lastUpdated}</td>
            <td>
              <span class="status" style="background: {statusColors[content.status]}">
                {statusLabels[content.status]}
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
    <div class="callout">
      <strong>Rule of thumb:</strong> refresh articles older than 18 months, archive or rewrite
      anything older than 3 years. Google tracks lastmod in sitemaps and favors updated URLs.
    </div>
  </section>

  <section class="mdsvex">
    <h2>mdsvex for Rich Blog Content</h2>
    <p>
      mdsvex is a Svelte preprocessor that lets you import Svelte components directly into
      Markdown files. This is how you ship interactive charts, live code demos, and
      embedded widgets inside a blog post &mdash; exactly the kind of content Google rewards.
    </p>

    <h3>Configuration</h3>
    <pre><code>{mdsvexConfig}</code></pre>

    <h3>Example Post</h3>
    <pre><code>{mdsvexPost}</code></pre>
  </section>

  <section class="depth-vs-breadth">
    <h2>Depth vs Breadth: The Trade-off</h2>
    <div class="two-col">
      <div class="col breadth">
        <h3>Breadth Strategy (Old)</h3>
        <ul>
          <li>100 thin posts per month</li>
          <li>500-800 words each</li>
          <li>Keyword-stuffed</li>
          <li>Generic advice</li>
          <li>Minimal research</li>
        </ul>
        <div class="verdict bad">Penalized by March 2026 update</div>
      </div>
      <div class="col depth">
        <h3>Depth Strategy (Post-2026)</h3>
        <ul>
          <li>4-8 flagship posts per month</li>
          <li>3000-8000 words each</li>
          <li>Original data and benchmarks</li>
          <li>First-hand stories</li>
          <li>Interactive demos via mdsvex</li>
        </ul>
        <div class="verdict good">Rewarded by Information Gain</div>
      </div>
    </div>
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

  .zero-click {
    background: #fef3c7;
    padding: 1.5rem;
    border-radius: 10px;
    border-left: 4px solid #f59e0b;
  }

  .chart {
    margin-top: 1rem;
  }

  .bar-row {
    display: grid;
    grid-template-columns: 60px 1fr;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.4rem;
  }

  .bar-year {
    font-weight: 700;
    color: #666;
  }

  .bar-track {
    background: #fff;
    border-radius: 4px;
    overflow: hidden;
    height: 1.5rem;
  }

  .bar-fill {
    background: linear-gradient(90deg, #f59e0b, #ef4444);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0.5rem;
    color: white;
    font-weight: 700;
    font-size: 0.85rem;
    transition: width 0.4s;
  }

  .principle-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .principle {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
  }

  .principle h3 {
    margin: 0 0 0.3rem;
    color: #4a90d9;
  }

  .principle p {
    font-size: 0.9rem;
    color: #444;
  }

  .principle blockquote {
    border-left: 3px solid #4a90d9;
    padding: 0.3rem 0.6rem;
    margin: 0.5rem 0 0;
    font-style: italic;
    font-size: 0.8rem;
    color: #666;
    background: white;
  }

  .cluster-picker {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .cluster-picker button {
    padding: 0.5rem 1rem;
    border: 2px solid #e0e0e0;
    background: #f8f9fa;
    border-radius: 6px;
    cursor: pointer;
    font: inherit;
  }

  .cluster-picker button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .cluster-diagram {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    text-align: center;
  }

  .pillar {
    display: inline-block;
    background: #4a90d9;
    color: white;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .spokes {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .spoke {
    padding: 0.5rem 0.8rem;
    background: #eef4fb;
    border: 1px solid #c7dcf3;
    border-radius: 6px;
    font-size: 0.85rem;
    color: #1a4b7a;
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

  .status {
    display: inline-block;
    padding: 0.15rem 0.6rem;
    border-radius: 4px;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .callout {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .col {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .col.breadth {
    background: #fef2f2;
  }

  .col.depth {
    background: #f0fdf4;
  }

  .col h3 {
    margin-top: 0;
  }

  .col ul {
    padding-left: 1.2rem;
    font-size: 0.9rem;
  }

  .verdict {
    padding: 0.5rem;
    border-radius: 6px;
    text-align: center;
    font-weight: 700;
    font-size: 0.85rem;
  }

  .verdict.bad {
    background: #fecaca;
    color: #991b1b;
  }

  .verdict.good {
    background: #dcfce7;
    color: #166534;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
