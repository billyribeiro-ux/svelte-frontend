import type { Lesson } from '$types/lesson';

export const staggeredAnimations: Lesson = {
	id: 'svelte-core.transitions.staggered',
	slug: 'staggered-animations',
	title: 'Staggered Animations — Cascading Entry Effects',
	description:
		'Build stunning cascading list, grid, and card entry animations using index-based delay, scroll-triggered stagger with IntersectionObserver, and reactive stagger orchestration with $derived.',
	trackId: 'svelte-core',
	moduleId: 'transitions-and-animations',
	order: 9,
	estimatedMinutes: 20,
	concepts: ['svelte5.transitions.stagger', 'svelte5.transitions.fly', 'svelte5.actions.basics'],
	prerequisites: ['svelte5.transitions.basics', 'svelte5.control-flow.each', 'svelte5.actions.basics'],

	content: [
		{
			type: 'text',
			content: `# Staggered Animations — Cascading Entry Effects

When a list of items enters the screen all at once, even with transitions, it can feel monotonous. **Staggered animations** cascade the entries — each item starts its transition slightly after the previous one. The result is a wave of motion that guides the eye and communicates order.

## The Simplest Stagger — \`delay\` by Index

Every Svelte transition accepts a \`delay\` parameter in milliseconds. Inside \`{#each}\`, you get the item's index:

\`\`\`svelte
{#each items as item, i}
  <div in:fly={{ y: 20, duration: 400, delay: i * 60 }}>
    {item.name}
  </div>
{/each}
\`\`\`

Item 0 starts immediately, item 1 starts after 60ms, item 2 after 120ms, and so on. This creates a natural cascade from top to bottom.

## Tuning the Stagger Feel

The stagger delay controls the rhythm of the cascade:

\`\`\`ts
// Slow stagger — each item has time to mostly complete before the next starts (dramatic)
delay: i * 150

// Medium stagger — overlapping animations, feels fluid (most common)
delay: i * 60

// Fast stagger — nearly simultaneous, just a ripple (for many items)
delay: i * 30

// Maximum items to stagger (prevent very long waits for large lists)
delay: Math.min(i, 10) * 60
\`\`\`

**Always cap the stagger** when the list could be long — otherwise item 50 waits 3 full seconds before entering. Use \`Math.min(i, 8)\` or similar to cap at a maximum offset.

## Stagger from Top and Bottom (Meeting in Middle)

For grids, stagger from both edges toward the center:

\`\`\`svelte
{#each items as item, i}
  {@const center = Math.floor(items.length / 2)}
  {@const dist = Math.abs(i - center)}
  <div in:fly={{ y: 20, delay: dist * 50, duration: 400 }}>
    {item.name}
  </div>
{/each}
\`\`\`

## Stagger with Different Directions per Column

For a grid layout where you want columns to animate independently:

\`\`\`svelte
{#each items as item, i}
  {@const col = i % 3}
  {@const row = Math.floor(i / 3)}
  <div in:fly={{ y: 20 + row * 10, delay: col * 80, duration: 400 }}>
    {item.name}
  </div>
{/each}
\`\`\`

This staggers by column — all items in column 0 start immediately, column 1 after 80ms, column 2 after 160ms — creating a left-to-right cascade.

## Scroll-Triggered Stagger with IntersectionObserver

The stagger above fires when the component mounts. For long pages, you want items to stagger when they **scroll into view**. Combine a custom action with \`IntersectionObserver\`:

\`\`\`ts
// actions/stagger-reveal.ts
interface StaggerOptions {
  delay?: number;
  duration?: number;
  threshold?: number;
}

export function staggerReveal(node: Element, { delay = 0, duration = 500, threshold = 0.1 }: StaggerOptions = {}) {
  node.style.opacity = '0';
  node.style.transform = 'translateY(24px)';
  node.style.transition = \`opacity \${duration}ms \${delay}ms cubic-bezier(0.16, 1, 0.3, 1),
                           transform \${duration}ms \${delay}ms cubic-bezier(0.16, 1, 0.3, 1)\`;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
        observer.disconnect(); // animate once
      }
    },
    { threshold }
  );

  observer.observe(node);
  return { destroy() { observer.disconnect(); } };
}
\`\`\`

Use it in your template with per-item delay:

\`\`\`svelte
{#each items as item, i}
  <div use:staggerReveal={{ delay: Math.min(i, 6) * 80 }}>
    {item.name}
  </div>
{/each}
\`\`\`

This approach is **much more efficient** for long pages — it does not animate items that are not visible, and items below the fold animate when the user scrolls to them.

## Reactive Stagger — Animating on Data Change

When new items are added to a reactive list, you want only the new items to stagger in (not re-animate existing ones):

\`\`\`svelte
<script>
  import { fly } from 'svelte/transition';

  let items = $state([
    { id: 1, text: 'First item', isNew: false },
    { id: 2, text: 'Second item', isNew: false }
  ]);

  let nextId = 3;
  function addItems() {
    const newItems = [
      { id: nextId++, text: \`Item \${nextId - 2}\`, isNew: true },
      { id: nextId++, text: \`Item \${nextId - 2}\`, isNew: true }
    ];
    items = [...items, ...newItems];

    // Clear the isNew flag after animation completes
    setTimeout(() => {
      items = items.map(i => ({ ...i, isNew: false }));
    }, 800);
  }
</script>

{#each items as item, i (item.id)}
  <div in:fly={{ y: 20, delay: item.isNew ? (items.length - 1 - i) * 60 : 0 }}>
    {item.text}
  </div>
{/each}
\`\`\`

By tracking which items are new, only the freshly added items stagger in. Existing items stay put.

## Performance: \`will-change\` and Composited Properties

Staggering many items can be expensive if each triggers layout. Keep transitions composited:

\`\`\`css
/* Only animate transform and opacity — GPU-composited, no layout cost */
.stagger-item {
  will-change: transform, opacity;
}
\`\`\`

Never animate \`width\`, \`height\`, \`top\`, \`left\`, \`margin\`, or \`padding\` in stagger animations — these trigger layout recalculation on every frame for every item simultaneously.

Use CSS \`transform: translateY()\` and \`opacity\` exclusively. Svelte's built-in \`fly\` transition already does this correctly.`
		},
		{
			type: 'checkpoint',
			content: 'cp-stagger-basic'
		},
		{
			type: 'checkpoint',
			content: 'cp-stagger-scroll'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script>
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  const features = [
    { icon: '⚡', title: 'Blazing Fast', desc: 'No virtual DOM — Svelte compiles away.' },
    { icon: '🎯', title: 'Precise Reactivity', desc: 'Fine-grained signals update only what changed.' },
    { icon: '🎨', title: 'Beautiful Animations', desc: 'First-class transitions with zero config.' },
    { icon: '📦', title: 'Tiny Bundles', desc: 'Ship less JavaScript than any other framework.' },
    { icon: '🔒', title: 'Type Safe', desc: 'Full TypeScript support built in.' },
    { icon: '🌍', title: 'SSR Ready', desc: 'SvelteKit makes server rendering trivial.' },
  ];

  // Part 2: Scroll-triggered stagger action
  function staggerReveal(node, { delay = 0 } = {}) {
    // TODO: Implement IntersectionObserver-based reveal
    // Set opacity:0 and translateY(24px) initially
    // When intersecting, animate to opacity:1 and translateY(0)
    // Use CSS transitions with the delay parameter
  }
</script>

<!-- Part 1: Basic stagger — add delay: i * 70 to each card -->
<div class="hero">
  <h1>Why Svelte?</h1>
  <div class="grid">
    {#each features as feature, i}
      <!-- TODO: Add in:fly with staggered delay based on index i -->
      <div class="card">
        <div class="icon">{feature.icon}</div>
        <h3>{feature.title}</h3>
        <p>{feature.desc}</p>
      </div>
    {/each}
  </div>
</div>

<!-- Part 2: Scroll stagger (for a long page scenario) -->
<div class="scroll-section">
  <h2>Scroll-triggered stagger</h2>
  {#each Array.from({ length: 12 }, (_, i) => i + 1) as n, i}
    <!-- TODO: Add use:staggerReveal with delay: i * 60 -->
    <div class="scroll-item">
      Item {n}
    </div>
  {/each}
</div>

<style>
  .hero { max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  h1 { text-align: center; font-size: 2rem; margin-bottom: 2rem; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .card { padding: 1.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
  .icon { font-size: 2rem; margin-bottom: 0.5rem; }
  h3 { margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600; }
  p { margin: 0; font-size: 0.8rem; color: #64748b; line-height: 1.5; }
  .scroll-section { max-width: 400px; margin: 3rem auto; padding: 0 1rem; }
  h2 { font-size: 1.25rem; margin-bottom: 1rem; }
  .scroll-item { padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 0.5rem; font-size: 0.875rem; }
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

  const features = [
    { icon: '⚡', title: 'Blazing Fast', desc: 'No virtual DOM — Svelte compiles away.' },
    { icon: '🎯', title: 'Precise Reactivity', desc: 'Fine-grained signals update only what changed.' },
    { icon: '🎨', title: 'Beautiful Animations', desc: 'First-class transitions with zero config.' },
    { icon: '📦', title: 'Tiny Bundles', desc: 'Ship less JavaScript than any other framework.' },
    { icon: '🔒', title: 'Type Safe', desc: 'Full TypeScript support built in.' },
    { icon: '🌍', title: 'SSR Ready', desc: 'SvelteKit makes server rendering trivial.' },
  ];

  function staggerReveal(node, { delay = 0, duration = 500 } = {}) {
    node.style.opacity = '0';
    node.style.transform = 'translateY(24px)';
    node.style.transition = \`opacity \${duration}ms \${delay}ms cubic-bezier(0.16,1,0.3,1), transform \${duration}ms \${delay}ms cubic-bezier(0.16,1,0.3,1)\`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.style.opacity = '1';
          node.style.transform = 'translateY(0)';
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(node);
    return { destroy() { observer.disconnect(); } };
  }
</script>

<div class="hero">
  <h1>Why Svelte?</h1>
  <div class="grid">
    {#each features as feature, i}
      <div
        class="card"
        in:fly={{ y: 24, duration: 500, delay: i * 70, easing: cubicOut, opacity: 0 }}
      >
        <div class="icon">{feature.icon}</div>
        <h3>{feature.title}</h3>
        <p>{feature.desc}</p>
      </div>
    {/each}
  </div>
</div>

<div class="scroll-section">
  <h2>Scroll-triggered stagger</h2>
  {#each Array.from({ length: 12 }, (_, i) => i + 1) as n, i}
    <div
      class="scroll-item"
      use:staggerReveal={{ delay: Math.min(i, 6) * 60 }}
    >
      Item {n}
    </div>
  {/each}
</div>

<style>
  .hero { max-width: 800px; margin: 0 auto; padding: 2rem; font-family: system-ui, sans-serif; }
  h1 { text-align: center; font-size: 2rem; margin-bottom: 2rem; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .card { padding: 1.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
  .icon { font-size: 2rem; margin-bottom: 0.5rem; }
  h3 { margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600; }
  p { margin: 0; font-size: 0.8rem; color: #64748b; line-height: 1.5; }
  .scroll-section { max-width: 400px; margin: 3rem auto; padding: 0 1rem; }
  h2 { font-size: 1.25rem; margin-bottom: 1rem; }
  .scroll-item { padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 0.5rem; font-size: 0.875rem; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-stagger-basic',
			description: 'Add index-based delay to create a cascading card entrance',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'in:fly' },
						{ type: 'contains', value: 'delay' },
						{ type: 'contains', value: '* ' }
					]
				}
			},
			hints: [
				'Add `in:fly={{ y: 24, duration: 500, delay: i * 70 }}` to each card inside `{#each}`.',
				'The second argument of `{#each items as item, i}` gives you the 0-based index.',
				'For larger lists, cap the delay: `delay: Math.min(i, 8) * 70` — prevents item 20 from waiting 1.4 seconds.'
			],
			conceptsTested: ['svelte5.transitions.stagger', 'svelte5.transitions.fly']
		},
		{
			id: 'cp-stagger-scroll',
			description: 'Implement a staggerReveal action using IntersectionObserver for scroll-triggered animation',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'IntersectionObserver' },
						{ type: 'contains', value: 'staggerReveal' },
						{ type: 'contains', value: 'use:staggerReveal' }
					]
				}
			},
			hints: [
				'Set `node.style.opacity = "0"` and `node.style.transform = "translateY(24px)"` immediately in the action.',
				'Create an `IntersectionObserver` that sets opacity to 1 and transform to none when the element enters the viewport.',
				'Disconnect the observer after the first intersection — each item should only animate once.'
			],
			conceptsTested: ['svelte5.actions.basics', 'svelte5.transitions.stagger']
		}
	]
};
