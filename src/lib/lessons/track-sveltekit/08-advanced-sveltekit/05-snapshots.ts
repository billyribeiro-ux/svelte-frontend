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

Some state is recovered automatically. Data returned from load functions is replayed on back navigation. But **ephemeral UI state** -- what the user typed into inputs, how far they scrolled, which accordion panels they opened, what they selected in a dropdown -- is lost. This state was never sent to the server. It only existed in the component's reactive variables.

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

The lifecycle is:
1. User is on the page, types into inputs, scrolls, interacts
2. User navigates away (clicks a link, presses back, etc.)
3. SvelteKit calls \`capture()\` -- you return the state to save
4. The component is destroyed
5. User navigates back (via history)
6. A new component instance is created
7. Load functions re-run, \`data\` is populated
8. SvelteKit calls \`restore(value)\` with the captured state
9. The component is live with the user's previous state intact

## What to Snapshot

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

## What NOT to Snapshot

Not all state belongs in snapshots. The snapshot value must be serializable with \`JSON.stringify\` (technically \`devalue\`, which supports more types, but the principle is the same). More importantly, some state should not be captured because it creates problems:

**Large data sets.** Do not snapshot the entire contents of a data table, a list of 10,000 items, or a large file buffer. Snapshots are stored in the browser's session history, which has size limits. Store IDs or pagination offsets instead, and reload the data.

\`\`\`typescript
// BAD: Snapshots an entire dataset
capture: () => ({ allProducts: products }) // Could be megabytes

// GOOD: Snapshots the query parameters to reload the data
capture: () => ({ searchTerm, page, sortBy })
\`\`\`

**Non-serializable values.** Class instances with methods, functions, DOM element references, Promises, Symbols -- these cannot be serialized. The snapshot will silently lose them or throw.

\`\`\`typescript
// BAD: DOM references and class instances
capture: () => ({
  element: document.querySelector('.editor'), // Cannot serialize
  controller: new AbortController()           // Cannot serialize
})

// GOOD: Capture the data, not the objects
capture: () => ({
  editorContent: editorElement?.innerHTML ?? '',
  requestPending: isLoading
})
\`\`\`

**Sensitive data.** Snapshots persist in browser session storage. Do not snapshot passwords, tokens, credit card numbers, or any data the user would not want persisted in the browser.

**Derived state.** If a value can be computed from other state (load function data, URL parameters), do not snapshot it. It will be recomputed naturally when the page re-renders.

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
\`\`\`

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
			content: `## Exercise: Multi-Step Form Wizard with Snapshots

Build a two-step form wizard. Step 1 collects personal info (name, email). Step 2 collects preferences (theme, language). Both steps preserve their inputs when the user navigates back and forth.

**Your task:**
1. Create \`$state\` variables for each form field
2. Export a \`snapshot\` with \`capture\` and \`restore\`
3. Verify that navigating away and back preserves the form values`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Adding Scroll Position Restoration

Enhance your wizard so that if the user scrolled down on a long step, the scroll position is also restored when they navigate back.

**Task:** Include the scroll offset of a container element in your snapshot's capture and restore functions.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `What is the difference between SvelteKit's automatic scroll restoration for the document and manual scroll restoration via snapshots for specific containers? Why does SvelteKit not automatically snapshot all component state, and what are the tradeoffs of opt-in vs opt-out state preservation?`
		},
		{
			type: 'text',
			content: `## Summary

Snapshots are SvelteKit's answer to ephemeral state loss during navigation. By exporting a \`snapshot\` object with \`capture\` and \`restore\` from your page or layout, you control exactly which state survives the component lifecycle. Use them for form drafts, scroll positions, UI toggles, and any state that matters to the user but is not persisted on the server. Keep them small, serializable, and focused on what the user would be frustrated to lose.`
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

  // TODO: Export a snapshot that captures and restores all form fields
</script>

<h2>Step 1: Personal Information</h2>

<form action="/wizard/step-2">
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
</form>`
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

<form action="/wizard/step-2">
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
</form>`
		},
		{
			name: 'step-2/+page.svelte',
			path: '/wizard/step-2/+page.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snapshot } from './$types';

  let theme = $state('light');
  let language = $state('en');

  export const snapshot: Snapshot<{
    theme: string;
    language: string;
  }> = {
    capture: () => ({ theme, language }),
    restore: (value) => {
      theme = value.theme;
      language = value.language;
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

  <button type="submit">Submit</button>
</form>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Export a snapshot with capture and restore for form fields',
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
				'The `capture` function should return an object with all your `$state` variable values.',
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
		}
	]
};
