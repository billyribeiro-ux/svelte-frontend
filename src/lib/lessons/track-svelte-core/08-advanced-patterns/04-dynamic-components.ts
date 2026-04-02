import type { Lesson } from '$types/lesson';

export const dynamicComponents: Lesson = {
	id: 'svelte-core.advanced-patterns.dynamic-components',
	slug: 'dynamic-components',
	title: 'Dynamic Components',
	description:
		'Render components and elements dynamically at runtime with <svelte:component> and <svelte:element>.',
	trackId: 'svelte-core',
	moduleId: 'advanced-patterns',
	order: 4,
	estimatedMinutes: 12,
	concepts: ['svelte5.dynamic.component', 'svelte5.dynamic.element'],
	prerequisites: ['svelte5.components.basic', 'svelte5.props.destructuring'],

	content: [
		{
			type: 'text',
			content: `# Dynamic Components

## WHY You Need Runtime Component Selection

In most Svelte code, you import a component and use it directly: \`<Card />\`. The component to render is known at compile time. But many real-world patterns require choosing which component to render **at runtime**:

**Tab interfaces.** Each tab renders a different component. The active tab changes based on user interaction, so you cannot hardcode which component renders.

**Plugin systems.** A CMS or dashboard loads widgets dynamically. The set of available widgets is not known at build time -- they might come from a configuration file, a database, or third-party packages.

**Polymorphic rendering.** A feed of mixed content types (text posts, images, videos, polls) where each type has its own component. The rendering component depends on a type field in the data.

**Form builders.** A schema describes form fields (text input, checkbox, date picker), and the form engine maps each field type to its component.

Without dynamic components, you would resort to chains of \`{#if}\`/\`{:else if}\` blocks:

\`\`\`svelte
{#if type === 'text'}
  <TextPost data={item} />
{:else if type === 'image'}
  <ImagePost data={item} />
{:else if type === 'video'}
  <VideoPost data={item} />
{:else if type === 'poll'}
  <PollPost data={item} />
{/if}
\`\`\`

This is verbose, hard to extend (adding a new type requires modifying the if/else chain), and violates the open/closed principle. Dynamic components replace this with a lookup:

\`\`\`svelte
<svelte:component this={componentMap[type]} data={item} />
\`\`\`

### svelte:component vs. svelte:element

Svelte provides two special elements for dynamic rendering:

- **\`<svelte:component this={Component}>\`** -- renders a Svelte component dynamically. The \`this\` prop accepts a component constructor.
- **\`<svelte:element this={tag}>\`** -- renders a plain HTML element dynamically. The \`this\` prop accepts a tag name string (\`'div'\`, \`'h1'\`, \`'button'\`, etc.).

These solve different problems:
- \`svelte:component\` for when the **behavior and template** change (different components)
- \`svelte:element\` for when the **HTML tag** changes but the content and behavior stay the same

### How Dynamic Components Work Under the Hood

When the \`this\` prop of \`<svelte:component>\` changes, Svelte:

1. **Destroys** the current component instance (runs cleanup, removes DOM)
2. **Creates** a new instance of the new component
3. **Mounts** the new component in the same DOM position

This is a full component swap, not a reconciliation. The new component starts fresh -- no state is preserved from the old one. If you need to preserve state across component swaps, you must lift it into a shared location (parent component, reactive class, or context).

### The null Case

If \`this\` is \`null\` or \`undefined\`, nothing renders. This is useful for conditional rendering:

\`\`\`svelte
<svelte:component this={maybeComponent} />
<!-- Renders nothing when maybeComponent is null -->
\`\`\`

This replaces the common \`{#if component}<svelte:component this={component} />{/if}\` pattern.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.dynamic.component'
		},
		{
			type: 'text',
			content: `## Dynamic Elements with svelte:element

\`\`\`svelte
<script lang="ts">
  let tag = $state('h1');
</script>

<svelte:element this={tag}>
  I'm rendered as a {tag} element
</svelte:element>
\`\`\`

### WHY Dynamic Elements Matter

The most common use case is a **polymorphic Heading component**. In a design system, you want a single component that renders the correct heading level:

\`\`\`svelte
<!-- Without svelte:element: -->
{#if level === 1}
  <h1>{@render children()}</h1>
{:else if level === 2}
  <h2>{@render children()}</h2>
{:else if level === 3}
  <h3>{@render children()}</h3>
{:else if level === 4}
  <h4>{@render children()}</h4>
{:else if level === 5}
  <h5>{@render children()}</h5>
{:else}
  <h6>{@render children()}</h6>
{/if}

<!-- With svelte:element: -->
<svelte:element this={'h' + level}>
  {@render children()}
</svelte:element>
\`\`\`

Six conditional branches collapse to one line. The tag string is computed from the \`level\` prop, and \`svelte:element\` renders it as the corresponding HTML element.

### Other Use Cases for Dynamic Elements

- **Polymorphic buttons:** Render as \`<button>\` or \`<a>\` based on whether an \`href\` prop is provided
- **Semantic list components:** Render as \`<ul>\`, \`<ol>\`, or \`<menu>\` based on a \`type\` prop
- **Layout components:** Render as \`<div>\`, \`<section>\`, \`<article>\`, or \`<main>\` based on semantic role

### Safety: Invalid Tag Names

If you pass an invalid tag name to \`svelte:element\`, the browser will create an unknown HTML element (like \`<foo>\`), which is valid but meaningless. Guard against this:

\`\`\`typescript
let tag = $derived('h' + Math.min(Math.max(level, 1), 6));
\`\`\`

This clamps \`level\` to 1-6, ensuring only valid heading tags are generated.

**Your task:** Create a \`Heading\` component that uses \`<svelte:element>\` to render h1-h6 based on a \`level\` prop. Use \`$derived\` to compute the tag name.`
		},
		{
			type: 'checkpoint',
			content: 'cp-1'
		},
		{
			type: 'text',
			content: `## Dynamic Components with svelte:component

\`\`\`svelte
<script lang="ts">
  import TabA from './TabA.svelte';
  import TabB from './TabB.svelte';
  import TabC from './TabC.svelte';

  const tabs = [
    { label: 'Tab A', component: TabA },
    { label: 'Tab B', component: TabB },
    { label: 'Tab C', component: TabC }
  ];

  let activeTab = $state(tabs[0]);
</script>

<svelte:component this={activeTab.component} />
\`\`\`

### Building a Tab System: The Decision Framework

When building a tab interface, you face a design choice about how to map tab selection to components:

**Approach 1: Component map (static tabs)**
\`\`\`typescript
const tabs = [
  { label: 'Profile', component: ProfileTab },
  { label: 'Settings', component: SettingsTab },
];
\`\`\`
Best when the set of tabs is fixed and known at compile time. Each component is imported directly.

**Approach 2: Dynamic import map (lazy loading)**
\`\`\`typescript
const tabs = [
  { label: 'Profile', load: () => import('./ProfileTab.svelte') },
  { label: 'Settings', load: () => import('./SettingsTab.svelte') },
];
\`\`\`
Best when tabs contain heavy components that should not be loaded until the user navigates to them. Combined with \`{#await}\`, this enables code-splitting.

**Approach 3: Plugin registry (dynamic)**
\`\`\`typescript
const registry = new Map<string, Component>();
registry.set('profile', ProfileTab);
// Plugins can register their own tabs
export function registerTab(id: string, component: Component) {
  registry.set(id, component);
}
\`\`\`
Best for extensible systems where third parties add tabs.

### Passing Props to Dynamic Components

Dynamic components accept props just like static ones:

\`\`\`svelte
<svelte:component this={activeComponent} {data} {onSave} />
\`\`\`

All props are forwarded to whichever component is currently rendered. If different components expect different props, you can spread a props object:

\`\`\`svelte
<svelte:component this={tab.component} {...tab.props} />
\`\`\`

### State Preservation Caveat

When the \`this\` prop changes, the old component is **destroyed and the new one is created from scratch**. No state carries over. If TabA has a form the user is filling out, switching to TabB and back will reset the form.

To preserve state across tab switches:
1. **Lift state** to the parent component or a reactive class
2. **Use CSS visibility** instead of conditional rendering (show/hide with \`display: none\`)
3. **Cache state** in an external store keyed by tab ID

### svelte:component with Snippets

Dynamic components work with snippets just like static ones:

\`\`\`svelte
<svelte:component this={activeComponent}>
  {#snippet header()}
    <h2>Custom Header</h2>
  {/snippet}
</svelte:component>
\`\`\`

**Task:** Build a tab switcher that dynamically renders the selected tab's component. Use \`<svelte:component>\` with a tabs array. Verify that switching tabs updates the rendered component.`
		},
		{
			type: 'checkpoint',
			content: 'cp-2'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Heading from './Heading.svelte';
  import TabA from './TabA.svelte';
  import TabB from './TabB.svelte';
  import TabC from './TabC.svelte';

  let headingLevel = $state(1);

  const tabs = [
    { label: 'Profile', component: TabA },
    { label: 'Settings', component: TabB },
    { label: 'Notifications', component: TabC }
  ];

  let activeIndex = $state(0);
</script>

<div>
  <section>
    <h2>Dynamic Element</h2>
    <label>
      Heading level:
      <select bind:value={headingLevel}>
        {#each [1, 2, 3, 4, 5, 6] as level}
          <option value={level}>h{level}</option>
        {/each}
      </select>
    </label>
    <!-- TODO: Use Heading component -->
    <Heading level={headingLevel}>Dynamic Heading</Heading>
  </section>

  <section>
    <h2>Dynamic Component</h2>
    <nav>
      {#each tabs as tab, i}
        <button
          class:active={i === activeIndex}
          onclick={() => activeIndex = i}
        >
          {tab.label}
        </button>
      {/each}
    </nav>
    <!-- TODO: Render active tab with svelte:component -->
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 2rem;
  }

  select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
  }

  nav {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }

  nav button {
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
  }

  nav button.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
  }
</style>`
		},
		{
			name: 'Heading.svelte',
			path: '/Heading.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  // TODO: Accept level and children props
  // TODO: Use svelte:element to render the right heading tag
  let { level = 1, children }: { level?: number; children: Snippet } = $props();
</script>

<!-- TODO: Replace with svelte:element -->
<h1>{@render children()}</h1>`
		},
		{
			name: 'TabA.svelte',
			path: '/TabA.svelte',
			language: 'svelte',
			content: `<div class="tab-content">
  <h3>Profile</h3>
  <p>View and edit your profile information.</p>
</div>

<style>
  .tab-content { padding: 1rem; background: #f8fafc; border-radius: 0 8px 8px 8px; }
</style>`
		},
		{
			name: 'TabB.svelte',
			path: '/TabB.svelte',
			language: 'svelte',
			content: `<div class="tab-content">
  <h3>Settings</h3>
  <p>Configure your application preferences.</p>
</div>

<style>
  .tab-content { padding: 1rem; background: #f8fafc; border-radius: 0 8px 8px 8px; }
</style>`
		},
		{
			name: 'TabC.svelte',
			path: '/TabC.svelte',
			language: 'svelte',
			content: `<div class="tab-content">
  <h3>Notifications</h3>
  <p>Manage your notification settings.</p>
</div>

<style>
  .tab-content { padding: 1rem; background: #f8fafc; border-radius: 0 8px 8px 8px; }
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Heading from './Heading.svelte';
  import TabA from './TabA.svelte';
  import TabB from './TabB.svelte';
  import TabC from './TabC.svelte';

  let headingLevel = $state(1);

  const tabs = [
    { label: 'Profile', component: TabA },
    { label: 'Settings', component: TabB },
    { label: 'Notifications', component: TabC }
  ];

  let activeIndex = $state(0);
</script>

<div>
  <section>
    <h2>Dynamic Element</h2>
    <label>
      Heading level:
      <select bind:value={headingLevel}>
        {#each [1, 2, 3, 4, 5, 6] as level}
          <option value={level}>h{level}</option>
        {/each}
      </select>
    </label>
    <Heading level={headingLevel}>Dynamic Heading</Heading>
  </section>

  <section>
    <h2>Dynamic Component</h2>
    <nav>
      {#each tabs as tab, i}
        <button
          class:active={i === activeIndex}
          onclick={() => activeIndex = i}
        >
          {tab.label}
        </button>
      {/each}
    </nav>
    <svelte:component this={tabs[activeIndex].component} />
  </section>
</div>

<style>
  div {
    font-family: system-ui, sans-serif;
    padding: 1rem;
  }

  section {
    margin-bottom: 2rem;
  }

  select {
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
  }

  nav {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }

  nav button {
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
  }

  nav button.active {
    background: #6366f1;
    color: white;
    border-color: #6366f1;
  }
</style>`
		},
		{
			name: 'Heading.svelte',
			path: '/Heading.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { level = 1, children }: { level?: number; children: Snippet } = $props();
  let tag = $derived('h' + Math.min(Math.max(level, 1), 6));
</script>

<svelte:element this={tag}>
  {@render children()}
</svelte:element>`
		},
		{
			name: 'TabA.svelte',
			path: '/TabA.svelte',
			language: 'svelte',
			content: `<div class="tab-content">
  <h3>Profile</h3>
  <p>View and edit your profile information.</p>
</div>

<style>
  .tab-content { padding: 1rem; background: #f8fafc; border-radius: 0 8px 8px 8px; }
</style>`
		},
		{
			name: 'TabB.svelte',
			path: '/TabB.svelte',
			language: 'svelte',
			content: `<div class="tab-content">
  <h3>Settings</h3>
  <p>Configure your application preferences.</p>
</div>

<style>
  .tab-content { padding: 1rem; background: #f8fafc; border-radius: 0 8px 8px 8px; }
</style>`
		},
		{
			name: 'TabC.svelte',
			path: '/TabC.svelte',
			language: 'svelte',
			content: `<div class="tab-content">
  <h3>Notifications</h3>
  <p>Manage your notification settings.</p>
</div>

<style>
  .tab-content { padding: 1rem; background: #f8fafc; border-radius: 0 8px 8px 8px; }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-1',
			description: 'Use svelte:element to render dynamic heading tags',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<svelte:element' },
						{ type: 'contains', value: 'this={tag}' }
					]
				}
			},
			hints: [
				'Derive the tag name: `let tag = $derived(\'h\' + level);`',
				'Use `<svelte:element this={tag}>` to render the dynamic element.',
				'In Heading.svelte: `let tag = $derived(\'h\' + Math.min(Math.max(level, 1), 6));` then `<svelte:element this={tag}>{@render children()}</svelte:element>`'
			],
			conceptsTested: ['svelte5.dynamic.element']
		},
		{
			id: 'cp-2',
			description: 'Use svelte:component to render the active tab dynamically',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '<svelte:component' },
						{ type: 'contains', value: 'this={' }
					]
				}
			},
			hints: [
				'Use `<svelte:component this={tabs[activeIndex].component} />`.',
				'The `this` prop accepts a component constructor -- pass it from the tabs array.',
				'Add `<svelte:component this={tabs[activeIndex].component} />` after the nav element.'
			],
			conceptsTested: ['svelte5.dynamic.component']
		}
	]
};
