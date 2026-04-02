import type { Lesson } from '$types/lesson';

export const blogSeo: Lesson = {
	id: 'projects.build-a-blog.blog-seo',
	slug: 'blog-seo',
	title: 'SEO and Meta Tags',
	description:
		'Add dynamic meta tags, Open Graph data, structured markup, and a sitemap generator to make your blog search-engine friendly.',
	trackId: 'projects',
	moduleId: 'build-a-blog',
	order: 4,
	estimatedMinutes: 25,
	concepts: ['svelte5.runes.derived', 'svelte5.components.composition', 'svelte5.head.meta'],
	prerequisites: ['projects.build-a-blog.blog-listing'],

	content: [
		{
			type: 'text',
			content: `# SEO and Meta Tags for Your Blog

You have built a blog that creates, lists, and displays posts. But if search engines cannot understand your content, nobody will find it. Search Engine Optimization (SEO) is not magic — it is a set of well-defined technical practices that help crawlers parse and rank your pages.

In this lesson you will build an \`SEOHead\` component that generates dynamic \`<meta>\` tags for every page, add Open Graph (OG) properties so your posts look great when shared on social media, create JSON-LD structured data so Google can display rich results, and generate a static sitemap from your post list. All of this will be driven by reactive Svelte 5 state.

## Why Meta Tags Matter

When a search engine crawler visits your blog, it reads the HTML head before anything else. Three elements have outsized impact:

1. **\`<title>\`** — The clickable headline in search results. It should be unique per page, under 60 characters, and descriptive.
2. **\`<meta name="description">\`** — The snippet below the headline. Keep it under 160 characters. It should summarize the page content and entice clicks.
3. **Open Graph tags** — \`og:title\`, \`og:description\`, \`og:image\`, \`og:url\`. These control how your page appears when shared on Facebook, LinkedIn, Slack, and other platforms that unfurl links.

Without these, search engines guess what your page is about (often poorly), and social shares display a blank or generic card.

## Building the SEOHead Component

Svelte provides the \`<svelte:head>\` special element for injecting content into the document \`<head>\`. We wrap this in a reusable component:

\`\`\`svelte
<script lang="ts">
  interface SEOProps {
    title: string;
    description: string;
    url: string;
    image?: string;
    type?: string;
    publishedAt?: string;
    author?: string;
    tags?: string[];
  }

  let {
    title,
    description,
    url,
    image = '/default-og.png',
    type = 'article',
    publishedAt,
    author,
    tags = []
  }: SEOProps = $props();
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />

  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:url" content={url} />
  <meta property="og:type" content={type} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />
</svelte:head>
\`\`\`

This component accepts typed props and renders all the required meta tags. Because it uses \`$props()\` with defaults, consumers only need to pass the fields they care about.

## Dynamic Meta Tags Per Post

Each blog post should have its own title, description, and OG data. When the user navigates to a post detail view, the SEO component receives that post's data:

\`\`\`svelte
<SEOHead
  title="{post.title} | My Blog"
  description={post.excerpt}
  url="/blog/{post.slug}"
  publishedAt={post.publishedAt}
  author={post.author}
  tags={post.tags}
/>
\`\`\`

This is where the separation between data (the blog store) and presentation (the SEO component) pays off. The meta tags are a function of the current post — change the post, and every tag updates. Svelte's reactivity makes this automatic.

## JSON-LD Structured Data

Search engines increasingly rely on structured data to understand page content. JSON-LD (JavaScript Object Notation for Linked Data) is the preferred format. For a blog post, the \`BlogPosting\` schema tells Google the title, author, publication date, and body — enabling rich results like article cards.

We generate JSON-LD as a \`$derived\` value:

\`\`\`ts
let jsonLd = $derived(JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: title,
  description: description,
  author: { '@type': 'Person', name: author },
  datePublished: publishedAt,
  url: url,
  keywords: tags.join(', ')
}));
\`\`\`

Then inject it into the head:

\`\`\`svelte
<svelte:head>
  {@html \`<script type="application/ld+json">\${jsonLd}</script>\`}
</svelte:head>
\`\`\`

Using \`$derived\` ensures the JSON-LD always reflects the current post data — no stale structured data, no manual syncing.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.head.meta'
		},
		{
			type: 'text',
			content: `## Your Task: Build the SEO System

Open the starter code. You will find:

- An \`SEOHead.svelte\` shell that needs to render meta tags via \`<svelte:head>\`.
- A \`PostDetail.svelte\` component that displays a single post and needs to use \`SEOHead\`.
- A \`Sitemap.svelte\` component that should generate a list of all post URLs.

Your goals:

1. Complete \`SEOHead.svelte\` with title, description, OG tags, Twitter card tags, and JSON-LD structured data.
2. Wire \`PostDetail.svelte\` to pass the current post's data into \`SEOHead\`.
3. Build a sitemap list in \`Sitemap.svelte\` using \`$derived\` from the blog store.`
		},
		{
			type: 'checkpoint',
			content: 'cp-seo-head'
		},
		{
			type: 'text',
			content: `## The Sitemap Component

A sitemap lists every publicly accessible URL on your site. While real sitemaps are XML files served at \`/sitemap.xml\`, we will build a visual sitemap component that generates the URL list from our blog store — demonstrating how derived state can power non-UI outputs.

\`\`\`ts
let sitemapEntries = $derived(
  blogStore.posts.map(post => ({
    url: \`/blog/\${post.slug}\`,
    lastmod: post.publishedAt,
    title: post.title
  }))
);
\`\`\`

Render this as a simple table or list. The key insight is that the sitemap is always in sync with the actual posts — add a post, and the sitemap gains a row automatically. In a production app you would serialize this to XML; here we focus on the reactive data flow.

## Canonical URLs

Every page should declare its canonical URL with \`<link rel="canonical">\`. This tells search engines which URL is the "official" version of the page, preventing duplicate content penalties when the same page is accessible via multiple URLs (e.g., with and without query parameters).

Add a canonical link to \`SEOHead.svelte\`:

\`\`\`svelte
<link rel="canonical" href={url} />
\`\`\`

Small addition, big impact on SEO health.

## Testing Your SEO Setup

You cannot easily test SEO in a browser preview, but you can verify correctness by inspecting the generated HTML. After completing the tasks:

1. Check that the document \`<title>\` changes when you switch posts.
2. Verify that \`og:title\` and \`og:description\` match the current post.
3. Confirm that the JSON-LD script tag contains valid JSON with the correct schema.
4. Ensure the sitemap lists every post in the store.

This lesson completes the blog module. You now have a fully functional blog with a type-safe data model, a reactive store, a post editor with live preview, a filterable and paginated listing page, and comprehensive SEO. These same architectural patterns — typed data, centralized state, derived computations, composable components — scale to applications of any size.`
		},
		{
			type: 'checkpoint',
			content: 'cp-seo-detail'
		},
		{
			type: 'checkpoint',
			content: 'cp-seo-sitemap'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import PostDetail from './PostDetail.svelte';
  import Sitemap from './Sitemap.svelte';
  import { blogStore } from './store.ts';
  import type { BlogPost } from './types';

  const seeds: BlogPost[] = [
    { id: '1', title: 'Getting Started with Svelte 5', slug: 'getting-started-svelte-5', excerpt: 'Learn the basics of Svelte 5 and the new runes system.', body: 'Svelte 5 introduces runes — a powerful new reactivity system. In this guide we cover $state, $derived, and $effect from scratch.', author: 'Alice Chen', publishedAt: '2025-11-01', tags: ['svelte', 'tutorial'] },
    { id: '2', title: 'Advanced Reactivity Patterns', slug: 'advanced-reactivity', excerpt: 'Deep dive into $derived and $effect for complex state.', body: 'Once you master the basics, advanced patterns like derived chains and effect cleanup take your Svelte apps to the next level.', author: 'Bob Smith', publishedAt: '2025-11-10', tags: ['svelte', 'advanced'] },
  ];
  seeds.forEach(s => blogStore.addPost(s));

  let selectedPost = $state<BlogPost>(blogStore.posts[0]);
</script>

<div class="app">
  <h1>SEO Preview</h1>

  <div class="post-selector">
    {#each blogStore.posts as post}
      <button onclick={() => selectedPost = post} class:active={selectedPost?.id === post.id}>
        {post.title}
      </button>
    {/each}
  </div>

  <PostDetail post={selectedPost} />

  <hr />
  <h2>Sitemap</h2>
  <Sitemap />
</div>

<style>
  .app {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .post-selector {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .post-selector button {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    cursor: pointer;
  }

  .post-selector button.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
  }

  hr {
    margin: 2rem 0;
    border: none;
    border-top: 1px solid #e2e8f0;
  }
</style>`
		},
		{
			name: 'SEOHead.svelte',
			path: '/SEOHead.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Define SEOProps interface and accept props via $props()
  // TODO: Create $derived jsonLd for structured data
</script>

<!-- TODO: Use <svelte:head> to render title, meta, OG, Twitter, canonical, and JSON-LD -->

`
		},
		{
			name: 'PostDetail.svelte',
			path: '/PostDetail.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { BlogPost } from './types';
  // TODO: Import SEOHead
  // TODO: Accept post via $props()
</script>

<!-- TODO: Render SEOHead with post data -->
<!-- TODO: Render post content -->

<style>
  article {
    line-height: 1.7;
  }
</style>`
		},
		{
			name: 'Sitemap.svelte',
			path: '/Sitemap.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { blogStore } from './store.ts';

  // TODO: Create $derived sitemapEntries from blogStore.posts
</script>

<!-- TODO: Render sitemap entries as a list or table -->

<style>
  /* Add your styles here */
</style>`
		},
		{
			name: 'types.ts',
			path: '/types.ts',
			language: 'typescript',
			content: `export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  publishedAt: string;
  tags: string[];
}
`
		},
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { BlogPost } from './types';

function createBlogStore() {
  let posts = $state<BlogPost[]>([]);

  return {
    get posts() { return posts; },
    addPost(post: BlogPost) { posts.push(post); },
    removePost(id: string) { posts = posts.filter(p => p.id !== id); }
  };
}

export const blogStore = createBlogStore();
`
		}
	],

	solutionFiles: [
		{
			name: 'SEOHead.svelte',
			path: '/SEOHead.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface SEOProps {
    title: string;
    description: string;
    url: string;
    image?: string;
    type?: string;
    publishedAt?: string;
    author?: string;
    tags?: string[];
  }

  let {
    title,
    description,
    url,
    image = '/default-og.png',
    type = 'article',
    publishedAt = '',
    author = '',
    tags = []
  }: SEOProps = $props();

  let jsonLd = $derived(JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: description,
    author: { '@type': 'Person', name: author },
    datePublished: publishedAt,
    url: url,
    keywords: tags.join(', ')
  }));
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />

  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:url" content={url} />
  <meta property="og:type" content={type} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />

  {#if publishedAt}
    <meta property="article:published_time" content={publishedAt} />
  {/if}

  {#each tags as tag}
    <meta property="article:tag" content={tag} />
  {/each}

  {@html \`<script type="application/ld+json">\${jsonLd}</script>\`}
</svelte:head>`
		},
		{
			name: 'PostDetail.svelte',
			path: '/PostDetail.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { BlogPost } from './types';
  import SEOHead from './SEOHead.svelte';

  let { post }: { post: BlogPost } = $props();
</script>

<SEOHead
  title="{post.title} | My Blog"
  description={post.excerpt}
  url="/blog/{post.slug}"
  publishedAt={post.publishedAt}
  author={post.author}
  tags={post.tags}
/>

<article>
  <h1>{post.title}</h1>
  <div class="meta">
    <span>By {post.author}</span>
    <time>Published {post.publishedAt}</time>
  </div>
  <div class="tags">
    {#each post.tags as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
  <div class="body">
    <p>{post.body}</p>
  </div>
</article>

<style>
  article {
    line-height: 1.7;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #1e293b;
  }

  .meta {
    display: flex;
    gap: 1rem;
    color: #64748b;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .tags {
    display: flex;
    gap: 0.35rem;
    margin-bottom: 1.5rem;
  }

  .tag {
    background: #f1f5f9;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    color: #475569;
  }

  .body {
    color: #374151;
  }
</style>`
		},
		{
			name: 'Sitemap.svelte',
			path: '/Sitemap.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { blogStore } from './store.ts';

  let sitemapEntries = $derived(
    blogStore.posts.map(post => ({
      url: \`/blog/\${post.slug}\`,
      lastmod: post.publishedAt,
      title: post.title
    }))
  );
</script>

<div class="sitemap">
  <table>
    <thead>
      <tr>
        <th>URL</th>
        <th>Title</th>
        <th>Last Modified</th>
      </tr>
    </thead>
    <tbody>
      {#each sitemapEntries as entry}
        <tr>
          <td><code>{entry.url}</code></td>
          <td>{entry.title}</td>
          <td>{entry.lastmod}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .sitemap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th, td {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  th {
    color: #64748b;
    font-weight: 600;
    background: #f8fafc;
  }

  code {
    background: #f1f5f9;
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
    font-size: 0.8rem;
  }
</style>`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import PostDetail from './PostDetail.svelte';
  import Sitemap from './Sitemap.svelte';
  import { blogStore } from './store.ts';
  import type { BlogPost } from './types';

  const seeds: BlogPost[] = [
    { id: '1', title: 'Getting Started with Svelte 5', slug: 'getting-started-svelte-5', excerpt: 'Learn the basics of Svelte 5 and the new runes system.', body: 'Svelte 5 introduces runes — a powerful new reactivity system. In this guide we cover $state, $derived, and $effect from scratch.', author: 'Alice Chen', publishedAt: '2025-11-01', tags: ['svelte', 'tutorial'] },
    { id: '2', title: 'Advanced Reactivity Patterns', slug: 'advanced-reactivity', excerpt: 'Deep dive into $derived and $effect for complex state.', body: 'Once you master the basics, advanced patterns like derived chains and effect cleanup take your Svelte apps to the next level.', author: 'Bob Smith', publishedAt: '2025-11-10', tags: ['svelte', 'advanced'] },
  ];
  seeds.forEach(s => blogStore.addPost(s));

  let selectedPost = $state<BlogPost>(blogStore.posts[0]);
</script>

<div class="app">
  <h1>SEO Preview</h1>

  <div class="post-selector">
    {#each blogStore.posts as post}
      <button onclick={() => selectedPost = post} class:active={selectedPost?.id === post.id}>
        {post.title}
      </button>
    {/each}
  </div>

  <PostDetail post={selectedPost} />

  <hr />
  <h2>Sitemap</h2>
  <Sitemap />
</div>

<style>
  .app {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .post-selector {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .post-selector button {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    cursor: pointer;
  }

  .post-selector button.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
  }

  hr {
    margin: 2rem 0;
    border: none;
    border-top: 1px solid #e2e8f0;
  }
</style>`
		},
		{
			name: 'types.ts',
			path: '/types.ts',
			language: 'typescript',
			content: `export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  publishedAt: string;
  tags: string[];
}
`
		},
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `import type { BlogPost } from './types';

function createBlogStore() {
  let posts = $state<BlogPost[]>([]);

  return {
    get posts() { return posts; },
    addPost(post: BlogPost) { posts.push(post); },
    removePost(id: string) { posts = posts.filter(p => p.id !== id); }
  };
}

export const blogStore = createBlogStore();
`
		}
	],

	checkpoints: [
		{
			id: 'cp-seo-head',
			description: 'Build SEOHead component with meta tags, OG tags, and JSON-LD via <svelte:head>',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'svelte:head' },
						{ type: 'contains', value: 'og:title' },
						{ type: 'contains', value: 'application/ld+json' }
					]
				}
			},
			hints: [
				'Use `<svelte:head>` to inject `<title>`, `<meta>`, and `<script type="application/ld+json">` tags into the document head.',
				'Accept props via `$props()` and create a `$derived` jsonLd string with `JSON.stringify()` containing schema.org BlogPosting data.',
				'The component should render `<svelte:head><title>{title}</title><meta property="og:title" content={title} />...{@html \\`<script type="application/ld+json">${jsonLd}</script>\\`}</svelte:head>`.'
			],
			conceptsTested: ['svelte5.head.meta']
		},
		{
			id: 'cp-seo-detail',
			description: 'Wire PostDetail to pass post data into SEOHead component',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'SEOHead' },
						{ type: 'contains', value: 'post.title' },
						{ type: 'contains', value: '$props()' }
					]
				}
			},
			hints: [
				'Import `SEOHead` and accept a `post` prop via `$props()` in PostDetail.svelte.',
				'Pass the post fields to SEOHead: `<SEOHead title="{post.title} | My Blog" description={post.excerpt} url="/blog/{post.slug}" />`.',
				'The full integration: `let { post }: { post: BlogPost } = $props();` then `<SEOHead title="{post.title} | My Blog" description={post.excerpt} url="/blog/{post.slug}" publishedAt={post.publishedAt} author={post.author} tags={post.tags} />`.'
			],
			conceptsTested: ['svelte5.components.composition']
		},
		{
			id: 'cp-seo-sitemap',
			description: 'Generate a dynamic sitemap list using $derived from the blog store',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$derived' },
						{ type: 'contains', value: 'sitemapEntries' },
						{ type: 'contains', value: '#each' }
					]
				}
			},
			hints: [
				'Create `let sitemapEntries = $derived(blogStore.posts.map(post => ({ url: \\`/blog/${post.slug}\\`, lastmod: post.publishedAt, title: post.title })))`;',
				'Render the entries with `{#each sitemapEntries as entry}` showing the URL, title, and last modified date.',
				'Map each post to a sitemap entry object with url, lastmod, and title, then render them in a table with `{#each sitemapEntries as entry}<tr><td>{entry.url}</td><td>{entry.title}</td><td>{entry.lastmod}</td></tr>{/each}`.'
			],
			conceptsTested: ['svelte5.runes.derived']
		}
	]
};
