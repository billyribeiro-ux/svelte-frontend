import type { Lesson } from '$types/lesson';

export const propsInDepth: Lesson = {
	id: 'svelte-core.components-and-props.props-in-depth',
	slug: 'props-in-depth',
	title: '$props() In Depth',
	description:
		'Master $props() destructuring, rest props, and spreading for flexible component APIs.',
	trackId: 'svelte-core',
	moduleId: 'components-and-props',
	order: 1,
	estimatedMinutes: 25,
	concepts: ['svelte5.props.destructuring', 'svelte5.props.rest', 'svelte5.props.spread'],
	prerequisites: ['svelte5.runes.state', 'svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# $props() In Depth

In Svelte 5, components receive props via the \`$props()\` rune. This is not just a cosmetic change from Svelte 4's \`export let\` — it is a fundamental redesign of how data flows into components, and understanding *why* the change was made will help you write better component APIs.

## Why $props() Replaced export let

Svelte 4 used \`export let\` to declare props. While clever, this approach had real problems that surfaced as applications grew:

**The \`export let\` problems:**
- **No rest props.** You could not collect "all the other props" someone passed. Wrapper components that needed to forward arbitrary HTML attributes required \`$$restProps\`, a magic variable with no type safety.
- **No destructuring.** Each prop was its own statement (\`export let name; export let age;\`), so you could not destructure a group of related props in one line.
- **Confusing semantics.** \`export let\` looks like you are exporting something *out* of the module. In reality, you are declaring something that flows *in*. Newcomers consistently misread the direction of data flow.
- **Weak TypeScript support.** Typing \`export let\` props required additional tooling magic. The Svelte language server had to do extra work to infer types, and generic components were nearly impossible.

\`$props()\` solves all of these. It returns a plain object — the props object — and you destructure it with standard JavaScript syntax. TypeScript inference works naturally because you are just typing a destructured variable.

\`\`\`svelte
<!-- Svelte 4: confusing, no rest, weak types -->
<script lang="ts">
  export let name: string;
  export let greeting: string = 'Hello';
  // $$restProps existed but was untyped
</script>

<!-- Svelte 5: clear, standard JS, full types -->
<script lang="ts">
  let { name, greeting = 'Hello', ...rest } = $props();
</script>
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'svelte5.props.destructuring'
		},
		{
			type: 'text',
			content: `## TypeScript Prop Inference

Svelte 5 gives you two ways to type your props, and the choice matters for how much safety you get.

**Inline generic approach** — quick, good for small components:

\`\`\`svelte
<script lang="ts">
  let { name, count = 0 } = $props<{ name: string; count?: number }>();
</script>
\`\`\`

When you use the generic parameter \`$props<T>()\`, Svelte infers the entire shape of the props from \`T\`. The compiler will error if a parent passes a prop not in \`T\`, or omits a required one.

**Interface approach** — better for complex components, especially when extending HTML element attributes:

\`\`\`svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  }

  let { variant = 'primary', size = 'md', ...rest }: Props = $props();
</script>
\`\`\`

By extending \`HTMLButtonAttributes\`, your component automatically accepts every valid HTML button attribute (\`disabled\`, \`type\`, \`aria-label\`, etc.) and TypeScript will check them all. This is how professional component libraries are built.

## Destructuring with Defaults

Default values work exactly like JavaScript default parameters. If a prop is \`undefined\` (not passed), the default kicks in. If a prop is explicitly passed as \`undefined\`, the default also kicks in — this matches standard JS destructuring behavior.

\`\`\`svelte
<script lang="ts">
  let {
    variant = 'primary',
    size = 'md',
    disabled = false,
    children
  } = $props();
</script>
\`\`\`

One subtlety: default values are evaluated once at component creation, not on every render. If your default is an object or array, every instance gets the same reference. For mutable defaults, use a function pattern or derive a new value.

## The Rest Props Pattern

Rest props are the key to building composable wrapper components. When you write \`...rest\`, you collect every prop that you did not explicitly destructure.

\`\`\`svelte
<script lang="ts">
  let { variant = 'primary', size = 'md', ...rest } = $props();
</script>

<button class="btn btn-{variant} btn-{size}" {...rest}>
  Click me
</button>
\`\`\`

Now consumers can pass \`disabled\`, \`aria-label\`, \`onclick\`, \`id\`, or any other HTML attribute, and it flows through to the underlying \`<button>\`. Without rest props, you would have to manually list every possible attribute — an impossible task.

## Spread Ordering: Last Wins

When you spread props onto an element, attribute ordering matters. The **last value wins** for any duplicate attribute.

\`\`\`svelte
<!-- rest contains class="user-class" -->
<button class="default-class" {...rest}>Click</button>
<!-- Result: class="user-class" (rest overwrites) -->

<button {...rest} class="always-this-class">Click</button>
<!-- Result: class="always-this-class" (explicit overwrites rest) -->
\`\`\`

This gives you a clear pattern: spread first for "consumer wins" behavior, or spread last for "component wins" behavior. Most components spread first so that consumers can override styling and behavior.

## Readonly Props by Default

Props in Svelte 5 are **readonly by default**. If a child tries to reassign a prop, the compiler will warn you. This is an intentional design choice — data should flow down via props and up via callbacks. If you need local mutable state based on a prop, copy it:

\`\`\`svelte
<script lang="ts">
  let { initialCount = 0 } = $props();
  let count = $state(initialCount); // local mutable copy
</script>
\`\`\`

This makes data flow explicit: the parent owns \`initialCount\`, the child owns \`count\`. There is no hidden two-way binding.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Exercise: Build a Configurable Button Component

Now put it all together. You will build a \`Button\` component that demonstrates every concept from this lesson.

**Requirements:**
1. Accept a \`variant\` prop with values \`'primary' | 'secondary' | 'danger'\`, defaulting to \`'primary'\`.
2. Accept a \`size\` prop with values \`'sm' | 'md' | 'lg'\`, defaulting to \`'md'\`.
3. Use rest props so consumers can pass any HTML button attribute.
4. Define a TypeScript \`Props\` interface extending \`HTMLButtonAttributes\`.
5. Spread rest props onto the \`<button>\` element.

In App.svelte, render several Button instances with different variant/size combinations. Pass at least one with \`disabled\` and one with a custom \`class\` to prove rest props work.

\`\`\`svelte
<!-- Button.svelte skeleton -->
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  }

  let { variant = 'primary', size = 'md', ...rest }: Props = $props();
</script>

<button class="btn btn-{variant} btn-{size}" {...rest}>
  <!-- children snippet renders whatever is placed between <Button>...</Button> -->
</button>
\`\`\`

Think about spread ordering: should \`{...rest}\` come before or after your \`class\` attribute? What happens in each case?`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Typed Rest Props with the Interface

Add the TypeScript interface and apply it to your \`$props()\` call. Verify that TypeScript catches mistakes — try passing an invalid \`variant\` value or an attribute that does not exist on buttons.

\`\`\`svelte
<!-- In App.svelte, these should type-check correctly -->
<Button variant="danger" size="lg" disabled>Delete</Button>
<Button variant="secondary" aria-label="Close panel">X</Button>

<!-- This should show a TypeScript error -->
<Button variant="invalid">Oops</Button>
\`\`\`

The interface approach gives you autocomplete in your editor for every valid attribute. When you maintain dozens of components, this saves significant debugging time.`
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
  import Button from './Button.svelte';
</script>

<div class="demo">
  <h2>Configurable Button</h2>
  <!-- TODO: Render Button with different variant/size combos -->
  <!-- TODO: Pass disabled, class, or other HTML attributes to test rest props -->
</div>

<style>
  :global(body) {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .demo {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  :global(.btn) {
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  :global(.btn-primary) { background: #6366f1; color: white; }
  :global(.btn-secondary) { background: #e2e8f0; color: #1e293b; }
  :global(.btn-danger) { background: #ef4444; color: white; }

  :global(.btn-sm) { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
  :global(.btn-md) { padding: 0.5rem 1rem; font-size: 1rem; }
  :global(.btn-lg) { padding: 0.75rem 1.5rem; font-size: 1.125rem; }

  :global(.btn:disabled) { opacity: 0.5; cursor: not-allowed; }
</style>`
		},
		{
			name: 'Button.svelte',
			path: '/Button.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import HTMLButtonAttributes from 'svelte/elements'
  // TODO: Define Props interface with variant and size
  // TODO: Destructure $props() with defaults and rest props
</script>

<!-- TODO: Render a <button> with dynamic classes and spread rest props -->
<button>Replace me</button>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Button from './Button.svelte';
</script>

<div class="demo">
  <h2>Configurable Button</h2>
  <Button variant="primary" size="lg">Primary Large</Button>
  <Button variant="secondary" size="md">Secondary Medium</Button>
  <Button variant="danger" size="sm">Danger Small</Button>
  <Button disabled>Disabled Default</Button>
  <Button variant="primary" class="extra-class" aria-label="Custom">With Extras</Button>
</div>

<style>
  :global(body) {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  .demo {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  :global(.btn) {
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
  }

  :global(.btn-primary) { background: #6366f1; color: white; }
  :global(.btn-secondary) { background: #e2e8f0; color: #1e293b; }
  :global(.btn-danger) { background: #ef4444; color: white; }

  :global(.btn-sm) { padding: 0.25rem 0.5rem; font-size: 0.875rem; }
  :global(.btn-md) { padding: 0.5rem 1rem; font-size: 1rem; }
  :global(.btn-lg) { padding: 0.75rem 1.5rem; font-size: 1.125rem; }

  :global(.btn:disabled) { opacity: 0.5; cursor: not-allowed; }
</style>`
		},
		{
			name: 'Button.svelte',
			path: '/Button.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import type { Snippet } from 'svelte';

  interface Props extends HTMLButtonAttributes {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children?: Snippet;
  }

  let { variant = 'primary', size = 'md', children, ...rest }: Props = $props();
</script>

<button class="btn btn-{variant} btn-{size}" {...rest}>
  {#if children}
    {@render children()}
  {/if}
</button>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use $props() to destructure name and greeting with a default value',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$props()' },
						{ type: 'contains', value: 'greeting' }
					]
				}
			},
			hints: [
				'Use the $props() rune to receive props in your Greeting component.',
				'Destructure with a default: `let { name, greeting = \'Hello\' } = $props();`',
				'Change the Greeting script to `let { name, greeting = \'Hello\' } = $props();` and render `{greeting}, {name}!`'
			],
			conceptsTested: ['svelte5.props.destructuring']
		},
		{
			id: 'cp-2',
			description: 'Add rest props and spread them onto the root element',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '...rest' },
						{ type: 'contains', value: '{...rest}' }
					]
				}
			},
			hints: [
				'Use rest syntax in the destructuring: `let { name, greeting = \'Hello\', ...rest } = $props();`',
				'Spread the rest onto your element: `<p {...rest}>`',
				'Add `...rest` to your $props() destructuring and `{...rest}` to your `<p>` tag.'
			],
			conceptsTested: ['svelte5.props.rest', 'svelte5.props.spread']
		},
		{
			id: 'cp-3',
			description: 'Add a TypeScript interface for the component props',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'interface Props' },
						{ type: 'contains', value: ': Props' }
					]
				}
			},
			hints: [
				'Define an interface above your $props() call to describe the shape of your props.',
				'Your interface should have `name: string` and optionally `greeting?: string`.',
				'Add `interface Props { name: string; greeting?: string; }` and annotate: `let { ... }: Props = $props();`'
			],
			conceptsTested: ['svelte5.props.destructuring']
		}
	]
};
