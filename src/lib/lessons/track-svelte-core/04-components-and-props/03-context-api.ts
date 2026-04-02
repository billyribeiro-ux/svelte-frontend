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
	estimatedMinutes: 25,
	concepts: ['svelte5.context.set', 'svelte5.context.get', 'svelte5.context.vs-props'],
	prerequisites: ['svelte5.props.destructuring'],

	content: [
		{
			type: 'text',
			content: `# The Context API

Svelte's Context API solves a specific and common problem: how do you share data with deeply nested components without passing props through every intermediate layer? Understanding *why* context exists — and when *not* to use it — is just as important as understanding the API itself.

## Why Context Exists: The Prop Drilling Problem

Consider a theme system. Your App component defines the current theme (dark or light). A button component six levels deep needs to read it. Without context, every component in the chain must accept and forward a \`theme\` prop — even if five of those six components do not use it themselves.

\`\`\`
App (owns theme)
  └─ Layout (forwards theme)
      └─ Sidebar (forwards theme)
          └─ NavSection (forwards theme)
              └─ NavGroup (forwards theme)
                  └─ NavItem (forwards theme)
                      └─ ThemedButton (actually uses theme)
\`\`\`

This is **prop drilling**. It creates several problems:
- **Coupling:** Every intermediate component must know about a prop it does not use.
- **Refactoring pain:** Adding a field to the theme object means updating every component in the chain.
- **Noise:** Component interfaces become cluttered with pass-through props that obscure the component's actual purpose.

Context breaks this chain. The App sets the theme once, and ThemedButton reads it directly — no intermediaries involved.

## setContext and getContext Mechanics

Context is set during component **initialization** (the top-level \`<script>\` block, not inside an event handler or effect) using \`setContext(key, value)\`. Any descendant component can retrieve it with \`getContext(key)\`.

\`\`\`svelte
<!-- Provider.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';

  setContext('theme', { color: '#6366f1', mode: 'dark' });
</script>

<slot />
\`\`\`

\`\`\`svelte
<!-- DeepChild.svelte (any depth below Provider) -->
<script lang="ts">
  import { getContext } from 'svelte';

  const theme = getContext<{ color: string; mode: string }>('theme');
</script>

<p style:color={theme.color}>Themed text ({theme.mode} mode)</p>
\`\`\`

**Critical rule:** Both \`setContext\` and \`getContext\` must be called synchronously during component initialization. You cannot call them inside \`$effect\`, inside event handlers, or inside \`setTimeout\`. The Svelte runtime uses the call stack to determine which component is currently initializing, and that information is only available during the synchronous initialization phase.

**Key naming:** The key can be any value — a string, a Symbol, or even an object reference. Symbols are recommended for libraries to avoid name collisions:

\`\`\`typescript
// theme-context.ts
export const THEME_KEY = Symbol('theme');

// Provider.svelte
import { THEME_KEY } from './theme-context';
setContext(THEME_KEY, themeValue);

// Consumer.svelte
import { THEME_KEY } from './theme-context';
const theme = getContext(THEME_KEY);
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'svelte5.context.set'
		},
		{
			type: 'text',
			content: `## Context Scope: Per-Component-Tree, Not Global

A common misconception is that context is global — it is not. Context is scoped to the **component tree** rooted at the component that called \`setContext\`. Only descendants of that component can access it.

This means you can have **multiple instances** of the same provider, each with different values, and they do not interfere:

\`\`\`svelte
<!-- App.svelte -->
<ThemeProvider mode="dark">
  <Sidebar />  <!-- reads dark theme -->
</ThemeProvider>

<ThemeProvider mode="light">
  <MainContent />  <!-- reads light theme -->
</ThemeProvider>
\`\`\`

Each ThemeProvider creates its own context scope. Components inside Sidebar see "dark" and components inside MainContent see "light." If context were global, the second provider would overwrite the first.

This scoping also means \`getContext\` walks **up** the component tree from the calling component until it finds a matching key. If no ancestor has set that key, \`getContext\` returns \`undefined\` (and TypeScript's type will be wrong, so guard accordingly).

**Your task:** Set a theme context in App.svelte and read it in a nested ThemedButton component. Pass an object with \`color\` and \`mode\` properties.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Reactive Context with Getter Functions

Here is a subtlety that trips up many developers: **context values are not reactive by default.** If you call \`setContext('count', 42)\` and later change the count, the child that called \`getContext('count')\` still sees 42. The value was captured at initialization time.

To make context reactive, pass a **getter function** instead of a raw value. The child calls the getter inside a reactive context (like \`$derived\`), and Svelte's reactivity system tracks the dependency.

\`\`\`svelte
<!-- Parent.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';

  let dark = $state(true);
  let theme = $derived({
    color: dark ? '#6366f1' : '#f59e0b',
    bg: dark ? '#1e1e2e' : '#fffbeb',
    mode: dark ? 'dark' : 'light'
  });

  // Pass a getter function, not the value itself
  setContext('theme', () => theme);
</script>
\`\`\`

\`\`\`svelte
<!-- ThemedButton.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';

  const getTheme = getContext<() => { color: string; bg: string; mode: string }>('theme');
  // Call the getter inside $derived to create a reactive binding
  let theme = $derived(getTheme());
</script>

<button style:background={theme.bg} style:color={theme.color}>
  {theme.mode} mode
</button>
\`\`\`

When \`dark\` changes in the parent, \`theme\` re-derives, and because the child calls \`getTheme()\` inside \`$derived\`, it picks up the new value. The getter function is the bridge between the parent's reactivity and the child's reactivity.

## When to Use Context vs Props vs Reactive Classes

Choosing the right data-sharing mechanism prevents architectural mistakes:

**Use props when:**
- The data flows one or two levels deep.
- The intermediate components actually use or transform the data.
- You want the data dependency to be explicit in the component's interface.

**Use context when:**
- Data needs to skip multiple component layers (3+ levels).
- The data is "ambient" — like a theme, locale, or auth state — that many unrelated descendants need.
- You are building a compound component (e.g., \`<Tabs>\` + \`<Tab>\` where Tabs provides shared state).

**Use reactive classes (module-level state) when:**
- The state is truly global — not scoped to any component tree.
- Multiple unrelated component trees need the same state (e.g., a shopping cart visible in both the header and a sidebar).
- You need to access the state outside of components (in utility functions, API layers).

## Memory Implications

Context values live as long as the component that set them. When that component is destroyed, its context is garbage-collected along with it. This is usually fine, but be aware:

- If you store large objects in context (e.g., a cache with thousands of entries), they persist for the entire lifetime of the provider component.
- Context is re-created every time the provider component mounts. If the provider is inside an \`{#if}\` block that toggles, context is set fresh each time — there is no persistence between mounts.
- Each component tree gets its own context instance. 100 instances of a provider means 100 copies of the context value in memory.

**Task:** Make the theme context reactive so toggling dark/light mode in the parent updates the child automatically. Use the getter function pattern.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Exercise: Theme Provider with Dark/Light Mode

Build a complete theme provider system that demonstrates context in a realistic scenario.

**Requirements:**
1. In App.svelte, create reactive state for dark mode (\`$state(true)\`).
2. Derive a theme object with \`color\`, \`bg\`, and \`mode\` properties using \`$derived\`.
3. Set the theme as context using a getter function: \`setContext('theme', () => theme)\`.
4. Add a checkbox to toggle dark mode.
5. In ThemedButton.svelte, retrieve the context getter and derive the current theme.
6. Style the button dynamically using the theme values (background color, text color).
7. Display the current mode name on the button text.

When you toggle the checkbox, the button should immediately update its colors. This proves that the getter function pattern creates true reactivity through context.

\`\`\`svelte
<!-- ThemedButton.svelte skeleton -->
<script lang="ts">
  import { getContext } from 'svelte';

  type Theme = { color: string; bg: string; mode: string };
  const getTheme = getContext<() => Theme>('theme');
  let theme = $derived(getTheme());
</script>

<button style:background={theme.bg} style:color={theme.color}>
  Themed Button ({theme.mode})
</button>
\`\`\`

Think about what happens if ThemedButton is rendered outside of any ThemeProvider. The \`getContext\` call would return \`undefined\`, and calling \`getTheme()\` would throw. In production code, you would add a guard: \`if (!getTheme) throw new Error('ThemedButton must be used inside a ThemeProvider')\`. This is a common pattern in component libraries to give developers clear error messages instead of cryptic runtime failures.`
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
