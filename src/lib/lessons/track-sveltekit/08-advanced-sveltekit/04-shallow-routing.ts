import type { Lesson } from '$types/lesson';

export const shallowRouting: Lesson = {
	id: 'sveltekit.advanced-sveltekit.shallow-routing',
	slug: 'shallow-routing',
	title: 'Shallow Routing & Modals',
	description: 'Update the URL without full navigation using pushState and replaceState for modals, galleries, and overlays.',
	trackId: 'sveltekit',
	moduleId: 'advanced-sveltekit',
	order: 4,
	estimatedMinutes: 18,
	concepts: ['sveltekit.advanced.shallow-routing', 'sveltekit.advanced.page-state'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Shallow Routing & Modals

## The Problem: Modals That Break URLs

Picture a common UI pattern: a photo gallery. The user clicks a thumbnail and a modal opens showing the full image. This works fine visually, but there are fundamental UX problems lurking beneath the surface:

- **No shareable URL.** If the user copies the URL while the modal is open, the link leads to the gallery page, not the specific photo. They cannot share what they are looking at.
- **Back button confusion.** Pressing back navigates away from the entire gallery instead of closing the modal. This violates user expectations -- the modal feels like a "step forward" in their mental model, so back should undo it.
- **No deep linking.** External links or bookmarks cannot target a specific modal state. Search engines cannot index individual photo pages that only exist as modals.
- **Accessibility breakage.** Screen readers and assistive technologies rely on URL changes to announce navigation. A modal that does not update the URL is invisible to the browser's navigation model.

## Why URL-Driven Modals Matter

URL-driven modals are not just a developer convenience. They address fundamental web platform expectations that users have internalized over decades of browsing:

**Shareability.** The URL is the web's universal sharing mechanism. When a user sees something interesting in a modal and copies the URL to send to a colleague, they expect the recipient to see the same thing. Without URL-driven modals, shared links open the base page with no modal -- the user has no way to link to specific content.

**Browser history integration.** Users expect the back button to undo their last action. Opening a modal feels like navigation -- the screen changed, new content appeared. If back does not close the modal but instead navigates away from the page entirely, the user loses their context (scroll position, any state on the underlying page).

**Accessibility.** Screen readers announce URL changes as navigation events. A modal that updates the URL properly integrates with assistive technology. The user knows they have "gone somewhere" and can go "back." Without the URL change, the modal is a visual-only state change that screen reader users may not notice or may not be able to undo via standard navigation.

**SEO and indexability.** Search engines can index individual items that have URLs. A photo gallery where each photo has a URL (/gallery/sunset, /gallery/mountains) gets individual search results. A gallery where photos only exist as JavaScript-managed modals gets one search result for the entire gallery page.

The naive solution is to make each photo a separate route (\`/gallery/photo-1\`, \`/gallery/photo-2\`). But full SvelteKit navigations tear down the current page component, run new load functions, and render a completely new page. The gallery disappears. The scroll position resets. The smooth overlay experience is gone.

What we need is a way to **update the URL without triggering full navigation** -- keeping the current page alive while reflecting new state in the address bar. This is shallow routing.

## What Shallow Routing Is

Shallow routing lets you change the browser URL and push history entries without SvelteKit performing a full navigation. The current page component stays mounted. No load functions re-run. No component tree teardown. The URL changes, the history stack updates, and you control what happens in the UI through reactive state.

SvelteKit provides two functions from \`$app/navigation\` for this:

**\`pushState(url, state)\`** -- Pushes a new entry onto the browser history stack. The URL in the address bar changes. Pressing back returns to the previous entry.

**\`replaceState(url, state)\`** -- Replaces the current history entry. The URL changes but no new entry is added. Pressing back skips over the replaced entry.

Both functions accept:
1. A URL string (or empty string to keep the current URL)
2. A state object that you define -- this is arbitrary data attached to the history entry

\`\`\`typescript
import { pushState, replaceState } from '$app/navigation';

// Push new history entry with state
pushState('/gallery/photo-3', { showModal: true, photoId: 'photo-3' });

// Replace current entry (no new history)
replaceState('/gallery/photo-3', { showModal: true, photoId: 'photo-3' });
\`\`\`

## pushState vs replaceState: When Each Is Correct

The choice between pushState and replaceState determines back-button behavior, which directly affects user experience:

**Use pushState when the state change feels like navigation:**
- Opening a modal or overlay (user expects back to close it)
- Selecting an item in a list/grid (user expects back to deselect)
- Opening a settings panel, detail view, or sidebar

**Use replaceState when the state change is a refinement:**
- Changing sort order within a modal (back should close the modal, not revert the sort)
- Updating filter criteria while a modal is open
- Correcting or updating state that should not create a new history entry

A practical example of the distinction:

\`\`\`typescript
// Opening a photo modal -- this IS navigation
pushState(\`/gallery/\${photo.slug}\`, { showPhoto: true, selectedPhoto: photo });

// User clicks "next photo" within the modal -- also navigation
pushState(\`/gallery/\${nextPhoto.slug}\`, { showPhoto: true, selectedPhoto: nextPhoto });

// User changes display size within the modal -- this is a refinement
replaceState(\`/gallery/\${photo.slug}?size=large\`, {
  showPhoto: true,
  selectedPhoto: photo,
  displaySize: 'large'
});
\`\`\`

With this setup, pressing back from the "next photo" state returns to the first photo's modal. Pressing back again closes the modal entirely. The display size change does not add a history entry, so back does not cycle through size changes.

## Reading Shallow State with page.state

When you push or replace state, you read it back through the \`page\` object from \`$app/state\`:

\`\`\`svelte
<script lang="ts">
  import { page } from '$app/state';
</script>

{#if page.state.showModal}
  <div class="modal-overlay">
    <PhotoDetail photoId={page.state.photoId} />
  </div>
{/if}
\`\`\`

The \`page.state\` object is reactive. When the user navigates back (popping the history entry), \`page.state\` reverts to the previous entry's state. If the previous entry had no shallow state, \`page.state\` becomes an empty object. This means your modal automatically closes when the user presses back -- exactly the behavior they expect.

**Critical detail:** \`page.state\` is only populated for shallow navigations on the current page. If the user directly navigates to \`/gallery/photo-3\` (e.g., by typing the URL or following a link), \`page.state\` is empty because there was no shallow push. You must handle this case -- more on this below.

## TypeScript Typing with App.PageState

For type safety, SvelteKit lets you declare the shape of your page state through the \`App.PageState\` interface in \`src/app.d.ts\`:

\`\`\`typescript
// src/app.d.ts
declare global {
  namespace App {
    interface PageState {
      showPhoto?: boolean;
      selectedPhoto?: {
        id: string;
        slug: string;
        title: string;
        fullUrl: string;
      };
      activePanel?: string;
    }
  }
}

export {};
\`\`\`

Once declared, \`page.state\` is fully typed throughout your application. The \`pushState\` and \`replaceState\` functions will type-check their state arguments against \`App.PageState\`:

\`\`\`typescript
// TypeScript now validates this:
pushState('/gallery/sunset', {
  showPhoto: true,
  selectedPhoto: {
    id: 'photo-1',
    slug: 'sunset',
    title: 'Sunset',
    fullUrl: '/photos/sunset.jpg'
  }
});

// TypeScript error: 'unknownProp' does not exist on App.PageState
pushState('/gallery/sunset', { unknownProp: true });
\`\`\`

This typing is especially valuable in larger applications where multiple pages use shallow routing for different purposes. The \`App.PageState\` interface serves as documentation of all possible shallow state shapes across the entire app.`
		},
		{
			type: 'text',
			content: `## Pattern: Image Gallery with Shareable URLs

Here is the full pattern for a photo gallery where clicking a thumbnail opens a modal and updates the URL:

\`\`\`svelte
<!-- +page.svelte (the gallery page at /gallery) -->
<script lang="ts">
  import { pushState, goto } from '$app/navigation';
  import { page } from '$app/state';
  import PhotoModal from './PhotoModal.svelte';

  let { data } = $props();

  function openPhoto(photo: Photo) {
    // If JavaScript is available, use shallow routing
    pushState(\`/gallery/\${photo.slug}\`, {
      showPhoto: true,
      selectedPhoto: photo
    });
  }

  function closeModal() {
    // Go back to the gallery URL, removing modal state
    history.back();
  }
</script>

<h1>Photo Gallery</h1>

<div class="grid">
  {#each data.photos as photo}
    <a
      href="/gallery/{photo.slug}"
      onclick={(e) => {
        // Prevent default link navigation
        e.preventDefault();
        openPhoto(photo);
      }}
    >
      <img src={photo.thumbnailUrl} alt={photo.title} />
    </a>
  {/each}
</div>

{#if page.state.showPhoto}
  <PhotoModal
    photo={page.state.selectedPhoto}
    onclose={closeModal}
  />
{/if}
\`\`\`

Notice the \`<a href>\` element. This is critical for progressive enhancement. If JavaScript fails to load or is disabled, the link works as a normal navigation to \`/gallery/photo-3\`, which should be a real route with its own \`+page.svelte\`. When JavaScript is available, \`onclick\` prevents default and uses shallow routing instead.

## Using preloadData for Instant Modal Content

When you use shallow routing, load functions do not run because there is no full navigation. But sometimes you need data that would normally come from a route's load function. SvelteKit provides \`preloadData\` for this:

\`\`\`svelte
<script lang="ts">
  import { pushState, preloadData, goto } from '$app/navigation';
  import { page } from '$app/state';

  async function openPhoto(photo: Photo) {
    const href = \`/gallery/\${photo.slug}\`;

    // Preload the data that /gallery/[slug] would load
    const result = await preloadData(href);

    if (result.type === 'loaded' && result.status === 200) {
      pushState(href, {
        showPhoto: true,
        photoData: result.data
      });
    } else {
      // Preload failed, fall back to full navigation
      goto(href);
    }
  }
</script>
\`\`\`

\`preloadData\` calls the target route's load function and returns the data without navigating. You then attach that data to the shallow state. This means the modal has the exact same data it would have as a full page, and you loaded it without a full navigation.

**Why this matters for perceived performance:** You can call \`preloadData\` on hover or on tap-start, giving the data a head start before the user actually clicks. By the time the click fires, the data is already cached.

\`\`\`svelte
<!-- Preload on hover for instant modal opening -->
<a
  href="/gallery/{photo.slug}"
  onmouseenter={() => preloadData(\`/gallery/\${photo.slug}\`)}
  onclick={(e) => {
    e.preventDefault();
    openPhoto(photo);
  }}
>
  <img src={photo.thumbnailUrl} alt={photo.title} />
</a>
\`\`\`

With hover-triggered preloading, the data is fetched 200-300ms before the click. By the time the user clicks, the data is already in memory. The modal opens instantly with full content -- no loading spinners, no skeleton screens.

## Handling Server-Side Fallback (Direct Navigation)

Shallow routing only works when the user is already on the page and JavaScript is active. For direct navigation (typing the URL, bookmarks, shared links, SSR), you need a real route:

\`\`\`
src/routes/gallery/
  +page.svelte          <-- the gallery with shallow routing
  [slug]/
    +page.svelte        <-- full page for direct navigation
    +page.server.ts     <-- load function for photo data
\`\`\`

The \`[slug]/+page.svelte\` renders the photo as a full page. The gallery's \`+page.svelte\` renders it as a modal overlay. Same URL, two rendering paths, optimal UX in both cases.

What happens in each scenario:

**User clicks thumbnail in gallery (JS available):**
1. \`pushState('/gallery/sunset', { showPhoto: true, ... })\` fires
2. URL changes to \`/gallery/sunset\`
3. Gallery page stays mounted, modal opens via \`{#if page.state.showPhoto}\`
4. No load function runs, no page teardown

**User navigates directly to \`/gallery/sunset\` (bookmark, shared link, SSR):**
1. SvelteKit matches the \`[slug]\` route
2. \`+page.server.ts\` load function runs
3. \`[slug]/+page.svelte\` renders as a full page
4. \`page.state\` is empty (no shallow push happened)
5. The user sees the photo as a standalone page

**User navigates directly, then clicks "back to gallery":**
1. Full navigation to \`/gallery\`
2. Gallery page loads normally
3. From here, thumbnails use shallow routing as normal

This dual-path approach is the gold standard for URL-driven modals. Every URL works regardless of how the user reaches it.`
		},
		{
			type: 'text',
			content: `## Pattern: Modal Dialogs Backed by URL State

The gallery pattern extends to any modal that should be URL-addressable. Consider a settings page with modal panels:

\`\`\`svelte
<script lang="ts">
  import { pushState } from '$app/navigation';
  import { page } from '$app/state';

  function openPanel(panel: string) {
    pushState(\`/settings/\${panel}\`, { activePanel: panel });
  }
</script>

<nav>
  <button onclick={() => openPanel('profile')}>Profile</button>
  <button onclick={() => openPanel('security')}>Security</button>
  <button onclick={() => openPanel('notifications')}>Notifications</button>
</nav>

{#if page.state.activePanel === 'profile'}
  <ProfilePanel onclose={() => history.back()} />
{:else if page.state.activePanel === 'security'}
  <SecurityPanel onclose={() => history.back()} />
{:else if page.state.activePanel === 'notifications'}
  <NotificationsPanel onclose={() => history.back()} />
{/if}
\`\`\`

Each panel gets its own URL. Back closes the panel. Forward reopens it. The URL is shareable. All without tearing down and rebuilding the settings page.

## Nested Shallow Routes: Modals Within Modals

In complex UIs, you may need modals that open other modals. Consider a photo gallery where clicking a photo opens a detail modal, and within that modal there is a "view comments" button that opens a comments panel. Both should be URL-driven.

The approach uses multiple pushState calls that stack on the history:

\`\`\`typescript
// Open photo detail
pushState(\`/gallery/\${photo.slug}\`, {
  showPhoto: true,
  selectedPhoto: photo
});

// Then open comments panel (stacks on top)
pushState(\`/gallery/\${photo.slug}/comments\`, {
  showPhoto: true,
  selectedPhoto: photo,
  showComments: true
});
\`\`\`

Back from the comments panel returns to the photo detail (comments close, photo stays open). Back again returns to the gallery (photo modal closes).

\`\`\`svelte
{#if page.state.showPhoto}
  <div class="modal-overlay">
    <PhotoDetail
      photo={page.state.selectedPhoto}
      onclose={() => history.back()}
    >
      {#if page.state.showComments}
        <CommentsPanel
          photoId={page.state.selectedPhoto.id}
          onclose={() => history.back()}
        />
      {:else}
        <button onclick={() => {
          pushState(
            \`/gallery/\${page.state.selectedPhoto.slug}/comments\`,
            { ...page.state, showComments: true }
          );
        }}>
          View Comments
        </button>
      {/if}
    </PhotoDetail>
  </div>
{/if}
\`\`\`

The key is spreading the existing state (\`...page.state\`) when pushing nested states. This preserves the parent modal's state while adding the child's state on top. Each \`history.back()\` peels off one layer.

## Exit Animations and Cleanup

When the user presses back and the shallow state pops, your modal disappears because \`page.state\` changes and the \`{#if}\` block removes the modal from the DOM. But what if you want an exit animation -- a fade-out, a slide-down, or a scale transition?

The challenge is that \`page.state\` changes instantly on popstate, so the \`{#if}\` block removes the element immediately. To animate the exit, you need to delay the removal:

\`\`\`svelte
<script lang="ts">
  import { page } from '$app/state';

  // Track both the current state and a "visible" flag for animation
  let modalVisible = $state(false);
  let modalPhoto = $state<Photo | null>(null);

  // Sync shallow state to local state with animation delay
  $effect(() => {
    if (page.state.showPhoto) {
      modalPhoto = page.state.selectedPhoto;
      modalVisible = true;
    } else {
      modalVisible = false;
      // Delay clearing data until animation completes
      setTimeout(() => {
        if (!modalVisible) modalPhoto = null;
      }, 300); // Match CSS transition duration
    }
  });
</script>

{#if modalPhoto}
  <div
    class={["modal-overlay", modalVisible && "visible"]}
    onclick={() => history.back()}
  >
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <h2>{modalPhoto.title}</h2>
      <img src={modalPhoto.fullUrl} alt={modalPhoto.title} />
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    opacity: 0;
    transition: opacity 0.3s ease;
    /* ... positioning styles ... */
  }
  .modal-overlay.visible {
    opacity: 1;
  }
</style>
\`\`\`

Alternatively, use Svelte's built-in transition directives for cleaner animation handling:

\`\`\`svelte
{#if page.state.showPhoto}
  <div class="modal-overlay" transition:fade={{ duration: 300 }}>
    <!-- modal content -->
  </div>
{/if}
\`\`\`

Svelte transitions handle the exit delay automatically -- the element stays in the DOM until the out-transition completes, even though the \`{#if}\` condition has already become false.

## State Serialization Rules

The state object passed to \`pushState\` and \`replaceState\` must be serializable with \`devalue\` (the same library SvelteKit uses for load function data). This means you can use:

- Primitives (strings, numbers, booleans, null, undefined)
- Plain objects and arrays
- Date, Map, Set, RegExp, BigInt
- Cyclic references and repeated references

You **cannot** use:
- Class instances (they lose their prototype)
- Functions
- DOM elements
- Symbols

Keep state objects lean. Store IDs and flags rather than large data blobs. If you need complex data, use \`preloadData\` and store only the result.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.advanced.shallow-routing'
		},
		{
			type: 'text',
			content: `## Exercise: Build a Photo Gallery with Shallow Routing

You will build a photo gallery where clicking a thumbnail opens a modal overlay. The URL updates to reflect the selected photo, the back button closes the modal, and direct navigation to a photo URL still works. The gallery should support keyboard navigation (Escape to close) and use proper \`<a>\` elements for progressive enhancement.

**Your task:**
1. Render the photo grid from the provided data
2. Use \`pushState\` to open a modal when a photo is clicked
3. Read \`page.state\` to conditionally render the modal
4. Close the modal by calling \`history.back()\`
5. Add keyboard support: close on Escape key press`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Adding preloadData for Rich Modals

Now enhance the gallery so that clicking a photo preloads the data from the photo's dedicated route before opening the modal. This ensures the modal has full photo details (description, EXIF data, comments) without a full page navigation.

**Task:** Use \`preloadData\` to fetch the target route's data, then attach it to the shallow state. Add hover-based preloading so the data is ready before the user clicks.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Adding Next/Previous Navigation Within the Modal

Enhance the modal to include next and previous buttons that use \`pushState\` to navigate between photos without closing the modal. Each photo change should update the URL so that sharing the URL at any point shows the current photo.

**Task:** Add next/previous buttons inside the modal that call \`pushState\` with the adjacent photo's data. Ensure back-button navigation walks through each viewed photo in order.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'xray-prompt',
			content: `Explain why shallow routing requires a fallback route for the same URL pattern. What happens when a user directly navigates to a shallow-routed URL without JavaScript? How does the combination of \`<a href>\` with \`onclick\` + \`preventDefault\` provide progressive enhancement? How do you handle exit animations when shallow state pops?`
		},
		{
			type: 'text',
			content: `## Summary

Shallow routing bridges the gap between modal UX and URL-driven navigation. With \`pushState\` and \`replaceState\`, you update the URL and history stack without a full navigation. With \`page.state\`, you reactively control what the UI shows. With \`preloadData\`, you bring route-level data into modals. Type your state with \`App.PageState\` for full TypeScript safety. Handle nested modals by stacking pushState calls and spreading existing state. Support exit animations with Svelte transitions or manual visibility tracking. Always provide a fallback route for direct navigation so every URL works regardless of how the user reaches it. The result is a pattern where modals are URL-shareable, back-button friendly, and progressively enhanced -- the holy grail of modern web UI.`
		}
	],

	starterFiles: [
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import pushState from $app/navigation
  // TODO: Import page from $app/state

  const photos = [
    { id: 'photo-1', slug: 'sunset', title: 'Sunset', thumbnailUrl: '/thumbs/sunset.jpg', fullUrl: '/photos/sunset.jpg' },
    { id: 'photo-2', slug: 'mountains', title: 'Mountains', thumbnailUrl: '/thumbs/mountains.jpg', fullUrl: '/photos/mountains.jpg' },
    { id: 'photo-3', slug: 'ocean', title: 'Ocean', thumbnailUrl: '/thumbs/ocean.jpg', fullUrl: '/photos/ocean.jpg' },
    { id: 'photo-4', slug: 'forest', title: 'Forest', thumbnailUrl: '/thumbs/forest.jpg', fullUrl: '/photos/forest.jpg' }
  ];

  // TODO: Create an openPhoto function that uses pushState
  // TODO: Create a closeModal function
  // TODO: Add keyboard handler for Escape key
</script>

<h1>Photo Gallery</h1>

<div class="grid">
  {#each photos as photo}
    <!-- TODO: Make each photo clickable with shallow routing -->
    <div class="photo-card">
      <img src={photo.thumbnailUrl} alt={photo.title} />
      <p>{photo.title}</p>
    </div>
  {/each}
</div>

<!-- TODO: Show modal when page.state.showPhoto is true -->
<!-- TODO: Add next/previous navigation inside the modal -->

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .photo-card {
    cursor: pointer;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 600px;
    width: 90%;
  }
  .modal-nav {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: '+page.svelte',
			path: '/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { pushState } from '$app/navigation';
  import { page } from '$app/state';

  const photos = [
    { id: 'photo-1', slug: 'sunset', title: 'Sunset', thumbnailUrl: '/thumbs/sunset.jpg', fullUrl: '/photos/sunset.jpg' },
    { id: 'photo-2', slug: 'mountains', title: 'Mountains', thumbnailUrl: '/thumbs/mountains.jpg', fullUrl: '/photos/mountains.jpg' },
    { id: 'photo-3', slug: 'ocean', title: 'Ocean', thumbnailUrl: '/thumbs/ocean.jpg', fullUrl: '/photos/ocean.jpg' },
    { id: 'photo-4', slug: 'forest', title: 'Forest', thumbnailUrl: '/thumbs/forest.jpg', fullUrl: '/photos/forest.jpg' }
  ];

  function openPhoto(photo: typeof photos[0]) {
    pushState(\`/gallery/\${photo.slug}\`, {
      showPhoto: true,
      selectedPhoto: photo
    });
  }

  function closeModal() {
    history.back();
  }

  function navigatePhoto(direction: 'next' | 'prev') {
    const currentIndex = photos.findIndex(
      (p) => p.id === page.state.selectedPhoto?.id
    );
    const nextIndex = direction === 'next'
      ? (currentIndex + 1) % photos.length
      : (currentIndex - 1 + photos.length) % photos.length;
    const nextPhoto = photos[nextIndex];
    pushState(\`/gallery/\${nextPhoto.slug}\`, {
      showPhoto: true,
      selectedPhoto: nextPhoto
    });
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!page.state.showPhoto) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') navigatePhoto('next');
    if (e.key === 'ArrowLeft') navigatePhoto('prev');
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<h1>Photo Gallery</h1>

<div class="grid">
  {#each photos as photo}
    <a
      href="/gallery/{photo.slug}"
      onclick={(e) => {
        e.preventDefault();
        openPhoto(photo);
      }}
    >
      <div class="photo-card">
        <img src={photo.thumbnailUrl} alt={photo.title} />
        <p>{photo.title}</p>
      </div>
    </a>
  {/each}
</div>

{#if page.state.showPhoto}
  <div class="modal-overlay" onclick={closeModal} role="dialog">
    <div class="modal-content" onclick={(e) => e.stopPropagation()}>
      <button onclick={closeModal}>Close</button>
      <h2>{page.state.selectedPhoto.title}</h2>
      <img src={page.state.selectedPhoto.fullUrl} alt={page.state.selectedPhoto.title} style="width:100%" />
      <div class="modal-nav">
        <button onclick={() => navigatePhoto('prev')}>Previous</button>
        <button onclick={() => navigatePhoto('next')}>Next</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .photo-card {
    cursor: pointer;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 600px;
    width: 90%;
  }
  .modal-nav {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Implement shallow routing to open a photo modal with URL update',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'pushState' },
						{ type: 'contains', value: 'page.state' }
					]
				}
			},
			hints: [
				'Import `pushState` from `$app/navigation` and `page` from `$app/state`.',
				'Call `pushState(url, { showPhoto: true, selectedPhoto: photo })` when a photo is clicked.',
				'Use `{#if page.state.showPhoto}` to conditionally render the modal overlay.'
			],
			conceptsTested: ['sveltekit.advanced.shallow-routing']
		},
		{
			id: 'cp-2',
			description: 'Use preloadData to fetch route data before opening the modal',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'preloadData' },
						{ type: 'contains', value: 'pushState' }
					]
				}
			},
			hints: [
				'Import `preloadData` from `$app/navigation` alongside `pushState`.',
				'Call `const result = await preloadData(href)` before `pushState`.',
				'Check `result.type === "loaded"` and pass `result.data` into the shallow state object.'
			],
			conceptsTested: ['sveltekit.advanced.page-state']
		},
		{
			id: 'cp-3',
			description: 'Add next/previous navigation within the modal using pushState',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'navigatePhoto' },
						{ type: 'contains', value: 'pushState' }
					]
				}
			},
			hints: [
				'Create a `navigatePhoto` function that finds the current photo index and calculates the next/previous index.',
				'Call `pushState` with the new photo data so the URL updates and back-button works correctly.',
				'Use modulo arithmetic to wrap around: `(currentIndex + 1) % photos.length`.'
			],
			conceptsTested: ['sveltekit.advanced.shallow-routing']
		}
	]
};
