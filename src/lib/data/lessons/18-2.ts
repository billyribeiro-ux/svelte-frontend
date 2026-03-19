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

Pages that merely rehash existing content are demoted. Original research, first-hand experience, unique data, and expert perspectives are rewarded. Understanding E-E-A-T helps you create content that both users and algorithms value.`,
	objectives: [
		'Define each component of E-E-A-T and how it influences search rankings',
		'Explain the Information Gain concept introduced with the Gemini 4.0 Semantic Filter',
		'Apply E-E-A-T principles when structuring web content in SvelteKit',
		'Identify content strategies that demonstrate first-hand experience and expertise'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type EEATPillar = {
    letter: string;
    name: string;
    description: string;
    examples: string[];
    implementationTips: string[];
  };

  const pillars: EEATPillar[] = [
    {
      letter: 'E',
      name: 'Experience',
      description: 'First-hand, real-world experience with the topic.',
      examples: [
        'Product reviews from actual users',
        'Travel guides from people who visited',
        'Tutorials from practitioners, not observers'
      ],
      implementationTips: [
        'Include personal anecdotes and case studies',
        'Show original screenshots, photos, or data',
        'Add author bios with relevant experience'
      ]
    },
    {
      letter: 'E',
      name: 'Expertise',
      description: 'Demonstrated knowledge and skill in the subject area.',
      examples: [
        'Technical articles by certified professionals',
        'Medical content by licensed practitioners',
        'Code tutorials by working developers'
      ],
      implementationTips: [
        'Display credentials and certifications',
        'Link to published works or portfolios',
        'Use accurate, up-to-date technical language'
      ]
    },
    {
      letter: 'A',
      name: 'Authoritativeness',
      description: 'Recognition as a go-to source in the field.',
      examples: [
        'Cited by other reputable sites',
        'Featured in industry publications',
        'High-quality backlink profile'
      ],
      implementationTips: [
        'Build topical authority with content clusters',
        'Earn mentions and links from peers',
        'Maintain consistent, high-quality output'
      ]
    },
    {
      letter: 'T',
      name: 'Trustworthiness',
      description: 'Accuracy, transparency, and safety of the site.',
      examples: [
        'HTTPS with valid certificates',
        'Clear privacy policy and contact info',
        'Cited sources and fact-checked content'
      ],
      implementationTips: [
        'Use HTTPS everywhere',
        'Add structured data for authors',
        'Include editorial policies and corrections'
      ]
    }
  ];

  let activePillar = $state(0);

  type InfoGainSignal = {
    label: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  };

  const infoGainSignals: InfoGainSignal[] = [
    { label: 'Original Research', description: 'Unique data, surveys, experiments not found elsewhere', impact: 'high' },
    { label: 'Expert Commentary', description: 'Insights from recognized authorities in the field', impact: 'high' },
    { label: 'Unique Angle', description: 'Fresh perspective on well-covered topics', impact: 'medium' },
    { label: 'Updated Information', description: 'Current data replacing outdated sources', impact: 'medium' },
    { label: 'Comprehensive Coverage', description: 'Addressing gaps left by existing content', impact: 'medium' },
    { label: 'Rehashed Content', description: 'Paraphrasing existing articles without adding value', impact: 'low' }
  ];

  const impactColors: Record<string, string> = {
    high: '#16a34a',
    medium: '#ca8a04',
    low: '#dc2626'
  };
</script>

<main>
  <h1>E-E-A-T & the March 2026 Core Update</h1>
  <p class="subtitle">Experience · Expertise · Authoritativeness · Trustworthiness</p>

  <section class="pillars">
    {#each pillars as pillar, i}
      <button
        class="pillar-tab"
        class:active={activePillar === i}
        onclick={() => activePillar = i}
      >
        <span class="letter">{pillar.letter}</span>
        <span class="name">{pillar.name}</span>
      </button>
    {/each}
  </section>

  <section class="pillar-detail">
    <h2>{pillars[activePillar].name}</h2>
    <p class="desc">{pillars[activePillar].description}</p>

    <div class="columns">
      <div>
        <h4>Examples</h4>
        <ul>
          {#each pillars[activePillar].examples as example}
            <li>{example}</li>
          {/each}
        </ul>
      </div>
      <div>
        <h4>Implementation Tips</h4>
        <ul>
          {#each pillars[activePillar].implementationTips as tip}
            <li>{tip}</li>
          {/each}
        </ul>
      </div>
    </div>
  </section>

  <section class="info-gain">
    <h2>Information Gain — Gemini 4.0 Semantic Filter</h2>
    <p>The March 2026 update rewards content that provides <strong>new information</strong> not already available in top search results.</p>

    <div class="signals">
      {#each infoGainSignals as signal}
        <div class="signal-card">
          <div class="signal-header">
            <span class="signal-label">{signal.label}</span>
            <span class="impact-badge" style="background: {impactColors[signal.impact]}">
              {signal.impact} value
            </span>
          </div>
          <p>{signal.description}</p>
        </div>
      {/each}
    </div>
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

  .pillars {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .pillar-tab {
    flex: 1;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s;
  }

  .pillar-tab.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .letter {
    display: block;
    font-size: 1.8rem;
    font-weight: 700;
    color: #4a90d9;
  }

  .name {
    font-size: 0.85rem;
    color: #555;
  }

  .pillar-detail {
    background: #f0f7ff;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .desc {
    color: #444;
    margin-bottom: 1rem;
  }

  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .columns ul {
    padding-left: 1.2rem;
  }

  .columns li {
    margin-bottom: 0.4rem;
    color: #333;
  }

  .info-gain h2 {
    margin-bottom: 0.5rem;
  }

  .signals {
    display: grid;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .signal-card {
    padding: 1rem;
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }

  .signal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
  }

  .signal-label {
    font-weight: 600;
  }

  .impact-badge {
    color: white;
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    text-transform: uppercase;
  }

  .signal-card p {
    margin: 0;
    color: #555;
    font-size: 0.9rem;
  }

  h4 {
    margin-bottom: 0.5rem;
    color: #333;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
