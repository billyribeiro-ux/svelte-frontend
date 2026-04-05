import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '12-3',
		title: 'fetch API',
		phase: 4,
		module: 12,
		lessonIndex: 3
	},
	description: `The fetch API is the modern way to make HTTP requests in JavaScript. It returns a Promise that resolves to a Response object. You then parse the body with .json(), .text(), or other methods. Understanding fetch is critical because SvelteKit's load functions use the same API.

Best practice: store fetch results in $state.raw() rather than $state(). API responses are almost always reassigned wholesale (never mutated), so you don't need the deep proxy — and $state.raw is significantly faster for large payloads.

Beyond request/response: when you need push-style updates, the Svelte ecosystem offers itty-sockets (a 466-byte WebSocket client that needs no API keys, ideal for prototypes) and svelte-realtime (RPC + reactive subscriptions built on svelte-adapter-uws for production apps).`,
	objectives: [
		'Make GET requests with fetch() and parse JSON responses',
		'Use $state.raw() for API responses (best practice)',
		'Handle HTTP errors properly (check response.ok)',
		'Display loading, success, and error states in the UI',
		'Know when to reach for WebSockets (itty-sockets, svelte-realtime)'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  interface User {
    id: number;
    name: string;
    email: string;
    company: { name: string };
  }

  // Best practice: $state.raw for API responses — they're replaced
  // wholesale, never mutated, so we don't need the deep proxy.
  let users: User[] = $state.raw([]);
  let loading: boolean = $state(false);
  let error: string = $state('');
  let selectedUserId: number = $state(1);

  // Fetch users from JSONPlaceholder API
  async function fetchUsers() {
    loading = true;
    error = '';
    users = [];

    try {
      const response: Response = await fetch(
        'https://jsonplaceholder.typicode.com/users'
      );

      // IMPORTANT: fetch does NOT reject on HTTP errors!
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ': ' + response.statusText);
      }

      const data: User[] = await response.json();
      users = data;
    } catch (err) {
      const e = err as Error;
      error = e.message;
    } finally {
      loading = false;
    }
  }

  // Fetch a single user — $state.raw again, since we replace it wholesale.
  let singleUser: User | null = $state.raw(null);

  async function fetchSingleUser() {
    try {
      const res = await fetch(
        'https://jsonplaceholder.typicode.com/users/' + selectedUserId
      );
      if (!res.ok) throw new Error('User not found');
      singleUser = await res.json();
    } catch (err) {
      singleUser = null;
      error = (err as Error).message;
    }
  }
</script>

<main>
  <h1>fetch API</h1>

  <section>
    <h2>Basic fetch Pattern</h2>
    <pre>{\`async function loadData() {
  const response = await fetch('/api/data');

  // Always check response.ok!
  if (!response.ok) {
    throw new Error(\`HTTP \${response.status}\`);
  }

  const data = await response.json();
  return data;
}\`}</pre>
  </section>

  <section>
    <h2>Fetch All Users</h2>
    <button onclick={fetchUsers} disabled={loading}>
      {loading ? 'Loading...' : 'Fetch Users'}
    </button>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    {#if loading}
      <p class="loading">Fetching data...</p>
    {:else if users.length > 0}
      <table>
        <thead>
          <tr><th>ID</th><th>Name</th><th>Email</th><th>Company</th></tr>
        </thead>
        <tbody>
          {#each users as user}
            <tr>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.company.name}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>

  <section>
    <h2>Fetch Single User</h2>
    <div class="row">
      <label>
        User ID:
        <input type="number" bind:value={selectedUserId} min={1} max={10} />
      </label>
      <button onclick={fetchSingleUser}>Fetch</button>
    </div>

    {#if singleUser}
      <div class="user-card">
        <h3>{singleUser.name}</h3>
        <p>{singleUser.email}</p>
        <p><em>{singleUser.company.name}</em></p>
      </div>
    {/if}
  </section>

  <section>
    <h2>Beyond HTTP: Realtime Alternatives</h2>
    <p>When request/response isn't enough, Svelte has two community libraries worth knowing:</p>
    <div class="lib-grid">
      <div class="lib-card">
        <h3>itty-sockets</h3>
        <p class="lib-desc">~466 B WebSocket client with an optional public relay. No API keys, no accounts.</p>
        <pre class="lib-code">{\`import { connect } from 'itty-sockets';

const room = connect('my-channel');
room.on('message', (msg) => {
  console.log(msg);
});
room.send({ hello: 'world' });\`}</pre>
      </div>
      <div class="lib-card">
        <h3>svelte-realtime</h3>
        <p class="lib-desc">Realtime RPC + reactive subscriptions for SvelteKit, built on svelte-adapter-uws.</p>
        <pre class="lib-code">{\`import { subscribe } from 'svelte-realtime';

// Reactive subscription — updates push into $state
const posts = subscribe('posts');
// posts.current is fully reactive\`}</pre>
      </div>
    </div>
  </section>

  <section>
    <h2>Common Gotchas</h2>
    <pre>{\`// fetch does NOT throw on 404 or 500!
const res = await fetch('/not-found');
console.log(res.ok);     // false
console.log(res.status); // 404
// No error thrown — you must check manually!

// Parsing the body can only happen once
const data = await res.json();  // first call works
const data2 = await res.json(); // ERROR: body already consumed

// Always handle network errors AND HTTP errors
try {
  const res = await fetch(url);    // network error → catch
  if (!res.ok) throw new Error();  // HTTP error → catch
  const data = await res.json();   // parse error → catch
} catch (err) {
  // handles all three
}\`}</pre>
  </section>
</main>

<style>
  main { max-width: 650px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
  th, td { padding: 0.4rem; border: 1px solid #ddd; text-align: left; font-size: 0.9rem; }
  th { background: #f5f5f5; }
  .error { color: #d32f2f; }
  .loading { color: #1565c0; font-style: italic; }
  .user-card { background: #f0f7ff; padding: 1rem; border-radius: 4px; margin-top: 0.5rem; }
  .row { display: flex; align-items: end; gap: 0.5rem; }
  button { padding: 0.5rem 1rem; cursor: pointer; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  label { display: flex; flex-direction: column; gap: 0.25rem; }
  input[type="number"] { padding: 0.4rem; width: 5rem; }
  .lib-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .lib-card { padding: 0.8rem; background: #f0f9ff; border-left: 3px solid #0ea5e9; border-radius: 6px; }
  .lib-card h3 { margin: 0 0 0.25rem; color: #0c4a6e; font-size: 0.95rem; }
  .lib-desc { font-size: 0.8rem; color: #0c4a6e; margin-bottom: 0.5rem; }
  .lib-code { background: #0c4a6e; color: #bae6fd; padding: 0.6rem; border-radius: 4px; font-size: 0.72rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
