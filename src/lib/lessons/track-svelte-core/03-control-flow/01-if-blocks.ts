import type { Lesson } from '$types/lesson';

export const ifBlocks: Lesson = {
	id: 'svelte-core.control-flow.if-blocks',
	slug: 'if-blocks',
	title: 'Conditional Rendering with {#if}',
	description: 'Show and hide content conditionally using {#if}, {:else if}, and {:else} blocks.',
	trackId: 'svelte-core',
	moduleId: 'control-flow',
	order: 1,
	estimatedMinutes: 10,
	concepts: ['svelte5.control-flow.if', 'svelte5.control-flow.else'],
	prerequisites: ['svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Conditional Rendering with \`{#if}\`

In Svelte, you use template blocks to conditionally render content. The \`{#if}\` block shows content when a condition is true:

\`\`\`svelte
{#if condition}
  <p>This is shown when condition is true</p>
{/if}
\`\`\`

Unlike frameworks that use ternaries or \`&&\` in JSX, Svelte's block syntax reads like natural language.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.control-flow.if'
		},
		{
			type: 'text',
			content: `## Basic {#if}

Look at the starter code — there's a \`loggedIn\` state variable and a toggle button, but the greeting is always shown.

**Task:** Wrap the greeting in an \`{#if}\` block so it only shows when \`loggedIn\` is true.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Adding {:else}

You can add an \`{:else}\` branch to show alternative content:

\`\`\`svelte
{#if loggedIn}
  <p>Welcome back!</p>
{:else}
  <p>Please log in.</p>
{/if}
\`\`\`

**Task:** Add an \`{:else}\` block that shows a "Please log in" message.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how Svelte compiles `{#if}` blocks. Notice that Svelte creates and destroys DOM nodes efficiently — it does not hide them with CSS, it actually adds and removes them from the DOM.'
		},
		{
			type: 'text',
			content: `## Multiple Conditions with {:else if}

For multiple branches, use \`{:else if}\`:

\`\`\`svelte
{#if role === 'admin'}
  <p>Admin panel</p>
{:else if role === 'user'}
  <p>User dashboard</p>
{:else}
  <p>Guest view</p>
{/if}
\`\`\`

**Task:** Add a \`role\` state and render different content based on the role using \`{:else if}\`.`
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
  let loggedIn = $state(false);
  // TODO: Add a role state variable

  function toggle() {
    loggedIn = !loggedIn;
  }
</script>

<button onclick={toggle}>
  {loggedIn ? 'Log out' : 'Log in'}
</button>

<!-- TODO: Wrap this in an {#if} block -->
<h2>Welcome back, user!</h2>

<!-- TODO: Add {:else} for logged-out message -->

<!-- TODO: Add role-based rendering with {:else if} -->

<style>
  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-block-end: 1rem;
  }

  h2 {
    color: #1e293b;
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
  let loggedIn = $state(false);
  let role = $state<'admin' | 'user' | 'guest'>('guest');

  function toggle() {
    loggedIn = !loggedIn;
  }
</script>

<button onclick={toggle}>
  {loggedIn ? 'Log out' : 'Log in'}
</button>

{#if loggedIn}
  <h2>Welcome back, user!</h2>
{:else}
  <p>Please log in to continue.</p>
{/if}

<select bind:value={role}>
  <option value="admin">Admin</option>
  <option value="user">User</option>
  <option value="guest">Guest</option>
</select>

{#if role === 'admin'}
  <p>Admin panel: full access granted.</p>
{:else if role === 'user'}
  <p>User dashboard: standard access.</p>
{:else}
  <p>Guest view: limited access.</p>
{/if}

<style>
  button {
    padding: 0.5rem 1rem;
    background: #6366f1;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    margin-block-end: 1rem;
  }

  h2 {
    color: #1e293b;
  }

  select {
    padding: 0.5rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 1rem;
    margin-block: 1rem;
    display: block;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Wrap the greeting in an {#if} block',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{#if loggedIn}' },
						{ type: 'contains', value: '{/if}' }
					]
				}
			},
			hints: [
				'`{#if}` blocks use a special template syntax — they are not HTML attributes.',
				'Wrap the `<h2>` element: `{#if loggedIn}<h2>Welcome back, user!</h2>{/if}`',
				'Put `{#if loggedIn}` before the `<h2>` and `{/if}` after it.'
			],
			conceptsTested: ['svelte5.control-flow.if']
		},
		{
			id: 'cp-2',
			description: 'Add an {:else} block with a fallback message',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{:else}' },
						{ type: 'regex', value: '\\{:else\\}[\\s\\S]*[Ll]og\\s*in' }
					]
				}
			},
			hints: [
				'`{:else}` goes between the if content and `{/if}`.',
				'Add `{:else}<p>Please log in to continue.</p>` before the `{/if}`.',
				'Full block: `{#if loggedIn}<h2>Welcome back!</h2>{:else}<p>Please log in to continue.</p>{/if}`'
			],
			conceptsTested: ['svelte5.control-flow.else']
		},
		{
			id: 'cp-3',
			description: 'Add role-based conditional rendering with {:else if}',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '{:else if' },
						{ type: 'regex', value: "role\\s*===\\s*'" }
					]
				}
			},
			hints: [
				'First add a `role` state: `let role = $state(\'guest\');`',
				'`{:else if}` works like JavaScript `else if` — chain multiple conditions.',
				'Add: `{#if role === \'admin\'}<p>Admin panel</p>{:else if role === \'user\'}<p>User dashboard</p>{:else}<p>Guest view</p>{/if}`'
			],
			conceptsTested: ['svelte5.control-flow.if', 'svelte5.control-flow.else']
		}
	]
};
