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

## Pattern: Image Gallery with Shareable URLs

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

## Pattern: Modal Dialogs Backed by URL State

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

## Using preloadData for Instant Modal Content

When you use shallow routing, load functions do not run because there is no full navigation. But sometimes you need data that would normally come from a route's load function. SvelteKit provides \`preloadData\` for this:

\`\`\`svelte
<script lang="ts">
  import { pushState, preloadData } from '$app/navigation';
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

## Handling Direct Navigation (The Fallback Route)

Shallow routing only works when the user is already on the page and JavaScript is active. For direct navigation (typing the URL, bookmarks, shared links, SSR), you need a real route:

\`\`\`
src/routes/gallery/
  +page.svelte          ← the gallery with shallow routing
  [slug]/
    +page.svelte        ← full page for direct navigation
    +page.server.ts     ← load function for photo data
\`\`\`

The \`[slug]/+page.svelte\` renders the photo as a full page. The gallery's \`+page.svelte\` renders it as a modal overlay. Same URL, two rendering paths, optimal UX in both cases.

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

Keep state objects lean. Store IDs and flags rather than large data blobs. If you need complex data, use \`preloadData\` and store only the result.

## replaceState vs pushState: When to Use Each

Use **pushState** when the state change feels like navigation to the user -- opening a modal, switching tabs, selecting an item. The user expects "back" to undo it.

Use **replaceState** when the state change is a refinement of the current view -- updating a filter, changing a sort order, adjusting a slider. The user does not expect "back" to undo minor adjustments.

\`\`\`typescript
// User opened a modal -- this is navigation
pushState('/gallery/photo-3', { showPhoto: true, photoId: 'photo-3' });

// User changed the sort order -- this is a refinement
replaceState('/gallery?sort=date', { sortBy: 'date' });
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.advanced.shallow-routing'
		},
		{
			type: 'text',
			content: `## Exercise: Build a Photo Gallery with Shallow Routing

You will build a photo gallery where clicking a thumbnail opens a modal overlay. The URL updates to reflect the selected photo, the back button closes the modal, and direct navigation to a photo URL still works.

**Your task:**
1. Render the photo grid from the provided data
2. Use \`pushState\` to open a modal when a photo is clicked
3. Read \`page.state\` to conditionally render the modal
4. Close the modal by calling \`history.back()\``
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Adding preloadData for Rich Modals

Now enhance the gallery so that clicking a photo preloads the data from the photo's dedicated route before opening the modal. This ensures the modal has full photo details (description, EXIF data, comments) without a full page navigation.

**Task:** Use \`preloadData\` to fetch the target route's data, then attach it to the shallow state.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `Explain why shallow routing requires a fallback route for the same URL pattern. What happens when a user directly navigates to a shallow-routed URL without JavaScript? How does the combination of \`<a href>\` with \`onclick\` + \`preventDefault\` provide progressive enhancement?`
		},
		{
			type: 'text',
			content: `## Summary

Shallow routing bridges the gap between modal UX and URL-driven navigation. With \`pushState\` and \`replaceState\`, you update the URL and history stack without a full navigation. With \`page.state\`, you reactively control what the UI shows. With \`preloadData\`, you bring route-level data into modals. The result is a pattern where modals are URL-shareable, back-button friendly, and progressively enhanced -- the holy grail of modern web UI.`
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
</script>

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
		}
	]
};
