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

When you put content between a component's opening and closing tags, Svelte 5 automatically creates a \`children\` snippet. This replaces the default \`<slot>\` from Svelte 4.

The component receives \`children\` as a prop and renders it with \`{@render children()}\`.`
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

**Your task:** Create a \`Panel\` wrapper component that renders its children inside a styled container.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Combining children with Named Snippets

You can mix the implicit \`children\` snippet with explicit named snippets. Content not inside a named snippet block becomes \`children\`.

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

**Task:** Create a \`Dialog\` component that accepts \`title\`, \`children\`, and \`actions\` snippets. Use all three in App.svelte.`
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
