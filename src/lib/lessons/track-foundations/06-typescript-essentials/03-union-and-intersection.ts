import type { Lesson } from '$types/lesson';

export const unionAndIntersection: Lesson = {
	id: 'foundations.typescript-essentials.union-and-intersection',
	slug: 'union-and-intersection',
	title: 'Union and Intersection Types',
	description: 'Use union types for flexible values, type narrowing for safety, and discriminated unions for complex state.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 3,
	estimatedMinutes: 15,
	concepts: ['typescript.unions', 'typescript.narrowing', 'typescript.discriminated-unions'],
	prerequisites: ['foundations.typescript-essentials.interfaces-and-type-aliases'],

	content: [
		{
			type: 'text',
			content: `# Union and Intersection Types

Union types (\`|\`) allow a value to be one of several types. Intersection types (\`&\`) combine multiple types into one.

\`\`\`typescript
// Union — value is one of these types
type Result = string | number;
type Status = 'loading' | 'success' | 'error';

// Intersection — value has all properties
type Admin = User & { permissions: string[] };
\`\`\``
		},
		{
			type: 'concept-callout',
			content: 'typescript.unions'
		},
		{
			type: 'text',
			content: `## Union Types

A union type accepts any of the listed types:

\`\`\`typescript
function display(value: string | number) {
  console.log(value);
}
\`\`\`

Look at the starter code. The \`status\` variable accepts any string.

**Task:** Create a \`Status\` type alias that is a union of \`'loading' | 'success' | 'error'\` and annotate the \`status\` variable.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Type Narrowing

TypeScript narrows union types through control flow:

\`\`\`typescript
function process(value: string | number) {
  if (typeof value === 'string') {
    // TypeScript knows value is string here
    return value.toUpperCase();
  }
  // TypeScript knows value is number here
  return value.toFixed(2);
}
\`\`\`

**Task:** Add a function \`getStatusMessage\` that takes a \`Status\` and returns different messages using an \`if/else\` chain or \`switch\` statement.`
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
			content: `## Discriminated Unions

A discriminated union uses a common property to distinguish between variants:

\`\`\`typescript
type ApiResponse =
  | { status: 'success'; data: string[] }
  | { status: 'error'; message: string }
  | { status: 'loading' };
\`\`\`

The \`status\` property is the "discriminant" — TypeScript narrows the type when you check it.

**Task:** Create a \`ApiResponse\` discriminated union type with \`status\` as the discriminant and use it in the component.`
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
