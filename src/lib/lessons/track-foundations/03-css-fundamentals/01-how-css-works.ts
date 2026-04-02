import type { Lesson } from '$types/lesson';

export const howCssWorks: Lesson = {
	id: 'foundations.css-fundamentals.how-css-works',
	slug: 'how-css-works',
	title: 'How CSS Works',
	description: 'Understand the cascade, specificity, and inheritance — the three pillars that determine which styles get applied.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 1,
	estimatedMinutes: 18,
	concepts: ['css.cascade', 'css.specificity', 'css.inheritance'],
	prerequisites: [],

	content: [
		{
			type: 'text',
			content: `# How CSS Works

CSS stands for **Cascading Style Sheets**. That first word — "cascading" — is not decoration. It names the algorithm the browser uses to resolve conflicts when multiple declarations compete for the same property on the same element. Understanding the cascade, specificity, and inheritance is not optional knowledge. It is the foundation that makes every other CSS concept predictable.

## The Cascade Algorithm

When the browser encounters competing declarations, it resolves them through a strict priority order. The CSS Cascade Level 5 specification defines these origins, evaluated from highest to lowest priority:

1. **Transition declarations** — Active CSS transitions always win
2. **!important user-agent** — Browser defaults marked important
3. **!important user** — User stylesheets marked important
4. **!important author** — Your stylesheets marked important
5. **Normal author** — Your regular stylesheets (this is where you live 99% of the time)
6. **Normal user** — User preference stylesheets
7. **Normal user-agent** — Browser default styles

Within the same origin and importance level, the cascade resolves by **specificity**. At equal specificity, **source order** wins — the declaration that appears later in the stylesheet takes effect.

### The !important Escape Hatch

\`!important\` does not increase specificity. It moves the declaration to a different origin tier entirely. This is why \`!important\` on an author style beats any non-important author style, regardless of specificity. But it also means that \`!important\` declarations resolve *in reverse order* — a user-agent \`!important\` beats an author \`!important\`. This inversion exists to protect accessibility: a user who sets \`font-size: 24px !important\` should not be overridden by a site's stylesheet.

The practical takeaway: avoid \`!important\` in application code. If you need it, you are almost certainly fighting a specificity problem that has a structural solution.`
		},
		{
			type: 'concept-callout',
			content: 'css.cascade'
		},
		{
			type: 'text',
			content: `## The Cascade in Action

When two rules target the same element with equal specificity, the one that appears later wins. This is source-order resolution — the final tiebreaker in the cascade.

Look at the starter code. There are two conflicting \`color\` rules on the paragraph. Both use the same selector (\`p\`), so they have identical specificity. The second rule wins because it comes later.

**Task:** Add a third rule that sets the paragraph color to \`green\` by leveraging cascade order. Place it after the existing rules.

Think about what this means: rearranging your stylesheet is not cosmetic. Moving a rule from line 10 to line 50 can change which styles apply. This is why CSS architecture patterns like BEM and utility-first frameworks exist — they reduce the chance that source order matters.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Specificity — The 4-Digit Formula

Specificity is a weight assigned to every CSS selector, represented as a 4-part tuple: **A-B-C-D**.

| Component | What counts | Example |
|-----------|-------------|---------|
| **A** | Inline \`style\` attribute | \`style="color: red"\` = 1-0-0-0 |
| **B** | ID selectors | \`#main\` = 0-1-0-0 |
| **C** | Class selectors, attribute selectors, pseudo-classes | \`.card\`, \`[href]\`, \`:hover\` = 0-0-1-0 |
| **D** | Type selectors, pseudo-elements | \`div\`, \`::before\` = 0-0-0-1 |

Specificity is compared component by component, left to right. A single ID selector (0-1-0-0) beats any number of classes — 0-1-0-0 > 0-0-99-0. This is why stacking classes never overcomes an ID.

\`\`\`css
p { color: blue; }                    /* 0-0-0-1 */
.intro { color: green; }             /* 0-0-1-0 — wins over p */
#main { color: red; }                /* 0-1-0-0 — wins over .intro */
p.intro.highlight { color: teal; }   /* 0-0-2-1 — still loses to #main */
\`\`\`

### Selectors With Zero Specificity

The universal selector (\`*\`), combinators (\`>\`, \`+\`, \`~\`), and the \`:where()\` pseudo-class contribute **zero** specificity. The \`:is()\` and \`:not()\` pseudo-classes take the specificity of their most specific argument. This distinction matters for building low-specificity utility layers.

**Task:** Add a class \`highlighted\` to the paragraph and use it to set a \`background-color\` of \`yellow\`. This demonstrates that a class selector (0-0-1-0) can coexist with type selectors (0-0-0-1) when targeting different properties, and will override type selectors when targeting the same property.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how Svelte scopes styles to the component. Notice the generated class attributes that prevent style leaking.'
		},
		{
			type: 'text',
			content: `## Svelte Scoped CSS — How the Framework Uses the Cascade

Svelte compiles each component's \`<style>\` block into scoped CSS by adding a unique hash class (like \`.svelte-1a2b3c\`) to both the selector and the element. This means:

\`\`\`css
/* What you write */
p { color: blue; }

/* What Svelte compiles */
p.svelte-1a2b3c { color: blue; }
\`\`\`

This scoping adds one class selector to the specificity, so your component styles have specificity 0-0-1-1 (one class + one type) rather than plain 0-0-0-1. This is why global styles from a CSS reset are easily overridden by component styles — the scoping hash gives them higher specificity for free.

If you need a component style to reach outside its scope (for example, styling a child component's elements), Svelte provides the \`:global()\` modifier:

\`\`\`css
:global(.toast-container) p { color: red; }
\`\`\`

Use this sparingly. The moment you reach for \`:global()\`, you are opting out of the encapsulation that makes component CSS safe.`
		},
		{
			type: 'text',
			content: `## Inheritance — The Silent Propagation

Some CSS properties are **inherited** by child elements automatically. The browser does not copy styles — it walks up the DOM tree looking for a value when none is set directly. Understanding which properties inherit saves you from writing redundant declarations.

**Inherited properties** (text/font-related):
- \`color\`, \`font-family\`, \`font-size\`, \`font-weight\`
- \`line-height\`, \`letter-spacing\`, \`word-spacing\`
- \`text-align\`, \`text-indent\`, \`text-transform\`
- \`visibility\`, \`cursor\`, \`list-style\`

**Non-inherited properties** (layout/box-related):
- \`margin\`, \`padding\`, \`border\`
- \`width\`, \`height\`, \`display\`
- \`background\`, \`position\`, \`overflow\`

You can force inheritance with the \`inherit\` keyword or prevent it with \`initial\` or \`unset\`:

\`\`\`css
.child {
  border: inherit;    /* Force inheritance of a non-inherited property */
  color: initial;     /* Reset to the property's initial value */
  margin: unset;      /* Acts like 'inherit' for inherited props, 'initial' for others */
}
\`\`\`

**Task:** Set \`font-family: system-ui, sans-serif\` on the wrapper div and verify that the child elements inherit it. You do not need to set \`font-family\` on \`h1\` or \`p\` — they will receive it through inheritance.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Mental Model — How the Browser Resolves a Property

When the browser needs the \`color\` value for a \`<p>\` element, it follows this exact sequence:

1. **Collect** all declarations that target this element and set \`color\`
2. **Sort by origin** — transitions > important user-agent > important user > important author > normal author > normal user > normal user-agent
3. **Sort by specificity** within the same origin
4. **Sort by source order** as the final tiebreaker
5. **If no declaration exists**, check if \`color\` is an inherited property — if yes, use the parent's computed value
6. **If still no value**, use the property's **initial value** (for \`color\`, that is typically \`CanvasText\`, which maps to black in most contexts)

This algorithm runs for *every property on every element*. The browser is fast enough that this happens in milliseconds, but understanding the sequence lets you predict exactly which style will apply without guessing.

### Debugging the Cascade

In browser DevTools, the Styles panel shows declarations in specificity order (highest at top) with overridden declarations struck through. When a style is not applying as expected:

1. Check if the declaration appears in the Styles panel at all (selector may not match)
2. Check if it is struck through (a higher-specificity rule is winning)
3. Check the Computed tab for the final resolved value and which rule it came from
4. Look for \`!important\` flags that may be overriding your rule from a different origin`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('How CSS Works');
</script>

<div class="wrapper">
  <h1>{title}</h1>
  <p>This paragraph has conflicting styles.</p>
  <!-- TODO: Add class to paragraph -->
</div>

<style>
  p {
    color: blue;
  }

  p {
    color: red;
  }

  /* TODO: Add cascade, specificity, and inheritance rules */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('How CSS Works');
</script>

<div class="wrapper">
  <h1>{title}</h1>
  <p class="highlighted">This paragraph has conflicting styles.</p>
</div>

<style>
  .wrapper {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  p {
    color: blue;
  }

  p {
    color: red;
  }

  p {
    color: green;
  }

  .highlighted {
    background-color: yellow;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add a third rule that sets the paragraph color to green using cascade order',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'color: green' }
					]
				}
			},
			hints: [
				'The cascade means later rules override earlier ones at equal specificity.',
				'Add another `p { color: green; }` rule after the existing ones.',
				'Add: `p { color: green; }` after the second `p` rule in the style block.'
			],
			conceptsTested: ['css.cascade']
		},
		{
			id: 'cp-2',
			description: 'Add a highlighted class to the paragraph with a yellow background',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'highlighted' },
						{ type: 'contains', value: 'background-color: yellow' }
					]
				}
			},
			hints: [
				'Add `class="highlighted"` to the `<p>` element in the template.',
				'Create a `.highlighted` selector in the style block.',
				'Add: `.highlighted { background-color: yellow; }` and update the paragraph to `<p class="highlighted">`.'
			],
			conceptsTested: ['css.specificity']
		},
		{
			id: 'cp-3',
			description: 'Set font-family on the wrapper div so children inherit it',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '.wrapper' },
						{ type: 'contains', value: 'font-family' }
					]
				}
			},
			hints: [
				'Inherited properties like `font-family` flow from parent to child.',
				'Target `.wrapper` and set `font-family: system-ui, sans-serif`.',
				'Add: `.wrapper { font-family: system-ui, sans-serif; }`'
			],
			conceptsTested: ['css.inheritance']
		}
	]
};
