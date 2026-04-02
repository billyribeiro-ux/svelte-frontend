import type { Lesson } from '$types/lesson';

export const ifBlocks: Lesson = {
	id: 'svelte-core.control-flow.if-blocks',
	slug: 'if-blocks',
	title: 'Conditional Rendering with {#if}',
	description: 'Show and hide content conditionally using {#if}, {:else if}, and {:else} blocks.',
	trackId: 'svelte-core',
	moduleId: 'control-flow',
	order: 1,
	estimatedMinutes: 15,
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

## Why Template Blocks Instead of JSX Ternaries

If you are coming from React, you might be used to conditional rendering with ternaries and logical AND operators:

\`\`\`jsx
// React — ternaries and && in JSX
return (
  <div>
    {isLoggedIn ? <Dashboard /> : <Login />}
    {showBanner && <Banner />}
    {role === 'admin' ? <AdminPanel /> :
     role === 'user' ? <UserDashboard /> :
     <GuestView />}
  </div>
);
\`\`\`

This approach has well-known problems:

1. **Readability degrades with complexity.** Simple ternaries are fine, but nested ternaries become unreadable fast. The three-way role check above requires careful indentation and mental parsing to understand which branch produces which output.

2. **The \`&&\` trap.** In React, \`{count && <Items />}\` renders \`0\` instead of nothing when \`count\` is zero, because \`0\` is falsy but still a valid React element. This is a notorious source of bugs.

3. **No clear scope boundaries.** In JSX, the conditional expression and the rendered content are mixed together in a single expression tree. There is no visual delimiter marking where one branch ends and another begins.

Svelte's template blocks solve all of these:

\`\`\`svelte
{#if isLoggedIn}
  <Dashboard />
{:else}
  <Login />
{/if}

{#if showBanner}
  <Banner />
{/if}

{#if role === 'admin'}
  <AdminPanel />
{:else if role === 'user'}
  <UserDashboard />
{:else}
  <GuestView />
{/if}
\`\`\`

Each block has clear opening (\`{#if}\`), continuation (\`{:else if}\`, \`{:else}\`), and closing (\`{/if}\`) tags. The structure reads like natural language, and there is no ambiguity about which content belongs to which branch.

### The Template Syntax Convention

Svelte uses a consistent prefix convention across all template blocks:

- \`#\` — **Opens** a new block (\`{#if}\`, \`{#each}\`, \`{#await}\`, \`{#snippet}\`, \`{#key}\`)
- \`:\` — **Continues** an existing block (\`{:else}\`, \`{:else if}\`, \`{:then}\`, \`{:catch}\`)
- \`/\` — **Closes** a block (\`{/if}\`, \`{/each}\`, \`{/await}\`, \`{/snippet}\`, \`{/key}\`)

Once you recognize this convention, every new template block you encounter follows the same pattern. It is a small language design choice that pays off enormously in readability.

## DOM Creation and Destruction — How Svelte Handles Conditional Content

A critical difference between Svelte and many other frameworks: **when a condition changes, Svelte actually creates and destroys DOM elements.** It does not hide them with CSS (\`display: none\`), and it does not keep them in a virtual tree somewhere. The elements are literally added to and removed from the document.

This has important implications:

1. **Component lifecycle.** When an \`{#if}\` block becomes false, any components inside it are destroyed — their effects are cleaned up, their state is lost. When the block becomes true again, the components are created fresh. If you need to preserve state across visibility toggles, use CSS visibility instead.

2. **Performance characteristics.** Creating DOM elements has a cost. If a condition toggles rapidly (like a tooltip appearing on hover), the repeated creation and destruction can be expensive. For frequently toggling content, consider using CSS to show/hide rather than \`{#if}\` to create/destroy.

3. **Transitions and animations.** Because Svelte knows exactly when elements are being created and destroyed, it can hook into those moments to play entrance and exit animations. This is the foundation of Svelte's transition system (\`in:\`, \`out:\`, \`transition:\` directives).

4. **Form state reset.** If an \`{#if}\` block contains a \`<form>\` or \`<input>\` elements, toggling the condition resets all form state. Typed text, checkbox states, scroll positions — all gone when the block becomes false. This catches developers off guard when building tabbed interfaces where each tab is an \`{#if}\` branch.

### How the Compiler Generates Branching Code

Under the hood, the Svelte compiler generates efficient JavaScript for each \`{#if}\` block. It creates separate "fragment" functions for each branch — one for the \`{#if}\` content, one for each \`{:else if}\`, and one for \`{:else}\`. Only the active branch's fragment is mounted to the DOM.

When the condition changes, Svelte:
1. Runs the cleanup/destroy logic for the current branch's fragment
2. Creates the new branch's fragment
3. Mounts the new fragment at the same position in the DOM

There is no virtual DOM diffing. Svelte knows exactly which branch was active and which is becoming active, so it can make the switch with minimal overhead.

### Comparison with Virtual DOM Conditional Rendering

In a virtual DOM framework like React:
- Both branches are expressed as VDOM nodes in the render function
- The framework diffs the entire VDOM tree to determine what changed
- Elements that exist in both branches might be reused or might be recreated, depending on the diffing algorithm's heuristics
- Keys are sometimes needed to force proper cleanup when components change type

In Svelte:
- Each branch is a separate compiled fragment
- The framework knows at compile time that this is a conditional — no diffing needed
- Switching branches always destroys the old and creates the new
- The cost is proportional to the branch size, not the tree size

### When NOT to Use {#if}

Understanding DOM creation and destruction helps you know when \`{#if}\` is the wrong tool:

- **Frequently toggling content** (tooltips, dropdowns that open/close rapidly): Use CSS \`display\`, \`visibility\`, or \`opacity\` instead.
- **Tabs with form state**: Store form data in \`$state\` variables above the \`{#if}\` block so it persists across tab switches.
- **Large content that toggles**: If the DOM subtree is large and toggles frequently, the creation cost adds up. CSS hiding is cheaper.
- **Animations that need both states present**: Some animations need the old and new content to exist simultaneously (crossfade). Use Svelte's transition system rather than raw \`{#if}\` for these.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.control-flow.if'
		},
		{
			type: 'text',
			content: `## Basic \`{#if}\`

Look at the starter code — there is a \`loggedIn\` state variable and a toggle button, but the greeting is always shown regardless of the login state.

**Task:** Wrap the greeting in an \`{#if}\` block so it only shows when \`loggedIn\` is true.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Adding \`{:else}\`

You can add an \`{:else}\` branch to show alternative content when the condition is false:

\`\`\`svelte
{#if loggedIn}
  <p>Welcome back!</p>
{:else}
  <p>Please log in.</p>
{/if}
\`\`\`

The \`{:else}\` tag uses a colon prefix (\`:\`) which signals a *continuation* of the existing block, as opposed to the hash prefix (\`#\`) which opens a new block or the slash prefix (\`/\`) which closes one. This naming convention is consistent across all Svelte template blocks.

### Truthiness in Svelte Conditions

Svelte's \`{#if}\` uses JavaScript truthiness, which means these are all falsy and will not render the block:

- \`false\`
- \`0\`
- \`""\` (empty string)
- \`null\`
- \`undefined\`
- \`NaN\`

This is important when checking for data that might be \`0\` or an empty string. If you have \`{#if count}\` and count is \`0\`, the block will not render — even though \`0\` is a valid count. Use explicit comparisons like \`{#if count !== undefined}\` when zero values should be truthy.

**Task:** Add an \`{:else}\` block that shows a "Please log in" message when the user is not logged in.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		},
		{
			type: 'xray-prompt',
			content: 'Toggle X-Ray mode to see how Svelte compiles `{#if}` blocks. Notice that Svelte creates separate fragment functions for each branch and swaps them in and out of the DOM — it does not hide them with CSS, it actually adds and removes them from the document. Look for the branching logic in the compiled JavaScript.'
		},
		{
			type: 'text',
			content: `## Multiple Conditions with \`{:else if}\`

For multiple branches, use \`{:else if}\`. This works exactly like JavaScript's \`else if\` — conditions are evaluated in order, and the first truthy branch is rendered:

\`\`\`svelte
{#if role === 'admin'}
  <p>Admin panel</p>
{:else if role === 'user'}
  <p>User dashboard</p>
{:else}
  <p>Guest view</p>
{/if}
\`\`\`

You can chain as many \`{:else if}\` branches as you need. The \`{:else}\` at the end is optional but recommended — it provides a fallback for unexpected values and makes your intent explicit.

### A Real-World Pattern: Multi-Step Wizard Form

One of the most practical uses of \`{:else if}\` is building multi-step forms or wizard interfaces. Here is the pattern:

\`\`\`svelte
<script lang="ts">
  let step = $state(1);

  // Form data persists across steps because it lives above the {#if}
  let name = $state('');
  let email = $state('');
  let street = $state('');
  let city = $state('');
</script>

{#if step === 1}
  <div class="step">
    <h2>Personal Information</h2>
    <input placeholder="Name" bind:value={name} />
    <input placeholder="Email" bind:value={email} />
    <button onclick={() => step = 2}>Next</button>
  </div>
{:else if step === 2}
  <div class="step">
    <h2>Shipping Address</h2>
    <input placeholder="Street" bind:value={street} />
    <input placeholder="City" bind:value={city} />
    <button onclick={() => step = 1}>Back</button>
    <button onclick={() => step = 3}>Next</button>
  </div>
{:else if step === 3}
  <div class="step">
    <h2>Review & Confirm</h2>
    <p>Name: {name}</p>
    <p>Email: {email}</p>
    <p>Address: {street}, {city}</p>
    <button onclick={() => step = 2}>Back</button>
    <button onclick={() => step = 4}>Place Order</button>
  </div>
{:else}
  <div class="step">
    <h2>Order Confirmed!</h2>
    <p>Thank you for your purchase, {name}.</p>
  </div>
{/if}
\`\`\`

Each step is a separate branch controlled by a single \`$state\` variable. Because Svelte destroys and recreates the DOM for each branch, you get clean transitions between steps. Notice that form data (\`name\`, \`email\`, etc.) is stored in \`$state\` variables above the \`{#if}\` block — the state lives in the script section and persists across branch changes, even though the DOM elements do not.

**Note on accessibility:** When building wizard forms, remember that screen readers need to be informed of step changes. Consider using \`aria-live\` regions or focusing the new step's heading after transitions.

### Nested {#if} Blocks

You can nest \`{#if}\` blocks inside each other for compound conditions:

\`\`\`svelte
{#if loggedIn}
  <h2>Welcome back!</h2>
  {#if hasNotifications}
    <div class="badge">You have {notificationCount} new notifications</div>
  {/if}
  {#if isAdmin}
    <a href="/admin">Admin Panel</a>
  {/if}
{:else}
  <p>Please log in.</p>
{/if}
\`\`\`

While nesting works fine, deeply nested \`{#if}\` blocks (three or more levels) become hard to follow. If you find yourself nesting deeply, consider extracting inner blocks into child components, or combining conditions with logical operators: \`{#if loggedIn && hasNotifications}\`.

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
