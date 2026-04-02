import type { Lesson } from '$types/lesson';

export const logicalProperties: Lesson = {
	id: 'foundations.css-layout.logical-properties',
	slug: 'logical-properties',
	title: 'Logical Properties',
	description: 'Use inline/block directions, start/end, and margin-inline for internationalization-ready layouts.',
	trackId: 'foundations',
	moduleId: 'css-layout',
	order: 5,
	estimatedMinutes: 10,
	concepts: ['css.logical-properties', 'css.inline-block', 'css.writing-modes'],
	prerequisites: ['foundations.css-layout.responsive-design'],

	content: [
		{
			type: 'text',
			content: `# Logical Properties

Logical properties replace physical directions (top, right, bottom, left) with flow-relative ones that adapt to writing direction:

- **Block** — The direction content stacks (top-to-bottom in English)
- **Inline** — The direction text flows (left-to-right in English)
- **Start/End** — Replace left/right and top/bottom`
		},
		{
			type: 'concept-callout',
			content: 'css.logical-properties'
		},
		{
			type: 'text',
			content: `## Block and Inline Directions

Physical properties and their logical equivalents:

| Physical | Logical |
|----------|---------|
| \`margin-top\` | \`margin-block-start\` |
| \`margin-bottom\` | \`margin-block-end\` |
| \`padding-left\` | \`padding-inline-start\` |
| \`padding-right\` | \`padding-inline-end\` |

Look at the starter code. It uses physical properties.

**Task:** Replace \`margin-top\` with \`margin-block-start\` and \`padding-left\`/\`padding-right\` with \`padding-inline\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Shorthand Logical Properties

Logical shorthands let you set both start and end at once:

\`\`\`css
margin-block: 1rem 2rem;   /* block-start, block-end */
margin-inline: auto;        /* center horizontally */
padding-inline: 1rem;       /* left and right */
border-inline-start: 3px solid blue;
\`\`\`

**Task:** Use \`margin-inline: auto\` to center the container and \`padding-block: 2rem\` for vertical padding.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and change the `dir` attribute to `rtl`. Observe how logical properties automatically flip inline directions for right-to-left languages.'
		},
		{
			type: 'text',
			content: `## Logical Sizing

Size properties have logical equivalents too:

\`\`\`css
inline-size: 100%;     /* replaces width */
block-size: 50vh;      /* replaces height */
max-inline-size: 65ch; /* replaces max-width */
\`\`\`

**Task:** Replace \`max-width\` with \`max-inline-size\` on the container.`
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
  let title = $state('Logical Properties');
</script>

<div class="container">
  <h1>{title}</h1>
  <p>Logical properties make your CSS internationalization-ready by using flow-relative directions instead of physical ones.</p>
  <div class="card">
    <h3>Benefits</h3>
    <ul>
      <li>Works with any writing direction</li>
      <li>RTL support built-in</li>
      <li>Future-proof approach</li>
    </ul>
  </div>
</div>

<style>
  .container {
    max-width: 65ch;
    margin-top: 2rem;
    padding-left: 1rem;
    padding-right: 1rem;
    font-family: system-ui, sans-serif;
  }

  h1 {
    color: var(--sf-accent, #6366f1);
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

  /* TODO: Convert to logical properties */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('Logical Properties');
</script>

<div class="container">
  <h1>{title}</h1>
  <p>Logical properties make your CSS internationalization-ready by using flow-relative directions instead of physical ones.</p>
  <div class="card">
    <h3>Benefits</h3>
    <ul>
      <li>Works with any writing direction</li>
      <li>RTL support built-in</li>
      <li>Future-proof approach</li>
    </ul>
  </div>
</div>

<style>
  .container {
    max-inline-size: 65ch;
    margin-block-start: 2rem;
    margin-inline: auto;
    padding-inline: 1rem;
    padding-block: 2rem;
    font-family: system-ui, sans-serif;
  }

  h1 {
    color: var(--sf-accent, #6366f1);
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
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Replace physical margin and padding with logical equivalents',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'margin-block-start' },
						{ type: 'contains', value: 'padding-inline' }
					]
				}
			},
			hints: [
				'`margin-top` becomes `margin-block-start` in logical properties.',
				'`padding-left` and `padding-right` can be combined into `padding-inline`.',
				'Replace with: `margin-block-start: 2rem;` and `padding-inline: 1rem;`'
			],
			conceptsTested: ['css.logical-properties']
		},
		{
			id: 'cp-2',
			description: 'Use margin-inline: auto and padding-block for centering and spacing',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'margin-inline: auto' },
						{ type: 'contains', value: 'padding-block' }
					]
				}
			},
			hints: [
				'`margin-inline: auto` centers a block element horizontally.',
				'`padding-block: 2rem` adds vertical padding using logical properties.',
				'Add to `.container`: `margin-inline: auto; padding-block: 2rem;`'
			],
			conceptsTested: ['css.inline-block']
		},
		{
			id: 'cp-3',
			description: 'Replace max-width with max-inline-size',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'max-inline-size' }
					]
				}
			},
			hints: [
				'`max-width` has a logical equivalent: `max-inline-size`.',
				'Replace `max-width: 65ch` with `max-inline-size: 65ch`.',
				'Update `.container` to use: `max-inline-size: 65ch;`'
			],
			conceptsTested: ['css.logical-properties']
		}
	]
};
