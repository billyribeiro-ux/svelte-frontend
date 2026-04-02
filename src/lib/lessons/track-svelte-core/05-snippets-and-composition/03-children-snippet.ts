import type { Lesson } from '$types/lesson';

export const childrenSnippet: Lesson = {
	id: 'svelte-core.snippets-and-composition.children-snippet',
	slug: 'children-snippet',
	title: 'The Children Snippet',
	description:
		'Use the implicit children snippet for component composition, replacing default slots.',
	trackId: 'svelte-core',
	moduleId: 'snippets-and-composition',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['svelte5.snippets.children', 'svelte5.composition.wrapper'],
	prerequisites: ['svelte5.snippets.define', 'svelte5.snippets.as-props'],

	content: [
		{
			type: 'text',
			content: `# The Children Snippet

## WHY Implicit Children Exist

Every component framework needs a way to express "put content here." In HTML, elements naturally wrap content: \`<div>stuff</div>\`. When you build components, you want the same ergonomics: \`<Panel>stuff</Panel>\`. Without implicit children, you would need to wrap every piece of inner content in an explicit \`{#snippet children()}\` block, which would make even simple wrapper components verbose:

\`\`\`svelte
<!-- Without implicit children, this would be necessary every time -->
<Panel>
  {#snippet children()}
    <p>Just some content</p>
  {/snippet}
</Panel>
\`\`\`

That is clearly worse than:

\`\`\`svelte
<Panel>
  <p>Just some content</p>
</Panel>
\`\`\`

The \`children\` snippet is Svelte 5's answer. When you put content between a component's opening and closing tags (and that content is not inside a named \`{#snippet}\` block), the compiler automatically wraps it in a snippet named \`children\` and passes it as a prop. The component receives \`children\` as a \`Snippet\` prop and renders it with \`{@render children()}\`.

### How This Replaces Default Slots

In Svelte 4, \`<slot />\` (without a name) rendered whatever content the parent placed between the component tags. The \`children\` snippet is the direct replacement, but with key improvements:

1. **Explicit in the child component.** The child must declare \`children: Snippet\` in its props and call \`{@render children()}\`. There is no hidden rendering -- if the child forgets to render children, nothing appears. With slots, forgetting \`<slot />\` would silently discard the content, which was a common source of bugs.

2. **Composable with named snippets.** You can mix \`children\` with named snippets in a single component. Content not wrapped in \`{#snippet name()}\` becomes \`children\`; content wrapped in a named snippet becomes that prop. This model is simpler than Svelte 4's named-vs-default slot rules.

3. **Type-checkable.** You can mark \`children\` as optional (\`children?: Snippet\`) or required (\`children: Snippet\`), and the compiler enforces it. A component that requires content will error if used self-closing.

### What the Compiler Does

When the compiler sees:

\`\`\`svelte
<Panel>
  <h3>Title</h3>
  <p>Body text</p>
</Panel>
\`\`\`

It generates code equivalent to:

\`\`\`javascript
Panel({
  children: () => {
    // create <h3>Title</h3> and <p>Body text</p> DOM nodes
  }
});
\`\`\`

The \`children\` prop is just a regular snippet prop with a special name. The compiler uses the name \`children\` by convention, but mechanically it works identically to any named snippet prop.

### Default Content Pattern

A common need is to provide fallback content when no children are passed. Since \`children\` is just a prop, you handle this with optional typing and conditional rendering:

\`\`\`svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children?: Snippet } = $props();
</script>

{#if children}
  {@render children()}
{:else}
  <p>Default content when nothing is passed</p>
{/if}
\`\`\`

This replaces Svelte 4's \`<slot>fallback</slot>\` pattern with standard conditional logic that is easier to understand and debug.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.snippets.children'
		},
		{
			type: 'text',
			content: `## Using the children Snippet

\`\`\`svelte
<!-- Panel.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div class="panel">
  {@render children()}
</div>

<!-- App.svelte -->
<Panel>
  <p>This becomes the children snippet!</p>
</Panel>
\`\`\`

### Decision Framework: When to Use children vs. Named Snippets

Use **children** when:
- Your component is a **wrapper** that adds styling, layout, or behavior around arbitrary content (panels, cards, modals, tooltips, scroll containers)
- The content has a single logical purpose -- it is "the content" of the component
- You want maximum ergonomic simplicity for consumers

Use **named snippets** when:
- Your component has **multiple content zones** (header, body, footer, sidebar)
- The content zones have different semantic roles
- You need to pass data back to the parent for rendering

Use **both** when:
- Your component has a primary content area (children) plus auxiliary areas (named snippets)
- Think: a dialog with a main body (children), a title bar (named), and action buttons (named)

**Your task:** Create a \`Panel\` wrapper component that renders its children inside a styled container. This is the most fundamental use of \`children\` -- a pure wrapper that adds visual chrome around arbitrary content.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Combining children with Named Snippets

The real power emerges when you combine the implicit \`children\` snippet with explicit named snippets. Content not inside a named snippet block becomes \`children\`. This creates a natural hierarchy: the "main" content is children, and auxiliary content zones are named.

\`\`\`svelte
<Dialog>
  {#snippet title()}
    <h2>Confirm</h2>
  {/snippet}

  <p>Are you sure?</p>  <!-- This is children -->

  {#snippet actions()}
    <button>OK</button>
  {/snippet}
</Dialog>
\`\`\`

### WHY This Layout Works

This pattern mirrors how developers naturally think about component structure. A dialog has a title, a body, and actions. The body is the "main thing" so it gets the frictionless \`children\` treatment. The title and actions are structural elements that benefit from explicit naming.

The compiler processes the content inside \`<Dialog>\` and groups it:
- \`{#snippet title()}\` block -> \`title\` prop
- \`{#snippet actions()}\` block -> \`actions\` prop
- Everything else (the \`<p>Are you sure?</p>\`) -> \`children\` prop

### Ordering Does Not Matter

The named snippet blocks and children content can appear in any order inside the component tag. The compiler groups them by type, not position. This means you can organize the source code for readability rather than worrying about structural requirements.

### Nested Wrapper Components

Children snippets compose naturally. A \`Page\` component can wrap a \`Card\` component that wraps a \`Panel\` component, each using \`children\` to pass content through:

\`\`\`svelte
<Page>
  <Card>
    <Panel>
      <p>Deeply nested, but simple to read</p>
    </Panel>
  </Card>
</Page>
\`\`\`

Each layer receives the content below it as its \`children\` snippet. The compiler generates nested function calls, but the template reads like natural HTML nesting.

**Task:** Create a \`Dialog\` component that accepts \`title\`, \`children\`, and \`actions\` snippets. Use all three in App.svelte. Pay attention to how the children content naturally fills the "body" role without needing a named snippet.`
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
  import Panel from './Panel.svelte';
  import Dialog from './Dialog.svelte';
</script>

<div>
  <!-- TODO: Use Panel with children content -->

  <!-- TODO: Use Dialog with title, children, and actions -->
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>`
		},
		{
			name: 'Panel.svelte',
			path: '/Panel.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Accept children snippet prop
</script>

<!-- TODO: Render children inside a styled div -->
<div class="panel">Replace me</div>

<style>
  .panel {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'Dialog.svelte',
			path: '/Dialog.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Accept title, children, and actions snippet props
</script>

<!-- TODO: Render dialog with all three snippets -->
<div class="dialog">Replace me</div>

<style>
  .dialog {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .dialog-title {
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .dialog-body {
    padding: 1rem;
  }

  .dialog-actions {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
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
  import Panel from './Panel.svelte';
  import Dialog from './Dialog.svelte';
</script>

<div>
  <Panel>
    <h3>Welcome</h3>
    <p>This content is passed as the children snippet.</p>
  </Panel>

  <Dialog>
    {#snippet title()}
      <h2>Confirm Action</h2>
    {/snippet}

    <p>Are you sure you want to proceed?</p>

    {#snippet actions()}
      <button>Cancel</button>
      <button>Confirm</button>
    {/snippet}
  </Dialog>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>`
		},
		{
			name: 'Panel.svelte',
			path: '/Panel.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="panel">
  {@render children()}
</div>

<style>
  .panel {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
  }
</style>`
		},
		{
			name: 'Dialog.svelte',
			path: '/Dialog.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, children, actions }: {
    title: Snippet;
    children: Snippet;
    actions: Snippet;
  } = $props();
</script>

<div class="dialog">
  <div class="dialog-title">{@render title()}</div>
  <div class="dialog-body">{@render children()}</div>
  <div class="dialog-actions">{@render actions()}</div>
</div>

<style>
  .dialog {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .dialog-title {
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .dialog-body {
    padding: 1rem;
  }

  .dialog-actions {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a Panel component that renders its children snippet',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'children' },
						{ type: 'contains', value: '{@render children' }
					]
				}
			},
			hints: [
				'Import `Snippet` from svelte and accept a `children` prop.',
				'Destructure: `let { children }: { children: Snippet } = $props();`',
				'Render inside the panel div: `{@render children()}`'
			],
			conceptsTested: ['svelte5.snippets.children']
		},
		{
			id: 'cp-2',
			description: 'Create a Dialog with title, children, and actions snippets',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{@render title' },
						{ type: 'contains', value: '{@render children' },
						{ type: 'contains', value: '{@render actions' }
					]
				}
			},
			hints: [
				'Accept three Snippet props: title, children, and actions.',
				'Render each in its own section of the dialog.',
				'In App.svelte, use `{#snippet title()}` and `{#snippet actions()}` inside `<Dialog>`, with plain content for children.'
			],
			conceptsTested: ['svelte5.snippets.children', 'svelte5.composition.wrapper']
		}
	]
};
