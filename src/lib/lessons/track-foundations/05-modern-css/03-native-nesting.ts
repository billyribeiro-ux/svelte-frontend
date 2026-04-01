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

CSS now supports nesting natively — no Sass or preprocessor needed. Nesting keeps related styles grouped together:

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
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'css.nesting'
		},
		{
			type: 'text',
			content: `## Basic Nesting

The \`&\` symbol represents the parent selector. It is required when nesting:

\`\`\`css
.nav {
  & a {
    color: blue;
    &:hover { color: darkblue; }
  }
}
\`\`\`

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
  &::after { content: ' →'; }

  @media (min-width: 768px) {
    padding: 1rem 2rem;
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

Styles only apply between the scope root and the scope limit.

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
