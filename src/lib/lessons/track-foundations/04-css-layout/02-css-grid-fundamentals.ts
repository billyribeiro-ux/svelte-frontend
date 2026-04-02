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

CSS Grid is a two-dimensional layout system — it handles both rows and columns simultaneously.

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

The \`fr\` unit distributes available space proportionally.

Look at the starter code. The cards are in a single column.

**Task:** Add \`display: grid\`, \`grid-template-columns: repeat(3, 1fr)\`, and \`gap: 1.5rem\` to the \`.grid\` container.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Auto-fit and Responsive Grids

\`auto-fit\` with \`minmax()\` creates responsive grids without media queries:

\`\`\`css
grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
\`\`\`

This creates as many columns as fit, each at least 250px wide.

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

Grid areas let you define layout regions by name:

\`\`\`css
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
.header { grid-area: header; }
\`\`\`

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
