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

Studies show structured data can increase click-through rates by 25–35%. SvelteKit makes it trivial to generate JSON-LD dynamically from load function data, ensuring every page carries machine-readable metadata.

This lesson provides an interactive schema builder for the five most common types — Article, FAQ, Product, Breadcrumb, and Organization — plus a preview of how the rich result will appear in Google search.`,
	objectives: [
		'Embed JSON-LD structured data within <svelte:head> in SvelteKit pages',
		'Implement Article, FAQ, Product, Breadcrumb, and Organization schema types',
		'Understand how structured data enables Rich Results and increases CTR by 25–35%',
		'Validate structured data with Google Rich Results Test',
		'Use {@html} to inject server-generated JSON-LD into the document head'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type SchemaType = 'Article' | 'FAQPage' | 'Product' | 'BreadcrumbList' | 'Organization';

  let activeType = $state<SchemaType>('Article');

  // Article state
  let articleHeadline = $state('SvelteKit SEO in 2026: The Complete Guide');
  let articleAuthor = $state('Jane Developer');
  let articleDate = $state('2026-04-04');
  let articleImage = $state('https://example.com/og.png');

  // FAQ state
  type FAQEntry = { q: string; a: string };
  let faqs = $state<FAQEntry[]>([
    { q: 'What is SvelteKit?', a: 'SvelteKit is the official application framework built around Svelte.' },
    { q: 'Is SvelteKit good for SEO?', a: 'Yes. SSR and prerendering give search engines full HTML immediately.' }
  ]);

  function addFaq() {
    faqs = [...faqs, { q: '', a: '' }];
  }
  function removeFaq(i: number) {
    faqs = faqs.filter((_, idx) => idx !== i);
  }

  // Product state
  let productName = $state('Svelte Mastery Course');
  let productPrice = $state('199');
  let productRating = $state(4.8);
  let productReviews = $state(127);

  // Breadcrumb state
  type Crumb = { name: string; url: string };
  let crumbs = $state<Crumb[]>([
    { name: 'Home', url: 'https://example.com' },
    { name: 'Blog', url: 'https://example.com/blog' },
    { name: 'SvelteKit SEO', url: 'https://example.com/blog/sveltekit-seo' }
  ]);

  // Organization state
  let orgName = $state('Svelte Mastery');
  let orgUrl = $state('https://example.com');
  let orgLogo = $state('https://example.com/logo.png');
  let orgSameAs = $state('https://twitter.com/sveltejs, https://github.com/sveltejs');

  const jsonLd = $derived.by(() => {
    if (activeType === 'Article') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: articleHeadline,
        image: [articleImage],
        datePublished: articleDate,
        author: { '@type': 'Person', name: articleAuthor }
      };
    }
    if (activeType === 'FAQPage') {
      return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a }
        }))
      };
    }
    if (activeType === 'Product') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productName,
        offers: {
          '@type': 'Offer',
          price: productPrice,
          priceCurrency: 'USD'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: productRating,
          reviewCount: productReviews
        }
      };
    }
    if (activeType === 'BreadcrumbList') {
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: c.url
        }))
      };
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: orgName,
      url: orgUrl,
      logo: orgLogo,
      sameAs: orgSameAs.split(',').map((s) => s.trim())
    };
  });

  const jsonLdString = $derived(JSON.stringify(jsonLd, null, 2));

  const svelteHeadExample = $derived(
    [
      '<svelte:head>',
      '  {@html \`<script type="application/ld+json">' +
        '\${JSON.stringify(jsonLd)}<\\/script>\`}',
      '</svelte:head>'
    ].join('\\n')
  );

  const schemaTypes: { value: SchemaType; label: string; description: string }[] = [
    { value: 'Article', label: 'Article', description: 'Blog posts, news articles, editorials' },
    { value: 'FAQPage', label: 'FAQ', description: 'Frequently asked questions with answers' },
    { value: 'Product', label: 'Product', description: 'E-commerce items with price and reviews' },
    { value: 'BreadcrumbList', label: 'Breadcrumb', description: 'Navigation path on category pages' },
    { value: 'Organization', label: 'Organization', description: 'Your company for the knowledge panel' }
  ];
</script>

<main>
  <h1>Structured Data &amp; JSON-LD</h1>
  <p class="subtitle">Interactive schema builder with rich result preview</p>

  <section class="type-picker">
    <h2>Choose a Schema Type</h2>
    <div class="type-grid">
      {#each schemaTypes as type (type.value)}
        <button
          class="type-btn"
          class:active={activeType === type.value}
          onclick={() => (activeType = type.value)}
        >
          <strong>{type.label}</strong>
          <small>{type.description}</small>
        </button>
      {/each}
    </div>
  </section>

  <section class="builder">
    <h2>{activeType} Builder</h2>

    {#if activeType === 'Article'}
      <label><span>Headline</span><input type="text" bind:value={articleHeadline} /></label>
      <label><span>Author</span><input type="text" bind:value={articleAuthor} /></label>
      <label><span>Date Published</span><input type="date" bind:value={articleDate} /></label>
      <label><span>Image URL</span><input type="text" bind:value={articleImage} /></label>
    {:else if activeType === 'FAQPage'}
      {#each faqs as faq, i (i)}
        <div class="faq-row">
          <input type="text" placeholder="Question" bind:value={faq.q} />
          <textarea placeholder="Answer" bind:value={faq.a} rows="2"></textarea>
          <button class="remove-btn" onclick={() => removeFaq(i)}>Remove</button>
        </div>
      {/each}
      <button class="add-btn" onclick={addFaq}>+ Add FAQ</button>
    {:else if activeType === 'Product'}
      <label><span>Name</span><input type="text" bind:value={productName} /></label>
      <label><span>Price (USD)</span><input type="text" bind:value={productPrice} /></label>
      <label><span>Rating (0-5)</span><input type="number" step="0.1" min="0" max="5" bind:value={productRating} /></label>
      <label><span>Review Count</span><input type="number" bind:value={productReviews} /></label>
    {:else if activeType === 'BreadcrumbList'}
      {#each crumbs as crumb, i (i)}
        <div class="crumb-row">
          <input type="text" placeholder="Name" bind:value={crumb.name} />
          <input type="text" placeholder="URL" bind:value={crumb.url} />
        </div>
      {/each}
    {:else}
      <label><span>Name</span><input type="text" bind:value={orgName} /></label>
      <label><span>URL</span><input type="text" bind:value={orgUrl} /></label>
      <label><span>Logo URL</span><input type="text" bind:value={orgLogo} /></label>
      <label><span>sameAs (comma-separated)</span><input type="text" bind:value={orgSameAs} /></label>
    {/if}
  </section>

  <section class="json-output">
    <h2>Generated JSON-LD</h2>
    <pre><code>{jsonLdString}</code></pre>
  </section>

  <section class="rich-preview">
    <h2>Rich Result Preview</h2>
    {#if activeType === 'Article'}
      <div class="preview article">
        <div class="article-head">
          <span class="article-tag">Article</span>
          <span class="article-date">{articleDate}</span>
        </div>
        <h3>{articleHeadline}</h3>
        <small>By {articleAuthor}</small>
      </div>
    {:else if activeType === 'FAQPage'}
      <div class="preview faq">
        <h3>People Also Ask</h3>
        {#each faqs as f, i (i)}
          <details>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        {/each}
      </div>
    {:else if activeType === 'Product'}
      <div class="preview product">
        <h3>{productName}</h3>
        <div class="stars">
          {'★'.repeat(Math.round(productRating))}{'☆'.repeat(5 - Math.round(productRating))}
          <span>{productRating} ({productReviews} reviews)</span>
        </div>
        <div class="price">\${productPrice}</div>
      </div>
    {:else if activeType === 'BreadcrumbList'}
      <div class="preview breadcrumb">
        {#each crumbs as c, i (i)}
          <span class="crumb">{c.name}</span>
          {#if i < crumbs.length - 1}<span class="sep">&rsaquo;</span>{/if}
        {/each}
      </div>
    {:else}
      <div class="preview organization">
        <div class="org-logo"></div>
        <div>
          <h3>{orgName}</h3>
          <a href={orgUrl}>{orgUrl}</a>
        </div>
      </div>
    {/if}
  </section>

  <section class="svelte-example">
    <h2>Using in &lt;svelte:head&gt;</h2>
    <pre><code>{svelteHeadExample}</code></pre>
    <div class="callout">
      <strong>Why {'{@html}'}?</strong> Svelte escapes {'<script>'} tags by default. We use
      {'{@html}'} to inject the raw JSON-LD script tag. The JSON itself is safe because it is
      produced by JSON.stringify, which escapes all user input.
    </div>
  </section>

  <section class="validation">
    <h2>Validation</h2>
    <p>After deploying, validate your structured data with:</p>
    <ul>
      <li><strong>Google Rich Results Test:</strong> search.google.com/test/rich-results</li>
      <li><strong>Schema.org Validator:</strong> validator.schema.org</li>
      <li><strong>Google Search Console:</strong> Enhancements report shows live errors</li>
    </ul>
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

  .type-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.5rem;
  }

  .type-btn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 0.8rem;
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    font: inherit;
    text-align: left;
  }

  .type-btn.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .type-btn small {
    color: #666;
    font-size: 0.75rem;
    margin-top: 0.3rem;
  }

  .builder {
    background: #fafafa;
    padding: 1.5rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
  }

  .builder label {
    display: block;
    margin-bottom: 0.8rem;
  }

  .builder label span {
    display: block;
    font-weight: 600;
    margin-bottom: 0.3rem;
    font-size: 0.9rem;
  }

  .builder input,
  .builder textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font: inherit;
    box-sizing: border-box;
  }

  .faq-row,
  .crumb-row {
    display: grid;
    gap: 0.4rem;
    padding: 0.8rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    margin-bottom: 0.6rem;
  }

  .crumb-row {
    grid-template-columns: 1fr 2fr;
  }

  .add-btn {
    padding: 0.5rem 1rem;
    background: #4a90d9;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .remove-btn {
    padding: 0.3rem 0.6rem;
    background: #fee;
    color: #c00;
    border: 1px solid #fcc;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
    justify-self: end;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
  }

  .preview {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
  }

  .preview.article h3 {
    color: #1a0dab;
    margin: 0.3rem 0;
  }

  .article-tag {
    background: #eef4fb;
    color: #4a90d9;
    padding: 0.1rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
  }

  .article-date {
    color: #666;
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }

  .preview.faq h3 {
    margin-top: 0;
  }

  .preview.faq details {
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }

  .preview.faq summary {
    font-weight: 600;
    cursor: pointer;
  }

  .stars {
    color: #f59e0b;
    font-size: 1.1rem;
  }

  .stars span {
    color: #666;
    font-size: 0.85rem;
    margin-left: 0.3rem;
  }

  .price {
    font-size: 1.4rem;
    font-weight: 700;
    color: #166534;
    margin-top: 0.3rem;
  }

  .preview.breadcrumb {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    font-size: 0.9rem;
  }

  .crumb {
    color: #1a0dab;
  }

  .sep {
    color: #666;
  }

  .preview.organization {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .org-logo {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #ff3e00, #4a90d9);
    border-radius: 8px;
  }

  .preview.organization h3 {
    margin: 0;
  }

  .callout {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 1rem;
    border-radius: 4px;
    margin-top: 1rem;
    font-size: 0.9rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
