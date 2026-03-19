import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-2',
		title: 'Default & Named Actions',
		phase: 4,
		module: 13,
		lessonIndex: 2
	},
	description: `SvelteKit form actions are functions that handle POST requests on the server. A page can have a default action (handles plain POST) or named actions (handles POST to specific action URLs like ?/login or ?/register). This lets you have multiple forms on a single page, each routed to a different handler.

Named actions are invoked by setting the form's action attribute to "?/actionName". This simple URL convention keeps your forms clean and your server logic organized.`,
	objectives: [
		'Create a default action in +page.server.ts for simple forms',
		'Define named actions for multiple forms on one page',
		'Use the ?/actionName URL pattern in form action attributes',
		'Return data from actions to the page component'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  let activeTab: string = $state('default');
</script>

<main>
  <h1>Default & Named Actions</h1>

  <nav>
    {#each ['default', 'named', 'multiple'] as tab}
      <button class:active={activeTab === tab} onclick={() => activeTab = tab}>
        {tab}
      </button>
    {/each}
  </nav>

  {#if activeTab === 'default'}
    <section>
      <h2>Default Action</h2>
      <pre>{\`// +page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const message = data.get('message') as string;

    // Save to database, send email, etc.
    await db.messages.create({ data: { message } });

    return { success: true };
  }
};\`}</pre>
      <pre>{\`<!-- +page.svelte -->
<!-- No action attribute needed for default -->
<form method="POST">
  <input name="message" required />
  <button>Send</button>
</form>\`}</pre>
      <div class="demo-box">
        <p>The <strong>default</strong> action handles any POST to this page without a specific action URL.</p>
      </div>
    </section>

  {:else if activeTab === 'named'}
    <section>
      <h2>Named Actions</h2>
      <pre>{\`// +page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  login: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    const user = await authenticate(email, password);
    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }
    return { success: true };
  },

  register: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const name = data.get('name') as string;

    await createUser({ email, password, name });
    return { success: true };
  }
};\`}</pre>
      <pre>{\`<!-- +page.svelte -->
<!-- action="?/login" targets the "login" action -->
<form method="POST" action="?/login">
  <input name="email" type="email" />
  <input name="password" type="password" />
  <button>Log In</button>
</form>

<!-- action="?/register" targets the "register" action -->
<form method="POST" action="?/register">
  <input name="name" />
  <input name="email" type="email" />
  <input name="password" type="password" />
  <button>Register</button>
</form>\`}</pre>
    </section>

  {:else if activeTab === 'multiple'}
    <section>
      <h2>Multiple Forms Example</h2>
      <pre>{\`// +page.server.ts — a settings page
export const actions: Actions = {
  updateProfile: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name');
    await db.users.update({ name });
    return { profileUpdated: true };
  },

  changePassword: async ({ request }) => {
    const data = await request.formData();
    const current = data.get('current_password');
    const next = data.get('new_password');
    await updatePassword(current, next);
    return { passwordChanged: true };
  },

  deleteAccount: async ({ request, cookies }) => {
    const data = await request.formData();
    const confirm = data.get('confirm');
    if (confirm !== 'DELETE') {
      return { error: 'Type DELETE to confirm' };
    }
    await db.users.delete({ id: locals.userId });
    cookies.delete('session', { path: '/' });
    redirect(303, '/goodbye');
  }
};\`}</pre>
      <pre>{\`<!-- Three separate forms, three separate actions -->
<h2>Profile</h2>
<form method="POST" action="?/updateProfile">
  <input name="name" value={data.user.name} />
  <button>Save Profile</button>
</form>

<h2>Password</h2>
<form method="POST" action="?/changePassword">
  <input name="current_password" type="password" />
  <input name="new_password" type="password" />
  <button>Change Password</button>
</form>

<h2>Danger Zone</h2>
<form method="POST" action="?/deleteAccount">
  <input name="confirm" placeholder='Type "DELETE"' />
  <button class="danger">Delete Account</button>
</form>\`}</pre>
    </section>
  {/if}
</main>

<style>
  main { max-width: 650px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; margin-bottom: 0.75rem; }
  nav { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  nav button { padding: 0.5rem 1rem; cursor: pointer; border: 1px solid #ddd; border-radius: 4px; background: white; }
  nav button.active { background: #4a90d9; color: white; border-color: #4a90d9; }
  .demo-box { background: #e8f5e9; padding: 0.75rem 1rem; border-radius: 4px; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
