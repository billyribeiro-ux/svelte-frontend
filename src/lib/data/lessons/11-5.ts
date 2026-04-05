import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-5',
		title: '<svelte:head> & Metadata',
		phase: 3,
		module: 11,
		lessonIndex: 5
	},
	description: `Every page needs proper metadata — titles, descriptions, Open Graph tags for social sharing, Twitter Card info, canonical URLs, and structured data. SvelteKit provides <svelte:head> to inject elements into the document head from any component. Because it runs during SSR, search engines and social scrapers see your metadata on first request.

This lesson covers dynamic titles, full SEO meta sets, Open Graph and Twitter Card previews, canonical URLs, favicons and PWA manifest links, and JSON-LD structured data.`,
	objectives: [
		'Use <svelte:head> to set dynamic page titles',
		'Build a complete SEO meta set: description, Open Graph, Twitter Card',
		'Add canonical URLs to prevent duplicate-content penalties',
		'Inject JSON-LD structured data for rich search results',
		'Understand how <svelte:head> merges across components and is cleaned up on destroy',
		'Extract reusable <SEO> component patterns'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // <svelte:head> injects elements into <head>
  // It works in any component, not just pages

  interface PageMeta {
    title: string;
    description: string;
    image: string;
    type: 'website' | 'article';
    author?: string;
    published?: string;
  }

  const pageMeta: Record<string, PageMeta> = {
    home: {
      title: 'My App — Home',
      description: 'Welcome to our awesome application, built with SvelteKit.',
      image: '/og/home.jpg',
      type: 'website'
    },
    about: {
      title: 'About Us — My App',
      description: 'Learn about our team, mission, and the story behind the app.',
      image: '/og/about.jpg',
      type: 'website'
    },
    blog: {
      title: 'Blog — My App',
      description: 'Read our latest articles and tutorials on modern web development.',
      image: '/og/blog.jpg',
      type: 'website'
    },
    post: {
      title: 'Why Runes Are a Big Deal — My App Blog',
      description: 'A deep dive into Svelte 5 runes and why they change how you think about reactivity.',
      image: '/og/post-runes.jpg',
      type: 'article',
      author: 'Ada Lovelace',
      published: '2026-03-15'
    }
  };

  type PageKey = keyof typeof pageMeta;
  let currentPage: PageKey = $state('home');
  let meta: PageMeta = $derived(pageMeta[currentPage]);

  let canonical = $derived(\`https://example.com/\${currentPage === 'home' ? '' : currentPage}\`);

  // JSON-LD for blog posts
  let jsonLd = $derived(
    meta.type === 'article'
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: meta.title,
          description: meta.description,
          image: meta.image,
          author: { '@type': 'Person', name: meta.author },
          datePublished: meta.published
        }
      : null
  );

  const jsonLdPreExample = [
    '<svelte:head>',
    '  {@html \`<' + 'script type="application/ld+json">\${JSON.stringify({',
    "    '@context': 'https://schema.org',",
    "    '@type': 'Article',",
    '    headline: data.post.title,',
    "    author: { '@type': 'Person', name: data.post.author },",
    '    datePublished: data.post.published,',
    '    image: data.post.image',
    '  })}</' + 'script>\`}',
    '</svelte:head>'
  ].join('\\n');
</script>

<!-- Real metadata for this playground page -->
<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
  <meta property="og:title" content={meta.title} />
  <meta property="og:description" content={meta.description} />
  <meta property="og:image" content={meta.image} />
  <meta property="og:type" content={meta.type} />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={meta.title} />
  <meta name="twitter:description" content={meta.description} />
  <link rel="canonical" href={canonical} />
  {#if jsonLd}
    <svelte:element this={'script'} type="application/ld+json">{JSON.stringify(jsonLd)}</svelte:element>
  {/if}
</svelte:head>

<main>
  <h1>&lt;svelte:head&gt; & Metadata</h1>

  <section>
    <h2>Basic Usage</h2>
    <pre>{\`<!-- Any component can use <svelte:head> -->
<svelte:head>
  <title>My Page Title</title>
  <meta name="description" content="Page description" />
</svelte:head>\`}</pre>
    <p class="callout">
      During SSR, these elements are injected into the <code>&lt;head&gt;</code>
      of the HTML response — search engines and social scrapers see them on
      first request. During client-side navigation, they're swapped out
      automatically as components mount and unmount.
    </p>
  </section>

  <section>
    <h2>Dynamic Metadata Demo</h2>
    <p>Switch pages to see the metadata change (the browser tab title updates live):</p>
    <div class="page-switcher">
      {#each Object.keys(pageMeta) as key (key)}
        <button
          class:active={currentPage === key}
          onclick={() => (currentPage = key as PageKey)}
        >
          {key}
        </button>
      {/each}
    </div>

    <div class="meta-preview">
      <h3>Current Metadata</h3>
      <p><strong>title:</strong> {meta.title}</p>
      <p><strong>description:</strong> {meta.description}</p>
      <p><strong>og:image:</strong> <code>{meta.image}</code></p>
      <p><strong>og:type:</strong> <code>{meta.type}</code></p>
      <p><strong>canonical:</strong> <code>{canonical}</code></p>
    </div>
  </section>

  <section>
    <h2>Social Card Preview</h2>
    <p>This is roughly how your link will look when shared on Twitter, Facebook, or LinkedIn:</p>
    <div class="social-card">
      <div class="card-image" aria-hidden="true">
        <span>{meta.image}</span>
      </div>
      <div class="card-body">
        <div class="card-domain">example.com</div>
        <div class="card-title">{meta.title}</div>
        <div class="card-desc">{meta.description}</div>
      </div>
    </div>
  </section>

  <section>
    <h2>Full SEO Pattern</h2>
    <pre>{\`<!-- src/routes/blog/[slug]/+page.svelte -->
<\${''}script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/state';

  let { data }: { data: PageData } = $props();

  let canonical = $derived(
    \\\`https://mysite.com\\\${page.url.pathname}\\\`
  );
</\${''}script>

<svelte:head>
  <title>{data.post.title} — My Blog</title>
  <meta name="description" content={data.post.excerpt} />

  <!-- Open Graph -->
  <meta property="og:title" content={data.post.title} />
  <meta property="og:description" content={data.post.excerpt} />
  <meta property="og:image" content={data.post.image} />
  <meta property="og:type" content="article" />
  <meta property="og:url" content={canonical} />
  <meta property="article:published_time" content={data.post.published} />
  <meta property="article:author" content={data.post.author} />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.post.title} />
  <meta name="twitter:description" content={data.post.excerpt} />
  <meta name="twitter:image" content={data.post.image} />

  <!-- Canonical URL -->
  <link rel="canonical" href={canonical} />
</svelte:head>\`}</pre>
  </section>

  <section>
    <h2>Reusable &lt;SEO&gt; Component</h2>
    <pre>{\`<!-- src/lib/components/SEO.svelte -->
<script lang="ts">
  interface Props {
    title: string;
    description: string;
    image?: string;
    type?: 'website' | 'article';
    canonical?: string;
  }

  let {
    title,
    description,
    image = '/og/default.jpg',
    type = 'website',
    canonical
  }: Props = $props();
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:type" content={type} />
  <meta name="twitter:card" content="summary_large_image" />
  {#if canonical}<link rel="canonical" href={canonical} />{/if}
</svelte:head>\`}</pre>
    <pre>{\`<!-- Using it on any page -->
<script lang="ts">
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="About — My App"
  description="Learn about our team"
  image="/og/about.jpg"
/>\`}</pre>
  </section>

  <section>
    <h2>JSON-LD Structured Data</h2>
    <p>
      Rich results in Google (recipes, articles, products) rely on JSON-LD.
      Render it as a <code>&lt;script type="application/ld+json"&gt;</code>
      inside <code>&lt;svelte:head&gt;</code>.
    </p>
    <pre>{jsonLdPreExample}</pre>
    <p class="callout">
      The <code>&lt;/script&gt;</code> inside the template literal must be
      escaped as <code>&lt;\\/script&gt;</code> — otherwise the parser
      terminates your script tag early.
    </p>
  </section>

  <section>
    <h2>Favicon, Manifest & Theme</h2>
    <pre>{\`<!-- src/routes/+layout.svelte (root) -->
<svelte:head>
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <meta name="theme-color" content="#4a90d9" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>\`}</pre>
  </section>

  <section>
    <h2>Key Points</h2>
    <ul>
      <li><code>&lt;svelte:head&gt;</code> works during SSR — search engines see your metadata</li>
      <li>Child components can add entries — they all merge into the final <code>&lt;head&gt;</code></li>
      <li>Entries added by a component are removed when the component is destroyed</li>
      <li>For a page-specific override of a layout's title, the last <code>&lt;title&gt;</code> wins</li>
      <li>Duplicate meta tags are NOT automatically deduplicated — don't set the same tag in both layout and page unless intended</li>
      <li>Use a reusable <code>&lt;SEO&gt;</code> component to avoid boilerplate on every page</li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; padding: 1rem; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.78rem; }
  .page-switcher { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .page-switcher button { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; }
  .page-switcher button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .meta-preview { background: #f0f7ff; padding: 1rem; border-radius: 4px; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
  .social-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; max-width: 520px; }
  .card-image { background: linear-gradient(135deg, #4a90d9, #7b61ff); color: white; height: 180px; display: flex; align-items: center; justify-content: center; font-family: monospace; font-size: 0.85rem; }
  .card-body { padding: 0.75rem 1rem; background: white; }
  .card-domain { font-size: 0.75rem; color: #888; text-transform: uppercase; }
  .card-title { font-weight: bold; margin: 0.25rem 0; }
  .card-desc { font-size: 0.85rem; color: #555; }
  .callout { background: #fff7ed; border-left: 3px solid #f59e0b; padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.85rem; color: #78350f; }
  .callout code { background: #fde68a; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
