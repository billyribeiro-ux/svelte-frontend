import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '14-2',
		title: '$state.eager & Sync Updates',
		phase: 5,
		module: 14,
		lessonIndex: 2
	},
	description: `By default, Svelte 5 batches state updates and applies them asynchronously for performance. That's almost always what you want — but a handful of UI patterns need the DOM to reflect a change before the next line of JavaScript runs. The two most common examples are (a) navigation highlighting (the active tab must light up the instant the user clicks, even while data is still loading) and (b) measurement code that reads layout after setting state.

$state.eager opts out of batching for one specific piece of state: every assignment immediately flushes synchronous DOM updates. Use it sparingly — the default batched updates are faster — but reach for it whenever a visual "flash" between click and render is unacceptable.`,
	objectives: [
		'Understand the difference between batched and synchronous state updates',
		'Use $state.eager for navigation highlights and aria-current feedback',
		'Eliminate the "navigation flash" where the old tab stays highlighted mid-transition',
		'Know when eager updates are worth the cost vs. premature optimization'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ─────────────────────────────────────────────────────────────
  // $state.eager — bypasses the default batching/microtask flush.
  // Every assignment synchronously updates the DOM before the next
  // statement runs. Ideal for instantaneous visual feedback.
  // ─────────────────────────────────────────────────────────────

  interface Route {
    slug: string;
    label: string;
    icon: string;
    description: string;
  }

  const routes: Route[] = [
    { slug: 'home', label: 'Home', icon: 'H', description: 'Welcome dashboard with recent activity.' },
    { slug: 'inbox', label: 'Inbox', icon: 'I', description: 'Unread messages and notifications.' },
    { slug: 'projects', label: 'Projects', icon: 'P', description: 'Active projects and milestones.' },
    { slug: 'reports', label: 'Reports', icon: 'R', description: 'Analytics and performance data.' },
    { slug: 'settings', label: 'Settings', icon: 'S', description: 'Account and workspace preferences.' }
  ];

  // EAGER state — the highlight updates synchronously on click
  let activeSlug: string = $state.eager('home');
  let statusMessage: string = $state.eager('Ready');
  let loadProgress: number = $state.eager(0);

  // Regular (batched) state — fine for things not tied to instant feedback
  let contentBody: string = $state(routes[0].description);
  let logs: string[] = $state([]);

  // Demo toggle: compare eager vs. non-eager highlighting
  let eagerMode: boolean = $state(true);
  let laggySlug: string = $state('home');

  function log(msg: string): void {
    const time = new Date().toLocaleTimeString();
    logs = [\`[\${time}] \${msg}\`, ...logs].slice(0, 8);
  }

  async function navigate(slug: string): Promise<void> {
    const start = performance.now();

    if (eagerMode) {
      // Eager: highlight flips IMMEDIATELY, before the await below
      activeSlug = slug;
      statusMessage = \`Loading \${slug}...\`;
      loadProgress = 0;
      log(\`eager click → \${slug} (highlight shown at \${(performance.now() - start).toFixed(1)}ms)\`);
    } else {
      // Batched: assignment scheduled, DOM updates after microtask
      laggySlug = slug;
      statusMessage = \`Loading \${slug}...\`;
      loadProgress = 0;
      log(\`batched click → \${slug}\`);
    }

    // Simulate async data loading
    for (let i = 1; i <= 5; i++) {
      await new Promise((r) => setTimeout(r, 120));
      loadProgress = i * 20;
    }

    const route = routes.find((r) => r.slug === slug);
    if (route) contentBody = route.description;
    statusMessage = \`\${slug} loaded\`;
  }

  let currentLabel = $derived(
    routes.find((r) => r.slug === (eagerMode ? activeSlug : laggySlug))?.label ?? '?'
  );
</script>

<h1>$state.eager — Instant Navigation Feedback</h1>

<section class="callout">
  <strong>When to use $state.eager:</strong> navigation highlights,
  <code>aria-current</code> updates, focus transitions, and any state whose
  rendering must happen <em>before</em> the next line of JavaScript (e.g.
  measuring layout, coordinating with imperative APIs).
</section>

<div class="mode-toggle">
  <label>
    <input type="checkbox" bind:checked={eagerMode} />
    Use <code>$state.eager</code> (uncheck to see the flash)
  </label>
</div>

<nav class="nav" aria-label="Main navigation">
  {#each routes as route (route.slug)}
    {@const current = eagerMode ? activeSlug : laggySlug}
    <button
      class={['nav-btn', current === route.slug && 'active']}
      aria-current={current === route.slug ? 'page' : undefined}
      onclick={() => navigate(route.slug)}
    >
      <span class="icon">{route.icon}</span>
      <span class="label">{route.label}</span>
    </button>
  {/each}
</nav>

<div class="progress-bar">
  <div class="progress-fill" style="width: {loadProgress}%"></div>
</div>
<p class="status">{statusMessage}</p>

<main class="content">
  <h2>{currentLabel}</h2>
  <p>{contentBody}</p>
</main>

<section class="log-panel">
  <h3>Navigation Log</h3>
  {#if logs.length === 0}
    <p class="empty">Click a tab to see timing.</p>
  {:else}
    {#each logs as entry (entry)}
      <div class="log-entry">{entry}</div>
    {/each}
  {/if}
</section>

<section class="explain">
  <h3>What you just saw</h3>
  <ul>
    <li>
      With <code>$state.eager</code>, the active tab's background flips
      <strong>synchronously</strong> inside the click handler. By the time the
      next line of JS runs, the DOM already shows the new highlight.
    </li>
    <li>
      Without eager state, Svelte batches the assignment and flushes in a
      microtask. If the handler then awaits, there's a one-frame gap where the
      old tab still looks active — the infamous "navigation flash".
    </li>
    <li>
      Eager state is an opt-in escape hatch. Use it for UI feedback only;
      batched updates are faster for everything else.
    </li>
  </ul>
</section>

<style>
  h1 { color: #2d3436; }
  .callout {
    padding: 0.75rem 0.9rem; background: #f0fdf4;
    border-left: 3px solid #16a34a; border-radius: 6px;
    font-size: 0.88rem; color: #14532d; margin-bottom: 1rem;
  }
  .callout code { background: #bbf7d0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  .mode-toggle { margin-bottom: 0.75rem; font-size: 0.9rem; }
  .mode-toggle code { background: #eef; padding: 0.1rem 0.3rem; border-radius: 3px; }

  .nav {
    display: flex; gap: 0.25rem;
    padding: 0.35rem; background: #f1f3f5;
    border-radius: 10px; margin-bottom: 0.75rem;
  }
  .nav-btn {
    flex: 1; display: flex; align-items: center; gap: 0.5rem;
    padding: 0.6rem 0.8rem; border: none; background: transparent;
    border-radius: 8px; cursor: pointer; font-weight: 600;
    color: #495057; transition: none;
  }
  .nav-btn:hover:not(.active) { background: #e9ecef; }
  .nav-btn.active {
    background: #0984e3; color: white;
    box-shadow: 0 2px 8px rgba(9, 132, 227, 0.3);
  }
  .nav-btn .icon {
    width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.3); border-radius: 6px; font-weight: 800;
  }
  .nav-btn.active .icon { background: rgba(255,255,255,0.25); }
  .nav-btn:not(.active) .icon { background: #dee2e6; }

  .progress-bar {
    height: 3px; background: #dfe6e9; border-radius: 2px;
    overflow: hidden; margin-bottom: 0.35rem;
  }
  .progress-fill {
    height: 100%; background: #0984e3; transition: width 0.12s linear;
  }
  .status { font-size: 0.82rem; color: #636e72; margin: 0 0 1rem; }

  .content {
    padding: 1.25rem; background: #f8f9fa;
    border-radius: 10px; margin-bottom: 1rem; min-height: 80px;
  }
  .content h2 { margin: 0 0 0.5rem; color: #2d3436; }

  .log-panel {
    background: #2d3436; color: #dfe6e9;
    padding: 0.75rem 1rem; border-radius: 8px;
    max-height: 180px; overflow-y: auto; margin-bottom: 1rem;
  }
  .log-panel h3 { margin: 0 0 0.5rem; font-size: 0.85rem; color: #74b9ff; }
  .log-entry { font-family: ui-monospace, monospace; font-size: 0.78rem; padding: 0.15rem 0; }
  .empty { color: #636e72; font-size: 0.82rem; }

  .explain {
    padding: 1rem; background: #fff8e1; border-radius: 8px;
    border-left: 3px solid #fdcb6e; font-size: 0.88rem;
  }
  .explain h3 { margin: 0 0 0.5rem; color: #b8860b; font-size: 0.95rem; }
  .explain ul { margin: 0; padding-left: 1.2rem; }
  .explain li { margin-bottom: 0.35rem; color: #555; }
  .explain code { background: #fef3c7; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
