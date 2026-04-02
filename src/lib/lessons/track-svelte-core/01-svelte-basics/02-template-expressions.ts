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

Svelte templates are HTML with superpowers. You can embed any JavaScript expression inside curly braces \`{}\`, and use special blocks for conditional rendering and loops. But understanding *why* Svelte chose this syntax — and how it compiles — reveals the real power behind what looks like simple templating.

## Why Mustache Syntax Instead of JSX?

React uses JSX, which embeds HTML-like syntax inside JavaScript. Svelte takes the opposite approach: it embeds JavaScript expressions inside HTML using \`{curly braces}\`. This is sometimes called "mustache syntax" because of its resemblance to the Mustache templating language, though Svelte's version is far more powerful.

The choice is deliberate and has three key consequences:

1. **HTML stays valid-looking.** Your template reads like HTML with dynamic holes punched in it. You use \`class\` not \`className\`, \`for\` not \`htmlFor\`. Designers can read Svelte templates. Copy-pasting HTML from documentation works without translation.

2. **The compiler can statically analyze templates.** Because the template is a structured format (not arbitrary JavaScript), the Svelte compiler can walk the template AST, identify every dynamic expression, and generate precisely targeted DOM update code. In JSX, the runtime must diff the entire virtual DOM tree because expressions can appear anywhere in arbitrary JavaScript. In Svelte, the compiler knows at build time exactly which text node depends on which variable.

3. **Expressions, not statements.** Inside \`{}\`, you can only write expressions — things that produce a value. You cannot write \`{if (x) { ... }}\` or \`{for (let i...)}\`. This constraint is intentional. Conditional rendering and loops get their own block syntax (\`{#if}\`, \`{#each}\`) that the compiler can analyze and optimize independently.

## Expression Capabilities and Limitations

Inside curly braces, you can use any JavaScript expression:

\`\`\`svelte
<!-- Variable references -->
<p>{username}</p>

<!-- Method calls -->
<p>{username.toUpperCase()}</p>

<!-- Ternary operators — the primary tool for inline conditionals -->
<span>{isOnline ? 'Online' : 'Offline'}</span>

<!-- Logical AND for conditional rendering -->
{hasNotification && '🔔'}

<!-- Computed values -->
<p>Total: {price * quantity}</p>

<!-- Template literals -->
<p>{'Hello, ' + name + '!'}</p>
\`\`\`

What you *cannot* do inside curly braces:

- **Declarations:** \`{let x = 5}\` — use the script block instead
- **Statements:** \`{if (x) return y}\` — use \`{#if}\` blocks
- **Assignments:** \`{count++}\` in the template body — use event handlers
- **Multi-line logic:** \`{items.forEach(...)}\` — use \`{#each}\` blocks

This limitation is a feature. By constraining what appears in the template to pure expressions, Svelte can guarantee that rendering is side-effect-free and that every dynamic value can be traced back to its source variable for surgical updates.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.template.expressions'
		},
		{
			type: 'text',
			content: `## How the Compiler Handles Template Expressions

This is where Svelte fundamentally differs from React and Vue. When the compiler encounters a template expression like \`{count}\`, it does not generate code that rebuilds a virtual DOM tree and diffs it. Instead, it generates a targeted update function that directly modifies the specific DOM text node.

Consider this template:

\`\`\`svelte
<p>The count is {count} and the double is {count * 2}</p>
\`\`\`

The compiler produces something conceptually like:

\`\`\`javascript
// During creation:
let t0 = document.createTextNode("The count is ");
let t1 = document.createTextNode(count);
let t2 = document.createTextNode(" and the double is ");
let t3 = document.createTextNode(count * 2);
p.append(t0, t1, t2, t3);

// During update (only when count changes):
t1.data = count;
t3.data = count * 2;
\`\`\`

Notice: no virtual DOM, no diff algorithm, no reconciliation. The compiler statically determined that \`t1\` and \`t3\` depend on \`count\`, and it generates update code that runs only when \`count\` changes. This is why Svelte components are fast — the work of figuring out what to update happens at compile time, not at runtime.

## Conditional Rendering with {#if}

For conditional rendering, Svelte uses block syntax rather than inline expressions. The \`{#if}\` block lets you conditionally include or exclude chunks of markup:

\`\`\`svelte
{#if temperature > 30}
  <p class="hot">It's hot outside! 🌡️</p>
{:else if temperature > 15}
  <p class="mild">Nice weather today.</p>
{:else}
  <p class="cold">Bundle up, it's cold!</p>
{/if}
\`\`\`

The syntax uses \`#\` to open a block, \`:\` for continuation clauses (like \`else\`), and \`/\` to close the block. This is not arbitrary — these sigils let the parser unambiguously distinguish block boundaries from expressions.

Under the hood, the compiler generates code that creates and destroys DOM nodes as the condition changes. When \`temperature\` goes from 25 to 35, Svelte removes the "mild" paragraph and creates the "hot" paragraph. It does not hide/show with CSS — it actually adds and removes DOM elements, which is more memory-efficient for large conditional sections.

**Task:** Look at the starter code. It shows a task tracker with a count and a list of tasks. Add an \`{#if}\` block that shows "All tasks complete!" when the count of completed tasks equals the total, "In progress..." when some are done, and "No tasks started" when none are done.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Looping with {#each}

The \`{#each}\` block renders a list by iterating over an array:

\`\`\`svelte
{#each tasks as task, index}
  <li>
    <span class="index">{index + 1}.</span>
    {task.name}
  </li>
{/each}
\`\`\`

The second parameter (\`index\`) is optional and gives you the zero-based position. You can also destructure the item:

\`\`\`svelte
{#each tasks as { name, completed }}
  <li class:done={completed}>{name}</li>
{/each}
\`\`\`

### Keyed Each Blocks

When items in your list can be reordered, added, or removed, you should provide a key so Svelte can efficiently update the DOM:

\`\`\`svelte
{#each tasks as task (task.id)}
  <TaskItem {task} />
{/each}
\`\`\`

The \`(task.id)\` tells Svelte to associate each DOM block with that specific task. Without a key, Svelte updates by index position, which can cause bugs when items are reordered (inputs losing their values, animations firing incorrectly).

**Task:** Render the \`tasks\` array using an \`{#each}\` block. Show each task name and whether it is completed. Use the task's \`id\` as a key.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: `Toggle X-Ray mode and examine the compiled output for both the \`{#if}\` and \`{#each}\` blocks. Notice these critical details:

1. **The \`{#if}\` block** compiles to a function that creates one of several possible DOM fragments. When the condition changes, Svelte destroys the current fragment and creates the new one. There is no hidden \`display: none\` element — the DOM nodes genuinely do not exist when the condition is false.

2. **The \`{#each}\` block** compiles to a loop that creates a DOM fragment for each item. When the array changes, Svelte compares the new list against the old one using keys (if provided) and performs minimal insertions, deletions, and moves — similar to what a virtual DOM would do, but only for this specific list, not the entire component tree.

3. **No virtual DOM overhead** — each block manages its own small piece of the DOM independently. A change in the \`{#if}\` condition does not cause the \`{#each}\` list to re-render. React would re-run the entire component function and diff the full JSX tree; Svelte updates only what changed.`
		},
		{
			type: 'text',
			content: `## Ternary Patterns and Logical AND

While \`{#if}\` blocks are preferred for rendering different markup, inline expressions are useful for small, single-value conditionals:

\`\`\`svelte
<!-- Ternary for choosing between two values -->
<span class={isUrgent ? 'badge-red' : 'badge-gray'}>{task.name}</span>

<!-- Logical AND for optionally showing content -->
<p>{task.note && '📝 ' + task.note}</p>

<!-- Nullish coalescing for defaults -->
<p>{task.assignee ?? 'Unassigned'}</p>
\`\`\`

The ternary pattern \`condition ? valueA : valueB\` is especially useful for dynamic class names, dynamic attributes, and short text variations. Use it for simple A-or-B choices. For anything involving different DOM structure (different elements, different nesting), prefer \`{#if}\` blocks — they are more readable and give the compiler better optimization opportunities.

## Summary

Template expressions are the bridge between your component's data and its rendered output. Svelte's mustache syntax keeps templates readable while enabling the compiler to generate maximally efficient update code. The \`{#if}\` and \`{#each}\` blocks provide structured control flow that the compiler can analyze independently, ensuring that changes in one part of your template never cause unnecessary work in another part. This is the compiler advantage — the framework does its work at build time so your users experience less work at runtime.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let tasks = [
    { id: 1, name: 'Learn Svelte basics', completed: true },
    { id: 2, name: 'Build a component', completed: true },
    { id: 3, name: 'Master template expressions', completed: false },
    { id: 4, name: 'Deploy an app', completed: false }
  ];

  let completedCount = $derived(tasks.filter(t => t.completed).length);
  let totalCount = tasks.length;
</script>

<div class="tracker">
  <h2>Task Tracker</h2>
  <p class="progress">{completedCount} of {totalCount} tasks done</p>

  <!-- TODO: Add an {#if} block showing status based on completedCount -->

  <!-- TODO: Add an {#each} block to render the task list -->
</div>

<style>
  .tracker {
    padding: 1.5rem;
    background: #1e1e2e;
    border-radius: 12px;
    color: white;
    font-family: system-ui, sans-serif;
    max-width: 400px;
  }

  h2 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  .progress {
    color: #a1a1aa;
    font-size: 0.9rem;
    margin: 0 0 1rem;
  }

  .status {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    margin-block-end: 1rem;
  }

  .status.all-done { background: #064e3b; color: #6ee7b7; }
  .status.in-progress { background: #1e3a5f; color: #7dd3fc; }
  .status.not-started { background: #3b1c1c; color: #fca5a5; }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #2a2a3e;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  li:last-child { border-bottom: none; }

  .done {
    text-decoration: line-through;
    color: #6b7280;
  }

  .check {
    color: #22c55e;
  }

  .pending {
    color: #6b7280;
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
  let tasks = [
    { id: 1, name: 'Learn Svelte basics', completed: true },
    { id: 2, name: 'Build a component', completed: true },
    { id: 3, name: 'Master template expressions', completed: false },
    { id: 4, name: 'Deploy an app', completed: false }
  ];

  let completedCount = $derived(tasks.filter(t => t.completed).length);
  let totalCount = tasks.length;
</script>

<div class="tracker">
  <h2>Task Tracker</h2>
  <p class="progress">{completedCount} of {totalCount} tasks done</p>

  {#if completedCount === totalCount}
    <p class="status all-done">All tasks complete!</p>
  {:else if completedCount > 0}
    <p class="status in-progress">In progress...</p>
  {:else}
    <p class="status not-started">No tasks started</p>
  {/if}

  <ul>
    {#each tasks as task (task.id)}
      <li>
        <span class={task.completed ? 'check' : 'pending'}>
          {task.completed ? '✓' : '○'}
        </span>
        <span class:done={task.completed}>{task.name}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .tracker {
    padding: 1.5rem;
    background: #1e1e2e;
    border-radius: 12px;
    color: white;
    font-family: system-ui, sans-serif;
    max-width: 400px;
  }

  h2 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  .progress {
    color: #a1a1aa;
    font-size: 0.9rem;
    margin: 0 0 1rem;
  }

  .status {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.85rem;
    margin-block-end: 1rem;
  }

  .status.all-done { background: #064e3b; color: #6ee7b7; }
  .status.in-progress { background: #1e3a5f; color: #7dd3fc; }
  .status.not-started { background: #3b1c1c; color: #fca5a5; }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    padding: 0.5rem 0;
    border-bottom: 1px solid #2a2a3e;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  li:last-child { border-bottom: none; }

  .done {
    text-decoration: line-through;
    color: #6b7280;
  }

  .check {
    color: #22c55e;
  }

  .pending {
    color: #6b7280;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add an {#if} block that shows different status messages based on completion count',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#if' },
						{ type: 'contains', value: '{:else' },
						{ type: 'contains', value: '{/if}' }
					]
				}
			},
			hints: [
				'You need to compare `completedCount` against `totalCount` and `0` to determine which of three states to show. Use `{#if completedCount === totalCount}` for the first branch.',
				'Chain conditions with `{:else if completedCount > 0}` for the in-progress state, and `{:else}` for the not-started state. Each branch should render a `<p>` with the appropriate class.',
				'Full solution: `{#if completedCount === totalCount}<p class="status all-done">All tasks complete!</p>{:else if completedCount > 0}<p class="status in-progress">In progress...</p>{:else}<p class="status not-started">No tasks started</p>{/if}`'
			],
			conceptsTested: ['svelte5.template.if']
		},
		{
			id: 'cp-2',
			description: 'Render the tasks array using {#each} with a key',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#each' },
						{ type: 'contains', value: '{/each}' },
						{ type: 'regex', value: '\\(task\\.id\\)' }
					]
				}
			},
			hints: [
				'Use `{#each tasks as task (task.id)}` to iterate over the array with a key. The key `(task.id)` goes after the item variable name.',
				'Inside the each block, render an `<li>` for each task. Use `task.name` for the text and `task.completed` to determine styling. Try a ternary expression for the check mark: `{task.completed ? \'✓\' : \'○\'}`.',
				'Full pattern: `{#each tasks as task (task.id)}<li><span class={task.completed ? \'check\' : \'pending\'}>{task.completed ? \'✓\' : \'○\'}</span><span class:done={task.completed}>{task.name}</span></li>{/each}`'
			],
			conceptsTested: ['svelte5.template.each']
		}
	]
};
