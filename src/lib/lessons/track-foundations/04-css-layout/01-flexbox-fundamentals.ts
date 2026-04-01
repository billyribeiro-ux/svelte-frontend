import type { Lesson } from '$types/lesson';

export const flexboxFundamentals: Lesson = {
	id: 'foundations.css-layout.flexbox-fundamentals',
	slug: 'flexbox-fundamentals',
	title: 'Flexbox Fundamentals',
	description: 'Learn flex-direction, justify-content, align-items, and gap to build flexible one-dimensional layouts.',
	trackId: 'foundations',
	moduleId: 'css-layout',
	order: 1,
	estimatedMinutes: 15,
	concepts: ['css.flexbox', 'css.flex-direction', 'css.alignment'],
	prerequisites: [],

	content: [
		{
			type: 'text',
			content: `# Flexbox Fundamentals

Flexbox is a one-dimensional layout system for arranging items in rows or columns.

Key concepts:
- **\`display: flex\`** — Activates flexbox on a container
- **\`flex-direction\`** — Row (default) or column
- **\`justify-content\`** — Alignment along the main axis
- **\`align-items\`** — Alignment along the cross axis
- **\`gap\`** — Space between flex items`
		},
		{
			type: 'concept-callout',
			content: 'css.flexbox'
		},
		{
			type: 'text',
			content: `## Creating a Flex Container

Any element becomes a flex container with \`display: flex\`. Its direct children become flex items.

Look at the starter code. The navigation items are stacked vertically.

**Task:** Add \`display: flex\` and \`gap: 1rem\` to the \`.nav\` container to lay items out horizontally.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Justify and Align

\`justify-content\` controls the main axis (horizontal in a row):
- \`flex-start\`, \`center\`, \`flex-end\`, \`space-between\`, \`space-around\`, \`space-evenly\`

\`align-items\` controls the cross axis (vertical in a row):
- \`flex-start\`, \`center\`, \`flex-end\`, \`stretch\`, \`baseline\`

**Task:** Set \`justify-content: space-between\` and \`align-items: center\` on the \`.nav\` container.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to visualize the flex container boundaries and how items are distributed along the main and cross axes.'
		},
		{
			type: 'text',
			content: `## Flex Wrapping

By default, flex items try to fit on one line. \`flex-wrap: wrap\` lets them wrap to the next line.

\`\`\`css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
\`\`\`

**Task:** Add \`flex-wrap: wrap\` to the \`.cards\` container so cards wrap on smaller viewports.`
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
  let navItems = $state(['Home', 'About', 'Projects', 'Contact']);
  let cards = $state(['Design', 'Develop', 'Deploy']);
</script>

<nav class="nav">
  {#each navItems as item}
    <a href="#{item.toLowerCase()}">{item}</a>
  {/each}
</nav>

<section class="cards">
  {#each cards as card}
    <div class="card">
      <h3>{card}</h3>
      <p>Learn about the {card.toLowerCase()} phase.</p>
    </div>
  {/each}
</section>

<style>
  .nav {
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .nav a {
    color: var(--sf-accent, #6366f1);
    text-decoration: none;
    font-family: system-ui, sans-serif;
  }

  .cards {
    padding: 1rem;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    min-width: 200px;
    font-family: system-ui, sans-serif;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  /* TODO: Add flexbox properties */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let navItems = $state(['Home', 'About', 'Projects', 'Contact']);
  let cards = $state(['Design', 'Develop', 'Deploy']);
</script>

<nav class="nav">
  {#each navItems as item}
    <a href="#{item.toLowerCase()}">{item}</a>
  {/each}
</nav>

<section class="cards">
  {#each cards as card}
    <div class="card">
      <h3>{card}</h3>
      <p>Learn about the {card.toLowerCase()} phase.</p>
    </div>
  {/each}
</section>

<style>
  .nav {
    padding: 1rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
  }

  .nav a {
    color: var(--sf-accent, #6366f1);
    text-decoration: none;
    font-family: system-ui, sans-serif;
  }

  .cards {
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .card {
    background: #f8fafc;
    padding: 1.5rem;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
    min-width: 200px;
    font-family: system-ui, sans-serif;
  }

  .card h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add display: flex and gap to the nav container',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'display: flex' },
						{ type: 'contains', value: 'gap: 1rem' }
					]
				}
			},
			hints: [
				'`display: flex` makes the container a flex container.',
				'`gap` adds space between flex items without margins.',
				'Add to `.nav`: `display: flex; gap: 1rem;`'
			],
			conceptsTested: ['css.flexbox']
		},
		{
			id: 'cp-2',
			description: 'Set justify-content and align-items on the nav',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'justify-content: space-between' },
						{ type: 'contains', value: 'align-items: center' }
					]
				}
			},
			hints: [
				'`justify-content` distributes items along the main axis.',
				'`space-between` places equal space between items, pushing the first and last to the edges.',
				'Add to `.nav`: `justify-content: space-between; align-items: center;`'
			],
			conceptsTested: ['css.alignment']
		},
		{
			id: 'cp-3',
			description: 'Add flex-wrap to the cards container',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'flex-wrap: wrap' }
					]
				}
			},
			hints: [
				'`flex-wrap: wrap` allows items to wrap to the next line.',
				'Add `display: flex`, `flex-wrap: wrap`, and `gap: 1rem` to `.cards`.',
				'Add to `.cards`: `display: flex; flex-wrap: wrap; gap: 1rem;`'
			],
			conceptsTested: ['css.flexbox']
		}
	]
};
