import type { Lesson } from '$types/lesson';

export const blogListing: Lesson = {
	id: 'projects.build-a-blog.blog-listing',
	slug: 'blog-listing',
	title: 'Blog Listing and Navigation',
	description:
		'Build a filterable, paginated blog listing page with tag-based navigation and a responsive card layout.',
	trackId: 'projects',
	moduleId: 'build-a-blog',
	order: 3,
	estimatedMinutes: 25,
	concepts: ['svelte5.runes.derived', 'svelte5.control-flow.each', 'svelte5.components.composition'],
	prerequisites: ['projects.build-a-blog.blog-posts'],

	content: [
		{
			type: 'text',
			content: `# Building the Blog Listing Page

A blog without a way to browse posts is like a library without a catalog. In this lesson you will build a listing page that displays posts as cards, lets users filter by tag, supports a search query, and paginates the results when the list grows long.

This is where the reactive foundations from previous lessons truly shine. Filtering, searching, and pagination are all *derived* from the same underlying data — the array of posts in the blog store. Svelte 5's \`$derived\` rune makes this declarative: you describe the transformation, and the framework handles re-computation whenever the inputs change.

## The Card Component

Each post in the listing will render as a \`PostCard\` component. This is a presentational component — it receives a \`BlogPost\` via \`$props()\` and renders it. It has no internal state and no side effects.

\`\`\`svelte
<script lang="ts">
  import type { BlogPost } from './types';

  let { post }: { post: BlogPost } = $props();
</script>

<article class="card">
  <h2>{post.title}</h2>
  <p class="excerpt">{post.excerpt}</p>
  <div class="meta">
    <span>{post.author}</span>
    <time>{post.publishedAt}</time>
  </div>
  <div class="tags">
    {#each post.tags as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
</article>
\`\`\`

Keeping presentational components "dumb" — free of business logic — makes them easy to test, easy to reuse, and easy to restyle. The listing page orchestrates multiple cards; each card simply renders what it is given.

## Filtering by Tag

Users should be able to click a tag and see only posts that include that tag. We model this with a \`$state\` variable for the active tag filter and a \`$derived\` computation that applies it:

\`\`\`ts
let activeTag = $state<string | null>(null);

let filteredPosts = $derived(
  activeTag
    ? blogStore.posts.filter(p => p.tags.includes(activeTag!))
    : blogStore.posts
);
\`\`\`

When \`activeTag\` is \`null\`, every post is shown. When the user clicks a tag, we set \`activeTag\` to that tag string. The listing re-renders automatically because \`filteredPosts\` is derived from both \`activeTag\` and \`blogStore.posts\`.

Notice the **composability** of this pattern. You can add search on top of tag filtering without restructuring anything — just chain another derived computation:

\`\`\`ts
let searchQuery = $state('');

let searchedPosts = $derived(
  filteredPosts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  )
);
\`\`\`

Each derived value reads from the previous one, forming a pipeline: all posts → filtered by tag → filtered by search → paginated. Svelte tracks the dependencies automatically.

## Pagination

When the blog grows to dozens or hundreds of posts, showing them all at once degrades performance and overwhelms the user. We add client-side pagination with a configurable page size:

\`\`\`ts
let currentPage = $state(1);
const PAGE_SIZE = 6;

let totalPages = $derived(Math.ceil(searchedPosts.length / PAGE_SIZE));

let paginatedPosts = $derived(
  searchedPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
);
\`\`\`

One subtlety: when the user changes the active tag or search query, the current page should reset to 1. Otherwise they might land on an empty page. We handle this with a \`$effect\`:

\`\`\`ts
$effect(() => {
  // Reading activeTag and searchQuery inside the effect creates a dependency
  activeTag;
  searchQuery;
  currentPage = 1;
});
\`\`\`

This is an appropriate use of \`$effect\` — synchronizing derived state (\`currentPage\`) with upstream state (\`activeTag\`, \`searchQuery\`). The Svelte compiler warns you when you write to \`$state\` inside \`$effect\`, but resetting pagination is a valid side effect.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.derived'
		},
		{
			type: 'text',
			content: `## Your Task: Build the Listing Page

Open the starter code. You will find a \`PostCard.svelte\` shell and a \`Listing.svelte\` component. Your goals:

1. Complete \`PostCard.svelte\` so it renders a post's title, excerpt, author, date, and tags.
2. In \`Listing.svelte\`, build a tag cloud from all unique tags across all posts using \`$derived\`.
3. Add a search input bound to a \`$state\` variable.
4. Chain filtering and pagination using \`$derived\` values.
5. Render the paginated posts using \`{#each}\` and \`PostCard\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-listing-card'
		},
		{
			type: 'text',
			content: `## The Tag Cloud

A tag cloud shows every unique tag used across all posts, letting users quickly jump to a category. Building it is a classic \`$derived\` exercise:

\`\`\`ts
let allTags = $derived(
  [...new Set(blogStore.posts.flatMap(p => p.tags))]
);
\`\`\`

Render each tag as a button. When clicked, set \`activeTag\` to that tag. Highlight the active tag with a CSS class so the user knows which filter is applied. Add a "Clear" button that sets \`activeTag\` back to \`null\`.

The tag cloud updates automatically when posts are added or removed because it derives from \`blogStore.posts\`. This is the power of Svelte 5 reactivity — no manual subscription management, no stale state, no forgotten unsubscribe calls.

## Responsive Card Grid

Use CSS Grid to lay out the post cards in a responsive grid. A simple \`grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))\` gives you a fluid layout that adapts from one column on mobile to three columns on desktop — no media queries needed.

Each card should have a consistent height with the excerpt clamped to three lines via \`-webkit-line-clamp\`. This prevents long excerpts from breaking the grid rhythm.`
		},
		{
			type: 'checkpoint',
			content: 'cp-listing-filter'
		},
		{
			type: 'text',
			content: `## Pagination Controls

Below the card grid, render pagination controls with Previous / Next buttons and a page indicator ("Page 2 of 5"). Disable the Previous button on page 1 and the Next button on the last page.

\`\`\`svelte
<div class="pagination">
  <button onclick={() => currentPage--} disabled={currentPage === 1}>Previous</button>
  <span>Page {currentPage} of {totalPages}</span>
  <button onclick={() => currentPage++} disabled={currentPage === totalPages}>Next</button>
</div>
\`\`\`

This is entirely derived from the reactive pipeline. Changing the search query resets the page, which updates the pagination display, which re-slices the post array, which re-renders the cards. Every piece of this UI is a function of state — the hallmark of a well-designed reactive application.

Test your listing by adding several posts through the editor (from the previous lesson) and verifying that filtering, searching, and pagination all work together seamlessly.`
		},
		{
			type: 'checkpoint',
			content: 'cp-listing-pagination'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Listing from './Listing.svelte';
  import { blogStore } from './store.ts';
  import type { BlogPost } from './types';

  // Seed data for testing
  const seeds: BlogPost[] = [
    { id: '1', title: 'Getting Started with Svelte 5', slug: 'svelte-5', excerpt: 'Learn the basics of Svelte 5 and runes.', body: 'Full body here...', author: 'Alice', publishedAt: '2025-11-01', tags: ['svelte', 'tutorial'] },
    { id: '2', title: 'Advanced Reactivity Patterns', slug: 'reactivity', excerpt: 'Deep dive into $derived and $effect.', body: 'Full body here...', author: 'Bob', publishedAt: '2025-11-10', tags: ['svelte', 'advanced'] },
    { id: '3', title: 'CSS Grid Mastery', slug: 'css-grid', excerpt: 'Build responsive layouts with CSS Grid.', body: 'Full body here...', author: 'Alice', publishedAt: '2025-11-15', tags: ['css', 'layout'] },
    { id: '4', title: 'TypeScript Tips for Svelte', slug: 'ts-svelte', excerpt: 'TypeScript patterns that work great with Svelte.', body: 'Full body here...', author: 'Charlie', publishedAt: '2025-11-20', tags: ['typescript', 'svelte'] },
    { id: '5', title: 'State Management Deep Dive', slug: 'state-mgmt', excerpt: 'Managing complex state in Svelte 5 apps.', body: 'Full body here...', author: 'Bob', publishedAt: '2025-12-01', tags: ['svelte', 'state', 'advanced'] },
    { id: '6', title: 'Building Accessible Components', slug: 'a11y', excerpt: 'How to make your Svelte components accessible.', body: 'Full body here...', author: 'Diana', publishedAt: '2025-12-05', tags: ['a11y', 'svelte'] },
    { id: '7', title: 'Animation Techniques', slug: 'animations', excerpt: 'Smooth transitions and animations in Svelte.', body: 'Full body here...', author: 'Alice', publishedAt: '2025-12-10', tags: ['animation', 'svelte', 'css'] },
  ];
  seeds.forEach(s => blogStore.addPost(s));
</script>

<div class="app">
  <h1>My Blog</h1>
  <Listing />
</div>

<style>
  .app {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>`
		},
		{
			name: 'Listing.svelte',
			path: '/Listing.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { blogStore } from './store.ts';
  import PostCard from './PostCard.svelte';

  // TODO: Add $state for activeTag, searchQuery, currentPage
  // TODO: Add $derived for allTags, filteredPosts, searchedPosts, totalPages, paginatedPosts
  // TODO: Add $effect to reset currentPage when filters change
</script>

<!-- TODO: Search input -->
<!-- TODO: Tag cloud -->
<!-- TODO: Post card grid -->
<!-- TODO: Pagination controls -->

<style>
  /* Add your styles here */
</style>`
		},
		{
			name: 'PostCard.svelte',
			path: '/PostCard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { BlogPost } from './types';

  // TODO: Accept post via $props()
</script>

<!-- TODO: Render post card with title, excerpt, meta, and tags -->

<style>
  /* Add your card styles here */
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
			name: 'PostCard.svelte',
			path: '/PostCard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { BlogPost } from './types';

  let { post }: { post: BlogPost } = $props();
</script>

<article class="card">
  <h2>{post.title}</h2>
  <p class="excerpt">{post.excerpt}</p>
  <div class="meta">
    <span>{post.author}</span>
    <time>{post.publishedAt}</time>
  </div>
  <div class="tags">
    {#each post.tags as tag}
      <span class="tag">{tag}</span>
    {/each}
  </div>
</article>

<style>
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .card h2 {
    margin: 0;
    font-size: 1.125rem;
    color: #1e293b;
  }

  .excerpt {
    color: #475569;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #94a3b8;
  }

  .tags {
    display: flex;
    gap: 0.35rem;
    flex-wrap: wrap;
  }

  .tag {
    background: #f1f5f9;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    color: #475569;
  }
</style>`
		},
		{
			name: 'Listing.svelte',
			path: '/Listing.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { blogStore } from './store.ts';
  import PostCard from './PostCard.svelte';

  let activeTag = $state<string | null>(null);
  let searchQuery = $state('');
  let currentPage = $state(1);
  const PAGE_SIZE = 4;

  let allTags = $derived([...new Set(blogStore.posts.flatMap(p => p.tags))]);

  let filteredPosts = $derived(
    activeTag ? blogStore.posts.filter(p => p.tags.includes(activeTag!)) : blogStore.posts
  );

  let searchedPosts = $derived(
    filteredPosts.filter(p =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  let totalPages = $derived(Math.max(1, Math.ceil(searchedPosts.length / PAGE_SIZE)));

  let paginatedPosts = $derived(
    searchedPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  );

  $effect(() => {
    activeTag;
    searchQuery;
    currentPage = 1;
  });
</script>

<div class="listing">
  <input
    class="search"
    bind:value={searchQuery}
    placeholder="Search posts..."
  />

  <div class="tag-cloud">
    <button
      class="tag-btn"
      class:active={activeTag === null}
      onclick={() => activeTag = null}
    >All</button>
    {#each allTags as tag}
      <button
        class="tag-btn"
        class:active={activeTag === tag}
        onclick={() => activeTag = tag}
      >{tag}</button>
    {/each}
  </div>

  <div class="grid">
    {#each paginatedPosts as post (post.id)}
      <PostCard {post} />
    {/each}
  </div>

  {#if searchedPosts.length === 0}
    <p class="empty">No posts found matching your criteria.</p>
  {/if}

  <div class="pagination">
    <button onclick={() => currentPage--} disabled={currentPage === 1}>Previous</button>
    <span>Page {currentPage} of {totalPages}</span>
    <button onclick={() => currentPage++} disabled={currentPage >= totalPages}>Next</button>
  </div>
</div>

<style>
  .listing {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .search {
    padding: 0.625rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 0.95rem;
    width: 100%;
    box-sizing: border-box;
  }

  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  .tag-btn {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 0.3rem 0.75rem;
    font-size: 0.8rem;
    cursor: pointer;
    color: #475569;
  }

  .tag-btn.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .empty {
    text-align: center;
    color: #94a3b8;
    padding: 2rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  .pagination button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .pagination button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .pagination span {
    color: #64748b;
    font-size: 0.875rem;
  }
</style>`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Listing from './Listing.svelte';
  import { blogStore } from './store.ts';
  import type { BlogPost } from './types';

  const seeds: BlogPost[] = [
    { id: '1', title: 'Getting Started with Svelte 5', slug: 'svelte-5', excerpt: 'Learn the basics of Svelte 5 and runes.', body: 'Full body here...', author: 'Alice', publishedAt: '2025-11-01', tags: ['svelte', 'tutorial'] },
    { id: '2', title: 'Advanced Reactivity Patterns', slug: 'reactivity', excerpt: 'Deep dive into $derived and $effect.', body: 'Full body here...', author: 'Bob', publishedAt: '2025-11-10', tags: ['svelte', 'advanced'] },
    { id: '3', title: 'CSS Grid Mastery', slug: 'css-grid', excerpt: 'Build responsive layouts with CSS Grid.', body: 'Full body here...', author: 'Alice', publishedAt: '2025-11-15', tags: ['css', 'layout'] },
    { id: '4', title: 'TypeScript Tips for Svelte', slug: 'ts-svelte', excerpt: 'TypeScript patterns that work great with Svelte.', body: 'Full body here...', author: 'Charlie', publishedAt: '2025-11-20', tags: ['typescript', 'svelte'] },
    { id: '5', title: 'State Management Deep Dive', slug: 'state-mgmt', excerpt: 'Managing complex state in Svelte 5 apps.', body: 'Full body here...', author: 'Bob', publishedAt: '2025-12-01', tags: ['svelte', 'state', 'advanced'] },
    { id: '6', title: 'Building Accessible Components', slug: 'a11y', excerpt: 'How to make your Svelte components accessible.', body: 'Full body here...', author: 'Diana', publishedAt: '2025-12-05', tags: ['a11y', 'svelte'] },
    { id: '7', title: 'Animation Techniques', slug: 'animations', excerpt: 'Smooth transitions and animations in Svelte.', body: 'Full body here...', author: 'Alice', publishedAt: '2025-12-10', tags: ['animation', 'svelte', 'css'] },
  ];
  seeds.forEach(s => blogStore.addPost(s));
</script>

<div class="app">
  <h1>My Blog</h1>
  <Listing />
</div>

<style>
  .app {
    max-width: 1100px;
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
			id: 'cp-listing-card',
			description: 'Complete PostCard component to display post details with $props()',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$props()' },
						{ type: 'contains', value: 'post.title' },
						{ type: 'contains', value: '#each post.tags' }
					]
				}
			},
			hints: [
				'Use `let { post }: { post: BlogPost } = $props();` to accept the post prop.',
				'Render the post title in an `<h2>`, the excerpt in a `<p>`, and iterate over tags with `{#each post.tags as tag}`.',
				'The full component should destructure `post` from `$props()`, then render `{post.title}`, `{post.excerpt}`, `{post.author}`, `{post.publishedAt}`, and `{#each post.tags as tag}<span>{tag}</span>{/each}`.'
			],
			conceptsTested: ['svelte5.components.composition']
		},
		{
			id: 'cp-listing-filter',
			description: 'Implement tag filtering and search using $state and $derived',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'activeTag' },
						{ type: 'contains', value: 'searchQuery' },
						{ type: 'regex', value: '\\$derived.*filter' }
					]
				}
			},
			hints: [
				'Create `let activeTag = $state<string | null>(null)` and `let searchQuery = $state(\'\')` for filter state.',
				'Chain `$derived` values: first filter by tag, then by search query. Each derived value reads from the previous one.',
				'Use `let filteredPosts = $derived(activeTag ? blogStore.posts.filter(p => p.tags.includes(activeTag)) : blogStore.posts)` then `let searchedPosts = $derived(filteredPosts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())))`;'
			],
			conceptsTested: ['svelte5.runes.derived', 'svelte5.runes.state']
		},
		{
			id: 'cp-listing-pagination',
			description: 'Add pagination with page controls and automatic page reset on filter change',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'currentPage' },
						{ type: 'contains', value: 'totalPages' },
						{ type: 'contains', value: '.slice(' }
					]
				}
			},
			hints: [
				'Create `let currentPage = $state(1)` and `let totalPages = $derived(Math.ceil(searchedPosts.length / PAGE_SIZE))`.',
				'Slice the searched posts: `let paginatedPosts = $derived(searchedPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE))`.',
				'Add an `$effect` that reads `activeTag` and `searchQuery` and resets `currentPage = 1` so filters never leave the user on an empty page.'
			],
			conceptsTested: ['svelte5.runes.derived', 'svelte5.control-flow.each']
		}
	]
};
