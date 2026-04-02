import type { Lesson } from '$types/lesson';

export const componentComposition: Lesson = {
	id: 'svelte-core.svelte-basics.component-composition',
	slug: 'component-composition',
	title: 'Component Composition',
	description: 'Learn how to nest components, pass children, and build composable UIs in Svelte 5.',
	trackId: 'svelte-core',
	moduleId: 'svelte-basics',
	order: 4,
	estimatedMinutes: 15,
	concepts: ['svelte5.components.nesting', 'svelte5.components.children', 'svelte5.components.composition'],
	prerequisites: ['svelte5.components.basic'],

	content: [
		{
			type: 'text',
			content: `# Component Composition

Real applications are not built from a single monolithic component. They are built from dozens — sometimes hundreds — of small, focused components combined together. This principle is called **composition**, and it is the most important architectural pattern in modern UI development.

## Why Composition Over Inheritance

Object-oriented programming traditionally solves code reuse through inheritance: a \`SpecialButton\` extends \`Button\`, adding new behavior. This approach fails badly in UI development for several reasons:

1. **Deep hierarchies become rigid.** If \`PrimaryButton\` extends \`Button\` and \`IconButton\` extends \`Button\`, where does \`PrimaryIconButton\` go? You end up with diamond inheritance problems or bloated base classes that try to accommodate every variant.
2. **Inheritance couples structure to behavior.** Changing the base component risks breaking every component that extends it. The more components inherit from a shared base, the harder any single change becomes.
3. **UI is inherently compositional, not hierarchical.** A card contains a header, a body, and a footer. The header might contain a title and actions. The actions might contain buttons. This is a containment relationship, not an "is-a" relationship.

Svelte embraces composition fully. You build UIs by nesting components inside each other, passing data down through props, and passing content down through children (snippets). There is no component inheritance, no \`extends\`, no base classes. Every component is a standalone unit that declares what it needs via \`$props()\` and renders its output.

## Component Boundaries — When to Extract

A common question is: "When should I extract a new component?" Here are practical guidelines:

- **Reuse:** If the same markup + logic appears in multiple places, extract it.
- **Complexity:** If a component's template exceeds ~80 lines, it is doing too much. Split it.
- **Responsibility:** If you can name the extracted piece with a clear noun (Card, Avatar, Badge, StatusIndicator), it deserves its own component.
- **Testing:** If you want to test a piece of UI independently, it should be a component.

Do not over-extract. A component that wraps a single \`<div>\` with no props is unnecessary abstraction. The sweet spot is components that encapsulate a meaningful, reusable piece of UI with a clear API (props and children).`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.components.nesting'
		},
		{
			type: 'text',
			content: `## Creating and Using Child Components

Look at the starter code. \`App.svelte\` renders three feature cards with hardcoded markup — the same structure repeated three times with different data. This is a textbook case for extracting a component.

Your first task is to build a \`Card.svelte\` component. In Svelte, creating a child component is straightforward:

1. Create a new \`.svelte\` file (already provided as \`Card.svelte\`)
2. Define the component's props using \`$props()\`
3. Write the template and styles
4. Import and use it in the parent

The \`$props()\` rune is Svelte 5's way of declaring what data a component accepts from its parent:

\`\`\`svelte
<!-- Card.svelte -->
<script lang="ts">
  let { title, description, icon }: {
    title: string;
    description: string;
    icon: string;
  } = $props();
</script>

<div class="card">
  <span class="icon">{icon}</span>
  <h3>{title}</h3>
  <p>{description}</p>
</div>
\`\`\`

The parent uses the component like an HTML element, passing props as attributes:

\`\`\`svelte
<Card title="Fast" description="Compiled to vanilla JS" icon="⚡" />
\`\`\`

**Task:** Build the \`Card.svelte\` component with \`title\`, \`description\`, and \`icon\` props. Then import it in \`App.svelte\` and replace the repeated markup with three \`<Card />\` instances.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Importing and Using Components

Once your Card component is defined, importing it follows standard JavaScript module syntax:

\`\`\`svelte
<script lang="ts">
  import Card from './Card.svelte';
</script>

<Card title="Performance" description="No virtual DOM overhead" icon="🚀" />
\`\`\`

Svelte components are always imported as default exports. The import name must start with an uppercase letter — this is how Svelte distinguishes components (\`<Card>\`) from HTML elements (\`<card>\`). Lowercase tags are treated as native HTML elements; uppercase tags are treated as component references.

Each component instance is independent. If you render three \`<Card />\` elements, each one has its own script scope, its own state, and its own lifecycle. Changing a value in one Card does not affect the others.

**Task:** Import Card in App.svelte and replace the hardcoded divs with Card component instances.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `Toggle X-Ray mode and inspect how Svelte compiles the parent-child relationship. Notice these important details:

1. **Each component is a separate module.** Card.svelte compiles to its own JavaScript module with its own creation and update functions. The parent's compiled code imports and instantiates it.

2. **Props are passed directly.** The compiled code passes prop values directly to the child component's initialization function. There is no props object being diffed — when a prop value changes, the parent calls a specific setter function on the child instance.

3. **No runtime component tree.** Unlike React (which maintains a fiber tree) or Vue (which maintains a virtual DOM tree), Svelte does not maintain a runtime representation of the component hierarchy. Each component manages its own DOM fragment independently. The parent knows about the child only through the setter functions it calls when props change.

4. **Styles remain isolated.** Card.svelte's styles get their own hash. App.svelte's styles get a different hash. The two never interfere, even if they both use \`.card\` as a class name.`
		},
		{
			type: 'text',
			content: `## Passing Children with {@render children()}

Props are great for passing data, but sometimes you need to pass *content* — arbitrary markup that the parent wants to inject into the child's template. In Svelte 5, this is done through the children snippet.

When a parent places content between a component's opening and closing tags, that content becomes available as a \`children\` snippet inside the child component:

\`\`\`svelte
<!-- Parent: App.svelte -->
<Card title="Getting Started" icon="📖">
  <p>Read the documentation to learn the basics.</p>
  <a href="/docs">View Docs</a>
</Card>

<!-- Child: Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, icon, children }: {
    title: string;
    icon: string;
    children: Snippet;
  } = $props();
</script>

<div class="card">
  <span class="icon">{icon}</span>
  <h3>{title}</h3>
  <div class="body">
    {@render children()}
  </div>
</div>
\`\`\`

The \`{@render children()}\` tag tells Svelte where to insert the parent-provided content. The \`Snippet\` type (imported from \`'svelte'\`) is the TypeScript type for renderable content.

### Props vs. Children — Design Patterns

When should you use props versus children?

- **Use props** for structured, typed data: titles, counts, URLs, boolean flags. Props give you type safety and clear API contracts.
- **Use children** for content that varies in structure: paragraphs of text, mixed markup, interactive elements. Children give the parent full control over what appears inside the component.
- **Use named snippets** for multiple content slots: header, body, footer. Named snippets let the child component place different content in different locations.

A well-designed component often uses both. A \`Card\` component might accept a \`title\` prop (structured data) and \`children\` (flexible body content). A \`Dialog\` might accept \`title\` and \`open\` as props, with named snippets for \`header\`, \`body\`, and \`footer\`.

**Task:** Update your Card component to accept and render children. Instead of passing \`description\` as a prop, pass it as children content between the \`<Card>\` tags. This makes the card body flexible — the parent can pass paragraphs, lists, links, or any other markup.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Component Composition in Practice

Let's recap the composition patterns you have learned:

1. **Nesting** — Import a component and use it inside another component's template. Each instance is independent with its own state.
2. **Props** — Pass typed data from parent to child. The child declares what it needs with \`$props()\`.
3. **Children** — Pass markup content from parent to child. The child renders it with \`{@render children()}\`.
4. **Encapsulation** — Each component's styles are scoped. Its internal structure is hidden from the parent. The parent interacts with it only through props and children.

These patterns compose recursively. A \`Page\` component renders a \`Layout\` component, which renders a \`Sidebar\` and a \`Content\` area. The \`Content\` area renders a list of \`Card\` components, each of which renders a \`Badge\` and a \`Button\`. Every level of nesting follows the same rules: props flow down, children fill content slots, styles stay scoped.

This is the fundamental architecture of every Svelte application. Master these patterns and you can build UIs of any complexity by combining simple, well-defined components.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Import the Card component
</script>

<!-- TODO: Replace these hardcoded cards with <Card /> component instances -->
<div class="feature-grid">
  <div class="card">
    <span class="icon">⚡</span>
    <h3>Blazing Fast</h3>
    <p>Compiled to vanilla JavaScript with no virtual DOM overhead.</p>
  </div>
  <div class="card">
    <span class="icon">📦</span>
    <h3>Tiny Bundles</h3>
    <p>Ship less JavaScript. Svelte compiles away the framework.</p>
  </div>
  <div class="card">
    <span class="icon">🎯</span>
    <h3>Truly Reactive</h3>
    <p>Fine-grained reactivity with runes. No dependency arrays.</p>
  </div>
</div>

<style>
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .card {
    padding: 1.5rem;
    background: #1e1e2e;
    border-radius: 12px;
    color: white;
    font-family: system-ui, sans-serif;
  }

  .icon {
    font-size: 1.5rem;
    display: block;
    margin-block-end: 0.5rem;
  }

  h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  p {
    margin: 0;
    color: #a1a1aa;
    font-size: 0.9rem;
    line-height: 1.5;
  }
</style>`
		},
		{
			name: 'Card.svelte',
			path: '/Card.svelte',
			language: 'svelte',
			content: `<!-- TODO: Create a Card component -->
<!-- Accept title, icon props and children content -->
<!-- Use {@render children()} to render passed content -->
`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Card from './Card.svelte';
</script>

<div class="feature-grid">
  <Card title="Blazing Fast" icon="⚡">
    <p>Compiled to vanilla JavaScript with no virtual DOM overhead.</p>
  </Card>
  <Card title="Tiny Bundles" icon="📦">
    <p>Ship less JavaScript. Svelte compiles away the framework.</p>
  </Card>
  <Card title="Truly Reactive" icon="🎯">
    <p>Fine-grained reactivity with runes. No dependency arrays.</p>
  </Card>
</div>

<style>
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
</style>`
		},
		{
			name: 'Card.svelte',
			path: '/Card.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, icon, children }: {
    title: string;
    icon: string;
    children: Snippet;
  } = $props();
</script>

<div class="card">
  <span class="icon">{icon}</span>
  <h3>{title}</h3>
  <div class="body">
    {@render children()}
  </div>
</div>

<style>
  .card {
    padding: 1.5rem;
    background: #1e1e2e;
    border-radius: 12px;
    color: white;
    font-family: system-ui, sans-serif;
  }

  .icon {
    font-size: 1.5rem;
    display: block;
    margin-block-end: 0.5rem;
  }

  h3 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  .body {
    color: #a1a1aa;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .body :global(p) {
    margin: 0;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a Card.svelte component with title and icon props',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$props()' },
						{ type: 'contains', value: 'title' }
					]
				}
			},
			hints: [
				'In `Card.svelte`, add a `<script lang="ts">` block and use `$props()` to declare props. You need at least `title` and `icon` properties.',
				'Use destructuring with type annotations: `let { title, icon }: { title: string; icon: string } = $props();` Then build a template that uses these values.',
				'Full Card.svelte: `<script lang="ts">let { title, icon }: { title: string; icon: string } = $props();</script><div class="card"><span class="icon">{icon}</span><h3>{title}</h3></div>`'
			],
			conceptsTested: ['svelte5.components.nesting']
		},
		{
			id: 'cp-2',
			description: 'Import and use the Card component in App.svelte',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: "import Card from './Card.svelte'" },
						{ type: 'contains', value: '<Card' }
					]
				}
			},
			hints: [
				'In App.svelte, add `import Card from \'./Card.svelte\';` inside the `<script>` block. Component imports always use default import syntax.',
				'Replace each hardcoded `<div class="card">` block with a `<Card>` element. Pass data through props: `<Card title="Blazing Fast" icon="⚡" />`.',
				'The import goes in the script block. In the template, use: `<Card title="Blazing Fast" icon="⚡" />` for each card, removing the old `<div class="card">` markup.'
			],
			conceptsTested: ['svelte5.components.nesting']
		},
		{
			id: 'cp-3',
			description: 'Update Card to accept and render children content',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@render children()' },
						{ type: 'contains', value: '<Card' },
						{ type: 'contains', value: '</Card>' }
					]
				}
			},
			hints: [
				'In Card.svelte, import `Snippet` from `svelte` and add `children` to your props: `import type { Snippet } from \'svelte\';` then include `children: Snippet` in your props type.',
				'Render the children in your template with `{@render children()}`. Place it where the card body content should appear — after the title, inside a wrapper div.',
				'In App.svelte, change from self-closing `<Card ... />` to open/close tags with content: `<Card title="Blazing Fast" icon="⚡"><p>Compiled to vanilla JavaScript.</p></Card>`.'
			],
			conceptsTested: ['svelte5.components.children', 'svelte5.components.composition']
		}
	]
};
