import type { Lesson } from '$types/lesson';

export const dimensionBindings: Lesson = {
	id: 'svelte-core.events-and-bindings.dimension-bindings',
	slug: 'dimension-bindings',
	title: 'Dimension Bindings',
	description:
		'Reactively read element dimensions with bind:clientWidth, bind:clientHeight, and bind:offsetWidth.',
	trackId: 'svelte-core',
	moduleId: 'events-and-bindings',
	order: 4,
	estimatedMinutes: 10,
	concepts: ['svelte5.bindings.dimensions', 'svelte5.bindings.readonly'],
	prerequisites: ['svelte5.bindings.value', 'svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Dimension Bindings

## WHY Reactive Dimensions Matter

In traditional web development, reading an element's size is an imperative, one-shot operation: call \`element.getBoundingClientRect()\` or read \`element.clientWidth\`. But element sizes change: the user resizes the browser, content is added or removed, CSS transitions change layout, containers grow or shrink. To reactively track size changes, you would need to use \`ResizeObserver\`, an API that is powerful but verbose:

\`\`\`javascript
const observer = new ResizeObserver(entries => {
  for (const entry of entries) {
    width = entry.contentRect.width;
    height = entry.contentRect.height;
  }
});
observer.observe(element);
// Don't forget to disconnect on cleanup!
\`\`\`

Svelte's dimension bindings reduce this to a single attribute:

\`\`\`svelte
<div bind:clientWidth={width} bind:clientHeight={height}>
\`\`\`

Under the hood, Svelte creates a \`ResizeObserver\` (or falls back to other measurement strategies) that watches the element and updates the bound variables whenever the size changes. Cleanup is automatic when the element is removed from the DOM.

### How Svelte Implements Dimension Bindings

Svelte uses a \`ResizeObserver\` to watch each element with a dimension binding. When a resize is detected, it reads the relevant property (\`clientWidth\`, \`clientHeight\`, \`offsetWidth\`, or \`offsetHeight\`) and updates the bound \`$state\` variable. This triggers reactive updates throughout the component.

The measurement happens asynchronously after layout. This is important: the values you receive have already been computed by the browser's layout engine. You are reading, not writing.

### Read-Only Nature

Dimension bindings are strictly **read-only**. You cannot set an element's \`clientWidth\` by assigning to the bound variable -- the CSS box model determines element dimensions, not JavaScript property assignments. Attempting to assign to a dimension-bound variable will update the variable but will not change the element's size. The next resize observation will simply overwrite your assignment with the actual dimension.

This is different from \`bind:value\` on inputs, which is read-write. The distinction is fundamental: form element values are user-input state that flows both ways. Element dimensions are computed output from the CSS layout engine that flows one way: from the DOM to your state.

### Layout Thrashing: The Performance Pitfall

**Layout thrashing** occurs when you repeatedly read layout properties (like dimensions) and write layout-affecting styles in the same synchronous block. Each read forces the browser to recalculate layout to return accurate values. The pattern looks like:

\`\`\`javascript
// BAD: Layout thrashing
element1.style.width = '100px';  // Write (invalidates layout)
const w = element2.clientWidth;   // Read (forces layout recalculation)
element2.style.width = w + 'px';  // Write (invalidates layout again)
const h = element3.clientHeight;  // Read (forces another recalculation)
\`\`\`

Svelte's dimension bindings naturally avoid this pattern because:
1. Reads happen asynchronously in the ResizeObserver callback
2. Writes (via \`$effect\` or derived state) happen in a separate microtask
3. The browser batches layout calculations between frames

However, you can still trigger thrashing if you use dimension values in a \`$effect\` that synchronously sets styles on the same element:

\`\`\`svelte
<!-- CAUTION: Can cause thrashing in extreme cases -->
<div bind:clientWidth={w} style:font-size="{w / 10}px">
\`\`\`

In practice, this is rarely a problem because Svelte batches updates. But in performance-critical scenarios with many measured elements, be aware of the pattern.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.bindings.dimensions'
		},
		{
			type: 'text',
			content: `## Tracking Element Size

\`\`\`svelte
<script lang="ts">
  let width = $state(0);
  let height = $state(0);
</script>

<div bind:clientWidth={width} bind:clientHeight={height}>
  <p>This div is {width}px wide and {height}px tall</p>
</div>
\`\`\`

### Available Dimension Bindings

| Binding | Measures | Includes |
|---|---|---|
| \`clientWidth\` | Inner width | Content + padding (not scrollbar, not border) |
| \`clientHeight\` | Inner height | Content + padding (not scrollbar, not border) |
| \`offsetWidth\` | Outer width | Content + padding + border + scrollbar |
| \`offsetHeight\` | Outer height | Content + padding + border + scrollbar |

Choose \`client*\` when you care about the usable interior space. Choose \`offset*\` when you care about the total visual footprint of the element.

### Block-Level Elements Only

Dimension bindings only work on **block-level** elements (or elements with explicit \`display: block\`, \`flex\`, \`grid\`, etc.). Inline elements like \`<span>\` do not have intrinsic dimensions in the CSS box model, so \`clientWidth\` is always 0. If you need to measure an inline element, wrap it in a \`<div>\` or set \`display: inline-block\`.

### Common Use Cases

1. **Responsive components.** Use container width to switch between compact and expanded layouts, independent of viewport size. This is container queries implemented in JavaScript.

2. **Canvas sizing.** Match a \`<canvas>\` element's resolution to its container by reading the container's dimensions and setting the canvas \`width\`/\`height\` attributes.

3. **Dynamic typography.** Scale font size based on container width for fluid headings.

4. **Overflow detection.** Compare \`scrollHeight\` to \`clientHeight\` to detect whether content overflows.

**Your task:** Create a resizable container that displays its own dimensions in real time. Use the browser's native \`resize: both\` CSS property to make the element user-resizable, then bind dimensions to see them update live.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Responsive Behavior Based on Size

Dimension bindings enable a powerful pattern: **container-responsive components**. Instead of using CSS media queries (which respond to the viewport), you respond to the component's actual container width. This means the same component works correctly whether it is in a full-width layout, a sidebar, or a modal.

### Decision Framework: Container Queries vs. Dimension Bindings

CSS Container Queries (\`@container\`) are the native browser solution for container-responsive design. They are more performant because they run entirely in CSS with no JavaScript. Use them when:
- Your responsive changes are purely CSS (different grid layouts, font sizes, visibility)
- You do not need the dimension values in JavaScript
- Browser support meets your requirements

Use Svelte dimension bindings when:
- You need dimension values in JavaScript (to compute derived state, pass to child components, or make algorithmic decisions)
- You need to conditionally render **different component trees** based on size (not just different CSS)
- You want to combine dimensions with other reactive state

### The Responsive Layout Pattern

\`\`\`svelte
<div bind:clientWidth={containerWidth}>
  {#if containerWidth < 400}
    <CompactLayout />
  {:else}
    <ExpandedLayout />
  {/if}
</div>
\`\`\`

This is fundamentally different from CSS media queries or container queries because it switches between entirely different component trees. CSS can only change the styling of the same DOM structure.

### Avoiding Infinite Loops

Be careful when dimension-bound values affect the element's own size. If reading the width triggers a state change that changes the width, you can create an infinite measurement loop. Svelte detects some of these and warns you, but the safest approach is to ensure that the element's size is determined by its container (via CSS), not by its content (which might change based on the measured size).

**Task:** Use dimension bindings to conditionally render a compact or expanded layout based on the container width. A slider controls the container's CSS width, and the component inside responds to the change.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let width = $state(0);
  let height = $state(0);
  let containerWidth = $state(400);
</script>

<div>
  <h2>Dimension Bindings</h2>

  <!-- TODO: Add a div with bind:clientWidth and bind:clientHeight -->
  <div class="measured">
    <p>Measure me!</p>
  </div>

  <h2>Responsive Container</h2>
  <label>
    Container width: {containerWidth}px
    <input type="range" min="200" max="800" bind:value={containerWidth} />
  </label>

  <!-- TODO: Add a container that changes layout based on width -->
  <div class="container" style:width="{containerWidth}px">
    <p>Resize me with the slider</p>
  </div>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .measured {
    background: #f0f9ff;
    border: 2px dashed #6366f1;
    padding: 2rem;
    resize: both;
    overflow: auto;
    min-width: 200px;
    min-height: 100px;
  }

  .container {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    transition: width 0.2s;
  }

  .compact {
    text-align: center;
  }

  .expanded {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let width = $state(0);
  let height = $state(0);
  let containerWidth = $state(400);
  let innerWidth = $state(0);
</script>

<div>
  <h2>Dimension Bindings</h2>

  <div class="measured" bind:clientWidth={width} bind:clientHeight={height}>
    <p>This element is {Math.round(width)}px wide and {Math.round(height)}px tall.</p>
    <p>Try resizing this box by dragging its corner!</p>
  </div>

  <h2>Responsive Container</h2>
  <label>
    Container width: {containerWidth}px
    <input type="range" min="200" max="800" bind:value={containerWidth} />
  </label>

  <div class="container" style:width="{containerWidth}px" bind:clientWidth={innerWidth}>
    {#if innerWidth < 350}
      <div class="compact">
        <p>Compact Layout</p>
        <p>{Math.round(innerWidth)}px</p>
      </div>
    {:else}
      <div class="expanded">
        <p>Expanded Layout</p>
        <p>Width: {Math.round(innerWidth)}px</p>
        <p>Extra content visible at wider sizes.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .measured {
    background: #f0f9ff;
    border: 2px dashed #6366f1;
    padding: 2rem;
    resize: both;
    overflow: auto;
    min-width: 200px;
    min-height: 100px;
  }

  .container {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    transition: width 0.2s;
  }

  .compact {
    text-align: center;
  }

  .expanded {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Bind clientWidth and clientHeight to read element dimensions',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'bind:clientWidth' },
						{ type: 'contains', value: 'bind:clientHeight' }
					]
				}
			},
			hints: [
				'Add `bind:clientWidth={width}` and `bind:clientHeight={height}` to the measured div.',
				'Display the values: `{Math.round(width)}px wide and {Math.round(height)}px tall`.',
				'Change `<div class="measured">` to `<div class="measured" bind:clientWidth={width} bind:clientHeight={height}>` and show the values.'
			],
			conceptsTested: ['svelte5.bindings.dimensions']
		},
		{
			id: 'cp-2',
			description: 'Use dimension bindings for responsive layout switching',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'bind:clientWidth' },
						{ type: 'regex', value: '#if.*Width.*<' }
					]
				}
			},
			hints: [
				'Bind `clientWidth` on the container div to track its width.',
				'Use `{#if innerWidth < 350}` to switch between compact and expanded layouts.',
				'Add `bind:clientWidth={innerWidth}` to the container and `{#if innerWidth < 350}...{:else}...{/if}` for the layout.'
			],
			conceptsTested: ['svelte5.bindings.dimensions', 'svelte5.bindings.readonly']
		}
	]
};
