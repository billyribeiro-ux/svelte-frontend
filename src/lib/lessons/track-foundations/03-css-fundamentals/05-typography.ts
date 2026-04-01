import type { Lesson } from '$types/lesson';

export const typography: Lesson = {
	id: 'foundations.css-fundamentals.typography',
	slug: 'typography',
	title: 'Typography',
	description: 'Master font properties, text styling, @font-face, and variable fonts for beautiful, readable text.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 5,
	estimatedMinutes: 12,
	concepts: ['css.font-properties', 'css.text-properties', 'css.variable-fonts'],
	prerequisites: ['foundations.css-fundamentals.colors-and-backgrounds'],

	content: [
		{
			type: 'text',
			content: `# Typography

Good typography makes content readable and visually appealing. CSS provides extensive control over text rendering:

- **Font properties** — \`font-family\`, \`font-size\`, \`font-weight\`
- **Text properties** — \`line-height\`, \`letter-spacing\`, \`text-align\`
- **\`@font-face\`** — Load custom fonts
- **Variable fonts** — One font file with adjustable axes`
		},
		{
			type: 'concept-callout',
			content: 'css.font-properties'
		},
		{
			type: 'text',
			content: `## Font Properties

The foundation of typography is choosing and sizing fonts:

\`\`\`css
font-family: 'Inter', system-ui, sans-serif;
font-size: 1.125rem;
font-weight: 600;
font-style: italic;
\`\`\`

Look at the starter code. The text uses browser defaults.

**Task:** Set the body font to \`system-ui, sans-serif\` and the heading \`font-weight\` to \`700\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Text Properties

Fine-tune readability with text properties:

\`\`\`css
line-height: 1.6;         /* Vertical rhythm */
letter-spacing: -0.02em;  /* Tighten headings */
text-align: center;
text-transform: uppercase;
text-wrap: balance;        /* Even line lengths */
\`\`\`

**Task:** Set \`line-height: 1.6\` on the paragraph and \`letter-spacing: -0.02em\` on the heading.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how line-height affects the spacing between text lines. Notice the difference between the heading and paragraph line heights.'
		},
		{
			type: 'text',
			content: `## Variable Fonts

Variable fonts contain multiple styles in a single file, controlled via \`font-variation-settings\` or standard properties:

\`\`\`css
/* Using standard properties (preferred) */
font-weight: 450;  /* Any value in the font's range */
font-stretch: 87%;

/* Using font-variation-settings */
font-variation-settings: 'wght' 450, 'wdth' 87;
\`\`\`

**Task:** Add \`text-wrap: balance\` to the heading to create visually balanced line breaks.`
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
  let heading = $state('The Art of Typography');
</script>

<article class="prose">
  <h1>{heading}</h1>
  <p>Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. Good typography enhances the reading experience.</p>
  <p>The right combination of font size, line height, and letter spacing creates a comfortable reading rhythm that keeps readers engaged.</p>
</article>

<style>
  .prose {
    max-width: 65ch;
    padding: 2rem;
  }

  /* TODO: Add font, text, and typography styles */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let heading = $state('The Art of Typography');
</script>

<article class="prose">
  <h1>{heading}</h1>
  <p>Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. Good typography enhances the reading experience.</p>
  <p>The right combination of font size, line height, and letter spacing creates a comfortable reading rhythm that keeps readers engaged.</p>
</article>

<style>
  .prose {
    max-width: 65ch;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  h1 {
    font-weight: 700;
    letter-spacing: -0.02em;
    text-wrap: balance;
    color: var(--sf-accent, #6366f1);
  }

  p {
    line-height: 1.6;
    color: #334155;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Set the font family and heading font weight',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'font-family' },
						{ type: 'contains', value: 'font-weight: 700' }
					]
				}
			},
			hints: [
				'`font-family` sets the typeface — always include a fallback stack.',
				'Set `font-family: system-ui, sans-serif` on `.prose` and `font-weight: 700` on `h1`.',
				'Add to `.prose`: `font-family: system-ui, sans-serif;` and add `h1 { font-weight: 700; }`'
			],
			conceptsTested: ['css.font-properties']
		},
		{
			id: 'cp-2',
			description: 'Set line-height on paragraphs and letter-spacing on the heading',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'line-height: 1.6' },
						{ type: 'contains', value: 'letter-spacing' }
					]
				}
			},
			hints: [
				'`line-height` controls the vertical space between lines of text.',
				'Set `line-height: 1.6` on `p` and `letter-spacing: -0.02em` on `h1`.',
				'Add: `p { line-height: 1.6; }` and update `h1` with `letter-spacing: -0.02em;`'
			],
			conceptsTested: ['css.text-properties']
		},
		{
			id: 'cp-3',
			description: 'Add text-wrap: balance to the heading',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'text-wrap: balance' }
					]
				}
			},
			hints: [
				'`text-wrap: balance` distributes text evenly across lines.',
				'Add it to the `h1` rule.',
				'Update `h1` to include: `text-wrap: balance;`'
			],
			conceptsTested: ['css.text-properties']
		}
	]
};
