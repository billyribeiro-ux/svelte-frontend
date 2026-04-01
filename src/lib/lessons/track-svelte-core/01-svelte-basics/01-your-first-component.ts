import type { Lesson } from '$types/lesson';

export const yourFirstComponent: Lesson = {
	id: 'svelte-core.svelte-basics.your-first-component',
	slug: 'your-first-component',
	title: 'Your First Svelte Component',
	description: 'Create your very first Svelte 5 component and understand the three sections: script, template, and style.',
	trackId: 'svelte-core',
	moduleId: 'svelte-basics',
	order: 1,
	estimatedMinutes: 10,
	concepts: ['svelte5.components.basic', 'svelte5.template.expressions'],
	prerequisites: [],

	content: [
		{
			type: 'text',
			content: `# Your First Svelte Component

Every Svelte component is a \`.svelte\` file with up to three sections:

1. **\`<script>\`** — Your component's logic (TypeScript)
2. **Template** — Your HTML markup (the body of the file)
3. **\`<style>\`** — Scoped CSS that only affects this component

Let's build a simple greeting component.`
		},
		{
			type: 'text',
			content: `## The Script Block

Inside \`<script lang="ts">\`, you write TypeScript. Variables declared here can be used in your template using curly braces \`{variableName}\`.

**Your task:** Change the \`name\` variable in the editor to your own name, and watch the preview update.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Template Expressions

Anything inside \`{curly braces}\` in the template is a JavaScript expression. You can use variables, call functions, or do math.

**Try it:** Add a second line below the greeting that shows \`name.length\` — the number of characters in the name.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how Svelte compiles your template expressions into efficient DOM updates. Notice there is no virtual DOM — Svelte updates the exact text node that changed.'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let name = 'World';
</script>

<h1>Hello, {name}!</h1>

<style>
  h1 {
    color: var(--sf-accent, #6366f1);
    font-family: system-ui, sans-serif;
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
  let name = 'SvelteForge';
</script>

<h1>Hello, {name}!</h1>
<p>Your name has {name.length} characters.</p>

<style>
  h1 {
    color: var(--sf-accent, #6366f1);
    font-family: system-ui, sans-serif;
  }
  p {
    color: #666;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Change the name variable to something other than "World"',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'not-contains', value: "let name = 'World'" },
						{ type: 'contains', value: 'let name' }
					]
				}
			},
			hints: [
				'Find the line that says `let name = \'World\'` in the script block.',
				'Change `\'World\'` to any other string, like your name.',
				'For example: `let name = \'SvelteForge\';`'
			],
			conceptsTested: ['svelte5.components.basic']
		},
		{
			id: 'cp-2',
			description: 'Display the length of the name using a template expression',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [{ type: 'contains', value: 'name.length' }]
				}
			},
			hints: [
				'Template expressions go inside `{curly braces}` in the HTML.',
				'You can access the `.length` property of a string.',
				'Add something like `<p>{name.length} characters</p>` to the template.'
			],
			conceptsTested: ['svelte5.template.expressions']
		}
	]
};
