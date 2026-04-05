import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-4',
		title: 'Async Svelte: Forking & Concurrency (Experimental)',
		phase: 5,
		module: 15,
		lessonIndex: 4
	},
	description: `Async Svelte ships a fork() primitive for concurrent, speculative work. A "fork" is an async branch that runs alongside the current view without blocking it. You can later commit() the fork to swap in its result, or discard() it to throw the work away.

The canonical use case is hover-to-preload: as soon as the user hovers a link, fork the fetch for that page; if they click, commit; if they move away, discard. Because the fork never blocked the current render, there's no flash of loading state — the new content appears instantly when committed.

fork() is part of the experimental async Svelte release. This lesson simulates the API so you can explore the mental model today.`,
	objectives: [
		'Understand fork/commit/discard as a concurrency primitive',
		'Implement hover-to-preload navigation with near-zero perceived latency',
		'Discard in-flight forks when user intent changes',
		'Reason about cancellation and race conditions with concurrent branches'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ─────────────────────────────────────────────────────────────
  // Simulated fork/commit/discard. Real async Svelte exposes these
  // as part of its concurrency model; the API shapes here match.
  // ─────────────────────────────────────────────────────────────

  interface Article {
    id: number;
    title: string;
    author: string;
    tags: string[];
    body: string;
    readTime: number;
  }

  const articles: Article[] = [
    {
      id: 1,
      title: 'Runes: the reactive core of Svelte 5',
      author: 'Rich Harris',
      tags: ['svelte', 'reactivity'],
      body: 'Runes are compiler-level primitives that replace stores and reactive declarations with explicit, trackable state. $state, $derived, $effect, and their variants cover every reactivity need in an idiomatic way.',
      readTime: 6
    },
    {
      id: 2,
      title: 'Snippets: the new component composition',
      author: 'Dominic Elm',
      tags: ['svelte', 'patterns'],
      body: 'Snippets replace slots with first-class parameterised pieces of markup. They compose, take arguments, and are fully type-safe in TypeScript projects.',
      readTime: 5
    },
    {
      id: 3,
      title: 'Motion: Spring & Tween classes explained',
      author: 'Simon Holthausen',
      tags: ['svelte', 'animation'],
      body: 'Spring and Tween are reactive classes that animate values over time. Both expose .target and .current, integrate with $derived, and respect prefersReducedMotion.',
      readTime: 7
    },
    {
      id: 4,
      title: 'SvelteKit data loading with remote functions',
      author: 'Ben McCann',
      tags: ['sveltekit', 'data'],
      body: 'Remote functions let you call server code from the client as if it were local, with full type inference and automatic validation.',
      readTime: 8
    }
  ];

  // Lookup for simulation
  async function fetchArticle(id: number, delayMs = 900): Promise<Article> {
    await new Promise((r) => setTimeout(r, delayMs));
    return articles.find((a) => a.id === id)!;
  }

  // ─── Fork simulation ────────────────────────────────────────
  interface ForkHandle {
    id: number;
    status: 'loading' | 'ready' | 'cancelled';
    promise: Promise<Article>;
    cancel: () => void;
  }

  let forks = new Map<number, ForkHandle>();

  // Current view
  let currentArticle: Article | null = $state(null);
  let loading: boolean = $state(false);
  let statusLine: string = $state('Idle');
  let logs: string[] = $state([]);

  // Which article is "hot" (preloaded) right now?
  let readyForks = $state(new Set<number>());

  function log(msg: string): void {
    logs = [\`[\${new Date().toLocaleTimeString()}] \${msg}\`, ...logs].slice(0, 8);
  }

  // fork(id) — start the work concurrently
  function fork(id: number): void {
    if (forks.has(id)) return; // already forked
    log(\`fork(\${id}) — speculative fetch started\`);
    statusLine = \`forking article \${id}\`;

    let cancelled = false;
    const promise = fetchArticle(id).then((data) => {
      if (cancelled) throw new Error('cancelled');
      return data;
    });

    const handle: ForkHandle = {
      id,
      status: 'loading',
      promise,
      cancel: () => { cancelled = true; }
    };
    forks.set(id, handle);

    promise.then(
      () => {
        if (forks.get(id) === handle) {
          handle.status = 'ready';
          readyForks = new Set([...readyForks, id]);
          log(\`fork(\${id}) ready — awaiting commit/discard\`);
          if (statusLine.startsWith('forking')) statusLine = \`article \${id} preloaded\`;
        }
      },
      () => {
        // cancelled
      }
    );
  }

  // commit(id) — use the forked result
  async function commit(id: number): Promise<void> {
    const handle = forks.get(id);
    if (!handle) {
      // No fork — fall back to a direct load
      log(\`commit(\${id}) — no fork, loading directly\`);
      loading = true;
      statusLine = \`loading article \${id}\`;
      currentArticle = await fetchArticle(id);
      loading = false;
      statusLine = \`article \${id} shown (no preload)\`;
      return;
    }

    if (handle.status === 'ready') {
      log(\`commit(\${id}) — instant (preloaded)\`);
      currentArticle = await handle.promise;
      statusLine = \`article \${id} shown (from fork, zero latency)\`;
    } else {
      log(\`commit(\${id}) — awaiting in-flight fork\`);
      loading = true;
      statusLine = \`joining in-flight fork \${id}\`;
      currentArticle = await handle.promise;
      loading = false;
      statusLine = \`article \${id} shown (completed fork)\`;
    }

    // Cleanup: discard all other forks once we commit
    for (const [fid, h] of forks) {
      if (fid !== id) {
        h.cancel();
        log(\`discard(\${fid}) — superseded by commit(\${id})\`);
      }
    }
    forks.clear();
    readyForks = new Set();
    // Re-register the committed one as "ready" (so tag shows)
    forks.set(id, { id, status: 'ready', promise: Promise.resolve(currentArticle!), cancel: () => {} });
    readyForks = new Set([id]);
  }

  // discard(id) — throw away a fork
  function discard(id: number): void {
    const handle = forks.get(id);
    if (!handle) return;
    handle.cancel();
    forks.delete(id);
    const next = new Set(readyForks);
    next.delete(id);
    readyForks = next;
    log(\`discard(\${id}) — user moved away\`);
    if (statusLine.includes(String(id))) statusLine = 'Idle';
  }

  function handleEnter(id: number): void {
    fork(id);
  }

  function handleLeave(id: number): void {
    // Only discard if still loading / unread — committed articles should stay
    const handle = forks.get(id);
    if (handle && currentArticle?.id !== id) discard(id);
  }

  function handleClick(id: number): void {
    commit(id);
  }
</script>

<h1>Async fork / commit / discard</h1>

<section class="callout">
  <strong>Experimental async Svelte:</strong> <code>fork()</code> runs work
  concurrently without blocking the current render. Hover a title below —
  the fetch begins immediately. Click to commit and the article appears with
  zero perceived latency. Move away to discard the work.
</section>

<p class="status">Status: <strong>{statusLine}</strong></p>

<div class="layout">
  <aside class="list">
    <h2>Articles</h2>
    {#each articles as article (article.id)}
      <button
        class:active={currentArticle?.id === article.id}
        class:ready={readyForks.has(article.id)}
        onmouseenter={() => handleEnter(article.id)}
        onmouseleave={() => handleLeave(article.id)}
        onfocus={() => handleEnter(article.id)}
        onblur={() => handleLeave(article.id)}
        onclick={() => handleClick(article.id)}
      >
        <span class="title">{article.title}</span>
        <span class="meta">by {article.author} · {article.readTime} min read</span>
        {#if readyForks.has(article.id) && currentArticle?.id !== article.id}
          <span class="badge">preloaded</span>
        {/if}
        {#if currentArticle?.id === article.id}
          <span class="badge current">current</span>
        {/if}
      </button>
    {/each}
  </aside>

  <main class="reader">
    {#if loading}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading article...</p>
      </div>
    {:else if currentArticle}
      <article>
        <h2>{currentArticle.title}</h2>
        <p class="byline">By {currentArticle.author} · {currentArticle.readTime} min read</p>
        <div class="tags">
          {#each currentArticle.tags as tag (tag)}
            <span class="tag">#{tag}</span>
          {/each}
        </div>
        <p class="body">{currentArticle.body}</p>
      </article>
    {:else}
      <p class="placeholder">
        Hover an article title to fork the fetch. Click to commit and read.
      </p>
    {/if}
  </main>
</div>

<section class="log">
  <h3>Fork log</h3>
  {#if logs.length === 0}
    <p class="empty">(no forks yet)</p>
  {:else}
    {#each logs as entry, i (i)}
      <div class="entry">{entry}</div>
    {/each}
  {/if}
</section>

<style>
  h1 { color: #2d3436; }
  .callout {
    padding: 0.75rem 0.9rem; background: #f0fdf4;
    border-left: 3px solid #16a34a; border-radius: 6px;
    font-size: 0.88rem; color: #14532d; margin-bottom: 1rem;
  }
  .callout code { background: #bbf7d0; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .status {
    padding: 0.4rem 0.8rem; background: #dfe6e9; border-radius: 6px;
    font-size: 0.85rem; color: #2d3436;
  }
  .status strong { color: #6c5ce7; }

  .layout { display: grid; grid-template-columns: 300px 1fr; gap: 1rem; margin-bottom: 1rem; }
  .list h2, .reader h2, .log h3 { margin: 0 0 0.5rem; color: #6c5ce7; font-size: 0.95rem; }
  .list button {
    display: block; width: 100%; text-align: left;
    padding: 0.6rem 0.75rem; margin-bottom: 0.4rem;
    border: 1px solid #dfe6e9; border-radius: 8px;
    background: white; cursor: pointer; position: relative;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .list button:hover { border-color: #6c5ce7; }
  .list button.ready { border-color: #00b894; box-shadow: 0 0 0 2px rgba(0,184,148,0.15); }
  .list button.active { border-color: #6c5ce7; background: #f0edff; box-shadow: 0 0 0 2px rgba(108,92,231,0.15); }
  .title { display: block; font-weight: 600; font-size: 0.85rem; color: #2d3436; margin-bottom: 0.15rem; }
  .meta { display: block; font-size: 0.72rem; color: #636e72; }
  .badge {
    position: absolute; top: 0.4rem; right: 0.4rem;
    font-size: 0.65rem; padding: 0.15rem 0.45rem; border-radius: 999px;
    background: #00b894; color: white; font-weight: 700;
  }
  .badge.current { background: #6c5ce7; }

  .reader {
    padding: 1.25rem; background: #f8f9fa; border-radius: 10px; min-height: 240px;
  }
  .reader article h2 { color: #2d3436; font-size: 1.15rem; }
  .byline { color: #636e72; font-style: italic; font-size: 0.85rem; margin: 0.25rem 0; }
  .tags { display: flex; gap: 0.3rem; margin: 0.5rem 0; }
  .tag { font-size: 0.7rem; padding: 0.15rem 0.5rem; background: #eef; color: #6c5ce7; border-radius: 999px; font-weight: 600; }
  .body { color: #2d3436; font-size: 0.9rem; line-height: 1.5; }
  .placeholder { color: #b2bec3; text-align: center; margin-top: 3rem; }

  .loading { text-align: center; margin-top: 3rem; }
  .spinner {
    width: 32px; height: 32px; border: 3px solid #dfe6e9;
    border-top-color: #6c5ce7; border-radius: 50%;
    animation: spin 0.8s linear infinite; margin: 0 auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .log { background: #2d3436; color: #dfe6e9; padding: 0.75rem 1rem; border-radius: 8px; max-height: 170px; overflow: auto; }
  .log h3 { color: #74b9ff; }
  .entry { font-family: ui-monospace, monospace; font-size: 0.76rem; padding: 0.1rem 0; }
  .empty { color: #636e72; font-size: 0.82rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
