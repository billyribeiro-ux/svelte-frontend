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

Measuring with Lighthouse and Chrome DevTools, then optimizing images, fonts, layout, and JavaScript execution are essential skills for shipping performant SvelteKit applications.

This lesson provides a visual simulator for each metric, a Lighthouse-style scoring widget, SvelteKit-specific optimization recipes, and a breakdown of the March 2026 site-wide holistic metric.`,
	objectives: [
		'Define LCP, INP, and CLS and their passing thresholds',
		'Measure CWV using Lighthouse and Chrome DevTools Performance tab',
		'Apply optimization techniques for LCP, INP, and CLS in SvelteKit',
		'Understand site-wide CWV evaluation from the March 2026 update',
		'Identify common SvelteKit pitfalls that hurt CWV scores'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Metric = {
    key: 'LCP' | 'INP' | 'CLS';
    name: string;
    full: string;
    good: number;
    poor: number;
    unit: string;
    description: string;
    fixes: string[];
  };

  const metrics: Metric[] = [
    {
      key: 'LCP',
      name: 'LCP',
      full: 'Largest Contentful Paint',
      good: 2500,
      poor: 4000,
      unit: 'ms',
      description:
        'Time until the largest visible element (hero image, main heading) finishes rendering.',
      fixes: [
        'Preload hero images with <link rel="preload">',
        'Use SvelteKit prerender for static routes',
        'Serve images as AVIF/WebP with srcset',
        'Remove render-blocking third-party scripts',
        'Upgrade to HTTP/3 and a CDN at the edge'
      ]
    },
    {
      key: 'INP',
      name: 'INP',
      full: 'Interaction to Next Paint',
      good: 200,
      poor: 500,
      unit: 'ms',
      description:
        'Latency from a user interaction (click, tap, key press) to the next rendered frame.',
      fixes: [
        'Break long tasks (>50ms) with scheduler.yield()',
        'Avoid giant event handlers in onclick',
        'Use Svelte 5 runes which batch updates efficiently',
        'Defer non-critical JS with type="module" and async',
        'Move heavy computation into Web Workers'
      ]
    },
    {
      key: 'CLS',
      name: 'CLS',
      full: 'Cumulative Layout Shift',
      good: 0.1,
      poor: 0.25,
      unit: '',
      description:
        'Sum of layout shift scores as content moves around during loading. Lower is better.',
      fixes: [
        'Always specify width and height on <img> elements',
        'Reserve space for ads and embeds with CSS aspect-ratio',
        'Use font-display: optional to avoid FOIT/FOUT shifts',
        'Avoid inserting content above existing content',
        'Animate with transform, not top/left/width/height'
      ]
    }
  ];

  let activeMetric = $state(0);

  // Interactive simulator values
  let lcp = $state(2100);
  let inp = $state(180);
  let cls = $state(0.08);

  function ratingOf(value: number, m: Metric): 'good' | 'needs' | 'poor' {
    if (value <= m.good) return 'good';
    if (value <= m.poor) return 'needs';
    return 'poor';
  }

  const lcpRating = $derived(ratingOf(lcp, metrics[0]));
  const inpRating = $derived(ratingOf(inp, metrics[1]));
  const clsRating = $derived(ratingOf(cls, metrics[2]));

  const ratingColors: Record<string, string> = {
    good: '#16a34a',
    needs: '#f59e0b',
    poor: '#ef4444'
  };

  const ratingLabels: Record<string, string> = {
    good: 'Good',
    needs: 'Needs Improvement',
    poor: 'Poor'
  };

  // Lighthouse-style score (weighted average, simplified)
  const performanceScore = $derived.by(() => {
    const lcpScore = lcp <= 2500 ? 100 : lcp <= 4000 ? 75 : lcp <= 6000 ? 50 : 25;
    const inpScore = inp <= 200 ? 100 : inp <= 500 ? 75 : inp <= 800 ? 50 : 25;
    const clsScore = cls <= 0.1 ? 100 : cls <= 0.25 ? 75 : cls <= 0.5 ? 50 : 25;
    return Math.round(lcpScore * 0.35 + inpScore * 0.35 + clsScore * 0.3);
  });

  const scoreColor = $derived(
    performanceScore >= 90 ? '#16a34a' : performanceScore >= 50 ? '#f59e0b' : '#ef4444'
  );

  // Optimization code examples
  const preloadExample = [
    '<!-- src/routes/+layout.svelte -->',
    '<svelte:head>',
    '  <link',
    '    rel="preload"',
    '    as="image"',
    '    href="/hero.avif"',
    '    type="image/avif"',
    '    fetchpriority="high"',
    '  />',
    '  <link rel="preconnect" href="https://cdn.example.com" crossorigin />',
    '</svelte:head>'
  ].join('\\n');

  const imageExample = [
    '<!-- Responsive image with explicit dimensions -->',
    '<img',
    '  src="/hero-800.avif"',
    '  srcset="/hero-400.avif 400w, /hero-800.avif 800w, /hero-1600.avif 1600w"',
    '  sizes="(max-width: 768px) 100vw, 800px"',
    '  width="800"',
    '  height="450"',
    '  alt="Hero image"',
    '  loading="eager"',
    '  fetchpriority="high"',
    '/>'
  ].join('\\n');

  const inpExample = [
    '<script lang="ts">',
    '  // Break up long tasks to improve INP',
    '  async function handleClick() {',
    '    const items = computeFirstBatch();',
    '    render(items);',
    '    await scheduler.yield();',
    '    const more = computeSecondBatch();',
    '    render(more);',
    '  }',
    '</' + 'script>'
  ].join('\\n');

  // March 2026 site-wide metric
  const holisticStats = [
    { label: 'Pages scoring Good', value: 72 },
    { label: 'Pages needing improvement', value: 20 },
    { label: 'Pages scoring Poor', value: 8 }
  ];

  const sitewideGood = $derived(holisticStats[0].value >= 75);
</script>

<main>
  <h1>Core Web Vitals</h1>
  <p class="subtitle">LCP &middot; INP &middot; CLS &mdash; and the March 2026 holistic metric</p>

  <section class="metric-picker">
    {#each metrics as m, i (m.key)}
      <button class="metric-btn" class:active={activeMetric === i} onclick={() => (activeMetric = i)}>
        <strong>{m.name}</strong>
        <small>{m.full}</small>
      </button>
    {/each}
  </section>

  <section class="metric-detail">
    <h2>{metrics[activeMetric].full}</h2>
    <p>{metrics[activeMetric].description}</p>

    <div class="thresholds">
      <div class="threshold good">
        <strong>Good</strong>
        <span>&le; {metrics[activeMetric].good}{metrics[activeMetric].unit}</span>
      </div>
      <div class="threshold needs">
        <strong>Needs Improvement</strong>
        <span>&le; {metrics[activeMetric].poor}{metrics[activeMetric].unit}</span>
      </div>
      <div class="threshold poor">
        <strong>Poor</strong>
        <span>&gt; {metrics[activeMetric].poor}{metrics[activeMetric].unit}</span>
      </div>
    </div>

    <h3>How to fix it in SvelteKit</h3>
    <ul>
      {#each metrics[activeMetric].fixes as fix (fix)}
        <li>{fix}</li>
      {/each}
    </ul>
  </section>

  <section class="simulator">
    <h2>Lighthouse Score Simulator</h2>
    <p>Drag the sliders to see how each metric affects your performance score.</p>

    <div class="sliders">
      <label>
        <span>LCP: {lcp}ms</span>
        <input type="range" min="500" max="8000" step="100" bind:value={lcp} />
        <div class="rating" style="color: {ratingColors[lcpRating]}">
          {ratingLabels[lcpRating]}
        </div>
      </label>

      <label>
        <span>INP: {inp}ms</span>
        <input type="range" min="50" max="1000" step="10" bind:value={inp} />
        <div class="rating" style="color: {ratingColors[inpRating]}">
          {ratingLabels[inpRating]}
        </div>
      </label>

      <label>
        <span>CLS: {cls}</span>
        <input type="range" min="0" max="0.6" step="0.01" bind:value={cls} />
        <div class="rating" style="color: {ratingColors[clsRating]}">
          {ratingLabels[clsRating]}
        </div>
      </label>
    </div>

    <div class="score-circle" style="--score-color: {scoreColor}">
      <div class="score-number">{performanceScore}</div>
      <div class="score-label">Performance</div>
    </div>
  </section>

  <section class="visual-demo">
    <h2>CLS Visual Example</h2>
    <p>This is what a bad CLS looks like: content jumps as images load without dimensions.</p>
    <div class="cls-demo">
      <div class="cls-bad">
        <strong>Bad (no width/height)</strong>
        <div class="cls-text">Content above the image</div>
        <div class="cls-img-bad"></div>
        <div class="cls-text">Content below shifts down</div>
      </div>
      <div class="cls-good">
        <strong>Good (reserved space)</strong>
        <div class="cls-text">Content above the image</div>
        <div class="cls-img-good"></div>
        <div class="cls-text">Content stays in place</div>
      </div>
    </div>
  </section>

  <section class="code-section">
    <h2>Image Preload (LCP)</h2>
    <pre><code>{preloadExample}</code></pre>

    <h2>Responsive Image (LCP + CLS)</h2>
    <pre><code>{imageExample}</code></pre>

    <h2>Break Long Tasks (INP)</h2>
    <pre><code>{inpExample}</code></pre>
  </section>

  <section class="holistic">
    <h2>March 2026: Site-wide Holistic CWV</h2>
    <p>
      Google now evaluates CWV at the origin level. If too many pages on your domain score Poor,
      the entire site suffers a ranking penalty &mdash; even on pages that individually pass.
      The threshold is roughly 75% of pages scoring Good.
    </p>

    <div class="site-stats">
      {#each holisticStats as stat (stat.label)}
        <div class="stat">
          <div class="stat-value">{stat.value}%</div>
          <div class="stat-label">{stat.label}</div>
        </div>
      {/each}
    </div>

    <div class="site-verdict" class:ok={sitewideGood} class:bad={!sitewideGood}>
      {sitewideGood
        ? 'Site passes the 75% Good threshold'
        : 'Site falls below the 75% Good threshold — ranking penalty applies'}
    </div>

    <div class="callout">
      <strong>SvelteKit tip:</strong> use \`adapter-static\` or \`adapter-cloudflare\` with
      prerendered routes to eliminate server latency on low-traffic pages. A single slow page
      template with thousands of URLs can tank your holistic score.
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

  .metric-picker {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .metric-btn {
    padding: 1rem;
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    cursor: pointer;
    font: inherit;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .metric-btn.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .metric-btn strong {
    font-size: 1.4rem;
    color: #4a90d9;
  }

  .metric-btn small {
    color: #666;
    font-size: 0.8rem;
    margin-top: 0.2rem;
  }

  .metric-detail {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
  }

  .thresholds {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .threshold {
    padding: 0.6rem;
    border-radius: 6px;
    text-align: center;
    font-size: 0.85rem;
  }

  .threshold.good {
    background: #dcfce7;
    color: #166534;
  }

  .threshold.needs {
    background: #fef3c7;
    color: #92400e;
  }

  .threshold.poor {
    background: #fecaca;
    color: #991b1b;
  }

  .threshold strong {
    display: block;
    margin-bottom: 0.2rem;
  }

  .simulator {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 10px;
    border: 1px solid #e0e0e0;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    align-items: center;
  }

  .simulator h2 {
    grid-column: 1 / -1;
    margin: 0;
  }

  .simulator > p {
    grid-column: 1 / -1;
    margin: 0;
  }

  .sliders label {
    display: block;
    margin-bottom: 1rem;
  }

  .sliders label span {
    font-weight: 600;
    display: block;
    margin-bottom: 0.2rem;
  }

  .sliders input[type='range'] {
    width: 100%;
  }

  .rating {
    font-size: 0.8rem;
    font-weight: 700;
  }

  .score-circle {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    border: 10px solid var(--score-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    justify-self: center;
  }

  .score-number {
    font-size: 2.4rem;
    font-weight: 700;
    color: var(--score-color);
  }

  .score-label {
    font-size: 0.8rem;
    color: #666;
  }

  .cls-demo {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .cls-bad,
  .cls-good {
    padding: 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
  }

  .cls-bad strong {
    color: #991b1b;
  }

  .cls-good strong {
    color: #166534;
  }

  .cls-text {
    padding: 0.3rem 0;
    font-size: 0.85rem;
  }

  .cls-img-bad {
    width: 100%;
    height: 100px;
    background: linear-gradient(135deg, #fecaca, #fca5a5);
    animation: grow 3s ease-in-out infinite;
  }

  .cls-img-good {
    width: 100%;
    height: 100px;
    background: linear-gradient(135deg, #dcfce7, #86efac);
  }

  @keyframes grow {
    0%,
    50% {
      height: 0;
    }
    100% {
      height: 100px;
    }
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
  }

  .site-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin: 1rem 0;
  }

  .stat {
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    text-align: center;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #4a90d9;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #666;
  }

  .site-verdict {
    padding: 1rem;
    border-radius: 8px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
  }

  .site-verdict.ok {
    background: #dcfce7;
    color: #166534;
  }

  .site-verdict.bad {
    background: #fecaca;
    color: #991b1b;
  }

  .callout {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
