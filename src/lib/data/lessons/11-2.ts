import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '11-2',
		title: 'Layouts: Shared UI',
		phase: 3,
		module: 11,
		lessonIndex: 2
	},
	description: `Layouts in SvelteKit let you share UI across multiple pages. A +layout.svelte file wraps all pages at its level and below. The root layout wraps your entire app — perfect for navigation bars, footers, and global styles. Nested layouts add additional wrapping for subsections.

The layout receives a children snippet representing the page content, which it renders with {@render children()}. Layouts can also load data with +layout.js.`,
	objectives: [
		'Create a root layout with shared navigation and footer',
		'Understand how layouts wrap page content using the children snippet',
		'Nest layouts to add section-specific UI',
		'Load shared data in layouts with +layout.js'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Layouts wrap pages in shared UI structure.
  // This demo simulates a layout with nav + page content.

  type Page = 'home' | 'about' | 'blog' | 'blog-post';
  let currentPage: Page = $state('home');
</script>

<main>
  <h1>Layouts: Shared UI</h1>

  <section>
    <h2>How Layouts Work</h2>
    <pre>{\`<!-- src/routes/+layout.svelte (root layout) -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/blog">Blog</a>
</nav>

<main>
  {@render children()}
</main>

<footer>© 2026 My App</footer>\`}</pre>
  </section>

  <section>
    <h2>Live Demo: Simulated Layout</h2>

    <!-- Simulated root layout -->
    <div class="layout">
      <nav>
        <button class:active={currentPage === 'home'} onclick={() => currentPage = 'home'}>Home</button>
        <button class:active={currentPage === 'about'} onclick={() => currentPage = 'about'}>About</button>
        <button class:active={currentPage.startsWith('blog')} onclick={() => currentPage = 'blog'}>Blog</button>
      </nav>

      <div class="page-content">
        {#if currentPage === 'home'}
          <h2>Welcome Home</h2>
          <p>This is the home page content.</p>
        {:else if currentPage === 'about'}
          <h2>About Us</h2>
          <p>This is the about page content.</p>
        {:else if currentPage === 'blog'}
          <!-- Simulated nested layout: blog section has its own sidebar -->
          <div class="blog-layout">
            <aside>
              <h3>Blog Nav</h3>
              <button onclick={() => currentPage = 'blog'}>All Posts</button>
              <button onclick={() => currentPage = 'blog-post'}>Latest Post</button>
            </aside>
            <div class="blog-content">
              <h2>Blog</h2>
              <p>All blog posts listed here.</p>
            </div>
          </div>
        {:else if currentPage === 'blog-post'}
          <div class="blog-layout">
            <aside>
              <h3>Blog Nav</h3>
              <button onclick={() => currentPage = 'blog'}>All Posts</button>
              <button onclick={() => currentPage = 'blog-post'}>Latest Post</button>
            </aside>
            <div class="blog-content">
              <h2>My Latest Post</h2>
              <p>This post has the blog sidebar from the nested layout.</p>
            </div>
          </div>
        {/if}
      </div>

      <footer>Layout footer — shared across all pages</footer>
    </div>
  </section>

  <section>
    <h2>Nested Layouts</h2>
    <pre>{\`src/routes/
├── +layout.svelte        ← Root layout (nav + footer)
├── +page.svelte          ← Home (wrapped by root)
├── about/
│   └── +page.svelte      ← About (wrapped by root)
└── blog/
    ├── +layout.svelte    ← Blog layout (adds sidebar)
    ├── +page.svelte      ← Blog list (root + blog layout)
    └── [slug]/
        └── +page.svelte  ← Blog post (root + blog layout)

<!-- blog/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div class="blog-layout">
  <aside>Blog sidebar</aside>
  <div>{@render children()}</div>
</div>\`}</pre>
  </section>
</main>

<style>
  main { max-width: 650px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .layout { border: 2px solid #4a90d9; border-radius: 8px; overflow: hidden; }
  .layout nav { background: #4a90d9; padding: 0.5rem; display: flex; gap: 0.5rem; }
  .layout nav button { background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px; }
  .layout nav button.active { background: rgba(255,255,255,0.4); font-weight: bold; }
  .page-content { padding: 1rem; min-height: 150px; }
  .layout footer { background: #f5f5f5; padding: 0.5rem 1rem; text-align: center; border-top: 1px solid #ddd; font-size: 0.85rem; }
  .blog-layout { display: grid; grid-template-columns: 150px 1fr; gap: 1rem; }
  .blog-layout aside { background: #f0f7ff; padding: 0.75rem; border-radius: 4px; }
  .blog-layout aside button { display: block; width: 100%; margin: 0.25rem 0; padding: 0.4rem; cursor: pointer; font-size: 0.85rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
