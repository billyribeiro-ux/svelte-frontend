import type { Lesson } from '$types/lesson';

export const strictMode: Lesson = {
	id: 'foundations.typescript-essentials.strict-mode',
	slug: 'strict-mode',
	title: 'Strict Mode',
	description: 'Enable strict mode, noUncheckedIndexedAccess, satisfies, and const assertions for maximum type safety.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 6,
	estimatedMinutes: 20,
	concepts: ['typescript.strict', 'typescript.satisfies', 'typescript.const-assertions'],
	prerequisites: ['foundations.typescript-essentials.utility-types'],

	content: [
		{
			type: 'text',
			content: `# Strict Mode

TypeScript's \`strict\` flag in \`tsconfig.json\` is not a single setting — it is an umbrella that enables a family of strict type-checking options. Each option closes a specific category of bugs. Understanding what each flag does, and seeing the before/after, demystifies "strict mode" from a scary toggle to a clear set of safety nets.

## The strict Flag Family

Setting \`"strict": true\` in your tsconfig enables all of the following:

| Flag | What it does |
|------|-------------|
| \`strictNullChecks\` | \`null\` and \`undefined\` are distinct types, not assignable to everything |
| \`noImplicitAny\` | Variables and parameters must have an explicit or inferred type |
| \`strictFunctionTypes\` | Function parameter types are checked contravariantly |
| \`strictBindCallApply\` | \`bind\`, \`call\`, and \`apply\` are checked strictly |
| \`strictPropertyInitialization\` | Class properties must be initialized in the constructor |
| \`noImplicitThis\` | \`this\` must have an explicit type in functions |
| \`useUnknownInCatchVariables\` | \`catch\` clause variables are \`unknown\` instead of \`any\` |
| \`alwaysStrict\` | Emits \`"use strict"\` in every file |

Plus an important flag that is **not** included in \`strict\` but should be enabled separately:

| Flag | What it does |
|------|-------------|
| \`noUncheckedIndexedAccess\` | Array/object index access may return \`undefined\` |

## Each Flag — Before and After

### strictNullChecks

This is the most impactful flag. Without it, \`null\` and \`undefined\` are silently assignable to every type:

\`\`\`typescript
// WITHOUT strictNullChecks — compiles but crashes at runtime
function getLength(str: string) {
  return str.length;
}
getLength(null);  // No error! Crashes: Cannot read property 'length' of null

// WITH strictNullChecks — caught at compile time
function getLength(str: string) {
  return str.length;
}
getLength(null);  // Error! Argument of type 'null' is not assignable to 'string'
\`\`\`

With strict null checks, if a value can be null, you must declare it:

\`\`\`typescript
function getUser(id: string): User | null {
  // Explicitly returns User or null
}

const user = getUser('123');
user.name;   // Error! user might be null
user?.name;  // OK — optional chaining
\`\`\`

### noImplicitAny

Without this flag, TypeScript silently assigns \`any\` to variables and parameters it cannot infer:

\`\`\`typescript
// WITHOUT noImplicitAny — parameter 'x' is silently 'any'
function double(x) {
  return x * 2;
}
double('hello');  // No error! Returns NaN at runtime

// WITH noImplicitAny — must annotate
function double(x: number) {
  return x * 2;
}
double('hello');  // Error! Argument of type 'string' is not assignable to 'number'
\`\`\`

### noUncheckedIndexedAccess (not in strict, must opt-in)

Array and object index access can return undefined if the index is out of bounds, but TypeScript does not reflect this by default:

\`\`\`typescript
const items = ['a', 'b', 'c'];

// WITHOUT noUncheckedIndexedAccess
const item = items[5];   // type: string (but actually undefined!)
item.toUpperCase();       // Crashes at runtime

// WITH noUncheckedIndexedAccess
const item = items[5];   // type: string | undefined
item.toUpperCase();       // Error! Object is possibly 'undefined'
item?.toUpperCase();      // OK — properly guarded
\`\`\`

This flag is not included in \`strict\` because it was added later and enabling it in existing codebases requires many fixes. For new projects, always enable it:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
\`\`\`

### useUnknownInCatchVariables

In JavaScript, you can throw *anything* — not just Error objects:

\`\`\`typescript
// WITHOUT useUnknownInCatchVariables
try { ... } catch (e) {
  // e is 'any' — no checking
  console.log(e.message);  // Might crash if e is not an Error
}

// WITH useUnknownInCatchVariables
try { ... } catch (e) {
  // e is 'unknown' — must narrow
  if (e instanceof Error) {
    console.log(e.message);  // Safe
  }
}
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'typescript.strict'
		},
		{
			type: 'text',
			content: `## Null Checks in Practice

With \`strictNullChecks\`, you must handle \`null\` and \`undefined\` explicitly. TypeScript provides several tools for this:

### Optional Chaining (\`?.\`)
\`\`\`typescript
const user = getUser('123');   // User | null
const name = user?.name;       // string | undefined
const upper = user?.name?.toUpperCase();  // string | undefined
\`\`\`

### Nullish Coalescing (\`??\`)
\`\`\`typescript
const name = user?.name ?? 'Anonymous';   // string (fallback if null/undefined)
// Unlike ||, ?? only falls back for null/undefined, not 0 or ''
\`\`\`

### Non-null Assertion (\`!\`) — Use Sparingly
\`\`\`typescript
const name = user!.name;  // Assert: "I know this is not null"
// Bypasses the check — use only when you have external knowledge the compiler lacks
\`\`\`

### Type Guard Functions
\`\`\`typescript
function isNonNull<T>(value: T | null | undefined): value is T {
  return value != null;
}

const users: (User | null)[] = [getUser('1'), getUser('2')];
const validUsers: User[] = users.filter(isNonNull);  // null removed, type narrowed
\`\`\`

Look at the starter code. The \`findItem\` function may return \`undefined\`.

**Task:** Add a null check before using the result of \`findItem\`. Use optional chaining (\`?.\`) with a nullish coalescing fallback (\`??\`): \`found?.name ?? 'Not found'\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## The satisfies Operator

Added in TypeScript 4.9, \`satisfies\` validates that a value matches a type **without widening** the inferred type. This solves a specific problem with type annotations.

### The Problem: Annotation Widens Types

\`\`\`typescript
type Color = 'red' | 'green' | 'blue' | [number, number, number];

// With a type annotation — type is widened to the annotation
const palette: Record<string, Color> = {
  primary: 'red',
  secondary: [0, 128, 255],
};

palette.primary.toUpperCase();
// Error! Property 'toUpperCase' does not exist on type 'Color'
// TypeScript only knows it's Color (string | [number, number, number])
// It lost the knowledge that 'primary' is specifically 'red'
\`\`\`

### The Solution: satisfies Preserves Literal Types

\`\`\`typescript
const palette = {
  primary: 'red',
  secondary: [0, 128, 255],
} satisfies Record<string, Color>;

palette.primary.toUpperCase();
// OK! TypeScript knows primary is 'red' (a string)

palette.secondary.map(n => n * 2);
// OK! TypeScript knows secondary is [number, number, number] (an array)
\`\`\`

\`satisfies\` performs two jobs:
1. **Validates** — checks that the value matches \`Record<string, Color>\`
2. **Preserves** — keeps the narrowest inferred type instead of widening to the annotation

### When to Use satisfies vs Type Annotations

| Situation | Use |
|-----------|-----|
| You need the type to be exactly what the annotation says | \`: Type\` annotation |
| You want validation but need to preserve literal types | \`satisfies Type\` |
| You want both validation and specific narrowing downstream | \`satisfies Type\` |
| Variable is exported and you want a stable API type | \`: Type\` annotation |

### satisfies With Configuration Objects

\`satisfies\` is ideal for configuration objects where you want validation but also want autocomplete to know the exact values:

\`\`\`typescript
type RouteConfig = {
  path: string;
  component: string;
  auth?: boolean;
};

const routes = {
  home: { path: '/', component: 'Home' },
  about: { path: '/about', component: 'About' },
  dashboard: { path: '/dashboard', component: 'Dashboard', auth: true },
} satisfies Record<string, RouteConfig>;

// TypeScript knows routes.home.path is '/', not just string
// And routes has exactly the keys: home, about, dashboard
\`\`\`

**Task:** Add \`satisfies Record<string, string>\` to the \`config\` object to validate it while keeping literal types. Place it after the closing brace of the object literal.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and compare the inferred types with `satisfies` vs a type annotation. Notice how `satisfies` preserves literal types while still validating.'
		},
		{
			type: 'text',
			content: `## Const Assertions — Deep Readonly Literals

\`as const\` tells TypeScript to infer the narrowest possible type — literal values, readonly arrays, and readonly objects:

### Without as const
\`\`\`typescript
const colors = ['red', 'green', 'blue'];
// Type: string[] — mutable, values are just 'string'

const config = { api: '/v1', timeout: 5000 };
// Type: { api: string; timeout: number } — values widened
\`\`\`

### With as const
\`\`\`typescript
const colors = ['red', 'green', 'blue'] as const;
// Type: readonly ['red', 'green', 'blue'] — tuple of literals, immutable

const config = { api: '/v1', timeout: 5000 } as const;
// Type: { readonly api: '/v1'; readonly timeout: 5000 } — literal values, immutable
\`\`\`

### Deriving Types From Constants

The most powerful use of \`as const\` is deriving types from runtime values. This eliminates the common "two sources of truth" problem where you maintain both a runtime array and a matching type:

\`\`\`typescript
// BEFORE — two sources of truth that can drift apart
const STATUSES = ['active', 'inactive', 'pending'];
type Status = 'active' | 'inactive' | 'pending';  // Must keep in sync manually!

// AFTER — single source of truth
const STATUSES = ['active', 'inactive', 'pending'] as const;
type Status = typeof STATUSES[number];  // 'active' | 'inactive' | 'pending'
// Automatically derived — always in sync
\`\`\`

The \`typeof STATUSES[number]\` pattern works as follows:
1. \`typeof STATUSES\` — gets the type of the array: \`readonly ['active', 'inactive', 'pending']\`
2. \`[number]\` — indexes the tuple with \`number\`, which gives a union of all element types

### Object Constants

\`as const\` works with objects too:

\`\`\`typescript
const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  DASHBOARD: '/dashboard',
} as const;

type Route = typeof ROUTES[keyof typeof ROUTES];
// '/' | '/about' | '/dashboard'
\`\`\`

### Combining satisfies and as const

You can use both together for the ultimate combination of validation and precision:

\`\`\`typescript
const THEME = {
  colors: {
    primary: '#6366f1',
    secondary: '#a855f7',
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
  },
} as const satisfies {
  colors: Record<string, string>;
  spacing: Record<string, string>;
};

// Validated against the shape, but all values are literal types
// THEME.colors.primary is '#6366f1', not string
\`\`\`

**Task:** Add \`as const\` to the \`STATUSES\` array and create a \`Status\` type from it using \`typeof STATUSES[number]\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Strict Mode Checklist for New Projects

When setting up a new TypeScript project (especially with Svelte), use these tsconfig settings:

\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
\`\`\`

### exactOptionalPropertyTypes (Bonus Flag)

This flag distinguishes between "property is missing" and "property is explicitly undefined":

\`\`\`typescript
interface User {
  name: string;
  nickname?: string;  // Can be omitted, but if present must be string
}

// WITHOUT exactOptionalPropertyTypes
const user: User = { name: 'Alice', nickname: undefined };  // OK

// WITH exactOptionalPropertyTypes
const user: User = { name: 'Alice', nickname: undefined };  // Error!
// If you want to allow undefined explicitly, declare: nickname?: string | undefined
\`\`\`

This catches a subtle bug: APIs that use \`hasOwnProperty\` or \`'key' in obj\` to check if a field was provided behave differently for "missing" vs "set to undefined."

## Type Safety Philosophy

Strict mode is not about being pedantic — it is about moving errors from runtime to compile time. Every \`strictNullChecks\` error that seems annoying at compile time is a potential \`TypeError: Cannot read property of null\` that would have reached your users. Every \`noImplicitAny\` annotation you add is a piece of documentation that helps the next developer (including future you) understand the code.

The goal is not perfect types — it is **fewer runtime surprises**. TypeScript's strict mode gets you there by making the compiler demand that you handle the edge cases your code will actually encounter.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface Item {
    id: string;
    name: string;
  }

  let items: Item[] = $state([
    { id: '1', name: 'Alpha' },
    { id: '2', name: 'Beta' },
    { id: '3', name: 'Gamma' }
  ]);

  function findItem(id: string): Item | undefined {
    return items.find(item => item.id === id);
  }

  // TODO: Add null check before using result
  let found = findItem('2');
  let displayName = found.name;

  // TODO: Add satisfies to validate config
  const config = {
    apiUrl: 'https://api.example.com',
    environment: 'production',
    version: '1.0.0'
  };

  // TODO: Add as const and derive Status type
  const STATUSES = ['active', 'inactive', 'pending'];
</script>

<div class="container">
  <h2>Strict Mode Demo</h2>
  <p>Found: {displayName}</p>
  <p>Environment: {config.environment}</p>
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
  interface Item {
    id: string;
    name: string;
  }

  let items: Item[] = $state([
    { id: '1', name: 'Alpha' },
    { id: '2', name: 'Beta' },
    { id: '3', name: 'Gamma' }
  ]);

  function findItem(id: string): Item | undefined {
    return items.find(item => item.id === id);
  }

  let found = findItem('2');
  let displayName = found?.name ?? 'Not found';

  const config = {
    apiUrl: 'https://api.example.com',
    environment: 'production',
    version: '1.0.0'
  } satisfies Record<string, string>;

  const STATUSES = ['active', 'inactive', 'pending'] as const;
  type Status = typeof STATUSES[number];
</script>

<div class="container">
  <h2>Strict Mode Demo</h2>
  <p>Found: {displayName}</p>
  <p>Environment: {config.environment}</p>
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
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Add null-safe access to the findItem result',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'regex', value: 'found\\?\\.' }
					]
				}
			},
			hints: [
				'`findItem` returns `Item | undefined`, so direct property access is unsafe.',
				'Use optional chaining: `found?.name` with a fallback.',
				'Update to: `let displayName = found?.name ?? \'Not found\';`'
			],
			conceptsTested: ['typescript.strict']
		},
		{
			id: 'cp-2',
			description: 'Add satisfies to validate the config object',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'satisfies' }
					]
				}
			},
			hints: [
				'`satisfies` validates a value matches a type without widening.',
				'Add `satisfies Record<string, string>` after the object literal.',
				'Update to: `const config = { ... } satisfies Record<string, string>;`'
			],
			conceptsTested: ['typescript.satisfies']
		},
		{
			id: 'cp-3',
			description: 'Add as const and derive a Status type from the array',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'as const' },
						{ type: 'contains', value: 'type Status' }
					]
				}
			},
			hints: [
				'`as const` makes the array readonly with literal string types.',
				'`typeof STATUSES[number]` extracts a union type from the array values.',
				'Add `as const` to the array and: `type Status = typeof STATUSES[number];`'
			],
			conceptsTested: ['typescript.const-assertions']
		}
	]
};
