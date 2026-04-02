import type { Lesson } from '$types/lesson';

export const generics: Lesson = {
	id: 'foundations.typescript-essentials.generics',
	slug: 'generics',
	title: 'Generics',
	description: 'Write reusable code with generic functions, generic types, and constraints.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 4,
	estimatedMinutes: 20,
	concepts: ['typescript.generics', 'typescript.generic-functions', 'typescript.constraints'],
	prerequisites: ['foundations.typescript-essentials.union-and-intersection'],

	content: [
		{
			type: 'text',
			content: `# Generics

Generics let you write functions, interfaces, and types that work with **any type** while preserving full type safety. Without generics, you would face a choice between two bad options:

1. **Use \`any\`** — works with all types but loses type information. The compiler cannot catch bugs.
2. **Write separate functions** — \`getFirstString()\`, \`getFirstNumber()\`, etc. Type-safe but duplicative and unmaintainable.

Generics give you the best of both worlds: one function that works with any type, with the compiler tracking which specific type is being used at each call site.

\`\`\`typescript
function identity<T>(value: T): T {
  return value;
}

const str = identity('hello');  // str: string — type preserved
const num = identity(42);       // num: number — type preserved
\`\`\`

The \`<T>\` is a **type parameter** — a placeholder for a type that will be supplied (or inferred) when the function is called. By convention, single uppercase letters are used: \`T\` for general types, \`K\` for keys, \`V\` for values, \`E\` for elements.

## How Generic Inference Works

When you call \`identity('hello')\`, TypeScript infers \`T = string\` from the argument. You can also specify the type explicitly:

\`\`\`typescript
const str = identity<string>('hello');   // Explicit — rarely needed
const str = identity('hello');            // Inferred — preferred
\`\`\`

Explicit type arguments are only necessary when TypeScript cannot infer the type, typically when there are no arguments to infer from:

\`\`\`typescript
function createArray<T>(): T[] {
  return [];
}

const strings = createArray<string>();  // Must specify — no argument to infer from
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'typescript.generics'
		},
		{
			type: 'text',
			content: `## Generic Functions

A generic function declares type parameters in angle brackets after the function name:

\`\`\`typescript
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const num = first([1, 2, 3]);     // T inferred as number → returns number | undefined
const str = first(['a', 'b']);    // T inferred as string → returns string | undefined
\`\`\`

### Multiple Type Parameters

Functions can have multiple type parameters when they deal with different types:

\`\`\`typescript
function pair<A, B>(first: A, second: B): [A, B] {
  return [first, second];
}

const result = pair('hello', 42);  // [string, number]
\`\`\`

A more practical example — a function that transforms a value:

\`\`\`typescript
function map<T, U>(items: T[], transform: (item: T) => U): U[] {
  return items.map(transform);
}

const lengths = map(['hello', 'world'], s => s.length);
// T = string, U = number → lengths: number[]
\`\`\`

Notice that both \`T\` and \`U\` are inferred: \`T\` from the array, \`U\` from the return type of the transform function. This is TypeScript's inference algorithm at its best.

### Arrow Functions and Generics

Arrow functions use the same syntax, but in \`.tsx\` files (JSX), the angle bracket can conflict with JSX syntax. A trailing comma resolves the ambiguity:

\`\`\`typescript
// Regular .ts file
const identity = <T>(value: T): T => value;

// In .tsx files, add a trailing comma to disambiguate from JSX
const identity = <T,>(value: T): T => value;
\`\`\`

In Svelte components (\`.svelte\` files with \`<script lang="ts">\`), this ambiguity does not arise because the generic is inside a script block, not JSX.

Look at the starter code. The \`wrapInArray\` function uses \`any\`.

**Task:** Make \`wrapInArray\` generic by replacing \`any\` with a type parameter \`T\`. Change the signature to \`function wrapInArray<T>(value: T): T[]\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Generic Types and Interfaces

Interfaces and type aliases can also be generic:

\`\`\`typescript
interface ApiResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

// Usage: the generic parameter specifies what 'data' contains
const userResult: ApiResult<User> = {
  data: { name: 'Alice', email: 'alice@example.com' },
  loading: false,
  error: null
};

const listResult: ApiResult<string[]> = {
  data: ['item1', 'item2'],
  loading: false,
  error: null
};
\`\`\`

### Default Type Parameters

Generic types can have defaults, similar to default function parameters:

\`\`\`typescript
interface ApiResult<T = unknown> {
  data: T;
  loading: boolean;
  error: string | null;
}

// No generic argument needed — defaults to unknown
const result: ApiResult = { data: 'anything', loading: false, error: null };
\`\`\`

### keyof — Extracting Key Types

The \`keyof\` operator creates a union type of all property keys of a type:

\`\`\`typescript
interface User {
  name: string;
  email: string;
  age: number;
}

type UserKeys = keyof User;  // 'name' | 'email' | 'age'
\`\`\`

\`keyof\` is essential for building type-safe property access functions:

\`\`\`typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { name: 'Alice', email: 'a@b.com', age: 30 };
const name = getProperty(user, 'name');    // type: string
const age = getProperty(user, 'age');      // type: number
getProperty(user, 'address');              // Error! 'address' is not in keyof User
\`\`\`

The return type \`T[K]\` is an **indexed access type** — it looks up the type of the property \`K\` in \`T\`. This is how TypeScript knows that accessing \`'name'\` returns \`string\` and accessing \`'age'\` returns \`number\`.

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

Use \`extends\` to constrain what types a generic accepts. Without constraints, a generic parameter can be *anything* — you cannot access specific properties because the type is unknown:

\`\`\`typescript
// Too broad — T could be anything
function getLength<T>(value: T): number {
  return value.length;  // Error! Property 'length' does not exist on type 'T'
}

// Constrained — T must have a length property
function getLength<T extends { length: number }>(value: T): number {
  return value.length;  // OK — we know T has .length
}

getLength('hello');     // OK — string has .length
getLength([1, 2, 3]);  // OK — array has .length
getLength(42);          // Error! number doesn't have .length
\`\`\`

### Named Constraints with Interfaces

For reusable constraints, define the shape as an interface:

\`\`\`typescript
interface HasId {
  id: string;
}

function findById<T extends HasId>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}

// T preserves the full type — you get back the specific item type, not just HasId
const users = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }];
const found = findById(users, '1');
// found: { id: string; name: string } | undefined — full shape preserved
\`\`\`

### Constraining With keyof

A powerful pattern combines \`extends\` with \`keyof\` to constrain a type parameter to the keys of another:

\`\`\`typescript
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map(item => item[key]);
}

const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
];

const names = pluck(users, 'name');  // string[]
const ages = pluck(users, 'age');    // number[]
pluck(users, 'email');               // Error! 'email' is not a key
\`\`\`

## Mapped Types — Transforming Shapes

Mapped types iterate over the keys of a type to produce a new type. The syntax uses \`in keyof\`:

\`\`\`typescript
// Make all properties optional
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

// Make all properties readonly
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};

// Make all properties nullable
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};
\`\`\`

Mapped types are the foundation of TypeScript's built-in utility types (\`Partial\`, \`Readonly\`, \`Pick\`, \`Record\` — covered in the next lesson).

**Task:** Create a \`findByProperty\` function with a constraint that \`T\` must have an \`id: string\` property. Define a \`HasId\` interface, then use \`<T extends HasId>\` in the function signature.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Generics in Svelte — Real-World Patterns

Generics appear frequently in Svelte component patterns:

### Generic Stores/State

\`\`\`typescript
function createAsyncState<T>() {
  let data: T | null = $state(null);
  let loading = $state(false);
  let error: string | null = $state(null);

  async function load(fetcher: () => Promise<T>) {
    loading = true;
    error = null;
    try {
      data = await fetcher();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Unknown error';
    } finally {
      loading = false;
    }
  }

  return {
    get data() { return data; },
    get loading() { return loading; },
    get error() { return error; },
    load
  };
}

// Usage — T is inferred from the fetcher's return type
const users = createAsyncState<User[]>();
await users.load(() => fetch('/api/users').then(r => r.json()));
\`\`\`

### Generic Event Handlers

\`\`\`typescript
function createHandler<T>(
  handler: (item: T) => void
): (item: T) => void {
  return (item) => {
    console.log('Handling:', item);
    handler(item);
  };
}

const handleUser = createHandler<User>(user => {
  // user is fully typed as User
  console.log(user.name);
});
\`\`\`

The key insight: generics allow you to write reusable utilities that work with *your specific types* without sacrificing type safety. Every time you find yourself writing \`any\` or duplicating a function for different types, consider whether a generic would be a better solution.`
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
