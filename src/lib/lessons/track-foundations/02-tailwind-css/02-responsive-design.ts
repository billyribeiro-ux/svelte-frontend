import type { Lesson } from '$types/lesson';

export const responsiveDesign: Lesson = {
	id: 'foundations.tailwind-css.responsive-design',
	slug: 'responsive-design',
	title: 'Responsive Design with Breakpoints',
	description: 'Master Tailwind\'s mobile-first responsive design using breakpoint prefixes like sm:, md:, and lg:.',
	trackId: 'foundations',
	moduleId: 'tailwind-css',
	order: 2,
	estimatedMinutes: 15,
	concepts: ['tailwind.responsive', 'tailwind.breakpoints'],
	prerequisites: ['tailwind.utilities.basic'],

	content: [
		{
			type: 'text',
			content: `# Responsive Design with Breakpoints

Tailwind uses a **mobile-first** approach to responsive design. You write base styles for the smallest screen, then layer on changes at larger breakpoints using prefixes:

| Prefix | Min Width | Typical Device |
|--------|-----------|----------------|
| (none) | 0px | Mobile phones |
| \`sm:\` | 640px | Large phones / small tablets |
| \`md:\` | 768px | Tablets |
| \`lg:\` | 1024px | Laptops |
| \`xl:\` | 1280px | Desktops |
| \`2xl:\` | 1536px | Large monitors |

The key insight: unprefixed utilities apply to **all** screen sizes, while prefixed utilities apply at that breakpoint **and above**.`
		},
		{
			type: 'concept-callout',
			content: 'tailwind.responsive'
		},
		{
			type: 'text',
			content: `## Building a Responsive Grid

A common pattern is a card grid that stacks on mobile and expands on wider screens:

\`\`\`html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards stack on mobile, 2 columns on tablet, 3 on desktop -->
</div>
\`\`\`

Notice how:
- \`grid-cols-1\` is the base (mobile) — one column
- \`sm:grid-cols-2\` kicks in at 640px — two columns
- \`lg:grid-cols-3\` kicks in at 1024px — three columns

**Task:** The starter code has a grid locked to 3 columns. Make it responsive so it starts at 1 column on mobile and expands at larger breakpoints.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Responsive Typography

You can also adjust text sizes across breakpoints:

\`\`\`html
<h1 class="text-2xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>
\`\`\`

This makes headings smaller on mobile and progressively larger on wider screens — keeping things readable at every size.

**Task:** Make the page heading and card text responsive using breakpoint prefixes.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Resize the preview panel to see how breakpoint prefixes activate at different widths. X-Ray mode highlights which responsive utilities are currently active.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let cards = $state([
    { title: 'Design', description: 'Create beautiful interfaces with utility classes.' },
    { title: 'Develop', description: 'Build responsive layouts in minutes.' },
    { title: 'Deploy', description: 'Ship production-ready sites with confidence.' },
    { title: 'Iterate', description: 'Rapidly prototype and refine your ideas.' },
    { title: 'Scale', description: 'Maintain consistency across large projects.' },
    { title: 'Optimize', description: 'Performance-first styling with zero unused CSS.' }
  ]);
</script>

<!-- TODO: Make this grid responsive with breakpoint prefixes -->
<div class="max-w-6xl mx-auto p-4">
  <h1 class="text-4xl font-bold text-slate-900 mb-8">Our Process</h1>

  <div class="grid grid-cols-3 gap-6">
    {#each cards as card}
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-slate-800 mb-2">{card.title}</h2>
        <p class="text-slate-600">{card.description}</p>
      </div>
    {/each}
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
  let cards = $state([
    { title: 'Design', description: 'Create beautiful interfaces with utility classes.' },
    { title: 'Develop', description: 'Build responsive layouts in minutes.' },
    { title: 'Deploy', description: 'Ship production-ready sites with confidence.' },
    { title: 'Iterate', description: 'Rapidly prototype and refine your ideas.' },
    { title: 'Scale', description: 'Maintain consistency across large projects.' },
    { title: 'Optimize', description: 'Performance-first styling with zero unused CSS.' }
  ]);
</script>

<div class="max-w-6xl mx-auto p-4">
  <h1 class="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-8">Our Process</h1>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each cards as card}
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-lg sm:text-xl font-semibold text-slate-800 mb-2">{card.title}</h2>
        <p class="text-sm md:text-base text-slate-600">{card.description}</p>
      </div>
    {/each}
  </div>
</div>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add mobile-first responsive columns to the grid',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '(sm|md):grid-cols-' }
					]
				}
			},
			hints: [
				'The grid currently forces 3 columns at all sizes. Start from 1 column and scale up.',
				'Change `grid-cols-3` to `grid-cols-1` and add breakpoint prefixes like `sm:grid-cols-2` and `lg:grid-cols-3`.',
				'Use: `class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"`'
			],
			conceptsTested: ['tailwind.responsive', 'tailwind.breakpoints']
		},
		{
			id: 'cp-2',
			description: 'Make text responsive across breakpoints',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '(sm|md|lg):text-' }
					]
				}
			},
			hints: [
				'Text sizes can also use breakpoint prefixes like `md:text-4xl`.',
				'Start with a smaller base size and increase at larger breakpoints — e.g., `text-2xl md:text-4xl`.',
				'Change the heading to: `class="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-8"`'
			],
			conceptsTested: ['tailwind.responsive', 'tailwind.breakpoints']
		}
	]
};
