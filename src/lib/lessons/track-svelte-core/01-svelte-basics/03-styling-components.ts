import type { Lesson } from '$types/lesson';

export const stylingComponents: Lesson = {
	id: 'svelte-core.svelte-basics.styling-components',
	slug: 'styling-components',
	title: 'Styling Components',
	description: 'Learn how Svelte scopes CSS to components, and use class directives and CSS custom properties.',
	trackId: 'svelte-core',
	moduleId: 'svelte-basics',
	order: 3,
	estimatedMinutes: 12,
	concepts: ['svelte5.styles.scoped', 'svelte5.styles.class-directive', 'css.custom-properties'],
	prerequisites: ['svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# Styling Svelte Components

CSS inside a \`<style>\` block is **scoped** to the component. This means styles won't leak out to other components — a huge advantage over traditional CSS.`
		},
		{
			type: 'text',
			content: `## Scoped Styles

Every selector inside \`<style>\` gets a unique hash appended by the Svelte compiler. The class \`.card\` in one component won't affect \`.card\` in another.

**Task:** Add a \`<style>\` block with styles for the \`.card\` class. Give it padding, a background, and rounded corners.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## The class: Directive

Svelte provides a shorthand for toggling classes:

\`\`\`svelte
<div class:active={isActive}>
\`\`\`

This adds the \`active\` class when \`isActive\` is truthy.

**Task:** Add a \`class:highlighted\` directive to the card that toggles when clicked.`
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
  let highlighted = false;
</script>

<div class="card" onclick={() => highlighted = !highlighted}>
  <h2>My Card</h2>
  <p>Click me to highlight!</p>
</div>

<!-- Add your <style> block here -->`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let highlighted = false;
</script>

<div class="card" class:highlighted onclick={() => highlighted = !highlighted}>
  <h2>My Card</h2>
  <p>Click me to highlight!</p>
</div>

<style>
  .card {
    padding: 1.5rem;
    background: #1e1e2e;
    border-radius: 12px;
    cursor: pointer;
    transition: all 200ms ease;
    color: white;
  }

  .card:hover {
    background: #2a2a3e;
  }

  .highlighted {
    border: 2px solid #6366f1;
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add a <style> block with styles for the .card class',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<style>' },
						{ type: 'contains', value: '.card' },
						{ type: 'contains', value: 'padding' }
					]
				}
			},
			hints: [
				'Add a `<style>` block at the bottom of the component.',
				'Inside it, target `.card` and add CSS properties like `padding`, `background`, and `border-radius`.',
				'Example: `.card { padding: 1.5rem; background: #1e1e2e; border-radius: 12px; }`'
			],
			conceptsTested: ['svelte5.styles.scoped']
		},
		{
			id: 'cp-2',
			description: 'Add a class:highlighted directive to the card div',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'class:highlighted' }]
				}
			},
			hints: [
				'The `class:` directive adds a class conditionally.',
				'Add `class:highlighted` to the div — when the variable `highlighted` matches the class name, you can use the shorthand.',
				'Change `<div class="card"` to `<div class="card" class:highlighted`'
			],
			conceptsTested: ['svelte5.styles.class-directive']
		}
	]
};
