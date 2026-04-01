import type { Lesson } from '$types/lesson';

export const templateExpressions: Lesson = {
	id: 'svelte-core.svelte-basics.template-expressions',
	slug: 'template-expressions',
	title: 'Template Expressions & Logic',
	description: 'Use JavaScript expressions in your templates and learn Svelte\'s control flow blocks.',
	trackId: 'svelte-core',
	moduleId: 'svelte-basics',
	order: 2,
	estimatedMinutes: 12,
	concepts: ['svelte5.template.expressions', 'svelte5.template.if', 'svelte5.template.each'],
	prerequisites: ['svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# Template Expressions & Logic

Svelte templates are HTML with superpowers. You can embed any JavaScript expression inside curly braces, and use special blocks for conditional rendering and loops.`
		},
		{
			type: 'text',
			content: `## Conditional Rendering with {#if}

Use \`{#if condition}\` to conditionally show content:

\`\`\`svelte
{#if loggedIn}
  <p>Welcome back!</p>
{:else}
  <p>Please log in.</p>
{/if}
\`\`\`

**Task:** Add an \`{#if}\` block that shows "Even!" when the count is even, and "Odd!" when it's odd.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Looping with {#each}

Use \`{#each array as item}\` to render a list:

\`\`\`svelte
{#each items as item}
  <li>{item}</li>
{/each}
\`\`\`

**Task:** Create a \`colors\` array and render each color as a list item.`
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
  let count = 0;
</script>

<button onclick={() => count++}>
  Count: {count}
</button>

<!-- Add your {#if} block here -->

<!-- Add your {#each} block here -->

<style>
  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
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
  let count = 0;
  let colors = ['red', 'green', 'blue', 'purple'];
</script>

<button onclick={() => count++}>
  Count: {count}
</button>

{#if count % 2 === 0}
  <p>Even!</p>
{:else}
  <p>Odd!</p>
{/if}

<ul>
  {#each colors as color}
    <li style="color: {color}">{color}</li>
  {/each}
</ul>

<style>
  button {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add an {#if} block that shows "Even!" or "Odd!" based on count',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#if' },
						{ type: 'contains', value: '{:else}' },
						{ type: 'contains', value: '{/if}' }
					]
				}
			},
			hints: [
				'Use the modulo operator `%` to check if a number is even: `count % 2 === 0`.',
				'Wrap your conditional in `{#if count % 2 === 0}...{:else}...{/if}`.',
				'Add `{#if count % 2 === 0}<p>Even!</p>{:else}<p>Odd!</p>{/if}` to the template.'
			],
			conceptsTested: ['svelte5.template.if']
		},
		{
			id: 'cp-2',
			description: 'Create a colors array and render each item with {#each}',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#each' },
						{ type: 'contains', value: '{/each}' }
					]
				}
			},
			hints: [
				'First, add an array in the script block: `let colors = [\'red\', \'green\', \'blue\'];`',
				'Then use `{#each colors as color}` to loop through the array.',
				'Full pattern: `{#each colors as color}<li>{color}</li>{/each}`'
			],
			conceptsTested: ['svelte5.template.each']
		}
	]
};
