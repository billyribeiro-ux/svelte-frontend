import type { Lesson } from '$types/lesson';

export const keyBlocks: Lesson = {
	id: 'svelte-core.control-flow.key-blocks',
	slug: 'key-blocks',
	title: 'The {#key} Block — Forcing Remounts',
	description:
		'Learn how {#key} destroys and recreates a component or element when an expression changes, enabling entrance animations on data updates and resetting component state.',
	trackId: 'svelte-core',
	moduleId: 'control-flow',
	order: 4,
	estimatedMinutes: 15,
	concepts: ['svelte5.control-flow.key'],
	prerequisites: ['svelte5.control-flow.if', 'svelte5.control-flow.each', 'svelte5.transitions.basics'],

	content: [
		{
			type: 'text',
			content: `# The \`{#key}\` Block

Svelte is efficient by default. When a reactive variable changes and triggers a re-render, Svelte tries to update the DOM in place — changing text content, updating attributes, toggling classes — without destroying and recreating elements. This is almost always what you want. Almost.

There are two situations where you need Svelte to **destroy** the old element/component and **create a fresh one**:

1. **You want an entrance animation to replay** when the data changes, not just on initial render.
2. **You want to reset a child component's internal state** when a prop changes.

Both are solved by the \`{#key}\` block.

## The Syntax

\`\`\`svelte
{#key expression}
  <!-- content that remounts whenever expression changes -->
{/key}
\`\`\`

Whenever \`expression\` changes, everything inside the \`{#key}\` block is torn down and rebuilt from scratch. Transitions fire on the new content as if it just appeared for the first time.

## Use Case 1 — Replaying Entrance Animations

Consider a "featured product" UI where clicking next shows a different product with a nice fly-in animation. Without \`{#key}\`, the animation only plays on the first render because Svelte updates the existing element in place:

\`\`\`svelte
<!-- ❌ animation only plays once -->
<div in:fly={{ y: 20 }}>
  {currentProduct.name}
</div>
\`\`\`

With \`{#key}\`, the element is destroyed and recreated each time \`currentProduct\` changes, so the animation fires every time:

\`\`\`svelte
<!-- ✅ animation replays on every product change -->
{#key currentProduct.id}
  <div in:fly={{ y: 20 }}>
    {currentProduct.name}
  </div>
{/key}
\`\`\`

The key expression should be something that uniquely identifies the "version" of the content. Using the product's \`id\` is perfect — it only changes when you switch to a genuinely different product.

## Use Case 2 — Resetting Child Component State

When you pass a different \`id\` prop to a child component, the component's internal \`$state\` does not automatically reset. Svelte reuses the existing component instance and just updates its props:

\`\`\`svelte
<!-- Child component has: let count = $state(0) -->

<!-- ❌ Switching users does NOT reset count to 0 in the child -->
<UserProfile userId={selectedUserId} />
\`\`\`

Wrap in \`{#key}\` to force a fresh instance:

\`\`\`svelte
<!-- ✅ Fresh UserProfile created (count reset to 0) every time userId changes -->
{#key selectedUserId}
  <UserProfile userId={selectedUserId} />
{/key}
\`\`\`

This is an important pattern for any component that holds local state derived from its initial props — for example, a form pre-populated with user data that should reset when you switch to editing a different user.`
		},
		{
			type: 'checkpoint',
			content: 'cp-key-animation'
		},
		{
			type: 'text',
			content: `## What Counts as a Good Key?

The expression inside \`{#key}\` should change **when and only when you want the remount to happen**. Good keys:

- A record's unique \`id\` field: \`{#key item.id}\`
- A derived string combining multiple identifiers: \`{#key \`\${trackId}-\${lessonId}\`}\`
- A counter you increment manually: \`{#key remountCount}\`

Avoid using expressions that change on every render (like \`Date.now()\` or a random number) — these would cause the content to remount every time the parent re-renders, which is almost never what you want.

## Out-Transitions During Remount

When the \`{#key}\` expression changes and the old content is destroyed, Svelte fires any \`out:\` transitions on it before removing it from the DOM. This gives you full control over both the exit and entrance:

\`\`\`svelte
{#key slide.id}
  <div in:fly={{ x: 100 }} out:fly={{ x: -100 }}>
    {slide.content}
  </div>
{/key}
\`\`\`

This creates a smooth left-to-right page transition: the old slide flies out to the left while the new slide flies in from the right — just like a native mobile app's page push animation, implemented in a handful of lines.

## Combining with \`{#each}\`

You can use \`{#key}\` inside \`{#each}\` to replay animations on individual list items when their content changes:

\`\`\`svelte
{#each scores as score (score.player)}
  {#key score.value}
    <span class="score" in:scale>
      {score.value}
    </span>
  {/key}
{/each}
\`\`\`

Every time a player's score changes, their score display scales in as a fresh element, making the update visually salient.`
		},
		{
			type: 'checkpoint',
			content: 'cp-key-component-reset'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray and watch the DOM tab as you click through products. Notice how the element inside `{#key}` is literally destroyed (removed from the DOM) and recreated on each change — versus an element outside `{#key}` which updates in place. This is the fundamental difference and the reason transitions fire again.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { fly, fade } from 'svelte/transition';

  const products = [
    { id: 1, name: 'Mechanical Keyboard', price: '$149', emoji: '⌨️', description: 'Tactile switches, aluminium chassis, 75% layout.' },
    { id: 2, name: 'Ergonomic Mouse',     price: '$89',  emoji: '🖱️', description: 'Vertical grip, 7 programmable buttons.' },
    { id: 3, name: 'USB-C Hub',           price: '$59',  emoji: '🔌', description: '7 ports: HDMI, USB-A×3, USB-C PD, SD, microSD.' },
    { id: 4, name: '4K Webcam',           price: '$179', emoji: '📷', description: 'f/2.0 aperture, 90° FOV, auto light correction.' },
  ];

  let index = $state(0);
  const product = $derived(products[index]);
</script>

<!-- TODO: Wrap the product card in a {#key} block so the fly animation replays on each product -->
<div class="card" in:fly={{ y: 30, duration: 400 }}>
  <div class="emoji">{product.emoji}</div>
  <h2>{product.name}</h2>
  <p>{product.description}</p>
  <span class="price">{product.price}</span>
</div>

<div class="nav">
  <button onclick={() => index = (index - 1 + products.length) % products.length}>← Prev</button>
  <span>{index + 1} / {products.length}</span>
  <button onclick={() => index = (index + 1) % products.length}>Next →</button>
</div>

<style>
  .card { max-width: 360px; margin: 2rem auto; padding: 2rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  .emoji { font-size: 3rem; margin-bottom: 0.5rem; }
  h2 { margin: 0 0 0.5rem; font-size: 1.25rem; }
  p { color: #64748b; font-size: 0.875rem; margin: 0 0 1rem; }
  .price { font-size: 1.5rem; font-weight: 700; color: #6366f1; }
  .nav { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1rem; max-width: 360px; margin-inline: auto; }
  .nav button { padding: 0.4rem 1rem; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  const products = [
    { id: 1, name: 'Mechanical Keyboard', price: '$149', emoji: '⌨️', description: 'Tactile switches, aluminium chassis, 75% layout.' },
    { id: 2, name: 'Ergonomic Mouse',     price: '$89',  emoji: '🖱️', description: 'Vertical grip, 7 programmable buttons.' },
    { id: 3, name: 'USB-C Hub',           price: '$59',  emoji: '🔌', description: '7 ports: HDMI, USB-A×3, USB-C PD, SD, microSD.' },
    { id: 4, name: '4K Webcam',           price: '$179', emoji: '📷', description: 'f/2.0 aperture, 90° FOV, auto light correction.' },
  ];

  let index = $state(0);
  const product = $derived(products[index]);
</script>

{#key product.id}
  <div class="card" in:fly={{ y: 30, duration: 400, easing: cubicOut }} out:fly={{ y: -30, duration: 250 }}>
    <div class="emoji">{product.emoji}</div>
    <h2>{product.name}</h2>
    <p>{product.description}</p>
    <span class="price">{product.price}</span>
  </div>
{/key}

<div class="nav">
  <button onclick={() => index = (index - 1 + products.length) % products.length}>← Prev</button>
  <span>{index + 1} / {products.length}</span>
  <button onclick={() => index = (index + 1) % products.length}>Next →</button>
</div>

<style>
  .card { max-width: 360px; margin: 2rem auto; padding: 2rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  .emoji { font-size: 3rem; margin-bottom: 0.5rem; }
  h2 { margin: 0 0 0.5rem; font-size: 1.25rem; }
  p { color: #64748b; font-size: 0.875rem; margin: 0 0 1rem; }
  .price { font-size: 1.5rem; font-weight: 700; color: #6366f1; }
  .nav { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1rem; max-width: 360px; margin-inline: auto; }
  .nav button { padding: 0.4rem 1rem; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-key-animation',
			description: 'Wrap the product card in a {#key product.id} block so the fly transition replays on each product change',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#key' },
						{ type: 'contains', value: 'product.id' },
						{ type: 'contains', value: 'in:fly' }
					]
				}
			},
			hints: [
				'Wrap the card `<div>` with `{#key product.id}` ... `{/key}`.',
				'The key expression should be something that uniquely identifies which product is showing — `product.id` is ideal.',
				'Make sure your `in:fly` directive is on the element INSIDE the `{#key}` block, not outside it.'
			],
			conceptsTested: ['svelte5.control-flow.key', 'svelte5.transitions.basics']
		},
		{
			id: 'cp-key-component-reset',
			description: 'Understand why {#key} resets child component state when the key changes',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#key' }
					]
				}
			},
			hints: [
				'When the key expression changes, Svelte destroys the component instance and creates a fresh one.',
				'This means all internal `$state` in the child component resets to its initial value.',
				'This is useful for forms, counters, or any component with local state that should reset when switching context.'
			],
			conceptsTested: ['svelte5.control-flow.key']
		}
	]
};
