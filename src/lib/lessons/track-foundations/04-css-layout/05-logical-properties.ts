import type { Lesson } from '$types/lesson';

export const logicalProperties: Lesson = {
	id: 'foundations.css-layout.logical-properties',
	slug: 'logical-properties',
	title: 'Logical Properties',
	description: 'Use inline/block directions, start/end, and margin-inline for internationalization-ready layouts.',
	trackId: 'foundations',
	moduleId: 'css-layout',
	order: 5,
	estimatedMinutes: 10,
	concepts: ['css.logical-properties', 'css.inline-block', 'css.writing-modes'],
	prerequisites: ['foundations.css-layout.responsive-design'],

	content: [
		{
			type: 'text',
			content: `# Logical Properties

Logical properties replace physical directions (top, right, bottom, left) with flow-relative ones that adapt to writing direction:

- **Block** — The direction content stacks (top-to-bottom in English)
- **Inline** — The direction text flows (left-to-right in English)
- **Start/End** — Replace left/right and top/bottom

## Why Logical Properties Matter

Physical CSS properties like \`margin-left\`, \`padding-right\`, \`border-top\`, and \`text-align: left\` assume a left-to-right, top-to-bottom writing direction. This assumption breaks the moment your application needs to support any of the following:

- **Right-to-left (RTL) languages** — Arabic, Hebrew, Farsi, Urdu. In these languages, text flows right-to-left. A navigation menu with \`padding-left: 2rem\` for the logo indent needs to become \`padding-right: 2rem\` in RTL mode.

- **Vertical writing modes** — Traditional Chinese, Japanese, and Korean can be written vertically. In vertical writing, "top" and "left" no longer map to the expected directions.

- **Bidirectional (bidi) content** — A page that mixes English and Arabic text, where different sections flow in different directions.

Without logical properties, supporting RTL requires either:
1. A separate RTL stylesheet that overrides every directional property (maintenance nightmare)
2. A build tool that generates RTL-flipped CSS automatically (build complexity)
3. Manually adding \`[dir="rtl"]\` selectors for every directional rule (tedious and error-prone)

With logical properties, you write your CSS once and it works in every direction. \`padding-inline-start: 2rem\` means "padding at the start of the text flow direction" — left in LTR, right in RTL. No overrides needed.

### The Internationalization Example

Consider a chat message layout. In English (LTR), your messages appear on the right, the other person's on the left. In Arabic (RTL), it should be mirrored.

\`\`\`css
/* Physical properties — breaks in RTL */
.my-message { margin-left: auto; margin-right: 0; }
.their-message { margin-left: 0; margin-right: auto; }

/* Logical properties — works in both directions */
.my-message { margin-inline-start: auto; margin-inline-end: 0; }
.their-message { margin-inline-start: 0; margin-inline-end: auto; }
\`\`\`

The logical version automatically mirrors when the \`dir\` attribute changes from \`ltr\` to \`rtl\`. No additional CSS, no JavaScript, no build tools.

### Even If You Do Not Need RTL Today

You might think "my app is English-only, I do not need this." There are still reasons to adopt logical properties:

1. **Future-proofing.** Adding RTL support later is dramatically easier if your CSS already uses logical properties.
2. **Consistency.** Logical properties are the modern standard. New CSS features assume logical directions. Learning them now means your mental model matches where CSS is going.
3. **Semantic clarity.** \`margin-block-start\` communicates intent ("space before this element in the reading flow") better than \`margin-top\` (which is a physical measurement that happens to match intent in one writing mode).`
		},
		{
			type: 'concept-callout',
			content: 'css.logical-properties'
		},
		{
			type: 'text',
			content: `## Block and Inline Directions

The two axes in logical properties:

**Block axis** — The direction in which block-level elements stack. In English, this is vertical (top to bottom). In vertical Chinese, this is horizontal (right to left).

**Inline axis** — The direction in which text flows within a line. In English, this is horizontal (left to right). In Arabic, this is horizontal (right to left). In vertical Chinese, this is vertical (top to bottom).

Physical properties and their logical equivalents:

| Physical | Logical |
|----------|---------|
| \`margin-top\` | \`margin-block-start\` |
| \`margin-bottom\` | \`margin-block-end\` |
| \`margin-left\` | \`margin-inline-start\` |
| \`margin-right\` | \`margin-inline-end\` |
| \`padding-top\` | \`padding-block-start\` |
| \`padding-bottom\` | \`padding-block-end\` |
| \`padding-left\` | \`padding-inline-start\` |
| \`padding-right\` | \`padding-inline-end\` |
| \`border-top\` | \`border-block-start\` |
| \`border-bottom\` | \`border-block-end\` |
| \`top\` | \`inset-block-start\` |
| \`bottom\` | \`inset-block-end\` |
| \`left\` | \`inset-inline-start\` |
| \`right\` | \`inset-inline-end\` |
| \`text-align: left\` | \`text-align: start\` |
| \`text-align: right\` | \`text-align: end\` |

### Writing Modes

The \`writing-mode\` property changes which direction is "block" and which is "inline":

\`\`\`css
.vertical-text {
  writing-mode: vertical-rl; /* Block: right-to-left, Inline: top-to-bottom */
}
\`\`\`

When you change writing modes, logical properties automatically adapt. \`margin-block-start\` points to the "top" in horizontal writing and to the "right" in \`vertical-rl\`. Physical properties do not adapt — \`margin-top\` is always the top, regardless of writing mode.

Look at the starter code. It uses physical properties.

**Task:** Replace \`margin-top\` with \`margin-block-start\` and \`padding-left\`/\`padding-right\` with \`padding-inline\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Shorthand Logical Properties

Logical shorthands let you set both start and end at once:

\`\`\`css
margin-block: 1rem 2rem;   /* block-start, block-end */
margin-block: 1rem;         /* same value for both */
margin-inline: auto;        /* center horizontally */
padding-inline: 1rem;       /* left and right */
padding-block: 2rem;        /* top and bottom */
border-inline-start: 3px solid blue;
\`\`\`

### The inset Shorthand

For positioned elements, \`inset\` replaces \`top\`, \`right\`, \`bottom\`, \`left\`:

\`\`\`css
/* Physical */
.overlay { top: 0; right: 0; bottom: 0; left: 0; }

/* Logical shorthand */
.overlay { inset: 0; }

/* Individual logical inset properties */
.tooltip {
  inset-block-start: 100%;
  inset-inline-start: 50%;
}
\`\`\`

### border-radius Logical Properties

Even border-radius has logical equivalents:

\`\`\`css
/* Physical */
border-top-left-radius: 8px;

/* Logical */
border-start-start-radius: 8px;
\`\`\`

The naming is \`border-{block}-{inline}-radius\`. So \`border-start-start\` is block-start + inline-start, which is top-left in English LTR. In RTL, it becomes top-right.

**Task:** Use \`margin-inline: auto\` to center the container and \`padding-block: 2rem\` for vertical padding.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and change the `dir` attribute to `rtl`. Observe how logical properties automatically flip inline directions for right-to-left languages.'
		},
		{
			type: 'text',
			content: `## Logical Sizing

Size properties have logical equivalents too:

\`\`\`css
inline-size: 100%;     /* replaces width */
block-size: 50vh;      /* replaces height */
max-inline-size: 65ch; /* replaces max-width */
min-block-size: 100vh; /* replaces min-height */
\`\`\`

### Why 65ch for max-inline-size?

The \`ch\` unit is the width of the "0" character in the current font. \`65ch\` gives you approximately 65 characters per line, which is within the optimal readability range (45-75 characters). Using \`ch\` instead of \`px\` or \`rem\` means the line length adapts to the font — a wider font gets a wider container to maintain the same character count.

\`\`\`css
.prose {
  max-inline-size: 65ch;
  margin-inline: auto;
  padding-inline: 1rem;
}
\`\`\`

### Adopting Logical Properties in Practice

You do not need to convert your entire codebase at once. A practical migration strategy:

1. **New code** — Write all new CSS with logical properties.
2. **Shared components** — Convert design system components first, since they are reused everywhere.
3. **Layout code** — Convert page layouts next, since these are most affected by RTL.
4. **Existing components** — Convert gradually as you touch files for other reasons.

Many linting tools (like \`stylelint-use-logical\`) can warn when physical properties are used, helping enforce the migration.

**Task:** Replace \`max-width\` with \`max-inline-size\` on the container.`
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
  let title = $state('Logical Properties');
</script>

<div class="container">
  <h1>{title}</h1>
  <p>Logical properties make your CSS internationalization-ready by using flow-relative directions instead of physical ones.</p>
  <div class="card">
    <h3>Benefits</h3>
    <ul>
      <li>Works with any writing direction</li>
      <li>RTL support built-in</li>
      <li>Future-proof approach</li>
    </ul>
  </div>
</div>

<style>
  .container {
    max-width: 65ch;
    margin-top: 2rem;
    padding-left: 1rem;
    padding-right: 1rem;
    font-family: system-ui, sans-serif;
  }

  h1 {
    color: var(--sf-accent, #6366f1);
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  /* TODO: Convert to logical properties */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('Logical Properties');
</script>

<div class="container">
  <h1>{title}</h1>
  <p>Logical properties make your CSS internationalization-ready by using flow-relative directions instead of physical ones.</p>
  <div class="card">
    <h3>Benefits</h3>
    <ul>
      <li>Works with any writing direction</li>
      <li>RTL support built-in</li>
      <li>Future-proof approach</li>
    </ul>
  </div>
</div>

<style>
  .container {
    max-inline-size: 65ch;
    margin-block-start: 2rem;
    margin-inline: auto;
    padding-inline: 1rem;
    padding-block: 2rem;
    font-family: system-ui, sans-serif;
  }

  h1 {
    color: var(--sf-accent, #6366f1);
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Replace physical margin and padding with logical equivalents',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'margin-block-start' },
						{ type: 'contains', value: 'padding-inline' }
					]
				}
			},
			hints: [
				'`margin-top` becomes `margin-block-start` in logical properties.',
				'`padding-left` and `padding-right` can be combined into `padding-inline`.',
				'Replace with: `margin-block-start: 2rem;` and `padding-inline: 1rem;`'
			],
			conceptsTested: ['css.logical-properties']
		},
		{
			id: 'cp-2',
			description: 'Use margin-inline: auto and padding-block for centering and spacing',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'margin-inline: auto' },
						{ type: 'contains', value: 'padding-block' }
					]
				}
			},
			hints: [
				'`margin-inline: auto` centers a block element horizontally.',
				'`padding-block: 2rem` adds vertical padding using logical properties.',
				'Add to `.container`: `margin-inline: auto; padding-block: 2rem;`'
			],
			conceptsTested: ['css.inline-block']
		},
		{
			id: 'cp-3',
			description: 'Replace max-width with max-inline-size',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'max-inline-size' }
					]
				}
			},
			hints: [
				'`max-width` has a logical equivalent: `max-inline-size`.',
				'Replace `max-width: 65ch` with `max-inline-size: 65ch`.',
				'Update `.container` to use: `max-inline-size: 65ch;`'
			],
			conceptsTested: ['css.logical-properties']
		}
	]
};
