import type { Lesson } from '$types/lesson';

export const generics: Lesson = {
	id: 'foundations.typescript-essentials.generics',
	slug: 'generics',
	title: 'Generics',
	description: 'Write reusable code with generic functions, generic types, and constraints.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 4,
	estimatedMinutes: 15,
	concepts: ['typescript.generics', 'typescript.generic-functions', 'typescript.constraints'],
	prerequisites: ['foundations.typescript-essentials.union-and-intersection'],

	content: [
		{
			type: 'text',
			content: `# Generics

Generics let you write code that works with any type while preserving type safety:

\`\`\`typescript
function identity<T>(value: T): T {
  return value;
}

identity('hello');  // returns string
identity(42);       // returns number
\`\`\`

Without generics, you'd need to use \`any\` (losing type safety) or write separate functions for each type.`
		},
		{
			type: 'concept-callout',
			content: 'typescript.generics'
		},
		{
			type: 'text',
			content: `## Generic Functions

A generic function declares type parameters in angle brackets:

\`\`\`typescript
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const num = first([1, 2, 3]);     // number | undefined
const str = first(['a', 'b']);    // string | undefined
\`\`\`

Look at the starter code. The \`wrapInArray\` function uses \`any\`.

**Task:** Make \`wrapInArray\` generic by replacing \`any\` with a type parameter \`T\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Generic Types

Interfaces and type aliases can also be generic:

\`\`\`typescript
interface ApiResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

type Pair<A, B> = { first: A; second: B };
\`\`\`

**Task:** Create a generic \`ApiResult<T>\` interface with \`data: T\`, \`loading: boolean\`, and \`error: string | null\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how the generic type parameter is resolved to a concrete type at each usage site. Notice how `ApiResult<string[]>` becomes a specific shape.'
		},
		{
			type: 'text',
			content: `## Generic Constraints

Use \`extends\` to constrain what types a generic accepts:

\`\`\`typescript
interface HasId {
  id: string;
}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
\`\`\`

**Task:** Create a \`findByProperty\` function with a constraint that \`T\` must have an \`id: string\` property.`
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
  // TODO: Make this function generic
  function wrapInArray(value: any): any[] {
    return [value];
  }

  // TODO: Create ApiResult<T> interface
  // TODO: Create findByProperty function with constraint

  let items = $state(wrapInArray('Hello'));
</script>

<div class="container">
  <h2>Generics Demo</h2>
  <p>Wrapped value: {JSON.stringify(items)}</p>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
  }

  h2 {
    color: var(--sf-accent, #6366f1);
    margin: 0 0 1rem;
  }

  p {
    color: #334155;
    font-family: 'Fira Code', monospace;
    background: #f1f5f9;
    padding: 0.75rem;
    border-radius: 0.25rem;
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
  function wrapInArray<T>(value: T): T[] {
    return [value];
  }

  interface ApiResult<T> {
    data: T;
    loading: boolean;
    error: string | null;
  }

  interface HasId {
    id: string;
  }

  function findByProperty<T extends HasId>(items: T[], id: string): T | undefined {
    return items.find(item => item.id === id);
  }

  let items = $state(wrapInArray('Hello'));
</script>

<div class="container">
  <h2>Generics Demo</h2>
  <p>Wrapped value: {JSON.stringify(items)}</p>
</div>

<style>
  .container {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
  }

  h2 {
    color: var(--sf-accent, #6366f1);
    margin: 0 0 1rem;
  }

  p {
    color: #334155;
    font-family: 'Fira Code', monospace;
    background: #f1f5f9;
    padding: 0.75rem;
    border-radius: 0.25rem;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Make wrapInArray generic with a type parameter T',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'wrapInArray<T>' },
						{ type: 'regex', value: 'value:\\s*T' }
					]
				}
			},
			hints: [
				'Generic type parameters go in angle brackets after the function name.',
				'Replace `any` with `T`: `function wrapInArray<T>(value: T): T[]`.',
				'Update to: `function wrapInArray<T>(value: T): T[] { return [value]; }`'
			],
			conceptsTested: ['typescript.generic-functions']
		},
		{
			id: 'cp-2',
			description: 'Create a generic ApiResult<T> interface',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'interface ApiResult<T>' },
						{ type: 'contains', value: 'data: T' }
					]
				}
			},
			hints: [
				'Interfaces can have generic type parameters: `interface Name<T> { }`.',
				'Use `T` as the type for the data property.',
				'Add: `interface ApiResult<T> { data: T; loading: boolean; error: string | null; }`'
			],
			conceptsTested: ['typescript.generics']
		},
		{
			id: 'cp-3',
			description: 'Create findByProperty with a HasId constraint',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'extends HasId' },
						{ type: 'contains', value: 'function findByProperty' }
					]
				}
			},
			hints: [
				'`extends` in a generic constrains what types are accepted.',
				'Define `interface HasId { id: string; }` first.',
				'Add: `function findByProperty<T extends HasId>(items: T[], id: string): T | undefined { return items.find(item => item.id === id); }`'
			],
			conceptsTested: ['typescript.constraints']
		}
	]
};
