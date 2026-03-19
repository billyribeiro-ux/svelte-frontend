import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-4',
		title: 'Async Svelte: Forking & Concurrency',
		phase: 5,
		module: 15,
		lessonIndex: 4
	},
	description: `Svelte's async model supports forking — creating concurrent async branches that can preload data before committing it to the UI. The fork() API lets you start loading data in the background (for example, on hover or prefetch), then either commit the result when the user confirms the action or discard it if they change their mind.

This enables patterns like hover-to-preload, optimistic navigation, and speculative data fetching — all without flash-of-loading-state. When you fork(), the async work runs in parallel without blocking the current view, and you decide when (or if) the result becomes visible.`,
	objectives: [
		'Use fork() to preload data concurrently without blocking the current view',
		'Commit forked results with fork().commit() to apply preloaded data',
		'Discard unused forks with fork().discard() to clean up resources',
		'Implement hover-to-preload patterns for faster perceived navigation'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // Simulate the fork() pattern for concurrent data loading
  // In real Svelte async, you'd use the built-in fork() API

  interface Article {
    id: number;
    title: string;
    body: string;
    author: string;
  }

  let currentArticle: Article | null = $state(null);
  let preloadedArticle: Article | null = $state(null);
  let preloadingId: number | null = $state(null);
  let loadingMain: boolean = $state(false);
  let status: string = $state('Idle');
  let logs: string[] = $state([]);

  const articles: Article[] = [
    { id: 1, title: 'Introduction to Svelte 5', body: 'Svelte 5 brings runes, a new reactivity system that replaces stores and reactive declarations with explicit primitives like $state and $derived.', author: 'Alice' },
    { id: 2, title: 'Advanced Reactivity Patterns', body: 'Deep dive into $effect.pre, $effect.root, and $state.raw for fine-grained control over when and how your UI updates.', author: 'Bob' },
    { id: 3, title: 'Async Rendering in Svelte', body: 'First-class async support lets components await data at the top level while Svelte manages pending states automatically.', author: 'Carol' },
    { id: 4, title: 'Error Boundaries & Recovery', body: 'Production apps need graceful degradation. svelte:boundary catches render errors and provides reset functionality.', author: 'Dave' },
  ];

  async function simulateFetch(id: number): Promise<Article> {
    await new Promise((r) => setTimeout(r, 1200));
    return articles.find((a) => a.id === id)!;
  }

  function addLog(msg: string): void {
    logs = [\`[\${new Date().toLocaleTimeString()}] \${msg}\`, ...logs].slice(0, 10);
  }

  // fork() simulation — preload on hover
  async function preloadArticle(id: number): Promise<void> {
    if (preloadingId === id || currentArticle?.id === id) return;
    preloadingId = id;
    status = \`Preloading article \${id}...\`;
    addLog(\`fork(): Started preloading article \${id}\`);

    const data = await simulateFetch(id);

    if (preloadingId === id) {
      preloadedArticle = data;
      status = \`Article \${id} preloaded — ready to commit\`;
      addLog(\`fork(): Article \${id} preloaded and cached\`);
    }
  }

  // commit() — apply preloaded data
  function commitPreloaded(id: number): void {
    if (preloadedArticle?.id === id) {
      currentArticle = preloadedArticle;
      preloadedArticle = null;
      preloadingId = null;
      status = \`Committed article \${id} instantly!\`;
      addLog(\`fork().commit(): Article \${id} applied with no loading delay\`);
    } else {
      // Fallback: load normally if not preloaded
      loadArticle(id);
    }
  }

  // discard() — throw away preloaded data
  function discardPreloaded(): void {
    if (preloadedArticle) {
      addLog(\`fork().discard(): Discarded preloaded article \${preloadedArticle.id}\`);
      preloadedArticle = null;
      preloadingId = null;
      status = 'Preloaded data discarded';
    }
  }

  // Regular load (no preload)
  async function loadArticle(id: number): Promise<void> {
    loadingMain = true;
    status = \`Loading article \${id}...\`;
    addLog(\`Direct load: article \${id}\`);
    currentArticle = await simulateFetch(id);
    loadingMain = false;
    status = \`Article \${id} loaded (full wait)\`;
    addLog(\`Direct load complete: article \${id}\`);
  }
</script>

<h1>Async Forking & Concurrency</h1>

<p class="status-bar">Status: {status}</p>

<div class="layout">
  <nav class="sidebar">
    <h3>Articles (hover to preload)</h3>
    {#each articles as article}
      <button
        class:active={currentArticle?.id === article.id}
        class:preloaded={preloadedArticle?.id === article.id}
        onmouseenter={() => preloadArticle(article.id)}
        onmouseleave={discardPreloaded}
        onclick={() => commitPreloaded(article.id)}
      >
        <span class="article-title">{article.title}</span>
        <span class="article-author">by {article.author}</span>
        {#if preloadedArticle?.id === article.id}
          <span class="preload-badge">Preloaded</span>
        {/if}
      </button>
    {/each}
  </nav>

  <main class="content">
    {#if loadingMain}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading article...</p>
      </div>
    {:else if currentArticle}
      <article>
        <h2>{currentArticle.title}</h2>
        <p class="author">By {currentArticle.author}</p>
        <p>{currentArticle.body}</p>
      </article>
    {:else}
      <p class="placeholder">Hover over an article to preload, then click to view instantly.</p>
    {/if}
  </main>
</div>

<div class="log-panel">
  <h3>Fork Log</h3>
  {#each logs as log}
    <div class="log-entry">{log}</div>
  {/each}
  {#if logs.length === 0}
    <p class="empty">No activity yet.</p>
  {/if}
</div>

<style>
  h1 { color: #2d3436; }
  .status-bar {
    padding: 0.5rem 1rem; background: #dfe6e9; border-radius: 4px;
    font-size: 0.9rem; color: #2d3436; margin-bottom: 1rem;
  }
  .layout { display: grid; grid-template-columns: 280px 1fr; gap: 1rem; margin-bottom: 1rem; }
  .sidebar h3 { margin: 0 0 0.75rem; color: #6c5ce7; font-size: 1rem; }
  .sidebar button {
    display: block; width: 100%; text-align: left; padding: 0.75rem;
    border: 1px solid #dfe6e9; border-radius: 6px; background: white;
    cursor: pointer; margin-bottom: 0.5rem; transition: border-color 0.2s;
  }
  .sidebar button:hover { border-color: #6c5ce7; }
  .sidebar button.active { border-color: #6c5ce7; background: #f0edff; }
  .sidebar button.preloaded { border-color: #00b894; }
  .article-title { display: block; font-weight: 600; font-size: 0.9rem; }
  .article-author { display: block; font-size: 0.8rem; color: #636e72; }
  .preload-badge {
    display: inline-block; margin-top: 0.25rem; padding: 0.1rem 0.4rem;
    background: #00b894; color: white; border-radius: 8px; font-size: 0.7rem;
  }
  .content {
    padding: 1.5rem; background: #f8f9fa; border-radius: 8px;
    min-height: 200px;
  }
  .content h2 { margin-top: 0; color: #2d3436; }
  .author { color: #636e72; font-style: italic; }
  .placeholder { color: #b2bec3; text-align: center; margin-top: 3rem; }
  .loading { text-align: center; margin-top: 3rem; }
  .spinner {
    width: 32px; height: 32px; border: 3px solid #dfe6e9;
    border-top-color: #6c5ce7; border-radius: 50%;
    animation: spin 0.8s linear infinite; margin: 0 auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .log-panel {
    background: #2d3436; color: #dfe6e9; padding: 1rem;
    border-radius: 8px; max-height: 160px; overflow-y: auto;
  }
  .log-panel h3 { margin: 0 0 0.5rem; color: #74b9ff; font-size: 0.9rem; }
  .log-entry { font-family: monospace; font-size: 0.8rem; padding: 0.15rem 0; }
  .empty { color: #636e72; font-size: 0.85rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
