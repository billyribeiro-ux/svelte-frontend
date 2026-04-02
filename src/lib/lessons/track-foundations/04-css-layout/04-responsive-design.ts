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

Responsive design ensures your layout works on any screen size. The approach has evolved significantly over the years:

- **2010s: Media queries** — Apply styles based on viewport size. Still essential, but no longer the only tool.
- **2020s: Container queries** — Apply styles based on parent container size. Makes components truly portable.
- **Modern: Fluid typography** — Text and spacing that scale smoothly without breakpoints.

The modern approach combines all three. Media queries handle page-level layout changes. Container queries handle component-level adaptation. Fluid typography handles the in-between sizes where breakpoints would be too coarse.

## The Evolution from Media Queries to Container Queries

Media queries were revolutionary when they arrived, but they have a fundamental limitation: they respond to the **viewport**, not to the component's actual available space.

Consider a card component used in two places: a 3-column grid in the main content area and a single-column sidebar. With media queries, a phone-width viewport triggers the mobile layout — but what if the card is already narrow because it is in the sidebar, even on a desktop screen? Media queries cannot detect that the card is in a narrow container. They only know the window width.

Container queries solve this by letting components respond to their own container. The same card component automatically adapts whether it is in a wide grid or a narrow sidebar, without any knowledge of the page layout.

### The srcset Attribute for Responsive Images

Responsive design is not just about layout — images need to adapt too. The \`srcset\` attribute lets the browser choose the right image for the device:

\`\`\`html
<img
  src="photo-800.jpg"
  srcset="
    photo-400.jpg 400w,
    photo-800.jpg 800w,
    photo-1200.jpg 1200w
  "
  sizes="(min-width: 768px) 50vw, 100vw"
  alt="Responsive photo"
/>
\`\`\`

The \`srcset\` attribute lists available image files with their intrinsic widths. The \`sizes\` attribute tells the browser how wide the image will be displayed at different viewport sizes. The browser combines this information with the device pixel ratio to choose the optimal image — no JavaScript required.

Without responsive images, you either serve oversized images to mobile (wasting bandwidth) or undersized images to desktop (blurry on high-DPI screens).`
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

### Mobile-First vs Desktop-First

**Mobile-first** (using \`min-width\`) means your default styles target the smallest screens, and you add complexity as the viewport grows. This is the recommended approach because:

1. Mobile styles are usually simpler (single column, stacked layout), so they make a good default.
2. If a media query fails to load, users get the simpler mobile layout rather than a broken desktop layout on a phone.
3. It matches the progressive enhancement philosophy — start with the baseline, enhance for capable devices.

**Desktop-first** (using \`max-width\`) starts with full-featured desktop styles and strips them away for smaller screens. This often results in more overrides and more CSS overall.

### Modern Media Query Features

Beyond viewport width, media queries can detect:

\`\`\`css
/* User preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}

/* Dark mode preference */
@media (prefers-color-scheme: dark) {
  :root { --bg: #1a1a1a; --text: #e5e5e5; }
}

/* Hover capability (touchscreens vs mice) */
@media (hover: hover) {
  .card:hover { transform: scale(1.02); }
}

/* High-DPI screens */
@media (min-resolution: 2dppx) {
  .logo { background-image: url('logo@2x.png'); }
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

### Setting Up a Container

The parent needs \`container-type\` to be queryable:

- \`container-type: inline-size\` — Query the inline (width) dimension. This is the most common value.
- \`container-type: size\` — Query both inline and block dimensions. Rarely needed and has more performance overhead.

You can also name containers for targeted queries:

\`\`\`css
.sidebar { container-type: inline-size; container-name: sidebar; }

@container sidebar (min-width: 300px) {
  .widget { display: grid; grid-template-columns: 1fr 1fr; }
}
\`\`\`

### Container Queries vs Media Queries

| Feature | Media Queries | Container Queries |
|---------|--------------|-------------------|
| Responds to | Viewport size | Container size |
| Scope | Global | Component-local |
| Reusability | Layout-dependent | Layout-independent |
| Browser support | Universal | Modern browsers (2023+) |
| Best for | Page-level layout | Component adaptation |

In practice, you use both. Media queries for the overall page structure (sidebar appears/disappears, navigation layout changes). Container queries for components that need to adapt to their context (cards, widgets, data tables).

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
			content: `## Fluid Typography with clamp()

The \`clamp()\` function creates values that scale smoothly between a minimum and maximum:

\`\`\`css
h1 { font-size: clamp(1.5rem, 2vw + 1rem, 3rem); }
p  { font-size: clamp(0.875rem, 1vw + 0.5rem, 1.125rem); }
\`\`\`

The syntax is \`clamp(minimum, preferred, maximum)\`:

- **Minimum** — The smallest the value can be. Use \`rem\` for accessibility (respects user font-size preferences).
- **Preferred** — The value used when it falls between min and max. This is typically a formula combining viewport units (\`vw\`) with a fixed offset (\`rem\`). The viewport unit makes it scale; the fixed offset controls the rate of scaling.
- **Maximum** — The largest the value can be.

### Why clamp() Beats Breakpoints for Typography

With breakpoints, text jumps between sizes at specific viewport widths. This creates jarring transitions and requires you to pick the exact widths where font sizes should change. With \`clamp()\`, the text scales continuously — no jumps, no breakpoints to maintain.

### The Formula for Fluid Typography

A good starting formula for the preferred value is \`Xvw + Yrem\`:

- The \`vw\` component controls how much the text scales with the viewport. \`1vw\` means the font-size changes by 1% of the viewport width for every pixel of viewport change. \`2vw\` scales twice as fast.
- The \`rem\` component sets the baseline size. Without it, the text would be tiny on small screens (\`2vw\` at 320px is only 6.4px).

\`\`\`css
/* Headings: scale noticeably */
h1 { font-size: clamp(1.75rem, 3vw + 0.5rem, 3.5rem); }
h2 { font-size: clamp(1.5rem, 2.5vw + 0.5rem, 2.5rem); }

/* Body text: scale subtly */
p  { font-size: clamp(1rem, 0.5vw + 0.875rem, 1.25rem); }

/* Fluid spacing too */
section { padding: clamp(1rem, 3vw, 4rem); }
\`\`\`

### Accessibility Considerations

Always use \`rem\` for the minimum value, never \`px\`. This ensures your minimum font size respects the user's browser font-size setting. A user who sets their default to 20px expects text to be at least that large.

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
