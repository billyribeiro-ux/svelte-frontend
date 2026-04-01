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

Where things get interesting is combining Tailwind's utility classes with Svelte's reactivity. Svelte gives you several patterns for dynamic styling.`
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

When \`active\` is true, \`bg-blue-500\` and \`shadow-lg\` are added. When false, they're removed.

This is cleaner than ternaries when you only need to add (not swap) classes.

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

**Task:** Create a \`$derived\` value that computes the appropriate Tailwind classes based on component state.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and click the toggle button. Watch how Svelte reactively updates the class attribute — individual utility classes are added and removed in real time.'
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
