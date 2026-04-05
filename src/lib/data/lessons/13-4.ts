import type { LessonData } from '$lib/types';

const lesson: LessonData = {
	meta: {
		id: '13-4',
		title: 'use:enhance',
		phase: 4,
		module: 13,
		lessonIndex: 4
	},
	description: `A classic HTML form POST triggers a full page navigation — the browser discards your page, makes the request, and renders the response. That's fine (and resilient), but a single-page feel is nicer: submit, show a spinner, update the form prop in place without losing scroll position.

use:enhance is the SvelteKit action (the Svelte-action kind, not the form-action kind) that does exactly that. Slap it on a form and it upgrades POST behaviour to fetch, intercepts the response, and updates the 'form' prop — all while keeping the form fully functional if JavaScript fails to load. That's progressive enhancement in one line.

This lesson covers use:enhance with and without a callback, loading states, confirmation dialogs, and the reset:false option for keeping user input after a failed submit.`,
	objectives: [
		'Add use:enhance to upgrade a classic form to fetch-based submission',
		'Customize behaviour with an enhance callback and a result handler',
		'Show a per-form loading state while submitting',
		'Add a confirmation dialog inside the enhance callback',
		'Use reset:false to keep user input on failure',
		'Understand the SubmitFunction signature and its result types'
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
