import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '14-2',
		title: '$state.eager, Synchronized Updates & $derived Overrides',
		phase: 5,
		module: 14,
		lessonIndex: 2
	},
	description: `When a piece of state is consumed by an await expression (in the template, in a $derived, or at the top level of the script), Svelte applies SYNCHRONIZED UPDATES: a change to that state is not reflected in the UI until the dependent async work has completed. This keeps the UI consistent — you never see "2 + 2 = 3" while the new sum is still resolving.

Sometimes, though, you want one specific READ of that state to update immediately, as user feedback. The canonical case is a navigation bar: when the user clicks a link, the aria-current highlight should move at once, even though the new page's async content is still loading. That is exactly what $state.eager(value) does — it's an expression-level rune that wraps a state read and opts that read out of synchronized updates:

  <a href="/" aria-current={$state.eager(pathname) === '/' ? 'page' : null}>home</a>

Note carefully: $state.eager is NOT a state declaration and NOT a "synchronous DOM flush" — batching still applies. It only controls which version of a value (latest vs. synchronized) a particular expression renders while async work is pending. Use it sparingly, only for feedback in response to user action.

The second tool in this lesson is $derived OVERRIDING: a $derived value can be temporarily reassigned, and it reverts to the computed value the next time its dependencies change. This is the idiomatic optimistic-UI primitive — bump the derived immediately, run the mutation, and let the next authoritative update (or an error rollback) reconcile it.`,
	objectives: [
		'Explain synchronized updates: state changes wait for dependent await expressions',
		'Use $state.eager(value) as an expression to render the latest value for instant feedback',
		'Know what $state.eager is NOT: it does not flush the DOM synchronously or bypass batching',
		'Override a $derived for optimistic UI, and rely on dependency changes to revert it',
		'Decide when eager reads are worth it vs. letting Svelte coordinate updates'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ─────────────────────────────────────────────────────────────
  // 1. Synchronized updates vs. $state.eager — simulated
  //
  // With experimental async (await in the template), Svelte keeps
  // the UI consistent: state used by an await expression doesn't
  // update on screen until the async work resolves. An eager read
  // — $state.eager(pathname) — opts ONE expression out, so the nav
  // highlight moves instantly while the content is still loading.
  //
  // This demo simulates the two behaviours side by side so it runs
  // without the experimental.async flag; the real syntax is shown
  // in the reference block below.
  // ─────────────────────────────────────────────────────────────

  import OptimisticLikes from './OptimisticLikes.svelte';

  interface Route {
    path: string;
    label: string;
    content: string;
  }

  const routes: Route[] = [
    { path: '/', label: 'Home', content: 'Welcome dashboard with recent activity.' },
    { path: '/inbox', label: 'Inbox', content: 'Unread messages and notifications.' },
    { path: '/projects', label: 'Projects', content: 'Active projects and milestones.' },
    { path: '/reports', label: 'Reports', content: 'Analytics and performance data.' }
  ];

  // The "real" state — what an eager read renders immediately
  let pathname: string = \$state('/');
  // What the synchronized UI shows — only catches up when the
  // dependent async work (loadPage) has resolved
  let settledPathname: string = \$state('/');
  let pageContent: string = \$state(routes[0].content);
  let loading: boolean = \$state(false);
  let navToken = 0;

  async function navigate(path: string): Promise<void> {
    pathname = path; // eager reads of \`pathname\` update at once
    const token = ++navToken;
    loading = true;

    // Simulated async page content (an await expression depending
    // on \`pathname\` in real async Svelte)
    await new Promise((r) => setTimeout(r, 800));
    if (token !== navToken) return; // a newer navigation superseded us

    // Synchronized updates land together, once the await resolves
    settledPathname = path;
    pageContent = routes.find((r) => r.path === path)?.content ?? '';
    loading = false;
  }
</script>

<h1>$state.eager &amp; $derived Overrides</h1>

<section class="callout">
  <strong>Mental model:</strong> <code>$state.eager(x)</code> is an
  <em>expression</em>, not a declaration. It renders the latest value of
  <code>x</code> even while synchronized updates are holding the rest of the
  UI back for pending <code>await</code> expressions. It does <em>not</em>
  flush the DOM synchronously — Svelte still batches as usual.
</section>

<section>
  <h2>1. Navigation feedback during async loads</h2>
  <p class="hint">
    Click a tab. The <em>eager</em> bar highlights instantly; the
    <em>synchronized</em> bar waits for the (slow) page content — exactly the
    difference between <code>$state.eager(pathname)</code> and a plain read.
  </p>

  <h3>Eager read — instant highlight</h3>
  <nav class="nav" aria-label="Eager navigation">
    {#each routes as route (route.path)}
      <button
        class={['nav-btn', pathname === route.path && 'active']}
        aria-current={pathname === route.path ? 'page' : undefined}
        onclick={() => navigate(route.path)}
      >
        {route.label}
      </button>
    {/each}
  </nav>

  <h3>Synchronized read — waits for the await</h3>
  <nav class="nav" aria-label="Synchronized navigation">
    {#each routes as route (route.path)}
      <button
        class={['nav-btn', 'sync', settledPathname === route.path && 'active']}
        onclick={() => navigate(route.path)}
      >
        {route.label}
      </button>
    {/each}
  </nav>

  <main class="content">
    {#if loading}
      <p class="loading">loading {pathname}…</p>
    {:else}
      <p>{pageContent}</p>
    {/if}
  </main>

  <pre class="ref"><code>{\`<!-- Real async Svelte (experimental.async) -->
<nav>
  <!-- eager read: highlight moves the instant the user clicks -->
  <a href="/" aria-current={\$state.eager(pathname) === '/' ? 'page' : null}>home</a>
  <a href="/about" aria-current={\$state.eager(pathname) === '/about' ? 'page' : null}>about</a>
</nav>

<!-- synchronized: this waits until loadPage(pathname) resolves -->
<main>{@html await loadPage(pathname)}</main>\`}</code></pre>
</section>

<section>
  <h2>2. $derived overriding — optimistic UI</h2>
  <p class="hint">
    <code>likes</code> is the server truth; <code>shownLikes</code> is a
    <code>$derived(likes)</code> that we <em>reassign</em> optimistically.
    When the mutation succeeds we update <code>likes</code>; when it fails we
    don't — and the next change to <code>likes</code> snaps the derived back
    to the computed value. Roughly every third click fails on purpose.
  </p>
  <OptimisticLikes />
</section>

<section class="pitfalls">
  <h2>Common Pitfalls &amp; Pro Tips</h2>
  <ul class="pitfall-list">
    <li>
      <strong>$state.eager does not make updates synchronous</strong>
      Batching is unchanged. If you need the DOM flushed before the next line of JS, that's <code>flushSync</code> — a different tool with different costs.
    </li>
    <li>
      <strong>Wrap the read, not the declaration</strong>
      <code>let x = $state.eager(0)</code> is wrong — the rune wraps a read inside an expression: <code>$state.eager(x)</code>.
    </li>
    <li>
      <strong>Use eager reads only for user-action feedback</strong>
      For everything else, letting Svelte coordinate synchronized updates gives a more consistent UI.
    </li>
    <li>
      <strong>Derived overrides revert on the next dependency change</strong>
      That's the feature: the optimistic value is temporary, and the computed (authoritative) value wins as soon as its inputs update.
    </li>
    <li>
      <strong>Don't override a derived from inside an effect</strong>
      Optimistic writes belong in event handlers; writing to deriveds from effects invites loops.
    </li>
  </ul>
</section>

<style>
  h1 { color: #2d3436; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin: 0 0 0.5rem; color: #6c5ce7; font-size: 1.05rem; }
  h3 { margin: 0.75rem 0 0.35rem; font-size: 0.85rem; color: #636e72; text-transform: uppercase; letter-spacing: 0.04em; }
  .hint { font-size: 0.85rem; color: #636e72; margin: 0 0 0.5rem; }
  .callout {
    background: #f0fdf4; border-left: 3px solid #16a34a;
    font-size: 0.88rem; color: #14532d;
  }
  .callout code { background: #bbf7d0; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
  code { background: #eef; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }

  .nav {
    display: flex; gap: 0.25rem; padding: 0.3rem;
    background: #f1f3f5; border-radius: 10px; margin-bottom: 0.5rem;
  }
  .nav-btn {
    flex: 1; padding: 0.5rem 0.7rem; border: none; background: transparent;
    border-radius: 8px; cursor: pointer; font-weight: 600; color: #495057;
  }
  .nav-btn:hover:not(.active) { background: #e9ecef; }
  .nav-btn.active { background: #0984e3; color: white; }
  .nav-btn.sync.active { background: #00b894; }

  .content {
    padding: 1rem; background: white; border: 1px solid #dfe6e9;
    border-radius: 8px; min-height: 56px; margin-top: 0.5rem;
  }
  .loading { color: #b2bec3; font-style: italic; margin: 0; }
  .content p { margin: 0; font-size: 0.9rem; color: #2d3436; }

  .ref {
    margin-top: 0.75rem; padding: 0.75rem; background: #2d3436;
    border-radius: 6px; overflow-x: auto;
  }
  .ref code { background: transparent; color: #dfe6e9; font-size: 0.78rem; line-height: 1.5; }

  .pitfalls { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.25rem; }
  .pitfalls h2 { color: #78350f; margin: 0 0 0.5rem; font-size: 1rem; }
  .pitfall-list { list-style: none; padding: 0; margin: 0; }
  .pitfall-list li { padding: 0.4rem 0; border-bottom: 1px dashed #fbbf24; font-size: 0.85rem; color: #78350f; }
  .pitfall-list li:last-child { border-bottom: none; }
  .pitfall-list strong { display: block; color: #92400e; margin-bottom: 0.15rem; }
</style>`,
			language: 'svelte'
		},
		{
			filename: 'OptimisticLikes.svelte',
			content: `<script lang="ts">
  // ─────────────────────────────────────────────────────────────
  // $derived overriding — the optimistic UI primitive.
  //
  // \`shownLikes\` is derived from \`likes\` (the server truth), but a
  // derived can be temporarily REASSIGNED. It reverts to the
  // computed value whenever its dependencies next change.
  // ─────────────────────────────────────────────────────────────

  let likes: number = \$state(12);
  let shownLikes: number = \$derived(likes);
  let status: string = \$state('');
  let attempt = 0;

  async function like(): Promise<void> {
    // Optimistic: override the derived immediately
    shownLikes += 1;
    status = 'saving…';

    // Simulated mutation — every 3rd attempt fails
    const willFail = ++attempt % 3 === 0;
    await new Promise((r) => setTimeout(r, 600));

    if (willFail) {
      // Rollback: touching the dependency reverts the override.
      // Reassigning \`likes\` to itself is a no-op for the value but
      // here we simply re-derive by writing the truth again.
      likes = likes + 0;
      shownLikes = likes; // explicit revert for clarity
      status = 'failed — rolled back to server value';
    } else {
      // Authoritative update: dependency changes, derived recomputes
      likes += 1;
      status = 'saved';
    }
  }
</script>

<div class="card">
  <button onclick={like}>♥ Like</button>
  <div class="numbers">
    <div>
      <span class="label">shown (derived, overridable)</span>
      <strong>{shownLikes}</strong>
    </div>
    <div>
      <span class="label">server truth ($state)</span>
      <strong>{likes}</strong>
    </div>
  </div>
  {#if status}
    <p class="status" class:fail={status.startsWith('failed')}>{status}</p>
  {/if}
</div>

<style>
  .card {
    background: white; border: 1px solid #dfe6e9; border-radius: 8px;
    padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem;
    max-width: 360px;
  }
  button {
    padding: 0.5rem 1rem; border: none; border-radius: 6px;
    background: #e84393; color: white; cursor: pointer; font-weight: 700;
    align-self: flex-start;
  }
  button:hover { background: #d63384; }
  .numbers { display: flex; gap: 1.5rem; }
  .label { display: block; font-size: 0.7rem; color: #636e72; text-transform: uppercase; }
  strong { font-size: 1.4rem; color: #2d3436; font-family: ui-monospace, monospace; }
  .status { margin: 0; font-size: 0.8rem; color: #00b894; font-weight: 600; }
  .status.fail { color: #d63031; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
