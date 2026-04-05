import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '18-2',
		title: 'E-E-A-T & March 2026 Google Core Update',
		phase: 6,
		module: 18,
		lessonIndex: 2
	},
	description: `Google's E-E-A-T framework — Experience, Expertise, Authoritativeness, and Trustworthiness — is the quality backbone of modern search ranking. The March 2026 Core Update introduced the Gemini 4.0 Semantic Filter, which evaluates "Information Gain": does your content add something genuinely new beyond what already exists in search results?

Pages that merely rehash existing content are demoted. Original research, first-hand experience, unique data, and expert perspectives are rewarded. Understanding E-E-A-T helps you create content that both users and algorithms value.

This lesson dives deep into each pillar, shows how the Gemini 4.0 Semantic Filter quantifies novelty, and provides a working scoring calculator so you can self-audit pages before publishing.`,
	objectives: [
		'Define each component of E-E-A-T and how it influences search rankings',
		'Explain the Information Gain concept introduced with the Gemini 4.0 Semantic Filter',
		'Apply E-E-A-T principles when structuring web content in SvelteKit',
		'Identify content strategies that demonstrate first-hand experience and expertise',
		'Recognize AI-generated content patterns that the March 2026 update penalizes'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type EEATPillar = {
    letter: string;
    name: string;
    description: string;
    signals: string[];
    example: string;
  };

  const pillars: EEATPillar[] = [
    {
      letter: 'E',
      name: 'Experience',
      description: 'First-hand, real-world experience with the topic.',
      signals: [
        'Author has personally used the product or visited the place',
        'Photos, screenshots, or video from the author',
        'Specific details only a user would know',
        'Personal anecdotes and lessons learned'
      ],
      example: '"After running SvelteKit in production for 18 months serving 5M requests/day, here is what broke..."'
    },
    {
      letter: 'E',
      name: 'Expertise',
      description: 'Demonstrated knowledge and skill in the subject area.',
      signals: [
        'Credentials, education, certifications',
        'Depth of technical explanation',
        'Correct use of domain-specific terminology',
        'Cites primary sources, not summaries'
      ],
      example: 'Medical article written by a board-certified physician, code tutorial by a core maintainer.'
    },
    {
      letter: 'A',
      name: 'Authoritativeness',
      description: 'Recognition as a go-to source in the field.',
      signals: [
        'Inbound links from reputable sites',
        'Mentions in industry publications',
        'Author bylines on trusted domains',
        'Wikipedia entries and knowledge panels'
      ],
      example: 'A security researcher quoted in Wired, Ars Technica, and Google Security Blog.'
    },
    {
      letter: 'T',
      name: 'Trustworthiness',
      description: 'Accuracy, transparency, and safety of the site.',
      signals: [
        'HTTPS, valid SSL, clear privacy policy',
        'Accurate, up-to-date information',
        'Transparent authorship and contact info',
        'Corrections and retractions when wrong'
      ],
      example: 'News site with named editors, corrections policy, and a physical address in the footer.'
    }
  ];

  let activePillar = $state(0);

  // Interactive E-E-A-T scoring calculator
  type Check = { id: string; label: string; weight: number };
  const checks: Check[] = [
    { id: 'author-bio', label: 'Named author with bio and credentials', weight: 15 },
    { id: 'firsthand', label: 'First-hand experience clearly demonstrated', weight: 20 },
    { id: 'original-data', label: 'Contains original research or unique data', weight: 25 },
    { id: 'citations', label: 'Cites primary sources with links', weight: 10 },
    { id: 'updated', label: 'Updated within the last 12 months', weight: 10 },
    { id: 'corrections', label: 'Has corrections / editorial policy', weight: 5 },
    { id: 'https', label: 'HTTPS with valid certificate', weight: 5 },
    { id: 'contact', label: 'Clear contact and ownership info', weight: 10 }
  ];

  let enabled = $state<Record<string, boolean>>({});
  const score = $derived(
    checks.reduce((sum, c) => sum + (enabled[c.id] ? c.weight : 0), 0)
  );
  const rating = $derived.by(() => {
    if (score >= 85) return { label: 'Excellent', color: '#16a34a' };
    if (score >= 65) return { label: 'Good', color: '#65a30d' };
    if (score >= 45) return { label: 'Fair', color: '#f59e0b' };
    return { label: 'Poor', color: '#ef4444' };
  });

  // Information Gain examples
  type IGItem = {
    label: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    example: string;
  };

  const igItems: IGItem[] = [
    {
      label: 'Original Research',
      description: 'Unique data, surveys, or experiments not found elsewhere',
      impact: 'high',
      example: 'Benchmarking 10 JS frameworks on identical hardware and publishing the raw numbers.'
    },
    {
      label: 'Expert Commentary',
      description: 'Insights from recognized authorities in the field',
      impact: 'high',
      example: 'Interviewing the Svelte core team about a design decision.'
    },
    {
      label: 'Unique Angle',
      description: 'Fresh perspective on well-covered topics',
      impact: 'medium',
      example: 'Explaining React hooks from a functional programming lens rather than a class component one.'
    },
    {
      label: 'Updated Information',
      description: 'Current data replacing outdated sources',
      impact: 'medium',
      example: 'Recompiling 2023 browser support tables with 2026 numbers.'
    },
    {
      label: 'Comprehensive Coverage',
      description: 'Addressing gaps left by existing content',
      impact: 'medium',
      example: 'The one tutorial that actually covers error handling in load functions.'
    },
    {
      label: 'Rehashed Content',
      description: 'Paraphrasing existing articles without adding value',
      impact: 'low',
      example: '"10 CSS Tips" that copies the same tips every other listicle has.'
    }
  ];

  // AI content detection signals
  const aiSignals: string[] = [
    'Generic phrasing and filler transitions ("In today\\'s fast-paced world...")',
    'Uniform sentence length and rhythm',
    'Hedging and overqualification on every claim',
    'Topic-accurate but example-poor content',
    'No author photos, bylines, or verifiable identity',
    'Hallucinated statistics without sources',
    'Published at machine-like cadence (100 posts / day)'
  ];

  const geminiCode = \`// How the Gemini 4.0 Semantic Filter evaluates a page (conceptual)
//
// 1. Retrieve top-20 pages already indexed for the target query
// 2. Vectorize their content into a semantic space
// 3. Vectorize the candidate page
// 4. Compute distance from the cluster centroid
// 5. Pages closer to the centroid score LOWER (less novel)
// 6. Pages far from the centroid but still relevant score HIGHER
//
// informationGain = semanticDistance * topicalRelevance
//
// Pages below a threshold are demoted or excluded entirely.\`;
</script>

<main>
  <h1>E-E-A-T &amp; the March 2026 Core Update</h1>
  <p class="subtitle">Experience, Expertise, Authoritativeness, Trustworthiness</p>

  <section class="pillars">
    {#each pillars as pillar, i (pillar.name)}
      <button
        class="pillar-card"
        class:active={activePillar === i}
        onclick={() => (activePillar = i)}
      >
        <div class="letter">{pillar.letter}</div>
        <h3>{pillar.name}</h3>
      </button>
    {/each}
  </section>

  <section class="pillar-detail">
    <h2>{pillars[activePillar].name}</h2>
    <p class="lead">{pillars[activePillar].description}</p>
    <h4>Signals Google looks for:</h4>
    <ul>
      {#each pillars[activePillar].signals as signal (signal)}
        <li>{signal}</li>
      {/each}
    </ul>
    <blockquote>{pillars[activePillar].example}</blockquote>
  </section>

  <section class="calculator">
    <h2>E-E-A-T Self-Audit Calculator</h2>
    <p>Check each box that applies to your page, then see your estimated E-E-A-T score.</p>

    <div class="checks">
      {#each checks as check (check.id)}
        <label class="check">
          <input
            type="checkbox"
            checked={enabled[check.id] ?? false}
            onchange={(e) => {
              const target = e.currentTarget;
              enabled = { ...enabled, [check.id]: target.checked };
            }}
          />
          <span>{check.label}</span>
          <span class="weight">+{check.weight}</span>
        </label>
      {/each}
    </div>

    <div class="score-display">
      <div class="score-bar">
        <div class="score-fill" style="width: {score}%; background: {rating.color}"></div>
      </div>
      <div class="score-text">
        <strong style="color: {rating.color}">{rating.label}</strong>
        <span>{score} / 100</span>
      </div>
    </div>
  </section>

  <section class="info-gain">
    <h2>Information Gain (March 2026)</h2>
    <p>
      The Gemini 4.0 Semantic Filter quantifies how much <em>new</em> information a page adds
      compared to what is already indexed. Pages below a novelty threshold are demoted.
    </p>

    <table>
      <thead>
        <tr><th>Signal</th><th>Impact</th><th>Description</th></tr>
      </thead>
      <tbody>
        {#each igItems as item (item.label)}
          <tr>
            <td><strong>{item.label}</strong></td>
            <td><span class="impact {item.impact}">{item.impact}</span></td>
            <td>
              {item.description}
              <br />
              <small class="example">{item.example}</small>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="gemini">
    <h2>How the Gemini 4.0 Semantic Filter Works</h2>
    <pre><code>{geminiCode}</code></pre>
  </section>

  <section class="ai-signals">
    <h2>AI Content Detection Signals</h2>
    <p>
      The March 2026 update specifically targets low-effort AI-generated content. These are the
      patterns Google flags:
    </p>
    <ul>
      {#each aiSignals as signal (signal)}
        <li>{signal}</li>
      {/each}
    </ul>
    <div class="callout">
      <strong>Note:</strong> AI-assisted content is not penalized per se &mdash; AI content that
      adds genuine Information Gain (synthesis, unique angle, verified facts) still ranks well.
      What is penalized is bulk, templated, unedited AI output.
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
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  .pillars {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .pillar-card {
    padding: 1rem 0.5rem;
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    cursor: pointer;
    text-align: center;
    font: inherit;
  }

  .pillar-card.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .letter {
    font-size: 2rem;
    font-weight: 800;
    color: #4a90d9;
  }

  .pillar-card h3 {
    margin: 0.3rem 0 0;
    font-size: 0.95rem;
  }

  .pillar-detail {
    background: #f0f7ff;
    padding: 1.5rem;
    border-radius: 10px;
    margin-bottom: 2rem;
  }

  .lead {
    font-size: 1.05rem;
    color: #333;
  }

  .pillar-detail ul {
    padding-left: 1.2rem;
  }

  .pillar-detail blockquote {
    border-left: 4px solid #4a90d9;
    padding: 0.5rem 1rem;
    margin: 1rem 0 0;
    font-style: italic;
    color: #555;
    background: #fff;
  }

  .calculator {
    background: #fafafa;
    border: 1px solid #e0e0e0;
    padding: 1.5rem;
    border-radius: 10px;
    margin-bottom: 2rem;
  }

  .checks {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1rem 0;
  }

  .check {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    cursor: pointer;
  }

  .check span:first-of-type {
    flex: 1;
  }

  .weight {
    font-weight: 700;
    color: #4a90d9;
    font-size: 0.9rem;
  }

  .score-display {
    margin-top: 1rem;
  }

  .score-bar {
    background: #eee;
    border-radius: 6px;
    overflow: hidden;
    height: 1.5rem;
  }

  .score-fill {
    height: 100%;
    transition: width 0.3s;
  }

  .score-text {
    display: flex;
    justify-content: space-between;
    margin-top: 0.4rem;
    font-size: 1.1rem;
  }

  .info-gain {
    margin-bottom: 2rem;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  th,
  td {
    padding: 0.6rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    font-size: 0.9rem;
    vertical-align: top;
  }

  th {
    background: #f0f0f0;
  }

  .impact {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .impact.high {
    background: #dcfce7;
    color: #166534;
  }

  .impact.medium {
    background: #fef3c7;
    color: #92400e;
  }

  .impact.low {
    background: #fecaca;
    color: #991b1b;
  }

  .example {
    color: #666;
    font-style: italic;
  }

  .gemini pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.8rem;
  }

  .callout {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
  }

  section {
    margin-bottom: 2.5rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
