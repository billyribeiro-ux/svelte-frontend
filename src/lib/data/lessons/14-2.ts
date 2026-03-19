import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '14-2',
		title: '$state.eager & Sync Updates',
		phase: 5,
		module: 14,
		lessonIndex: 2
	},
	description: `By default, Svelte 5 batches state updates and applies them asynchronously for performance. However, there are cases where you need the DOM to update immediately — for example, when providing instant UI feedback during navigation, measuring elements after a state change, or coordinating with imperative browser APIs.

$state.eager opts out of batching for a specific piece of state, ensuring that any assignment immediately triggers synchronous DOM updates. This lesson explores when synchronous updates matter and how to use $state.eager effectively without sacrificing overall performance.`,
	objectives: [
		'Understand the difference between batched and synchronous state updates',
		'Use $state.eager for immediate UI feedback scenarios',
		'Identify when synchronous updates are necessary vs premature optimization',
		'Combine $state.eager with async operations for responsive interfaces'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Eager state updates the DOM synchronously on assignment
  let activeTab: string = $state.eager('home');
  let loadingProgress: number = $state.eager(0);
  let statusMessage: string = $state.eager('Ready');

  // Regular state for non-critical UI
  let logs: string[] = $state([]);

  function addLog(msg: string): void {
    logs = [...logs, \`[\${new Date().toLocaleTimeString()}] \${msg}\`];
  }

  async function navigateTo(tab: string): Promise<void> {
    // With $state.eager, the tab highlight updates IMMEDIATELY
    activeTab = tab;
    statusMessage = \`Loading \${tab}...\`;
    loadingProgress = 0;
    addLog(\`Navigation started: \${tab}\`);

    // Simulate async data loading with progress
    for (let i = 1; i <= 5; i++) {
      await new Promise((r) => setTimeout(r, 200));
      // Each assignment updates the progress bar synchronously
      loadingProgress = i * 20;
      statusMessage = \`Loading \${tab}... \${i * 20}%\`;
    }

    statusMessage = \`\${tab} loaded!\`;
    addLog(\`Navigation complete: \${tab}\`);
  }

  const tabs = ['home', 'profile', 'settings', 'analytics'];
</script>

<h1>Sync Updates Demo</h1>

<nav class="tabs">
  {#each tabs as tab}
    <button
      class:active={activeTab === tab}
      onclick={() => navigateTo(tab)}
    >
      {tab}
    </button>
  {/each}
</nav>

<div class="progress-container">
  <div class="progress-bar" style="width: {loadingProgress}%"></div>
</div>
<p class="status">{statusMessage}</p>

<div class="content">
  <h2>{activeTab}</h2>
  <p>Content area for the <strong>{activeTab}</strong> tab.</p>
</div>

<div class="logs">
  <h3>Activity Log</h3>
  {#each logs as log}
    <div class="log-entry">{log}</div>
  {/each}
  {#if logs.length === 0}
    <p class="empty">No activity yet. Click a tab to navigate.</p>
  {/if}
</div>

<style>
  h1 { color: #2d3436; }
  .tabs { display: flex; gap: 0; border-bottom: 2px solid #dfe6e9; margin-bottom: 1rem; }
  .tabs button {
    padding: 0.75rem 1.5rem; border: none; background: transparent;
    cursor: pointer; font-weight: 600; color: #636e72;
    border-bottom: 3px solid transparent; transition: color 0.1s;
    text-transform: capitalize;
  }
  .tabs button.active { color: #0984e3; border-bottom-color: #0984e3; }
  .progress-container {
    height: 4px; background: #dfe6e9; border-radius: 2px;
    overflow: hidden; margin-bottom: 0.5rem;
  }
  .progress-bar {
    height: 100%; background: #0984e3; transition: width 0.15s linear;
  }
  .status { font-size: 0.85rem; color: #636e72; margin-bottom: 1rem; }
  .content {
    padding: 1.5rem; background: #f8f9fa; border-radius: 8px; margin-bottom: 1.5rem;
  }
  .content h2 { text-transform: capitalize; margin: 0 0 0.5rem; }
  .logs {
    background: #2d3436; color: #dfe6e9; padding: 1rem;
    border-radius: 8px; max-height: 200px; overflow-y: auto;
  }
  .logs h3 { margin: 0 0 0.5rem; font-size: 0.9rem; color: #74b9ff; }
  .log-entry { font-family: monospace; font-size: 0.8rem; padding: 0.2rem 0; }
  .empty { color: #636e72; font-size: 0.85rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
