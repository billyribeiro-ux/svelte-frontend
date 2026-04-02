import type { Lesson } from '$types/lesson';

export const tailwindInSvelte: Lesson = {
	id: 'foundations.tailwind-css.tailwind-in-svelte',
	slug: 'tailwind-in-svelte',
	title: 'Tailwind CSS in Svelte 5',
	description: 'Integrate Tailwind with Svelte 5 — dynamic classes with $state and $derived, the class: directive, and conditional styling patterns.',
	trackId: 'foundations',
	moduleId: 'tailwind-css',
	order: 5,
	estimatedMinutes: 15,
	concepts: ['tailwind.svelte-integration', 'tailwind.class-directive'],
	prerequisites: ['tailwind.utilities.basic', 'svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Tailwind CSS in Svelte 5

Tailwind and Svelte are a powerful combination. Setting up Tailwind in a SvelteKit project takes one command:

\`\`\`bash
npx sv add tailwindcss
\`\`\`

This configures everything automatically — \`tailwind.config.js\`, PostCSS, and the base styles.

Where things get interesting is combining Tailwind's utility classes with Svelte's reactivity. Svelte gives you several patterns for dynamic styling.

## WHY: PostCSS Integration and the Build Pipeline

Understanding how Tailwind integrates with Svelte at the build level helps you debug issues and optimize performance.

**The build pipeline:**
1. **Svelte preprocessor** runs first — processes \`<script>\`, \`<style>\`, and template
2. **PostCSS** processes CSS — this is where Tailwind runs
3. **Tailwind's JIT engine** scans your \`content\` files for class names and generates only the CSS for classes it finds
4. **Vite** bundles everything for production

**PostCSS is the bridge.** Tailwind is technically a PostCSS plugin. When you write Tailwind utilities in your Svelte component's class attributes, the PostCSS step generates the corresponding CSS. The Svelte compiler never sees Tailwind-specific syntax in \`<style>\` blocks — it sees the generated standard CSS.

**Build optimization tips:**
- **PurgeCSS is built in.** Tailwind v3+ automatically tree-shakes unused utilities. A typical production CSS bundle is 5-15KB gzipped, regardless of how many utilities exist in the framework.
- **Avoid \`@apply\` in component styles.** When you use \`@apply\` inside a Svelte component's \`<style>\` block, the generated CSS is duplicated for every instance of that component. Prefer utility classes in the template or global \`@apply\` rules in \`app.css\`.
- **Dynamic class names must be complete.** Tailwind scans files as static text. \`\`bg-\${color}-500\`\` will NOT work because Tailwind cannot resolve the variable at build time. Use a lookup object instead:
\`\`\`svelte
<script>
  const colorMap = { red: 'bg-red-500', blue: 'bg-blue-500' };
  let color = $state('red');
</script>
<div class={colorMap[color]}>...</div>
\`\`\`

- **Safelist for truly dynamic classes.** If you must generate classes from data (like CMS content), add them to the \`safelist\` in your config:
\`\`\`js
// tailwind.config.js
export default {
  safelist: ['bg-red-500', 'bg-blue-500', 'bg-green-500'],
}
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'tailwind.svelte-integration'
		},
		{
			type: 'text',
			content: `## Dynamic Classes with Template Expressions

The simplest pattern is a ternary expression inside the class attribute:

\`\`\`svelte
<script lang="ts">
  let active = $state(false);
</script>

<button class="px-4 py-2 rounded {active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}">
  Toggle
</button>
\`\`\`

The curly braces embed a JavaScript expression directly in the class string. This is perfect for toggling between two states.

**When to use this pattern:**
- Binary state toggles (active/inactive, open/closed, selected/unselected)
- Simple color or style swaps based on a boolean
- When both states have different but complete class sets

**When NOT to use this pattern:**
- More than 2 states — the ternary becomes unreadable
- When you only need to ADD a class, not swap — use \`class:\` directive instead
- Complex logic — move to \`$derived\`

**Task:** The starter code has a toggle button with hardcoded classes. Make the button class dynamic using a ternary expression based on the \`active\` state.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## The class: Directive

Svelte's \`class:\` directive conditionally adds a single class based on a boolean:

\`\`\`svelte
<div class="p-4 rounded-lg" class:bg-blue-500={active} class:shadow-lg={active}>
  Conditional styling
</div>
\`\`\`

When \`active\` is true, \`bg-blue-500\` and \`shadow-lg\` are added. When false, they are removed.

This is cleaner than ternaries when you only need to add (not swap) classes. It also makes it easy to conditionally apply multiple independent classes:

\`\`\`svelte
<div
  class="base-styles"
  class:ring-2={focused}
  class:ring-blue-500={focused}
  class:opacity-50={disabled}
  class:pointer-events-none={disabled}
>
\`\`\`

Each \`class:\` directive is independent — you can mix and match conditions without creating complex nested ternaries.

**Task:** Add a \`class:\` directive to the card element to conditionally apply a highlight style.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Computed Classes with $derived

For complex conditional logic, use \`$derived\` to compute class strings reactively:

\`\`\`svelte
<script lang="ts">
  let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');

  let statusClasses = $derived(
    status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
    status === 'success' ? 'bg-green-100 text-green-800' :
    status === 'error'   ? 'bg-red-100 text-red-800' :
                           'bg-gray-100 text-gray-800'
  );
</script>

<span class="px-3 py-1 rounded-full text-sm font-medium {statusClasses}">
  {status}
</span>
\`\`\`

This keeps your template clean and your logic in the script block where it belongs.

**Decision framework for choosing a pattern:**

| Scenario | Pattern |
|---|---|
| Toggle between 2 class sets | Ternary in template |
| Add/remove a single class | \`class:\` directive |
| 3+ states or complex logic | \`$derived\` computed string |
| Shared across components | Utility function returning class string |

**Task:** Create a \`$derived\` value that computes the appropriate Tailwind classes based on component state.

## Realistic Exercise: Building a Dynamic Component

After completing the checkpoints, consider this scenario: you are building a notification toast component that can be \`info\`, \`success\`, \`warning\`, or \`error\`. Each type needs different background colors, text colors, and icons.

Your approach should be:
1. Define a \`$derived\` that maps the notification type to Tailwind classes
2. Use template interpolation to apply the computed classes
3. Ensure all class names appear as complete strings somewhere in the file (so Tailwind can detect them)
4. Test each state to confirm the correct styles apply

This is a pattern you will use constantly in real Svelte applications.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and click the toggle button. Watch how Svelte reactively updates the class attribute — individual utility classes are added and removed in real time. Click "Cycle Status" to see how the $derived value recomputes and applies completely different class sets based on the current state. This reactive class binding is one of the strongest patterns in the Svelte-Tailwind combination.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let active = $state(false);
  let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');

  // TODO: Add a $derived value for status-based classes

  function cycleStatus() {
    const order: Array<'idle' | 'loading' | 'success' | 'error'> = ['idle', 'loading', 'success', 'error'];
    const current = order.indexOf(status);
    status = order[(current + 1) % order.length];
  }
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-md mx-auto space-y-6">

    <!-- TODO: Make button classes dynamic with a ternary expression -->
    <section>
      <h2 class="text-lg font-semibold text-slate-800 mb-3">Dynamic Toggle</h2>
      <button
        onclick={() => active = !active}
        class="px-6 py-3 rounded-lg font-medium bg-gray-200 text-gray-700"
      >
        {active ? 'Active' : 'Inactive'}
      </button>
    </section>

    <!-- TODO: Add class: directive for conditional highlight -->
    <section>
      <h2 class="text-lg font-semibold text-slate-800 mb-3">Card Highlight</h2>
      <div class="p-4 rounded-lg border-2 border-gray-200 bg-white">
        <p class="text-slate-600">Click toggle above to highlight this card.</p>
      </div>
    </section>

    <!-- TODO: Use $derived for computed status classes -->
    <section>
      <h2 class="text-lg font-semibold text-slate-800 mb-3">Status Badge</h2>
      <button onclick={cycleStatus} class="text-sm text-blue-500 underline mb-2">
        Cycle Status
      </button>
      <div>
        <span class="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
      </div>
    </section>

  </div>
</div>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let active = $state(false);
  let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');

  let statusClasses = $derived(
    status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
    status === 'success' ? 'bg-green-100 text-green-800' :
    status === 'error'   ? 'bg-red-100 text-red-800' :
                           'bg-gray-100 text-gray-800'
  );

  function cycleStatus() {
    const order: Array<'idle' | 'loading' | 'success' | 'error'> = ['idle', 'loading', 'success', 'error'];
    const current = order.indexOf(status);
    status = order[(current + 1) % order.length];
  }
</script>

<div class="min-h-screen bg-gray-50 p-8">
  <div class="max-w-md mx-auto space-y-6">

    <section>
      <h2 class="text-lg font-semibold text-slate-800 mb-3">Dynamic Toggle</h2>
      <button
        onclick={() => active = !active}
        class="px-6 py-3 rounded-lg font-medium transition-colors {active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}"
      >
        {active ? 'Active' : 'Inactive'}
      </button>
    </section>

    <section>
      <h2 class="text-lg font-semibold text-slate-800 mb-3">Card Highlight</h2>
      <div
        class="p-4 rounded-lg border-2 bg-white transition-colors"
        class:border-blue-500={active}
        class:border-gray-200={!active}
        class:bg-blue-50={active}
      >
        <p class="text-slate-600">Click toggle above to highlight this card.</p>
      </div>
    </section>

    <section>
      <h2 class="text-lg font-semibold text-slate-800 mb-3">Status Badge</h2>
      <button onclick={cycleStatus} class="text-sm text-blue-500 underline mb-2">
        Cycle Status
      </button>
      <div>
        <span class="px-3 py-1 rounded-full text-sm font-medium {statusClasses}">
          {status}
        </span>
      </div>
    </section>

  </div>
</div>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use a dynamic class expression with a ternary',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: '\\{.*\\?.*:.*\\}' }
					]
				}
			},
			hints: [
				'Use a ternary expression inside curly braces in the class attribute to swap between two sets of classes.',
				'The pattern is: `class="base-classes {condition ? \'true-classes\' : \'false-classes\'}"` — try toggling between blue and gray.',
				'Change the button class to: `class="px-6 py-3 rounded-lg font-medium transition-colors {active ? \'bg-blue-500 text-white\' : \'bg-gray-200 text-gray-700\'}"`'
			],
			conceptsTested: ['tailwind.svelte-integration']
		},
		{
			id: 'cp-2',
			description: 'Use the class: directive for conditional styling',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'class:' }
					]
				}
			},
			hints: [
				'Svelte\'s `class:` directive adds a class when a condition is true: `class:some-class={condition}`.',
				'Add `class:border-blue-500={active}` to the card div to highlight it when active.',
				'Update the card div: `<div class="p-4 rounded-lg border-2 bg-white" class:border-blue-500={active} class:bg-blue-50={active}>`'
			],
			conceptsTested: ['tailwind.class-directive', 'tailwind.svelte-integration']
		},
		{
			id: 'cp-3',
			description: 'Use $derived for computed Tailwind classes',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$derived' },
						{ type: 'regex', value: 'class' }
					]
				}
			},
			hints: [
				'Create a `$derived` value in the script block that returns different Tailwind classes based on the `status` state.',
				'Map each status to a color: `let statusClasses = $derived(status === \'success\' ? \'bg-green-100 text-green-800\' : ...)`.',
				'Add: `let statusClasses = $derived(status === \'loading\' ? \'bg-yellow-100 text-yellow-800\' : status === \'success\' ? \'bg-green-100 text-green-800\' : status === \'error\' ? \'bg-red-100 text-red-800\' : \'bg-gray-100 text-gray-800\');` and use `{statusClasses}` in the span\'s class.'
			],
			conceptsTested: ['tailwind.svelte-integration', 'tailwind.class-directive']
		}
	]
};
