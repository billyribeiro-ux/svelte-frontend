import type { Lesson } from '$types/lesson';

export const utilityTypes: Lesson = {
	id: 'foundations.typescript-essentials.utility-types',
	slug: 'utility-types',
	title: 'Utility Types',
	description: 'Use built-in utility types — Partial, Required, Pick, Omit, Record, and more — to transform types.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 5,
	estimatedMinutes: 18,
	concepts: ['typescript.utility-types', 'typescript.partial', 'typescript.pick-omit'],
	prerequisites: ['foundations.typescript-essentials.generics'],

	content: [
		{
			type: 'text',
			content: `# Utility Types

TypeScript ships with a library of built-in utility types that transform existing types into new ones. These are not magic — they are implemented using the same generics, mapped types, and conditional types you learned in the previous lessons. Understanding both *how to use them* and *how they are built* gives you the tools to create your own when the built-ins are not enough.

## The Core Utility Types

| Utility | Purpose | Source Implementation |
|---------|---------|----------------------|
| \`Partial<T>\` | Makes all properties optional | \`{ [K in keyof T]?: T[K] }\` |
| \`Required<T>\` | Makes all properties required | \`{ [K in keyof T]-?: T[K] }\` |
| \`Readonly<T>\` | Makes all properties readonly | \`{ readonly [K in keyof T]: T[K] }\` |
| \`Pick<T, K>\` | Selects specific properties | \`{ [P in K]: T[P] }\` |
| \`Omit<T, K>\` | Removes specific properties | \`Pick<T, Exclude<keyof T, K>>\` |
| \`Record<K, V>\` | Creates object type with keys K and values V | \`{ [P in K]: V }\` |
| \`Extract<T, U>\` | Extracts union members assignable to U | \`T extends U ? T : never\` |
| \`Exclude<T, U>\` | Removes union members assignable to U | \`T extends U ? never : T\` |
| \`NonNullable<T>\` | Removes null and undefined | \`Exclude<T, null \\| undefined>\` |
| \`ReturnType<T>\` | Extracts function return type | Conditional type with infer |
| \`Parameters<T>\` | Extracts function parameter types as tuple | Conditional type with infer |

The "Source Implementation" column shows the actual TypeScript source code. These are not abstractions over some hidden mechanism — they are just type-level code you could write yourself.`
		},
		{
			type: 'concept-callout',
			content: 'typescript.utility-types'
		},
		{
			type: 'text',
			content: `## Partial and Required — Toggling Optionality

### Partial<T>

\`Partial<T>\` makes every property optional. Its implementation is a mapped type with the \`?\` modifier:

\`\`\`typescript
// The actual implementation in TypeScript's lib.es5.d.ts:
type Partial<T> = {
  [K in keyof T]?: T[K];
};
\`\`\`

This iterates over every key \`K\` in \`T\`, keeps the value type \`T[K]\`, and adds \`?\` to make it optional.

**Use case: update functions.** When you update an entity, you typically want to change only some properties, not all:

\`\`\`typescript
interface Settings {
  theme: 'light' | 'dark';
  language: string;
  fontSize: number;
  notifications: boolean;
}

function updateSettings(current: Settings, updates: Partial<Settings>): Settings {
  return { ...current, ...updates };
}

// Only pass what changed — all other properties keep their current values
updateSettings(currentSettings, { theme: 'dark' });
updateSettings(currentSettings, { fontSize: 18, notifications: false });
\`\`\`

Without \`Partial\`, you would need to pass the full \`Settings\` object every time, even for a single property change.

### Required<T>

\`Required<T>\` is the inverse — it removes the \`?\` modifier, making all properties required:

\`\`\`typescript
// Implementation — note the -? which removes optionality
type Required<T> = {
  [K in keyof T]-?: T[K];
};
\`\`\`

The \`-?\` syntax is the "remove optional" modifier. There is also \`+?\` (add optional, equivalent to plain \`?\`) and \`-readonly\` / \`+readonly\` for the readonly modifier.

**Use case: configuration normalization.** Accept partial config from users, then normalize it with defaults:

\`\`\`typescript
interface Config {
  apiUrl?: string;
  timeout?: number;
  retries?: number;
}

function normalizeConfig(input: Config): Required<Config> {
  return {
    apiUrl: input.apiUrl ?? 'https://api.example.com',
    timeout: input.timeout ?? 5000,
    retries: input.retries ?? 3
  };
}
\`\`\`

Look at the starter code. The \`updateSettings\` function needs a proper type.

**Task:** Use \`Partial<Settings>\` as the type for the \`updates\` parameter in \`updateSettings\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Pick and Omit — Selecting and Excluding Properties

### Pick<T, K>

\`Pick\` creates a new type with only the specified properties:

\`\`\`typescript
// Implementation:
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
\`\`\`

The constraint \`K extends keyof T\` ensures you can only pick properties that actually exist on \`T\`.

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

type UserPreview = Pick<User, 'id' | 'name'>;
// { id: string; name: string }

type LoginCredentials = Pick<User, 'email' | 'password'>;
// { email: string; password: string }
\`\`\`

### Omit<T, K>

\`Omit\` creates a new type with the specified properties removed:

\`\`\`typescript
// Implementation — composed from Pick and Exclude:
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
\`\`\`

\`Omit\` works by first excluding the unwanted keys from \`keyof T\`, then picking the remaining keys.

\`\`\`typescript
type PublicUser = Omit<User, 'password'>;
// { id: string; name: string; email: string; createdAt: Date }

type CreateUserInput = Omit<User, 'id' | 'createdAt'>;
// { name: string; email: string; password: string }
\`\`\`

### Pick vs Omit — When to Use Which

- **Use \`Pick\`** when you want a small subset of a large type. Listing what you *want* is clearer than listing everything you do not want.
- **Use \`Omit\`** when you want most properties and only need to exclude a few. Listing what to *remove* is more concise.
- **Rule of thumb:** If you are picking more than half the properties, use \`Omit\` instead.

**Task:** Create a \`SettingsPreview\` type using \`Pick<Settings, 'theme' | 'language'>\`.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode and hover over the utility types to see how TypeScript resolves them into concrete property shapes.'
		},
		{
			type: 'text',
			content: `## Record — Building Object Types

\`Record<K, V>\` creates an object type where all keys are of type \`K\` and all values are of type \`V\`:

\`\`\`typescript
// Implementation:
type Record<K extends keyof any, V> = {
  [P in K]: V;
};
\`\`\`

### Common Record Patterns

\`\`\`typescript
// String-keyed dictionary
type ThemeColors = Record<string, string>;
const colors: ThemeColors = {
  primary: '#6366f1',
  background: '#f8fafc',
  text: '#334155'
};

// Literal union keys — creates a type with exactly those keys
type StatusCounts = Record<'active' | 'inactive' | 'pending', number>;
const counts: StatusCounts = {
  active: 42,
  inactive: 15,
  pending: 7
  // Missing any key is an error
  // Extra keys are also an error
};

// Mapping enum-like values to metadata
type StatusConfig = Record<'active' | 'inactive', {
  label: string;
  color: string;
}>;
\`\`\`

## Extract and Exclude — Filtering Unions

These utility types work on union types, not object types:

### Exclude<T, U>

Removes union members that are assignable to \`U\`:

\`\`\`typescript
// Implementation:
type Exclude<T, U> = T extends U ? never : T;

type AllStatuses = 'active' | 'inactive' | 'pending' | 'deleted';
type ActiveStatuses = Exclude<AllStatuses, 'deleted'>;
// 'active' | 'inactive' | 'pending'
\`\`\`

### Extract<T, U>

Keeps only union members that are assignable to \`U\`:

\`\`\`typescript
// Implementation:
type Extract<T, U> = T extends U ? T : never;

type StringOrNumber = string | number | boolean;
type OnlyStringOrNumber = Extract<StringOrNumber, string | number>;
// string | number
\`\`\`

## ReturnType and Parameters — Extracting Function Types

### ReturnType<T>

Extracts the return type of a function:

\`\`\`typescript
function fetchUser(id: string) {
  return { id, name: 'Alice', email: 'alice@example.com' };
}

type User = ReturnType<typeof fetchUser>;
// { id: string; name: string; email: string }
\`\`\`

This is useful when you want to derive types from existing functions rather than maintaining separate type definitions.

### Parameters<T>

Extracts parameter types as a tuple:

\`\`\`typescript
type FetchUserParams = Parameters<typeof fetchUser>;
// [id: string]

// Access individual parameters by index
type FirstParam = Parameters<typeof fetchUser>[0];
// string
\`\`\`

**Task:** Create a \`ThemeMap\` type using \`Record<string, string>\` and use it to type a theme colors object.`
		},
		{
			type: 'checkpoint',
			content: 'cp-3'
		},
		{
			type: 'text',
			content: `## Composing Utility Types — Building Complex Types

The real power of utility types emerges when you compose them:

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// API response — exclude sensitive and internal fields
type PublicUser = Omit<User, 'password'>;

// Creation input — no id or timestamps (server generates those)
type CreateUserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// Update input — partial, excluding immutable fields
type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt'>>;

// Admin view — everything, but readonly
type AdminUserView = Readonly<User>;

// Summary for lists — just the essentials
type UserSummary = Pick<User, 'id' | 'name' | 'role'>;
\`\`\`

Each derived type is a single line of code, fully type-safe, and automatically updated when the base \`User\` interface changes. If you add a new property to \`User\`, all the derived types reflect it immediately (except those that explicitly \`Pick\` or \`Omit\` it).

### Custom Utility Types

You can build your own utility types using the same techniques:

\`\`\`typescript
// Make specific properties optional (not all)
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type CreateUser = PartialBy<User, 'role' | 'createdAt'>;
// role and createdAt are optional, everything else is required

// Make specific properties required (not all)
type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Deep partial — makes nested objects optional too
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
\`\`\`

### Practical Pattern — Form State Types

\`\`\`typescript
interface UserFormData {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
}

// Validation errors — each field may have an error string
type FormErrors = Partial<Record<keyof UserFormData, string>>;

// Touched state — which fields has the user interacted with
type FormTouched = Partial<Record<keyof UserFormData, boolean>>;

// Dirty state — which fields have changed from initial values
type FormDirty = Partial<Record<keyof UserFormData, boolean>>;
\`\`\`

All three types are derived from \`UserFormData\`. Add a new field to the form data, and the error, touched, and dirty types automatically include it.`
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface Settings {
    theme: 'light' | 'dark';
    language: string;
    fontSize: number;
    notifications: boolean;
  }

  // TODO: Create SettingsPreview using Pick
  // TODO: Create ThemeMap using Record

  let settings: Settings = $state({
    theme: 'light',
    language: 'en',
    fontSize: 16,
    notifications: true
  });

  // TODO: Type the updates parameter with Partial<Settings>
  function updateSettings(updates: any) {
    settings = { ...settings, ...updates };
  }
</script>

<div class="settings">
  <h2>Settings</h2>
  <p>Theme: {settings.theme}</p>
  <p>Language: {settings.language}</p>
  <p>Font Size: {settings.fontSize}px</p>
  <button onclick={() => updateSettings({ theme: 'dark' })}>
    Switch to Dark
  </button>
</div>

<style>
  .settings {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    max-width: 400px;
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
    margin-block-start: 1rem;
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
  interface Settings {
    theme: 'light' | 'dark';
    language: string;
    fontSize: number;
    notifications: boolean;
  }

  type SettingsPreview = Pick<Settings, 'theme' | 'language'>;

  type ThemeMap = Record<string, string>;

  let settings: Settings = $state({
    theme: 'light',
    language: 'en',
    fontSize: 16,
    notifications: true
  });

  let themeColors: ThemeMap = {
    primary: '#6366f1',
    background: '#f8fafc',
    text: '#334155'
  };

  function updateSettings(updates: Partial<Settings>) {
    settings = { ...settings, ...updates };
  }
</script>

<div class="settings">
  <h2>Settings</h2>
  <p>Theme: {settings.theme}</p>
  <p>Language: {settings.language}</p>
  <p>Font Size: {settings.fontSize}px</p>
  <button onclick={() => updateSettings({ theme: 'dark' })}>
    Switch to Dark
  </button>
</div>

<style>
  .settings {
    font-family: system-ui, sans-serif;
    padding: 1.5rem;
    max-width: 400px;
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
    margin-block-start: 1rem;
    font-family: system-ui, sans-serif;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use Partial<Settings> for the updateSettings parameter',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'Partial<Settings>' }
					]
				}
			},
			hints: [
				'`Partial<T>` makes all properties of `T` optional.',
				'Replace `any` with `Partial<Settings>` in the function parameter.',
				'Update to: `function updateSettings(updates: Partial<Settings>) {`'
			],
			conceptsTested: ['typescript.partial']
		},
		{
			id: 'cp-2',
			description: 'Create a SettingsPreview type using Pick',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'type SettingsPreview' },
						{ type: 'contains', value: 'Pick<Settings' }
					]
				}
			},
			hints: [
				'`Pick<T, K>` creates a type with only the specified properties.',
				'Use `Pick<Settings, \'theme\' | \'language\'>` to select just those two.',
				'Add: `type SettingsPreview = Pick<Settings, \'theme\' | \'language\'>;`'
			],
			conceptsTested: ['typescript.pick-omit']
		},
		{
			id: 'cp-3',
			description: 'Create a ThemeMap type using Record',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'type ThemeMap' },
						{ type: 'contains', value: 'Record<' }
					]
				}
			},
			hints: [
				'`Record<K, V>` creates an object type with keys of type `K` and values of type `V`.',
				'Use `Record<string, string>` for a string-to-string mapping.',
				'Add: `type ThemeMap = Record<string, string>;`'
			],
			conceptsTested: ['typescript.utility-types']
		}
	]
};
