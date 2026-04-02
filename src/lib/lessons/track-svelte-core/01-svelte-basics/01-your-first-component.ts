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

Every Svelte component lives in a single \`.svelte\` file that contains up to three sections:

1. **\`<script>\`** — Your component's logic (TypeScript or JavaScript)
2. **Template** — Your HTML markup (the body of the file, outside any tags)
3. **\`<style>\`** — Scoped CSS that only affects this component

This three-section structure is not arbitrary. It reflects a fundamental design philosophy: a component is the union of its behavior, its structure, and its appearance. By co-locating all three in a single file, Svelte eliminates the "file-hopping" problem that plagues projects where logic, markup, and styles live in separate directories. You open one file and you see everything that component does.

## Why Three Sections Instead of One?

React takes a different approach — JSX mixes JavaScript and markup into a single expression, and styles are typically handled by external libraries (CSS Modules, styled-components, Tailwind). Vue uses a Single File Component (SFC) format that looks similar to Svelte's three-section layout, but Vue's \`<template>\` block uses a custom template syntax compiled at build time through a virtual DOM layer.

Svelte's approach is distinct from both:

- **Unlike React JSX**, Svelte keeps HTML looking like HTML. There is no \`className\` instead of \`class\`, no \`htmlFor\` instead of \`for\`. Your template section is valid HTML with a few additions (curly braces for expressions, special blocks for control flow). This means any HTML you copy from documentation or design tools works immediately.
- **Unlike Vue SFCs**, Svelte has no virtual DOM. The template is compiled directly into imperative JavaScript that creates and updates DOM nodes. There is no runtime diffing algorithm — the compiler statically analyzes your template and generates the minimal code needed to keep the DOM in sync with your state.
- **The \`<style>\` block is automatically scoped.** Every CSS selector you write inside \`<style>\` is rewritten at compile time to only match elements within this component. You get CSS isolation without adopting BEM naming conventions, CSS Modules, or CSS-in-JS libraries. This is a zero-runtime solution — the scoping happens at build time, not in the browser.

## How the Svelte Compiler Processes a .svelte File

When you save a \`.svelte\` file, the Svelte compiler performs three phases:

1. **Parse** — The compiler reads the file and produces an Abstract Syntax Tree (AST). It identifies the \`<script>\` block, the template markup, and the \`<style>\` block as separate subtrees.
2. **Analyze** — The compiler walks the AST to determine which variables are reactive, which CSS selectors are used, and what DOM operations the template needs. It detects unused CSS selectors and warns you about them. It traces how state flows through expressions.
3. **Generate** — The compiler emits plain JavaScript (and CSS). The script block becomes module-level code. The template becomes a series of \`document.createElement\`, \`element.textContent = ...\`, and targeted update functions. The style block becomes a CSS file with hashed class selectors for scoping.

The output is a standard JavaScript module that exports a component class. There is no Svelte runtime framework loaded in the browser — just your compiled code and a tiny set of shared helper functions.

Let's build a real component — a profile card — to see all three sections working together.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.components.basic'
		},
		{
			type: 'text',
			content: `## The Script Block

Inside \`<script lang="ts">\`, you write TypeScript. Variables declared here are available in the template using curly braces \`{variableName}\`. In Svelte 5, you declare reactive state using the \`$state\` rune, but for simple static variables like strings that never change after initialization, a plain \`let\` declaration works fine.

Look at the starter code. It defines a profile card with a \`name\`, a \`role\`, and an \`avatarUrl\`. The template uses these variables to render a card layout.

**Your task:** Personalize the profile card. Change the \`name\` variable to your own name and the \`role\` to something that describes you. Watch the preview update instantly — this is the Svelte compiler at work, regenerating the component and hot-reloading it in the browser.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Template Expressions

Anything inside \`{curly braces}\` in the template is a JavaScript expression. You can reference variables, access properties, call methods, perform arithmetic, or use ternary operators. The key word is *expression* — you can use anything that produces a value, but you cannot use statements like \`if\`, \`for\`, or \`let\` inside curly braces.

Valid expressions:
- \`{name}\` — variable reference
- \`{name.toUpperCase()}\` — method call
- \`{age >= 18 ? 'Adult' : 'Minor'}\` — ternary operator
- \`{items.length * 2}\` — arithmetic

Invalid (these are statements, not expressions):
- \`{let x = 5}\` — declaration statement
- \`{if (condition) { ... }}\` — if statement (use \`{#if}\` blocks instead)

**Try it:** Add a line to the profile card that displays the number of characters in the name, using \`{name.length}\`. Then add another line that shows the initials by calling \`{name.split(' ').map(n => n[0]).join('')}\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'text',
			content: `## Why Scoped Styles Matter

The \`<style>\` block at the bottom of the component is where you write CSS. What makes Svelte special is that these styles are **automatically scoped** to the component.

Here is what happens under the hood. Suppose you write:

\`\`\`svelte
<style>
  .card { background: #1e1e2e; }
  h2 { color: white; }
</style>
\`\`\`

The compiler transforms this into something like:

\`\`\`css
.card.svelte-abc123 { background: #1e1e2e; }
h2.svelte-abc123 { color: white; }
\`\`\`

And every element in your template that matches these selectors gets the \`svelte-abc123\` class added automatically. The hash is unique per component, so \`.card\` in ComponentA never interferes with \`.card\` in ComponentB.

This scoping mechanism is why you can confidently use simple, semantic class names like \`.card\`, \`.title\`, \`.button\` without worrying about naming collisions. You do not need BEM conventions (\`.card__title--highlighted\`) or CSS Modules (\`styles.card\`). The compiler handles isolation for you.

**Important:** Scoped styles only affect elements that are directly in this component's template. They do not reach into child components. If you render a \`<ChildComponent />\` and the child has an \`<h2>\`, your parent's \`h2 { color: red }\` style will not affect it. This is by design — each component owns its own styles.`
		},
		{
			type: 'xray-prompt',
			content: `Toggle X-Ray mode to see how Svelte compiles your component. Pay close attention to three things:

1. **No virtual DOM** — the compiled output creates DOM nodes directly using \`document.createElement\` and sets their properties with direct assignments. There is no \`React.createElement\` or \`h()\` call producing a virtual tree to diff.
2. **Targeted updates** — when a variable changes, the compiled code updates only the specific text node or attribute that depends on it. If \`name\` changes, only the text nodes displaying \`name\` get updated. The \`role\` text node is untouched.
3. **Scoped class hashes** — look at the generated CSS. Each selector has a hash appended. Look at the generated HTML — each element has a matching class. This is how scoping works without any runtime cost.

The compiled output for a simple component like this profile card is typically 30-50 lines of JavaScript — far less than the equivalent React component plus its runtime dependency.`
		},
		{
			type: 'text',
			content: `## Putting It All Together

You now understand the three pillars of a Svelte component:

- **Script** gives the component data and behavior. In Svelte 5, reactive state is declared with \`$state()\`, derived values with \`$derived()\`, and side effects with \`$effect()\`. For now, simple \`let\` bindings suffice.
- **Template** renders the UI using standard HTML enhanced with \`{expressions}\`. The compiler analyzes these expressions to generate surgical DOM updates.
- **Style** provides scoped CSS that cannot leak to other components. The compiler rewrites selectors with unique hashes and adds matching classes to elements.

This architecture means that Svelte components are self-contained by default. You do not need to configure webpack loaders for CSS scoping, install styled-components for isolation, or adopt a naming convention to avoid collisions. The compiler gives you all of this for free.

In the next lesson, you will explore template expressions in depth — control flow blocks, loops, and how the compiler turns them into efficient DOM operations.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let name = 'Ada Lovelace';
  let role = 'Software Engineer';
  let avatarUrl = 'https://api.dicebear.com/7.x/initials/svg?seed=AL';
</script>

<div class="profile-card">
  <img class="avatar" src={avatarUrl} alt="{name}'s avatar" />
  <div class="info">
    <h2>{name}</h2>
    <p class="role">{role}</p>
    <!-- Add a line showing name.length here -->
    <!-- Add a line showing initials here -->
  </div>
</div>

<style>
  .profile-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
    background: #1e1e2e;
    border-radius: 12px;
    color: white;
    font-family: system-ui, sans-serif;
    max-width: 400px;
  }

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid var(--sf-accent, #6366f1);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--sf-accent, #6366f1);
  }

  .role {
    margin: 0;
    color: #a1a1aa;
    font-size: 0.9rem;
  }

  .meta {
    margin: 0;
    color: #71717a;
    font-size: 0.8rem;
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
  let name = 'SvelteForge Dev';
  let role = 'Full-Stack Developer';
  let avatarUrl = 'https://api.dicebear.com/7.x/initials/svg?seed=SD';
</script>

<div class="profile-card">
  <img class="avatar" src={avatarUrl} alt="{name}'s avatar" />
  <div class="info">
    <h2>{name}</h2>
    <p class="role">{role}</p>
    <p class="meta">{name.length} characters in name</p>
    <p class="meta">Initials: {name.split(' ').map(n => n[0]).join('')}</p>
  </div>
</div>

<style>
  .profile-card {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
    background: #1e1e2e;
    border-radius: 12px;
    color: white;
    font-family: system-ui, sans-serif;
    max-width: 400px;
  }

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 2px solid var(--sf-accent, #6366f1);
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: var(--sf-accent, #6366f1);
  }

  .role {
    margin: 0;
    color: #a1a1aa;
    font-size: 0.9rem;
  }

  .meta {
    margin: 0;
    color: #71717a;
    font-size: 0.8rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Change the name variable to something other than "Ada Lovelace"',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'not-contains', value: "let name = 'Ada Lovelace'" },
						{ type: 'contains', value: 'let name' }
					]
				}
			},
			hints: [
				'Find the line that says `let name = \'Ada Lovelace\'` in the script block and change it to your own name.',
				'Change both `name` and `role` to personalize the card. The `avatarUrl` uses dicebear.com which generates avatars from initials — try changing the `seed` parameter to match your new initials.',
				'For example: `let name = \'SvelteForge Dev\';` and `let role = \'Full-Stack Developer\';`'
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
				'Template expressions go inside `{curly braces}` in the HTML portion of your component. You can place them inside any element, like a `<p>` tag.',
				'You can access properties and call methods inside expressions. `name.length` gives you the character count. `name.split(\' \').map(n => n[0]).join(\'\')` extracts initials.',
				'Add `<p class="meta">{name.length} characters in name</p>` inside the `.info` div, below the role paragraph.'
			],
			conceptsTested: ['svelte5.template.expressions']
		}
	]
};
