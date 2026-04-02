import type { Lesson } from '$types/lesson';

export const blogProjectSetup: Lesson = {
	id: 'projects.build-a-blog.blog-project-setup',
	slug: 'blog-project-setup',
	title: 'Blog Project Setup',
	description:
		'Scaffold the foundation of a Svelte 5 blog application with proper project structure, component architecture, and shared state.',
	trackId: 'projects',
	moduleId: 'build-a-blog',
	order: 1,
	estimatedMinutes: 25,
	concepts: ['svelte5.project.structure', 'svelte5.components.layout', 'svelte5.runes.state'],
	prerequisites: ['svelte5.components.basic', 'svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Setting Up Your Blog Project

Building a blog is one of the most rewarding introductory projects you can tackle with Svelte 5. It exercises nearly every fundamental skill — component composition, reactive state management, conditional rendering, and data flow — while producing something genuinely useful.

In this lesson we will scaffold the entire project structure from scratch. By the end you will have a working shell that includes a top-level layout component, a shared blog-post type definition, a reactive store for posts, and placeholder pages for listing and reading articles. Every subsequent lesson in this module builds on top of what you create here, so take the time to understand each piece.

## Why Structure Matters

When you start a project by dumping everything into a single file, you pay an invisible tax: every feature you add later takes longer because you have to untangle responsibilities first. A well-structured project inverts that curve — each new feature slots cleanly into an obvious location.

For our blog we will follow a simple convention:

- **\`types/\`** — TypeScript interfaces and type aliases shared across the app.
- **\`stores/\`** — Reactive state containers powered by \`$state\`.
- **\`components/\`** — Reusable presentational components such as headers, footers, and cards.
- **\`pages/\`** — Top-level view components that compose smaller pieces.

This is not the only valid structure, but it is explicit enough that anyone reading the code can predict where a given concern lives.

## Defining the BlogPost Type

Before writing any UI code, let us agree on the shape of data flowing through the application. A blog post, at minimum, needs an identifier, a title, a body, a publication date, and some metadata for SEO (which we will flesh out in a later lesson).

\`\`\`ts
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  publishedAt: string;
  tags: string[];
}
\`\`\`

Defining this up-front gives TypeScript the information it needs to catch mistakes across every component that touches post data. If you rename a field later, the compiler will flag every reference that needs updating — an enormous time-saver in any project larger than a toy example.

## Building the Blog Store

Svelte 5 runes let us create reactive state that lives *outside* components. This is perfect for a blog store: multiple components need to read and write the same list of posts without prop-drilling through the entire tree.

We declare a module-level \`$state\` variable inside a function that returns both the state and mutation helpers:

\`\`\`ts
function createBlogStore() {
  let posts = $state<BlogPost[]>([]);

  return {
    get posts() { return posts; },
    addPost(post: BlogPost) { posts.push(post); },
    removePost(id: string) { posts = posts.filter(p => p.id !== id); }
  };
}
\`\`\`

Because \`posts\` is wrapped in \`$state\`, any component that reads \`store.posts\` will automatically re-render when the array changes — even when you mutate it in place with \`.push()\`. That deep reactivity tracking is one of Svelte 5's most powerful features.

## The Layout Component

Every page of our blog shares chrome: a header with the site name, a navigation bar, and a footer. Extracting this into a \`Layout\` component means each page only has to worry about its own content.

A layout component in Svelte 5 accepts children via the \`{@render children()}\` pattern. This replaces the old \`<slot />\` approach and gives you explicit, type-safe control over where child content appears.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.components.layout'
		},
		{
			type: 'text',
			content: `## Your Task: Scaffold the Blog Shell

Look at the starter code in the editor. You will find an empty \`App.svelte\` along with placeholder files. Your job is to:

1. Define a \`BlogPost\` interface inside \`types.ts\`.
2. Create a reactive blog store in \`store.ts\` using \`$state\`.
3. Build a \`Layout.svelte\` component with a header, nav, and a content area that renders children.
4. Wire everything together in \`App.svelte\` so the layout wraps a placeholder home page.

This is deliberately more open-ended than earlier exercises. Real-world development rarely gives you a single variable to fix — you have to create cohesive pieces and connect them yourself.`
		},
		{
			type: 'checkpoint',
			content: 'cp-setup-types'
		},
		{
			type: 'text',
			content: `## Connecting the Store to the Layout

Once the type and the store exist, the layout can import the store and display a post count in the header — a small touch that proves reactivity is wired end-to-end. When you add or remove posts later, the count updates automatically.

Think carefully about where the store is instantiated. Because it is module-level state, every component that imports it shares the same instance. This is *singleton* state — appropriate for global concerns like the current user or, in our case, the master list of blog posts.

## Adding Seed Data

An empty blog is not very motivating to look at. Add two or three seed posts directly in the store module so the UI has something to render from the start. Make each post realistic — give them proper titles, excerpts, publication dates, and a couple of tags. Realistic seed data exposes layout issues (long titles, missing fields) that placeholder text like "Lorem ipsum" hides.`
		},
		{
			type: 'checkpoint',
			content: 'cp-setup-layout'
		},
		{
			type: 'text',
			content: `## Verifying the Foundation

Before moving on, run through this mental checklist:

- **Type safety**: Does every component that touches post data import \`BlogPost\`?
- **Reactivity**: If you call \`store.addPost(...)\` from the console, does the header post-count update?
- **Composition**: Is the layout truly reusable — could you swap the home page content for a different page without changing \`Layout.svelte\`?

If you can answer "yes" to all three, you have a solid foundation for the rest of this module. In the next lesson we will build the post editor, giving users the ability to create and edit articles with a live Markdown preview.`
		},
		{
			type: 'checkpoint',
			content: 'cp-setup-store'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import Layout and wire up the blog shell
</script>

<main>
  <h1>My Blog</h1>
  <p>Welcome! This blog is under construction.</p>
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>`
		},
		{
			name: 'types.ts',
			path: '/types.ts',
			language: 'typescript',
			content: `// TODO: Define the BlogPost interface
// It should include: id, title, slug, excerpt, body, author, publishedAt, tags
`
		},
		{
			name: 'store.ts',
			path: '/store.ts',
			language: 'typescript',
			content: `// TODO: Create a reactive blog store using $state
// Export a store object with: posts (getter), addPost, removePost
`
		},
		{
			name: 'Layout.svelte',
			path: '/Layout.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Build a layout with header, nav, and children rendering
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<!-- TODO: Add header with site title and nav -->
<!-- TODO: Render children -->
<!-- TODO: Add footer -->

<style>
  /* Add your layout styles here */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Layout from './Layout.svelte';
  import { blogStore } from './store.ts';
</script>

<Layout>
  <h1>Welcome to My Blog</h1>
  <p>Explore {blogStore.posts.length} articles on web development, Svelte, and more.</p>

  {#each blogStore.posts as post}
    <article>
      <h2>{post.title}</h2>
      <p>{post.excerpt}</p>
      <small>By {post.author} on {post.publishedAt} &middot; {post.tags.join(', ')}</small>
    </article>
  {/each}
</Layout>

<style>
  h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  article {
    border-bottom: 1px solid #e2e8f0;
    padding: 1.5rem 0;
  }

  article h2 {
    margin: 0 0 0.5rem;
    color: #1e293b;
  }

  article p {
    color: #475569;
    line-height: 1.6;
  }

  small {
    color: #94a3b8;
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
  let posts = $state<BlogPost[]>([
    {
      id: '1',
      title: 'Getting Started with Svelte 5',
      slug: 'getting-started-svelte-5',
      excerpt: 'Svelte 5 introduces runes, a powerful new way to handle reactivity.',
      body: 'Svelte 5 introduces runes, a powerful new way to handle reactivity. In this post we explore $state, $derived, and $effect.',
      author: 'Jane Developer',
      publishedAt: '2025-12-01',
      tags: ['svelte', 'javascript', 'tutorial']
    },
    {
      id: '2',
      title: 'Why Runes Change Everything',
      slug: 'why-runes-change-everything',
      excerpt: 'Runes make reactivity explicit and composable across your entire codebase.',
      body: 'Runes make reactivity explicit and composable. No more guessing which variables are reactive — $state tells you and the compiler exactly what to track.',
      author: 'Jane Developer',
      publishedAt: '2025-12-15',
      tags: ['svelte', 'runes', 'reactivity']
    }
  ]);

  return {
    get posts() { return posts; },
    addPost(post: BlogPost) { posts.push(post); },
    removePost(id: string) { posts = posts.filter(p => p.id !== id); }
  };
}

export const blogStore = createBlogStore();
`
		},
		{
			name: 'Layout.svelte',
			path: '/Layout.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';
  import { blogStore } from './store.ts';

  let { children }: { children: Snippet } = $props();
</script>

<div class="layout">
  <header>
    <nav>
      <a href="/" class="logo">My Blog</a>
      <span class="post-count">{blogStore.posts.length} posts</span>
    </nav>
  </header>

  <main>
    {@render children()}
  </main>

  <footer>
    <p>&copy; 2025 My Blog. Built with Svelte 5.</p>
  </footer>
</div>

<style>
  .layout {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
    font-family: system-ui, -apple-system, sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  header {
    border-bottom: 1px solid #e2e8f0;
    padding: 1rem 0;
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b;
    text-decoration: none;
  }

  .post-count {
    color: #64748b;
    font-size: 0.875rem;
  }

  main {
    flex: 1;
    padding: 2rem 0;
  }

  footer {
    border-top: 1px solid #e2e8f0;
    padding: 1rem 0;
    color: #94a3b8;
    font-size: 0.875rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-setup-types',
			description: 'Define a BlogPost interface with all required fields in types.ts',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'interface BlogPost' },
						{ type: 'contains', value: 'title: string' },
						{ type: 'contains', value: 'tags: string[]' }
					]
				}
			},
			hints: [
				'Create a TypeScript interface named `BlogPost` inside `types.ts` and export it.',
				'The interface should include fields for id, title, slug, excerpt, body, author, publishedAt (all strings), and tags (string array).',
				'Add `export interface BlogPost { id: string; title: string; slug: string; excerpt: string; body: string; author: string; publishedAt: string; tags: string[]; }` to types.ts.'
			],
			conceptsTested: ['svelte5.project.structure']
		},
		{
			id: 'cp-setup-layout',
			description: 'Create a Layout component with header, children rendering, and footer',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@render children()' },
						{ type: 'contains', value: '<header' },
						{ type: 'contains', value: '<footer' }
					]
				}
			},
			hints: [
				'The Layout component should accept a `children` snippet via `$props()` and render it with `{@render children()}`.',
				'Wrap the rendered children between a `<header>` and a `<footer>` element. Add a nav with the site name inside the header.',
				'Use `let { children }: { children: Snippet } = $props();` then render `{@render children()}` between header and footer elements.'
			],
			conceptsTested: ['svelte5.components.layout']
		},
		{
			id: 'cp-setup-store',
			description: 'Create a reactive blog store with $state and seed data',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$state' },
						{ type: 'contains', value: 'addPost' },
						{ type: 'contains', value: 'removePost' }
					]
				}
			},
			hints: [
				'Use `$state` to create a reactive array of BlogPost objects. Wrap it in a factory function that returns getters and setters.',
				'The store should expose a `posts` getter, an `addPost` method that pushes to the array, and a `removePost` method that filters by id.',
				'Create `function createBlogStore() { let posts = $state<BlogPost[]>([...]); return { get posts() { return posts; }, addPost(post: BlogPost) { posts.push(post); }, removePost(id: string) { posts = posts.filter(p => p.id !== id); } }; }` and export the instance.'
			],
			conceptsTested: ['svelte5.runes.state']
		}
	]
};
