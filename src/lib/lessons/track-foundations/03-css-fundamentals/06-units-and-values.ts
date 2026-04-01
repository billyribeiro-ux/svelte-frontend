import type { Lesson } from '$types/lesson';

export const unitsAndValues: Lesson = {
	id: 'foundations.css-fundamentals.units-and-values',
	slug: 'units-and-values',
	title: 'Units and Values',
	description: 'Understand px, rem, em, percentages, viewport units, and the clamp() function for responsive sizing.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 6,
	estimatedMinutes: 12,
	concepts: ['css.units', 'css.relative-units', 'css.clamp'],
	prerequisites: ['foundations.css-fundamentals.typography'],

	content: [
		{
			type: 'text',
			content: `# Units and Values

Choosing the right CSS unit is crucial for responsive, accessible design:

- **\`px\`** — Fixed pixels, not responsive
- **\`rem\`** — Relative to root font size (usually 16px)
- **\`em\`** — Relative to the parent's font size
- **\`%\`** — Relative to the parent's dimension
- **\`vw/vh\`** — Relative to viewport width/height
- **\`clamp()\`** — Fluid values with min and max bounds`
		},
		{
			type: 'concept-callout',
			content: 'css.units'
		},
		{
			type: 'text',
			content: `## Rem vs Em

\`rem\` is predictable — it always refers to the root font size. \`em\` compounds — nested elements multiply their parent's size.

\`\`\`css
html { font-size: 16px; }
.parent { font-size: 1.5rem; }  /* 24px */
.child { font-size: 1em; }      /* 24px (inherits parent) */
.child { font-size: 1rem; }     /* 16px (always root) */
\`\`\`

Look at the starter code. Everything uses \`px\`.

**Task:** Convert the heading font size to \`rem\` and the padding to \`rem\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Viewport Units

Viewport units are relative to the browser window:

\`\`\`css
width: 100vw;   /* Full viewport width */
height: 100vh;  /* Full viewport height */
min-height: 100dvh;  /* Dynamic viewport height (accounts for mobile UI) */
\`\`\`

**Task:** Set the container \`min-height\` to \`50vh\` so it takes at least half the viewport height.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and resize the viewport. Observe how viewport units respond to window size changes while rem values stay fixed relative to the root font size.'
		},
		{
			type: 'text',
			content: `## The clamp() Function

\`clamp()\` creates fluid values that scale between a minimum and maximum:

\`\`\`css
font-size: clamp(1rem, 2.5vw, 2rem);
/* min: 1rem, preferred: 2.5vw, max: 2rem */
\`\`\`

This is perfect for fluid typography and spacing that adapts to any screen size.

**Task:** Set the heading font size to \`clamp(1.5rem, 4vw, 3rem)\` for fluid typography.`
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
  let title = $state('Units & Values');
</script>

<div class="container">
  <h1>{title}</h1>
  <p>Understanding CSS units helps you build responsive layouts that work across all devices.</p>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 20px;
  }

  h1 {
    font-size: 32px;
    color: var(--sf-accent, #6366f1);
  }

  p {
    font-size: 16px;
    line-height: 1.6;
    color: #334155;
  }

  /* TODO: Convert to rem, add viewport units, and use clamp() */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('Units & Values');
</script>

<div class="container">
  <h1>{title}</h1>
  <p>Understanding CSS units helps you build responsive layouts that work across all devices.</p>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1.25rem;
    min-height: 50vh;
  }

  h1 {
    font-size: clamp(1.5rem, 4vw, 3rem);
    color: var(--sf-accent, #6366f1);
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
    color: #334155;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Convert pixel values to rem units',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'font-size:\\s*[\\d.]+rem' },
						{ type: 'regex', value: 'padding:\\s*[\\d.]+rem' }
					]
				}
			},
			hints: [
				'Divide pixel values by 16 to convert to rem: 32px = 2rem, 20px = 1.25rem.',
				'Change the heading `font-size` to `2rem` and the container `padding` to `1.25rem`.',
				'Update: `h1 { font-size: 2rem; }` and `.container { padding: 1.25rem; }`'
			],
			conceptsTested: ['css.relative-units']
		},
		{
			id: 'cp-2',
			description: 'Set the container min-height using viewport units',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'min-height:\\s*50vh' }
					]
				}
			},
			hints: [
				'Viewport units are relative to the browser window size.',
				'Add `min-height: 50vh` to the `.container` rule.',
				'Update `.container` to include: `min-height: 50vh;`'
			],
			conceptsTested: ['css.units']
		},
		{
			id: 'cp-3',
			description: 'Use clamp() for fluid heading typography',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'clamp(' }
					]
				}
			},
			hints: [
				'`clamp(min, preferred, max)` creates a value that scales between bounds.',
				'Set the heading `font-size` to `clamp(1.5rem, 4vw, 3rem)`.',
				'Update `h1` to: `font-size: clamp(1.5rem, 4vw, 3rem);`'
			],
			conceptsTested: ['css.clamp']
		}
	]
};
