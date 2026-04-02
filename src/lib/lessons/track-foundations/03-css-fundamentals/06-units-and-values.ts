import type { Lesson } from '$types/lesson';

export const unitsAndValues: Lesson = {
	id: 'foundations.css-fundamentals.units-and-values',
	slug: 'units-and-values',
	title: 'Units and Values',
	description: 'Understand px, rem, em, percentages, viewport units, and the clamp() function for responsive sizing.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 6,
	estimatedMinutes: 18,
	concepts: ['css.units', 'css.relative-units', 'css.clamp'],
	prerequisites: ['foundations.css-fundamentals.typography'],

	content: [
		{
			type: 'text',
			content: `# Units and Values

Every CSS property that accepts a length, size, or spacing value requires a **unit**. Choosing the right unit is not a style preference — it directly affects accessibility, responsiveness, and maintainability. The wrong unit choice can break your layout on different screen sizes or prevent users who adjust their browser font size from reading your content.

## Absolute vs Relative Units

**Absolute units** have a fixed size regardless of context:
- \`px\` — 1/96th of an inch (in practice, one device pixel at standard density)
- \`cm\`, \`mm\`, \`in\`, \`pt\`, \`pc\` — Print-oriented units, rarely used on screen

**Relative units** scale based on some reference value:
- \`rem\` — Relative to the root (\`<html>\`) font size
- \`em\` — Relative to the element's own (or parent's) font size
- \`%\` — Relative to the parent's dimension
- \`vw\`, \`vh\` — Relative to viewport width/height
- \`dvh\`, \`svh\`, \`lvh\` — Dynamic, small, and large viewport heights
- \`ch\` — Width of the "0" character in the current font
- \`cqi\`, \`cqb\` — Container query inline/block units

Relative units are the foundation of responsive design. They respond to user preferences, viewport changes, and container sizes without media queries.`
		},
		{
			type: 'concept-callout',
			content: 'css.units'
		},
		{
			type: 'text',
			content: `## rem vs em — The Decision Framework

Both \`rem\` and \`em\` are relative to font size, but they reference different things, and this difference has profound practical implications.

### rem — Predictable Global Reference

\`rem\` always refers to the root \`<html>\` element's font size. The browser default is 16px (unless the user has changed it in their settings).

\`\`\`css
html { font-size: 16px; }   /* Default — do NOT set this explicitly */

.heading { font-size: 2rem; }      /* Always 32px regardless of nesting */
.sidebar .heading { font-size: 2rem; }  /* Still 32px — rem doesn't compound */
\`\`\`

**rem is predictable.** No matter how deeply nested an element is, \`1rem\` is always the same computed value. This makes rem ideal for:
- Font sizes
- Spacing and layout values (padding, margin, gap)
- Any value that should be consistent across the entire page

### em — Context-Sensitive Compounding

\`em\` refers to the element's **own computed font size** (for non-font-size properties) or the **parent's computed font size** (for the \`font-size\` property itself). This means \`em\` values compound through nesting:

\`\`\`css
html { font-size: 16px; }
.parent { font-size: 1.5em; }    /* 24px (16 * 1.5) */
.child { font-size: 1.5em; }     /* 36px (24 * 1.5) — compounding! */
.grandchild { font-size: 1.5em; } /* 54px (36 * 1.5) — keeps growing */
\`\`\`

This compounding is a trap in deeply nested structures. But \`em\` has a legitimate use case: **component-relative sizing**. When padding, margin, or border-radius should scale proportionally with the element's font size:

\`\`\`css
.button {
  font-size: 1rem;
  padding: 0.5em 1em;        /* Scales with font size */
  border-radius: 0.25em;     /* Rounds proportionally */
}

.button.large {
  font-size: 1.25rem;
  /* padding and border-radius automatically scale up — no changes needed */
}
\`\`\`

### The Decision

| Use case | Unit | Why |
|----------|------|-----|
| Font sizes | \`rem\` | Predictable, no compounding |
| Global spacing (page padding, section gaps) | \`rem\` | Consistent regardless of context |
| Component-internal spacing | \`em\` | Scales with the component's font size |
| Media query breakpoints | \`em\` | Responds to user font-size preferences |
| Border, outline widths | \`px\` | Should not scale with text |
| Line widths, shadows | \`px\` | Visual details, not text-related |

Look at the starter code. Everything uses \`px\`.

**Task:** Convert the heading font size to \`rem\` (32px / 16 = \`2rem\`) and the padding to \`rem\` (20px / 16 = \`1.25rem\`).`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Viewport Units — Sizing to the Window

Viewport units express lengths as a fraction of the browser window:

\`\`\`css
width: 100vw;      /* 100% of viewport width */
height: 100vh;     /* 100% of viewport height */
font-size: 5vw;    /* 5% of viewport width */
\`\`\`

### The Mobile Viewport Problem

On mobile browsers, the address bar and bottom navigation appear and disappear as the user scrolls. The original \`vh\` unit was defined as the viewport height *with* the browser UI visible. But on some mobile browsers, \`100vh\` is actually taller than the visible area, causing content to be hidden behind the browser chrome.

CSS introduced three viewport height variants to solve this:

| Unit | Meaning | Use case |
|------|---------|----------|
| \`svh\` | **Small** viewport height — always the smallest possible viewport (browser UI visible) | Safe for elements that must never overflow |
| \`lvh\` | **Large** viewport height — the largest possible viewport (browser UI hidden) | Full-screen backgrounds |
| \`dvh\` | **Dynamic** viewport height — updates as browser UI appears/disappears | Hero sections, full-screen layouts |

\`\`\`css
/* Safe full-height layout on mobile */
.hero {
  min-height: 100dvh;   /* Dynamic — adapts to browser chrome */
}

/* Fallback for older browsers */
.hero {
  min-height: 100vh;    /* Fallback */
  min-height: 100dvh;   /* Override if supported */
}
\`\`\`

**Task:** Set the container \`min-height\` to \`50vh\` so it takes at least half the viewport height.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and resize the viewport. Observe how viewport units respond to window size changes while rem values stay fixed relative to the root font size.'
		},
		{
			type: 'text',
			content: `## Fluid Typography with clamp()

The \`clamp()\` function creates a value that scales fluidly between a minimum and maximum:

\`\`\`css
clamp(minimum, preferred, maximum)
\`\`\`

The browser computes the \`preferred\` value and then clamps it — if the result is below the minimum, the minimum is used; if above the maximum, the maximum is used.

### Why clamp() Replaces Media Queries for Font Sizing

Traditional responsive typography uses media queries:

\`\`\`css
/* Before clamp() — discrete jumps */
h1 { font-size: 1.5rem; }

@media (min-width: 768px) {
  h1 { font-size: 2rem; }
}

@media (min-width: 1200px) {
  h1 { font-size: 3rem; }
}
\`\`\`

This creates abrupt jumps at breakpoints. With \`clamp()\`, the size scales smoothly:

\`\`\`css
/* After clamp() — continuous scaling */
h1 {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
\`\`\`

At a narrow viewport, the font is \`1.5rem\`. As the viewport widens, \`4vw\` grows until it hits the \`3rem\` cap. The transition is seamless.

### The Math Behind Fluid Typography

The \`preferred\` value in \`clamp()\` is typically a combination of a fixed value and a viewport-relative value:

\`\`\`css
/* Precise formula for scaling between two breakpoints */
font-size: clamp(
  1.5rem,                              /* min at 320px viewport */
  1.0909rem + 1.0909vw,              /* fluid middle */
  3rem                                 /* max at 1200px viewport */
);
\`\`\`

The formula for the preferred value:
\`\`\`
preferred = min_size + (max_size - min_size) * (100vw - min_viewport) / (max_viewport - min_viewport)
\`\`\`

In practice, you do not need to calculate this by hand. Tools like Utopia (utopia.fyi) generate fluid type scales. But understanding the formula helps you debug unexpected behavior.

### clamp() Beyond Typography

\`clamp()\` works for any length value:

\`\`\`css
/* Fluid padding */
padding: clamp(1rem, 3vw, 3rem);

/* Fluid width */
width: clamp(300px, 50%, 800px);

/* Fluid gap */
gap: clamp(1rem, 2vw, 2rem);
\`\`\`

**Task:** Set the heading font size to \`clamp(1.5rem, 4vw, 3rem)\` for fluid typography.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Container Query Units — Sizing to the Parent

Viewport units size relative to the browser window. But what if your component lives inside a sidebar that is only 300px wide? \`5vw\` would be relative to the full viewport, not the sidebar.

**Container query units** solve this by sizing relative to a containing element:

\`\`\`css
/* Define a container */
.sidebar {
  container-type: inline-size;
  container-name: sidebar;
}

/* Use container units inside it */
.sidebar .card {
  font-size: clamp(0.875rem, 3cqi, 1.25rem);
  padding: 2cqi;
}
\`\`\`

| Unit | Meaning |
|------|---------|
| \`cqi\` | 1% of the container's inline size (width in horizontal writing) |
| \`cqb\` | 1% of the container's block size (height in horizontal writing) |
| \`cqmin\` | The smaller of \`cqi\` and \`cqb\` |
| \`cqmax\` | The larger of \`cqi\` and \`cqb\` |

Container units make truly reusable components possible — a card component sizes its text based on its own container width, not the viewport. This is component-driven design rather than viewport-driven design.

## The ch Unit and Line Length

The \`ch\` unit equals the width of the "0" character in the current font. It is imprecise for variable-width fonts (the "0" is often wider than average characters), but it is useful for controlling **line length** (measure):

\`\`\`css
.prose {
  max-width: 65ch;   /* Approximately 65 characters per line */
}
\`\`\`

The ideal line length for reading comfort is 45-75 characters. The \`ch\` unit expresses this intent directly, and it scales with font size — if the user increases text size, the container widens proportionally.

## Percentage Units — Context Matters

The meaning of \`%\` depends on the property:

| Property | \`%\` is relative to... |
|----------|-------------------------|
| \`width\` | Parent's content width |
| \`height\` | Parent's content height (parent must have explicit height) |
| \`padding\` | **Parent's width** (even for \`padding-top\`/\`padding-bottom\`) |
| \`margin\` | **Parent's width** (even for \`margin-top\`/\`margin-bottom\`) |
| \`font-size\` | Parent's font size |
| \`line-height\` | Element's own font size |
| \`transform: translate\` | Element's own dimensions |

The padding/margin quirk is often used to create aspect-ratio boxes (before the \`aspect-ratio\` property existed): \`padding-top: 56.25%\` creates a 16:9 ratio because the percentage is relative to the width.

## Unit Selection Quick Reference

| What you are sizing | Recommended unit |
|---------------------|------------------|
| Font sizes | \`rem\` or \`clamp(rem, vw, rem)\` |
| Spacing (padding, margin, gap) | \`rem\` |
| Component-internal spacing | \`em\` |
| Layout widths | \`%\`, \`fr\`, or \`clamp(px, %, px)\` |
| Line length | \`ch\` |
| Full-viewport sections | \`dvh\` with \`vh\` fallback |
| Borders, outlines | \`px\` |
| Media query breakpoints | \`em\` |
| Container-relative sizing | \`cqi\` |`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('Units & Values');
</script>

<div class="container">
  <h1>{title}</h1>
  <p>Understanding CSS units helps you build responsive layouts that work across all devices.</p>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 20px;
  }

  h1 {
    font-size: 32px;
    color: var(--sf-accent, #6366f1);
  }

  p {
    font-size: 16px;
    line-height: 1.6;
    color: #334155;
  }

  /* TODO: Convert to rem, add viewport units, and use clamp() */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('Units & Values');
</script>

<div class="container">
  <h1>{title}</h1>
  <p>Understanding CSS units helps you build responsive layouts that work across all devices.</p>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1.25rem;
    min-height: 50vh;
  }

  h1 {
    font-size: clamp(1.5rem, 4vw, 3rem);
    color: var(--sf-accent, #6366f1);
  }

  p {
    font-size: 1rem;
    line-height: 1.6;
    color: #334155;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Convert pixel values to rem units',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'font-size:\\s*[\\d.]+rem' },
						{ type: 'regex', value: 'padding:\\s*[\\d.]+rem' }
					]
				}
			},
			hints: [
				'Divide pixel values by 16 to convert to rem: 32px = 2rem, 20px = 1.25rem.',
				'Change the heading `font-size` to `2rem` and the container `padding` to `1.25rem`.',
				'Update: `h1 { font-size: 2rem; }` and `.container { padding: 1.25rem; }`'
			],
			conceptsTested: ['css.relative-units']
		},
		{
			id: 'cp-2',
			description: 'Set the container min-height using viewport units',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'min-height:\\s*50vh' }
					]
				}
			},
			hints: [
				'Viewport units are relative to the browser window size.',
				'Add `min-height: 50vh` to the `.container` rule.',
				'Update `.container` to include: `min-height: 50vh;`'
			],
			conceptsTested: ['css.units']
		},
		{
			id: 'cp-3',
			description: 'Use clamp() for fluid heading typography',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'clamp(' }
					]
				}
			},
			hints: [
				'`clamp(min, preferred, max)` creates a value that scales between bounds.',
				'Set the heading `font-size` to `clamp(1.5rem, 4vw, 3rem)`.',
				'Update `h1` to: `font-size: clamp(1.5rem, 4vw, 3rem);`'
			],
			conceptsTested: ['css.clamp']
		}
	]
};
