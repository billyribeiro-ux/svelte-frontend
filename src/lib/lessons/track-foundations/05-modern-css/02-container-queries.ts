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

Container queries let components adapt to their container's size rather than the viewport. This makes components truly reusable — the same component looks great in a sidebar, a main content area, or a modal without any CSS changes.

\`\`\`css
.wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .content { flex-direction: row; }
}
\`\`\`

## WHY: The Containment Model Explained

Container queries work because of **CSS containment** — a mechanism that tells the browser "this element's layout does not depend on its children's sizes." This creates a performance optimization: the browser can determine the container's size first, then lay out children based on that known size.

**container-type establishes containment:**

- \`container-type: inline-size\` — The container's inline size (width in horizontal writing modes) is determined independently of its content. Content can then query this size. The block size (height) remains content-dependent.

- \`container-type: size\` — Both inline and block sizes are determined independently. This means the container CANNOT grow to fit its content vertically. **Use with caution** — if you do not explicitly set a height, the container collapses.

- \`container-type: normal\` — Default. No containment, no querying.

**Why \`inline-size\` is almost always correct:** Web layouts are overwhelmingly width-constrained. Content flows vertically and the page scrolls. We need to know the width to make layout decisions, but we want height to remain content-driven. \`inline-size\` gives us exactly this: width is queryable, height adapts to content.

**When to use \`size\`:** Only when you have a container with a fixed or explicitly set height — like a modal, a dashboard panel with a known height, or a grid cell with a fixed row height.

## Comparison with Media Queries

| Feature | Media Queries | Container Queries |
|---------|--------------|-------------------|
| Responds to | Viewport size | Container size |
| Component reuse | Breaks when context changes | Works in any context |
| Nesting | Cannot nest meaningfully | Containers can be nested |
| Units | \`vw\`, \`vh\` | \`cqi\`, \`cqb\`, \`cqw\`, \`cqh\` |
| Use case | Page layout | Component layout |

**Decision framework:** If the layout decision depends on "how wide is the page?" use a media query. If it depends on "how wide is the space I have been given?" use a container query.`
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

**container-name for targeted queries:**

By default, \`@container\` queries match the nearest ancestor container. You can name containers for precision:

\`\`\`css
.sidebar { container-type: inline-size; container-name: sidebar; }
.main    { container-type: inline-size; container-name: main-content; }

/* Only matches the sidebar container */
@container sidebar (max-width: 300px) {
  .nav-item { font-size: 0.875rem; }
}

/* Shorthand for type and name */
.panel {
  container: panel / inline-size;  /* name / type */
}
\`\`\`

Named containers prevent ambiguity when containers are nested. Without names, a \`@container\` query matches the nearest ancestor with \`container-type\` set, which might not be the one you intended.

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

**Multiple breakpoints:** Just like media queries, you can define multiple container query breakpoints:

\`\`\`css
/* Small container — compact layout */
@container (max-width: 300px) {
  .card { padding: 0.75rem; }
  .card-image { display: none; }
}

/* Medium container — standard layout */
@container (min-width: 300px) and (max-width: 500px) {
  .card { padding: 1rem; }
}

/* Large container — expanded layout */
@container (min-width: 500px) {
  .card { display: flex; gap: 1.5rem; padding: 1.5rem; }
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
			content: 'Toggle X-Ray mode and resize the container width using the range slider. Watch how the card layout changes based on its container, not the viewport. Try imagining this same card placed in three different contexts: a narrow sidebar (300px), a standard column (500px), and a full-width hero (800px). The container query handles all three without any context-specific CSS.'
		},
		{
			type: 'text',
			content: `## Container Query Units

Container query units are relative to the container's dimensions, giving you fluid sizing that adapts to the component's context:

| Unit | Description |
|------|-------------|
| \`cqw\` | 1% of container width |
| \`cqh\` | 1% of container height (requires \`container-type: size\`) |
| \`cqi\` | 1% of container inline size (most useful) |
| \`cqb\` | 1% of container block size |
| \`cqmin\` | Smaller of \`cqi\` and \`cqb\` |
| \`cqmax\` | Larger of \`cqi\` and \`cqb\` |

**Why \`cqi\` is preferred over \`cqw\`:** Just like logical properties (\`inline-size\` vs \`width\`), \`cqi\` adapts to writing modes. In horizontal text, \`cqi\` equals \`cqw\`. In vertical writing modes, \`cqi\` would be the container's height. For the same reason you use logical properties, use logical container units.

**Practical use case — fluid typography within a component:**
\`\`\`css
.card h3 {
  font-size: clamp(0.875rem, 3cqi, 1.5rem);
}
.card p {
  font-size: clamp(0.75rem, 2cqi, 1rem);
}
\`\`\`

This makes the card's text scale with the card's container — not the viewport. A card in a sidebar gets smaller text, a card in the main content area gets larger text, automatically.

**Task:** Use \`font-size: clamp(0.875rem, 3cqi, 1.25rem)\` on the card heading for container-relative fluid typography.

## Realistic Exercise: Responsive Card Component

After completing the checkpoints, design a card component that adapts to three contexts:

1. **Narrow (< 250px):** Compact layout — image hidden, small text, minimal padding
2. **Medium (250-450px):** Standard layout — image on top, content below
3. **Wide (> 450px):** Horizontal layout — image on left, content on right

Write this using container queries and container units. The card should work identically whether placed in a 250px sidebar, a 450px column, or an 800px hero section — no parent context awareness needed.`
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
