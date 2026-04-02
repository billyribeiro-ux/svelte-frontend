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

The key insight: unprefixed utilities apply to **all** screen sizes, while prefixed utilities apply at that breakpoint **and above**.

## WHY: Mobile-First vs Desktop-First Strategy

There are two philosophies for responsive design:

**Mobile-first (Tailwind's approach):** Write styles for the smallest screen, then add complexity at larger breakpoints. This means your base CSS is the simplest, and you progressively enhance for larger screens.

**Desktop-first (the old way):** Write styles for desktop, then override with \`max-width\` media queries for smaller screens. This leads to bloated base styles and lots of overrides.

**Why mobile-first wins:**
1. **Performance** — Mobile devices are the weakest. By making the simplest styles the default, mobile users download and parse less CSS.
2. **Progressive enhancement** — You start with the essential layout and add sophistication. This is more robust than starting complex and trying to simplify.
3. **Statistics** — Over 60% of web traffic is mobile. Designing for the majority first is pragmatic.
4. **Cognitive simplicity** — It is easier to think "add a second column when there's room" than "collapse the second column when there isn't room."

## WHY: min-width Media Queries

Tailwind's breakpoints use \`min-width\` because they compose naturally with mobile-first thinking:

\`\`\`css
/* What sm:grid-cols-2 generates */
@media (min-width: 640px) {
  .sm\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
}
\`\`\`

With \`min-width\`, each breakpoint adds to the previous one. You never need to "undo" styles — you only add new ones. With \`max-width\` (desktop-first), you constantly override what came before, leading to specificity conflicts and forgotten overrides.

**Decision framework for reading responsive Tailwind:**
- Read left to right: base styles first, then breakpoints in ascending order
- \`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3\` reads as: "1 column by default, 2 columns at 640px+, 3 columns at 1024px+"
- If a breakpoint prefix is missing, the previous value carries through

## Breakpoint Selection Philosophy

Tailwind's default breakpoints (640, 768, 1024, 1280, 1536) are not magic numbers. They are pragmatic ranges that cover the most common device widths. But you should think about breakpoints differently:

**Do not design for specific devices.** The iPhone 15 is 393px wide. The Galaxy S24 is 360px. If you target exact device widths, you are playing a losing game. Instead, **let the content tell you where to break.** If your layout looks cramped at 500px but fine at 600px, \`sm:\` (640px) is a good breakpoint. If it needs to change at 900px, \`md:\` (768px) is close enough, or you can customize the breakpoints in your config.`
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

This is the most common responsive pattern in web development, and it requires exactly one line of Tailwind classes. In traditional CSS, this would require the grid declaration plus two media query blocks.

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

**Why responsive typography matters:** A 3rem (48px) heading looks great on a desktop monitor with 1200px of content width. On a 375px phone screen, that same heading takes up 3 lines and pushes the content below the fold. By starting with \`text-2xl\` (1.5rem) and scaling up at breakpoints, your typography adapts to the available space.

The alternative is fluid typography with \`clamp()\`, which you will learn in the CSS Layout module. Both approaches are valid — breakpoint-based is simpler and more predictable, while fluid scaling is smoother.

**Task:** Make the page heading and card text responsive using breakpoint prefixes.

## Realistic Exercise: Responsive Audit

After completing the checkpoints, think about a real project scenario:

You receive a design with three mockups: mobile (375px), tablet (768px), and desktop (1440px). Your approach should be:

1. **Start with the mobile mockup.** Write all base (unprefixed) styles to match it exactly.
2. **Compare mobile to tablet.** For every difference, add the appropriate \`sm:\` or \`md:\` prefix. Common changes: column count, font sizes, spacing, element visibility.
3. **Compare tablet to desktop.** Add \`lg:\` or \`xl:\` prefixes for remaining differences.
4. **Test the in-between.** Resize from 320px to 1920px and check for awkward breakpoints where the layout looks bad. Adjust if needed.

This workflow ensures you never write contradictory styles and every breakpoint builds cleanly on the previous one.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Resize the preview panel to see how breakpoint prefixes activate at different widths. X-Ray mode highlights which responsive utilities are currently active. Notice the moment each breakpoint triggers — the change is instant because min-width media queries have a single threshold, not a range.'
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
