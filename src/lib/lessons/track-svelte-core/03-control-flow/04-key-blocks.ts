import type { Lesson } from '$types/lesson';

export const keyBlocks: Lesson = {
	id: 'svelte-core.control-flow.key-blocks',
	slug: 'key-blocks',
	title: 'Resetting with {#key}',
	description:
		'Force component destruction and recreation with {#key} blocks to reset state, retrigger transitions, and reinitialize dependencies.',
	trackId: 'svelte-core',
	moduleId: 'control-flow',
	order: 4,
	estimatedMinutes: 14,
	concepts: ['svelte5.control-flow.key', 'svelte5.control-flow.key-transitions', 'svelte5.control-flow.key-reset'],
	prerequisites: ['svelte5.runes.state', 'svelte5.control-flow.if', 'svelte5.transitions.directive'],

	content: [
		{
			type: 'text',
			content: `# Resetting with {#key}

## WHY {#key} Exists

Every Svelte component instance carries **internal state**. When you declare \`let count = $state(0)\` inside a component, that state belongs to *that particular instance* of the component. As long as the instance stays alive in the DOM, its state persists -- even if the data feeding into it changes completely.

This creates a subtle but extremely common problem. Imagine a \`UserProfile\` component that accepts a \`userId\` prop. Inside, it has local state: an \`isEditing\` flag, a form draft, a scroll position, maybe a timer. When you navigate from User #1 to User #2, Svelte does something efficient but potentially surprising: it **reuses the existing component instance** and simply updates the \`userId\` prop. The component's \`$effect\` blocks will re-run, and any derived values will recompute. But the local \`isEditing\` flag? Still \`true\` from when the user was editing User #1. The form draft? Still contains User #1's data. The scroll position? Unchanged.

This is not a bug -- it is Svelte's optimization. Reusing component instances is faster than destroying and recreating them. But sometimes **reuse is wrong**, and you need a fresh start.

This is exactly what \`{#key}\` solves.

\`\`\`svelte
{#key userId}
  <UserProfile {userId} />
{/key}
\`\`\`

When \`userId\` changes, Svelte **destroys the entire \`UserProfile\` instance** -- all its state, all its effects, all its DOM nodes -- and creates a brand new one from scratch. The new instance initializes with fresh default state, runs its setup logic anew, and renders into a clean DOM subtree.

### How {#key} Differs from {#if}

This distinction is critical and frequently misunderstood:

**\`{#if}\` controls whether a subtree exists based on a boolean condition.** It shows or hides content. When the condition becomes false, the subtree is destroyed. When it becomes true again, a new subtree is created. But \`{#if}\` does not react to *value changes* -- only to truthiness.

**\`{#key}\` watches a specific expression and destroys/recreates the subtree whenever that expression changes to a new value.** It does not care about truthiness. If the key changes from 1 to 2, or from "alice" to "bob", or from one object reference to another, the subtree is torn down and rebuilt.

\`\`\`svelte
<!-- {#if} -- only reacts to true/false -->
{#if userId}
  <UserProfile {userId} />  <!-- Reused when userId changes from 1 to 2 -->
{/if}

<!-- {#key} -- reacts to every value change -->
{#key userId}
  <UserProfile {userId} />  <!-- Destroyed and recreated when userId changes from 1 to 2 -->
{/key}
\`\`\`

Think of \`{#if}\` as a **light switch** (on/off) and \`{#key}\` as a **demolition crew** (tear it down and rebuild when the blueprint changes).

### Under the Hood: What Svelte Actually Does

When the compiler encounters a \`{#key expression}\` block, it generates code that:

1. **Evaluates the key expression** and stores the result
2. **On each update**, compares the new key value to the stored value using strict inequality (\`!==\`)
3. **If the key changed:**
   a. Runs the **outro transitions** on all elements in the current subtree (if any exist)
   b. Calls the **destroy** lifecycle on all child components (cleaning up effects, subscriptions, etc.)
   c. **Removes** all DOM nodes from the subtree
   d. **Creates** a fresh subtree with new component instances and new DOM nodes
   e. Runs the **intro transitions** on the new elements (if any exist)
   f. Stores the new key value for future comparison
4. **If the key did not change**, does nothing -- the subtree is left untouched

This is semantically identical to wrapping the content in \`{#if false}{/if}{#if true}\` on every key change, except it is expressed more clearly and handles the transition between old and new content seamlessly.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.control-flow.key'
		},
		{
			type: 'text',
			content: `## Use Case 1: Resetting Component State

The most common use case is resetting a component when switching between items in a list. Consider a chat application where clicking on a contact loads a conversation:

\`\`\`svelte
<script lang="ts">
  import ChatWindow from './ChatWindow.svelte';
  let selectedContactId = $state('alice');

  const contacts = ['alice', 'bob', 'carol'];
</script>

<nav>
  {#each contacts as contact}
    <button
      class:active={selectedContactId === contact}
      onclick={() => selectedContactId = contact}
    >
      {contact}
    </button>
  {/each}
</nav>

{#key selectedContactId}
  <ChatWindow contactId={selectedContactId} />
{/key}
\`\`\`

Without \`{#key}\`, switching from Alice to Bob would keep the \`ChatWindow\`'s internal state: typed draft messages, scroll position, expanded image previews, etc. With \`{#key}\`, each contact gets a fresh chat window. The draft you typed to Alice does not leak into Bob's conversation.

### When NOT to Use {#key} for This

Sometimes the state leak is actually **desirable**. If you want the user to switch between tabs without losing their work (like a multi-tab text editor), do NOT use \`{#key}\`. Instead, keep all instances alive simultaneously and toggle visibility with CSS or \`{#if}\`, or lift the state up into a parent store. \`{#key}\` is a blunt instrument -- it destroys everything. Use it when you want a clean slate, not when you want to preserve context.

## Use Case 2: Triggering Enter Transitions on Data Change

This is a powerful pattern that combines \`{#key}\` with transitions. Normally, a transition only plays when an element enters or leaves the DOM via \`{#if}\` or \`{#each}\`. But what if you want an element to animate every time its *content* changes, while staying continuously visible?

\`\`\`svelte
<script lang="ts">
  import { fly } from 'svelte/transition';
  let count = $state(0);
</script>

<button onclick={() => count++}>Increment</button>

{#key count}
  <p transition:fly={{ y: -20, duration: 300 }}>{count}</p>
{/key}
\`\`\`

Every time \`count\` changes, the old \`<p>\` element is destroyed (plays its outro: flies up and fades) and a new \`<p>\` is created (plays its intro: flies in from above). The visual effect is that each new number animates in, replacing the old one. This creates an engaging counter animation that would be very difficult to achieve otherwise.

This pattern is used extensively in:
- **Notification systems** where each new message flies/fades in
- **Image carousels** where changing the current image triggers a slide transition
- **Score displays** in games where points animate with each change
- **Tab content** where switching tabs triggers a smooth content transition

## Use Case 3: Force Re-initialization of Third-Party Libraries

Some third-party libraries initialize themselves by reading the DOM on mount and caching measurements. If the data changes but the DOM element is reused, the library does not know it needs to reinitialize. \`{#key}\` solves this by giving the library a fresh DOM element each time:

\`\`\`svelte
{#key chartData}
  <div use:initChart={chartData}></div>
{/key}
\`\`\`

When \`chartData\` changes, the old \`<div>\` (with its stale chart instance) is destroyed, and a new \`<div>\` is created. The \`use:initChart\` action runs fresh on the new element, initializing the chart library with the new data. This is cleaner than trying to imperatively call \`chart.update()\` or \`chart.destroy()\` and hoping you handle every edge case.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'xray-prompt',
			content: `Consider the performance implications of {#key}. When the key changes, Svelte runs the full destroy cycle (outro transitions, effect cleanup, DOM removal) and the full create cycle (DOM creation, intro transitions, effect initialization). For a simple <p> tag, this is trivial. But what if the {#key} block wraps a complex component tree with 50 child components, each with their own effects, subscriptions, and DOM trees? Every key change triggers 50 destructions and 50 creations. Compare this cost to the alternative: keeping the component alive and manually resetting its state via a $effect that watches the key. When is the {#key} approach worth the cost, and when should you opt for manual reset logic?`
		},
		{
			type: 'text',
			content: `## Performance Implications: When {#key} Is Too Expensive

\`{#key}\` is conceptually elegant but computationally expensive for complex subtrees. Every key change triggers:

1. **Outro transitions** on all transitioning elements (runs animation frames)
2. **Effect cleanup** for every \`$effect\` in every child component
3. **DOM removal** of the entire subtree (can trigger layout/reflow)
4. **DOM creation** of the entire new subtree (allocates new DOM nodes)
5. **Effect initialization** for every \`$effect\` in every new child component
6. **Intro transitions** on all transitioning elements

For a small subtree (a few elements, maybe one child component), this is negligible. For a large subtree (a data table with 100 rows, a rich text editor, a complex form with validation), this can cause visible jank.

### Decision Framework: {#key} vs Manual Reset

| Scenario | Approach | Why |
|---|---|---|
| Simple display component | \`{#key}\` | Cheap to recreate, easy to reason about |
| Component with transitions on change | \`{#key}\` | Only way to retrigger enter transitions |
| Complex form with many fields | Manual reset via \`$effect\` | Avoids destroying/recreating all form elements |
| Third-party library integration | \`{#key}\` | Library expects fresh DOM, hard to reset manually |
| Component with expensive initialization | Manual reset | Avoid paying init cost repeatedly |
| List of items where selection changes | \`{#key}\` on wrapper | Each selection gets a clean slate cheaply |

### The Manual Reset Alternative

Instead of \`{#key}\`, you can reset state manually:

\`\`\`svelte
<script lang="ts">
  let { userId } = $props();
  let isEditing = $state(false);
  let draft = $state('');

  // Reset local state whenever userId changes
  $effect(() => {
    userId; // track this dependency
    isEditing = false;
    draft = '';
  });
</script>
\`\`\`

This keeps the component instance alive (no destroy/create cycle) but requires you to manually identify and reset every piece of state. It is more performant but more error-prone -- if you add a new piece of state later and forget to reset it, you get a subtle bug.

### Combining {#key} with Transitions for Maximum Effect

The real power of \`{#key}\` becomes clear when you pair it with transitions to create polished UI flows:

\`\`\`svelte
<script lang="ts">
  import { fly } from 'svelte/transition';

  const characters = [
    { id: 1, name: 'Elena', class: 'Mage', hp: 120 },
    { id: 2, name: 'Krom', class: 'Warrior', hp: 200 },
    { id: 3, name: 'Sylas', class: 'Rogue', hp: 90 },
  ];

  let selectedId = $state(1);
  let character = $derived(characters.find(c => c.id === selectedId)!);
</script>

<div class="selector">
  {#each characters as char}
    <button
      class:active={selectedId === char.id}
      onclick={() => selectedId = char.id}
    >
      {char.name}
    </button>
  {/each}
</div>

{#key selectedId}
  <div class="profile" transition:fly={{ x: 200, duration: 300 }}>
    <h2>{character.name}</h2>
    <p>Class: {character.class}</p>
    <p>HP: {character.hp}</p>
  </div>
{/key}
\`\`\`

Each time the user selects a different character, the old profile card flies out to the right and the new one flies in from the right. The \`{#key}\` block makes this possible because the transition only triggers on DOM insertion/removal, and \`{#key}\` ensures insertion/removal happens on every value change.

**Your task:** Build a character profile viewer. Display a list of characters as buttons. When the user clicks a character, show their profile card with a fly-in transition. Use \`{#key}\` to ensure the transition plays on every character change, not just the first.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Common Pitfalls and Edge Cases

### Pitfall 1: Using Objects as Key Values

\`\`\`svelte
<!-- WRONG: Objects are compared by reference -->
{#key { id: userId }}
  <Profile {userId} />
{/key}
\`\`\`

This creates a new object literal on every render, so the key is *always* different, causing the subtree to be destroyed and recreated on **every single update** -- even when \`userId\` has not changed. Always use primitive values (strings, numbers) as key expressions.

### Pitfall 2: Expensive Key Expressions

\`\`\`svelte
<!-- CAUTION: This runs on every update cycle -->
{#key JSON.stringify(complexObject)}
  <ExpensiveComponent data={complexObject} />
{/key}
\`\`\`

\`JSON.stringify\` is called on every Svelte update cycle to check whether the key changed. For large objects, this can be slow. Prefer a simple identifier that represents the object (like an \`id\` field) rather than serializing the entire thing.

### Pitfall 3: Transition Conflicts with Key Blocks

When a \`{#key}\` block changes, both the outro of the old subtree and the intro of the new subtree run simultaneously. If both elements occupy the same space, they will overlap during the transition. Handle this with:

- **Absolute positioning** so both can coexist briefly
- **delay** on the intro to wait for the outro to finish
- Or embrace the overlap as a deliberate crossfade effect

\`\`\`svelte
<div class="transition-container" style="position: relative;">
  {#key selectedId}
    <div
      style="position: absolute; width: 100%;"
      transition:fly={{ x: 200, duration: 300 }}
    >
      <!-- Content -->
    </div>
  {/key}
</div>
\`\`\`

### Pitfall 4: Nested {#key} Blocks

You can nest \`{#key}\` blocks, but be careful about cascading destruction:

\`\`\`svelte
{#key outerKey}
  <!-- Destroyed when outerKey changes -->
  {#key innerKey}
    <!-- Destroyed when EITHER outerKey OR innerKey changes -->
    <Component />
  {/key}
{/key}
\`\`\`

If \`outerKey\` changes, the inner \`{#key}\` block and all its contents are destroyed regardless of \`innerKey\`. This is usually the desired behavior, but be aware that the inner component will be recreated even if \`innerKey\` is the same.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import fly from 'svelte/transition'

  const characters = [
    { id: 1, name: 'Elena', class: 'Mage', hp: 120, motto: 'Knowledge is the ultimate power.' },
    { id: 2, name: 'Krom', class: 'Warrior', hp: 200, motto: 'Strength through discipline.' },
    { id: 3, name: 'Sylas', class: 'Rogue', hp: 90, motto: 'Unseen, unheard, unstoppable.' },
  ];

  let selectedId = $state(1);
  let character = $derived(characters.find(c => c.id === selectedId)!);
</script>

<div class="app">
  <h1>Character Viewer</h1>

  <nav class="character-nav">
    {#each characters as char}
      <button
        class="nav-btn"
        class:active={selectedId === char.id}
        onclick={() => selectedId = char.id}
      >
        {char.name}
      </button>
    {/each}
  </nav>

  <!-- TODO: Wrap this profile card in a {#key} block keyed on selectedId -->
  <!-- TODO: Add a fly transition to the profile card -->
  <div class="profile-card">
    <h2>{character.name}</h2>
    <div class="stats">
      <span class="badge">{character.class}</span>
      <span class="badge hp">HP: {character.hp}</span>
    </div>
    <p class="motto">"{character.motto}"</p>
  </div>
</div>

<style>
  .app {
    font-family: system-ui, sans-serif;
    max-width: 500px;
    margin: 2rem auto;
    padding: 1rem;
  }

  h1 {
    color: #1e293b;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .character-nav {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .nav-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #e2e8f0;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    color: #64748b;
    transition: all 0.15s;
  }

  .nav-btn:hover {
    border-color: #6366f1;
    color: #6366f1;
  }

  .nav-btn.active {
    background: #6366f1;
    border-color: #6366f1;
    color: white;
  }

  .profile-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .profile-card h2 {
    margin: 0 0 0.75rem;
    color: #1e293b;
  }

  .stats {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    background: #ede9fe;
    color: #6366f1;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .badge.hp {
    background: #fee2e2;
    color: #ef4444;
  }

  .motto {
    color: #64748b;
    font-style: italic;
    margin: 0;
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
  import { fly } from 'svelte/transition';

  const characters = [
    { id: 1, name: 'Elena', class: 'Mage', hp: 120, motto: 'Knowledge is the ultimate power.' },
    { id: 2, name: 'Krom', class: 'Warrior', hp: 200, motto: 'Strength through discipline.' },
    { id: 3, name: 'Sylas', class: 'Rogue', hp: 90, motto: 'Unseen, unheard, unstoppable.' },
  ];

  let selectedId = $state(1);
  let character = $derived(characters.find(c => c.id === selectedId)!);
</script>

<div class="app">
  <h1>Character Viewer</h1>

  <nav class="character-nav">
    {#each characters as char}
      <button
        class="nav-btn"
        class:active={selectedId === char.id}
        onclick={() => selectedId = char.id}
      >
        {char.name}
      </button>
    {/each}
  </nav>

  {#key selectedId}
    <div class="profile-card" transition:fly={{ x: 200, duration: 300 }}>
      <h2>{character.name}</h2>
      <div class="stats">
        <span class="badge">{character.class}</span>
        <span class="badge hp">HP: {character.hp}</span>
      </div>
      <p class="motto">"{character.motto}"</p>
    </div>
  {/key}
</div>

<style>
  .app {
    font-family: system-ui, sans-serif;
    max-width: 500px;
    margin: 2rem auto;
    padding: 1rem;
  }

  h1 {
    color: #1e293b;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .character-nav {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .nav-btn {
    padding: 0.5rem 1rem;
    border: 2px solid #e2e8f0;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    color: #64748b;
    transition: all 0.15s;
  }

  .nav-btn:hover {
    border-color: #6366f1;
    color: #6366f1;
  }

  .nav-btn.active {
    background: #6366f1;
    border-color: #6366f1;
    color: white;
  }

  .profile-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .profile-card h2 {
    margin: 0 0 0.75rem;
    color: #1e293b;
  }

  .stats {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    background: #ede9fe;
    color: #6366f1;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
  }

  .badge.hp {
    background: #fee2e2;
    color: #ef4444;
  }

  .motto {
    color: #64748b;
    font-style: italic;
    margin: 0;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Wrap the profile card in a {#key} block keyed on selectedId',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#key selectedId}' },
						{ type: 'contains', value: '{/key}' }
					]
				}
			},
			hints: [
				'The `{#key expression}` block watches the expression and destroys/recreates its contents when the value changes. Wrap the profile card `<div>` with `{#key selectedId}...{/key}`.',
				'Place `{#key selectedId}` right before the `<div class="profile-card">` and `{/key}` right after the closing `</div>` of the profile card.',
				'Full pattern: `{#key selectedId}<div class="profile-card">...content...</div>{/key}`. Now click different characters -- the component is destroyed and recreated each time.'
			],
			conceptsTested: ['svelte5.control-flow.key', 'svelte5.control-flow.key-reset']
		},
		{
			id: 'cp-2',
			description: 'Add a fly transition to the profile card so it animates in on each character change',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#key' },
						{ type: 'contains', value: 'transition:fly' },
						{ type: 'contains', value: "svelte/transition" }
					]
				}
			},
			hints: [
				'Import `fly` from `svelte/transition` and add `transition:fly` to the profile card div inside the `{#key}` block.',
				'Use `transition:fly={{ x: 200, duration: 300 }}` on the `<div class="profile-card">` to make it slide in from the right.',
				'Full solution: Import `fly` at the top, then `<div class="profile-card" transition:fly={{ x: 200, duration: 300 }}>` inside the `{#key selectedId}` block. Each character change now triggers a fly-in animation.'
			],
			conceptsTested: ['svelte5.control-flow.key-transitions', 'svelte5.control-flow.key']
		}
	]
};
