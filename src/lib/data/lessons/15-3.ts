import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '15-3',
		title: 'Async Svelte: Rendering & Pending (Experimental)',
		phase: 5,
		module: 15,
		lessonIndex: 3
	},
	description: `Async Svelte is an experimental feature that lets components await data directly in their <script> blocks and in templates. Instead of tracking isLoading flags yourself, you write

  const user = await fetchUser(id);

and Svelte schedules a pending state for you. Await expressions are allowed in exactly three new places: (1) the top level of a component's <script>, (2) inside $derived(...) declarations, and (3) inside markup expressions. A <svelte:boundary> with a pending snippet shows placeholder UI while the FIRST resolution is in flight; for subsequent updates the boundary stays up and $effect.pending() tells you async work is ongoing.

Three semantics you must internalize for PE7:

• Synchronized updates — when state feeding an await changes, the OLD UI stays until the new value resolves; Svelte never shows a half-updated view (you can opt a single read out with $state.eager, see lesson 14-2).
• Concurrency — independent await expressions in markup run in parallel; sequential awaits in the script run like normal JS, and two $deriveds awaiting independent sources update independently after creation (expect an await_waterfall warning if you accidentally serialize them).
• settled() (from 'svelte') — returns a promise that resolves when the current update, including async work, has been applied. Pair it with tick() to bracket "updating…" flags around async-affecting writes.

Finally, hydratable(key, fn) (from 'svelte') is the SSR-safety valve: an awaited value computed during server rendering is serialized into the head and REUSED during hydration instead of being re-fetched — no double fetch, no hydration blocking, and stable values for things like Math.random(). It powers SvelteKit's remote functions under the hood, and library authors should prefix their keys.

Because async Svelte requires an experimental compiler flag (experimental.async) and isn't available in every runtime, this lesson simulates the pattern with regular $state flags. The demo still teaches the mental model: declarative async dependencies, pending-aware parents, and automatic loading UI without manual bookkeeping.`,
	objectives: [
		'Know the three places await may appear: script top level, $derived, and markup',
		'Explain synchronized updates: stale-but-consistent UI until async work resolves',
		'Reason about concurrency: parallel markup awaits, independent $derived updates, await_waterfall',
		'Use <svelte:boundary> pending for first load and $effect.pending() for later updates',
		'Await settled() to know when an async update has been fully applied',
		'Use hydratable() so server-computed async data is reused during hydration',
		'Show skeleton UIs while waiting for data'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ─────────────────────────────────────────────────────────────
  // Experimental async Svelte lets you write:
  //
  //   <script>
  //     const user = await fetchUser(id);
  //     const posts = await fetchPosts(user.id);
  //   </script>
  //
  // And in parents:
  //
  //   {#if $effect.pending()}
  //     <Spinner />
  //   {/if}
  //
  // This demo simulates that model with $state to make it runnable
  // in the playground. The ergonomics stay the same.
  // ─────────────────────────────────────────────────────────────

  interface User {
    id: number;
    name: string;
    avatar: string;
    title: string;
    stats: { followers: number; following: number; posts: number };
  }

  interface Post {
    id: number;
    title: string;
    excerpt: string;
    date: string;
  }

  // Simulated async fetches
  async function fetchUser(id: number): Promise<User> {
    await new Promise((r) => setTimeout(r, 900));
    const colors = ['#6c5ce7', '#00b894', '#e17055', '#0984e3', '#fd79a8'];
    const titles = ['Engineer', 'Designer', 'PM', 'Writer', 'DevRel'];
    return {
      id,
      name: \`User \${id}\`,
      avatar: colors[id % colors.length],
      title: titles[id % titles.length],
      stats: {
        followers: 100 + id * 37,
        following: 50 + id * 11,
        posts: 10 + id * 3
      }
    };
  }

  async function fetchPosts(userId: number): Promise<Post[]> {
    await new Promise((r) => setTimeout(r, 1400));
    return Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      title: \`Post \${i + 1} from user \${userId}\`,
      excerpt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      date: \`2026-04-0\${i + 1}\`
    }));
  }

  async function fetchFeed(): Promise<{ id: number; text: string }[]> {
    await new Promise((r) => setTimeout(r, 1800));
    return [
      { id: 1, text: 'Alice liked your post' },
      { id: 2, text: 'Bob started following you' },
      { id: 3, text: 'Carol commented: "nice work!"' }
    ];
  }

  let currentUserId: number = $state(1);

  // These are the "awaited" values. In real async Svelte you'd write
  // "const user = await fetchUser(currentUserId)" at the top of <script>.
  let user: User | null = $state(null);
  let posts: Post[] = $state([]);
  let feed: { id: number; text: string }[] = $state([]);

  // Individual pending flags — $effect.pending() replaces these
  // in real async Svelte, but the concept is identical.
  let userLoading: boolean = $state(false);
  let postsLoading: boolean = $state(false);
  let feedLoading: boolean = $state(false);

  // Combined pending — what $effect.pending() returns at the root
  let anyPending = $derived(userLoading || postsLoading || feedLoading);

  $effect(() => {
    // Whenever currentUserId changes, refetch the user + their posts
    const id = currentUserId;
    userLoading = true;
    user = null;
    fetchUser(id).then((u) => {
      if (currentUserId === id) {
        user = u;
        userLoading = false;
      }
    });

    postsLoading = true;
    posts = [];
    fetchPosts(id).then((p) => {
      if (currentUserId === id) {
        posts = p;
        postsLoading = false;
      }
    });
  });

  function loadFeed(): void {
    feedLoading = true;
    feed = [];
    fetchFeed().then((f) => {
      feed = f;
      feedLoading = false;
    });
  }
</script>

<h1>Async Svelte — Rendering & Pending</h1>

<section class="callout">
  <strong>Experimental:</strong> top-level <code>await</code> in Svelte
  components requires the <code>experimental.async</code> compiler flag. This
  demo simulates the behaviour with <code>$state</code> so it runs everywhere,
  but the shape of the code is what you'll write for real.
</section>

<div class="controls">
  <label>Select user:</label>
  {#each [1, 2, 3, 4, 5] as id (id)}
    <button
      class:active={currentUserId === id}
      onclick={() => currentUserId = id}
    >
      User {id}
    </button>
  {/each}
</div>

<!-- This strip is what $effect.pending() at the root would power -->
{#if anyPending}
  <div class="pending-strip" role="status" aria-live="polite">
    <div class="bar"></div>
    <span>Loading...</span>
  </div>
{/if}

<div class="layout">
  <!-- Profile card -->
  <section class="profile">
    <h2>Profile</h2>
    {#if userLoading}
      <div class="skel">
        <div class="skel-avatar"></div>
        <div class="skel-lines">
          <div class="skel-line wide"></div>
          <div class="skel-line med"></div>
          <div class="skel-line small"></div>
        </div>
      </div>
    {:else if user}
      <div class="user-card">
        <div class="avatar" style="background: {user.avatar}">
          {user.name[0]}
        </div>
        <div>
          <h3>{user.name}</h3>
          <p>{user.title}</p>
          <div class="stats">
            <span><strong>{user.stats.followers}</strong> followers</span>
            <span><strong>{user.stats.following}</strong> following</span>
            <span><strong>{user.stats.posts}</strong> posts</span>
          </div>
        </div>
      </div>
    {/if}
  </section>

  <!-- Posts -->
  <section class="posts">
    <h2>Recent posts</h2>
    {#if postsLoading}
      {#each Array(4) as _, i (i)}
        <div class="skel-post">
          <div class="skel-line wide"></div>
          <div class="skel-line wide"></div>
          <div class="skel-line med"></div>
        </div>
      {/each}
    {:else}
      {#each posts as post (post.id)}
        <article class="post">
          <h4>{post.title}</h4>
          <p>{post.excerpt}</p>
          <span class="date">{post.date}</span>
        </article>
      {/each}
    {/if}
  </section>

  <!-- Feed (load on demand) -->
  <section class="feed">
    <h2>Activity feed</h2>
    <button onclick={loadFeed} disabled={feedLoading}>
      {feedLoading ? 'Loading feed...' : 'Refresh feed'}
    </button>
    {#if feed.length > 0 && !feedLoading}
      <ul>
        {#each feed as item (item.id)}
          <li>{item.text}</li>
        {/each}
      </ul>
    {:else if !feedLoading}
      <p class="empty">No feed loaded yet.</p>
    {/if}
  </section>
</div>

<section class="code-example">
  <h3>What the real code looks like</h3>
  <pre><code>&lt;script lang="ts"&gt;
  let &#123; userId &#125;: &#123; userId: number &#125; = $props();

  // Top-level await — Svelte tracks the pending state for you.
  const user  = await fetchUser(userId);
  const posts = await fetchPosts(user.id);
&lt;/script&gt;

&lt;h1&gt;&#123;user.name&#125;&lt;/h1&gt;
&#123;#each posts as post&#125;
  &lt;Post &#123;post&#125; /&gt;
&#123;/each&#125;

&lt;!-- In a parent: --&gt;
&#123;#if $effect.pending()&#125;
  &lt;Spinner /&gt;
&#123;/if&#125;</code></pre>
</section>

<section class="code-example">
  <h3>settled(), boundaries &amp; hydratable() — the rest of the toolkit</h3>
  <pre><code>{\`// 1. Where await can appear
const user = await fetchUser(id);          // script top level
let posts = \$derived(await fetchPosts(user.id)); // inside \$derived
// …and {await one(x)} directly in markup. Independent markup
// awaits run in PARALLEL; serial \$deriveds that could be
// independent trigger an await_waterfall warning.

// 2. First-load placeholder: boundary pending snippet
// <svelte:boundary>
//   <Profile />
//   {#snippet pending()}<Skeleton />{/snippet}
// </svelte:boundary>
// Later updates: {#if \$effect.pending()} <Spinner /> {/if}

// 3. settled() — await the update itself
import { tick, settled } from 'svelte';

async function onclick() {
  updating = true;
  await tick();      // flush 'updating' before the big change
  filter = 'all';    // triggers async deriveds
  await settled();   // resolves when async UI work is applied
  updating = false;
}

// 4. hydratable() — don't refetch on hydration
import { hydratable } from 'svelte';

// SSR: runs fn, serializes result into <head>.
// Hydration: returns the serialized value instead of re-running.
// After hydration: calls fn normally again.
const user = await hydratable('app:user', () => getUser());
const rand = hydratable('app:seed', () => Math.random()); // SSR-stable

// Values are serialized with devalue: Map, Set, URL, BigInt and
// even promises survive. Using CSP? Pass a nonce/hash to render().\`}</code></pre>
</section>

<style>
  h1 { color: #2d3436; }
  .callout {
    padding: 0.75rem 0.9rem; background: #fff8e1;
    border-left: 3px solid #fdcb6e; border-radius: 6px;
    font-size: 0.88rem; color: #7c5a00; margin-bottom: 1rem;
  }
  .callout code { background: #fef3c7; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .controls { display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; }
  .controls label { font-size: 0.88rem; color: #636e72; margin-right: 0.3rem; }
  .controls button {
    padding: 0.35rem 0.75rem; border: 1px solid #dfe6e9;
    background: white; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
  }
  .controls button.active { background: #0984e3; color: white; border-color: #0984e3; }

  .pending-strip {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.4rem 0.75rem; background: #0984e3; color: white;
    border-radius: 6px; font-size: 0.82rem; margin-bottom: 1rem;
  }
  .bar {
    flex: 1; height: 3px; background: rgba(255,255,255,0.3); border-radius: 2px; overflow: hidden; position: relative;
  }
  .bar::after {
    content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 30%;
    background: white; border-radius: 2px; animation: slide 1.2s infinite ease-in-out;
  }
  @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }

  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .feed { grid-column: 1 / -1; }
  section {
    padding: 1rem; background: #f8f9fa; border-radius: 10px; border: 1px solid #dfe6e9;
  }
  section h2 { margin: 0 0 0.5rem; color: #0984e3; font-size: 1rem; }

  .user-card { display: flex; gap: 0.75rem; align-items: center; }
  .avatar {
    width: 56px; height: 56px; border-radius: 50%; color: white;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; font-weight: 800;
  }
  .user-card h3 { margin: 0; font-size: 1rem; }
  .user-card p { margin: 0.15rem 0; color: #636e72; font-size: 0.85rem; }
  .stats { display: flex; gap: 0.75rem; font-size: 0.78rem; color: #636e72; margin-top: 0.25rem; }
  .stats strong { color: #2d3436; }

  .post {
    padding: 0.6rem 0.75rem; background: white; border: 1px solid #dfe6e9;
    border-radius: 6px; margin-bottom: 0.5rem;
  }
  .post h4 { margin: 0 0 0.25rem; font-size: 0.9rem; }
  .post p { margin: 0; color: #636e72; font-size: 0.82rem; }
  .date { font-size: 0.72rem; color: #b2bec3; }

  .feed button {
    padding: 0.4rem 0.9rem; border: none; border-radius: 4px;
    background: #0984e3; color: white; cursor: pointer; font-weight: 600; font-size: 0.85rem;
  }
  .feed button:disabled { background: #b2bec3; cursor: not-allowed; }
  .feed ul { list-style: none; padding: 0; margin: 0.5rem 0 0; }
  .feed li {
    padding: 0.4rem 0.6rem; background: white; border-radius: 4px;
    margin-bottom: 0.25rem; font-size: 0.85rem;
  }
  .empty { color: #b2bec3; font-size: 0.82rem; }

  /* Skeleton loaders */
  .skel { display: flex; gap: 0.75rem; align-items: center; }
  .skel-avatar {
    width: 56px; height: 56px; border-radius: 50%; background: #dfe6e9;
    animation: pulse 1.5s infinite;
  }
  .skel-lines { flex: 1; }
  .skel-line {
    height: 10px; background: #dfe6e9; border-radius: 4px;
    margin-bottom: 0.4rem; animation: pulse 1.5s infinite;
  }
  .skel-line.wide { width: 80%; }
  .skel-line.med { width: 60%; }
  .skel-line.small { width: 40%; }
  .skel-post { padding: 0.5rem 0; border-bottom: 1px solid #eee; }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

  .code-example {
    margin-top: 1.5rem; background: #2d3436; color: #dfe6e9; border: none;
  }
  .code-example h3 { margin: 0 0 0.5rem; color: #74b9ff; font-size: 0.95rem; }
  .code-example pre { margin: 0; }
  .code-example code { font-size: 0.78rem; line-height: 1.5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
