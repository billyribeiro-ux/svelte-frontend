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

\`@layer\` gives you explicit control over the cascade order. Styles in later layers override earlier ones, **regardless of specificity**.

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

## Why Layers Exist — The Cascade Problem

Before layers, CSS had a fixed cascade order:

1. User agent styles (browser defaults)
2. Author styles (your CSS)
3. Author styles with \`!important\`
4. User styles with \`!important\`
5. User agent styles with \`!important\`

Within "author styles," the only tools for controlling priority were:

- **Source order** — Later declarations win over earlier ones
- **Specificity** — More specific selectors win over less specific ones
- **\`!important\`** — The nuclear option that overrides everything

This system works for small projects but breaks down at scale. Consider these real-world scenarios:

**Third-party CSS conflicts.** You import a UI library that styles \`button { background: blue; }\`. Your own \`button { background: green; }\` needs to win. If the library loads after your styles, it wins by source order. If you increase specificity to win, you create a specificity arms race.

**Utility class overrides.** Tailwind's utility classes like \`.text-red-500\` need to override component styles. But component styles might have higher specificity (\`.card .title\` vs \`.text-red-500\`). Tailwind solves this by adding \`!important\` to utilities, but that makes them impossible to override when needed.

**Reset vs base vs component styles.** You want your reset (\`* { margin: 0; }\`) to be easily overridable. But because it uses a universal selector with low specificity, it already is — until someone adds a reset rule with higher specificity and it starts interfering with components.

Layers solve all of these by introducing a new dimension to the cascade: **layer order.** A rule in a later layer beats a rule in an earlier layer, regardless of specificity.`
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

This single line establishes that \`overrides\` always beats \`components\`, which always beats \`base\`. No matter how specific a selector in \`base\` is, a less specific selector in \`overrides\` will win.

### Unlayered Styles Have the Highest Priority

Any styles **not** in a layer have higher priority than all layered styles. This is intentional — it means you can always override library styles by writing unlayered CSS:

\`\`\`css
@layer library, app;

@layer library {
  .btn { background: blue; }
}

@layer app {
  .btn { background: green; }  /* Beats library */
}

/* Unlayered — beats everything */
.btn.special { background: purple; }
\`\`\`

### Layer Declaration Methods

There are several ways to create and populate layers:

\`\`\`css
/* 1. Declare order, then fill later */
@layer base, components, utilities;

@layer base { body { font-family: sans-serif; } }
@layer components { .card { padding: 1rem; } }

/* 2. Declare and fill simultaneously */
@layer base {
  body { font-family: sans-serif; }
}

/* 3. Import into a layer */
@import url('normalize.css') layer(reset);

/* 4. Anonymous layers (cannot be referenced later) */
@layer {
  .legacy { color: gray; }
}
\`\`\`

Look at the starter code. There are conflicting styles with no clear priority.

**Task:** Add a layer order declaration: \`@layer base, components\` and wrap the existing styles in appropriate layers.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Layer Priority and the !important Inversion

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

The \`button\` selector in the \`theme\` layer has lower specificity (0-0-1) than \`.btn\` in \`base\` (0-1-0). But \`theme\` is declared after \`base\` in the layer order, so it wins. This is the fundamental value of layers — specificity conflicts become irrelevant across layers.

### The !important Inversion

One of the most surprising aspects of layers: **\`!important\` inverts the layer order.** Normal styles in later layers win. But \`!important\` styles in **earlier** layers win:

\`\`\`css
@layer base, theme, overrides;

@layer base {
  .btn { background: gray !important; }  /* WINS with !important */
}

@layer theme {
  .btn { background: blue !important; }  /* Loses to base !important */
}

@layer overrides {
  .btn { background: green; }  /* Wins for normal styles */
}
\`\`\`

Why? Because \`!important\` was designed to be a defense mechanism — "this style must not be overridden." If later layers could override \`!important\` from earlier layers, the defense would be useless. The inversion ensures that \`!important\` in foundational layers (like a reset or accessibility layer) truly cannot be overridden by later layers.

This matches the intent: your reset's \`* { box-sizing: border-box !important; }\` should not be overridable by a component layer. The inversion makes this work correctly.

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
			content: `## Managing Third-Party CSS with Layers

Layers are ideal for controlling third-party CSS priority:

\`\`\`css
@layer third-party, app;

@import url('library.css') layer(third-party);

@layer app {
  /* Your styles always win over third-party */
}
\`\`\`

### Real-World Third-Party CSS Strategy

\`\`\`css
/* Establish the full layer order upfront */
@layer reset, third-party, base, components, utilities;

/* Import third-party CSS into its layer */
@import url('normalize.css') layer(reset);
@import url('some-ui-lib.css') layer(third-party);

/* Your reset */
@layer reset {
  *, *::before, *::after {
    box-sizing: border-box;
  }
}

/* Base styles */
@layer base {
  body {
    font-family: system-ui, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
  }
}

/* Component styles */
@layer components {
  .card { padding: 1.5rem; background: white; border-radius: 8px; }
  .btn { padding: 0.5rem 1rem; border-radius: 4px; }
}

/* Utility overrides — always win over components */
@layer utilities {
  .text-accent { color: var(--accent) !important; }
  .hidden { display: none !important; }
}
\`\`\`

### Nested Layers

Layers can be nested for fine-grained control:

\`\`\`css
@layer framework {
  @layer base, components, utilities;

  @layer base {
    body { font-family: sans-serif; }
  }

  @layer components {
    .card { padding: 1rem; }
  }
}

@layer app {
  /* Everything here beats everything in @layer framework */
  .card { padding: 2rem; }
}
\`\`\`

Nested layers are referenced with dot notation: \`framework.base\`, \`framework.components\`. The entire \`framework\` layer is treated as a single unit in the top-level layer order.

### Layers and Tailwind CSS

Tailwind CSS v4 uses \`@layer\` internally:

\`\`\`css
@layer theme, base, components, utilities;
\`\`\`

This ensures that utilities always override components, and components always override base styles — matching Tailwind's expected cascade behavior without relying on specificity hacks or \`!important\`.

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
