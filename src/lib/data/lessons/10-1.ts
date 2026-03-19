import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '10-1',
		title: 'Snippets: Reusable Markup',
		phase: 3,
		module: 10,
		lessonIndex: 1
	},
	description: `Snippets are Svelte 5's replacement for slots. A snippet is a reusable block of markup defined with {#snippet name()} and rendered with {@render name()}. Unlike slots, snippets are first-class values — you can pass parameters, define them anywhere in the template, and they follow normal scoping rules.

This lesson covers defining snippets, passing parameters to them, and understanding how they access the surrounding scope.`,
	objectives: [
		'Define reusable markup blocks with {#snippet} syntax',
		'Render snippets using {@render} in the template',
		'Pass parameters to snippets for dynamic content',
		'Understand snippet scope rules and variable access'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  interface User {
    name: string;
    role: string;
    active: boolean;
  }

  let users: User[] = $state([
    { name: 'Alice', role: 'Admin', active: true },
    { name: 'Bob', role: 'Editor', active: false },
    { name: 'Carol', role: 'Viewer', active: true }
  ]);

  let showDetailed: boolean = $state(false);
</script>

<!-- Define a snippet with parameters -->
{#snippet userCard(user: User)}
  <div class="card" class:active={user.active}>
    <strong>{user.name}</strong>
    <span class="role">{user.role}</span>
    {#if user.active}
      <span class="badge">Active</span>
    {/if}
  </div>
{/snippet}

<!-- Snippet without parameters -->
{#snippet header()}
  <div class="header">
    <h1>Team Members</h1>
    <p>{users.length} members total</p>
  </div>
{/snippet}

<!-- Snippet with detailed view -->
{#snippet userRow(user: User, index: number)}
  <tr>
    <td>{index + 1}</td>
    <td>{user.name}</td>
    <td>{user.role}</td>
    <td>{user.active ? 'Yes' : 'No'}</td>
  </tr>
{/snippet}

<main>
  <!-- Render the header snippet -->
  {@render header()}

  <button onclick={() => showDetailed = !showDetailed}>
    {showDetailed ? 'Show Cards' : 'Show Table'}
  </button>

  {#if showDetailed}
    <!-- Render as table rows -->
    <table>
      <thead>
        <tr><th>#</th><th>Name</th><th>Role</th><th>Active</th></tr>
      </thead>
      <tbody>
        {#each users as user, i}
          {@render userRow(user, i)}
        {/each}
      </tbody>
    </table>
  {:else}
    <!-- Render as cards -->
    <div class="cards">
      {#each users as user}
        {@render userCard(user)}
      {/each}
    </div>
  {/if}
</main>

<style>
  main { max-width: 550px; margin: 0 auto; font-family: sans-serif; }
  .header { margin-bottom: 1rem; }
  .cards { display: flex; flex-direction: column; gap: 0.5rem; }
  .card {
    display: flex; align-items: center; gap: 0.75rem;
    padding: 0.75rem 1rem; border: 1px solid #ddd; border-radius: 8px;
  }
  .card.active { border-color: #4caf50; background: #f1f8f1; }
  .role { color: #666; }
  .badge { background: #4caf50; color: white; padding: 0.15rem 0.5rem; border-radius: 12px; font-size: 0.8rem; }
  table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
  th { background: #f5f5f5; }
  button { padding: 0.5rem 1rem; cursor: pointer; margin-bottom: 1rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
