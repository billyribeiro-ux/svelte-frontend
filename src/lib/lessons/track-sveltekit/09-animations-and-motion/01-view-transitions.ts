import type { Lesson } from '$types/lesson';

export const viewTransitions: Lesson = {
	id: 'sveltekit.animations.view-transitions',
	slug: 'view-transitions',
	title: 'View Transitions API — Native Page Morphing',
	description:
		'Use the browser\'s View Transitions API with onNavigate() to create stunning, native-feeling page morphs, hero image transitions, and shared element animations between routes — zero JavaScript animation libraries required.',
	trackId: 'sveltekit',
	moduleId: 'animations-and-motion',
	order: 1,
	estimatedMinutes: 30,
	concepts: ['sveltekit.navigation.on-navigate', 'sveltekit.view-transitions', 'sveltekit.animations'],
	prerequisites: ['sveltekit.routing.basics', 'sveltekit.load.server'],

	content: [
		{
			type: 'text',
			content: `# View Transitions API — Native Page Morphing

For decades, web page navigation meant an instant, jarring jump from one page to another. Native mobile apps had smooth transitions between screens — the web did not. The **View Transitions API** changes this at the browser level, and SvelteKit makes it trivially easy to use.

## What the View Transitions API Does

When you trigger a view transition, the browser:
1. Takes a **screenshot** of the current state of the page
2. Renders the new state (your new route)
3. Creates a **crossfade animation** between the screenshot and the live new content

By default, this is a simple crossfade. But you can go further — you can name specific elements on both the old and new page, and the browser will animate those elements **individually**, making them appear to morph from their old position/size to their new one. This is called a **shared element transition**.

## Enabling View Transitions in SvelteKit

SvelteKit 2.x supports the View Transitions API through the \`onNavigate\` lifecycle function:

\`\`\`ts
// src/routes/+layout.svelte
<script>
  import { onNavigate } from '$app/navigation';

  onNavigate((navigation) => {
    if (!document.startViewTransition) return; // not supported, skip

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>
\`\`\`

This is all you need for the default crossfade. Put this in your root \`+layout.svelte\` and every SvelteKit navigation will smoothly crossfade.

**How it works:**
1. \`onNavigate\` fires when navigation begins
2. We return a \`Promise\` — SvelteKit waits for this before rendering the new page
3. Inside \`document.startViewTransition\`, we \`resolve()\` immediately (telling the browser to capture the current state) then \`await navigation.complete\` (waiting for the new page to render)
4. The browser animates between the captured state and the new rendered state

## Customising the Default Transition with CSS

The View Transitions API uses CSS pseudo-elements you can target:

\`\`\`css
/* src/app.css */

/* The overall transition duration */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 300ms;
}

/* Slide instead of crossfade */
@keyframes slide-from-right {
  from { transform: translateX(100%); }
}
@keyframes slide-to-left {
  to { transform: translateX(-100%); }
}

::view-transition-old(root) {
  animation-name: slide-to-left;
}
::view-transition-new(root) {
  animation-name: slide-from-right;
}
\`\`\`

## Shared Element Transitions — The Magic

The true power of View Transitions is animating **specific elements** between pages. To do this, give the element a \`view-transition-name\` CSS property:

\`\`\`svelte
<!-- /blog — list page -->
{#each posts as post}
  <a href="/blog/{post.slug}">
    <img
      src={post.thumbnail}
      alt={post.title}
      style="view-transition-name: post-img-{post.slug}"
    />
    <h2>{post.title}</h2>
  </a>
{/each}
\`\`\`

\`\`\`svelte
<!-- /blog/[slug] — detail page -->
<img
  src={post.thumbnail}
  alt={post.title}
  style="view-transition-name: post-img-{post.slug}"
/>
<h1>{post.title}</h1>
\`\`\`

When you navigate from the list to the detail page, the browser **morphs** the thumbnail from its small position in the list to the full-width hero on the detail page. This is exactly how native iOS and Android apps animate between a list and a detail view.

**Critical rule:** \`view-transition-name\` must be **unique on the page**. If two elements have the same name, the transition will be skipped. That is why we append \`{post.slug}\` — each post's image has a unique name.

## Direction-Aware Transitions

You can make transitions directional based on navigation (forward = slide right, back = slide left):

\`\`\`svelte
<script>
  import { onNavigate } from '$app/navigation';

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    // Determine navigation direction
    const direction = navigation.delta > 0 ? 'forward' : 'back';
    document.documentElement.dataset.navDirection = direction;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
        // Clean up data attribute after transition
        delete document.documentElement.dataset.navDirection;
      });
    });
  });
</script>
\`\`\`

\`\`\`css
/* Different animations based on direction */
:root[data-nav-direction="forward"] ::view-transition-old(root) {
  animation-name: slide-to-left;
}
:root[data-nav-direction="forward"] ::view-transition-new(root) {
  animation-name: slide-from-right;
}
:root[data-nav-direction="back"] ::view-transition-old(root) {
  animation-name: slide-to-right;
}
:root[data-nav-direction="back"] ::view-transition-new(root) {
  animation-name: slide-from-left;
}
\`\`\`

## Reducing Motion Support

Always respect user preferences:

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
\`\`\`

## Browser Support

The View Transitions API (Level 1 — same-document transitions) is supported in Chrome 111+, Edge 111+, and Safari 18+. Firefox support is in development. Always check \`document.startViewTransition\` before using it — SvelteKit's recommended pattern (shown above) handles unsupported browsers gracefully by returning early.`
		},
		{
			type: 'checkpoint',
			content: 'cp-view-transition-basic'
		},
		{
			type: 'checkpoint',
			content: 'cp-view-transition-shared'
		}
	],

	starterFiles: [
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script>
  import { onNavigate } from '$app/navigation';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  // TODO: Implement view transitions using onNavigate
  // 1. Call onNavigate with a callback
  // 2. Check if document.startViewTransition exists
  // 3. Return a Promise that resolves after navigation.complete
</script>

{@render children()}

<style>
  /* TODO: Customise the default crossfade animation */
  /* Make it 400ms and use a slide-from-right effect */
</style>`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script>
  const posts = [
    { slug: 'svelte-5-runes', title: 'Svelte 5 Runes Deep Dive', img: '🟠', date: 'Apr 1, 2026' },
    { slug: 'sveltekit-streaming', title: 'Streaming with SvelteKit', img: '🔵', date: 'Mar 28, 2026' },
    { slug: 'view-transitions', title: 'View Transitions API', img: '🟣', date: 'Mar 20, 2026' },
  ];
</script>

<div class="blog-list">
  <h1>Blog</h1>
  {#each posts as post (post.slug)}
    <a href="/post/{post.slug}" class="post-card">
      <!-- TODO: Add view-transition-name to this element so it morphs to the detail page -->
      <div class="post-thumb">{post.img}</div>
      <div class="post-info">
        <h2>{post.title}</h2>
        <p>{post.date}</p>
      </div>
    </a>
  {/each}
</div>

<style>
  .blog-list { max-width: 600px; margin: 2rem auto; font-family: system-ui, sans-serif; padding: 0 1rem; }
  h1 { font-size: 2rem; margin-bottom: 1.5rem; }
  .post-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; text-decoration: none; color: inherit; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; }
  .post-card:hover { border-color: #6366f1; background: #f5f3ff; }
  .post-thumb { font-size: 2.5rem; inline-size: 64px; text-align: center; }
  .post-info h2 { margin: 0; font-size: 1rem; }
  .post-info p { margin: 0.25rem 0 0; font-size: 0.875rem; color: #94a3b8; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: '+layout.svelte',
			path: '/+layout.svelte',
			language: 'svelte',
			content: `<script>
  import { onNavigate } from '$app/navigation';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

{@render children()}

<style>
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slide-from-right {
    from { transform: translateX(30px); opacity: 0; }
  }
  @keyframes slide-to-left {
    to { transform: translateX(-30px); opacity: 0; }
  }

  ::view-transition-old(root) {
    animation-name: slide-to-left;
  }
  ::view-transition-new(root) {
    animation-name: slide-from-right;
  }

  @media (prefers-reduced-motion: reduce) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation: none !important;
    }
  }
</style>`
		},
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script>
  const posts = [
    { slug: 'svelte-5-runes', title: 'Svelte 5 Runes Deep Dive', img: '🟠', date: 'Apr 1, 2026' },
    { slug: 'sveltekit-streaming', title: 'Streaming with SvelteKit', img: '🔵', date: 'Mar 28, 2026' },
    { slug: 'view-transitions', title: 'View Transitions API', img: '🟣', date: 'Mar 20, 2026' },
  ];
</script>

<div class="blog-list">
  <h1>Blog</h1>
  {#each posts as post (post.slug)}
    <a href="/post/{post.slug}" class="post-card">
      <div
        class="post-thumb"
        style="view-transition-name: post-thumb-{post.slug}"
      >
        {post.img}
      </div>
      <div class="post-info">
        <h2 style="view-transition-name: post-title-{post.slug}">{post.title}</h2>
        <p>{post.date}</p>
      </div>
    </a>
  {/each}
</div>

<style>
  .blog-list { max-width: 600px; margin: 2rem auto; font-family: system-ui, sans-serif; padding: 0 1rem; }
  h1 { font-size: 2rem; margin-bottom: 1.5rem; }
  .post-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; text-decoration: none; color: inherit; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.75rem; transition: border-color 0.2s; }
  .post-card:hover { border-color: #6366f1; background: #f5f3ff; }
  .post-thumb { font-size: 2.5rem; inline-size: 64px; text-align: center; }
  .post-info h2 { margin: 0; font-size: 1rem; }
  .post-info p { margin: 0.25rem 0 0; font-size: 0.875rem; color: #94a3b8; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-view-transition-basic',
			description: 'Implement onNavigate to enable View Transitions for all page navigation',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'onNavigate' },
						{ type: 'contains', value: 'startViewTransition' },
						{ type: 'contains', value: 'navigation.complete' }
					]
				}
			},
			hints: [
				'Call `onNavigate()` in your layout\'s `<script>` — it fires before each navigation.',
				'Check `if (!document.startViewTransition) return` for graceful degradation.',
				'Return a `new Promise(resolve => { document.startViewTransition(async () => { resolve(); await navigation.complete; }) })`.'
			],
			conceptsTested: ['sveltekit.navigation.on-navigate', 'sveltekit.view-transitions']
		},
		{
			id: 'cp-view-transition-shared',
			description: 'Add view-transition-name to list items for shared element transitions',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'view-transition-name' },
						{ type: 'contains', value: 'post.slug' }
					]
				}
			},
			hints: [
				'Add `style="view-transition-name: post-thumb-{post.slug}"` to the thumbnail element.',
				'The same `view-transition-name` must appear on the corresponding element on the detail page.',
				'Each name must be unique on the page — always include a dynamic ID (like `post.slug`) in the name.'
			],
			conceptsTested: ['sveltekit.view-transitions', 'sveltekit.animations']
		}
	]
};
