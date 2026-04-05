import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-2',
		title: 'Default & Named Actions',
		phase: 4,
		module: 13,
		lessonIndex: 2
	},
	description: `SvelteKit's form actions let a single +page.server.ts expose one or more server-side mutation handlers. A default action handles forms that POST to the page URL; named actions let a single page expose multiple mutations (login, register, delete, etc.) and pick between them with '?/action' in the form action attribute.

This is the sweet spot: your HTML forms still work without JavaScript, and your server logic lives right next to the page it serves. No more scattered /api/ routes that exist only to back one form.`,
	objectives: [
		'Write a default action with export const actions',
		'Write multiple named actions on a single route',
		'Target a named action with action="?/actionName"',
		'Pick an action per-button with formaction on the submit button',
		'Understand the difference between actions and +server.ts routes'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // In a real SvelteKit app, the forms below would POST to real
  // actions declared in +page.server.ts. Here we simulate the
  // server locally so you can see each action run and what
  // formData.get('...') would return.
  // ---------------------------------------------------------------

  type ActionName = 'default' | 'login' | 'register' | 'delete' | 'upgrade';

  interface ActionLog {
    action: ActionName;
    fields: Record<string, string>;
    result: string;
    ok: boolean;
  }

  let logs: ActionLog[] = $state([]);

  function runFakeAction(action: ActionName, fields: Record<string, string>): void {
    // Simulate what a real action body might do.
    let result = '';
    let ok = true;
    if (action === 'login') {
      if (fields.email && fields.password) {
        result = 'Logged in as ' + fields.email;
      } else {
        result = 'Missing credentials';
        ok = false;
      }
    } else if (action === 'register') {
      result = 'Account created for ' + fields.email;
    } else if (action === 'delete') {
      result = 'Deleted item #' + fields.id;
    } else if (action === 'upgrade') {
      result = 'Upgraded to ' + fields.plan;
    } else {
      result = 'Default action ran with ' + Object.keys(fields).length + ' fields';
    }
    logs = [{ action, fields, result, ok }, ...logs].slice(0, 10);
  }

  function onSubmit(action: ActionName, e: SubmitEvent): void {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    const fields: Record<string, string> = {};
    for (const [k, v] of data.entries()) {
      fields[k] = v instanceof File ? v.name : v.toString();
    }
    runFakeAction(action, fields);
  }
</script>

<main>
  <h1>Default & Named Actions</h1>

  <section>
    <h2>1. The Default Action</h2>
    <p class="hint">
      One action per page. Submit any <code>&lt;form method="POST"&gt;</code> on the page
      and it runs.
    </p>
    <pre>{\`// src/routes/contact/+page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email   = data.get('email')?.toString()   ?? '';
    const message = data.get('message')?.toString() ?? '';

    await sendContactEmail({ email, message });
    return { success: true };
  }
};\`}</pre>
    <pre>{\`<!-- src/routes/contact/+page.svelte -->
<form method="POST">
  <input name="email" type="email"  required />
  <textarea name="message" required></textarea>
  <button>Send</button>
</form>\`}</pre>
  </section>

  <section>
    <h2>2. Named Actions — One Page, Many Mutations</h2>
    <p class="hint">
      When you need more than one mutation on a page (login + register, edit + delete,
      etc.), give each action a name and target it with <code>action="?/name"</code>.
    </p>
    <pre>{\`// src/routes/auth/+page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const user = await authenticate(
      data.get('email'),
      data.get('password')
    );
    if (!user) return fail(401, { error: 'Invalid credentials' });

    cookies.set('session', user.sessionId, { path: '/' });
    return { success: true };
  },

  register: async ({ request }) => {
    const data = await request.formData();
    await createUser({
      email: data.get('email'),
      password: data.get('password')
    });
    return { success: true };
  }
};\`}</pre>
    <pre>{\`<!-- src/routes/auth/+page.svelte -->
<form method="POST" action="?/login">
  <input name="email" />
  <input name="password" type="password" />
  <button>Log in</button>
</form>

<form method="POST" action="?/register">
  <input name="email" />
  <input name="password" type="password" />
  <button>Sign up</button>
</form>\`}</pre>
    <div class="demo-block">
      <strong>Try it:</strong> two forms, two different named actions on the same page.
      <div class="forms">
        <form onsubmit={(e) => onSubmit('login', e)} class="mini">
          <strong>Login</strong>
          <input name="email" type="email" placeholder="email" value="ada@x.com" />
          <input name="password" type="password" placeholder="password" value="secret" />
          <button>Log in</button>
        </form>
        <form onsubmit={(e) => onSubmit('register', e)} class="mini">
          <strong>Register</strong>
          <input name="email" type="email" placeholder="email" value="new@x.com" />
          <input name="password" type="password" placeholder="password" value="secret" />
          <button>Register</button>
        </form>
      </div>
    </div>
  </section>

  <section>
    <h2>3. Multiple Buttons, One Form (formaction)</h2>
    <p class="hint">
      When actions share most fields, skip the duplicate form — use <code>formaction</code>
      on each submit button to pick which action runs.
    </p>
    <pre>{\`<form method="POST">
  <input name="id" value={item.id} hidden />
  <input name="title" value={item.title} />

  <!-- Save uses the 'save' action -->
  <button formaction="?/save">Save</button>

  <!-- Delete uses the 'delete' action with the same data -->
  <button formaction="?/delete">Delete</button>
</form>\`}</pre>
    <div class="demo-block">
      <strong>Try it:</strong> same form, two submit buttons targeting different actions.
      <form
        onsubmit={(e) => {
          const submitter = (e as SubmitEvent).submitter as HTMLButtonElement | null;
          const which = (submitter?.value as ActionName) ?? 'default';
          onSubmit(which, e);
        }}
        class="mini"
      >
        <input name="id" value="42" readonly />
        <input name="title" value="My item" />
        <div class="row">
          <button type="submit" name="which" value="upgrade">Upgrade</button>
          <button type="submit" name="which" value="delete">Delete</button>
        </div>
      </form>
      <p class="note">
        (In real SvelteKit you'd use <code>formaction="?/upgrade"</code> and
        <code>formaction="?/delete"</code>; this playground simulates by reading
        the clicked button.)
      </p>
    </div>
  </section>

  <section>
    <h2>4. Actions vs +server.ts API Routes</h2>
    <table>
      <thead>
        <tr><th></th><th>Actions</th><th>+server.ts</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Lives next to</td>
          <td>A page (+page.server.ts)</td>
          <td>Its own URL</td>
        </tr>
        <tr>
          <td>Works without JS</td>
          <td>yes (classic form POST)</td>
          <td>no — you need fetch</td>
        </tr>
        <tr>
          <td>Input</td>
          <td>FormData</td>
          <td>Anything (JSON, FormData, bytes)</td>
        </tr>
        <tr>
          <td>Callable from outside</td>
          <td>only via the page URL</td>
          <td>yes — mobile app, webhook, etc.</td>
        </tr>
        <tr>
          <td>Best for</td>
          <td>Forms that mutate the current page's data</td>
          <td>Reusable JSON APIs / webhooks</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Action Log (simulated)</h2>
    {#if logs.length === 0}
      <p class="muted">Submit a form above to see what the server would receive.</p>
    {:else}
      <ul class="log">
        {#each logs as entry, i (i)}
          <li class:ok={entry.ok} class:fail={!entry.ok}>
            <strong>{entry.action}</strong> —
            {entry.result}
            <div class="fields">
              {#each Object.entries(entry.fields) as [k, v] (k)}
                <code>{k}={v}</code>
              {/each}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  h2 { margin-top: 0; }
  .hint { color: #555; font-size: 0.9rem; margin: 0 0 0.75rem; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }
  .demo-block { margin-top: 0.75rem; padding: 0.75rem; background: #f0f7ff; border-radius: 6px; font-size: 0.9rem; }
  .forms { display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap; }
  .mini { display: flex; flex-direction: column; gap: 0.4rem; padding: 0.6rem; background: white; border: 1px solid #cce; border-radius: 4px; flex: 1; min-width: 220px; }
  .mini strong { font-size: 0.85rem; color: #1565c0; }
  .mini input { padding: 0.35rem; font-size: 0.85rem; }
  .mini button { padding: 0.4rem; cursor: pointer; background: #1565c0; color: white; border: none; border-radius: 3px; }
  .row { display: flex; gap: 0.5rem; }
  .note { font-size: 0.75rem; color: #666; margin: 0.4rem 0 0; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; }
  .log { list-style: none; padding: 0; margin: 0; }
  .log li { padding: 0.5rem 0.75rem; margin-bottom: 0.4rem; border-radius: 4px; font-size: 0.85rem; }
  .log li.ok { background: #e8f5e9; border-left: 3px solid #4caf50; }
  .log li.fail { background: #ffebee; border-left: 3px solid #f44336; }
  .fields { margin-top: 0.3rem; display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .fields code { font-size: 0.75rem; }
  .muted { color: #888; font-style: italic; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
