import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '18-5',
		title: 'Core Web Vitals',
		phase: 6,
		module: 18,
		lessonIndex: 5
	},
	description: `Core Web Vitals (CWV) are Google's key metrics for page experience: Largest Contentful Paint (LCP) measures loading speed, Interaction to Next Paint (INP) measures responsiveness, and Cumulative Layout Shift (CLS) measures visual stability. The March 2026 update introduced holistic site-wide CWV evaluation — poor pages can drag down your entire domain.

Measuring with Lighthouse and Chrome DevTools, then optimizing images, fonts, layout, and JavaScript execution are essential skills for shipping performant SvelteKit applications.`,
	objectives: [
		'Define the three Core Web Vitals metrics and their passing thresholds',
		'Measure CWV using Lighthouse and Chrome DevTools Performance tab',
		'Apply optimization techniques for LCP, INP, and CLS in SvelteKit',
		'Understand site-wide CWV evaluation from the March 2026 update'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type CWVMetric = {
    name: string;
    fullName: string;
    good: string;
    needsWork: string;
    poor: string;
    unit: string;
    description: string;
    optimizations: string[];
  };

  const metrics: CWVMetric[] = [
    {
      name: 'LCP',
      fullName: 'Largest Contentful Paint',
      good: '≤ 2.5s',
      needsWork: '2.5s – 4.0s',
      poor: '> 4.0s',
      unit: 'seconds',
      description: 'Time until the largest visible content element is rendered.',
      optimizations: [
        'Optimize and compress images (WebP/AVIF)',
        'Preload critical resources with <link rel="preload">',
        'Use SSR to deliver HTML with content immediately',
        'Inline critical CSS, defer non-critical stylesheets',
        'Use SvelteKit prerendering for static pages'
      ]
    },
    {
      name: 'INP',
      fullName: 'Interaction to Next Paint',
      good: '≤ 200ms',
      needsWork: '200ms – 500ms',
      poor: '> 500ms',
      unit: 'milliseconds',
      description: 'Responsiveness — time from user interaction to the next visual update.',
      optimizations: [
        'Keep event handlers fast, avoid blocking the main thread',
        'Use $state.raw for large non-reactive datasets',
        'Break long tasks with requestAnimationFrame or setTimeout',
        'Minimize DOM size and avoid excessive re-renders',
        'Use Svelte transitions instead of JS animations'
      ]
    },
    {
      name: 'CLS',
      fullName: 'Cumulative Layout Shift',
      good: '≤ 0.1',
      needsWork: '0.1 – 0.25',
      poor: '> 0.25',
      unit: 'score',
      description: 'Visual stability — how much content shifts unexpectedly during loading.',
      optimizations: [
        'Set explicit width/height on images and videos',
        'Reserve space for dynamic content with min-height',
        'Use CSS contain on components with dynamic sizing',
        'Avoid inserting content above existing content',
        'Preload fonts with font-display: swap'
      ]
    }
  ];

  let activeMetric = $state(0);

  // Simulated scores
  let scores = $state({
    lcp: 1.8,
    inp: 145,
    cls: 0.05,
    performance: 94,
    accessibility: 98,
    seo: 100,
    bestPractices: 95
  });

  function getStatus(metric: string, value: number): 'good' | 'needs-work' | 'poor' {
    if (metric === 'lcp') return value <= 2.5 ? 'good' : value <= 4 ? 'needs-work' : 'poor';
    if (metric === 'inp') return value <= 200 ? 'good' : value <= 500 ? 'needs-work' : 'poor';
    if (metric === 'cls') return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-work' : 'poor';
    return 'good';
  }

  const statusColors = {
    'good': '#16a34a',
    'needs-work': '#ca8a04',
    'poor': '#dc2626'
  };
</script>

<main>
  <h1>Core Web Vitals</h1>
  <p class="subtitle">LCP · INP · CLS — March 2026 site-wide evaluation</p>

  <section class="metrics-overview">
    {#each metrics as metric, i}
      {@const value = i === 0 ? scores.lcp : i === 1 ? scores.inp : scores.cls}
      {@const key = i === 0 ? 'lcp' : i === 1 ? 'inp' : 'cls'}
      {@const status = getStatus(key, value)}
      <button
        class="metric-card"
        class:active={activeMetric === i}
        onclick={() => activeMetric = i}
        style="border-left: 4px solid {statusColors[status]}"
      >
        <h2>{metric.name}</h2>
        <p class="metric-value" style="color: {statusColors[status]}">
          {value}{i === 2 ? '' : i === 0 ? 's' : 'ms'}
        </p>
        <p class="threshold">{metric.good}</p>
      </button>
    {/each}
  </section>

  <section class="metric-detail">
    <h2>{metrics[activeMetric].fullName} ({metrics[activeMetric].name})</h2>
    <p>{metrics[activeMetric].description}</p>

    <div class="thresholds">
      <div class="threshold-bar good">Good: {metrics[activeMetric].good}</div>
      <div class="threshold-bar needs-work">Needs Work: {metrics[activeMetric].needsWork}</div>
      <div class="threshold-bar poor">Poor: {metrics[activeMetric].poor}</div>
    </div>

    <h3>Optimization Techniques</h3>
    <ul>
      {#each metrics[activeMetric].optimizations as opt}
        <li>{opt}</li>
      {/each}
    </ul>
  </section>

  <section class="lighthouse">
    <h2>Lighthouse Scores</h2>
    <div class="score-grid">
      {#each [
        { label: 'Performance', score: scores.performance },
        { label: 'Accessibility', score: scores.accessibility },
        { label: 'SEO', score: scores.seo },
        { label: 'Best Practices', score: scores.bestPractices }
      ] as item}
        {@const color = item.score >= 90 ? '#16a34a' : item.score >= 50 ? '#ca8a04' : '#dc2626'}
        <div class="score-circle">
          <svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="6" />
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke={color} stroke-width="6"
              stroke-dasharray="{item.score * 2.83} 283"
              stroke-linecap="round"
              transform="rotate(-90 50 50)"
            />
            <text x="50" y="55" text-anchor="middle" font-size="20" font-weight="bold" fill={color}>
              {item.score}
            </text>
          </svg>
          <span>{item.label}</span>
        </div>
      {/each}
    </div>
  </section>

  <section class="note">
    <h3>March 2026: Site-Wide CWV</h3>
    <p>Google now evaluates Core Web Vitals <strong>holistically across your entire site</strong>. A few poorly performing pages can negatively affect rankings for your whole domain. Ensure every route — not just the homepage — meets passing thresholds.</p>
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
    margin-bottom: 2rem;
  }

  .metrics-overview {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .metric-card {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.25rem;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
  }

  .metric-card.active {
    background: #eef4fb;
    border-color: #4a90d9;
  }

  .metric-card h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  .metric-value {
    font-size: 1.8rem;
    font-weight: 700;
    margin: 0.5rem 0 0.25rem;
  }

  .threshold {
    color: #888;
    font-size: 0.8rem;
    margin: 0;
  }

  .metric-detail {
    background: #f0f7ff;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .thresholds {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .threshold-bar {
    flex: 1;
    padding: 0.5rem;
    border-radius: 6px;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .threshold-bar.good { background: #dcfce7; color: #166534; }
  .threshold-bar.needs-work { background: #fef9c3; color: #854d0e; }
  .threshold-bar.poor { background: #fecaca; color: #991b1b; }

  .metric-detail ul {
    padding-left: 1.2rem;
  }

  .metric-detail li {
    margin-bottom: 0.4rem;
  }

  .score-grid {
    display: flex;
    justify-content: space-around;
    margin-top: 1rem;
  }

  .score-circle {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .note {
    background: #fffbeb;
    border: 1px solid #f59e0b;
    padding: 1.25rem;
    border-radius: 8px;
  }

  .note h3 {
    margin-top: 0;
    color: #92400e;
  }

  section {
    margin-bottom: 2rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
