import type { Lesson } from '$types/lesson';

export const typesAndAnnotations: Lesson = {
	id: 'foundations.typescript-essentials.types-and-annotations',
	slug: 'types-and-annotations',
	title: 'Types and Annotations',
	description: 'Learn TypeScript basic types, type annotations, and how type inference reduces boilerplate.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 1,
	estimatedMinutes: 12,
	concepts: ['typescript.basic-types', 'typescript.annotations', 'typescript.inference'],
	prerequisites: [],

	content: [
		{
			type: 'text',
			content: `# Types and Annotations

TypeScript adds static types to JavaScript, catching errors before runtime.

Basic types:
- **\`string\`** — Text values
- **\`number\`** — All numbers (int and float)
- **\`boolean\`** — \`true\` or \`false\`
- **\`string[]\`** — Array of strings
- **\`null\` / \`undefined\`** — Absence of value`
		},
		{
			type: 'concept-callout',
			content: 'typescript.basic-types'
		},
		{
			type: 'text',
			content: `## Type Annotations

Annotations explicitly declare the type of a variable:

\`\`\`typescript
let name: string = 'Alice';
let age: number = 30;
let active: boolean = true;
let tags: string[] = ['svelte', 'typescript'];
\`\`\`

Look at the starter code. The variables have no type annotations.

**Task:** Add type annotations to \`userName\`, \`score\`, and \`isActive\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Type Inference

TypeScript can infer types from the assigned value — you don't always need annotations:

\`\`\`typescript
let name = 'Alice';    // inferred as string
let count = 0;         // inferred as number
let items = ['a', 'b']; // inferred as string[]
\`\`\`

Use annotations when the type isn't obvious or when declaring without an initial value.

**Task:** Add a function \`formatUser\` that takes \`name: string\` and \`score: number\` and returns a string.`
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

You can annotate function return types explicitly:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

**Task:** Add a return type annotation of \`: string\` to the \`formatUser\` function.`
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
