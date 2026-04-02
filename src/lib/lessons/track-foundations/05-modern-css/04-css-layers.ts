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

\`@layer\` gives you explicit control over the cascade order. Styles in later layers override earlier ones, **regardless of specificity**. This solves the single biggest pain point in CSS architecture: specificity wars.

\`\`\`css
/* Declare layer order */
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; box-sizing: border-box; }
}

@layer components {
  .card { padding: 1rem; }
}
\`\`\`

## WHY: Layer Priority Ordering

The cascade has always determined which styles win when multiple rules target the same element. Before layers, the priority was:

1. **Origin** (author > user > browser)
2. **Specificity** (ID > class > type)
3. **Source order** (later rules win)

Layers insert a new priority level between origin and specificity:

1. **Origin**
2. **Layer order** (later layers win, unlayered styles win over all layers)
3. **Specificity** (only compared within the same layer)
4. **Source order**

This means a **type selector** in a later layer beats a **class selector** in an earlier layer:

\`\`\`css
@layer base, theme;

@layer base {
  .btn { background: gray; }  /* specificity: 0-1-0 */
}

@layer theme {
  button { background: blue; }  /* specificity: 0-0-1, but WINS because theme > base */
}
\`\`\`

**This is revolutionary.** Specificity conflicts were the #1 source of CSS bugs in large codebases. With layers, you define a clear hierarchy and specificity only matters within each layer.

## WHY: !important Inversion in Layers

The interaction between \`!important\` and layers is deliberately inverted. In normal (non-important) declarations, later layers win. With \`!important\`, **earlier layers win**:

| Declaration Type | Priority Order |
|-----------------|---------------|
| Normal | reset < base < components < utilities < unlayered |
| !important | unlayered < utilities < components < base < reset |

**Why this inversion makes sense:** \`!important\` in a reset layer (like \`* { box-sizing: border-box !important }\`) should be truly unbreakable. If later layers could override it, the reset would be meaningless. The inversion ensures that foundational !important rules remain authoritative.

**Decision framework for !important:** In a layered architecture, you should rarely need \`!important\`. If you find yourself using it, consider whether you should reorder your layers instead. Reserve \`!important\` for the reset layer and utility overrides (like Tailwind's \`!\` modifier).`
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

**Critical rule:** Any styles NOT in a layer have higher priority than ALL layered styles. This is by design — it means you can always override layered styles without worrying about layer order.

\`\`\`css
@layer components {
  .card { background: white; }  /* layered — lower priority */
}

.card { background: red; }  /* unlayered — wins! */
\`\`\`

This behavior is what makes layers backward-compatible. Existing CSS without layers continues to work as before, and layered CSS can be introduced gradually.

Look at the starter code. There are conflicting styles with no clear priority.

**Task:** Add a layer order declaration: \`@layer base, components\` and wrap the existing styles in appropriate layers.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Managing Third-Party CSS with Layers

Layers are ideal for controlling third-party CSS priority. This is arguably their most impactful real-world use case.

**The problem:** You import a CSS framework (Bootstrap, Tailwind, a component library), and its styles conflict with yours. You end up writing increasingly specific selectors or adding \`!important\` to override the framework.

**The solution:** Import third-party CSS into a layer with lower priority than your own:

\`\`\`css
@layer third-party, app, overrides;

/* Import framework into a controlled layer */
@import url('bootstrap.css') layer(third-party);

@layer app {
  /* Your styles always win over third-party — no specificity battles */
  .card { padding: 1.5rem; }
}

@layer overrides {
  /* Emergency overrides for edge cases */
  .special-card { padding: 2rem; }
}
\`\`\`

Now your \`.card\` rule in the \`app\` layer always beats Bootstrap's \`.card\` in the \`third-party\` layer, even if Bootstrap's selector is more specific.

## Real Architecture Example

Here is a layer architecture for a production SvelteKit application:

\`\`\`css
/* app.css — global stylesheet */
@layer reset, tokens, base, vendor, components, utilities, overrides;

@layer reset {
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
  body { line-height: 1.5; -webkit-font-smoothing: antialiased; }
}

@layer tokens {
  :root {
    --color-brand: #6366f1;
    --color-surface: #ffffff;
    --radius-md: 0.5rem;
    --space-4: 1rem;
  }
}

@layer base {
  body { font-family: system-ui, sans-serif; color: #334155; }
  a { color: var(--color-brand); }
  h1, h2, h3 { line-height: 1.2; }
}

@layer vendor {
  /* Third-party imports go here */
}

@layer components {
  .card { padding: var(--space-4); border-radius: var(--radius-md); }
  .btn { padding: 0.5rem 1rem; border-radius: var(--radius-md); }
}

@layer utilities {
  .text-center { text-align: center; }
  .hidden { display: none; }
}
\`\`\`

This architecture ensures: reset styles are foundational, tokens define the design system, base styles set defaults, vendor CSS cannot override your components, components are the main styling layer, and utilities can override components for one-off adjustments.

**Task:** Add a \`@layer overrides\` after the components layer and add an override style for the card background.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how layer order determines which styles win. Notice that specificity is only compared within the same layer. A type selector in the overrides layer beats a class selector in the base layer — this is the fundamental shift that layers bring to CSS architecture.'
		},
		{
			type: 'text',
			content: `## Utilities Layer and One-Off Overrides

A utilities layer at the end of the layer order gives you a clean way to apply one-off overrides without specificity concerns:

\`\`\`css
@layer third-party, app, utilities;

@layer utilities {
  .text-accent {
    color: var(--sf-accent, #6366f1);
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
  }
}
\`\`\`

This is exactly how Tailwind CSS works internally — its utility classes are in a layer that has higher priority than component classes, so utilities always win regardless of specificity.

**Task:** Add a \`@layer utilities\` at the end of the layer order and add a utility class \`.text-accent\` inside it.

## Realistic Exercise: Migrating to Layered CSS

After completing the checkpoints, consider this migration scenario for an existing project:

1. **Audit current specificity conflicts:** Find places where \`!important\` is used or selectors are unnecessarily specific
2. **Define your layer order:** reset, base, vendor, components, utilities
3. **Wrap vendor CSS:** Import third-party stylesheets into the vendor layer
4. **Wrap your base styles:** Typography, colors, and resets go in the base layer
5. **Wrap component styles:** Each component's styles go in the components layer
6. **Test thoroughly:** Layer order changes can flip which styles win — verify every page

The key benefit: after migration, you can delete every \`!important\` in your codebase and replace overly-specific selectors with clean, simple ones. Layer order handles the priority.`
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
