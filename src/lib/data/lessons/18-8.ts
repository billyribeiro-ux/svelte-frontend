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

For SvelteKit developers, mdsvex (Markdown + Svelte) enables rich, interactive content. Depth beats breadth: fewer, more comprehensive articles outperform many thin pages. This lesson teaches you to plan content that both humans and algorithms value.`,
	objectives: [
		'Develop content strategies that maximize Information Gain scoring',
		'Balance depth vs breadth in content planning for zero-click search',
		'Use mdsvex to create rich, interactive Markdown content in SvelteKit',
		'Apply original research and unique data to differentiate content'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type ContentPrinciple = {
    title: string;
    description: string;
    examples: string[];
    infoGainScore: 'high' | 'medium' | 'low';
  };

  const principles: ContentPrinciple[] = [
    {
      title: 'Original Research',
      description: 'Conduct surveys, experiments, or analysis that produces unique data points.',
      examples: [
        'Survey 500 developers about Svelte adoption',
        'Benchmark SvelteKit vs Next.js build times',
        'Analyze 1000 top-ranking pages for structured data usage'
      ],
      infoGainScore: 'high'
    },
    {
      title: 'First-Hand Experience',
      description: 'Write from direct personal experience, not second-hand summaries.',
      examples: [
        '"I migrated 50k LOC from React to Svelte — here\\'s what happened"',
        'Production incident post-mortems with real metrics',
        'Behind-the-scenes of building and launching a SaaS'
      ],
      infoGainScore: 'high'
    },
    {
      title: 'Expert Commentary',
      description: 'Provide insights that only someone with deep expertise could offer.',
      examples: [
        'Architecture decisions and their long-term consequences',
        'Common mistakes with nuanced explanations',
        'Predictions grounded in technical understanding'
      ],
      infoGainScore: 'high'
    },
    {
      title: 'Comprehensive Depth',
      description: 'Cover a topic more thoroughly than any existing resource.',
      examples: [
        'The definitive guide to SvelteKit routing (every edge case)',
        'Complete SSR performance optimization playbook',
        'Every structured data type explained with SvelteKit code'
      ],
      infoGainScore: 'medium'
    },
    {
      title: 'Unique Angle',
      description: 'Present familiar topics from a fresh, unexpected perspective.',
      examples: [
        '"CSS is a programming language" with formal proofs',
        'Explaining reactivity through the lens of spreadsheets',
        'What game design teaches us about form UX'
      ],
      infoGainScore: 'medium'
    }
  ];

  let activePrinciple = $state(0);

  const scoreColors = { high: '#16a34a', medium: '#ca8a04', low: '#dc2626' };

  // Content strategy stats
  const stats = [
    { value: '69%', label: 'Zero-click searches', note: 'Users get answers without clicking' },
    { value: '25-35%', label: 'CTR boost', note: 'From structured data / rich results' },
    { value: '10x', label: 'Depth over breadth', note: '1 deep article > 10 shallow ones' },
    { value: '3-6mo', label: 'Content maturity', note: 'Time for articles to reach peak ranking' }
  ];

  // mdsvex example
  const mdsvexExample = \`---
title: "SvelteKit Performance Guide"
date: "2026-03-15"
author: "Jane Developer"
description: "Original benchmarks comparing SSR strategies"
---

<script>
  import Chart from '$lib/components/Chart.svelte';
  import Callout from '$lib/components/Callout.svelte';

  // Data from our original benchmark study
  const benchmarkData = [
    { framework: 'SvelteKit SSR', ttfb: 45 },
    { framework: 'Next.js SSR', ttfb: 120 },
    { framework: 'Nuxt SSR', ttfb: 95 }
  ];
</script>

# {title}

<Callout type="info">
  Based on benchmarks run on 2026-03-10 across
  50 cold starts per framework on Cloudflare Workers.
</Callout>

## Original Benchmark Results

<Chart data={benchmarkData} />

Our testing shows SvelteKit's SSR is **2.6x faster**
than Next.js on cold starts...\`;

  type ContentType = { type: string; frequency: string; goal: string };

  const contentCalendar: ContentType[] = [
    { type: 'Pillar Article', frequency: 'Monthly', goal: 'Comprehensive, 3000+ word deep dive' },
    { type: 'Original Research', frequency: 'Quarterly', goal: 'Unique data, benchmarks, surveys' },
    { type: 'Tutorial', frequency: 'Bi-weekly', goal: 'Practical, step-by-step with code' },
    { type: 'Case Study', frequency: 'Monthly', goal: 'Real-world results with metrics' },
    { type: 'Quick Tip', frequency: 'Weekly', goal: 'Concise, high-value code snippets' }
  ];
</script>

<main>
  <h1>Content Strategy Post-March 2026</h1>
  <p class="subtitle">Information Gain, zero-click search, and content that earns rankings</p>

  <section class="stats-grid">
    {#each stats as stat}
      <div class="stat-card">
        <span class="stat-value">{stat.value}</span>
        <span class="stat-label">{stat.label}</span>
        <span class="stat-note">{stat.note}</span>
      </div>
    {/each}
  </section>

  <section class="principles">
    <h2>Information Gain Principles</h2>
    <div class="principle-list">
      {#each principles as principle, i}
        <button
          class="principle-btn"
          class:active={activePrinciple === i}
          onclick={() => activePrinciple = i}
        >
          <span class="score-dot" style="background: {scoreColors[principle.infoGainScore]}"></span>
          {principle.title}
        </button>
      {/each}
    </div>

    <div class="principle-detail">
      <div class="detail-header">
        <h3>{principles[activePrinciple].title}</h3>
        <span class="score-badge" style="background: {scoreColors[principles[activePrinciple].infoGainScore]}">
          {principles[activePrinciple].infoGainScore} info gain
        </span>
      </div>
      <p>{principles[activePrinciple].description}</p>
      <ul>
        {#each principles[activePrinciple].examples as example}
          <li>{example}</li>
        {/each}
      </ul>
    </div>
  </section>

  <section class="mdsvex">
    <h2>mdsvex: Rich Content in SvelteKit</h2>
    <p>mdsvex lets you write Markdown with embedded Svelte components — perfect for interactive, data-rich articles.</p>
    <pre><code>{mdsvexExample}</code></pre>
  </section>

  <section class="calendar">
    <h2>Content Calendar Template</h2>
    <table>
      <thead>
        <tr><th>Content Type</th><th>Frequency</th><th>Goal</th></tr>
      </thead>
      <tbody>
        {#each contentCalendar as item}
          <tr>
            <td><strong>{item.type}</strong></td>
            <td>{item.frequency}</td>
            <td>{item.goal}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</main>

<style>
  main {
    max-width: 850px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  .subtitle { color: #666; margin-bottom: 2rem; }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .stat-card {
    text-align: center;
    padding: 1.25rem;
    background: #f8f9fa;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
  }

  .stat-value {
    display: block;
    font-size: 1.6rem;
    font-weight: 700;
    color: #1a5bb5;
  }

  .stat-label {
    display: block;
    font-weight: 600;
    font-size: 0.85rem;
    margin: 0.25rem 0;
  }

  .stat-note {
    display: block;
    font-size: 0.75rem;
    color: #888;
  }

  .principle-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .principle-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .principle-btn.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .score-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .principle-detail {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-header h3 { margin: 0; }

  .score-badge {
    color: white;
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .principle-detail ul { padding-left: 1.2rem; }
  .principle-detail li { margin-bottom: 0.4rem; font-size: 0.9rem; }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
    line-height: 1.4;
  }

  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th, td { padding: 0.6rem; text-align: left; border-bottom: 1px solid #e0e0e0; }
  th { background: #f0f0f0; }

  section { margin-bottom: 2.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
