import type { Lesson } from '$types/lesson';

export const colorsAndBackgrounds: Lesson = {
	id: 'foundations.css-fundamentals.colors-and-backgrounds',
	slug: 'colors-and-backgrounds',
	title: 'Colors and Backgrounds',
	description: 'Explore modern color formats like OKLCH, gradients, and background properties for rich visual design.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 4,
	estimatedMinutes: 12,
	concepts: ['css.colors', 'css.oklch', 'css.gradients'],
	prerequisites: ['foundations.css-fundamentals.box-model'],

	content: [
		{
			type: 'text',
			content: `# Colors and Backgrounds

CSS offers many ways to define color:
- **Named** — \`red\`, \`rebeccapurple\`
- **Hex** — \`#6366f1\`
- **RGB** — \`rgb(99 102 241)\`
- **HSL** — \`hsl(239 84% 67%)\`
- **OKLCH** — \`oklch(0.55 0.2 265)\` (perceptually uniform)`
		},
		{
			type: 'concept-callout',
			content: 'css.colors'
		},
		{
			type: 'text',
			content: `## OKLCH — The Modern Color Space

OKLCH provides perceptually uniform colors — adjusting lightness changes how bright a color *looks*, not just its mathematical value.

\`\`\`css
color: oklch(0.7 0.15 250);  /* L: lightness, C: chroma, H: hue */
\`\`\`

Look at the starter code. The heading uses a hex color.

**Task:** Replace the heading color with an OKLCH value: \`oklch(0.55 0.2 265)\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Gradients

CSS supports linear, radial, and conic gradients:

\`\`\`css
background: linear-gradient(135deg, #667eea, #764ba2);
background: radial-gradient(circle, #f093fb, #f5576c);
background: conic-gradient(from 0deg, red, yellow, green, blue, red);
\`\`\`

**Task:** Add a \`linear-gradient\` background to the \`.banner\` element.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how gradient backgrounds render across the element box. Observe how padding affects the gradient area.'
		},
		{
			type: 'text',
			content: `## Background Properties

Fine-tune backgrounds with:

\`\`\`css
background-size: cover;
background-position: center;
background-repeat: no-repeat;
\`\`\`

**Task:** Add a solid background color to the card with \`background-color\` and a subtle \`box-shadow\`.`
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
  let title = $state('Colors & Backgrounds');
</script>

<div class="container">
  <div class="banner">
    <h1>{title}</h1>
  </div>
  <div class="card">
    <p>Modern CSS gives you powerful color and background tools.</p>
  </div>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .banner {
    padding: 2rem;
    border-radius: 0.5rem;
    margin-block-end: 1rem;
  }

  h1 {
    color: #6366f1;
    margin: 0;
  }

  .card {
    padding: 1.5rem;
    border-radius: 0.5rem;
  }

  /* TODO: Add OKLCH color, gradient, and background styles */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('Colors & Backgrounds');
</script>

<div class="container">
  <div class="banner">
    <h1>{title}</h1>
  </div>
  <div class="card">
    <p>Modern CSS gives you powerful color and background tools.</p>
  </div>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .banner {
    padding: 2rem;
    border-radius: 0.5rem;
    margin-block-end: 1rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
  }

  h1 {
    color: oklch(0.55 0.2 265);
    margin: 0;
  }

  .card {
    padding: 1.5rem;
    border-radius: 0.5rem;
    background-color: #f8fafc;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use OKLCH color format for the heading',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'oklch(' }
					]
				}
			},
			hints: [
				'OKLCH uses three values: lightness (0-1), chroma (0-0.4), and hue (0-360).',
				'Replace the hex color with `oklch(0.55 0.2 265)`.',
				'Change the `h1` rule to: `color: oklch(0.55 0.2 265);`'
			],
			conceptsTested: ['css.oklch']
		},
		{
			id: 'cp-2',
			description: 'Add a linear gradient background to the banner',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'linear-gradient' }
					]
				}
			},
			hints: [
				'`linear-gradient()` takes a direction and two or more color stops.',
				'Use `background: linear-gradient(135deg, #667eea, #764ba2);`.',
				'Add to `.banner`: `background: linear-gradient(135deg, #667eea, #764ba2);`'
			],
			conceptsTested: ['css.gradients']
		},
		{
			id: 'cp-3',
			description: 'Add a background color and box shadow to the card',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'background-color' },
						{ type: 'contains', value: 'box-shadow' }
					]
				}
			},
			hints: [
				'`background-color` sets a flat color behind the content.',
				'`box-shadow` adds depth: `box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);`.',
				'Add to `.card`: `background-color: #f8fafc; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);`'
			],
			conceptsTested: ['css.colors']
		}
	]
};
