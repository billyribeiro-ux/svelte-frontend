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

## How the Integration Works — PostCSS Pipeline

Understanding the build pipeline helps you debug issues and optimize performance. Here is what happens when you use Tailwind in a SvelteKit project:

1. **Svelte compiles \`.svelte\` files** into JavaScript modules. During this step, Svelte extracts the \`<style>\` block and processes it separately.

2. **PostCSS processes your CSS.** Tailwind runs as a PostCSS plugin. It scans your source files for class names and generates only the CSS for classes you actually use.

3. **Vite bundles everything.** The generated CSS is included in the final bundle, tree-shaken to remove unused styles.

### The Content Scanning System

Tailwind v4 uses a content-aware approach. It scans your files to find class names, then generates CSS only for those classes. The \`content\` configuration in \`tailwind.config.js\` tells Tailwind where to look:

\`\`\`js
// tailwind.config.js
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
  ],
  // ...
}
\`\`\`

This is critical for bundle size. If Tailwind cannot find a class name in your source files, it will not generate CSS for it. This means:

- **Static class names are always detected.** \`class="bg-blue-500"\` is found by scanning.
- **Dynamic class names must be complete strings.** \`class="bg-{color}-500"\` will NOT work because Tailwind cannot resolve the variable at build time. It sees \`bg-{color}-500\` as a template literal, not a complete class name.

### The Purging Gotcha — Dynamic Class Names

This is the most common Tailwind mistake in Svelte:

\`\`\`svelte
<!-- WRONG: Tailwind cannot detect these classes -->
<script lang="ts">
  let color = $state('blue');
</script>
<div class="bg-{color}-500">...</div>

<!-- RIGHT: Use complete class strings -->
<script lang="ts">
  let color = $state('blue');
  let bgClass = $derived(
    color === 'blue' ? 'bg-blue-500' :
    color === 'red'  ? 'bg-red-500' :
                       'bg-gray-500'
  );
</script>
<div class="{bgClass}">...</div>
\`\`\`

The fix is always the same: ensure complete, scannable class strings appear somewhere in your source code. The class does not need to be used in a \`class\` attribute — Tailwind scans for any string that matches a utility pattern. Some developers put a comment with all possible classes:

\`\`\`svelte
<!-- Tailwind safelist: bg-blue-500 bg-red-500 bg-green-500 bg-gray-500 -->
\`\`\`

Or use the \`safelist\` configuration:

\`\`\`js
// tailwind.config.js
export default {
  safelist: ['bg-blue-500', 'bg-red-500', 'bg-green-500'],
}
\`\`\`

### Build Optimization

Tailwind's build output in production is remarkably small because of purging. A typical application uses a few hundred utility classes out of the thousands available. The production CSS might be 10-30KB (gzipped), regardless of how many utilities Tailwind defines.

To verify your build is optimized:

\`\`\`bash
# Check the CSS bundle size
npx vite build
ls -la build/assets/*.css
\`\`\`

If the CSS is unexpectedly large, check for:
- Overly broad \`content\` patterns that scan node_modules
- Dynamic class name patterns that force safelisting
- Unused \`@apply\` rules in global CSS

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

### When Ternaries Work Best

Ternaries are ideal for binary toggles — active/inactive, open/closed, enabled/disabled. They become unreadable with more than two states:

\`\`\`svelte
<!-- Good: binary toggle -->
<div class="{open ? 'opacity-100 visible' : 'opacity-0 invisible'}">

<!-- Bad: too many states for a ternary -->
<div class="{status === 'loading' ? 'bg-yellow-100' : status === 'success' ? 'bg-green-100' : status === 'error' ? 'bg-red-100' : 'bg-gray-100'}">
\`\`\`

For multi-state logic, use \`$derived\` (covered below).

### Template Expressions vs String Concatenation

Both work, but template expressions in the class attribute are more readable:

\`\`\`svelte
<!-- Template expression (preferred) -->
<div class="p-4 {active ? 'bg-blue-500' : 'bg-gray-200'}">

<!-- String concatenation (works but noisier) -->
<div class={'p-4 ' + (active ? 'bg-blue-500' : 'bg-gray-200')}>
\`\`\`

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

This is cleaner than ternaries when you only need to **add** (not swap) classes.

### class: Directive Patterns

\`\`\`svelte
<!-- Add a single class conditionally -->
<div class:hidden={!visible}>Content</div>

<!-- Multiple class: directives -->
<button
  class="px-4 py-2 rounded"
  class:bg-blue-500={active}
  class:text-white={active}
  class:bg-gray-200={!active}
  class:text-gray-700={!active}
>
  Toggle
</button>

<!-- Shorthand: when the variable name matches the class -->
<div class:active>  <!-- Same as class:active={active} -->
\`\`\`

### class: Directive vs Ternary — When to Use Which

**Use \`class:\`** when:
- You are adding/removing a single class
- You have multiple independent conditions: \`class:bold={important} class:italic={emphasis}\`
- The class name happens to match a variable name (shorthand)

**Use ternary** when:
- You are swapping between two class sets: \`{dark ? 'bg-black text-white' : 'bg-white text-black'}\`
- Both states have different classes (not just presence/absence of one class)

### Tailwind Class Gotcha with class: Directive

Be careful with Tailwind classes that have special characters. Classes with colons (responsive prefixes) and slashes (arbitrary values) need special handling:

\`\`\`svelte
<!-- This will NOT work — the colon confuses the parser -->
<div class:md:hidden={mobile}>

<!-- Use the class attribute with a ternary instead -->
<div class="{mobile ? 'md:hidden' : ''}">
\`\`\`

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

### Using Maps for Class Computation

For many states, a map is cleaner than a ternary chain:

\`\`\`svelte
<script lang="ts">
  let variant = $state<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');

  const variantMap = {
    primary:   'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger:    'bg-red-500 text-white hover:bg-red-600',
    ghost:     'bg-transparent text-gray-600 hover:bg-gray-100'
  } as const;

  let buttonClasses = $derived(variantMap[variant]);
</script>

<button class="px-4 py-2 rounded-lg font-medium transition-colors {buttonClasses}">
  Click me
</button>
\`\`\`

This is a common pattern in component libraries. The map object serves as a single source of truth for all variant styles, and \`$derived\` ensures the class string updates reactively when the variant changes.

### Composing Multiple Derived Classes

For components with multiple dimensions of variation (size + variant + state), compose them:

\`\`\`svelte
<script lang="ts">
  let size = $state<'sm' | 'md' | 'lg'>('md');
  let variant = $state<'primary' | 'ghost'>('primary');
  let disabled = $state(false);

  const sizes = { sm: 'px-2 py-1 text-sm', md: 'px-4 py-2', lg: 'px-6 py-3 text-lg' };
  const variants = { primary: 'bg-blue-500 text-white', ghost: 'bg-transparent text-gray-600' };

  let classes = $derived(
    \`\${sizes[size]} \${variants[variant]} \${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}\`
  );
</script>

<button class="rounded-lg font-medium {classes}" {disabled}>
  Button
</button>
\`\`\`

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
