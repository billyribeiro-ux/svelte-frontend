import type { Lesson } from '$types/lesson';

export const colorsAndBackgrounds: Lesson = {
	id: 'foundations.css-fundamentals.colors-and-backgrounds',
	slug: 'colors-and-backgrounds',
	title: 'Colors and Backgrounds',
	description: 'Explore modern color formats like OKLCH, gradients, and background properties for rich visual design.',
	trackId: 'foundations',
	moduleId: 'css-fundamentals',
	order: 4,
	estimatedMinutes: 18,
	concepts: ['css.colors', 'css.oklch', 'css.gradients'],
	prerequisites: ['foundations.css-fundamentals.box-model'],

	content: [
		{
			type: 'text',
			content: `# Colors and Backgrounds

Color in CSS has evolved dramatically. The original web had 16 named colors and hex codes. Today you have access to perceptually uniform color spaces, wide-gamut displays, and color mixing functions. Understanding *why* modern color formats exist — not just *how* to use them — lets you make deliberate choices about color in your applications.

## Color Formats — A Historical Progression

### Hex and Named Colors
\`\`\`css
color: #6366f1;          /* 6-digit hex: RR GG BB */
color: #6366f1cc;        /* 8-digit hex: RR GG BB AA (alpha) */
color: rebeccapurple;    /* Named color — one of 148 keywords */
\`\`\`

Hex is compact but opaque — \`#6366f1\` tells you nothing about the color's lightness or saturation at a glance. Named colors are readable but limited to a fixed palette.

### RGB — The Machine Color Space
\`\`\`css
color: rgb(99 102 241);          /* Modern syntax — space-separated */
color: rgb(99 102 241 / 0.8);   /* With alpha */
color: rgb(99, 102, 241);       /* Legacy comma syntax — still works */
\`\`\`

RGB maps directly to how screens produce color (red, green, blue subpixels). It is precise but unintuitive — can you tell what color \`rgb(99 102 241)\` is without seeing it? Adjusting "make this 20% lighter" requires changing all three channels.

### HSL — The First Human-Friendly Format
\`\`\`css
color: hsl(239 84% 67%);        /* Hue Saturation Lightness */
color: hsl(239 84% 67% / 0.8);  /* With alpha */
\`\`\`

HSL was a major improvement. **Hue** is an angle on the color wheel (0 = red, 120 = green, 240 = blue). **Saturation** is the color's intensity (0% = gray, 100% = vivid). **Lightness** is brightness (0% = black, 50% = pure color, 100% = white).

HSL makes "lighter" and "darker" trivial — just change the L value. But HSL has a fundamental problem: **perceptual non-uniformity**. An HSL yellow at 50% lightness looks much brighter to the human eye than an HSL blue at 50% lightness. This makes building consistent color palettes unreliable.`
		},
		{
			type: 'concept-callout',
			content: 'css.colors'
		},
		{
			type: 'text',
			content: `## OKLCH — The Modern Color Space

OKLCH fixes HSL's core problem. It is a **perceptually uniform** color space, meaning equal numerical changes produce equal perceived visual changes. A lightness of 0.7 looks equally bright regardless of hue.

\`\`\`css
color: oklch(0.7 0.15 250);
/*           L    C    H
   L: Lightness  — 0 (black) to 1 (white)
   C: Chroma     — 0 (gray) to ~0.4 (most vivid)
   H: Hue        — 0-360 degree angle
*/
\`\`\`

### Why OKLCH Beats HSL

**Perceptual uniformity:** In HSL, these two colors have the same L value but look radically different in perceived brightness:
\`\`\`css
hsl(60 100% 50%)   /* Yellow — appears very bright */
hsl(240 100% 50%)  /* Blue — appears very dark */
\`\`\`

In OKLCH, equal L values look equally bright:
\`\`\`css
oklch(0.7 0.15 90)   /* Yellow at L=0.7 */
oklch(0.7 0.15 265)  /* Blue at L=0.7 — same perceived brightness */
\`\`\`

**Predictable palette generation:** To create a 5-shade palette in OKLCH, keep chroma and hue constant and step lightness evenly:
\`\`\`css
--color-100: oklch(0.95 0.05 265);
--color-300: oklch(0.80 0.10 265);
--color-500: oklch(0.65 0.15 265);
--color-700: oklch(0.50 0.15 265);
--color-900: oklch(0.35 0.10 265);
\`\`\`

Each step looks like a uniform darkening to the human eye. Try the same approach with HSL and you will get uneven jumps, especially around yellow and blue hues.

## Color Gamut and Display P3

Standard sRGB covers about 35% of the colors the human eye can see. Modern displays (Apple Retina, many Android screens) support the **Display P3** gamut, which covers about 50%. OKLCH can express colors outside sRGB — when you push chroma high enough, you enter P3 territory.

\`\`\`css
/* sRGB-safe */
color: oklch(0.65 0.2 145);

/* P3 — more vivid green than sRGB can represent */
color: oklch(0.65 0.3 145);
\`\`\`

To use wide-gamut colors safely with a fallback:
\`\`\`css
.accent {
  color: oklch(0.65 0.2 145);                    /* sRGB fallback */
}

@media (color-gamut: p3) {
  .accent {
    color: oklch(0.65 0.3 145);                  /* P3 on capable displays */
  }
}
\`\`\`

Or use the \`color()\` function directly:
\`\`\`css
color: color(display-p3 0.2 0.8 0.3);           /* Direct P3 specification */
\`\`\`

Look at the starter code. The heading uses a hex color.

**Task:** Replace the heading color with an OKLCH value: \`oklch(0.55 0.2 265)\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Gradients — Smooth Color Transitions

CSS supports three gradient functions, each creating an \`<image>\` value that can be used anywhere \`background-image\` is accepted.

### Linear Gradients
\`\`\`css
/* Direction + color stops */
background: linear-gradient(135deg, #667eea, #764ba2);

/* Multiple stops with positions */
background: linear-gradient(
  to right,
  #667eea 0%,
  #764ba2 50%,
  #f093fb 100%
);

/* Hard stop — creates a sharp line */
background: linear-gradient(
  to right,
  #667eea 50%,
  #764ba2 50%   /* Same position = sharp edge */
);
\`\`\`

### Radial Gradients
\`\`\`css
background: radial-gradient(circle, #f093fb, #f5576c);
background: radial-gradient(ellipse at top left, #667eea, transparent);
\`\`\`

### Conic Gradients
\`\`\`css
background: conic-gradient(from 0deg, red, yellow, green, blue, red);
/* Useful for pie charts, color wheels */
\`\`\`

### Gradients in OKLCH

Gradients interpolated in OKLCH produce smoother transitions, especially between colors that are far apart on the hue wheel. Standard sRGB interpolation often produces muddy grays in the middle:

\`\`\`css
/* sRGB interpolation — may look muddy between blue and yellow */
background: linear-gradient(to right, blue, yellow);

/* OKLCH interpolation — smooth and vibrant throughout */
background: linear-gradient(in oklch to right, blue, yellow);
\`\`\`

The \`in oklch\` syntax tells the browser to interpolate in OKLCH color space rather than the default sRGB.

**Task:** Add a \`linear-gradient\` background to the \`.banner\` element. Use \`linear-gradient(135deg, #667eea, #764ba2)\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how gradient backgrounds render across the element box. Observe how padding affects the gradient area.'
		},
		{
			type: 'text',
			content: `## Background Properties

The \`background\` shorthand combines multiple background sub-properties. Understanding each individually prevents surprises:

\`\`\`css
/* Individual properties */
background-color: #f8fafc;
background-image: url('pattern.svg');
background-size: cover;           /* Scale to fill, may crop */
background-size: contain;         /* Scale to fit, may leave gaps */
background-position: center;      /* Anchor point */
background-repeat: no-repeat;     /* Don't tile */
background-attachment: fixed;     /* Don't scroll with content */

/* Shorthand — order matters less, but be careful */
background: #f8fafc url('pattern.svg') center/cover no-repeat;
\`\`\`

### Multiple Backgrounds

CSS supports layered backgrounds. Earlier values appear on top:

\`\`\`css
background:
  linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.8)),
  url('hero.jpg') center/cover no-repeat;
/* Gradient overlay on top of the image */
\`\`\`

### Box Shadow for Depth

\`box-shadow\` adds shadow effects outside (or inside) the element:

\`\`\`css
/* offset-x | offset-y | blur | spread | color */
box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);             /* Subtle lift */
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);        /* Medium elevation */
box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);      /* High elevation */

/* Inset shadow */
box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.1);

/* Multiple shadows for realistic depth */
box-shadow:
  0 1px 3px rgb(0 0 0 / 0.12),
  0 1px 2px rgb(0 0 0 / 0.24);
\`\`\`

**Task:** Add a solid background color to the card with \`background-color: #f8fafc\` and a subtle shadow with \`box-shadow: 0 1px 3px rgb(0 0 0 / 0.1)\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## CSS Color Functions — Relative Colors and Mixing

Modern CSS includes functions for deriving colors from other colors:

### color-mix()
\`\`\`css
/* Mix two colors in a given color space */
color: color-mix(in oklch, var(--primary), white 20%);    /* 20% lighter */
color: color-mix(in oklch, var(--primary), black 30%);    /* 30% darker */
color: color-mix(in oklch, var(--accent), var(--base) 50%); /* 50/50 blend */
\`\`\`

### Relative Color Syntax (RCS)
\`\`\`css
/* Derive a new color by modifying channels of an existing one */
--primary: oklch(0.55 0.2 265);
--primary-light: oklch(from var(--primary) calc(l + 0.2) c h);   /* Lighter */
--primary-muted: oklch(from var(--primary) l calc(c * 0.5) h);   /* Less vivid */
\`\`\`

These functions make design-token systems much more powerful. Define a single base color, then derive your entire palette mathematically. When you change the base, every derived color updates automatically.

## Choosing the Right Color Format

| Situation | Recommended Format |
|-----------|-------------------|
| Quick prototyping | Hex or named colors |
| Design system tokens | OKLCH — predictable palettes |
| Gradients between distant hues | OKLCH interpolation |
| Transparency needed | Any format with alpha channel |
| Wide-gamut displays | OKLCH with high chroma, or \`color(display-p3)\` |
| Legacy browser support | Hex or RGB with OKLCH as progressive enhancement |`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('Colors & Backgrounds');
</script>

<div class="container">
  <div class="banner">
    <h1>{title}</h1>
  </div>
  <div class="card">
    <p>Modern CSS gives you powerful color and background tools.</p>
  </div>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .banner {
    padding: 2rem;
    border-radius: 0.5rem;
    margin-block-end: 1rem;
  }

  h1 {
    color: #6366f1;
    margin: 0;
  }

  .card {
    padding: 1.5rem;
    border-radius: 0.5rem;
  }

  /* TODO: Add OKLCH color, gradient, and background styles */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let title = $state('Colors & Backgrounds');
</script>

<div class="container">
  <div class="banner">
    <h1>{title}</h1>
  </div>
  <div class="card">
    <p>Modern CSS gives you powerful color and background tools.</p>
  </div>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .banner {
    padding: 2rem;
    border-radius: 0.5rem;
    margin-block-end: 1rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
  }

  h1 {
    color: oklch(0.55 0.2 265);
    margin: 0;
  }

  .card {
    padding: 1.5rem;
    border-radius: 0.5rem;
    background-color: #f8fafc;
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use OKLCH color format for the heading',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'oklch(' }
					]
				}
			},
			hints: [
				'OKLCH uses three values: lightness (0-1), chroma (0-0.4), and hue (0-360).',
				'Replace the hex color with `oklch(0.55 0.2 265)`.',
				'Change the `h1` rule to: `color: oklch(0.55 0.2 265);`'
			],
			conceptsTested: ['css.oklch']
		},
		{
			id: 'cp-2',
			description: 'Add a linear gradient background to the banner',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'linear-gradient' }
					]
				}
			},
			hints: [
				'`linear-gradient()` takes a direction and two or more color stops.',
				'Use `background: linear-gradient(135deg, #667eea, #764ba2);`.',
				'Add to `.banner`: `background: linear-gradient(135deg, #667eea, #764ba2);`'
			],
			conceptsTested: ['css.gradients']
		},
		{
			id: 'cp-3',
			description: 'Add a background color and box shadow to the card',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'background-color' },
						{ type: 'contains', value: 'box-shadow' }
					]
				}
			},
			hints: [
				'`background-color` sets a flat color behind the content.',
				'`box-shadow` adds depth: `box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);`.',
				'Add to `.card`: `background-color: #f8fafc; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);`'
			],
			conceptsTested: ['css.colors']
		}
	]
};
