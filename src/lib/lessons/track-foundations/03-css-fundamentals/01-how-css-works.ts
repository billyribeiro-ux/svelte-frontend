import type { Lesson } from '$types/lesson';

export const howCssWorks: Lesson = {
	id: 'foundations.css-fundamentals.how-css-works',
	slug: 'how-css-works',
	title: 'How CSS Works',
	description: 'Understand the cascade, specificity, and inheritance — the three pillars that determine which styles get applied.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 1,
	estimatedMinutes: 12,
	concepts: ['css.cascade', 'css.specificity', 'css.inheritance'],
	prerequisites: [],

	content: [
		{
			type: 'text',
			content: `# How CSS Works

CSS stands for **Cascading Style Sheets**. The "cascading" part is key — it defines how the browser decides which styles win when multiple rules target the same element.

Three mechanisms control this:
- **Cascade** — Later rules override earlier ones (when specificity is equal)
- **Specificity** — More specific selectors win over less specific ones
- **Inheritance** — Some properties pass from parent to child automatically`
		},
		{
			type: 'concept-callout',
			content: 'css.cascade'
		},
		{
			type: 'text',
			content: `## The Cascade in Action

When two rules target the same element with equal specificity, the one that appears later wins.

Look at the starter code. There are two conflicting color rules on the paragraph.

**Task:** Add a third rule that sets the paragraph color to \`green\` by leveraging cascade order.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Specificity

Specificity is a scoring system:
- **Element selectors** (\`p\`, \`div\`) — lowest
- **Class selectors** (\`.intro\`) — medium
- **ID selectors** (\`#main\`) — highest

\`\`\`css
p { color: blue; }          /* specificity: 0-0-1 */
.intro { color: green; }    /* specificity: 0-1-0 */
#main { color: red; }       /* specificity: 1-0-0 */
\`\`\`

**Task:** Add a class \`highlighted\` to the paragraph and use it to set a \`background-color\` of \`yellow\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how Svelte scopes styles to the component. Notice the generated class attributes that prevent style leaking.'
		},
		{
			type: 'text',
			content: `## Inheritance

Some CSS properties are inherited by child elements automatically — mostly text-related properties like \`color\`, \`font-family\`, and \`line-height\`. Layout properties like \`padding\` and \`margin\` are not inherited.

**Task:** Set \`font-family: system-ui, sans-serif\` on the wrapper div and verify that the child elements inherit it.`
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
  let title = $state('How CSS Works');
</script>

<div class="wrapper">
  <h1>{title}</h1>
  <p>This paragraph has conflicting styles.</p>
  <!-- TODO: Add class to paragraph -->
</div>

<style>
  p {
    color: blue;
  }

  p {
    color: red;
  }

  /* TODO: Add cascade, specificity, and inheritance rules */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('How CSS Works');
</script>

<div class="wrapper">
  <h1>{title}</h1>
  <p class="highlighted">This paragraph has conflicting styles.</p>
</div>

<style>
  .wrapper {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  p {
    color: blue;
  }

  p {
    color: red;
  }

  p {
    color: green;
  }

  .highlighted {
    background-color: yellow;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add a third rule that sets the paragraph color to green using cascade order',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'color: green' }
					]
				}
			},
			hints: [
				'The cascade means later rules override earlier ones at equal specificity.',
				'Add another `p { color: green; }` rule after the existing ones.',
				'Add: `p { color: green; }` after the second `p` rule in the style block.'
			],
			conceptsTested: ['css.cascade']
		},
		{
			id: 'cp-2',
			description: 'Add a highlighted class to the paragraph with a yellow background',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'highlighted' },
						{ type: 'contains', value: 'background-color: yellow' }
					]
				}
			},
			hints: [
				'Add `class="highlighted"` to the `<p>` element in the template.',
				'Create a `.highlighted` selector in the style block.',
				'Add: `.highlighted { background-color: yellow; }` and update the paragraph to `<p class="highlighted">`.'
			],
			conceptsTested: ['css.specificity']
		},
		{
			id: 'cp-3',
			description: 'Set font-family on the wrapper div so children inherit it',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '.wrapper' },
						{ type: 'contains', value: 'font-family' }
					]
				}
			},
			hints: [
				'Inherited properties like `font-family` flow from parent to child.',
				'Target `.wrapper` and set `font-family: system-ui, sans-serif`.',
				'Add: `.wrapper { font-family: system-ui, sans-serif; }`'
			],
			conceptsTested: ['css.inheritance']
		}
	]
};
