import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '18-3',
		title: 'Technical SEO in SvelteKit',
		phase: 6,
		module: 18,
		lessonIndex: 3
	},
	description: `Technical SEO in SvelteKit starts with <svelte:head> — the gateway to setting page titles, meta descriptions, canonical URLs, and Open Graph tags. Best practices demand titles under 60 characters, meta descriptions under 160, and a proper heading hierarchy (one <h1> per page, logical <h2>–<h6> nesting).

SvelteKit makes this seamless because each +page.svelte can set its own head content, and layout-level defaults cascade down. Dynamic data from load functions feeds directly into SEO tags, ensuring every page is fully optimized at render time.`,
	objectives: [
		'Use <svelte:head> to set dynamic title, meta, and OG tags per page',
		'Apply best practices for title length (<60 chars) and meta descriptions (<160 chars)',
		'Implement canonical URLs to prevent duplicate content issues',
		'Structure heading hierarchy correctly for accessibility and SEO'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type PageData = {
    title: string;
    description: string;
    url: string;
    image: string;
    author: string;
    publishedAt: string;
    type: 'article' | 'website';
  };

  // Simulated page data from a SvelteKit load function
  let pageData = $state<PageData>({
    title: 'Mastering SvelteKit SEO',
    description: 'Learn how to optimize your SvelteKit application for search engines with proper meta tags, Open Graph, and structured data.',
    url: 'https://example.com/blog/sveltekit-seo',
    image: 'https://example.com/images/sveltekit-seo-og.jpg',
    author: 'Jane Developer',
    publishedAt: '2026-03-15',
    type: 'article'
  });

  // Validation helpers
  let titleLength = $derived(pageData.title.length);
  let descLength = $derived(pageData.description.length);
  let titleValid = $derived(titleLength > 0 && titleLength <= 60);
  let descValid = $derived(descLength > 0 && descLength <= 160);

  // Generate the <svelte:head> code preview
  let headCode = $derived(\`<svelte:head>
  <title>\${pageData.title}</title>
  <meta name="description" content="\${pageData.description}" />
  <link rel="canonical" href="\${pageData.url}" />

  <!-- Open Graph -->
  <meta property="og:title" content="\${pageData.title}" />
  <meta property="og:description" content="\${pageData.description}" />
  <meta property="og:url" content="\${pageData.url}" />
  <meta property="og:image" content="\${pageData.image}" />
  <meta property="og:type" content="\${pageData.type}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="\${pageData.title}" />
  <meta name="twitter:description" content="\${pageData.description}" />
  <meta name="twitter:image" content="\${pageData.image}" />
</svelte:head>\`);

  type HeadingRule = { tag: string; purpose: string; seoRole: string };

  const headingHierarchy: HeadingRule[] = [
    { tag: '<h1>', purpose: 'Page title — one per page', seoRole: 'Primary keyword target' },
    { tag: '<h2>', purpose: 'Major sections', seoRole: 'Secondary keywords, structure' },
    { tag: '<h3>', purpose: 'Subsections within <h2>', seoRole: 'Long-tail keywords' },
    { tag: '<h4>–<h6>', purpose: 'Deeper nesting if needed', seoRole: 'Semantic structure only' }
  ];
</script>

<svelte:head>
  <title>{pageData.title}</title>
  <meta name="description" content={pageData.description} />
</svelte:head>

<main>
  <h1>Technical SEO in SvelteKit</h1>

  <section class="editor">
    <h2>SEO Meta Editor</h2>

    <label>
      Title
      <span class="counter" class:invalid={!titleValid}>
        {titleLength}/60
      </span>
      <input type="text" bind:value={pageData.title} maxlength={80} />
    </label>

    <label>
      Meta Description
      <span class="counter" class:invalid={!descValid}>
        {descLength}/160
      </span>
      <textarea bind:value={pageData.description} maxlength={200} rows={3}></textarea>
    </label>

    <label>
      Canonical URL
      <input type="url" bind:value={pageData.url} />
    </label>

    <label>
      OG Image URL
      <input type="url" bind:value={pageData.image} />
    </label>

    <div class="row">
      <label>
        Author
        <input type="text" bind:value={pageData.author} />
      </label>
      <label>
        Type
        <select bind:value={pageData.type}>
          <option value="article">Article</option>
          <option value="website">Website</option>
        </select>
      </label>
    </div>
  </section>

  <section class="preview">
    <h2>Google Search Preview</h2>
    <div class="serp-preview">
      <cite>{pageData.url}</cite>
      <h3 class="serp-title">{pageData.title}</h3>
      <p class="serp-desc">{pageData.description}</p>
    </div>
  </section>

  <section class="code-output">
    <h2>Generated &lt;svelte:head&gt;</h2>
    <pre><code>{headCode}</code></pre>
  </section>

  <section class="hierarchy">
    <h2>Heading Hierarchy</h2>
    <table>
      <thead>
        <tr>
          <th>Tag</th>
          <th>Purpose</th>
          <th>SEO Role</th>
        </tr>
      </thead>
      <tbody>
        {#each headingHierarchy as rule}
          <tr>
            <td><code>{rule.tag}</code></td>
            <td>{rule.purpose}</td>
            <td>{rule.seoRole}</td>
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

  .editor label {
    display: block;
    margin-bottom: 1rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: #333;
  }

  input, textarea, select {
    display: block;
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.25rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
  }

  .counter {
    float: right;
    font-weight: 400;
    color: #16a34a;
  }

  .counter.invalid {
    color: #dc2626;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .serp-preview {
    background: white;
    padding: 1.25rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-top: 1rem;
  }

  .serp-preview cite {
    color: #202124;
    font-size: 0.8rem;
    font-style: normal;
  }

  .serp-title {
    color: #1a0dab;
    font-size: 1.2rem;
    margin: 0.25rem 0;
    cursor: pointer;
  }

  .serp-title:hover {
    text-decoration: underline;
  }

  .serp-desc {
    color: #4d5156;
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.5;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.8rem;
    line-height: 1.5;
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
  }

  code {
    background: #f0f0f0;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    font-size: 0.85rem;
  }

  pre code {
    background: none;
    padding: 0;
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
