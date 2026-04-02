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

This eliminates context switching between HTML and CSS files, and means your styles are always co-located with the markup they affect.

## WHY: The 4px Grid Scale Philosophy

Tailwind's spacing scale is not arbitrary. Every value is a multiple of 4px (0.25rem at 16px base font):

| Class | Value | Pixels |
|-------|-------|--------|
| \`p-1\` | 0.25rem | 4px |
| \`p-2\` | 0.5rem | 8px |
| \`p-3\` | 0.75rem | 12px |
| \`p-4\` | 1rem | 16px |
| \`p-6\` | 1.5rem | 24px |
| \`p-8\` | 2rem | 32px |

**Why 4px?** The 4px grid is a design systems convention used by Material Design, Apple's Human Interface Guidelines, and most professional design tools. It works because:

1. **Divisibility** — 4 divides evenly into common screen sizes and font sizes
2. **Visual rhythm** — Consistent multiples create harmonious spacing that "feels right" without manual alignment
3. **Sub-pixel avoidance** — At any standard zoom level, 4px multiples render crisply without sub-pixel blurring

When you use \`p-4\` you are not just setting "1rem of padding" — you are saying "I want 4 units of spacing on the 4px grid." This makes your entire interface feel cohesive because every spacing decision snaps to the same underlying grid.

## WHY: The Design Token Approach

Tailwind's utility classes are really **design tokens** — named, constrained values from a shared system. When you write \`text-slate-700\`, you are not picking an arbitrary gray; you are referencing a specific color from a curated palette with tested contrast ratios.

This constraint is the key insight: by limiting your choices to a predefined scale, you make faster decisions and produce more consistent results. It is the same principle behind music theory — constraining yourself to a scale makes it easier to compose something that sounds good.

## Decision Framework: When Utility-First Fails

Utility-first is not always the right choice. Here are the legitimate cases where you should reach for traditional CSS:

1. **Complex animations** — Keyframe animations with multiple steps are unreadable as utilities
2. **Deeply nested selectors** — Styling third-party HTML you cannot add classes to (like CMS content or markdown output)
3. **Ultra-reusable patterns** — When 10+ elements share the exact same 8+ utilities, extract a component (in Svelte) or use \`@apply\` sparingly
4. **Pseudo-element content** — \`::before\` and \`::after\` with generated content are sometimes cleaner in CSS

**The rule of thumb:** If you are copying the same string of 6+ utilities more than 3 times, create a Svelte component instead of reaching for \`@apply\`.`
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

The naming convention is consistent: \`{property}-{value}\`. Once you learn the pattern, you can guess most class names correctly on the first try. \`text-\` is for text color and size, \`bg-\` is for background, \`rounded-\` is for border radius, \`shadow-\` is for box shadow.

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

The directional shorthands follow a logical pattern:
- \`p\` / \`m\` — all sides
- \`px\` / \`mx\` — horizontal (left and right, or more precisely inline-start and inline-end)
- \`py\` / \`my\` — vertical (top and bottom)
- \`pt\` / \`pr\` / \`pb\` / \`pl\` — individual sides
- \`ps\` / \`pe\` — logical start/end (for RTL support)

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
- \`max-w-sm\` — maximum width of 24rem (384px)

The shadow scale follows a progression from subtle to dramatic: \`shadow-sm\` (barely visible), \`shadow\` (default), \`shadow-md\` (medium), \`shadow-lg\` (large), \`shadow-xl\` (extra large), \`shadow-2xl\` (dramatic). Choose based on the element's perceived elevation — cards typically use \`shadow-md\`, modals use \`shadow-xl\`.

**Task:** Add background color, rounded corners, and a shadow to finish the card.

## Realistic Exercise: Converting a Component

After completing the checkpoints, try this mental exercise with any CSS you have written before:

1. Take a component with 5-10 CSS rules
2. For each rule, find the Tailwind utility equivalent
3. Count the lines of CSS you eliminated
4. Consider: is the markup harder to read? (Usually not, once you know the utility names)

The typical result is that a 30-line CSS file becomes 0 lines, and the markup gains 10-15 class names spread across 3-5 elements. The total code is less, and it is all in one place.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and compare the utility-class approach with the original CSS approach. Notice how every visual property is declared right on the element — no jumping between markup and styles. Hover over individual utility classes to see their CSS equivalent. This is the key insight: each utility maps to exactly one CSS declaration.'
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
