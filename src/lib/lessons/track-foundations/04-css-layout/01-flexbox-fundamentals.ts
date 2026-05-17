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

Flexbox is a one-dimensional layout system for arranging items in rows or columns. It excels at distributing space among items in a container and aligning them along one or both axes.

## The Axis Model

Everything in flexbox revolves around two axes:

- **Main axis** — The primary axis along which flex items are laid out. By default this is horizontal (left to right), but \`flex-direction: column\` makes it vertical.
- **Cross axis** — The axis perpendicular to the main axis. If your main axis is horizontal, the cross axis is vertical, and vice versa.

This is the single most important concept in flexbox. Every alignment property targets one of these two axes:

| Property | Axis | What it controls |
|----------|------|-----------------|
| \`justify-content\` | Main | Distribution of items along the main axis |
| \`align-items\` | Cross | Alignment of items along the cross axis |
| \`align-content\` | Cross | Distribution of wrapped lines (only with \`flex-wrap\`) |
| \`align-self\` | Cross | Override of \`align-items\` for a single item |

When you switch \`flex-direction\` from \`row\` to \`column\`, the axes swap — and so does what \`justify-content\` and \`align-items\` control. \`justify-content\` always targets the main axis regardless of direction, so in a column layout it controls vertical distribution, not horizontal.

Key container properties:
- **\`display: flex\`** — Activates flexbox on a container
- **\`flex-direction\`** — Row (default) or column
- **\`justify-content\`** — Alignment along the main axis
- **\`align-items\`** — Alignment along the cross axis
- **\`gap\`** — Space between flex items`
		},
		{
			type: 'concept-callout',
			content: 'css.flexbox'
		},
		{
			type: 'text',
			content: `## Creating a Flex Container

Any element becomes a flex container with \`display: flex\`. Its direct children become flex items. This is a crucial point — only **direct** children are affected. Grandchildren and deeper descendants are not flex items unless their parent is also a flex container.

\`\`\`css
.nav {
  display: flex;
  gap: 1rem;
}
\`\`\`

The \`gap\` property adds space between items without using margins. This is cleaner than the old approach of \`margin-right\` on every item except the last one, because:

1. \`gap\` does not add space before the first item or after the last item
2. You do not need a \`:last-child\` override
3. It works with wrapping — gap between wrapped rows too (when using \`flex-wrap: wrap\`)

Look at the starter code. The navigation items are stacked vertically because block-level elements stack by default.

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
- \`flex-start\` — Pack items at the start (default)
- \`center\` — Center items
- \`flex-end\` — Pack items at the end
- \`space-between\` — Equal space between items, no space at edges
- \`space-around\` — Equal space around each item (half-space at edges)
- \`space-evenly\` — Truly equal space between and at edges

\`align-items\` controls the cross axis (vertical in a row):
- \`stretch\` — Items fill the container height (default)
- \`flex-start\` — Align to the top
- \`center\` — Center vertically
- \`flex-end\` — Align to the bottom
- \`baseline\` — Align text baselines (useful when items have different font sizes)

### The flex-grow, flex-shrink, and flex-basis Properties

These three properties control how individual items grow and shrink within the container:

**\`flex-basis\`** sets the initial size of a flex item before any growing or shrinking happens. It defaults to \`auto\`, which means "use the element's width (or height in a column)." Setting \`flex-basis: 200px\` makes the item start at 200px.

**\`flex-grow\`** determines how much of the remaining space an item should take. If all items have \`flex-grow: 1\`, they share space equally. If one item has \`flex-grow: 2\` and the rest have \`flex-grow: 1\`, the first item gets twice as much extra space.

**\`flex-shrink\`** determines how much an item should shrink when there is not enough space. Default is \`1\` (all items shrink equally). Setting \`flex-shrink: 0\` prevents an item from shrinking below its \`flex-basis\`.

The shorthand \`flex\` combines all three: \`flex: grow shrink basis\`.

\`\`\`css
.sidebar { flex: 0 0 250px; }  /* Don't grow, don't shrink, start at 250px */
.main    { flex: 1 1 0; }      /* Grow to fill, shrink if needed, no minimum */
\`\`\`

### The min-width Gotcha

Flex items have an implicit \`min-width: auto\` (or \`min-height: auto\` in a column). This means a flex item will never shrink smaller than its content. If you have a long word or a fixed-width image inside a flex item, the item will overflow its container rather than shrink.

The fix is explicit: \`min-width: 0\` on the flex item. This tells the browser "I know this item might clip its content, and that is fine."

\`\`\`css
.card-text {
  flex: 1;
  min-width: 0;           /* Allow shrinking past content size */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
\`\`\`

This gotcha trips up experienced developers regularly. If your flex layout is overflowing when you expect it to shrink, \`min-width: 0\` is almost always the answer.

**Task:** Set \`justify-content: space-between\` and \`align-items: center\` on the \`.nav\` container.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to visualize the flex container boundaries and how items are distributed along the main and cross axes.'
		},
		{
			type: 'text',
			content: `## Flex Wrapping

By default, flex items try to fit on one line. They will shrink as needed (governed by \`flex-shrink\`) but will not wrap to a second line. \`flex-wrap: wrap\` changes this:

\`\`\`css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
\`\`\`

When wrapping is enabled, items that do not fit on the current line move to the next line. The \`gap\` property applies between wrapped lines as well — this is why \`gap\` in flexbox is so valuable.

### Flex Wrap and align-content

When you have multiple lines of flex items (due to wrapping), \`align-content\` controls how those lines are distributed along the cross axis:

\`\`\`css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: space-between; /* Spreads lines evenly */
}
\`\`\`

\`align-content\` only has an effect when there are multiple lines. With a single line (no wrapping or all items fit), it does nothing.

### Common Flexbox Layout Patterns

**Centering anything:**
\`\`\`css
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
\`\`\`

**Sticky footer:**
\`\`\`css
body {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main { flex: 1; } /* Main content grows to fill available space */
\`\`\`

**Space between with a logo on the left and nav on the right:**
\`\`\`css
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
\`\`\`

**Task:** Add \`flex-wrap: wrap\` to the \`.cards\` container so cards wrap on smaller viewports.`
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
