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

Sometimes you need to decide which component or element to render at runtime. Svelte provides two special elements for this:

- \`<svelte:component this={...}>\` — dynamically render a component
- \`<svelte:element this={...}>\` — dynamically render an HTML element`
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

This is useful for components that need to render different HTML tags based on a prop — like a \`Heading\` component that accepts a \`level\`.

**Your task:** Create a \`Heading\` component that uses \`<svelte:element>\` to render h1-h6 based on a \`level\` prop.`
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

**Task:** Build a tab switcher that dynamically renders the selected tab's component.`
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
				'The `this` prop accepts a component constructor — pass it from the tabs array.',
				'Add `<svelte:component this={tabs[activeIndex].component} />` after the nav element.'
			],
			conceptsTested: ['svelte5.dynamic.component']
		}
	]
};
