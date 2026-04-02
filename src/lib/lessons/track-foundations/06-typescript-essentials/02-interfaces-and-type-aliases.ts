import type { Lesson } from '$types/lesson';

export const interfacesAndTypeAliases: Lesson = {
	id: 'foundations.typescript-essentials.interfaces-and-type-aliases',
	slug: 'interfaces-and-type-aliases',
	title: 'Interfaces and Type Aliases',
	description: 'Define object shapes with interfaces and type aliases — learn when to use each and how to extend them.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 2,
	estimatedMinutes: 18,
	concepts: ['typescript.interfaces', 'typescript.type-aliases', 'typescript.extending'],
	prerequisites: ['foundations.typescript-essentials.types-and-annotations'],

	content: [
		{
			type: 'text',
			content: `# Interfaces and Type Aliases

TypeScript gives you two primary tools for defining object shapes: \`interface\` and \`type\`. They overlap significantly, but they are not identical. Understanding the differences — and having a clear decision framework — prevents inconsistency in your codebase.

## Interface — Defining Object Contracts

An interface declares the required and optional properties that an object must have:

\`\`\`typescript
interface User {
  name: string;
  email: string;
  age?: number;           // Optional property
  readonly id: string;    // Cannot be reassigned after creation
}

const user: User = {
  id: 'abc-123',
  name: 'Alice',
  email: 'alice@example.com'
  // age is optional, so omitting it is valid
};
\`\`\`

### Optional Properties

The \`?\` modifier makes a property optional. The type of an optional property is automatically unioned with \`undefined\`:

\`\`\`typescript
interface Config {
  apiUrl: string;
  timeout?: number;   // type is: number | undefined
}

function init(config: Config) {
  const timeout = config.timeout ?? 5000;  // Default if undefined
}
\`\`\`

### Readonly Properties

\`readonly\` prevents reassignment after the object is created:

\`\`\`typescript
interface Point {
  readonly x: number;
  readonly y: number;
}

const p: Point = { x: 10, y: 20 };
p.x = 30;  // Error! Cannot assign to 'x' because it is a read-only property.
\`\`\`

Note that \`readonly\` is shallow — it prevents reassignment of the property itself, but does not freeze nested objects. A \`readonly\` array property can still have its elements mutated.`
		},
		{
			type: 'concept-callout',
			content: 'typescript.interfaces'
		},
		{
			type: 'text',
			content: `## Defining an Interface

Look at the starter code. The \`task\` objects have no type.

**Task:** Define a \`Task\` interface with \`title: string\`, \`completed: boolean\`, and an optional \`priority: string\`.

When you define this interface, TypeScript will validate every object in the \`tasks\` array against the shape. If any object is missing \`title\` or \`completed\`, the compiler will flag it immediately.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Extending Interfaces

Interfaces can extend one or more other interfaces, inheriting all their properties and adding new ones:

\`\`\`typescript
interface TimestampedEntity {
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeletable {
  deletedAt: Date | null;
}

// Extend multiple interfaces
interface User extends TimestampedEntity, SoftDeletable {
  name: string;
  email: string;
}

// User now has: name, email, createdAt, updatedAt, deletedAt
\`\`\`

This is interface inheritance — it creates a new interface that includes all properties from the parent(s) plus any new ones you define. If a property name conflicts between parent interfaces, the types must be compatible.

### Declaration Merging — Interface's Unique Superpower

Interfaces with the same name in the same scope **merge** automatically:

\`\`\`typescript
interface Window {
  title: string;
}

interface Window {
  appVersion: string;
}

// Window now has both 'title' and 'appVersion'
\`\`\`

This is not a bug — it is a deliberate feature called **declaration merging**. It exists primarily for augmenting third-party types. For example, if a library's type definition is missing a property, you can add it without modifying the original:

\`\`\`typescript
// Augment the global Window interface
declare global {
  interface Window {
    analytics: AnalyticsClient;
  }
}

// Now window.analytics is typed throughout your codebase
\`\`\`

Type aliases (\`type\`) cannot merge — declaring the same name twice is an error. This is a key practical difference.

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
			content: `## Type Aliases — The Flexible Alternative

A \`type\` alias gives a name to any type — not just objects:

\`\`\`typescript
// Object shape — looks similar to interface
type Product = {
  id: number;
  title: string;
  price: number;
};

// Union type — interface cannot do this
type Status = 'active' | 'inactive' | 'pending';

// Tuple
type Coordinate = [number, number];

// Function type
type Formatter = (value: string) => string;

// Primitive alias
type ID = string | number;

// Mapped/computed type
type Readonly<T> = { readonly [K in keyof T]: T[K] };
\`\`\`

Type aliases use intersection (\`&\`) for composition (similar to interface \`extends\`):

\`\`\`typescript
type TimestampedEntity = {
  createdAt: Date;
  updatedAt: Date;
};

type User = TimestampedEntity & {
  name: string;
  email: string;
};
\`\`\`

### Index Signatures

Both interfaces and type aliases support index signatures — a way to describe objects with dynamic keys:

\`\`\`typescript
interface StringMap {
  [key: string]: string;   // Any string key maps to a string value
}

interface NumberMap {
  [key: string]: number;
  length: number;          // Specific keys must match the index signature type
  name: string;            // Error! 'string' is not assignable to 'number'
}
\`\`\`

Index signatures are useful for dictionaries, maps, and objects where you do not know all the keys at compile time:

\`\`\`typescript
interface TranslationDictionary {
  [key: string]: string;
}

const en: TranslationDictionary = {
  greeting: 'Hello',
  farewell: 'Goodbye',
  // Any string key is valid
};
\`\`\`

The \`Record<K, V>\` utility type is often a cleaner way to express the same thing:

\`\`\`typescript
type TranslationDictionary = Record<string, string>;
\`\`\`

## Interface vs Type — The Decision Matrix

| Feature | \`interface\` | \`type\` |
|---------|-------------|--------|
| Object shapes | Yes | Yes |
| Extends/inherits | \`extends\` keyword | \`&\` intersection |
| Declaration merging | Yes | No (error on duplicate) |
| Union types | No | Yes |
| Tuple types | No | Yes |
| Primitive aliases | No | Yes |
| Mapped types | No | Yes |
| \`implements\` (classes) | Yes | Yes (with limitations) |
| Computed properties | No | Yes (\`in keyof\`) |

### Practical Guidelines

1. **Use \`interface\` for object shapes** that describe the contract of an entity (User, Product, Config). Interfaces are more readable for this purpose, and declaration merging is available if needed.

2. **Use \`type\` for everything else** — unions, tuples, function types, mapped types, and any type that is not a plain object shape.

3. **Use \`type\` when you need computed or mapped types** — things like \`Partial<T>\`, \`Pick<T, K>\`, or custom mapped types require \`type\`.

4. **Be consistent within a codebase.** Pick a convention and stick to it. Some teams use \`type\` for everything (simpler mental model), others use \`interface\` for objects and \`type\` for the rest (more idiomatic TypeScript).

5. **In Svelte components,** use \`interface\` for component props and \`type\` for component-internal types like state variants. This aligns with Svelte's own type conventions.

**Task:** Create a type alias \`TaskStatus = 'todo' | 'in-progress' | 'done'\` and use it in the \`Task\` interface. This demonstrates the complementary nature of interfaces and type aliases — the interface defines the shape, the type alias defines the union.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Intersection Types for Composition

While interfaces use \`extends\`, type aliases compose with \`&\` (intersection):

\`\`\`typescript
type WithTimestamps = {
  createdAt: Date;
  updatedAt: Date;
};

type WithSoftDelete = {
  deletedAt: Date | null;
};

// Compose multiple types
type User = WithTimestamps & WithSoftDelete & {
  name: string;
  email: string;
};
\`\`\`

An intersection type has **all** properties from all constituent types. If two types have a property with the same name but different types, the resulting property type is the intersection of those types — which may be \`never\` if they are incompatible (a common source of confusion).

\`\`\`typescript
type A = { value: string };
type B = { value: number };
type C = A & B;
// C.value is: string & number = never (impossible type)
\`\`\`

This is why extending interfaces is preferred for objects — \`extends\` gives you a clear error when property types conflict, while \`&\` silently creates a \`never\` type.

## Real-World Pattern — Props in Svelte Components

A common pattern in Svelte + TypeScript is defining component props with an interface:

\`\`\`typescript
// In a Svelte component
interface Props {
  title: string;
  description?: string;
  variant?: 'primary' | 'secondary';
  onclick?: (event: MouseEvent) => void;
}

let { title, description = '', variant = 'primary', onclick }: Props = $props();
\`\`\`

The interface clearly documents what the component accepts. Default values handle optional props. This pattern is idiomatic Svelte 5 and gives you full type safety for component consumers.`
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
