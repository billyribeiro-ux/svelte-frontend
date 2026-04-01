import type { Lesson } from '$types/lesson';

export const positioning: Lesson = {
	id: 'foundations.css-layout.positioning',
	slug: 'positioning',
	title: 'Positioning',
	description: 'Master relative, absolute, fixed, sticky positioning and z-index stacking order.',
	trackId: 'foundations',
	moduleId: 'css-layout',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['css.positioning', 'css.z-index', 'css.sticky'],
	prerequisites: ['foundations.css-layout.css-grid-fundamentals'],

	content: [
		{
			type: 'text',
			content: `# Positioning

CSS positioning takes elements out of normal document flow and places them precisely:

- **\`static\`** — Default, normal flow
- **\`relative\`** — Offset from its normal position
- **\`absolute\`** — Positioned relative to nearest positioned ancestor
- **\`fixed\`** — Positioned relative to the viewport
- **\`sticky\`** — Switches between relative and fixed based on scroll`
		},
		{
			type: 'concept-callout',
			content: 'css.positioning'
		},
		{
			type: 'text',
			content: `## Relative and Absolute

\`relative\` creates a positioning context for \`absolute\` children:

\`\`\`css
.parent { position: relative; }
.badge {
  position: absolute;
  top: 0;
  right: 0;
}
\`\`\`

Look at the starter code. There is a card with a badge that is not positioned.

**Task:** Set the card to \`position: relative\` and the badge to \`position: absolute\` with \`top: -0.5rem\` and \`right: -0.5rem\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Sticky Positioning

\`position: sticky\` keeps an element visible as the user scrolls:

\`\`\`css
.header {
  position: sticky;
  top: 0;
  z-index: 10;
}
\`\`\`

It acts like \`relative\` until the scroll position reaches the threshold, then behaves like \`fixed\`.

**Task:** Make the navigation header sticky at the top of the viewport.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and scroll the page. Observe how the sticky header transitions from relative to fixed positioning at its scroll threshold.'
		},
		{
			type: 'text',
			content: `## Z-Index Stacking

\`z-index\` controls the stacking order of positioned elements. Higher values appear in front.

\`\`\`css
.behind { z-index: 1; }
.in-front { z-index: 10; }
\`\`\`

**Task:** Add \`z-index: 10\` to the sticky header and \`z-index: 20\` to the badge so it appears above everything.`
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
  let title = $state('Positioning Demo');
</script>

<nav class="header">
  <h2>{title}</h2>
</nav>

<div class="content">
  <div class="card">
    <span class="badge">New</span>
    <h3>Featured Card</h3>
    <p>This card has a positioned badge overlay.</p>
  </div>

  {#each Array(10) as _, i}
    <p>Scroll content paragraph {i + 1}. This demonstrates sticky positioning.</p>
  {/each}
</div>

<style>
  .header {
    background: white;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    font-family: system-ui, sans-serif;
  }

  .header h2 {
    margin: 0;
    color: var(--sf-accent, #6366f1);
  }

  .content {
    padding: 1rem;
    font-family: system-ui, sans-serif;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    margin-block-end: 1rem;
  }

  .card h3 {
    margin: 0 0 0.5rem;
  }

  .badge {
    background: var(--sf-accent, #6366f1);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* TODO: Add positioning, sticky, and z-index rules */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('Positioning Demo');
</script>

<nav class="header">
  <h2>{title}</h2>
</nav>

<div class="content">
  <div class="card">
    <span class="badge">New</span>
    <h3>Featured Card</h3>
    <p>This card has a positioned badge overlay.</p>
  </div>

  {#each Array(10) as _, i}
    <p>Scroll content paragraph {i + 1}. This demonstrates sticky positioning.</p>
  {/each}
</div>

<style>
  .header {
    background: white;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    font-family: system-ui, sans-serif;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header h2 {
    margin: 0;
    color: var(--sf-accent, #6366f1);
  }

  .content {
    padding: 1rem;
    font-family: system-ui, sans-serif;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    margin-block-end: 1rem;
    position: relative;
  }

  .card h3 {
    margin: 0 0 0.5rem;
  }

  .badge {
    background: var(--sf-accent, #6366f1);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    position: absolute;
    top: -0.5rem;
    right: -0.5rem;
    z-index: 20;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Position the badge absolutely within the card',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'position: relative' },
						{ type: 'contains', value: 'position: absolute' }
					]
				}
			},
			hints: [
				'The parent needs `position: relative` to be the positioning context.',
				'The badge uses `position: absolute` with `top` and `right` offsets.',
				'Add to `.card`: `position: relative;` and to `.badge`: `position: absolute; top: -0.5rem; right: -0.5rem;`'
			],
			conceptsTested: ['css.positioning']
		},
		{
			id: 'cp-2',
			description: 'Make the header sticky at the top',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'position: sticky' },
						{ type: 'contains', value: 'top: 0' }
					]
				}
			},
			hints: [
				'`position: sticky` requires a `top` value to know when to stick.',
				'Add `position: sticky` and `top: 0` to `.header`.',
				'Update `.header`: `position: sticky; top: 0;`'
			],
			conceptsTested: ['css.sticky']
		},
		{
			id: 'cp-3',
			description: 'Add z-index values for proper stacking',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'z-index:\\s*10' },
						{ type: 'regex', value: 'z-index:\\s*20' }
					]
				}
			},
			hints: [
				'`z-index` controls which positioned elements appear in front.',
				'The header needs `z-index: 10` and the badge needs `z-index: 20`.',
				'Add `z-index: 10` to `.header` and `z-index: 20` to `.badge`.'
			],
			conceptsTested: ['css.z-index']
		}
	]
};
