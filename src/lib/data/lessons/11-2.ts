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

The layout receives a children snippet representing the page content, which it renders with {@render children()}. Layouts can load data with +layout.ts/+layout.server.ts, and that data flows down into every child page. Layout groups ((marketing), (app)) let you share layouts without adding URL segments, and +layout@.svelte resets the layout chain for a specific route.`,
	objectives: [
		'Create a root layout with shared navigation and footer',
		'Understand how layouts wrap page content using the children snippet',
		'Nest layouts to add section-specific UI',
		'Load shared data in layouts and access it from child pages',
		'Use layout groups ((marketing), (app)) to segment app sections without URL impact',
		'Reset the layout chain with +layout@.svelte / +page@.svelte'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Layouts wrap pages in shared UI structure.
  // This demo simulates a layout with nav + page content.

  type Page = 'home' | 'about' | 'blog' | 'blog-post' | 'login';
  let currentPage: Page = $state('home');

  let user = $state<{ name: string } | null>({ name: 'Ada' });

  function toggleAuth() {
    user = user ? null : { name: 'Ada' };
  }

  // Simulated page data from a layout load function
  let layoutData = $derived({
    user,
    siteName: 'My App',
    year: 2026
  });
</script>

<main>
  <h1>Layouts: Shared UI</h1>

  <section>
    <h2>The Root Layout</h2>
    <p>
      Every SvelteKit app has a root layout at <code>src/routes/+layout.svelte</code>.
      It wraps every page and is the perfect place for global nav, footer, and
      <code>&lt;svelte:head&gt;</code> defaults.
    </p>
    <pre>{\`<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let {
    data,
    children
  }: { data: LayoutData; children: Snippet } = $props();
</script>

<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <a href="/blog">Blog</a>
  {#if data.user}
    <span>Hi, {data.user.name}</span>
  {:else}
    <a href="/login">Log in</a>
  {/if}
</nav>

<main>
  {@render children()}
</main>

<footer>© {new Date().getFullYear()} {data.siteName}</footer>\`}</pre>
  </section>

  <section>
    <h2>Layout Data Flow</h2>
    <p>
      Layout load functions run before their children and their data is merged
      into <code>page.data</code>. Child pages see their layout's data automatically.
    </p>
    <pre>{\`// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const sessionId = cookies.get('session');
  const user = sessionId ? await getUser(sessionId) : null;
  return {
    user,
    siteName: 'My App'
  };
};\`}</pre>
    <pre>{\`<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  // data.user is available here — came from the root layout's load
</script>

<h1>Welcome back, {data.user?.name}</h1>\`}</pre>
    <p class="callout">
      <strong>Inheritance:</strong> if multiple layouts each return data, the
      objects are shallow-merged. Child pages receive the combined object.
      A child's own load function's return value wins on key conflicts.
    </p>
  </section>

  <section>
    <h2>Live Demo: Simulated Layout</h2>
    <label class="auth-toggle">
      <input type="checkbox" checked={!!user} onchange={toggleAuth} />
      Logged in (affects layout data)
    </label>

    <!-- Simulated root layout -->
    <div class="layout">
      <nav>
        <button class:active={currentPage === 'home'} onclick={() => (currentPage = 'home')}>Home</button>
        <button class:active={currentPage === 'about'} onclick={() => (currentPage = 'about')}>About</button>
        <button class:active={currentPage.startsWith('blog')} onclick={() => (currentPage = 'blog')}>Blog</button>
        <span class="user-chip">
          {layoutData.user ? \`Hi, \${layoutData.user.name}\` : 'Guest'}
        </span>
      </nav>

      <div class="page-content">
        {#if currentPage === 'home'}
          <h2>Welcome Home</h2>
          <p>This page is wrapped by the root layout only.</p>
        {:else if currentPage === 'about'}
          <h2>About Us</h2>
          <p>Also wrapped by the root layout only.</p>
        {:else if currentPage === 'blog' || currentPage === 'blog-post'}
          <!-- Simulated nested layout: blog section has its own sidebar -->
          <div class="blog-layout">
            <aside>
              <h3>Blog Nav</h3>
              <button onclick={() => (currentPage = 'blog')}>All Posts</button>
              <button onclick={() => (currentPage = 'blog-post')}>Latest Post</button>
            </aside>
            <div class="blog-content">
              {#if currentPage === 'blog'}
                <h2>Blog</h2>
                <p>All blog posts listed here.</p>
              {:else}
                <h2>My Latest Post</h2>
                <p>Wrapped by root layout + blog layout.</p>
              {/if}
            </div>
          </div>
        {/if}
      </div>

      <footer>© {layoutData.year} {layoutData.siteName} — shared footer</footer>
    </div>
  </section>

  <section>
    <h2>Nested Layouts</h2>
    <pre>{\`src/routes/
├── +layout.svelte              ← Root layout (nav + footer)
├── +page.svelte                ← Home (wrapped by root)
├── about/
│   └── +page.svelte            ← About (wrapped by root)
└── blog/
    ├── +layout.svelte          ← Blog layout (adds sidebar)
    ├── +layout.ts              ← Load post index for sidebar
    ├── +page.svelte            ← /blog  (root + blog layout)
    └── [slug]/
        └── +page.svelte        ← /blog/:slug  (root + blog layout)\`}</pre>
    <pre>{\`<!-- src/routes/blog/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let {
    data,
    children
  }: { data: LayoutData; children: Snippet } = $props();
</script>

<div class="blog-layout">
  <aside>
    <h3>Recent Posts</h3>
    <ul>
      {#each data.recentPosts as post}
        <li><a href="/blog/{post.slug}">{post.title}</a></li>
      {/each}
    </ul>
  </aside>
  <article>{@render children()}</article>
</div>\`}</pre>
  </section>

  <section>
    <h2>Layout Groups: (marketing) vs (app)</h2>
    <p>
      Sometimes you want two <em>different</em> root layouts — a minimal marketing
      layout for the landing page, and a full app shell for authenticated routes —
      without reflecting that in the URL. Folders wrapped in parentheses do exactly
      that: they group routes under a shared layout without adding a URL segment.
    </p>
    <pre>{\`src/routes/
├── (marketing)/
│   ├── +layout.svelte          ← Landing page chrome
│   ├── +page.svelte            → /               (NOT /marketing)
│   ├── pricing/+page.svelte    → /pricing
│   └── about/+page.svelte      → /about
│
└── (app)/
    ├── +layout.svelte          ← App shell (sidebar, user menu)
    ├── +layout.server.ts       ← Auth gate
    ├── dashboard/+page.svelte  → /dashboard      (NOT /app/dashboard)
    └── settings/+page.svelte   → /settings\`}</pre>
    <p class="callout">
      <strong>Key point:</strong> <code>(marketing)</code> and <code>(app)</code>
      don't appear in URLs. A visitor to <code>/pricing</code> gets the marketing
      layout; a visitor to <code>/dashboard</code> gets the app layout. You've
      split your app into two layout trees without touching the URL structure.
    </p>
  </section>

  <section>
    <h2>Breaking Out: +layout@.svelte and +page@.svelte</h2>
    <p>
      Occasionally one page inside a section needs to escape its nested layouts —
      say, a full-screen checkout flow inside <code>/dashboard</code>. Append
      <code>@</code> plus the name of an ancestor (or nothing for the root) to
      reset the layout chain up to that point.
    </p>
    <pre>{\`src/routes/
└── (app)/
    ├── +layout.svelte           ← App shell with sidebar
    ├── dashboard/+page.svelte   → rendered inside app shell
    └── checkout/
        └── +page@.svelte        → escapes ALL layouts (root only)

// +page@(app).svelte  → reset to the (app) layout, skip any in between
// +page@.svelte       → reset all the way to the root layout\`}</pre>
  </section>

  <section>
    <h2>Common Pitfalls</h2>
    <ul class="pitfalls">
      <li>Forgetting <code>{'{@render children()}'}</code> — your layout renders but every page inside is blank.</li>
      <li>Expecting layout data to re-run on every navigation — by default it only re-runs when its dependencies change. Use <code>depends()</code> and <code>invalidate()</code> to force it.</li>
      <li>Putting auth checks only in a page load — always gate at the layout level so every child is protected.</li>
      <li>Nesting layouts too deeply — if you find yourself fighting <code>@</code> resets constantly, your layout tree is probably too tall.</li>
    </ul>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; padding: 1rem; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.78rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; }
  .auth-toggle { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; font-size: 0.9rem; cursor: pointer; }
  .layout { border: 2px solid #4a90d9; border-radius: 8px; overflow: hidden; }
  .layout nav { background: #4a90d9; padding: 0.5rem; display: flex; gap: 0.5rem; align-items: center; }
  .layout nav button { background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.5rem 1rem; cursor: pointer; border-radius: 4px; }
  .layout nav button.active { background: rgba(255,255,255,0.4); font-weight: bold; }
  .user-chip { margin-left: auto; color: white; font-size: 0.85rem; background: rgba(0,0,0,0.2); padding: 0.25rem 0.6rem; border-radius: 10px; }
  .page-content { padding: 1rem; min-height: 150px; }
  .layout footer { background: #f5f5f5; padding: 0.5rem 1rem; text-align: center; border-top: 1px solid #ddd; font-size: 0.85rem; }
  .blog-layout { display: grid; grid-template-columns: 150px 1fr; gap: 1rem; }
  .blog-layout aside { background: #f0f7ff; padding: 0.75rem; border-radius: 4px; }
  .blog-layout aside button { display: block; width: 100%; margin: 0.25rem 0; padding: 0.4rem; cursor: pointer; font-size: 0.85rem; }
  .callout { background: #fff7ed; border-left: 3px solid #f59e0b; padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.85rem; color: #78350f; }
  .callout code { background: #fde68a; }
  .pitfalls li { margin: 0.4rem 0; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
