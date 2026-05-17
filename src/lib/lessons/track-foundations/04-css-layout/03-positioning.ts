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

CSS positioning takes elements out of normal document flow and places them precisely. Understanding positioning requires understanding two underlying concepts: the **containing block** and the **stacking context**.

## The Five Position Values

- **\`static\`** — Default. The element participates in normal flow. \`top\`, \`right\`, \`bottom\`, \`left\`, and \`z-index\` have no effect.
- **\`relative\`** — The element remains in normal flow but can be offset from its natural position. The space it originally occupied is preserved — other elements do not move to fill the gap.
- **\`absolute\`** — The element is removed from normal flow and positioned relative to its nearest positioned ancestor (any ancestor with \`position\` other than \`static\`). If no positioned ancestor exists, it is positioned relative to the initial containing block (usually the viewport).
- **\`fixed\`** — The element is removed from normal flow and positioned relative to the viewport. It stays in place when the page scrolls. Exception: if an ancestor has a \`transform\`, \`filter\`, or \`perspective\` property, the element positions relative to that ancestor instead.
- **\`sticky\`** — A hybrid. The element behaves like \`relative\` until the user scrolls past a threshold (defined by \`top\`, \`right\`, \`bottom\`, or \`left\`), at which point it behaves like \`fixed\` within its containing block.

## The Containing Block

Every positioned element has a **containing block** — the reference rectangle used to calculate its position and percentage-based sizes. The containing block depends on the position value:

| Position | Containing Block |
|----------|-----------------|
| \`static\`, \`relative\` | The content box of the nearest block-level ancestor |
| \`absolute\` | The padding box of the nearest positioned ancestor |
| \`fixed\` | The viewport (with exceptions) |
| \`sticky\` | The nearest scrollable ancestor |

Understanding containing blocks explains many positioning mysteries. When \`width: 100%\` on an absolutely positioned element gives an unexpected width, it is because 100% is relative to the containing block, not the parent element.

## Transform Breaking Fixed Positioning

One of the most confusing CSS behaviors: **a \`transform\` on any ancestor creates a new containing block for all \`fixed\` descendants.** This means a \`position: fixed\` element inside a transformed parent will not stay fixed to the viewport — it will be fixed relative to the transformed ancestor instead.

\`\`\`css
.modal-overlay {
  position: fixed;  /* Expected: fixed to viewport */
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.animated-page {
  transform: translateX(0);  /* This breaks the modal! */
}
\`\`\`

If \`.modal-overlay\` is inside \`.animated-page\`, the overlay will not cover the full viewport. It will be constrained to \`.animated-page\`'s bounds.

Properties that trigger this behavior: \`transform\`, \`filter\`, \`perspective\`, \`will-change: transform\`, \`contain: paint\`, and \`backdrop-filter\`. This is one of the reasons modals are often rendered at the root of the document using a portal pattern.`
		},
		{
			type: 'concept-callout',
			content: 'css.positioning'
		},
		{
			type: 'text',
			content: `## Relative and Absolute

\`relative\` creates a positioning context for \`absolute\` children. This is the most common positioning pattern in CSS:

\`\`\`css
.parent { position: relative; }
.badge {
  position: absolute;
  top: 0;
  right: 0;
}
\`\`\`

The parent must be \`position: relative\` (or any non-static position) to serve as the reference point. Without it, the absolutely positioned child will look up the ancestor tree until it finds a positioned element — or fall back to the viewport.

### Common Patterns with Absolute Positioning

**Notification badge on an icon:**
\`\`\`css
.icon-wrapper { position: relative; display: inline-block; }
.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  background: red;
  border-radius: 50%;
}
\`\`\`

**Overlay text on an image:**
\`\`\`css
.card { position: relative; }
.overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, black);
  color: white;
  padding: 1rem;
}
\`\`\`

**Full-size covering element:**
\`\`\`css
.parent { position: relative; }
.cover {
  position: absolute;
  inset: 0; /* shorthand for top: 0; right: 0; bottom: 0; left: 0; */
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

\`position: sticky\` keeps an element visible as the user scrolls. It is the modern replacement for JavaScript-based scroll-tracking headers:

\`\`\`css
.header {
  position: sticky;
  top: 0;
  z-index: 10;
}
\`\`\`

It acts like \`relative\` until the scroll position reaches the threshold, then behaves like \`fixed\` — but only within its containing block (the nearest scrollable ancestor or the nearest ancestor with \`overflow\` set).

### Sticky Gotchas

1. **\`overflow: hidden\` on a parent kills sticky.** If any ancestor between the sticky element and the scroll container has \`overflow: hidden\`, \`overflow: auto\`, or \`overflow: scroll\`, the sticky behavior is constrained to that ancestor. This is the number one reason "sticky is not working."

2. **The element must have a threshold.** Without \`top\`, \`bottom\`, \`left\`, or \`right\`, sticky behaves exactly like relative. You must specify where it should stick.

3. **Height matters.** A sticky element stops sticking when its containing block scrolls past. If the containing block is the same height as the sticky element, there is no room for the element to "travel" and sticky has no visible effect.

### Sticky Section Headers

One of the best uses of sticky is section headers in a scrollable list:

\`\`\`css
.section-header {
  position: sticky;
  top: 0;
  background: white;
  z-index: 5;
  border-bottom: 1px solid #e2e8f0;
}
\`\`\`

As you scroll through a long list, the current section header stays pinned at the top until the next section header pushes it away. No JavaScript needed.

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
			content: `## Stacking Context and Z-Index

\`z-index\` controls the stacking order of positioned elements. Higher values appear in front. But \`z-index\` does not work in isolation — it operates within **stacking contexts**.

### What Creates a Stacking Context

A stacking context is created by any element with:
- \`position: relative/absolute/fixed/sticky\` **and** a \`z-index\` value other than \`auto\`
- \`opacity\` less than 1
- \`transform\`, \`filter\`, \`perspective\`, or \`backdrop-filter\`
- \`isolation: isolate\`
- \`contain: paint\` or \`contain: layout\`

### Why Stacking Contexts Matter

Z-index values are only compared **within the same stacking context.** An element with \`z-index: 9999\` inside a stacking context with \`z-index: 1\` will appear behind an element with \`z-index: 2\` in the parent stacking context.

\`\`\`css
/* Parent A has z-index: 1 */
.parent-a { position: relative; z-index: 1; }
.child-a  { position: relative; z-index: 9999; } /* Still behind parent B! */

/* Parent B has z-index: 2 */
.parent-b { position: relative; z-index: 2; }
\`\`\`

This is why "my z-index is not working" is one of the most common CSS complaints. The fix is usually to find and remove the intermediate stacking context, or to restructure the DOM so competing elements share the same stacking context.

### Z-Index Scale Strategy

In a production codebase, ad-hoc z-index values lead to an arms race: someone sets \`z-index: 100\`, then someone else needs \`z-index: 999\`, then \`z-index: 99999\`. Define a scale instead:

\`\`\`css
:root {
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;
}
\`\`\`

### The isolation Property

\`isolation: isolate\` creates a new stacking context without any side effects. Use it to prevent z-index leaking:

\`\`\`css
.card {
  isolation: isolate; /* Contains z-index within this element */
}
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
