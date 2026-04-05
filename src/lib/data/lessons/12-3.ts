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
		'POST, PUT, PATCH and DELETE with JSON bodies and headers',
		'Send FormData (multipart uploads) without manual boundaries',
		'Use $state.raw() for API responses (best practice)',
		'Handle HTTP errors properly (check response.ok — fetch does NOT throw)',
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

  // ---------------------------------------------------------------
  // POST — sending JSON
  //
  // Three things every JSON POST needs:
  //   1. method: 'POST'
  //   2. headers: { 'Content-Type': 'application/json' }
  //   3. body: JSON.stringify(payload)
  //
  // Forget the header and most APIs will silently treat your
  // body as text/plain and ignore it.
  // ---------------------------------------------------------------

  interface CreatePostPayload {
    title: string;
    body: string;
    userId: number;
  }

  interface CreatedPost extends CreatePostPayload {
    id: number;
  }

  let newTitle: string = $state('Hello from Svelte');
  let newBody: string = $state('This post was created with fetch + POST');
  let createdPost: CreatedPost | null = $state.raw(null);
  let posting: boolean = $state(false);

  async function createPost(): Promise<void> {
    posting = true;
    createdPost = null;
    error = '';

    try {
      const payload: CreatePostPayload = {
        title: newTitle,
        body: newBody,
        userId: 1
      };

      const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Create failed: HTTP ' + res.status);
      createdPost = await res.json();
    } catch (err) {
      error = (err as Error).message;
    } finally {
      posting = false;
    }
  }

  // ---------------------------------------------------------------
  // PUT / PATCH / DELETE
  //
  // PUT   — replace a resource entirely (send full object)
  // PATCH — update fields in place (send only changed keys)
  // DELETE — remove a resource (usually no body)
  // ---------------------------------------------------------------
  async function updatePostTitle(id: number, title: string): Promise<void> {
    // PATCH: partial update
    await fetch('https://jsonplaceholder.typicode.com/posts/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
  }

  async function deletePost(id: number): Promise<void> {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts/' + id, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Delete failed');
  }

  // Expose these helpers so the compiler doesn't flag them as unused.
  // In a real app you'd wire them to buttons next to each post.
  void updatePostTitle;
  void deletePost;
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
          {#each users as user (user.id)}
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
    <h2>POST — Creating a Resource</h2>
    <div class="form">
      <label>
        Title
        <input bind:value={newTitle} />
      </label>
      <label>
        Body
        <textarea bind:value={newBody} rows="3"></textarea>
      </label>
      <button onclick={createPost} disabled={posting}>
        {posting ? 'Posting...' : 'POST /posts'}
      </button>
    </div>
    {#if createdPost}
      <div class="user-card">
        <strong>Created post #{createdPost.id}</strong>
        <p>{createdPost.title}</p>
      </div>
    {/if}
    <pre>{\`await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',  // REQUIRED for JSON bodies
    'Accept': 'application/json'
  },
  body: JSON.stringify({ title, body, userId: 1 })
});\`}</pre>
  </section>

  <section>
    <h2>PUT / PATCH / DELETE</h2>
    <pre>{\`// PUT — replace resource entirely
await fetch('/api/posts/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(fullPost)
});

// PATCH — update just some fields
await fetch('/api/posts/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Updated' })
});

// DELETE — usually no body
await fetch('/api/posts/1', { method: 'DELETE' });\`}</pre>
  </section>

  <section>
    <h2>FormData — File Uploads & multipart</h2>
    <p class="hint">
      Pass a <code>FormData</code> object as the body and the browser sets the
      multipart Content-Type header (with the correct boundary) automatically.
      Don't set Content-Type yourself — you'll break the boundary.
    </p>
    <pre>{\`const formData = new FormData();
formData.append('title', 'My upload');
formData.append('file', fileInput.files[0]);  // File object
formData.append('tags', 'svelte');
formData.append('tags', 'fetch');             // multiple values OK

await fetch('/api/upload', {
  method: 'POST',
  body: formData
  // NO Content-Type header — browser handles it!
});

// FormData also works with <form> elements directly:
const form = document.querySelector('form');
const data = new FormData(form);\`}</pre>
  </section>

  <section>
    <h2>Request Options Reference</h2>
    <pre>{\`await fetch(url, {
  method: 'POST',             // GET | POST | PUT | PATCH | DELETE | ...
  headers: { ... },           // request headers
  body: '...',                // string | FormData | Blob | URLSearchParams
  credentials: 'include',     // send cookies cross-origin
  cache: 'no-store',          // bypass HTTP cache
  mode: 'cors',               // cors | no-cors | same-origin
  redirect: 'follow',         // follow | manual | error
  signal: abortController.signal   // see lesson 12-5
});\`}</pre>
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
  .form { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; }
  .form label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.85rem; }
  .form input, .form textarea { padding: 0.4rem; font-family: inherit; font-size: 0.85rem; }
  .hint { color: #555; font-size: 0.85rem; margin: 0 0 0.5rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
