import type { Lesson } from '$types/lesson';

export const contextApi: Lesson = {
	id: 'svelte-core.components-and-props.context-api',
	slug: 'context-api',
	title: 'The Context API',
	description:
		'Use setContext and getContext to share data across deeply nested components without prop drilling.',
	trackId: 'svelte-core',
	moduleId: 'components-and-props',
	order: 3,
	estimatedMinutes: 15,
	concepts: ['svelte5.context.set', 'svelte5.context.get', 'svelte5.context.vs-props'],
	prerequisites: ['svelte5.props.destructuring'],

	content: [
		{
			type: 'text',
			content: `# The Context API

When you need to share data with deeply nested components, passing props through every intermediate layer gets tedious. Svelte's Context API lets a parent provide data that any descendant can access directly.

Context is set during component initialization with \`setContext\` and retrieved with \`getContext\`. It's keyed, so multiple contexts can coexist.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.context.set'
		},
		{
			type: 'text',
			content: `## Setting and Getting Context

\`\`\`svelte
<!-- Parent.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  setContext('theme', { color: '#6366f1', mode: 'dark' });
</script>

<!-- DeepChild.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';
  const theme = getContext<{ color: string; mode: string }>('theme');
</script>
\`\`\`

**Your task:** Set a theme context in App.svelte and read it in a nested \`ThemedButton\` component.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Reactive Context with $state

Context values themselves are not reactive — but you can put reactive state *inside* context. Pass an object containing \`$state\` values, and descendants will see updates.

\`\`\`svelte
<!-- Parent.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';
  let user = $state({ name: 'Alice', loggedIn: true });
  setContext('user', () => user);
</script>
\`\`\`

**Task:** Make the theme context reactive so toggling dark/light mode in the parent updates the child automatically.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { setContext } from 'svelte';
  import ThemedButton from './ThemedButton.svelte';

  // TODO: Set a theme context
</script>

<div>
  <h2>Context API Demo</h2>
  <ThemedButton />
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'ThemedButton.svelte',
			path: '/ThemedButton.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { getContext } from 'svelte';
  // TODO: Get the theme context
</script>

<!-- TODO: Style button using context values -->
<button>Themed Button</button>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { setContext } from 'svelte';
  import ThemedButton from './ThemedButton.svelte';

  let dark = $state(true);
  let theme = $derived({
    color: dark ? '#6366f1' : '#f59e0b',
    bg: dark ? '#1e1e2e' : '#fffbeb',
    mode: dark ? 'dark' : 'light'
  });

  setContext('theme', () => theme);
</script>

<div>
  <h2>Context API Demo</h2>
  <label>
    <input type="checkbox" bind:checked={dark} /> Dark mode
  </label>
  <ThemedButton />
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'ThemedButton.svelte',
			path: '/ThemedButton.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import { getContext } from 'svelte';

  const getTheme = getContext<() => { color: string; bg: string; mode: string }>('theme');
  let theme = $derived(getTheme());
</script>

<button style:background={theme.bg} style:color={theme.color}>
  Themed Button ({theme.mode})
</button>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Set a theme context and read it in ThemedButton',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'setContext' },
						{ type: 'contains', value: 'getContext' }
					]
				}
			},
			hints: [
				'Use `setContext(\'theme\', ...)` in App.svelte to provide a theme object.',
				'In ThemedButton.svelte, use `getContext(\'theme\')` to access the theme.',
				'Call `setContext(\'theme\', { color: \'#6366f1\' })` in App and `const theme = getContext(\'theme\')` in ThemedButton.'
			],
			conceptsTested: ['svelte5.context.set', 'svelte5.context.get']
		},
		{
			id: 'cp-2',
			description: 'Make the context reactive using $state and a getter function',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$state' },
						{ type: 'regex', value: 'setContext.*\\(\\)\\s*=>' }
					]
				}
			},
			hints: [
				'Context values are not reactive by default — wrap them in a function.',
				'Pass a getter function to setContext: `setContext(\'theme\', () => theme)`',
				'Use `setContext(\'theme\', () => theme)` where `theme` is derived from `$state`. In the child, call the getter: `const getTheme = getContext(...); let theme = $derived(getTheme())`'
			],
			conceptsTested: ['svelte5.context.set', 'svelte5.context.vs-props']
		}
	]
};
