import type { Lesson } from '$types/lesson';

export const reactiveBuiltins: Lesson = {
	id: 'svelte-core.reactive-utilities.reactive-builtins',
	slug: 'reactive-builtins',
	title: 'SvelteMap, SvelteSet & SvelteURL',
	description:
		'Use reactive drop-in replacements for native Map, Set, and URL that trigger updates on mutation.',
	trackId: 'svelte-core',
	moduleId: 'reactive-utilities',
	order: 1,
	estimatedMinutes: 18,
	concepts: ['svelte5.reactivity.svelte-map', 'svelte5.reactivity.svelte-set', 'svelte5.reactivity.svelte-url'],
	prerequisites: ['svelte5.runes.state', 'svelte5.runes.derived', 'svelte5.patterns.reactive-class'],

	content: [
		{
			type: 'text',
			content: `# SvelteMap, SvelteSet & SvelteURL

## WHY Native Map and Set Are Not Reactive

One of the most common pitfalls new Svelte 5 developers encounter is wrapping a native \`Map\` or \`Set\` in \`$state\` and expecting mutations to trigger UI updates. They do not. Understanding why requires a clear picture of how Svelte's reactivity system tracks changes.

When you write \`let items = $state(new Map())\`, Svelte creates a reactive signal for the \`items\` variable itself. Reassigning \`items\` to a different Map would trigger an update. But calling \`items.set('key', 'value')\` does not reassign the variable -- it mutates the existing Map object. The signal never fires because the reference has not changed.

This is fundamentally different from how \`$state\` handles plain objects and arrays. When you write \`let todos = $state<Todo[]>([])\`, Svelte wraps the array in a reactive proxy. Every \`.push()\`, \`.splice()\`, or index assignment is intercepted by the proxy and triggers updates. However, \`Map\` and \`Set\` are not plain objects -- they store data in internal slots that cannot be intercepted by JavaScript proxies. The Proxy specification explicitly does not support trapping internal slot access for built-in collection types like Map and Set.

Here is a concrete demonstration of the problem:

\`\`\`svelte
<script lang="ts">
  // THIS DOES NOT WORK AS EXPECTED
  let userScores = $state(new Map<string, number>());

  function addScore(name: string, score: number) {
    userScores.set(name, score); // Mutates the map, but no UI update!
  }
</script>

<p>Scores: {userScores.size}</p> <!-- Always shows the initial value -->
<button onclick={() => addScore('Alice', 95)}>Add Alice</button>
\`\`\`

Clicking the button calls \`userScores.set('Alice', 95)\`, which does add the entry to the Map. But the template never re-renders because Svelte has no way to detect that the Map's internal contents changed.

The common workaround before \`svelte/reactivity\` existed was to reassign the variable after every mutation:

\`\`\`typescript
function addScore(name: string, score: number) {
  userScores.set(name, score);
  userScores = userScores; // Force reassignment to trigger reactivity
}
\`\`\`

This works but is fragile, ugly, and easy to forget. Every single mutation site must include the self-assignment trick. Miss one and you have a silent bug where the data changes but the UI does not.

## The Solution: svelte/reactivity

Svelte provides reactive drop-in replacements for the most commonly used built-in types through the \`svelte/reactivity\` module. These replacements have identical APIs to their native counterparts but are fully integrated with Svelte's reactivity system.

\`\`\`typescript
import { SvelteMap, SvelteSet, SvelteURL, SvelteURLSearchParams } from 'svelte/reactivity';
\`\`\`

Each of these classes wraps the native type and makes every mutation reactive. When you call \`.set()\` on a \`SvelteMap\`, it triggers updates in every component that reads from that map. When you call \`.add()\` on a \`SvelteSet\`, any template that checks \`.has()\` or iterates the set re-renders.

### SvelteMap

\`SvelteMap\` is a drop-in replacement for \`Map\`. It accepts the same constructor arguments and has the same methods: \`get\`, \`set\`, \`has\`, \`delete\`, \`clear\`, \`forEach\`, \`keys\`, \`values\`, \`entries\`, and the \`size\` property. The difference is that every read operation creates a reactive dependency, and every write operation triggers those dependencies.

\`\`\`svelte
<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity';

  const userScores = new SvelteMap<string, number>();

  function addScore(name: string, score: number) {
    userScores.set(name, score); // Reactively triggers UI update!
  }
</script>

<p>Total players: {userScores.size}</p>
<ul>
  {#each userScores.entries() as [name, score]}
    <li>{name}: {score}</li>
  {/each}
</ul>
<button onclick={() => addScore('Alice', 95)}>Add Alice</button>
\`\`\`

Note that you do not need to wrap \`SvelteMap\` in \`$state\`. The map itself is reactive. You only need \`$state\` if you want to reassign the variable to a completely different map, which is rare. In most cases, you declare it with \`const\`.

### SvelteSet

\`SvelteSet\` replaces \`Set\` with the same pattern. Methods \`add\`, \`delete\`, \`has\`, \`clear\`, \`forEach\`, \`keys\`, \`values\`, \`entries\`, and \`size\` are all reactive.

\`\`\`svelte
<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';

  const selectedTags = new SvelteSet<string>();

  function toggleTag(tag: string) {
    if (selectedTags.has(tag)) {
      selectedTags.delete(tag);
    } else {
      selectedTags.add(tag);
    }
  }
</script>

{#each ['svelte', 'react', 'vue', 'angular'] as tag}
  <button
    class:selected={selectedTags.has(tag)}
    onclick={() => toggleTag(tag)}
  >
    {tag}
  </button>
{/each}

<p>Selected: {[...selectedTags].join(', ') || 'none'}</p>
\`\`\`

This example shows a tag selector where each button toggles membership in a \`SvelteSet\`. The \`class:selected\` directive reads \`selectedTags.has(tag)\`, creating a reactive dependency. When \`.add()\` or \`.delete()\` is called, the buttons update their styling immediately.

### SvelteURL and SvelteURLSearchParams

\`SvelteURL\` makes URL manipulation reactive. Every property of a URL (\`href\`, \`pathname\`, \`hostname\`, \`search\`, \`hash\`, etc.) becomes a reactive read/write. \`SvelteURLSearchParams\` does the same for search parameters.

\`\`\`svelte
<script lang="ts">
  import { SvelteURL } from 'svelte/reactivity';

  const url = new SvelteURL('https://example.com/search?q=svelte&page=1');
</script>

<input bind:value={url.pathname} />
<input bind:value={url.search} />
<p>Full URL: {url.href}</p>
\`\`\`

Modifying \`url.pathname\` or \`url.search\` in the input fields reactively updates the displayed \`url.href\`. This is useful for building URL editors, routing tools, or API endpoint constructors where users edit URL parts independently.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.reactivity.svelte-map'
		},
		{
			type: 'text',
			content: `## When to Use SvelteMap/SvelteSet vs $state({}) or $state([])

This is a critical design decision that many developers get wrong. Here is the framework:

**Use \`$state([])\` (reactive array) when:**
- Items have a stable order that matters
- You access items by index
- You use array methods like \`filter\`, \`map\`, \`sort\`, \`slice\`
- The list is rendered with \`{#each}\`
- Duplicates are allowed

**Use \`SvelteMap\` when:**
- Items are accessed by unique key (ID, name, slug)
- You need O(1) lookup by key instead of O(n) \`find()\`
- Data is key-value in nature (settings, scores, metadata)
- You frequently check existence with \`has()\`
- Items have no inherent order

**Use \`SvelteSet\` when:**
- You track membership (selected items, active filters, tags)
- Uniqueness is required (no duplicates)
- The primary operations are \`add\`, \`delete\`, and \`has\`
- Order does not matter

**Use \`$state({})\` (reactive plain object) when:**
- Keys are known at design time (a configuration object)
- The shape is fixed (not adding/removing keys dynamically)
- You want TypeScript to enforce the shape with an interface

A common mistake is using a reactive array for tag selection: \`let selected = $state<string[]>([])\`. Toggling a tag requires \`findIndex\` + \`splice\` or \`filter\` + reassignment. Checking if a tag is selected requires \`includes()\` which is O(n). A \`SvelteSet\` makes toggle a one-liner and \`has()\` is O(1).

### Performance Characteristics

\`SvelteMap\` and \`SvelteSet\` add a thin reactive wrapper around native Map/Set operations. The overhead is minimal -- a few microseconds per operation for signal bookkeeping. For collections under 10,000 items, the difference from native Map/Set is unmeasurable. The reactive overhead is far smaller than the cost of DOM updates that the reactivity triggers.

However, avoid creating a new SvelteMap or SvelteSet inside a \`$derived\` expression. The collection would be recreated on every derivation, losing referential stability. Instead, create the collection once and mutate it in response to events.

### Initializing from Existing Data

Both \`SvelteMap\` and \`SvelteSet\` accept the same constructor arguments as their native counterparts:

\`\`\`typescript
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

// From entries array
const scores = new SvelteMap([
  ['Alice', 95],
  ['Bob', 87],
  ['Charlie', 92]
]);

// From iterable
const tags = new SvelteSet(['svelte', 'typescript', 'vite']);

// From API response
async function loadScores() {
  const response = await fetch('/api/scores');
  const data: [string, number][] = await response.json();
  return new SvelteMap(data);
}
\`\`\`

**Your task:** Build a tag manager using \`SvelteSet\` for tracking which tags are selected and \`SvelteMap\` for storing tag metadata (label and color). Clicking a tag should toggle its selection. Display the selected tags with their metadata.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Combining SvelteMap with $derived

One of the most powerful patterns is combining \`SvelteMap\` or \`SvelteSet\` with \`$derived\` to create computed views of your reactive collections:

\`\`\`svelte
<script lang="ts">
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

  interface TagMeta { label: string; color: string; }

  const tagMeta = new SvelteMap<string, TagMeta>([
    ['svelte', { label: 'Svelte', color: '#ff3e00' }],
    ['ts', { label: 'TypeScript', color: '#3178c6' }],
    ['css', { label: 'CSS', color: '#264de4' }],
  ]);

  const selectedTags = new SvelteSet<string>();

  // Derived computations over reactive collections
  const selectedMeta = $derived(
    [...selectedTags].map(id => ({ id, ...tagMeta.get(id)! }))
  );

  const unselectedCount = $derived(tagMeta.size - selectedTags.size);
</script>
\`\`\`

The \`$derived\` expressions automatically track reads from both \`selectedTags\` and \`tagMeta\`. When you add a tag to the set, \`selectedMeta\` and \`unselectedCount\` both recompute. When you update metadata in the map, \`selectedMeta\` recomputes with the new labels or colors.

### Using SvelteMap in Reactive Classes

Reactive classes and reactive collections are natural partners. A reactive class can own one or more SvelteMap or SvelteSet instances and expose methods that operate on them:

\`\`\`typescript
// tag-manager.svelte.ts
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

interface TagMeta {
  label: string;
  color: string;
}

export class TagManager {
  metadata = new SvelteMap<string, TagMeta>();
  selected = new SvelteSet<string>();

  selectedList = $derived(
    [...this.selected]
      .map(id => ({ id, ...this.metadata.get(id)! }))
      .sort((a, b) => a.label.localeCompare(b.label))
  );

  allTags = $derived([...this.metadata.keys()]);

  addTag(id: string, meta: TagMeta) {
    this.metadata.set(id, meta);
  }

  removeTag(id: string) {
    this.metadata.delete(id);
    this.selected.delete(id);
  }

  toggle(id: string) {
    if (this.selected.has(id)) {
      this.selected.delete(id);
    } else {
      this.selected.add(id);
    }
  }

  isSelected(id: string): boolean {
    return this.selected.has(id);
  }
}
\`\`\`

This encapsulates all tag management logic in a single class. The \`selectedList\` derived property gives a sorted, enriched view of selected tags. Components that use this class only need to call \`manager.toggle(id)\` and bind to \`manager.selectedList\`.

**Task:** Add a feature to your tag manager: a SvelteMap that tracks how many times each tag has been toggled (a \`clickCount\` map). Display the click count next to each tag. Add a \`$derived\` property that returns the most-clicked tag.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `Consider this code:

\`\`\`svelte
<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity';

  let cache = $state(new SvelteMap<string, object>());
  const lookup = $derived(new SvelteMap([...cache]));
\`\`\`

Identify two problems with this pattern. Explain what happens on each reactive update and why it wastes resources. Then propose a corrected version.`
		},
		{
			type: 'text',
			content: `## SvelteURL for Dynamic URL Construction

\`SvelteURL\` is particularly useful for building API clients, link generators, or any UI that constructs URLs from parts:

\`\`\`svelte
<script lang="ts">
  import { SvelteURL } from 'svelte/reactivity';

  const endpoint = new SvelteURL('https://api.example.com/v1/users');

  let searchTerm = $state('');
  let page = $state(1);
  let limit = $state(20);

  // When any input changes, reconstruct the URL
  const apiUrl = $derived.by(() => {
    const url = new SvelteURL(endpoint.href);
    if (searchTerm) url.searchParams.set('q', searchTerm);
    url.searchParams.set('page', String(page));
    url.searchParams.set('limit', String(limit));
    return url.href;
  });
</script>

<input bind:value={searchTerm} placeholder="Search users..." />
<input type="number" bind:value={page} min="1" />

<p>Request URL: <code>{apiUrl}</code></p>
\`\`\`

### SvelteURLSearchParams Standalone

You can also use \`SvelteURLSearchParams\` independently for reactive query parameter management:

\`\`\`typescript
import { SvelteURLSearchParams } from 'svelte/reactivity';

const params = new SvelteURLSearchParams('sort=name&order=asc');
params.set('sort', 'date'); // Triggers reactivity
params.append('filter', 'active'); // Triggers reactivity
\`\`\`

This is useful when you need reactive query parameters without a full URL, such as for client-side filtering and sorting state that you sync to the browser's URL.

## Summary and Key Takeaways

The reactive builtins from \`svelte/reactivity\` solve a fundamental gap in Svelte's reactivity system. Native \`Map\`, \`Set\`, and \`URL\` use internal slots that proxies cannot intercept, so mutations are invisible to Svelte. The reactive replacements provide identical APIs with full reactivity:

| Native Type | Reactive Replacement | Import |
|---|---|---|
| \`Map\` | \`SvelteMap\` | \`svelte/reactivity\` |
| \`Set\` | \`SvelteSet\` | \`svelte/reactivity\` |
| \`URL\` | \`SvelteURL\` | \`svelte/reactivity\` |
| \`URLSearchParams\` | \`SvelteURLSearchParams\` | \`svelte/reactivity\` |

Key rules: (1) Do not wrap them in \`$state\` -- they are already reactive. (2) Use \`const\` declarations since you mutate the collection, not reassign the variable. (3) Do not create them inside \`$derived\` -- create once, mutate in handlers. (4) Combine with \`$derived\` to create computed views that automatically track changes.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.reactivity.svelte-set'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import SvelteMap and SvelteSet from 'svelte/reactivity'
  // TODO: Create a SvelteMap for tag metadata (id -> { label, color })
  // TODO: Create a SvelteSet for selected tag IDs
  // TODO: Create a SvelteMap for click counts
  // TODO: Add toggle function
  // TODO: Add $derived for selectedMeta and mostClicked

  const allTags = [
    { id: 'svelte', label: 'Svelte', color: '#ff3e00' },
    { id: 'typescript', label: 'TypeScript', color: '#3178c6' },
    { id: 'css', label: 'CSS', color: '#264de4' },
    { id: 'vite', label: 'Vite', color: '#646cff' },
    { id: 'node', label: 'Node.js', color: '#339933' },
  ];
</script>

<div class="tag-manager">
  <h2>Tag Manager</h2>

  <div class="tags">
    <!-- TODO: Render tag buttons from the metadata map -->
    <!-- Each button should show label, toggle selection, and display click count -->
  </div>

  <div class="selected">
    <h3>Selected Tags</h3>
    <!-- TODO: Show selected tags with their metadata -->
    <p class="empty">No tags selected</p>
  </div>

  <div class="stats">
    <h3>Stats</h3>
    <!-- TODO: Show most clicked tag -->
  </div>
</div>

<style>
  .tag-manager {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    max-width: 600px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .tag-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 9999px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
    background: white;
  }

  .tag-btn.selected {
    color: white;
    border-color: transparent;
  }

  .tag-btn .count {
    font-size: 0.7rem;
    opacity: 0.7;
    margin-left: 0.25rem;
  }

  .selected {
    margin-bottom: 1.5rem;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    color: white;
    font-size: 0.8rem;
    font-weight: 500;
    margin: 0.25rem;
  }

  .empty {
    color: #94a3b8;
    font-style: italic;
  }

  .stats {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';

  interface TagMeta {
    label: string;
    color: string;
  }

  const tagMeta = new SvelteMap<string, TagMeta>([
    ['svelte', { label: 'Svelte', color: '#ff3e00' }],
    ['typescript', { label: 'TypeScript', color: '#3178c6' }],
    ['css', { label: 'CSS', color: '#264de4' }],
    ['vite', { label: 'Vite', color: '#646cff' }],
    ['node', { label: 'Node.js', color: '#339933' }],
  ]);

  const selectedTags = new SvelteSet<string>();
  const clickCounts = new SvelteMap<string, number>();

  function toggle(id: string) {
    if (selectedTags.has(id)) {
      selectedTags.delete(id);
    } else {
      selectedTags.add(id);
    }
    clickCounts.set(id, (clickCounts.get(id) ?? 0) + 1);
  }

  const selectedMeta = $derived(
    [...selectedTags].map(id => ({ id, ...tagMeta.get(id)! }))
  );

  const mostClicked = $derived.by(() => {
    let maxId = '';
    let maxCount = 0;
    for (const [id, count] of clickCounts) {
      if (count > maxCount) {
        maxId = id;
        maxCount = count;
      }
    }
    return maxId ? { id: maxId, label: tagMeta.get(maxId)!.label, count: maxCount } : null;
  });
</script>

<div class="tag-manager">
  <h2>Tag Manager</h2>

  <div class="tags">
    {#each tagMeta.entries() as [id, meta]}
      <button
        class="tag-btn"
        class:selected={selectedTags.has(id)}
        style:background-color={selectedTags.has(id) ? meta.color : 'white'}
        style:color={selectedTags.has(id) ? 'white' : meta.color}
        style:border-color={meta.color}
        onclick={() => toggle(id)}
      >
        {meta.label}
        {#if clickCounts.has(id)}
          <span class="count">({clickCounts.get(id)})</span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="selected">
    <h3>Selected Tags ({selectedTags.size})</h3>
    {#if selectedMeta.length > 0}
      {#each selectedMeta as tag}
        <span class="chip" style:background-color={tag.color}>
          {tag.label}
        </span>
      {/each}
    {:else}
      <p class="empty">No tags selected</p>
    {/if}
  </div>

  <div class="stats">
    <h3>Stats</h3>
    {#if mostClicked}
      <p>Most clicked: <strong>{mostClicked.label}</strong> ({mostClicked.count} clicks)</p>
    {:else}
      <p class="empty">No clicks yet</p>
    {/if}
  </div>
</div>

<style>
  .tag-manager {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    max-width: 600px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .tag-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 9999px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
    background: white;
  }

  .tag-btn.selected {
    color: white;
    border-color: transparent;
  }

  .tag-btn .count {
    font-size: 0.7rem;
    opacity: 0.7;
    margin-left: 0.25rem;
  }

  .selected {
    margin-bottom: 1.5rem;
  }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    color: white;
    font-size: 0.8rem;
    font-weight: 500;
    margin: 0.25rem;
  }

  .empty {
    color: #94a3b8;
    font-style: italic;
  }

  .stats {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 8px;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a tag manager with SvelteSet for selection and SvelteMap for metadata',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'SvelteMap' },
						{ type: 'contains', value: 'SvelteSet' },
						{ type: 'contains', value: 'svelte/reactivity' }
					]
				}
			},
			hints: [
				'Import `SvelteMap` and `SvelteSet` from `svelte/reactivity`. Create `const tagMeta = new SvelteMap<string, TagMeta>()` and `const selectedTags = new SvelteSet<string>()`.',
				'Write a `toggle` function that checks `selectedTags.has(id)` and either calls `.delete(id)` or `.add(id)`. Use `selectedTags.has(id)` in the template for `class:selected`.',
				'Use `{#each tagMeta.entries() as [id, meta]}` to iterate the map. Use `selectedTags.has(id)` to conditionally style buttons. Spread selected metadata with `[...selectedTags].map(id => ({ id, ...tagMeta.get(id)! }))`.'
			],
			conceptsTested: ['svelte5.reactivity.svelte-map', 'svelte5.reactivity.svelte-set']
		},
		{
			id: 'cp-2',
			description: 'Add a click count SvelteMap and a $derived most-clicked computation',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'clickCounts' },
						{ type: 'contains', value: '$derived' },
						{ type: 'contains', value: 'SvelteMap' }
					]
				}
			},
			hints: [
				'Create `const clickCounts = new SvelteMap<string, number>()`. In your toggle function, add `clickCounts.set(id, (clickCounts.get(id) ?? 0) + 1)`.',
				'Create a `$derived.by` that iterates `clickCounts` entries to find the maximum. Return an object with `id`, `label`, and `count`, or `null` if no clicks yet.',
				'Display the click count next to each tag: `{#if clickCounts.has(id)}<span class="count">({clickCounts.get(id)})</span>{/if}`. Show the most-clicked result in the stats section.'
			],
			conceptsTested: ['svelte5.reactivity.svelte-map']
		}
	]
};
