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

CSS positioning takes elements out of normal document flow and places them precisely. This is essential for overlays, badges, sticky headers, tooltips, and modals.

- **\`static\`** — Default, normal flow. The element participates in the document flow and ignores top/right/bottom/left.
- **\`relative\`** — Offset from its normal position. The element still occupies its original space in the flow.
- **\`absolute\`** — Positioned relative to nearest positioned ancestor. Removed from normal flow entirely.
- **\`fixed\`** — Positioned relative to the viewport. Removed from flow, does not scroll.
- **\`sticky\`** — Switches between relative and fixed based on scroll position.

## WHY: The Containing Block

Every positioned element is positioned relative to its **containing block**. Understanding what creates a containing block is crucial:

- For \`relative\` — The containing block is the element's own normal position
- For \`absolute\` — The containing block is the nearest ancestor with \`position\` set to anything other than \`static\`
- For \`fixed\` — The containing block is the viewport... **usually**

**WHY fixed positioning breaks with transform parents:** This is one of the most confusing CSS behaviors. The spec says: if any ancestor has a \`transform\`, \`filter\`, \`perspective\`, \`will-change: transform\`, or \`backdrop-filter\` property, it becomes the containing block for fixed-position descendants instead of the viewport.

This means a modal with \`position: fixed\` inside a parent with \`transform: translateX(0)\` will NOT be positioned relative to the viewport — it will be positioned relative to that transformed parent. The fix is either to move the fixed element outside the transformed ancestor in the DOM, or to use a Svelte portal pattern to render it elsewhere.

\`\`\`css
/* This breaks fixed positioning for ALL descendants */
.parent {
  transform: translateX(0); /* even a "no-op" transform creates a containing block */
}

.modal {
  position: fixed; /* positioned relative to .parent, NOT the viewport */
  top: 0;
  left: 0;
}
\`\`\`

This gotcha is extremely common with CSS animations and transitions, which often involve transforms.`
		},
		{
			type: 'concept-callout',
			content: 'css.positioning'
		},
		{
			type: 'text',
			content: `## Relative and Absolute

\`relative\` creates a positioning context for \`absolute\` children. This is the most common positioning pattern:

\`\`\`css
.parent { position: relative; }
.badge {
  position: absolute;
  top: 0;
  right: 0;
}
\`\`\`

**The pattern:** Parent gets \`relative\` (which does not visually change it), child gets \`absolute\` to position it precisely within the parent's bounds.

**Why this works:** An absolutely positioned element looks up the DOM tree for the nearest ancestor with \`position\` set. If no ancestor has positioning, it falls back to the viewport (the \`<html>\` element). By setting the parent to \`relative\`, you ensure the absolute child is positioned within the parent's boundary box.

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

\`position: sticky\` keeps an element visible as the user scrolls. It is the modern replacement for JavaScript scroll handlers:

\`\`\`css
.header {
  position: sticky;
  top: 0;
  z-index: 10;
}
\`\`\`

It acts like \`relative\` until the scroll position reaches the threshold (\`top: 0\` means "stick when the element reaches the top of its scrolling container"), then behaves like \`fixed\`.

**Sticky gotchas:**
1. **Must have a threshold.** \`position: sticky\` without \`top\`, \`bottom\`, \`left\`, or \`right\` does nothing.
2. **Overflow on ancestors.** If any ancestor has \`overflow: hidden\`, \`overflow: auto\`, or \`overflow: scroll\`, the sticky element is constrained to that ancestor's scroll container. This is the #1 reason sticky does not work as expected.
3. **Container bounds.** A sticky element never scrolls past its parent container. When the parent scrolls out of view, the sticky element goes with it.

**Task:** Make the navigation header sticky at the top of the viewport.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and scroll the page. Observe how the sticky header transitions from relative to fixed positioning at its scroll threshold. Notice that the header stops scrolling when it reaches the top of the viewport, while the content behind it continues to scroll. If you added a background color, you would see the content scrolling underneath the header.'
		},
		{
			type: 'text',
			content: `## Z-Index and Stacking Contexts

\`z-index\` controls the stacking order of positioned elements. Higher values appear in front. But z-index is more complex than it appears because of **stacking contexts**.

**Stacking context creation rules:** A new stacking context is created by any element with:
- \`position: relative/absolute/fixed/sticky\` AND \`z-index\` set to anything other than \`auto\`
- \`opacity\` less than 1
- \`transform\` set to anything other than \`none\`
- \`filter\` set to anything other than \`none\`
- \`isolation: isolate\`
- \`will-change\` set to certain properties

**WHY this matters:** z-index only competes within the same stacking context. A \`z-index: 9999\` element inside a stacking context with \`z-index: 1\` will never appear above an element in a sibling stacking context with \`z-index: 2\`. This is why your modal with \`z-index: 99999\` sometimes appears behind a sidebar — the sidebar's parent has a higher stacking context.

**Decision framework for z-index:**
- Use a consistent scale: \`z-10\` (sticky headers), \`z-20\` (dropdowns), \`z-30\` (modals), \`z-40\` (tooltips), \`z-50\` (toasts)
- Never use arbitrary high values like \`z-index: 99999\`. If your layout requires this, you have a stacking context problem that needs to be solved structurally.
- Use \`isolation: isolate\` to create a stacking context without side effects — this prevents child z-indexes from leaking out.

**Task:** Add \`z-index: 10\` to the sticky header and \`z-index: 20\` to the badge so it appears above everything.

## Realistic Exercise: Building a Modal Overlay

After completing the checkpoints, think through this common pattern:

A modal needs:
1. A backdrop covering the entire viewport (\`position: fixed; inset: 0; background: rgba(0,0,0,0.5)\`)
2. A centered dialog box (\`position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)\`)
3. Z-index above all other content (\`z-index: 50\`)
4. The modal must be rendered outside any transformed ancestors (use a Svelte action or portal)

This exercise forces you to consider containing blocks, stacking contexts, and the transform-breaks-fixed gotcha simultaneously.`
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
