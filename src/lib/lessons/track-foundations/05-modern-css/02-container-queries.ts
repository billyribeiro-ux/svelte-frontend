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

Container queries let components adapt to their container's size rather than the viewport. This makes components truly reusable — the same component looks great in a sidebar or a main content area without any knowledge of where it is being used.

\`\`\`css
.wrapper {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .content { flex-direction: row; }
}
\`\`\`

## The Containment Model

Container queries are built on CSS containment — a performance feature that tells the browser "this element's layout does not affect its descendants' size, and vice versa." This is why you need \`container-type\` on the parent: it establishes containment.

### What Containment Does

When you set \`container-type: inline-size\`, the browser applies **inline-size containment** to the element. This means:

1. The element's inline size (width in horizontal writing) is determined by its context, not by its content. The content inside cannot "push" the container wider.
2. The browser can safely evaluate \`@container\` queries because the container's size will not change as a result of the query's styles — avoiding circular dependencies.

This has a practical implication: **a container cannot be sized by its content's intrinsic size.** If you put \`container-type: inline-size\` on an element with \`width: auto\` and no other sizing constraints, the element might collapse to zero width because its content can no longer influence its size.

\`\`\`css
/* This works — the grid gives the wrapper a defined width */
.grid > .wrapper {
  container-type: inline-size;
}

/* This might not work — nothing constrains the wrapper's width */
.wrapper {
  container-type: inline-size;
  display: inline-block; /* Inline elements depend on content for width */
}
\`\`\`

### container-type Values

- \`normal\` — Not a query container (default). No containment applied.
- \`inline-size\` — Containment on the inline axis only. This is what you almost always want. It lets you query the container's width while still allowing the height to be determined by content.
- \`size\` — Containment on both axes. The container's height is also fixed and cannot be influenced by content. Use this only when you need to query the container's height (rare).

## Container Queries vs Media Queries

The fundamental difference:

| Aspect | Media Queries | Container Queries |
|--------|--------------|-------------------|
| Reference | Viewport | Nearest container ancestor |
| Scope | Global | Local |
| Component portability | Low — behavior changes with page layout | High — behavior follows the container |
| Use case | Page-level layout shifts | Component-level adaptation |

### When to Use Each

**Media queries** for:
- Showing/hiding the sidebar
- Changing the navigation from horizontal to hamburger
- Adjusting the overall page grid
- Detecting user preferences (dark mode, reduced motion)

**Container queries** for:
- Card components that adapt to their column width
- Widgets that look different in the sidebar vs main content
- Data tables that switch between full and compact views
- Any component that might be placed in containers of varying widths`
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

### Naming Containers

You can name containers to target specific ancestors:

\`\`\`css
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

.main {
  container-type: inline-size;
  container-name: main-content;
}

/* Only responds to the sidebar container */
@container sidebar (min-width: 300px) {
  .widget { columns: 2; }
}
\`\`\`

Without a name, \`@container\` targets the **nearest** container ancestor. Named containers let you bypass closer containers and query a specific one further up the tree.

The shorthand \`container\` property combines name and type:

\`\`\`css
.sidebar {
  container: sidebar / inline-size;
}
\`\`\`

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

### Combining Multiple Conditions

You can use logical operators in container queries:

\`\`\`css
@container (min-width: 400px) and (max-width: 800px) {
  .card { grid-template-columns: 1fr 1fr; }
}

@container not (min-width: 300px) {
  .card { padding: 0.5rem; }
}
\`\`\`

### Container Query Ranges

Modern browsers support the range syntax (same as media queries level 4):

\`\`\`css
@container (200px <= width <= 600px) {
  .card { columns: 2; }
}

@container (width > 800px) {
  .card { columns: 3; }
}
\`\`\`

### Nested Containers

Containers can be nested. Each \`@container\` query matches the nearest container ancestor of the styled element:

\`\`\`css
.outer { container-type: inline-size; }
.inner { container-type: inline-size; }

/* This queries .inner, not .outer */
@container (min-width: 300px) {
  .content { display: flex; }
}
\`\`\`

To target the outer container specifically, name it and reference the name in the query.

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
| \`cqh\` | 1% of container height (requires \`container-type: size\`) |
| \`cqi\` | 1% of container inline size |
| \`cqb\` | 1% of container block size |
| \`cqmin\` | The smaller of \`cqi\` and \`cqb\` |
| \`cqmax\` | The larger of \`cqi\` and \`cqb\` |

### Practical Uses of Container Units

**Fluid typography relative to the container:**

\`\`\`css
.card h3 {
  font-size: clamp(0.875rem, 3cqi, 1.5rem);
}
\`\`\`

This creates text that scales with the container width, bounded by minimum and maximum sizes. Unlike \`vw\` units (which scale with the viewport), \`cqi\` scales with the container — so text in a narrow sidebar stays smaller while text in the main content area grows larger.

**Container-relative spacing:**

\`\`\`css
.card {
  padding: clamp(0.5rem, 2cqi, 2rem);
  gap: clamp(0.25rem, 1cqi, 1rem);
}
\`\`\`

**Container-relative images:**

\`\`\`css
.card img {
  width: min(100%, 50cqi);
  aspect-ratio: 16 / 9;
}
\`\`\`

### Container Units vs Viewport Units

| Feature | Viewport Units (\`vw\`, \`vh\`) | Container Units (\`cqi\`, \`cqb\`) |
|---------|-------------------------------|--------------------------------|
| Reference | Viewport dimensions | Container dimensions |
| Scope | Global — same value everywhere | Local — different per container |
| Use case | Full-page layouts, hero sections | Component-level scaling |
| Requires | Nothing | An ancestor with \`container-type\` |

Container units are strictly better than viewport units for component-level sizing. A heading sized with \`3cqi\` adapts whether the container is 200px or 800px wide. The same heading sized with \`3vw\` only adapts when the viewport changes — it is the same size whether it is in a sidebar or a full-width section.

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
