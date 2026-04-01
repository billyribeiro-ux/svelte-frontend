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

The config file has a \`theme\` object with two key sections:
- **\`theme.extend\`** — Adds new values without removing defaults
- **\`theme\`** (top-level) — Replaces defaults entirely

Always prefer \`extend\` unless you intentionally want to remove default values.

\`\`\`js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a5f',
        }
      }
    }
  }
}
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'tailwind.config'
		},
		{
			type: 'text',
			content: `## Adding Custom Colors

The most common customization is adding brand colors. Tailwind generates utilities for every color you define:

\`\`\`js
colors: {
  brand: {
    50: '#f0f9ff',   // bg-brand-50
    100: '#e0f2fe',  // bg-brand-100
    500: '#6366f1',  // bg-brand-500, text-brand-500
    600: '#4f46e5',  // hover:bg-brand-600
    900: '#312e81',  // bg-brand-900
  }
}
\`\`\`

Once defined, you can use \`bg-brand-500\`, \`text-brand-50\`, \`border-brand-600\`, etc.

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

Use \`@apply\` sparingly — it's best for truly reusable patterns like buttons and form inputs. For most components, inline utilities are preferred.

**Task:** In the \`App.svelte\` style block, create a \`.btn-brand\` class using \`@apply\` with your custom brand color.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how custom theme values generate the same utility patterns as built-in ones. Your `bg-brand-500` works identically to `bg-blue-500` — Tailwind treats them the same.'
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
