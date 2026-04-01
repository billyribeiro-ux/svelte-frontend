import type { Lesson } from '$types/lesson';

export const selectors: Lesson = {
	id: 'foundations.css-fundamentals.selectors',
	slug: 'selectors',
	title: 'CSS Selectors',
	description: 'Master type, class, ID, attribute, and pseudo-class selectors to target elements precisely.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 2,
	estimatedMinutes: 15,
	concepts: ['css.selectors', 'css.pseudo-classes', 'css.attribute-selectors'],
	prerequisites: ['foundations.css-fundamentals.how-css-works'],

	content: [
		{
			type: 'text',
			content: `# CSS Selectors

Selectors are patterns that match elements in the document. The selector you choose determines which elements receive the styles.

Common selector types:
- **Type** — \`p\`, \`div\`, \`h1\`
- **Class** — \`.card\`, \`.active\`
- **ID** — \`#header\`
- **Attribute** — \`[type="email"]\`
- **Pseudo-class** — \`:hover\`, \`:first-child\`, \`:nth-child()\``
		},
		{
			type: 'concept-callout',
			content: 'css.selectors'
		},
		{
			type: 'text',
			content: `## Type and Class Selectors

Type selectors target all elements of a given type. Class selectors target elements with a specific class attribute.

Look at the starter code. There is a list of items with no styling.

**Task:** Style all list items with a base style using a type selector, then add a \`.featured\` class to the first item with distinct styling.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Attribute and Pseudo-class Selectors

Attribute selectors match elements based on their attributes:

\`\`\`css
a[target="_blank"] { color: red; }
input[type="email"] { border-color: blue; }
\`\`\`

Pseudo-classes match elements in a specific state:

\`\`\`css
li:first-child { font-weight: bold; }
li:nth-child(even) { background: #f1f5f9; }
a:hover { text-decoration: underline; }
\`\`\`

**Task:** Use \`:nth-child(even)\` to give even list items a light background color.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how Svelte adds scoping classes to selectors. Notice how pseudo-classes are preserved alongside the scoping mechanism.'
		},
		{
			type: 'text',
			content: `## Combining Selectors

You can combine selectors for more precise targeting:

\`\`\`css
ul > li { }        /* Direct child */
.card .title { }   /* Descendant */
h2 + p { }         /* Adjacent sibling */
\`\`\`

**Task:** Add a hover state to list items that changes the background color.`
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
  let items = $state(['Design', 'Develop', 'Deploy', 'Iterate']);
</script>

<div class="container">
  <h2>Project Phases</h2>
  <ul>
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  /* TODO: Add type, class, pseudo-class, and combined selectors */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let items = $state(['Design', 'Develop', 'Deploy', 'Iterate']);
</script>

<div class="container">
  <h2>Project Phases</h2>
  <ul>
    {#each items as item, i}
      <li class={i === 0 ? 'featured' : ''}>{item}</li>
    {/each}
  </ul>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  li {
    padding: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .featured {
    font-weight: bold;
    color: var(--sf-accent, #6366f1);
  }

  li:nth-child(even) {
    background-color: #f1f5f9;
  }

  li:hover {
    background-color: #e2e8f0;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Style list items with a type selector and add a featured class',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'li\\s*\\{' },
						{ type: 'contains', value: '.featured' }
					]
				}
			},
			hints: [
				'Use `li { }` to target all list items with base styles like padding.',
				'Create a `.featured` class with distinct styling like bold text.',
				'Add: `li { padding: 0.5rem; }` and `.featured { font-weight: bold; color: #6366f1; }`'
			],
			conceptsTested: ['css.selectors']
		},
		{
			id: 'cp-2',
			description: 'Use :nth-child(even) to style alternating list items',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'nth-child(even)' },
						{ type: 'contains', value: 'background' }
					]
				}
			},
			hints: [
				'Pseudo-class selectors target elements in a specific state or position.',
				'Use `li:nth-child(even)` to select every other list item.',
				'Add: `li:nth-child(even) { background-color: #f1f5f9; }`'
			],
			conceptsTested: ['css.pseudo-classes']
		},
		{
			id: 'cp-3',
			description: 'Add a hover state to list items',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'li:hover' },
						{ type: 'contains', value: 'background' }
					]
				}
			},
			hints: [
				'The `:hover` pseudo-class targets elements the user is hovering over.',
				'Combine it with the `li` selector: `li:hover { }`.',
				'Add: `li:hover { background-color: #e2e8f0; }`'
			],
			conceptsTested: ['css.pseudo-classes']
		}
	]
};
