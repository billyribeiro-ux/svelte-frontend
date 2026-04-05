import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-7',
		title: 'Server Load (+page.server.js)',
		phase: 4,
		module: 12,
		lessonIndex: 7
	},
	description: `Server load functions (+page.server.ts) run exclusively on the server. They have access to server-only resources like databases, environment variables, cookies, and file systems. The data they return is serialized and sent to the client, so only JSON-serializable values can be returned.

This separation ensures sensitive operations like database queries and API key usage never leak to the browser. When the page component receives the data via $props(), the payload is already a plain object — no need to wrap it in $state. Use $derived() to compute view state from data, and $state.raw() only when you need a local editable copy that's reassigned wholesale.`,
	objectives: [
		'Write a server load function in +page.server.ts',
		'Access cookies, environment variables, databases, and server-only resources',
		'Use $env/static/private vs $env/dynamic/private correctly',
		'Query a database directly from load without an HTTP round trip',
		'Understand the serialization boundary between server and client',
		'Know when to use server load vs universal load'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  type Topic = 'basics' | 'db' | 'cookies' | 'env' | 'boundary' | 'comparison';
  const topics: Topic[] = ['basics', 'db', 'cookies', 'env', 'boundary', 'comparison'];
  let selectedTopic: Topic = $state('basics');

  // Preserved best practice: the data prop is already plain.
  // Use $derived to compute view state; use $state.raw only for
  // an editable local copy that will be reassigned wholesale.
</script>

<main>
  <h1>Server Load (+page.server.ts)</h1>

  <nav>
    {#each topics as topic (topic)}
      <button
        class:active={selectedTopic === topic}
        onclick={() => (selectedTopic = topic)}
      >
        {topic}
      </button>
    {/each}
  </nav>

  {#if selectedTopic === 'basics'}
    <section>
      <h2>Server-Only Load</h2>
      <pre>{\`// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/database';

export const load: PageServerLoad = async ({ locals }) => {
  // This code ONLY runs on the server
  // Safe to use databases, secrets, etc.

  const user = await db.user.findUnique({
    where: { id: locals.userId }
  });

  const stats = await db.stats.aggregate({
    where: { userId: locals.userId }
  });

  // Return serializable data only
  return {
    user: {
      name: user.name,
      email: user.email
    },
    stats: {
      totalPosts: stats.posts,
      totalViews: stats.views
    }
  };
};\`}</pre>
      <div class="demo-box">
        <p><strong>Key:</strong> The .server in the filename means this code never reaches the browser. SvelteKit serializes the returned data and sends it as JSON.</p>
      </div>
    </section>

  {:else if selectedTopic === 'db'}
    <section>
      <h2>Direct Database Access</h2>
      <p>
        One of the biggest wins of server load: you can query your database directly,
        without an HTTP round trip to your own API route. The code never reaches the
        browser, so your DB client and connection strings stay safe.
      </p>
      <pre>{\`// src/lib/server/db.ts — server-only
import { PrismaClient } from '@prisma/client';
export const db = new PrismaClient();

// src/routes/posts/[slug]/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
  const post = await db.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: { select: { name: true, avatar: true } },
      comments: { orderBy: { createdAt: 'desc' }, take: 20 }
    }
  });

  if (!post) {
    throw error(404, 'Post not found');
  }

  return { post };
};\`}</pre>
      <div class="demo-box">
        <p><strong>Why $lib/server/?</strong> Anything under <code>src/lib/server/</code> is
          guaranteed to be server-only — importing it from client code is a build error.
          Put your DB client, auth helpers, and private API wrappers there.</p>
      </div>
    </section>

  {:else if selectedTopic === 'cookies'}
    <section>
      <h2>Working with Cookies</h2>
      <pre>{\`// src/routes/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  // Read a cookie
  const sessionId = cookies.get('session_id');

  // Set a cookie
  cookies.set('last_visit', new Date().toISOString(), {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30  // 30 days
  });

  // Delete a cookie
  // cookies.delete('old_cookie', { path: '/' });

  if (!sessionId) {
    return { loggedIn: false };
  }

  const user = await validateSession(sessionId);
  return {
    loggedIn: true,
    username: user.name
  };
};\`}</pre>
    </section>

  {:else if selectedTopic === 'env'}
    <section>
      <h2>Environment Variables</h2>
      <pre>{\`// src/routes/api-data/+page.server.ts
import type { PageServerLoad } from './$types';
import { API_SECRET_KEY } from '$env/static/private';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }) => {
  // Use secret API keys safely — never sent to browser
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': 'Bearer ' + API_SECRET_KEY,
      'X-Custom': env.CUSTOM_HEADER ?? ''
    }
  });

  const data = await response.json();

  // Only return what the client needs
  return {
    items: data.items.map((item: any) => ({
      id: item.id,
      title: item.title
      // Don't return item.internalId or other sensitive fields!
    }))
  };
};

// .env file:
// API_SECRET_KEY=sk_live_abc123  ← private, server only
// PUBLIC_APP_NAME=My App         ← public, available in browser\`}</pre>
      <div class="demo-box warning">
        <p><strong>$env/static/private</strong> — build-time, server-only secrets</p>
        <p><strong>$env/dynamic/private</strong> — runtime, server-only env vars</p>
        <p><strong>$env/static/public</strong> — build-time, available in browser</p>
        <p><strong>$env/dynamic/public</strong> — runtime, available in browser</p>
      </div>
    </section>

  {:else if selectedTopic === 'boundary'}
    <section>
      <h2>The Serialization Boundary</h2>
      <p>
        Whatever a server load returns is <em>serialized to JSON-ish</em> (via devalue,
        which supports a few extras like Date and Map) and sent to the browser.
        Functions, class instances with methods, symbols, and circular references
        do not survive the trip.
      </p>
      <pre>{\`// ✅ Safe — all JSON-serializable
return {
  name: 'Alice',
  age: 30,
  tags: ['admin', 'editor'],
  createdAt: new Date(),     // devalue supports Date
  settings: { theme: 'dark' }
};

// ❌ Breaks — functions disappear
return {
  greet: () => 'hi'          // becomes undefined on client
};

// ❌ Breaks — class instances lose methods
class User { sayHi() { return 'hi'; } }
return { user: new User() }; // becomes plain object { }

// ❌ Breaks — circular reference
const a = {}; a.self = a;
return { a };                 // error

// 🟡 Leak risk — don't return more than the client needs
return {
  user: {
    id: user.id,
    name: user.name,
    // DON'T include: passwordHash, internalNotes, apiKeys...
  }
};\`}</pre>
      <div class="demo-box warning">
        <p><strong>Security reminder:</strong> every field you return is visible in the
          page source. Whitelist explicitly — never return the raw user object when
          it came straight from your DB.</p>
      </div>
    </section>

  {:else if selectedTopic === 'comparison'}
    <section>
      <h2>Server Load Context</h2>
      <p>Server load gets everything universal load gets, plus:</p>
      <table>
        <thead><tr><th>Property</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>cookies</code></td><td>Read/write HTTP cookies</td></tr>
          <tr><td><code>locals</code></td><td>Per-request data from hooks</td></tr>
          <tr><td><code>request</code></td><td>The raw Request object</td></tr>
          <tr><td><code>getClientAddress()</code></td><td>Client's IP address</td></tr>
          <tr><td><code>platform</code></td><td>Platform-specific context</td></tr>
        </tbody>
      </table>

      <h3 style="margin-top: 1rem;">Return Value Rules</h3>
      <pre>{\`// Server load data must be serializable!

// OK: primitives, plain objects, arrays, dates
return { name: 'Alice', count: 42, items: [1, 2, 3] };

// NOT OK: functions, classes, symbols, circular refs
return {
  greet: () => 'hi',     // functions can't be serialized
  user: new User()        // class instances lose their methods
};\`}</pre>
    </section>
  {/if}
</main>

<style>
  main { max-width: 650px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
  nav button { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; }
  nav button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; }
  .demo-box { background: #fff3e0; padding: 0.75rem 1rem; border-radius: 4px; border-left: 3px solid #ff9800; margin-top: 0.5rem; }
  .demo-box.warning { background: #e8f5e9; border-left-color: #4caf50; }
  .demo-box p { margin: 0.3rem 0; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; }
  th { background: #f5f5f5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
