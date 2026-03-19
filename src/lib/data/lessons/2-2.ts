import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '2-2',
		title: 'Passing Data: $props()',
		phase: 1,
		module: 2,
		lessonIndex: 2
	},
	description: `Components become truly powerful when you can pass data into them. In Svelte 5, components receive data through the $props() rune. The parent passes attributes, and the child destructures them from $props() — with optional default values.

This lesson shows you how to pass strings, numbers, booleans, and objects as props, and how to set sensible defaults.`,
	objectives: [
		'Pass data to child components using props',
		'Receive and destructure props with $props() in Svelte 5',
		'Set default values for optional props'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script>
  import ProfileCard from './ProfileCard.svelte';

  let users = $state([
    { name: 'Alice', role: 'Developer', level: 5, active: true },
    { name: 'Bob', role: 'Designer', level: 3, active: true },
    { name: 'Charlie', role: 'Manager', level: 7, active: false }
  ]);
</script>

<h1>Passing Data with $props()</h1>

<div class="grid">
  {#each users as user}
    <ProfileCard
      name={user.name}
      role={user.role}
      level={user.level}
      active={user.active}
    />
  {/each}
</div>

<h2>With Defaults</h2>
<div class="grid">
  <ProfileCard name="Dana" />
  <ProfileCard name="Eve" role="Intern" />
</div>

<style>
  h1 { color: #ff3e00; font-family: sans-serif; margin-bottom: 8px; }
  h2 { color: #333; font-size: 16px; margin-top: 24px; margin-bottom: 12px; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
  }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'ProfileCard.svelte',
			content: `<script>
  // $props() with destructuring and defaults
  let { name, role = 'Member', level = 1, active = true } = $props();

  const levelStars = $derived('*'.repeat(level));
</script>

<div class="card" class:inactive={!active}>
  <h3>{name}</h3>
  <p class="role">{role}</p>
  <p class="level">Level: {levelStars} ({level})</p>
  {#if active}
    <span class="badge active">Active</span>
  {:else}
    <span class="badge away">Away</span>
  {/if}
</div>

<style>
  .card {
    border: 2px solid #eee;
    border-radius: 8px;
    padding: 16px;
    background: white;
  }
  .inactive {
    opacity: 0.6;
    border-color: #ddd;
  }
  h3 { margin: 0 0 4px 0; color: #333; font-size: 16px; }
  .role { color: #666; font-size: 13px; margin: 0 0 4px 0; }
  .level { color: #ff3e00; font-size: 13px; margin: 0 0 8px 0; font-family: monospace; }
  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
  }
  .badge.active { background: #e6f7f3; color: #4ec9b0; }
  .badge.away { background: #fdecea; color: #f44747; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
