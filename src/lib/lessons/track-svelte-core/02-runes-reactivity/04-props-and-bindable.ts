import type { Lesson } from '$types/lesson';

export const propsAndBindable: Lesson = {
	id: 'svelte-core.runes.props-and-bindable',
	slug: 'props-and-bindable',
	title: 'Props with $props and $bindable',
	description: 'Learn the Svelte 5 way to declare props using $props(), set defaults, and create two-way bindings with $bindable.',
	trackId: 'svelte-core',
	moduleId: 'runes-reactivity',
	order: 4,
	estimatedMinutes: 15,
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

The destructuring makes it clear exactly which props your component accepts.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.runes.props'
		},
		{
			type: 'text',
			content: `## Converting from export let

Look at the starter code — \`Greeting.svelte\` uses the old Svelte 4 \`export let\` pattern. Let's modernize it.

**Task:** Convert the \`export let\` declarations to use \`$props()\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Default Values

You can set defaults right in the destructuring:

\`\`\`svelte
let { name = 'World', color = 'blue' } = $props();
\`\`\`

If the parent doesn't pass a prop, the default is used.

**Task:** Add default values so the component works even without props.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and compare how `$props()` compiles vs the old `export let`. Notice that `$props()` creates a single props object — more efficient and easier for the compiler to optimize.'
		},
		{
			type: 'text',
			content: `## Two-Way Binding with $bindable

Sometimes a child component needs to update a prop and have the change flow back to the parent. Use \`$bindable()\` to mark a prop as bindable:

\`\`\`svelte
<!-- Child.svelte -->
<script lang="ts">
  let { value = $bindable('') } = $props();
</script>
<input bind:value />

<!-- Parent.svelte -->
<Child bind:value={parentValue} />
\`\`\`

**Task:** Make the \`value\` prop in \`TextInput.svelte\` bindable.`
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
