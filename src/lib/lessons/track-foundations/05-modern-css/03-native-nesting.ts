import type { Lesson } from '$types/lesson';

export const nativeNesting: Lesson = {
	id: 'foundations.modern-css.native-nesting',
	slug: 'native-nesting',
	title: 'Native CSS Nesting',
	description: 'Use native CSS nesting syntax and @scope rules to organize styles without a preprocessor.',
	trackId: 'foundations',
	moduleId: 'modern-css',
	order: 3,
	estimatedMinutes: 10,
	concepts: ['css.nesting', 'css.scope', 'css.nesting-syntax'],
	prerequisites: ['foundations.modern-css.container-queries'],

	content: [
		{
			type: 'text',
			content: `# Native CSS Nesting

CSS now supports nesting natively — no Sass or preprocessor needed. Nesting keeps related styles grouped together, making stylesheets more readable and maintainable:

\`\`\`css
.card {
  padding: 1rem;

  & h3 {
    color: blue;
  }

  &:hover {
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  }

  & .footer {
    border-top: 1px solid #e2e8f0;
  }
}
\`\`\`

## The & Reference

The \`&\` symbol is the heart of CSS nesting. It represents the **parent selector** — the selector of the enclosing rule. This is similar to Sass's \`&\` but with some important differences.

### How & Works

Inside a nested rule, \`&\` is replaced by the parent selector during evaluation:

\`\`\`css
.card {
  & h3 { }       /* Becomes: .card h3 */
  &:hover { }    /* Becomes: .card:hover */
  &.active { }   /* Becomes: .card.active */
  & + & { }      /* Becomes: .card + .card */
  & > .child { } /* Becomes: .card > .child */
}
\`\`\`

### When & Is Required

In the current CSS nesting spec, the \`&\` is required when the nested selector starts with:
- A type selector (\`h3\`, \`div\`, \`p\`) — you must write \`& h3\`, not just \`h3\`
- A combinator (\`>\`, \`+\`, \`~\`) — you must write \`& > .child\`

The \`&\` can be omitted when the nested selector starts with:
- A class (\`.child\`)
- An ID (\`#main\`)
- An attribute selector (\`[type="text"]\`)
- A pseudo-class (\`:hover\`, \`:focus\`)

However, **always using \`&\` is recommended for consistency.** It makes the nesting relationship explicit and avoids confusion about when it is required.

## Native Nesting vs SCSS Nesting

If you are coming from Sass/SCSS, native CSS nesting is very similar but has key differences:

### What Is the Same
- \`&\` represents the parent selector
- You can nest pseudo-classes: \`&:hover\`, \`&:focus\`
- You can nest pseudo-elements: \`&::before\`, \`&::after\`
- You can nest media queries: \`@media (...) { }\`
- Multiple levels of nesting are supported

### What Is Different

**1. Type selectors require \`&\`:**
\`\`\`scss
// SCSS — works without &
.card {
  h3 { color: blue; }
}

/* CSS — must use & */
.card {
  & h3 { color: blue; }
}
\`\`\`

**2. No & interpolation for BEM-style selectors:**
\`\`\`scss
// SCSS — creates .card__header
.card {
  &__header { ... }
}

/* CSS — & is the full selector, not a string */
/* .card { &__header { } } would become .card__header — but this does NOT work */
\`\`\`

This is the biggest practical difference. SCSS's string interpolation of \`&\` is not available in native CSS. If you use BEM naming, you cannot generate \`block__element\` from nesting.

**3. Specificity:**
In SCSS, \`.card { & h3 { } }\` compiles to \`.card h3 { }\` with specificity 0-1-1. In native CSS nesting, the specificity is the same, but there is a subtlety: the nested selector is wrapped in \`:is()\` internally, which can affect specificity in edge cases with complex selectors.`
		},
		{
			type: 'concept-callout',
			content: 'css.nesting'
		},
		{
			type: 'text',
			content: `## Basic Nesting

The \`&\` symbol represents the parent selector. Use it to nest related rules:

\`\`\`css
.nav {
  & a {
    color: blue;
    &:hover { color: darkblue; }
  }
}
\`\`\`

### Nesting Depth Guidelines

Just because you can nest deeply does not mean you should. Deep nesting creates highly specific selectors that are hard to override and hard to read:

\`\`\`css
/* Too deep — hard to read, high specificity */
.page {
  & .sidebar {
    & .widget {
      & .header {
        & h3 {
          color: blue;
        }
      }
    }
  }
}

/* Better — flat with focused nesting */
.widget {
  & .header {
    & h3 { color: blue; }
  }
}
\`\`\`

A good rule of thumb: **limit nesting to 2-3 levels.** If you find yourself nesting deeper, consider whether you need a more specific selector or whether you should restructure your CSS.

### Grouping Related Styles

Nesting shines when grouping a component's styles:

\`\`\`css
.card {
  background: white;
  border-radius: 8px;
  overflow: hidden;

  & img {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }

  & .body {
    padding: 1rem;
  }

  & .title {
    font-size: 1.25rem;
    margin: 0 0 0.5rem;
  }

  &:hover {
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.1);
  }
}
\`\`\`

All card-related styles are in one block. When you need to modify the card component, everything is in one place.

Look at the starter code. The styles are flat and repetitive.

**Task:** Nest the \`h3\` and \`p\` styles inside the \`.card\` rule using \`&\` syntax.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Nesting Pseudo-classes and Media Queries

You can nest pseudo-classes, pseudo-elements, and even media queries:

\`\`\`css
.button {
  padding: 0.5rem 1rem;

  &:hover { background: darkblue; }
  &:focus-visible { outline: 2px solid blue; }
  &:active { transform: scale(0.98); }
  &::after { content: ' \\2192'; }

  @media (min-width: 768px) {
    padding: 1rem 2rem;
  }
}
\`\`\`

### Nesting Media Queries

Media queries nested inside a rule are scoped to that rule automatically:

\`\`\`css
.sidebar {
  width: 100%;

  @media (min-width: 768px) {
    width: 250px;
    position: sticky;
    top: 0;
  }

  @media (min-width: 1024px) {
    width: 300px;
  }
}
\`\`\`

This is much more readable than the alternative — separate media query blocks at the bottom of the file, each containing rules for different components. With nesting, the responsive behavior of each component is defined alongside its base styles.

### Nesting @container Queries

Container queries can be nested too:

\`\`\`css
.card-wrapper {
  container-type: inline-size;

  & .card {
    padding: 0.5rem;

    @container (min-width: 400px) {
      display: flex;
      padding: 1rem;
    }
  }
}
\`\`\`

**Task:** Nest a \`&:hover\` rule and a \`@media (min-width: 768px)\` rule inside \`.card\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and compare the nested CSS with the flat equivalent. Notice how Svelte compiles nested rules into flat selectors with scoping classes.'
		},
		{
			type: 'text',
			content: `## @scope

\`@scope\` limits where styles apply, with optional lower boundaries:

\`\`\`css
@scope (.card) to (.card-footer) {
  p { color: #334155; }
}
\`\`\`

Styles only apply between the scope root (\`.card\`) and the scope limit (\`.card-footer\`). The \`p\` elements inside \`.card-footer\` are **not** affected.

### Why @scope Exists

Without \`@scope\`, CSS has two main tools for limiting style reach:

1. **Descendant selectors** (\`.card p\`) — These select all \`p\` elements inside \`.card\`, including those deeply nested in sub-components. You cannot say "stop at this boundary."

2. **Component scoping** (like Svelte's \`<style>\`) — This scopes styles to the component, but it applies to the entire component. You cannot scope to a sub-section within a component.

\`@scope\` fills the gap: it lets you define a start and end boundary for style application.

### Practical @scope Patterns

\`\`\`css
/* Style content between the card body and any nested card */
@scope (.card) to (.card) {
  /* Only applies to the outermost card, not nested cards */
  h3 { color: var(--accent); }
}

/* Theme a section without affecting nested widgets */
@scope (.theme-dark) to (.widget) {
  color: white;
  background: #1a1a1a;
}

/* Style prose content but not code blocks */
@scope (.prose) to (pre, code) {
  line-height: 1.8;
  font-size: 1.125rem;
}
\`\`\`

### @scope and Specificity

\`@scope\` has a special specificity behavior: styles inside a scope have proximity-based specificity. When two scoped rules with the same specificity conflict, the one from the nearer scope wins — regardless of source order. This is a new concept in CSS and makes component-based styling more predictable.

### Browser Support

\`@scope\` is newer than nesting and has more limited browser support. As of early 2025, it is supported in Chrome 118+ and Safari 17.4+, with Firefox support in progress. Check caniuse.com before using in production without fallbacks.

**Task:** Add a \`@scope (.card)\` block that styles the \`p\` elements inside the card with \`color: #334155\`.`
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
  let title = $state('CSS Nesting');
</script>

<div class="card">
  <h3>{title}</h3>
  <p>Native nesting makes CSS more organized and maintainable.</p>
  <div class="card-footer">
    <span>Footer content</span>
  </div>
</div>

<style>
  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    font-family: system-ui, sans-serif;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  .card p {
    line-height: 1.6;
  }

  .card-footer {
    border-top: 1px solid #e2e8f0;
    padding-block-start: 1rem;
    margin-block-start: 1rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  /* TODO: Refactor to use nesting and add @scope */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('CSS Nesting');
</script>

<div class="card">
  <h3>{title}</h3>
  <p>Native nesting makes CSS more organized and maintainable.</p>
  <div class="card-footer">
    <span>Footer content</span>
  </div>
</div>

<style>
  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    font-family: system-ui, sans-serif;

    & h3 {
      margin: 0 0 0.5rem;
      color: var(--sf-accent, #6366f1);
    }

    & p {
      line-height: 1.6;
    }

    &:hover {
      box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
    }

    @media (min-width: 768px) {
      padding: 2rem;
    }
  }

  .card-footer {
    border-top: 1px solid #e2e8f0;
    padding-block-start: 1rem;
    margin-block-start: 1rem;
    color: #94a3b8;
    font-size: 0.875rem;
  }

  @scope (.card) {
    p {
      color: #334155;
    }
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Nest h3 and p styles inside the .card rule',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '& h3' },
						{ type: 'contains', value: '& p' }
					]
				}
			},
			hints: [
				'The `&` symbol represents the parent selector in nested CSS.',
				'Move the `.card h3` rule inside `.card { }` as `& h3 { }`.',
				'Inside `.card { }`, add: `& h3 { margin: 0 0 0.5rem; color: var(--sf-accent, #6366f1); }` and `& p { line-height: 1.6; }`'
			],
			conceptsTested: ['css.nesting']
		},
		{
			id: 'cp-2',
			description: 'Nest a :hover pseudo-class and a media query inside .card',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '&:hover' },
						{ type: 'contains', value: '@media' }
					]
				}
			},
			hints: [
				'Pseudo-classes nest with `&:hover { }` inside the parent rule.',
				'Media queries can also be nested directly inside a rule.',
				'Inside `.card { }`, add: `&:hover { box-shadow: 0 2px 8px rgb(0 0 0 / 0.1); }` and `@media (min-width: 768px) { padding: 2rem; }`'
			],
			conceptsTested: ['css.nesting-syntax']
		},
		{
			id: 'cp-3',
			description: 'Add a @scope rule for the card',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@scope' }
					]
				}
			},
			hints: [
				'`@scope` limits where styles apply within a subtree.',
				'Use `@scope (.card) { p { color: #334155; } }`.',
				'Add: `@scope (.card) { p { color: #334155; } }`'
			],
			conceptsTested: ['css.scope']
		}
	]
};
