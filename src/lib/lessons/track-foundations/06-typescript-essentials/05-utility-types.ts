import type { Lesson } from '$types/lesson';

export const utilityTypes: Lesson = {
	id: 'foundations.typescript-essentials.utility-types',
	slug: 'utility-types',
	title: 'Utility Types',
	description: 'Use built-in utility types — Partial, Required, Pick, Omit, Record, and more — to transform types.',
	trackId: 'foundations',
	moduleId: 'typescript-essentials',
	order: 5,
	estimatedMinutes: 12,
	concepts: ['typescript.utility-types', 'typescript.partial', 'typescript.pick-omit'],
	prerequisites: ['foundations.typescript-essentials.generics'],

	content: [
		{
			type: 'text',
			content: `# Utility Types

TypeScript provides built-in utility types that transform existing types:

| Utility | Description |
|---------|-------------|
| \`Partial<T>\` | Makes all properties optional |
| \`Required<T>\` | Makes all properties required |
| \`Pick<T, K>\` | Selects specific properties |
| \`Omit<T, K>\` | Removes specific properties |
| \`Record<K, V>\` | Creates an object type with key type K and value type V |`
		},
		{
			type: 'concept-callout',
			content: 'typescript.utility-types'
		},
		{
			type: 'text',
			content: `## Partial and Required

\`Partial<T>\` makes every property optional — perfect for update functions:

\`\`\`typescript
interface User {
  name: string;
  email: string;
  age: number;
}

function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
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
			content: `## Pick and Omit

\`Pick\` selects properties; \`Omit\` excludes them:

\`\`\`typescript
type UserPreview = Pick<User, 'name' | 'email'>;
type PublicUser = Omit<User, 'password' | 'email'>;
\`\`\`

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
			content: `## Record

\`Record<K, V>\` creates an object type where all keys are of type \`K\` and all values are of type \`V\`:

\`\`\`typescript
type ThemeColors = Record<string, string>;
type StatusCounts = Record<'active' | 'inactive', number>;
\`\`\`

**Task:** Create a \`ThemeMap\` type using \`Record<string, string>\` and use it to type a theme colors object.`
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
