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

The \`:has()\` pseudo-class is CSS's long-awaited "parent selector." It lets you style an element based on its children or descendants.

\`\`\`css
/* Style a card differently when it contains an image */
.card:has(img) {
  grid-template-rows: auto 1fr;
}

/* Style a form when an input is invalid */
form:has(:invalid) {
  border-color: red;
}
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

\`:has()\` enables powerful conditional patterns:

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

\`:has()\` can be combined with other selectors and pseudo-classes:

\`\`\`css
.card:has(img):hover { transform: scale(1.02); }
.list:has(> :last-child:nth-child(1)) { /* single item list */ }
\`\`\`

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
