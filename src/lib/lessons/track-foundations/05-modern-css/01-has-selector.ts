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

The \`:has()\` pseudo-class is CSS's long-awaited "parent selector." It lets you style an element based on its children or descendants — something that was impossible in CSS for over two decades.

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

## Browser Support and the Long Wait

CSS developers requested a parent selector for years. The reason it took so long is performance. CSS is evaluated by the browser from right to left: when the browser encounters \`.card img { ... }\`, it first finds all \`img\` elements, then checks if their ancestor is \`.card\`. This is efficient because the number of matches narrows at each step.

A parent selector reverses this: \`.card:has(img)\` requires the browser to find all \`.card\` elements, then look at their entire subtree to check for \`img\` descendants. If a \`.card\` contains thousands of child elements, this check is expensive. And it must be re-evaluated whenever the DOM changes.

Browser vendors solved this with clever optimizations — bloom filters, incremental invalidation, and subject tracking. As of 2024, \`:has()\` is supported in all major browsers (Chrome 105+, Firefox 121+, Safari 15.4+).

## Performance Considerations

While \`:has()\` is well-optimized in modern browsers, there are patterns to avoid:

\`\`\`css
/* Avoid: forces the browser to check the entire document */
:has(.some-class) { ... }

/* Better: scope to a specific parent */
.container:has(.some-class) { ... }

/* Avoid: deeply nested has() with complex selectors */
.a:has(.b:has(.c:has(.d))) { ... }

/* Better: flatten the logic */
.a:has(.d) { ... }
\`\`\`

The key rule: the more specific the subject (the element before \`:has()\`), the better the performance. \`:has()\` on a universal or element selector forces a much broader check.

## Specificity

\`:has()\` contributes to specificity based on its most specific argument. \`.card:has(#main-image)\` has the specificity of \`.card#main-image\` (0-1-1), not just \`.card\` (0-1-0). This can lead to unexpected specificity conflicts if you are not careful:

\`\`\`css
.card:has(.featured) { background: gold; }      /* Specificity: 0-2-0 */
.card.highlighted { background: lightblue; }     /* Specificity: 0-2-0 */
/* Same specificity — last one wins (source order) */
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'css.has-selector'
		},
		{
			type: 'text',
			content: `## Basic :has() Usage

\`:has()\` matches an element if any of its descendants match the selector argument.

\`\`\`css
/* Cards that contain images get a different border */
.card:has(img) {
  border-color: var(--accent);
}

/* Cards that do NOT contain images */
.card:not(:has(img)) {
  padding: 2rem;
}

/* Sections that contain at least 3 items */
.section:has(:nth-child(3)) {
  column-count: 2;
}
\`\`\`

Look at the starter code. There are cards — some with images, some without.

**Task:** Use \`.card:has(img)\` to add a \`border-color\` of \`var(--sf-accent, #6366f1)\` to cards that contain images.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Conditional Styling

\`:has()\` enables powerful conditional patterns that previously required JavaScript:

\`\`\`css
/* Change layout when checkbox is checked */
.container:has(input:checked) {
  background: #f0fdf4;
}

/* Style label when its input has focus */
label:has(+ input:focus) {
  color: blue;
}
\`\`\`

### The Form Validation Pattern

One of the most compelling uses of \`:has()\` is form validation styling — highlighting the entire form or field group when validation fails:

\`\`\`css
/* Highlight the entire form when any input is invalid */
form:has(:invalid) {
  border-left: 4px solid #dc2626;
  background: #fef2f2;
}

/* Style the field wrapper when its input is invalid */
.field:has(input:invalid) {
  color: #dc2626;
}

/* Show the error message only when the input is invalid */
.field:has(input:invalid) .error-message {
  display: block;
}

/* Style the submit button when the form is valid */
form:has(:invalid) button[type="submit"] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* When all fields are valid */
form:not(:has(:invalid)) button[type="submit"] {
  background: #22c55e;
}
\`\`\`

This replaces JavaScript validation state management for visual feedback. The actual form submission validation should still happen in JavaScript and on the server, but the visual cues are now pure CSS.

### Previous Sibling Selection

\`:has()\` combined with adjacent sibling selectors enables "previous sibling selection" — another long-requested feature:

\`\`\`css
/* Style the label that comes BEFORE a focused input */
label:has(+ input:focus) {
  color: blue;
  transform: translateY(-20px);
  font-size: 0.75rem;
}
\`\`\`

The \`+\` combinator in \`label:has(+ input:focus)\` means "a label that is directly followed by a focused input." This was impossible before \`:has()\`.

**Task:** Add a rule that changes the \`.controls\` background when the checkbox inside is checked, using \`.controls:has(input:checked)\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and check/uncheck the checkbox. Observe how :has() dynamically re-evaluates and applies styles without any JavaScript.'
		},
		{
			type: 'text',
			content: `## Combining :has() with Other Selectors

\`:has()\` can be combined with other selectors and pseudo-classes for sophisticated conditional logic:

\`\`\`css
/* Hover effect only on cards with images */
.card:has(img):hover {
  transform: scale(1.02);
}

/* Dark theme for sections containing video */
section:has(video):not(.light-theme) {
  background: #0f172a;
  color: white;
}

/* Grid layout when a list has more than 2 items */
.list:has(> :nth-child(3)) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* Single-item list styling */
.list:has(> :first-child:last-child) {
  text-align: center;
}
\`\`\`

### Using :has() for Quantity Queries

You can use \`:has()\` with \`:nth-child()\` to style containers based on how many children they have:

\`\`\`css
/* Container with exactly 1 child */
.grid:has(> :first-child:last-child) {
  grid-template-columns: 1fr;
  max-width: 600px;
}

/* Container with 2+ children */
.grid:has(> :nth-child(2)) {
  grid-template-columns: repeat(2, 1fr);
}

/* Container with 4+ children */
.grid:has(> :nth-child(4)) {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
\`\`\`

This lets your layout automatically adapt to the number of items — no JavaScript or CSS classes needed.

**Task:** Add a \`.card:has(img):hover\` rule that applies \`transform: scale(1.02)\` and \`transition: transform 0.2s\`.`
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
