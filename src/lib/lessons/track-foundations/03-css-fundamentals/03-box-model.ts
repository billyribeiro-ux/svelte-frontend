import type { Lesson } from '$types/lesson';

export const boxModel: Lesson = {
	id: 'foundations.css-fundamentals.box-model',
	slug: 'box-model',
	title: 'The Box Model',
	description: 'Learn how content, padding, border, and margin work together — and why box-sizing changes everything.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 3,
	estimatedMinutes: 18,
	concepts: ['css.box-model', 'css.box-sizing', 'css.margin'],
	prerequisites: ['foundations.css-fundamentals.selectors'],

	content: [
		{
			type: 'text',
			content: `# The Box Model

Every element in CSS generates a rectangular box. The **box model** defines how the dimensions of that box are calculated and how it interacts with surrounding boxes. If you can internalize the box model, layout stops being mysterious.

## The Four Layers

Every CSS box consists of four nested rectangles, from inside out:

1. **Content** — The actual text, image, or child elements. Sized by \`width\` and \`height\` (or intrinsic size).
2. **Padding** — Transparent space between the content edge and the border. The background color/image extends through padding.
3. **Border** — A visible (or invisible) edge around the padding. Has its own width, style, and color.
4. **Margin** — Transparent space outside the border. Margins are always transparent — they never show background.

\`\`\`
┌─────────────────── margin ───────────────────┐
│  ┌────────────── border ──────────────────┐   │
│  │  ┌────────── padding ───────────────┐  │   │
│  │  │  ┌────── content ─────────────┐  │  │   │
│  │  │  │                            │  │  │   │
│  │  │  │   width x height           │  │  │   │
│  │  │  └────────────────────────────┘  │  │   │
│  │  └──────────────────────────────────┘  │   │
│  └────────────────────────────────────────┘   │
└───────────────────────────────────────────────┘
\`\`\`

Understanding which layer you are working with matters because background colors paint through content and padding but stop at the border edge. Margins are always transparent — you cannot give a margin a background color.`
		},
		{
			type: 'concept-callout',
			content: 'css.box-model'
		},
		{
			type: 'text',
			content: `## Content and Padding

**Padding** adds breathing room between the content and the border. It can be set per-side or with shorthand notation:

\`\`\`css
/* Shorthand — all sides */
padding: 1.5rem;

/* Shorthand — vertical | horizontal */
padding: 1rem 2rem;

/* Shorthand — top | right | bottom | left (clockwise) */
padding: 1rem 2rem 1.5rem 2rem;

/* Individual sides */
padding-top: 1rem;
padding-right: 2rem;
padding-bottom: 1.5rem;
padding-left: 2rem;
\`\`\`

### Logical Properties for Padding

Physical properties (\`padding-top\`, \`padding-left\`) assume a left-to-right, top-to-bottom writing direction. **Logical properties** adapt to any writing mode — essential for internationalization:

\`\`\`css
/* Block = vertical axis in LTR/horizontal writing */
padding-block-start: 1rem;   /* = padding-top in LTR */
padding-block-end: 1rem;     /* = padding-bottom in LTR */
padding-block: 1rem;         /* shorthand for both */

/* Inline = horizontal axis in LTR/horizontal writing */
padding-inline-start: 2rem;  /* = padding-left in LTR */
padding-inline-end: 2rem;    /* = padding-right in LTR */
padding-inline: 2rem;        /* shorthand for both */
\`\`\`

In a right-to-left language (Arabic, Hebrew), \`padding-inline-start\` resolves to \`padding-right\` instead of \`padding-left\`. The same CSS works correctly in both directions.

Look at the starter code. The card has no padding and feels cramped.

**Task:** Add \`padding: 1.5rem\` to the card and \`padding-block: 0.5rem\` to the heading.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Box Sizing — Why border-box Changes Everything

By default, CSS uses \`content-box\` sizing. This means \`width\` and \`height\` only apply to the **content** area. Padding and border are added *on top*:

\`\`\`css
.card {
  width: 300px;
  padding: 20px;
  border: 2px solid gray;
  /* Total rendered width: 300 + 20 + 20 + 2 + 2 = 344px */
}
\`\`\`

This is counter-intuitive. When you say "this card is 300px wide," you mean the whole thing — not just the content area. \`border-box\` fixes this:

\`\`\`css
.card {
  box-sizing: border-box;
  width: 300px;
  padding: 20px;
  border: 2px solid gray;
  /* Total rendered width: 300px (content shrinks to 256px) */
}
\`\`\`

### Why border-box Should Be Your Default

The \`content-box\` model made sense in the early web when CSS was primarily used for document styling. But in application layouts where you set explicit widths (grid columns, sidebars, form inputs), \`content-box\` creates constant arithmetic headaches. Every time you adjust padding or border, the total width changes.

The universal reset has become a best practice:

\`\`\`css
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

This targets all elements and their pseudo-elements. The reason we use the universal selector instead of setting it on \`html\` and relying on inheritance is that \`box-sizing\` is **not inherited** — you must set it explicitly on each element.

An alternative inheritance-based approach:

\`\`\`css
html { box-sizing: border-box; }
*, *::before, *::after { box-sizing: inherit; }
\`\`\`

This version lets you opt specific subtrees back to \`content-box\` by changing the parent. In practice, the simpler version is used more often because opting back to \`content-box\` is extremely rare.

**Task:** Add a border to the card (\`border: 2px solid #e2e8f0\`) and set \`box-sizing: border-box\` so the total width stays at \`300px\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how padding, border, and margin are visualized around each element. Compare what happens with `content-box` vs `border-box`.'
		},
		{
			type: 'text',
			content: `## Margin — External Spacing and Collapse

Margin creates space **outside** the border, pushing other elements away. Unlike padding, margins have a unique behavior: **margin collapse**.

### Margin Collapse Rules

Vertical (block-direction) margins between adjacent elements do not add — they **collapse** to the larger of the two values:

\`\`\`css
.heading { margin-bottom: 2rem; }
.paragraph { margin-top: 1rem; }
/* Space between them: 2rem (not 3rem) — the larger margin wins */
\`\`\`

The complete margin collapse rules:

1. **Adjacent siblings** — Top margin of the second element collapses with the bottom margin of the first. The resulting margin is the **maximum** of the two.

2. **Parent and first/last child** — If there is no border, padding, or inline content separating a parent's margin from its child's margin, they collapse. A parent with \`margin-top: 2rem\` and a first child with \`margin-top: 1rem\` produces a single 2rem margin above the parent.

3. **Empty blocks** — An element with no height, no border, no padding, and no content collapses its own top and bottom margins into a single margin.

4. **Negative margins** — When one margin is negative, it is added to the positive margin (e.g., \`2rem + (-1rem) = 1rem\`). When both are negative, the larger absolute value wins.

**Margins never collapse in these contexts:**
- Flex items (\`display: flex\`)
- Grid items (\`display: grid\`)
- Elements with \`overflow\` other than \`visible\`
- Floating elements
- Absolutely positioned elements

This is one reason why flexbox and grid feel more predictable — they disable margin collapse entirely.

### Logical Properties for Margin

Just like padding, margin has logical property equivalents:

\`\`\`css
margin-block-start: 1rem;   /* margin-top in LTR horizontal */
margin-block-end: 1rem;     /* margin-bottom in LTR horizontal */
margin-inline-start: 2rem;  /* margin-left in LTR */
margin-inline-end: 2rem;    /* margin-right in LTR */
\`\`\`

### The Auto Margin Trick

\`margin-inline: auto\` (or the traditional \`margin: 0 auto\`) centers a block-level element horizontally within its parent. This works because \`auto\` distributes the remaining space equally on both sides. In flexbox, \`margin-left: auto\` pushes an item to the right by consuming all available space on its left.

**Task:** Add \`margin-block-end: 1rem\` to the card paragraphs for consistent vertical spacing.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## The Full Picture — Logical Properties Mapping

Logical properties are the future of CSS layout. Here is the complete mapping for a horizontal left-to-right writing mode:

| Physical | Logical | Shorthand |
|----------|---------|-----------|
| \`top\` | \`block-start\` | — |
| \`bottom\` | \`block-end\` | — |
| \`left\` | \`inline-start\` | — |
| \`right\` | \`inline-end\` | — |
| \`width\` | \`inline-size\` | — |
| \`height\` | \`block-size\` | — |
| \`padding-top\` + \`padding-bottom\` | — | \`padding-block\` |
| \`padding-left\` + \`padding-right\` | — | \`padding-inline\` |
| \`margin-top\` + \`margin-bottom\` | — | \`margin-block\` |
| \`margin-left\` + \`margin-right\` | — | \`margin-inline\` |
| \`border-radius: top-left\` | \`border-start-start-radius\` | — |

You do not need to switch to logical properties everywhere overnight. A practical approach: use logical properties for margin and padding (where writing-direction matters most), and continue using physical properties for layout values like \`width\` where the physical dimension is truly what you mean.

## Debugging the Box Model

In browser DevTools, every element has a box model diagram that shows content, padding, border, and margin dimensions. Key things to check:

1. **Unexpected width?** Check if \`box-sizing\` is \`content-box\` — padding and border may be adding to your declared width.
2. **Unexpected spacing?** Check for margin collapse — two adjacent margins may be collapsing to one.
3. **Element wider than parent?** Check if padding or border is pushing the element beyond its container. \`border-box\` prevents this.
4. **Mysterious gap above an element?** The first child's margin may be collapsing through the parent. Add \`padding-top: 1px\` or \`overflow: hidden\` to the parent to create a new block formatting context.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let cardTitle = $state('Box Model Demo');
</script>

<div class="card" style="width: 300px;">
  <h3>{cardTitle}</h3>
  <p>Content sits inside the box.</p>
  <p>Padding adds breathing room.</p>
  <p>Borders define the edge.</p>
</div>

<style>
  .card {
    background: #f8fafc;
    border-radius: 0.5rem;
    font-family: system-ui, sans-serif;
  }

  h3 {
    margin: 0;
    color: var(--sf-accent, #6366f1);
  }

  /* TODO: Add padding, border, box-sizing, and margin rules */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let cardTitle = $state('Box Model Demo');
</script>

<div class="card" style="width: 300px;">
  <h3>{cardTitle}</h3>
  <p>Content sits inside the box.</p>
  <p>Padding adds breathing room.</p>
  <p>Borders define the edge.</p>
</div>

<style>
  .card {
    background: #f8fafc;
    border-radius: 0.5rem;
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    border: 2px solid #e2e8f0;
    box-sizing: border-box;
  }

  h3 {
    margin: 0;
    padding-block: 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  p {
    margin-block-end: 1rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add padding to the card and heading',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'padding: 1.5rem' },
						{ type: 'contains', value: 'padding-block' }
					]
				}
			},
			hints: [
				'Padding creates space between the content and the border.',
				'Add `padding: 1.5rem` to `.card` and `padding-block: 0.5rem` to `h3`.',
				'Update the `.card` rule to include `padding: 1.5rem;` and the `h3` rule to include `padding-block: 0.5rem;`.'
			],
			conceptsTested: ['css.box-model']
		},
		{
			id: 'cp-2',
			description: 'Add a border and set box-sizing to border-box on the card',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'border:' },
						{ type: 'contains', value: 'box-sizing: border-box' }
					]
				}
			},
			hints: [
				'With `content-box`, adding a border increases the total width beyond 300px.',
				'`box-sizing: border-box` includes padding and border in the declared width.',
				'Add to `.card`: `border: 2px solid #e2e8f0; box-sizing: border-box;`'
			],
			conceptsTested: ['css.box-sizing']
		},
		{
			id: 'cp-3',
			description: 'Add vertical margin to paragraphs for spacing',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'margin-block-end' }
					]
				}
			},
			hints: [
				'`margin-block-end` adds space below the element in block flow.',
				'Target `p` elements and set `margin-block-end: 1rem`.',
				'Add: `p { margin-block-end: 1rem; }`'
			],
			conceptsTested: ['css.margin']
		}
	]
};
