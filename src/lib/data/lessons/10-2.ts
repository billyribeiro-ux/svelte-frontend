import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-2',
		title: 'Passing Snippets to Components',
		phase: 3,
		module: 10,
		lessonIndex: 2
	},
	description: `Snippets become truly powerful when passed to components as props. Any content placed between a component's opening and closing tags becomes the implicit "children" snippet. You can also pass named snippets as explicit props. This replaces the old slot system with something more flexible and type-safe.

Components can render these snippets with {@render}, check if they exist, and provide fallback content when they're not supplied.`,
	objectives: [
		'Pass content to components as the implicit children snippet',
		'Accept and render snippet props inside a component',
		'Provide fallback content when a snippet is not passed',
		'Use named snippets to fill multiple content areas'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  // A simple Card component defined inline for demonstration
  // In real apps, this would be in its own file

  // Simulating component behavior with snippets
  let showFooter: boolean = $state(true);
</script>

<!-- Snippet-based Card component pattern -->
{#snippet card(title: string, children: Snippet, footer?: Snippet)}
  <div class="card">
    <div class="card-header">
      <h2>{title}</h2>
    </div>
    <div class="card-body">
      {@render children()}
    </div>
    {#if footer}
      <div class="card-footer">
        {@render footer()}
      </div>
    {/if}
  </div>
{/snippet}

<!-- Define content snippets -->
{#snippet mainContent()}
  <p>This is the card body content passed as a snippet.</p>
  <p>Snippets can contain <strong>any markup</strong> you want.</p>
{/snippet}

{#snippet footerContent()}
  <button onclick={() => alert('Clicked!')}>Action</button>
  <span>Footer info here</span>
{/snippet}

{#snippet emptyFooter()}
  <!-- intentionally empty for demo -->
{/snippet}

<main>
  <h1>Passing Snippets to Components</h1>

  <p><em>In real components, content between tags becomes the "children" snippet. Named snippets become props. Here we simulate the pattern:</em></p>

  <!-- Card with both body and footer -->
  {@render card('Full Card', mainContent, showFooter ? footerContent : undefined)}

  <!-- Card with body only, no footer -->
  {@render card('Simple Card', mainContent)}

  <label>
    <input type="checkbox" bind:checked={showFooter} />
    Show footer on first card
  </label>

  <hr />

  <h2>How It Works in Components</h2>
  <pre>{\`<!-- Parent: passing snippets -->
<Card title="Hello">
  <p>This becomes {children}</p>

  {#snippet footer()}
    <button>Save</button>
  {/snippet}
</Card>

<!-- Card.svelte: receiving snippets -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { title, children, footer }:
    { title: string; children: Snippet;
      footer?: Snippet } = $props();
</script>

<div class="card">
  <h2>{title}</h2>
  {@render children()}
  {#if footer}
    {@render footer()}
  {/if}
</div>\`}</pre>
</main>

<style>
  main { max-width: 550px; margin: 0 auto; font-family: sans-serif; }
  .card { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 1rem; overflow: hidden; }
  .card-header { background: #f5f5f5; padding: 0.75rem 1rem; border-bottom: 1px solid #ddd; }
  .card-header h2 { margin: 0; font-size: 1.1rem; }
  .card-body { padding: 1rem; }
  .card-footer { padding: 0.75rem 1rem; border-top: 1px solid #ddd; background: #fafafa; display: flex; gap: 1rem; align-items: center; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.85rem; }
  label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
