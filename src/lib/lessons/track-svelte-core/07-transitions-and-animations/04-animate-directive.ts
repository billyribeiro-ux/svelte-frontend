import type { Lesson } from '$types/lesson';

export const animateDirective: Lesson = {
	id: 'svelte-core.transitions-and-animations.animate-directive',
	slug: 'animate-directive',
	title: 'The Animate Directive',
	description:
		'Use animate:flip for smooth reordering animations in keyed each blocks with the FLIP technique.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 4,
	estimatedMinutes: 12,
	concepts: ['svelte5.animations.flip', 'svelte5.animations.keyed-each'],
	prerequisites: ['svelte5.transitions.directive'],

	content: [
		{
			type: 'text',
			content: `# The Animate Directive

## WHY Reordering Animation is Hard

When items in a list change order, the naive DOM approach is to re-render: remove elements from old positions, insert at new positions. The result is an instant jump -- items teleport to their new locations. This is disorienting for users because they lose track of which item went where.

Animating reordering is one of the hardest problems in web animation because it requires:

1. **Measuring the old position** of every item before the reorder
2. **Applying the reorder** to the DOM (moving elements to their final positions)
3. **Measuring the new position** of every item after the reorder
4. **Calculating the delta** between old and new positions
5. **Applying a temporary transform** to snap each element back to its old visual position
6. **Animating the transform to zero** so elements smoothly move to their new positions

This sequence is called the **FLIP technique** (First, Last, Invert, Play), coined by Paul Lewis at Google. It is elegant in theory but tedious to implement manually because you need to coordinate with the framework's DOM reconciliation cycle -- you must measure *before* the DOM update and animate *after*.

Svelte's \`animate:\` directive automates the entire FLIP sequence. You import \`flip\` from \`svelte/animate\`, apply \`animate:flip\` to elements inside a keyed \`{#each}\` block, and Svelte handles everything.

### How FLIP Works Under the Hood

Let us trace through a concrete example. You have items [A, B, C] displayed vertically. The user clicks "shuffle" and the new order is [C, A, B].

**First (F):** Before the DOM updates, Svelte records the bounding rectangle (\`getBoundingClientRect()\`) of each keyed element: A at y=0, B at y=40, C at y=80.

**Last (L):** Svelte updates the DOM to reflect the new order. Now: C at y=0, A at y=40, B at y=80.

**Invert (I):** Svelte calculates the delta for each element. Element A moved from y=0 to y=40, so delta is -40px. Svelte applies \`transform: translateY(-40px)\` to A, visually snapping it back to its old position. Similarly for B and C.

**Play (P):** Svelte transitions \`transform\` from the inverted value to \`none\`, animating each element smoothly to its final DOM position.

The result: items appear to slide to their new positions, even though the DOM was updated instantly. The animation is pure visual deception using CSS transforms, which are GPU-accelerated.

### WHY Keyed Each Blocks Are Required

The \`animate:\` directive only works inside a **keyed** each block: \`{#each items as item (item.id)}\`. Without keys, Svelte cannot track which DOM element corresponds to which data item across reorders. It would not know that "the element that was showing A is now showing C" -- it would just see content changes, not position changes.

Keys give each item a stable identity. When the array reorders, Svelte matches old and new items by key, determines which DOM elements moved, and applies the FLIP technique to each one.

### The animate:flip Parameters

\`\`\`typescript
animate:flip={{ duration: 300 }}
// or with a function for distance-based duration:
animate:flip={{ duration: (d) => Math.sqrt(d) * 120 }}
\`\`\`

- \`duration\`: Fixed milliseconds, or a function receiving the pixel distance \`d\` the element needs to travel. Distance-based durations feel more natural because items that move farther take proportionally longer.
- \`delay\`: Milliseconds before animation starts.
- \`easing\`: Easing function (default: \`cubicOut\`).`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.animations.flip'
		},
		{
			type: 'text',
			content: `## Using animate:flip

\`\`\`svelte
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';

  let items = $state([
    { id: 1, name: 'First' },
    { id: 2, name: 'Second' },
    { id: 3, name: 'Third' }
  ]);

  function shuffle() {
    items.sort(() => Math.random() - 0.5);
  }
</script>

{#each items as item (item.id)}
  <div animate:flip={{ duration: 300 }} transition:fade>
    {item.name}
  </div>
{/each}
\`\`\`

### Building a Sortable List

A sortable list is the canonical application of \`animate:flip\`. The pattern combines:
- A keyed \`{#each}\` for stable identity tracking
- \`animate:flip\` for smooth reordering
- Array mutation methods (\`sort\`, \`splice\`, index swapping) to trigger reorders
- Optionally, \`in:\` and \`out:\` transitions for adding and removing items

The key insight is that you just manipulate the data array -- sort it, splice it, reverse it -- and Svelte automatically animates the resulting DOM changes. You never touch the DOM directly for animation purposes.

### Performance Characteristics

FLIP animations are inherently performant because they use CSS transforms, which are composited on the GPU. However, measuring bounding rectangles (\`getBoundingClientRect()\`) for every item before and after the reorder triggers a layout calculation. For lists with hundreds of items, this measurement phase can be expensive. In practice, lists under ~100 items animate smoothly; for larger lists, consider paginating or virtualizing.

**Your task:** Create a sortable list with \`animate:flip\` that smoothly animates when items are reordered. Use the shuffle function to trigger reorders and observe how items slide to their new positions.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Combining Animate with Transitions

The \`animate:\` directive handles **reordering** -- items moving to new positions within the list. But what about items being **added** or **removed**? That is where \`in:\` and \`out:\` transitions complement \`animate:flip\`.

When all three directives are combined on a single element:
- **New items** play their \`in:\` transition (e.g., fly in from the left)
- **Removed items** play their \`out:\` transition (e.g., fade out)
- **Remaining items** play their \`animate:flip\` animation to slide into their new positions (accounting for the space opened or closed by additions/removals)

This combination creates a fully animated list where every possible mutation -- add, remove, reorder -- produces smooth visual feedback.

### The Interaction Sequence

When you add an item:
1. The new DOM element is created at its target position
2. \`in:\` transition plays on the new element
3. All other elements whose positions changed (because the new element pushed them) play \`animate:flip\`

When you remove an item:
1. \`out:\` transition plays on the removed element
2. After the out transition completes, the element is removed from the DOM
3. Remaining elements whose positions changed (because the gap closed) play \`animate:flip\`

When you reorder:
1. DOM elements are moved to new positions
2. \`animate:flip\` plays on all elements that moved

### Decision Framework: When to Use animate:

Use \`animate:flip\` when:
- You have a list that can be **reordered** (sorted, shuffled, dragged)
- Items have **stable identities** (unique IDs)
- Users need to **track items visually** across position changes

Do not use \`animate:flip\` when:
- The list content changes but order is fixed (just use transitions)
- Items do not have stable identities (consider adding IDs)
- Performance is critical and the list has 100+ items (benchmark first)

**Task:** Add the ability to add and remove items from the list, with transitions for enter/exit and flip animation for reordering. Test all three operations -- add, remove, shuffle -- and observe how the animations compose naturally.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import flip from 'svelte/animate'
  // TODO: Import transitions

  let nextId = $state(4);
  let items = $state([
    { id: 1, name: 'Learn Svelte' },
    { id: 2, name: 'Build App' },
    { id: 3, name: 'Ship to Production' }
  ]);

  function shuffle() {
    items.sort(() => Math.random() - 0.5);
  }

  function addItem() {
    items.push({ id: nextId++, name: 'New Task #' + (nextId - 1) });
  }

  function removeItem(id: number) {
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) items.splice(index, 1);
  }
</script>

<div>
  <h2>Animated List</h2>

  <div class="actions">
    <button onclick={shuffle}>Shuffle</button>
    <button onclick={addItem}>Add Item</button>
  </div>

  <ul>
    {#each items as item (item.id)}
      <!-- TODO: Add animate:flip and transitions -->
      <li>
        <span>{item.name}</span>
        <button onclick={() => removeItem(item.id)}>x</button>
      </li>
    {/each}
  </ul>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  li button {
    background: #ef4444;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
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
  import { flip } from 'svelte/animate';
  import { fade, fly } from 'svelte/transition';

  let nextId = $state(4);
  let items = $state([
    { id: 1, name: 'Learn Svelte' },
    { id: 2, name: 'Build App' },
    { id: 3, name: 'Ship to Production' }
  ]);

  function shuffle() {
    items.sort(() => Math.random() - 0.5);
  }

  function addItem() {
    items.push({ id: nextId++, name: 'New Task #' + (nextId - 1) });
  }

  function removeItem(id: number) {
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) items.splice(index, 1);
  }
</script>

<div>
  <h2>Animated List</h2>

  <div class="actions">
    <button onclick={shuffle}>Shuffle</button>
    <button onclick={addItem}>Add Item</button>
  </div>

  <ul>
    {#each items as item (item.id)}
      <li animate:flip={{ duration: 300 }} in:fly={{ x: -100, duration: 300 }} out:fade={{ duration: 200 }}>
        <span>{item.name}</span>
        <button onclick={() => removeItem(item.id)}>x</button>
      </li>
    {/each}
  </ul>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .actions {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    margin: 0.25rem 0;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
  }

  li button {
    background: #ef4444;
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add animate:flip to the keyed each block items',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'animate:flip' },
						{ type: 'regex', value: '#each.*\\(item\\.id\\)' }
					]
				}
			},
			hints: [
				'Import `flip` from `svelte/animate`.',
				'Add `animate:flip={{ duration: 300 }}` to the `<li>` element inside the keyed each block.',
				'The each block must be keyed: `{#each items as item (item.id)}` and the li needs `animate:flip={{ duration: 300 }}`.'
			],
			conceptsTested: ['svelte5.animations.flip', 'svelte5.animations.keyed-each']
		},
		{
			id: 'cp-2',
			description: 'Combine animate:flip with in/out transitions for add/remove',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'animate:flip' },
						{ type: 'contains', value: 'in:' },
						{ type: 'contains', value: 'out:' }
					]
				}
			},
			hints: [
				'Add `in:fly` and `out:fade` alongside `animate:flip` on the li element.',
				'Use `in:fly={{ x: -100, duration: 300 }}` for enter and `out:fade` for exit.',
				'The li should have all three: `animate:flip={{ duration: 300 }} in:fly={{ x: -100, duration: 300 }} out:fade={{ duration: 200 }}`.'
			],
			conceptsTested: ['svelte5.animations.flip']
		}
	]
};
