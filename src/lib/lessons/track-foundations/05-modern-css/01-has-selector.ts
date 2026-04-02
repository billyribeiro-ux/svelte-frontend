import type { Lesson } from '$types/lesson';

export const hasSelector: Lesson = {
	id: 'foundations.modern-css.has-selector',
	slug: 'has-selector',
	title: 'The :has() Selector',
	description: 'Use the :has() pseudo-class for parent selection and conditional styling based on child content.',
	trackId: 'foundations',
	moduleId: 'modern-css',
	order: 1,
	estimatedMinutes: 12,
	concepts: ['css.has-selector', 'css.parent-selection', 'css.conditional-styling'],
	prerequisites: [],

	content: [
		{
			type: 'text',
			content: `# The :has() Selector

The \`:has()\` pseudo-class is CSS's long-awaited "parent selector." For over a decade, developers requested the ability to style an element based on its children — and browsers resisted because of performance concerns. As of 2023, \`:has()\` is supported in all major browsers and changes what is possible with pure CSS.

\`\`\`css
/* Style a card differently when it contains an image */
.card:has(img) {
  grid-template-rows: auto 1fr;
}

/* Style a form when an input is invalid */
form:has(:invalid) {
  border-color: red;
}
\`\`\`

## WHY: Browser Support and Performance

**Browser support:** \`:has()\` is supported in Chrome 105+, Safari 15.4+, Firefox 121+, and Edge 105+. As of early 2026, global support exceeds 95%. For the rare case of older browsers, \`:has()\` rules are simply ignored — they degrade gracefully.

**Performance implications:** \`:has()\` was historically avoided because it requires the browser to evaluate selectors "backwards" — from child to parent. Modern browser engines handle this efficiently through:
- **Bloom filters** for fast initial candidate elimination
- **Subject invalidation** — only re-evaluating when relevant children change
- **Lazy evaluation** — skipping :has() checks when the result cannot have changed

**However, some patterns are more expensive than others:**
\`\`\`css
/* Cheap — scoped to a small subtree */
.card:has(> img) { }

/* Moderate — any descendant match */
.card:has(img) { }

/* Expensive — avoid this pattern */
:has(.error) body { }  /* forces evaluation on every DOM change */
\`\`\`

**Decision framework:** Prefer direct child selectors (\`>\`) inside \`:has()\` when possible. Avoid \`:has()\` on elements near the document root, as this forces broader evaluation.

## Specificity of :has()

The specificity of \`:has()\` is determined by its most specific argument:
- \`:has(img)\` — specificity of a type selector (0,0,1)
- \`:has(.active)\` — specificity of a class selector (0,1,0)
- \`:has(#main)\` — specificity of an ID selector (1,0,0)

This is the same specificity rule used by \`:is()\` and \`:not()\`. The \`:has()\` itself contributes no additional specificity — only its argument matters.`
		},
		{
			type: 'concept-callout',
			content: 'css.has-selector'
		},
		{
			type: 'text',
			content: `## Basic :has() Usage

\`:has()\` matches an element if any of its descendants match the selector argument.

Look at the starter code. There are cards — some with images, some without.

**Task:** Use \`.card:has(img)\` to add a \`border-color\` of \`var(--sf-accent, #6366f1)\` to cards that contain images.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Conditional Styling — Real-World Patterns

\`:has()\` enables powerful conditional patterns that previously required JavaScript:

**Form validation styling:**
\`\`\`css
/* Highlight the entire form when any field is invalid */
form:has(:invalid) {
  border-color: #ef4444;
  background: #fef2f2;
}

/* Show the submit button as disabled when form has errors */
form:has(:invalid) button[type="submit"] {
  opacity: 0.5;
  pointer-events: none;
}

/* Style a field group when its input is focused */
.field-group:has(input:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
\`\`\`

**Conditional layout:**
\`\`\`css
/* Change layout when checkbox is checked */
.container:has(input:checked) {
  background: #f0fdf4;
}

/* Empty state — show placeholder when list has no items */
.list:not(:has(li)) {
  display: grid;
  place-items: center;
}
.list:not(:has(li))::after {
  content: 'No items yet';
}

/* Style adjacent sibling — label when its input has focus */
label:has(+ input:focus) {
  color: blue;
  font-weight: 600;
}
\`\`\`

**Task:** Add a rule that changes the \`.controls\` background when the checkbox inside is checked, using \`.controls:has(input:checked)\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and check/uncheck the checkbox. Observe how :has() dynamically re-evaluates and applies styles without any JavaScript. The browser is monitoring the checkbox state and re-running the :has() selector match in real time. This is what makes :has() so powerful — it turns CSS into a reactive styling language.'
		},
		{
			type: 'text',
			content: `## Combining :has() with Other Selectors

\`:has()\` can be combined with other selectors and pseudo-classes for sophisticated patterns:

\`\`\`css
/* Hover effect only on cards with images */
.card:has(img):hover { transform: scale(1.02); }

/* Cards with BOTH an image and a badge */
.card:has(img):has(.badge) { border-width: 3px; }

/* Negation — cards WITHOUT images */
.card:not(:has(img)) { background: #f1f5f9; }

/* Quantity query — list with only one item */
.list:has(> :last-child:nth-child(1)) {
  /* single-item styling */
}

/* Sibling combinator inside :has() */
h2:has(+ p) { margin-bottom: 0.5rem; }  /* h2 followed by a p */
\`\`\`

**Task:** Add a \`.card:has(img):hover\` rule that applies \`transform: scale(1.02)\` and \`transition: transform 0.2s\`.

## Realistic Exercise: Form Validation Without JavaScript

After completing the checkpoints, consider building a contact form with these CSS-only behaviors:

1. When the email input is invalid, its \`.field-group\` container shows a red border
2. When ALL required fields are valid, the submit button changes from gray to blue
3. When a text area has content (use \`:not(:placeholder-shown)\`), its label moves above it
4. When the form has ANY focused input, the form header turns blue

All of these can be implemented with \`:has()\` and zero JavaScript. This is the paradigm shift — CSS can now respond to content state, not just interaction state.`
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
  let showImage = $state(true);
</script>

<div class="controls">
  <label>
    <input type="checkbox" bind:checked={showImage} />
    Show image in first card
  </label>
</div>

<div class="grid">
  <div class="card">
    {#if showImage}
      <img src="https://picsum.photos/300/150" alt="Placeholder" />
    {/if}
    <h3>Card with Image</h3>
    <p>This card conditionally shows an image.</p>
  </div>
  <div class="card">
    <h3>Text Only Card</h3>
    <p>This card has no image.</p>
  </div>
</div>

<style>
  .controls {
    padding: 1rem;
    margin-block-end: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    font-family: system-ui, sans-serif;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 2px solid #e2e8f0;
    font-family: system-ui, sans-serif;
  }

  .card img {
    width: 100%;
    border-radius: 0.25rem;
    margin-block-end: 1rem;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  /* TODO: Add :has() based styles */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let showImage = $state(true);
</script>

<div class="controls">
  <label>
    <input type="checkbox" bind:checked={showImage} />
    Show image in first card
  </label>
</div>

<div class="grid">
  <div class="card">
    {#if showImage}
      <img src="https://picsum.photos/300/150" alt="Placeholder" />
    {/if}
    <h3>Card with Image</h3>
    <p>This card conditionally shows an image.</p>
  </div>
  <div class="card">
    <h3>Text Only Card</h3>
    <p>This card has no image.</p>
  </div>
</div>

<style>
  .controls {
    padding: 1rem;
    margin-block-end: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    font-family: system-ui, sans-serif;
  }

  .controls:has(input:checked) {
    background: #f0fdf4;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 2px solid #e2e8f0;
    font-family: system-ui, sans-serif;
    transition: transform 0.2s;
  }

  .card:has(img) {
    border-color: var(--sf-accent, #6366f1);
  }

  .card:has(img):hover {
    transform: scale(1.02);
  }

  .card img {
    width: 100%;
    border-radius: 0.25rem;
    margin-block-end: 1rem;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Style cards that contain images using :has()',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: ':has(img)' },
						{ type: 'contains', value: 'border-color' }
					]
				}
			},
			hints: [
				'`:has()` lets you style a parent based on its children.',
				'Use `.card:has(img)` to target cards containing an image.',
				'Add: `.card:has(img) { border-color: var(--sf-accent, #6366f1); }`'
			],
			conceptsTested: ['css.has-selector']
		},
		{
			id: 'cp-2',
			description: 'Change controls background when checkbox is checked using :has()',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: ':has(input:checked)' }
					]
				}
			},
			hints: [
				'`:has(input:checked)` matches when a descendant checkbox is checked.',
				'Target `.controls:has(input:checked)` to change the background.',
				'Add: `.controls:has(input:checked) { background: #f0fdf4; }`'
			],
			conceptsTested: ['css.conditional-styling']
		},
		{
			id: 'cp-3',
			description: 'Add hover transform to cards with images',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: ':has(img):hover' },
						{ type: 'contains', value: 'transform' }
					]
				}
			},
			hints: [
				'You can chain `:has()` with other pseudo-classes like `:hover`.',
				'Use `.card:has(img):hover` with `transform: scale(1.02)`.',
				'Add: `.card:has(img):hover { transform: scale(1.02); }` and `transition: transform 0.2s` to `.card`.'
			],
			conceptsTested: ['css.parent-selection']
		}
	]
};
