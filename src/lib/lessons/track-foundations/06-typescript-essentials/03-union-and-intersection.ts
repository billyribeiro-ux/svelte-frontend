import type { Lesson } from '$types/lesson';

export const unionAndIntersection: Lesson = {
	id: 'foundations.typescript-essentials.union-and-intersection',
	slug: 'union-and-intersection',
	title: 'Union and Intersection Types',
	description: 'Use union types for flexible values, type narrowing for safety, and discriminated unions for complex state.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 3,
	estimatedMinutes: 20,
	concepts: ['typescript.unions', 'typescript.narrowing', 'typescript.discriminated-unions'],
	prerequisites: ['foundations.typescript-essentials.interfaces-and-type-aliases'],

	content: [
		{
			type: 'text',
			content: `# Union and Intersection Types

Union and intersection types are the algebraic building blocks of TypeScript's type system. They let you compose types from existing types — union (\`|\`) says "this OR that," and intersection (\`&\`) says "this AND that." Together, they enable you to model complex domain logic precisely.

## Union Types — One of Several

A union type accepts any of the listed types:

\`\`\`typescript
// Primitive union
type StringOrNumber = string | number;

// Literal union — a fixed set of allowed values
type Direction = 'north' | 'south' | 'east' | 'west';

// Mixed union
type ID = string | number;

// Union with null (common for optional values)
type MaybeUser = User | null;
\`\`\`

When you have a value of a union type, TypeScript only allows you to access members that are common to **all** types in the union:

\`\`\`typescript
function getLength(value: string | number) {
  value.toString();    // OK — both string and number have toString()
  value.toUpperCase(); // Error! number doesn't have toUpperCase()
}
\`\`\`

This restriction forces you to **narrow** the type before using type-specific methods. This is not a limitation — it is a safety feature that prevents runtime errors.

## Intersection Types — All at Once

An intersection type combines multiple types into one that has all properties:

\`\`\`typescript
type User = { name: string; email: string };
type WithTimestamps = { createdAt: Date; updatedAt: Date };

type TimestampedUser = User & WithTimestamps;
// Has: name, email, createdAt, updatedAt

const user: TimestampedUser = {
  name: 'Alice',
  email: 'alice@example.com',
  createdAt: new Date(),
  updatedAt: new Date()
};
\`\`\`

Think of intersection as merging two shapes. Union is a choice (A or B); intersection is a combination (A and B).`
		},
		{
			type: 'concept-callout',
			content: 'typescript.unions'
		},
		{
			type: 'text',
			content: `## Union Types in Practice

Look at the starter code. The \`status\` variable accepts any string.

**Task:** Create a \`Status\` type alias that is a union of \`'loading' | 'success' | 'error'\` and annotate the \`status\` variable with it.

By constraining the type to a union of string literals, you get two benefits:
1. The compiler prevents typos — \`status = 'sucess'\` would be caught.
2. Autocomplete suggests the valid values as you type.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Type Narrowing — From General to Specific

TypeScript's **control flow analysis** tracks the type of a value through conditionals, allowing you to "narrow" a union type to a specific member:

### typeof Narrowing
\`\`\`typescript
function process(value: string | number) {
  if (typeof value === 'string') {
    // TypeScript knows: value is string
    return value.toUpperCase();
  }
  // TypeScript knows: value is number (only option left)
  return value.toFixed(2);
}
\`\`\`

### Equality Narrowing
\`\`\`typescript
function handleStatus(status: 'loading' | 'success' | 'error') {
  if (status === 'loading') {
    // TypeScript knows: status is 'loading'
    return 'Please wait...';
  }
  if (status === 'success') {
    // TypeScript knows: status is 'success'
    return 'Done!';
  }
  // TypeScript knows: status is 'error' (only option left)
  return 'Something went wrong.';
}
\`\`\`

### Truthiness Narrowing
\`\`\`typescript
function greet(name: string | null) {
  if (name) {
    // TypeScript knows: name is string (null is falsy)
    return \`Hello, \${name}!\`;
  }
  return 'Hello, stranger!';
}
\`\`\`

### \`in\` Operator Narrowing
\`\`\`typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ('swim' in animal) {
    // TypeScript knows: animal is Fish
    animal.swim();
  } else {
    // TypeScript knows: animal is Bird
    animal.fly();
  }
}
\`\`\`

### \`instanceof\` Narrowing
\`\`\`typescript
function formatError(error: Error | string) {
  if (error instanceof Error) {
    return error.message;
  }
  return error;
}
\`\`\`

**Task:** Add a function \`getStatusMessage\` that takes a \`Status\` and returns different messages using an \`if/else\` chain or \`switch\` statement. This exercises type narrowing — TypeScript will narrow the union as you check each variant.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and observe how TypeScript narrows the type inside each branch of the conditional. The type changes from the union to a specific literal.'
		},
		{
			type: 'text',
			content: `## Discriminated Unions — State Machines in Types

A **discriminated union** (also called a tagged union) uses a common literal property — the **discriminant** — to distinguish between variants:

\`\`\`typescript
type ApiResponse =
  | { status: 'success'; data: string[] }
  | { status: 'error'; message: string }
  | { status: 'loading' };
\`\`\`

The \`status\` property appears in every variant but with a different literal value. When you check \`status\`, TypeScript automatically narrows to the correct variant and makes the variant-specific properties available:

\`\`\`typescript
function handleResponse(response: ApiResponse) {
  switch (response.status) {
    case 'success':
      // TypeScript knows: response has { data: string[] }
      console.log(response.data);
      break;
    case 'error':
      // TypeScript knows: response has { message: string }
      console.log(response.message);
      break;
    case 'loading':
      // TypeScript knows: response is { status: 'loading' }
      console.log('Loading...');
      break;
  }
}
\`\`\`

### Discriminated Unions as State Machines

Discriminated unions are the TypeScript equivalent of finite state machines. Each variant represents a valid state, and the discriminant is the state identifier. This pattern makes **impossible states unrepresentable**:

\`\`\`typescript
// BAD — allows impossible combinations
interface RequestState {
  loading: boolean;
  data: string[] | null;
  error: string | null;
}
// Can have loading=true AND data=['stuff'] AND error='oops' — nonsense!

// GOOD — each state is explicit and self-consistent
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; error: string };
// Cannot have data and error at the same time
\`\`\`

The bad version has 2^3 = 8 possible combinations of booleans and nulls, most of which are invalid. The good version has exactly 4 states, all valid. This is a fundamental design principle: **model your state so that the type system prevents invalid states**.

### Exhaustive Checking with never

When you handle a discriminated union in a switch statement, TypeScript can verify that you have handled every variant. The \`never\` type represents a value that should never exist — if a variable narrows to \`never\`, it means all possibilities have been exhausted:

\`\`\`typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rect'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rect':
      return shape.width * shape.height;
    case 'triangle':
      return 0.5 * shape.base * shape.height;
    default: {
      // If we handled all cases, shape is 'never' here
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}
\`\`\`

If you later add a new variant (e.g., \`{ kind: 'pentagon' }\`) to the \`Shape\` type, the \`default\` branch will produce a compile error because \`shape\` is no longer \`never\` — it is the unhandled \`pentagon\` variant. This is called **exhaustive checking**, and it ensures you never forget to handle a new state.

You can also extract this into a helper function:

\`\`\`typescript
function assertNever(value: never): never {
  throw new Error(\`Unexpected value: \${JSON.stringify(value)}\`);
}

// Usage in switch default:
default:
  return assertNever(shape);
\`\`\`

**Task:** Create an \`ApiResponse\` discriminated union type with \`status\` as the discriminant. Include variants for \`'success'\` (with \`data: string[]\`), \`'error'\` (with \`message: string\`), and \`'loading'\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Discriminated Unions in Svelte Components

Discriminated unions pair naturally with Svelte's conditional rendering:

\`\`\`svelte
<script lang="ts">
  type ViewState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success'; items: string[] };

  let state: ViewState = $state({ status: 'loading' });
</script>

{#if state.status === 'loading'}
  <p>Loading...</p>
{:else if state.status === 'error'}
  <p class="error">{state.message}</p>
{:else}
  <ul>
    {#each state.items as item}
      <li>{item}</li>
    {/each}
  </ul>
{/if}
\`\`\`

Each branch of the \`{#if}\` block has access to the correct properties for that state. The template and the type system are in agreement — the UI cannot render \`state.items\` when the state is \`'loading'\` because TypeScript will not allow it.

### Pattern — Reducer-Style State Updates

Discriminated unions combine well with explicit state transition functions:

\`\`\`typescript
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string[] }
  | { status: 'error'; error: string };

type Action =
  | { type: 'FETCH' }
  | { type: 'FETCH_SUCCESS'; data: string[] }
  | { type: 'FETCH_ERROR'; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH':
      return { status: 'loading' };
    case 'FETCH_SUCCESS':
      return { status: 'success', data: action.data };
    case 'FETCH_ERROR':
      return { status: 'error', error: action.error };
  }
}
\`\`\`

Every state transition is explicit, type-checked, and traceable. The compiler ensures you produce a valid \`State\` from every action.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Define Status type and ApiResponse discriminated union

  let status = $state('loading');

  // TODO: Add getStatusMessage function

  function simulateLoad() {
    status = 'loading';
    setTimeout(() => {
      status = 'success';
    }, 1500);
  }
</script>

<div class="container">
  <h2>Status: {status}</h2>
  <button onclick={simulateLoad}>Reload</button>
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

  button {
    background: var(--sf-accent, #6366f1);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
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
  type Status = 'loading' | 'success' | 'error';

  type ApiResponse =
    | { status: 'success'; data: string[] }
    | { status: 'error'; message: string }
    | { status: 'loading' };

  let status: Status = $state('loading');

  function getStatusMessage(s: Status): string {
    if (s === 'loading') return 'Loading data...';
    if (s === 'success') return 'Data loaded successfully!';
    return 'An error occurred.';
  }

  function simulateLoad() {
    status = 'loading';
    setTimeout(() => {
      status = 'success';
    }, 1500);
  }
</script>

<div class="container">
  <h2>Status: {status}</h2>
  <p>{getStatusMessage(status)}</p>
  <button onclick={simulateLoad}>Reload</button>
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

  button {
    background: var(--sf-accent, #6366f1);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-family: system-ui, sans-serif;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Create a Status union type and annotate the status variable',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'type Status' },
						{ type: 'contains', value: "'loading'" },
						{ type: 'contains', value: "'success'" }
					]
				}
			},
			hints: [
				'Union types use `|` to combine string literal types.',
				'Define `type Status = \'loading\' | \'success\' | \'error\'`.',
				'Add: `type Status = \'loading\' | \'success\' | \'error\';` and update to `let status: Status = $state(\'loading\');`'
			],
			conceptsTested: ['typescript.unions']
		},
		{
			id: 'cp-2',
			description: 'Add a getStatusMessage function with type narrowing',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'function getStatusMessage' },
						{ type: 'contains', value: 'Status' }
					]
				}
			},
			hints: [
				'The function should take a `Status` parameter and return a string.',
				'Use `if` or `switch` to handle each status value.',
				'Add: `function getStatusMessage(s: Status): string { if (s === \'loading\') return \'Loading...\'; ... }`'
			],
			conceptsTested: ['typescript.narrowing']
		},
		{
			id: 'cp-3',
			description: 'Create an ApiResponse discriminated union type',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'type ApiResponse' },
						{ type: 'regex', value: "status:\\s*'success'" },
						{ type: 'regex', value: "status:\\s*'error'" }
					]
				}
			},
			hints: [
				'A discriminated union has a common property (the discriminant) in each variant.',
				'Each variant has `status` plus different additional properties.',
				'Add: `type ApiResponse = | { status: \'success\'; data: string[] } | { status: \'error\'; message: string } | { status: \'loading\' };`'
			],
			conceptsTested: ['typescript.discriminated-unions']
		}
	]
};
