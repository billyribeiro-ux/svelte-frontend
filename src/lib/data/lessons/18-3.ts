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

SvelteKit makes this seamless because each +page.svelte can set its own head content, and layout-level defaults cascade down. Dynamic data from load functions feeds directly into SEO tags, ensuring every page is fully optimized at render time.

This lesson provides a live meta editor with character counting, SERP previews for Google / Twitter / Facebook, a heading hierarchy validator, and a full +page.svelte example you can copy into production.`,
	objectives: [
		'Use <svelte:head> to set dynamic title, meta, and OG tags per page',
		'Apply best practices for title length (<60 chars) and meta descriptions (<160 chars)',
		'Implement canonical URLs to prevent duplicate content issues',
		'Structure heading hierarchy correctly for accessibility and SEO',
		'Configure Open Graph and Twitter Card metadata for rich social previews'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Live meta editor state
  let title = $state('SvelteKit SEO Guide: Meta, OG & Canonical Tags');
  let description = $state(
    'Master technical SEO in SvelteKit with svelte:head, meta tags, Open Graph, and canonical URLs. Practical examples and best practices.'
  );
  let url = $state('https://example.com/blog/sveltekit-seo');
  let image = $state('https://example.com/og/sveltekit-seo.png');
  let siteName = $state('Svelte Mastery');
  let twitterHandle = $state('@sveltejs');

  const titleLimit = 60;
  const descLimit = 160;

  const titleColor = $derived(title.length <= titleLimit ? '#16a34a' : '#ef4444');
  const descColor = $derived(description.length <= descLimit ? '#16a34a' : '#ef4444');

  type Preview = 'google' | 'twitter' | 'facebook';
  let activePreview = $state<Preview>('google');

  // Heading validator
  let headingInput = $state(
    '<h1>SvelteKit SEO Guide</h1>\\n<h2>Why technical SEO matters</h2>\\n<h3>Crawling vs indexing</h3>\\n<h2>Setting meta tags</h2>\\n<h3>Title best practices</h3>\\n<h3>Meta descriptions</h3>\\n<h2>Open Graph tags</h2>'
  );

  type Heading = { level: number; text: string; valid: boolean; reason: string };

  const parsedHeadings = $derived.by<Heading[]>(() => {
    const re = /<h([1-6])>([^<]+)<\\/h[1-6]>/g;
    const list: Heading[] = [];
    let prevLevel = 0;
    let h1Count = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(headingInput)) !== null) {
      const level = Number(match[1]);
      const text = match[2];
      let valid = true;
      let reason = 'OK';
      if (level === 1) {
        h1Count++;
        if (h1Count > 1) {
          valid = false;
          reason = 'Multiple h1 elements on page';
        }
      }
      if (prevLevel > 0 && level > prevLevel + 1) {
        valid = false;
        reason = 'Level skipped from h' + prevLevel + ' to h' + level;
      }
      list.push({ level, text, valid, reason });
      prevLevel = level;
    }
    return list;
  });

  const headingsValid = $derived(parsedHeadings.every((h) => h.valid));

  // Full +page.svelte example (displayed as a string)
  const pageExample = [
    '<!-- src/routes/blog/[slug]/+page.svelte -->',
    '<script lang="ts">',
    "  import type { PageData } from './$types';",
    '  let { data }: { data: PageData } = $props();',
    '  const canonical = \`https://example.com/blog/\${data.post.slug}\`;',
    '</' + 'script>',
    '',
    '<svelte:head>',
    '  <title>{data.post.title} | Svelte Mastery</title>',
    '  <meta name="description" content={data.post.excerpt} />',
    '  <link rel="canonical" href={canonical} />',
    '',
    '  <!-- Open Graph -->',
    '  <meta property="og:type" content="article" />',
    '  <meta property="og:title" content={data.post.title} />',
    '  <meta property="og:description" content={data.post.excerpt} />',
    '  <meta property="og:url" content={canonical} />',
    '  <meta property="og:image" content={data.post.coverImage} />',
    '  <meta property="og:site_name" content="Svelte Mastery" />',
    '',
    '  <!-- Twitter -->',
    '  <meta name="twitter:card" content="summary_large_image" />',
    '  <meta name="twitter:site" content="@sveltejs" />',
    '  <meta name="twitter:title" content={data.post.title} />',
    '  <meta name="twitter:description" content={data.post.excerpt} />',
    '  <meta name="twitter:image" content={data.post.coverImage} />',
    '',
    '  <!-- Article-specific -->',
    '  <meta property="article:published_time" content={data.post.publishedAt} />',
    '  <meta property="article:author" content={data.post.author.name} />',
    '</svelte:head>',
    '',
    '<article>',
    '  <h1>{data.post.title}</h1>',
    '  <time datetime={data.post.publishedAt}>{data.post.publishedAt}</time>',
    '  {@html data.post.html}',
    '</article>'
  ].join('\\n');

  const layoutExample = [
    '<!-- src/routes/+layout.svelte -->',
    '<svelte:head>',
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '  <meta name="robots" content="index, follow" />',
    '  <meta name="theme-color" content="#ff3e00" />',
    '  <link rel="icon" href="/favicon.svg" />',
    '</svelte:head>'
  ].join('\\n');

  const generatedHead = $derived(
    [
      '<svelte:head>',
      '  <title>' + title + '</title>',
      '  <meta name="description" content="' + description + '" />',
      '  <link rel="canonical" href="' + url + '" />',
      '',
      '  <meta property="og:type" content="article" />',
      '  <meta property="og:title" content="' + title + '" />',
      '  <meta property="og:description" content="' + description + '" />',
      '  <meta property="og:url" content="' + url + '" />',
      '  <meta property="og:image" content="' + image + '" />',
      '  <meta property="og:site_name" content="' + siteName + '" />',
      '',
      '  <meta name="twitter:card" content="summary_large_image" />',
      '  <meta name="twitter:site" content="' + twitterHandle + '" />',
      '  <meta name="twitter:title" content="' + title + '" />',
      '  <meta name="twitter:description" content="' + description + '" />',
      '  <meta name="twitter:image" content="' + image + '" />',
      '</svelte:head>'
    ].join('\\n')
  );

  const domain = $derived(url.replace('https://', '').replace('http://', '').split('/')[0]);
</script>

<main>
  <h1>Technical SEO in SvelteKit</h1>
  <p class="subtitle">Live meta editor with SERP previews and heading validation</p>

  <section class="editor">
    <h2>Live Meta Editor</h2>

    <label>
      <span>Page Title</span>
      <input type="text" bind:value={title} />
      <small style="color: {titleColor}">
        {title.length} / {titleLimit} chars
      </small>
    </label>

    <label>
      <span>Meta Description</span>
      <textarea bind:value={description} rows="3"></textarea>
      <small style="color: {descColor}">
        {description.length} / {descLimit} chars
      </small>
    </label>

    <label>
      <span>Canonical URL</span>
      <input type="text" bind:value={url} />
    </label>

    <label>
      <span>OG Image URL</span>
      <input type="text" bind:value={image} />
    </label>

    <div class="two-col">
      <label>
        <span>Site Name</span>
        <input type="text" bind:value={siteName} />
      </label>
      <label>
        <span>Twitter Handle</span>
        <input type="text" bind:value={twitterHandle} />
      </label>
    </div>
  </section>

  <section class="previews">
    <h2>SERP &amp; Social Previews</h2>
    <div class="preview-tabs">
      <button class:active={activePreview === 'google'} onclick={() => (activePreview = 'google')}>
        Google
      </button>
      <button class:active={activePreview === 'twitter'} onclick={() => (activePreview = 'twitter')}>
        Twitter / X
      </button>
      <button class:active={activePreview === 'facebook'} onclick={() => (activePreview = 'facebook')}>
        Facebook
      </button>
    </div>

    {#if activePreview === 'google'}
      <div class="google-preview">
        <div class="breadcrumb">{domain}</div>
        <div class="g-title">{title}</div>
        <div class="g-desc">{description}</div>
      </div>
    {:else if activePreview === 'twitter'}
      <div class="twitter-preview">
        <div class="tw-image"></div>
        <div class="tw-body">
          <div class="tw-domain">{domain}</div>
          <div class="tw-title">{title}</div>
          <div class="tw-desc">{description}</div>
        </div>
      </div>
    {:else}
      <div class="fb-preview">
        <div class="fb-image"></div>
        <div class="fb-body">
          <div class="fb-domain">{domain}</div>
          <div class="fb-title">{title}</div>
          <div class="fb-desc">{description}</div>
        </div>
      </div>
    {/if}
  </section>

  <section class="generated">
    <h2>Generated svelte:head</h2>
    <pre><code>{generatedHead}</code></pre>
  </section>

  <section class="headings">
    <h2>Heading Hierarchy Validator</h2>
    <p>Edit the markup; we check for a single h1 and sequential nesting.</p>
    <textarea bind:value={headingInput} rows="8"></textarea>
    <div class="heading-result" class:valid={headingsValid} class:invalid={!headingsValid}>
      {headingsValid ? 'Heading hierarchy is valid' : 'Heading hierarchy has issues'}
    </div>
    <ul class="heading-list">
      {#each parsedHeadings as h, i (i)}
        <li class:bad={!h.valid} style="padding-left: {(h.level - 1) * 1.5}rem">
          <code>h{h.level}</code>
          {h.text}
          {#if !h.valid}<span class="reason">&mdash; {h.reason}</span>{/if}
        </li>
      {/each}
    </ul>
  </section>

  <section class="code-example">
    <h2>Complete +page.svelte Example</h2>
    <pre><code>{pageExample}</code></pre>
  </section>

  <section class="code-example">
    <h2>Default Meta in +layout.svelte</h2>
    <pre><code>{layoutExample}</code></pre>
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

  .editor label {
    display: block;
    margin-bottom: 1rem;
  }

  .editor label span {
    display: block;
    font-weight: 600;
    margin-bottom: 0.3rem;
  }

  .editor input,
  .editor textarea {
    width: 100%;
    padding: 0.6rem;
    font-size: 0.95rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-family: inherit;
    box-sizing: border-box;
  }

  .editor small {
    font-size: 0.75rem;
    font-weight: 600;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .preview-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .preview-tabs button {
    flex: 1;
    padding: 0.5rem;
    border: 2px solid #e0e0e0;
    background: #f8f9fa;
    border-radius: 6px;
    cursor: pointer;
    font: inherit;
  }

  .preview-tabs button.active {
    border-color: #4a90d9;
    background: #eef4fb;
  }

  .google-preview {
    background: white;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-family: Arial, sans-serif;
  }

  .breadcrumb {
    color: #202124;
    font-size: 0.8rem;
  }

  .g-title {
    color: #1a0dab;
    font-size: 1.25rem;
    margin: 0.2rem 0;
    font-weight: 400;
  }

  .g-desc {
    color: #4d5156;
    font-size: 0.85rem;
  }

  .twitter-preview,
  .fb-preview {
    border: 1px solid #cfd9de;
    border-radius: 16px;
    overflow: hidden;
    max-width: 500px;
  }

  .tw-image,
  .fb-image {
    height: 200px;
    background: linear-gradient(135deg, #ff3e00, #4a90d9);
  }

  .tw-body,
  .fb-body {
    padding: 0.75rem;
    background: white;
  }

  .tw-domain,
  .fb-domain {
    color: #536471;
    font-size: 0.8rem;
  }

  .tw-title,
  .fb-title {
    font-weight: 600;
    margin: 0.25rem 0;
  }

  .tw-desc,
  .fb-desc {
    color: #536471;
    font-size: 0.85rem;
  }

  .fb-preview {
    border-radius: 8px;
  }

  .fb-body {
    background: #f0f2f5;
  }

  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 0.78rem;
  }

  .headings textarea {
    width: 100%;
    padding: 0.5rem;
    font-family: monospace;
    font-size: 0.85rem;
    border-radius: 6px;
    box-sizing: border-box;
  }

  .heading-result {
    padding: 0.6rem;
    border-radius: 6px;
    margin: 1rem 0;
    font-weight: 700;
  }

  .heading-result.valid {
    background: #dcfce7;
    color: #166534;
  }

  .heading-result.invalid {
    background: #fecaca;
    color: #991b1b;
  }

  .heading-list {
    list-style: none;
    padding: 0;
  }

  .heading-list li {
    padding: 0.3rem 0;
    font-size: 0.9rem;
  }

  .heading-list li.bad {
    color: #991b1b;
  }

  .heading-list code {
    background: #f0f0f0;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    margin-right: 0.4rem;
  }

  .reason {
    color: #991b1b;
    font-size: 0.8rem;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
