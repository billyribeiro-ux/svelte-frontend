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

Responsive design ensures your layout works on any screen size. CSS provides several tools, each solving a different problem:

- **Media queries** — Apply styles based on viewport size
- **Container queries** — Apply styles based on parent container size
- **Fluid typography** — Text that scales smoothly between sizes
- **Responsive images** — Images that adapt to context

## WHY: Container Queries as the Evolution of Media Queries

Media queries revolutionized web design in 2010, but they have a fundamental limitation: they respond to the **viewport**, not to the component's actual available space. A card component in a sidebar has less room than the same card in the main content area — but a media query cannot distinguish between these contexts.

Container queries solve this by letting components respond to their container:

\`\`\`css
/* Media query: "Is the VIEWPORT wide?" */
@media (min-width: 768px) { .card { display: flex; } }

/* Container query: "Is MY CONTAINER wide?" */
@container (min-width: 400px) { .card { display: flex; } }
\`\`\`

**Decision framework:**
- Use **media queries** for page-level layout changes (number of columns, sidebar visibility, overall structure)
- Use **container queries** for component-level layout changes (card orientation, thumbnail visibility, text truncation)
- Use **fluid typography** for text that should scale smoothly without any breakpoints`
		},
		{
			type: 'concept-callout',
			content: 'css.media-queries'
		},
		{
			type: 'text',
			content: `## Media Queries

Media queries conditionally apply CSS based on viewport characteristics. The mobile-first approach uses \`min-width\`:

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

**Modern media query features you should know:**

Range syntax (supported in all modern browsers):
\`\`\`css
/* Old: */ @media (min-width: 768px) and (max-width: 1023px) { }
/* New: */ @media (768px <= width < 1024px) { }
\`\`\`

Preference queries:
\`\`\`css
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #1a1a1a; }
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

Container queries respond to the parent container's size, not the viewport. Setting them up requires two steps:

1. Declare a container with \`container-type\`
2. Write \`@container\` rules for its children

\`\`\`css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card { flex-direction: row; }
}
\`\`\`

**Container-type options:**
- \`inline-size\` — Enables queries on the inline dimension (width in horizontal writing modes). Most common choice.
- \`size\` — Enables queries on both dimensions. Use sparingly — it enables more containment which can have side effects.
- \`normal\` — Default. Not a query container.

**Why \`inline-size\` is usually the right choice:** \`container-type: size\` establishes size containment on both axes, which means the container's height cannot be determined by its content. This breaks most layouts because content-driven height is standard. \`inline-size\` only constrains the width, allowing height to remain content-driven.

**Task:** Add \`container-type: inline-size\` to the \`.card-wrapper\` and a \`@container\` query that changes the card layout at \`min-width: 300px\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and resize the viewport. Observe when media queries and container queries trigger their breakpoints independently. The media query responds to the viewport width, while the container query responds to the card-wrapper width. If you put the same card in a sidebar, only the container query would behave differently — the media query would trigger at the same viewport width regardless.'
		},
		{
			type: 'text',
			content: `## Fluid Typography with clamp()

\`clamp()\` creates values that scale smoothly between a minimum and maximum:

\`\`\`css
h1 { font-size: clamp(1.5rem, 2vw + 1rem, 3rem); }
p  { font-size: clamp(0.875rem, 1vw + 0.5rem, 1.125rem); }
\`\`\`

**How clamp() works:** \`clamp(minimum, preferred, maximum)\`
- The browser uses the **preferred** value as long as it is between min and max
- If the preferred value drops below the minimum, the minimum is used
- If the preferred value exceeds the maximum, the maximum is used

**The preferred value formula:** The \`vw\` unit makes it viewport-relative. \`2vw + 1rem\` means "2% of viewport width plus 1rem." The \`+ 1rem\` acts as a base floor so the value never gets too small on tiny viewports. Adjust the \`vw\` multiplier to control how aggressively the font scales.

**Practical guidelines:**
- Headings: \`clamp(1.5rem, 3vw + 0.5rem, 3rem)\` — scales from 24px to 48px
- Body text: \`clamp(1rem, 0.5vw + 0.875rem, 1.125rem)\` — subtle scaling
- Do NOT use clamp for body text below 16px minimum — this causes readability issues on mobile

## Responsive Images with srcset

Images are often the largest assets on a page. Responsive images prevent mobile users from downloading desktop-sized images:

\`\`\`html
<img
  src="photo-800w.jpg"
  srcset="photo-400w.jpg 400w, photo-800w.jpg 800w, photo-1200w.jpg 1200w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Description"
/>
\`\`\`

The \`srcset\` attribute tells the browser which image sizes are available. The \`sizes\` attribute tells the browser how wide the image will be displayed at each viewport size. The browser combines this information with the device pixel ratio to choose the optimal image.

**Task:** Apply fluid typography to the heading using \`clamp(1.25rem, 3vw, 2.5rem)\`.

## Realistic Exercise: Responsive Product Page

After completing the checkpoints, consider a real product page with:
- Hero image (full width on mobile, 50% on desktop)
- Product title (fluid typography from 1.5rem to 2.5rem)
- Image gallery (1 column on mobile, 2 on tablet, 3 on desktop using media queries)
- Related products section (cards that use container queries to adapt their layout)

Each responsive tool has its role: media queries for page structure, container queries for component adaptation, clamp for smooth typography, and srcset for image optimization.`
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
