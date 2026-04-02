import type { Lesson } from '$types/lesson';

export const typesAndAnnotations: Lesson = {
	id: 'foundations.typescript-essentials.types-and-annotations',
	slug: 'types-and-annotations',
	title: 'Types and Annotations',
	description: 'Learn TypeScript basic types, type annotations, and how type inference reduces boilerplate.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 1,
	estimatedMinutes: 18,
	concepts: ['typescript.basic-types', 'typescript.annotations', 'typescript.inference'],
	prerequisites: [],

	content: [
		{
			type: 'text',
			content: `# Types and Annotations

TypeScript adds a static type system on top of JavaScript. "Static" means types are checked at compile time — before your code ever runs. This catches entire categories of bugs that JavaScript only reveals at runtime: calling a method on \`undefined\`, passing a number where a string was expected, or accessing a property that does not exist.

But TypeScript does not just add types — it adds **structural types**. This distinction matters because it defines how TypeScript fundamentally differs from type systems in Java, C#, or other nominally-typed languages.

## Structural Typing — Duck Typing With Guardrails

In a **nominal** type system (Java, C#), two types are compatible only if they share the same name or explicit inheritance chain. In TypeScript's **structural** type system, two types are compatible if they have the same *shape* — the same properties with the same types:

\`\`\`typescript
interface Point {
  x: number;
  y: number;
}

interface Coordinate {
  x: number;
  y: number;
}

const p: Point = { x: 10, y: 20 };
const c: Coordinate = p;  // Works! Same shape, different names.
\`\`\`

This means you never need to explicitly implement an interface or extend a class for type compatibility. If the shape matches, it works. This is sometimes called "duck typing" — if it walks like a duck and quacks like a duck, TypeScript treats it as a duck.

Structural typing has a practical consequence: **you can pass an object with extra properties** to a function that expects fewer, as long as the required properties are present:

\`\`\`typescript
function printPoint(point: { x: number; y: number }) {
  console.log(point.x, point.y);
}

const point3D = { x: 1, y: 2, z: 3 };
printPoint(point3D);  // Works! point3D has x and y.
\`\`\`

However, TypeScript applies **excess property checking** on object literals — direct inline objects are checked more strictly to catch typos:

\`\`\`typescript
printPoint({ x: 1, y: 2, z: 3 });  // Error! 'z' does not exist.
// This is intentional — if you're writing the object right there,
// an extra property is likely a mistake.
\`\`\`

## Basic Types

TypeScript's primitive types mirror JavaScript:

| Type | Description | Example |
|------|-------------|---------|
| \`string\` | Text values | \`'hello'\`, \`\\\`template\\\`\` |
| \`number\` | All numbers (int and float) | \`42\`, \`3.14\`, \`0xFF\` |
| \`boolean\` | True or false | \`true\`, \`false\` |
| \`null\` | Intentional absence | \`null\` |
| \`undefined\` | Uninitialized value | \`undefined\` |
| \`bigint\` | Arbitrary-precision integers | \`9007199254740991n\` |
| \`symbol\` | Unique identifiers | \`Symbol('id')\` |

And the compound types:

| Type | Description | Example |
|------|-------------|---------|
| \`string[]\` | Array of strings | \`['a', 'b']\` |
| \`number[]\` | Array of numbers | \`[1, 2, 3]\` |
| \`[string, number]\` | Tuple — fixed-length, typed positions | \`['Alice', 30]\` |
| \`Record<string, number>\` | Object with string keys, number values | \`{ a: 1 }\` |`
		},
		{
			type: 'concept-callout',
			content: 'typescript.basic-types'
		},
		{
			type: 'text',
			content: `## Type Annotations

Annotations explicitly declare the type of a variable, parameter, or return value. The syntax places the type after a colon:

\`\`\`typescript
let name: string = 'Alice';
let age: number = 30;
let active: boolean = true;
let tags: string[] = ['svelte', 'typescript'];
let pair: [string, number] = ['Alice', 30];
\`\`\`

### When to Annotate

You do not need to annotate everything. TypeScript has powerful **type inference** (covered next). Annotations are valuable in specific situations:

1. **Function parameters** — always annotate. The compiler cannot infer parameter types from the function body alone.
2. **Variables without initial values** — \`let name: string;\` (no assigned value to infer from).
3. **Return types for public APIs** — explicit return types serve as documentation and catch accidental changes.
4. **Complex types** — when the inferred type is wider than you want.

Look at the starter code. The variables have no type annotations.

**Task:** Add type annotations to \`userName\`, \`score\`, and \`isActive\`. Use \`: string\`, \`: number\`, and \`: boolean\` respectively.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Type Inference — The Compiler's Brain

TypeScript's inference algorithm determines types automatically from context. Understanding what the compiler infers — and when it infers something wider than you want — saves you from both unnecessary annotations and unexpected behavior.

### Variable Inference

\`\`\`typescript
let name = 'Alice';       // Inferred: string (let allows reassignment)
const name = 'Alice';     // Inferred: 'Alice' (const = literal type)

let count = 0;            // Inferred: number
const count = 0;          // Inferred: 0 (literal type)

let items = ['a', 'b'];   // Inferred: string[]
let mixed = ['a', 1];     // Inferred: (string | number)[]
\`\`\`

Notice the \`let\` vs \`const\` distinction. \`const\` variables cannot be reassigned, so TypeScript infers the narrowest possible type (the literal value). \`let\` variables might be reassigned, so TypeScript widens to the general type.

### Return Type Inference

\`\`\`typescript
function add(a: number, b: number) {
  return a + b;   // Return type inferred as 'number'
}

function getStatus() {
  if (Math.random() > 0.5) return 'success';
  return 'error';
  // Return type inferred as 'success' | 'error' — a union of literals
}
\`\`\`

### Contextual Typing

TypeScript can infer parameter types from context — for example, when a callback is passed to a function that specifies the callback type:

\`\`\`typescript
const numbers = [1, 2, 3];
numbers.map(n => n * 2);  // 'n' is inferred as number — no annotation needed
// TypeScript knows Array<number>.map() passes a number to the callback
\`\`\`

## unknown vs any — The Safety Spectrum

Both \`unknown\` and \`any\` represent values of uncertain type, but they differ fundamentally in safety:

### any — The Escape Hatch

\`any\` disables all type checking. A value typed as \`any\` can be assigned to anything, called as a function, accessed like an object — the compiler will not complain:

\`\`\`typescript
let value: any = 'hello';
value.nonExistentMethod();   // No error at compile time — crashes at runtime
value = 42;
value = { foo: 'bar' };
// any is infectious — it silently disables checking wherever it spreads
\`\`\`

### unknown — The Safe Alternative

\`unknown\` is the type-safe counterpart. A value typed as \`unknown\` cannot be used until you narrow it:

\`\`\`typescript
let value: unknown = 'hello';
value.toUpperCase();          // Error! Object is of type 'unknown'

// You must narrow first:
if (typeof value === 'string') {
  value.toUpperCase();        // Now TypeScript knows it's a string
}
\`\`\`

**Rule of thumb:** Use \`unknown\` instead of \`any\` for values that come from outside your type system (API responses, user input, JSON parsing). \`unknown\` forces you to validate the data before using it, which is exactly what you should do with untrusted input.

\`\`\`typescript
// Bad — any lets bugs through
function processInput(data: any) {
  return data.name.toUpperCase();  // Crashes if data has no 'name'
}

// Good — unknown forces validation
function processInput(data: unknown) {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    return (data as { name: string }).name.toUpperCase();
  }
  throw new Error('Invalid input');
}
\`\`\`

**Task:** Add a function \`formatUser\` that takes \`name: string\` and \`score: number\` and returns a template string combining them.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and hover over variables to see their inferred types. Notice how TypeScript narrows types automatically based on control flow.'
		},
		{
			type: 'text',
			content: `## Function Return Types

You can annotate function return types explicitly by placing the type after the parameter list:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

// Arrow function with return type
const greet = (name: string): string => \`Hello, \${name}!\`;

// Void — function returns nothing
function logMessage(msg: string): void {
  console.log(msg);
}

// Never — function never returns (throws or infinite loop)
function throwError(msg: string): never {
  throw new Error(msg);
}
\`\`\`

### When to Annotate Return Types

The TypeScript community is split on this. Here is a pragmatic guideline:

- **Public API functions** (exported functions, class methods) — annotate. The return type serves as documentation and catches accidental type changes.
- **Internal helper functions** — let inference work. The inferred type is always correct and stays in sync with the implementation.
- **Complex functions** with multiple return paths — annotate. It is easy to accidentally return different types from different branches.

### The void vs undefined Distinction

\`void\` means "this function does not return a useful value." It is subtly different from returning \`undefined\`:

\`\`\`typescript
function doSomething(): void {
  // Can return undefined implicitly or explicitly
  return;        // OK
  return undefined; // OK
}

// void in callback types is special — it means "ignore the return value"
type Callback = () => void;
const cb: Callback = () => 42;  // OK! The return value is just ignored.
\`\`\`

This \`void\` behavior in callbacks exists so that functions like \`Array.prototype.forEach\` can accept callbacks that return values (like \`push\`, which returns a number) without type errors.

**Task:** Add a return type annotation of \`: string\` to the \`formatUser\` function.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Svelte and TypeScript — Practical Integration

In Svelte components with \`<script lang="ts">\`, TypeScript types interact with Svelte's reactivity system:

\`\`\`typescript
// $state infers the type from the initial value
let count = $state(0);          // inferred: number
let name = $state('Alice');     // inferred: string

// Annotate when the initial value doesn't capture the full type
let user: User | null = $state(null);   // Could be null initially
let items: string[] = $state([]);       // Empty array needs annotation
\`\`\`

The key insight: TypeScript annotations work alongside Svelte's runes (\`$state\`, \`$derived\`, \`$effect\`). The rune provides reactivity; the annotation provides type safety. They are complementary, not competing.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let userName = $state('Alice');
  let score = $state(95);
  let isActive = $state(true);

  // TODO: Add type annotations above
  // TODO: Add formatUser function with typed parameters and return type
</script>

<div class="profile">
  <h2>{userName}</h2>
  <p>Score: {score}</p>
  <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
</div>

<style>
  .profile {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  h2 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  p {
    color: #334155;
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
  let userName: string = $state('Alice');
  let score: number = $state(95);
  let isActive: boolean = $state(true);

  function formatUser(name: string, score: number): string {
    return \`\${name} — Score: \${score}\`;
  }
</script>

<div class="profile">
  <h2>{userName}</h2>
  <p>{formatUser(userName, score)}</p>
  <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
</div>

<style>
  .profile {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }

  h2 {
    margin: 0 0 0.5rem;
    color: var(--sf-accent, #6366f1);
  }

  p {
    color: #334155;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add type annotations to the state variables',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: ': string' },
						{ type: 'contains', value: ': number' },
						{ type: 'contains', value: ': boolean' }
					]
				}
			},
			hints: [
				'Type annotations go between the variable name and the `=` sign.',
				'Use `let userName: string`, `let score: number`, `let isActive: boolean`.',
				'Update to: `let userName: string = $state(\'Alice\'); let score: number = $state(95); let isActive: boolean = $state(true);`'
			],
			conceptsTested: ['typescript.annotations']
		},
		{
			id: 'cp-2',
			description: 'Create a formatUser function with typed parameters',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'function formatUser' },
						{ type: 'contains', value: 'name: string' }
					]
				}
			},
			hints: [
				'Function parameters use the same annotation syntax: `param: type`.',
				'Create `function formatUser(name: string, score: number)`.',
				'Add: `function formatUser(name: string, score: number) { return \\`\\${name} — Score: \\${score}\\`; }`'
			],
			conceptsTested: ['typescript.annotations']
		},
		{
			id: 'cp-3',
			description: 'Add a return type annotation to formatUser',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'formatUser\\([^)]*\\):\\s*string' }
					]
				}
			},
			hints: [
				'Return type annotations go after the parameter list: `): string {`.',
				'Add `: string` after the closing parenthesis of the parameters.',
				'Update to: `function formatUser(name: string, score: number): string {`'
			],
			conceptsTested: ['typescript.annotations']
		}
	]
};
