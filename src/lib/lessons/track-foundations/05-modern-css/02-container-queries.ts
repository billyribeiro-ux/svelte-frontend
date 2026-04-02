import type { Lesson } from '$types/lesson';

export const containerQueries: Lesson = {
	id: 'foundations.modern-css.container-queries',
	slug: 'container-queries',
	title: 'Container Queries',
	description: 'Use @container rules, container-type, and container units to build truly component-responsive layouts.',
	trackId: 'foundations',
	moduleId: 'modern-css',
	order: 2,
	estimatedMinutes: 12,
	concepts: ['css.container-queries', 'css.container-type', 'css.container-units'],
	prerequisites: ['foundations.modern-css.has-selector'],

	content: [
		{
			type: 'text',
			content: `# Container Queries

Container queries let components adapt to their container's size rather than the viewport. This makes components truly reusable — the same component looks great in a sidebar or a main content area.

\`\`\`css
.wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .content { flex-direction: row; }
}
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'css.container-queries'
		},
		{
			type: 'text',
			content: `## Setting Up a Container

To use container queries, you need:
1. A **container** element with \`container-type\`
2. A **\`@container\`** rule with a size condition

\`container-type\` values:
- \`inline-size\` — Query the inline (width) dimension
- \`size\` — Query both dimensions
- \`normal\` — Not a query container (default)

Look at the starter code. The card is in a resizable wrapper.

**Task:** Add \`container-type: inline-size\` to the \`.card-wrapper\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Writing Container Queries

\`@container\` rules work like media queries but respond to the container:

\`\`\`css
@container (min-width: 300px) {
  .card { padding: 2rem; }
}

@container (max-width: 200px) {
  .card { font-size: 0.875rem; }
}
\`\`\`

**Task:** Add a \`@container (min-width: 400px)\` rule that changes the card layout to \`display: flex\` with \`gap: 1rem\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and resize the container width using the range slider. Watch how the card layout changes based on its container, not the viewport.'
		},
		{
			type: 'text',
			content: `## Container Query Units

Container query units are relative to the container's dimensions:

| Unit | Description |
|------|-------------|
| \`cqw\` | 1% of container width |
| \`cqh\` | 1% of container height |
| \`cqi\` | 1% of container inline size |
| \`cqb\` | 1% of container block size |

**Task:** Use \`font-size: clamp(0.875rem, 3cqi, 1.25rem)\` on the card heading for container-relative fluid typography.`
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
  let width = $state(500);
</script>

<div class="controls">
  <label>
    Container width: {width}px
    <input type="range" min="200" max="800" bind:value={width} />
  </label>
</div>

<div class="card-wrapper" style="width: {width}px;">
  <div class="card">
    <div class="card-image">
      <div class="placeholder">IMG</div>
    </div>
    <div class="card-body">
      <h3>Adaptive Card</h3>
      <p>This card adapts to its container size, not the viewport.</p>
    </div>
  </div>
</div>

<style>
  .controls {
    padding: 1rem;
    margin-block-end: 1rem;
    font-family: system-ui, sans-serif;
  }

  .controls input[type="range"] {
    width: 100%;
  }

  .card-wrapper {
    border: 2px dashed #e2e8f0;
    padding: 1rem;
    border-radius: 0.5rem;
    transition: width 0.2s;
  }

  .card {
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    font-family: system-ui, sans-serif;
  }

  .placeholder {
    background: var(--sf-accent, #6366f1);
    color: white;
    padding: 2rem;
    text-align: center;
    font-weight: 600;
  }

  .card-body {
    padding: 1rem;
  }

  .card-body h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  /* TODO: Add container-type, @container query, and container units */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let width = $state(500);
</script>

<div class="controls">
  <label>
    Container width: {width}px
    <input type="range" min="200" max="800" bind:value={width} />
  </label>
</div>

<div class="card-wrapper" style="width: {width}px;">
  <div class="card">
    <div class="card-image">
      <div class="placeholder">IMG</div>
    </div>
    <div class="card-body">
      <h3>Adaptive Card</h3>
      <p>This card adapts to its container size, not the viewport.</p>
    </div>
  </div>
</div>

<style>
  .controls {
    padding: 1rem;
    margin-block-end: 1rem;
    font-family: system-ui, sans-serif;
  }

  .controls input[type="range"] {
    width: 100%;
  }

  .card-wrapper {
    container-type: inline-size;
    border: 2px dashed #e2e8f0;
    padding: 1rem;
    border-radius: 0.5rem;
    transition: width 0.2s;
  }

  .card {
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    font-family: system-ui, sans-serif;
  }

  .placeholder {
    background: var(--sf-accent, #6366f1);
    color: white;
    padding: 2rem;
    text-align: center;
    font-weight: 600;
  }

  .card-body {
    padding: 1rem;
  }

  .card-body h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
    font-size: clamp(0.875rem, 3cqi, 1.25rem);
  }

  @container (min-width: 400px) {
    .card {
      display: flex;
      gap: 1rem;
    }
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Set container-type on the wrapper',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'container-type: inline-size' }
					]
				}
			},
			hints: [
				'The container element needs `container-type` to be queryable.',
				'Add `container-type: inline-size` to `.card-wrapper`.',
				'Update `.card-wrapper` to include: `container-type: inline-size;`'
			],
			conceptsTested: ['css.container-type']
		},
		{
			id: 'cp-2',
			description: 'Add a @container query that changes the card to flex layout',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@container' },
						{ type: 'contains', value: 'display: flex' }
					]
				}
			},
			hints: [
				'`@container` rules look like media queries but respond to the container.',
				'Use `@container (min-width: 400px)` to add flex layout.',
				'Add: `@container (min-width: 400px) { .card { display: flex; gap: 1rem; } }`'
			],
			conceptsTested: ['css.container-queries']
		},
		{
			id: 'cp-3',
			description: 'Use container query units for fluid typography',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'cqi' }
					]
				}
			},
			hints: [
				'Container query units like `cqi` are relative to the container inline size.',
				'Use `clamp()` with `cqi` for fluid sizing: `clamp(0.875rem, 3cqi, 1.25rem)`.',
				'Add to `.card-body h3`: `font-size: clamp(0.875rem, 3cqi, 1.25rem);`'
			],
			conceptsTested: ['css.container-units']
		}
	]
};
