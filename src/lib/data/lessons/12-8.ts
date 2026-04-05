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

Get this wrong and you either leak secrets to the browser or force an extra hop through your own server for no reason. This lesson gives you a decision tree, a side-by-side comparison, and five realistic scenarios with the right answer for each.`,
	objectives: [
		'State the fundamental rule that picks between +page.ts and +page.server.ts',
		'Recite the capability matrix for both load types',
		'Choose the right load type for 5 realistic scenarios',
		'Explain the performance and security implications of each choice',
		'Know when to use BOTH (+page.ts AND +page.server.ts) on the same route'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // THE ONE-SENTENCE RULE
  //
  //   Use +page.server.ts whenever the load NEEDS server-only
  //   resources (DB, secrets, private files, cookies you want to
  //   mutate, server-only APIs). Otherwise, use +page.ts.
  //
  // That's it. Everything below is just elaboration.
  // ---------------------------------------------------------------

  interface Scenario {
    id: number;
    title: string;
    body: string;
    answer: 'universal' | 'server' | 'both';
    explanation: string;
  }

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
    }
  ];

  let revealed: Record<number, boolean> = $state({});
  let guess: Record<number, 'universal' | 'server' | 'both' | undefined> = $state({});

  function pick(id: number, choice: 'universal' | 'server' | 'both'): void {
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
    <h2>The Rule in One Sentence</h2>
    <p class="big-rule">
      Use <code>+page.server.ts</code> whenever the load needs server-only resources
      (DB, secrets, private APIs, cookies). Otherwise, use <code>+page.ts</code>.
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
        </tr>
      </thead>
      <tbody>
        <tr><td>Runs on server (SSR)</td><td>yes</td><td>yes</td></tr>
        <tr><td>Runs in browser (CSR nav)</td><td>yes</td><td>no — fetches JSON from server</td></tr>
        <tr><td>Access params, url, fetch</td><td>yes</td><td>yes</td></tr>
        <tr><td>Access cookies</td><td>no</td><td>yes</td></tr>
        <tr><td>Access $env/static/private</td><td>no</td><td>yes</td></tr>
        <tr><td>Access database directly</td><td>no</td><td>yes</td></tr>
        <tr><td>Access locals (from hooks)</td><td>no</td><td>yes</td></tr>
        <tr><td>Return non-serializable values</td><td>yes (functions, classes)</td><td>no — JSON-safe only</td></tr>
        <tr><td>Extra round trip on client nav</td><td>no — calls API directly</td><td>yes — one hop to server load</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Decision Tree</h2>
    <pre>{\`Does your load touch...
│
├── cookies / sessions / locals? ─────────────► +page.server.ts
├── a database / $lib/server/*?  ─────────────► +page.server.ts
├── private env vars / secrets?  ─────────────► +page.server.ts
├── files on disk / the OS?       ─────────────► +page.server.ts
│
└── none of the above?
      │
      ├── Does it need to return non-serializable values
      │   (functions, class instances, component ctors)?
      │                                    ──► +page.ts
      │
      └── Does it fetch a PUBLIC third-party API
          where you want the browser to call it directly
          on client-side navigations?
                                          ──► +page.ts
          (Otherwise either works — default to +page.ts.)\`}</pre>
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
        </div>
        {#if revealed[s.id]}
          <div class="answer">
            <strong>
              {guess[s.id] === s.answer ? 'Correct!' : 'Actually:'}
            </strong>
            {s.answer === 'universal' ? '+page.ts' : s.answer === 'server' ? '+page.server.ts' : 'Both'}
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
