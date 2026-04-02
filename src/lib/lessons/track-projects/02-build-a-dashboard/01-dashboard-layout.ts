import type { Lesson } from '$types/lesson';

export const dashboardLayout: Lesson = {
	id: 'projects.build-a-dashboard.dashboard-layout',
	slug: 'dashboard-layout',
	title: 'Dashboard Layout',
	description:
		'Build a responsive dashboard layout with a collapsible sidebar, header toolbar, and a dynamic content grid using Svelte 5 runes.',
	trackId: 'projects',
	moduleId: 'build-a-dashboard',
	order: 1,
	estimatedMinutes: 30,
	concepts: ['svelte5.components.layout', 'svelte5.runes.state', 'svelte5.css.responsive'],
	prerequisites: ['svelte5.components.basic', 'svelte5.runes.state'],

	content: [
		{
			type: 'text',
			content: `# Building a Dashboard Layout

Dashboards are among the most complex layouts you will encounter in front-end development. They combine a persistent sidebar for navigation, a top toolbar for actions and user info, a main content area that hosts widgets in a grid, and responsive behavior that collapses the sidebar on smaller screens. Getting this right sets the stage for every feature that follows.

In this lesson you will build a complete dashboard shell using Svelte 5. You will use \`$state\` to track sidebar visibility, \`$props()\` to compose layout slots, and CSS Grid to create a flexible widget grid. By the end, you will have a reusable layout system that can host charts, tables, and data cards.

## The Anatomy of a Dashboard

A typical dashboard has four distinct regions:

1. **Sidebar** — Fixed to the left, contains navigation links. Collapsible on mobile or by user preference.
2. **Header** — Spans the top, contains the page title, search bar, notifications, and user avatar.
3. **Main Content** — The largest area, holds a grid of widgets (cards, charts, tables).
4. **Footer** (optional) — Status bar or quick stats.

We model this with CSS Grid at the top level:

\`\`\`css
.dashboard {
  display: grid;
  grid-template-columns: var(--sidebar-width, 250px) 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "sidebar header"
    "sidebar main"
    "sidebar footer";
  min-height: 100vh;
}
\`\`\`

When the sidebar is collapsed, we change \`--sidebar-width\` to \`60px\` and hide the labels, showing only icons. This is driven by a \`$state\` boolean:

\`\`\`ts
let sidebarCollapsed = $state(false);
\`\`\`

Toggle it with a button in the header, and bind the CSS custom property to the state:

\`\`\`svelte
<div class="dashboard" style:--sidebar-width={sidebarCollapsed ? '60px' : '250px'}>
\`\`\`

Svelte's \`style:\` directive is perfect for this — it sets the CSS custom property reactively. No class toggling, no imperative DOM manipulation.

## The Sidebar Component

The sidebar needs to render a list of navigation items, each with an icon and a label. When collapsed, only the icon shows. We accept navigation items via \`$props()\`:

\`\`\`svelte
<script lang="ts">
  interface NavItem {
    icon: string;
    label: string;
    href: string;
    active?: boolean;
  }

  let { items, collapsed }: { items: NavItem[]; collapsed: boolean } = $props();
</script>

<aside class="sidebar" class:collapsed>
  <nav>
    {#each items as item}
      <a href={item.href} class:active={item.active}>
        <span class="icon">{item.icon}</span>
        {#if !collapsed}
          <span class="label">{item.label}</span>
        {/if}
      </a>
    {/each}
  </nav>
</aside>
\`\`\`

The \`class:collapsed\` directive conditionally applies a CSS class, and the \`{#if !collapsed}\` block hides labels when the sidebar is narrow. This is idiomatic Svelte — declarative, readable, and efficient.

## The Header Component

The header displays the current page title (which could change as the user navigates), a toggle button for the sidebar, and user information. It accepts these as props:

\`\`\`ts
let { pageTitle, onToggleSidebar, userName }: {
  pageTitle: string;
  onToggleSidebar: () => void;
  userName: string;
} = $props();
\`\`\`

Notice that we pass the toggle callback as a prop rather than importing global state. This keeps the header component reusable — it does not know about the sidebar state, only that it has a button that calls a function.

## The Widget Grid

The main content area hosts widgets in a responsive grid. Each widget is a card with a title and content area. We use CSS Grid with \`auto-fill\` for fluid responsiveness:

\`\`\`css
.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}
\`\`\`

Some widgets span two columns (like a chart). We handle this with a \`span\` prop:

\`\`\`svelte
<div class="widget" style:grid-column={span > 1 ? \`span \${span}\` : 'auto'}>
\`\`\`

This gives you a flexible grid where most widgets take one column but specific ones (charts, tables) can stretch wider.`
		},
		{
			type: 'concept-callout',
			content: 'svelte5.components.layout'
		},
		{
			type: 'text',
			content: `## Your Task: Build the Dashboard Shell

Open the starter code. You will find skeleton files for \`Dashboard.svelte\`, \`Sidebar.svelte\`, \`Header.svelte\`, and \`WidgetCard.svelte\`.

1. Implement the CSS Grid layout in \`Dashboard.svelte\` with sidebar, header, and main areas.
2. Add a \`$state\` boolean for sidebar collapsed state and a toggle button in the header.
3. Complete \`Sidebar.svelte\` to render nav items and respond to the collapsed state.
4. Build \`WidgetCard.svelte\` as a reusable card container with title prop and children snippet.`
		},
		{
			type: 'checkpoint',
			content: 'cp-dash-grid'
		},
		{
			type: 'text',
			content: `## Responsive Behavior

On screens narrower than 768px, the sidebar should overlay the content rather than pushing it aside. Use a CSS media query to switch the grid to a single column, and position the sidebar absolutely. The toggle button becomes essential on mobile — it shows and hides the sidebar as an overlay.

\`\`\`css
@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main"
      "footer";
  }

  .sidebar {
    position: fixed;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }
}
\`\`\`

Combining CSS transitions with \`$state\`-driven class toggling gives you smooth, performant sidebar animation without a JavaScript animation library.

## Populating the Grid

Add four placeholder widgets to the dashboard: a "Revenue" card, a "Users" card, a "Orders" card, and a wide "Recent Activity" card. Each uses \`WidgetCard\` with static content for now — in subsequent lessons you will replace these with live charts, data tables, and real-time feeds.

\`\`\`svelte
<div class="widget-grid">
  <WidgetCard title="Revenue">
    <p class="stat">$12,450</p>
  </WidgetCard>
  <WidgetCard title="Users">
    <p class="stat">1,234</p>
  </WidgetCard>
  <WidgetCard title="Orders">
    <p class="stat">342</p>
  </WidgetCard>
  <WidgetCard title="Recent Activity" span={2}>
    <p>Activity feed will go here...</p>
  </WidgetCard>
</div>
\`\`\`

This layout lesson is the foundation for the entire dashboard module. Every subsequent lesson adds functionality *inside* this shell — charts in the widget cards, data in the tables, live updates in the activity feed.`
		},
		{
			type: 'checkpoint',
			content: 'cp-dash-sidebar'
		},
		{
			type: 'checkpoint',
			content: 'cp-dash-widgets'
		}
	],

	starterFiles: [
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Dashboard from './Dashboard.svelte';
</script>

<Dashboard />

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>`
		},
		{
			name: 'Dashboard.svelte',
			path: '/Dashboard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';
  import WidgetCard from './WidgetCard.svelte';

  // TODO: Add $state for sidebarCollapsed
  // TODO: Define navItems array

  const navItems = [
    { icon: '📊', label: 'Dashboard', href: '/', active: true },
    { icon: '📈', label: 'Analytics', href: '/analytics' },
    { icon: '👥', label: 'Users', href: '/users' },
    { icon: '⚙️', label: 'Settings', href: '/settings' },
  ];
</script>

<!-- TODO: Build grid layout with sidebar, header, main area -->
<!-- TODO: Add widget grid in main area -->

<style>
  /* TODO: Add CSS Grid layout styles */
</style>`
		},
		{
			name: 'Sidebar.svelte',
			path: '/Sidebar.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Define NavItem interface
  // TODO: Accept items and collapsed props via $props()
</script>

<!-- TODO: Render sidebar nav items -->

<style>
  /* Add sidebar styles */
</style>`
		},
		{
			name: 'Header.svelte',
			path: '/Header.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  // TODO: Accept pageTitle, onToggleSidebar, userName props
</script>

<!-- TODO: Render header with title, toggle button, user info -->

<style>
  /* Add header styles */
</style>`
		},
		{
			name: 'WidgetCard.svelte',
			path: '/WidgetCard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  // TODO: Accept title, span, and children props
</script>

<!-- TODO: Render card with title and children -->

<style>
  /* Add card styles */
</style>`
		}
	],

	solutionFiles: [
		{
			name: 'Dashboard.svelte',
			path: '/Dashboard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';
  import WidgetCard from './WidgetCard.svelte';

  let sidebarCollapsed = $state(false);

  const navItems = [
    { icon: '📊', label: 'Dashboard', href: '/', active: true },
    { icon: '📈', label: 'Analytics', href: '/analytics' },
    { icon: '👥', label: 'Users', href: '/users' },
    { icon: '⚙️', label: 'Settings', href: '/settings' },
  ];

  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
  }
</script>

<div class="dashboard" style:--sidebar-width={sidebarCollapsed ? '60px' : '250px'}>
  <Sidebar items={navItems} collapsed={sidebarCollapsed} />

  <Header
    pageTitle="Dashboard"
    onToggleSidebar={toggleSidebar}
    userName="Admin User"
  />

  <main class="main">
    <div class="widget-grid">
      <WidgetCard title="Revenue">
        <p class="stat">$12,450</p>
        <p class="trend positive">+12% from last month</p>
      </WidgetCard>
      <WidgetCard title="Users">
        <p class="stat">1,234</p>
        <p class="trend positive">+5% from last month</p>
      </WidgetCard>
      <WidgetCard title="Orders">
        <p class="stat">342</p>
        <p class="trend negative">-3% from last month</p>
      </WidgetCard>
      <WidgetCard title="Recent Activity" span={2}>
        <p>Activity feed will be added in a later lesson...</p>
      </WidgetCard>
    </div>
  </main>
</div>

<style>
  .dashboard {
    display: grid;
    grid-template-columns: var(--sidebar-width, 250px) 1fr;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      "sidebar header"
      "sidebar main";
    min-height: 100vh;
    background: #f8fafc;
  }

  .main {
    grid-area: main;
    padding: 1.5rem;
    overflow-y: auto;
  }

  .widget-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }

  .stat {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    color: #1e293b;
  }

  .trend {
    font-size: 0.85rem;
    margin: 0.25rem 0 0;
  }

  .trend.positive { color: #16a34a; }
  .trend.negative { color: #dc2626; }

  @media (max-width: 768px) {
    .dashboard {
      grid-template-columns: 1fr;
      grid-template-areas:
        "header"
        "main";
    }
  }
</style>`
		},
		{
			name: 'Sidebar.svelte',
			path: '/Sidebar.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  interface NavItem {
    icon: string;
    label: string;
    href: string;
    active?: boolean;
  }

  let { items, collapsed }: { items: NavItem[]; collapsed: boolean } = $props();
</script>

<aside class="sidebar" class:collapsed>
  <div class="logo">
    {#if collapsed}
      <span>D</span>
    {:else}
      <span>Dashboard</span>
    {/if}
  </div>
  <nav>
    {#each items as item}
      <a href={item.href} class:active={item.active}>
        <span class="icon">{item.icon}</span>
        {#if !collapsed}
          <span class="label">{item.label}</span>
        {/if}
      </a>
    {/each}
  </nav>
</aside>

<style>
  .sidebar {
    grid-area: sidebar;
    background: #1e293b;
    color: white;
    padding: 1rem 0;
    transition: width 0.2s ease;
  }

  .logo {
    padding: 0 1rem 1rem;
    font-size: 1.25rem;
    font-weight: 700;
    border-bottom: 1px solid #334155;
    margin-bottom: 0.5rem;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.5rem;
  }

  a {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    color: #94a3b8;
    text-decoration: none;
    border-radius: 6px;
    font-size: 0.9rem;
  }

  a:hover { background: #334155; color: white; }
  a.active { background: #6366f1; color: white; }

  .collapsed a {
    justify-content: center;
  }

  .icon { font-size: 1.1rem; }
</style>`
		},
		{
			name: 'Header.svelte',
			path: '/Header.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  let { pageTitle, onToggleSidebar, userName }: {
    pageTitle: string;
    onToggleSidebar: () => void;
    userName: string;
  } = $props();
</script>

<header class="header">
  <div class="left">
    <button class="toggle" onclick={onToggleSidebar}>☰</button>
    <h1>{pageTitle}</h1>
  </div>
  <div class="right">
    <span class="user">{userName}</span>
  </div>
</header>

<style>
  .header {
    grid-area: header;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: white;
    border-bottom: 1px solid #e2e8f0;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  h1 {
    font-size: 1.25rem;
    margin: 0;
    color: #1e293b;
  }

  .toggle {
    background: none;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    cursor: pointer;
    font-size: 1.1rem;
  }

  .user {
    color: #64748b;
    font-size: 0.9rem;
  }
</style>`
		},
		{
			name: 'WidgetCard.svelte',
			path: '/WidgetCard.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, span = 1, children }: {
    title: string;
    span?: number;
    children: Snippet;
  } = $props();
</script>

<div class="card" style:grid-column={span > 1 ? \`span \${span}\` : 'auto'}>
  <h3>{title}</h3>
  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  .card {
    background: white;
    border-radius: 8px;
    padding: 1.25rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    border: 1px solid #e2e8f0;
  }

  h3 {
    margin: 0 0 0.75rem;
    font-size: 0.9rem;
    color: #64748b;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }
</style>`
		},
		{
			name: 'App.svelte',
			path: '/App.svelte',
			language: 'svelte',
			content: `<script lang="ts">
  import Dashboard from './Dashboard.svelte';
</script>

<Dashboard />

<style>
  :global(body) {
    margin: 0;
    font-family: system-ui, -apple-system, sans-serif;
  }
</style>`
		}
	],

	checkpoints: [
		{
			id: 'cp-dash-grid',
			description: 'Implement CSS Grid layout with sidebar and header areas',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: 'display: grid' },
						{ type: 'contains', value: 'grid-template-areas' },
						{ type: 'contains', value: '--sidebar-width' }
					]
				}
			},
			hints: [
				'Use CSS Grid with `grid-template-areas` to define sidebar, header, and main regions.',
				'Create a CSS custom property `--sidebar-width` and bind it to the collapsed state using `style:--sidebar-width`.',
				'Set `grid-template-columns: var(--sidebar-width, 250px) 1fr` and `grid-template-areas: "sidebar header" "sidebar main"` on the dashboard container, then use `style:--sidebar-width={sidebarCollapsed ? \'60px\' : \'250px\'}`.'
			],
			conceptsTested: ['svelte5.css.responsive']
		},
		{
			id: 'cp-dash-sidebar',
			description: 'Build collapsible Sidebar with nav items that respond to collapsed state',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '$props()' },
						{ type: 'contains', value: 'collapsed' },
						{ type: 'contains', value: '#each items' }
					]
				}
			},
			hints: [
				'Accept `items` and `collapsed` via `$props()` in Sidebar.svelte.',
				'Iterate with `{#each items as item}` and conditionally show labels with `{#if !collapsed}`.',
				'Use `let { items, collapsed }: { items: NavItem[]; collapsed: boolean } = $props();` then `{#each items as item}<a href={item.href}><span>{item.icon}</span>{#if !collapsed}<span>{item.label}</span>{/if}</a>{/each}`.'
			],
			conceptsTested: ['svelte5.runes.state', 'svelte5.components.layout']
		},
		{
			id: 'cp-dash-widgets',
			description: 'Create WidgetCard component with title, span, and children snippet',
			validation: {
				type: 'code-pattern',
				config: {
					patterns: [
						{ type: 'contains', value: '@render children()' },
						{ type: 'contains', value: 'title' },
						{ type: 'contains', value: 'grid-column' }
					]
				}
			},
			hints: [
				'Accept `title`, `span`, and `children` via `$props()`. Use `Snippet` type for children.',
				'Render `{@render children()}` inside the card and use `style:grid-column` for multi-column spanning.',
				'Use `let { title, span = 1, children }: { title: string; span?: number; children: Snippet } = $props();` then `<div style:grid-column={span > 1 ? \\`span ${span}\\` : \'auto\'}><h3>{title}</h3>{@render children()}</div>`.'
			],
			conceptsTested: ['svelte5.components.layout']
		}
	]
};
