import type { Lesson } from '$types/lesson';

export const flexboxFundamentals: Lesson = {
	id: 'foundations.css-layout.flexbox-fundamentals',
	slug: 'flexbox-fundamentals',
	title: 'Flexbox Fundamentals',
	description: 'Learn flex-direction, justify-content, align-items, and gap to build flexible one-dimensional layouts.',
	trackId: 'foundations',
	moduleId: 'css-layout',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['css.flexbox', 'css.flex-direction', 'css.alignment'],
	prerequisites: [],

	content: [
		{
			type: 'text',
			content: `# Flexbox Fundamentals

Flexbox is a one-dimensional layout system for arranging items in rows or columns. It is the most commonly used layout mechanism in modern CSS — you will use it on virtually every component you build.

Key concepts:
- **\`display: flex\`** — Activates flexbox on a container
- **\`flex-direction\`** — Row (default) or column
- **\`justify-content\`** — Alignment along the main axis
- **\`align-items\`** — Alignment along the cross axis
- **\`gap\`** — Space between flex items

## WHY: The Main Axis / Cross Axis Model

Flexbox uses a two-axis system instead of the traditional top/right/bottom/left model. This is initially confusing but becomes powerful once understood.

**Why two axes instead of four directions?** Because flexbox can flow in any direction. When you set \`flex-direction: row\`, the main axis is horizontal and the cross axis is vertical. When you set \`flex-direction: column\`, the main axis is vertical and the cross axis is horizontal. The properties \`justify-content\` (main axis) and \`align-items\` (cross axis) work the same regardless of direction — you never need to remember "which property controls horizontal in column mode."

This abstraction means a navigation bar (\`flex-direction: row\`) and a sidebar menu (\`flex-direction: column\`) use identical alignment properties. You change one value (\`flex-direction\`) and the entire layout rotates.

## WHY: flex-grow, flex-shrink, and flex-basis

These three properties control how flex items share space. They are the most powerful and most misunderstood parts of flexbox.

**\`flex-basis\`** — The starting size of a flex item before growing or shrinking. Think of it as "ideal width" (in a row) or "ideal height" (in a column). It defaults to \`auto\`, which means "use my content size or explicit width/height."

**\`flex-grow\`** — How much an item should grow relative to siblings when there is extra space. Default is \`0\` (do not grow). \`flex-grow: 1\` means "take an equal share of leftover space."

**\`flex-shrink\`** — How much an item should shrink when there is not enough space. Default is \`1\` (shrink proportionally). \`flex-shrink: 0\` means "never shrink below my basis."

The shorthand \`flex: 1\` is equivalent to \`flex-grow: 1; flex-shrink: 1; flex-basis: 0%\` — this means "start at 0 size and take an equal share of all space." This is different from \`flex-grow: 1\` alone (which keeps the content-based basis).

\`\`\`css
/* Three items sharing space equally */
.item { flex: 1; }

/* Sidebar fixed at 250px, main content fills the rest */
.sidebar { flex: 0 0 250px; }  /* don't grow, don't shrink, 250px basis */
.main    { flex: 1; }           /* grow to fill remaining space */
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'css.flexbox'
		},
		{
			type: 'text',
			content: `## Creating a Flex Container

Any element becomes a flex container with \`display: flex\`. Its direct children become flex items.

Look at the starter code. The navigation items are stacked vertically because block elements stack by default.

**Task:** Add \`display: flex\` and \`gap: 1rem\` to the \`.nav\` container to lay items out horizontally.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Justify and Align

\`justify-content\` controls the main axis (horizontal in a row):
- \`flex-start\` — Pack items to the start (default)
- \`center\` — Center items
- \`flex-end\` — Pack items to the end
- \`space-between\` — Equal space between items, first and last flush to edges
- \`space-around\` — Equal space around each item (half-space on edges)
- \`space-evenly\` — Equal space between and around items

\`align-items\` controls the cross axis (vertical in a row):
- \`stretch\` — Items stretch to fill container height (default)
- \`flex-start\` — Align to top
- \`center\` — Center vertically
- \`flex-end\` — Align to bottom
- \`baseline\` — Align text baselines (useful when items have different font sizes)

**Decision framework:** Use \`space-between\` when you want items to spread across the full width (like a nav bar with logo on left and links on right). Use \`center\` when you want items clustered together. Use \`gap\` with \`flex-start\` when you want consistent spacing without stretching.

**Task:** Set \`justify-content: space-between\` and \`align-items: center\` on the \`.nav\` container.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to visualize the flex container boundaries and how items are distributed along the main and cross axes. Notice the gap between items and how space-between pushes the first item to the left edge and the last item to the right edge. Try mentally flipping to flex-direction: column — justify-content would control vertical distribution instead.'
		},
		{
			type: 'text',
			content: `## Flex Wrapping and the min-width Gotcha

By default, flex items try to fit on one line, shrinking as needed. \`flex-wrap: wrap\` lets them wrap to the next line when they run out of space:

\`\`\`css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
\`\`\`

**The min-width gotcha:** Flex items have an implicit \`min-width: auto\`, which means they will not shrink below their content size. This causes unexpected overflow when content is wider than the container. A long URL or word can push a flex item beyond the container edge.

The fix:
\`\`\`css
.flex-item {
  min-width: 0;  /* Allow shrinking below content size */
}
/* Or for text content specifically: */
.flex-item {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
\`\`\`

This gotcha catches even experienced developers. If a flex layout is overflowing unexpectedly, check if a child has content wider than its allocated space, and add \`min-width: 0\` to the flex item.

**flex-wrap behavior detail:** When items wrap, \`align-content\` (not \`align-items\`) controls the spacing between rows. \`align-items\` controls item alignment within each row, while \`align-content\` controls the distribution of rows within the container.

**Task:** Add \`flex-wrap: wrap\` to the \`.cards\` container so cards wrap on smaller viewports.

## Realistic Exercise: Building a Navigation Bar

After completing the checkpoints, consider this common real-world layout:

A navigation bar with:
- Logo on the far left
- Navigation links centered
- User avatar on the far right

The approach:
1. \`display: flex\` and \`align-items: center\` on the nav container
2. Three child elements: logo, links wrapper, avatar
3. \`flex: 1\` on the links wrapper so it takes all available space
4. \`justify-content: center\` on the links wrapper to center the links
5. The logo and avatar stay at their natural sizes

This pattern — fixed elements on the sides, flexible center — is the most common flex layout in production applications.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let navItems = $state(['Home', 'About', 'Projects', 'Contact']);
  let cards = $state(['Design', 'Develop', 'Deploy']);
</script>

<nav class="nav">
  {#each navItems as item}
    <a href="#{item.toLowerCase()}">{item}</a>
  {/each}
</nav>

<section class="cards">
  {#each cards as card}
    <div class="card">
      <h3>{card}</h3>
      <p>Learn about the {card.toLowerCase()} phase.</p>
    </div>
  {/each}
</section>

<style>
  .nav {
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .nav a {
    color: var(--sf-accent, #6366f1);
    text-decoration: none;
    font-family: system-ui, sans-serif;
  }

  .cards {
    padding: 1rem;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    min-width: 200px;
    font-family: system-ui, sans-serif;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  /* TODO: Add flexbox properties */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let navItems = $state(['Home', 'About', 'Projects', 'Contact']);
  let cards = $state(['Design', 'Develop', 'Deploy']);
</script>

<nav class="nav">
  {#each navItems as item}
    <a href="#{item.toLowerCase()}">{item}</a>
  {/each}
</nav>

<section class="cards">
  {#each cards as card}
    <div class="card">
      <h3>{card}</h3>
      <p>Learn about the {card.toLowerCase()} phase.</p>
    </div>
  {/each}
</section>

<style>
  .nav {
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
  }

  .nav a {
    color: var(--sf-accent, #6366f1);
    text-decoration: none;
    font-family: system-ui, sans-serif;
  }

  .cards {
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    min-width: 200px;
    font-family: system-ui, sans-serif;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add display: flex and gap to the nav container',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'display: flex' },
						{ type: 'contains', value: 'gap: 1rem' }
					]
				}
			},
			hints: [
				'`display: flex` makes the container a flex container.',
				'`gap` adds space between flex items without margins.',
				'Add to `.nav`: `display: flex; gap: 1rem;`'
			],
			conceptsTested: ['css.flexbox']
		},
		{
			id: 'cp-2',
			description: 'Set justify-content and align-items on the nav',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'justify-content: space-between' },
						{ type: 'contains', value: 'align-items: center' }
					]
				}
			},
			hints: [
				'`justify-content` distributes items along the main axis.',
				'`space-between` places equal space between items, pushing the first and last to the edges.',
				'Add to `.nav`: `justify-content: space-between; align-items: center;`'
			],
			conceptsTested: ['css.alignment']
		},
		{
			id: 'cp-3',
			description: 'Add flex-wrap to the cards container',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'flex-wrap: wrap' }
					]
				}
			},
			hints: [
				'`flex-wrap: wrap` allows items to wrap to the next line.',
				'Add `display: flex`, `flex-wrap: wrap`, and `gap: 1rem` to `.cards`.',
				'Add to `.cards`: `display: flex; flex-wrap: wrap; gap: 1rem;`'
			],
			conceptsTested: ['css.flexbox']
		}
	]
};
