import type { Lesson } from '$types/lesson';

export const utilityFirstBasics: Lesson = {
	id: 'foundations.tailwind-css.utility-first-basics',
	slug: 'utility-first-basics',
	title: 'Utility-First CSS with Tailwind',
	description: 'Learn the utility-first approach to CSS — apply styles directly with class names instead of writing custom CSS.',
	trackId: 'foundations',
	moduleId: 'tailwind-css',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['tailwind.philosophy', 'tailwind.utilities.basic'],
	prerequisites: ['css.selectors', 'css.box-model'],

	content: [
		{
			type: 'text',
			content: `# Utility-First CSS with Tailwind

Traditional CSS asks you to invent class names like \`.card-wrapper\` or \`.btn-primary\`, then write styles in a separate \`<style>\` block. Tailwind flips this: you apply small, single-purpose **utility classes** directly in your markup.

Instead of:
\`\`\`css
.card { padding: 1rem; background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
\`\`\`

You write:
\`\`\`html
<div class="p-4 bg-white rounded-lg shadow-md">...</div>
\`\`\`

This eliminates context switching between HTML and CSS files, and means your styles are always co-located with the markup they affect.`
		},
		{
			type: 'concept-callout',
			content: 'tailwind.philosophy'
		},
		{
			type: 'text',
			content: `## Core Utility Categories

Tailwind organizes utilities into intuitive categories:

- **Layout**: \`flex\`, \`grid\`, \`block\`, \`inline\`, \`items-center\`, \`justify-between\`
- **Spacing**: \`p-4\` (padding), \`m-2\` (margin), \`px-6\` (horizontal padding), \`mt-8\` (margin-top)
- **Typography**: \`text-lg\`, \`font-bold\`, \`text-gray-700\`, \`leading-relaxed\`
- **Backgrounds**: \`bg-white\`, \`bg-blue-500\`, \`bg-gradient-to-r\`
- **Borders**: \`rounded-lg\`, \`border\`, \`border-gray-200\`
- **Effects**: \`shadow-md\`, \`opacity-50\`, \`transition\`

The number scale follows a consistent pattern: \`p-1\` = 0.25rem, \`p-2\` = 0.5rem, \`p-4\` = 1rem, \`p-8\` = 2rem.

**Task:** Convert the card component from traditional CSS to Tailwind utilities. Start by adding layout utilities to the card.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Spacing Utilities

Spacing is where utility-first really shines. Instead of remembering custom class names, you use a predictable scale:

\`\`\`html
<div class="p-4 m-2">  <!-- padding: 1rem, margin: 0.5rem -->
<div class="px-6 py-3"> <!-- horizontal padding: 1.5rem, vertical: 0.75rem -->
<div class="mt-8 mb-4"> <!-- margin-top: 2rem, margin-bottom: 1rem -->
\`\`\`

**Task:** Add spacing utilities to the card content and avatar area.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Visual Utilities

Complete the card by adding background, border-radius, and shadow utilities:

- \`bg-white\` — white background
- \`rounded-lg\` — large border radius (0.5rem)
- \`shadow-md\` — medium drop shadow

**Task:** Add background color, rounded corners, and a shadow to finish the card.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and compare the utility-class approach with the original CSS approach. Notice how every visual property is declared right on the element — no jumping between markup and styles.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let name = $state('Jane Cooper');
  let role = $state('Full-Stack Developer');
</script>

<!-- TODO: Replace the custom CSS classes with Tailwind utility classes -->
<div class="card">
  <div class="card-body">
    <img class="avatar" src="https://i.pravatar.cc/80" alt="Avatar" />
    <div class="card-info">
      <h2 class="card-name">{name}</h2>
      <p class="card-role">{role}</p>
    </div>
  </div>
</div>

<style>
  .card {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    max-width: 24rem;
  }
  .card-body {
    display: flex;
    align-items: center;
    padding: 1rem;
    gap: 1rem;
  }
  .avatar {
    width: 5rem;
    height: 5rem;
    border-radius: 9999px;
  }
  .card-name {
    font-size: 1.125rem;
    font-weight: 600;
    color: #1e293b;
  }
  .card-role {
    font-size: 0.875rem;
    color: #64748b;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let name = $state('Jane Cooper');
  let role = $state('Full-Stack Developer');
</script>

<div class="max-w-sm bg-white rounded-lg shadow-md">
  <div class="flex items-center p-4 gap-4">
    <img class="w-20 h-20 rounded-full" src="https://i.pravatar.cc/80" alt="Avatar" />
    <div>
      <h2 class="text-lg font-semibold text-slate-800">{name}</h2>
      <p class="text-sm text-slate-500">{role}</p>
    </div>
  </div>
</div>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add layout utilities (flex and alignment)',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'flex' },
						{ type: 'regex', value: '(items-center|justify-)' }
					]
				}
			},
			hints: [
				'The card body should be a flex container with centered items.',
				'Replace the `.card-body` class with Tailwind: add `flex` and `items-center` to the element\'s class attribute.',
				'Change the card-body div to: `<div class="flex items-center gap-4">`'
			],
			conceptsTested: ['tailwind.philosophy', 'tailwind.utilities.basic']
		},
		{
			id: 'cp-2',
			description: 'Add spacing utilities (padding and margin)',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'p-\\d' }
					]
				}
			},
			hints: [
				'Spacing utilities follow the pattern `p-{size}` for padding and `m-{size}` for margin.',
				'The card body needs padding. Try `p-4` for 1rem of padding on all sides.',
				'Add `p-4` to the card-body div\'s class: `<div class="flex items-center p-4 gap-4">`'
			],
			conceptsTested: ['tailwind.utilities.basic']
		},
		{
			id: 'cp-3',
			description: 'Add visual utilities (background, rounded corners, shadow)',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'bg-' },
						{ type: 'contains', value: 'rounded' }
					]
				}
			},
			hints: [
				'The outer card div needs background color, rounded corners, and a shadow.',
				'Use `bg-white` for the background, `rounded-lg` for corners, and `shadow-md` for the shadow.',
				'Change the card div to: `<div class="max-w-sm bg-white rounded-lg shadow-md">`'
			],
			conceptsTested: ['tailwind.utilities.basic']
		}
	]
};
