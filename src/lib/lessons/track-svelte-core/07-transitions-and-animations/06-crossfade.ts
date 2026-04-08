import type { Lesson } from '$types/lesson';

export const crossfadeTransition: Lesson = {
	id: 'svelte-core.transitions.crossfade',
	slug: 'crossfade',
	title: 'Crossfade — Shared Element Transitions',
	description:
		'Use svelte/transition\'s crossfade to animate elements between positions when they move across the DOM — perfect for kanban boards, todo filters, and any UI where items migrate between containers.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 6,
	estimatedMinutes: 20,
	concepts: ['svelte5.transitions.crossfade', 'svelte5.transitions.animate'],
	prerequisites: ['svelte5.transitions.basics', 'svelte5.control-flow.each'],

	content: [
		{
			type: 'text',
			content: `# Crossfade — Shared Element Transitions

When a todo item moves from the "pending" list to the "completed" list, a naive implementation just removes it from one list and adds it to the other. The item disappears and reappears. It works, but it feels jarring.

A **shared element transition** makes the item appear to fly across the screen from its old position to its new position. This is called a crossfade. Svelte's \`crossfade\` function from \`svelte/transition\` makes this trivially simple.

## How Crossfade Works

\`crossfade\` returns a pair of transitions: \`send\` and \`receive\`.

- When an element is removed from the DOM (and another element with the same key is being added elsewhere), it **sends** itself to the new location — it visually flies from the old position to the new one and fades out.
- The element appearing in the new location **receives** the flying element — it appears at the destination and fades in.

If there is no matching element on the other side (the item is just being removed, not moved), a fallback transition fires instead.

\`\`\`svelte
<script>
  import { crossfade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  const [send, receive] = crossfade({
    duration: 400,
    easing: quintOut,
    fallback(node) {
      // Fires when there is no matching counterpart
      return { duration: 300 };
    }
  });
</script>
\`\`\`

## Applying Send and Receive

The key insight: the element leaving the DOM uses \`out:send\` and the element appearing uses \`in:receive\`. Both transitions share a \`key\` — the item's unique identifier — which is how Svelte knows they are "the same thing" moving between positions.

\`\`\`svelte
{#each pendingItems as item (item.id)}
  <div
    in:receive={{ key: item.id }}
    out:send={{ key: item.id }}
    animate:flip={{ duration: 200 }}
  >
    {item.text}
  </div>
{/each}

{#each completedItems as item (item.id)}
  <div
    in:receive={{ key: item.id }}
    out:send={{ key: item.id }}
    animate:flip={{ duration: 200 }}
  >
    <del>{item.text}</del>
  </div>
{/each}
\`\`\`

When you mark an item as complete, it flies from the pending list to the completed list. The magic is that **no JavaScript motion code** is written — just transition directives and a shared key.

## Combining with \`animate:flip\`

When an item moves out of a list, the other items in that list jump to fill the gap. Without \`animate:flip\`, this jump is instant. With \`animate:flip\`, each remaining item smoothly slides into its new position. Always use them together for the most polished result:

\`\`\`svelte
<script>
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';

  const [send, receive] = crossfade({ duration: 400 });
</script>

{#each items as item (item.id)}
  <div
    in:receive={{ key: item.id }}
    out:send={{ key: item.id }}
    animate:flip={{ duration: 200 }}
  >
    {item.text}
  </div>
{/each}
\`\`\`

## The Fallback Transition

If a crossfade has no matching counterpart — for example, you delete an item instead of moving it — the fallback transition fires. Configure it in the \`crossfade\` options:

\`\`\`ts
const [send, receive] = crossfade({
  duration: 400,
  easing: quintOut,
  fallback(node, params, intro) {
    // node = the DOM element
    // intro = true if entering, false if leaving
    return scale(node, { start: 0.8, duration: 300 });
  }
});
\`\`\`

Without a \`fallback\`, items that are truly added/removed (not moved) have no animation. The fallback lets you define behaviour for both cases.

## A Complete Kanban Example

\`\`\`svelte
<script>
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';

  const [send, receive] = crossfade({ duration: 350, easing: quintOut });

  let columns = $state({
    todo:       [{ id: 1, text: 'Design mockups' }, { id: 2, text: 'Write tests' }],
    inProgress: [{ id: 3, text: 'Build auth' }],
    done:       [{ id: 4, text: 'Set up project' }]
  });

  function move(id, from, to) {
    const item = columns[from].find(i => i.id === id);
    columns[from] = columns[from].filter(i => i.id !== id);
    columns[to] = [...columns[to], item];
  }
</script>

{#each Object.entries(columns) as [col, items] (col)}
  <div class="column">
    <h3>{col}</h3>
    {#each items as item (item.id)}
      <div
        class="card"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 200 }}
      >
        {item.text}
        {#if col !== 'done'}
          <button onclick={() => move(item.id, col, col === 'todo' ? 'inProgress' : 'done')}>
            →
          </button>
        {/if}
      </div>
    {/each}
  </div>
{/each}
\`\`\``
		},
		{
			type: 'checkpoint',
			content: 'cp-crossfade-setup'
		},
		{
			type: 'checkpoint',
			content: 'cp-crossfade-flip'
		},
		{
			type: 'xray-prompt',
			content: 'Open X-Ray and watch the DOM while you move items between lists. Notice that crossfade is not moving the element in the DOM — it creates a temporary clone positioned with `position: fixed`, animates it from the source coordinates to the destination coordinates, then swaps it out. This is the FLIP technique (First, Last, Invert, Play) implemented transparently.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { flip } from 'svelte/animate';

  // TODO: Import crossfade from 'svelte/transition'
  // TODO: Create [send, receive] pair with duration: 400

  let pending = $state([
    { id: 1, text: 'Learn crossfade transitions' },
    { id: 2, text: 'Build a kanban board' },
    { id: 3, text: 'Ship to production' },
    { id: 4, text: 'Write documentation' },
  ]);

  let completed = $state([]);

  function complete(id) {
    const item = pending.find(i => i.id === id);
    if (item) {
      pending = pending.filter(i => i.id !== id);
      completed = [...completed, item];
    }
  }

  function uncomplete(id) {
    const item = completed.find(i => i.id === id);
    if (item) {
      completed = completed.filter(i => i.id !== id);
      pending = [...pending, item];
    }
  }
</script>

<div class="app">
  <div class="column">
    <h2>📋 Todo ({pending.length})</h2>
    {#each pending as item (item.id)}
      <!-- TODO: Add in:receive and out:send with key: item.id -->
      <!-- TODO: Add animate:flip -->
      <div class="card">
        <span>{item.text}</span>
        <button onclick={() => complete(item.id)}>✓</button>
      </div>
    {/each}
  </div>

  <div class="column">
    <h2>✅ Done ({completed.length})</h2>
    {#each completed as item (item.id)}
      <!-- TODO: Add in:receive and out:send with key: item.id -->
      <!-- TODO: Add animate:flip -->
      <div class="card done">
        <span>{item.text}</span>
        <button onclick={() => uncomplete(item.id)}>↩</button>
      </div>
    {/each}
  </div>
</div>

<style>
  .app { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 700px; margin: 2rem auto; font-family: system-ui, sans-serif; }
  .column h2 { font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.75rem; }
  .card { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .card.done { background: #f0fdf4; border-color: #86efac; text-decoration: line-through; color: #86efac; }
  .card span { font-size: 0.875rem; color: #475569; }
  .card.done span { color: #86efac; }
  button { padding: 0.25rem 0.6rem; border: 1px solid #d1d5db; border-radius: 5px; background: white; cursor: pointer; font-size: 0.75rem; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';

  const [send, receive] = crossfade({
    duration: 400,
    easing: quintOut,
    fallback(node) {
      return { duration: 300 };
    }
  });

  let pending = $state([
    { id: 1, text: 'Learn crossfade transitions' },
    { id: 2, text: 'Build a kanban board' },
    { id: 3, text: 'Ship to production' },
    { id: 4, text: 'Write documentation' },
  ]);

  let completed = $state([]);

  function complete(id) {
    const item = pending.find(i => i.id === id);
    if (item) {
      pending = pending.filter(i => i.id !== id);
      completed = [...completed, item];
    }
  }

  function uncomplete(id) {
    const item = completed.find(i => i.id === id);
    if (item) {
      completed = completed.filter(i => i.id !== id);
      pending = [...pending, item];
    }
  }
</script>

<div class="app">
  <div class="column">
    <h2>📋 Todo ({pending.length})</h2>
    {#each pending as item (item.id)}
      <div
        class="card"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 200 }}
      >
        <span>{item.text}</span>
        <button onclick={() => complete(item.id)}>✓</button>
      </div>
    {/each}
  </div>

  <div class="column">
    <h2>✅ Done ({completed.length})</h2>
    {#each completed as item (item.id)}
      <div
        class="card done"
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
        animate:flip={{ duration: 200 }}
      >
        <span>{item.text}</span>
        <button onclick={() => uncomplete(item.id)}>↩</button>
      </div>
    {/each}
  </div>
</div>

<style>
  .app { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 700px; margin: 2rem auto; font-family: system-ui, sans-serif; }
  .column h2 { font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.75rem; }
  .card { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: white; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .card.done { background: #f0fdf4; border-color: #86efac; }
  .card span { font-size: 0.875rem; color: #475569; }
  .card.done span { color: #22c55e; text-decoration: line-through; }
  button { padding: 0.25rem 0.6rem; border: 1px solid #d1d5db; border-radius: 5px; background: white; cursor: pointer; font-size: 0.75rem; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-crossfade-setup',
			description: 'Create the crossfade [send, receive] pair and apply the transitions',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'crossfade' },
						{ type: 'contains', value: 'in:receive' },
						{ type: 'contains', value: 'out:send' },
						{ type: 'contains', value: 'key: item.id' }
					]
				}
			},
			hints: [
				'`const [send, receive] = crossfade({ duration: 400 })` — destructure the pair.',
				'Apply `in:receive={{ key: item.id }}` and `out:send={{ key: item.id }}` to each card in BOTH lists.',
				'The `key` must be the same on both sides — it is how Svelte matches the leaving element with the arriving one.'
			],
			conceptsTested: ['svelte5.transitions.crossfade']
		},
		{
			id: 'cp-crossfade-flip',
			description: 'Add animate:flip to smooth out the reordering of remaining items',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'animate:flip' }
					]
				}
			},
			hints: [
				'Import `flip` from `svelte/animate` and add `animate:flip={{ duration: 200 }}` to each card element.',
				'`animate:flip` fires on elements that remain in the list when a sibling is added or removed — it smoothly shifts them into position.',
				'Without `flip`, the remaining items jump instantly to fill the gap left by the moved item.'
			],
			conceptsTested: ['svelte5.transitions.animate', 'svelte5.transitions.crossfade']
		}
	]
};
