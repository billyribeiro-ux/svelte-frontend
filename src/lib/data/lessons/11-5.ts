import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-5',
		title: '<svelte:head> & Metadata',
		phase: 3,
		module: 11,
		lessonIndex: 5
	},
	description: `Every page needs proper metadata — titles, descriptions, and Open Graph tags for social sharing. SvelteKit provides <svelte:head> to inject elements into the document's <head> from any component. This lets you set per-page titles, meta descriptions, and OG tags dynamically.

Good metadata improves SEO, accessibility, and social media previews. This lesson shows how to manage it declaratively in your Svelte components.`,
	objectives: [
		'Use <svelte:head> to set dynamic page titles',
		'Add meta description and Open Graph tags per page',
		'Understand how <svelte:head> works with SSR and hydration',
		'Build reusable SEO metadata patterns'
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
  }

  let currentPage: string = $state('home');

  const pageMeta: Record<string, PageMeta> = {
    home: {
      title: 'My App — Home',
      description: 'Welcome to our awesome application',
      image: '/images/home-og.jpg'
    },
    about: {
      title: 'About Us — My App',
      description: 'Learn about our team and mission',
      image: '/images/about-og.jpg'
    },
    blog: {
      title: 'Blog — My App',
      description: 'Read our latest articles and tutorials',
      image: '/images/blog-og.jpg'
    }
  };

  let meta: PageMeta = $derived(pageMeta[currentPage] ?? pageMeta.home);
</script>

<!-- This would be in the real <head> with SvelteKit -->
<svelte:head>
  <title>{meta.title}</title>
  <meta name="description" content={meta.description} />
  <meta property="og:title" content={meta.title} />
  <meta property="og:description" content={meta.description} />
  <meta property="og:image" content={meta.image} />
  <meta property="og:type" content="website" />
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
  </section>

  <section>
    <h2>Dynamic Metadata Demo</h2>
    <p>Switch pages to see the metadata change (check the browser tab title):</p>
    <div class="page-switcher">
      {#each ['home', 'about', 'blog'] as page}
        <button
          class:active={currentPage === page}
          onclick={() => currentPage = page}
        >
          {page}
        </button>
      {/each}
    </div>

    <div class="meta-preview">
      <h3>Current Metadata</h3>
      <p><strong>title:</strong> {meta.title}</p>
      <p><strong>description:</strong> {meta.description}</p>
      <p><strong>og:image:</strong> {meta.image}</p>
    </div>
  </section>

  <section>
    <h2>Full SEO Pattern</h2>
    <pre>{\`<!-- +page.svelte -->
<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.post.title} — My Blog</title>
  <meta name="description" content={data.post.excerpt} />

  <!-- Open Graph -->
  <meta property="og:title" content={data.post.title} />
  <meta property="og:description" content={data.post.excerpt} />
  <meta property="og:image" content={data.post.image} />
  <meta property="og:type" content="article" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={data.post.title} />
  <meta name="twitter:description" content={data.post.excerpt} />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://mysite.com/{data.post.slug}" />
</svelte:head>\`}</pre>
  </section>

  <section>
    <h2>Key Points</h2>
    <ul>
      <li><code>&lt;svelte:head&gt;</code> works during SSR — search engines see your metadata</li>
      <li>Child components can add to <code>&lt;head&gt;</code> — entries are merged</li>
      <li>Duplicate tags are not automatically deduplicated — be intentional</li>
      <li>When a component is destroyed, its <code>&lt;svelte:head&gt;</code> entries are removed</li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 600px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .page-switcher { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .page-switcher button { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; }
  .page-switcher button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .meta-preview { background: #f0f7ff; padding: 1rem; border-radius: 4px; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
