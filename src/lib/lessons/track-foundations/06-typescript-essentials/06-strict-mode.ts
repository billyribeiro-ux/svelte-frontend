import type { Lesson } from '$types/lesson';

export const strictMode: Lesson = {
	id: 'foundations.typescript-essentials.strict-mode',
	slug: 'strict-mode',
	title: 'Strict Mode',
	description: 'Enable strict mode, noUncheckedIndexedAccess, satisfies, and const assertions for maximum type safety.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 6,
	estimatedMinutes: 12,
	concepts: ['typescript.strict', 'typescript.satisfies', 'typescript.const-assertions'],
	prerequisites: ['foundations.typescript-essentials.utility-types'],

	content: [
		{
			type: 'text',
			content: `# Strict Mode

TypeScript's \`strict\` flag enables a set of strict type-checking options that catch more bugs:

- **\`strictNullChecks\`** — \`null\` and \`undefined\` are their own types
- **\`noImplicitAny\`** — Variables must have explicit or inferred types
- **\`strictFunctionTypes\`** — Stricter function parameter checking
- **\`noUncheckedIndexedAccess\`** — Array/object indexing may return \`undefined\``
		},
		{
			type: 'concept-callout',
			content: 'typescript.strict'
		},
		{
			type: 'text',
			content: `## Null Checks

With \`strictNullChecks\`, you must handle \`null\` and \`undefined\` explicitly:

\`\`\`typescript
function getUser(id: string): User | null {
  // might return null
}

const user = getUser('123');
// user.name  // Error! user might be null
user?.name    // OK — optional chaining
\`\`\`

Look at the starter code. The \`findItem\` function may return \`undefined\`.

**Task:** Add a null check before using the result of \`findItem\`, using optional chaining or an \`if\` guard.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## The satisfies Operator

\`satisfies\` validates that a value matches a type without widening it:

\`\`\`typescript
type Color = 'red' | 'green' | 'blue' | [number, number, number];

// 'as const' preserves literal types
// 'satisfies' validates without widening
const palette = {
  primary: 'red',
  secondary: [0, 128, 255],
} satisfies Record<string, Color>;

palette.primary;     // type is 'red', not string | [number, number, number]
palette.secondary;   // type is [number, number, number]
\`\`\`

**Task:** Add \`satisfies Record<string, string>\` to the \`config\` object to validate it while keeping literal types.`
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
			content: `## Const Assertions

\`as const\` makes values deeply readonly with literal types:

\`\`\`typescript
const routes = ['/', '/about', '/contact'] as const;
// type: readonly ['/', '/about', '/contact']

type Route = typeof routes[number];
// type: '/' | '/about' | '/contact'
\`\`\`

**Task:** Add \`as const\` to the \`STATUSES\` array and create a \`Status\` type from it using \`typeof STATUSES[number]\`.`
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
