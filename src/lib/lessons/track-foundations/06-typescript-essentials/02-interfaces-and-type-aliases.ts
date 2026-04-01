import type { Lesson } from '$types/lesson';

export const interfacesAndTypeAliases: Lesson = {
	id: 'foundations.typescript-essentials.interfaces-and-type-aliases',
	slug: 'interfaces-and-type-aliases',
	title: 'Interfaces and Type Aliases',
	description: 'Define object shapes with interfaces and type aliases — learn when to use each and how to extend them.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 2,
	estimatedMinutes: 12,
	concepts: ['typescript.interfaces', 'typescript.type-aliases', 'typescript.extending'],
	prerequisites: ['foundations.typescript-essentials.types-and-annotations'],

	content: [
		{
			type: 'text',
			content: `# Interfaces and Type Aliases

Both \`interface\` and \`type\` define the shape of objects:

\`\`\`typescript
interface User {
  name: string;
  email: string;
  age?: number;  // optional
}

type Product = {
  id: number;
  title: string;
  price: number;
};
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'typescript.interfaces'
		},
		{
			type: 'text',
			content: `## Defining an Interface

Interfaces describe the required and optional properties of an object:

\`\`\`typescript
interface Card {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}
\`\`\`

Look at the starter code. The \`task\` object has no type.

**Task:** Define a \`Task\` interface with \`title: string\`, \`completed: boolean\`, and an optional \`priority: string\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Extending Interfaces

Interfaces can extend other interfaces to add properties:

\`\`\`typescript
interface TimestampedEntity {
  createdAt: Date;
  updatedAt: Date;
}

interface User extends TimestampedEntity {
  name: string;
  email: string;
}
\`\`\`

Type aliases use intersection (\`&\`) for similar composition:

\`\`\`typescript
type User = TimestampedEntity & { name: string; };
\`\`\`

**Task:** Create a \`TimestampedTask\` interface that extends \`Task\` and adds a \`createdAt: string\` property.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how TypeScript validates the object shape against the interface. Try removing a required property to see the type error.'
		},
		{
			type: 'text',
			content: `## Type Aliases vs Interfaces

Key differences:
- **Interfaces** can be extended and merged (declaration merging)
- **Type aliases** can represent unions, primitives, and tuples
- **Convention:** Use \`interface\` for object shapes, \`type\` for everything else

**Task:** Create a type alias \`TaskStatus = 'todo' | 'in-progress' | 'done'\` and use it in the \`Task\` interface.`
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
  // TODO: Define Task interface, TimestampedTask interface, and TaskStatus type

  let tasks = $state([
    { title: 'Learn TypeScript', completed: false },
    { title: 'Build a component', completed: true },
    { title: 'Deploy app', completed: false }
  ]);
</script>

<div class="task-list">
  <h2>Tasks</h2>
  {#each tasks as task}
    <div class="task" class:done={task.completed}>
      <span>{task.title}</span>
      <span>{task.completed ? '✓' : '○'}</span>
    </div>
  {/each}
</div>

<style>
  .task-list {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    max-width: 400px;
  }

  h2 {
    margin: 0 0 1rem;
    color: var(--sf-accent, #6366f1);
  }

  .task {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .done {
    text-decoration: line-through;
    color: #94a3b8;
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
  type TaskStatus = 'todo' | 'in-progress' | 'done';

  interface Task {
    title: string;
    completed: boolean;
    priority?: string;
    status?: TaskStatus;
  }

  interface TimestampedTask extends Task {
    createdAt: string;
  }

  let tasks: Task[] = $state([
    { title: 'Learn TypeScript', completed: false },
    { title: 'Build a component', completed: true },
    { title: 'Deploy app', completed: false }
  ]);
</script>

<div class="task-list">
  <h2>Tasks</h2>
  {#each tasks as task}
    <div class="task" class:done={task.completed}>
      <span>{task.title}</span>
      <span>{task.completed ? '✓' : '○'}</span>
    </div>
  {/each}
</div>

<style>
  .task-list {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    max-width: 400px;
  }

  h2 {
    margin: 0 0 1rem;
    color: var(--sf-accent, #6366f1);
  }

  .task {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .done {
    text-decoration: line-through;
    color: #94a3b8;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Define a Task interface with title, completed, and optional priority',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'interface Task' },
						{ type: 'contains', value: 'title: string' },
						{ type: 'contains', value: 'completed: boolean' }
					]
				}
			},
			hints: [
				'Interfaces use `interface Name { }` syntax.',
				'Optional properties use `?`: `priority?: string`.',
				'Add: `interface Task { title: string; completed: boolean; priority?: string; }`'
			],
			conceptsTested: ['typescript.interfaces']
		},
		{
			id: 'cp-2',
			description: 'Create TimestampedTask that extends Task',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'interface TimestampedTask extends Task' },
						{ type: 'contains', value: 'createdAt' }
					]
				}
			},
			hints: [
				'`extends` lets an interface inherit all properties from another.',
				'Use `interface TimestampedTask extends Task { createdAt: string; }`.',
				'Add: `interface TimestampedTask extends Task { createdAt: string; }`'
			],
			conceptsTested: ['typescript.extending']
		},
		{
			id: 'cp-3',
			description: 'Create a TaskStatus type alias with union values',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'type TaskStatus' },
						{ type: 'contains', value: "'todo'" }
					]
				}
			},
			hints: [
				'Type aliases use `type Name = ...` syntax.',
				'String literal unions: `type Status = \'a\' | \'b\' | \'c\'`.',
				'Add: `type TaskStatus = \'todo\' | \'in-progress\' | \'done\';`'
			],
			conceptsTested: ['typescript.type-aliases']
		}
	]
};
