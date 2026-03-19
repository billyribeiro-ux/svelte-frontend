import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-3',
		title: 'Async Svelte: Rendering & Pending',
		phase: 5,
		module: 15,
		lessonIndex: 3
	},
	description: `Svelte 5 introduces first-class async support, allowing components to use top-level await directly in their script blocks. When a component awaits data, Svelte can show loading indicators using the $effect.pending() rune, which returns true while any child async operations are still resolving.

This pattern eliminates the need for manual loading state management. Instead of tracking isLoading flags yourself, you declare what data your component needs with await, and Svelte handles the pending state automatically. Parent components can check $effect.pending() to show loading UI while children resolve.`,
	objectives: [
		'Use top-level await in Svelte component scripts for data fetching',
		'Display loading indicators with $effect.pending()',
		'Understand how async rendering integrates with Svelte boundaries',
		'Structure async data dependencies in component hierarchies'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let selectedUser: number = $state(1);
  let showDetails: boolean = $state(false);
  let pending: boolean = $state(false);

  // Simulate async data fetching
  async function fetchUser(id: number): Promise<{ name: string; email: string; role: string }> {
    await new Promise((r) => setTimeout(r, 1500));
    const users: Record<number, { name: string; email: string; role: string }> = {
      1: { name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin' },
      2: { name: 'Bob Smith', email: 'bob@example.com', role: 'Editor' },
      3: { name: 'Carol White', email: 'carol@example.com', role: 'Viewer' },
    };
    return users[id] ?? { name: 'Unknown', email: 'n/a', role: 'None' };
  }

  async function fetchPosts(userId: number): Promise<{ title: string; date: string }[]> {
    await new Promise((r) => setTimeout(r, 2000));
    return [
      { title: \`Post by user \${userId}: Getting Started\`, date: '2025-12-01' },
      { title: \`Post by user \${userId}: Advanced Tips\`, date: '2025-12-15' },
      { title: \`Post by user \${userId}: Best Practices\`, date: '2026-01-10' },
    ];
  }

  // In real async Svelte, you'd use top-level await:
  // const user = await fetchUser(selectedUser);
  // For this demo, we use $effect + manual state since the playground
  // runs a single component

  let user: { name: string; email: string; role: string } | null = $state(null);
  let posts: { title: string; date: string }[] = $state([]);
  let loadingUser: boolean = $state(false);
  let loadingPosts: boolean = $state(false);

  // Simulating how $effect.pending() works in concept
  let isPending: boolean = $derived(loadingUser || loadingPosts);

  $effect(() => {
    loadingUser = true;
    user = null;
    fetchUser(selectedUser).then((u) => {
      user = u;
      loadingUser = false;
    });
  });

  $effect(() => {
    if (showDetails) {
      loadingPosts = true;
      posts = [];
      fetchPosts(selectedUser).then((p) => {
        posts = p;
        loadingPosts = false;
      });
    }
  });
</script>

<h1>Async Rendering & Pending States</h1>

<div class="controls">
  <label>Select User:</label>
  <select bind:value={selectedUser}>
    <option value={1}>User 1 — Alice</option>
    <option value={2}>User 2 — Bob</option>
    <option value={3}>User 3 — Carol</option>
  </select>
  <label>
    <input type="checkbox" bind:checked={showDetails} />
    Show Posts
  </label>
</div>

<!-- Pending indicator — in real async Svelte, $effect.pending() handles this -->
{#if isPending}
  <div class="pending-bar">
    <div class="pending-indicator"></div>
  </div>
{/if}

<div class="content">
  <section class="user-card">
    <h2>User Profile</h2>
    {#if loadingUser}
      <div class="skeleton">
        <div class="skeleton-line wide"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line narrow"></div>
      </div>
    {:else if user}
      <div class="profile">
        <div class="avatar">{user.name[0]}</div>
        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span class="badge">{user.role}</span>
        </div>
      </div>
    {/if}
  </section>

  {#if showDetails}
    <section class="posts">
      <h2>Posts</h2>
      {#if loadingPosts}
        <div class="skeleton">
          <div class="skeleton-line wide"></div>
          <div class="skeleton-line wide"></div>
          <div class="skeleton-line wide"></div>
        </div>
      {:else}
        {#each posts as post}
          <div class="post">
            <h4>{post.title}</h4>
            <span class="date">{post.date}</span>
          </div>
        {/each}
      {/if}
    </section>
  {/if}
</div>

<div class="info-box">
  <h3>How Async Svelte Works</h3>
  <pre><code>&lt;script lang="ts"&gt;
  // Top-level await — Svelte handles pending
  const user = await fetchUser(id);

  // Parent checks pending state:
  // $effect.pending() returns true while
  // child components are still loading
&lt;/script&gt;</code></pre>
</div>

<style>
  h1 { color: #2d3436; }
  .controls {
    display: flex; align-items: center; gap: 1rem;
    margin-bottom: 1rem; flex-wrap: wrap;
  }
  select { padding: 0.4rem; border-radius: 4px; border: 1px solid #ddd; }
  .pending-bar {
    height: 3px; background: #dfe6e9; overflow: hidden;
    border-radius: 2px; margin-bottom: 1rem;
  }
  .pending-indicator {
    height: 100%; width: 30%; background: #0984e3;
    border-radius: 2px; animation: slide 1s infinite ease-in-out;
  }
  @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
  .content { display: grid; gap: 1rem; }
  section {
    padding: 1rem; background: #f8f9fa; border-radius: 8px;
    border: 1px solid #dfe6e9;
  }
  h2 { margin-top: 0; color: #0984e3; font-size: 1.1rem; }
  .skeleton-line {
    height: 14px; background: #dfe6e9; border-radius: 4px;
    margin-bottom: 0.5rem; animation: pulse 1.5s infinite;
  }
  .skeleton-line.wide { width: 80%; }
  .skeleton-line.medium { width: 60%; }
  .skeleton-line.narrow { width: 40%; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .profile { display: flex; gap: 1rem; align-items: center; }
  .avatar {
    width: 48px; height: 48px; border-radius: 50%; background: #0984e3;
    color: white; display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem; font-weight: bold;
  }
  .profile h3 { margin: 0; }
  .profile p { margin: 0.2rem 0; color: #636e72; }
  .badge {
    display: inline-block; padding: 0.15rem 0.5rem; background: #00b894;
    color: white; border-radius: 10px; font-size: 0.75rem; font-weight: 600;
  }
  .post {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.5rem 0; border-bottom: 1px solid #eee;
  }
  .post h4 { margin: 0; font-size: 0.95rem; }
  .date { color: #636e72; font-size: 0.85rem; }
  .info-box {
    margin-top: 1.5rem; padding: 1rem; background: #2d3436;
    border-radius: 8px; color: #dfe6e9;
  }
  .info-box h3 { margin: 0 0 0.5rem; color: #74b9ff; font-size: 0.95rem; }
  pre { margin: 0; }
  code { font-size: 0.85rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
