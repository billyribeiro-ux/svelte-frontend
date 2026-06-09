import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-4',
		title: 'use:enhance & Remote form()',
		phase: 4,
		module: 13,
		lessonIndex: 4
	},
	description: `A classic HTML form POST triggers a full page navigation — the browser discards your page, makes the request, and renders the response. That's fine (and resilient), but a single-page feel is nicer: submit, show a spinner, update the form prop in place without losing scroll position.

use:enhance is the SvelteKit action (the Svelte-action kind, not the form-action kind) that does exactly that. Slap it on a form and it upgrades POST behaviour to fetch, intercepts the response, and updates the 'form' prop — all while keeping the form fully functional if JavaScript fails to load. That's progressive enhancement in one line.

This lesson covers use:enhance with and without a callback, loading states, confirmation dialogs, and the reset:false option for keeping user input after a failed submit.

**The modern path: remote \`form()\` (SvelteKit 2.27+).** Everything use:enhance bolts on by hand — progressive enhancement, repopulation, loading states, per-field errors — comes built in with the remote \`form()\` function from \`$app/server\`. You declare a Standard Schema (Zod 4 / Valibot), spread the form object onto a \`<form>\` element (\`<form {...createPost}>\`), and get a typed *fields API*: \`fields.title.as('text')\` emits name/type/value/aria-invalid attributes, \`fields.title.issues()\` returns validation messages, \`validate()\` runs validation on every input, \`preflight(schema)\` blocks invalid submissions client-side, and \`invalid()\`/\`issue\` let the server handler reject programmatically. Multiple submit buttons become \`fields.action.as('submit', 'login')\`. Mutations refresh queries in a single flight instead of a blanket invalidateAll. The migration story is mechanical — this lesson teaches use:enhance for the (large) installed base of form actions, then maps every concept onto its remote-form equivalent so you can write new forms the modern way.`,
	objectives: [
		'Add use:enhance to upgrade a classic form to fetch-based submission',
		'Customize behaviour with an enhance callback and a result handler',
		'Show a per-form loading state while submitting',
		'Add a confirmation dialog inside the enhance callback',
		'Use reset:false to keep user input on failure',
		'Understand the SubmitFunction signature and its result types',
		'Declare a remote form() with a Standard Schema (Zod 4 / Valibot) and spread it onto <form>',
		'Use the fields API: .as(type), issues(), validate(), allIssues() and preflight()',
		'Reject programmatically in the handler with invalid() and the typed issue helper',
		'Handle multiple submit buttons with fields.action.as("submit", value)',
		'Migrate a form-action + use:enhance form to remote form() step by step'
	],
	files: [
		{
			filename: 'App.svelte',
			content: `<script lang="ts">
  // ---------------------------------------------------------------
  // This playground simulates use:enhance locally.
  //
  // In a real SvelteKit app you'd write:
  //
  //   <script lang="ts">
  //     import { enhance } from '$app/forms';
  //     let { form } = $props();
  //     let submitting = $state(false);
  //   </\${''}script>
  //
  //   <form method="POST" action="?/save"
  //         use:enhance={() => {
  //           submitting = true;
  //           return async ({ result, update }) => {
  //             await update();        // applies the form update
  //             submitting = false;
  //           };
  //         }}>
  //     ...
  //   </form>
  //
  // The enhance callback runs BEFORE the fetch — you can cancel or
  // modify the submission. It optionally returns a handler that
  // runs AFTER the response — you choose whether to update the UI.
  // ---------------------------------------------------------------

  interface SaveResult {
    status: number;
    success: boolean;
    message: string;
    title: string;
  }

  let title: string = $state('My first post');
  let saving: boolean = $state(false);
  let result: SaveResult | null = $state.raw(null);

  async function fakeSave(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const t = (data.get('title') ?? '').toString().trim();

    saving = true;
    await new Promise((r) => setTimeout(r, 700));

    if (!t) {
      result = { status: 400, success: false, message: 'Title required', title: t };
    } else if (t.toLowerCase() === 'fail') {
      result = { status: 500, success: false, message: 'Server error', title: t };
    } else {
      result = { status: 200, success: true, message: 'Saved "' + t + '"', title: t };
    }
    saving = false;
  }

  // Delete with confirmation pattern
  let deleteCount: number = $state(0);
  let deleteBlocked: number = $state(0);

  function fakeDelete(e: SubmitEvent): void {
    e.preventDefault();
    const ok = confirm('Really delete this item?');
    if (!ok) {
      deleteBlocked++;
      return;
    }
    deleteCount++;
  }

  // ---------------------------------------------------------------
  // SIMULATED remote form() fields API.
  // The real thing needs a SvelteKit server (this playground is
  // client-only), so we reproduce the observable behaviour:
  // issues() appear per field once touched, aria-invalid is set,
  // and validate() runs on every input.
  // ---------------------------------------------------------------
  interface Issue {
    message: string;
  }

  let rfTitle: string = $state('');
  let rfContent: string = $state('');
  let rfTouched: { title: boolean; content: boolean } = $state({ title: false, content: false });
  let rfSubmitted: boolean = $state(false);
  let rfPending: boolean = $state(false);
  let rfResult: string = $state('');

  // what createPost.fields.title.issues() would return
  const rfTitleIssues: Issue[] = $derived(
    (rfTouched.title || rfSubmitted) && rfTitle.trim() === ''
      ? [{ message: 'Title must not be empty' }]
      : []
  );
  const rfContentIssues: Issue[] = $derived(
    (rfTouched.content || rfSubmitted) && rfContent.trim().length < 10
      ? [{ message: 'Content must be at least 10 characters' }]
      : []
  );

  async function rfSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    rfSubmitted = true;
    if (rfTitle.trim() === '' || rfContent.trim().length < 10) return; // preflight blocks
    rfPending = true;
    await new Promise((r) => setTimeout(r, 600));
    rfPending = false;
    rfResult = 'Published "' + rfTitle + '" (result is ephemeral, like createPost.result)';
  }
</script>

<main>
  <h1>use:enhance</h1>

  <section>
    <h2>1. The One-Line Upgrade</h2>
    <p class="hint">
      Any <code>method="POST"</code> form becomes a fetch-based, no-refresh submission
      — but keeps working exactly the same way if JS fails to load.
    </p>
    <pre>{\`<script lang="ts">
  import { enhance } from '$app/forms';
  let { form } = $props();
</\${''}script>

<form method="POST" use:enhance>
  <input name="title" value={form?.title ?? ''} />
  <button>Save</button>
</form>\`}</pre>
  </section>

  <section>
    <h2>2. The Callback — Loading States & Custom Handling</h2>
    <pre>{\`<script lang="ts">
  import { enhance } from '$app/forms';
  import type { SubmitFunction } from '@sveltejs/kit';

  let { form } = $props();
  let saving = $state(false);

  const handleSubmit: SubmitFunction = () => {
    // Runs BEFORE fetch — set loading state, validate locally, etc.
    saving = true;

    return async ({ result, update }) => {
      // Runs AFTER fetch with the result of the action.
      //
      // result types:
      //   { type: 'success', data?: unknown }
      //   { type: 'failure', data?: unknown }
      //   { type: 'redirect', location: string }
      //   { type: 'error', error: App.Error }
      //
      // update() applies the default behaviour: reset the form on
      // success, update the 'form' prop, invalidate all load data.
      //
      // You can skip it entirely and handle result yourself.
      await update({ reset: false });   // keep user input

      if (result.type === 'success') {
        showToast('Saved!');
      }

      saving = false;
    };
  };
</\${''}script>

<form method="POST" use:enhance={handleSubmit}>
  <input name="title" value={form?.title ?? ''} />
  <button disabled={saving}>
    {saving ? 'Saving...' : 'Save'}
  </button>
</form>\`}</pre>
  </section>

  <section>
    <h2>3. Try It — simulated save with loading state</h2>
    <p class="hint">
      Submit with "fail" as the title to see a 500. Submit empty for a 400.
      Otherwise it succeeds. Notice the input isn't cleared on failure
      (<code>reset: false</code>).
    </p>
    <form onsubmit={fakeSave} class="real">
      <label>
        Title
        <input
          name="title"
          bind:value={title}
          class:invalid={result?.status === 400}
        />
      </label>
      <button disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
      {#if result}
        <div
          class="banner"
          class:ok={result.success}
          class:fail={!result.success}
        >
          <strong>{result.status}:</strong> {result.message}
        </div>
      {/if}
    </form>
  </section>

  <section>
    <h2>4. Confirmation Pattern</h2>
    <p class="hint">
      Dangerous actions should confirm before submitting. Return <code>cancel()</code>
      from the enhance callback to abort.
    </p>
    <pre>{\`<form method="POST" action="?/delete" use:enhance={({ cancel }) => {
  if (!confirm('Really delete this item?')) {
    cancel();        // abort the submission
    return;
  }
  return async ({ update }) => {
    await update();
  };
}}>
  <button>Delete</button>
</form>\`}</pre>
    <form onsubmit={fakeDelete} class="real">
      <button class="danger">Delete item</button>
      <p class="note">
        Confirmed deletes: <strong>{deleteCount}</strong> ·
        Cancelled: <strong>{deleteBlocked}</strong>
      </p>
    </form>
  </section>

  <section>
    <h2>5. SubmitFunction Arguments</h2>
    <table>
      <thead>
        <tr><th>Arg</th><th>Purpose</th></tr>
      </thead>
      <tbody>
        <tr><td><code>action</code></td><td>The URL + ?/name the form is posting to</td></tr>
        <tr><td><code>formData</code></td><td>The serialised form body (mutable before submit)</td></tr>
        <tr><td><code>formElement</code></td><td>The HTMLFormElement itself</td></tr>
        <tr><td><code>controller</code></td><td>AbortController for cancellation</td></tr>
        <tr><td><code>submitter</code></td><td>Which button was clicked (for formaction dispatch)</td></tr>
        <tr><td><code>cancel()</code></td><td>Abort the submission before it leaves the browser</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>6. update() vs Doing It Yourself</h2>
    <pre>{\`// Default behaviour — call update() with no args:
return async ({ update }) => {
  await update();   // resets the form on success, updates 'form' prop,
                    // invalidates all loads, applies redirects
};

// Keep the user's input after a failed submit:
return async ({ update }) => {
  await update({ reset: false });
};

// Skip update() entirely and handle the result yourself:
return async ({ result }) => {
  if (result.type === 'success') {
    myToastStore.push('Done!');
    // Don't call update() — nothing else happens.
  } else if (result.type === 'failure') {
    myErrorStore.set(result.data);
  }
};\`}</pre>
  </section>

  <section class="modern">
    <h2>7. The Modern Path: Remote form() (SvelteKit 2.27+)</h2>
    <p class="hint">
      A remote <code>form()</code> bundles everything above — progressive enhancement,
      repopulation, per-field errors, loading state — behind a typed, schema-validated API.
      Declare it once in a <code>.remote.ts</code> file:
    </p>
    <pre>{\`// src/routes/blog/data.remote.ts
import * as v from 'valibot';
import { redirect, invalid } from '@sveltejs/kit';
import { form } from '$app/server';
import * as db from '$lib/server/database';

export const createPost = form(
  v.object({
    title: v.pipe(v.string(), v.nonEmpty('Title must not be empty')),
    content: v.pipe(v.string(), v.minLength(10, 'At least 10 characters'))
  }),
  async ({ title, content }, issue) => {
    const slug = title.toLowerCase().replace(/ /g, '-');

    if (await db.slugExists(slug)) {
      // programmatic validation — typed, throws like redirect()
      invalid(issue.title('A post with this title already exists'));
    }

    await db.createPost({ slug, title, content });
    redirect(303, '/blog/' + slug);
  }
);\`}</pre>
    <p class="hint">
      ...then spread it onto a <code>&lt;form&gt;</code>. The <strong>fields API</strong>
      replaces hand-written name attributes, repopulation and error rendering:
    </p>
    <pre>{\`<script lang="ts">
  import { createPost } from '../data.remote';
</\${''}script>

<!-- works without JS; progressively enhanced automatically -->
<form {...createPost} oninput={() => createPost.validate()}>
  <label>
    Title
    <!-- emits type, name, value and aria-invalid -->
    <input {...createPost.fields.title.as('text')} />
  </label>
  {#each createPost.fields.title.issues() as issue (issue.message)}
    <p class="issue">{issue.message}</p>
  {/each}

  <label>
    Content
    <textarea {...createPost.fields.content.as('text')}></textarea>
  </label>
  {#each createPost.fields.content.issues() as issue (issue.message)}
    <p class="issue">{issue.message}</p>
  {/each}

  <button disabled={!!createPost.pending}>
    {createPost.pending ? 'Publishing…' : 'Publish!'}
  </button>
</form>\`}</pre>
    <p class="hint">
      Block invalid submissions client-side with a <strong>preflight</strong> schema
      (<code>&lt;form {'{...createPost.preflight(schema)}'}&gt;</code>), list every problem
      with <code>fields.allIssues()</code>, and customise submission with
      <code>createPost.enhance(async (form) =&gt; {'{ await form.submit(); form.element.reset(); }'})</code>.
    </p>
  </section>

  <section class="modern">
    <h2>8. Multiple Submit Buttons — as('submit', value)</h2>
    <p class="hint">
      The form-actions <code>formaction="?/register"</code> trick becomes a typed field:
    </p>
    <pre>{\`// $lib/auth.remote.ts
export const loginOrRegister = form(
  v.object({
    username: v.string(),
    _password: v.string(),   // leading _ = never echoed back to the client
    action: v.picklist(['login', 'register'])
  }),
  async ({ username, _password, action }) => {
    if (action === 'login') { /* ... */ } else { /* ... */ }
  }
);

// +page.svelte
<form {...loginOrRegister}>
  <input {...loginOrRegister.fields.username.as('text')} />
  <input {...loginOrRegister.fields._password.as('password')} />

  <button {...loginOrRegister.fields.action.as('submit', 'login')}>login</button>
  <button {...loginOrRegister.fields.action.as('submit', 'register')}>register</button>
</form>\`}</pre>
  </section>

  <section class="modern">
    <h2>9. Try It — simulated fields API</h2>
    <p class="hint">
      This playground is client-only, so here is a faithful simulation: issues appear per
      field once you touch it (or submit), exactly like
      <code>fields.title.issues()</code> with <code>validate()</code> wired to
      <code>oninput</code>. Content needs 10+ characters.
    </p>
    <form onsubmit={rfSubmit} class="real">
      <label>
        Title
        <input
          name="title"
          bind:value={rfTitle}
          onblur={() => (rfTouched.title = true)}
          aria-invalid={rfTitleIssues.length > 0}
          class:invalid={rfTitleIssues.length > 0}
        />
      </label>
      {#each rfTitleIssues as issue (issue.message)}
        <p class="issue">{issue.message}</p>
      {/each}

      <label>
        Content
        <textarea
          name="content"
          rows="3"
          bind:value={rfContent}
          onblur={() => (rfTouched.content = true)}
          aria-invalid={rfContentIssues.length > 0}
          class:invalid={rfContentIssues.length > 0}
        ></textarea>
      </label>
      {#each rfContentIssues as issue (issue.message)}
        <p class="issue">{issue.message}</p>
      {/each}

      <button disabled={rfPending}>
        {rfPending ? 'Publishing…' : 'Publish!'}
      </button>
      {#if rfResult}
        <div class="banner ok">{rfResult}</div>
      {/if}
    </form>
  </section>

  <section class="modern">
    <h2>10. Migration Map: Form Actions → Remote form()</h2>
    <table>
      <thead>
        <tr><th>Form actions + use:enhance</th><th>Remote form()</th></tr>
      </thead>
      <tbody>
        <tr><td><code>export const actions</code> in +page.server.ts</td><td><code>export const x = form(schema, handler)</code> in a .remote.ts file</td></tr>
        <tr><td><code>&lt;form method="POST" action="?/save" use:enhance&gt;</code></td><td><code>&lt;form {'{...x}'}&gt;</code> — method, action and enhancement included</td></tr>
        <tr><td>manual <code>request.formData()</code> parsing + <code>fail(400, …)</code></td><td>Standard Schema validates first; <code>issues()</code> populate automatically</td></tr>
        <tr><td>server-side edge cases via <code>fail()</code></td><td><code>invalid(issue.field('message'))</code> — typed, throws like redirect()</td></tr>
        <tr><td><code>form</code> prop / <code>page.form</code></td><td><code>x.result</code> (ephemeral, typed from the handler's return)</td></tr>
        <tr><td>repopulating <code>value={'{form?.title}'}</code> by hand</td><td><code>x.fields.title.as('text')</code> emits name/value/aria-invalid</td></tr>
        <tr><td><code>formaction="?/register"</code></td><td><code>x.fields.action.as('submit', 'register')</code></td></tr>
        <tr><td>custom <code>SubmitFunction</code> callback</td><td><code>x.enhance(async (form) =&gt; { … await form.submit() … })</code></td></tr>
        <tr><td><code>invalidateAll()</code> after success (everything refetches)</td><td>single-flight mutations — handler refreshes exactly the queries that changed (lesson 13-5)</td></tr>
        <tr><td>works today, stable API</td><td>requires <code>kit.experimental.remoteFunctions</code> + <code>experimental.async</code></td></tr>
      </tbody>
    </table>
    <p class="hint">
      <strong>When to choose which (June 2026):</strong> existing apps full of form actions
      are fine — don't rewrite for the sake of it. For new mutation surfaces, reach for
      remote <code>form()</code> first: you get validation, typing, field plumbing and
      single-flight refreshes for free, and it degrades without JavaScript just like a
      classic action. Full API in Module 17 Lesson 3.
    </p>
  </section>
</main>

<style>
  main { max-width: 720px; margin: 0 auto; font-family: sans-serif; }
  section { margin-bottom: 1.5rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
  h2 { margin-top: 0; }
  .hint { color: #555; font-size: 0.9rem; margin: 0 0 0.75rem; }
  pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; font-size: 0.8rem; }
  code { background: #e8e8e8; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.82rem; }
  .real { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; background: #fafafa; border-radius: 6px; }
  .real label { display: flex; flex-direction: column; gap: 0.2rem; font-size: 0.9rem; }
  .real input { padding: 0.45rem; font-family: inherit; font-size: 0.9rem; border: 1px solid #bbb; border-radius: 3px; }
  .real input.invalid { border-color: #c62828; background: #fff5f5; }
  .real textarea { padding: 0.45rem; font-family: inherit; font-size: 0.9rem; border: 1px solid #bbb; border-radius: 3px; }
  .real textarea.invalid { border-color: #c62828; background: #fff5f5; }
  .issue { color: #c62828; font-size: 0.8rem; margin: -0.3rem 0 0; }
  .modern { background: #eff6ff; border-color: #93c5fd; border-left: 4px solid #3b82f6; }
  .real button { align-self: flex-start; padding: 0.5rem 1rem; cursor: pointer; background: #1565c0; color: white; border: none; border-radius: 4px; }
  .real button.danger { background: #c62828; }
  .real button:disabled { opacity: 0.7; cursor: wait; }
  .banner { padding: 0.6rem 0.8rem; border-radius: 4px; font-size: 0.85rem; }
  .banner.ok { background: #e8f5e9; border-left: 3px solid #4caf50; }
  .banner.fail { background: #ffebee; border-left: 3px solid #f44336; }
  .note { font-size: 0.8rem; color: #555; margin: 0.25rem 0 0; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { padding: 0.5rem; border: 1px solid #ddd; text-align: left; vertical-align: top; }
  th { background: #f5f5f5; }
</style>`,
			language: 'svelte'
		}
	]
};

export default lesson;
