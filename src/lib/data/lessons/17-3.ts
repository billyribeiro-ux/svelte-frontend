import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '17-3',
		title: '$app/server & Remote Functions',
		phase: 5,
		module: 17,
		lessonIndex: 3
	},
	description: `$app/server is a SvelteKit 2 module that exposes server-only helpers. As of SvelteKit 2.27, its most important exports are remote functions — query, query.batch, query.live, form, command, and prerender — which provide type-safe communication between client and server. Remote functions are defined in .remote.ts files, always run on the server, and are automatically transformed into fetch wrappers on the client. Combined with Svelte's experimental await expressions, they let you load and mutate data directly inside components, often replacing traditional load functions and form actions.

The module also exports three utility functions: getRequestEvent() returns the current RequestEvent inside an async context so you can build reusable server helpers (auth guards, audit loggers) without threading event through every function call; read() takes an asset imported with ?url and returns a Response containing its bytes for SSR/prerendering use cases; and requested() enables single-flight mutations by letting form/command handlers discover which client queries need refreshing.`,
	objectives: [
		'Understand what remote functions are and why they replace many load/action patterns',
		'Use query() for reading server data with automatic deduplication and caching',
		'Use query.batch to solve n+1 problems by grouping concurrent requests',
		'Use query.live for real-time streaming data from the server',
		'Use form() for type-safe form submissions with Standard Schema validation',
		'Build forms with fields, .as() bindings, issues(), and validate()',
		'Run client-side preflight schemas and programmatic invalid()/issue errors',
		'Create isolated form instances with .for(id) and multi-submit buttons with as("submit", value)',
		'Customize bad-input responses with the handleValidationError server hook',
		'Use command() for non-form server mutations called from event handlers',
		'Understand single-flight mutations — refresh/set in form/command handlers',
		'Use requested() for client-requested query refreshes inside mutations',
		'Know when to use remote functions vs traditional load functions + form actions',
		'Use getRequestEvent() to access the current RequestEvent from helper modules',
		'Read files with read(asset) where asset comes from ?url imports'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // $app/server & Remote Functions — Visual Walkthrough
  //
  // Remote functions (SvelteKit 2.27+) are the biggest addition
  // to $app/server. They are defined in .remote.ts files, always
  // run on the server, and are called from components via
  // auto-generated fetch wrappers.
  //
  // This lesson demonstrates the PATTERNS. In a real project you
  // would split code into .remote.ts files and .svelte components.
  // ============================================================

  // -- Simulated data for the interactive demo ------------------

  type Post = { id: number; title: string; slug: string };
  type Like = { itemId: string; count: number };

  let posts: Post[] = $state([
    { id: 1, title: 'Getting Started with SvelteKit', slug: 'getting-started' },
    { id: 2, title: 'Remote Functions Deep Dive', slug: 'remote-functions' },
    { id: 3, title: 'Single-Flight Mutations', slug: 'single-flight' }
  ]);

  let likes: Record<string, number> = $state({ '1': 5, '2': 12, '3': 3 });
  let nextId: number = $state(4);
  let queryCallCount: number = $state(0);

  // Simulated query — deduplicated (returns same ref for same args)
  const queryCache = new Map<string, Post[]>();
  function getPosts(): Post[] {
    const key = 'all';
    queryCallCount++;
    if (!queryCache.has(key)) {
      queryCache.set(key, [...posts]);
    }
    return queryCache.get(key)!;
  }

  function refreshPosts(): void {
    queryCache.clear();
    queryCallCount = 0;
  }

  // Simulated form state
  let formTitle: string = $state('');
  let formContent: string = $state('');
  let formErrors: { title?: string; content?: string } = $state({});
  let formResult: { success: boolean; slug: string } | null = $state(null);
  let formPending: boolean = $state(false);

  function validateForm(): boolean {
    formErrors = {};
    if (!formTitle.trim()) formErrors.title = 'Title is required';
    if (!formContent.trim()) formErrors.content = 'Content is required';
    return !formErrors.title && !formErrors.content;
  }

  async function submitForm(): Promise<void> {
    if (!validateForm()) return;
    formPending = true;
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));
    const slug = formTitle.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    posts = [...posts, { id: nextId++, title: formTitle, slug }];
    refreshPosts();
    formResult = { success: true, slug };
    formTitle = '';
    formContent = '';
    formPending = false;
    // Single-flight: getPosts was refreshed in the same "request"
  }

  // Simulated command
  let commandLog: string[] = $state([]);
  async function addLike(itemId: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    likes[itemId] = (likes[itemId] ?? 0) + 1;
    likes = { ...likes };
    commandLog = [\`+1 like for item \${itemId} (now \${likes[itemId]})\`, ...commandLog].slice(0, 5);
  }

  // -- getRequestEvent simulation (from the original lesson) ---

  type DemoEvent = {
    locals: { user: { id: string; email: string; role: 'admin' | 'user' } | null };
    cookies: { session?: string };
    url: string;
  };

  type CallLog = { id: number; helper: string; result: string; ok: boolean };

  let eventLogs: CallLog[] = $state([]);
  let eventLogId: number = $state(0);
  let scenario: 'anon' | 'user' | 'admin' = $state('user');

  const scenarios: Record<typeof scenario, DemoEvent> = {
    anon: { locals: { user: null }, cookies: {}, url: '/dashboard' },
    user: {
      locals: { user: { id: 'u42', email: 'alice@example.com', role: 'user' } },
      cookies: { session: 'sess_abc' }, url: '/dashboard'
    },
    admin: {
      locals: { user: { id: 'u1', email: 'root@example.com', role: 'admin' } },
      cookies: { session: 'sess_root' }, url: '/admin/users'
    }
  };

  let currentEvent: DemoEvent | null = null;
  function getRequestEvent(): DemoEvent {
    if (!currentEvent) throw new Error('Called outside a request');
    return currentEvent;
  }

  function requireUser(): NonNullable<DemoEvent['locals']['user']> {
    const event = getRequestEvent();
    if (!event.locals.user) throw new Error('401 Unauthorized');
    return event.locals.user;
  }

  function runIn(name: string, fn: () => string): void {
    currentEvent = scenarios[scenario];
    try {
      const result = fn();
      eventLogs = [{ id: eventLogId++, helper: name, result, ok: true }, ...eventLogs].slice(0, 6);
    } catch (e) {
      eventLogs = [{ id: eventLogId++, helper: name, result: (e as Error).message, ok: false }, ...eventLogs].slice(0, 6);
    } finally {
      currentEvent = null;
    }
  }

  // -- read() simulation ---------------------------------------
  const fakeAssets: Record<string, { type: string; size: number; preview: string }> = {
    '/fonts/Inter.woff2': { type: 'font/woff2', size: 84200, preview: '(binary font data)' },
    '/data/cities.json': { type: 'application/json', size: 2100, preview: '[{"name":"Tokyo","pop":37.4},...]' },
    '/images/logo.svg': { type: 'image/svg+xml', size: 540, preview: '<svg viewBox="0 0 32 32">...</svg>' }
  };
  let selectedAsset: string = $state('/data/cities.json');
  let readResult: { type: string; size: number; preview: string } | null = $state(null);
  function callRead(): void {
    readResult = fakeAssets[selectedAsset] ?? null;
  }

  // -- Active tab control -------------------------------------
  let activeTab: 'remote' | 'event' | 'read' = $state('remote');
</script>

<h1>$app/server &amp; Remote Functions</h1>

<p class="intro">
  SvelteKit 2.27 introduced <strong>remote functions</strong> — the most significant
  addition to <code>$app/server</code>. They provide type-safe client-server
  communication via <code>.remote.ts</code> files, often replacing load functions
  and form actions entirely.
</p>

<!-- Tab navigation -->
<nav class="tabs">
  <button class:active={activeTab === 'remote'} onclick={() => (activeTab = 'remote')}>
    Remote Functions
  </button>
  <button class:active={activeTab === 'event'} onclick={() => (activeTab = 'event')}>
    getRequestEvent
  </button>
  <button class:active={activeTab === 'read'} onclick={() => (activeTab = 'read')}>
    read()
  </button>
</nav>

<!-- ==================== TAB 1: Remote Functions ==================== -->
{#if activeTab === 'remote'}

<section>
  <h2>Step 0: Enable Remote Functions</h2>
  <pre class="code"><code>{\`// svelte.config.js
const config = {
  kit: {
    experimental: {
      remoteFunctions: true   // enable .remote.ts endpoints
    }
  },
  compilerOptions: {
    experimental: {
      async: true              // enable {#each await ...} syntax
    }
  }
};
export default config;\`}</code></pre>
</section>

<section>
  <h2>1. query() — Read Server Data</h2>
  <p class="note">
    <code>query()</code> creates a server function that reads data. It deduplicates
    identical calls (same args = same cache entry), and the result works as a
    <code>Promise</code> you can <code>await</code> directly in templates.
  </p>

  <pre class="code"><code>{\`// src/routes/blog/data.remote.ts
import { query } from '$app/server';
import * as db from '$lib/server/database';
import * as v from 'valibot';

// No argument — returns all posts
export const getPosts = query(async () => {
  return await db.sql\\\`SELECT title, slug FROM post ORDER BY published_at DESC\\\`;
});

// With validated argument — returns one post
export const getPost = query(v.string(), async (slug) => {
  const [post] = await db.sql\\\`SELECT * FROM post WHERE slug = \\\${slug}\\\`;
  if (!post) error(404, 'Not found');
  return post;
});\`}</code></pre>

  <pre class="code"><code>{\`<!-- src/routes/blog/+page.svelte -->
<script>
  import { getPosts } from './data.remote';
</script>

<!-- Svelte awaits the query inline! -->
{#each await getPosts() as { title, slug }}
  <a href="/blog/{slug}">{title}</a>
{/each}\`}</code></pre>

  <h3>Interactive Demo: Deduplication</h3>
  <p class="note">
    Call <code>getPosts()</code> multiple times — the query count stays at 1
    because identical calls are deduplicated. Hit "Refresh" to clear the cache.
  </p>

  <div class="demo-row">
    <button class="btn" onclick={() => getPosts()}>getPosts()</button>
    <button class="btn" onclick={() => getPosts()}>getPosts() again</button>
    <button class="btn outline" onclick={refreshPosts}>Refresh Cache</button>
    <span class="badge">Server calls: {queryCallCount}</span>
  </div>

  <div class="post-list">
    {#each getPosts() as post (post.id)}
      <div class="post-card">
        <strong>{post.title}</strong>
        <code>/blog/{post.slug}</code>
      </div>
    {/each}
  </div>
</section>

<section>
  <h2>2. form() — Type-Safe Form Submissions</h2>
  <p class="note">
    <code>form()</code> creates an object you spread onto a <code>&lt;form&gt;</code>.
    It uses <a href="https://standardschema.dev">Standard Schema</a> validation (Valibot/Zod),
    provides <code>fields.*.as()</code> bindings, <code>issues()</code> for errors,
    and works without JS via progressive enhancement.
  </p>

  <pre class="code"><code>{\`// data.remote.ts
import { form } from '$app/server';
import * as v from 'valibot';

export const createPost = form(
  v.object({
    title: v.pipe(v.string(), v.nonEmpty()),
    content: v.pipe(v.string(), v.nonEmpty())
  }),
  async ({ title, content }) => {
    const slug = title.toLowerCase().replace(/ /g, '-');
    await db.sql\\\`INSERT INTO post (slug, title, content) VALUES (...)\\\`;

    // Single-flight: refresh getPosts in the SAME response
    void getPosts().refresh();

    redirect(303, \\\`/blog/\\\${slug}\\\`);
  }
);\`}</code></pre>

  <pre class="code"><code>{\`<!-- +page.svelte -->
<form {...createPost}>
  <input {...createPost.fields.title.as('text')} />
  {#each createPost.fields.title.issues() as issue}
    <p class="error">{issue.message}</p>
  {/each}

  <textarea {...createPost.fields.content.as('text')}></textarea>
  {#each createPost.fields.content.issues() as issue}
    <p class="error">{issue.message}</p>
  {/each}

  <button>Publish!</button>
</form>

{#if createPost.result?.success}
  <p>Published!</p>
{/if}\`}</code></pre>

  <h3>Interactive Demo: Form with Validation</h3>

  <form
    class="demo-form"
    onsubmit={(e) => { e.preventDefault(); submitForm(); }}
  >
    <label>
      <span>Title</span>
      <input
        type="text"
        bind:value={formTitle}
        oninput={validateForm}
        aria-invalid={!!formErrors.title}
        placeholder="My new blog post"
      />
      {#if formErrors.title}
        <p class="issue">{formErrors.title}</p>
      {/if}
    </label>

    <label>
      <span>Content</span>
      <textarea
        bind:value={formContent}
        oninput={validateForm}
        aria-invalid={!!formErrors.content}
        placeholder="Write something..."
        rows="3"
      ></textarea>
      {#if formErrors.content}
        <p class="issue">{formErrors.content}</p>
      {/if}
    </label>

    <button type="submit" disabled={formPending}>
      {formPending ? 'Publishing...' : 'Publish!'}
    </button>
  </form>

  {#if formResult}
    <div class="success-box">
      Published! Slug: <code>/blog/{formResult.slug}</code>
      — getPosts() was refreshed in the same flight.
    </div>
  {/if}
</section>

<section>
  <h2>2b. Form Fields — the Full API</h2>
  <p class="note">
    Beyond <code>as()</code> and <code>issues()</code>, fields support live
    validation, client-side preflight, programmatic server errors, isolated
    per-item instances, and multi-submit buttons.
  </p>

  <h3>validate(), value()/set() and preflight()</h3>
  <pre class="code"><code>{\`<!-- validate on every keystroke (untouched fields skipped) -->
<form {...createPost} oninput={() => createPost.validate()}>
  <!-- validate({ includeUntouched: true }) checks everything -->
</form>

<!-- live values: value() reflects the inputs as the user types -->
<div class="preview">
  <h2>{createPost.fields.title.value()}</h2>
</div>
<!-- and set() writes them: -->
// createPost.fields.set({ title: '...', content: '...' });
// createPost.fields.title.set('My new blog post');

<!-- preflight: client-side schema blocks bad submits entirely.
     The schema cannot be exported from a .remote.ts file — keep it
     in a shared module or <script module>. -->
<form {...createPost.preflight(schema)}>
  <!-- all issues, not just one field's: -->
  {#each createPost.fields.allIssues() as issue}
    <p>{issue.message}</p>
  {/each}
</form>\`}</code></pre>

  <h3>invalid() + issue — server-side programmatic validation</h3>
  <pre class="code"><code>{\`// data.remote.ts — some things only the server can know
import { invalid } from '@sveltejs/kit';
import { form } from '$app/server';
import * as v from 'valibot';

export const buyHotcakes = form(
  v.object({ qty: v.pipe(v.number(), v.minValue(1)) }),
  async (data, issue) => {
    try {
      await db.buy(data.qty);
    } catch (e) {
      if (e.code === 'OUT_OF_STOCK') {
        // throws, like redirect()/error(). Plain strings become
        // form-level issues (visible via fields.allIssues());
        // issue.qty(...) targets the qty field, fully type-safe.
        invalid(issue.qty('we do not have enough hotcakes'));
      }
    }
  }
);\`}</code></pre>

  <h3>.for(id) — isolated instances in a list</h3>
  <pre class="code"><code>{\`{#each await getTodos() as todo}
  {@const modify = modifyTodo.for(todo.id)}
  <form {...modify}>
    <!-- second .as() arg renders existing data into the input -->
    <input {...modify.fields.description.as('text', todo.description)} />
    <button disabled={!!modify.pending}>save changes</button>
  </form>
{/each}\`}</code></pre>

  <h3>Multiple submit buttons</h3>
  <pre class="code"><code>{\`// schema gets a field for the button value:
// action: v.picklist(['login', 'register'])
<form {...loginOrRegister}>
  <input {...loginOrRegister.fields.username.as('text')} />
  <!-- leading underscore = never sent back in value() repopulation -->
  <input {...loginOrRegister.fields._password.as('password')} />

  <button {...loginOrRegister.fields.action.as('submit', 'login')}>login</button>
  <button {...loginOrRegister.fields.action.as('submit', 'register')}>register</button>
</form>
// handler: async ({ username, _password, action }) => {
//   if (action === 'login') { ... } else { ... }
// }\`}</code></pre>
</section>

<section>
  <h2>3. command() — Non-Form Mutations</h2>
  <p class="note">
    <code>command()</code> is for mutations that are not tied to a
    <code>&lt;form&gt;</code> — e.g., "like" buttons, delete actions, toggles.
    Unlike <code>form()</code>, it does not progressively enhance.
  </p>

  <pre class="code"><code>{\`// likes.remote.ts
import { query, command } from '$app/server';
import * as v from 'valibot';

export const getLikes = query(v.string(), async (id) => {
  const [row] = await db.sql\\\`SELECT likes FROM item WHERE id = \\\${id}\\\`;
  return row.likes;
});

export const addLike = command(v.string(), async (id) => {
  await db.sql\\\`UPDATE item SET likes = likes + 1 WHERE id = \\\${id}\\\`;
  // Single-flight: update getLikes in the same response
  getLikes(id).set((await db.sql\\\`SELECT likes FROM item WHERE id = \\\${id}\\\`)[0].likes);
});\`}</code></pre>

  <pre class="code"><code>{\`<!-- +page.svelte -->
<button onclick={async () => await addLike(item.id)}>
  Like ({await getLikes(item.id)})
</button>\`}</code></pre>

  <h3>Interactive Demo: Commands</h3>
  <div class="like-demo">
    {#each posts.slice(0, 3) as post (post.id)}
      <div class="like-row">
        <span>{post.title}</span>
        <button class="btn sm" onclick={() => addLike(String(post.id))}>
          Like ({likes[String(post.id)] ?? 0})
        </button>
      </div>
    {/each}
  </div>
  {#if commandLog.length > 0}
    <div class="cmd-log">
      {#each commandLog as entry}
        <div class="cmd-entry">{entry}</div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>4. Other Flavours</h2>

  <h3>query.batch — Solve N+1 Problems</h3>
  <pre class="code"><code>{\`// weather.remote.ts
export const getWeather = query.batch(v.string(), async (cityIds) => {
  // cityIds is an array of all concurrent calls' arguments
  const weather = await db.sql\\\`SELECT * FROM weather WHERE city_id = ANY(\\\${cityIds})\\\`;
  const lookup = new Map(weather.map(w => [w.city_id, w]));
  return (cityId) => lookup.get(cityId);  // resolver function
});\`}</code></pre>

  <h3>query.live — Real-Time Streaming</h3>
  <pre class="code"><code>{\`// time.remote.ts
export const getTime = query.live(async function* () {
  while (true) {
    yield new Date();
    await new Promise(f => setTimeout(f, 1000));
  }
});

// In template: <p>{await getTime()}</p>
// Exposes .connected and .reconnect() for connection management\`}</code></pre>

  <h3>prerender — Build-Time Static Data</h3>
  <pre class="code"><code>{\`// data.remote.ts
export const getPosts = prerender(async () => {
  return await db.sql\\\`SELECT title, slug FROM post\\\`;
});

// Data is fetched at build time and cached on CDN.
// Can be used on otherwise-dynamic pages for partial prerendering.\`}</code></pre>
</section>

<section>
  <h2>5. Single-Flight Mutations</h2>
  <p class="note">
    The key insight: when a form/command mutates data, it can <strong>refresh
    or set</strong> related queries in the same HTTP response — no second
    round-trip needed. The client receives updated query data alongside the
    mutation result.
  </p>

  <pre class="code"><code>{\`// Server-driven refresh (server knows which queries to update):
export const createPost = form(schema, async (data) => {
  // ... insert into DB ...
  void getPosts().refresh();        // re-run getPosts on server, send result back
  redirect(303, \\\`/blog/\\\${slug}\\\`);
});

// Direct set (when you already have the new data):
export const updatePost = form(schema, async (post) => {
  const result = await api.update(post);
  getPost(post.id).set(result);     // update specific cache entry
});

// Client-requested refresh (client tells server which instances to update):
import { requested } from '$app/server';
export const createPost = form(schema, async (data) => {
  // ... insert ...
  for (const { query } of requested(getPosts, 10)) {
    void query.refresh();           // refresh each client-requested instance
  }
});\`}</code></pre>

  <pre class="code"><code>{\`<!-- Client-side: request specific query updates -->
<script>
  import { createPost, getPosts } from './data.remote';
</script>

<form {...createPost.enhance(async (form) => {
  // .updates() sends query refresh requests with the mutation
  await form.submit().updates(
    getPosts,                                          // all instances
    getPosts({ filter: 'mine' }).withOverride(         // optimistic update
      (posts) => [newPost, ...posts]
    )
  );
})}>
  ...
</form>\`}</code></pre>
</section>

<section>
  <h2>When to Use What?</h2>
  <div class="comparison">
    <div class="comp-row header">
      <span>Pattern</span><span>Use When</span>
    </div>
    <div class="comp-row">
      <code>query()</code>
      <span>Reading dynamic data in components — replaces most <code>+page.server.ts load</code></span>
    </div>
    <div class="comp-row">
      <code>form()</code>
      <span>Form submissions with validation — replaces <code>+page.server.ts actions</code></span>
    </div>
    <div class="comp-row">
      <code>command()</code>
      <span>Non-form mutations (likes, deletes, toggles) — replaces fetch to <code>+server.ts</code></span>
    </div>
    <div class="comp-row">
      <code>query.live()</code>
      <span>Real-time data (notifications, prices, chat) — replaces custom SSE/WS</span>
    </div>
    <div class="comp-row">
      <code>prerender()</code>
      <span>Static data that changes only per deploy — replaces prerendered load functions</span>
    </div>
    <div class="comp-row">
      <code>load + actions</code>
      <span>URL-dependent data, complex layouts, data that must block navigation</span>
    </div>
  </div>
</section>

<!-- ==================== TAB 2: getRequestEvent ==================== -->
{:else if activeTab === 'event'}

<section>
  <h2>getRequestEvent() — Ambient Access from Helpers</h2>
  <p class="note">
    <code>getRequestEvent()</code> returns the current <code>RequestEvent</code> from
    async context. Build reusable server utilities without threading
    <code>event</code> through every call. Works inside <code>query</code>,
    <code>form</code>, <code>command</code>, load functions, and endpoints.
  </p>

  <pre class="code"><code>{\`// src/lib/server/auth.ts
import { getRequestEvent } from '$app/server';
import { error, redirect } from '@sveltejs/kit';

export function requireUser() {
  const { locals, url } = getRequestEvent();
  if (!locals.user) redirect(303, \\\`/login?redirect=\\\${url.pathname}\\\`);
  return locals.user;
}

// Can also be used inside remote functions:
// user.remote.ts
import { getRequestEvent, query } from '$app/server';
export const getProfile = query(async () => {
  const { cookies } = getRequestEvent();
  return await findUser(cookies.get('session_id'));
});\`}</code></pre>

  <div class="scenario">
    {#each Object.keys(scenarios) as s (s)}
      <button
        class:active={scenario === s}
        onclick={() => (scenario = s as typeof scenario)}
      >
        {s}
      </button>
    {/each}
  </div>

  <div class="event-box">
    <strong>Active event</strong>
    <pre>{JSON.stringify(scenarios[scenario], null, 2)}</pre>
  </div>

  <div class="helpers">
    <button onclick={() => runIn('getRequestEvent()', () => {
      const e = getRequestEvent();
      return \`\${e.url} — user=\${e.locals.user?.email ?? 'none'}\`;
    })}>getRequestEvent()</button>
    <button onclick={() => runIn('requireUser()', () => {
      const user = requireUser();
      return \`OK — \${user.email}\`;
    })}>requireUser()</button>
  </div>

  {#if eventLogs.length > 0}
    <div class="log">
      {#each eventLogs as entry (entry.id)}
        <div class="log-entry" class:ok={entry.ok} class:fail={!entry.ok}>
          <code>{entry.helper}</code>
          <span>{entry.result}</span>
        </div>
      {/each}
    </div>
  {/if}
</section>

<!-- ==================== TAB 3: read() ==================== -->
{:else}

<section>
  <h2>read() — Load Static Assets on the Server</h2>
  <p class="note">
    <code>read(asset)</code> takes a URL imported with <code>?url</code> and
    returns a <code>Response</code> with its bytes. Works during SSR,
    prerendering, and in deployed environments.
  </p>

  <pre class="code"><code>{\`// src/routes/og/[slug]/+server.ts
import { read } from '$app/server';
import template from '$lib/og-template.png?url';

export const GET = async ({ params }) => {
  const bg = await read(template).arrayBuffer();
  const png = await renderOgImage(bg, params.slug);
  return new Response(png, {
    headers: { 'content-type': 'image/png' }
  });
};\`}</code></pre>

  <div class="asset-picker">
    {#each Object.keys(fakeAssets) as path (path)}
      <button
        class:active={selectedAsset === path}
        onclick={() => (selectedAsset = path)}
      >
        {path.split('/').pop()}
      </button>
    {/each}
    <button class="primary" onclick={callRead}>read(asset)</button>
  </div>

  {#if readResult}
    <div class="asset-result">
      <div class="row"><span>Content-Type:</span> <code>{readResult.type}</code></div>
      <div class="row"><span>Size:</span> <code>{readResult.size.toLocaleString()} bytes</code></div>
      <div class="row"><span>Preview:</span></div>
      <pre class="preview">{readResult.preview}</pre>
    </div>
  {/if}
</section>

{/if}

<style>
  h1 { color: #2d3436; margin-bottom: 0.25rem; }
  .intro { font-size: 0.9rem; color: #636e72; margin-bottom: 1rem; line-height: 1.5; }
  .intro code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }

  .tabs {
    display: flex; gap: 0; margin-bottom: 1rem;
    border-bottom: 2px solid #dfe6e9;
  }
  .tabs button {
    padding: 0.5rem 1rem; border: none; background: none;
    font-weight: 600; font-size: 0.85rem; color: #636e72;
    cursor: pointer; border-bottom: 2px solid transparent;
    margin-bottom: -2px; transition: all 0.15s;
  }
  .tabs button.active {
    color: #00b894; border-bottom-color: #00b894;
  }

  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #00b894; font-size: 1.05rem; }
  h3 { color: #2d3436; font-size: 0.95rem; margin: 1rem 0 0.5rem; }
  .note { font-size: 0.85rem; color: #636e72; margin: 0 0 0.75rem; line-height: 1.45; }
  .note code, .note a { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  .note a { color: #0984e3; text-decoration: none; }

  .code {
    padding: 0.75rem; background: #2d3436; border-radius: 6px;
    overflow-x: auto; margin: 0.5rem 0;
  }
  .code code {
    color: #dfe6e9; font-size: 0.78rem; line-height: 1.5;
    font-family: 'Fira Code', 'Cascadia Code', monospace; white-space: pre;
  }

  .btn {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #0984e3; color: white; cursor: pointer;
    font-weight: 600; font-size: 0.85rem;
  }
  .btn.outline { background: transparent; border: 1px solid #0984e3; color: #0984e3; }
  .btn.sm { padding: 0.25rem 0.6rem; font-size: 0.8rem; }
  .badge {
    display: inline-flex; align-items: center; padding: 0.25rem 0.6rem;
    background: #dfe6e9; border-radius: 12px; font-size: 0.8rem;
    font-weight: 600; color: #2d3436;
  }

  .demo-row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin: 0.5rem 0; }

  .post-list { margin-top: 0.75rem; }
  .post-card {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.5rem 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9; margin-bottom: 0.35rem; font-size: 0.85rem;
  }
  .post-card code { font-size: 0.75rem; color: #636e72; }

  .demo-form {
    background: white; padding: 1rem; border-radius: 6px;
    border: 1px solid #dfe6e9;
  }
  .demo-form label { display: block; margin-bottom: 0.75rem; }
  .demo-form label span { display: block; font-size: 0.8rem; font-weight: 600; color: #2d3436; margin-bottom: 0.25rem; }
  .demo-form input, .demo-form textarea {
    width: 100%; padding: 0.4rem 0.6rem; border: 1px solid #dfe6e9;
    border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;
  }
  .demo-form input[aria-invalid="true"], .demo-form textarea[aria-invalid="true"] {
    border-color: #d63031;
  }
  .demo-form button {
    padding: 0.5rem 1.2rem; background: #00b894; color: white;
    border: none; border-radius: 4px; font-weight: 600; cursor: pointer;
  }
  .demo-form button:disabled { opacity: 0.6; cursor: not-allowed; }
  .issue { color: #d63031; font-size: 0.8rem; margin: 0.15rem 0 0; }

  .success-box {
    margin-top: 0.75rem; padding: 0.75rem; background: #f0fff4;
    border: 1px solid #00b894; border-radius: 6px; font-size: 0.85rem;
    color: #2d3436;
  }
  .success-box code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; }

  .like-demo { margin: 0.5rem 0; }
  .like-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.4rem 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9; margin-bottom: 0.35rem; font-size: 0.85rem;
  }
  .cmd-log { margin-top: 0.5rem; padding: 0.5rem; background: white; border-radius: 6px; border: 1px solid #dfe6e9; }
  .cmd-entry { font-size: 0.8rem; color: #636e72; padding: 0.15rem 0.5rem; }

  .comparison { border: 1px solid #dfe6e9; border-radius: 6px; overflow: hidden; }
  .comp-row {
    display: grid; grid-template-columns: 140px 1fr; gap: 0.75rem;
    padding: 0.5rem 0.75rem; font-size: 0.82rem; border-bottom: 1px solid #dfe6e9;
    align-items: center;
  }
  .comp-row:last-child { border-bottom: none; }
  .comp-row.header { background: #2d3436; color: white; font-weight: 600; }
  .comp-row code { background: #dfe6e9; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.78rem; }
  .comp-row span code { background: transparent; font-size: 0.78rem; }

  .scenario { display: flex; gap: 0.25rem; margin-bottom: 0.5rem; }
  .scenario button, .asset-picker button, .helpers button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #dfe6e9; color: #2d3436; cursor: pointer;
    font-weight: 600; font-size: 0.85rem;
  }
  .scenario button.active, .asset-picker button.active { background: #00b894; color: white; }
  .event-box {
    background: white; padding: 0.75rem; border-radius: 6px;
    border: 1px solid #dfe6e9; margin-bottom: 0.75rem;
  }
  .event-box strong { font-size: 0.8rem; color: #2d3436; }
  .event-box pre { margin: 0.3rem 0 0; font-size: 0.75rem; color: #636e72; overflow-x: auto; font-family: monospace; }
  .helpers { display: flex; gap: 0.25rem; flex-wrap: wrap; }
  .helpers button { background: #0984e3; color: white; font-family: monospace; }
  .log { margin-top: 0.75rem; background: white; border-radius: 6px; padding: 0.5rem; border: 1px solid #dfe6e9; }
  .log-entry {
    display: flex; gap: 0.75rem; padding: 0.25rem 0.5rem;
    font-size: 0.8rem; border-left: 3px solid;
    margin-bottom: 0.25rem; border-radius: 2px;
  }
  .log-entry.ok { border-color: #00b894; background: #f0fff4; }
  .log-entry.fail { border-color: #d63031; background: #fff5f5; }
  .log-entry code { font-family: monospace; color: #2d3436; font-weight: 600; white-space: nowrap; }
  .asset-picker { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
  .asset-picker .primary { background: #00b894; color: white; margin-left: auto; }
  .asset-result { background: white; padding: 0.75rem; border-radius: 6px; border: 1px solid #dfe6e9; }
  .row { display: flex; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.2rem; }
  .row span { color: #636e72; min-width: 110px; }
  .row code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  .preview {
    padding: 0.5rem; background: #2d3436; color: #dfe6e9;
    border-radius: 4px; font-size: 0.75rem; overflow-x: auto;
    margin: 0.3rem 0 0; font-family: monospace;
  }
</style>`,
			language: 'svelte'
		}
	],
	solution: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ============================================================
  // SOLUTION — $app/server & Remote Functions
  // ============================================================
  // Best-practice: fully typed simulations, clean state management,
  // proper async patterns.

  type Post = { id: number; title: string; slug: string };

  let posts: Post[] = $state([
    { id: 1, title: 'Getting Started with SvelteKit', slug: 'getting-started' },
    { id: 2, title: 'Remote Functions Deep Dive', slug: 'remote-functions' },
    { id: 3, title: 'Single-Flight Mutations', slug: 'single-flight' }
  ]);

  let likes: Record<string, number> = $state({ '1': 5, '2': 12, '3': 3 });
  let nextId: number = $state(4);
  let queryCallCount: number = $state(0);

  // Simulated query with deduplication
  const queryCache = new Map<string, Post[]>();
  function getPosts(): Post[] {
    const key = 'all';
    queryCallCount++;
    if (!queryCache.has(key)) {
      queryCache.set(key, [...posts]);
    }
    return queryCache.get(key)!;
  }

  function refreshPosts(): void {
    queryCache.clear();
    queryCallCount = 0;
  }

  // Form state
  let formTitle: string = $state('');
  let formContent: string = $state('');
  let formErrors: { title?: string; content?: string } = $state({});
  let formResult: { success: boolean; slug: string } | null = $state(null);
  let formPending: boolean = $state(false);

  function validateForm(): boolean {
    formErrors = {};
    if (!formTitle.trim()) formErrors.title = 'Title is required';
    if (!formContent.trim()) formErrors.content = 'Content is required';
    return !formErrors.title && !formErrors.content;
  }

  async function submitForm(): Promise<void> {
    if (!validateForm()) return;
    formPending = true;
    await new Promise((r) => setTimeout(r, 600));
    const slug = formTitle.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    posts = [...posts, { id: nextId++, title: formTitle, slug }];
    refreshPosts();
    formResult = { success: true, slug };
    formTitle = '';
    formContent = '';
    formPending = false;
  }

  // Command simulation
  let commandLog: string[] = $state([]);
  async function addLike(itemId: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    likes[itemId] = (likes[itemId] ?? 0) + 1;
    likes = { ...likes };
    commandLog = [\`+1 like for item \${itemId} (now \${likes[itemId]})\`, ...commandLog].slice(0, 5);
  }

  // getRequestEvent simulation
  type DemoEvent = {
    locals: { user: { id: string; email: string; role: 'admin' | 'user' } | null };
    cookies: { session?: string };
    url: string;
  };

  type CallLog = { id: number; helper: string; result: string; ok: boolean };

  let eventLogs: CallLog[] = $state([]);
  let eventLogId: number = $state(0);
  let scenario: 'anon' | 'user' | 'admin' = $state('user');

  const scenarios: Record<typeof scenario, DemoEvent> = {
    anon: { locals: { user: null }, cookies: {}, url: '/dashboard' },
    user: {
      locals: { user: { id: 'u42', email: 'alice@example.com', role: 'user' } },
      cookies: { session: 'sess_abc' }, url: '/dashboard'
    },
    admin: {
      locals: { user: { id: 'u1', email: 'root@example.com', role: 'admin' } },
      cookies: { session: 'sess_root' }, url: '/admin/users'
    }
  };

  let currentEvent: DemoEvent | null = null;
  function getRequestEvent(): DemoEvent {
    if (!currentEvent) throw new Error('Called outside a request');
    return currentEvent;
  }

  function requireUser(): NonNullable<DemoEvent['locals']['user']> {
    const event = getRequestEvent();
    if (!event.locals.user) throw new Error('401 Unauthorized');
    return event.locals.user;
  }

  function runIn(name: string, fn: () => string): void {
    currentEvent = scenarios[scenario];
    try {
      const result = fn();
      eventLogs = [{ id: eventLogId++, helper: name, result, ok: true }, ...eventLogs].slice(0, 6);
    } catch (e) {
      eventLogs = [{ id: eventLogId++, helper: name, result: (e as Error).message, ok: false }, ...eventLogs].slice(0, 6);
    } finally {
      currentEvent = null;
    }
  }

  // read() simulation
  const fakeAssets: Record<string, { type: string; size: number; preview: string }> = {
    '/fonts/Inter.woff2': { type: 'font/woff2', size: 84200, preview: '(binary font data)' },
    '/data/cities.json': { type: 'application/json', size: 2100, preview: '[{"name":"Tokyo","pop":37.4},...]' },
    '/images/logo.svg': { type: 'image/svg+xml', size: 540, preview: '<svg viewBox="0 0 32 32">...</svg>' }
  };
  let selectedAsset: string = $state('/data/cities.json');
  let readResult: { type: string; size: number; preview: string } | null = $state(null);
  function callRead(): void {
    readResult = fakeAssets[selectedAsset] ?? null;
  }

  // Active tab control
  let activeTab: 'remote' | 'event' | 'read' = $state('remote');
</script>

<h1>$app/server &amp; Remote Functions</h1>

<p class="intro">
  SvelteKit 2.27 introduced <strong>remote functions</strong> — the most significant
  addition to <code>$app/server</code>. They provide type-safe client-server
  communication via <code>.remote.ts</code> files.
</p>

<nav class="tabs">
  <button class:active={activeTab === 'remote'} onclick={() => (activeTab = 'remote')}>
    Remote Functions
  </button>
  <button class:active={activeTab === 'event'} onclick={() => (activeTab = 'event')}>
    getRequestEvent
  </button>
  <button class:active={activeTab === 'read'} onclick={() => (activeTab = 'read')}>
    read()
  </button>
</nav>

{#if activeTab === 'remote'}

<section>
  <h2>1. query() — Read Server Data</h2>
  <h3>Interactive Demo: Deduplication</h3>
  <div class="demo-row">
    <button class="btn" onclick={() => getPosts()}>getPosts()</button>
    <button class="btn" onclick={() => getPosts()}>getPosts() again</button>
    <button class="btn outline" onclick={refreshPosts}>Refresh Cache</button>
    <span class="badge">Server calls: {queryCallCount}</span>
  </div>
  <div class="post-list">
    {#each getPosts() as post (post.id)}
      <div class="post-card">
        <strong>{post.title}</strong>
        <code>/blog/{post.slug}</code>
      </div>
    {/each}
  </div>
</section>

<section>
  <h2>2. form() — Type-Safe Form Submissions</h2>
  <form class="demo-form" onsubmit={(e) => { e.preventDefault(); submitForm(); }}>
    <label>
      <span>Title</span>
      <input type="text" bind:value={formTitle} oninput={validateForm}
        aria-invalid={!!formErrors.title} placeholder="My new blog post" />
      {#if formErrors.title}
        <p class="issue">{formErrors.title}</p>
      {/if}
    </label>
    <label>
      <span>Content</span>
      <textarea bind:value={formContent} oninput={validateForm}
        aria-invalid={!!formErrors.content} placeholder="Write something..." rows="3"></textarea>
      {#if formErrors.content}
        <p class="issue">{formErrors.content}</p>
      {/if}
    </label>
    <button type="submit" disabled={formPending}>
      {formPending ? 'Publishing...' : 'Publish!'}
    </button>
  </form>
  {#if formResult}
    <div class="success-box">
      Published! Slug: <code>/blog/{formResult.slug}</code>
    </div>
  {/if}
</section>

<section>
  <h2>3. command() — Non-Form Mutations</h2>
  <div class="like-demo">
    {#each posts.slice(0, 3) as post (post.id)}
      <div class="like-row">
        <span>{post.title}</span>
        <button class="btn sm" onclick={() => addLike(String(post.id))}>
          Like ({likes[String(post.id)] ?? 0})
        </button>
      </div>
    {/each}
  </div>
  {#if commandLog.length > 0}
    <div class="cmd-log">
      {#each commandLog as entry}
        <div class="cmd-entry">{entry}</div>
      {/each}
    </div>
  {/if}
</section>

<section>
  <h2>When to Use What?</h2>
  <div class="comparison">
    <div class="comp-row header"><span>Pattern</span><span>Use When</span></div>
    <div class="comp-row"><code>query()</code><span>Reading dynamic data — replaces most load functions</span></div>
    <div class="comp-row"><code>form()</code><span>Form submissions with validation — replaces actions</span></div>
    <div class="comp-row"><code>command()</code><span>Non-form mutations (likes, deletes, toggles)</span></div>
    <div class="comp-row"><code>query.live()</code><span>Real-time data (notifications, chat)</span></div>
    <div class="comp-row"><code>load + actions</code><span>URL-dependent data, complex layouts</span></div>
  </div>
</section>

{:else if activeTab === 'event'}

<section>
  <h2>getRequestEvent() — Ambient Access from Helpers</h2>
  <div class="scenario">
    {#each Object.keys(scenarios) as s (s)}
      <button class:active={scenario === s} onclick={() => (scenario = s as typeof scenario)}>{s}</button>
    {/each}
  </div>
  <div class="event-box">
    <strong>Active event</strong>
    <pre>{JSON.stringify(scenarios[scenario], null, 2)}</pre>
  </div>
  <div class="helpers">
    <button onclick={() => runIn('getRequestEvent()', () => {
      const e = getRequestEvent();
      return \`\${e.url} — user=\${e.locals.user?.email ?? 'none'}\`;
    })}>getRequestEvent()</button>
    <button onclick={() => runIn('requireUser()', () => {
      const user = requireUser();
      return \`OK — \${user.email}\`;
    })}>requireUser()</button>
  </div>
  {#if eventLogs.length > 0}
    <div class="log">
      {#each eventLogs as entry (entry.id)}
        <div class="log-entry" class:ok={entry.ok} class:fail={!entry.ok}>
          <code>{entry.helper}</code>
          <span>{entry.result}</span>
        </div>
      {/each}
    </div>
  {/if}
</section>

{:else}

<section>
  <h2>read() — Load Static Assets on the Server</h2>
  <div class="asset-picker">
    {#each Object.keys(fakeAssets) as path (path)}
      <button class:active={selectedAsset === path} onclick={() => (selectedAsset = path)}>
        {path.split('/').pop()}
      </button>
    {/each}
    <button class="primary" onclick={callRead}>read(asset)</button>
  </div>
  {#if readResult}
    <div class="asset-result">
      <div class="row"><span>Content-Type:</span> <code>{readResult.type}</code></div>
      <div class="row"><span>Size:</span> <code>{readResult.size.toLocaleString()} bytes</code></div>
      <pre class="preview">{readResult.preview}</pre>
    </div>
  {/if}
</section>

{/if}

<style>
  h1 { color: #2d3436; margin-bottom: 0.25rem; }
  .intro { font-size: 0.9rem; color: #636e72; margin-bottom: 1rem; line-height: 1.5; }
  .intro code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  .tabs {
    display: flex; gap: 0; margin-bottom: 1rem;
    border-bottom: 2px solid #dfe6e9;
  }
  .tabs button {
    padding: 0.5rem 1rem; border: none; background: none;
    font-weight: 600; font-size: 0.85rem; color: #636e72;
    cursor: pointer; border-bottom: 2px solid transparent;
    margin-bottom: -2px; transition: all 0.15s;
  }
  .tabs button.active { color: #00b894; border-bottom-color: #00b894; }
  section { margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; }
  h2 { margin-top: 0; color: #00b894; font-size: 1.05rem; }
  h3 { color: #2d3436; font-size: 0.95rem; margin: 1rem 0 0.5rem; }
  .btn {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #0984e3; color: white; cursor: pointer;
    font-weight: 600; font-size: 0.85rem;
  }
  .btn.outline { background: transparent; border: 1px solid #0984e3; color: #0984e3; }
  .btn.sm { padding: 0.25rem 0.6rem; font-size: 0.8rem; }
  .badge {
    display: inline-flex; align-items: center; padding: 0.25rem 0.6rem;
    background: #dfe6e9; border-radius: 12px; font-size: 0.8rem;
    font-weight: 600; color: #2d3436;
  }
  .demo-row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin: 0.5rem 0; }
  .post-list { margin-top: 0.75rem; }
  .post-card {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.5rem 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9; margin-bottom: 0.35rem; font-size: 0.85rem;
  }
  .post-card code { font-size: 0.75rem; color: #636e72; }
  .demo-form {
    background: white; padding: 1rem; border-radius: 6px; border: 1px solid #dfe6e9;
  }
  .demo-form label { display: block; margin-bottom: 0.75rem; }
  .demo-form label span { display: block; font-size: 0.8rem; font-weight: 600; color: #2d3436; margin-bottom: 0.25rem; }
  .demo-form input, .demo-form textarea {
    width: 100%; padding: 0.4rem 0.6rem; border: 1px solid #dfe6e9;
    border-radius: 4px; font-size: 0.85rem; box-sizing: border-box;
  }
  .demo-form button {
    padding: 0.5rem 1.2rem; background: #00b894; color: white;
    border: none; border-radius: 4px; font-weight: 600; cursor: pointer;
  }
  .demo-form button:disabled { opacity: 0.6; cursor: not-allowed; }
  .issue { color: #d63031; font-size: 0.8rem; margin: 0.15rem 0 0; }
  .success-box {
    margin-top: 0.75rem; padding: 0.75rem; background: #f0fff4;
    border: 1px solid #00b894; border-radius: 6px; font-size: 0.85rem;
  }
  .success-box code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .like-demo { margin: 0.5rem 0; }
  .like-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.4rem 0.75rem; background: white; border-radius: 6px;
    border: 1px solid #dfe6e9; margin-bottom: 0.35rem; font-size: 0.85rem;
  }
  .cmd-log { margin-top: 0.5rem; padding: 0.5rem; background: white; border-radius: 6px; border: 1px solid #dfe6e9; }
  .cmd-entry { font-size: 0.8rem; color: #636e72; padding: 0.15rem 0.5rem; }
  .comparison { border: 1px solid #dfe6e9; border-radius: 6px; overflow: hidden; }
  .comp-row {
    display: grid; grid-template-columns: 140px 1fr; gap: 0.75rem;
    padding: 0.5rem 0.75rem; font-size: 0.82rem; border-bottom: 1px solid #dfe6e9;
  }
  .comp-row:last-child { border-bottom: none; }
  .comp-row.header { background: #2d3436; color: white; font-weight: 600; }
  .comp-row code { background: #dfe6e9; padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.78rem; }
  .scenario { display: flex; gap: 0.25rem; margin-bottom: 0.5rem; }
  .scenario button, .asset-picker button, .helpers button {
    padding: 0.4rem 0.8rem; border: none; border-radius: 4px;
    background: #dfe6e9; color: #2d3436; cursor: pointer;
    font-weight: 600; font-size: 0.85rem;
  }
  .scenario button.active, .asset-picker button.active { background: #00b894; color: white; }
  .event-box {
    background: white; padding: 0.75rem; border-radius: 6px;
    border: 1px solid #dfe6e9; margin-bottom: 0.75rem;
  }
  .event-box strong { font-size: 0.8rem; color: #2d3436; }
  .event-box pre { margin: 0.3rem 0 0; font-size: 0.75rem; color: #636e72; overflow-x: auto; }
  .helpers { display: flex; gap: 0.25rem; flex-wrap: wrap; }
  .helpers button { background: #0984e3; color: white; font-family: monospace; }
  .log { margin-top: 0.75rem; background: white; border-radius: 6px; padding: 0.5rem; border: 1px solid #dfe6e9; }
  .log-entry {
    display: flex; gap: 0.75rem; padding: 0.25rem 0.5rem;
    font-size: 0.8rem; border-left: 3px solid;
    margin-bottom: 0.25rem; border-radius: 2px;
  }
  .log-entry.ok { border-color: #00b894; background: #f0fff4; }
  .log-entry.fail { border-color: #d63031; background: #fff5f5; }
  .log-entry code { font-family: monospace; color: #2d3436; font-weight: 600; white-space: nowrap; }
  .asset-picker { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-bottom: 0.75rem; }
  .asset-picker .primary { background: #00b894; color: white; margin-left: auto; }
  .asset-result { background: white; padding: 0.75rem; border-radius: 6px; border: 1px solid #dfe6e9; }
  .row { display: flex; gap: 0.5rem; font-size: 0.85rem; margin-bottom: 0.2rem; }
  .row span { color: #636e72; min-width: 110px; }
  .row code { background: #dfe6e9; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.8rem; }
  .preview {
    padding: 0.5rem; background: #2d3436; color: #dfe6e9;
    border-radius: 4px; font-size: 0.75rem; overflow-x: auto;
    margin: 0.3rem 0 0; font-family: monospace;
  }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
