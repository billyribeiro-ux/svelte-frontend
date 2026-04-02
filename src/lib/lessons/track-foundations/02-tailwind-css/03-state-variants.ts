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
- **\`first:\`** / **\`last:\`** — first/last child

## WHY: Interaction State Ordering

When you apply multiple state variants to an element, the order in your class string matters for readability — but the order in the generated CSS matters for behavior. Tailwind generates state variants in a specific order to match natural interaction flow:

**hover -> focus -> active**

This order reflects what happens during a typical user interaction:
1. User moves mouse over element (\`hover\` activates)
2. User clicks down (\`active\` activates, \`hover\` still active)
3. After click, element receives focus (\`focus\` activates)

Because \`active\` and \`focus\` are generated after \`hover\` in the CSS, they override hover styles when both conditions are true. This means your active state is always visible during a click, and focus state persists after release.

**Decision framework for state styling:**
- \`hover:\` — Visual feedback on pointer devices. Change color, add shadow, show hidden elements.
- \`focus:\` — Keyboard accessibility indicator. Always use \`ring\` utilities. Never remove focus styles entirely.
- \`active:\` — Press feedback. Subtle scale (\`scale-95\`) or color shift during the click.
- \`focus-visible:\` — Show focus only for keyboard navigation (not mouse clicks). Preferred over \`focus:\` for purely visual elements.
- \`disabled:\` — Gray out and reduce opacity for inactive controls.`
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

Focus states are critical for keyboard navigation. Without visible focus indicators, keyboard users cannot tell which element is selected — they are essentially navigating blind.

Tailwind makes it easy to add visible focus indicators:

\`\`\`html
<button class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Accessible Button
</button>
\`\`\`

The \`ring\` utilities create a box-shadow-based outline that doesn't affect layout — perfect for focus indicators. Unlike \`outline\`, the ring follows \`border-radius\`, so it looks great on rounded elements.

**The ring system explained:**
- \`focus:ring-2\` — Sets ring width (2px)
- \`focus:ring-blue-500\` — Sets ring color
- \`focus:ring-offset-2\` — Adds a gap between the element and the ring (using box-shadow)
- \`focus:outline-none\` — Removes the browser default outline (replace it with the ring, do NOT just remove it)

**Critical accessibility rule:** Never use \`focus:outline-none\` without providing an alternative focus indicator. Removing the default focus ring without replacing it violates WCAG 2.1 Success Criterion 2.4.7 (Focus Visible).

**Task:** Add \`focus:\` utilities to the button for keyboard accessibility.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Group and Peer Modifiers

Sometimes you need to style an element based on the state of a different element. Tailwind provides two modifiers for this:

**\`group\` — Parent-to-child state:** Style a child when the parent is hovered, focused, etc.

\`\`\`html
<div class="group">
  <h3 class="group-hover:text-blue-500">Title</h3>
  <p class="group-hover:text-blue-300">Description</p>
</div>
\`\`\`

When you hover the outer \`div\`, both the title and description change color. The parent needs \`class="group"\` and children use \`group-hover:\`, \`group-focus:\`, etc.

**\`peer\` — Sibling-to-sibling state:** Style an element based on a preceding sibling's state.

\`\`\`html
<input class="peer" type="email" />
<span class="hidden peer-invalid:block text-red-500">
  Invalid email address
</span>
\`\`\`

The error message appears only when the input is invalid. The input needs \`class="peer"\` and the sibling uses \`peer-invalid:\`. The peer element must come BEFORE the styled element in the DOM.

**Named groups and peers:** When you have nested groups, use named variants to avoid ambiguity: \`group/card\` on the parent and \`group-hover/card:\` on the child.

## Dark Mode Variant

Tailwind supports dark mode with the \`dark:\` prefix. When the user's system (or your app) enables dark mode, these utilities activate:

\`\`\`html
<div class="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
  Adapts to dark mode automatically
</div>
\`\`\`

**Implementation strategies (media vs class):**

- **\`media\` strategy (default):** Responds to \`prefers-color-scheme: dark\` — the user's OS-level setting. Zero JavaScript required. Best for simple sites.
- **\`class\` strategy:** Requires adding \`class="dark"\` to the \`<html>\` element. Gives you manual control via a toggle switch. Best for apps where users should choose their preference.

Configure in \`tailwind.config.js\`:
\`\`\`js
export default {
  darkMode: 'class', // or 'media' (default)
}
\`\`\`

**Decision framework for dark mode:**
- Personal portfolio or blog? Use \`media\` — respect the user's system preference.
- SaaS app or dashboard? Use \`class\` — give users a toggle in settings, store preference in localStorage.
- Either way: always provide a \`dark:\` variant for \`bg-\`, \`text-\`, \`border-\`, and \`shadow-\` utilities on every visible element.

**Task:** Add \`dark:\` variants to the card so it looks great in both light and dark mode.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and hover over the button to see which state variant utilities activate. Notice how Tailwind generates the appropriate CSS pseudo-class selectors under the hood. Try tabbing to the button with your keyboard — the focus ring should be clearly visible, confirming that your focus states work for keyboard users.'
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
