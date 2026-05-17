import type { Lesson } from '$types/lesson';

export const cssGridFundamentals: Lesson = {
	id: 'foundations.css-layout.css-grid-fundamentals',
	slug: 'css-grid-fundamentals',
	title: 'CSS Grid Fundamentals',
	description: 'Build two-dimensional layouts with grid-template, grid-gap, auto-fit, and named grid areas.',
	trackId: 'foundations',
	moduleId: 'css-layout',
	order: 2,
	estimatedMinutes: 15,
	concepts: ['css.grid', 'css.grid-template', 'css.grid-areas'],
	prerequisites: ['foundations.css-layout.flexbox-fundamentals'],

	content: [
		{
			type: 'text',
			content: `# CSS Grid Fundamentals

CSS Grid is a two-dimensional layout system — it handles both rows and columns simultaneously. While flexbox excels at one-dimensional layouts (a row of navigation items, a column of cards), Grid is purpose-built for two-dimensional layouts where you need to control placement in both directions at once.

## Explicit vs Implicit Grid

This distinction is fundamental and often overlooked:

- **Explicit grid** — The rows and columns you define with \`grid-template-columns\` and \`grid-template-rows\`. You have full control over their size and behavior.
- **Implicit grid** — Rows or columns that the browser creates automatically when there are more items than your explicit grid can hold.

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* Explicit: 3 columns */
  /* No grid-template-rows — rows are implicit */
}
\`\`\`

If you place 9 items in this grid, you get 3 explicit columns and 3 implicit rows. The implicit rows default to \`auto\` height (sized to fit their content). You can control implicit row sizing with \`grid-auto-rows\`:

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: minmax(100px, auto); /* Implicit rows: at least 100px */
}
\`\`\`

This ensures every row is at least 100px tall, even if the content is shorter. The \`auto\` maximum lets rows grow if content is taller.

Key properties:
- **\`display: grid\`** — Activates grid layout
- **\`grid-template-columns\`** — Define column tracks
- **\`grid-template-rows\`** — Define row tracks
- **\`gap\`** — Space between grid cells
- **\`grid-template-areas\`** — Named layout regions`
		},
		{
			type: 'concept-callout',
			content: 'css.grid'
		},
		{
			type: 'text',
			content: `## Creating a Grid

Define a grid with \`grid-template-columns\`:

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
\`\`\`

The \`fr\` unit distributes available space proportionally. \`1fr 2fr 1fr\` gives the middle column twice the width of the outer columns. The \`fr\` unit only distributes *remaining* space — space left after fixed-size columns (\`px\`, \`rem\`) and content-sized columns (\`auto\`, \`min-content\`, \`max-content\`) have been allocated.

\`\`\`css
/* Sidebar layout: fixed sidebar, fluid main */
.layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}
\`\`\`

Here the sidebar gets exactly 250px, and \`1fr\` gives the main content all remaining space.

### The repeat() Function

\`repeat()\` is syntactic sugar for repeating track definitions:

- \`repeat(3, 1fr)\` = \`1fr 1fr 1fr\`
- \`repeat(2, 100px 1fr)\` = \`100px 1fr 100px 1fr\`
- \`repeat(auto-fit, minmax(250px, 1fr))\` = responsive columns (covered next)

Look at the starter code. The cards are in a single column.

**Task:** Add \`display: grid\`, \`grid-template-columns: repeat(3, 1fr)\`, and \`gap: 1.5rem\` to the \`.grid\` container.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Auto-fit, Auto-fill, and Responsive Grids

\`auto-fit\` with \`minmax()\` creates responsive grids without media queries:

\`\`\`css
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
\`\`\`

This creates as many columns as fit, each at least 250px wide. When the container shrinks, columns drop to the next row. When it grows, more columns appear.

### auto-fit vs auto-fill

These two keywords are often confused:

- **\`auto-fill\`** creates as many tracks as fit, even if some are empty. Empty tracks still take up space.
- **\`auto-fit\`** creates tracks the same way, but then *collapses* any empty tracks to zero width. The remaining items expand to fill the space.

The difference is only visible when you have fewer items than the grid can hold:

\`\`\`css
/* auto-fill: 3 items in a wide container might show 5 columns (2 empty) */
grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

/* auto-fit: 3 items in a wide container show 3 columns that expand */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
\`\`\`

**Rule of thumb:** Use \`auto-fit\` when you want items to stretch to fill the container. Use \`auto-fill\` when you want items to maintain their minimum size and leave empty space.

### The minmax() Function

\`minmax(min, max)\` defines a size range for a track:

- \`minmax(200px, 1fr)\` — At least 200px, grows to fill available space
- \`minmax(100px, 300px)\` — Between 100px and 300px
- \`minmax(auto, 1fr)\` — At least as wide as content, can grow
- \`minmax(0, 1fr)\` — Can shrink to zero (useful when you want \`1fr\` to really mean equal widths)

**Task:** Replace the fixed 3-column grid with \`repeat(auto-fit, minmax(200px, 1fr))\` for responsive behavior.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and resize the viewport. Watch how `auto-fit` dynamically adjusts the number of columns as space changes.'
		},
		{
			type: 'text',
			content: `## Named Grid Areas

Grid areas let you define layout regions by name, creating a visual map of your layout directly in CSS:

\`\`\`css
.layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  gap: 1rem;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
\`\`\`

### Template Areas Syntax Rules

Each quoted string represents one row. Column names within a row are separated by spaces. The rules:

1. Every row must have the same number of columns
2. Use \`.\` for empty cells: \`"header header" ". main" "footer footer"\`
3. Named areas must form rectangles — you cannot have an L-shaped area
4. Each area name in the template corresponds to a \`grid-area\` property on a child element

### Why Template Areas Are Powerful

Template areas create a visual representation of your layout in code. Compare:

\`\`\`css
/* Without named areas — position with line numbers */
.header  { grid-column: 1 / -1; grid-row: 1; }
.sidebar { grid-column: 1; grid-row: 2; }
.main    { grid-column: 2; grid-row: 2; }
.footer  { grid-column: 1 / -1; grid-row: 3; }

/* With named areas — visual layout map */
grid-template-areas:
  "header header"
  "sidebar main"
  "footer footer";
\`\`\`

The second version is immediately readable. You can see the layout at a glance, and reorganizing it is as simple as rearranging strings. Want to move the sidebar to the right? Just swap the names:

\`\`\`css
grid-template-areas:
  "header header"
  "main sidebar"
  "footer footer";
\`\`\`

### Responsive Layouts with Template Areas

Combine template areas with media queries for layouts that restructure at breakpoints:

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header"
    "main"
    "sidebar"
    "footer";
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 200px 1fr;
    grid-template-areas:
      "header header"
      "sidebar main"
      "footer footer";
  }
}
\`\`\`

On mobile, everything stacks in a single column. On tablet and up, you get a sidebar layout. The template area strings make both layouts immediately clear.

**Task:** Add \`grid-template-areas\` to the \`.page\` layout with "header header" / "sidebar main" / "footer footer" and assign areas to children.`
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
  let cards = $state(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']);
</script>

<div class="grid">
  {#each cards as card}
    <div class="card">
      <h3>{card}</h3>
      <p>Grid item content for {card}.</p>
    </div>
  {/each}
</div>

<div class="page">
  <header>Header</header>
  <aside>Sidebar</aside>
  <main>Main Content</main>
  <footer>Footer</footer>
</div>

<style>
  .grid {
    padding: 1rem;
    font-family: system-ui, sans-serif;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  .page {
    margin-block-start: 2rem;
    padding: 1rem;
    font-family: system-ui, sans-serif;
  }

  .page header, .page aside, .page main, .page footer {
    padding: 1rem;
    background: #f1f5f9;
    border-radius: 0.25rem;
    border: 1px solid #e2e8f0;
  }

  /* TODO: Add grid layout properties */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let cards = $state(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta']);
</script>

<div class="grid">
  {#each cards as card}
    <div class="card">
      <h3>{card}</h3>
      <p>Grid item content for {card}.</p>
    </div>
  {/each}
</div>

<div class="page">
  <header>Header</header>
  <aside>Sidebar</aside>
  <main>Main Content</main>
  <footer>Footer</footer>
</div>

<style>
  .grid {
    padding: 1rem;
    font-family: system-ui, sans-serif;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  .page {
    margin-block-start: 2rem;
    padding: 1rem;
    font-family: system-ui, sans-serif;
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-template-areas:
      "header header"
      "sidebar main"
      "footer footer";
    gap: 1rem;
  }

  .page header {
    grid-area: header;
    padding: 1rem;
    background: #f1f5f9;
    border-radius: 0.25rem;
    border: 1px solid #e2e8f0;
  }

  .page aside {
    grid-area: sidebar;
    padding: 1rem;
    background: #f1f5f9;
    border-radius: 0.25rem;
    border: 1px solid #e2e8f0;
  }

  .page main {
    grid-area: main;
    padding: 1rem;
    background: #f1f5f9;
    border-radius: 0.25rem;
    border: 1px solid #e2e8f0;
  }

  .page footer {
    grid-area: footer;
    padding: 1rem;
    background: #f1f5f9;
    border-radius: 0.25rem;
    border: 1px solid #e2e8f0;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a 3-column grid with gap',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'display: grid' },
						{ type: 'contains', value: 'grid-template-columns' },
						{ type: 'contains', value: 'gap' }
					]
				}
			},
			hints: [
				'`display: grid` activates CSS Grid on the container.',
				'Use `grid-template-columns: repeat(3, 1fr)` for three equal columns.',
				'Add to `.grid`: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;`'
			],
			conceptsTested: ['css.grid']
		},
		{
			id: 'cp-2',
			description: 'Use auto-fit with minmax for responsive columns',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'auto-fit' },
						{ type: 'contains', value: 'minmax(' }
					]
				}
			},
			hints: [
				'`auto-fit` creates as many columns as fit in the available space.',
				'`minmax(200px, 1fr)` sets a minimum of 200px and a maximum of 1fr.',
				'Change to: `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));`'
			],
			conceptsTested: ['css.grid-template']
		},
		{
			id: 'cp-3',
			description: 'Add named grid areas to the page layout',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'grid-template-areas' },
						{ type: 'contains', value: 'grid-area' }
					]
				}
			},
			hints: [
				'`grid-template-areas` defines named regions using quoted strings.',
				'Each child uses `grid-area: name` to place itself in a region.',
				'Add to `.page`: `grid-template-areas: "header header" "sidebar main" "footer footer";` and assign `grid-area` to each child.'
			],
			conceptsTested: ['css.grid-areas']
		}
	]
};
