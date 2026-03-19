import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '18-4',
		title: 'Structured Data & JSON-LD',
		phase: 6,
		module: 18,
		lessonIndex: 4
	},
	description: `Structured data using JSON-LD (JavaScript Object Notation for Linked Data) tells search engines exactly what your content represents — an article, a product, an FAQ, an event. By embedding Schema.org vocabulary in <svelte:head>, you unlock Rich Results in Google Search: star ratings, FAQ dropdowns, recipe cards, and more.

Studies show structured data can increase click-through rates by 25–35%. SvelteKit makes it trivial to generate JSON-LD dynamically from load function data, ensuring every page carries machine-readable metadata.`,
	objectives: [
		'Embed JSON-LD structured data within <svelte:head> in SvelteKit pages',
		'Implement Article and FAQ schema types using Schema.org vocabulary',
		'Understand how structured data enables Rich Results and increases CTR by 25–35%',
		'Validate structured data with Google Rich Results Test'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Article = {
    title: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified: string;
    image: string;
    url: string;
  };

  type FAQ = {
    question: string;
    answer: string;
  };

  // Simulated article data from a load function
  let article = $state<Article>({
    title: 'Understanding Structured Data for SEO',
    description: 'A complete guide to implementing JSON-LD structured data in SvelteKit applications.',
    author: 'Jane Developer',
    datePublished: '2026-03-01',
    dateModified: '2026-03-15',
    image: 'https://example.com/images/structured-data.jpg',
    url: 'https://example.com/blog/structured-data'
  });

  let faqs = $state<FAQ[]>([
    { question: 'What is JSON-LD?', answer: 'JSON-LD is a method of encoding Linked Data using JSON, recommended by Google for structured data markup.' },
    { question: 'Does structured data improve rankings?', answer: 'Structured data does not directly boost rankings but enables Rich Results which can increase CTR by 25-35%.' },
    { question: 'Where do I place JSON-LD in SvelteKit?', answer: 'Inside <svelte:head> using a <script type="application/ld+json"> tag, typically generated from load function data.' }
  ]);

  // Generate Article JSON-LD
  let articleJsonLd = $derived(JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    image: article.image,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url
    }
  }, null, 2));

  // Generate FAQ JSON-LD
  let faqJsonLd = $derived(JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }, null, 2));

  let activeTab = $state<'article' | 'faq'>('article');

  type SchemaType = { name: string; richResult: string; ctrImpact: string };

  const schemaTypes: SchemaType[] = [
    { name: 'Article', richResult: 'Article carousel, AMP stories', ctrImpact: '+25%' },
    { name: 'FAQPage', richResult: 'Expandable Q&A in SERP', ctrImpact: '+30%' },
    { name: 'Product', richResult: 'Price, availability, ratings', ctrImpact: '+35%' },
    { name: 'HowTo', richResult: 'Step-by-step instructions', ctrImpact: '+25%' },
    { name: 'BreadcrumbList', richResult: 'Breadcrumb trail in results', ctrImpact: '+15%' },
    { name: 'LocalBusiness', richResult: 'Map pack, business info', ctrImpact: '+30%' }
  ];

  // SvelteKit code example
  const svelteKitExample = \`<!-- +page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.article.title,
    author: { '@type': 'Person', name: data.article.author },
    datePublished: data.article.publishedAt
  };
<\\/script>

<svelte:head>
  {\\u0040html \\\`<script type="application/ld+json">
    \\\${JSON.stringify(jsonLd)}
  </script>\\\`}
</svelte:head>\`;
</script>

<svelte:head>
  {@html \`<script type="application/ld+json">\${articleJsonLd}</script>\`}
  {@html \`<script type="application/ld+json">\${faqJsonLd}</script>\`}
</svelte:head>

<main>
  <h1>Structured Data & JSON-LD</h1>
  <p class="subtitle">Machine-readable metadata for Rich Results</p>

  <section class="schema-types">
    <h2>Common Schema.org Types</h2>
    <table>
      <thead>
        <tr>
          <th>Schema Type</th>
          <th>Rich Result</th>
          <th>CTR Impact</th>
        </tr>
      </thead>
      <tbody>
        {#each schemaTypes as schema}
          <tr>
            <td><code>{schema.name}</code></td>
            <td>{schema.richResult}</td>
            <td class="impact">{schema.ctrImpact}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>

  <section class="tabs">
    <div class="tab-bar">
      <button class:active={activeTab === 'article'} onclick={() => activeTab = 'article'}>
        Article Schema
      </button>
      <button class:active={activeTab === 'faq'} onclick={() => activeTab = 'faq'}>
        FAQ Schema
      </button>
    </div>

    {#if activeTab === 'article'}
      <div class="tab-content">
        <h3>Article JSON-LD</h3>
        <div class="editor-fields">
          <label>Headline <input bind:value={article.title} /></label>
          <label>Author <input bind:value={article.author} /></label>
          <label>Published <input type="date" bind:value={article.datePublished} /></label>
        </div>
        <pre><code>{articleJsonLd}</code></pre>
      </div>
    {:else}
      <div class="tab-content">
        <h3>FAQ JSON-LD</h3>
        {#each faqs as faq, i}
          <div class="faq-editor">
            <label>Q{i + 1}: <input bind:value={faq.question} /></label>
            <label>A{i + 1}: <textarea bind:value={faq.answer} rows={2}></textarea></label>
          </div>
        {/each}
        <pre><code>{faqJsonLd}</code></pre>
      </div>
    {/if}
  </section>

  <section class="implementation">
    <h2>SvelteKit Implementation</h2>
    <pre><code>{svelteKitExample}</code></pre>
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

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
  }

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
  }

  th {
    background: #f0f0f0;
  }

  code {
    background: #f0f0f0;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.9rem;
  }

  pre code {
    background: none;
    padding: 0;
  }

  .impact {
    color: #16a34a;
    font-weight: 600;
  }

  .tab-bar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .tab-bar button {
    padding: 0.6rem 1.2rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    font-weight: 500;
  }

  .tab-bar button.active {
    border-color: #4a90d9;
    background: #eef4fb;
    color: #1a5bb5;
  }

  .tab-content {
    background: #fafafa;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .editor-fields, .faq-editor {
    display: grid;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  label {
    display: block;
    font-weight: 500;
    font-size: 0.9rem;
  }

  input, textarea {
    display: block;
    width: 100%;
    padding: 0.4rem;
    margin-top: 0.2rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: inherit;
    font-size: 0.9rem;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.8rem;
    line-height: 1.4;
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
