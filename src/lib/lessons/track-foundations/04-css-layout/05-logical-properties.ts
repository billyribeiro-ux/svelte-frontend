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

## WHY: Logical Properties Matter for Internationalization

If your website is only ever used in English, physical properties work fine. But the moment your product supports Arabic, Hebrew, Urdu, or any right-to-left (RTL) language, physical properties break.

Consider a card with a close button:
\`\`\`css
/* Physical — breaks in RTL */
.close-btn { position: absolute; top: 8px; right: 8px; }

/* Logical — works in all directions */
.close-btn { position: absolute; inset-block-start: 8px; inset-inline-end: 8px; }
\`\`\`

In English (LTR), \`inset-inline-end\` resolves to \`right\`. In Arabic (RTL), it resolves to \`left\`. The close button automatically moves to the correct corner without any additional CSS or JavaScript.

**This is not a niche concern.** Arabic is spoken by 420+ million people. Hebrew, Urdu, Persian, and other RTL languages add hundreds of millions more. Even if your current product is English-only, using logical properties costs nothing and makes future internationalization trivial instead of a massive refactor.

## WHY: Writing Mode Interaction

Logical properties adapt not just to text direction (LTR/RTL) but also to **writing modes**:

- **horizontal-tb** (default) — Text flows left-to-right, lines stack top-to-bottom (English, most European languages)
- **vertical-rl** — Text flows top-to-bottom, lines stack right-to-left (traditional Chinese, Japanese)
- **vertical-lr** — Text flows top-to-bottom, lines stack left-to-right (Mongolian)

In \`vertical-rl\` writing mode:
- \`block\` direction is horizontal (lines stack right-to-left)
- \`inline\` direction is vertical (text flows top-to-bottom)
- \`margin-block-start\` resolves to \`margin-right\` (start of the block axis)
- \`margin-inline-start\` resolves to \`margin-top\` (start of the inline axis)

Logical properties handle all of this automatically. Physical properties would require completely different CSS for each writing mode.`
		},
		{
			type: 'concept-callout',
			content: 'css.logical-properties'
		},
		{
			type: 'text',
			content: `## Block and Inline Directions

Physical properties and their logical equivalents:

| Physical | Logical |
|----------|---------|
| \`margin-top\` | \`margin-block-start\` |
| \`margin-bottom\` | \`margin-block-end\` |
| \`padding-left\` | \`padding-inline-start\` |
| \`padding-right\` | \`padding-inline-end\` |
| \`border-top\` | \`border-block-start\` |
| \`border-bottom\` | \`border-block-end\` |
| \`top\` | \`inset-block-start\` |
| \`right\` | \`inset-inline-end\` |
| \`bottom\` | \`inset-block-end\` |
| \`left\` | \`inset-inline-start\` |
| \`width\` | \`inline-size\` |
| \`height\` | \`block-size\` |

**The naming pattern is consistent:** \`{property}-{axis}-{position}\`. Once you internalize that \`block\` = stacking direction and \`inline\` = text flow direction, you can construct any logical property name from memory.

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
margin-block: 1rem 2rem;   /* block-start: 1rem, block-end: 2rem */
margin-inline: auto;        /* center horizontally (in LTR and RTL) */
padding-inline: 1rem;       /* left and right padding (or right and left in RTL) */
padding-block: 2rem;        /* top and bottom padding */
border-inline-start: 3px solid blue;  /* left border in LTR, right border in RTL */
\`\`\`

**The \`margin-inline: auto\` pattern** is particularly useful. It centers a block element horizontally regardless of text direction — the logical equivalent of the classic \`margin: 0 auto\` centering technique. In RTL contexts, this still works correctly because "inline" adapts to the writing direction.

**Task:** Use \`margin-inline: auto\` to center the container and \`padding-block: 2rem\` for vertical padding.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and change the `dir` attribute to `rtl` on the container element. Observe how logical properties automatically flip inline directions for right-to-left languages. The padding that was on the left moves to the right. The margin that was on the left side moves to the right. All without changing a single line of CSS — this is the power of logical properties.'
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

**Why \`max-inline-size: 65ch\` is better than \`max-width: 65ch\`:** In horizontal writing modes, they are identical. But if your content ever appears in a vertical writing mode (Japanese layout, for example), \`max-inline-size\` constrains the correct dimension — the inline axis, which is now the height. \`max-width\` would constrain the wrong axis.

## Real-World Internationalization Example

Consider building a messaging app that needs to support English, Arabic, and Japanese:

**English (LTR, horizontal-tb):**
- Sent messages appear on the right, received on the left
- Timestamps appear at the bottom of each message

**Arabic (RTL, horizontal-tb):**
- Sent messages should appear on the LEFT (because the reading start is now on the right)
- Without logical properties, you need to write completely separate CSS for RTL

**With logical properties:**
\`\`\`css
.message-sent {
  margin-inline-start: auto;  /* pushes to the end of inline axis */
  padding-inline: 1rem;
  border-inline-start: 3px solid blue;  /* accent on the start side */
}
\`\`\`

This single CSS rule works correctly in both LTR and RTL. The \`margin-inline-start: auto\` pushes the message to the inline end (right in LTR, left in RTL). The border appears on the correct side automatically.

**Task:** Replace \`max-width\` with \`max-inline-size\` on the container.

## Realistic Exercise: RTL-Ready Component

After completing the checkpoints, try this exercise:

1. Build a simple card component with: an icon on the left, text content, and an action button on the right
2. Use ONLY logical properties for all spacing and positioning
3. Add \`dir="rtl"\` to the container and verify the layout mirrors correctly
4. Check: Does the icon move to the right? Does the button move to the left? Does padding flip?

If you used logical properties consistently, the layout should mirror perfectly with zero additional CSS. If anything is out of place, you missed a physical property.`
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
