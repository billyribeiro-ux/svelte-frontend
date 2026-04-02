import type { Lesson } from '$types/lesson';

export const selectors: Lesson = {
	id: 'foundations.css-fundamentals.selectors',
	slug: 'selectors',
	title: 'CSS Selectors',
	description: 'Master type, class, ID, attribute, and pseudo-class selectors to target elements precisely.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 2,
	estimatedMinutes: 20,
	concepts: ['css.selectors', 'css.pseudo-classes', 'css.attribute-selectors'],
	prerequisites: ['foundations.css-fundamentals.how-css-works'],

	content: [
		{
			type: 'text',
			content: `# CSS Selectors

Selectors are the addressing system of CSS. They tell the browser which elements to style. The selector you choose determines not only *which* elements receive styles but also the **specificity** of the rule (covered in the previous lesson). Choosing the right selector is a balance between precision and maintainability.

## How the Browser Matches Selectors — Right to Left

This is a detail most developers never learn, and it explains why some selectors are expensive. The browser reads selectors **right to left**. Given:

\`\`\`css
.card .title span { color: red; }
\`\`\`

The browser first finds every \`<span>\` on the page. Then, for each span, it walks up the DOM tree looking for an ancestor with class \`title\`. If found, it walks up again looking for an ancestor with class \`card\`. This right-to-left evaluation means the **rightmost part** (the "key selector") has the greatest performance impact. A key selector of \`*\` or a bare type like \`div\` forces the browser to check every element on the page.

In practice, modern browsers are fast enough that selector performance rarely matters. But understanding right-to-left matching helps you reason about *why* a selector does or does not match.

## Selector Categories

| Category | Syntax | Specificity |
|----------|--------|-------------|
| Universal | \`*\` | 0-0-0-0 |
| Type | \`p\`, \`div\`, \`h1\` | 0-0-0-1 |
| Class | \`.card\`, \`.active\` | 0-0-1-0 |
| ID | \`#header\` | 0-1-0-0 |
| Attribute | \`[type="email"]\` | 0-0-1-0 |
| Pseudo-class | \`:hover\`, \`:first-child\` | 0-0-1-0 |
| Pseudo-element | \`::before\`, \`::after\` | 0-0-0-1 |`
		},
		{
			type: 'concept-callout',
			content: 'css.selectors'
		},
		{
			type: 'text',
			content: `## Type and Class Selectors

**Type selectors** target every element of a given HTML tag. They are the broadest brush: \`li\` matches every list item on the page (within scope). Use them for base styles — things you want consistently across all instances of an element.

**Class selectors** target elements with a specific \`class\` attribute. They are the workhorse of CSS. Classes are reusable, composable, and sit at a comfortable specificity level (0-0-1-0) that is easy to override when needed.

\`\`\`css
/* Type: all list items get padding */
li {
  padding: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

/* Class: only featured items get emphasis */
.featured {
  font-weight: bold;
  color: #6366f1;
}
\`\`\`

Look at the starter code. There is a list of items with no styling.

**Task:** Style all list items with a base style using a \`li\` type selector (add \`padding: 0.5rem\` and \`border-bottom: 1px solid #e2e8f0\`). Then add a \`.featured\` class to the first item with distinct styling like \`font-weight: bold\` and a color.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Attribute Selectors

Attribute selectors match elements based on the presence or value of HTML attributes. They have the same specificity as class selectors (0-0-1-0).

\`\`\`css
/* Has the attribute at all */
a[target] { text-decoration: underline; }

/* Exact value match */
input[type="email"] { border-color: blue; }

/* Value starts with */
a[href^="https"] { color: green; }

/* Value ends with */
a[href$=".pdf"] { color: red; }

/* Value contains */
a[href*="docs"] { font-weight: bold; }
\`\`\`

Attribute selectors are powerful for styling form elements without adding classes, or for styling links based on their destination.

## Pseudo-class Selectors

Pseudo-classes match elements in a particular **state** or **position**. They do not create new elements (that is pseudo-elements with \`::\`). Pseudo-classes have the same specificity as class selectors.

### Structural pseudo-classes:
\`\`\`css
li:first-child { }       /* First child of its parent */
li:last-child { }        /* Last child of its parent */
li:nth-child(even) { }   /* Even-numbered children */
li:nth-child(3n+1) { }   /* Every 3rd, starting from 1st */
li:only-child { }        /* Only child of its parent */
\`\`\`

### State pseudo-classes:
\`\`\`css
a:hover { }     /* Mouse is over the element */
a:focus { }     /* Element has keyboard focus */
a:active { }    /* Element is being activated (clicked) */
a:visited { }   /* Link has been visited */
input:disabled { }  /* Form element is disabled */
input:checked { }   /* Checkbox/radio is checked */
\`\`\`

**Task:** Use \`:nth-child(even)\` to give even list items a light background color like \`#f1f5f9\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how Svelte adds scoping classes to selectors. Notice how pseudo-classes are preserved alongside the scoping mechanism.'
		},
		{
			type: 'text',
			content: `## Modern Pseudo-classes: :is(), :where(), and :has()

CSS has three powerful pseudo-classes that change how you write and think about selectors.

### :is() — Grouping With Specificity

\`:is()\` lets you group selectors without repeating shared parts. Its specificity equals the **most specific** selector in its argument list:

\`\`\`css
/* Instead of: h1 a, h2 a, h3 a { color: blue; } */
:is(h1, h2, h3) a { color: blue; }
/* Specificity: 0-0-0-2 (from h1 + a — type selectors) */

/* But with a class in the list: */
:is(h1, .hero-title) a { color: blue; }
/* Specificity: 0-0-1-1 (from .hero-title — the highest in the list) */
\`\`\`

### :where() — Grouping With Zero Specificity

\`:where()\` is identical to \`:is()\` in matching behavior, but contributes **zero specificity**. This makes it perfect for default styles that are easy to override:

\`\`\`css
/* This rule matches the same elements as :is() but has 0-0-0-0 specificity */
:where(h1, h2, h3) { margin-block: 0.5em; }

/* Any class easily overrides it */
.tight { margin-block: 0.25em; }  /* 0-0-1-0 wins */
\`\`\`

The decision between \`:is()\` and \`:where()\` comes down to intent: use \`:is()\` when you want the specificity weight, use \`:where()\` when building a base layer that should be easy to override.

### :has() — The Parent Selector

\`:has()\` selects an element based on its descendants or subsequent siblings. It is the first true "parent selector" in CSS:

\`\`\`css
/* A card that contains an image gets different padding */
.card:has(img) { padding: 0; }

/* A form that has an invalid input gets a red border */
form:has(input:invalid) { border-color: red; }
\`\`\`

## Combinators — Expressing Relationships

Combinators define the structural relationship between selectors:

| Combinator | Syntax | Meaning |
|------------|--------|---------|
| Descendant | \`A B\` | B is anywhere inside A |
| Child | \`A > B\` | B is a direct child of A |
| Adjacent sibling | \`A + B\` | B immediately follows A (same parent) |
| General sibling | \`A ~ B\` | B follows A at some point (same parent) |

\`\`\`css
ul > li { }       /* Direct children only, not nested li inside sub-lists */
h2 + p { }        /* The first paragraph after each h2 */
h2 ~ p { }        /* All paragraphs that are siblings after an h2 */
.card > .title { } /* Title that is a direct child of card */
\`\`\`

**Why combinators matter:** Without the child combinator (\`>\`), \`.nav li\` matches list items at *every* nesting level. With \`.nav > li\`, you only target direct children. This prevents styles from leaking into nested structures like sub-menus.

**Task:** Add a hover state to list items that changes the background color. Use the \`li:hover\` selector to apply a slightly darker background like \`#e2e8f0\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Selector Strategy — Practical Guidelines

1. **Prefer classes over IDs.** IDs have specificity 0-1-0-0, which is difficult to override without resorting to more IDs or \`!important\`. Reserve IDs for JavaScript hooks and anchor targets.

2. **Keep selectors shallow.** \`.card-title\` is better than \`.sidebar .card .header .title\`. Deep selectors are brittle — they break when you move elements in the DOM.

3. **Use type selectors for base styles only.** A bare \`p { }\` or \`h2 { }\` is appropriate in a CSS reset or within a scoped component, but dangerous in global CSS where it affects every instance.

4. **Use \`:where()\` for reset/base layers.** Because it has zero specificity, any component style will naturally override it without specificity battles.

5. **Use attribute selectors for form styling.** \`input[type="text"]\` and \`input[type="email"]\` let you style form controls without adding classes to every input.

6. **In Svelte components, keep it simple.** Because Svelte scopes all styles to the component, you rarely need complex selectors. A single class is usually sufficient. The scoping hash handles isolation for you.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let items = $state(['Design', 'Develop', 'Deploy', 'Iterate']);
</script>

<div class="container">
  <h2>Project Phases</h2>
  <ul>
    {#each items as item}
      <li>{item}</li>
    {/each}
  </ul>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  /* TODO: Add type, class, pseudo-class, and combined selectors */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let items = $state(['Design', 'Develop', 'Deploy', 'Iterate']);
</script>

<div class="container">
  <h2>Project Phases</h2>
  <ul>
    {#each items as item, i}
      <li class={i === 0 ? 'featured' : ''}>{item}</li>
    {/each}
  </ul>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  li {
    padding: 0.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .featured {
    font-weight: bold;
    color: var(--sf-accent, #6366f1);
  }

  li:nth-child(even) {
    background-color: #f1f5f9;
  }

  li:hover {
    background-color: #e2e8f0;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Style list items with a type selector and add a featured class',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'li\\s*\\{' },
						{ type: 'contains', value: '.featured' }
					]
				}
			},
			hints: [
				'Use `li { }` to target all list items with base styles like padding.',
				'Create a `.featured` class with distinct styling like bold text.',
				'Add: `li { padding: 0.5rem; }` and `.featured { font-weight: bold; color: #6366f1; }`'
			],
			conceptsTested: ['css.selectors']
		},
		{
			id: 'cp-2',
			description: 'Use :nth-child(even) to style alternating list items',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'nth-child(even)' },
						{ type: 'contains', value: 'background' }
					]
				}
			},
			hints: [
				'Pseudo-class selectors target elements in a specific state or position.',
				'Use `li:nth-child(even)` to select every other list item.',
				'Add: `li:nth-child(even) { background-color: #f1f5f9; }`'
			],
			conceptsTested: ['css.pseudo-classes']
		},
		{
			id: 'cp-3',
			description: 'Add a hover state to list items',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'li:hover' },
						{ type: 'contains', value: 'background' }
					]
				}
			},
			hints: [
				'The `:hover` pseudo-class targets elements the user is hovering over.',
				'Combine it with the `li` selector: `li:hover { }`.',
				'Add: `li:hover { background-color: #e2e8f0; }`'
			],
			conceptsTested: ['css.pseudo-classes']
		}
	]
};
