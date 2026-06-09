import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-8',
		title: 'Universal vs Server: The Decision',
		phase: 4,
		module: 12,
		lessonIndex: 8
	},
	description: `You've seen both +page.ts (universal) and +page.server.ts (server-only). Now comes the real question: which should you reach for?

Universal load runs on both sides — on the server for SSR and then in the browser on client-side navigation. It's great for public data fetched from public APIs where you don't want a round trip through your own server. Server load runs exclusively on the server — it's the right choice whenever you need secrets, a database, cookies, or any server-only resource.

Get this wrong and you either leak secrets to the browser or force an extra hop through your own server for no reason. This lesson gives you a decision tree, a side-by-side comparison, and six realistic scenarios with the right answer for each.

**The third option — remote functions.** Since SvelteKit 2.27 the decision is no longer binary. A \`query()\` exported from a \`.remote.ts\` file *runs* on the server (so it can safely touch the database, cookies via \`getRequestEvent()\`, and private env vars — everything a server load can) but can be *called* from any component, not just a route. Arguments are validated with a Standard Schema (Zod 4 / Valibot), identical calls are deduplicated automatically, and \`form\`/\`command\` mutations can refresh queries in a single flight. The modern rule of thumb: **route-level \`load\` when the data defines the page** (SEO-critical content, redirects before render); **\`query()\` when the data belongs to a component** — widgets shared across pages, paginated lists, anything refreshed after mutations. The decision tree, capability matrix, and quiz below treat all three as peers; Module 17 Lesson 3 covers the full remote-functions API.`,
	objectives: [
		'State the fundamental rule that picks between +page.ts and +page.server.ts',
		'Recite the capability matrix for both load types and remote query()',
		'Position remote functions (query from $app/server) as a first-class third option',
		'Choose the right data-loading tool for 6 realistic scenarios',
		'Explain the performance and security implications of each choice',
		'Know when to use BOTH (+page.ts AND +page.server.ts) on the same route',
		'Know when component-scoped data calls for query() in a .remote.ts file instead of load'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // THE TWO-SENTENCE RULE
  //
  //   For data that DEFINES a route: use +page.server.ts whenever
  //   the load needs server-only resources (DB, secrets, cookies,
  //   server-only APIs); otherwise +page.ts.
  //
  //   For data that belongs to a COMPONENT (shared widgets,
  //   mutation-refreshed lists): use query() in a .remote.ts file.
  //
  // Everything below is elaboration.
  // ---------------------------------------------------------------

  type Choice = 'universal' | 'server' | 'both' | 'remote';

  interface Scenario {
    id: number;
    title: string;
    body: string;
    answer: Choice;
    explanation: string;
  }

  const labels: Record<Choice, string> = {
    universal: '+page.ts',
    server: '+page.server.ts',
    both: 'Both',
    remote: 'remote query()'
  };

  const scenarios: Scenario[] = [
    {
      id: 1,
      title: 'Public blog post from a public CMS',
      body: 'You fetch https://cms.example.com/api/posts/hello — no auth, no secrets, anyone can GET it.',
      answer: 'universal',
      explanation:
        '+page.ts is ideal. On client-side navigation, the browser hits the CMS directly — no hop through your server. During SSR it still works. No secrets, no cookies, no DB.'
    },
    {
      id: 2,
      title: 'User profile keyed on session cookie',
      body: 'You need to look up the logged-in user from their session cookie and fetch their profile from your database.',
      answer: 'server',
      explanation:
        '+page.server.ts only. You need cookies.get(), you need the DB client, and you definitely do not want the DB query running from the browser. This is the textbook case for server load.'
    },
    {
      id: 3,
      title: 'Third-party API that requires a secret key',
      body: 'You call https://api.weather.com/v1/forecast with an API key that must stay private.',
      answer: 'server',
      explanation:
        '+page.server.ts. Import the key from $env/static/private. A universal load would leak the key to the browser bundle — a catastrophic mistake.'
    },
    {
      id: 4,
      title: 'Product listing with typing refinement on the client',
      body: 'You fetch /api/products (your own public endpoint). You want SSR for SEO, but also instant client-side filtering via search params.',
      answer: 'universal',
      explanation:
        '+page.ts. Your own API route is a public fetch; universal load is perfect so client-side navigations go straight to the API without bouncing off the SSR server. Use url.searchParams inside load to react to the filters.'
    },
    {
      id: 5,
      title: 'Layout data (current user) + per-page public data',
      body: 'Your +layout.server.ts loads the current user from a cookie. Your +page.ts loads public posts that the layout reads from parent().',
      answer: 'both',
      explanation:
        "Both. +layout.server.ts handles auth and cookies. +page.ts handles the public posts and can call await parent() to read the user. This is a very common SvelteKit pattern — don't collapse both into one server load unless you need to."
    },
    {
      id: 6,
      title: 'Notifications bell shown in the header of every page',
      body: 'A bell icon in the layout needs the unread count from your database, a dropdown three levels deep needs the same data, and the count must refresh the moment the user clicks "mark all read".',
      answer: 'remote',
      explanation:
        'query() in notifications.remote.ts. It runs on the server (DB access stays private), can be awaited from ANY component with zero prop drilling or route plumbing, deduplicates the bell and the dropdown into one request, and the mark-all-read form()/command() can refresh it in a single flight. Wiring this through every +layout.server.ts would couple unrelated routes to one widget.'
    }
  ];

  let revealed: Record<number, boolean> = $state({});
  let guess: Record<number, Choice | undefined> = $state({});

  function pick(id: number, choice: Choice): void {
    guess[id] = choice;
    revealed[id] = true;
  }

  function scoreClass(s: Scenario): string {
    if (!revealed[s.id]) return '';
    return guess[s.id] === s.answer ? 'correct' : 'wrong';
  }
</script>

<main>
  <h1>Universal vs Server: The Decision</h1>

  <section class="rule">
    <h2>The Rule in Two Sentences</h2>
    <p class="big-rule">
      For data that <em>defines a route</em>: use <code>+page.server.ts</code> whenever the
      load needs server-only resources (DB, secrets, private APIs, cookies); otherwise
      <code>+page.ts</code>. For data that <em>belongs to a component</em> — shared widgets,
      mutation-refreshed lists — use <code>query()</code> in a <code>.remote.ts</code> file.
    </p>
  </section>

  <section>
    <h2>Capability Matrix</h2>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>+page.ts (universal)</th>
          <th>+page.server.ts</th>
          <th>query() (remote)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Runs on server (SSR)</td><td>yes</td><td>yes</td><td>yes — always runs on the server</td></tr>
        <tr><td>Runs in browser (CSR nav)</td><td>yes</td><td>no — fetches JSON from server</td><td>no — typed fetch wrapper to a generated endpoint</td></tr>
        <tr><td>Access params, url, fetch</td><td>yes</td><td>yes</td><td>takes validated arguments instead (Standard Schema)</td></tr>
        <tr><td>Access cookies</td><td>no</td><td>yes</td><td>yes — via getRequestEvent()</td></tr>
        <tr><td>Access $env/static/private</td><td>no</td><td>yes</td><td>yes</td></tr>
        <tr><td>Access database directly</td><td>no</td><td>yes</td><td>yes</td></tr>
        <tr><td>Access locals (from hooks)</td><td>no</td><td>yes</td><td>yes — via getRequestEvent()</td></tr>
        <tr><td>Return non-serializable values</td><td>yes (functions, classes)</td><td>no — devalue-serializable only</td><td>no — devalue-serializable only</td></tr>
        <tr><td>Callable from</td><td>its route only</td><td>its route only</td><td>any component, anywhere</td></tr>
        <tr><td>Re-runs on navigation</td><td>yes (tracked deps)</td><td>yes (tracked deps)</td><td>no — refresh() / single-flight mutations</td></tr>
        <tr><td>Deduplication</td><td>per navigation</td><td>per navigation</td><td>automatic, by argument cache key</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Decision Tree</h2>
    <pre>{\`Is the data tied to ONE route — does it define the page
(SEO content, redirects/errors before render)?
│
├── YES → route-level load
│     │
│     ├── cookies / sessions / locals?  ──► +page.server.ts
│     ├── a database / $lib/server/*?   ──► +page.server.ts
│     ├── private env vars / secrets?   ──► +page.server.ts
│     ├── files on disk / the OS?       ──► +page.server.ts
│     │
│     └── none of the above?
│           ├── non-serializable return values
│           │   (functions, class instances)? ──► +page.ts
│           └── public third-party API the browser
│               should hit directly on CSR nav? ──► +page.ts
│               (otherwise either works — default to +page.ts)
│
└── NO → the data belongs to a COMPONENT
      (shared widgets, paginated lists, search-as-you-type,
       anything refreshed after a mutation)
                                        ──► query() in a .remote.ts file
      validate arguments with a Standard Schema (Zod 4 / Valibot);
      pair with form() / command() for single-flight mutations\`}</pre>
  </section>

  <section>
    <h2>The Third Option: query() (Remote Functions)</h2>
    <p>
      A remote <code>query</code> is the modern path for component-scoped data: it always
      runs on the server, is callable from anywhere, validates its arguments, and dedupes
      identical calls automatically.
    </p>
    <pre>{\`// src/lib/data/notifications.remote.ts
import * as v from 'valibot';
import { query } from '$app/server';
import { getRequestEvent } from '$app/server';
import * as db from '$lib/server/database';

export const getUnreadCount = query(async () => {
  const { locals } = getRequestEvent();   // cookies/locals — like a server load
  return db.unreadCount(locals.user.id);
});

export const getPosts = query(
  v.object({ page: v.number() }),          // Standard Schema validation
  async ({ page }) => db.posts(page)
);\`}</pre>
    <pre>{\`<!-- any component, at any depth — no route plumbing -->
<script lang="ts">
  import { getUnreadCount } from '$lib/data/notifications.remote';
</\${''}script>

<svelte:boundary>
  <span class="badge">{await getUnreadCount()}</span>
  {#snippet pending()}<span class="badge">…</span>{/snippet}
</svelte:boundary>\`}</pre>
    <div class="answer">
      <strong>Opt-in:</strong> remote functions require
      <code>kit.experimental.remoteFunctions: true</code> and
      <code>compilerOptions.experimental.async: true</code> in svelte.config.js.
      Full API — query.batch, query.live, form, command, prerender — in Module 17 Lesson 3.
    </div>
  </section>

  <section>
    <h2>Can I Use Both?</h2>
    <p>
      Yes — and it's common. On the same route you can have <code>+page.server.ts</code>
      <em>and</em> <code>+page.ts</code>. The server load runs first; the universal load
      receives its output via <code>await parent()</code> (or the merged data prop).
    </p>
    <pre>{\`// src/routes/dashboard/+page.server.ts
export const load = async ({ locals }) => {
  return { user: locals.user };
};

// src/routes/dashboard/+page.ts
export const load = async ({ data, fetch }) => {
  // 'data' is whatever the server load returned
  const posts = await fetch('/api/posts/public').then(r => r.json());
  return { ...data, posts };   // merge them
};

// The page sees { user, posts }\`}</pre>
  </section>

  <section>
    <h2>Quiz: Pick the Right Load</h2>
    {#each scenarios as s (s.id)}
      <div class="scenario {scoreClass(s)}">
        <h3>#{s.id}. {s.title}</h3>
        <p>{s.body}</p>
        <div class="choices">
          <button onclick={() => pick(s.id, 'universal')} disabled={revealed[s.id]}>
            +page.ts
          </button>
          <button onclick={() => pick(s.id, 'server')} disabled={revealed[s.id]}>
            +page.server.ts
          </button>
          <button onclick={() => pick(s.id, 'both')} disabled={revealed[s.id]}>
            Both
          </button>
          <button onclick={() => pick(s.id, 'remote')} disabled={revealed[s.id]}>
            remote query()
          </button>
        </div>
        {#if revealed[s.id]}
          <div class="answer">
            <strong>
              {guess[s.id] === s.answer ? 'Correct!' : 'Actually:'}
            </strong>
            {labels[s.answer]}
            — {s.explanation}
          </div>
        {/if}
      </div>
    {/each}
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  section.rule { background: #fffdf5; border-color: #e0d080; }
  h2 { margin-top: 0; }
  .big-rule { font-size: 1rem; line-height: 1.5; margin: 0; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; white-space: pre; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; }
  .scenario { padding: 0.75rem 1rem; margin-bottom: 0.75rem; border: 1px solid #ddd; border-radius: 6px; background: #fafafa; }
  .scenario.correct { border-color: #4caf50; background: #e8f5e9; }
  .scenario.wrong { border-color: #f44336; background: #ffebee; }
  .scenario h3 { margin: 0 0 0.25rem; font-size: 1rem; }
  .scenario p { margin: 0.25rem 0; font-size: 0.9rem; }
  .choices { display: flex; gap: 0.5rem; margin: 0.5rem 0; flex-wrap: wrap; }
  .choices button { padding: 0.4rem 0.8rem; cursor: pointer; font-size: 0.85rem; }
  .choices button:disabled { cursor: default; opacity: 0.7; }
  .answer { margin-top: 0.5rem; padding: 0.5rem 0.75rem; background: rgba(255,255,255,0.7); border-radius: 4px; font-size: 0.85rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
