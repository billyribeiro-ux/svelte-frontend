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

CSS Grid is a two-dimensional layout system — it handles both rows and columns simultaneously. While flexbox excels at one-dimensional layouts (a row of items or a column of items), grid excels at page-level layouts and any design where you need to control both dimensions.

Key properties:
- **\`display: grid\`** — Activates grid layout
- **\`grid-template-columns\`** — Define column tracks
- **\`grid-template-rows\`** — Define row tracks
- **\`gap\`** — Space between grid cells
- **\`grid-template-areas\`** — Named layout regions

## WHY: Implicit vs Explicit Grid

Understanding the difference between implicit and explicit grid tracks prevents many confusing layout bugs.

**Explicit grid:** Tracks you define with \`grid-template-columns\` and \`grid-template-rows\`. You control their sizes precisely.

**Implicit grid:** Tracks the browser creates automatically when items overflow your explicit grid. If you define 3 columns but have 7 items, the browser creates a second row automatically. Implicit rows default to \`auto\` height (content-sized).

You control implicit track sizing with:
\`\`\`css
.grid {
  grid-template-columns: repeat(3, 1fr); /* explicit: 3 columns */
  grid-auto-rows: 200px;                 /* implicit: all auto-created rows are 200px */
  grid-auto-flow: dense;                 /* fill gaps when items are placed out of order */
}
\`\`\`

**Decision framework:** If you know how many rows and columns you need (like a page layout), define them explicitly. If items flow dynamically (like a card grid), define columns explicitly and let rows be implicit.`
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

The \`fr\` unit distributes available space proportionally. \`1fr 2fr 1fr\` creates three columns where the middle one is twice as wide as the others. The \`fr\` unit only distributes space left over after fixed-size tracks are sized — so \`200px 1fr 1fr\` gives the first column exactly 200px and splits the remaining space equally.

Look at the starter code. The cards are in a single column.

**Task:** Add \`display: grid\`, \`grid-template-columns: repeat(3, 1fr)\`, and \`gap: 1.5rem\` to the \`.grid\` container.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Auto-fit vs Auto-fill: The Critical Distinction

Both \`auto-fit\` and \`auto-fill\` with \`minmax()\` create responsive grids without media queries, but they behave differently when there are fewer items than columns:

\`\`\`css
/* auto-fit: collapses empty tracks, items stretch to fill */
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));

/* auto-fill: keeps empty tracks, items stay at minmax size */
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
\`\`\`

**auto-fit** — Creates as many columns as fit, but collapses empty tracks to 0. If you have 2 items in a container wide enough for 4 columns, the 2 items stretch to fill the full width.

**auto-fill** — Creates as many columns as fit and keeps empty tracks at their minimum size. If you have 2 items in a container wide enough for 4 columns, the 2 items stay at their minimum width and there are 2 empty columns.

**Decision framework:**
- Use \`auto-fit\` when you want items to always fill the available width (most common for card grids)
- Use \`auto-fill\` when you want items to maintain a consistent size regardless of how many there are (useful for thumbnail grids)

**Task:** Replace the fixed 3-column grid with \`repeat(auto-fit, minmax(200px, 1fr))\` for responsive behavior.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and resize the viewport. Watch how `auto-fit` dynamically adjusts the number of columns as space changes. No media queries are involved — the grid algorithm calculates how many 200px-minimum columns can fit at each width.'
		},
		{
			type: 'text',
			content: `## Named Grid Areas

Grid areas let you define layout regions by name, creating a visual map of your layout in CSS:

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

**WHY grid areas are powerful:** The template areas string is literally a visual representation of your layout. Each quoted string is a row, each word is a cell. This makes it trivial to rearrange layouts — you just move the words around. Changing from a sidebar layout to a stacked mobile layout is a single media query:

\`\`\`css
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
  }
}
\`\`\`

Notice that the sidebar moves below main on mobile — you could not do this with flexbox without changing the DOM order.

**Subgrid (for advanced use):** \`subgrid\` lets a child grid item inherit track definitions from its parent grid. This solves the "card grid alignment" problem where cards of different heights need their internal elements (title, body, footer) to align across cards:

\`\`\`css
.card {
  display: grid;
  grid-template-rows: subgrid;
  grid-row: span 3;  /* card spans 3 rows of parent grid */
}
\`\`\`

Subgrid has excellent browser support as of 2024 and is a game-changer for component-level grid alignment.

**Task:** Add \`grid-template-areas\` to the \`.page\` layout with "header header" / "sidebar main" / "footer footer" and assign areas to children.

## Realistic Exercise: Dashboard Layout

After completing the checkpoints, consider a real dashboard layout:
- Top bar spanning full width
- Left sidebar (fixed 250px)
- Main content area (flexible)
- Right panel (300px, hidden on mobile)

Your grid approach:
1. \`grid-template-columns: 250px 1fr 300px\` on desktop
2. \`grid-template-areas\` for named placement
3. Media query at 768px to collapse to single column
4. Media query at 1024px to show 2 columns (hide right panel)

This is a layout that would be extremely complex with flexbox but is straightforward with grid.`
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
