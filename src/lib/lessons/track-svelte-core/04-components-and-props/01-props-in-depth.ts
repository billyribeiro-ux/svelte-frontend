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
	estimatedMinutes: 15,
	concepts: ['svelte5.props.destructuring', 'svelte5.props.rest', 'svelte5.props.spread'],
	prerequisites: ['svelte5.runes.state', 'svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# $props() In Depth

In Svelte 5, components receive props via the \`$props()\` rune. This replaces Svelte 4's \`export let\` pattern and gives you powerful destructuring capabilities.

You can destructure with defaults, collect remaining props with rest syntax, and spread props onto elements — all with full type safety.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.props.destructuring'
		},
		{
			type: 'text',
			content: `## Destructuring with Defaults

The \`$props()\` rune returns all props passed to your component. You destructure them just like a JavaScript object, and you can provide default values.

\`\`\`svelte
<script lang="ts">
  let { name, greeting = 'Hello' } = $props();
</script>

<p>{greeting}, {name}!</p>
\`\`\`

**Your task:** Create a \`Greeting\` component that accepts \`name\` (required) and \`greeting\` (optional, defaults to "Hello"). Render them in App.svelte.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Rest Props and Spreading

Use rest syntax to collect extra props, then spread them onto an element. This is essential for wrapper components.

\`\`\`svelte
<script lang="ts">
  let { variant = 'primary', ...rest } = $props();
</script>

<button class={variant} {...rest}>
  Click me
</button>
\`\`\`

**Task:** Add rest props to your component and spread them onto the root element so consumers can pass arbitrary HTML attributes.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Typed Props

For TypeScript projects, define a type or interface for your props to get full type checking.

\`\`\`svelte
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    title: string;
    count?: number;
  }

  let { title, count = 0, ...rest }: Props = $props();
</script>
\`\`\`

**Task:** Add a TypeScript interface for your component's props and apply it to the \`$props()\` call.`
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
</script>

<!-- TODO: Use the Greeting component with props -->
<Greeting />

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
  // TODO: Use $props() to accept name and greeting
</script>

<p>Replace me with a greeting</p>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Greeting from './Greeting.svelte';
</script>

<Greeting name="World" />
<Greeting name="Svelte" greeting="Hey" class="highlight" />

<style>
  :global(body) {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  :global(.highlight) {
    color: #6366f1;
    font-weight: bold;
  }
</style>`
		},
		{
			name: 'Greeting.svelte',
			path: '/Greeting.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
    name: string;
    greeting?: string;
  }

  let { name, greeting = 'Hello', ...rest }: Props = $props();
</script>

<p {...rest}>{greeting}, {name}!</p>`
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
