import type { Lesson } from '$types/lesson';

export const snippetBasics: Lesson = {
	id: 'svelte-core.snippets-and-composition.snippet-basics',
	slug: 'snippet-basics',
	title: 'Snippet Basics',
	description:
		'Learn to define reusable template fragments with {#snippet} and render them with {@render}.',
	trackId: 'svelte-core',
	moduleId: 'snippets-and-composition',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['svelte5.snippets.define', 'svelte5.snippets.render'],
	prerequisites: ['svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# Snippet Basics

Snippets are Svelte 5's way of defining reusable template fragments within a component. They replace the need for creating separate components for small, local pieces of UI.

Define a snippet with \`{#snippet name()}\` and render it with \`{@render name()}\`.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.snippets.define'
		},
		{
			type: 'text',
			content: `## Defining and Rendering Snippets

\`\`\`svelte
{#snippet greeting(name)}
  <p>Hello, {name}!</p>
{/snippet}

{@render greeting('World')}
{@render greeting('Svelte')}
\`\`\`

Snippets can accept parameters, making them like local template functions.

**Your task:** Define a \`card\` snippet that accepts a \`title\` and \`body\`, then render it multiple times with different content.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Snippets with Complex Markup

Snippets can contain any markup, including event handlers, conditional logic, and styling.

\`\`\`svelte
{#snippet alertBox(message, type)}
  <div class="alert alert-{type}">
    <strong>{type}:</strong> {message}
  </div>
{/snippet}
\`\`\`

**Task:** Create a \`userCard\` snippet that displays a user's name, role, and an active/inactive status badge.`
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
  const users = [
    { name: 'Alice', role: 'Admin', active: true },
    { name: 'Bob', role: 'Editor', active: false },
    { name: 'Carol', role: 'Viewer', active: true }
  ];
</script>

<div>
  <!-- TODO: Define a card snippet -->
  <!-- TODO: Define a userCard snippet -->
  <!-- TODO: Render snippets -->
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
  }

  .badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
  }

  .active { background: #d1fae5; color: #065f46; }
  .inactive { background: #fee2e2; color: #991b1b; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  const users = [
    { name: 'Alice', role: 'Admin', active: true },
    { name: 'Bob', role: 'Editor', active: false },
    { name: 'Carol', role: 'Viewer', active: true }
  ];
</script>

{#snippet card(title: string, body: string)}
  <div class="card">
    <h3>{title}</h3>
    <p>{body}</p>
  </div>
{/snippet}

{#snippet userCard(name: string, role: string, active: boolean)}
  <div class="card">
    <h3>{name}</h3>
    <p>Role: {role}</p>
    <span class="badge {active ? 'active' : 'inactive'}">
      {active ? 'Active' : 'Inactive'}
    </span>
  </div>
{/snippet}

<div>
  {@render card('Welcome', 'This is a reusable card snippet.')}
  {@render card('About', 'Snippets replace local template duplication.')}

  <hr />

  {#each users as user}
    {@render userCard(user.name, user.role, user.active)}
  {/each}
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
  }

  .badge {
    display: inline-block;
    padding: 0.125rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
  }

  .active { background: #d1fae5; color: #065f46; }
  .inactive { background: #fee2e2; color: #991b1b; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Define a card snippet and render it with {@render}',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#snippet card' },
						{ type: 'contains', value: '{@render card' }
					]
				}
			},
			hints: [
				'Use `{#snippet card(title, body)}...{/snippet}` to define the snippet.',
				'Render it with `{@render card(\'Title\', \'Body text\')}`.',
				'Define `{#snippet card(title: string, body: string)}<div class="card"><h3>{title}</h3><p>{body}</p></div>{/snippet}` and render with `{@render card(...)}`.'
			],
			conceptsTested: ['svelte5.snippets.define', 'svelte5.snippets.render']
		},
		{
			id: 'cp-2',
			description: 'Create a userCard snippet and render it for each user',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#snippet userCard' },
						{ type: 'contains', value: '{@render userCard' }
					]
				}
			},
			hints: [
				'Define a `userCard` snippet that accepts name, role, and active parameters.',
				'Use `{#each users as user}` and `{@render userCard(user.name, user.role, user.active)}`.',
				'Create `{#snippet userCard(name, role, active)}` with a card div, then loop with `{#each}` calling `{@render userCard(...)}`.'
			],
			conceptsTested: ['svelte5.snippets.define', 'svelte5.snippets.render']
		}
	]
};
