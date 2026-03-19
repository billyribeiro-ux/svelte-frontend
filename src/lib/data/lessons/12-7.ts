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

This separation ensures sensitive operations like database queries and API key usage never leak to the browser.`,
	objectives: [
		'Write a server load function in +page.server.ts',
		'Access cookies, environment variables, and server-only resources',
		'Understand the serialization boundary between server and client',
		'Know when to use server load vs universal load'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let selectedTopic: string = $state('basics');
</script>

<main>
  <h1>Server Load (+page.server.ts)</h1>

  <nav>
    {#each ['basics', 'cookies', 'env', 'comparison'] as topic}
      <button
        class:active={selectedTopic === topic}
        onclick={() => selectedTopic = topic}
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
