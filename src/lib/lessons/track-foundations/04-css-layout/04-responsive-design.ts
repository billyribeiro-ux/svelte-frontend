import type { Lesson } from '$types/lesson';

export const responsiveDesignCss: Lesson = {
	id: 'foundations.css-layout.responsive-design',
	slug: 'responsive-design',
	title: 'Responsive Design',
	description: 'Build adaptive layouts with media queries, container queries, and fluid typography techniques.',
	trackId: 'foundations',
	moduleId: 'css-layout',
	order: 4,
	estimatedMinutes: 15,
	concepts: ['css.media-queries', 'css.container-queries', 'css.fluid-typography'],
	prerequisites: ['foundations.css-layout.positioning'],

	content: [
		{
			type: 'text',
			content: `# Responsive Design

Responsive design ensures your layout works on any screen size. CSS provides several tools:

- **Media queries** — Apply styles based on viewport size
- **Container queries** — Apply styles based on parent container size
- **Fluid typography** — Text that scales smoothly between sizes`
		},
		{
			type: 'concept-callout',
			content: 'css.media-queries'
		},
		{
			type: 'text',
			content: `## Media Queries

Media queries conditionally apply CSS based on viewport characteristics:

\`\`\`css
/* Mobile first — default styles for small screens */
.grid { grid-template-columns: 1fr; }

/* Tablet and up */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
\`\`\`

Look at the starter code. The grid has a fixed layout.

**Task:** Add a media query at \`min-width: 768px\` that changes the grid to 2 columns.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Container Queries

Container queries respond to the parent container's size, not the viewport:

\`\`\`css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card { flex-direction: row; }
}
\`\`\`

**Task:** Add \`container-type: inline-size\` to the \`.card-wrapper\` and a \`@container\` query that changes the card layout at \`min-width: 300px\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and resize the viewport. Observe when media queries and container queries trigger their breakpoints independently.'
		},
		{
			type: 'text',
			content: `## Fluid Typography

Use \`clamp()\` for typography that scales smoothly without breakpoints:

\`\`\`css
h1 { font-size: clamp(1.5rem, 2vw + 1rem, 3rem); }
p { font-size: clamp(0.875rem, 1vw + 0.5rem, 1.125rem); }
\`\`\`

**Task:** Apply fluid typography to the heading using \`clamp(1.25rem, 3vw, 2.5rem)\`.`
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
  let title = $state('Responsive Design');
  let cards = $state(['Adapt', 'Respond', 'Flow', 'Scale']);
</script>

<h1>{title}</h1>

<div class="grid">
  {#each cards as card}
    <div class="card-wrapper">
      <div class="card">
        <h3>{card}</h3>
        <p>This card should respond to viewport and container size.</p>
      </div>
    </div>
  {/each}
</div>

<style>
  h1 {
    font-family: system-ui, sans-serif;
    color: var(--sf-accent, #6366f1);
    padding: 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    font-family: system-ui, sans-serif;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  /* TODO: Add media queries, container queries, and fluid typography */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('Responsive Design');
  let cards = $state(['Adapt', 'Respond', 'Flow', 'Scale']);
</script>

<h1>{title}</h1>

<div class="grid">
  {#each cards as card}
    <div class="card-wrapper">
      <div class="card">
        <h3>{card}</h3>
        <p>This card should respond to viewport and container size.</p>
      </div>
    </div>
  {/each}
</div>

<style>
  h1 {
    font-family: system-ui, sans-serif;
    color: var(--sf-accent, #6366f1);
    padding: 1rem;
    font-size: clamp(1.25rem, 3vw, 2.5rem);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }

  .card-wrapper {
    container-type: inline-size;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    font-family: system-ui, sans-serif;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @container (min-width: 300px) {
    .card {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1rem;
    }
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add a media query for a 2-column grid at 768px',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@media' },
						{ type: 'contains', value: 'min-width: 768px' }
					]
				}
			},
			hints: [
				'Media queries use `@media (condition) { rules }` syntax.',
				'Use `@media (min-width: 768px)` for tablet-and-up styles.',
				'Add: `@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }`'
			],
			conceptsTested: ['css.media-queries']
		},
		{
			id: 'cp-2',
			description: 'Add container-type and a @container query',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'container-type: inline-size' },
						{ type: 'contains', value: '@container' }
					]
				}
			},
			hints: [
				'The parent needs `container-type: inline-size` to be a query container.',
				'Use `@container (min-width: 300px) { }` to style children based on container size.',
				'Add `.card-wrapper { container-type: inline-size; }` and `@container (min-width: 300px) { .card { display: flex; } }`'
			],
			conceptsTested: ['css.container-queries']
		},
		{
			id: 'cp-3',
			description: 'Apply fluid typography with clamp() to the heading',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'clamp(' }
					]
				}
			},
			hints: [
				'`clamp(min, preferred, max)` creates fluid values.',
				'Apply `font-size: clamp(1.25rem, 3vw, 2.5rem)` to the heading.',
				'Update `h1` to include: `font-size: clamp(1.25rem, 3vw, 2.5rem);`'
			],
			conceptsTested: ['css.fluid-typography']
		}
	]
};
