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

CSS now supports nesting natively — no Sass or preprocessor needed. Nesting keeps related styles grouped together, making stylesheets easier to read and maintain.

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

## WHY: The & Reference Behavior

The \`&\` symbol in CSS nesting represents the parent selector — but its behavior is more nuanced than in SCSS:

**In SCSS:** \`&\` is a simple textual replacement. \`.card { &__title { } }\` produces \`.card__title\`.

**In native CSS:** \`&\` represents the entire parent selector as a **selector list**. This means:
- \`& h3\` produces \`.card h3\` (descendant combinator)
- \`&:hover\` produces \`.card:hover\` (pseudo-class on the same element)
- \`& > .child\` produces \`.card > .child\` (direct child)

**Key difference from SCSS:** Native CSS nesting does NOT support string concatenation. You cannot write \`&__title\` to produce \`.card__title\` — this is a BEM pattern that native nesting explicitly does not support. If you use BEM naming, you must write the full selector.

## Nesting Limitations

Understanding what native nesting cannot do prevents confusion:

1. **No string concatenation:** \`&-modifier\` does not work. Use \`.card-modifier\` as a separate rule or nest under the parent.

2. **Type selectors require &:** You must write \`& h3\`, not just \`h3\`, at the start of a nested rule. (This was relaxed in the latest spec — most browsers now allow bare type selectors, but using \`&\` is more explicit and backwards-compatible.)

3. **Specificity:** Nested selectors have the specificity of their fully expanded form. \`.card { & h3 { } }\` has the same specificity as \`.card h3\`.

4. **\`&\` is the full selector list:** If the parent is \`.card, .panel\`, then \`& h3\` becomes \`.card h3, .panel h3\`. This matches SCSS behavior.

## Comparison with SCSS Nesting

| Feature | SCSS | Native CSS |
|---------|------|------------|
| String concatenation (\`&__title\`) | Yes | No |
| Pseudo-classes (\`&:hover\`) | Yes | Yes |
| Media queries inside rules | Yes | Yes |
| Variables | \`$var\` | \`var(--custom)\` |
| Build step required | Yes | No |
| Browser support | Via compilation | Chrome 120+, Safari 17.2+, Firefox 117+ |`
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

This produces:
\`\`\`css
.nav a { color: blue; }
.nav a:hover { color: darkblue; }
\`\`\`

Look at the starter code. The styles are flat and repetitive — each child selector repeats \`.card\`.

**Task:** Nest the \`h3\` and \`p\` styles inside the \`.card\` rule using \`&\` syntax.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Nesting Pseudo-classes and Media Queries

You can nest pseudo-classes, pseudo-elements, and even media queries inside a rule. This is one of the most powerful features — it keeps all styles for a component together:

\`\`\`css
.button {
  padding: 0.5rem 1rem;
  background: blue;
  color: white;

  &:hover { background: darkblue; }
  &:focus { outline: 2px solid lightblue; }
  &:active { transform: scale(0.98); }
  &::after { content: ' \\2192'; }

  @media (min-width: 768px) {
    padding: 1rem 2rem;
    font-size: 1.125rem;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
\`\`\`

Without nesting, this single component would be split across the main rule, a :hover rule, a :focus rule, an :active rule, a ::after rule, and two separate media query blocks. Nesting keeps everything together.

**Task:** Nest a \`&:hover\` rule and a \`@media (min-width: 768px)\` rule inside \`.card\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and compare the nested CSS with what the browser actually applies. Notice how Svelte compiles nested rules into flat selectors with scoping classes. The nesting is purely a developer ergonomics feature — the browser engine still works with flat selectors internally.'
		},
		{
			type: 'text',
			content: `## @scope Boundaries

\`@scope\` limits where styles apply, with optional lower boundaries. This solves a problem that CSS has struggled with since the beginning: preventing styles from "leaking" into deeply nested components.

\`\`\`css
@scope (.card) to (.card-footer) {
  p { color: #334155; }
}
\`\`\`

This styles \`p\` elements inside \`.card\` but NOT inside \`.card-footer\`. The style applies between the **scope root** (\`.card\`) and the **scope limit** (\`.card-footer\`).

**WHY @scope is different from nesting:**

Nesting \`.card { p { } }\` styles ALL \`p\` elements inside \`.card\`, including those deeply nested in child components. \`@scope\` with a lower boundary stops at the boundary — child component internals are not affected.

**Real-world use case:** A card component with a footer that should not inherit the card's text styles:

\`\`\`css
@scope (.card) to (.card-footer) {
  p { color: #334155; line-height: 1.6; }
  a { color: #2563eb; text-decoration: underline; }
}

/* Footer has its own, different styles */
.card-footer {
  p { color: #94a3b8; font-size: 0.875rem; }
}
\`\`\`

**Browser support:** \`@scope\` is supported in Chrome 118+, Safari 17.4+, and Firefox 128+. It is newer than nesting and container queries, so verify support for your target audience.

**Task:** Add a \`@scope (.card)\` block that styles the \`p\` elements inside the card with \`color: #334155\`.

## Realistic Exercise: Refactoring a Component's Styles

After completing the checkpoints, take a component from a real project (or the previous lessons) and refactor its flat CSS to use nesting:

1. Group all child selectors under their parent rule using \`&\`
2. Nest hover, focus, and active states using \`&:pseudo\`
3. Move media queries inside the relevant rules
4. Count the lines saved and evaluate readability

The goal is not just fewer lines — it is **co-location**. When a developer looks at \`.card { }\`, they see everything about that component's styles in one block instead of scattered across the file.`
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
