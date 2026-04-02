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

## WHY Snippets Exist

Before Svelte 5, if you wanted to reuse a piece of markup within a single component, you had two unsatisfying options. You could duplicate the HTML, violating DRY and creating maintenance hazards. Or you could extract a separate component file, which introduced prop-passing ceremony, file-system overhead, and a context boundary that made sharing local state awkward. Slots existed for parent-to-child content injection, but they had their own problems: they were implicitly named, difficult to type, and their scoping rules confused even experienced developers because the compiled output mixed parent and child scope in non-obvious ways.

Snippets solve all of this. A snippet is a **locally-scoped, parameterized template function** declared right where you need it. You define one with \`{#snippet name(params)}\` and call it with \`{@render name(args)}\`. Conceptually, a snippet is to markup what a regular function is to logic: a reusable unit with clear inputs and outputs, but one that lives inside the component that owns it rather than in a separate file.

### What the Compiler Actually Does

When the Svelte compiler encounters a \`{#snippet}\` block, it generates a JavaScript function whose body creates and manages DOM nodes. This function is *not* a component -- it has no lifecycle, no isolated state, and no separate reactivity scope. Instead, it closes over the variables in the declaring component. When you call \`{@render}\`, the compiler inserts a call to that generated function, passing in arguments and wiring up any reactive dependencies so that changes to snippet parameters trigger granular DOM updates.

This design has three performance consequences worth understanding:

1. **No component overhead.** Creating a component in Svelte means instantiating a new reactivity context, setting up lifecycle hooks, and potentially creating an isolated style scope. A snippet skips all of that. It is roughly as cheap as an inlined \`{#if}\` block.
2. **Shared reactivity scope.** Because the snippet function closes over the declaring component's scope, reactive statements (\`$state\`, \`$derived\`, \`$effect\`) in the parent automatically apply inside the snippet. You do not need to pass reactive values as parameters -- they are already visible.
3. **Static analysis.** The compiler can statically determine whether a snippet is used, enabling dead-code elimination. An unused snippet generates zero runtime code.

### Decision Framework: Snippet vs. Component

Use a **snippet** when:
- The markup is used only within a single component
- It needs direct access to the declaring component's reactive state
- There is no need for encapsulated styles or independent lifecycle
- You want to avoid file-system proliferation for small UI patterns

Use a **component** when:
- The markup is reused across multiple files
- It needs its own state, styles, or lifecycle (\`onMount\`, etc.)
- It represents a semantic boundary in your application (a "thing" users would name)
- You want to enforce an explicit props contract as a public API`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.snippets.define'
		},
		{
			type: 'text',
			content: `## Defining and Rendering Snippets

The syntax mirrors function declaration and invocation. Define with \`{#snippet}\`, render with \`{@render}\`:

\`\`\`svelte
{#snippet greeting(name)}
  <p>Hello, {name}!</p>
{/snippet}

{@render greeting('World')}
{@render greeting('Svelte')}
\`\`\`

### Parameters and Type Annotations

Snippet parameters support TypeScript annotations directly in the template:

\`\`\`svelte
{#snippet greeting(name: string)}
  <p>Hello, {name}!</p>
{/snippet}
\`\`\`

The compiler validates these types at build time, so passing a number where a string is expected produces a compile error. This is a significant improvement over slots, where the data flowing through \`let:\` directives was essentially untyped.

### Scoping Rules

A snippet can reference any variable in its declaring component's \`<script>\` block. It can also reference other snippets declared in the same component. This means you can compose snippets -- calling one from within another -- creating layered template abstractions without ever leaving the file.

However, snippets are **not hoisted**. You must declare a snippet before you \`{@render}\` it in the template flow. The compiler processes the template top-to-bottom, and a forward-reference to an undeclared snippet is an error.

**Your task:** Define a \`card\` snippet that accepts a \`title\` and \`body\`, then render it multiple times with different content. Observe how the snippet eliminates markup duplication while keeping the code inside a single component.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Snippets with Complex Markup

Snippets can contain any valid Svelte template syntax: event handlers, conditional blocks, each blocks, style classes, and even nested snippet calls. Because they share the component's scope, event handlers inside a snippet can directly mutate the component's state.

\`\`\`svelte
{#snippet alertBox(message, type)}
  <div class="alert alert-{type}">
    <strong>{type}:</strong> {message}
  </div>
{/snippet}
\`\`\`

### Why This Matters for Real Applications

In practice, you will use snippets most often for **repeated structural patterns within list renderings**. Consider a dashboard with a list of user cards. Without snippets, you either duplicate the card markup inside the \`{#each}\` or extract a component that needs props for name, role, status, avatar, and every click handler. A snippet lets you define the card shape once, right above the \`{#each}\`, keeping the markup and its data source visually co-located.

### Interaction with Styles

Because snippets live inside the component, they inherit the component's scoped \`<style>\` block. Any CSS class you define in the component's \`<style>\` section is available inside the snippet. This is another advantage over extracting a component, which would need its own style block or would rely on global styles.

### Performance Consideration: Snippet Re-renders

When reactive state referenced by a snippet changes, only the DOM produced by that snippet invocation re-renders. If you call the same snippet three times and only the second invocation depends on a changed value, only the second call's DOM updates. This granularity comes from the compiler tracking dependencies per \`{@render}\` call site, not per snippet definition.

**Task:** Create a \`userCard\` snippet that displays a user's name, role, and an active/inactive status badge. Render it for each user in the array. Notice how the snippet accesses component-scoped styles like \`.badge\`, \`.active\`, and \`.inactive\` without any extra configuration.`
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
