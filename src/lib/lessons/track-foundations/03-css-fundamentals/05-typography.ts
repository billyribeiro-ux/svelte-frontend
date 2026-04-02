import type { Lesson } from '$types/lesson';

export const typography: Lesson = {
	id: 'foundations.css-fundamentals.typography',
	slug: 'typography',
	title: 'Typography',
	description: 'Master font properties, text styling, @font-face, and variable fonts for beautiful, readable text.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 5,
	estimatedMinutes: 18,
	concepts: ['css.font-properties', 'css.text-properties', 'css.variable-fonts'],
	prerequisites: ['foundations.css-fundamentals.colors-and-backgrounds'],

	content: [
		{
			type: 'text',
			content: `# Typography

Typography is not decoration — it is the primary interface of the web. Over 90% of web content is text. The choices you make about typeface, size, line height, and spacing directly determine whether people can read your content comfortably, skim it efficiently, and stay engaged. CSS gives you deep control over text rendering, but that control is only useful if you understand the principles behind it.

## The Font Stack — Choosing Typefaces

A \`font-family\` declaration is a prioritized list of typefaces. The browser tries each one in order, falling back to the next if a font is unavailable:

\`\`\`css
font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
\`\`\`

### System Font Stacks

System font stacks use the operating system's native UI typeface. They load instantly (no network request), feel native to the platform, and are highly legible at small sizes:

\`\`\`css
/* Modern system font stack */
font-family: system-ui, -apple-system, BlinkMacSystemFont,
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Monospace system stack */
font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro',
             Menlo, Consolas, 'DejaVu Sans Mono', monospace;
\`\`\`

The \`system-ui\` keyword is now well-supported and resolves to San Francisco on Apple, Segoe UI on Windows, and Roboto on Android. For most applications, \`font-family: system-ui, sans-serif\` is a strong default.

### Web Fonts and @font-face

When you need a specific typeface, \`@font-face\` loads it from a file:

\`\`\`css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2');
  font-weight: 100 900;           /* Weight range for variable fonts */
  font-display: swap;             /* Controls loading behavior */
  unicode-range: U+0000-00FF;     /* Only load Latin characters */
}
\`\`\`

The \`format('woff2')\` hint tells the browser the file format. WOFF2 is the only format you need for modern browsers — it has the best compression and universal support.`
		},
		{
			type: 'concept-callout',
			content: 'css.font-properties'
		},
		{
			type: 'text',
			content: `## Font Loading — FOIT, FOUT, and font-display

When a web font is loading, the browser faces a dilemma: show text in a fallback font (causing a visual shift when the web font arrives) or show nothing until the font loads (hiding content). These two behaviors have names:

- **FOIT (Flash of Invisible Text)** — Text is hidden until the web font loads. If loading is slow, users see a blank page. This is the browser default.
- **FOUT (Flash of Unstyled Text)** — Text is shown immediately in a fallback font, then swapped to the web font when it arrives. Users see content sooner but experience a visual shift.

The \`font-display\` property controls this behavior:

| Value | Behavior |
|-------|----------|
| \`auto\` | Browser decides (usually FOIT) |
| \`block\` | FOIT — invisible for up to 3s, then fallback |
| \`swap\` | FOUT — fallback immediately, swap when loaded |
| \`fallback\` | Short FOIT (~100ms), then fallback. Small swap window. |
| \`optional\` | Short FOIT (~100ms), then fallback. Font only used if already cached. |

**Recommended approach:**

- Use \`font-display: swap\` for body text — content should be readable immediately.
- Use \`font-display: optional\` for decorative or non-critical fonts — if they are not cached, the fallback is fine.
- Preload critical fonts to minimize both FOIT and FOUT:

\`\`\`html
<link rel="preload" href="/fonts/inter-variable.woff2"
      as="font" type="font/woff2" crossorigin>
\`\`\`

### Reducing Layout Shift From Font Swaps

When a web font replaces a fallback, the different metrics (character width, line height, ascenders) cause text to reflow. The \`size-adjust\` and \`ascent-override\` descriptors in \`@font-face\` let you tune the fallback to closely match the web font's metrics:

\`\`\`css
@font-face {
  font-family: 'Inter Fallback';
  src: local('Arial');
  size-adjust: 107%;
  ascent-override: 90%;
  descent-override: 22%;
  line-gap-override: 0%;
}

body {
  font-family: 'Inter', 'Inter Fallback', sans-serif;
}
\`\`\`

## Font Properties

Look at the starter code. The text uses browser defaults.

**Task:** Set the body font to \`system-ui, sans-serif\` on the \`.prose\` container and the heading \`font-weight\` to \`700\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Text Properties — Readability Engineering

### Line Height (Leading)

\`line-height\` controls the vertical space between lines. It is the single most impactful readability setting:

\`\`\`css
/* Unitless values are preferred — they multiply by the element's font-size */
line-height: 1.6;    /* Body text — generous spacing for reading comfort */
line-height: 1.2;    /* Headings — tighter because large text needs less spacing */
line-height: 1;      /* Display text — very large type can be set solid */
\`\`\`

Why unitless? A \`line-height: 1.6\` inherits as a multiplier. If the parent has \`line-height: 1.6\` and \`font-size: 16px\` (computed: 25.6px), a child with \`font-size: 24px\` gets \`line-height: 38.4px\` (24 * 1.6). If you had used \`line-height: 25.6px\` instead, the child would inherit that fixed value — too tight for 24px text.

### Letter Spacing (Tracking)

\`\`\`css
letter-spacing: -0.02em;   /* Tighten headings — large text has too much air */
letter-spacing: 0.05em;    /* Widen small caps or uppercase text */
letter-spacing: normal;    /* Reset to default */
\`\`\`

Use \`em\` units for letter-spacing so the adjustment scales with font size.

### Text Wrapping

\`\`\`css
text-wrap: balance;   /* Distribute text evenly across lines — great for headings */
text-wrap: pretty;    /* Avoid orphans (single words on the last line) */
\`\`\`

\`text-wrap: balance\` is a game-changer for headings. Instead of one long line followed by one short line, the browser distributes words more evenly. Performance note: \`balance\` is limited to ~6 lines of text by most browsers.

### Other Text Properties

\`\`\`css
text-align: start;         /* Logical equivalent of 'left' in LTR */
text-transform: uppercase; /* Visual case — does not change the HTML */
text-indent: 1em;          /* Indent first line of a paragraph */
word-break: break-word;    /* Break long words to prevent overflow */
hyphens: auto;             /* Add hyphens at break points (needs lang attribute) */
\`\`\`

**Task:** Set \`line-height: 1.6\` on the paragraph and \`letter-spacing: -0.02em\` on the heading.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how line-height affects the spacing between text lines. Notice the difference between the heading and paragraph line heights.'
		},
		{
			type: 'text',
			content: `## Variable Fonts — One File, Infinite Styles

Traditional fonts require a separate file for each weight and style combination: Regular, Bold, Italic, Bold Italic — that is 4 files minimum, often 8-12 for a full family. Each file is a network request and adds to page weight.

**Variable fonts** contain a continuous range of styles in a single file. Instead of discrete weights like 400 and 700, you can use *any* value: 450, 523, 680.

### Variable Font Axes

Variable fonts define one or more axes of variation:

| Axis | Tag | Standard range | Property |
|------|-----|----------------|----------|
| Weight | \`wght\` | 100-900 | \`font-weight\` |
| Width | \`wdth\` | 75-125 | \`font-stretch\` |
| Slant | \`slnt\` | -90 to 90 | \`font-style: oblique Xdeg\` |
| Italic | \`ital\` | 0 or 1 | \`font-style\` |
| Optical size | \`opsz\` | varies | \`font-optical-sizing\` |

\`\`\`css
/* Using standard properties (preferred — browsers optimize these) */
font-weight: 450;
font-stretch: 87%;

/* Using font-variation-settings (for custom axes) */
font-variation-settings: 'wght' 450, 'wdth' 87;

/* Custom axes are font-specific — e.g., Recursive has 'CASL' for casualness */
font-variation-settings: 'CASL' 0.5;
\`\`\`

### Performance Benefits

A single variable font file (Inter Variable is ~300KB in WOFF2) replaces what might be 6-8 static font files (120KB each = 720KB-960KB). You also gain the ability to animate font properties smoothly — try animating \`font-weight\` on hover for a subtle interaction effect.

## Type Scale Theory

A **type scale** is a set of font sizes derived from a consistent ratio. Rather than picking sizes arbitrarily (14px, 18px, 22px, 36px), you multiply a base size by a ratio repeatedly:

\`\`\`
Base: 1rem (16px)
Ratio: 1.25 (Major Third)

Step 0:  1rem      = 16px    (body)
Step 1:  1.25rem   = 20px    (h4)
Step 2:  1.563rem  = 25px    (h3)
Step 3:  1.953rem  = 31.25px (h2)
Step 4:  2.441rem  = 39px    (h1)
\`\`\`

Common ratios:
| Name | Ratio | Feel |
|------|-------|------|
| Minor Second | 1.067 | Very tight — mobile-friendly |
| Major Second | 1.125 | Subtle hierarchy |
| Minor Third | 1.2 | Balanced — good default |
| Major Third | 1.25 | Clear hierarchy |
| Perfect Fourth | 1.333 | Strong hierarchy — good for editorial |
| Golden Ratio | 1.618 | Dramatic — use sparingly |

Implement a type scale with CSS custom properties:

\`\`\`css
:root {
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --step-1: clamp(1.2rem, 1.1rem + 0.5vw, 1.406rem);
  --step-2: clamp(1.44rem, 1.28rem + 0.8vw, 1.758rem);
  --step-3: clamp(1.728rem, 1.48rem + 1.24vw, 2.197rem);
  --step-4: clamp(2.074rem, 1.7rem + 1.87vw, 2.747rem);
}
\`\`\`

Using \`clamp()\` makes the type scale fluid — sizes scale smoothly between a mobile minimum and a desktop maximum (more on this in the Units lesson).

**Task:** Add \`text-wrap: balance\` to the heading to create visually balanced line breaks.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Typography Checklist

When setting up typography for a project, work through these settings in order:

1. **Font stack** — Choose a system font or load a web font with \`font-display: swap\`
2. **Base size** — Usually \`1rem\` (16px). Do not set \`font-size\` on \`html\` to a pixel value — this breaks user preferences
3. **Type scale** — Derive heading sizes from a consistent ratio
4. **Body line-height** — 1.5-1.7 for readability
5. **Heading line-height** — 1.1-1.3 (large text needs less)
6. **Heading letter-spacing** — Slightly negative (-0.01em to -0.03em)
7. **Measure (line length)** — Limit paragraphs to 45-75 characters with \`max-width: 65ch\`
8. **Text wrapping** — \`text-wrap: balance\` for headings, \`text-wrap: pretty\` for body
9. **Color contrast** — Meet WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)
10. **Responsive sizing** — Use \`clamp()\` for fluid typography that adapts to viewport width`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let heading = $state('The Art of Typography');
</script>

<article class="prose">
  <h1>{heading}</h1>
  <p>Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. Good typography enhances the reading experience.</p>
  <p>The right combination of font size, line height, and letter spacing creates a comfortable reading rhythm that keeps readers engaged.</p>
</article>

<style>
  .prose {
    max-width: 65ch;
    padding: 2rem;
  }

  /* TODO: Add font, text, and typography styles */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let heading = $state('The Art of Typography');
</script>

<article class="prose">
  <h1>{heading}</h1>
  <p>Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. Good typography enhances the reading experience.</p>
  <p>The right combination of font size, line height, and letter spacing creates a comfortable reading rhythm that keeps readers engaged.</p>
</article>

<style>
  .prose {
    max-width: 65ch;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  h1 {
    font-weight: 700;
    letter-spacing: -0.02em;
    text-wrap: balance;
    color: var(--sf-accent, #6366f1);
  }

  p {
    line-height: 1.6;
    color: #334155;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Set the font family and heading font weight',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'font-family' },
						{ type: 'contains', value: 'font-weight: 700' }
					]
				}
			},
			hints: [
				'`font-family` sets the typeface — always include a fallback stack.',
				'Set `font-family: system-ui, sans-serif` on `.prose` and `font-weight: 700` on `h1`.',
				'Add to `.prose`: `font-family: system-ui, sans-serif;` and add `h1 { font-weight: 700; }`'
			],
			conceptsTested: ['css.font-properties']
		},
		{
			id: 'cp-2',
			description: 'Set line-height on paragraphs and letter-spacing on the heading',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'line-height: 1.6' },
						{ type: 'contains', value: 'letter-spacing' }
					]
				}
			},
			hints: [
				'`line-height` controls the vertical space between lines of text.',
				'Set `line-height: 1.6` on `p` and `letter-spacing: -0.02em` on `h1`.',
				'Add: `p { line-height: 1.6; }` and update `h1` with `letter-spacing: -0.02em;`'
			],
			conceptsTested: ['css.text-properties']
		},
		{
			id: 'cp-3',
			description: 'Add text-wrap: balance to the heading',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'text-wrap: balance' }
					]
				}
			},
			hints: [
				'`text-wrap: balance` distributes text evenly across lines.',
				'Add it to the `h1` rule.',
				'Update `h1` to include: `text-wrap: balance;`'
			],
			conceptsTested: ['css.text-properties']
		}
	]
};
