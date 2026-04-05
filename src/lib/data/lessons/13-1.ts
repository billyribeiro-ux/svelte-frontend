import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-1',
		title: 'HTML Forms & FormData',
		phase: 4,
		module: 13,
		lessonIndex: 1
	},
	description: `Before we dive into SvelteKit's form actions, we need to understand how HTML forms actually work — because SvelteKit's magic is built directly on top of the real thing. A classic HTML form POSTs URL-encoded (or multipart) data to a URL and the browser does a full page navigation. No JavaScript required.

The browser packages form fields into a FormData object using each control's 'name' attribute. Controls without a name are IGNORED — the #1 bug in hand-rolled forms. And because the form works without JavaScript, SvelteKit apps are progressive: the server handles the submission even if the user's JS never loads.

This lesson covers the raw mechanics so that everything in lessons 13-2 through 13-5 makes sense.`,
	objectives: [
		'Build a form with method="POST" that submits without JavaScript',
		'Use name attributes correctly — unnamed fields are not submitted',
		'Extract values from a FormData object on the receiving end',
		'Handle multiple values (checkboxes, multi-select) and file uploads',
		'Understand application/x-www-form-urlencoded vs multipart/form-data',
		'Build forms that work progressively — with or without JS'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // In a real SvelteKit app, a <form method="POST"> would submit
  // to a +page.server.ts action. Here we intercept the submit to
  // show exactly what FormData looks like on the server side.
  // ---------------------------------------------------------------

  interface SubmissionEntry {
    name: string;
    value: string;
  }

  let lastSubmission: SubmissionEntry[] = $state([]);
  let lastContentType: string = $state('');
  let fileInfo: string = $state('');

  function onSubmit(e: SubmitEvent): void {
    // Prevent the default navigation so we can inspect the data.
    // In real SvelteKit you'd just let it submit (with use:enhance).
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;

    // The browser would build this exact object and send it.
    const data = new FormData(form);

    // Decide encoding based on the form's enctype attribute.
    lastContentType = form.enctype || 'application/x-www-form-urlencoded';

    const entries: SubmissionEntry[] = [];
    for (const [name, value] of data.entries()) {
      if (value instanceof File) {
        entries.push({
          name,
          value:
            'File("' + value.name + '", ' + value.size + ' bytes, ' + value.type + ')'
        });
      } else {
        entries.push({ name, value });
      }
    }

    // Pull the file out for richer display
    const file = data.get('avatar');
    if (file instanceof File && file.size > 0) {
      fileInfo = file.name + ' — ' + file.size + ' bytes';
    } else {
      fileInfo = '';
    }

    lastSubmission = entries;
  }

  // Demo for fields without a name
  let noNameDemo: SubmissionEntry[] = $state([]);
  function onNoNameSubmit(e: SubmitEvent): void {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);
    noNameDemo = [...data.entries()].map(([name, value]) => ({
      name,
      value: value instanceof File ? value.name : value
    }));
  }
</script>

<main>
  <h1>HTML Forms & FormData</h1>

  <section>
    <h2>1. The Anatomy of a POST Form</h2>
    <p class="hint">
      A form submitted with <code>method="POST"</code> packages every <strong>named</strong>
      control into a body and navigates the browser to the action URL.
    </p>
    <pre>{\`<form method="POST" action="/api/signup">
  <label>Email  <input name="email"    type="email"    required /></label>
  <label>Name   <input name="name"     type="text"     required /></label>
  <label>Age    <input name="age"      type="number"   min="13"  /></label>
  <label>Tags
    <select name="tags" multiple>
      <option value="svelte">Svelte</option>
      <option value="kit">SvelteKit</option>
    </select>
  </label>
  <button type="submit">Sign up</button>
</form>\`}</pre>
    <div class="callout">
      <strong>Rule #1:</strong> fields without a <code>name</code> attribute are NOT
      submitted. This catches everyone at least once.
    </div>
  </section>

  <section>
    <h2>2. Try It — Full Form</h2>
    <p class="hint">
      Fill this in and click Submit. We'll intercept it locally and show you exactly
      what a SvelteKit action would receive in <code>formData.entries()</code>.
    </p>
    <form onsubmit={onSubmit} enctype="multipart/form-data" class="real-form">
      <label>
        Email
        <input name="email" type="email" value="ada@example.com" required />
      </label>
      <label>
        Display name
        <input name="name" type="text" value="Ada" />
      </label>
      <label>
        Age
        <input name="age" type="number" value="30" />
      </label>

      <fieldset>
        <legend>Favourite frameworks (checkboxes share a name)</legend>
        <label class="inline">
          <input type="checkbox" name="fw" value="svelte" checked /> Svelte
        </label>
        <label class="inline">
          <input type="checkbox" name="fw" value="kit" checked /> SvelteKit
        </label>
        <label class="inline">
          <input type="checkbox" name="fw" value="vue" /> Vue
        </label>
      </fieldset>

      <fieldset>
        <legend>Plan (radios share a name)</legend>
        <label class="inline">
          <input type="radio" name="plan" value="free" checked /> Free
        </label>
        <label class="inline">
          <input type="radio" name="plan" value="pro" /> Pro
        </label>
      </fieldset>

      <label>
        Bio
        <textarea name="bio" rows="3">Hi there</textarea>
      </label>

      <label>
        Avatar
        <input type="file" name="avatar" accept="image/*" />
      </label>

      <button type="submit">Submit</button>
    </form>

    {#if lastSubmission.length > 0}
      <div class="output">
        <h3>What the server receives</h3>
        <p class="ct">Content-Type: <code>{lastContentType}</code></p>
        <table>
          <thead><tr><th>name</th><th>value</th></tr></thead>
          <tbody>
            {#each lastSubmission as entry, i (i)}
              <tr>
                <td><code>{entry.name}</code></td>
                <td><code>{entry.value}</code></td>
              </tr>
            {/each}
          </tbody>
        </table>
        {#if fileInfo}
          <p class="file-info">File: {fileInfo}</p>
        {/if}
      </div>
    {/if}
  </section>

  <section>
    <h2>3. The "name" Gotcha</h2>
    <p class="hint">
      The <code>second</code> field below has no <code>name</code>, so it never appears in
      the submission. This is the #1 hand-rolled-form bug.
    </p>
    <form onsubmit={onNoNameSubmit} class="real-form small">
      <label>
        First (named)
        <input name="first" value="I am submitted" />
      </label>
      <label>
        Second (no name)
        <input value="I am IGNORED" />
      </label>
      <button type="submit">Submit</button>
    </form>
    {#if noNameDemo.length > 0}
      <div class="output">
        <h3>Only these were sent</h3>
        <ul>
          {#each noNameDemo as entry, i (i)}
            <li><code>{entry.name}</code> = <code>{entry.value}</code></li>
          {/each}
        </ul>
      </div>
    {/if}
  </section>

  <section>
    <h2>4. How the Server Reads It</h2>
    <pre>{\`// src/routes/signup/+page.server.ts
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();

    // Single values — get() returns string | File | null
    const email = data.get('email')?.toString() ?? '';
    const name  = data.get('name')?.toString()  ?? '';
    const age   = Number(data.get('age') ?? 0);

    // Multi-value fields — getAll() returns an array
    const tags: string[] = data.getAll('fw').map(v => v.toString());

    // Files
    const avatar = data.get('avatar');
    if (avatar instanceof File && avatar.size > 0) {
      await saveFile(avatar);
    }

    return { success: true };
  }
};\`}</pre>
  </section>

  <section>
    <h2>5. Encodings</h2>
    <table>
      <thead>
        <tr><th>enctype</th><th>When to use</th><th>Notes</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><code>application/x-www-form-urlencoded</code></td>
          <td>Default. Text fields only.</td>
          <td>Fields joined as <code>a=1&amp;b=2</code>. No files.</td>
        </tr>
        <tr>
          <td><code>multipart/form-data</code></td>
          <td>Any form with <code>&lt;input type="file"&gt;</code></td>
          <td>Required for file uploads. Browser picks a boundary.</td>
        </tr>
        <tr>
          <td><code>text/plain</code></td>
          <td>Never (debugging only)</td>
          <td>Not safely parseable; not supported by SvelteKit actions.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>6. Progressive Enhancement</h2>
    <pre>{\`<!-- With no JavaScript at all, this form still works:
     the browser POSTs to /signup and the server returns HTML. -->
<form method="POST" action="?/signup">
  <input name="email" />
  <button>Go</button>
</form>

<!-- Layer JS on top later with use:enhance (see lesson 13-4) —
     same markup, same server code, zero duplication. -->\`}</pre>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  h2 { margin-top: 0; }
  .hint { color: #555; font-size: 0.9rem; margin: 0 0 0.75rem; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85rem; }
  .callout { background: #fff3e0; padding: 0.6rem 0.8rem; border-left: 3px solid #ff9800; border-radius: 4px; font-size: 0.9rem; }
  .real-form { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; background: #fafafa; border-radius: 6px; }
  .real-form.small { gap: 0.4rem; }
  .real-form label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.9rem; }
  .real-form label.inline { flex-direction: row; align-items: center; gap: 0.3rem; font-weight: normal; }
  .real-form input, .real-form textarea, .real-form select { padding: 0.4rem; font-family: inherit; font-size: 0.9rem; }
  .real-form fieldset { border: 1px solid #ddd; border-radius: 4px; padding: 0.5rem 0.75rem; display: flex; flex-wrap: wrap; gap: 0.75rem; }
  .real-form legend { font-size: 0.8rem; color: #666; padding: 0 0.3rem; }
  .real-form button { align-self: flex-start; padding: 0.5rem 1rem; cursor: pointer; background: #1565c0; color: white; border: none; border-radius: 4px; }
  .output { margin-top: 0.75rem; padding: 0.75rem; background: #f0f7ff; border-radius: 4px; font-size: 0.85rem; }
  .output h3 { margin: 0 0 0.5rem; font-size: 0.95rem; }
  .output table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
  .output th, .output td { padding: 0.3rem 0.5rem; border: 1px solid #cce; text-align: left; }
  .ct { font-size: 0.8rem; margin: 0 0 0.5rem; }
  .file-info { font-size: 0.8rem; color: #333; margin-top: 0.5rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
