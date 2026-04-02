import type { Lesson } from '$types/lesson';

export const propsAndBindable: Lesson = {
	id: 'svelte-core.runes.props-and-bindable',
	slug: 'props-and-bindable',
	title: 'Props with $props and $bindable',
	description: 'Learn the Svelte 5 way to declare props using $props(), set defaults, and create two-way bindings with $bindable.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 4,
	estimatedMinutes: 20,
	concepts: ['svelte5.runes.props', 'svelte5.runes.props-defaults', 'svelte5.runes.bindable'],
	prerequisites: ['svelte5.runes.state', 'svelte5.components.nesting'],

	content: [
		{
			type: 'text',
			content: `# Props with \`$props()\`

In Svelte 5, components receive data from their parents using the \`$props()\` rune. This replaces the old \`export let\` syntax from Svelte 4.

\`\`\`svelte
<script lang="ts">
  let { name, age } = $props();
</script>
\`\`\`

The destructuring makes it clear exactly which props your component accepts — all in one place, using standard JavaScript destructuring syntax.

## Why One-Way Data Flow by Default

Svelte 5 enforces **one-way data flow** as the default. When a parent passes a prop to a child, the child receives the value but cannot modify it in a way that flows back to the parent. This is a deliberate design choice with important consequences:

1. **Predictability.** When you read a component's template and see \`<UserCard name={userName} />\`, you know that \`UserCard\` cannot change \`userName\`. The data flows in one direction: parent to child. If you want to understand how \`userName\` changes, you only need to look at the parent component.

2. **Debugging.** In systems with unrestricted two-way binding (like AngularJS v1), tracking down where a value changed becomes a detective game — any component in the tree might have mutated it. One-way flow means you can trace data changes by following the flow downward.

3. **Component contracts.** Props define a component's input contract. By default, a component is a pure function of its props: same inputs, same output. This makes components easier to test, reason about, and reuse.

Two-way binding is still available when you explicitly opt in with \`$bindable()\` — but it is the exception, not the rule. This philosophy matches React's approach (props are read-only) while giving you an escape hatch that React lacks (you would need callback props and manual state lifting in React).

## \`$props()\` Destructuring Patterns

The \`$props()\` rune returns an object containing all props passed to the component. You destructure this object to extract the props you need. This supports all standard JavaScript destructuring features:

### Basic Destructuring
\`\`\`svelte
let { name, age, email } = $props();
\`\`\`

### Renaming Props
\`\`\`svelte
let { class: className } = $props();
// Useful for props that conflict with reserved words
\`\`\`

### Rest Props
\`\`\`svelte
let { name, age, ...rest } = $props();
// 'rest' contains all other props not explicitly destructured
// Great for passing through to underlying HTML elements
\`\`\`

The rest props pattern is extremely useful when building wrapper components. For example, a custom \`<Button>\` component that forwards all standard HTML button attributes:

\`\`\`svelte
<script lang="ts">
  let { variant = 'primary', ...rest } = $props();
</script>
<button class={variant} {...rest}>
  <slot />
</button>
\`\`\`

The parent can now use \`<Button variant="danger" disabled onclick={handleClick}>\` and \`disabled\` and \`onclick\` are forwarded to the underlying \`<button>\` element automatically.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.props'
		},
		{
			type: 'text',
			content: `## Converting from \`export let\`

Look at the starter code — \`Greeting.svelte\` uses the old Svelte 4 \`export let\` pattern. Let us modernize it.

In Svelte 4, each prop was declared with a separate \`export let\` statement:
\`\`\`svelte
// Svelte 4 — each prop is a separate export
export let name: string;
export let greeting: string;
\`\`\`

In Svelte 5, all props come from a single \`$props()\` call:
\`\`\`svelte
// Svelte 5 — single destructuring
let { name, greeting } = $props();
\`\`\`

This is not just a syntactic change. Under the hood, \`$props()\` creates a reactive props object. The compiler knows which properties you destructured and can optimize updates — if only \`name\` changes, only the parts of the template that read \`name\` update.

**Task:** Convert the \`export let\` declarations in \`Greeting.svelte\` to use \`$props()\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Default Values

You can set defaults right in the destructuring, using standard JavaScript default value syntax:

\`\`\`svelte
let { name = 'World', color = 'blue' } = $props();
\`\`\`

If the parent does not pass a prop, the default is used. This replaces the Svelte 4 pattern of \`export let name = 'World'\`.

Default values work with all destructuring patterns:

\`\`\`svelte
// Defaults with rest props
let { variant = 'primary', size = 'md', ...rest } = $props();

// Defaults with renaming
let { class: className = '' } = $props();
\`\`\`

### TypeScript Integration

When using TypeScript, you can type your props explicitly for better IDE support and compile-time checking:

\`\`\`svelte
<script lang="ts">
  interface Props {
    name: string;
    greeting?: string;     // optional prop
    count?: number;        // optional prop
    onchange?: (value: string) => void;  // callback prop
  }

  let { name, greeting = 'Hello', count = 0, onchange }: Props = $props();
</script>
\`\`\`

The interface documents your component's API. Optional props (marked with \`?\`) should have default values in the destructuring. Required props without defaults will cause TypeScript errors if the parent omits them — catching bugs at compile time.

You can also use a type alias or inline type:

\`\`\`svelte
let { name, greeting = 'Hello' }: { name: string; greeting?: string } = $props();
\`\`\`

**Task:** Add default values to the \`Greeting.svelte\` component so it works even without props.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and compare how `$props()` compiles vs the old `export let`. Notice that `$props()` creates a single props object — the compiler destructures it into individual signal reads, which is more efficient and allows fine-grained reactivity per prop.'
		},
		{
			type: 'text',
			content: `## Two-Way Binding with \`$bindable\`

Sometimes a child component needs to update a prop and have the change flow back to the parent. This is the case for form input components, toggle switches, accordion panels — any component where the parent and child must share ownership of a value.

Use \`$bindable()\` to mark a prop as eligible for two-way binding:

\`\`\`svelte
<!-- TextInput.svelte (child) -->
<script lang="ts">
  let { value = $bindable('') } = $props();
</script>
<input bind:value />

<!-- Parent.svelte -->
<script lang="ts">
  let username = $state('');
</script>
<TextInput bind:value={username} />
\`\`\`

### The Opt-In Philosophy

The \`$bindable()\` marker is intentionally explicit. Without it, attempting to use \`bind:\` on a prop will produce a compiler error. This serves two purposes:

1. **Component authors control the API.** By marking a prop as bindable, the component author signals "this prop is designed to be mutated by the child." Props not marked with \`$bindable\` are read-only inputs.

2. **Consumers know what to expect.** When reading a parent component, if you see \`bind:value\`, you know the child may change this value. If you see \`value={x}\`, you know the child cannot.

\`$bindable()\` takes an optional default value. This default is used when the parent passes the prop without \`bind:\`:

\`\`\`svelte
let { value = $bindable('') } = $props();
// If parent uses <TextInput />, value starts as ''
// If parent uses <TextInput bind:value={x} />, value is bound to x
\`\`\`

### Building a Reusable Form Input Component

Here is a practical example — a reusable text input with label, error state, and two-way binding:

\`\`\`svelte
<!-- FormField.svelte -->
<script lang="ts">
  interface Props {
    label: string;
    value: string;
    error?: string;
    type?: 'text' | 'email' | 'password';
  }

  let { label, value = $bindable(''), error = '', type = 'text' }: Props = $props();
</script>

<label>
  <span>{label}</span>
  <input {type} bind:value class:error={!!error} />
  {#if error}
    <span class="error-text">{error}</span>
  {/if}
</label>
\`\`\`

The parent can now use this component cleanly:

\`\`\`svelte
<FormField label="Email" bind:value={email} error={emailError} type="email" />
<FormField label="Password" bind:value={password} error={passwordError} type="password" />
\`\`\`

**Task:** Make the \`value\` prop in \`TextInput.svelte\` bindable by converting to \`$props()\` with \`$bindable()\`.`
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
  import Greeting from './Greeting.svelte';
  import TextInput from './TextInput.svelte';

  let username = $state('Svelte Learner');
</script>

<Greeting name={username} greeting="Welcome" />
<TextInput bind:value={username} />

<style>
  :global(body) {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'Greeting.svelte',
			path: '/Greeting.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Convert these to $props()
  export let name: string;
  export let greeting: string;
</script>

<h1>{greeting}, {name}!</h1>

<style>
  h1 { color: var(--sf-accent, #6366f1); }
</style>`
		},
		{
			name: 'TextInput.svelte',
			path: '/TextInput.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Use $props() with $bindable
  export let value: string;
</script>

<input bind:value />

<style>
  input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
  }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Greeting from './Greeting.svelte';
  import TextInput from './TextInput.svelte';

  let username = $state('Svelte Learner');
</script>

<Greeting name={username} greeting="Welcome" />
<TextInput bind:value={username} />

<style>
  :global(body) {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'Greeting.svelte',
			path: '/Greeting.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { name = 'World', greeting = 'Hello' } = $props();
</script>

<h1>{greeting}, {name}!</h1>

<style>
  h1 { color: var(--sf-accent, #6366f1); }
</style>`
		},
		{
			name: 'TextInput.svelte',
			path: '/TextInput.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { value = $bindable('') } = $props();
</script>

<input bind:value />

<style>
  input {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Convert export let to $props()',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$props()' },
						{ type: 'not-contains', value: 'export let' }
					]
				}
			},
			hints: [
				'In Svelte 5, props are declared by destructuring `$props()` instead of using `export let`.',
				'Replace both `export let` lines with a single destructuring: `let { name, greeting } = $props();`',
				'Change Greeting.svelte to: `let { name, greeting }: { name: string; greeting: string } = $props();`'
			],
			conceptsTested: ['svelte5.runes.props']
		},
		{
			id: 'cp-2',
			description: 'Add default values to the destructured props',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: "name\\s*=\\s*'" },
						{ type: 'regex', value: "greeting\\s*=\\s*'" }
					]
				}
			},
			hints: [
				'Default values go right in the destructuring, just like regular JavaScript.',
				'Syntax: `let { name = \'World\', greeting = \'Hello\' } = $props();`',
				'Update Greeting.svelte: `let { name = \'World\', greeting = \'Hello\' } = $props();`'
			],
			conceptsTested: ['svelte5.runes.props-defaults']
		},
		{
			id: 'cp-3',
			description: 'Make the value prop bindable using $bindable',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$bindable' },
						{ type: 'contains', value: '$props()' }
					]
				}
			},
			hints: [
				'`$bindable()` marks a prop so the parent can use `bind:` on it.',
				'Use it as the default value in the destructuring: `let { value = $bindable(\'\') } = $props();`',
				'Update TextInput.svelte: `let { value = $bindable(\'\') } = $props();`'
			],
			conceptsTested: ['svelte5.runes.bindable']
		}
	]
};
