import type { Lesson } from '$types/lesson';

export const customization: Lesson = {
	id: 'foundations.tailwind-css.customization',
	slug: 'customization',
	title: 'Customizing Your Design System',
	description: 'Extend Tailwind\'s default theme with custom colors, spacing, fonts, and utilities in tailwind.config.js.',
	trackId: 'foundations',
	moduleId: 'tailwind-css',
	order: 4,
	estimatedMinutes: 15,
	concepts: ['tailwind.config', 'tailwind.theme'],
	prerequisites: ['tailwind.utilities.basic'],

	content: [
		{
			type: 'text',
			content: `# Customizing Your Design System

Tailwind's default theme is a great starting point, but real projects need brand-specific colors, custom spacing, and unique fonts. You configure all of this in \`tailwind.config.js\`.

## WHY: The tailwind.config.js Structure Explained

The config file is the single source of truth for your design system. Understanding its structure is essential:

\`\`\`js
// tailwind.config.js
export default {
  // 1. Content — WHERE to scan for class names
  content: ['./src/**/*.{html,js,svelte,ts}'],

  // 2. Theme — WHAT values are available
  theme: {
    // Direct keys REPLACE the defaults entirely
    screens: { /* completely replaces default breakpoints */ },

    // extend adds to defaults without removing them
    extend: {
      colors: { /* adds new colors alongside existing ones */ },
      spacing: { /* adds new spacing values */ },
      fontFamily: { /* adds new font stacks */ },
    }
  },

  // 3. Plugins — HOW to add new utilities or components
  plugins: [],

  // 4. Dark mode strategy
  darkMode: 'media', // or 'class'
}
\`\`\`

**The \`content\` array** tells Tailwind which files to scan for class names. Tailwind generates CSS only for classes it finds in these files. If a utility is not referenced in any scanned file, it is not included in the output. This is how Tailwind achieves tiny CSS bundles — typically under 10KB gzipped for a full application.

**Critical mistake to avoid:** If you dynamically construct class names with string concatenation (like \`\`text-\${color}-500\`\`), Tailwind cannot detect them at build time because it uses static analysis, not runtime evaluation. Always use complete class names.

## Decision Framework: extend vs Override

The \`theme\` object has two modes:

**\`theme.extend\`** — Adds new values while keeping all defaults:
\`\`\`js
theme: {
  extend: {
    colors: {
      brand: { 500: '#6366f1' }  // adds brand-500, keeps blue-500, red-500, etc.
    }
  }
}
\`\`\`

**\`theme\` (top-level)** — Replaces defaults entirely:
\`\`\`js
theme: {
  colors: {
    brand: { 500: '#6366f1' }  // ONLY brand-500 exists. blue-500, red-500, etc. are GONE
  }
}
\`\`\`

**When to use each:**
- \`extend\` — 95% of the time. You want to ADD your brand colors while keeping Tailwind's full palette.
- Top-level override — Only when you deliberately want to restrict the palette. For example, a design system that enforces a limited set of colors company-wide.

**Rule of thumb:** If you are not sure, use \`extend\`. You can always restrict later.`
		},
		{
			type: 'concept-callout',
			content: 'tailwind.config'
		},
		{
			type: 'text',
			content: `## Adding Custom Colors — Creating Design Tokens

The most common customization is adding brand colors. Tailwind generates utilities for every color you define:

\`\`\`js
colors: {
  brand: {
    50: '#f0f9ff',   // bg-brand-50 — lightest tint (backgrounds)
    100: '#e0f2fe',  // bg-brand-100 — hover backgrounds
    500: '#6366f1',  // bg-brand-500, text-brand-500 — primary actions
    600: '#4f46e5',  // hover:bg-brand-600 — hover state of primary
    900: '#312e81',  // bg-brand-900 — darkest shade (headings, dark mode)
  }
}
\`\`\`

Once defined, you can use \`bg-brand-500\`, \`text-brand-50\`, \`border-brand-600\`, \`ring-brand-500\`, etc. Tailwind generates ALL utility variants for each color.

**How to build a color scale:**
1. Start with your primary brand color (usually the 500 shade)
2. Generate lighter shades (50-400) for backgrounds, borders, and hover states
3. Generate darker shades (600-900) for hover states, text, and dark mode
4. Test contrast ratios: text colors need 4.5:1 against their backgrounds (WCAG AA)

Tools like [oklch color palette generators] can create perceptually uniform scales. But for most projects, you can start with your brand's primary color and use an online Tailwind color generator to extrapolate the scale.

**Task:** Open the \`tailwind.config.js\` file and define a custom \`brand\` color palette in the \`extend.colors\` section.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## The @apply Directive

Sometimes you need reusable class combinations — for example, a button style used in many places. The \`@apply\` directive lets you extract Tailwind utilities into custom CSS classes:

\`\`\`css
/* In your <style> block or global CSS */
.btn-brand {
  @apply bg-brand-500 text-white px-4 py-2 rounded-lg font-medium
         hover:bg-brand-600 focus:ring-2 focus:ring-brand-500;
}
\`\`\`

**When to use \`@apply\` vs a Svelte component:**

| Use \`@apply\` when... | Use a Svelte component when... |
|---|---|
| Styling a plain HTML element you cannot add classes to (CMS content) | The pattern includes markup AND styles |
| Creating a utility that does not exist in Tailwind | You need props, slots, or logic |
| Styling third-party library elements | The pattern is used across multiple files |

**Use \`@apply\` sparingly.** It defeats the purpose of utility-first if overused. The Tailwind team recommends components (Svelte components in our case) as the primary extraction mechanism. Reserve \`@apply\` for the cases listed above.

**Task:** In the \`App.svelte\` style block, create a \`.btn-brand\` class using \`@apply\` with your custom brand color.

## The Plugin System Overview

Tailwind's plugin system lets you add custom utilities, components, and base styles programmatically:

\`\`\`js
// tailwind.config.js
import plugin from 'tailwindcss/plugin';

export default {
  plugins: [
    plugin(function({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.text-balance': { 'text-wrap': 'balance' },
      });
      addComponents({
        '.card': {
          padding: theme('spacing.4'),
          borderRadius: theme('borderRadius.lg'),
          boxShadow: theme('boxShadow.md'),
        },
      });
    }),
  ],
}
\`\`\`

Popular official plugins include \`@tailwindcss/typography\` (prose styling for rich text), \`@tailwindcss/forms\` (form reset), and \`@tailwindcss/container-queries\`.

## Realistic Exercise: Setting Up a Brand Theme

After completing the checkpoints, consider this real scenario: a designer hands you a brand guide with:
- Primary color: #2563EB
- Secondary color: #7C3AED
- Font: Inter
- Base spacing: 8px grid

Your config approach should be:
1. Add a \`brand\` and \`secondary\` color scale under \`extend.colors\`
2. Add Inter under \`extend.fontFamily.sans\`
3. If the 8px grid differs from Tailwind's default 4px grid, add custom spacing values under \`extend.spacing\`
4. Test that your custom tokens generate the expected utilities`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how custom theme values generate the same utility patterns as built-in ones. Your `bg-brand-500` works identically to `bg-blue-500` — Tailwind treats them the same. Inspect the generated CSS to confirm your color values are applied correctly.'
		}
	],

	starterFiles: [
		{
			name: 'tailwind.config.js',
			path: '/tailwind.config.js',
			language: 'typescript',
			content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      // TODO: Add custom brand colors here
      colors: {},
      fontFamily: {},
      spacing: {}
    }
  },
  plugins: []
};`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let plan = $state('Pro');
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-lg mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
    <p class="text-gray-600 mb-8">Pick the plan that works best for you.</p>

    <!-- TODO: Use your custom brand colors here -->
    <div class="bg-white rounded-xl shadow-md p-6 border-2 border-blue-500">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-blue-600">{plan} Plan</h2>
        <span class="bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">Popular</span>
      </div>
      <p class="text-gray-600 mb-6">Everything you need to build amazing projects.</p>

      <!-- TODO: Use @apply to create a reusable button class -->
      <button class="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium w-full hover:bg-blue-600">
        Get Started
      </button>
    </div>
  </div>
</div>`
		}
	],

	solutionFiles: [
		{
			name: 'tailwind.config.js',
			path: '/tailwind.config.js',
			language: 'typescript',
			content: `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81'
        }
      },
      fontFamily: {},
      spacing: {}
    }
  },
  plugins: []
};`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let plan = $state('Pro');
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-lg mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
    <p class="text-gray-600 mb-8">Pick the plan that works best for you.</p>

    <div class="bg-white rounded-xl shadow-md p-6 border-2 border-brand-500">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-brand-600">{plan} Plan</h2>
        <span class="bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full">Popular</span>
      </div>
      <p class="text-gray-600 mb-6">Everything you need to build amazing projects.</p>

      <button class="btn-brand w-full">
        Get Started
      </button>
    </div>
  </div>
</div>

<style>
  .btn-brand {
    @apply bg-brand-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-600 focus:ring-2 focus:ring-brand-500;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Define a custom brand color in tailwind.config.js',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'brand' }
					]
				}
			},
			hints: [
				'Open `tailwind.config.js` and add a `brand` key inside `extend.colors`.',
				'Define a color scale with at least a 500 shade: `brand: { 500: \'#6366f1\' }`.',
				'Add this inside `extend.colors`: `brand: { 50: \'#f0f0ff\', 500: \'#6366f1\', 600: \'#4f46e5\', 900: \'#312e81\' }`'
			],
			conceptsTested: ['tailwind.config', 'tailwind.theme']
		},
		{
			id: 'cp-2',
			description: 'Use @apply to create a reusable button style',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@apply' }
					]
				}
			},
			hints: [
				'The `@apply` directive lets you compose Tailwind utilities into a custom CSS class.',
				'In the `<style>` block of App.svelte, create `.btn-brand` using `@apply` with your brand colors.',
				'Add a `<style>` block with: `.btn-brand { @apply bg-brand-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-600 focus:ring-2 focus:ring-brand-500; }`'
			],
			conceptsTested: ['tailwind.config', 'tailwind.theme']
		}
	]
};
