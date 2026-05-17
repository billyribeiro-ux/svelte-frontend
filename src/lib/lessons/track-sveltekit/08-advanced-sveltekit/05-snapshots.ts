import type { Lesson } from '$types/lesson';

export const snapshots: Lesson = {
	id: 'sveltekit.advanced-sveltekit.snapshots',
	slug: 'snapshots',
	title: 'Preserving State with Snapshots',
	description: 'Use SvelteKit snapshots to preserve ephemeral UI state like form values and scroll positions across navigations.',
	trackId: 'sveltekit',
	moduleId: 'advanced-sveltekit',
	order: 5,
	estimatedMinutes: 15,
	concepts: ['sveltekit.advanced.snapshots', 'sveltekit.advanced.capture-restore'],
	prerequisites: ['sveltekit.loading.server'],

	content: [
		{
			type: 'text',
			content: `# Preserving State with Snapshots

## The State Loss Problem

You are filling out a long form. Three fields deep into a multi-step wizard, you realize you need information from a previous page. You click back. You find the information. You click forward. Every field is empty. Your work is gone.

This is not a bug in any particular framework -- it is the default behavior of the web. When SvelteKit navigates away from a page, the component is destroyed. When you navigate back, a new instance is created from scratch. Component state (\`$state\` variables, bound input values, scroll positions) does not survive this cycle.

## Why Browser Back/Forward Does Not Preserve SPA State

To understand why this happens, you need to understand how browsers and SPAs differ in their handling of navigation history.

In a traditional multi-page application (MPA), the browser manages form state natively. When you press back, the browser restores the previous page from its internal cache (called the "back-forward cache" or bfcache). This cache stores the entire DOM, including form input values, scroll positions, and JavaScript heap. Pressing forward restores the next page the same way. The browser does all of this automatically because it controls the full page lifecycle.

In a single-page application (SPA) like SvelteKit, navigations do not trigger full page loads. Instead, the framework intercepts link clicks and history events, tears down the current component tree, and mounts new components. The browser's bfcache never activates because the page never actually unloads. From the browser's perspective, you have been on the same page the entire time -- only the JavaScript-managed content has changed.

This means the browser cannot help you. It does not know that your Svelte component had a text input with "Hello world" in it, because that text was stored in a JavaScript variable (\`$state\`), not in the browser's DOM cache. When the component is destroyed during client-side navigation, that variable is garbage collected. When a new component instance is created on back navigation, it starts with default values.

Some state is recovered automatically. Data returned from load functions is replayed on back navigation -- SvelteKit caches load function results and re-provides them when a page is revisited through history. But **ephemeral UI state** -- what the user typed into inputs, how far they scrolled, which accordion panels they opened, what they selected in a dropdown -- is lost. This state was never sent to the server. It only existed in the component's reactive variables.

SvelteKit snapshots solve this by giving you a mechanism to capture ephemeral state before the component is destroyed and restore it when the component is recreated.

## How Snapshots Work

Snapshots are a page-level feature. You export a \`snapshot\` object from your \`+page.svelte\` (or \`+layout.svelte\`) that defines two functions:

\`\`\`svelte
<script lang="ts">
  import type { Snapshot } from './$types';

  let comment = $state('');
  let rating = $state(0);

  export const snapshot: Snapshot<{ comment: string; rating: number }> = {
    capture: () => {
      return { comment, rating };
    },
    restore: (value) => {
      comment = value.comment;
      rating = value.rating;
    }
  };
</script>

<textarea bind:value={comment} placeholder="Write your review..."></textarea>
<input type="range" bind:value={rating} min="0" max="5" />
\`\`\`

**\`capture()\`** is called right before the user navigates away from the page. It returns a serializable object representing the state you want to preserve.

**\`restore(value)\`** is called when the user navigates back to the page (via browser back/forward). It receives the previously captured object so you can reinstate the state.

## Capture/Restore Lifecycle: Detailed Timing

Understanding the exact timing of capture and restore relative to other SvelteKit lifecycle events is important for avoiding subtle bugs. Here is the complete sequence:

**Navigation away (capture):**

\`\`\`
1. User triggers navigation (link click, back button, goto())
2. SvelteKit decides to navigate (beforeNavigate callbacks fire)
3. → capture() is called on the CURRENT page's snapshot
4. The captured value is serialized and stored in sessionStorage
5. The current component tree begins teardown
6. onDestroy callbacks fire
7. The component is removed from the DOM
8. SvelteKit begins loading the target route
\`\`\`

**Navigation back (restore):**

\`\`\`
1. User triggers back/forward navigation
2. SvelteKit loads the target route's code and data
3. The load function runs, data is populated
4. The new component instance is created and mounted
5. onMount callbacks fire
6. → restore(value) is called with the previously captured state
7. Reactive updates propagate (UI reflects restored state)
8. afterNavigate callbacks fire
\`\`\`

The critical detail is that **restore is called after mount**, meaning the DOM exists and reactive bindings are active. This is why you can directly assign to \`$state\` variables in restore and see the UI update. However, if you need to interact with DOM elements (like setting scroll position), you may need to use \`tick()\` to wait for the reactive updates to flush to the DOM:

\`\`\`typescript
import { tick } from 'svelte';

restore: async (value) => {
  items = value.items;
  expandedSections = value.expandedSections;

  // Wait for the DOM to reflect the restored state
  await tick();

  // Now safe to set scroll position
  if (containerRef) {
    containerRef.scrollTop = value.scrollTop;
  }
}
\`\`\``
		},
		{
			type: 'text',
			content: `## What to Snapshot

Snapshot the **ephemeral UI state** that cannot be recovered from any other source:

**Form input values.** Text the user has typed but not yet submitted. Selected options in dropdowns. Checkbox and radio states. This is the most common and most valuable use case.

\`\`\`typescript
capture: () => ({
  name: nameField,
  email: emailField,
  message: messageField,
  agreeToTerms: termsChecked
})
\`\`\`

**Scroll position.** If your page has scrollable containers (not the main document scroll, which SvelteKit handles automatically), capture their scroll offsets.

\`\`\`typescript
capture: () => ({
  scrollTop: containerElement?.scrollTop ?? 0
})
\`\`\`

**UI toggle states.** Which accordion panels are expanded, which tabs are selected, which filters are active -- anything that controls what the user sees but is not reflected in the URL or server data.

\`\`\`typescript
capture: () => ({
  expandedSections: [...expandedIds],
  activeTab: currentTab,
  sidebarOpen: isSidebarVisible
})
\`\`\`

**Draft content.** If the user is composing a comment, email, or document that has not been saved, snapshot it. This is distinct from form values because drafts may be rich text or structured data.

\`\`\`typescript
capture: () => ({
  draftTitle: title,
  draftBody: bodyContent,
  draftTags: [...selectedTags]
})
\`\`\`

## Serialization Constraints: What Cannot Be Serialized

The snapshot value must be serializable with \`devalue\` (the library SvelteKit uses internally). While \`devalue\` supports more types than \`JSON.stringify\`, there are strict limits on what it can handle. Understanding these constraints prevents silent data loss and runtime errors.

**What devalue CAN serialize (beyond JSON):**
- \`Date\` objects (preserved as Date, not converted to string)
- \`Map\` and \`Set\` (preserved with their entries)
- \`RegExp\` (preserved with flags)
- \`BigInt\` values
- \`undefined\` (JSON drops it, devalue preserves it)
- Cyclic references (objects that reference themselves)
- Repeated references (the same object referenced in multiple places)
- \`Int8Array\`, \`Uint8Array\`, and other typed arrays

**What CANNOT be serialized -- and what happens if you try:**

**Functions** -- Silently dropped. If your snapshot object has a method, it vanishes on restore.
\`\`\`typescript
// BAD: The validator function is lost
capture: () => ({
  value: inputValue,
  validate: (v: string) => v.length > 3  // Silently dropped
})
\`\`\`

**DOM element references** -- Throws an error. Elements are live objects tied to the document and cannot be serialized.
\`\`\`typescript
// BAD: Throws during serialization
capture: () => ({
  element: document.querySelector('.editor')  // Error
})
\`\`\`

**Class instances** -- The object is serialized as a plain object, losing its prototype chain. Methods disappear, \`instanceof\` checks fail on restore.
\`\`\`typescript
// BAD: Restored as plain object, not a User instance
capture: () => ({
  user: new User('Alice', 'admin')  // Becomes { name: 'Alice', role: 'admin' }
})

// GOOD: Capture the data, reconstruct the instance in restore
capture: () => ({
  userName: user.name,
  userRole: user.role
}),
restore: (value) => {
  user = new User(value.userName, value.userRole);
}
\`\`\`

**Promises** -- Cannot be serialized. Capture the resolved value instead.

**Symbols** -- Cannot be serialized. Use string keys instead.

**WeakMap / WeakRef** -- Cannot be serialized because their entries are not enumerable.

The general rule: if you cannot imagine writing it to a file and reading it back, it cannot be snapshotted. Capture data, not behavior or live references.

## What NOT to Snapshot

Not all state belongs in snapshots. Beyond serialization constraints, some state *should not* be captured:

**Large data sets.** Do not snapshot the entire contents of a data table, a list of 10,000 items, or a large file buffer. Snapshots are stored in the browser's session history, which has size limits. Store IDs or pagination offsets instead, and reload the data.

\`\`\`typescript
// BAD: Snapshots an entire dataset
capture: () => ({ allProducts: products }) // Could be megabytes

// GOOD: Snapshots the query parameters to reload the data
capture: () => ({ searchTerm, page, sortBy })
\`\`\`

**Sensitive data.** Snapshots persist in browser session storage. Do not snapshot passwords, tokens, credit card numbers, or any data the user would not want persisted in the browser.

**Derived state.** If a value can be computed from other state (load function data, URL parameters), do not snapshot it. It will be recomputed naturally when the page re-renders.`
		},
		{
			type: 'text',
			content: `## Snapshot vs $state Persistence: Decision Framework

When you need state to survive across navigations, snapshots are not your only option. Understanding when to use snapshots versus other persistence mechanisms helps you choose the right tool:

| Mechanism | Survives Navigation | Survives Reload | Survives Tab Close | Scope |
|---|---|---|---|---|
| \`$state\` (component) | No | No | No | Single component instance |
| Snapshots | Back/forward only | Yes (sessionStorage) | No | Per-page, per-history-entry |
| URL search params | Yes | Yes | Yes (if bookmarked) | Shareable, global |
| \`$state\` in module context | Yes (within SPA session) | No | No | Shared across components |
| localStorage | Yes | Yes | Yes | Per-origin, all tabs |
| Server (database) | Yes | Yes | Yes | Cross-device |

**Use snapshots when:**
- State is ephemeral (form drafts, UI toggles, scroll positions)
- The user expects back/forward to restore their work
- The state is too complex or verbose for URL parameters
- The state should not persist beyond the browser session

**Use URL parameters when:**
- The state should be shareable (filters, search queries, pagination)
- The state is simple (a few strings or numbers)
- You want the state to appear in the browser's address bar

**Use module-level \`$state\` when:**
- State should persist across all navigations within the SPA session (not just back/forward)
- The state is app-wide (theme, user preferences loaded at startup)
- You do not need persistence across page reloads

**Use localStorage/server storage when:**
- State must survive across sessions (user preferences, saved drafts)
- State needs to sync across tabs or devices

Snapshots occupy a specific niche: they preserve ephemeral state that matters *during a browsing session* but is disposable after the session ends. They are the right answer when losing the state would frustrate the user but persisting it permanently would be unnecessary or even unwanted.

## Multi-Step Form Wizard Pattern

The most compelling use case for snapshots is a multi-step form. Each step is a separate route, and the user should be able to navigate back and forward between steps without losing their input.

\`\`\`svelte
<!-- /wizard/step-1/+page.svelte -->
<script lang="ts">
  import type { Snapshot } from './$types';

  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');

  export const snapshot: Snapshot<{
    firstName: string;
    lastName: string;
    email: string;
  }> = {
    capture: () => ({ firstName, lastName, email }),
    restore: (value) => {
      firstName = value.firstName;
      lastName = value.lastName;
      email = value.email;
    }
  };
</script>

<h2>Step 1: Personal Information</h2>

<form action="/wizard/step-2" method="get">
  <label>
    First Name
    <input bind:value={firstName} name="firstName" required />
  </label>
  <label>
    Last Name
    <input bind:value={lastName} name="lastName" required />
  </label>
  <label>
    Email
    <input bind:value={email} name="email" type="email" required />
  </label>
  <button type="submit">Next Step</button>
</form>
\`\`\`

Now when the user fills in step 1, navigates to step 2, and presses back, all step 1 fields are restored. Without snapshots, they would return to empty fields.

## Multi-Page Snapshot Coordination Across Layout Boundaries

When building multi-step wizards or complex layouts, you often have snapshots in both pages and layouts. Understanding how these interact is essential.

Each \`+page.svelte\` and \`+layout.svelte\` gets its own independent snapshot. They do not merge or conflict. When the user navigates away, SvelteKit calls \`capture()\` on every component in the hierarchy that exports a snapshot -- from the innermost page up through each layout. On restore, \`restore()\` is called on each component that matches.

\`\`\`
/wizard/step-1/+page.svelte     → snapshot captures: { firstName, lastName, email }
/wizard/+layout.svelte           → snapshot captures: { currentStep, sidebarOpen }
/+layout.svelte (root)           → snapshot captures: { searchQuery }
\`\`\`

When the user navigates from step-1 to step-2, only the step-1 page snapshot fires capture (since the layouts remain mounted). When the user navigates completely away from the wizard (to a different section), all three snapshots fire capture.

The important edge case: when the user navigates between pages that share a layout, the **layout's snapshot is NOT captured/restored** because the layout component is never destroyed. It stays mounted across child page changes. This means layout snapshots only fire when the user navigates to a route that uses a *different* layout.

\`\`\`
Navigation: /wizard/step-1 → /wizard/step-2
  ✓ step-1/+page.svelte capture() fires
  ✗ wizard/+layout.svelte capture() does NOT fire (layout stays mounted)
  ✓ step-2/+page.svelte restore() fires (if returning via back)

Navigation: /wizard/step-1 → /settings
  ✓ step-1/+page.svelte capture() fires
  ✓ wizard/+layout.svelte capture() fires
  ✓ root +layout.svelte capture() does NOT fire (stays mounted)
\`\`\`

## Snapshots in Layouts

You can also export snapshots from \`+layout.svelte\`. This is useful when UI state spans multiple child pages:

\`\`\`svelte
<!-- +layout.svelte -->
<script lang="ts">
  import type { Snapshot } from './$types';

  let sidebarOpen = $state(true);
  let searchQuery = $state('');

  export const snapshot: Snapshot<{ sidebarOpen: boolean; searchQuery: string }> = {
    capture: () => ({ sidebarOpen, searchQuery }),
    restore: (value) => {
      sidebarOpen = value.sidebarOpen;
      searchQuery = value.searchQuery;
    }
  };
</script>

<div class="layout" class:sidebar-collapsed={!sidebarOpen}>
  <aside>
    <input bind:value={searchQuery} placeholder="Search..." />
  </aside>
  <main>
    {@render children()}
  </main>
</div>
\`\`\``
		},
		{
			type: 'text',
			content: `## Edge Cases: SSR, Prerendering, and Programmatic Navigation

Snapshots interact with several SvelteKit features in ways that may not be immediately obvious:

**Server-Side Rendering (SSR):** The \`capture()\` function never runs on the server. Snapshots are a purely client-side feature. During SSR, the component renders with default values, and \`restore()\` is only called after client-side hydration when the user navigates back to a previously visited page. On the initial page load (even with client-side hydration), \`restore()\` does not fire because there is no previous snapshot to restore.

**Prerendering:** Prerendered pages have no snapshot lifecycle at all during the build step. The snapshot functions are stripped from the server bundle. They only activate when the prerendered page is hydrated in the user's browser and the user navigates away and back.

**Programmatic navigation with \`goto()\`:** Calling \`goto('/other-page')\` triggers \`capture()\` on the current page just like a link click. When the user presses back, \`restore()\` fires normally. However, \`goto('/other-page', { replaceState: true })\` replaces the current history entry, which means the captured snapshot overwrites the previous entry's snapshot. The replaced entry's snapshot is lost.

**\`invalidate()\` and \`invalidateAll()\`:** These re-run load functions without navigating. Since there is no navigation, \`capture()\` and \`restore()\` are NOT called. The component stays mounted and its \`$state\` variables are unaffected. Only the \`data\` prop updates.

**Page reload (F5 / Cmd+R):** Snapshots survive page reloads because they are stored in \`sessionStorage\`. When the page reloads, the snapshot for the current URL is still available. SvelteKit restores it after hydration, so the user's form values reappear even after a full refresh. This is one of the key advantages of snapshots over simple component state.

## Snapshot Storage and Limits

Snapshots are stored in the browser's \`sessionStorage\` under a key managed by SvelteKit. This means:

- They survive page reloads (refreshing the tab)
- They do NOT survive closing and reopening the tab
- They do NOT sync across tabs
- They are subject to \`sessionStorage\` size limits (typically 5-10 MB per origin)

Because of storage limits, keep snapshots small. If you are snapshotting many pages (a long wizard, a deep navigation stack), each snapshot adds to the total. Trim unnecessary state and prefer references (IDs) over copies (full objects).

## TypeScript Integration

The \`Snapshot\` type from \`./$types\` is a generic. Provide the shape of your captured state to get full type safety:

\`\`\`svelte
<script lang="ts">
  import type { Snapshot } from './$types';

  interface FormState {
    name: string;
    bio: string;
    favoriteColor: string;
    notifications: boolean;
  }

  let name = $state('');
  let bio = $state('');
  let favoriteColor = $state('#000000');
  let notifications = $state(true);

  export const snapshot: Snapshot<FormState> = {
    capture: () => ({
      name,
      bio,
      favoriteColor,
      notifications
    }),
    restore: (value) => {
      name = value.name;
      bio = value.bio;
      favoriteColor = value.favoriteColor;
      notifications = value.notifications;
    }
  };
</script>
\`\`\`

TypeScript ensures that \`capture\` returns a \`FormState\` and that \`restore\` receives a \`FormState\`. If you add a field to the interface but forget to capture it, you get a compile error.`
		},
		{
			type: 'concept-callout',
			content: 'sveltekit.advanced.snapshots'
		},
		{
			type: 'text',
			content: `## Exercise: Multi-Step Wizard with Validation State Preservation

Build a two-step form wizard where each step preserves not just form values but also validation state (which fields have been touched, which have errors). Step 1 collects personal info (name, email) with validation. Step 2 collects preferences (theme, language, notifications). Both steps preserve their complete UI state when the user navigates back and forth.

**Your task:**
1. Create \`$state\` variables for each form field and validation state (touched flags, error messages)
2. Export a \`snapshot\` with \`capture\` and \`restore\` that preserves both values and validation state
3. Verify that navigating away and back preserves the form values AND shows which fields had errors`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Adding Scroll Position Restoration

Enhance your wizard so that if the user scrolled down on a long step, the scroll position is also restored when they navigate back. Remember to use \`tick()\` before setting scroll position to ensure the DOM has updated with the restored content.

**Task:** Include the scroll offset of a container element in your snapshot's capture and restore functions. Use \`tick()\` in restore to wait for the DOM update before setting scrollTop.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Snapshot with Accordion/Toggle State

Now add an expandable help section to each wizard step. The user can expand help text for individual fields. When they navigate away and back, the expansion state of each help section should be preserved alongside the form data.

**Task:** Add an array or Set of expanded section IDs to your snapshot state. Capture which sections are expanded and restore them on back navigation.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'xray-prompt',
			content: `What is the difference between SvelteKit's automatic scroll restoration for the document and manual scroll restoration via snapshots for specific containers? Why does SvelteKit not automatically snapshot all component state, and what are the tradeoffs of opt-in vs opt-out state preservation? How do snapshots interact with SSR and prerendering? What happens when a snapshot grows too large for sessionStorage?`
		},
		{
			type: 'text',
			content: `## Summary

Snapshots are SvelteKit's answer to ephemeral state loss during navigation. By exporting a \`snapshot\` object with \`capture\` and \`restore\` from your page or layout, you control exactly which state survives the component lifecycle. The capture/restore cycle is tightly integrated with SvelteKit's navigation events -- capture fires before teardown, restore fires after mount. Keep snapshot data serializable (no functions, no DOM refs, no class instances -- use plain data and reconstruct objects in restore). Use snapshots for form drafts, scroll positions, UI toggles, validation state, and any state that matters to the user but is not persisted on the server. Coordinate snapshots across layouts and pages by understanding which components are destroyed during navigation. Keep them small and focused on what the user would be frustrated to lose, and prefer URL parameters for state that should be shareable.`
		}
	],

	starterFiles: [
		{
			name: 'step-1/+page.svelte',
			path: '/wizard/step-1/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snapshot } from './$types';

  // TODO: Create $state variables for firstName, lastName, email
  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');

  // TODO: Create $state variables for validation
  let touchedFields = $state<Record<string, boolean>>({});
  let errors = $state<Record<string, string>>({});

  function validateField(field: string, value: string) {
    touchedFields[field] = true;
    if (field === 'email' && !value.includes('@')) {
      errors[field] = 'Invalid email address';
    } else if (!value.trim()) {
      errors[field] = 'This field is required';
    } else {
      delete errors[field];
    }
  }

  // TODO: Export a snapshot that captures form fields AND validation state
</script>

<h2>Step 1: Personal Information</h2>

<form action="/wizard/step-2">
  <label>
    First Name
    <input
      bind:value={firstName}
      name="firstName"
      required
      onblur={() => validateField('firstName', firstName)}
    />
    {#if touchedFields.firstName && errors.firstName}
      <span class="error">{errors.firstName}</span>
    {/if}
  </label>

  <label>
    Last Name
    <input
      bind:value={lastName}
      name="lastName"
      required
      onblur={() => validateField('lastName', lastName)}
    />
    {#if touchedFields.lastName && errors.lastName}
      <span class="error">{errors.lastName}</span>
    {/if}
  </label>

  <label>
    Email
    <input
      bind:value={email}
      name="email"
      type="email"
      required
      onblur={() => validateField('email', email)}
    />
    {#if touchedFields.email && errors.email}
      <span class="error">{errors.email}</span>
    {/if}
  </label>

  <button type="submit">Next Step</button>
</form>

<style>
  .error { color: red; font-size: 0.85em; }
</style>`
		},
		{
			name: 'step-2/+page.svelte',
			path: '/wizard/step-2/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snapshot } from './$types';

  // TODO: Create $state variables for theme and language
  let theme = $state('light');
  let language = $state('en');
  let notifications = $state(true);

  // TODO: Export a snapshot that captures and restores preferences
</script>

<h2>Step 2: Preferences</h2>

<a href="/wizard/step-1">&larr; Back to Step 1</a>

<form method="post">
  <label>
    Theme
    <select bind:value={theme} name="theme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  </label>

  <label>
    Language
    <select bind:value={language} name="language">
      <option value="en">English</option>
      <option value="es">Spanish</option>
      <option value="fr">French</option>
    </select>
  </label>

  <label>
    <input type="checkbox" bind:checked={notifications} name="notifications" />
    Enable notifications
  </label>

  <button type="submit">Submit</button>
</form>`
		}
	],

	solutionFiles: [
		{
			name: 'step-1/+page.svelte',
			path: '/wizard/step-1/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snapshot } from './$types';
  import { tick } from 'svelte';

  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');

  let touchedFields = $state<Record<string, boolean>>({});
  let errors = $state<Record<string, string>>({});

  let containerRef = $state<HTMLElement | null>(null);

  function validateField(field: string, value: string) {
    touchedFields[field] = true;
    if (field === 'email' && !value.includes('@')) {
      errors[field] = 'Invalid email address';
    } else if (!value.trim()) {
      errors[field] = 'This field is required';
    } else {
      delete errors[field];
    }
  }

  export const snapshot: Snapshot<{
    firstName: string;
    lastName: string;
    email: string;
    touchedFields: Record<string, boolean>;
    errors: Record<string, string>;
    scrollTop: number;
  }> = {
    capture: () => ({
      firstName,
      lastName,
      email,
      touchedFields: { ...touchedFields },
      errors: { ...errors },
      scrollTop: containerRef?.scrollTop ?? 0
    }),
    restore: async (value) => {
      firstName = value.firstName;
      lastName = value.lastName;
      email = value.email;
      touchedFields = value.touchedFields;
      errors = value.errors;

      await tick();
      if (containerRef) {
        containerRef.scrollTop = value.scrollTop;
      }
    }
  };
</script>

<h2>Step 1: Personal Information</h2>

<div bind:this={containerRef} class="form-container">
  <form action="/wizard/step-2">
    <label>
      First Name
      <input
        bind:value={firstName}
        name="firstName"
        required
        onblur={() => validateField('firstName', firstName)}
      />
      {#if touchedFields.firstName && errors.firstName}
        <span class="error">{errors.firstName}</span>
      {/if}
    </label>

    <label>
      Last Name
      <input
        bind:value={lastName}
        name="lastName"
        required
        onblur={() => validateField('lastName', lastName)}
      />
      {#if touchedFields.lastName && errors.lastName}
        <span class="error">{errors.lastName}</span>
      {/if}
    </label>

    <label>
      Email
      <input
        bind:value={email}
        name="email"
        type="email"
        required
        onblur={() => validateField('email', email)}
      />
      {#if touchedFields.email && errors.email}
        <span class="error">{errors.email}</span>
      {/if}
    </label>

    <button type="submit">Next Step</button>
  </form>
</div>

<style>
  .error { color: red; font-size: 0.85em; }
  .form-container { max-height: 80vh; overflow-y: auto; }
</style>`
		},
		{
			name: 'step-2/+page.svelte',
			path: '/wizard/step-2/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snapshot } from './$types';

  let theme = $state('light');
  let language = $state('en');
  let notifications = $state(true);

  export const snapshot: Snapshot<{
    theme: string;
    language: string;
    notifications: boolean;
  }> = {
    capture: () => ({ theme, language, notifications }),
    restore: (value) => {
      theme = value.theme;
      language = value.language;
      notifications = value.notifications;
    }
  };
</script>

<h2>Step 2: Preferences</h2>

<a href="/wizard/step-1">&larr; Back to Step 1</a>

<form method="post">
  <label>
    Theme
    <select bind:value={theme} name="theme">
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  </label>

  <label>
    Language
    <select bind:value={language} name="language">
      <option value="en">English</option>
      <option value="es">Spanish</option>
      <option value="fr">French</option>
    </select>
  </label>

  <label>
    <input type="checkbox" bind:checked={notifications} name="notifications" />
    Enable notifications
  </label>

  <button type="submit">Submit</button>
</form>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Export a snapshot with capture and restore for form fields and validation state',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'export const snapshot' },
						{ type: 'contains', value: 'capture' },
						{ type: 'contains', value: 'restore' }
					]
				}
			},
			hints: [
				'Import `Snapshot` type from `./$types` and define `export const snapshot: Snapshot<YourType>`.',
				'The `capture` function should return an object with all your `$state` variable values including touchedFields and errors.',
				'The `restore` function receives the captured object and assigns each property back to the corresponding `$state` variable.'
			],
			conceptsTested: ['sveltekit.advanced.snapshots']
		},
		{
			id: 'cp-2',
			description: 'Include scroll position in the snapshot capture and restore',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'scrollTop' },
						{ type: 'contains', value: 'capture' }
					]
				}
			},
			hints: [
				'Add a `scrollTop` field to your snapshot state object.',
				'In `capture`, read `containerElement?.scrollTop ?? 0` to get the current scroll offset.',
				'In `restore`, set `containerElement.scrollTop = value.scrollTop` after a `tick()` to ensure the DOM is ready.'
			],
			conceptsTested: ['sveltekit.advanced.capture-restore']
		},
		{
			id: 'cp-3',
			description: 'Preserve accordion/toggle expansion state in the snapshot',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'expanded' },
						{ type: 'contains', value: 'snapshot' }
					]
				}
			},
			hints: [
				'Add an array or object of expanded section IDs to your snapshot state.',
				'In `capture`, spread the current expanded IDs into a new array: `expandedSections: [...expandedIds]`.',
				'In `restore`, assign the array back: `expandedIds = value.expandedSections`.'
			],
			conceptsTested: ['sveltekit.advanced.snapshots']
		}
	]
};
