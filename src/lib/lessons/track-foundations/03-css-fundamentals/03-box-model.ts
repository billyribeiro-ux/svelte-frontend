import type { Lesson } from '$types/lesson';

export const boxModel: Lesson = {
	id: 'foundations.css-fundamentals.box-model',
	slug: 'box-model',
	title: 'The Box Model',
	description: 'Learn how content, padding, border, and margin work together — and why box-sizing changes everything.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['css.box-model', 'css.box-sizing', 'css.margin'],
	prerequisites: ['foundations.css-fundamentals.selectors'],

	content: [
		{
			type: 'text',
			content: `# The Box Model

Every element in CSS is a rectangular box. The box model defines how the size of that box is calculated:

1. **Content** — The actual text or child elements
2. **Padding** — Space between content and border
3. **Border** — The edge of the box
4. **Margin** — Space outside the border`
		},
		{
			type: 'concept-callout',
			content: 'css.box-model'
		},
		{
			type: 'text',
			content: `## Content and Padding

Padding adds space inside the box, between the content and the border. It can be set per-side or with shorthand.

Look at the starter code. The card has no padding and feels cramped.

**Task:** Add \`padding: 1.5rem\` to the card and \`padding-block: 0.5rem\` to the heading.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Box Sizing

By default, CSS uses \`content-box\` — width and height only apply to the content. Padding and border are added on top.

\`border-box\` includes padding and border in the width/height calculation:

\`\`\`css
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

**Task:** Add a border to the card and set \`box-sizing: border-box\` so the total width stays at \`300px\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how padding, border, and margin are visualized around each element. Compare what happens with `content-box` vs `border-box`.'
		},
		{
			type: 'text',
			content: `## Margin and Spacing

Margin creates space outside the element. Unlike padding, margins can collapse — adjacent vertical margins combine into a single margin.

**Task:** Add \`margin-block-end: 1rem\` to the card paragraphs for consistent vertical spacing.`
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
  let cardTitle = $state('Box Model Demo');
</script>

<div class="card" style="width: 300px;">
  <h3>{cardTitle}</h3>
  <p>Content sits inside the box.</p>
  <p>Padding adds breathing room.</p>
  <p>Borders define the edge.</p>
</div>

<style>
  .card {
    background: #f8fafc;
    border-radius: 0.5rem;
    font-family: system-ui, sans-serif;
  }

  h3 {
    margin: 0;
    color: var(--sf-accent, #6366f1);
  }

  /* TODO: Add padding, border, box-sizing, and margin rules */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let cardTitle = $state('Box Model Demo');
</script>

<div class="card" style="width: 300px;">
  <h3>{cardTitle}</h3>
  <p>Content sits inside the box.</p>
  <p>Padding adds breathing room.</p>
  <p>Borders define the edge.</p>
</div>

<style>
  .card {
    background: #f8fafc;
    border-radius: 0.5rem;
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    border: 2px solid #e2e8f0;
    box-sizing: border-box;
  }

  h3 {
    margin: 0;
    padding-block: 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  p {
    margin-block-end: 1rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add padding to the card and heading',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'padding: 1.5rem' },
						{ type: 'contains', value: 'padding-block' }
					]
				}
			},
			hints: [
				'Padding creates space between the content and the border.',
				'Add `padding: 1.5rem` to `.card` and `padding-block: 0.5rem` to `h3`.',
				'Update the `.card` rule to include `padding: 1.5rem;` and the `h3` rule to include `padding-block: 0.5rem;`.'
			],
			conceptsTested: ['css.box-model']
		},
		{
			id: 'cp-2',
			description: 'Add a border and set box-sizing to border-box on the card',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'border:' },
						{ type: 'contains', value: 'box-sizing: border-box' }
					]
				}
			},
			hints: [
				'With `content-box`, adding a border increases the total width beyond 300px.',
				'`box-sizing: border-box` includes padding and border in the declared width.',
				'Add to `.card`: `border: 2px solid #e2e8f0; box-sizing: border-box;`'
			],
			conceptsTested: ['css.box-sizing']
		},
		{
			id: 'cp-3',
			description: 'Add vertical margin to paragraphs for spacing',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'margin-block-end' }
					]
				}
			},
			hints: [
				'`margin-block-end` adds space below the element in block flow.',
				'Target `p` elements and set `margin-block-end: 1rem`.',
				'Add: `p { margin-block-end: 1rem; }`'
			],
			conceptsTested: ['css.margin']
		}
	]
};
