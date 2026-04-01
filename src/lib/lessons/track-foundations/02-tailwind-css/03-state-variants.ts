import type { Lesson } from '$types/lesson';

export const stateVariants: Lesson = {
	id: 'foundations.tailwind-css.state-variants',
	slug: 'state-variants',
	title: 'Hover, Focus & State Variants',
	description: 'Add interactivity with Tailwind state variants — hover:, focus:, active:, and dark: modifiers.',
	trackId: 'foundations',
	moduleId: 'tailwind-css',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['tailwind.states', 'tailwind.pseudo-classes'],
	prerequisites: ['tailwind.utilities.basic'],

	content: [
		{
			type: 'text',
			content: `# Hover, Focus & State Variants

In traditional CSS, you style interactive states with pseudo-classes:

\`\`\`css
.btn:hover { background-color: #2563eb; }
.btn:focus { outline: 2px solid #3b82f6; }
\`\`\`

Tailwind replaces this with **state variant prefixes** that you apply directly in your markup:

\`\`\`html
<button class="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500">
  Click me
</button>
\`\`\`

Common state variants:
- **\`hover:\`** — mouse over the element
- **\`focus:\`** — element is focused (keyboard/click)
- **\`active:\`** — element is being pressed
- **\`disabled:\`** — form element is disabled
- **\`first:\`** / **\`last:\`** — first/last child`
		},
		{
			type: 'concept-callout',
			content: 'tailwind.states'
		},
		{
			type: 'text',
			content: `## Adding Hover States

The starter code has a button and card with no interactive styles. Let's make them feel alive.

For the button, add:
- A darker background on hover
- A subtle scale or color transition

**Task:** Add \`hover:\` utilities to the button element.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Focus States and Accessibility

Focus states are critical for keyboard navigation. Tailwind makes it easy to add visible focus indicators:

\`\`\`html
<button class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Accessible Button
</button>
\`\`\`

The \`ring\` utilities create a box-shadow-based outline that doesn't affect layout — perfect for focus indicators.

**Task:** Add \`focus:\` utilities to the button for keyboard accessibility.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Dark Mode Variant

Tailwind supports dark mode with the \`dark:\` prefix. When the user's system (or your app) enables dark mode, these utilities activate:

\`\`\`html
<div class="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
  Adapts to dark mode automatically
</div>
\`\`\`

**Task:** Add \`dark:\` variants to the card so it looks great in both light and dark mode.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and hover over the button to see which state variant utilities activate. Notice how Tailwind generates the appropriate CSS pseudo-class selectors under the hood.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let count = $state(0);
</script>

<!-- TODO: Add hover:, focus:, active:, and dark: variants -->
<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
    <h2 class="text-xl font-bold text-slate-800 mb-4">Interactive Card</h2>
    <p class="text-slate-600 mb-6">
      This card and button need interactive states. Add hover, focus, and dark mode styles.
    </p>

    <div class="flex items-center justify-between">
      <button
        onclick={() => count++}
        class="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        Clicked {count} times
      </button>

      <span class="text-sm text-slate-400">Try hovering & focusing</span>
    </div>
  </div>
</div>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let count = $state(0);
</script>

<div class="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
  <div class="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
    <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Interactive Card</h2>
    <p class="text-slate-600 dark:text-slate-300 mb-6">
      This card and button need interactive states. Add hover, focus, and dark mode styles.
    </p>

    <div class="flex items-center justify-between">
      <button
        onclick={() => count++}
        class="bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-95 text-white px-4 py-2 rounded-lg font-medium transition-all"
      >
        Clicked {count} times
      </button>

      <span class="text-sm text-slate-400 dark:text-slate-500">Try hovering & focusing</span>
    </div>
  </div>
</div>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add hover state to the button',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'hover:' }
					]
				}
			},
			hints: [
				'Add a `hover:` prefixed utility to the button to change its appearance on mouse over.',
				'Try `hover:bg-blue-600` to darken the button background on hover.',
				'Add to the button class: `hover:bg-blue-600` — the full class becomes `"bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"`'
			],
			conceptsTested: ['tailwind.states']
		},
		{
			id: 'cp-2',
			description: 'Add focus state for accessibility',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'focus:' }
					]
				}
			},
			hints: [
				'Focus states help keyboard users see which element is selected. Use the `focus:` prefix.',
				'The `ring` utilities are perfect for focus indicators: `focus:ring-2 focus:ring-blue-500`.',
				'Add to the button: `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`'
			],
			conceptsTested: ['tailwind.states', 'tailwind.pseudo-classes']
		},
		{
			id: 'cp-3',
			description: 'Add dark mode variant to the card',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'dark:' }
					]
				}
			},
			hints: [
				'Use the `dark:` prefix to apply styles when dark mode is active.',
				'Add `dark:bg-slate-800` to the card and `dark:text-slate-100` to the heading.',
				'Update the card div: `class="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-md p-6"` and heading: `class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4"`'
			],
			conceptsTested: ['tailwind.states']
		}
	]
};
