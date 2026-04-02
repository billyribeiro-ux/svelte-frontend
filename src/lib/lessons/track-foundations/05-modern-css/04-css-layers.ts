import type { Lesson } from '$types/lesson';

export const cssLayers: Lesson = {
	id: 'foundations.modern-css.css-layers',
	slug: 'css-layers',
	title: 'CSS Layers',
	description: 'Control the cascade with @layer for predictable style ordering and third-party CSS management.',
	trackId: 'foundations',
	moduleId: 'modern-css',
	order: 4,
	estimatedMinutes: 10,
	concepts: ['css.layers', 'css.cascade-layers', 'css.layer-order'],
	prerequisites: ['foundations.modern-css.native-nesting'],

	content: [
		{
			type: 'text',
			content: `# CSS Layers

\`@layer\` gives you explicit control over the cascade order. Styles in later layers override earlier ones, regardless of specificity.

\`\`\`css
/* Declare layer order */
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; box-sizing: border-box; }
}

@layer components {
  .card { padding: 1rem; }
}
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'css.layers'
		},
		{
			type: 'text',
			content: `## Declaring Layer Order

The layer declaration order determines priority — later layers win:

\`\`\`css
@layer base, components, overrides;
\`\`\`

Any styles not in a layer have higher priority than layered styles.

Look at the starter code. There are conflicting styles with no clear priority.

**Task:** Add a layer order declaration: \`@layer base, components\` and wrap the existing styles in appropriate layers.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Layer Priority

Layers override based on declaration order, not specificity:

\`\`\`css
@layer base, theme;

@layer base {
  .btn { background: gray; }  /* specificity: 0-1-0 */
}

@layer theme {
  button { background: blue; }  /* specificity: 0-0-1, but wins! */
}
\`\`\`

**Task:** Add a \`@layer overrides\` after the components layer and add an override style for the card background.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how layer order determines which styles win. Notice that specificity is only compared within the same layer.'
		},
		{
			type: 'text',
			content: `## Managing Third-Party CSS

Layers are ideal for controlling third-party CSS priority:

\`\`\`css
@layer third-party, app;

@import url('library.css') layer(third-party);

@layer app {
  /* Your styles always win over third-party */
}
\`\`\`

**Task:** Add a \`@layer utilities\` at the end of the layer order and add a utility class \`.text-accent\` inside it.`
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
  let title = $state('CSS Layers');
</script>

<div class="card">
  <h3>{title}</h3>
  <p class="text-accent">Layers give you explicit cascade control.</p>
  <button>Action</button>
</div>

<style>
  /* TODO: Add @layer declarations and wrap styles */

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    font-family: system-ui, sans-serif;
  }

  h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  p {
    line-height: 1.6;
    color: #334155;
  }

  button {
    background: var(--sf-accent, #6366f1);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-family: system-ui, sans-serif;
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
  let title = $state('CSS Layers');
</script>

<div class="card">
  <h3>{title}</h3>
  <p class="text-accent">Layers give you explicit cascade control.</p>
  <button>Action</button>
</div>

<style>
  @layer base, components, overrides, utilities;

  @layer base {
    h3 {
      margin: 0 0 0.5rem;
      color: var(--sf-accent, #6366f1);
    }

    p {
      line-height: 1.6;
      color: #334155;
    }

    button {
      background: var(--sf-accent, #6366f1);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-family: system-ui, sans-serif;
    }
  }

  @layer components {
    .card {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      font-family: system-ui, sans-serif;
    }
  }

  @layer overrides {
    .card {
      background: #f0f9ff;
    }
  }

  @layer utilities {
    .text-accent {
      color: var(--sf-accent, #6366f1);
    }
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Declare layer order and wrap styles in @layer blocks',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@layer base' },
						{ type: 'contains', value: '@layer components' }
					]
				}
			},
			hints: [
				'Declare the order first: `@layer base, components;`',
				'Wrap element styles in `@layer base { }` and component styles in `@layer components { }`.',
				'Add `@layer base, components;` at the top, then wrap styles: `@layer base { h3 { ... } }` and `@layer components { .card { ... } }`'
			],
			conceptsTested: ['css.layers']
		},
		{
			id: 'cp-2',
			description: 'Add an overrides layer with a card background override',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@layer overrides' }
					]
				}
			},
			hints: [
				'Add `overrides` to the layer declaration: `@layer base, components, overrides;`',
				'Create `@layer overrides { .card { background: #f0f9ff; } }`.',
				'Update declaration to `@layer base, components, overrides;` and add `@layer overrides { .card { background: #f0f9ff; } }`'
			],
			conceptsTested: ['css.cascade-layers']
		},
		{
			id: 'cp-3',
			description: 'Add a utilities layer with a text-accent class',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@layer utilities' },
						{ type: 'contains', value: '.text-accent' }
					]
				}
			},
			hints: [
				'Add `utilities` to the layer order declaration.',
				'Create a `.text-accent` class inside the utilities layer.',
				'Add `utilities` to declaration and `@layer utilities { .text-accent { color: var(--sf-accent, #6366f1); } }`'
			],
			conceptsTested: ['css.layer-order']
		}
	]
};
