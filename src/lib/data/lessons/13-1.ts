import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-1',
		title: 'HTML Forms & FormData',
		phase: 4,
		module: 13,
		lessonIndex: 1
	},
	description: `HTML forms are the web's built-in mechanism for sending data to the server. When a form has method="POST", the browser sends the form data as a request body without any JavaScript. SvelteKit embraces this with form actions, making forms work with or without JavaScript enabled — this is progressive enhancement.

This lesson covers how HTML forms work at the protocol level, how FormData represents form fields, and how SvelteKit handles form submissions on the server.`,
	objectives: [
		'Create forms with method="POST" for server-side submission',
		'Understand how FormData represents form field values',
		'Handle form submissions in SvelteKit actions',
		'Appreciate progressive enhancement — forms work without JavaScript'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // In SvelteKit, <form method="POST"> posts to the same route's
  // +page.server.ts actions. This demo shows the concepts.

  let formSubmitted: boolean = $state(false);
  let submittedData: Record<string, string> = $state({});

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // FormData works like a Map
    submittedData = {};
    for (const [key, value] of formData.entries()) {
      submittedData[key] = value as string;
    }
    formSubmitted = true;
  }
</script>

<main>
  <h1>HTML Forms & FormData</h1>

  <section>
    <h2>How It Works in SvelteKit</h2>
    <pre>{\`<!-- +page.svelte -->
<form method="POST">
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Log In</button>
</form>

<!-- +page.server.ts -->
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    // Validate, authenticate, etc.
    const user = await login(email, password);
    return { success: true };
  }
};\`}</pre>
  </section>

  <section>
    <h2>Live Form Demo</h2>
    <form onsubmit={handleSubmit}>
      <div class="field">
        <label for="name">Name</label>
        <input id="name" name="name" type="text" required placeholder="Your name" />
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" required placeholder="you@example.com" />
      </div>

      <div class="field">
        <label for="role">Role</label>
        <select id="role" name="role">
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div class="field">
        <label>
          <input name="newsletter" type="checkbox" value="yes" />
          Subscribe to newsletter
        </label>
      </div>

      <button type="submit">Submit</button>
    </form>

    {#if formSubmitted}
      <div class="result">
        <h3>FormData Contents:</h3>
        {#each Object.entries(submittedData) as [key, value]}
          <p><strong>{key}:</strong> {value}</p>
        {/each}
        <p><em>Note: unchecked checkboxes are NOT included in FormData — they are simply absent.</em></p>
      </div>
    {/if}
  </section>

  <section>
    <h2>Progressive Enhancement</h2>
    <pre>{\`<!-- Without JavaScript: form posts normally, page reloads -->
<!-- With JavaScript: SvelteKit intercepts and fetches -->

<!-- The key insight: your form WORKS either way! -->
<form method="POST">
  <!-- name attributes are required for FormData -->
  <input name="search" type="text" />
  <button>Search</button>
</form>

<!-- FormData API -->
const fd = new FormData(formElement);
fd.get('search');      // get a single value
fd.getAll('tags');     // get all values for a name
fd.has('newsletter');  // check if field exists
fd.entries();          // iterate all key-value pairs\`}</pre>
  </section>
</main>

<style>
  main { max-width: 550px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  .field { margin-bottom: 1rem; }
  .field label { display: block; font-weight: bold; margin-bottom: 0.25rem; }
  input[type="text"], input[type="email"], select {
    width: 100%; padding: 0.5rem; font-size: 1rem; box-sizing: border-box;
  }
  button { padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; }
  .result { background: #e8f5e9; padding: 1rem; border-radius: 4px; margin-top: 1rem; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
