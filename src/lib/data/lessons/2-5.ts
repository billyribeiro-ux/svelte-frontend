import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-5',
		title: 'Component Patterns',
		phase: 1,
		module: 2,
		lessonIndex: 5
	},
	description: `You now know how to create components, pass props, render lists, and use conditionals. It's time to put everything together and think about **patterns**: how do you actually *design* a page made of components? Which pieces should be separate components? How do they talk to each other?

The core principle is **single responsibility**. A good component does one thing well. A \`Card\` displays a card. A \`Badge\` shows a status. A \`FilterBar\` lets the user pick a filter. When each component has a clear job, they're easy to read, easy to reuse, and easy to debug. The opposite — a 500-line component that does everything — is a maintenance nightmare.

The second principle is **data flows down, events flow up**. Parents pass data to children via props. Children notify parents by calling callback functions the parent passed as props (you saw this with the Button in lesson 2-2). Combined with keyed \`{#each}\` and \`{#if}\` you already know, this is essentially everything you need to build interactive UIs.

In this lesson you'll compose a complete **Project Showcase** page from four focused components: a \`FilterBar\`, a \`Card\`, a \`Badge\`, and a \`Stats\` summary. Each is small and reusable. Then you'll see how they snap together in \`App.svelte\` to build something that looks like a real app.`,
	objectives: [
		'Design components with single responsibility',
		'Compose a page from multiple small, focused components',
		'Pass data down with props and events up with callback props',
		'Reuse a sub-component (Badge) inside another component (Card)',
		'Derive values (stats, filtered lists) at the right level of the tree',
		'Recognize common real-world component patterns'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import Card from './Card.svelte';
  import FilterBar from './FilterBar.svelte';
  import Stats from './Stats.svelte';

  // ============================================================
  // App owns the source of truth: the full list of projects
  // and the current filter. Child components receive slices
  // of this state via props and call back via callbacks.
  // ============================================================
  let projects = $state([
    {
      id: 1,
      title: 'Weather App',
      description: 'A real-time weather dashboard with forecasts and maps.',
      tags: ['Svelte', 'API', 'CSS'],
      status: 'complete'
    },
    {
      id: 2,
      title: 'Task Manager',
      description: 'Organize your life with projects, tags, and due dates.',
      tags: ['Svelte', 'State', 'Components'],
      status: 'in-progress'
    },
    {
      id: 3,
      title: 'Chat App',
      description: 'Real-time messaging with rooms and notifications.',
      tags: ['WebSocket', 'Svelte', 'Node'],
      status: 'planned'
    },
    {
      id: 4,
      title: 'Portfolio Site',
      description: 'A personal portfolio to showcase your best work.',
      tags: ['Design', 'Svelte', 'Animation'],
      status: 'complete'
    },
    {
      id: 5,
      title: 'Recipe Finder',
      description: 'Search thousands of recipes by ingredient.',
      tags: ['API', 'Search', 'Svelte'],
      status: 'in-progress'
    },
    {
      id: 6,
      title: 'Fitness Tracker',
      description: 'Log workouts and visualize your progress.',
      tags: ['Charts', 'Health', 'Svelte'],
      status: 'planned'
    }
  ]);

  let filter = $state('all');

  // Derived: the filtered subset we actually show
  const filtered = $derived(
    filter === 'all'
      ? projects
      : projects.filter(p => p.status === filter)
  );

  // Derived: counts per status (used by Stats and FilterBar)
  const counts = $derived({
    all:           projects.length,
    'complete':    projects.filter(p => p.status === 'complete').length,
    'in-progress': projects.filter(p => p.status === 'in-progress').length,
    'planned':     projects.filter(p => p.status === 'planned').length
  });

  // Callback passed down to FilterBar — data up, events up
  function handleFilterChange(next) {
    filter = next;
  }

  // Callback passed down to Card — delete a project
  function handleDelete(id) {
    const i = projects.findIndex(p => p.id === id);
    if (i !== -1) projects.splice(i, 1);
  }
</script>

<h1>Project Showcase</h1>
<p class="subtitle">A page composed from 4 small, focused components.</p>

<!-- Stats summary — receives all counts as one prop -->
<Stats {counts} />

<!-- Filter bar — receives current filter + a callback -->
<FilterBar {filter} {counts} onChange={handleFilterChange} />

<!-- The filtered grid of cards -->
<div class="grid">
  {#each filtered as project (project.id)}
    <Card
      title={project.title}
      description={project.description}
      tags={project.tags}
      status={project.status}
      onDelete={() => handleDelete(project.id)}
    />
  {:else}
    <p class="empty">No projects match this filter.</p>
  {/each}
</div>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 16px; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }
  .empty {
    color: #999; font-style: italic;
    grid-column: 1 / -1; text-align: center;
    padding: 20px;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Card.svelte',
			content: `<script>
  // Card imports ANOTHER component — Badge — to render its status.
  // Components composing other components is the whole point.
  import Badge from './Badge.svelte';

  let {
    title,
    description,
    tags = [],
    status = 'planned',
    onDelete
  } = $props();
</script>

<div class="card">
  <div class="header">
    <h3>{title}</h3>
    <Badge {status} />
  </div>
  <p>{description}</p>
  {#if tags.length > 0}
    <div class="tags">
      {#each tags as tag (tag)}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  {/if}
  {#if onDelete}
    <button class="delete" onclick={onDelete}>Delete</button>
  {/if}
</div>

<style>
  .card {
    border: 2px solid #eee; border-radius: 10px; padding: 16px;
    background: white; transition: border-color 0.2s, box-shadow 0.2s;
    display: flex; flex-direction: column;
  }
  .card:hover { border-color: #ff3e00; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
  .header {
    display: flex; justify-content: space-between;
    align-items: flex-start; gap: 8px; margin-bottom: 8px;
  }
  h3 { margin: 0; color: #333; font-size: 15px; }
  p { color: #666; font-size: 13px; margin: 0 0 12px 0; line-height: 1.4; flex: 1; }
  .tags { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px; }
  .tag {
    font-size: 11px; padding: 2px 8px;
    background: #f0f0f0; color: #666; border-radius: 4px;
  }
  .delete {
    align-self: flex-end;
    background: none; border: 1px solid #f44747;
    color: #f44747; padding: 3px 10px;
    border-radius: 4px; cursor: pointer; font-size: 11px;
  }
  .delete:hover { background: #f44747; color: white; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Badge.svelte',
			content: `<script>
  // A tiny, focused component: it renders a colored status pill.
  // Reused inside Card, but could also be used anywhere else.
  let { status } = $props();

  const colors = {
    'complete':    '#4ec9b0',
    'in-progress': '#569cd6',
    'planned':     '#dcdcaa'
  };

  const color = $derived(colors[status] ?? '#999');
</script>

<span class="badge" style="background: {color};">
  {status}
</span>

<style>
  .badge {
    font-size: 10px;
    padding: 3px 10px;
    border-radius: 12px;
    color: white;
    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;
    letter-spacing: 0.5px;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'FilterBar.svelte',
			content: `<script>
  // FilterBar owns no state of its own — it's fully controlled.
  // The current filter comes in as a prop; changes go OUT via
  // the onChange callback. This "controlled" pattern keeps the
  // source of truth in the parent.
  let { filter, counts, onChange } = $props();

  const options = [
    { value: 'all',         label: 'All' },
    { value: 'complete',    label: 'Complete' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'planned',     label: 'Planned' }
  ];
</script>

<div class="bar">
  {#each options as opt (opt.value)}
    <button
      class:active={filter === opt.value}
      onclick={() => onChange(opt.value)}
    >
      {opt.label}
      <span class="count">{counts[opt.value]}</span>
    </button>
  {/each}
</div>

<style>
  .bar {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin: 12px 0;
  }
  button {
    padding: 6px 12px;
    border: 2px solid #ddd;
    background: white;
    color: #666;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  button:hover { border-color: #ff3e00; color: #ff3e00; }
  .active { border-color: #ff3e00; background: #ff3e00; color: white; }
  .count {
    background: rgba(0,0,0,0.15);
    border-radius: 10px;
    padding: 1px 8px;
    font-size: 11px;
    font-weight: 700;
  }
  .active .count { background: rgba(255,255,255,0.3); }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Stats.svelte',
			content: `<script>
  // A summary strip — shows total, complete, in-progress, planned.
  // It's purely presentational: just displays what's passed in.
  let { counts } = $props();
</script>

<div class="stats">
  <div class="stat total">
    <span class="num">{counts.all}</span>
    <span class="lbl">Total</span>
  </div>
  <div class="stat done">
    <span class="num">{counts['complete']}</span>
    <span class="lbl">Complete</span>
  </div>
  <div class="stat progress">
    <span class="num">{counts['in-progress']}</span>
    <span class="lbl">In Progress</span>
  </div>
  <div class="stat planned">
    <span class="num">{counts['planned']}</span>
    <span class="lbl">Planned</span>
  </div>
</div>

<style>
  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 12px 0;
  }
  .stat {
    padding: 10px;
    border-radius: 8px;
    text-align: center;
    color: white;
  }
  .stat .num { display: block; font-size: 22px; font-weight: 800; }
  .stat .lbl { display: block; font-size: 10px; text-transform: uppercase; opacity: 0.9; }
  .total    { background: #ff3e00; }
  .done     { background: #4ec9b0; }
  .progress { background: #569cd6; }
  .planned  { background: #dcac38; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
