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

Svelte can reactively track the dimensions of any block-level element. When the element resizes, your state updates automatically.

These bindings are **read-only** — they reflect the element's current size but cannot be used to set it.`
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

Available dimension bindings:
- \`clientWidth\` / \`clientHeight\` — inner dimensions (excluding scrollbars)
- \`offsetWidth\` / \`offsetHeight\` — outer dimensions (including borders/scrollbars)

**Your task:** Create a resizable container that displays its own dimensions in real time.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Responsive Behavior Based on Size

Dimension bindings are great for creating responsive components that adapt based on their container size rather than the viewport.

**Task:** Use dimension bindings to conditionally render a compact or expanded layout based on the container width.`
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
