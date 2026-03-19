import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-5',
		title: 'Component Patterns',
		phase: 1,
		module: 2,
		lessonIndex: 5
	},
	description: `Now that you can create components and pass props, it's time to think about patterns. Good components are reusable — you write them once and use them with different data throughout your app. A well-designed page is composed of small, focused components.

This lesson shows how to build reusable components and compose them into a complete page layout.`,
	objectives: [
		'Build reusable components that accept different data via props',
		'Compose a page from multiple smaller components',
		'Apply consistent patterns for component design'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import Card from './Card.svelte';

  let projects = $state([
    {
      title: 'Weather App',
      description: 'A real-time weather dashboard with forecasts and maps.',
      tags: ['Svelte', 'API', 'CSS'],
      status: 'complete'
    },
    {
      title: 'Task Manager',
      description: 'Organize your life with projects, tags, and due dates.',
      tags: ['Svelte', 'State', 'Components'],
      status: 'in-progress'
    },
    {
      title: 'Chat App',
      description: 'Real-time messaging with rooms and notifications.',
      tags: ['WebSocket', 'Svelte', 'Node'],
      status: 'planned'
    },
    {
      title: 'Portfolio Site',
      description: 'A personal portfolio to showcase your best work.',
      tags: ['Design', 'Svelte', 'Animation'],
      status: 'complete'
    }
  ]);

  let filter = $state('all');
  const filtered = $derived(
    filter === 'all' ? projects : projects.filter(p => p.status === filter)
  );
</script>

<h1>Project Showcase</h1>

<div class="filters">
  <button class:active={filter === 'all'} onclick={() => filter = 'all'}>All</button>
  <button class:active={filter === 'complete'} onclick={() => filter = 'complete'}>Complete</button>
  <button class:active={filter === 'in-progress'} onclick={() => filter = 'in-progress'}>In Progress</button>
  <button class:active={filter === 'planned'} onclick={() => filter = 'planned'}>Planned</button>
</div>

<div class="grid">
  {#each filtered as project (project.title)}
    <Card
      title={project.title}
      description={project.description}
      tags={project.tags}
      status={project.status}
    />
  {:else}
    <p class="empty">No projects match this filter.</p>
  {/each}
</div>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 16px; }
  .filters { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }
  .empty { color: #999; font-style: italic; grid-column: 1 / -1; text-align: center; }
  button {
    padding: 6px 14px; border: 2px solid #ddd; background: white;
    color: #666; border-radius: 6px; cursor: pointer; font-size: 13px;
  }
  button:hover { border-color: #ff3e00; color: #ff3e00; }
  .active { border-color: #ff3e00; background: #ff3e00; color: white; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'Card.svelte',
			content: `<script>
  let { title, description, tags = [], status = 'planned' } = $props();

  const statusColors = {
    'complete': '#4ec9b0',
    'in-progress': '#569cd6',
    'planned': '#dcdcaa'
  };

  const statusColor = $derived(statusColors[status] || '#999');
</script>

<div class="card">
  <div class="header">
    <h3>{title}</h3>
    <span class="status" style="background: {statusColor}">{status}</span>
  </div>
  <p>{description}</p>
  {#if tags.length > 0}
    <div class="tags">
      {#each tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .card {
    border: 2px solid #eee; border-radius: 8px; padding: 16px;
    background: white; transition: border-color 0.2s, box-shadow 0.2s;
  }
  .card:hover { border-color: #ff3e00; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  h3 { margin: 0; color: #333; font-size: 15px; }
  .status {
    font-size: 10px; padding: 2px 8px; border-radius: 10px;
    color: white; font-weight: 600; text-transform: uppercase; white-space: nowrap;
  }
  p { color: #666; font-size: 13px; margin: 0 0 12px 0; line-height: 1.4; }
  .tags { display: flex; gap: 4px; flex-wrap: wrap; }
  .tag {
    font-size: 11px; padding: 2px 8px; background: #f0f0f0;
    color: #666; border-radius: 4px;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
